import React, { useState } from 'react';

interface AssignOrder {
  id: string;
  priority: 'HIGH PRIORITY' | 'STANDARD';
  weight: string;
  route: string;
}

interface AssignDriver {
  name: string;
  avatar: string;
  rating: number;
  distance: string;
  recommended: boolean;
}

interface AssignVehicle {
  id: string;
  type: string;
  capacity: string;
  fuel: string;
  fuelValue: number;
  status: 'READY' | 'MAINTENANCE';
}

const INITIAL_ASSIGN_DRIVERS: AssignDriver[] = [
  { name: 'Marcus T.', avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDD4ht36shvD8aqIjMlFeDSYFcF8zN7_VZncE9yC6MDXukjP7a8mzhlvq7CvY21D2AWJBFa4RYc9bpVwGscpQqZNWgtyt6g-0dYk48pVkU1HjAICclx5_k9iCo7_HauXlqEcDYxpGjPluTBP9hOz5JjEdJRhcrEEMioLqh6JJ9uA-zy0n0nAssEEg6cP5HJ_UEn5P_LqJpWGHahd9cS0gKgB7_hu6npSXdjhXs26xcizk_Bm3CJMBtjtAqCpZbaL4So29DIuNnu4afK', rating: 4.9, distance: 'Cách 0.8 mi (Đang rảnh)', recommended: true },
  { name: 'Sarah J.', avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBZDABhu9aOCsvy2MgYdHWtzvw53FyiD7lsQhGHBG34AWeEFy7X7EtqP0d-FK5C8PJpPfgrhy8LBxsDQJ3Xl_MmJQcsXnA8UG38VdM2UnyyfgwrDliJeFnG6Yy3__PQzQJQhauTg4obfbADIAUDcgXgc5Mswhqa8l__PGQmILyW7skKuZhUSsG3F8g8XOHhD4zw2ve-2Kk-ZxNNuPy8wcz5H4c6kRr99gqamCfUpcTBTOp2JHSc1Uj8JLtXkuabnnf-mLLO_SZzMbdG', rating: 4.7, distance: 'Cách 3.2 mi', recommended: false },
  { name: 'David K.', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=facearea&facepad=2&w=256&h=256&q=80', rating: 4.8, distance: 'Cách 1.5 mi', recommended: false },
];

const INITIAL_ASSIGN_VEHICLES: AssignVehicle[] = [
  { id: 'V-402', type: 'Box Truck', capacity: 'Tối đa 3.5 Tấn', fuel: '85% EV', fuelValue: 85, status: 'READY' },
  { id: 'V-109', type: 'Van Truck', capacity: 'Tối đa 1.5 Tấn', fuel: '62% EV', fuelValue: 62, status: 'READY' },
  { id: 'V-305', type: 'Semi Reefer', capacity: 'Tối đa 15.0 Tấn', fuel: '90% Diesel', fuelValue: 90, status: 'READY' },
];

interface AssignDispatcherTabProps {
  searchQuery: string;
  unassignedOrders: AssignOrder[];
  selectedAssignOrder: AssignOrder | null;
  setSelectedAssignOrder: (order: AssignOrder | null) => void;
  selectedAssignDriver: AssignDriver | null;
  setSelectedAssignDriver: (driver: AssignDriver | null) => void;
  selectedAssignVehicle: AssignVehicle | null;
  setSelectedAssignVehicle: (vehicle: AssignVehicle | null) => void;
  assignFilter: 'ALL' | 'HIGH' | 'STANDARD';
  setAssignFilter: (filter: 'ALL' | 'HIGH' | 'STANDARD') => void;
  handleExecuteDispatch: () => void;
  handleAiAutoMatch: () => void;
}

export const AssignDispatcherTab: React.FC<AssignDispatcherTabProps> = ({
  searchQuery,
  unassignedOrders,
  selectedAssignOrder,
  setSelectedAssignOrder,
  selectedAssignDriver,
  setSelectedAssignDriver,
  selectedAssignVehicle,
  setSelectedAssignVehicle,
  assignFilter,
  setAssignFilter,
  handleExecuteDispatch,
  handleAiAutoMatch,
}) => {
  const [showFilterDropdown, setShowFilterDropdown] = useState(false);

  // Filters mapping - Matrix Unassigned Orders
  const filteredAssignOrders = unassignedOrders.filter((order) => {
    // Search
    const q = searchQuery.toLowerCase().trim();
    const matchesSearch = !q || (
      order.id.toLowerCase().includes(q) ||
      order.route.toLowerCase().includes(q) ||
      order.weight.toLowerCase().includes(q)
    );

    if (!matchesSearch) return false;

    // Category
    if (assignFilter === 'ALL') return true;
    if (assignFilter === 'HIGH') return order.priority === 'HIGH PRIORITY';
    if (assignFilter === 'STANDARD') return order.priority === 'STANDARD';
    return true;
  });

  return (
    <div className="flex flex-col gap-gutter h-full min-h-0 relative z-10 transition-all duration-300">
      
      {/* Header matrix description */}
      <div className="flex justify-between items-end shrink-0 relative z-10 select-none">
        <div>
          <h2 className="font-headline-sm text-[16px] md:text-headline-sm text-on-surface font-semibold">Ma trận Điều phối</h2>
          <p className="font-body-md text-xs md:text-body-md text-on-surface-variant mt-1">
            Chọn một đơn hàng, sau đó ghép cặp với tài xế và phương tiện sẵn có.
          </p>
          <div className="mt-2 inline-flex items-center gap-1.5 rounded-md border border-amber-500/25 bg-amber-500/10 px-2.5 py-1 text-[11px] font-bold text-amber-500">
            <span className="material-symbols-outlined text-[14px]">warning</span>
            <span>Outbound pickup assignment depends on Dock/Dispatcher assignment integration.</span>
          </div>
        </div>
        <div className="flex gap-2">
          <div className="relative">
            <button
              onClick={() => setShowFilterDropdown(!showFilterDropdown)}
              className="glass-panel px-4 py-1.5 rounded-full flex items-center gap-2 font-label-caps text-label-caps text-on-surface hover:bg-surface-variant/50 transition-colors text-[10px]"
            >
              <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>filter_list</span>
              BỘ LỌC: {assignFilter === 'ALL' ? 'TẤT CẢ' : assignFilter === 'HIGH' ? 'ƯU TIÊN CAO' : 'TIÊU CHUẨN'}
            </button>

            {showFilterDropdown && (
              <div className="absolute right-0 mt-2 w-40 glass-panel rounded-lg shadow-2xl z-30 border border-outline-variant/30 overflow-hidden animate-fade-in">
                <div className="py-0.5 bg-surface-container-lowest">
                  {(['ALL', 'HIGH', 'STANDARD'] as const).map((filter) => (
                    <button
                      key={filter}
                      onClick={() => {
                        setAssignFilter(filter);
                        setShowFilterDropdown(false);
                      }}
                      className={`w-full text-left px-3 py-1.5 text-[10px] font-semibold transition-colors hover:bg-primary-container/20 hover:text-primary ${
                        assignFilter === filter ? 'text-primary bg-primary-container/10 border-l-2 border-primary' : 'text-on-surface-variant'
                      }`}
                    >
                      {filter === 'ALL' ? 'TẤT CẢ' : filter === 'HIGH' ? 'ƯU TIÊN CAO' : 'TIÊU CHUẨN'}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          <button
            onClick={handleAiAutoMatch}
            className="glass-panel px-4 py-1.5 rounded-full flex items-center gap-2 font-label-caps text-label-caps text-secondary border-secondary/35 bg-secondary/5 hover:bg-secondary/15 transition-all text-[10px] shadow-[0_0_10px_rgba(76,215,246,0.1)]"
          >
            <span className="material-symbols-outlined text-secondary" style={{ fontSize: '14px' }}>auto_awesome</span>
            AI TỰ ĐỘNG GHÉP CẶP
          </button>
        </div>
      </div>

      {/* 3-Column Split Assignment Board Grid */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-3 gap-gutter min-h-0 pb-16 relative">
        
        {/* Column 1: Unassigned Orders */}
        <div className="glass-panel rounded-xl flex flex-col overflow-hidden bg-[#07192e]/60 border border-white/5">
          <div className="p-4 border-b border-white/5 flex justify-between items-center bg-[#0a1e35]/50 select-none shrink-0">
            <h3 className="font-label-caps text-label-caps text-[#d4e4fa] font-bold text-[10.5px] tracking-wider uppercase">
              Đơn hàng Chưa phân công ({filteredAssignOrders.length})
            </h3>
            <span className="material-symbols-outlined text-slate-400" style={{ fontSize: '18px' }}>sort</span>
          </div>
          <div className="flex-1 overflow-y-auto p-2 space-y-2">
            {filteredAssignOrders.length === 0 ? (
              <div className="p-8 text-center text-slate-400 select-none">
                <span className="material-symbols-outlined text-[32px] text-slate-500 mb-2 block">
                  done_all
                </span>
                Tất cả đơn hàng đã được phân công thành công!
              </div>
            ) : (
              filteredAssignOrders.map((order) => {
                const isSelected = selectedAssignOrder?.id === order.id;
                const isHigh = order.priority === 'HIGH PRIORITY';

                return (
                  <div
                    key={order.id}
                    onClick={() => setSelectedAssignOrder(isSelected ? null : order)}
                    className={`transition-all duration-300 rounded-lg p-3 cursor-pointer relative group border ${
                      isSelected
                        ? 'bg-[#0a2540]/95 border-primary shadow-[0_0_15px_rgba(37,99,235,0.25)] scale-[0.98]'
                        : 'bg-[#0a1e35]/85 border-white/10 hover:bg-[#0a1e35]/95 hover:border-white/20'
                    }`}
                  >
                    <div className={`absolute left-0 top-0 bottom-0 w-1 rounded-l-lg transition-colors ${
                      isHigh ? 'bg-red-500' : isSelected ? 'bg-primary' : 'bg-transparent'
                    }`} />
                    
                    <div className="flex justify-between items-start mb-2 pl-2 select-none">
                      <span className={`font-data-tabular text-data-tabular font-bold text-[13px] ${
                        isSelected ? 'text-primary' : 'text-[#d4e4fa]'
                      }`}>
                        {order.id}
                      </span>
                      <span className={`px-2 py-0.5 rounded text-[8.5px] font-label-caps font-bold tracking-wider border ${
                        isHigh
                          ? 'bg-red-500/20 text-red-400 border-red-500/30'
                          : 'bg-blue-500/20 text-blue-400 border-blue-500/30'
                      }`}>
                        {order.priority === 'HIGH PRIORITY' ? 'ƯU TIÊN CAO' : 'TIÊU CHUẨN'}
                      </span>
                    </div>

                    <div className="pl-2 space-y-1 select-none text-[12px]">
                      <div className="flex items-center gap-2 text-slate-300">
                        <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>scale</span>
                        <span className={`font-data-tabular text-data-tabular ${isSelected ? 'text-white font-medium' : 'text-slate-300'}`}>
                          Trọng lượng: {order.weight}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-slate-300">
                        <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>my_location</span>
                        <span className={`font-body-md text-body-md truncate ${isSelected ? 'text-white font-medium' : 'text-slate-300'}`}>
                          Lộ trình: {order.route}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Column 2: Available Drivers */}
        <div className="glass-panel rounded-xl flex flex-col overflow-hidden relative bg-[#07192e]/60 border border-white/5">
          {/* Animated Vector Path Connection Visuals (Order -> Driver) */}
          {selectedAssignOrder && selectedAssignDriver && (
            <svg className="absolute top-1/2 -left-4 w-8 h-8 -translate-y-1/2 z-20 pointer-events-none hidden lg:block animate-pulse">
              <path className="path-line" d="M0,16 L32,16" stroke="#2563eb" strokeWidth="2"></path>
              <circle cx="16" cy="16" fill="#051424" r="4" stroke="#2563eb" strokeWidth="2"></circle>
            </svg>
          )}

          <div className="p-4 border-b border-white/5 flex justify-between items-center bg-[#0a1e35]/50 select-none shrink-0">
            <h3 className="font-label-caps text-label-caps text-[#d4e4fa] font-bold text-[10.5px] tracking-wider uppercase">
              Tài xế Sẵn sàng ({INITIAL_ASSIGN_DRIVERS.length})
            </h3>
            <span className="material-symbols-outlined text-slate-400" style={{ fontSize: '18px' }}>radar</span>
          </div>
          <div className="flex-1 overflow-y-auto p-2 space-y-2">
            {INITIAL_ASSIGN_DRIVERS.map((driver) => {
              const isSelected = selectedAssignDriver?.name === driver.name;

              return (
                <div
                  key={driver.name}
                  onClick={() => setSelectedAssignDriver(isSelected ? null : driver)}
                  className={`transition-all duration-300 rounded-lg p-3 cursor-pointer border relative ${
                    isSelected
                      ? 'bg-[#0a2540]/95 border-secondary shadow-[0_0_15px_rgba(76,215,246,0.25)] scale-[0.98]'
                      : 'bg-[#0a1e35]/85 border-white/10 hover:bg-[#0a1e35]/95 hover:border-white/20'
                  }`}
                >
                  {driver.recommended && (
                    <div className="absolute -top-2 right-3 bg-[#0a2540] border border-secondary/50 px-2 py-0.5 rounded-full flex items-center gap-1 z-10 select-none shadow">
                      <span className="material-symbols-outlined text-secondary animate-bounce" style={{ fontSize: '11px' }}>auto_awesome</span>
                      <span className="font-label-caps text-[8px] font-bold text-secondary">AI PHÙ HỢP 98%</span>
                    </div>
                  )}

                  <div className="flex items-center gap-3 select-none">
                    <div className="relative shrink-0">
                      <img
                        alt="Driver Avatar"
                        className="w-10 h-10 rounded-full border border-white/10 object-cover"
                        src={driver.avatar}
                      />
                      <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 rounded-full border border-[#051424]"></div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-center">
                        <h4 className="font-body-md text-body-md font-semibold text-[#d4e4fa] truncate text-[13px]">
                          {driver.name}
                        </h4>
                        <div className="flex items-center text-amber-400 font-bold">
                          <span className="material-symbols-outlined filled" style={{ fontSize: '12px' }}>star</span>
                          <span className="font-data-tabular text-[11px] ml-0.5">{driver.rating}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-1 text-slate-300 mt-1">
                        <span className={`material-symbols-outlined text-[14px] ${isSelected ? 'text-secondary animate-pulse' : ''}`} style={{ fontSize: '14px' }}>near_me</span>
                        <span className={`font-data-tabular text-[11.5px] ${isSelected ? 'text-secondary font-bold' : 'text-slate-300'}`}>
                          {driver.distance}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Column 3: Yard Vehicles */}
        <div className="glass-panel rounded-xl flex flex-col overflow-hidden relative bg-[#07192e]/60 border border-white/5">
          {/* Animated Vector Path Connection Visuals (Driver -> Vehicle) */}
          {selectedAssignDriver && selectedAssignVehicle && (
            <svg className="absolute top-1/2 -left-4 w-8 h-8 -translate-y-1/2 z-20 pointer-events-none hidden lg:block animate-pulse">
              <path className="path-line" d="M0,16 L32,16" stroke="#4cd7f6" strokeDasharray="4,4" strokeWidth="2"></path>
              <circle cx="16" cy="16" fill="#051424" r="4" stroke="#4cd7f6" strokeWidth="2"></circle>
            </svg>
          )}

          <div className="p-4 border-b border-white/5 flex justify-between items-center bg-[#0a1e35]/50 select-none shrink-0">
            <h3 className="font-label-caps text-label-caps text-[#d4e4fa] font-bold text-[10.5px] tracking-wider uppercase">
              Phương tiện tại bãi ({INITIAL_ASSIGN_VEHICLES.length})
            </h3>
            <span className="material-symbols-outlined text-slate-400" style={{ fontSize: '18px' }}>local_shipping</span>
          </div>
          <div className="flex-1 overflow-y-auto p-2 space-y-2">
            {INITIAL_ASSIGN_VEHICLES.map((vehicle) => {
              const isSelected = selectedAssignVehicle?.id === vehicle.id;

              return (
                <div
                  key={vehicle.id}
                  onClick={() => setSelectedAssignVehicle(isSelected ? null : vehicle)}
                  className={`transition-all duration-300 rounded-lg p-3 cursor-pointer border relative ${
                    isSelected
                      ? 'bg-[#0a2540]/95 border-secondary shadow-[0_0_15px_rgba(76,215,246,0.25)] scale-[0.98]'
                      : 'bg-[#0a1e35]/85 border-white/10 hover:bg-[#0a1e35]/95 hover:border-white/20'
                  }`}
                >
                  {isSelected && (
                    <div className="absolute -top-2 right-3 bg-[#0a2540] border border-secondary/50 px-2 py-0.5 rounded-full flex items-center gap-1 z-10 select-none shadow">
                      <span className="material-symbols-outlined text-secondary" style={{ fontSize: '11px' }}>check_circle</span>
                      <span className="font-label-caps text-[8px] font-bold text-secondary">ĐÁP ỨNG TẢI TRỌNG</span>
                    </div>
                  )}

                  <div className="flex justify-between items-start mb-2 select-none">
                    <div className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-[#d4e4fa] text-[20px]" style={{ fontSize: '20px' }}>local_shipping</span>
                      <span className="font-data-tabular text-data-tabular text-[#d4e4fa] font-bold text-[13px]">
                        {vehicle.id} ({vehicle.type})
                      </span>
                    </div>
                    <span className="px-2 py-0.5 rounded text-[8px] font-label-caps font-bold tracking-wider bg-green-500/20 text-green-400 border border-green-500/30">
                      {vehicle.status === 'READY' ? 'SẴN SÀNG' : 'BẢO TRÌ'}
                    </span>
                  </div>

                  <div className="space-y-1.5 mt-2.5 select-none text-[11.5px]">
                    <div className="flex justify-between items-center font-semibold">
                      <span className="text-slate-400 font-label-caps">TẢI TRỌNG</span>
                      <span className="font-data-tabular text-white">{vehicle.capacity}</span>
                    </div>
                    <div className="w-full bg-[#051424] rounded-full h-1 overflow-hidden">
                      <div
                        className="bg-secondary h-1 rounded-full transition-all duration-500"
                        style={{ width: vehicle.id === 'V-402' ? '50%' : vehicle.id === 'V-109' ? '30%' : '75%' }}
                      />
                    </div>
                    <div className="flex justify-between items-center font-semibold mt-2">
                      <span className="text-slate-400 font-label-caps">NHIÊN LIỆU / ĐIỆN</span>
                      <span className="font-data-tabular text-secondary font-bold">{vehicle.fuel}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Floating Action Matrix Dispatcher footer */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-30 w-full max-w-[600px] px-4 select-none animate-slide-up">
        <div className="glass-panel p-3 rounded-full flex items-center justify-between shadow-[0_10px_30px_rgba(0,0,0,0.8)] border border-white/10 bg-[#0a1e35]/95 backdrop-blur-md">
          <div className="flex items-center gap-4 px-4 text-left">
            <div className="flex flex-col">
              <span className="font-label-caps text-[9px] font-bold text-slate-400 uppercase tracking-wider">PHÂN CÔNG CHO</span>
              {selectedAssignOrder && selectedAssignDriver && selectedAssignVehicle ? (
                <span className="font-data-tabular text-[13px] text-white font-semibold">
                  {selectedAssignDriver.name} <span className="text-secondary font-bold">•</span> {selectedAssignVehicle.id}
                </span>
              ) : (
                <span className="font-data-tabular text-[12px] text-error font-bold flex items-center gap-1">
                  <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>info</span>
                  Chọn thông tin Ma trận
                </span>
              )}
            </div>
          </div>

          <button
            onClick={handleExecuteDispatch}
            disabled={!selectedAssignOrder || !selectedAssignDriver || !selectedAssignVehicle}
            className={`px-8 py-3 rounded-full font-label-caps text-label-caps font-bold tracking-wider transition-all flex items-center gap-2 group ${
              selectedAssignOrder && selectedAssignDriver && selectedAssignVehicle
                ? 'bg-primary-container text-white hover:bg-primary-container/90 hover:scale-[1.03] active:scale-[0.97] shadow-[0_0_15px_rgba(37,99,235,0.4)]'
                : 'bg-white/5 border border-outline-variant/30 text-on-surface-variant/50 cursor-not-allowed'
            }`}
          >
            THỰC HIỆN ĐIỀU PHỐI
            <span className="material-symbols-outlined group-hover:translate-x-1 transition-transform" style={{ fontSize: '18px' }}>send</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default AssignDispatcherTab;
