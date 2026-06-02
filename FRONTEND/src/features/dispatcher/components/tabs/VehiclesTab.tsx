import React, { useState, useEffect } from 'react';

interface VehicleUnit {
  id: string;
  name: string;
  type: string;
  status: 'Active' | 'Alert' | 'Idle';
  img: string;
  capacityPercent: number;
  capacityText: string;
  fuelPercent: number;
  maintText: string;
  maintStatus: 'ok' | 'warning' | 'alert';
  // Technical live diagnostics
  engineTemp: number;
  oilPressure: number;
  batteryVoltage: number;
  dpfLevel: number;
  lat: number;
  lon: number;
  speed: number;
}

const INITIAL_VEHICLES: VehicleUnit[] = [
  {
    id: 'TRK-8492',
    name: 'Volvo FH16',
    type: 'Xe vận tải hạng nặng',
    status: 'Active',
    img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAhRsM2TlznkPIuzMGNeTy4rkLREL28LX2vZ4mvSjn6ET-OXDdaEyiy1EhAfnZFKbUJ8sgxyc6sjsCoqlVz8Cz-9Hb267kLaNfmDX6ryhyTEQ2E852MZWO3pKwxyhtVnera6HulDcZnKnD9Q44OT_dEmmrvchLnOA3nEjFMdfqfQBIz-Fs4qzmyOiKiExkIUTTytRjVfIIUT6MuA6i74dOQzqsb8NB3aGbOFfCm4LNs3PYKUIrVEdmzQODjR6ysYTSUW4D6cr0vqDr5',
    capacityPercent: 85,
    capacityText: '85% (24 tấn)',
    fuelPercent: 60,
    maintText: 'Bảo trì: TỐT',
    maintStatus: 'ok',
    engineTemp: 195,
    oilPressure: 42,
    batteryVoltage: 13.8,
    dpfLevel: 24,
    lat: 41.8781,
    lon: -87.6298,
    speed: 62
  },
  {
    id: 'TRK-1024',
    name: 'MB Sprinter',
    type: 'Xe van giao hàng',
    status: 'Alert',
    img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCdhNKh0-GzAhH3e6mggj2qnjPIY5WLiL3dtC8dEYS3DoFmd_c8FrkOQuB320RwdOh7jAEcNZbo-sDFE1qkwipLnRBnSXUETeG84yeKpQQmohyZbrgFofdEZU6BI0JXb0rrX78XhqeAFbsS_1KVZgiv-Dvqupt_bYBtwfE5LK_7Fxn7oVM3VLuy8nfA1tPEPiBnBclX_8irReX__gxkdgJEI4N5xOjkflnAw2jkWDc54_gD2BzYYLR9YHbRGkjhwcvHjQ1mB5B8rIQT',
    capacityPercent: 40,
    capacityText: '40% (1.2 tấn)',
    fuelPercent: 15,
    maintText: 'Đăng kiểm hết hạn',
    maintStatus: 'alert',
    engineTemp: 215,
    oilPressure: 34,
    batteryVoltage: 12.2,
    dpfLevel: 78,
    lat: 34.0522,
    lon: -118.2437,
    speed: 0
  },
  {
    id: 'TRK-5510',
    name: 'F-650 Box',
    type: 'Xe tải hạng trung',
    status: 'Idle',
    img: 'https://lh3.googleusercontent.com/aida-public/AB6AXu3A6rMNM418T8G08FXMLY-ftT-MgvMQ83G1I9dh6NTk2BY36MxMyzAXqTuNL6IcXaQUClS2pGp3CdZvXv4Ztljenc2xgAkgerRxGMIv5zbl5WijJ6J2qCQ2WKEfKuLyimdvg3gBQf9Hpg3R7Mu6a0McIpGqnCrg4kArBmSOuxAe0ducd_rrhk3td3wNAVlB3w-HJLCmHVWg3PdH2nUV4sdOIOTlFuASLtZRTBfAU_V8WBkAckJn-2uE9rKFJUCw33rUJLGDTbytS07',
    capacityPercent: 0,
    capacityText: '0% (Trống)',
    fuelPercent: 90,
    maintText: 'Bảo trì sau 14 ngày',
    maintStatus: 'warning',
    engineTemp: 140,
    oilPressure: 38,
    batteryVoltage: 12.6,
    dpfLevel: 10,
    lat: 40.7128,
    lon: -74.0060,
    speed: 0
  }
];

interface VehiclesTabProps {
  searchQuery: string;
  setToastMessage: (msg: string | null) => void;
  setActiveTab: (tab: string) => void;
}

export const VehiclesTab: React.FC<VehiclesTabProps> = ({
  searchQuery,
  setToastMessage,
  setActiveTab,
}) => {
  const [vehicles, setVehicles] = useState<VehicleUnit[]>(INITIAL_VEHICLES);
  const [selectedVehicleId, setSelectedVehicleId] = useState<string>('TRK-8492');
  const [showAddVehicleModal, setShowAddVehicleModal] = useState(false);
  const [statusFilter, setStatusFilter] = useState<'all' | 'Active' | 'Alert' | 'Idle'>('all');

  // Input states for adding new vehicle
  const [newId, setNewId] = useState('');
  const [newName, setNewName] = useState('');
  const [newType, setNewType] = useState('Box Truck');
  const [newStatus, setNewStatus] = useState<'Active' | 'Alert' | 'Idle'>('Active');
  const [newCapacity, setNewCapacity] = useState(50);
  const [newFuel, setNewFuel] = useState(80);

  // Live telemetry diagnostics fluctuation interval ticker
  useEffect(() => {
    const interval = setInterval(() => {
      setVehicles((prevVehicles) =>
        prevVehicles.map((v) => {
          if (v.status !== 'Active') return v;
          // Fluctuate speed, temp, pressure, and voltage slightly
          const speedDelta = (Math.random() - 0.5) * 4;
          const tempDelta = (Math.random() - 0.5) * 2;
          const pressDelta = (Math.random() - 0.5) * 1.5;
          const voltDelta = (Math.random() - 0.5) * 0.1;

          return {
            ...v,
            speed: Math.max(50, Math.min(75, Math.round(v.speed + speedDelta))),
            engineTemp: Math.max(190, Math.min(205, Math.round(v.engineTemp + tempDelta))),
            oilPressure: Math.max(38, Math.min(48, Math.round(v.oilPressure + pressDelta))),
            batteryVoltage: Math.max(13.2, Math.min(14.2, parseFloat((v.batteryVoltage + voltDelta).toFixed(1)))),
          };
        })
      );
    }, 4000);

    return () => clearInterval(interval);
  }, []);

  const focusedVehicle = vehicles.find((v) => v.id === selectedVehicleId) || vehicles[0];

  // Action: Add new vehicle to the registry database
  const handleAddVehicle = () => {
    if (!newId.trim() || !newName.trim()) {
      setToastMessage('Cảnh báo Điều phối: Mã phương tiện và Tên mẫu xe không được để trống.');
      return;
    }

    const newUnit: VehicleUnit = {
      id: newId.toUpperCase(),
      name: newName,
      type: newType === 'Heavy Duty Hauler' ? 'Xe vận tải hạng nặng' : newType === 'Delivery Van' ? 'Xe van giao hàng' : 'Xe tải hạng trung',
      status: newStatus,
      img: 'https://lh3.googleusercontent.com/aida-public/AB6AXu3A6rMNM418T8G08FXMLY-ftT-MgvMQ83G1I9dh6NTk2BY36MxMyzAXqTuNL6IcXaQUClS2pGp3CdZvXv4Ztljenc2xgAkgerRxGMIv5zbl5WijJ6J2qCQ2WKEfKuLyimdvg3gBQf9Hpg3R7Mu6a0McIpGqnCrg4kArBmSOuxAe0ducd_rrhk3td3wNAVlB3w-HJLCmHVWg3PdH2nUV4sdOIOTlFuASLtZRTBfAU_V8WBkAckJn-2uE9rKFJUCw33rUJLGDTbytS07', // default placeholder truck img
      capacityPercent: newCapacity,
      capacityText: `${newCapacity}% (${Math.round(newCapacity * 0.25)} tấn)`,
      fuelPercent: newFuel,
      maintText: newStatus === 'Alert' ? 'Cảnh báo cảm biến chẩn đoán' : 'Bảo trì: TỐT',
      maintStatus: newStatus === 'Alert' ? 'alert' : newStatus === 'Idle' ? 'warning' : 'ok',
      engineTemp: newStatus === 'Idle' ? 140 : 194,
      oilPressure: 40,
      batteryVoltage: 13.6,
      dpfLevel: 15,
      lat: 41.8781 + (Math.random() - 0.5) * 0.1,
      lon: -87.6298 + (Math.random() - 0.5) * 0.1,
      speed: newStatus === 'Active' ? 60 : 0
    };

    setVehicles((prev) => [newUnit, ...prev]);
    setSelectedVehicleId(newUnit.id);
    setToastMessage(`Cập nhật Hạm đội: Mã phương tiện ${newUnit.id} (${newUnit.name}) đã được đăng ký thành công!`);
    
    // Clear inputs
    setNewId('');
    setNewName('');
    setShowAddVehicleModal(false);
  };

  // Filters mapping - Vehicle grid
  const filteredVehicles = vehicles.filter((v) => {
    const q = searchQuery.toLowerCase().trim();
    const matchesSearch = !q || (
      v.id.toLowerCase().includes(q) ||
      v.name.toLowerCase().includes(q) ||
      v.type.toLowerCase().includes(q) ||
      v.status.toLowerCase().includes(q)
    );

    if (!matchesSearch) return false;
    if (statusFilter === 'all') return true;
    return v.status === statusFilter;
  });

  const alertsCount = vehicles.filter((v) => v.status === 'Alert').length;

  return (
    <div className="flex-1 flex flex-col md:flex-row gap-gutter h-full min-h-0 relative select-none">
      
      {/* LEFT: Vehicle Cards List */}
      <div className="flex-1 flex flex-col gap-4 overflow-hidden h-full">
        
        {/* Context bar */}
        <div className="glass-panel rounded-xl p-4 flex justify-between items-center shrink-0">
          <div className="text-left">
            <h2 className="font-headline-sm text-headline-sm text-on-surface font-bold">Hạm đội hoạt động</h2>
            <p className="font-body-md text-body-md text-on-surface-variant text-sm mt-1">
              {vehicles.length} Phương tiện • {alertsCount} Cảnh báo bảo trì
            </p>
          </div>
          
          <div className="flex gap-2">
            <div className="relative">
              <button
                onClick={() => setStatusFilter(statusFilter === 'all' ? 'Active' : statusFilter === 'Active' ? 'Alert' : statusFilter === 'Alert' ? 'Idle' : 'all')}
                className="bg-surface-variant/40 border border-outline-variant/50 text-on-surface rounded-lg px-3 py-1.5 font-data-tabular text-data-tabular flex items-center gap-2 hover:border-secondary/50 transition-colors text-xs font-semibold"
              >
                <span className="material-symbols-outlined text-[16px]">filter_list</span>
                Bộ lọc: {statusFilter === 'all' ? 'TẤT CẢ' : statusFilter === 'Active' ? 'HOẠT ĐỘNG' : statusFilter === 'Alert' ? 'CẢNH BÁO' : 'ĐANG RẢNH'}
              </button>
            </div>
            
            <button
              onClick={() => setShowAddVehicleModal(true)}
              className="bg-primary-container text-on-primary-container rounded-lg px-4 py-1.5 font-label-caps text-label-caps text-xs font-bold shadow-[0_0_10px_rgba(37,99,235,0.3)] hover:shadow-[0_0_15px_rgba(37,99,235,0.5)] transition-all flex items-center gap-1.5"
            >
              <span className="material-symbols-outlined text-[16px] font-bold">add</span>
              THÊM PHƯƠNG TIỆN
            </button>
          </div>
        </div>

        {/* Scrollable grid */}
        <div className="flex-1 overflow-y-auto pr-2 pb-20 md:pb-0">
          {filteredVehicles.length === 0 ? (
            <div className="glass-panel rounded-xl p-8 text-center text-on-surface-variant">
              <span className="material-symbols-outlined text-[42px] opacity-40 mb-2 block">
                no_transport
              </span>
              Không có phương tiện hạm đội nào khớp với tiêu chí của bạn.
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-gutter">
              {filteredVehicles.map((vehicle) => {
                const isSelected = selectedVehicleId === vehicle.id;
                const isAlert = vehicle.status === 'Alert';
                const isIdle = vehicle.status === 'Idle';

                return (
                  <div
                    key={vehicle.id}
                    onClick={() => setSelectedVehicleId(vehicle.id)}
                    className={`glass-panel rounded-xl p-4 cursor-pointer relative overflow-hidden group transition-all duration-300 ${
                      isSelected
                        ? 'glass-panel-active border-primary/70 shadow-[0_0_15px_rgba(37,99,235,0.3)] scale-[0.99]'
                        : isAlert
                        ? 'border-error/25 hover:border-error/50 shadow-[0_0_10px_rgba(255,180,171,0.05)]'
                        : 'hover:border-secondary/30'
                    }`}
                  >
                    {/* Left highlight indicator */}
                    {isSelected && (
                      <div className="absolute top-0 left-0 w-1 h-full bg-primary shadow-[0_0_10px_rgba(37,99,235,1)]" />
                    )}
                    {isAlert && !isSelected && (
                      <div className="absolute top-0 left-0 w-1 h-full bg-error shadow-[0_0_10px_rgba(255,180,171,0.5)]" />
                    )}

                    <div className="flex justify-between items-start mb-3">
                      <span className={`font-label-caps text-label-caps px-2 py-0.5 rounded border text-[10px] font-bold ${
                        isSelected
                          ? 'text-primary bg-primary/10 border-primary/30'
                          : 'text-on-surface bg-surface-variant border-outline-variant/30'
                      }`}>
                        {vehicle.id}
                      </span>
                      
                      {isAlert ? (
                        <span className="bg-error/15 text-error border border-error/20 px-2 py-0.5 rounded text-[9px] font-label-caps text-label-caps uppercase flex items-center gap-1 font-bold animate-pulse">
                          <span className="material-symbols-outlined text-[11px]" style={{ fontVariationSettings: "'FILL' 1" }}>warning</span> Cảnh báo
                        </span>
                      ) : vehicle.status === 'Active' ? (
                        <span className="bg-secondary/15 text-secondary border border-secondary/20 px-2 py-0.5 rounded text-[9px] font-label-caps text-label-caps uppercase flex items-center gap-1 font-bold">
                          <span className="w-1.5 h-1.5 bg-secondary rounded-full animate-pulse" /> Hoạt động
                        </span>
                      ) : (
                        <span className="bg-surface-variant/50 text-on-surface-variant border border-outline-variant/20 px-2 py-0.5 rounded text-[9px] font-label-caps text-label-caps uppercase font-bold">
                          Đang rảnh
                        </span>
                      )}
                    </div>

                    {/* Image cabin view */}
                    <div className="w-full h-24 mb-4 rounded-lg overflow-hidden border border-outline-variant/30 relative select-none">
                      <img alt={vehicle.name} className={`w-full h-full object-cover transition-transform duration-500 group-hover:scale-102 ${isAlert ? 'opacity-60 grayscale-[20%]' : 'opacity-80'}`} src={vehicle.img} />
                      <div className="absolute bottom-2 right-2 bg-surface/85 backdrop-blur px-1.5 py-0.5 rounded text-[9px] font-data-tabular text-on-surface font-semibold select-none border border-white/5">
                        {vehicle.name}
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-y-3 gap-x-2 text-left">
                      <div>
                        <div className="text-[9px] font-label-caps text-on-surface-variant uppercase mb-0.5 font-bold">Tải trọng</div>
                        <div className="font-data-tabular text-data-tabular text-on-surface text-[12px] font-semibold">{vehicle.capacityText}</div>
                      </div>
                      <div>
                        <div className="text-[9px] font-label-caps text-on-surface-variant uppercase mb-0.5 font-bold">Nhiên liệu / Điện</div>
                        <div className={`font-data-tabular text-data-tabular text-[12px] flex items-center gap-1 font-bold ${isAlert && vehicle.fuelPercent <= 15 ? 'text-error' : 'text-on-surface'}`}>
                          <div className="w-12 h-1 bg-surface-variant rounded-full overflow-hidden select-none">
                            <div className={`h-full rounded-full ${isAlert && vehicle.fuelPercent <= 15 ? 'bg-error shadow-[0_0_5px_#ffdad6]' : isIdle ? 'bg-secondary-container' : 'bg-secondary'}`} style={{ width: `${vehicle.fuelPercent}%` }}></div>
                          </div>
                          {vehicle.fuelPercent}%
                        </div>
                      </div>
                      <div className="col-span-2 mt-2 pt-2 border-t border-outline-variant/10">
                        {vehicle.maintStatus === 'ok' ? (
                          <div className="flex items-center gap-1.5 text-primary font-data-tabular text-data-tabular text-[11px] font-semibold">
                            <span className="material-symbols-outlined text-[14px]">check_circle</span> {vehicle.maintText}
                          </div>
                        ) : vehicle.maintStatus === 'alert' ? (
                          <div className="flex items-center gap-1.5 text-error font-data-tabular text-data-tabular text-[11px] font-bold animate-pulse">
                            <span className="material-symbols-outlined text-[14px]">engineering</span> {vehicle.maintText}
                          </div>
                        ) : (
                          <div className="flex items-center gap-1.5 text-on-surface-variant font-data-tabular text-data-tabular text-[11px] font-medium">
                            <span className="material-symbols-outlined text-[14px]">schedule</span> {vehicle.maintText}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* RIGHT: Detail HUD Panel */}
      <aside className="w-full md:w-[320px] lg:w-[380px] shrink-0 glass-panel rounded-xl flex flex-col overflow-hidden h-full">
        {/* Header */}
        <div className="p-5 border-b border-outline-variant/10 bg-surface-container-low/50 text-left">
          <div className="flex justify-between items-center mb-2">
            <h3 className="font-display-lg text-display-lg text-on-surface text-xl font-bold">{focusedVehicle.id}</h3>
            
            {focusedVehicle.status === 'Alert' ? (
              <span className="bg-error/15 text-error border border-error/20 px-2.5 py-0.5 rounded text-[10px] font-label-caps text-label-caps uppercase flex items-center gap-1 font-bold animate-pulse">
                <span className="material-symbols-outlined text-[12px]" style={{ fontVariationSettings: "'FILL' 1" }}>warning</span> Cảnh báo nguy hiểm
              </span>
            ) : focusedVehicle.status === 'Active' ? (
              <span className="bg-secondary/15 text-secondary border border-secondary/20 px-2.5 py-0.5 rounded text-[10px] font-label-caps text-label-caps uppercase flex items-center gap-1 font-bold shadow-[0_0_10px_rgba(76,215,246,0.15)]">
                <span className="w-1.5 h-1.5 bg-secondary rounded-full animate-pulse shadow-[0_0_8px_#4cd7f6]" /> Đang di chuyển
              </span>
            ) : (
              <span className="bg-surface-variant/50 text-on-surface-variant border border-outline-variant/20 px-2.5 py-0.5 rounded text-[10px] font-label-caps text-label-caps uppercase font-bold">
                Đang rảnh
              </span>
            )}
          </div>
          <div className="font-body-md text-body-md text-on-surface-variant text-sm font-medium">{focusedVehicle.name} • {focusedVehicle.type}</div>
        </div>

        {/* Scrollable Details */}
        <div className="flex-1 overflow-y-auto p-5 space-y-6">
          
          {/* GPS / Map Widget */}
          <div className="text-left">
            <h4 className="text-[10px] font-label-caps text-on-surface-variant uppercase mb-3 flex items-center gap-2 font-bold tracking-wider">
              <span className="material-symbols-outlined text-[14px]">my_location</span> Đo lường từ xa
            </h4>
            
            <div className="h-32 rounded-lg border border-outline-variant/30 overflow-hidden relative bg-surface-variant/20 flex items-center justify-center select-none">
              <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'radial-gradient(circle at center, #2563eb 1.2px, transparent 1.2px)', backgroundSize: '12px 12px' }}></div>
              
              <div className="relative z-10 flex flex-col items-center">
                <span className={`material-symbols-outlined text-primary text-[26px] mb-1 ${focusedVehicle.status === 'Active' ? 'animate-bounce animate-[pulse_2s_infinite]' : ''}`}>
                  near_me
                </span>
                <div className="bg-surface/90 backdrop-blur px-2.5 py-1 rounded font-data-tabular text-data-tabular text-[11px] border border-outline-variant/30 text-center font-bold">
                  <div>{focusedVehicle.lat.toFixed(4)}° N, {Math.abs(focusedVehicle.lon).toFixed(4)}° W</div>
                  <div className="text-secondary mt-0.5">Tốc độ: {focusedVehicle.speed} mph</div>
                </div>
              </div>
            </div>
          </div>

          {/* Diagnostics Grid */}
          <div className="text-left">
            <h4 className="text-[10px] font-label-caps text-on-surface-variant uppercase mb-3 flex items-center gap-2 font-bold tracking-wider">
              <span className="material-symbols-outlined text-[14px]">speed</span> Chẩn đoán Trực tiếp
            </h4>
            
            <div className="grid grid-cols-2 gap-3 text-left font-data-tabular">
              <div className="bg-surface-variant/15 border border-outline-variant/20 rounded-lg p-3">
                <div className="text-[9px] text-on-surface-variant mb-1 uppercase font-bold tracking-wider font-label-caps">Nhiệt độ động cơ</div>
                <div className={`font-bold text-[16px] ${focusedVehicle.engineTemp >= 210 ? 'text-error animate-pulse' : 'text-on-surface'}`}>
                  {focusedVehicle.engineTemp}°F
                </div>
              </div>
              
              <div className="bg-surface-variant/15 border border-outline-variant/20 rounded-lg p-3">
                <div className="text-[9px] text-on-surface-variant mb-1 uppercase font-bold tracking-wider font-label-caps">Áp suất dầu</div>
                <div className="font-bold text-[16px] text-on-surface">{focusedVehicle.oilPressure} PSI</div>
              </div>
              
              <div className="bg-surface-variant/15 border border-outline-variant/20 rounded-lg p-3">
                <div className="text-[9px] text-on-surface-variant mb-1 uppercase font-bold tracking-wider font-label-caps">Ắc quy</div>
                <div className="font-bold text-[16px] text-primary">{focusedVehicle.batteryVoltage}V</div>
              </div>
              
              <div className="bg-surface-variant/15 border border-outline-variant/20 rounded-lg p-3">
                <div className="text-[9px] text-on-surface-variant mb-1 uppercase font-bold tracking-wider font-label-caps">Mức DPF</div>
                <div className={`font-bold text-[16px] ${focusedVehicle.dpfLevel >= 70 ? 'text-error font-semibold' : 'text-on-surface'}`}>
                  {focusedVehicle.dpfLevel}%
                </div>
              </div>
            </div>
          </div>

          {/* Compliance / Docs */}
          <div className="text-left">
            <h4 className="text-[10px] font-label-caps text-on-surface-variant uppercase mb-3 flex items-center gap-2 font-bold tracking-wider">
              <span className="material-symbols-outlined text-[14px]">verified_user</span> Tuân thủ Đăng kiểm
            </h4>
            
            <ul className="space-y-2">
              <li className="flex items-center justify-between p-2.5 rounded bg-surface-variant/10 border border-outline-variant/10 select-none">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary text-[16px]">article</span>
                  <span className="font-data-tabular text-data-tabular text-[12px] text-on-surface font-semibold">Đăng kiểm</span>
                </div>
                <span className="text-primary text-[10px] font-label-caps uppercase font-bold">Hợp lệ (6 tháng)</span>
              </li>
              
              <li className="flex items-center justify-between p-2.5 rounded bg-surface-variant/10 border border-outline-variant/10 select-none">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary text-[16px]">shield</span>
                  <span className="font-data-tabular text-data-tabular text-[12px] text-on-surface font-semibold">Bảo hiểm</span>
                </div>
                <span className="text-primary text-[10px] font-label-caps uppercase font-bold">Hoạt động</span>
              </li>
              
              <li className={`flex items-center justify-between p-2.5 rounded border select-none ${focusedVehicle.maintStatus === 'alert' ? 'bg-error/15 border-error/30 animate-pulse' : 'bg-surface-variant/10 border-outline-variant/10'}`}>
                <div className="flex items-center gap-2">
                  <span className={`material-symbols-outlined text-[16px] ${focusedVehicle.maintStatus === 'alert' ? 'text-error' : 'text-primary'}`}>build</span>
                  <span className={`font-data-tabular text-data-tabular text-[12px] font-semibold ${focusedVehicle.maintStatus === 'alert' ? 'text-error font-bold' : 'text-on-surface'}`}>
                    Kiểm tra hàng năm
                  </span>
                </div>
                <span className={`text-[10px] font-label-caps uppercase font-bold ${focusedVehicle.maintStatus === 'alert' ? 'text-error' : 'text-primary'}`}>
                  {focusedVehicle.maintStatus === 'alert' ? 'HẾT HẠN' : 'Còn 14 ngày'}
                </span>
              </li>
            </ul>
          </div>
        </div>

        {/* Actions */}
        <div className="p-5 border-t border-outline-variant/10 bg-surface-container-low/50 grid grid-cols-2 gap-3 shrink-0">
          <button
            onClick={() => setToastMessage(`Truyền thông vệ tinh: Đang mở kênh liên lạc an toàn với tài xế phương tiện ${focusedVehicle.id}.`)}
            className="bg-surface-variant/40 border border-secondary text-secondary rounded-lg py-2 font-label-caps text-label-caps hover:bg-secondary/10 transition-colors text-xs font-bold active:scale-[0.98]"
          >
            LIÊN HỆ TÀI XẾ
          </button>
          
          <button
            onClick={() => {
              setActiveTab('Live Tracking');
              setToastMessage(`Khóa lộ trình: Chuyển màn hình điều phối sang theo dõi phương tiện ${focusedVehicle.id} trên bản đồ đo lường.`);
            }}
            className="bg-primary border border-primary text-on-primary rounded-lg py-2 font-label-caps text-label-caps shadow-[inset_0_0_10px_rgba(255,255,255,0.2)] hover:bg-primary-container transition-colors text-xs font-bold active:scale-[0.98]"
          >
            BẢN ĐỒ LỘ TRÌNH
          </button>
        </div>
      </aside>

      {/* DYNAMIC Add Vehicle Modal Drawer */}
      {showAddVehicleModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in pointer-events-auto">
          <div className="w-full max-w-md glass-panel rounded-xl overflow-hidden border border-outline-variant/30 shadow-2xl animate-scale-up">
            <div className="p-4 border-b border-white/10 flex justify-between items-center bg-primary-container/10">
              <h3 className="font-headline-sm text-headline-sm font-bold text-primary flex items-center gap-2">
                <span className="material-symbols-outlined text-[20px] text-primary">local_shipping</span>
                Đăng ký Phương tiện Hạm đội
              </h3>
              
              <button
                onClick={() => setShowAddVehicleModal(false)}
                className="text-on-surface-variant hover:text-error transition-colors p-1"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            <div className="p-5 flex flex-col gap-4 text-left font-body-md">
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider">Mã phương tiện</label>
                <input
                  type="text"
                  className="bg-black/30 border border-outline-variant/40 rounded-lg p-2.5 text-on-surface text-xs focus:outline-none focus:ring-1 focus:ring-secondary/50 focus:border-secondary/50 transition-all placeholder-on-surface-variant/45"
                  placeholder="Ví dụ: TRK-4103, VAN-201..."
                  value={newId}
                  onChange={(e) => setNewId(e.target.value)}
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider">Mẫu xe / Tên cabin</label>
                <input
                  type="text"
                  className="bg-black/30 border border-outline-variant/40 rounded-lg p-2.5 text-on-surface text-xs focus:outline-none focus:ring-1 focus:ring-secondary/50 focus:border-secondary/50 transition-all placeholder-on-surface-variant/45"
                  placeholder="Ví dụ: Volvo FH16, Ford Transit..."
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider">Loại phương tiện</label>
                  <select
                    className="bg-black/40 border border-outline-variant/40 rounded-lg p-2.5 text-on-surface text-xs focus:outline-none focus:ring-1 focus:ring-secondary/50 focus:border-secondary/50 transition-all"
                    value={newType}
                    onChange={(e) => setNewType(e.target.value)}
                  >
                    <option value="Heavy Duty Hauler">Xe vận tải hạng nặng (Semi)</option>
                    <option value="Delivery Van">Xe van thương mại</option>
                    <option value="Medium Duty Truck">Xe tải hạng trung (Thùng hộp)</option>
                  </select>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider">Trạng thái ban đầu</label>
                  <select
                    className="bg-black/40 border border-outline-variant/40 rounded-lg p-2.5 text-on-surface text-xs focus:outline-none focus:ring-1 focus:ring-secondary/50 focus:border-secondary/50 transition-all"
                    value={newStatus}
                    onChange={(e) => setNewStatus(e.target.value as any)}
                  >
                    <option value="Active">Hoạt động (Làm nhiệm vụ)</option>
                    <option value="Idle">Đang rảnh (Trong bãi)</option>
                    <option value="Alert">Cảnh báo (Cảm biến báo lỗi)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider">% Tải trọng ban đầu</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    className="bg-black/30 border border-outline-variant/40 rounded-lg p-2.5 text-on-surface text-xs focus:outline-none focus:ring-1 focus:ring-secondary/50 focus:border-secondary/50 transition-all"
                    value={newCapacity}
                    onChange={(e) => setNewCapacity(parseInt(e.target.value) || 0)}
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider">% Nhiên liệu / Điện ban đầu</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    className="bg-black/30 border border-outline-variant/40 rounded-lg p-2.5 text-on-surface text-xs focus:outline-none focus:ring-1 focus:ring-secondary/50 focus:border-secondary/50 transition-all"
                    value={newFuel}
                    onChange={(e) => setNewFuel(parseInt(e.target.value) || 0)}
                  />
                </div>
              </div>

              <button
                onClick={handleAddVehicle}
                className="mt-2 bg-primary-container text-white py-2.5 rounded-lg text-sm font-bold tracking-wider hover:brightness-110 active:scale-[0.98] transition-all shadow-[0_0_15px_rgba(37,99,235,0.45)] flex items-center justify-center gap-1.5"
              >
                <span className="material-symbols-outlined text-[18px]">how_to_reg</span>
                ĐĂNG KÝ VÀO HẠM ĐỘI
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default VehiclesTab;
