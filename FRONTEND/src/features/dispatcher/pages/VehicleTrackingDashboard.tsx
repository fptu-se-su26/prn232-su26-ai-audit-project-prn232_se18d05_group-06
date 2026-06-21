import React, { useState, useEffect } from 'react';
import api from '@/lib/api';

interface Vehicle {
  vehicleId: number;
  licensePlate: string;
  vehicleModel: string;
  status: string;
}

interface VehicleEvent {
  eventId: number;
  vehicleId: number;
  eventType: string;
  eventTime: string;
  remarks: string | null;
}

export const VehicleTrackingDashboard: React.FC = () => {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [selectedVehicleId, setSelectedVehicleId] = useState<string>('');
  const [history, setHistory] = useState<VehicleEvent[]>([]);
  const [tripCount, setTripCount] = useState<number>(0);
  
  const [loadingVehicles, setLoadingVehicles] = useState<boolean>(true);
  const [loadingData, setLoadingData] = useState<boolean>(false);
  const [submitting, setSubmitting] = useState<boolean>(false);
  
  const [eventType, setEventType] = useState<string>('CheckIn');
  const [remarks, setRemarks] = useState<string>('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Fetch list of all vehicles
  useEffect(() => {
    const fetchVehicles = async () => {
      try {
        const res = await api.get<Vehicle[]>('/tracking/vehicles');
        setVehicles(res.data);
        if (res.data.length > 0) {
          setSelectedVehicleId(res.data[0].vehicleId.toString());
        }
      } catch (err: any) {
        console.error('Error fetching vehicles:', err);
        setErrorMsg('Không thể kết nối với máy chủ để tải danh sách phương tiện.');
      } finally {
        setLoadingVehicles(false);
      }
    };
    fetchVehicles();
  }, []);

  // Fetch history & trip count when selected vehicle changes
  useEffect(() => {
    if (!selectedVehicleId) return;
    fetchVehicleData(Number(selectedVehicleId));
  }, [selectedVehicleId]);

  const fetchVehicleData = async (vehicleId: number) => {
    setLoadingData(true);
    try {
      const [historyRes, tripRes] = await Promise.all([
        api.get<VehicleEvent[]>(`/tracking/history/${vehicleId}`),
        api.get<{ completedTripCount: number }>(`/tracking/trips/${vehicleId}/count`)
      ]);
      
      // Sort history chronologically newest on top
      const sortedHistory = [...historyRes.data].sort(
        (a, b) => new Date(b.eventTime).getTime() - new Date(a.eventTime).getTime()
      );
      
      setHistory(sortedHistory);
      setTripCount(tripRes.data.completedTripCount);
      setErrorMsg(null);
    } catch (err: any) {
      console.error('Error fetching vehicle data:', err);
      setErrorMsg('Không thể tải lịch sử hành trình hoặc số chuyến xe của phương tiện này.');
    } finally {
      setLoadingData(false);
    }
  };

  const handleAddEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedVehicleId) return;
    setSubmitting(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      await api.post('/tracking/events', {
        vehicleId: Number(selectedVehicleId),
        eventType,
        remarks: remarks.trim() || null
      });

      setSuccessMsg('Ghi nhận sự kiện hành trình thành công.');
      setRemarks('');
      await fetchVehicleData(Number(selectedVehicleId));
      
      // Clear success message after 3 seconds
      setTimeout(() => setSuccessMsg(null), 3000);
    } catch (err: any) {
      console.error('Error adding event:', err);
      const errMsg = err.response?.data || 'Có lỗi xảy ra khi ghi nhận sự kiện.';
      setErrorMsg(errMsg);
    } finally {
      setSubmitting(false);
    }
  };

  // Find selected vehicle details
  const currentVehicleObj = vehicles.find(v => v.vehicleId.toString() === selectedVehicleId);

  // Formatter for DateTime string
  const formatDateTime = (dateStr: string) => {
    try {
      const d = new Date(dateStr);
      return d.toLocaleString('vi-VN', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      });
    } catch {
      return dateStr;
    }
  };

  // Helper for event styling and symbols
  const getEventConfig = (type: string) => {
    switch (type) {
      case 'CheckIn':
        return {
          bgClass: 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30',
          title: 'Vào cổng (Check-in)',
          icon: 'login',
          dotColor: 'bg-emerald-400 ring-emerald-500/30'
        };
      case 'CheckOut':
        return {
          bgClass: 'bg-slate-400/10 text-slate-400 border border-slate-400/30',
          title: 'Ra cổng (Check-out)',
          icon: 'logout',
          dotColor: 'bg-slate-400 ring-slate-400/30'
        };
      case 'Load':
        return {
          bgClass: 'bg-amber-500/10 text-amber-400 border border-amber-500/30',
          title: 'Lên hàng (Load)',
          icon: 'upload',
          dotColor: 'bg-amber-400 ring-amber-500/30'
        };
      case 'Unload':
        return {
          bgClass: 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/30',
          title: 'Xuống hàng (Unload)',
          icon: 'download',
          dotColor: 'bg-indigo-400 ring-indigo-500/30'
        };
      default:
        return {
          bgClass: 'bg-blue-500/10 text-blue-400 border border-blue-500/30',
          title: type,
          icon: 'info',
          dotColor: 'bg-blue-400 ring-blue-500/30'
        };
    }
  };

  // Get current status of the vehicle based on the newest event
  const getCurrentStatusText = () => {
    if (history.length === 0) return 'Chưa có hoạt động';
    const newest = history[0];
    const cfg = getEventConfig(newest.eventType);
    return cfg.title;
  };

  return (
    <div className="flex-1 flex flex-col gap-6 overflow-y-auto pr-1 select-none">
      {/* Top Banner Select Vehicle */}
      <div className="glass-panel rounded-xl p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-[#0a1e35]/40 border-white/5">
        <div>
          <h2 className="text-[18px] font-bold text-primary flex items-center gap-2">
            <span className="material-symbols-outlined text-[22px] animate-pulse">track_changes</span>
            Hành trình & Sự kiện phương tiện
          </h2>
          <p className="text-slate-400 text-[12px] mt-1 font-semibold">
            Theo dõi vết di chuyển, trạng thái hàng hóa và đếm chuyến hành trình tự động (Bất biến).
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <label className="text-[13px] font-bold text-slate-300 shrink-0">Chọn xe:</label>
          {loadingVehicles ? (
            <div className="h-10 w-48 rounded bg-white/5 animate-pulse flex items-center justify-center text-[12px] text-slate-400">
              Đang tải phương tiện...
            </div>
          ) : (
            <select
              value={selectedVehicleId}
              onChange={(e) => setSelectedVehicleId(e.target.value)}
              className="bg-black/40 border border-outline-variant/30 rounded-lg p-2.5 px-4 text-[#d4e4fa] text-[14px] font-semibold focus:outline-none focus:ring-1 focus:ring-primary/50 cursor-pointer min-w-[200px]"
            >
              {vehicles.map((v) => (
                <option key={v.vehicleId} value={v.vehicleId} className="bg-[#051424]">
                  {v.licensePlate} ({v.vehicleModel || 'Không rõ mẫu'})
                </option>
              ))}
            </select>
          )}
        </div>
      </div>

      {/* Error & Success Messages */}
      {errorMsg && (
        <div className="p-4 bg-error/10 border border-error/25 text-error rounded-lg flex items-center gap-3 animate-fade-in text-[13px] font-semibold">
          <span className="material-symbols-outlined text-[20px]">error</span>
          <span>{errorMsg}</span>
        </div>
      )}
      {successMsg && (
        <div className="p-4 bg-success/10 border border-success/25 text-success rounded-lg flex items-center gap-3 animate-fade-in text-[13px] font-semibold">
          <span className="material-symbols-outlined text-[20px]">check_circle</span>
          <span>{successMsg}</span>
        </div>
      )}

      {/* KPI Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* KPI 1: Trip Count */}
        <div className="relative overflow-hidden rounded-xl border border-white/5 bg-[#0a1e35]/30 p-6 shadow-md transition-all hover:border-primary/20">
          <div className="absolute top-0 left-0 w-2.5 h-full bg-[#2563eb]" />
          <div className="flex justify-between items-start">
            <div>
              <p className="text-slate-400 text-[12px] font-bold uppercase tracking-wider mb-1">
                Số chuyến xe hoàn thành
              </p>
              {loadingData ? (
                <div className="h-10 w-20 bg-white/5 animate-pulse rounded mt-2" />
              ) : (
                <h3 className="text-4xl font-extrabold text-[#d4e4fa] tracking-tight">{tripCount}</h3>
              )}
            </div>
            <div className="p-3 rounded-xl bg-[#2563eb]/10 text-primary border border-primary/20">
              <span className="material-symbols-outlined text-[24px]">route</span>
            </div>
          </div>
          <p className="text-[11px] text-slate-500 mt-4 font-semibold">
            * 1 Chuyến = 1 cặp (Vào cổng ↔ Ra cổng) liên tiếp
          </p>
        </div>

        {/* KPI 2: Total Events Logged */}
        <div className="relative overflow-hidden rounded-xl border border-white/5 bg-[#0a1e35]/30 p-6 shadow-md transition-all hover:border-amber-500/20">
          <div className="absolute top-0 left-0 w-2.5 h-full bg-amber-500" />
          <div className="flex justify-between items-start">
            <div>
              <p className="text-slate-400 text-[12px] font-bold uppercase tracking-wider mb-1">
                Tổng sự kiện ghi chép
              </p>
              {loadingData ? (
                <div className="h-10 w-20 bg-white/5 animate-pulse rounded mt-2" />
              ) : (
                <h3 className="text-4xl font-extrabold text-[#d4e4fa] tracking-tight">{history.length}</h3>
              )}
            </div>
            <div className="p-3 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
              <span className="material-symbols-outlined text-[24px]">history_toggle_off</span>
            </div>
          </div>
          <p className="text-[11px] text-slate-500 mt-4 font-semibold">
            Vết hành trình bất biến được ghi nhận trong hệ thống
          </p>
        </div>

        {/* KPI 3: Current Status */}
        <div className="relative overflow-hidden rounded-xl border border-white/5 bg-[#0a1e35]/30 p-6 shadow-md transition-all hover:border-emerald-500/20">
          <div className="absolute top-0 left-0 w-2.5 h-full bg-emerald-500" />
          <div className="flex justify-between items-start">
            <div>
              <p className="text-slate-400 text-[12px] font-bold uppercase tracking-wider mb-1">
                Trạng thái hiện tại
              </p>
              {loadingData ? (
                <div className="h-8 w-32 bg-white/5 animate-pulse rounded mt-2" />
              ) : (
                <h3 className="text-[20px] font-bold text-emerald-400 mt-2 truncate max-w-[200px]">
                  {getCurrentStatusText()}
                </h3>
              )}
            </div>
            <div className="p-3 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <span className="material-symbols-outlined text-[24px]">verified</span>
            </div>
          </div>
          <p className="text-[11px] text-slate-500 mt-4 font-semibold">
            Biển số: {currentVehicleObj?.licensePlate || 'N/A'} • {currentVehicleObj?.status || 'N/A'}
          </p>
        </div>
      </div>

      {/* Split Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Register Event Form (4 cols) */}
        <div className="lg:col-span-5 glass-panel rounded-xl p-6 bg-[#0a1e35]/30 border-white/5 flex flex-col gap-5">
          <div>
            <h3 className="text-[15px] font-bold text-slate-200 flex items-center gap-2">
              <span className="material-symbols-outlined text-primary text-[18px]">edit_calendar</span>
              Ghi nhận sự kiện mới
            </h3>
            <p className="text-[11px] text-slate-400 mt-1 leading-normal">
              Thêm một sự kiện di chuyển hoặc thao tác hàng hóa cho xe đang được chọn. Bản ghi này sẽ là vĩnh viễn và không thể chỉnh sửa.
            </p>
          </div>

          <form onSubmit={handleAddEvent} className="flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <label className="text-[12px] font-bold text-slate-300">Loại sự kiện:</label>
              <select
                value={eventType}
                onChange={(e) => setEventType(e.target.value)}
                className="bg-black/50 border border-outline-variant/30 rounded-lg p-2.5 text-[#d4e4fa] text-[13px] font-semibold focus:outline-none focus:ring-1 focus:ring-primary/50 cursor-pointer"
              >
                <option value="CheckIn" className="bg-[#051424]">Vào cổng (Check In)</option>
                <option value="Load" className="bg-[#051424]">Lên hàng (Load)</option>
                <option value="Unload" className="bg-[#051424]">Xuống hàng (Unload)</option>
                <option value="CheckOut" className="bg-[#051424]">Ra cổng (Check Out)</option>
              </select>
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-[12px] font-bold text-slate-300">Ghi chú / Remarks:</label>
              <textarea
                value={remarks}
                onChange={(e) => setRemarks(e.target.value)}
                placeholder="Nhập thông tin chi tiết (ví dụ: Số lượng pallet, Tên tài xế, Lý do trễ...)"
                rows={4}
                className="w-full bg-black/50 border border-outline-variant/30 rounded-lg p-3 text-[#d4e4fa] text-[13px] focus:outline-none focus:ring-1 focus:ring-primary/50 placeholder-[#d4e4fa]/30 resize-none"
              />
            </div>

            <button
              type="submit"
              disabled={submitting || !selectedVehicleId}
              className="mt-2 w-full bg-primary hover:bg-[#1d4ed8] text-white font-bold p-3 rounded-lg text-[13px] transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              {submitting ? (
                <>
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                  Đang ghi nhận...
                </>
              ) : (
                <>
                  <span className="material-symbols-outlined text-[18px]">add_circle</span>
                  Ghi nhận sự kiện
                </>
              )}
            </button>
          </form>
        </div>

        {/* Right Column: Timeline (7 cols) */}
        <div className="lg:col-span-7 glass-panel rounded-xl p-6 bg-[#0a1e35]/30 border-white/5 flex flex-col gap-5">
          <div className="flex items-center justify-between border-b border-white/5 pb-4">
            <div>
              <h3 className="text-[15px] font-bold text-slate-200 flex items-center gap-2">
                <span className="material-symbols-outlined text-primary text-[18px]">timeline</span>
                Lịch sử sự kiện (Mới nhất ở trên)
              </h3>
              <p className="text-[11px] text-slate-400 mt-1">
                Dòng thời gian hành trình được ghi nhận cho xe {currentVehicleObj?.licensePlate}
              </p>
            </div>
            {loadingData && (
              <span className="text-[11px] text-primary flex items-center gap-1.5 font-bold animate-pulse">
                <span className="w-2.5 h-2.5 border border-primary border-t-transparent rounded-full animate-spin"></span>
                Đang cập nhật...
              </span>
            )}
          </div>

          {loadingData && history.length === 0 ? (
            <div className="py-20 flex flex-col items-center justify-center text-slate-400 gap-3">
              <span className="w-8 h-8 border-3 border-primary border-t-transparent rounded-full animate-spin"></span>
              <span className="text-[13px]">Đang tải dòng thời gian...</span>
            </div>
          ) : history.length === 0 ? (
            <div className="py-20 flex flex-col items-center justify-center text-slate-400 gap-3 text-center border-2 border-dashed border-white/5 rounded-xl">
              <span className="material-symbols-outlined text-[48px] text-slate-600">route</span>
              <div className="text-[13px] font-bold">Chưa có hành trình nào được ghi nhận</div>
              <p className="text-[11px] max-w-xs text-slate-500">
                Nhập sự kiện bên trái để bắt đầu lập lịch trình di chuyển và tính chuyến cho xe này.
              </p>
            </div>
          ) : (
            <div className="relative pl-6 border-l border-white/10 space-y-6 mr-1 mt-2">
              {history.map((event) => {
                const config = getEventConfig(event.eventType);
                return (
                  <div key={event.eventId} className="relative group">
                    {/* Circle Dot Marker on Timeline Line */}
                    <div className="absolute -left-[31px] top-1.5">
                      <div className={`w-[10px] h-[10px] rounded-full ${config.dotColor} ring-4 transition-transform group-hover:scale-125`} />
                    </div>

                    {/* Timeline Event Card */}
                    <div className="glass-panel p-4 rounded-xl border border-white/5 bg-[#0a1e35]/20 group-hover:border-white/10 transition-all flex flex-col gap-2.5">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                        {/* Event type badge */}
                        <div className="flex items-center gap-2">
                          <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold flex items-center gap-1 ${config.bgClass}`}>
                            <span className="material-symbols-outlined text-[14px]">{config.icon}</span>
                            {config.title}
                          </span>
                        </div>
                        {/* Timestamp */}
                        <span className="text-[11px] text-slate-400 font-semibold flex items-center gap-1">
                          <span className="material-symbols-outlined text-[13px]">schedule</span>
                          {formatDateTime(event.eventTime)}
                        </span>
                      </div>

                      {/* Remarks (Read-Only) */}
                      {event.remarks && (
                        <div className="bg-black/35 rounded-lg p-3 text-[12.5px] text-[#d4e4fa]/90 border border-white/5 leading-relaxed">
                          {event.remarks}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default VehicleTrackingDashboard;
