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

interface RoutesTabProps {
  stops: RouteStop[];
  expandedStopId: string | null;
  setExpandedStopId: (id: string | null) => void;
  onCallClick: () => void;
  onScanClick: () => void;
  onMapClick: () => void;
}

export const RoutesTab: React.FC<RoutesTabProps> = ({
  stops,
  expandedStopId,
  setExpandedStopId,
  onCallClick,
  onScanClick,
  onMapClick,
}) => {
  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="pt-2">
        <h1 className="text-2xl md:text-3xl font-bold text-[#191c1e] font-headline-lg-mobile md:font-headline-lg">Danh sách điểm dừng</h1>
      </div>

      {/* AI Banner */}
      <div className="bg-[#dde2f8] text-[#151b2b] px-4 py-3 rounded-xl flex items-start gap-3 border border-[#c1c6db] shadow-sm">
        <span className="material-symbols-outlined text-[#004ac6] mt-0.5">auto_awesome</span>
        <div>
          <p className="text-sm font-bold font-label-md">Tuyến đường đã được tối ưu bởi AI</p>
          <p className="text-xs text-[#414658] font-semibold mt-0.5 font-body-md">Tiết kiệm 12% thời gian di chuyển</p>
        </div>
      </div>

      {/* Stop List Accordion */}
      <div className="flex flex-col gap-3" id="stop-list">
        {stops.map((stop, idx) => {
          const isCompleted = stop.status === 'COMPLETED';
          const isCurrent = stop.status === 'DELIVERING';
          const isExpanded = expandedStopId === stop.id;

          if (isCompleted) {
            return (
              <div 
                key={stop.id}
                className="bg-white rounded-xl border border-[#c3c6d7] p-4 opacity-75 select-none shadow-sm transition-all"
              >
                <div className="flex justify-between items-start">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-full bg-[#e0e3e5] text-[#434655] flex items-center justify-center font-bold flex-shrink-0 mt-0.5">
                      <span className="material-symbols-outlined text-[20px] fill">check</span>
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <h3 className="font-bold text-base text-gray-500 line-through font-headline-md">{stop.destination}</h3>
                        <span className="bg-gray-200/50 text-gray-600 px-2.5 py-0.5 rounded-full text-[10px] font-bold font-label-md">Hoàn thành</span>
                      </div>
                      <p className="text-xs text-gray-400 font-medium flex items-center gap-1 line-through font-body-md">
                        <span className="material-symbols-outlined text-[14px]">location_on</span>
                        {stop.address}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            );
          }

          // Active or Pending Stop Card
          return (
            <div 
              key={stop.id}
              onClick={() => setExpandedStopId(isExpanded ? null : stop.id)}
              className={`bg-white rounded-xl border p-4 cursor-pointer relative overflow-hidden transition-all duration-200 ${
                isCurrent 
                  ? 'border-[#c3c6d7] shadow-[0_4px_16px_rgba(0,0,0,0.12)]' 
                  : 'border-[#c3c6d7] hover:bg-[#f2f4f6]/60 shadow-sm'
              }`}
            >
              {/* Left indicator bar for active stop */}
              {isCurrent && <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-[#004ac6]"></div>}

              <div className={`flex justify-between items-start ${isCurrent ? 'ml-2' : ''}`}>
                <div className="flex items-start gap-3">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm flex-shrink-0 mt-0.5 ${
                    isCurrent 
                      ? 'bg-[#d3e4fe] text-[#004ac6]' 
                      : 'bg-[#eceef0] text-gray-600'
                  }`}>
                    {idx + 1}
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <h3 className="font-bold text-base text-[#191c1e] font-headline-md">{stop.destination}</h3>
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold font-label-md ${
                        isCurrent 
                          ? 'bg-[#d3e4fe] text-[#004ac6]' 
                          : 'bg-[#f2f4f6] text-gray-600'
                      }`}>
                        {isCurrent ? 'Đang giao' : 'Chờ giao'}
                      </span>
                    </div>
                    <p className="text-xs text-[#434655] font-medium flex items-center gap-1 font-body-md">
                      <span className="material-symbols-outlined text-[14px]">location_on</span>
                      {stop.address}
                    </p>
                    <p className="text-[11px] font-bold text-[#737686] mt-1 font-label-md">Order ID: {stop.orderId}</p>
                  </div>
                </div>

                {isCurrent && (
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      onMapClick();
                    }}
                    className="w-11 h-11 rounded-full bg-[#f2f4f6] hover:bg-[#e6e8ea] flex items-center justify-center text-[#004ac6] transition-colors flex-shrink-0 active:scale-90"
                  >
                    <span className="material-symbols-outlined text-[22px]">directions</span>
                  </button>
                )}
              </div>

              {/* Expanded Accordion Panel */}
              {isExpanded && (
                <div 
                  onClick={(e) => e.stopPropagation()} // prevent parent toggle
                  className={`expanded-details mt-4 pt-4 border-t border-[#e0e3e5] animate-fade-in ${isCurrent ? 'ml-2' : ''}`}
                >
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                      <p className="text-xs font-bold text-[#434655] font-label-md">Thu hộ (COD)</p>
                      <p className="text-base font-bold text-[#191c1e] font-headline-md">{stop.cod}</p>
                    </div>
                    <div>
                      <p className="text-xs font-bold text-[#434655] font-label-md">Số điện thoại</p>
                      <p className="text-sm font-bold text-[#004ac6] hover:underline cursor-pointer font-body-md">{stop.phone}</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button 
                      onClick={onCallClick}
                      className="flex-1 h-12 rounded-xl bg-[#eceef0] text-[#191c1e] font-bold text-sm flex items-center justify-center gap-2 hover:bg-[#e6e8ea] active:scale-95 transition-all shadow-sm font-label-md"
                    >
                      <span className="material-symbols-outlined text-[18px]">call</span>
                      Gọi
                    </button>
                    {isCurrent && (
                      <button 
                        onClick={onScanClick}
                        className="flex-1 h-12 rounded-xl bg-[#004ac6] text-white font-bold text-sm flex items-center justify-center gap-2 hover:bg-[#2563eb] active:scale-95 transition-all shadow-md shadow-[#004ac6]/10 font-label-md"
                      >
                        Đã giao
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
