import React, { useState } from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Cell,
  CartesianGrid
} from 'recharts';

interface PerformanceChartItem {
  day: string;
  deliveries: number;
  fuel: number;
}

interface DriverPerformanceRow {
  driverId: string;
  name: string;
  unit: string;
  status: 'EN ROUTE' | 'DELAYED' | 'OFF DUTY' | 'MAINTENANCE';
  distance: number;
  fuelRate: string;
  score: string;
  avatar: string;
}

const driverStatusMap: Record<DriverPerformanceRow['status'], string> = {
  'EN ROUTE': 'ĐANG DI CHUYỂN',
  'DELAYED': 'TRỄ HẠN',
  'OFF DUTY': 'NGOẠI TUYẾN',
  'MAINTENANCE': 'BẢO TRÌ'
};

const dayMap: Record<string, string> = {
  'Mon': 'T2',
  'Tue': 'T3',
  'Wed': 'T4',
  'Thu': 'T5',
  'Fri': 'T6',
  'Sat': 'T7',
  'Sun': 'CN'
};

// Chart datasets by selected Sector
const CHART_DATA_ALL: PerformanceChartItem[] = [
  { day: 'Mon', deliveries: 250, fuel: 820 },
  { day: 'Tue', deliveries: 320, fuel: 950 },
  { day: 'Wed', deliveries: 290, fuel: 880 },
  { day: 'Thu', deliveries: 380, fuel: 1100 },
  { day: 'Fri', deliveries: 410, fuel: 1250 },
  { day: 'Sat', deliveries: 150, fuel: 520 },
  { day: 'Sun', deliveries: 95, fuel: 340 },
];

const CHART_DATA_DELTA: PerformanceChartItem[] = [
  { day: 'Mon', deliveries: 85, fuel: 320 },
  { day: 'Tue', deliveries: 95, fuel: 380 },
  { day: 'Wed', deliveries: 110, fuel: 420 },
  { day: 'Thu', deliveries: 75, fuel: 290 },
  { day: 'Fri', deliveries: 120, fuel: 460 },
  { day: 'Sat', deliveries: 45, fuel: 180 },
  { day: 'Sun', deliveries: 35, fuel: 130 },
];

const CHART_DATA_ATLANTIC: PerformanceChartItem[] = [
  { day: 'Mon', deliveries: 90, fuel: 300 },
  { day: 'Tue', deliveries: 125, fuel: 340 },
  { day: 'Wed', deliveries: 80, fuel: 260 },
  { day: 'Thu', deliveries: 180, fuel: 510 },
  { day: 'Fri', deliveries: 165, fuel: 490 },
  { day: 'Sat', deliveries: 60, fuel: 210 },
  { day: 'Sun', deliveries: 40, fuel: 120 },
];

const CHART_DATA_PACIFIC: PerformanceChartItem[] = [
  { day: 'Mon', deliveries: 75, fuel: 200 },
  { day: 'Tue', deliveries: 100, fuel: 230 },
  { day: 'Wed', deliveries: 100, fuel: 200 },
  { day: 'Thu', deliveries: 125, fuel: 300 },
  { day: 'Fri', deliveries: 125, fuel: 300 },
  { day: 'Sat', deliveries: 45, fuel: 130 },
  { day: 'Sun', deliveries: 20, fuel: 90 },
];

// Driver Logs Rows
const INITIAL_DRIVERS: DriverPerformanceRow[] = [
  {
    driverId: 'DRV-7702',
    name: 'Sarah Jenkins',
    unit: 'Unit 4A (Heavy)',
    status: 'EN ROUTE',
    distance: 412.5,
    fuelRate: '6.9 MPG',
    score: '98 A',
    avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBZDABhu9aOCsvy2MgYdHWtzvw53FyiD7lsQhGHBG34AWeEFy7X7EtqP0d-FK5C8PJpPfgrhy8LBxsDQJ3Xl_MmJQcsXnA8UG38VdM2UnyyfgwrDliJeFnG6Yy3__PQzQJQhauTg4obfbADIAUDcgXgc5Mswhqa8l__PGQmILyW7skKuZhUSsG3F8g8XOHhD4zw2ve-2Kk-ZxNNuPy8wcz5H4c6kRr99gqamCfUpcTBTOp2JHSc1Uj8JLtXkuabnnf-mLLO_SZzMbdG'
  },
  {
    driverId: 'DRV-3491',
    name: 'Michael Chang',
    unit: 'Unit 2B (Medium)',
    status: 'DELAYED',
    distance: 180.0,
    fuelRate: '5.1 MPG',
    score: '72 C',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=facearea&facepad=2&w=256&h=256&q=80'
  },
  {
    driverId: 'DRV-8820',
    name: "David O'Connor",
    unit: 'Unit 9C (Van)',
    status: 'OFF DUTY',
    distance: 0.0,
    fuelRate: '--',
    score: '95 A',
    avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDD4ht36shvD8aqIjMlFeDSYFcF8zN7_VZncE9yC6MDXukjP7a8mzhlvq7CvY21D2AWJBFa4RYc9bpVwGscpQqZNWgtyt6g-0dYk48pVkU1HjAICclx5_k9iCo7_HauXlqEcDYxpGjPluTBP9hOz5JjEdJRhcrEEMioLqh6JJ9uA-zy0n0nAssEEg6cP5HJ_UEn5P_LqJpWGHahd9cS0gKgB7_hu6npSXdjhXs26xcizk_Bm3CJMBtjtAqCpZbaL4So29DIuNnu4afK'
  },
  {
    driverId: 'DRV-1105',
    name: 'Elena Rostova',
    unit: 'Unit 1A (Heavy)',
    status: 'EN ROUTE',
    distance: 390.2,
    fuelRate: '7.2 MPG',
    score: '99 A+',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=facearea&facepad=2&w=256&h=256&q=80'
  },
  {
    driverId: 'DRV-9941',
    name: 'Marcus T.',
    unit: 'Unit 5F (Heavy)',
    status: 'MAINTENANCE',
    distance: 120.4,
    fuelRate: '6.2 MPG',
    score: '92 B+',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=facearea&facepad=2&w=256&h=256&q=80'
  },
  {
    driverId: 'DRV-1204',
    name: 'J. Smith',
    unit: 'Unit 3A (Van)',
    status: 'EN ROUTE',
    distance: 240.5,
    fuelRate: '8.5 MPG',
    score: '96 A',
    avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCV3HB7jIUDekm1qtBEwLR7yglIuWN-XBfAEdH6QbsjfmYOr5r5Ha1Y7S_cKOTLkU7jFVPX0IYn7aBuNr_62yZaDQ5lQ8cqy2-MYGRPjtG2XQRMnEQ9cStR1KEwjvMVjigERAjyY-5DeA441wmqSTyS2mZwnISX0gBsykt17pMBN6kxHCe1EjiCZ3c3yAxtNbVjWbH0CMebUsBTmbdQRgAcdwUF319GgrvgfnVYoPv0VH2VNp7IbcXe-04MjIF6LNHMhjfdmgf9mOze'
  }
];

interface ReportsTabProps {
  searchQuery: string;
  setToastMessage: (msg: string | null) => void;
  setActiveTab: (tab: string) => void;
}

export const ReportsTab: React.FC<ReportsTabProps> = ({
  searchQuery,
  setToastMessage,
  setActiveTab,
}) => {
  // Interactive filters state
  const [dateRange, setDateRange] = useState('Last 7 Days');
  const [sector, setSector] = useState('Delta Sector (Active)');
  const [vehicleType, setVehicleType] = useState('All Types');
  const [driverStatus, setDriverStatus] = useState('All Drivers');

  // Operational states
  const [exportLoading, setExportLoading] = useState<string | null>(null);
  const [selectedDriver, setSelectedDriver] = useState<DriverPerformanceRow | null>(null);
  const [drivers] = useState<DriverPerformanceRow[]>(INITIAL_DRIVERS);

  // Apply filters overlay animation trigger
  const [applyingFilters, setApplyingFilters] = useState(false);

  // Fluctuating KPI values
  const [kpiStats, setKpiStats] = useState({
    onTimeRate: 94.2,
    fuelEfficiency: 6.8,
    totalDistance: 142
  });

  const handleApplyFilters = () => {
    setApplyingFilters(true);
    setToastMessage('Hoạt động: Đang tổng hợp các ma trận hiệu suất cho các tham số đã chọn...');

    setTimeout(() => {
      setApplyingFilters(false);
      
      // Calculate simulated stats fluctuation based on sector & date
      let onTimeDelta = (Math.random() - 0.5) * 1.5;
      let fuelDelta = (Math.random() - 0.5) * 0.5;
      let distanceDelta = Math.round((Math.random() - 0.5) * 20);

      if (sector === 'North Atlantic Corridor') {
        onTimeDelta += 1.0;
        fuelDelta -= 0.3;
        distanceDelta += 40;
      } else if (sector === 'Pacific Rim Hub') {
        onTimeDelta -= 2.0;
        fuelDelta += 0.8;
        distanceDelta -= 30;
      }

      setKpiStats({
        onTimeRate: parseFloat(Math.max(88.0, Math.min(99.0, 94.2 + onTimeDelta)).toFixed(1)),
        fuelEfficiency: parseFloat(Math.max(5.0, Math.min(8.8, 6.8 + fuelDelta)).toFixed(1)),
        totalDistance: Math.max(80, 142 + distanceDelta)
      });

      setToastMessage('Hoạt động: Đã áp dụng thành công các bộ lọc hiệu suất tổng hợp.');
    }, 1200);
  };

  const triggerExport = (format: 'CSV' | 'PDF' | 'Print') => {
    setExportLoading(format);
    
    let timer = 1500;
    if (format === 'Print') timer = 2000;

    setTimeout(() => {
      setExportLoading(null);
      if (format === 'Print') {
        setToastMessage('Kết nối Máy in: Đã chuyển gói báo cáo hiệu suất đến máy in trạm chính của Phân khu Delta.');
      } else {
        setToastMessage(`Xuất file Hoàn tất: Báo cáo Hiệu suất Đội xe đã được tổng hợp và tải xuống thành công dưới dạng ${format}!`);
      }
    }, timer);
  };

  // Get active dataset based on sector selection
  const getChartData = () => {
    if (sector === 'All Sectors') return CHART_DATA_ALL;
    if (sector === 'North Atlantic Corridor') return CHART_DATA_ATLANTIC;
    if (sector === 'Pacific Rim Hub') return CHART_DATA_PACIFIC;
    return CHART_DATA_DELTA;
  };

  // Filter drivers list
  const filteredDrivers = drivers.filter((drv) => {
    // 1. Filter by global Header search query
    const q = searchQuery.toLowerCase().trim();
    const matchesSearch = !q || (
      drv.driverId.toLowerCase().includes(q) ||
      drv.name.toLowerCase().includes(q) ||
      drv.unit.toLowerCase().includes(q) ||
      drv.status.toLowerCase().includes(q) ||
      drv.score.toLowerCase().includes(q)
    );

    if (!matchesSearch) return false;

    // 2. Filter by Status select element
    if (driverStatus !== 'All Drivers') {
      const matchStatus = 
        (driverStatus === 'Active En Route' && drv.status === 'EN ROUTE') ||
        (driverStatus === 'Off Duty' && drv.status === 'OFF DUTY') ||
        (driverStatus === 'Maintenance' && drv.status === 'MAINTENANCE') ||
        (driverStatus === 'Delayed' && drv.status === 'DELAYED');
      if (!matchStatus) return false;
    }

    // 3. Filter by Vehicle Type
    if (vehicleType !== 'All Types') {
      const matchType =
        (vehicleType === 'Heavy Freight (Class 8)' && drv.unit.includes('Heavy')) ||
        (vehicleType === 'Medium Duty' && drv.unit.includes('Medium')) ||
        (vehicleType === 'Last Mile Vans' && drv.unit.includes('Van'));
      if (!matchType) return false;
    }

    return true;
  });

  return (
    <>
      {/* Background trade lines matching orbital map layer */}
      <div className="absolute inset-0 z-0 bg-surface-container-lowest pointer-events-none select-none overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(5,20,36,0.15)_0%,rgba(5,20,36,0.92)_85%)] pointer-events-none" />
      </div>

      <div className="flex flex-col gap-gutter h-full min-h-0 relative z-10 select-none">
        
        {/* TOP ROW: Header Title & Live Export Triggers */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 shrink-0 pb-4 border-b border-outline-variant/15 text-left pointer-events-auto">
          <div>
            <h2 className="font-headline-md text-headline-md font-bold text-on-surface tracking-tight flex items-center gap-2">
              <span className="material-symbols-outlined text-secondary animate-[pulse_3s_infinite]">leaderboard</span>
              Báo Cáo Hiệu Suất Đội Xe
            </h2>
            <p className="font-body-md text-body-md text-on-surface-variant mt-0.5">
              Tổng hợp dữ liệu không gian thời gian thực về việc giao nhận hàng hóa, chỉ số tiêu thụ nhiên liệu và điểm số của tài xế.
            </p>
          </div>

          <div className="flex flex-wrap gap-2.5 font-label-caps text-[11px] font-bold">
            <button
              onClick={() => triggerExport('CSV')}
              disabled={!!exportLoading}
              className="glass-panel px-4 py-2.5 rounded-lg flex items-center gap-2 text-on-surface hover:text-secondary hover:border-secondary/40 transition-all duration-350 active:scale-95 disabled:opacity-50"
            >
              <span className="material-symbols-outlined text-[17px]">table_view</span>
              {exportLoading === 'CSV' ? 'ĐANG TỔNG HỢP CSV...' : 'XUẤT FILE CSV'}
            </button>

            <button
              onClick={() => triggerExport('PDF')}
              disabled={!!exportLoading}
              className="glass-panel px-4 py-2.5 rounded-lg flex items-center gap-2 text-on-surface hover:text-secondary hover:border-secondary/40 transition-all duration-350 active:scale-95 disabled:opacity-50"
            >
              <span className="material-symbols-outlined text-[17px]">picture_as_pdf</span>
              {exportLoading === 'PDF' ? 'ĐANG TẠO PDF...' : 'XUẤT FILE PDF'}
            </button>

            <button
              onClick={() => triggerExport('Print')}
              disabled={!!exportLoading}
              className="bg-primary-container hover:brightness-110 text-on-primary-container border border-primary/40 px-4 py-2.5 rounded-lg flex items-center gap-2 transition-all duration-350 active:scale-95 shadow-[0_0_15px_rgba(37,99,235,0.25)] disabled:opacity-50"
            >
              <span className="material-symbols-outlined text-[17px]">print</span>
              {exportLoading === 'Print' ? 'ĐANG ĐỒNG BỘ...' : 'IN HIỆU SUẤT'}
            </button>
          </div>
        </div>

        {/* HIGH-DENSITY FILTERING BOARD PANEL */}
        <div className="glass-panel rounded-xl p-4.5 shrink-0 flex flex-wrap gap-4 items-end z-10 border border-outline-variant/15 text-left pointer-events-auto relative overflow-hidden">
          {applyingFilters && (
            <div className="absolute inset-0 bg-background/55 backdrop-blur-sm z-30 flex items-center justify-center animate-fade-in">
              <div className="flex items-center gap-3 bg-surface-container border border-secondary/30 px-5 py-2.5 rounded-lg shadow-2xl">
                <span className="w-2.5 h-2.5 rounded-full bg-secondary animate-ping inline-block" />
                <span className="font-label-caps text-xs text-secondary font-bold tracking-widest animate-pulse">ĐANG TỔNG HỢP DỮ LIỆU...</span>
              </div>
            </div>
          )}

          {/* Date Range Selector */}
          <div className="flex-1 min-w-[200px]">
            <label className="block font-label-caps text-label-caps text-on-surface-variant mb-2">
              Khoảng Thời Gian
            </label>
            <div className="relative">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-[17px]">
                calendar_today
              </span>
              <select
                className="w-full bg-surface-dim/80 border border-outline-variant/40 rounded p-2 pl-9 text-on-surface font-data-tabular text-data-tabular appearance-none focus:outline-none focus:border-secondary focus:ring-1 focus:ring-secondary/40 transition-all"
                value={dateRange}
                onChange={(e) => setDateRange(e.target.value)}
              >
                <option value="Last 24 Hours">24 Giờ Qua</option>
                <option value="Last 7 Days">7 Ngày Qua</option>
                <option value="This Month">Tháng Này</option>
                <option value="Q3 2026">Quý 3 2026</option>
              </select>
            </div>
          </div>

          {/* Sector Selector */}
          <div className="flex-1 min-w-[200px]">
            <label className="block font-label-caps text-label-caps text-on-surface-variant mb-2">
              Phân Khu Logistics
            </label>
            <div className="relative">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-[17px]">
                map
              </span>
              <select
                className="w-full bg-surface-dim/80 border border-outline-variant/40 rounded p-2 pl-9 text-on-surface font-data-tabular text-data-tabular appearance-none focus:outline-none focus:border-secondary focus:ring-1 focus:ring-secondary/40 transition-all"
                value={sector}
                onChange={(e) => setSector(e.target.value)}
              >
                <option value="All Sectors">Tất Cả Các Phân Khu</option>
                <option value="Delta Sector (Active)">Phân Khu Delta (Hoạt động)</option>
                <option value="North Atlantic Corridor">Hành Lang Bắc Đại Tây Dương</option>
                <option value="Pacific Rim Hub">Trung Tâm Vành Đai Thái Bình Dương</option>
              </select>
            </div>
          </div>

          {/* Vehicle Type Selector */}
          <div className="flex-1 min-w-[150px]">
            <label className="block font-label-caps text-label-caps text-on-surface-variant mb-2">
              Phân Loại Phương Tiện
            </label>
            <select
              className="w-full bg-surface-dim/80 border border-outline-variant/40 rounded p-2 text-on-surface font-data-tabular text-data-tabular appearance-none focus:outline-none focus:border-secondary focus:ring-1 focus:ring-secondary/40 transition-all"
              value={vehicleType}
              onChange={(e) => setVehicleType(e.target.value)}
            >
              <option value="All Types">Tất Cả Các Loại</option>
              <option value="Heavy Freight (Class 8)">Vận Tải Hạng Nặng (Hạng 8)</option>
              <option value="Medium Duty">Tải Trung Bình</option>
              <option value="Last Mile Vans">Xe Tải Giao Hàng Chặng Cuối</option>
            </select>
          </div>

          {/* Driver Status Selector */}
          <div className="flex-1 min-w-[150px]">
            <label className="block font-label-caps text-label-caps text-on-surface-variant mb-2">
              Trạng Thái Vận Hành
            </label>
            <select
              className="w-full bg-surface-dim/80 border border-outline-variant/40 rounded p-2 text-on-surface font-data-tabular text-data-tabular appearance-none focus:outline-none focus:border-secondary focus:ring-1 focus:ring-secondary/40 transition-all"
              value={driverStatus}
              onChange={(e) => setDriverStatus(e.target.value)}
            >
              <option value="All Drivers">Tất Cả Tài Xế</option>
              <option value="Active En Route">Đang Di Chuyển</option>
              <option value="Delayed">Bị Trễ Hạn</option>
              <option value="Off Duty">Ngoại Tuyến</option>
              <option value="Maintenance">Đang Bảo Trì</option>
            </select>
          </div>

          <button
            onClick={handleApplyFilters}
            className="bg-surface-variant hover:bg-surface-bright border border-outline-variant hover:border-secondary/50 text-on-surface px-6 py-2 rounded h-[38px] font-label-caps text-label-caps transition-all active:scale-[0.98] shrink-0"
          >
            Áp Dụng Bộ Lọc
          </button>
        </div>

        {/* MIDDLE SECTION: KPI columns & Recharts Volume Chart */}
        <div className="grid grid-cols-12 gap-gutter shrink-0 pointer-events-auto">
          
          {/* Left: Bento Column KPIs */}
          <div className="col-span-12 lg:col-span-3 flex flex-col gap-gutter text-left">
            
            {/* KPI 1: On-Time Deliveries */}
            <div className="glass-panel rounded-xl p-5 relative overflow-hidden group hover:border-secondary/30 transition-colors duration-300">
              <div className="absolute -right-6 -top-6 w-24 h-24 bg-primary-container/10 rounded-full blur-2xl pointer-events-none" />
              
              <div className="flex justify-between items-start mb-2 select-none">
                <span className="font-label-caps text-label-caps text-on-surface-variant text-[10px] tracking-widest font-bold">
                  CHỈ SỐ ĐÚNG HẠN
                </span>
                <span className="material-symbols-outlined text-secondary text-[19px]">check_circle</span>
              </div>
              
              <div className="font-display-lg text-display-lg text-on-surface mb-1 text-2xl font-bold font-data-tabular">
                {kpiStats.onTimeRate}%
              </div>
              
              <div className="flex items-center gap-1.5 mt-2">
                <span className="text-[10px] text-emerald-400 bg-emerald-400/10 border border-emerald-400/20 px-1.5 py-0.5 rounded font-bold flex items-center font-data-tabular">
                  <span className="material-symbols-outlined text-[13px] mr-0.5">trending_up</span> +1.2%
                </span>
                <span className="text-[10px] text-on-surface-variant font-semibold">so với tuần trước</span>
              </div>
            </div>

            {/* KPI 2: Fuel Efficiency */}
            <div className="glass-panel rounded-xl p-5 relative overflow-hidden group hover:border-error/30 transition-colors duration-300">
              <div className="absolute -right-6 -top-6 w-24 h-24 bg-error/10 rounded-full blur-2xl pointer-events-none" />
              
              <div className="flex justify-between items-start mb-2 select-none">
                <span className="font-label-caps text-label-caps text-on-surface-variant text-[10px] tracking-widest font-bold">
                  AVG FUEL RATIO
                </span>
                <span className="material-symbols-outlined text-error text-[19px]">local_gas_station</span>
              </div>
              
              <div className="font-display-lg text-display-lg text-on-surface mb-1 text-2xl font-bold font-data-tabular">
                {kpiStats.fuelEfficiency} <span className="text-sm font-semibold text-on-surface-variant uppercase">MPG</span>
              </div>
              
              <div className="flex items-center gap-1.5 mt-2">
                <span className="text-[10px] text-error bg-error/10 border border-error/20 px-1.5 py-0.5 rounded font-bold flex items-center font-data-tabular animate-pulse">
                  <span className="material-symbols-outlined text-[13px] mr-0.5">trending_down</span> -0.4%
                </span>
                <span className="text-[10px] text-on-surface-variant font-semibold">Cần tối ưu hóa</span>
              </div>
            </div>

            {/* KPI 3: Total Distance */}
            <div className="glass-panel rounded-xl p-5 relative overflow-hidden group hover:border-primary/30 transition-colors duration-300">
              <div className="absolute -right-6 -top-6 w-24 h-24 bg-primary/10 rounded-full blur-2xl pointer-events-none" />
              
              <div className="flex justify-between items-start mb-2 select-none">
                <span className="font-label-caps text-label-caps text-on-surface-variant text-[10px] tracking-widest font-bold">
                  TỔNG QUÃNG ĐƯỜNG
                </span>
                <span className="material-symbols-outlined text-primary text-[19px]">route</span>
              </div>
              
              <div className="font-display-lg text-display-lg text-on-surface mb-1 text-2xl font-bold font-data-tabular">
                {kpiStats.totalDistance}K <span className="text-sm font-semibold text-on-surface-variant uppercase">MI</span>
              </div>
              
              <div className="flex items-center gap-1 mt-2 text-[10px] text-on-surface-variant font-semibold select-none">
                <span className="w-1.5 h-1.5 rounded-full bg-secondary animate-pulse inline-block mr-1"></span>
                Trên toàn bộ các đội xe hoạt động
              </div>
            </div>

          </div>

          {/* Right: Recharts Double Bar Chart Container */}
          <div className="col-span-12 lg:col-span-9 glass-panel rounded-xl p-5 flex flex-col text-left border border-outline-variant/15">
            
            <div className="flex justify-between items-center mb-6 border-b border-outline-variant/10 pb-4 shrink-0">
              <div>
                <h3 className="font-headline-sm text-headline-sm text-on-surface font-semibold">
                  Biểu Đồ So Sánh Sản Lượng Giao Hàng & Tiêu Thụ Nhiên Liệu
                </h3>
                <p className="text-[11px] text-on-surface-variant mt-0.5 font-semibold">
                  Phân tích so sánh sản lượng giao hàng hoàn thành hàng ngày với tổng lượng gallon nhiên liệu đã tiêu thụ.
                </p>
              </div>
              
              <div className="flex gap-4 text-[10px] font-bold font-label-caps select-none">
                <span className="flex items-center gap-1.5 text-on-surface">
                  <div className="w-2.5 h-2.5 rounded-sm bg-primary-container" />
                  Đơn Giao Hàng
                </span>
                
                <span className="flex items-center gap-1.5 text-secondary">
                  <div className="w-2.5 h-2.5 rounded-sm bg-secondary" />
                  Nhiên Liệu (Gal)
                </span>
              </div>
            </div>

            {/* Interactive Recharts Component */}
            <div className="flex-1 w-full min-h-[220px] select-none">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={getChartData()}
                  margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" vertical={false} />
                  <XAxis
                    dataKey="day"
                    stroke="#8d90a0"
                    fontSize={10}
                    tickLine={false}
                    tickFormatter={(tick) => dayMap[tick] || tick}
                    axisLine={{ stroke: 'rgba(255,255,255,0.1)' }}
                  />
                  <YAxis
                    stroke="#8d90a0"
                    fontSize={10}
                    tickLine={false}
                    axisLine={{ stroke: 'rgba(255,255,255,0.1)' }}
                  />
                  <Tooltip
                    cursor={{ fill: 'rgba(255,255,255,0.02)' }}
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        return (
                          <div className="glass-panel p-3 rounded-lg text-xs font-bold border border-outline-variant/35 text-left flex flex-col gap-1.5">
                            <p className="text-on-surface-variant font-label-caps uppercase text-[9px] tracking-wider">
                              Tổng hợp Logistics
                            </p>
                            <div className="flex items-center justify-between gap-6 border-b border-white/5 pb-1">
                              <span className="text-primary-fixed">Sản lượng:</span>
                              <span className="font-data-tabular text-sm text-primary">{payload[0].value} đơn</span>
                            </div>
                            <div className="flex items-center justify-between gap-6">
                              <span className="text-secondary">Nhiên liệu:</span>
                              <span className="font-data-tabular text-sm text-secondary">{payload[1].value} Gal</span>
                            </div>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Bar dataKey="deliveries" radius={[3, 3, 0, 0]}>
                    {getChartData().map((_, index) => (
                      <Cell key={`cell-del-${index}`} fill="#2563eb" fillOpacity={0.8} />
                    ))}
                  </Bar>
                  <Bar dataKey="fuel" radius={[3, 3, 0, 0]}>
                    {getChartData().map((_, index) => (
                      <Cell key={`cell-fuel-${index}`} fill="#4cd7f6" fillOpacity={0.65} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>

          </div>
        </div>

        {/* BOTTOM SECTION: Detailed Driver Performance Log Table */}
        <div className="glass-panel rounded-xl flex-grow overflow-hidden flex flex-col border border-outline-variant/15 pointer-events-auto min-h-[300px]">
          
          <div className="p-4.5 border-b border-outline-variant/15 bg-surface-dim/40 flex justify-between items-center shrink-0">
            <div>
              <h3 className="font-headline-sm text-headline-sm text-on-surface font-semibold">
                Nhật Ký Hiệu Suất Tài Xế
              </h3>
              <p className="text-[11px] text-on-surface-variant font-medium mt-0.5">
                Danh mục phân tích toàn diện trên tất cả các hoạt động phân khu delta đang hoạt động.
              </p>
            </div>
            
            <button
              onClick={() => {
                setToastMessage('Nhật ký Hoạt động: Đã lấy nhật ký kiểm toán logistics toàn diện thành công.');
              }}
              className="text-secondary font-label-caps text-[10px] hover:underline flex items-center gap-1 tracking-wider font-bold"
            >
              Đồng Bộ Nhật Ký Hiệu Suất <span className="material-symbols-outlined text-[15px]">sync</span>
            </button>
          </div>

          {/* Table Container */}
          <div className="flex-1 overflow-y-auto">
            {filteredDrivers.length === 0 ? (
              <div className="p-12 text-center text-on-surface-variant select-none">
                <span className="material-symbols-outlined text-[48px] opacity-40 mb-2 block">person_search</span>
                Không tìm thấy nhật ký tài xế nào khớp với tìm kiếm và thông số đã chọn.
              </div>
            ) : (
              <table className="w-full text-left border-collapse table-auto">
                <thead>
                  <tr className="bg-surface-container/45 border-b border-outline-variant/15 text-on-surface-variant font-label-caps text-[10px] tracking-widest font-bold select-none sticky top-0 z-10 bg-surface-container/90 backdrop-blur">
                    <th className="p-4 font-normal pl-5">Mã Tài Xế</th>
                    <th className="p-4 font-normal">Họ và Tên</th>
                    <th className="p-4 font-normal">Đơn Vị Phân Công</th>
                    <th className="p-4 font-normal">Trạng Thái</th>
                    <th className="p-4 font-normal text-right">Quãng Đường (mi)</th>
                    <th className="p-4 font-normal text-right">Mức Tiêu Thụ NL</th>
                    <th className="p-4 font-normal text-right pr-5">Điểm An Toàn</th>
                  </tr>
                </thead>
                <tbody className="font-data-tabular text-data-tabular text-on-surface text-xs font-medium">
                  {filteredDrivers.map((row) => {
                    let statusBg = 'bg-primary/15 text-primary border-primary/25';
                    if (row.status === 'DELAYED') {
                      statusBg = 'bg-error/15 text-error border-error/25 animate-pulse';
                    } else if (row.status === 'OFF DUTY') {
                      statusBg = 'bg-white/5 text-on-surface-variant border-outline-variant/30';
                    } else if (row.status === 'MAINTENANCE') {
                      statusBg = 'bg-amber-400/10 text-amber-300 border-amber-500/20';
                    }

                    let scoreColor = 'text-emerald-400';
                    if (row.score.includes('C')) {
                      scoreColor = 'text-error';
                    } else if (row.score.includes('B')) {
                      scoreColor = 'text-secondary';
                    }

                    return (
                      <tr
                        key={row.driverId}
                        onClick={() => setSelectedDriver(row)}
                        className="border-b border-outline-variant/10 hover:bg-white/5 transition-colors cursor-pointer group"
                      >
                        {/* ID */}
                        <td className="p-4 pl-5 text-secondary font-bold group-hover:text-primary transition-colors">
                          {row.driverId}
                        </td>
                        
                        {/* Name with avatar */}
                        <td className="p-4 font-body-md text-xs font-semibold">
                          <div className="flex items-center gap-3">
                            <img
                              src={row.avatar}
                              alt={row.name}
                              className="w-7 h-7 rounded-full border border-white/10 object-cover"
                            />
                            <span>{row.name}</span>
                          </div>
                        </td>
                        
                        {/* Unit */}
                        <td className="p-4 text-on-surface-variant font-semibold">
                          {row.unit}
                        </td>
                        
                        {/* Status tag */}
                        <td className="p-4 select-none">
                          <span className={`px-2 py-0.75 rounded border text-[9px] font-bold font-label-caps uppercase ${statusBg}`}>
                            {driverStatusMap[row.status]}
                          </span>
                        </td>
                        
                        {/* Distance */}
                        <td className="p-4 text-right font-bold text-on-surface-variant">
                          {row.distance > 0 ? row.distance.toFixed(1) : '--'}
                        </td>
                        
                        {/* Fuel Rate */}
                        <td className={`p-4 text-right font-bold ${row.fuelRate.includes('5.') ? 'text-error animate-pulse' : 'text-on-surface-variant'}`}>
                          {row.fuelRate}
                        </td>
                        
                        {/* Score */}
                        <td className={`p-4 text-right pr-5 font-bold ${scoreColor}`}>
                          {row.score}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>

        </div>

      </div>

      {/* DYNAMIC Driver Performance Detail Glassmorphic Drawer Overlay */}
      {selectedDriver && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-fade-in pointer-events-auto">
          <div className="w-full max-w-md glass-panel rounded-xl overflow-hidden border border-outline-variant/35 shadow-2xl animate-scale-up">
            
            {/* Header */}
            <div className="p-4.5 border-b border-outline-variant/15 flex justify-between items-center bg-surface-container/30 select-none">
              <h3 className="font-headline-sm text-headline-sm font-bold text-primary flex items-center gap-2">
                <span className="material-symbols-outlined text-[20px] text-primary">assessment</span>
                Phân Tích Chi Tiết Hiệu Suất
              </h3>
              
              <button
                onClick={() => setSelectedDriver(null)}
                className="text-on-surface-variant hover:text-error transition-colors p-1"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            {/* Profile Summary */}
            <div className="p-5 flex flex-col gap-4 text-left">
              <div className="flex items-center gap-4 bg-white/5 p-3.5 rounded-lg border border-white/5 select-none">
                <img
                  src={selectedDriver.avatar}
                  alt={selectedDriver.name}
                  className="w-12 h-12 rounded-full border-2 border-primary/20 object-cover"
                />
                
                <div className="flex-1 flex flex-col">
                  <h4 className="font-headline-sm text-base text-on-surface font-bold">
                    {selectedDriver.name}
                  </h4>
                  <span className="text-[10px] font-bold text-on-surface-variant font-data-tabular uppercase tracking-wider mt-0.5">
                    Mã Tài Xế: {selectedDriver.driverId} • {selectedDriver.unit}
                  </span>
                </div>

                <div className="flex flex-col items-center justify-center bg-primary/10 border border-primary/20 rounded px-2.5 py-1">
                  <span className="text-[8px] font-bold text-primary uppercase">Điểm</span>
                  <span className="font-data-tabular text-base font-bold text-secondary">{selectedDriver.score}</span>
                </div>
              </div>

              {/* Sub-KPI Breakdown metrics */}
              <div className="grid grid-cols-3 gap-3 font-data-tabular select-none text-center">
                <div className="bg-black/30 p-2.5 rounded border border-white/5">
                  <span className="text-[8px] font-bold text-on-surface-variant uppercase tracking-wider">Quãng đường</span>
                  <p className="text-on-surface text-base font-bold mt-0.5">{selectedDriver.distance > 0 ? `${selectedDriver.distance} mi` : '--'}</p>
                </div>
                
                <div className="bg-black/30 p-2.5 rounded border border-white/5">
                  <span className="text-[8px] font-bold text-on-surface-variant uppercase tracking-wider">Hiệu suất NL</span>
                  <p className="text-on-surface text-base font-bold mt-0.5">{selectedDriver.fuelRate}</p>
                </div>

                <div className="bg-black/30 p-2.5 rounded border border-white/5">
                  <span className="text-[8px] font-bold text-on-surface-variant uppercase tracking-wider">Trạng Thái</span>
                  <p className="text-secondary text-[11px] font-bold uppercase tracking-wider mt-1">{driverStatusMap[selectedDriver.status]}</p>
                </div>
              </div>

              {/* Operations Quick Links */}
              <div className="flex flex-col gap-2 mt-2 font-label-caps text-[11px] font-bold select-none">
                <span className="text-[10px] text-on-surface-variant uppercase tracking-wider font-bold">
                  Hành Động Điều Phối Chiến Thuật
                </span>

                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => {
                      setSelectedDriver(null);
                      setActiveTab('Live Tracking');
                      setToastMessage(`Định vị GPS: Đã đồng bộ ma trận vết điều phối của ${selectedDriver.name} (${selectedDriver.unit}).`);
                    }}
                    className="py-2.5 bg-primary/15 hover:bg-primary/25 border border-primary/30 text-primary rounded-lg text-center transition-colors active:scale-[0.98]"
                  >
                    ĐỊNH VỊ GPS
                  </button>

                  <button
                    onClick={() => {
                      setSelectedDriver(null);
                      setToastMessage(`Liên lạc Vệ tinh: Đã mở tần số thoại an toàn tới tài xế ${selectedDriver.name}.`);
                    }}
                    className="py-2.5 bg-white/5 hover:bg-white/10 border border-outline-variant/30 text-on-surface rounded-lg text-center transition-colors active:scale-[0.98]"
                  >
                    GỬI TIN NHẮN
                  </button>
                </div>

                <button
                  onClick={() => {
                    setSelectedDriver(null);
                    setToastMessage(`Hoạt động: Đã tạo gói hồ sơ hiệu suất không gian cho ${selectedDriver.name}.`);
                  }}
                  className="w-full py-2.5 bg-secondary/15 hover:bg-secondary/25 border border-secondary/30 text-secondary rounded-lg text-center transition-colors mt-1 active:scale-[0.98]"
                >
                  TẢI BÁO CÁO TUÂN THỦ
                </button>
              </div>

            </div>

          </div>
        </div>
      )}
    </>
  );
};

export default ReportsTab;
