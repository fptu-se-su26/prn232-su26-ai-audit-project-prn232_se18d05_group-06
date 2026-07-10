import React, { useState, useEffect } from 'react';
import AdminSidebar from '@components/AdminSidebar';
import { MaintenanceModal } from './MaintenanceModal';
import { InspectionModal } from './InspectionModal';
import { MaintenanceAnalytics } from './MaintenanceAnalytics';
import {
  getDashboardData,
  createMaintenanceSchedule,
  createInspectionRecord,
  getMaintenanceSchedules,
  getInspectionRecords,
  updateMaintenanceSchedule,
  deleteMaintenanceSchedule,
  type DashboardData,
  type DashboardVehicle,
  type DashboardDriver,
  type MaintenanceScheduleItem,
  type InspectionRecordItem,
} from '@lib/fleetApi';

// ─── Helpers ──────────────────────────────────────────────────────────────────

const getVehicleStatusClass = (vehicle: DashboardVehicle) => {
  if (vehicle.isBlacklisted) return 'text-error';
  if (vehicle.status === 'NEEDS_REPAIR') return 'text-error';
  switch (vehicle.status?.toUpperCase()) {
    case 'ACTIVE':
    case 'AVAILABLE': return 'text-tertiary';
    default: return 'text-on-surface-variant';
  }
};

const getVehicleStatusLabel = (vehicle: DashboardVehicle) => {
  if (vehicle.isBlacklisted) return 'Blacklisted';
  if (vehicle.status === 'NEEDS_REPAIR') return 'Needs Repair';
  switch (vehicle.status?.toUpperCase()) {
    case 'ACTIVE':
    case 'AVAILABLE': return 'Active';
    case 'PENDING': return 'Needs Approval';
    case 'INACTIVE': return 'Inactive';
    default: return vehicle.status ?? 'Unknown';
  }
};

const getDotColor = (vehicle: DashboardVehicle) => {
  if (vehicle.isBlacklisted) return 'bg-error shadow-[0_0_8px_rgba(186,26,26,0.6)] animate-pulse';
  if (vehicle.status === 'NEEDS_REPAIR') return 'bg-error shadow-[0_0_8px_rgba(186,26,26,0.6)] animate-pulse';
  switch (vehicle.status?.toUpperCase()) {
    case 'ACTIVE':
    case 'AVAILABLE': return 'bg-primary shadow-[0_0_8px_rgba(0,74,198,0.6)]';
    default: return 'bg-outline shadow-sm';
  }
};

const getDaysUntil = (dateStr?: string): string => {
  if (!dateStr) return 'N/A';
  const days = Math.ceil((new Date(dateStr).getTime() - Date.now()) / 86400000);
  if (days < 0) return 'Expired';
  if (days === 0) return 'Today';
  return `${days}d remaining`;
};

const getDriverAlerts = (driver: DashboardDriver): { icon: string; color: string; text: string }[] => {
  const alerts: { icon: string; color: string; text: string }[] = [];
  
  if (driver.isBlacklisted) {
    alerts.push({ icon: 'block', color: 'text-error', text: 'Blacklisted' });
  }
  
  if (!driver.isActive) {
    alerts.push({ icon: 'person_off', color: 'text-outline', text: 'Inactive' });
  }
  
  if (driver.licenseExpiry) {
    const days = Math.ceil((new Date(driver.licenseExpiry).getTime() - Date.now()) / 86400000);
    if (days < 0) {
      alerts.push({ icon: 'error', color: 'text-error', text: 'License Expired' });
    } else if (days <= 30) {
      alerts.push({ icon: 'warning', color: 'text-orange-500', text: `License Expiring (${days}d)` });
    }
  }
  
  return alerts;
};

const glassStyle = {
  background: 'rgba(255, 255, 255, 0.7)',
  backdropFilter: 'blur(12px)',
  borderTop: '1px solid rgba(255, 255, 255, 0.3)',
  borderLeft: '1px solid rgba(255, 255, 255, 0.2)',
  boxShadow: '0 10px 30px rgba(0, 0, 0, 0.04)',
  borderRadius: '18px',
};

// ─── Component ─────────────────────────────────────────────────────────────────

const AdminFleetMap: React.FC = () => {
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [isMaintenanceModalOpen, setMaintenanceModalOpen] = useState(false);
  const [isInspectionModalOpen, setInspectionModalOpen] = useState(false);
  const [isSchedulesModalOpen, setSchedulesModalOpen] = useState(false);
  const [isInspectionsModalOpen, setInspectionsModalOpen] = useState(false);
  const [selectedVehicle, setSelectedVehicle] = useState<DashboardVehicle | null>(null);
  const [maintenanceSchedules, setMaintenanceSchedules] = useState<MaintenanceScheduleItem[]>([]);
  const [inspectionRecords, setInspectionRecords] = useState<InspectionRecordItem[]>([]);
  const [activeTab, setActiveTab] = useState<'map' | 'analytics'>('map');

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const data = await getDashboardData();
        setDashboardData(data);
      } catch (err) {
        console.error('Failed to load dashboard data:', err);
        setError('Không thể tải dữ liệu dashboard. Vui lòng thử lại.');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const openMaintenance = (vehicle: DashboardVehicle) => {
    setSelectedVehicle(vehicle);
    setMaintenanceModalOpen(true);
  };

  const openInspection = (vehicle: DashboardVehicle) => {
    setSelectedVehicle(vehicle);
    setInspectionModalOpen(true);
  };

  const openInspections = async (vehicle: DashboardVehicle) => {
    setSelectedVehicle(vehicle);
    try {
      const records = await getInspectionRecords(vehicle.vehicleId);
      setInspectionRecords(records);
      setInspectionsModalOpen(true);
    } catch (err) {
      console.error('Failed to load inspection records:', err);
    }
  };

  const openSchedules = async (vehicle: DashboardVehicle) => {
    setSelectedVehicle(vehicle);
    try {
      const schedules = await getMaintenanceSchedules(vehicle.vehicleId);
      setMaintenanceSchedules(schedules);
      setSchedulesModalOpen(true);
    } catch (err) {
      console.error('Failed to load maintenance schedules:', err);
    }
  };

  const handleMarkCompleted = async (scheduleId: number) => {
    try {
      await updateMaintenanceSchedule(scheduleId, { status: 'COMPLETED' });
      if (selectedVehicle) {
        const schedules = await getMaintenanceSchedules(selectedVehicle.vehicleId);
        setMaintenanceSchedules(schedules);
      }
    } catch (err) {
      console.error('Failed to mark schedule as completed:', err);
    }
  };

  const handleDeleteSchedule = async (scheduleId: number) => {
    try {
      await deleteMaintenanceSchedule(scheduleId);
      if (selectedVehicle) {
        const schedules = await getMaintenanceSchedules(selectedVehicle.vehicleId);
        setMaintenanceSchedules(schedules);
      }
    } catch (err) {
      console.error('Failed to delete schedule:', err);
    }
  };

  const handleMaintenanceSubmit = async (data: { type: string; dueDate: string; notes: string }) => {
    if (!selectedVehicle) return;
    try {
      await createMaintenanceSchedule({ vehicleId: selectedVehicle.vehicleId, ...data });
      // Reload dashboard data to update KPIs
      const dashboard = await getDashboardData();
      setDashboardData(dashboard);
      // Reload maintenance schedules if modal is open
      if (isSchedulesModalOpen) {
        const schedules = await getMaintenanceSchedules(selectedVehicle.vehicleId);
        setMaintenanceSchedules(schedules);
      }
    } catch (err) {
      console.error('Failed to create maintenance schedule:', err);
    }
  };

  const handleInspectionSubmit = async (formData: FormData) => {
    if (!selectedVehicle) return;
    formData.append('VehicleId', String(selectedVehicle.vehicleId));
    try {
      await createInspectionRecord(formData);
      // Reload dashboard data to update KPIs
      const data = await getDashboardData();
      setDashboardData(data);
      // Reload inspection records if modal is open
      if (isInspectionsModalOpen) {
        const records = await getInspectionRecords(selectedVehicle.vehicleId);
        setInspectionRecords(records);
      }
    } catch (err) {
      console.error('Failed to create inspection record:', err);
    }
  };

  // ─── KPI cards from live data ───────────────────────────────────────────────
  const kpiCards = dashboardData ? [
    {
      title: 'Active Vehicles',
      value: String(dashboardData.kpi.totalActiveVehicles),
      valueClass: 'text-on-surface',
      icon: 'directions_car',
      iconColorClass: 'text-primary',
      trendIcon: 'trending_up',
      trendText: 'Total in fleet',
      trendClass: 'text-tertiary',
    },
    {
      title: 'Maintenance Alerts',
      value: String(dashboardData.kpi.maintenanceAlerts),
      valueClass: dashboardData.kpi.maintenanceAlerts > 0 ? 'text-error' : 'text-on-surface',
      icon: 'build',
      iconColorClass: dashboardData.kpi.maintenanceAlerts > 0 ? 'text-error' : 'text-tertiary',
      trendIcon: null,
      trendText: dashboardData.kpi.maintenanceAlerts > 0 ? 'Requires immediate attention' : 'All clear',
      trendClass: 'text-on-surface-variant',
    },
    {
      title: 'Fuel Efficiency',
      value: String(dashboardData.kpi.fuelEfficiency),
      valueSuffix: ' L/km',
      valueClass: 'text-on-surface',
      icon: 'local_gas_station',
      iconColorClass: 'text-tertiary',
      trendIcon: 'trending_down',
      trendText: 'Fleet average',
      trendClass: 'text-tertiary',
    },
    {
      title: 'Expiring Inspections',
      value: String(dashboardData.kpi.expiringInspections),
      valueClass: dashboardData.kpi.expiringInspections > 0 ? 'text-error' : 'text-on-surface',
      icon: 'fact_check',
      iconColorClass: dashboardData.kpi.expiringInspections > 0 ? 'text-error' : 'text-tertiary',
      trendIcon: dashboardData.kpi.expiringInspections > 0 ? 'warning' : null,
      trendText: 'Due within 30 days',
      trendClass: dashboardData.kpi.expiringInspections > 0 ? 'text-error' : 'text-on-surface-variant',
    },
  ] : [];

  const notificationCount = dashboardData
    ? dashboardData.kpi.maintenanceAlerts + dashboardData.kpi.expiringInspections
    : 0;

  return (
    <div className="text-on-surface antialiased min-h-screen flex font-body-md" style={{ backgroundColor: '#faf8ff', backgroundImage: 'radial-gradient(circle at 100% 0%, #dde2f8 0%, transparent 40%), radial-gradient(circle at 0% 100%, #00788c 0%, transparent 30%)', backgroundAttachment: 'fixed' }}>
      <AdminSidebar />

      <main className="flex-1 md:ml-[280px] w-full max-w-[1600px] mx-auto min-h-screen pb-20 md:pb-8">
        {/* Header */}
        <header className="flex justify-between items-center w-full h-[72px] px-8 max-w-[1600px] ml-auto bg-surface/70 backdrop-blur-md docked full-width top-0 sticky shadow-sm z-40 bg-transparent">
          <div className="flex items-center gap-8">
            <h2 className="font-headline-sm text-headline-sm font-bold text-on-surface">Admin Dashboard</h2>
            <div className="relative hidden lg:block">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline">search</span>
              <input className="h-[48px] pl-10 pr-4 w-[300px] bg-black/5 rounded-[18px] border-none focus:ring-2 focus:ring-primary transition-all font-body-sm text-body-sm" placeholder="Search vehicles, drivers..." type="text" />
            </div>
          </div>
          <nav className="hidden md:flex gap-6">
            <button onClick={() => setActiveTab('map')} className={`font-body-md text-body-md rounded-lg transition-all px-3 py-2 ${activeTab === 'map' ? 'bg-primary/10 text-primary font-bold' : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container-low'}`}>
              Realtime Map
            </button>
            <button onClick={() => setActiveTab('analytics')} className={`font-body-md text-body-md rounded-lg transition-all px-3 py-2 ${activeTab === 'analytics' ? 'bg-primary/10 text-primary font-bold' : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container-low'}`}>
              Analytics
            </button>
            <a className="text-on-surface-variant hover:text-on-surface transition-colors font-body-md text-body-md hover:bg-surface-container-low rounded-lg transition-all px-3 py-2" href="#">Reports</a>
            <a className="text-on-surface-variant hover:text-on-surface transition-colors font-body-md text-body-md hover:bg-surface-container-low rounded-lg transition-all px-3 py-2" href="#">Logs</a>
          </nav>
          <div className="flex items-center gap-4">
            <div className="relative">
              <button className="material-symbols-outlined text-on-surface-variant hover:text-primary transition-colors p-2 rounded-full hover:bg-surface-container-low">notifications</button>
              {notificationCount > 0 && (
                <span className="absolute top-1 right-1 w-4 h-4 bg-error text-white font-label-md text-[9px] flex items-center justify-center rounded-full border border-white shadow-sm">
                  {notificationCount > 9 ? '9+' : notificationCount}
                </span>
              )}
            </div>
            <button className="material-symbols-outlined text-on-surface-variant hover:text-primary transition-colors p-2 rounded-full hover:bg-surface-container-low">apps</button>
            <button className="text-white px-5 py-2 font-headline-sm text-[14px] leading-tight hover:opacity-90 transition-opacity rounded-[18px]" style={{ background: 'linear-gradient(135deg, #004ac6 0%, #2563eb 100%)' }}>New Shipment</button>
            <img alt="User profile" className="w-10 h-10 rounded-full ml-2 border border-outline-variant" src="https://lh3.googleusercontent.com/aida-public/AB6AXuCEdcB28cA_OB2wpbQyTDMLE3hQrvYQAJsInCoQFbKRSK1P7l2xTZ5lvKjvEQmyEnf_yZnzcUvSpoS5n6DcdNeSC8hDdLgDTHnDXgiw5VEDoc4S2ShK7Ckm22q6x2ACFu_jtwX7w-0rAKL482gu1ewCoPt3KwS7B3jo7GcPVLL2LKvrf4BAE5jRBNwqGRLBM_Hcg9VQtZgU69_k5cYpnW25y3TPSmvUZZWqmIMme_X_Ssi1HZ48CJGXhGt2uLuWXCM22yTrXAYkIObr" />
          </div>
        </header>

        {/* Loading / Error states */}
        {loading && (
          <div className="flex items-center justify-center h-[60vh]">
            <div className="flex flex-col items-center gap-4">
              <div className="w-12 h-12 border-4 border-primary/30 border-t-primary rounded-full animate-spin"></div>
              <span className="text-on-surface-variant font-body-md">Đang tải dữ liệu...</span>
            </div>
          </div>
        )}

        {error && !loading && (
          <div className="p-8">
            <div className="glass-card p-6 border-l-4 border-error flex items-start gap-4" style={glassStyle}>
              <span className="material-symbols-outlined text-error text-2xl">error</span>
              <div>
                <div className="font-title-md font-semibold text-error">Lỗi tải dữ liệu</div>
                <div className="text-on-surface-variant font-body-sm mt-1">{error}</div>
                <button onClick={() => window.location.reload()} className="mt-3 text-primary font-label-md hover:underline">Thử lại</button>
              </div>
            </div>
          </div>
        )}

        {!loading && !error && dashboardData && (
          <div className="p-container-padding space-y-gutter">

            {/* KPI Cards */}
            <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-gutter">
              {kpiCards.map((kpi, index) => (
                <div key={index} className="glass-card p-6 flex flex-col justify-between h-[160px]" style={glassStyle}>
                  <div className="flex justify-between items-start">
                    <div className="font-body-sm text-body-sm text-on-surface-variant">{kpi.title}</div>
                    <span className={`material-symbols-outlined ${kpi.iconColorClass}`} style={{ fontVariationSettings: "'FILL' 1" }}>{kpi.icon}</span>
                  </div>
                  <div>
                    <div className={`font-display-lg text-display-lg ${kpi.valueClass}`}>
                      {kpi.value} {'valueSuffix' in kpi && kpi.valueSuffix && <span className="text-[24px] text-on-surface-variant font-normal">{kpi.valueSuffix}</span>}
                    </div>
                    <div className={`font-label-md text-label-md flex items-center gap-1 mt-1 ${kpi.trendClass}`}>
                      {kpi.trendIcon && <span className="material-symbols-outlined text-[16px]">{kpi.trendIcon}</span>}
                      {kpi.trendText}
                    </div>
                  </div>
                </div>
              ))}

              {/* AI Insight Card */}
              <div className="glass-card p-6 flex flex-col justify-between h-[160px] relative overflow-hidden" style={glassStyle}>
                <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-2xl -mr-10 -mt-10"></div>
                <div className="flex justify-between items-start relative z-10">
                  <div className="font-body-sm text-body-sm text-on-surface-variant">Maintenance Predictions</div>
                  <span className="text-white font-label-md text-[10px] px-2 py-1 rounded-full uppercase tracking-wider" style={{ background: 'linear-gradient(135deg, #005e6e 0%, #4cd7f6 100%)' }}>AI Insight</span>
                </div>
                <div className="relative z-10 mt-2">
                  {dashboardData.kpi.maintenanceAlerts > 0 ? (
                    <div className="font-label-md text-label-md text-on-surface flex items-start gap-2">
                      <span className="material-symbols-outlined text-error text-[18px]">warning</span>
                      <span><strong>{dashboardData.kpi.maintenanceAlerts}</strong> xe cần bảo trì trong 7 ngày tới.</span>
                    </div>
                  ) : (
                    <div className="font-label-md text-label-md text-on-surface flex items-start gap-2">
                      <span className="material-symbols-outlined text-tertiary text-[18px]">check_circle</span>
                      <span>Tất cả xe trong tình trạng tốt.</span>
                    </div>
                  )}
                  {dashboardData.kpi.expiringInspections > 0 && (
                    <div className="font-label-md text-label-md text-on-surface flex items-start gap-2 mt-1">
                      <span className="material-symbols-outlined text-orange-500 text-[18px]">info</span>
                      <span><strong>{dashboardData.kpi.expiringInspections}</strong> xe sắp hết hạn đăng kiểm.</span>
                    </div>
                  )}
                </div>
              </div>
            </section>

            {activeTab === 'analytics' ? (
              <MaintenanceAnalytics />
            ) : (
              <>
                {/* Map & Vehicle Details */}
                <section className="grid grid-cols-1 xl:grid-cols-3 gap-gutter h-auto min-h-[500px]">
                  {/* Map */}
                  <div className="glass-card xl:col-span-2 overflow-hidden flex flex-col relative" style={glassStyle}>
                    <div className="p-4 border-b border-outline-variant/30 flex justify-between items-center bg-white/50 z-10">
                      <h3 className="font-headline-sm text-headline-sm font-semibold flex items-center gap-2">
                        <span className="material-symbols-outlined text-primary">my_location</span> Realtime Fleet Map
                      </h3>
                      <div className="flex gap-2">
                        <button className="px-3 py-1 bg-white rounded-md border border-outline-variant font-label-md text-label-md hover:bg-surface-container-low transition-colors">All</button>
                        <button className="px-3 py-1 bg-transparent rounded-md border border-transparent font-label-md text-label-md text-on-surface-variant hover:bg-white/50 transition-colors">Active</button>
                        <button className="px-3 py-1 bg-transparent rounded-md border border-transparent font-label-md text-label-md text-on-surface-variant hover:bg-white/50 transition-colors">Maintenance</button>
                      </div>
                    </div>
                    <div className="flex-1 w-full h-[400px] xl:h-auto relative bg-[#e5e9ea] overflow-hidden">
                      <img alt="Stylized map view" className="absolute inset-0 w-full h-full object-cover opacity-60 mix-blend-multiply" src="https://lh3.googleusercontent.com/aida-public/AB6AXuCsqm8FqrAvow77V5xbPJIAKUvHfquyvjeOPKuaXEQPVgYWQQXGyNa-4pBuTyTsvgzP3jDgu6iz2rHBvmzn8kgUjn4YHfPoZLCUOvnYaP2WVz1rLFQN4LXwXXxGelC8iVJB8mVaGq-o9w5eFrql8eIbA5fggE2rLs8N8g-_I-z0zaaCYp30mJJdqH8vJSbSw_yKh6siqEW8hzGu_0u_uH0YOqs8A8ZdDLhfcABrXJRf7DgCnPS4VNE0AJnnl1cJGOFvIoWDj9qRkMOP" />
                      {/* Dynamic pins from real vehicles */}
                      {dashboardData.priorityVehicles.slice(0, 3).map((v, i) => {
                        const positions = [
                          { top: '30%', left: '40%' },
                          { top: '60%', left: '65%' },
                          { top: '20%', left: '70%' },
                        ];
                        const pos = positions[i];
                        const dotClass = v.isBlacklisted
                          ? 'bg-error'
                          : v.status === 'ACTIVE' || v.status === 'AVAILABLE'
                          ? 'bg-primary'
                          : 'bg-outline';
                        const ringClass = v.isBlacklisted ? 'bg-error/20' : 'bg-primary/20';
                        return (
                          <div key={v.vehicleId} className="absolute flex flex-col items-center" style={{ top: pos.top, left: pos.left }}>
                            <div className={`w-8 h-8 ${ringClass} rounded-full flex items-center justify-center`}>
                              <div className={`w-4 h-4 ${dotClass} rounded-full border-2 border-white shadow-lg`}></div>
                            </div>
                            <div className="mt-1 bg-white/90 backdrop-blur-sm px-2 py-1 rounded shadow-sm font-label-md text-[10px] text-on-surface font-bold">{v.truckPlate}</div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Priority Vehicles */}
                  <div className="flex flex-col gap-4 overflow-y-auto max-h-[500px] pr-2 custom-scrollbar">
                    <h3 className="font-headline-sm text-headline-sm font-semibold mb-2">Priority Vehicles</h3>
                    {dashboardData.priorityVehicles.length === 0 && (
                      <div className="text-center py-6 text-on-surface-variant font-body-md">Không có xe nào.</div>
                    )}
                    {dashboardData.priorityVehicles.map((vehicle) => (
                      <div key={vehicle.vehicleId} className={`glass-card p-5 cursor-pointer ${vehicle.isBlacklisted ? 'border-error/30 bg-error/5' : 'hover:border-primary/50'} transition-colors`} style={glassStyle}>
                        <div className="flex justify-between items-start mb-3">
                          <div>
                            <h4 className="font-headline-sm text-headline-sm text-on-surface font-bold">{vehicle.truckPlate}</h4>
                            <span className="font-label-md text-label-md text-on-surface-variant">{vehicle.vehicleType ?? 'N/A'}</span>
                          </div>
                          <div className={`w-2 h-2 rounded-full mt-2 ${getDotColor(vehicle)}`}></div>
                        </div>
                        <div className="grid grid-cols-2 gap-3 mt-4">
                          <div>
                            <div className="font-label-md text-[10px] text-on-surface-variant uppercase">Status</div>
                            <div className={`font-body-sm text-body-sm font-medium ${getVehicleStatusClass(vehicle)}`}>{getVehicleStatusLabel(vehicle)}</div>
                          </div>
                          <div>
                            <div className="font-label-md text-[10px] text-on-surface-variant uppercase">Driver</div>
                            <div className="font-body-sm text-body-sm font-medium">{vehicle.driverName ?? 'Unassigned'}</div>
                          </div>
                          <div>
                            <div className="font-label-md text-[10px] text-on-surface-variant uppercase">Inspection</div>
                            <div
                              className="font-body-sm text-body-sm font-medium text-primary cursor-pointer hover:underline"
                              onClick={() => openInspection(vehicle)}
                            >
                              {getDaysUntil(vehicle.inspectionExpiry)}
                            </div>
                          </div>
                          <div>
                            <div className="font-label-md text-[10px] text-on-surface-variant uppercase">Next Service</div>
                            <div className="font-body-sm text-body-sm font-medium">{getDaysUntil(vehicle.nextServiceDate)}</div>
                          </div>
                        </div>

                        {/* Maintenance Button */}
                        <div className="mt-4 pt-3 border-t border-outline-variant/20 flex gap-2">
                          <button
                            onClick={() => openSchedules(vehicle)}
                            className="flex-1 py-1.5 bg-primary/10 text-primary rounded-lg font-label-md text-[11px] hover:bg-primary/20 transition-colors flex items-center justify-center gap-1"
                          >
                            <span className="material-symbols-outlined text-[14px]">history</span>
                            Lịch bảo trì
                          </button>
                          <button
                            onClick={() => openMaintenance(vehicle)}
                            className="flex-1 py-1.5 bg-tertiary/10 text-tertiary rounded-lg font-label-md text-[11px] hover:bg-tertiary/20 transition-colors flex items-center justify-center gap-1"
                          >
                            <span className="material-symbols-outlined text-[14px]">add</span>
                            Thêm lịch
                          </button>
                          <button
                            onClick={() => openInspections(vehicle)}
                            className="flex-1 py-1.5 bg-orange-500/10 text-orange-500 rounded-lg font-label-md text-[11px] hover:bg-orange-500/20 transition-colors flex items-center justify-center gap-1"
                          >
                            <span className="material-symbols-outlined text-[14px]">history</span>
                            Lịch đăng kiểm
                          </button>
                          <button
                            onClick={() => openInspection(vehicle)}
                            className="flex-1 py-1.5 bg-primary/10 text-primary rounded-lg font-label-md text-[11px] hover:bg-primary/20 transition-colors flex items-center justify-center gap-1"
                          >
                            <span className="material-symbols-outlined text-[14px]">add</span>
                            Thêm mới
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </section>

                {/* Driver Roster */}
                <section className="glass-card overflow-hidden" style={glassStyle}>
                  <div className="p-6 border-b border-outline-variant/30 flex justify-between items-center">
                    <h3 className="font-headline-sm text-headline-sm font-semibold">Driver Roster</h3>
                    <button className="text-primary font-label-md text-label-md hover:underline flex items-center gap-1">View All <span className="material-symbols-outlined text-[16px]">arrow_forward</span></button>
                  </div>
                  <div className="w-full overflow-x-auto">
                    <div className="min-w-[900px] p-4 flex flex-col gap-3">
                      <div className="grid grid-cols-6 px-4 py-2 font-label-md text-label-md text-on-surface-variant uppercase tracking-wider">
                        <div className="col-span-2">Driver</div>
                        <div>License</div>
                        <div>License Expiry</div>
                        <div>Status</div>
                        <div>Alerts</div>
                      </div>
                      {dashboardData.drivers.map((driver) => {
                        const expiryDays = driver.licenseExpiry
                          ? Math.ceil((new Date(driver.licenseExpiry).getTime() - Date.now()) / 86400000)
                          : null;
                        const isExpiring = expiryDays !== null && expiryDays <= 30;
                        const alerts = getDriverAlerts(driver);
                        return (
                          <div key={driver.driverId} className="grid grid-cols-6 items-center px-4 py-3 bg-white/40 rounded-xl transition-all duration-300 border border-transparent hover:-translate-y-[2px] hover:shadow-[0_8px_24px_rgba(0,0,0,0.06)] hover:bg-white/90">
                            <div className="col-span-2 flex items-center gap-3">
                              <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center font-bold text-primary text-sm">
                                {driver.fullName.charAt(0)}
                              </div>
                              <div>
                                <div className="font-body-md text-body-md font-semibold text-on-surface">{driver.fullName}</div>
                                <div className="font-label-md text-label-md text-on-surface-variant">ID: {driver.driverCode}</div>
                              </div>
                            </div>
                            <div className="font-body-sm text-body-sm">{driver.licenseNo ?? 'N/A'}</div>
                            <div>
                              <span className={`px-2 py-1 rounded font-label-md text-[11px] border ${isExpiring ? 'bg-error/10 text-error border-error/20' : 'bg-tertiary/10 text-tertiary border-tertiary/20'}`}>
                                {driver.licenseExpiry
                                  ? isExpiring ? `Expiring (${expiryDays}d)` : new Date(driver.licenseExpiry).toLocaleDateString('vi-VN')
                                  : 'N/A'}
                              </span>
                            </div>
                            <div className="flex items-center gap-2">
                              <div className={`w-2 h-2 rounded-full ${driver.isBlacklisted ? 'bg-error animate-pulse' : driver.isActive ? 'bg-primary shadow-[0_0_8px_rgba(0,74,198,0.4)]' : 'bg-outline'}`}></div>
                              <span className="font-body-sm text-body-sm text-on-surface">
                                {driver.isBlacklisted ? 'Blacklisted' : driver.isActive ? 'Active' : 'Inactive'}
                              </span>
                            </div>
                            <div className="flex gap-1">
                              {alerts.length === 0 ? (
                                <span className="text-on-surface-variant text-xs">-</span>
                              ) : (
                                alerts.map((alert, idx) => (
                                  <span
                                    key={idx}
                                    className={`material-symbols-outlined text-[16px] ${alert.color}`}
                                    title={alert.text}
                                  >
                                    {alert.icon}
                                  </span>
                                ))
                              )}
                            </div>
                          </div>
                        );
                      })}
                      {dashboardData.drivers.length === 0 && (
                        <div className="text-center py-6 text-on-surface-variant font-body-md">Không có tài xế nào.</div>
                      )}
                    </div>
                  </div>
                </section>
              </>
            )}
          </div>
        )}
      </main>

      <MaintenanceModal
        isOpen={isMaintenanceModalOpen}
        onClose={() => setMaintenanceModalOpen(false)}
        vehicleId={selectedVehicle?.truckPlate ?? ''}
        onSubmit={handleMaintenanceSubmit}
      />
      <InspectionModal
        isOpen={isInspectionModalOpen}
        onClose={() => setInspectionModalOpen(false)}
        vehicleId={selectedVehicle?.truckPlate ?? ''}
        onSubmit={handleInspectionSubmit}
      />
      
      {/* Maintenance Schedules Modal */}
      {isSchedulesModalOpen && selectedVehicle && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="bg-surface/90 backdrop-blur-xl border border-white/40 shadow-2xl rounded-2xl w-full max-w-2xl max-h-[80vh] overflow-hidden relative">
            <div className="p-6 border-b border-outline-variant/30 flex justify-between items-center bg-white/50">
              <h2 className="font-headline-sm text-headline-sm font-bold flex items-center gap-2">
                <span className="material-symbols-outlined text-primary">history</span>
                Lịch bảo trì - {selectedVehicle.truckPlate}
              </h2>
              <button 
                onClick={() => setSchedulesModalOpen(false)}
                className="material-symbols-outlined text-on-surface-variant hover:text-error transition-colors p-1 rounded-full hover:bg-error/10"
              >
                close
              </button>
            </div>

            <div className="p-6 overflow-y-auto max-h-[60vh] custom-scrollbar">
              {maintenanceSchedules.length === 0 ? (
                <div className="text-center py-8 text-on-surface-variant font-body-md">
                  Không có lịch bảo trì nào.
                </div>
              ) : (
                <div className="space-y-3">
                  {maintenanceSchedules.map((schedule) => (
                    <div key={schedule.id} className="bg-white/40 rounded-xl p-4 border border-outline-variant/20">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase ${
                            schedule.status === 'COMPLETED' ? 'bg-tertiary/10 text-tertiary' :
                            schedule.status === 'OVERDUE' ? 'bg-error/10 text-error' :
                            'bg-primary/10 text-primary'
                          }`}>
                            {schedule.status}
                          </span>
                          <h4 className="font-body-md text-body-md font-semibold text-on-surface mt-1">{schedule.type}</h4>
                        </div>
                        <div className="flex gap-2">
                          {schedule.status === 'PENDING' && (
                            <button
                              onClick={() => handleMarkCompleted(schedule.id)}
                              className="text-tertiary hover:text-primary transition-colors p-1"
                              title="Mark as completed"
                            >
                              <span className="material-symbols-outlined text-[18px]">check_circle</span>
                            </button>
                          )}
                          <button
                            onClick={() => handleDeleteSchedule(schedule.id)}
                            className="text-on-surface-variant hover:text-error transition-colors p-1"
                            title="Delete"
                          >
                            <span className="material-symbols-outlined text-[18px]">delete</span>
                          </button>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div>
                          <span className="text-on-surface-variant">Due Date:</span>
                          <span className="ml-2 font-medium">{new Date(schedule.dueDate).toLocaleDateString('vi-VN')}</span>
                        </div>
                        <div>
                          <span className="text-on-surface-variant">Days remaining:</span>
                          <span className="ml-2 font-medium">{getDaysUntil(schedule.dueDate)}</span>
                        </div>
                      </div>
                      {schedule.notes && (
                        <div className="mt-2 text-sm text-on-surface-variant">
                          <span className="font-medium">Notes:</span> {schedule.notes}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="p-4 border-t border-outline-variant/30 bg-white/50 flex justify-end">
              <button
                onClick={() => {
                  setSchedulesModalOpen(false);
                  openMaintenance(selectedVehicle);
                }}
                className="px-4 py-2 bg-primary text-white rounded-xl font-label-md text-label-md hover:bg-primary/90 transition-colors flex items-center gap-2"
              >
                <span className="material-symbols-outlined text-[18px]">add</span>
                Thêm lịch mới
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Inspection Records Modal */}
      {isInspectionsModalOpen && selectedVehicle && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="bg-surface/90 backdrop-blur-xl border border-white/40 shadow-2xl rounded-2xl w-full max-w-2xl max-h-[80vh] overflow-hidden relative">
            <div className="p-6 border-b border-outline-variant/30 flex justify-between items-center bg-white/50">
              <h2 className="font-headline-sm text-headline-sm font-bold flex items-center gap-2">
                <span className="material-symbols-outlined text-orange-500">fact_check</span>
                Lịch đăng kiểm - {selectedVehicle.truckPlate}
              </h2>
              <button 
                onClick={() => setInspectionsModalOpen(false)}
                className="material-symbols-outlined text-on-surface-variant hover:text-error transition-colors p-1 rounded-full hover:bg-error/10"
              >
                close
              </button>
            </div>

            <div className="p-6 overflow-y-auto max-h-[60vh] custom-scrollbar">
              {inspectionRecords.length === 0 ? (
                <div className="text-center py-8 text-on-surface-variant font-body-md">
                  Không có bản ghi đăng kiểm nào.
                </div>
              ) : (
                <div className="space-y-3">
                  {inspectionRecords.map((record) => (
                    <div key={record.id} className="bg-white/40 rounded-xl p-4 border border-outline-variant/20">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase ${
                            record.result === 'PASS' ? 'bg-tertiary/10 text-tertiary' :
                            record.result === 'FAIL' ? 'bg-error/10 text-error' :
                            'bg-orange-500/10 text-orange-500'
                          }`}>
                            {record.result}
                          </span>
                          <h4 className="font-body-md text-body-md font-semibold text-on-surface mt-1">
                            {new Date(record.inspectionDate).toLocaleDateString('vi-VN')}
                          </h4>
                        </div>
                        {record.documentUrl && (
                          <a
                            href={record.documentUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-primary hover:underline text-sm flex items-center gap-1"
                          >
                            <span className="material-symbols-outlined text-[16px]">description</span>
                            Xem tài liệu
                          </a>
                        )}
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div>
                          <span className="text-on-surface-variant">Inspector:</span>
                          <span className="ml-2 font-medium">{record.inspectorName}</span>
                        </div>
                        <div>
                          <span className="text-on-surface-variant">Expiry Date:</span>
                          <span className="ml-2 font-medium">
                            {record.expiryDate ? new Date(record.expiryDate).toLocaleDateString('vi-VN') : 'N/A'}
                          </span>
                        </div>
                      </div>
                      {record.notes && (
                        <div className="mt-2 text-sm text-on-surface-variant">
                          <span className="font-medium">Notes:</span> {record.notes}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="p-4 border-t border-outline-variant/30 bg-white/50 flex justify-end">
              <button
                onClick={() => {
                  setInspectionsModalOpen(false);
                  openInspection(selectedVehicle);
                }}
                className="px-4 py-2 bg-orange-500 text-white rounded-xl font-label-md text-label-md hover:bg-orange-600 transition-colors flex items-center gap-2"
              >
                <span className="material-symbols-outlined text-[18px]">add</span>
                Thêm đăng kiểm mới
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminFleetMap;
