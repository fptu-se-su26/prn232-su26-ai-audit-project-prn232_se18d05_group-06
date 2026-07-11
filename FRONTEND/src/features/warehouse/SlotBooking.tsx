import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { 
  Calendar, 
  Clock, 
  CheckCircle2, 
  AlertTriangle, 
  ArrowLeft, 
  Loader2, 
  Mail, 
  Truck, 
  Warehouse as WarehouseIcon,
  ShieldCheck,
  QrCode
} from 'lucide-react';
import Header from '../customer/Header';
import Footer from '../customer/Footer';

interface WarehouseDto {
  warehouseId: number;
  warehouseName: string;
  address: string;
}

interface SlotInfo {
  timeRange: string;
  startTime: string;
  endTime: string;
  isAvailable: boolean;
  bookedLicensePlate: string | null;
}

interface AvailableSlotsResponseDto {
  dockName: string;
  slots: SlotInfo[];
}

interface BookingResponseDto {
  receiptId: number;
  bookingId: string;
  warehouseId: number;
  warehouseName: string;
  dockName: string;
  startTime: string;
  endTime: string;
  licensePlate: string;
  driverEmail: string;
  status: string;
  qrCodeBase64: string;
}

const API_BASE_URL = 'http://localhost:5184/api'; // Use active ASP.NET Core port 5184

const SlotBooking: React.FC = () => {
  const navigate = useNavigate();
  const [scrollY, setScrollY] = useState(0);

  // Form & Selection States
  const [warehouses, setWarehouses] = useState<WarehouseDto[]>([]);
  const [selectedWarehouseId, setSelectedWarehouseId] = useState<number>(0);
  const [selectedDate, setSelectedDate] = useState<string>(
    new Date().toISOString().split('T')[0]
  );
  
  // Slots Data States
  const [dockSlots, setDockSlots] = useState<AvailableSlotsResponseDto[]>([]);
  
  // Loading & Error States
  const [loadingWarehouses, setLoadingWarehouses] = useState<boolean>(true);
  const [loadingSlots, setLoadingSlots] = useState<boolean>(false);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Booking Modal States
  const [showBookingModal, setShowBookingModal] = useState<boolean>(false);
  const [selectedSlot, setSelectedSlot] = useState<{
    dockName: string;
    timeRange: string;
    startTime: string;
    endTime: string;
  } | null>(null);
  
  const [licensePlate, setLicensePlate] = useState<string>('');
  const [driverEmail, setDriverEmail] = useState<string>('');
  const [validationError, setValidationError] = useState<string | null>(null);

  // Success State
  const [successBooking, setSuccessBooking] = useState<BookingResponseDto | null>(null);

  // Scroll tracking for header effects
  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Fetch warehouses on mount
  useEffect(() => {
    const fetchWarehouses = async () => {
      setLoadingWarehouses(true);
      setErrorMessage(null);
      try {
        const response = await axios.get<WarehouseDto[]>(`${API_BASE_URL}/bookings/warehouses`);
        setWarehouses(response.data);
        if (response.data.length > 0) {
          setSelectedWarehouseId(response.data[0].warehouseId);
        }
      } catch (err: any) {
        console.error('Error fetching warehouses:', err);
        setErrorMessage('Không thể kết nối đến máy chủ. Vui lòng kiểm tra API backend đang chạy ở cổng 5000.');
      } finally {
        setLoadingWarehouses(false);
      }
    };
    fetchWarehouses();
  }, []);

  // Fetch available slots when warehouse or date changes
  useEffect(() => {
    if (selectedWarehouseId > 0 && selectedDate) {
      const fetchSlots = async () => {
        setLoadingSlots(true);
        setErrorMessage(null);
        try {
          const response = await axios.get<AvailableSlotsResponseDto[]>(
            `${API_BASE_URL}/bookings/available-slots?warehouseId=${selectedWarehouseId}&date=${selectedDate}`
          );
          setDockSlots(response.data);
        } catch (err: any) {
          console.error('Error fetching slots:', err);
          setErrorMessage('Không thể tải thông tin khung giờ cửa kho.');
        } finally {
          setLoadingSlots(false);
        }
      };
      fetchSlots();
    }
  }, [selectedWarehouseId, selectedDate]);

  // Handle slot click
  const handleSlotClick = (dockName: string, slot: SlotInfo) => {
    if (!slot.isAvailable) return;
    
    setSelectedSlot({
      dockName,
      timeRange: slot.timeRange,
      startTime: slot.startTime,
      endTime: slot.endTime,
    });
    setLicensePlate('');
    setDriverEmail('');
    setValidationError(null);
    setShowBookingModal(true);
  };

  // Submit booking
  const handleBookingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSlot || !selectedWarehouseId) return;

    // Validation
    if (!licensePlate.trim()) {
      setValidationError('Vui lòng nhập biển số xe.');
      return;
    }
    if (!driverEmail.trim() || !/\S+@\S+\.\S+/.test(driverEmail)) {
      setValidationError('Vui lòng nhập địa chỉ email hợp lệ.');
      return;
    }

    setSubmitting(true);
    setValidationError(null);
    setErrorMessage(null);

    try {
      const response = await axios.post<BookingResponseDto>(`${API_BASE_URL}/bookings/create`, {
        warehouseId: selectedWarehouseId,
        bookingDate: selectedDate,
        startTime: selectedSlot.startTime,
        endTime: selectedSlot.endTime,
        licensePlate: licensePlate.trim(),
        driverEmail: driverEmail.trim(),
        dockName: selectedSlot.dockName,
      });

      setSuccessBooking(response.data);
      setShowBookingModal(false);
    } catch (err: any) {
      console.error('Error creating booking:', err);
      const serverMsg = err.response?.data || 'Có lỗi xảy ra khi đăng ký đặt lịch.';
      setValidationError(typeof serverMsg === 'string' ? serverMsg : 'Đăng ký không thành công.');
    } finally {
      setSubmitting(false);
    }
  };

  const selectedWarehouse = warehouses.find(w => w.warehouseId === selectedWarehouseId);

  // Predefined time ranges for visual grid rows
  const timeRanges = [
    { range: '08:00 - 10:00', start: '08:00', end: '10:00' },
    { range: '10:00 - 12:00', start: '10:00', end: '12:00' },
    { range: '13:00 - 15:00', start: '13:00', end: '15:00' },
    { range: '15:00 - 17:00', start: '15:00', end: '17:00' },
    { range: '17:00 - 19:00', start: '17:00', end: '19:00' }
  ];

  return (
    <div className="bg-white min-h-screen flex flex-col font-sans text-on-surface light-surface">
      <Header scrollY={scrollY} />

      <main className="flex-1 pt-28 pb-16 px-4 max-w-7xl mx-auto w-full">
        {/* Banner Title */}
        <div className="mb-10 text-center md:text-left">
          <button 
            onClick={() => navigate('/')}
            className="inline-flex items-center text-sm font-semibold text-blue-600 hover:text-blue-800 transition-colors mb-4 group"
          >
            <ArrowLeft size={16} className="mr-2 group-hover:-translate-x-1 transition-transform" />
            Quay lại trang chủ
          </button>
          <h1 className="text-3xl md:text-5xl font-black text-gray-900 tracking-tight flex items-center justify-center md:justify-start gap-3">
            <WarehouseIcon className="text-blue-600" size={36} />
            Đặt Lịch Cửa Kho
          </h1>
          <p className="text-gray-500 font-medium mt-2 max-w-2xl">
            Hệ thống đặt trước khung giờ xe đến kho bốc dỡ hàng hóa. Giúp tối ưu hóa tài nguyên cửa kho (Dock) và loại bỏ thời gian chờ đợi.
          </p>
        </div>

        {errorMessage && (
          <div className="bg-red-50 border border-red-200 text-red-800 rounded-2xl p-4 mb-8 flex items-start gap-3 shadow-sm">
            <AlertTriangle className="text-red-500 shrink-0 mt-0.5" size={20} />
            <div>
              <p className="font-bold">Lỗi kết nối máy chủ</p>
              <p className="text-sm mt-1">{errorMessage}</p>
            </div>
          </div>
        )}

        {/* Form Selection Card */}
        <div className="bg-white border border-slate-200/80 rounded-3xl p-6 shadow-sm mb-8 grid grid-cols-1 md:grid-cols-2 gap-6 items-end">
          <div>
            <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Chọn Kho Hàng</label>
            <div className="relative">
              <select 
                value={selectedWarehouseId}
                onChange={(e) => setSelectedWarehouseId(Number(e.target.value))}
                disabled={loadingWarehouses}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold text-gray-800 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 outline-none transition-all disabled:opacity-50 appearance-none"
              >
                {loadingWarehouses ? (
                  <option>Đang tải danh sách kho...</option>
                ) : (
                  warehouses.map((w) => (
                    <option key={w.warehouseId} value={w.warehouseId}>
                      {w.warehouseName}
                    </option>
                  ))
                )}
              </select>
              <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-500 font-bold">
                ▼
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Chọn Ngày Đến</label>
            <div className="relative">
              <input 
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                min={new Date().toISOString().split('T')[0]}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold text-gray-800 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 outline-none transition-all"
              />
            </div>
          </div>
        </div>

        {selectedWarehouse && (
          <div className="mb-4 bg-blue-50/50 border border-blue-100/30 rounded-2xl p-4 flex items-start gap-3">
            <WarehouseIcon className="text-blue-600 shrink-0 mt-0.5" size={18} />
            <div className="text-sm">
              <span className="font-bold text-blue-900">Địa chỉ kho:</span>{' '}
              <span className="text-blue-800 font-medium">{selectedWarehouse.address}</span>
            </div>
          </div>
        )}

        {/* Visual Slots Grid */}
        <div className="bg-white border border-gray-100 rounded-3xl shadow-2xl shadow-slate-100/50 overflow-hidden">
          <div className="p-6 border-b border-gray-100 bg-slate-50/50 flex justify-between items-center flex-wrap gap-4">
            <h3 className="font-bold text-gray-800 text-lg flex items-center gap-2">
              <Calendar size={18} className="text-blue-600" />
              Tình trạng đặt chỗ ngày {new Date(selectedDate).toLocaleDateString('vi-VN')}
            </h3>
            {/* Legend */}
            <div className="flex gap-4 text-xs font-semibold">
              <div className="flex items-center gap-1.5">
                <span className="w-3.5 h-3.5 bg-green-50 border border-green-200 rounded"></span>
                <span className="text-green-800">Còn trống (Chọn để đặt)</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3.5 h-3.5 bg-red-50 border border-red-200 rounded"></span>
                <span className="text-red-800">Đã đăng ký</span>
              </div>
            </div>
          </div>

          {loadingSlots ? (
            <div className="p-20 text-center flex flex-col items-center justify-center gap-3">
              <Loader2 className="animate-spin text-blue-600" size={32} />
              <p className="text-gray-400 font-bold text-sm">Đang tải lịch trống từ hệ thống...</p>
            </div>
          ) : dockSlots.length === 0 ? (
            <div className="p-20 text-center">
              <AlertTriangle className="text-amber-500 mx-auto mb-4" size={40} />
              <p className="text-gray-500 font-bold">Không tìm thấy cửa kho bốc dỡ (Dock) nào khả dụng.</p>
              <p className="text-gray-400 text-xs mt-1">Cửa kho sẽ tự động được khởi tạo ở lần truy vấn đầu tiên của kho này.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[700px] border-collapse">
                <thead>
                  <tr className="bg-slate-50 text-slate-500 text-xs font-bold uppercase tracking-wider border-b border-gray-100">
                    <th className="p-5 text-left w-1/4">Khung Giờ</th>
                    {dockSlots.map((dock) => (
                      <th key={dock.dockName} className="p-5 text-center font-black text-gray-800">
                        {dock.dockName}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {timeRanges.map((timeRow) => (
                    <tr key={timeRow.range} className="border-b border-gray-100/50 hover:bg-slate-50/20 transition-colors">
                      <td className="p-5 font-bold text-gray-700 text-sm flex items-center gap-2">
                        <Clock size={16} className="text-blue-500" />
                        {timeRow.range}
                      </td>
                      {dockSlots.map((dock) => {
                        // Find matching slot in dock info
                        const slot = dock.slots.find(s => s.startTime === timeRow.start) || {
                          timeRange: timeRow.range,
                          startTime: timeRow.start,
                          endTime: timeRow.end,
                          isAvailable: true,
                          bookedLicensePlate: null
                        };

                        return (
                          <td key={dock.dockName} className="p-4 text-center">
                            {slot.isAvailable ? (
                              <button
                                onClick={() => handleSlotClick(dock.dockName, slot)}
                                className="w-full max-w-[150px] py-3 px-4 bg-green-50 hover:bg-green-100 border border-green-200 text-green-700 rounded-xl text-xs font-bold transition-all hover:scale-[1.02] shadow-sm hover:shadow active:scale-95"
                              >
                                Còn Trống
                              </button>
                            ) : (
                              <div className="w-full max-w-[150px] mx-auto py-3 px-4 bg-red-50/60 border border-red-100 text-red-700 rounded-xl text-xs font-bold flex flex-col items-center justify-center">
                                <span>Đã Đặt</span>
                                {slot.bookedLicensePlate && (
                                  <span className="text-[10px] mt-0.5 opacity-80 bg-red-100 px-1.5 py-0.5 rounded font-mono">
                                    {slot.bookedLicensePlate}
                                  </span>
                                )}
                              </div>
                            )}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Modal: Form Booking */}
        {showBookingModal && selectedSlot && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
            <div className="w-full max-w-lg bg-white border border-slate-100 rounded-3xl overflow-hidden shadow-2xl p-6 relative">
              <h3 className="font-bold text-gray-900 text-xl flex items-center gap-2 mb-6">
                <ShieldCheck className="text-blue-600" size={24} />
                Đăng Ký Khung Giờ Vào Kho
              </h3>

              {/* Selection summary */}
              <div className="bg-blue-50/70 border border-blue-100 rounded-2xl p-4 space-y-2 mb-6 text-sm text-blue-900">
                <div className="flex justify-between">
                  <span className="font-semibold text-blue-700">Kho hàng:</span>
                  <span className="font-bold">{selectedWarehouse?.warehouseName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-semibold text-blue-700">Cửa kho:</span>
                  <span className="font-bold">{selectedSlot.dockName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-semibold text-blue-700">Ngày đặt:</span>
                  <span className="font-bold">{new Date(selectedDate).toLocaleDateString('vi-VN')}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-semibold text-blue-700">Khung giờ:</span>
                  <span className="font-bold">{selectedSlot.timeRange}</span>
                </div>
              </div>

              <form onSubmit={handleBookingSubmit} className="space-y-5">
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Biển Số Xe</label>
                  <div className="relative">
                    <Truck className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <input 
                      type="text"
                      placeholder="VD: 29A-12345"
                      value={licensePlate}
                      onChange={(e) => setLicensePlate(e.target.value.toUpperCase())}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-11 pr-4 py-3 text-sm font-bold text-gray-800 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 outline-none transition-all placeholder:text-gray-400 font-mono"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Email Tài Xế</label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <input 
                      type="email"
                      placeholder="VD: driver@email.com"
                      value={driverEmail}
                      onChange={(e) => setDriverEmail(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-11 pr-4 py-3 text-sm font-bold text-gray-800 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 outline-none transition-all placeholder:text-gray-400"
                    />
                  </div>
                  <p className="text-gray-400 text-[10px] mt-1.5 font-medium">Hệ thống sẽ gửi Booking ID và mã QR Code qua email này để tài xế làm thủ tục Check-in.</p>
                </div>

                {validationError && (
                  <div className="text-red-600 text-xs font-bold bg-red-50 border border-red-100 rounded-xl p-3 flex items-center gap-2">
                    <AlertTriangle size={16} />
                    {validationError}
                  </div>
                )}

                <div className="flex gap-4 pt-2">
                  <button 
                    type="button"
                    onClick={() => setShowBookingModal(false)}
                    disabled={submitting}
                    className="flex-1 bg-slate-100 hover:bg-slate-200 text-gray-700 font-bold py-3.5 rounded-xl text-sm transition-all active:scale-[0.98] disabled:opacity-50"
                  >
                    Hủy bỏ
                  </button>
                  <button 
                    type="submit"
                    disabled={submitting}
                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3.5 rounded-xl text-sm transition-all active:scale-[0.98] shadow-md shadow-blue-500/20 flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {submitting ? (
                      <>
                        <Loader2 className="animate-spin" size={16} />
                        Đang đăng ký...
                      </>
                    ) : (
                      'Xác nhận đặt lịch'
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Success Screen Modal */}
        {successBooking && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-md animate-fade-in">
            <div className="w-full max-w-xl bg-white border border-slate-100 rounded-[2rem] overflow-hidden shadow-2xl p-6 md:p-8 text-center relative">
              <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                <CheckCircle2 size={36} className="text-green-600 animate-bounce" />
              </div>
              <h2 className="text-2xl font-black text-gray-900 tracking-tight mb-1">Đặt Lịch Thành Công!</h2>
              <p className="text-sm text-gray-500 font-medium mb-6">Mã đặt lịch và QR Code đã được tạo thành công trên hệ thống SmartLog AI.</p>

              {/* Booking Pass Details Card */}
              <div className="bg-slate-50 border border-slate-200/60 rounded-2xl p-5 text-left mb-6 space-y-3">
                <div className="flex justify-between border-b border-slate-200/40 pb-2">
                  <span className="text-xs font-semibold text-gray-400 uppercase">Booking ID</span>
                  <span className="text-sm font-black text-blue-600 font-mono">{successBooking.bookingId}</span>
                </div>
                <div className="flex justify-between border-b border-slate-200/40 pb-2">
                  <span className="text-xs font-semibold text-gray-400 uppercase">Kho Hàng</span>
                  <span className="text-sm font-bold text-gray-800">{successBooking.warehouseName}</span>
                </div>
                <div className="flex justify-between border-b border-slate-200/40 pb-2">
                  <span className="text-xs font-semibold text-gray-400 uppercase">Cửa Kho (Dock)</span>
                  <span className="text-sm font-bold text-gray-800">{successBooking.dockName}</span>
                </div>
                <div className="flex justify-between border-b border-slate-200/40 pb-2">
                  <span className="text-xs font-semibold text-gray-400 uppercase">Khung Giờ</span>
                  <span className="text-sm font-bold text-gray-800">
                    {new Date(successBooking.startTime).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })} - {new Date(successBooking.endTime).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
                <div className="flex justify-between border-b border-slate-200/40 pb-2">
                  <span className="text-xs font-semibold text-gray-400 uppercase">Ngày Đặt</span>
                  <span className="text-sm font-bold text-gray-800">
                    {new Date(successBooking.startTime).toLocaleDateString('vi-VN')}
                  </span>
                </div>
                <div className="flex justify-between border-b border-slate-200/40 pb-2">
                  <span className="text-xs font-semibold text-gray-400 uppercase">Biển Số Xe</span>
                  <span className="text-sm font-black text-gray-800 font-mono">{successBooking.licensePlate}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-xs font-semibold text-gray-400 uppercase">Email Người Nhận</span>
                  <span className="text-sm font-bold text-gray-800">{successBooking.driverEmail}</span>
                </div>
              </div>

              {/* QR Code display */}
              <div className="bg-slate-50 border border-slate-200/40 rounded-2xl p-4 flex flex-col items-center justify-center gap-3 mb-6">
                <span className="text-xs font-bold text-slate-500 flex items-center gap-1">
                  <QrCode size={14} className="text-blue-600" />
                  MÃ QR VÀO CỔNG (CHECK-IN)
                </span>
                <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-sm inline-block">
                  <img 
                    src={`data:image/png;base64,${successBooking.qrCodeBase64}`} 
                    width="160" 
                    height="160" 
                    alt="Booking QR Code Pass" 
                    className="mx-auto block"
                  />
                </div>
                <span className="text-[10px] text-gray-400 font-semibold">Vui lòng xuất trình mã này cho nhân viên bảo vệ khi xe đến cửa kho.</span>
              </div>

              <div className="flex gap-4">
                <button
                  onClick={() => {
                    // Refresh slots and clear success screen
                    setSuccessBooking(null);
                    // Trigger refetch by updating selection
                    setSelectedDate(selectedDate);
                  }}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3.5 rounded-xl text-sm transition-all active:scale-[0.98] shadow-md shadow-blue-500/20"
                >
                  Đặt Lộ Trình Mới
                </button>
                <button
                  onClick={() => navigate('/')}
                  className="flex-1 bg-slate-100 hover:bg-slate-200 text-gray-700 font-bold py-3.5 rounded-xl text-sm transition-all active:scale-[0.98]"
                >
                  Quay Lại Trang Chủ
                </button>
              </div>
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
};

export default SlotBooking;
