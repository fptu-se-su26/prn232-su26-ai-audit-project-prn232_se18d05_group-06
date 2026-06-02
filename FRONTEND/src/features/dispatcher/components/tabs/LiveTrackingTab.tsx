import React, { useState, useEffect } from 'react';

interface Coord {
  x: number;
  y: number;
}

interface TrackingVehicle {
  id: string;
  name: string;
  status: 'DRIVING' | 'SPEEDING' | 'IDLE' | 'MAINTENANCE';
  colorClass: string;
  borderColorClass: string;
  glowColorClass: string;
  icon: string;
  speed: number;
  fuel: number;
  destination: string;
  path: Coord[];
  driverName?: string;
  eta?: string;
  idleTime?: string;
}

const TRACKING_VEHICLES: TrackingVehicle[] = [
  {
    id: 'TRK-902',
    name: 'TRK-902',
    status: 'DRIVING',
    colorClass: 'text-status-green',
    borderColorClass: 'border-status-green',
    glowColorClass: 'shadow-[0_0_15px_rgba(34,197,94,0.5)] bg-status-green/20',
    icon: 'local_shipping',
    speed: 62,
    fuel: 85,
    destination: 'Trung tâm Phân phối A',
    driverName: 'J. Smith',
    eta: '14:30 PST',
    path: [
      { x: 20, y: 70 },
      { x: 25, y: 55 },
      { x: 30, y: 40 }
    ]
  },
  {
    id: 'VNC-414',
    name: 'VNC-414',
    status: 'IDLE',
    colorClass: 'text-status-orange',
    borderColorClass: 'border-status-orange',
    glowColorClass: 'shadow-[0_0_15px_rgba(249,115,22,0.5)] bg-status-orange/20',
    icon: 'local_shipping',
    speed: 0,
    fuel: 72,
    destination: 'Cảng biển Terminal (Phân khu 7)',
    idleTime: '14ph 22s',
    path: [
      { x: 60, y: 55 }
    ]
  },
  {
    id: 'TX-882',
    name: 'TX-882',
    status: 'SPEEDING',
    colorClass: 'text-status-red',
    borderColorClass: 'border-status-red',
    glowColorClass: 'shadow-[0_0_15px_rgba(239,68,68,0.5)] bg-status-red/20',
    icon: 'local_shipping',
    speed: 75,
    fuel: 58,
    destination: 'Trung tâm Phân phối C',
    driverName: 'R. Davis',
    eta: '12:15 PST',
    path: [
      { x: 45, y: 55 },
      { x: 58, y: 40 },
      { x: 70, y: 25 }
    ]
  }
];

const interpolatePath = (path: Coord[], progress: number): Coord => {
  if (path.length === 1) return path[0];
  const totalSegments = path.length - 1;
  const rawIndex = (progress / 100) * totalSegments;
  const index = Math.min(totalSegments - 1, Math.floor(rawIndex));
  const segmentProgress = rawIndex - index;
  const p1 = path[index];
  const p2 = path[index + 1];
  return {
    x: p1.x + (p2.x - p1.x) * segmentProgress,
    y: p1.y + (p2.y - p1.y) * segmentProgress,
  };
};

const formatProgressTime = (progress: number) => {
  const totalSeconds = Math.floor((progress / 100) * 43200);
  const totalMinutes = Math.floor(totalSeconds / 60);
  const rawHour = 8 + Math.floor(totalMinutes / 60);
  const h = rawHour > 12 ? rawHour - 12 : rawHour;
  const m = totalMinutes % 60;
  const period = rawHour >= 12 ? 'CH' : 'SA';
  return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')} ${period}`;
};

const getDynamicVehicleState = (vehicle: TrackingVehicle, progress: number) => {
  const currentPos = interpolatePath(vehicle.path, progress);
  let status = vehicle.status;
  let speed = vehicle.speed;
  let colorClass = vehicle.colorClass;
  let borderColorClass = vehicle.borderColorClass;
  let glowColorClass = vehicle.glowColorClass;

  if (vehicle.id === 'TX-882') {
    if (progress >= 35 && progress <= 65) {
      status = 'SPEEDING';
      speed = 75;
      colorClass = 'text-status-red';
      borderColorClass = 'border-status-red';
      glowColorClass = 'shadow-[0_0_15px_rgba(239,68,68,0.5)] bg-status-red/20';
    } else {
      status = 'DRIVING';
      speed = 60;
      colorClass = 'text-status-green';
      borderColorClass = 'border-status-green';
      glowColorClass = 'shadow-[0_0_15px_rgba(34,197,94,0.5)] bg-status-green/20';
    }
  } else if (vehicle.id === 'TRK-902') {
    const currentFuel = Math.max(50, Math.round(85 - (progress / 100) * 8));
    return {
      ...vehicle,
      ...currentPos,
      fuel: currentFuel,
      speed: 60 + Math.round(Math.sin(progress / 5) * 4),
    };
  }

  return {
    ...vehicle,
    ...currentPos,
    status,
    speed,
    colorClass,
    borderColorClass,
    glowColorClass,
  };
};

interface LiveTrackingTabProps {
  searchQuery: string;
  setToastMessage: (msg: string | null) => void;
}

export const LiveTrackingTab: React.FC<LiveTrackingTabProps> = ({ searchQuery, setToastMessage }) => {
  const [liveTrackingProgress, setLiveTrackingProgress] = useState(30.83); // 11:42 AM
  const [isTrackingPlaying, setIsTrackingPlaying] = useState(false);
  const [liveTrackingSpeed, setLiveTrackingSpeed] = useState<1 | 4>(1); // 1x or 4x
  const [selectedTrackingVehicle, setSelectedTrackingVehicle] = useState<string | null>(null);
  const [trackingAlerts, setTrackingAlerts] = useState([
    {
      id: 'alert-speeding',
      type: 'speeding',
      vehicleId: 'TX-882',
      title: 'Cảnh báo lệch Tốc độ',
      description: 'Phương tiện TX-882 vượt quá giới hạn 15mph trên Tuyến 66.',
      colorClass: 'border-error/30 shadow-[0_0_15px_rgba(255,180,171,0.3)]',
      textColor: 'text-error',
      icon: 'speed',
    }
  ]);

  // Live Tracking playback simulator loop
  useEffect(() => {
    let timer: ReturnType<typeof setInterval>;
    if (isTrackingPlaying) {
      timer = setInterval(() => {
        setLiveTrackingProgress((prev) => {
          const next = prev + 0.1 * liveTrackingSpeed;
          if (next >= 100) {
            return 0; // loops back
          }
          return next;
        });
      }, 100);
    }
    return () => clearInterval(timer);
  }, [isTrackingPlaying, liveTrackingSpeed]);

  // Filters mapping - Live Tracking Vehicles
  const filteredTrackingVehicles = TRACKING_VEHICLES.map((v) =>
    getDynamicVehicleState(v, liveTrackingProgress)
  ).filter((v) => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return true;
    return (
      v.id.toLowerCase().includes(q) ||
      v.destination.toLowerCase().includes(q) ||
      v.status.toLowerCase().includes(q)
    );
  });

  return (
    <div className="absolute inset-0 z-0 h-full w-full overflow-hidden flex flex-col pointer-events-none rounded-xl">
      {/* Base Map Layer */}
      <div className="absolute inset-0 z-0 bg-surface-dim overflow-hidden">
        {/* Simulated Dark Mode Map Texture */}
        <img
          alt="Map Background"
          className="w-full h-full object-cover opacity-40 mix-blend-screen transition-all duration-500"
          src="https://lh3.googleusercontent.com/aida-public/AB6AXuAhADheHjnCBLzcxKVvbXmRGLaZgt89uO1-t3q2_zygl0RJ_8e5opFxRhpfi7MKCzzqF2eDEJaya3kDCHVB93fGHQuK6DvtK_EyaXrI30kKCW6mMJh14-baZAa5464t-B2NzsPU33gv0v4mz3Sw0-NMU9gQ-ilHmeeKT8ib4oh8eWxcYHoHFqowDk9rs2FDSh4SInWGcxbFvxOkkyV22qXHsBnV4Y7K9ZPXCy5iBVQaSSRjwNg5GaCn_ygttebMoE8kwCQynaOS2VmC"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-surface-container-lowest via-transparent to-transparent pointer-events-none" />
        
        {/* SVG Grid Overlay for "Mission Control" feel */}
        <div
          className="absolute inset-0 z-10 pointer-events-none opacity-10"
          style={{
            backgroundImage: 'linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)',
            backgroundSize: '40px 40px'
          }}
        />
      </div>

      {/* Interactive HUD Elements wrapper */}
      <div className="absolute inset-0 z-20 pointer-events-auto flex flex-col justify-between p-4 md:p-6">
        
        {/* Top Row: Stats Overview & Speed Alerts */}
        <div className="flex justify-between items-start w-full select-none">
          
          {/* Left: Global Fleet Status Widget */}
          <div className="glass-panel rounded-xl p-4 w-[280px]">
            <h2 className="font-label-caps text-label-caps text-on-surface-variant mb-3 flex items-center gap-2">
              <span className="material-symbols-outlined text-[16px]">radar</span> Trạng thái Hạm đội
            </h2>
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-surface-container/50 rounded-lg p-3 border border-outline-variant/10">
                <span className="font-data-tabular text-data-tabular text-secondary block font-bold text-lg">142</span>
                <span className="font-label-caps text-[10px] text-on-surface-variant uppercase tracking-wider">Hoạt động</span>
              </div>
              <div className="bg-surface-container/50 rounded-lg p-3 border border-outline-variant/10">
                <span className="font-data-tabular text-data-tabular text-tertiary block font-bold text-lg">18</span>
                <span className="font-label-caps text-[10px] text-on-surface-variant uppercase tracking-wider">Đang rảnh</span>
              </div>
            </div>
          </div>

          {/* Right: Floating Alert Notification */}
          {trackingAlerts.length > 0 && (
            <div
              className="glass-panel rounded-xl p-4 w-[320px] border-error/30 shadow-[0_0_15px_rgba(255,180,171,0.25)] animate-pulse cursor-pointer hover:scale-[1.01] transition-transform"
              onClick={() => {
                setSelectedTrackingVehicle('TX-882');
                setToastMessage('Đã khóa mục tiêu điều phối: Tập trung theo dõi lộ trình quá tốc độ của TX-882.');
              }}
            >
              <div className="flex items-start gap-3 text-left">
                <div className="w-8 h-8 rounded-full bg-error-container/20 flex items-center justify-center border border-error/50 flex-shrink-0">
                  <span className="material-symbols-outlined text-error text-[18px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                    speed
                  </span>
                </div>
                <div className="flex-1">
                  <div className="flex justify-between items-center">
                    <h3 className="font-headline-sm text-[14px] font-bold text-error uppercase tracking-wider">Lệch Tốc độ</h3>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setTrackingAlerts([]);
                        setToastMessage('Đã bỏ qua cảnh báo.');
                      }}
                      className="text-on-surface-variant hover:text-error transition-colors p-0.5"
                      title="Bỏ qua cảnh báo"
                    >
                      <span className="material-symbols-outlined text-[14px]">close</span>
                    </button>
                  </div>
                  <p className="font-body-md text-[12px] text-on-surface-variant mt-1 leading-snug">
                    Phương tiện TX-882 vượt quá giới hạn 15mph trên Tuyến 66.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Middle: Map Markers positioned relative to parent container */}
        <div className="absolute inset-0 pointer-events-none z-10 overflow-hidden">
          {filteredTrackingVehicles.map((vehicle) => {
            const isSelected = selectedTrackingVehicle === vehicle.id;
            const isSpeeding = vehicle.status === 'SPEEDING';
            
            return (
              <div
                key={vehicle.id}
                className="absolute pointer-events-auto group"
                style={{
                  top: `${vehicle.y}%`,
                  left: `${vehicle.x}%`,
                  transform: 'translate(-50%, -50%)',
                }}
              >
                {/* Glowing outer marker dot */}
                <div
                  className={`relative flex items-center justify-center w-6 h-6 rounded-full border cursor-pointer transition-all duration-300 ${
                    isSpeeding
                      ? 'bg-error/20 border-error marker-pulse shadow-[0_0_12px_rgba(255,180,171,0.5)] text-error'
                      : vehicle.status === 'IDLE'
                      ? 'bg-status-orange/20 border-status-orange text-status-orange'
                      : 'bg-secondary/20 border-secondary marker-pulse text-secondary'
                  }`}
                  onClick={() => setSelectedTrackingVehicle(isSelected ? null : vehicle.id)}
                >
                  <div
                    className={`w-2 h-2 rounded-full ${
                      isSpeeding ? 'bg-error' : vehicle.status === 'IDLE' ? 'bg-status-orange' : 'bg-secondary'
                    }`}
                  />
                </div>

                {/* Route Deviation Curve Line Overlay */}
                {vehicle.id === 'TX-882' && isSpeeding && (
                  <svg className="absolute top-3 left-3 w-32 h-32 pointer-events-none stroke-error/50" fill="none" viewBox="0 0 100 100">
                    <path
                      className="path-line"
                      d="M0,0 Q50,50 100,20"
                      strokeDasharray="4 4"
                      strokeWidth="2"
                    />
                  </svg>
                )}

                {/* Popup / Detail Tooltip Card */}
                <div className={`absolute bottom-full left-1/2 -translate-x-1/2 mb-3 w-[220px] glass-panel rounded-lg p-3 transition-all duration-300 shadow-xl z-50 ${
                  isSelected ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-1 scale-95 pointer-events-none group-hover:opacity-100 group-hover:translate-y-0 group-hover:scale-100 pointer-events-auto'
                }`}>
                  <div className="flex justify-between items-center border-b border-outline-variant/20 pb-2 mb-2 select-none">
                    <span className="font-data-tabular text-[13px] text-on-surface font-bold">{vehicle.id}</span>
                    <span className={`px-2 py-0.5 rounded text-[9px] font-label-caps border font-bold ${
                      isSpeeding
                        ? 'bg-error/10 text-error border-error/30 animate-pulse'
                        : vehicle.status === 'IDLE'
                        ? 'bg-status-orange/10 text-status-orange border-status-orange/30'
                        : 'bg-secondary/10 text-secondary border-secondary/30'
                    }`}>
                      {vehicle.status === 'DRIVING' ? 'ĐANG CHẠY' : vehicle.status === 'SPEEDING' ? 'QUÁ TỐC ĐỘ' : vehicle.status === 'IDLE' ? 'ĐANG RẢNH' : 'BẢO TRÌ'}
                    </span>
                  </div>

                  {vehicle.status === 'IDLE' ? (
                    <div className="text-[12px] text-on-surface-variant font-medium select-none text-left leading-normal">
                      Đang rảnh trong {vehicle.idleTime || '14ph 22s'}
                    </div>
                  ) : (
                    <div className="space-y-1.5 text-left">
                      <div className="flex justify-between text-[11px] select-none">
                        <span className="text-on-surface-variant font-medium">Tài xế:</span>
                        <span className="font-data-tabular text-on-surface font-semibold">{vehicle.driverName}</span>
                      </div>
                      <div className="flex justify-between text-[11px] select-none">
                        <span className="text-on-surface-variant font-medium">Tốc độ:</span>
                        <span className={`font-data-tabular font-bold ${isSpeeding ? 'text-error animate-pulse' : 'text-secondary text-shadow'}`}>
                          {vehicle.speed} mph
                        </span>
                      </div>
                      <div className="flex justify-between text-[11px] select-none">
                        <span className="text-on-surface-variant font-medium">Dự kiến (ETA):</span>
                        <span className="font-data-tabular text-on-surface font-semibold">{vehicle.eta}</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Bottom Row: Timeline Slider Controls */}
        <div className="glass-panel rounded-xl p-4 w-full pointer-events-auto mt-auto flex items-center gap-6 z-30 select-none">
          
          {/* Play/Pause Button */}
          <button
            onClick={() => setIsTrackingPlaying(!isTrackingPlaying)}
            className="w-10 h-10 rounded-full bg-primary/10 border border-primary/30 flex items-center justify-center text-primary hover:bg-primary/20 transition-colors flex-shrink-0 text-white"
            title={isTrackingPlaying ? 'Tạm dừng đo lường' : 'Phát đo lường'}
          >
            <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>
              {isTrackingPlaying ? 'pause' : 'play_arrow'}
            </span>
          </button>

          {/* Scrubber Range Timeline */}
          <div className="flex-1">
            <div className="flex justify-between mb-2 select-none">
              <span className="font-data-tabular text-[11px] text-on-surface-variant font-bold">08:00 SA</span>
              <span className="font-label-caps text-[11px] text-secondary font-bold">
                Thời gian thực: {formatProgressTime(liveTrackingProgress)}
              </span>
              <span className="font-data-tabular text-[11px] text-on-surface-variant font-bold">08:00 CH</span>
            </div>
            
            <div className="relative w-full h-2 bg-surface-container-high rounded-full overflow-hidden border border-outline-variant/20 flex items-center group">
              <input
                type="range"
                min="0"
                max="100"
                step="0.01"
                className="w-full h-full bg-transparent appearance-none cursor-pointer outline-none accent-secondary z-20"
                value={liveTrackingProgress}
                onChange={(e) => {
                  setLiveTrackingProgress(parseFloat(e.target.value));
                  if (isTrackingPlaying) setIsTrackingPlaying(false);
                }}
              />
              {/* Progress fill */}
              <div
                className="absolute top-0 left-0 h-full bg-secondary/80 rounded-full shadow-[0_0_10px_rgba(76,215,246,0.5)] z-10 pointer-events-none"
                style={{ width: `${liveTrackingProgress}%` }}
              />
              {/* Thumb indicator */}
              <div
                className="absolute top-1/2 -translate-y-1/2 w-3 h-3 bg-on-surface rounded-full shadow border border-surface-dim z-10 pointer-events-none"
                style={{ left: `calc(${liveTrackingProgress}% - 6px)` }}
              />
            </div>
          </div>

          {/* Speed multiplier triggers */}
          <div className="flex gap-2 flex-shrink-0">
            <button
              onClick={() => setLiveTrackingSpeed(1)}
              className={`px-3 py-1.5 rounded-lg border text-[11px] font-bold font-body-md transition select-none ${
                liveTrackingSpeed === 1
                  ? 'bg-secondary/20 text-secondary border-secondary shadow-[0_0_8px_rgba(76,215,246,0.3)]'
                  : 'border-outline-variant/30 text-on-surface-variant hover:bg-surface-variant/50'
              }`}
            >
              1x
            </button>
            <button
              onClick={() => setLiveTrackingSpeed(4)}
              className={`px-3 py-1.5 rounded-lg border text-[11px] font-bold font-body-md transition select-none ${
                liveTrackingSpeed === 4
                  ? 'bg-secondary/20 text-secondary border-secondary shadow-[0_0_8px_rgba(76,215,246,0.3)]'
                  : 'border-outline-variant/30 text-on-surface-variant hover:bg-surface-variant/50'
              }`}
            >
              4x
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};

export default LiveTrackingTab;
