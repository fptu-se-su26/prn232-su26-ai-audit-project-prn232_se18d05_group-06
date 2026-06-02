import React from 'react';

interface RouteStop {
  id: string;
  destination: string;
  address: string;
  eta: string;
  distance: string;
  timeEst: string;
  priority: 'HIGH' | 'STANDARD';
  status: 'COMPLETED' | 'DELIVERING' | 'PENDING';
  orderId: string;
  cod: string;
  phone: string;
}

interface HomeTabProps {
  isOnline: boolean;
  setIsOnline: (online: boolean) => void;
  completedStopsCount: number;
  totalStopsCount: number;
  odometer: number;
  fuelLevel: number;
  serviceDays: number;
  progressPercent: number;
  activeStop: RouteStop;
  successRate: number;
  onScanClick: () => void;
  onCallClick: () => void;
  onMapClick: () => void;
}

export const HomeTab: React.FC<HomeTabProps> = ({
  isOnline,
  setIsOnline,
  completedStopsCount,
  totalStopsCount,
  odometer,
  fuelLevel,
  serviceDays,
  progressPercent,
  activeStop,
  successRate,
  onScanClick,
  onCallClick,
  onMapClick,
}) => {
  return (
    <div className="space-y-6">
      {/* Dashboard Header Profile Banner */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-5 rounded-2xl border border-[#c3c6d7] shadow-sm transition-all hover:shadow-md">
        <div className="flex items-center gap-4">
          <div className="relative">
            <img
              alt="Driver Profile Avatar"
              className="w-16 h-16 rounded-full object-cover border-2 border-[#2563eb]"
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuDzbyQB3BSZtskG284KejwPkegh2zgHtkvWd3-AxhcGDy5jokHA3n0brq_cYQklgEaRNOwZNY3_jwGQfZM_O0A7zXyL2yMu5IF8tHw-IhownwFVUk01dI5XpVPIa7VjPm_mVQIKY1y0SUyz1eT0-odBCgzvBPYX3_w80VTzPxA5AF5F9HZxty1n7a0R1SU0aOGwpS64e5trFykqP9y6dw5s2yV1iuzZnI7FTg8wdyQtMnqqRD1sjpmSC2zia1uDfpan4BywqXRgZmWQ"
            />
            <span className={`absolute bottom-0 right-0 block h-4 w-4 rounded-full border-2 border-white ${isOnline ? 'bg-green-500 animate-pulse' : 'bg-gray-400'}`} />
          </div>
          <div>
            <h1 className="font-headline-lg-mobile md:font-headline-lg text-[#191c1e] text-2xl font-bold mb-0.5">Trần Văn A</h1>
            <button 
              onClick={() => setIsOnline(!isOnline)}
              className="flex items-center gap-2 text-left group"
            >
              <span className="relative flex h-3 w-3">
                {isOnline && <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#2563eb] opacity-75"></span>}
                <span className={`relative inline-flex rounded-full h-3 w-3 ${isOnline ? 'bg-[#004ac6]' : 'bg-gray-400'}`}></span>
              </span>
              <span className={`font-semibold text-xs tracking-wide uppercase transition-colors ${isOnline ? 'text-[#004ac6] group-hover:text-[#2563eb]' : 'text-gray-500 group-hover:text-gray-700'}`}>
                {isOnline ? 'Đang trực tuyến' : 'Ngoại tuyến (Nhấp để bật)'}
              </span>
            </button>
          </div>
        </div>

        {/* Quick Counters Dashboard grid */}
        <div className="grid grid-cols-3 gap-3 w-full md:w-auto">
          <div className="bg-[#f2f4f6] px-4 py-2.5 rounded-xl text-center border border-[#c3c6d7]/30 hover:bg-[#eceef0] transition-colors">
            <div className="text-xs font-semibold text-[#434655] mb-0.5">Giao hàng</div>
            <div className="text-lg font-bold text-[#191c1e]">{completedStopsCount}/{totalStopsCount}</div>
          </div>
          <div className="bg-[#f2f4f6] px-4 py-2.5 rounded-xl text-center border border-[#c3c6d7]/30 hover:bg-[#eceef0] transition-colors">
            <div className="text-xs font-semibold text-[#434655] mb-0.5">Thành công</div>
            <div className="text-lg font-bold text-[#004ac6]">{successRate}%</div>
          </div>
          <div className="bg-[#f2f4f6] px-4 py-2.5 rounded-xl text-center border border-[#c3c6d7]/30 hover:bg-[#eceef0] transition-colors">
            <div className="text-xs font-semibold text-[#434655] mb-0.5">Quãng đường</div>
            <div className="text-lg font-bold text-[#191c1e]">{Math.round(odometer)} km</div>
          </div>
        </div>
      </div>

      {/* Bento Grid layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column: Active task & shift progress */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Current Shift Card */}
          <section className="bg-white rounded-2xl border border-[#c3c6d7] p-5 shadow-sm transition-all hover:shadow-md">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-bold text-[#191c1e] flex items-center gap-2 font-headline-md">
                <span className="material-symbols-outlined text-[#004ac6]">schedule</span>
                Ca làm việc hiện tại
              </h2>
              <span className="bg-[#d3e4fe] text-[#004ac6] px-3.5 py-1 rounded-full text-xs font-bold shadow-sm font-label-md">
                Đang tiến hành
              </span>
            </div>
            <div className="mb-4">
              <div className="flex justify-between text-sm font-semibold mb-2">
                <span className="text-[#434655]">Tiến độ ({progressPercent}%)</span>
                <span className="text-[#191c1e] font-bold">{totalStopsCount - completedStopsCount} điểm dừng còn lại</span>
              </div>
              <div className="w-full bg-[#e0e3e5] rounded-full h-3.5 overflow-hidden p-[2px]">
                <div 
                  className="bg-gradient-to-r from-[#004ac6] to-[#2563eb] h-2.5 rounded-full transition-all duration-700 ease-out" 
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>
            <div className="flex gap-4 items-center text-[#434655] text-xs font-semibold pt-1 border-t border-[#c3c6d7]/30 font-body-md">
              <span className="flex items-center gap-1">
                <span className="material-symbols-outlined text-[18px]">access_time</span> 
                Dự kiến xong: 15:45
              </span>
              <span className="text-[#c3c6d7]">|</span>
              <span className="flex items-center gap-1">
                <span className="material-symbols-outlined text-[18px]">local_shipping</span> 
                Tổng: {totalStopsCount} điểm dừng
              </span>
            </div>
          </section>

          {/* Active Task Preview (Floating Elevation Card) */}
          <section className="bg-white rounded-2xl shadow-[0_8px_30px_rgba(0,0,0,0.06)] border border-[#c3c6d7] overflow-hidden relative transition-all hover:shadow-xl">
            <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-gradient-to-b from-[#004ac6] to-[#2563eb]" />
            <div className="p-6 pl-8">
              <div className="flex justify-between items-start mb-3">
                <div className="bg-[#ffdad6] text-[#ba1a1a] px-3.5 py-1 rounded-full text-xs font-bold flex items-center gap-1 shadow-sm font-label-md">
                  <span className="material-symbols-outlined text-[15px] fill animate-pulse">priority_high</span> 
                  Ưu tiên cao
                </div>
                <span className="text-xl font-bold text-[#004ac6] bg-[#d3e4fe]/40 px-3 py-0.5 rounded-lg">{activeStop.eta}</span>
              </div>
              
              <h3 className="text-2xl font-bold text-[#191c1e] mt-3 mb-1.5 flex items-center gap-2 font-headline-md">
                <span className="material-symbols-outlined text-[#004ac6] text-[26px]">local_post_office</span>
                {activeStop.destination}
              </h3>
              <p className="text-sm font-medium text-[#434655] mb-6 flex items-start gap-1.5 font-body-md">
                <span className="material-symbols-outlined text-[#434655] text-[20px] mt-0.5 shrink-0">location_on</span>
                <span className="leading-relaxed">{activeStop.address}</span>
              </p>

              <div className="flex gap-4 flex-wrap">
                <button 
                  onClick={onScanClick}
                  className="flex-1 bg-[#004ac6] text-white h-14 rounded-xl font-bold text-base flex items-center justify-center gap-2 hover:bg-[#2563eb] active:scale-[0.98] transition-all shadow-md hover:shadow-lg font-label-md"
                >
                  <span className="material-symbols-outlined text-[22px]">qr_code_scanner</span>
                  Quét mã &amp; Hoàn thành
                </button>
                <button 
                  onClick={onCallClick}
                  className="bg-[#f2f4f6] text-[#191c1e] h-14 px-6 rounded-xl font-bold text-base flex items-center justify-center gap-2 border border-[#c3c6d7] hover:bg-[#eceef0] active:scale-[0.98] transition-all shadow-sm font-label-md"
                >
                  <span className="material-symbols-outlined text-[22px] text-[#434655]">call</span>
                  Gọi điện
                </button>
              </div>
            </div>
          </section>
        </div>

        {/* Right Column: Routing Map & Quick Stats */}
        <div className="space-y-6">
          
          {/* Embedded Map Block */}
          <section className="bg-white rounded-2xl border border-[#c3c6d7] overflow-hidden h-[264px] relative shadow-sm hover:shadow-md transition-all group">
            <img
              alt="Bản đồ chỉ đường"
              className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-700"
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuCdIB61lD6NV8MW5zJ39wYNUjj-zTk7vkYxB3t656in93pAJTH-2gPnQlU6UleJ26NAl1xwYfy7jcag-L7ekcp4O-vTa0mkdmYf3I-Unu7fyNkyaA6Zk6qxn4k8Rp5bpevA-MVbjXpowVAFKeUXjmHZySVb1khbVC5auhH016tRPWibG5b8GeQsNq1x0Y2FTYBDz_oQ2QchggIkkcUduokk2YHzfR_GIF6kef8D5gov6N9gglWzvgQpCfSf41m77nh7rQ3diJx95izd"
            />
            
            {/* Visual Route Guideline overlay */}
            <div className="absolute bottom-4 left-4 right-4 bg-white/95 backdrop-blur-md p-3.5 rounded-xl border border-[#c3c6d7] flex justify-between items-center shadow-lg">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[#004ac6] bg-[#d3e4fe]/60 p-1.5 rounded-lg animate-bounce">navigation</span>
                <div>
                  <div className="text-xs font-bold text-[#191c1e] font-label-md">Còn {activeStop.distance}</div>
                  <div className="text-[11px] font-semibold text-[#434655] font-body-md">Khoảng {activeStop.timeEst}</div>
                </div>
              </div>
              <button 
                onClick={onMapClick}
                className="text-[#004ac6] hover:text-[#2563eb] text-xs font-bold hover:underline select-none font-label-md"
              >
                Mở bản đồ
              </button>
            </div>
          </section>

          {/* Quick stats grid */}
          <section className="grid grid-cols-2 gap-4">
            
            {/* Fuel Level */}
            <div className="bg-white p-4 rounded-2xl border border-[#c3c6d7] flex flex-col items-center text-center shadow-sm hover:shadow-md transition-all">
              <span className="material-symbols-outlined text-[32px] text-[#5e6e85] bg-[#f2f4f6] p-2 rounded-full mb-2">local_gas_station</span>
              <div className="text-xs font-semibold text-[#434655] mb-1 font-label-md">Nhiên liệu</div>
              <div className="text-xl font-bold text-[#191c1e] font-headline-md">{Math.round(fuelLevel)}%</div>
              <div className="w-full bg-[#e0e3e5] rounded-full h-1.5 mt-3 overflow-hidden">
                <div 
                  className={`h-1.5 rounded-full ${fuelLevel < 20 ? 'bg-[#ba1a1a] animate-pulse' : 'bg-[#5e6e85]'}`}
                  style={{ width: `${fuelLevel}%` }}
                />
              </div>
            </div>

            {/* Vehicle Health */}
            <div className="bg-white p-4 rounded-2xl border border-[#c3c6d7] flex flex-col items-center text-center shadow-sm hover:shadow-md transition-all">
              <span className="material-symbols-outlined text-[32px] text-[#004ac6] bg-[#d3e4fe]/50 p-2 rounded-full mb-2">car_repair</span>
              <div className="text-xs font-semibold text-[#434655] mb-1 font-label-md">Tình trạng xe</div>
              <div className="text-xl font-bold text-[#004ac6] font-headline-md">Tốt</div>
              <div className="text-[10px] font-bold text-[#434655]/70 mt-3.5 uppercase tracking-wide font-label-md">Bảo dưỡng: {serviceDays} ngày</div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};
