import React, { useState, useEffect } from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Cell
} from 'recharts';

interface ChartDataItem {
  time: string;
  efficiency: number;
}

const DATA_1H: ChartDataItem[] = [
  { time: '10:00', efficiency: 91 },
  { time: '10:10', efficiency: 93 },
  { time: '10:20', efficiency: 92 },
  { time: '10:30', efficiency: 94 },
  { time: '10:40', efficiency: 93 },
  { time: '10:50', efficiency: 95 },
  { time: 'Hiện tại', efficiency: 96 }
];

const DATA_24H: ChartDataItem[] = [
  { time: '08:00', efficiency: 40 },
  { time: '10:00', efficiency: 65 },
  { time: '12:00', efficiency: 85 },
  { time: '14:00', efficiency: 70 },
  { time: '16:00', efficiency: 30 },
  { time: '18:00', efficiency: 92 },
  { time: 'Hiện tại', efficiency: 75 }
];

const DATA_7D: ChartDataItem[] = [
  { time: 'T2', efficiency: 88 },
  { time: 'T3', efficiency: 90 },
  { time: 'T4', efficiency: 89 },
  { time: 'T5', efficiency: 92 },
  { time: 'T6', efficiency: 91 },
  { time: 'T7', efficiency: 94 },
  { time: 'CN', efficiency: 95 }
];

interface AssetUnit {
  id: string;
  status: 'EN ROUTE' | 'ENGINE TEMP' | 'DELIVERING' | 'IDLE';
  speed: number;
  location: string;
  progress: number;
}

const INITIAL_ASSETS: AssetUnit[] = [
  { id: 'TRK-882', status: 'EN ROUTE', speed: 65, location: 'Quốc lộ I-95 Hướng Bắc, MM 42', progress: 75 },
  { id: 'TRK-401', status: 'ENGINE TEMP', speed: 0, location: 'Tuyến 66, Trạm kiểm soát B', progress: 0 },
  { id: 'VAN-112', status: 'DELIVERING', speed: 0, location: 'Khu vực Trung tâm', progress: 90 },
  { id: 'TRK-990', status: 'IDLE', speed: 0, location: 'Trạm trung chuyển Alpha', progress: 100 },
  { id: 'TRK-885', status: 'EN ROUTE', speed: 55, location: 'Quốc lộ I-95 Hướng Bắc, MM 60', progress: 40 }
];

interface FleetMonitoringTabProps {
  searchQuery: string;
  setToastMessage: (msg: string | null) => void;
  setActiveTab: (tab: string) => void;
}

export const FleetMonitoringTab: React.FC<FleetMonitoringTabProps> = ({
  searchQuery,
  setToastMessage,
  setActiveTab,
}) => {
  const [timeRange, setTimeRange] = useState<'1H' | '24H' | '7D'>('24H');
  const [avgEfficiency, setAvgEfficiency] = useState(94.2);
  const [criticalAlerts, setCriticalAlerts] = useState(3);
  const [assets, setAssets] = useState<AssetUnit[]>(INITIAL_ASSETS);
  const [isIdleReductionApplied, setIsIdleReductionApplied] = useState(false);
  const [showDiagnoseModal, setShowDiagnoseModal] = useState(false);
  const [diagnosedVehicleId, setDiagnosedVehicleId] = useState<string | null>(null);

  // Live telemetry dynamic fluctuations
  useEffect(() => {
    const timer = setInterval(() => {
      // Fluctuate efficiency slightly
      setAvgEfficiency((prev) => {
        const delta = (Math.random() - 0.5) * 0.4;
        return parseFloat(Math.max(91.0, Math.min(97.0, prev + delta)).toFixed(1));
      });

      // Fluctuate en route speeds
      setAssets((prevAssets) =>
        prevAssets.map((a) => {
          if (a.status !== 'EN ROUTE') return a;
          const speedDelta = (Math.random() - 0.5) * 4;
          return {
            ...a,
            speed: Math.max(50, Math.min(75, Math.round(a.speed + speedDelta))),
          };
        })
      );
    }, 4000);

    return () => clearInterval(timer);
  }, []);

  const handleApplyIdleReduction = () => {
    setIsIdleReductionApplied(true);
    setToastMessage('Tối ưu hóa AI: Đã điều hướng đoàn xe tránh kẹt cho Phân khu Alpha. Dự kiến tiết kiệm 45 phút.');
    // Increase efficiency & reduce alert count in real time
    setAvgEfficiency((prev) => parseFloat((prev + 1.2).toFixed(1)));
    if (criticalAlerts > 0) setCriticalAlerts((prev) => prev - 1);
  };

  const handleDiagnose = (id: string) => {
    setDiagnosedVehicleId(id);
    setShowDiagnoseModal(true);
  };

  const getChartData = () => {
    if (timeRange === '1H') return DATA_1H;
    if (timeRange === '7D') return DATA_7D;
    return DATA_24H;
  };

  // Filters mapping - Live Asset Feed
  const filteredAssets = assets.filter((a) => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return true;
    return (
      a.id.toLowerCase().includes(q) ||
      a.status.toLowerCase().includes(q) ||
      a.location.toLowerCase().includes(q)
    );
  });

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-gutter h-full min-h-0 select-none">
      
      {/* LEFT: Bento Analytics & AI Chart Grid */}
      <div className="lg:col-span-8 flex flex-col gap-gutter min-h-0 overflow-y-auto pr-1">
        
        {/* Top Row: KPIs */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-gutter shrink-0">
          
          {/* KPI 1 */}
          <div className="glass-panel rounded-xl p-4 flex flex-col gap-2 relative overflow-hidden group select-none">
            <div className="absolute top-0 right-0 w-16 h-16 bg-primary/10 rounded-full blur-xl -mr-8 -mt-8" />
            <span className="font-label-caps text-label-caps text-on-surface-variant uppercase text-[10px] tracking-wider font-bold">Hạm đội hoạt động</span>
            <div className="flex items-end gap-2 text-left">
              <span className="font-display-lg text-display-lg text-on-surface font-bold text-2xl">1,204</span>
              <span className="font-data-tabular text-data-tabular text-secondary mb-0.5 text-xs font-semibold">/ 1,250</span>
            </div>
            <div className="w-full h-1 bg-surface-variant rounded-full mt-2 overflow-hidden select-none">
              <div className="h-full bg-primary w-[96%] shadow-[0_0_10px_rgba(37,99,235,0.7)]" />
            </div>
          </div>

          {/* KPI 2 */}
          <div className="glass-panel rounded-xl p-4 flex flex-col gap-2 relative overflow-hidden group select-none">
            <div className="absolute top-0 right-0 w-16 h-16 bg-secondary/10 rounded-full blur-xl -mr-8 -mt-8" />
            <span className="font-label-caps text-label-caps text-on-surface-variant uppercase text-[10px] tracking-wider font-bold">Hiệu suất Trung bình</span>
            <div className="flex items-end gap-1 text-left select-none">
              <span className="font-display-lg text-display-lg text-on-surface font-bold text-2xl">{avgEfficiency}</span>
              <span className="font-data-tabular text-data-tabular text-on-surface-variant mb-0.5 text-xs font-bold">%</span>
            </div>
            <div className="flex items-center gap-1 text-secondary font-data-tabular text-[11px] font-semibold text-left">
              <span className="material-symbols-outlined text-[14px]">trending_up</span>
              +2.1% so với giờ trước
            </div>
          </div>

          {/* KPI 3 */}
          <div className="glass-panel rounded-xl p-4 flex flex-col gap-2 relative overflow-hidden group select-none">
            <div className="absolute top-0 right-0 w-16 h-16 bg-error/10 rounded-full blur-xl -mr-8 -mt-8" />
            <span className="font-label-caps text-label-caps text-on-surface-variant uppercase text-[10px] tracking-wider font-bold">Cảnh báo Nghiêm trọng</span>
            <div className="flex items-end gap-2 text-left select-none">
              <span className={`font-display-lg text-display-lg font-bold text-2xl ${criticalAlerts > 0 ? 'text-error animate-pulse' : 'text-on-surface'}`}>
                {criticalAlerts.toString().padStart(2, '0')}
              </span>
            </div>
            <div className={`flex items-center gap-1 font-data-tabular text-[11px] text-left font-bold ${criticalAlerts > 0 ? 'text-error' : 'text-on-surface-variant'}`}>
              <span className="material-symbols-outlined text-[14px]">warning</span>
              {criticalAlerts > 0 ? 'Yêu cầu xử lý' : 'Tất cả an toàn'}
            </div>
          </div>

          {/* KPI 4 */}
          <div className="glass-panel rounded-xl p-4 flex flex-col gap-2 relative overflow-hidden group select-none">
            <div className="absolute top-0 right-0 w-16 h-16 bg-primary/10 rounded-full blur-xl -mr-8 -mt-8" />
            <span className="font-label-caps text-label-caps text-on-surface-variant uppercase text-[10px] tracking-wider font-bold">Nhiên liệu tiêu thụ</span>
            <div className="flex items-end gap-1 text-left select-none">
              <span className="font-display-lg text-display-lg text-on-surface font-bold text-2xl">4.2</span>
              <span className="font-data-tabular text-data-tabular text-on-surface-variant mb-0.5 text-xs font-bold">kGal</span>
            </div>
            <div className="w-full h-1 bg-surface-variant rounded-full mt-2 overflow-hidden flex select-none">
              <div className="h-full bg-secondary w-[40%] shadow-[0_0_10px_rgba(6,182,212,0.5)]" />
              <div className="h-full bg-primary/50 w-[60%]" />
            </div>
          </div>
        </div>

        {/* Middle Row: Analytics Recharts Chart */}
        <div className="glass-panel rounded-xl p-5 flex-1 min-h-[340px] flex flex-col text-left">
          <div className="flex justify-between items-center mb-6 pb-4 border-b border-outline-variant/10 shrink-0">
            <div>
              <h2 className="font-headline-sm text-headline-sm text-on-surface font-bold">Sức khỏe & Sử dụng Toàn Hệ thống</h2>
              <p className="font-body-md text-body-md text-on-surface-variant mt-1 text-sm">Đo lường thời gian thực trên tất cả các phân khu hoạt động.</p>
            </div>
            
            <div className="flex gap-2 text-xs font-bold font-data-tabular">
              <button
                onClick={() => setTimeRange('1H')}
                className={`px-3 py-1.5 rounded-lg border transition-all ${
                  timeRange === '1H'
                    ? 'bg-primary/20 text-primary border-primary/50 shadow-[0_0_8px_rgba(37,99,235,0.3)]'
                    : 'bg-surface-variant/40 border-outline-variant/30 text-on-surface hover:bg-surface-variant'
                }`}
              >
                1H
              </button>
              <button
                onClick={() => setTimeRange('24H')}
                className={`px-3 py-1.5 rounded-lg border transition-all ${
                  timeRange === '24H'
                    ? 'bg-primary/20 text-primary border-primary/50 shadow-[0_0_8px_rgba(37,99,235,0.3)]'
                    : 'bg-surface-variant/40 border-outline-variant/30 text-on-surface hover:bg-surface-variant'
                }`}
              >
                24H
              </button>
              <button
                onClick={() => setTimeRange('7D')}
                className={`px-3 py-1.5 rounded-lg border transition-all ${
                  timeRange === '7D'
                    ? 'bg-primary/20 text-primary border-primary/50 shadow-[0_0_8px_rgba(37,99,235,0.3)]'
                    : 'bg-surface-variant/40 border-outline-variant/30 text-on-surface hover:bg-surface-variant'
                }`}
              >
                7D
              </button>
            </div>
          </div>

          {/* Real Recharts Component */}
          <div className="flex-1 w-full min-h-0 select-none">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={getChartData()}
                margin={{ top: 10, right: 10, left: -25, bottom: 0 }}
              >
                <XAxis
                  dataKey="time"
                  stroke="#8d90a0"
                  fontSize={10}
                  tickLine={false}
                  axisLine={{ stroke: 'rgba(255,255,255,0.1)' }}
                />
                <YAxis
                  stroke="#8d90a0"
                  fontSize={10}
                  tickLine={false}
                  axisLine={{ stroke: 'rgba(255,255,255,0.1)' }}
                  domain={[0, 100]}
                />
                <Tooltip
                  cursor={{ fill: 'rgba(255,255,255,0.03)' }}
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      return (
                        <div className="glass-panel p-2.5 rounded-lg text-xs font-bold border border-outline-variant/30 text-left">
                          <p className="text-on-surface-variant mb-1 font-label-caps uppercase text-[9px] tracking-wider">Điểm đo lường</p>
                          <p className="text-secondary font-data-tabular text-sm">
                            Hiệu suất {payload[0].value}%
                          </p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Bar dataKey="efficiency" radius={[4, 4, 0, 0]}>
                  {getChartData().map((entry, index) => {
                    const isNow = entry.time === 'Hiện tại' || entry.time === 'CN' || entry.time === '10:50';
                    return (
                      <Cell
                        key={`cell-${index}`}
                        fill={isNow ? '#4cd7f6' : '#2563eb'}
                        fillOpacity={isNow ? 0.9 : 0.6}
                      />
                    );
                  })}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Bottom Row: AI Optimization Panel */}
        <div className="glass-panel rounded-xl p-5 relative overflow-hidden border-l-4 border-l-secondary shrink-0 text-left select-none">
          <div className="absolute right-0 top-0 w-64 h-full bg-gradient-to-l from-secondary/5 to-transparent pointer-events-none" />
          
          <div className="flex items-center gap-3 mb-4 select-none">
            <span className="material-symbols-outlined text-secondary animate-[pulse_2s_infinite]" data-weight="fill">smart_toy</span>
            <h3 className="font-headline-sm text-headline-sm text-on-surface font-bold">Tối ưu hóa Hạm đội AI</h3>
            <div className="px-2 py-0.5 bg-secondary/15 border border-secondary/30 rounded text-secondary font-label-caps text-[9px] ml-auto font-bold animate-pulse">
              ĐANG PHÂN TÍCH DỮ LIỆU THỜI GIAN THỰC
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            
            {/* Recommendation 1 */}
            <div className={`border rounded-lg p-3.5 transition-all duration-300 ${isIdleReductionApplied ? 'bg-surface-variant/15 border-outline-variant/10 opacity-70' : 'bg-surface-container-low/50 border-outline-variant/20 hover:border-secondary/50 cursor-pointer group'}`}>
              <div className="flex justify-between items-start mb-2 select-none">
                <span className="font-body-md text-body-md text-on-surface font-semibold">Giảm thời gian rảnh</span>
                <span className={`material-symbols-outlined text-[18px] ${isIdleReductionApplied ? 'text-primary' : 'text-secondary group-hover:rotate-12 transition-transform'}`}>
                  {isIdleReductionApplied ? 'check_circle' : 'bolt'}
                </span>
              </div>
              
              <p className="font-body-md text-[12px] text-on-surface-variant mb-4 leading-snug">
                {isIdleReductionApplied
                  ? 'Đã triển khai định tuyến lại đoàn xe. Thông số tốc độ tối ưu đã được áp dụng.'
                  : 'Định tuyến lại 12 xe ở Phân khu Alpha có thể tiết kiệm 45 phút thời gian chờ.'}
              </p>

              {isIdleReductionApplied ? (
                <span className="text-[10px] font-label-caps text-primary font-bold">ĐÃ TRIỂN KHAI VÀO HỆ THỐNG</span>
              ) : (
                <button
                  onClick={handleApplyIdleReduction}
                  className="text-[11px] font-label-caps text-secondary font-bold flex items-center gap-1 hover:underline active:scale-[0.98]"
                >
                  ÁP DỤNG ĐỀ XUẤT <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
                </button>
              )}
            </div>

            {/* Recommendation 2 */}
            <div className="bg-surface-container-low/50 border border-outline-variant/20 rounded-lg p-3.5 hover:border-secondary/50 transition-colors cursor-pointer group">
              <div className="flex justify-between items-start mb-2 select-none">
                <span className="font-body-md text-body-md text-on-surface font-semibold">Chế độ Tiết kiệm Nhiên liệu</span>
                <span className="material-symbols-outlined text-secondary text-[18px] group-hover:rotate-12 transition-transform">eco</span>
              </div>
              
              <p className="font-body-md text-[12px] text-on-surface-variant mb-4 leading-snug">
                Đề xuất giảm tốc độ (tối đa 55mph) cho Đoàn xe Delta dựa trên trọng lượng tải hàng.
              </p>
              
              <button
                onClick={() => setToastMessage('Thông số AI: Đã tính toán chỉ số tải trọng Đoàn Delta. Tốc độ khuyến nghị là 54mph.')}
                className="text-[11px] font-label-caps text-secondary font-bold flex items-center gap-1 hover:underline active:scale-[0.98]"
              >
                XEM CHI TIẾT THÔNG SỐ <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
              </button>
            </div>

          </div>
        </div>

      </div>

      {/* RIGHT: Real-time Vehicle Status Grid */}
      <div className="lg:col-span-4 glass-panel rounded-xl flex flex-col h-full max-h-full overflow-hidden">
        <div className="p-4 border-b border-outline-variant/10 bg-surface/40 flex justify-between items-center shrink-0">
          <h3 className="font-headline-sm text-headline-sm text-on-surface font-semibold flex items-center gap-2 select-none">
            <span className="w-2 h-2 rounded-full bg-secondary animate-pulse inline-block" />
            Dòng phương tiện thời gian thực
          </h3>
          <span className="material-symbols-outlined text-on-surface-variant cursor-pointer hover:text-secondary p-1">filter_list</span>
        </div>

        <div className="flex-1 overflow-y-auto p-2 flex flex-col gap-2">
          {filteredAssets.length === 0 ? (
            <div className="p-8 text-center text-on-surface-variant select-none">
              Không có phương tiện phù hợp.
            </div>
          ) : (
            filteredAssets.map((asset) => {
              const isAlert = asset.status === 'ENGINE TEMP';
              const isIdle = asset.status === 'IDLE';

              return (
                <div
                  key={asset.id}
                  className={`border rounded-lg p-3 transition-colors ${
                    isAlert
                      ? 'bg-error/10 border-error/30 hover:bg-error/15 relative overflow-hidden'
                      : 'bg-surface-container-low/85 border-outline-variant/20 hover:bg-surface-variant/40'
                  } ${isIdle ? 'opacity-70' : ''}`}
                >
                  {isAlert && (
                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-error" />
                  )}

                  <div className="flex justify-between items-start mb-1 text-left select-none">
                    <div className="flex items-center gap-2">
                      <span className="font-data-tabular text-data-tabular text-on-surface font-bold">{asset.id}</span>
                      
                      {isAlert ? (
                        <span className="px-1.5 py-0.5 bg-error/25 border border-error/50 rounded text-error font-label-caps text-[9px] font-bold animate-pulse">
                          LỖI NHIỆT ĐỘ
                        </span>
                      ) : asset.status === 'DELIVERING' ? (
                        <span className="px-1.5 py-0.5 bg-secondary/15 border border-secondary/30 rounded text-secondary font-label-caps text-[9px] font-bold">
                          ĐANG GIAO
                        </span>
                      ) : isIdle ? (
                        <span className="px-1.5 py-0.5 bg-surface-variant border border-outline-variant/50 rounded text-on-surface-variant font-label-caps text-[9px] font-bold">
                          ĐANG RẢNH
                        </span>
                      ) : (
                        <span className="px-1.5 py-0.5 bg-primary/15 border border-primary/30 rounded text-primary font-label-caps text-[9px] font-bold">
                          ĐANG DI CHUYỂN
                        </span>
                      )}
                    </div>
                    <span className={`font-data-tabular text-[11px] font-bold ${isAlert ? 'text-error animate-pulse' : 'text-on-surface-variant'}`}>
                      {asset.speed} mph
                    </span>
                  </div>

                  <div className="flex items-center justify-between mt-2 select-none text-left">
                    <div className="flex items-center gap-1 text-[11px] text-on-surface-variant font-data-tabular">
                      <span className={`material-symbols-outlined text-[14px] ${isAlert ? 'text-error' : isIdle ? 'text-on-surface-variant' : 'text-secondary'}`}>
                        {isIdle ? 'local_parking' : isAlert ? 'warning' : 'location_on'}
                      </span>
                      {asset.location}
                    </div>

                    {isAlert ? (
                      <button
                        onClick={() => handleDiagnose(asset.id)}
                        className="text-[10px] font-label-caps text-on-surface bg-error/25 px-2 py-0.5 rounded border border-error/45 hover:bg-error/40 transition-colors font-bold active:scale-[0.98]"
                      >
                        CHẨN ĐOÁN
                      </button>
                    ) : (
                      <div className="w-16 h-1 bg-surface-variant rounded-full overflow-hidden select-none">
                        <div className={`h-full rounded-full ${isIdle ? 'bg-surface-variant' : 'bg-primary'}`} style={{ width: `${asset.progress}%` }} />
                      </div>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* View Full Directory Action Footer */}
        <div className="p-3 border-t border-outline-variant/10 bg-surface/40 shrink-0 select-none">
          <button
            onClick={() => setActiveTab('Vehicles')}
            className="w-full py-2.5 bg-primary/10 hover:bg-primary/20 border border-primary/30 rounded-lg text-primary font-label-caps text-[11px] font-bold transition-colors flex items-center justify-center gap-2 active:scale-[0.98]"
          >
            XEM TOÀN BỘ DANH SÁCH <span className="material-symbols-outlined text-[14px]">open_in_new</span>
          </button>
        </div>
      </div>

      {/* DYNAMIC Diagnose Warning Dialog Modal */}
      {showDiagnoseModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in pointer-events-auto">
          <div className="w-full max-w-md glass-panel rounded-xl overflow-hidden border border-error/40 shadow-2xl animate-scale-up">
            <div className="p-4 border-b border-error/30 flex justify-between items-center bg-error-container/20">
              <h3 className="font-headline-sm text-headline-sm font-bold text-error flex items-center gap-2">
                <span className="material-symbols-outlined text-[20px] text-error animate-pulse">warning</span>
                Chẩn đoán Khẩn cấp - {diagnosedVehicleId}
              </h3>
              
              <button
                onClick={() => setShowDiagnoseModal(false)}
                className="text-on-surface-variant hover:text-error transition-colors p-1"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            <div className="p-5 flex flex-col gap-4 text-left font-body-md">
              <div className="bg-error/10 border border-error/25 p-3.5 rounded-lg flex items-start gap-3">
                <span className="material-symbols-outlined text-error mt-0.5">engineering</span>
                <div>
                  <p className="text-on-surface font-semibold text-xs mb-1">Mã cảnh báo động cơ: E-204</p>
                  <p className="text-[12px] text-on-surface-variant leading-snug">
                    Phát hiện nguy cơ quá nhiệt. Chỉ số nước làm mát két nước đang ở mức nghiêm trọng (215°F). Khuyến nghị điều phối đi lộ trình tránh ngay lập tức.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 font-data-tabular">
                <div className="bg-surface-variant/20 p-3 rounded border border-outline-variant/10">
                  <span className="text-[10px] font-label-caps text-on-surface-variant uppercase font-bold tracking-wider">Nhiệt độ động cơ</span>
                  <p className="text-error font-bold text-[18px] animate-pulse">215 °F</p>
                </div>
                
                <div className="bg-surface-variant/20 p-3 rounded border border-outline-variant/10">
                  <span className="text-[10px] font-label-caps text-on-surface-variant uppercase font-bold tracking-wider">Áp suất dầu</span>
                  <p className="text-on-surface font-semibold text-[18px]">34 PSI</p>
                </div>
              </div>

              <button
                onClick={() => {
                  setShowDiagnoseModal(false);
                  setToastMessage(`Bảo trì: Đã gửi hướng dẫn chẩn đoán cho ${diagnosedVehicleId}. Đội lưu động đã chuyển hướng.`);
                }}
                className="mt-2 bg-error text-white py-2.5 rounded-lg text-sm font-bold tracking-wider hover:brightness-110 active:scale-[0.98] transition-all shadow-[0_0_15px_rgba(239,68,68,0.4)] flex items-center justify-center gap-1.5"
              >
                <span className="material-symbols-outlined text-[18px]">support_agent</span>
                ĐIỀU ĐỘI DỊCH VỤ LƯU ĐỘNG
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FleetMonitoringTab;
