import React, { useState, useEffect } from 'react';
import { DriverLayout } from '../../../layouts/DriverLayout';

// Import Separated Tab Views
import { HomeTab } from '../components/tabs/HomeTab';
import { RoutesTab } from '../components/tabs/RoutesTab';
import { AlertsTab } from '../components/tabs/AlertsTab';
import { ProfileTab } from '../components/tabs/ProfileTab';

// Import Active Fullscreen Navigation
import { ActiveNavigation } from '../components/ActiveNavigation';

// Import Delivery Confirmation Page
import { DeliveryConfirmation } from '../components/DeliveryConfirmation';

interface RouteStop {
  id: string;
  destination: string;
  address: string;
  eta: string;
  distance: string;
  timeEst: string;
  priority: 'HIGH' | 'STANDARD';
  status: 'COMPLETED' | 'DELIVERING' | 'PENDING';
  orderId: string;
  cod: string;
  phone: string;
}

interface AlertNotification {
  id: string;
  title: string;
  description: string;
  time: string;
  type: 'info' | 'success' | 'warning' | 'error';
}

export const DriverDashboard: React.FC = () => {
  // Page Core States
  const [activeTab, setActiveTab] = useState<string>('Home');
  const [isOnline, setIsOnline] = useState<boolean>(true);
  const [showSosModal, setShowSosModal] = useState<boolean>(false);
  const [showScanner, setShowScanner] = useState<boolean>(false);
  const [scannerStep, setScannerStep] = useState<'idle' | 'scanning' | 'success'>('idle');
  const [showCallModal, setShowCallModal] = useState<boolean>(false);
  const [showMapModal, setShowMapModal] = useState<boolean>(false);
  
  // Delivery Task Confirmation Page
  const [showConfirmPage, setShowConfirmPage] = useState<boolean>(false);
  
  // Accordion and Trip States
  const [expandedStopId, setExpandedStopId] = useState<string | null>('NguyenVanA');
  const [isTripStarted, setIsTripStarted] = useState<boolean>(false);

  // Odometer & Telemetries
  const [odometer, setOdometer] = useState<number>(142);
  const [fuelLevel, setFuelLevel] = useState<number>(65);
  const [successRate] = useState<number>(98);
  const [serviceDays] = useState<number>(15);

  // Stop Lists Database (Nguyen Van A, Tran Thi B, Le Van C)
  const [stops, setStops] = useState<RouteStop[]>([
    {
      id: 'NguyenVanA',
      destination: 'Nguyễn Văn A',
      address: 'Tòa nhà Bitexco, Tầng 45, 2 Hải Triều, Phường Bến Nghé, Quận 1, TP. HCM',
      eta: '10:45 AM',
      distance: '5.2 km',
      timeEst: '12 phút',
      priority: 'HIGH',
      status: 'DELIVERING',
      orderId: '#ORD-9922',
      cod: '540,000 đ',
      phone: '090 123 4567',
    },
    {
      id: 'TranThiB',
      destination: 'Trần Thị B',
      address: '456 Nguyễn Huệ, Quận 1, TP.HCM',
      eta: '11:45 AM',
      distance: '7.8 km',
      timeEst: '18 phút',
      priority: 'STANDARD',
      status: 'PENDING',
      orderId: '#ORD-9822',
      cod: '0 đ',
      phone: '091 987 6543',
    },
    {
      id: 'LeVanC',
      destination: 'Lê Văn C',
      address: '789 Đinh Tiên Hoàng, Quận 1',
      eta: '09:15 AM',
      distance: '3.0 km',
      timeEst: '8 phút',
      priority: 'STANDARD',
      status: 'COMPLETED',
      orderId: '#ORD-9820',
      cod: '120,000 đ',
      phone: '098 765 4321',
    },
  ]);

  const [completedStopsCount, setCompletedStopsCount] = useState<number>(1);
  const totalStopsCount = 3;

  // Alerts Database
  const [alerts, setAlerts] = useState<AlertNotification[]>([
    {
      id: 'alert-1',
      title: 'Tối ưu lộ trình AI',
      description: 'Lộ trình đi TechCorp đã được cập nhật qua Cầu vượt Tân Bình để tránh ùn tắc.',
      time: 'Vừa xong',
      type: 'success',
    },
    {
      id: 'alert-2',
      title: 'Cảnh báo thời tiết',
      description: 'Dự báo có mưa lớn diện rộng khu vực Quận 1 lúc 11:30 AM. Đề phòng đường trơn trượt.',
      time: '15 phút trước',
      type: 'warning',
    },
    {
      id: 'alert-3',
      title: 'Yêu cầu từ điều phối viên',
      description: 'Xác nhận chữ ký của thủ kho TechCorp khi giao thiết bị phần cứng IT.',
      time: '1 giờ trước',
      type: 'info',
    },
  ]);

  // Audio mock beeping effect
  const playBeep = () => {
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioCtx.createOscillator();
      const gainNode = audioCtx.createGain();

      oscillator.type = 'sine';
      oscillator.frequency.setValueAtTime(1200, audioCtx.currentTime); // Beep frequency in Hz
      gainNode.gain.setValueAtTime(0.1, audioCtx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.15);

      oscillator.connect(gainNode);
      gainNode.connect(audioCtx.destination);

      oscillator.start();
      oscillator.stop(audioCtx.currentTime + 0.15);
    } catch (e) {
      console.log("Audio not supported or blocked");
    }
  };

  // Telemetry Simulator
  useEffect(() => {
    const interval = setInterval(() => {
      // Odometer slightly ticks up if online
      if (isOnline) {
        setOdometer((prev) => parseFloat((prev + 0.05).toFixed(2)));
        // Fuel levels slightly decrease
        setFuelLevel((prev) => {
          if (prev <= 5) return 99; // auto-refuel simulation
          return parseFloat((prev - 0.02).toFixed(2));
        });
      }
    }, 8000);

    return () => clearInterval(interval);
  }, [isOnline]);

  // Active delivery stop
  const activeStop = stops.find((s) => s.status === 'DELIVERING') || stops[0];

  // Action: Complete active delivery stop & transition
  const handleScanSuccess = () => {
    setScannerStep('success');
    playBeep();

    setTimeout(() => {
      // 1. Advance the progress stops
      setCompletedStopsCount((prev) => Math.min(prev + 1, totalStopsCount));

      // 2. Update stops lists: mark active as completed, activate next
      setStops((prevStops) => {
        const activeIdx = prevStops.findIndex((s) => s.status === 'DELIVERING');
        if (activeIdx === -1) return prevStops;

        const updated = [...prevStops];
        updated[activeIdx] = { ...updated[activeIdx], status: 'COMPLETED' };

        // Make next pending stop active
        const nextPendingIdx = updated.findIndex((s) => s.status === 'PENDING');
        if (nextPendingIdx !== -1) {
          updated[nextPendingIdx] = { ...updated[nextPendingIdx], status: 'DELIVERING' };
          setExpandedStopId(updated[nextPendingIdx].id); // Auto-expand next stop!
        } else {
          setExpandedStopId(null);
        }
        return updated;
      });

      // 3. Add success log to alert panel
      const newAlert: AlertNotification = {
        id: `alert-success-${Date.now()}`,
        title: `Đã giao hàng thành công: ${activeStop.destination}`,
        description: `Đơn hàng đã được xác nhận chữ ký điện tử thành công lúc ${new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}.`,
        time: 'Vừa xong',
        type: 'success',
      };
      setAlerts((prev) => [newAlert, ...prev]);

      // 4. Reset states & close
      setShowScanner(false);
      setScannerStep('idle');
    }, 1500); // 1.5s delay for premium checkmark look
  };

  const handleSimulateScan = () => {
    setScannerStep('scanning');
    setTimeout(() => {
      handleScanSuccess();
    }, 1800);
  };

  // SOS Confirm trigger
  const handleConfirmSos = () => {
    // Add panic notification
    const sosAlert: AlertNotification = {
      id: `alert-sos-${Date.now()}`,
      title: '⚠️ Tín hiệu SOS khẩn cấp đã gửi',
      description: 'Hệ thống đã truyền dữ liệu GPS và gửi thông điệp khẩn cấp tới Phòng điều hành AI.',
      time: 'Vừa xong',
      type: 'error',
    };
    setAlerts((prev) => [sosAlert, ...prev]);
    setShowSosModal(false);
  };

  // Start route trip navigation trigger
  const handleStartTrip = () => {
    setIsTripStarted(true);
    playBeep();
    
    const startAlert: AlertNotification = {
      id: `alert-start-${Date.now()}`,
      title: '🚀 Lộ trình đã được bắt đầu',
      description: 'Hệ thống định vị thông minh SmartLog AI đang dẫn đường cho bạn tới Nguyễn Văn A.',
      time: 'Vừa xong',
      type: 'info',
    };
    setAlerts((prev) => [startAlert, ...prev]);
    setShowMapModal(true);
  };

  // Get dynamic percentage for progress bar
  const progressPercent = Math.round((completedStopsCount / totalStopsCount) * 100);

  return (
    <DriverLayout
      activeTab={activeTab}
      setActiveTab={setActiveTab}
      onSosTrigger={() => setShowSosModal(true)}
      driverName="Trần Văn A"
      isOnline={isOnline}
    >
      {/* =========================================================================
          VIEW A: Home View (HomeTab)
          ========================================================================= */}
      {activeTab === 'Home' && (
        <HomeTab
          isOnline={isOnline}
          setIsOnline={setIsOnline}
          completedStopsCount={completedStopsCount}
          totalStopsCount={totalStopsCount}
          odometer={odometer}
          fuelLevel={fuelLevel}
          serviceDays={serviceDays}
          progressPercent={progressPercent}
          activeStop={activeStop}
          successRate={successRate}
          onScanClick={() => {
            setShowConfirmPage(true);
          }}
          onCallClick={() => setShowCallModal(true)}
          onMapClick={() => setShowMapModal(true)}
        />
      )}

      {/* =========================================================================
          VIEW B: Routes View (RoutesTab)
          ========================================================================= */}
      {activeTab === 'Routes' && (
        <RoutesTab
          stops={stops}
          expandedStopId={expandedStopId}
          setExpandedStopId={setExpandedStopId}
          onCallClick={() => setShowCallModal(true)}
          onScanClick={() => {
            setShowConfirmPage(true);
          }}
          onMapClick={() => setShowMapModal(true)}
        />
      )}

      {/* =========================================================================
          VIEW C: Alerts View (AlertsTab)
          ========================================================================= */}
      {activeTab === 'Alerts' && (
        <AlertsTab
          alerts={alerts}
          onClearAlerts={() => setAlerts([])}
        />
      )}

      {/* =========================================================================
          VIEW D: Profile View (ProfileTab)
          ========================================================================= */}
      {activeTab === 'Profile' && (
        <ProfileTab
          driverName="Trần Văn A"
        />
      )}

      {/* =========================================================================
          DYNAMIC INTERACTIVE MODALS & OVERLAYS (Commonly shared UI handlers)
          ========================================================================= */}
      
      {/* 1. SOS Emergency Screen Overlay Modal */}
      {showSosModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in pointer-events-auto">
          <div className="w-full max-w-md bg-white border-2 border-red-500 rounded-3xl overflow-hidden shadow-2xl p-6 relative text-center">
            
            {/* Pulsing red emergency warning icon */}
            <div className="relative mx-auto w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mb-4">
              <span className="absolute inset-0 bg-red-500/20 rounded-full animate-ping" />
              <span className="material-symbols-outlined text-[48px] text-red-600 animate-pulse">sos</span>
            </div>

            <h3 className="text-2xl font-bold text-red-600 uppercase tracking-wide mb-2">Báo động khẩn cấp!</h3>
            <p className="text-sm text-gray-600 font-semibold mb-6">
              Bạn có chắc muốn gửi thông điệp cứu trợ khẩn cấp SOS tới trung tâm điều hành AI? Hệ thống sẽ gửi kèm tọa độ GPS trực tiếp của bạn.
            </p>

            {/* Simulated telemetries logs */}
            <div className="bg-red-50 border border-red-200 rounded-xl p-3.5 text-left text-xs font-mono text-red-900 space-y-1.5 mb-6">
              <div className="flex justify-between"><span>[STATUS]</span> <span className="font-bold">TRANSMITTING...</span></div>
              <div className="flex justify-between"><span>[GPS LAT]</span> <span className="font-bold">10.8231° N</span></div>
              <div className="flex justify-between"><span>[GPS LNG]</span> <span className="font-bold">106.6297° E</span></div>
              <div className="flex justify-between"><span>[DRIVER ID]</span> <span className="font-bold">DRV-4022-HN</span></div>
            </div>

            <div className="flex gap-4">
              <button 
                onClick={() => setShowSosModal(false)}
                className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-800 font-bold py-3.5 rounded-xl border border-gray-300 transition-all active:scale-95"
              >
                Hủy bỏ
              </button>
              <button 
                onClick={handleConfirmSos}
                className="flex-1 bg-red-600 hover:bg-red-700 text-white font-bold py-3.5 rounded-xl transition-all active:scale-95 shadow-md shadow-red-500/20"
              >
                Xác nhận gửi SOS
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 2. QR Code Laser Scanner Simulation Modal */}
      {showScanner && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in pointer-events-auto">
          <div className="w-full max-w-md bg-[#191c1e] text-white border border-gray-700 rounded-3xl overflow-hidden shadow-2xl p-6 relative">
            
            {/* Modal Header */}
            <div className="flex justify-between items-center mb-6 pb-2 border-b border-gray-800">
              <h3 className="font-bold text-lg text-white flex items-center gap-2">
                <span className="material-symbols-outlined text-[#004ac6] animate-pulse">qr_code_scanner</span>
                Trình quét mã SmartLog
              </h3>
              <button 
                onClick={() => setShowScanner(false)}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            {/* Scanner Viewport with laser overlay animation */}
            <div className="bg-black border border-gray-800 rounded-2xl h-60 relative overflow-hidden flex items-center justify-center select-none shadow-inner mb-6">
              
              {/* Camera layout corner brackets */}
              <div className="absolute top-4 left-4 w-6 h-6 border-t-4 border-l-4 border-[#004ac6] rounded-tl-md" />
              <div className="absolute top-4 right-4 w-6 h-6 border-t-4 border-r-4 border-[#004ac6] rounded-tr-md" />
              <div className="absolute bottom-4 left-4 w-6 h-6 border-b-4 border-l-4 border-[#004ac6] rounded-bl-md" />
              <div className="absolute bottom-4 right-4 w-6 h-6 border-b-4 border-r-4 border-[#004ac6] rounded-br-md" />
              
              {scannerStep === 'idle' && (
                <div className="text-center p-4">
                  <span className="material-symbols-outlined text-[48px] text-gray-600 mb-2">photo_camera</span>
                  <p className="text-xs text-gray-400 font-semibold">Đang chuẩn bị camera...</p>
                </div>
              )}

              {/* Scanning state lasers */}
              {scannerStep === 'scanning' && (
                <>
                  <div className="absolute left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-[#004ac6] to-transparent shadow-[0_0_10px_#004ac6] animate-bounce w-full top-[10%] bottom-[10%]" />
                  <div className="text-center p-4">
                    <span className="material-symbols-outlined text-[48px] text-[#004ac6] animate-pulse mb-2">barcode_reader</span>
                    <p className="text-xs text-[#004ac6] font-bold tracking-widest uppercase animate-pulse">Scanning Barcode...</p>
                  </div>
                </>
              )}

              {/* Success completed checkmark */}
              {scannerStep === 'success' && (
                <div className="text-center p-4 animate-scale-up">
                  <span className="material-symbols-outlined text-[64px] text-green-500 fill mb-2">check_circle</span>
                  <p className="text-sm text-green-500 font-bold uppercase tracking-wider">Đã nhận diện mã QR!</p>
                </div>
              )}
            </div>

            {/* Scan buttons controls */}
            <div className="flex gap-4">
              <button 
                onClick={() => setShowScanner(false)}
                className="flex-1 bg-transparent hover:bg-white/5 text-gray-400 hover:text-white font-bold py-3 rounded-xl border border-gray-700 transition-colors active:scale-[0.98]"
              >
                Hủy bỏ
              </button>
              <button 
                onClick={handleSimulateScan}
                disabled={scannerStep !== 'idle'}
                className="flex-1 bg-[#004ac6] disabled:bg-gray-800 text-white font-bold py-3 rounded-xl hover:bg-[#2563eb] transition-all active:scale-[0.98] shadow-md shadow-[#004ac6]/20"
              >
                {scannerStep === 'scanning' ? 'Đang đọc dữ liệu...' : 'Bắt đầu quét'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 3. Call Client Dialer Modal simulation */}
      {showCallModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in pointer-events-auto">
          <div className="w-full max-w-sm bg-white border border-[#c3c6d7] rounded-3xl overflow-hidden shadow-2xl p-6 relative text-center">
            
            {/* Close */}
            <button 
              onClick={() => setShowCallModal(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <span className="material-symbols-outlined">close</span>
            </button>

            <div className="mx-auto w-16 h-16 bg-[#d3e4fe]/50 rounded-full flex items-center justify-center mb-4">
              <span className="material-symbols-outlined text-[32px] text-[#004ac6]">call</span>
            </div>

            <span className="text-xs font-bold text-gray-400 block uppercase mb-1">Đang gọi cho khách hàng</span>
            <h3 className="font-bold text-xl text-gray-900 mb-1">{activeStop.destination}</h3>
            <span className="text-sm font-semibold text-gray-500 mb-6 block">Khu công nghiệp Tân Bình</span>

            <div className="bg-gray-50 border border-gray-200 rounded-2xl p-4 mb-6">
              <span className="text-lg font-mono font-bold text-gray-700">{activeStop.phone}</span>
            </div>

            <div className="flex gap-4">
              <button 
                onClick={() => setShowCallModal(false)}
                className="flex-1 bg-red-500 hover:bg-red-600 text-white font-bold py-3 rounded-xl transition-all active:scale-95 shadow-md shadow-red-500/10"
              >
                Gác máy
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 4. Fullscreen Map modal / Simulated Active Navigation */}
      <ActiveNavigation
        isOpen={showMapModal}
        onClose={() => setShowMapModal(false)}
        activeStop={activeStop}
        onSosTrigger={() => setShowSosModal(true)}
        onCallTrigger={() => setShowCallModal(true)}
        onArrivalComplete={() => {
          // Close the navigation modal
          setShowMapModal(false);
          
          // Add Arrived notification log
          const arrivedAlert: AlertNotification = {
            id: `alert-arrived-${Date.now()}`,
            title: `📍 Đã đến điểm giao: ${activeStop.destination}`,
            description: `Tài xế đã có mặt tại điểm giao: ${activeStop.address}. Đang chuẩn bị quét mã QR xác nhận chữ ký giao nhận hàng.`,
            time: 'Vừa xong',
            type: 'success',
          };
          setAlerts((prev) => [arrivedAlert, ...prev]);

          // Trigger the delivery confirmation overlay automatically!
          setShowConfirmPage(true);
        }}
      />

      {/* 5. Fullscreen Delivery Confirmation Overlay */}
      <DeliveryConfirmation
        isOpen={showConfirmPage}
        onClose={() => setShowConfirmPage(false)}
        activeStop={activeStop}
        onConfirmSuccess={() => {
          setShowConfirmPage(false);
          handleScanSuccess();
        }}
      />

      {/* Floating Action Button (FAB) for Routes Tab */}
      {activeTab === 'Routes' && (
        <div className="fixed bottom-[88px] right-4 md:bottom-8 md:right-8 z-40">
          <button 
            onClick={handleStartTrip}
            className="bg-[#004ac6] text-white h-[56px] px-6 rounded-full shadow-[0_4px_12px_rgba(0,74,198,0.3)] flex items-center gap-2 hover:bg-[#2563eb] active:scale-95 transition-all font-bold text-[16px] font-label-xl shadow-lg"
          >
            <span className="material-symbols-outlined">
              {isTripStarted ? 'local_shipping' : 'play_arrow'}
            </span>
            {isTripStarted ? 'Lộ trình đang chạy...' : 'Bắt đầu lộ trình'}
          </button>
        </div>
      )}
    </DriverLayout>
  );
};

export default DriverDashboard;
