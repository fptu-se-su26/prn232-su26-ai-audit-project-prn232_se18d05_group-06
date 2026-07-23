import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../../components/Sidebar';
import WarehouseHeader from '../../components/WarehouseHeader';
import api from '../../lib/api';

interface ActiveBooking {
  bookingId: number;
  bookingCode: string;
  alprPlate?: string;
  truckPlate: string;
  bookingType: string;
  scheduledDate: string;
  scheduledTime: string;
  status: string;
  dockCode?: string;
  dockName?: string;
  driverName: string;
  customerName: string;
  containerNo?: string;
}

interface CheckoutResponse {
  barrierCommand: string;
  message: string;
  bookingId: number;
  bookingCode: string;
  licensePlate: string;
  status: string;
  checkOutAt: string;
  dockId?: number;
  dockCode?: string;
}

interface SessionLog {
  id: string;
  bookingCode: string;
  licensePlate: string;
  checkOutAt: Date;
  status: string;
  barrierSignal: string;
}

interface BlacklistAlertDto {
  accessDenied: boolean;
  alertType: string;
  alarmLevel: string;
  blockedEntity: string;
  licensePlate: string;
  driverName: string;
  reason: string;
}

const GateCheckoutDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [activeBooking, setActiveBooking] = useState<ActiveBooking | null>(null);

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [isAutoScanning, setIsAutoScanning] = useState(false);
  const [cameraScanning, setCameraScanning] = useState(false);
  const [debugBbox, setDebugBbox] = useState<{x: number, y: number, width: number, height: number} | null>(null);
  
  const [checkoutResult, setCheckoutResult] = useState<CheckoutResponse | null>(null);
  const [barrierOpen, setBarrierOpen] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [isProcessingCheckout, setIsProcessingCheckout] = useState(false);
  const [blacklistAlert, setBlacklistAlert] = useState<BlacklistAlertDto | null>(null);
  
  const [sessionLogs, setSessionLogs] = useState<SessionLog[]>([]);

  useEffect(() => {
    let timer: any;
    if (barrierOpen && countdown > 0) {
      timer = setTimeout(() => setCountdown(prev => prev - 1), 1000);
    } else if (barrierOpen && countdown === 0) {
      setBarrierOpen(false);
      setCheckoutResult(null);
    }
    return () => clearTimeout(timer);
  }, [barrierOpen, countdown]);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
      if (videoRef.current) videoRef.current.srcObject = stream;
      streamRef.current = stream;
      setIsCameraActive(true);
      setIsAutoScanning(true); // Automatically start scanning
      setErrorMsg(null);
    } catch (err: any) {
      console.error('Error accessing camera:', err);
      setErrorMsg('Cannot access camera. Please check permissions.');
    }
  };

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) videoRef.current.srcObject = null;
    setIsCameraActive(false);
    setIsAutoScanning(false);
  }, []);

  useEffect(() => {
    return () => stopCamera();
  }, [stopCamera]);

  const captureAndScan = useCallback(async () => {
    if (!videoRef.current || !canvasRef.current || isLoading) return;
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (video.videoWidth === 0 || video.videoHeight === 0) return;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    canvas.toBlob(async (blob) => {
      if (!blob) return;
      const formData = new FormData();
      formData.append('imageFile', blob, 'capture.jpg');
      try {
        setCameraScanning(true);
        const response = await api.post<any>('/gate/scan', formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });

        // Debug logging for user (F12)
        if (response.data?.debugInfo) {
          console.log(`[AI Camera] Result:`, response.data);
          if (response.data.debugInfo.bbox && response.data.debugInfo.bbox.width > 0 && videoRef.current) {
            const { x, y, width, height } = response.data.debugInfo.bbox;
            const vW = videoRef.current.videoWidth || 640;
            const vH = videoRef.current.videoHeight || 480;
            setDebugBbox({
              x: (x / vW) * 100,
              y: (y / vH) * 100,
              width: (width / vW) * 100,
              height: (height / vH) * 100
            });
          } else {
            setDebugBbox(null);
          }
        } else {
            setDebugBbox(null);
        }

        if (response.data?.licensePlate) {
          const plate = response.data.licensePlate;
          setSearchQuery(plate);
          setIsAutoScanning(false);
          handleSearch(plate);
        } else {
          setSearchQuery('');
        }
      } catch (error) {
      } finally {
        setCameraScanning(false);
      }
    }, 'image/jpeg', 0.8);
  }, [isLoading]);

  useEffect(() => {
    let intervalId: any;
    if (isAutoScanning && isCameraActive) {
      intervalId = setInterval(() => { captureAndScan(); }, 5000);
    }
    return () => clearInterval(intervalId);
  }, [isAutoScanning, isCameraActive, captureAndScan]);

  const handleSearch = async (query: string) => {
    if (!query.trim()) return;
    setIsLoading(true);
    setErrorMsg(null);
    setBlacklistAlert(null);
    setActiveBooking(null);
    if (!isAutoScanning) {
      setCameraScanning(true);
      await new Promise(resolve => setTimeout(resolve, 800));
      setCameraScanning(false);
    }
    try {
      const response = await api.get<ActiveBooking>('/gate/active-booking?search=' + encodeURIComponent(query.trim()));
      const foundBooking = response.data;
      setActiveBooking(foundBooking);

      // Auto processing based on booking status
      if (foundBooking.status === 'CONFIRMED') {
         await strictCheckIn(query, 1);
      } else if (foundBooking.status === 'CHECKED_IN' || foundBooking.status === 'IN_DOCK') {
         await autoProcess('/gate/checkout', foundBooking.alprPlate || foundBooking.truckPlate || query, foundBooking.bookingCode, 'COMPLETED', 'OPEN_EXIT', 'Ra cổng thành công');
      }
    } catch (err: any) {
      if (err.response?.status === 401) {
        setErrorMsg('Vui lòng đăng nhập để tiếp tục.');
      } else if (err.response?.status === 404) {
        // Not an error, just no active booking found. Run strict check-in to process rejection or validation.
        await strictCheckIn(query, 1);
      } else {
        console.error("API Error:", err);
        setErrorMsg(err.response?.data || 'Lỗi kết nối máy chủ.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const strictCheckIn = async (plate: string, warehouseId: number) => {
    try {
      const response = await api.post<any>('/gate/check-plate', {
        detectedPlate: plate,
        warehouseId: warehouseId,
        cameraId: 'GATE-01',
        alprConfidence: 99.0
      });

      const result = response.data;
      if (result.isAllowed) {
        setCheckoutResult({
           barrierCommand: 'OPEN_ENTRY',
           message: result.message,
           bookingId: result.bookingId ?? 0,
           bookingCode: result.bookingCode ?? result.bookingId?.toString() ?? '',

           licensePlate: result.truckPlate || plate,
           status: result.status,
           checkOutAt: new Date().toISOString()
        });
        setBarrierOpen(true);
        setCountdown(8);
        const newLog: SessionLog = {
          id: Math.random().toString(36).substring(2, 9).toUpperCase(),
          bookingCode: result.bookingId?.toString() || '',
          licensePlate: result.truckPlate || plate,
          checkOutAt: new Date(),
          status: result.status,
          barrierSignal: 'OPEN_ENTRY'
        };
        setSessionLogs(prev => [newLog, ...prev]);
        setErrorMsg(null);
        setBlacklistAlert(null);

        // Fetch booking again to display in UI if we want, or rely on activeBooking state
        try {
            const activeRes = await api.get<ActiveBooking>('/gate/active-booking?search=' + encodeURIComponent(plate));
            setActiveBooking(activeRes.data);
        } catch(e) {}
      } else {
        // Rejected
        setErrorMsg(`[${result.status}] ${result.message}`);
      }
    } catch (err: any) {
       if (err.response?.status === 401) {
         setErrorMsg('Vui lòng đăng nhập để tiếp tục.');
       } else {
         setErrorMsg('Lỗi hệ thống khi kiểm tra xe: ' + (err.response?.data || err.message));
       }
    }
  };

  const autoProcess = async (url: string, plate: string, code: string, status: string, barrier: string, defaultMsg: string) => {
    try {
      const payload = { alprPlate: plate, bookingCode: code };
      const response = await api.post<any>(url, payload);
      
      setActiveBooking(prev => {
        if (prev) return prev;
        return {
          bookingId: response.data.bookingId,
          bookingCode: response.data.bookingCode || 'AH-' + new Date().getTime(),
          alprPlate: plate,
          truckPlate: response.data.licensePlate || plate,
          bookingType: 'Vãng lai',
          scheduledDate: new Date().toISOString().split('T')[0],
          scheduledTime: new Date().toLocaleTimeString('vi-VN'),
          status: status,
          dockCode: response.data.dockCode,
          driverName: 'Chưa có thông tin',
          customerName: 'Khách vãng lai'
        } as ActiveBooking;
      });

      setCheckoutResult({
        ...response.data,
        status: status,
        checkOutAt: response.data.checkOutAt || new Date().toISOString(),
        message: response.data.message || defaultMsg
      });
      setBarrierOpen(true);
      setCountdown(8);
      const newLog: SessionLog = {
        id: Math.random().toString(36).substring(2, 9).toUpperCase(),
        bookingCode: response.data.bookingCode || code || 'AH',
        licensePlate: response.data.licensePlate || plate,
        checkOutAt: new Date(),
        status: status,
        barrierSignal: response.data.barrierCommand || barrier
      };
      setSessionLogs(prev => [newLog, ...prev]);
    } catch (err: any) {
      if (err.response?.status === 401) {
        setErrorMsg('Vui lòng đăng nhập để tiếp tục.');
      } else if (err.response?.status === 403 && err.response?.data?.alertType) {
        setBlacklistAlert(err.response.data);
      } else {
        setErrorMsg(err.response?.data?.message || err.response?.data || 'Giao dịch thất bại');
      }
    }
  };

  const handleConfirmCheckout = async () => {
    if (!activeBooking) return;
    setIsProcessingCheckout(true);
    setErrorMsg(null);
    setBlacklistAlert(null);
    try {
      const payload = { alprPlate: activeBooking.alprPlate || activeBooking.truckPlate, bookingCode: activeBooking.bookingCode };
      const response = await api.post<CheckoutResponse>('/gate/checkout', payload);
      setCheckoutResult(response.data);
      setBarrierOpen(true);
      setCountdown(8);
      const newLog: SessionLog = {
        id: Math.random().toString(36).substring(2, 9).toUpperCase(),
        bookingCode: response.data.bookingCode,
        licensePlate: response.data.licensePlate,
        checkOutAt: new Date(response.data.checkOutAt),
        status: response.data.status,
        barrierSignal: response.data.barrierCommand
      };
      setSessionLogs(prev => [newLog, ...prev]);
    } catch (err: any) {
      if (err.response?.status === 401) {
        setErrorMsg('Vui lòng đăng nhập để tiếp tục.');
      } else if (err.response?.status === 403 && err.response?.data?.alertType) {
        setBlacklistAlert(err.response.data);
      } else {
        setErrorMsg(err.response?.data?.message || err.response?.data || 'Failed to complete checkout');
      }
    } finally {
      setIsProcessingCheckout(false);
    }
  };

  const handleConfirmCheckin = async () => {
    if (!activeBooking) return;
    setIsProcessingCheckout(true);
    setErrorMsg(null);
    setBlacklistAlert(null);
    try {
      const payload = { alprPlate: activeBooking.alprPlate || activeBooking.truckPlate, bookingCode: activeBooking.bookingCode };
      const response = await api.post<any>('/gate/checkin', payload);
      setCheckoutResult({
        ...response.data,
        barrierCommand: response.data.barrierCommand || 'OPEN_ENTRY',
        bookingId: response.data.bookingId || activeBooking.bookingId,
        bookingCode: response.data.bookingCode || activeBooking.bookingCode,
        licensePlate: response.data.licensePlate || activeBooking.truckPlate,
        status: "CHECKED-IN",
        checkOutAt: new Date().toISOString(),
        message: "Vào cổng thành công"
      });
      setBarrierOpen(true);
      setCountdown(8);
      const newLog: SessionLog = {
        id: Math.random().toString(36).substring(2, 9).toUpperCase(),
        bookingCode: activeBooking.bookingCode,
        licensePlate: activeBooking.truckPlate,
        checkOutAt: new Date(),
        status: "CHECKED-IN",
        barrierSignal: "OPEN_ENTRY"
      };
      setSessionLogs(prev => [newLog, ...prev]);
    } catch (err: any) {
      if (err.response?.status === 401) {
        setErrorMsg('Vui lòng đăng nhập để tiếp tục.');
      } else if (err.response?.status === 403 && err.response?.data?.alertType) {
        setBlacklistAlert(err.response.data);
      } else {
        setErrorMsg(err.response?.data?.message || err.response?.data || 'Failed to complete checkin');
      }
    } finally {
      setIsProcessingCheckout(false);
    }
  };

  return (
    <div className="flex bg-slate-50 font-sans text-slate-800 min-h-screen">
      <Sidebar />
      
      {/* Main Content Wrapper (Pushed right by sidebar width) */}
      <div className="flex-1 flex flex-col md:ml-[280px] overflow-hidden min-h-screen relative">
        
        <WarehouseHeader 
          title="Kiểm soát ra vào (Gate)"
          subtitle="Giám sát luồng xe ra vào cảng"
          rightContent={
            <>
              <span className="ml-4 px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-700 text-xs font-semibold flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                Trạm A - Hoạt động
              </span>
              <div className="text-sm text-slate-500">{new Date().toLocaleDateString('vi-VN')}</div>
            </>
          }
        />

        {/* Main Interface */}
        <main className="flex-1 flex gap-6 p-6 overflow-hidden h-screen pt-24">
          
          {/* CAMERA SECTION (60%) */}
          <section className="w-3/5 flex flex-col gap-4">
            <div className="flex justify-between items-end">
              <div>
                <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Camera Nhận Diện</h1>
                <p className="text-sm text-slate-500 mt-1">Hệ thống tự động quét biển số xe ra vào</p>
              </div>
              
              <div className="flex gap-3">
                {isCameraActive && (
                  <button 
                    onClick={() => setIsAutoScanning(!isAutoScanning)}
                    className={`px-4 py-2 rounded-lg font-medium text-sm transition-all flex items-center gap-2 shadow-sm border ${
                      isAutoScanning 
                        ? 'bg-red-50 text-red-600 border-red-200 hover:bg-red-100' 
                        : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    <span className="material-symbols-outlined text-[18px]">
                      {isAutoScanning ? 'stop_circle' : 'bolt'}
                    </span>
                    {isAutoScanning ? 'Dừng quét tự động' : 'Bật quét tự động'}
                  </button>
                )}
                <button 
                  onClick={isCameraActive ? stopCamera : startCamera}
                  className={`px-4 py-2 rounded-lg font-medium text-sm transition-all flex items-center gap-2 shadow-sm ${
                    isCameraActive 
                      ? 'bg-slate-800 text-white hover:bg-slate-700' 
                      : 'bg-blue-600 text-white hover:bg-blue-700'
                  }`}
                >
                  <span className="material-symbols-outlined text-[18px]">
                    {isCameraActive ? 'power_settings_new' : 'videocam'}
                  </span>
                  {isCameraActive ? 'Tắt Camera' : 'Bật Camera'}
                </button>
              </div>
            </div>

            {/* Camera Viewport */}
            <div className="flex-1 bg-slate-900 rounded-2xl overflow-hidden shadow-lg border border-slate-800 relative group flex items-center justify-center min-h-[400px]">
              
              {/* Actual Video */}
              <video 
                ref={videoRef} 
                autoPlay 
                playsInline 
                muted 
                className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-500 ${isCameraActive ? 'opacity-100' : 'opacity-0'}`}
              />
              <canvas ref={canvasRef} className="hidden" />

              {/* Scanning Laser Line */}
              {cameraScanning && (
                <div className="absolute top-0 left-0 w-full h-[4px] bg-blue-500 shadow-[0_0_20px_rgba(59,130,246,0.8)] animate-[scan_2s_ease-in-out_infinite] z-20"></div>
              )}

              {/* Bounding Box Overlay */}
              {debugBbox && isCameraActive && (
                <div 
                  className="absolute border-2 border-green-500 shadow-[0_0_10px_rgba(34,197,94,0.5)] z-20 transition-all duration-300"
                  style={{
                    left: `${debugBbox.x}%`,
                    top: `${debugBbox.y}%`,
                    width: `${debugBbox.width}%`,
                    height: `${debugBbox.height}%`,
                  }}
                >
                  <span className="absolute -top-7 left-0 bg-green-500 text-white text-xs font-bold px-2 py-1 rounded shadow">
                    Biển số
                  </span>
                </div>
              )}

              {/* Offline State */}
              {!isCameraActive && (
                <div className="text-center z-10">
                  <div className="w-20 h-20 rounded-full bg-slate-800 flex items-center justify-center mx-auto mb-4 border border-slate-700">
                    <span className="material-symbols-outlined text-4xl text-slate-400">videocam_off</span>
                  </div>
                  <h3 className="text-white font-medium text-lg">Camera đang tắt</h3>
                  <p className="text-slate-400 text-sm mt-1">Vui lòng bật camera để bắt đầu nhận diện</p>
                </div>
              )}

              {/* Camera Frame Corners Overlay (Clean) */}
              {isCameraActive && (
                <div className="absolute inset-10 pointer-events-none z-10">
                  <div className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-white/60 rounded-tl-lg"></div>
                  <div className="absolute top-0 right-0 w-8 h-8 border-t-2 border-r-2 border-white/60 rounded-tr-lg"></div>
                  <div className="absolute bottom-0 left-0 w-8 h-8 border-b-2 border-l-2 border-white/60 rounded-bl-lg"></div>
                  <div className="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 border-white/60 rounded-br-lg"></div>
                </div>
              )}

              {/* Scanning HUD overlay */}
              {isCameraActive && (
                <div className="absolute top-4 left-4 bg-black/40 backdrop-blur px-3 py-1.5 rounded-lg border border-white/10 flex items-center gap-2 z-10">
                  <div className={`w-2 h-2 rounded-full ${cameraScanning ? 'bg-blue-500 animate-pulse' : 'bg-emerald-500'}`}></div>
                  <span className="text-xs text-white font-medium">{cameraScanning ? 'Đang phân tích...' : 'Sẵn sàng'}</span>
                </div>
              )}
            </div>
          </section>

          {/* RIGHT SECTION: Info & Controls (40%) */}
          <section className="w-2/5 flex flex-col gap-4 overflow-y-auto pr-2 pb-4 relative">
            
            {/* Error Overlay */}
            {errorMsg && (
              <div className="absolute inset-0 bg-white/95 backdrop-blur-md z-40 flex flex-col items-center justify-center text-center p-8 rounded-2xl shadow-2xl border border-red-100 animate-in fade-in zoom-in duration-300">
                <div className="w-28 h-28 bg-red-100 rounded-full flex items-center justify-center mb-6 shadow-inner relative">
                  <div className="absolute inset-0 rounded-full border-4 border-red-200 animate-ping opacity-20"></div>
                  <span className="material-symbols-outlined text-[64px] text-red-600">cancel</span>
                </div>
                <h2 className="text-3xl font-black text-slate-800 mb-4 tracking-tight">TỪ CHỐI VÀO CỔNG</h2>
                <div className="bg-red-50 text-red-700 px-6 py-4 rounded-xl border border-red-200 shadow-sm mb-8 w-full">
                  <p className="font-bold text-lg leading-relaxed">{errorMsg}</p>
                </div>
                <button 
                  onClick={() => setErrorMsg(null)}
                  className="px-10 py-4 bg-slate-800 hover:bg-slate-900 text-white font-bold rounded-xl transition-all shadow-lg hover:shadow-xl hover:-translate-y-1 w-full text-lg uppercase tracking-wider"
                >
                  Đã hiểu & Đóng
                </button>
              </div>
            )}

            {/* Alerts */}
            {blacklistAlert && (
              <div className="bg-red-600 text-white px-5 py-4 rounded-xl shadow-md border border-red-700">
                <h3 className="font-bold flex items-center gap-2 mb-1">
                  <span className="material-symbols-outlined">warning</span> 
                  CẢNH BÁO DANH SÁCH ĐEN
                </h3>
                <p className="text-sm text-red-100">{blacklistAlert.reason}</p>
              </div>
            )}
            {checkoutResult && !blacklistAlert && !errorMsg && (
              <div className="bg-emerald-50 text-emerald-700 px-4 py-3 rounded-xl text-sm flex gap-3 items-start border border-emerald-100">
                <span className="material-symbols-outlined text-emerald-500 text-[20px]">check_circle</span>
                <p className="mt-0.5 font-medium">{checkoutResult.message}</p>
              </div>
            )}

            {/* Booking Details Card */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 flex flex-col flex-1 relative overflow-hidden">
              {barrierOpen && (
                <div className="absolute inset-0 bg-white/95 backdrop-blur-sm z-30 flex flex-col items-center justify-center text-center p-6">
                  <div className="w-24 h-24 bg-emerald-100 rounded-full flex items-center justify-center mb-6 animate-bounce shadow-sm">
                    <span className="material-symbols-outlined text-[48px] text-emerald-600">door_open</span>
                  </div>
                  <h2 className="text-2xl font-bold text-slate-800 mb-2">Barrier Đã Mở</h2>
                  <p className="text-slate-500 mb-8">Xe có thể di chuyển qua cổng ngay bây giờ</p>
                  <div className="text-6xl font-black text-emerald-500 tabular-nums">
                    00:0{countdown}
                  </div>
                </div>
              )}

              <div className="p-5 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                <h3 className="font-bold text-slate-800">Thông tin Đặt chỗ</h3>
                {activeBooking ? (
                  <span className="px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-700 text-xs font-semibold">Đã xác minh</span>
                ) : (
                  <span className="px-2.5 py-1 rounded-full bg-slate-200 text-slate-600 text-xs font-medium">Chưa có dữ liệu</span>
                )}
              </div>

              {activeBooking ? (
                <div className="p-5 flex flex-col gap-5 flex-1">
                  <div className="grid grid-cols-2 gap-x-4 gap-y-5">
                    <div>
                      <span className="text-xs font-medium text-slate-400 block mb-1 uppercase">Mã đặt chỗ</span>
                      <div className="font-bold text-slate-800 text-lg">{activeBooking.bookingCode}</div>
                    </div>
                    <div>
                      <span className="text-xs font-medium text-slate-400 block mb-1 uppercase">Biển số xe</span>
                      <div className="font-bold text-slate-800 text-lg">{activeBooking.truckPlate}</div>
                    </div>
                    <div className="col-span-2">
                      <span className="text-xs font-medium text-slate-400 block mb-1 uppercase">Khách hàng</span>
                      <div className="font-medium text-slate-700 flex items-center gap-1.5">
                        <span className="material-symbols-outlined text-[16px] text-slate-400">apartment</span>
                        <span className="truncate">{activeBooking.customerName}</span>
                      </div>
                    </div>
                    <div>
                      <span className="text-xs font-medium text-slate-400 block mb-1 uppercase">Bến (Dock)</span>
                      <div className="font-medium text-slate-700 flex items-center gap-1.5">
                        <span className="material-symbols-outlined text-[16px] text-slate-400">local_shipping</span>
                        <span>{activeBooking.dockCode || 'Chưa xếp bến'}</span>
                      </div>
                    </div>
                    <div>
                      <span className="text-xs font-medium text-slate-400 block mb-1 uppercase">Lịch dự kiến</span>
                      <div className="font-medium text-slate-700 flex items-center gap-1.5">
                        <span className="material-symbols-outlined text-[16px] text-slate-400">event</span>
                        <span>{activeBooking.scheduledTime}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
                  <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-3">
                    <span className="material-symbols-outlined text-slate-300 text-3xl">receipt_long</span>
                  </div>
                  <p className="text-slate-500 text-sm">Hệ thống sẽ tự động hiển thị thông tin chuyến xe tại đây khi quét được biển số.</p>
                </div>
              )}

              {/* Actions Footer */}
              <div className="p-5 border-t border-slate-100 bg-slate-50/80 flex gap-3">
                <button 
                  onClick={() => setSearchQuery('')}
                  className="px-5 py-3 rounded-xl font-medium text-slate-600 hover:bg-slate-200 transition-colors bg-slate-100"
                >
                  Xóa
                </button>
                <button 
                  onClick={activeBooking?.status === 'CONFIRMED' ? handleConfirmCheckin : handleConfirmCheckout}
                  disabled={isProcessingCheckout || !activeBooking}
                  className={`flex-1 py-3 rounded-xl font-bold flex items-center justify-center gap-2 shadow-sm transition-all ${
                    !activeBooking 
                      ? 'bg-slate-200 text-slate-400 cursor-not-allowed' 
                      : 'bg-blue-600 hover:bg-blue-700 text-white hover:shadow-md'
                  }`}
                >
                  {isProcessingCheckout ? (
                    <span className="material-symbols-outlined animate-spin">refresh</span>
                  ) : (
                    <span className="material-symbols-outlined">
                      {activeBooking?.status === 'CONFIRMED' ? 'login' : 'logout'}
                    </span>
                  )}
                  {activeBooking?.status === 'CONFIRMED' ? 'XÁC NHẬN VÀO CỔNG' : 'XÁC NHẬN RA CỔNG'}
                </button>
              </div>
            </div>

            {/* Recent History */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-5 mt-2">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-bold text-slate-800 text-sm">Hoạt động gần đây</h3>
                <button className="text-blue-600 text-xs font-medium hover:underline">Xem tất cả</button>
              </div>
              <div className="flex flex-col gap-3">
                {sessionLogs.slice(0, 3).map((log) => (
                  <div key={log.id} className="flex items-center justify-between p-3 rounded-xl border border-slate-100 hover:border-blue-100 hover:bg-blue-50/30 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center">
                        <span className="material-symbols-outlined text-slate-500">directions_car</span>
                      </div>
                      <div>
                        <div className="font-bold text-slate-800">{log.licensePlate}</div>
                        <div className="text-xs text-slate-500">{log.checkOutAt.toLocaleTimeString('vi-VN')}</div>
                      </div>
                    </div>
                    <span className="px-2 py-1 bg-emerald-50 text-emerald-600 text-[10px] font-bold rounded uppercase tracking-wider">
                      {log.status}
                    </span>
                  </div>
                ))}
                {sessionLogs.length === 0 && (
                  <div className="text-center py-4 text-sm text-slate-400">Chưa có xe nào qua cổng</div>
                )}
              </div>
            </div>

          </section>
        </main>
      </div>
    </div>
  );
};

export default GateCheckoutDashboard;
