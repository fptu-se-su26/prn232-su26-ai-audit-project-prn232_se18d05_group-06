import React, { useEffect, useMemo, useState } from 'react';
import api from '@lib/api';

interface ScoreBreakdown {
  waitingTimeScore: number;
  cargoTypeScore: number;
  orderPriorityScore: number;
  customerTierScore: number;
  slaUrgencyScore: number;
  dockCompatibilityScore: number;
}

interface Recommendation {
  rank: number;
  bookingId: number;
  bookingCode: string;
  orderCode?: string;
  licensePlate: string;
  driverName: string;
  customerName: string;
  customerTier: string;
  serviceType: string;
  cargoType: string;
  orderPriority: string;
  status: string;
  waitingMinutes: number;
  slaMinutesLeft?: number | null;
  priorityScore: number;
  suggestedDockId?: number | null;
  suggestedDockCode?: string | null;
  suggestedDockName?: string | null;
  recommendationReason: string;
  scoreBreakdown: ScoreBreakdown;
}

interface DockStatus {
  dockId: number;
  dockCode: string;
  dockName?: string;
  status: string;
  suggestedFor: string;
  currentVehiclePlate?: string;
  currentBookingCode?: string;
  occupiedMinutes?: number | null;
}

interface QueueResponse {
  totalWaiting: number;
  averageWaitingMinutes: number;
  availableDocks: number;
  occupiedDocks: number;
  maintenanceDocks: number;
  highPriorityOrders: number;
  overSlaRisk: number;
  recommendations: Recommendation[];
  docks: DockStatus[];
}

interface DispatchOptimizationTabProps {
  searchQuery: string;
  setToastMessage: (message: string) => void;
}

const EMPTY_QUEUE: QueueResponse = {
  totalWaiting: 0,
  averageWaitingMinutes: 0,
  availableDocks: 0,
  occupiedDocks: 0,
  maintenanceDocks: 0,
  highPriorityOrders: 0,
  overSlaRisk: 0,
  recommendations: [],
  docks: [],
};

const badgeClass = (tone: string) => {
  if (tone === 'danger') return 'border-rose-200 bg-rose-50 text-rose-700';
  if (tone === 'warning') return 'border-amber-200 bg-amber-50 text-amber-700';
  if (tone === 'success') return 'border-emerald-200 bg-emerald-50 text-emerald-700';
  if (tone === 'blue') return 'border-blue-200 bg-blue-50 text-blue-700';
  return 'border-slate-200 bg-slate-50 text-slate-600';
};

const statusTone = (status: string) => {
  const normalized = status.toUpperCase();
  if (normalized === 'AVAILABLE') return 'success';
  if (normalized === 'OCCUPIED') return 'blue';
  if (normalized === 'MAINTENANCE') return 'warning';
  if (normalized === 'HOLD') return 'warning';
  return 'neutral';
};

const priorityTone = (priority: string) => {
  const p = priority.toUpperCase();
  if (p === 'URGENT') return 'danger';
  if (p === 'HIGH') return 'warning';
  return 'blue';
};

const statusLabel = (status?: string | null) => {
  const s = (status || '').toUpperCase();
  if (s === 'AVAILABLE') return 'Sẵn sàng';
  if (s === 'OCCUPIED') return 'Đang sử dụng';
  if (s === 'MAINTENANCE') return 'Bảo trì';
  if (s === 'CHECKED_IN') return 'Đã check-in';
  if (s === 'WAITING') return 'Đang chờ';
  if (s === 'HOLD') return 'Tạm giữ';
  if (s === 'ASSIGNED_TO_DOCK') return 'Đã gán dock';
  return s || 'Chưa rõ';
};

const priorityLabel = (priority?: string | null) => {
  const p = (priority || '').toUpperCase();
  if (p === 'URGENT') return 'Khẩn cấp';
  if (p === 'HIGH') return 'Ưu tiên cao';
  if (p === 'LOW') return 'Ưu tiên thấp';
  return 'Bình thường';
};

const cargoLabel = (cargo?: string | null) => {
  const c = (cargo || '').toUpperCase();
  if (c === 'COLD') return 'Hàng lạnh';
  if (c === 'HAZMAT') return 'Hàng nguy hiểm';
  if (c === 'FRAGILE') return 'Dễ vỡ';
  if (c === 'HEAVY') return 'Hàng nặng';
  return 'Hàng thường';
};

const serviceLabel = (service?: string | null) => {
  const s = (service || '').toUpperCase();
  if (s === 'OUTBOUND') return 'Xuất kho';
  return 'Nhập kho';
};

const tierLabel = (tier?: string | null) => {
  const t = (tier || '').toUpperCase();
  if (t === 'VIP') return 'VIP';
  if (t === 'GOLD') return 'Vàng';
  if (t === 'SILVER') return 'Bạc';
  return 'Tiêu chuẩn';
};

const dockCapabilityLabel = (value?: string | null) => {
  const v = (value || '').toUpperCase();
  if (v === 'COLD') return 'Dock hàng lạnh';
  if (v === 'HAZMAT') return 'Dock hàng nguy hiểm';
  if (v === 'OUTBOUND') return 'Dock xuất kho';
  if (v === 'INBOUND') return 'Dock nhập kho';
  return 'Dock đa năng';
};

const recommendationReasonLabel = (item: Recommendation) => {
  const reasons: string[] = [];
  if (item.waitingMinutes >= 60) reasons.push(`chờ ${formatMinutes(item.waitingMinutes)}`);
  if (item.cargoType !== 'NORMAL') reasons.push(cargoLabel(item.cargoType).toLowerCase());
  if (item.orderPriority === 'HIGH' || item.orderPriority === 'URGENT') reasons.push(priorityLabel(item.orderPriority).toLowerCase());
  if (item.customerTier === 'GOLD' || item.customerTier === 'VIP') reasons.push(`khách hàng ${tierLabel(item.customerTier)}`);
  reasons.push(item.suggestedDockCode ? `dock ${item.suggestedDockCode} đang sẵn sàng` : 'chưa có dock phù hợp');
  return reasons.join(' • ');
};

const formatMinutes = (minutes?: number | null) => {
  if (minutes === null || minutes === undefined) return '--';
  if (minutes < 0) return `Trễ ${Math.abs(minutes)} phút`;
  if (minutes >= 60) return `${Math.floor(minutes / 60)} giờ ${minutes % 60} phút`;
  return `${minutes} phút`;
};

const hideTechnicalCode = (value?: string | null) => {
  const code = (value || '').trim();
  if (!code) return '';
  return code.toUpperCase().startsWith('UC') ? '' : code;
};

const bookingLabel = (item: Pick<Recommendation, 'bookingCode' | 'serviceType'>) =>
  hideTechnicalCode(item.bookingCode) || `Lượt ${serviceLabel(item.serviceType).toLowerCase()}`;

const orderLabel = (item: Pick<Recommendation, 'orderCode'>) => hideTechnicalCode(item.orderCode);

export const DispatchOptimizationTab: React.FC<DispatchOptimizationTabProps> = ({ searchQuery, setToastMessage }) => {
  const [queue, setQueue] = useState<QueueResponse>(EMPTY_QUEUE);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selected, setSelected] = useState<Recommendation | null>(null);
  const [actioningId, setActioningId] = useState<number | null>(null);

  const loadQueue = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.get<QueueResponse>('/dispatch/optimization/queue');
      setQueue(response.data);
      setSelected((current) => {
        if (!current) return response.data.recommendations[0] || null;
        return response.data.recommendations.find(item => item.bookingId === current.bookingId) || response.data.recommendations[0] || null;
      });
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Không tải được hàng chờ tối ưu.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadQueue();
    const timer = window.setInterval(loadQueue, 30000);
    return () => window.clearInterval(timer);
  }, []);

  const filteredRecommendations = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return queue.recommendations;
    return queue.recommendations.filter(item =>
      item.bookingCode.toLowerCase().includes(q) ||
      item.licensePlate.toLowerCase().includes(q) ||
      item.customerName.toLowerCase().includes(q) ||
      item.driverName.toLowerCase().includes(q) ||
      item.cargoType.toLowerCase().includes(q)
    );
  }, [queue.recommendations, searchQuery]);

  const handleSeedDemoData = async () => {
    try {
      setLoading(true);
      const response = await api.post('/dispatch/optimization/seed-demo');
      setToastMessage(response.data?.message || 'Đã tạo dữ liệu điều phối mẫu.');
      await loadQueue();
    } catch (err: any) {
      setToastMessage(err.response?.data?.message || 'Tạo dữ liệu mẫu thất bại. Hãy chạy file setup-dispatch-optimization.sql trong SSMS.');
    } finally {
      setLoading(false);
    }
  };
  const handleAssign = async (item: Recommendation) => {
    if (!item.suggestedDockId) {
      setToastMessage('Chưa có dock phù hợp để gán cho lượt xe này.');
      return;
    }

    try {
      setActioningId(item.bookingId);
      const response = await api.post('/dispatch/optimization/assign-dock', {
        bookingId: item.bookingId,
        dockId: item.suggestedDockId,
      });
      setToastMessage(response.data?.message || `Đã gán ${item.licensePlate} vào dock ${item.suggestedDockCode}.`);
      await loadQueue();
    } catch (err: any) {
      setToastMessage(err.response?.data?.message || 'Gán dock thất bại.');
    } finally {
      setActioningId(null);
    }
  };

  const handleHold = async (item: Recommendation) => {
    try {
      setActioningId(item.bookingId);
      const response = await api.post('/dispatch/optimization/hold', {
        bookingId: item.bookingId,
        reason: 'Tạm giữ từ hàng chờ tối ưu điều phối',
      });
      setToastMessage(response.data?.message || `Đã tạm giữ ${item.licensePlate}.`);
      await loadQueue();
    } catch (err: any) {
      setToastMessage(err.response?.data?.message || 'Tạm giữ xe thất bại.');
    } finally {
      setActioningId(null);
    }
  };

  const handleOverride = async (item: Recommendation) => {
    try {
      setActioningId(item.bookingId);
      const response = await api.post('/dispatch/optimization/override-priority', {
        bookingId: item.bookingId,
        newPriority: 'URGENT',
        reason: 'Điều phối viên nâng mức ưu tiên thủ công',
      });
      setToastMessage(response.data?.message || `Đã nâng mức ưu tiên cho ${item.licensePlate}.`);
      await loadQueue();
    } catch (err: any) {
      setToastMessage(err.response?.data?.message || 'Nâng mức ưu tiên thất bại.');
    } finally {
      setActioningId(null);
    }
  };

  const scoreRows = selected ? [
    ['Thời gian chờ', selected.scoreBreakdown.waitingTimeScore],
    ['Loại hàng', selected.scoreBreakdown.cargoTypeScore],
    ['Độ ưu tiên đơn', selected.scoreBreakdown.orderPriorityScore],
    ['Hạng khách hàng', selected.scoreBreakdown.customerTierScore],
    ['Mức khẩn SLA', selected.scoreBreakdown.slaUrgencyScore],
    ['Độ phù hợp dock', selected.scoreBreakdown.dockCompatibilityScore],
  ] : [];

  const laneItems = filteredRecommendations.slice(0, 4);
  const topRecommendation = filteredRecommendations[0];
  const dockUtilization = queue.docks.length ? Math.round((queue.occupiedDocks / queue.docks.length) * 100) : 0;
  const flowTone = queue.overSlaRisk > 0 ? 'danger' : queue.highPriorityOrders > 0 ? 'warning' : queue.totalWaiting > 0 ? 'blue' : 'success';
  const flowLabel = queue.overSlaRisk > 0 ? 'Có rủi ro SLA' : queue.highPriorityOrders > 0 ? 'Hàng chờ ưu tiên' : queue.totalWaiting > 0 ? 'Đang tối ưu' : 'Luồng thông thoáng';

  return (
    <div className="space-y-5 pb-6">
      <section className="relative overflow-hidden rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm sm:p-6 lg:p-7">
        <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(135deg,rgba(37,99,235,0.08),transparent_38%),radial-gradient(circle_at_82%_12%,rgba(6,182,212,0.16),transparent_30%)]" />
        <div className="relative flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
          <div className="max-w-3xl">
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-[11px] font-black uppercase tracking-[0.18em] text-blue-700">AI Fleet</span>
              <span className={`rounded-full border px-3 py-1 text-[11px] font-black uppercase tracking-[0.18em] ${badgeClass(flowTone)}`}>{flowLabel}</span>
            </div>
            <h2 className="mt-4 text-3xl font-black leading-tight text-slate-950 sm:text-4xl">Tối ưu luồng xuất nhập</h2>
            <p className="mt-3 max-w-2xl text-sm font-semibold leading-6 text-slate-600 sm:text-base">
              Sắp xếp xe đã QR check-in theo điểm ưu tiên, gợi ý dock phù hợp và giảm ùn tắc tại cổng, bãi chờ, khu vực dock.
            </p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row xl:justify-end">
            <button
              onClick={loadQueue}
              disabled={loading}
              className="inline-flex min-h-11 items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm font-black text-slate-700 shadow-sm transition hover:-translate-y-0.5 hover:bg-slate-50 disabled:cursor-wait disabled:opacity-60"
            >
              <span className="material-symbols-outlined text-[18px]">refresh</span>
              Làm mới
            </button>
            <button
              onClick={loadQueue}
              disabled={loading}
              className="inline-flex min-h-11 items-center justify-center gap-2 rounded-2xl bg-blue-600 px-5 py-2 text-sm font-black text-white shadow-lg shadow-blue-600/20 transition hover:-translate-y-0.5 hover:bg-blue-700 disabled:cursor-wait disabled:opacity-60"
            >
              <span className="material-symbols-outlined text-[18px]">auto_awesome</span>
              Tối ưu ngay
            </button>
          </div>
        </div>

        <div className="relative mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
          {[
            ['Xe đang chờ', queue.totalWaiting, 'directions_car', 'blue'],
            ['Chờ trung bình', formatMinutes(queue.averageWaitingMinutes), 'timer', queue.averageWaitingMinutes >= 60 ? 'danger' : 'neutral'],
            ['Dock sẵn sàng', queue.availableDocks, 'door_open', 'success'],
            ['Đơn ưu tiên', queue.highPriorityOrders, 'priority_high', queue.highPriorityOrders > 0 ? 'warning' : 'neutral'],
            ['Rủi ro SLA', queue.overSlaRisk, 'release_alert', queue.overSlaRisk > 0 ? 'danger' : 'neutral'],
          ].map(([label, value, icon, tone]) => (
            <div key={label} className="group relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition duration-300 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-slate-900/5">
              <div className="flex items-center justify-between">
                <span className={`material-symbols-outlined rounded-xl border p-2 text-[20px] ${badgeClass(String(tone))}`}>{icon}</span>
                <span className="text-3xl font-black leading-none text-slate-950">{value}</span>
              </div>
              <p className="mt-3 text-[11px] font-black uppercase tracking-widest text-slate-500">{label}</p>
            </div>
          ))}
        </div>

        <div className="relative mt-6 grid gap-4 lg:grid-cols-[minmax(0,1fr)_330px]">
          <div className="rounded-3xl border border-slate-200 bg-white/85 p-4 shadow-sm backdrop-blur">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm font-black text-slate-950">Luồng gợi ý theo thời gian thực</p>
                <p className="text-xs font-semibold text-slate-500">Xe điểm cao đứng gần khu xử lý trước, dock phù hợp hiển thị ở cuối luồng.</p>
              </div>
              <span className={`rounded-full border px-3 py-1 text-xs font-black ${badgeClass(queue.availableDocks > 0 ? 'success' : 'warning')}`}>{queue.availableDocks} dock sẵn sàng</span>
            </div>

            <div className="mt-4 overflow-x-auto pb-1">
              <div className="flex min-w-[720px] items-center gap-3">
                {laneItems.length === 0 ? (
                  <div className="grid min-h-[140px] flex-1 place-items-center rounded-3xl border border-dashed border-slate-200 bg-slate-50 text-sm font-bold text-slate-500">
                    Không có xe trong luồng điều phối
                  </div>
                ) : laneItems.map((item, index) => (
                  <React.Fragment key={item.bookingId}>
                    <button
                      onClick={() => setSelected(item)}
                      className={`min-h-[132px] w-[170px] shrink-0 rounded-3xl border p-4 text-left shadow-sm transition hover:-translate-y-1 hover:shadow-lg ${selected?.bookingId === item.bookingId ? 'border-blue-300 bg-blue-50' : 'border-slate-200 bg-white'}`}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className={`grid h-9 w-9 place-items-center rounded-2xl text-sm font-black text-white shadow-lg ${priorityTone(item.orderPriority) === 'danger' ? 'bg-rose-600' : priorityTone(item.orderPriority) === 'warning' ? 'bg-amber-500' : 'bg-blue-600'}`}>{item.rank}</span>
                        <span className="text-xl font-black text-blue-700">{item.priorityScore}</span>
                      </div>
                      <p className="mt-3 truncate text-sm font-black text-slate-950">{item.licensePlate}</p>
                      <p className="mt-1 truncate text-xs font-bold text-slate-500">{bookingLabel(item)}</p>
                      <div className="mt-3 flex items-center justify-between gap-2 text-[11px] font-black text-slate-500">
                        <span>{formatMinutes(item.waitingMinutes)}</span>
                        <span>{item.suggestedDockCode || 'Chưa có dock'}</span>
                      </div>
                    </button>
                    {index < laneItems.length - 1 && (
                      <span className="material-symbols-outlined shrink-0 text-[26px] text-slate-300">arrow_forward</span>
                    )}
                  </React.Fragment>
                ))}
              </div>
            </div>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-slate-950 p-5 text-white shadow-xl shadow-slate-900/10">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.2em] text-cyan-300">Bước xử lý tốt nhất</p>
                <h3 className="mt-2 text-xl font-black">{topRecommendation ? topRecommendation.licensePlate : 'Không có xe chờ'}</h3>
              </div>
              <span className="material-symbols-outlined rounded-2xl bg-white/10 p-3 text-cyan-200">neurology</span>
            </div>
            {topRecommendation ? (
              <div className="mt-5 space-y-3">
                <div className="rounded-2xl bg-white/10 p-4">
                  <p className="text-sm font-semibold text-slate-200">Gợi ý đưa vào</p>
                  <p className="mt-1 text-2xl font-black text-white">{topRecommendation.suggestedDockCode || 'Chưa có dock'}</p>
                  <p className="mt-1 text-xs font-semibold text-slate-400">{topRecommendation.suggestedDockName || 'AI chưa tìm thấy dock phù hợp'}</p>
                </div>
                <button
                  onClick={() => handleAssign(topRecommendation)}
                  disabled={!topRecommendation.suggestedDockId || actioningId === topRecommendation.bookingId}
                  className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-2xl bg-cyan-400 px-4 py-2 text-sm font-black text-slate-950 shadow-lg shadow-cyan-500/20 transition hover:-translate-y-0.5 hover:bg-cyan-300 disabled:cursor-not-allowed disabled:bg-slate-600 disabled:text-slate-300"
                >
                  <span className="material-symbols-outlined text-[18px]">move_selection_right</span>
                  Gán dock đề xuất
                </button>
              </div>
            ) : (
              <p className="mt-5 text-sm font-semibold leading-6 text-slate-300">Luồng đang thông thoáng. Xe sau khi QR check-in sẽ xuất hiện tại bảng ưu tiên.</p>
            )}
          </div>
        </div>
      </section>

      {error && (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-bold text-rose-700">
          {error}
        </div>
      )}

      <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_380px]">
        <section className="overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-sm">
          <div className="flex flex-col gap-3 border-b border-slate-100 px-4 py-4 sm:px-5 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h3 className="text-xl font-black text-slate-950">Bảng ưu tiên điều phối</h3>
              <p className="text-sm font-semibold text-slate-500">Xe có điểm cao hơn được đề xuất xử lý trước để giảm ùn tắc.</p>
            </div>
            <span className="rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-xs font-black text-blue-700">
              {filteredRecommendations.length} xe
            </span>
          </div>

          <div className="divide-y divide-slate-100">
            {loading && (
              <div className="p-8 text-center text-sm font-bold text-slate-500">Đang tính toán hàng chờ tối ưu...</div>
            )}

            {!loading && filteredRecommendations.length === 0 && (
              <div className="p-10 text-center">
                <span className="material-symbols-outlined rounded-2xl bg-emerald-50 p-4 text-[36px] text-emerald-600">task_alt</span>
                <p className="mt-3 text-sm font-black text-slate-800">Không có xe đang chờ điều phối.</p>
                <p className="text-sm font-semibold text-slate-500">Xe sau khi QR check-in thành công sẽ xuất hiện tại đây.</p>
                <button
                  onClick={handleSeedDemoData}
                  disabled={loading}
                  className="mt-5 inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2 text-sm font-black text-white shadow-lg shadow-blue-600/20 hover:bg-blue-700 disabled:opacity-60"
                >
                  <span className="material-symbols-outlined text-[18px]">database</span>
                  Tạo dữ liệu mẫu
                </button>
              </div>
            )}

            {!loading && filteredRecommendations.map((item) => (
              <article
                key={item.bookingId}
                onClick={() => setSelected(item)}
                className={`cursor-pointer px-4 py-4 transition duration-200 sm:px-5 ${selected?.bookingId === item.bookingId ? 'bg-blue-50/70' : 'bg-white hover:bg-slate-50'}`}
              >
                <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_220px] lg:items-center">
                  <div className="flex min-w-0 gap-4">
                    <div className={`grid h-14 w-14 shrink-0 place-items-center rounded-2xl text-lg font-black text-white shadow-lg ${priorityTone(item.orderPriority) === 'danger' ? 'bg-rose-600' : priorityTone(item.orderPriority) === 'warning' ? 'bg-amber-500' : 'bg-blue-600'}`}>
                      #{item.rank}
                    </div>
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <h4 className="truncate text-lg font-black text-slate-950 sm:text-xl">{item.licensePlate}</h4>
                        <span className={`rounded-full border px-2.5 py-1 text-[10px] font-black ${badgeClass(priorityTone(item.orderPriority))}`}>{priorityLabel(item.orderPriority)}</span>
                        <span className={`rounded-full border px-2.5 py-1 text-[10px] font-black ${badgeClass(item.cargoType === 'COLD' || item.cargoType === 'HAZMAT' ? 'warning' : 'blue')}`}>{cargoLabel(item.cargoType)}</span>
                        <span className={`rounded-full border px-2.5 py-1 text-[10px] font-black ${badgeClass(statusTone(item.status))}`}>{statusLabel(item.status)}</span>
                      </div>
                      <p className="mt-1 text-sm font-bold text-slate-600">{bookingLabel(item)} {orderLabel(item) ? `- ${orderLabel(item)}` : ''}</p>
                      <p className="mt-1 text-sm font-semibold text-slate-500">{item.customerName} - {tierLabel(item.customerTier)} - {item.driverName}</p>
                      <div className="mt-3 grid gap-2 text-xs font-black text-slate-500 sm:grid-cols-2 xl:grid-cols-4">
                        <span className="rounded-2xl bg-slate-50 px-3 py-2">Chờ {formatMinutes(item.waitingMinutes)}</span>
                        <span className="rounded-2xl bg-slate-50 px-3 py-2">SLA {formatMinutes(item.slaMinutesLeft)}</span>
                        <span className="rounded-2xl bg-slate-50 px-3 py-2">{serviceLabel(item.serviceType)}</span>
                        <span className="rounded-2xl bg-slate-50 px-3 py-2">Dock {item.suggestedDockCode || 'Chưa có'}</span>
                      </div>
                    </div>
                  </div>

                  <div className="lg:flex lg:justify-end">
                    <div className="w-full rounded-2xl border border-slate-200 bg-slate-50/80 p-3 shadow-sm sm:max-w-[300px] lg:w-[220px]">
                      <div className="flex items-center justify-between gap-3 border-b border-slate-200 pb-3">
                        <p className="text-[11px] font-black uppercase tracking-widest text-slate-500">Điểm ưu tiên</p>
                        <p className="text-3xl font-black leading-none text-blue-700">{item.priorityScore}</p>
                      </div>
                      <div className="mt-3 space-y-2">
                        <button
                          onClick={(e) => { e.stopPropagation(); handleAssign(item); }}
                          disabled={!item.suggestedDockId || actioningId === item.bookingId}
                          className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-2 text-sm font-black text-white shadow-sm transition hover:-translate-y-0.5 hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-slate-300"
                        >
                          <span className="material-symbols-outlined text-[17px]">door_open</span>
                          Gán dock
                        </button>
                        <div className="grid grid-cols-2 gap-2">
                          <button
                            onClick={(e) => { e.stopPropagation(); handleHold(item); }}
                            disabled={actioningId === item.bookingId}
                            className="inline-flex min-h-10 items-center justify-center rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-xs font-black text-amber-700 transition hover:bg-amber-100 disabled:opacity-60"
                          >
                            Tạm giữ
                          </button>
                          <button
                            onClick={(e) => { e.stopPropagation(); handleOverride(item); }}
                            disabled={actioningId === item.bookingId}
                            className="inline-flex min-h-10 items-center justify-center rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-xs font-black text-rose-700 transition hover:bg-rose-100 disabled:opacity-60"
                          >
                            Khẩn cấp
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </section>

        <aside className="space-y-5">
          <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <h3 className="truncate text-lg font-black text-slate-950 sm:text-xl">Giải thích điểm</h3>
            {!selected ? (
              <p className="mt-3 text-sm font-semibold text-slate-500">Chọn một xe để xem lý do ưu tiên.</p>
            ) : (
              <div className="mt-4 space-y-3">
                <div className="rounded-2xl bg-blue-50 p-4">
                  <p className="text-xs font-black uppercase tracking-widest text-blue-600">{bookingLabel(selected)}</p>
                  <p className="mt-1 text-3xl font-black text-blue-700">{selected.priorityScore}</p>
                  <p className="mt-1 text-sm font-semibold text-blue-900">{recommendationReasonLabel(selected)}</p>
                </div>
                {scoreRows.map(([label, score]) => (
                  <div key={label} className="flex items-center justify-between rounded-xl border border-slate-100 bg-slate-50 px-3 py-2">
                    <span className="text-sm font-bold text-slate-600">{label}</span>
                    <span className={`text-sm font-black ${Number(score) < 0 ? 'text-rose-600' : 'text-slate-950'}`}>{Number(score) > 0 ? '+' : ''}{score}</span>
                  </div>
                ))}
              </div>
            )}
          </section>

          <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <h3 className="truncate text-lg font-black text-slate-950 sm:text-xl">Trạng thái dock</h3>
              <span className="text-xs font-black text-slate-400">{queue.docks.length} dock</span>
            </div>
            <div className="mt-4 space-y-3">
              {queue.docks.map((dock) => (
                <div key={dock.dockId} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="text-sm font-black text-slate-950">{dock.dockCode}</p>
                      <p className="text-xs font-semibold text-slate-500">{dock.dockName || dockCapabilityLabel(dock.suggestedFor)}</p>
                    </div>
                    <span className={`rounded-full border px-2.5 py-1 text-[10px] font-black ${badgeClass(statusTone(dock.status))}`}>{statusLabel(dock.status)}</span>
                  </div>
                  {dock.currentVehiclePlate && (
                    <p className="mt-3 text-xs font-bold text-slate-600">
                      {dock.currentVehiclePlate}{hideTechnicalCode(dock.currentBookingCode) ? ` - ${hideTechnicalCode(dock.currentBookingCode)}` : ''} - {formatMinutes(dock.occupiedMinutes)}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </section>
        </aside>
      </div>
    </div>
  );
};

export default DispatchOptimizationTab;



