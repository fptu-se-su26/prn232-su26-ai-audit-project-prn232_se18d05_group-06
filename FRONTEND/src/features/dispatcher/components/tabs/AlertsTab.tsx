import React, { useState } from 'react';

interface AlertItem {
  id: string;
  vehicleId: string;
  driverName: string;
  driverAvatar: string;
  type: 'Over Speed' | 'Route Deviation' | 'Long Stop' | 'Fuel Alert' | 'Delayed Delivery' | 'Vehicle Issue';
  severity: 'critical' | 'warning' | 'info';
  timestamp: string;
  location: string;
  description: string;
  coordinates: { x: number; y: number };
  telemetryValue?: string;
  routePlan?: string;
}

const alertTypeMap: Record<AlertItem['type'], string> = {
  'Over Speed': 'Quá Tốc Độ',
  'Route Deviation': 'Lệch Tuyến Đường',
  'Long Stop': 'Dừng Quá Lâu',
  'Fuel Alert': 'Cảnh Báo Nhiên Liệu',
  'Delayed Delivery': 'Giao Hàng Trễ',
  'Vehicle Issue': 'Sự Cố Phương Tiện',
};

const severityMap: Record<AlertItem['severity'], string> = {
  critical: 'Nguy cấp',
  warning: 'Cảnh báo',
  info: 'Thông tin',
};

const INITIAL_ALERTS: AlertItem[] = [
  {
    id: 'ALT-704',
    vehicleId: 'V-7892',
    driverName: 'Marcus T.',
    driverAvatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDD4ht36shvD8aqIjMlFeDSYFcF8zN7_VZncE9yC6MDXukjP7a8mzhlvq7CvY21D2AWJBFa4RYc9bpVwGscpQqZNWgtyt6g-0dYk48pVkU1HjAICclx5_k9iCo7_HauXlqEcDYxpGjPluTBP9hOz5JjEdJRhcrEEMioLqh6JJ9uA-zy0n0nAssEEg6cP5HJ_UEn5P_LqJpWGHahd9cS0gKgB7_hu6npSXdjhXs26xcizk_Bm3CJMBtjtAqCpZbaL4So29DIuNnu4afK',
    type: 'Over Speed',
    severity: 'critical',
    timestamp: 'Vừa xong',
    location: 'I-95 Hướng Bắc, Cột mốc 42',
    description: 'Vượt quá giới hạn tốc độ nghiêm trọng trên hành lang I-95. Tốc độ di chuyển 82 mph (Giới hạn vùng: 65 mph). Đã ghi nhận vi phạm tốc độ.',
    coordinates: { x: 38, y: 32 },
    telemetryValue: '82 mph',
    routePlan: 'Trung tâm Phân phối Alpha → Cảng Hàng hải'
  },
  {
    id: 'ALT-109',
    vehicleId: 'V-1044',
    driverName: 'Sarah J.',
    driverAvatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBZDABhu9aOCsvy2MgYdHWtzvw53FyiD7lsQhGHBG34AWeEFy7X7EtqP0d-FK5C8PJpPfgrhy8LBxsDQJ3Xl_MmJQcsXnA8UG38VdM2UnyyfgwrDliJeFnG6Yy3__PQzQJQhauTg4obfbADIAUDcgXgc5Mswhqa8l__PGQmILyW7skKuZhUSsG3F8g8XOHhD4zw2ve-2Kk-ZxNNuPy8wcz5H4c6kRr99gqamCfUpcTBTOp2JHSc1Uj8JLtXkuabnnf-mLLO_SZzMbdG',
    type: 'Route Deviation',
    severity: 'warning',
    timestamp: '3 phút trước',
    location: 'Giao lộ Đường Oak / Quốc lộ 4',
    description: 'Phương tiện đã đi chệch hơn 1,5 dặm khỏi lộ trình logistics được chỉ định.',
    coordinates: { x: 58, y: 48 },
    telemetryValue: 'Lệch +1.8 mi',
    routePlan: 'Kho hàng 4 → Trung tâm Phố cổ'
  },
  {
    id: 'ALT-305',
    vehicleId: 'V-3392',
    driverName: 'David K.',
    driverAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
    type: 'Long Stop',
    severity: 'warning',
    timestamp: '8 phút trước',
    location: 'Trạm dừng Pilot Travel Center số 4',
    description: 'Thời gian dừng đỗ không theo lịch trình đã vượt quá 25 phút. Bộ đếm thời gian dừng đỗ vẫn tiếp tục tích lũy.',
    coordinates: { x: 50, y: 68 },
    telemetryValue: 'Dừng chờ 28 phút',
    routePlan: 'Trung tâm Vùng phía Đông → Hàng hóa Sân bay'
  },
  {
    id: 'ALT-509',
    vehicleId: 'V-5091',
    driverName: 'J. Smith',
    driverAvatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCV3HB7jIUDekm1qtBEwLR7yglIuWN-XBfAEdH6QbsjfmYOr5r5Ha1Y7S_cKOTLkU7jFVPX0IYn7aBuNr_62yZaDQ5lQ8cqy2-MYGRPjtG2XQRMnEQ9cStR1KEwjvMVjigERAjyY-5DeA441wmqSTyS2mZwnISX0gBsykt17pMBN6kxHCe1EjiCZ3c3yAxtNbVjWbH0CMebUsBTmbdQRgAcdwUF319GgrvgfnVYoPv0VH2VNp7IbcXe-04MjIF6LNHMhjfdmgf9mOze',
    type: 'Fuel Alert',
    severity: 'info',
    timestamp: '15 phút trước',
    location: 'Tỉnh lộ 9, Cổng Trung tâm A',
    description: 'Hệ thống đo lường từ xa của xe cho thấy dung lượng pin giảm xuống dưới mức vận hành an toàn (còn 12% EV).',
    coordinates: { x: 42, y: 55 },
    telemetryValue: 'Sạc EV 12%',
    routePlan: 'Kho hàng A → Trung tâm A'
  },
  {
    id: 'ALT-882',
    vehicleId: 'V-8821',
    driverName: 'M. Davis',
    driverAvatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuASqTXf-ypHHWbfwlINGzbcEGe3z3RiKidT_mtsY-wHSUzQ6JWwQI-ukqGcDjnYcnXK33Wx1Mt8TNVl3hDDzTtgyHZyaS0BnTnWm0_i33oCpRAm3Rhucp7z8OnvTmIS3ouWF-FC9hpn4ase0Rz6dy4v3P7Jen9PO6D_3hnekqR704oMWhv_mXWKgKXCCYpKziBQzGLx_eA3b1tfVRWq8SWaI6mxv18j5zjR9yghh0nD8RoyeP4MsOSZON60qOm9wfozrspOTqeUK-Kt',
    type: 'Vehicle Issue',
    severity: 'critical',
    timestamp: '22 phút trước',
    location: 'I-280 Hướng Tây, Lối ra 12B',
    description: 'Đã ghi nhận nguy cơ quá nhiệt: áp suất chất làm mát giảm xuống dưới ngưỡng bình thường. Nhiệt độ tăng vọt: 215°F.',
    coordinates: { x: 62, y: 28 },
    telemetryValue: 'E-204 / 215°F',
    routePlan: 'Trạm Alpha → Phân khu Bravo'
  },
  {
    id: 'ALT-994',
    vehicleId: 'V-9945',
    driverName: 'K. Tanaka',
    driverAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
    type: 'Delayed Delivery',
    severity: 'info',
    timestamp: '28 phút trước',
    location: 'Giao lộ Khu vực C Trung tâm',
    description: 'Mật độ giao thông đô thị đã ảnh hưởng đến thời gian vận chuyển. Thời gian đến dự kiến (ETA) hiện tại bị trễ 18 phút.',
    coordinates: { x: 48, y: 78 },
    telemetryValue: 'Trễ +18 phút',
    routePlan: 'Trung tâm Vùng → Phân khu C Trung tâm'
  }
];

interface AlertsTabProps {
  searchQuery: string;
  setToastMessage: (msg: string | null) => void;
  setActiveTab: (tab: string) => void;
}

export const AlertsTab: React.FC<AlertsTabProps> = ({
  searchQuery,
  setToastMessage,
  setActiveTab,
}) => {
  const [alerts, setAlerts] = useState<AlertItem[]>(INITIAL_ALERTS);
  const [selectedSeverity, setSelectedSeverity] = useState({
    critical: true,
    warning: true,
    info: true,
  });
  const [selectedCategories, setSelectedCategories] = useState({
    'Over Speed': true,
    'Route Deviation': true,
    'Long Stop': true,
    'Fuel Alert': true,
    'Delayed Delivery': true,
    'Vehicle Issue': true,
  });

  const [hoveredAlertId, setHoveredAlertId] = useState<string | null>(null);
  const [selectedAlertId, setSelectedAlertId] = useState<string | null>(null);
  const [escalatingAlert, setEscalatingAlert] = useState<AlertItem | null>(null);
  const [escalationProtocol, setEscalationProtocol] = useState('Nghị định thư 9-ALPHA: Điều phối Hộ tống An toàn');
  const [escalationNote, setEscalationNote] = useState('');

  // Handle category toggle
  const toggleCategory = (cat: keyof typeof selectedCategories) => {
    setSelectedCategories((prev) => ({
      ...prev,
      [cat]: !prev[cat],
    }));
  };

  // Handle severity toggle
  const toggleSeverity = (sev: keyof typeof selectedSeverity) => {
    setSelectedSeverity((prev) => ({
      ...prev,
      [sev]: !prev[sev],
    }));
  };

  // Reset filters
  const resetFilters = () => {
    setSelectedSeverity({ critical: true, warning: true, info: true });
    setSelectedCategories({
      'Over Speed': true,
      'Route Deviation': true,
      'Long Stop': true,
      'Fuel Alert': true,
      'Delayed Delivery': true,
      'Vehicle Issue': true,
    });
  };

  // Filtering alerts
  const filteredAlerts = alerts.filter((alert) => {
    // 1. Severity filter check
    if (!selectedSeverity[alert.severity]) return false;

    // 2. Category filter check
    if (!selectedCategories[alert.type]) return false;

    // 3. Search query check
    const q = searchQuery.toLowerCase().trim();
    if (!q) return true;

    return (
      alert.id.toLowerCase().includes(q) ||
      alert.vehicleId.toLowerCase().includes(q) ||
      alert.driverName.toLowerCase().includes(q) ||
      alert.type.toLowerCase().includes(q) ||
      alert.location.toLowerCase().includes(q) ||
      alert.description.toLowerCase().includes(q)
    );
  });

  // Handle Escalation Modal Submit
  const handleEscalationSubmit = () => {
    if (!escalatingAlert) return;

    // Remove the alert from active feed since it's escalated/handled
    setAlerts((prev) => prev.filter((a) => a.id !== escalatingAlert.id));
    
    setToastMessage(
      `Kích hoạt Nghị định thư Khẩn cấp: Đã triển khai ${escalationProtocol} cho phương tiện ${escalatingAlert.vehicleId}. Các chỉ dẫn an toàn điều phối đã được xếp hàng thành công!`
    );

    // Reset Modal States
    setEscalatingAlert(null);
    setEscalationNote('');
  };

  // Quick Action: Silence or dismiss alert
  const handleSilenceAlert = (id: string, vehicleId: string) => {
    setAlerts((prev) => prev.filter((a) => a.id !== id));
    setToastMessage(`Đã giải quyết sự cố: Cảnh báo ${id} cho phương tiện ${vehicleId} đã được ghi nhận và tắt âm thanh.`);
  };

  // Get active counts
  const criticalCount = alerts.filter(a => a.severity === 'critical').length;
  const warningCount = alerts.filter(a => a.severity === 'warning').length;
  const totalCount = alerts.length;

  return (
    <>
      {/* 1. Global Background Trade Map Layer with active pings */}
      <div className="absolute inset-0 z-0 bg-surface-container-lowest select-none">
        <img
          alt="Command Center Map Base"
          className="w-full h-full object-cover opacity-25 mix-blend-screen transition-opacity duration-700"
          src="https://lh3.googleusercontent.com/aida-public/AB6AXuCa7DktpFT3Ozv5c3gM_VQP7SL5_nIt_alsUbKj4m3JOarFTqzmlCpwroKSFd4rBasfP_VQP7SL5_nIt_alsUbKj4m3JOarFTqzmlCpwroKSFd4rBasfP_LqBGJ4MB44vvSdwUFQyCEbu8_n8tFt2moxBoB5Dmj3y2q8uEZVrqHzt6hONKx2lrL0qoCxcDBBuFtYrcU-btNhCyV6BpjpIxvtbL7lom4v_4PD2Q86zm8Ln0wi0WtoS6ae9RonPb5Z7mF4ORDgXDwJ7spbtZUYLXOQiScAKFPTp50rPGumvvvAOQDaGQKYnP5j6ZVSf7br"
        />

        {/* Ambient Map overlay radial-gradient */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(5,20,36,0.1)_0%,rgba(5,20,36,0.9)_80%)] pointer-events-none" />

        {/* Animated trade routes linking points (mock map graphics) */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-20">
          <line x1="38%" y1="32%" x2="58%" y2="48%" stroke="#4cd7f6" strokeWidth="1" className="path-line" />
          <line x1="58%" y1="48%" x2="50%" y2="68%" stroke="#4cd7f6" strokeWidth="1" className="path-line" />
          <line x1="50%" y1="68%" x2="48%" y2="78%" stroke="#2563eb" strokeWidth="0.75" />
          <line x1="42%" y1="55%" x2="38%" y2="32%" stroke="#ffb4ab" strokeWidth="1" className="path-line" />
          <line x1="62%" y1="28%" x2="58%" y2="48%" stroke="#ffb4ab" strokeWidth="1" className="path-line" />
        </svg>

        {/* Active Radar Hot Pings Overlay */}
        {filteredAlerts.map((alert) => {
          const isHovered = hoveredAlertId === alert.id;
          const isSelected = selectedAlertId === alert.id;
          
          let pingColor = 'bg-primary';
          let glowClass = 'glow-active';
          let hexColor = '#2563eb';
          
          if (alert.severity === 'critical') {
            pingColor = 'bg-error';
            glowClass = 'glow-alert';
            hexColor = '#ffb4ab';
          } else if (alert.severity === 'warning') {
            pingColor = 'bg-secondary';
            glowClass = 'glow-active';
            hexColor = '#4cd7f6';
          }

          return (
            <div
              key={`ping-${alert.id}`}
              style={{ top: `${alert.coordinates.y}%`, left: `${alert.coordinates.x}%` }}
              className="absolute -translate-x-1/2 -translate-y-1/2 flex flex-col items-center justify-center pointer-events-auto z-10 group"
            >
              {/* Pulsing Radar Hot Ping Button */}
              <button
                onMouseEnter={() => setHoveredAlertId(alert.id)}
                onMouseLeave={() => setHoveredAlertId(null)}
                onClick={() => setSelectedAlertId(isSelected ? null : alert.id)}
                className={`relative flex items-center justify-center p-2 rounded-full cursor-pointer transition-all duration-300 ${
                  isHovered || isSelected
                    ? `${pingColor}/30 ring-2 ring-current scale-125 ${glowClass}`
                    : 'bg-black/40 hover:bg-black/60 hover:scale-110 border border-outline-variant/30'
                }`}
                style={{ color: hexColor }}
              >
                <span className="material-symbols-outlined text-[16px] select-none text-current">
                  {alert.severity === 'critical' ? 'warning' : alert.type === 'Fuel Alert' ? 'eco' : 'local_shipping'}
                </span>

                {/* Animated Outer Ping Radial Waves */}
                <div
                  className={`absolute rounded-full pulse-marker pointer-events-none -z-10 ${
                    isHovered || isSelected ? 'w-10 h-10' : 'w-7 h-7'
                  } ${pingColor}/25`}
                />
                
                {isHovered && (
                  <span className={`absolute inset-0 rounded-full bg-transparent border-2 border-current animate-ping pointer-events-none scale-150 opacity-75`} />
                )}
              </button>

              {/* Floating vehicle ID badge above or below ping */}
              <div className={`absolute bottom-full mb-1.5 px-2 py-0.5 rounded text-[10px] font-bold font-data-tabular bg-black/80 border text-on-surface select-none pointer-events-none transition-all duration-300 shadow-lg ${
                isHovered || isSelected ? 'border-primary/50 text-primary scale-110 -translate-y-0.5' : 'border-outline-variant/30 text-on-surface-variant'
              }`}>
                {alert.vehicleId}
              </div>

              {/* Floating Map Info Card Tooltip */}
              <div
                className={`absolute top-full mt-2 w-48 p-2.5 glass-panel rounded-lg shadow-2xl pointer-events-none transition-all duration-300 flex flex-col gap-1 border border-outline-variant/20 ${
                  isHovered || isSelected
                    ? 'opacity-100 translate-y-0 visible z-30 scale-100'
                    : 'opacity-0 -translate-y-2 invisible'
                }`}
              >
                <div className="flex justify-between items-center border-b border-white/5 pb-1">
                  <span className="font-data-tabular text-data-tabular text-primary font-bold">
                    {alert.id}
                  </span>
                  <span className={`text-[8px] font-bold uppercase px-1.5 py-0.25 rounded ${
                    alert.severity === 'critical'
                      ? 'bg-error/20 text-error'
                      : alert.severity === 'warning'
                      ? 'bg-secondary/20 text-secondary'
                      : 'bg-primary/20 text-primary'
                  }`}>
                    {severityMap[alert.severity]}
                  </span>
                </div>
                <p className="text-[10px] font-bold text-on-surface leading-tight truncate">
                  {alertTypeMap[alert.type]} - {alert.vehicleId}
                </p>
                <p className="text-[9px] text-on-surface-variant leading-snug">
                  {alert.location}
                </p>
                <div className="flex justify-between items-center mt-1 pt-1 border-t border-white/5 text-[9px] font-semibold text-secondary">
                  <span>{alert.driverName}</span>
                  <span className="font-bold">{alert.telemetryValue}</span>
                </div>
              </div>

              {/* Holographic Radar Radial Ring System */}
              {(isHovered || isSelected) && (
                <svg className="absolute w-[300px] h-[300px] -z-10 pointer-events-none opacity-20 animate-pulse">
                  <circle
                    cx="150"
                    cy="150"
                    r="40"
                    fill="none"
                    stroke={hexColor}
                    strokeWidth="1"
                    strokeDasharray="4 4"
                  />
                  <circle
                    cx="150"
                    cy="150"
                    r="80"
                    fill="none"
                    stroke={hexColor}
                    strokeWidth="0.5"
                    strokeDasharray="2 6"
                  />
                </svg>
              )}
            </div>
          );
        })}
      </div>

      {/* 2. Interactive Columns Overlay Panels */}
      <div className="flex flex-col gap-gutter h-full min-h-0 relative z-10 pointer-events-none">
        
        {/* Empty Header spacing (reserved for layout title and searches) */}
        <div className="pointer-events-none h-4 shrink-0" />

        {/* Main Columns Bento Layout */}
        <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-gutter min-h-0 relative">
          
          {/* LEFT BENTO COLUMN (col-span-3): Category Filters & Statistics */}
          <div className="lg:col-span-3 pointer-events-auto h-full min-h-0 flex flex-col gap-gutter text-left">
            
            {/* Quick Stats Panel */}
            <div className="glass-panel rounded-xl p-4 flex flex-col gap-3.5 relative overflow-hidden select-none shrink-0 border border-outline-variant/10">
              <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 rounded-full blur-2xl -mr-10 -mt-10 pointer-events-none" />
              
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-primary text-[18px]">security</span>
                <span className="font-label-caps text-label-caps text-on-surface-variant uppercase text-[10px] tracking-wider font-bold">
                  Thống kê Phòng Điều khiển
                </span>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div className="bg-white/5 border border-white/5 rounded-lg p-2 flex flex-col items-center">
                  <span className="text-[9px] font-bold text-on-surface-variant uppercase">Hoạt Động</span>
                  <span className="font-data-tabular text-headline-sm font-bold text-on-surface mt-0.5">{totalCount}</span>
                </div>
                <div className="bg-error/10 border border-error/10 rounded-lg p-2 flex flex-col items-center">
                  <span className="text-[9px] font-bold text-error uppercase">Nguy Cấp</span>
                  <span className="font-data-tabular text-headline-sm font-bold text-error mt-0.5 animate-pulse">{criticalCount}</span>
                </div>
                <div className="bg-secondary/10 border border-secondary/10 rounded-lg p-2 flex flex-col items-center">
                  <span className="text-[9px] font-bold text-secondary uppercase">Cảnh Báo</span>
                  <span className="font-data-tabular text-headline-sm font-bold text-secondary mt-0.5">{warningCount}</span>
                </div>
              </div>
            </div>

            {/* Severity Filters Panel */}
            <div className="glass-panel rounded-xl p-4 flex flex-col gap-3 select-none shrink-0 border border-outline-variant/10">
              <span className="font-label-caps text-label-caps text-on-surface-variant uppercase text-[10px] tracking-wider font-bold">
                Lọc theo Độ Nghiêm Trọng
              </span>

              <div className="flex flex-col gap-2.5 font-body-md text-sm font-semibold">
                <label className="flex items-center justify-between p-2 rounded bg-error/5 border border-error/10 cursor-pointer hover:bg-error/10 transition-colors">
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      className="rounded border-outline-variant bg-black/30 text-error focus:ring-error focus:ring-offset-0 focus:ring-1"
                      checked={selectedSeverity.critical}
                      onChange={() => toggleSeverity('critical')}
                    />
                    <span className="text-error flex items-center gap-1">
                      <span className="material-symbols-outlined text-[16px] animate-pulse">warning</span>
                      Sự cố Nguy cấp
                    </span>
                  </div>
                  <span className="font-data-tabular text-xs text-error/80 px-1.5 py-0.25 bg-error/20 rounded font-bold">
                    {alerts.filter(a => a.severity === 'critical').length}
                  </span>
                </label>

                <label className="flex items-center justify-between p-2 rounded bg-secondary/5 border border-secondary/10 cursor-pointer hover:bg-secondary/10 transition-colors">
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      className="rounded border-outline-variant bg-black/30 text-secondary focus:ring-secondary focus:ring-offset-0 focus:ring-1"
                      checked={selectedSeverity.warning}
                      onChange={() => toggleSeverity('warning')}
                    />
                    <span className="text-secondary flex items-center gap-1">
                      <span className="material-symbols-outlined text-[16px]">notifications_active</span>
                      Cảnh báo Độ cận
                    </span>
                  </div>
                  <span className="font-data-tabular text-xs text-secondary/80 px-1.5 py-0.25 bg-secondary/20 rounded font-bold">
                    {alerts.filter(a => a.severity === 'warning').length}
                  </span>
                </label>

                <label className="flex items-center justify-between p-2 rounded bg-primary/5 border border-primary/10 cursor-pointer hover:bg-primary/10 transition-colors">
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      className="rounded border-outline-variant bg-black/30 text-primary focus:ring-primary focus:ring-offset-0 focus:ring-1"
                      checked={selectedSeverity.info}
                      onChange={() => toggleSeverity('info')}
                    />
                    <span className="text-primary flex items-center gap-1">
                      <span className="material-symbols-outlined text-[16px]">info</span>
                      Thông tin Bổ sung
                    </span>
                  </div>
                  <span className="font-data-tabular text-xs text-primary/80 px-1.5 py-0.25 bg-primary/20 rounded font-bold">
                    {alerts.filter(a => a.severity === 'info').length}
                  </span>
                </label>
              </div>
            </div>

            {/* Category Checkbox Panel */}
            <div className="glass-panel rounded-xl p-4 flex flex-col gap-3 select-none flex-1 min-h-0 overflow-y-auto border border-outline-variant/10">
              <div className="flex justify-between items-center pb-2 border-b border-white/5">
                <span className="font-label-caps text-label-caps text-on-surface-variant uppercase text-[10px] tracking-wider font-bold">
                  Lọc theo Danh mục
                </span>
                
                <button
                  onClick={resetFilters}
                  className="text-[10px] font-bold text-secondary hover:text-primary transition-colors flex items-center gap-1 active:scale-[0.98]"
                >
                  <span className="material-symbols-outlined text-[12px]">restart_alt</span>
                  LÀM MỚI
                </button>
              </div>

              <div className="flex flex-col gap-2 pr-1">
                {(Object.keys(selectedCategories) as Array<keyof typeof selectedCategories>).map((category) => {
                  const isChecked = selectedCategories[category];
                  const count = alerts.filter(a => a.type === category).length;
                  
                  return (
                    <label
                      key={category}
                      className={`flex items-center justify-between p-2.5 rounded-lg border transition-all cursor-pointer select-none ${
                        isChecked
                          ? 'bg-surface-variant/20 border-white/10 text-on-surface'
                          : 'bg-transparent border-white/5 text-on-surface-variant opacity-60 hover:opacity-80'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <input
                          type="checkbox"
                          className="rounded border-outline-variant bg-black/30 text-secondary focus:ring-secondary focus:ring-offset-0 focus:ring-1"
                          checked={isChecked}
                          onChange={() => toggleCategory(category)}
                        />
                        <span className="text-body-md text-xs font-semibold">
                          {alertTypeMap[category]}
                        </span>
                      </div>
                      <span className="font-data-tabular text-[10px] bg-white/5 px-1.5 py-0.5 rounded font-semibold text-on-surface-variant">
                        {count}
                      </span>
                    </label>
                  );
                })}
              </div>
            </div>

          </div>

          {/* MIDDLE AREA (col-span-5): Clean Map Viewport (pointer-events-none) */}
          <div className="lg:col-span-5 pointer-events-none h-full" />

          {/* RIGHT BENTO COLUMN (col-span-4): Real-time Alerts Feed list */}
          <div className="lg:col-span-4 glass-panel rounded-xl pointer-events-auto h-full max-h-full overflow-hidden flex flex-col border border-outline-variant/10">
            
            {/* Header section */}
            <div className="p-4 border-b border-outline-variant/10 bg-surface/40 flex justify-between items-center shrink-0">
              <h3 className="font-headline-sm text-headline-sm text-on-surface font-semibold flex items-center gap-2 select-none">
                <span className="w-2 h-2 rounded-full bg-error animate-pulse inline-block" />
                Nguồn Sự Cố Trực Tiếp
              </h3>
              
              <div className="flex items-center gap-2 text-xs font-semibold font-data-tabular">
                <span className="px-2 py-0.5 bg-white/5 border border-white/10 rounded text-on-surface-variant">
                  {filteredAlerts.length} Đang hoạt động / {alerts.length} Tổng số
                </span>
              </div>
            </div>

            {/* Scrollable alert list */}
            <div className="flex-1 overflow-y-auto p-2 flex flex-col gap-2">
              {filteredAlerts.length === 0 ? (
                <div className="p-8 text-center text-on-surface-variant select-none">
                  <span className="material-symbols-outlined text-[48px] opacity-40 mb-2 block">
                    check_circle_outline
                  </span>
                  Không có cảnh báo hoạt động nào trùng khớp. Hệ thống đang vận hành trơn tru.
                </div>
              ) : (
                filteredAlerts.map((alert) => {
                  const isHovered = hoveredAlertId === alert.id;
                  const isSelected = selectedAlertId === alert.id;
                  
                  let borderGlow = 'border-outline-variant/20 hover:border-primary/50';
                  let borderLeft = 'border-l-4 border-l-primary';
                  let badgeBg = 'bg-primary/20 text-primary border border-primary/30';
                  
                  if (alert.severity === 'critical') {
                    borderGlow = isHovered || isSelected ? 'border-error/60 shadow-[0_0_15px_rgba(239,68,68,0.15)] bg-error/5' : 'border-error/25 hover:border-error/50';
                    borderLeft = 'border-l-4 border-l-error';
                    badgeBg = 'bg-error/20 text-error border border-error/30';
                  } else if (alert.severity === 'warning') {
                    borderGlow = isHovered || isSelected ? 'border-secondary/60 shadow-[0_0_15px_rgba(76,215,246,0.15)] bg-secondary/5' : 'border-secondary/25 hover:border-secondary/50';
                    borderLeft = 'border-l-4 border-l-secondary';
                    badgeBg = 'bg-secondary/15 text-secondary border border-secondary/30';
                  } else {
                    if (isHovered || isSelected) {
                      borderGlow = 'border-primary/60 shadow-[0_0_15px_rgba(37,99,235,0.15)] bg-primary/5';
                    }
                  }

                  return (
                    <div
                      key={alert.id}
                      onMouseEnter={() => setHoveredAlertId(alert.id)}
                      onMouseLeave={() => setHoveredAlertId(null)}
                      className={`glass-panel rounded-lg p-3.5 transition-all duration-300 relative overflow-hidden flex flex-col gap-3 text-left ${borderGlow} ${borderLeft} ${
                        isSelected ? 'bg-surface-variant/25' : 'bg-surface-container-low/70'
                      }`}
                    >
                      {/* Top Row: Meta info */}
                      <div className="flex justify-between items-start select-none">
                        <div className="flex items-center gap-2">
                          <span className="font-data-tabular text-data-tabular text-primary font-bold text-xs">
                            {alert.id}
                          </span>
                          
                          <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold font-label-caps uppercase ${badgeBg}`}>
                            {alertTypeMap[alert.type]}
                          </span>
                        </div>
                        
                        <div className="flex items-center gap-1.5 text-[10px] text-on-surface-variant font-medium">
                          <span className="material-symbols-outlined text-[12px]">schedule</span>
                          {alert.timestamp}
                        </div>
                      </div>

                      {/* Middle: Description */}
                      <div className="flex flex-col gap-1">
                        <p className="text-xs text-on-surface font-semibold flex items-center justify-between">
                          <span>Phương tiện {alert.vehicleId} ({alert.driverName})</span>
                          <span className="font-bold text-secondary font-data-tabular text-[11px] bg-black/40 px-2 py-0.5 rounded border border-white/5">
                            {alert.telemetryValue}
                          </span>
                        </p>
                        
                        <p className={`text-[11px] leading-snug text-on-surface-variant transition-all duration-300 ${
                          isSelected ? 'line-clamp-none' : 'line-clamp-2'
                        }`}>
                          {alert.description}
                        </p>
                      </div>

                      {/* GPS Route Detail Line */}
                      <div className="flex items-center gap-1.5 text-[10px] text-on-surface-variant/80 select-none">
                        <span className="material-symbols-outlined text-[13px] text-secondary">location_on</span>
                        <span className="truncate font-semibold">{alert.location}</span>
                      </div>

                      {/* Actions Trigger Panel */}
                      <div className="flex items-center justify-between gap-2 mt-1 border-t border-white/5 pt-3 select-none">
                        
                        <button
                          onClick={() => setSelectedAlertId(isSelected ? null : alert.id)}
                          className="text-[10px] font-bold text-on-surface-variant hover:text-primary transition-colors flex items-center gap-1 active:scale-[0.98]"
                        >
                          <span className="material-symbols-outlined text-[14px]">
                            {isSelected ? 'expand_less' : 'expand_more'}
                          </span>
                          {isSelected ? 'THU GỌN' : 'CHI TIẾT'}
                        </button>

                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleSilenceAlert(alert.id, alert.vehicleId)}
                            className="bg-white/5 hover:bg-white/10 text-on-surface border border-outline-variant/30 text-[10px] font-bold px-2.5 py-1 rounded transition-all active:scale-[0.98]"
                          >
                            XÁC NHẬN
                          </button>

                          {alert.severity === 'critical' ? (
                            <button
                              onClick={() => setEscalatingAlert(alert)}
                              className="bg-error hover:brightness-110 text-white shadow-[0_0_10px_rgba(239,68,68,0.3)] text-[10px] font-bold px-2.5 py-1 rounded transition-all active:scale-[0.98]"
                            >
                              LEO THANG
                            </button>
                          ) : (
                            <button
                              onClick={() => {
                                // Pivot dispatcher to Map tracing or active order driver assignment matrix!
                                if (alert.type === 'Route Deviation' || alert.type === 'Long Stop') {
                                  setActiveTab('Live Tracking');
                                  setToastMessage(`Bộ điều phối AI: Đã kích hoạt giám sát định vị GPS cho sự sai lệch trên xe ${alert.vehicleId}.`);
                                } else {
                                  setActiveTab('Assign Driver');
                                  setToastMessage(`Bộ điều phối AI: Đã chuyển sang bảng phân phối. Vui lòng phân bổ lại xe ${alert.vehicleId}.`);
                                }
                              }}
                              className="bg-secondary/20 hover:bg-secondary/30 text-secondary border border-secondary/40 text-[10px] font-bold px-2.5 py-1 rounded transition-all active:scale-[0.98]"
                            >
                              BỐ TRÍ LẠI
                            </button>
                          )}
                        </div>

                      </div>

                      {/* Expanded Details Sub-Panel */}
                      {isSelected && (
                        <div className="mt-2 border-t border-white/5 pt-3 flex flex-col gap-2 text-xs font-semibold animate-fade-in">
                          <div className="grid grid-cols-2 gap-2 font-data-tabular">
                            <div className="bg-black/30 p-2 rounded border border-white/5 flex flex-col">
                              <span className="text-[8px] font-bold uppercase text-on-surface-variant">Lộ trình Điều phối Hoạt động</span>
                              <span className="text-[10px] truncate text-primary mt-0.5">{alert.routePlan}</span>
                            </div>
                            <div className="bg-black/30 p-2 rounded border border-white/5 flex flex-col">
                              <span className="text-[8px] font-bold uppercase text-on-surface-variant">Mã Hành động Điều phối</span>
                              <span className="text-[10px] text-secondary mt-0.5">{alert.severity === 'critical' ? 'KÍCH HOẠT-ALPHA' : 'ỔN ĐỊNH-BETA'}</span>
                            </div>
                          </div>
                          
                          <div className="bg-black/30 p-2.5 rounded border border-white/5 flex items-center gap-3">
                            <img
                              src={alert.driverAvatar}
                              alt={alert.driverName}
                              className="w-8 h-8 rounded-full border border-white/10 object-cover"
                            />
                            <div className="flex-1 flex flex-col">
                              <span className="text-on-surface text-[11px] font-bold">{alert.driverName}</span>
                              <span className="text-[9px] text-on-surface-variant">Thiết bị Di động Đang Hoạt động</span>
                            </div>
                            <button
                              onClick={() => setToastMessage(`Kết nối Vệ tinh: Đã thiết lập cuộc gọi thoại an toàn tới ${alert.driverName}.`)}
                              className="bg-primary/20 hover:bg-primary/30 text-primary border border-primary/30 p-1.5 rounded-full transition-all active:scale-[0.95]"
                            >
                              <span className="material-symbols-outlined text-[14px]">call</span>
                            </button>
                          </div>
                        </div>
                      )}

                    </div>
                  );
                })
              )}
            </div>

            {/* Quick Actions Footer Panel */}
            <div className="p-3 border-t border-outline-variant/10 bg-surface/40 shrink-0 select-none flex gap-2">
              <button
                onClick={() => {
                  setToastMessage('Chẩn đoán Hệ thống AI: Đã khởi chạy kiểm tra thông số đo lường toàn diện trên tất cả các nút lộ trình đang hoạt động.');
                }}
                className="flex-1 py-2 bg-white/5 hover:bg-white/10 border border-outline-variant/30 rounded-lg text-on-surface font-label-caps text-[10px] font-bold transition-colors flex items-center justify-center gap-1 active:scale-[0.98]"
              >
                <span className="material-symbols-outlined text-[13px]">analytics</span>
                KIỂM TRA HỆ THỐNG
              </button>

              <button
                onClick={() => {
                  setActiveTab('Fleet Monitoring');
                  setToastMessage('Trung tâm Điều phối: Đã chuyển sang bảng điều khiển chỉ số sức khỏe đội xe.');
                }}
                className="flex-1 py-2 bg-primary/15 hover:bg-primary/25 border border-primary/30 rounded-lg text-primary font-label-caps text-[10px] font-bold transition-colors flex items-center justify-center gap-1 active:scale-[0.98]"
              >
                <span className="material-symbols-outlined text-[13px]">monitor_heart</span>
                CHỈ SỐ ĐỘI XE <span className="material-symbols-outlined text-[12px]">arrow_forward</span>
              </button>
            </div>

          </div>

        </div>

      </div>

      {/* 3. DYNAMIC Emergency Escalation Glassmorphic Modal Overlay */}
      {escalatingAlert && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-fade-in pointer-events-auto">
          <div className="w-full max-w-lg glass-panel rounded-xl overflow-hidden border border-error/45 shadow-[0_0_50px_rgba(239,68,68,0.25)] animate-scale-up">
            
            {/* Modal Header */}
            <div className="p-4 border-b border-error/30 flex justify-between items-center bg-error-container/20 select-none">
              <h3 className="font-headline-sm text-headline-sm font-bold text-error flex items-center gap-2.5">
                <span className="material-symbols-outlined text-[22px] text-error animate-pulse">warning</span>
                Leo thang Hoạt động Chiến thuật
              </h3>
              
              <button
                onClick={() => setEscalatingAlert(null)}
                className="text-on-surface-variant hover:text-error transition-colors p-1"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-5 flex flex-col gap-4 text-left font-body-md">
              
              {/* Highlight summary alert panel */}
              <div className="bg-error/10 border border-error/25 p-4 rounded-lg flex items-start gap-3">
                <span className="material-symbols-outlined text-error text-[24px] mt-0.5 animate-bounce">emergency</span>
                <div>
                  <p className="text-on-surface font-bold text-sm mb-1 uppercase tracking-wide">
                    Sự cố Nguy cấp: {escalatingAlert.id} - {alertTypeMap[escalatingAlert.type]}
                  </p>
                  <p className="text-[11px] text-on-surface-variant leading-snug">
                    Ghi nhận chỉ số đo lường từ xa không an toàn cho phương tiện <span className="font-semibold text-on-surface font-data-tabular">{escalatingAlert.vehicleId}</span> của tài xế <span className="font-semibold text-on-surface">{escalatingAlert.driverName}</span> tại vị trí: <span className="font-semibold text-secondary">{escalatingAlert.location}</span>.
                  </p>
                </div>
              </div>

              {/* Protocol selector */}
              <div className="flex flex-col gap-1.5 select-none">
                <span className="text-[10px] font-label-caps text-on-surface-variant uppercase font-bold tracking-wider">
                  Chọn Nghị định thư Khẩn cấp Điều phối
                </span>
                
                <div className="grid grid-cols-1 gap-2">
                  {[
                    'Nghị định thư 9-ALPHA: Điều phối Hộ tống An toàn',
                    'Nghị định thư 4-BETA: Chặn Tốc độ & Khóa Giới hạn',
                    'Nghị định thư 12-DELTA: Tiếp nhiên liệu & Hỗ trợ Sạc trên Tuyến',
                    'Thông báo cho Cảnh sát Giao thông / Dịch vụ Khẩn cấp'
                  ].map((proto) => {
                    const isSelected = escalationProtocol === proto;
                    return (
                      <button
                        key={proto}
                        onClick={() => setEscalationProtocol(proto)}
                        className={`w-full text-left p-3 rounded-lg border text-xs font-semibold transition-all ${
                          isSelected
                            ? 'bg-error/15 border-error/60 text-error shadow-[inset_5px_0_10px_-5px_rgba(239,68,68,0.5)]'
                            : 'bg-black/30 border-white/5 text-on-surface-variant hover:bg-white/5'
                        }`}
                      >
                        {proto}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Incident Notes */}
              <div className="flex flex-col gap-1.5">
                <span className="text-[10px] font-label-caps text-on-surface-variant uppercase font-bold tracking-wider">
                  Ghi chú Hành động Điều phối Sự cố
                </span>
                <textarea
                  className="w-full h-20 bg-black/40 border border-outline-variant/40 rounded-lg p-3 text-xs text-on-surface focus:outline-none focus:ring-1 focus:ring-error/50 focus:border-error/50 transition-all placeholder-on-surface-variant/40"
                  placeholder="Nhập ghi chú điều phối, điểm đến định hướng lại hoặc lệnh hỗ trợ..."
                  value={escalationNote}
                  onChange={(e) => setEscalationNote(e.target.value)}
                />
              </div>

              {/* Buttons */}
              <div className="grid grid-cols-2 gap-3 mt-2 select-none">
                <button
                  onClick={() => setEscalatingAlert(null)}
                  className="w-full bg-white/5 hover:bg-white/10 border border-outline-variant/30 text-on-surface-variant py-2.5 rounded-lg text-xs font-bold transition-all"
                >
                  HUY / ĐÌNH CHỈ
                </button>

                <button
                  onClick={handleEscalationSubmit}
                  className="w-full bg-error text-white py-2.5 rounded-lg text-xs font-bold tracking-wider hover:brightness-110 active:scale-[0.98] transition-all shadow-[0_0_15px_rgba(239,68,68,0.4)] flex items-center justify-center gap-1.5"
                >
                  <span className="material-symbols-outlined text-[16px]">support_agent</span>
                  THỰC THI ĐIỀU PHỐI CHIẾN THUẬT
                </button>
              </div>

            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default AlertsTab;
