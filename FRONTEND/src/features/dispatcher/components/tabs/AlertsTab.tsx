import React, { useEffect, useMemo, useState } from 'react';
import api from '../../../../lib/api';

type AlertLevel = 'WARNING' | 'OVERSTAY' | 'OVERSTAY_MEDIUM' | 'CRITICAL';

interface OverstayAlertApiItem {
  alertId: number;
  vehicleId: number;
  licensePlate: string;
  driverName?: string;
  bookingCode?: string;
  dockCode: string;
  dockName?: string;
  customerName?: string;
  currentStatus: string;
  serviceType: string;
  cargoType?: string;
  slaMinutes: number;
  actualMinutes: number;
  overstayMinutes: number;
  alertLevel: AlertLevel;
  alertMessage: string;
}

interface OverstayAlertSummary {
  total: number;
  warning: number;
  overstay: number;
  critical: number;
}

interface OverstayAlertDashboardApi {
  summary?: OverstayAlertSummary;
  alerts: OverstayAlertApiItem[];
}

interface AlertsTabProps {
  searchQuery: string;
  setToastMessage: (msg: string | null) => void;
  setActiveTab: (tab: string) => void;
}

const MOCK_OVERSTAY_ALERTS: OverstayAlertApiItem[] = [
  {
    alertId: 9001,
    vehicleId: 11,
    licensePlate: '51C-238.77',
    driverName: 'Nguyễn Minh Khoa',
    bookingCode: 'BK-DK-2407',
    dockCode: 'D-03',
    dockName: 'Dock lạnh',
    customerName: 'FreshHub Retail',
    currentStatus: 'IN_DOCK',
    serviceType: 'Outbound',
    cargoType: 'Hàng lạnh',
    slaMinutes: 45,
    actualMinutes: 72,
    overstayMinutes: 27,
    alertLevel: 'OVERSTAY_MEDIUM',
    alertMessage: 'Xe 51C-238.77 đã lưu tại Dock D-03 quá SLA 27 phút.',
  },
  {
    alertId: 9002,
    vehicleId: 12,
    licensePlate: '50H-918.42',
    driverName: 'Trần Bảo Long',
    bookingCode: 'BK-DK-2411',
    dockCode: 'D-01',
    dockName: 'Dock nhập kho',
    customerName: 'MedCare Distribution',
    currentStatus: 'IN_DOCK',
    serviceType: 'Inbound',
    cargoType: 'Thiết bị y tế',
    slaMinutes: 60,
    actualMinutes: 126,
    overstayMinutes: 66,
    alertLevel: 'CRITICAL',
    alertMessage: 'Xe 50H-918.42 đã lưu tại Dock D-01 quá SLA 66 phút.',
  },
  {
    alertId: 9003,
    vehicleId: 13,
    licensePlate: '60C-771.09',
    driverName: 'Phạm Gia Huy',
    bookingCode: 'BK-DK-2415',
    dockCode: 'D-05',
    dockName: 'Dock xuất hàng',
    customerName: 'Prime Retail',
    currentStatus: 'WAITING_UNLOAD',
    serviceType: 'Outbound',
    cargoType: 'Hàng tiêu dùng',
    slaMinutes: 50,
    actualMinutes: 44,
    overstayMinutes: 0,
    alertLevel: 'WARNING',
    alertMessage: 'Xe 60C-771.09 sắp chạm ngưỡng SLA tại Dock D-05.',
  },
];

const levelConfig: Record<AlertLevel, { label: string; badge: string; panel: string; icon: string }> = {
  WARNING: {
    label: 'Sắp quá SLA',
    badge: 'border-amber-200 bg-amber-50 text-amber-800',
    panel: 'border-amber-200 bg-amber-50/70',
    icon: 'timer',
  },
  OVERSTAY: {
    label: 'Quá SLA',
    badge: 'border-orange-200 bg-orange-50 text-orange-800',
    panel: 'border-orange-200 bg-orange-50/70',
    icon: 'schedule',
  },
  OVERSTAY_MEDIUM: {
    label: 'Quá SLA',
    badge: 'border-rose-200 bg-rose-50 text-rose-800',
    panel: 'border-rose-200 bg-rose-50/70',
    icon: 'release_alert',
  },
  CRITICAL: {
    label: 'Khẩn cấp',
    badge: 'border-red-200 bg-red-50 text-red-800',
    panel: 'border-red-200 bg-red-50/80',
    icon: 'warning',
  },
};

const getElapsedText = (alert: OverstayAlertApiItem) => {
  if (alert.overstayMinutes > 0) return `Vượt SLA ${alert.overstayMinutes} phút`;
  return `Đã dùng ${alert.actualMinutes}/${alert.slaMinutes} phút`;
};

const getProgress = (alert: OverstayAlertApiItem) => {
  if (alert.slaMinutes <= 0) return 100;
  return Math.min(100, Math.round((alert.actualMinutes / alert.slaMinutes) * 100));
};

export const AlertsTab: React.FC<AlertsTabProps> = ({
  searchQuery,
  setToastMessage,
  setActiveTab,
}) => {
  const [alerts, setAlerts] = useState<OverstayAlertApiItem[]>(MOCK_OVERSTAY_ALERTS);
  const [selectedAlertId, setSelectedAlertId] = useState<number | null>(MOCK_OVERSTAY_ALERTS[0]?.alertId ?? null);
  const [isApiConnected, setIsApiConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [levelFilter, setLevelFilter] = useState<'all' | AlertLevel>('all');

  const loadOverstayAlerts = async () => {
    setIsLoading(true);
    try {
      const response = await api.get<OverstayAlertDashboardApi>('/fleet/overstay-alerts');
      const apiAlerts = response.data.alerts ?? [];
      setAlerts(apiAlerts.length > 0 ? apiAlerts : MOCK_OVERSTAY_ALERTS);
      setSelectedAlertId((current) => {
        if (current && apiAlerts.some((alert) => alert.alertId === current)) return current;
        return apiAlerts[0]?.alertId ?? MOCK_OVERSTAY_ALERTS[0]?.alertId ?? null;
      });
      setIsApiConnected(true);
    } catch {
      setAlerts(MOCK_OVERSTAY_ALERTS);
      setSelectedAlertId((current) => current ?? MOCK_OVERSTAY_ALERTS[0]?.alertId ?? null);
      setIsApiConnected(false);
      setToastMessage('Chưa kết nối được API Overstay Alert, đang hiển thị dữ liệu mẫu.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      if (cancelled) return;
      await loadOverstayAlerts();
    };

    load();
    const intervalId = window.setInterval(load, 30000);

    return () => {
      cancelled = true;
      window.clearInterval(intervalId);
    };
  }, []);

  const filteredAlerts = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();

    return alerts.filter((alert) => {
      if (levelFilter !== 'all' && alert.alertLevel !== levelFilter) return false;
      if (!q) return true;

      return [
        alert.licensePlate,
        alert.driverName,
        alert.bookingCode,
        alert.dockCode,
        alert.dockName,
        alert.customerName,
        alert.cargoType,
        alert.alertMessage,
      ].some((value) => (value ?? '').toLowerCase().includes(q));
    });
  }, [alerts, levelFilter, searchQuery]);

  const selectedAlert = filteredAlerts.find((alert) => alert.alertId === selectedAlertId) ?? filteredAlerts[0];

  const summary = useMemo(() => {
    return {
      total: alerts.length,
      warning: alerts.filter((alert) => alert.alertLevel === 'WARNING').length,
      overstay: alerts.filter((alert) => alert.alertLevel === 'OVERSTAY' || alert.alertLevel === 'OVERSTAY_MEDIUM').length,
      critical: alerts.filter((alert) => alert.alertLevel === 'CRITICAL').length,
    };
  }, [alerts]);

  const handleResolveAlert = async (alert: OverstayAlertApiItem) => {
    try {
      await api.put(`/fleet/overstay-alerts/${alert.alertId}/resolve`, {
        alertStatus: 'RESOLVED',
        actionTaken: 'Dispatcher resolved the overstay alert from the Overstay Alert screen.',
      });

      setAlerts((prev) => prev.filter((item) => item.alertId !== alert.alertId));
      setToastMessage(`Đã xác nhận xử lý Overstay Alert cho xe ${alert.licensePlate}.`);
    } catch {
      setAlerts((prev) => prev.filter((item) => item.alertId !== alert.alertId));
      setToastMessage(`Đã tạm ẩn cảnh báo cho xe ${alert.licensePlate}. API chưa phản hồi xác nhận.`);
    }
  };

  const handleMarkResolving = async (alert: OverstayAlertApiItem) => {
    try {
      await api.put(`/fleet/overstay-alerts/${alert.alertId}/resolve`, {
        alertStatus: 'RESOLVING',
        actionTaken: 'Dispatcher started handling this overstay alert.',
      });
      setToastMessage(`Đang xử lý Overstay Alert cho xe ${alert.licensePlate}.`);
    } catch {
      setToastMessage(`Chưa cập nhật được trạng thái xử lý cho xe ${alert.licensePlate}.`);
    }
  };

  return (
    <div className="relative z-10 flex h-full min-h-0 flex-col gap-4">
      <section className="grid shrink-0 grid-cols-2 gap-3 xl:grid-cols-4">
        {[
          { label: 'Overstay Alert', value: summary.total, icon: 'release_alert', tone: 'border-slate-200 bg-white text-slate-950' },
          { label: 'Sắp quá SLA', value: summary.warning, icon: 'timer', tone: 'border-amber-200 bg-amber-50 text-amber-800' },
          { label: 'Quá SLA', value: summary.overstay, icon: 'schedule', tone: 'border-rose-200 bg-rose-50 text-rose-800' },
          { label: 'Khẩn cấp', value: summary.critical, icon: 'warning', tone: 'border-red-200 bg-red-50 text-red-800' },
        ].map((item) => (
          <div key={item.label} className={`rounded-lg border p-4 shadow-sm ${item.tone}`}>
            <div className="flex items-center justify-between gap-3">
              <p className="text-[13px] font-bold">{item.label}</p>
              <span className="material-symbols-outlined text-[20px]">{item.icon}</span>
            </div>
            <p className="mt-3 font-data-tabular text-[30px] font-bold leading-none">{item.value}</p>
          </div>
        ))}
      </section>

      <section className="ops-panel-strong grid min-h-0 flex-1 grid-cols-1 overflow-hidden rounded-lg lg:grid-cols-[360px_minmax(0,1fr)]">
        <aside className="flex min-h-0 flex-col border-b border-slate-200 lg:border-b-0 lg:border-r">
          <div className="shrink-0 border-b border-slate-200 p-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h3 className="flex items-center gap-2 text-[16px] font-bold text-slate-950">
                  <span className="material-symbols-outlined text-[19px] text-[#0f6b7d]">warehouse</span>
                  Xe lưu bãi quá hạn
                </h3>
                <p className="mt-1 text-[12px] font-semibold text-slate-500">
                  Tự động tính thời gian đỗ tại Dock theo SLA
                </p>
              </div>
              <span className={`rounded-md border px-2 py-1 text-[11px] font-bold ${isApiConnected ? 'border-emerald-200 bg-emerald-50 text-emerald-800' : 'border-amber-200 bg-amber-50 text-amber-800'}`}>
                {isApiConnected ? 'API live' : 'Demo data'}
              </span>
            </div>

            <div className="mt-4 flex flex-wrap gap-2">
              {[
                { key: 'all' as const, label: 'Tất cả' },
                { key: 'WARNING' as const, label: 'Sắp quá SLA' },
                { key: 'OVERSTAY_MEDIUM' as const, label: 'Quá SLA' },
                { key: 'CRITICAL' as const, label: 'Khẩn cấp' },
              ].map((item) => (
                <button
                  key={item.key}
                  onClick={() => setLevelFilter(item.key)}
                  className={`rounded-md border px-2.5 py-1.5 text-[12px] font-bold transition-colors ${
                    levelFilter === item.key
                      ? 'border-[#0f6b7d] bg-cyan-50 text-cyan-900'
                      : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          <div className="min-h-0 flex-1 space-y-2 overflow-y-auto p-3">
            {filteredAlerts.length === 0 ? (
              <div className="flex h-44 flex-col items-center justify-center rounded-md border border-dashed border-slate-300 text-center">
                <span className="material-symbols-outlined mb-2 text-[34px] text-slate-300">check_circle</span>
                <p className="text-[13px] font-semibold text-slate-500">Không có Overstay Alert phù hợp.</p>
              </div>
            ) : (
              filteredAlerts.map((alert) => {
                const config = levelConfig[alert.alertLevel];
                const isSelected = selectedAlert?.alertId === alert.alertId;

                return (
                  <button
                    key={alert.alertId}
                    onClick={() => setSelectedAlertId(alert.alertId)}
                    className={`w-full rounded-md border p-3 text-left transition-colors ${
                      isSelected ? 'border-[#0f6b7d] bg-cyan-50' : `${config.panel} hover:bg-white`
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="font-data-tabular text-[14px] font-bold text-slate-950">{alert.licensePlate}</p>
                        <p className="mt-0.5 truncate text-[12px] font-semibold text-slate-600">
                          {alert.dockCode} • {alert.driverName || 'Chưa gán tài xế'}
                        </p>
                      </div>
                      <span className={`shrink-0 rounded border px-1.5 py-0.5 text-[10px] font-bold ${config.badge}`}>
                        {config.label}
                      </span>
                    </div>
                    <div className="mt-3 flex items-center justify-between gap-3">
                      <span className="text-[12px] font-bold text-slate-600">{getElapsedText(alert)}</span>
                      <span className="font-data-tabular text-[12px] font-bold text-slate-500">
                        {alert.actualMinutes}/{alert.slaMinutes}p
                      </span>
                    </div>
                    <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-white/70">
                      <div
                        className={`h-full rounded-full ${alert.alertLevel === 'CRITICAL' ? 'bg-red-600' : alert.overstayMinutes > 0 ? 'bg-rose-500' : 'bg-amber-500'}`}
                        style={{ width: `${getProgress(alert)}%` }}
                      />
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </aside>

        <main className="min-h-0 overflow-y-auto p-4">
          {selectedAlert ? (
            <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_320px]">
              <div className="space-y-4">
                <div className={`rounded-lg border p-5 ${levelConfig[selectedAlert.alertLevel].panel}`}>
                  <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <span className={`rounded-md border px-2 py-1 text-[12px] font-bold ${levelConfig[selectedAlert.alertLevel].badge}`}>
                          Overstay Alert
                        </span>
                        <span className="rounded-md border border-slate-200 bg-white px-2 py-1 text-[12px] font-bold text-slate-600">
                          {levelConfig[selectedAlert.alertLevel].label}
                        </span>
                      </div>
                      <h2 className="mt-3 text-[28px] font-bold leading-tight text-slate-950">
                        {selectedAlert.licensePlate} đang lưu tại {selectedAlert.dockCode}
                      </h2>
                      <p className="mt-2 max-w-3xl text-[14px] font-semibold leading-relaxed text-slate-600">
                        {selectedAlert.alertMessage}
                      </p>
                    </div>

                    <div className="rounded-lg border border-white/70 bg-white/80 p-4 text-right shadow-sm">
                      <p className="text-[12px] font-bold text-slate-500">Thời gian vượt SLA</p>
                      <p className={`mt-1 font-data-tabular text-[34px] font-bold leading-none ${selectedAlert.overstayMinutes > 0 ? 'text-rose-700' : 'text-amber-700'}`}>
                        {selectedAlert.overstayMinutes > 0 ? `+${selectedAlert.overstayMinutes}` : '0'}
                      </p>
                      <p className="mt-1 text-[12px] font-bold text-slate-500">phút</p>
                    </div>
                  </div>
                </div>

                <div className="grid gap-3 md:grid-cols-3">
                  {[
                    { label: 'SLA quy định', value: `${selectedAlert.slaMinutes} phút`, icon: 'rule' },
                    { label: 'Thời gian thực tế', value: `${selectedAlert.actualMinutes} phút`, icon: 'pace' },
                    { label: 'Trạng thái Dock', value: selectedAlert.currentStatus, icon: 'dock' },
                  ].map((item) => (
                    <div key={item.label} className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
                      <div className="flex items-center justify-between">
                        <p className="text-[12px] font-bold text-slate-500">{item.label}</p>
                        <span className="material-symbols-outlined text-[18px] text-[#0f6b7d]">{item.icon}</span>
                      </div>
                      <p className="mt-2 font-data-tabular text-[20px] font-bold text-slate-950">{item.value}</p>
                    </div>
                  ))}
                </div>

                <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                    <h3 className="text-[15px] font-bold text-slate-950">Tiến độ SLA tại Dock</h3>
                    <span className="font-data-tabular text-[12px] font-bold text-slate-500">{getProgress(selectedAlert)}%</span>
                  </div>
                  <div className="mt-4 h-3 overflow-hidden rounded-full bg-slate-100">
                    <div
                      className={`h-full rounded-full ${selectedAlert.alertLevel === 'CRITICAL' ? 'bg-red-600' : selectedAlert.overstayMinutes > 0 ? 'bg-rose-500' : 'bg-amber-500'}`}
                      style={{ width: `${getProgress(selectedAlert)}%` }}
                    />
                  </div>
                  <div className="mt-4 grid gap-3 md:grid-cols-2">
                    <div className="rounded-md border border-slate-200 bg-slate-50 p-3">
                      <p className="text-[12px] font-bold text-slate-500">Booking</p>
                      <p className="mt-1 font-data-tabular text-[14px] font-bold text-slate-950">{selectedAlert.bookingCode || 'Chưa có booking'}</p>
                    </div>
                    <div className="rounded-md border border-slate-200 bg-slate-50 p-3">
                      <p className="text-[12px] font-bold text-slate-500">Khách hàng</p>
                      <p className="mt-1 text-[14px] font-bold text-slate-950">{selectedAlert.customerName || 'N/A'}</p>
                    </div>
                  </div>
                </div>
              </div>

              <aside className="space-y-4">
                <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
                  <h3 className="text-[15px] font-bold text-slate-950">Thông tin điều phối</h3>
                  <dl className="mt-4 space-y-3 text-[13px]">
                    <div className="flex justify-between gap-3">
                      <dt className="font-semibold text-slate-500">Tài xế</dt>
                      <dd className="text-right font-bold text-slate-950">{selectedAlert.driverName || 'Chưa gán'}</dd>
                    </div>
                    <div className="flex justify-between gap-3">
                      <dt className="font-semibold text-slate-500">Dock</dt>
                      <dd className="text-right font-bold text-slate-950">{selectedAlert.dockName || selectedAlert.dockCode}</dd>
                    </div>
                    <div className="flex justify-between gap-3">
                      <dt className="font-semibold text-slate-500">Dịch vụ</dt>
                      <dd className="text-right font-bold text-slate-950">{selectedAlert.serviceType}</dd>
                    </div>
                    <div className="flex justify-between gap-3">
                      <dt className="font-semibold text-slate-500">Loại hàng</dt>
                      <dd className="text-right font-bold text-slate-950">{selectedAlert.cargoType || 'N/A'}</dd>
                    </div>
                  </dl>
                </div>

                <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
                  <h3 className="text-[15px] font-bold text-slate-950">Hành động nhanh</h3>
                  <div className="mt-4 space-y-2">
                    <button
                      onClick={() => handleMarkResolving(selectedAlert)}
                      className="flex w-full items-center justify-center gap-2 rounded-md bg-[#0f3554] px-3 py-2.5 text-[13px] font-bold text-white transition-colors hover:bg-[#16496f]"
                    >
                      <span className="material-symbols-outlined text-[17px]">engineering</span>
                      Bắt đầu xử lý
                    </button>
                    <button
                      onClick={() => setActiveTab('Assign Driver')}
                      className="flex w-full items-center justify-center gap-2 rounded-md border border-cyan-200 bg-cyan-50 px-3 py-2.5 text-[13px] font-bold text-cyan-900 transition-colors hover:bg-cyan-100"
                    >
                      <span className="material-symbols-outlined text-[17px]">assignment_ind</span>
                      Điều phối Dock
                    </button>
                    <button
                      onClick={() => handleResolveAlert(selectedAlert)}
                      className="flex w-full items-center justify-center gap-2 rounded-md border border-emerald-200 bg-emerald-50 px-3 py-2.5 text-[13px] font-bold text-emerald-800 transition-colors hover:bg-emerald-100"
                    >
                      <span className="material-symbols-outlined text-[17px]">check_circle</span>
                      Xác nhận đã xử lý
                    </button>
                  </div>
                </div>

                <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
                  <div className="flex items-center justify-between">
                    <p className="text-[12px] font-bold text-slate-500">Tự động làm mới</p>
                    <span className="font-data-tabular text-[12px] font-bold text-[#0f6b7d]">30s</span>
                  </div>
                  <button
                    onClick={loadOverstayAlerts}
                    className="mt-3 flex w-full items-center justify-center gap-2 rounded-md border border-slate-300 bg-white px-3 py-2 text-[13px] font-bold text-slate-700 hover:bg-slate-50"
                  >
                    <span className={`material-symbols-outlined text-[17px] ${isLoading ? 'animate-spin' : ''}`}>sync</span>
                    Tải lại cảnh báo
                  </button>
                </div>
              </aside>
            </div>
          ) : (
            <div className="flex h-full min-h-[420px] flex-col items-center justify-center text-center">
              <span className="material-symbols-outlined mb-3 text-[42px] text-slate-300">task_alt</span>
              <p className="text-[15px] font-bold text-slate-700">Không có Overstay Alert đang hoạt động.</p>
            </div>
          )}
        </main>
      </section>
    </div>
  );
};

export default AlertsTab;
