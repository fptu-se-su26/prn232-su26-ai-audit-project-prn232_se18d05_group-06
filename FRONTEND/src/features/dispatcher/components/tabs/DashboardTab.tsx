import React from 'react';
import { MapLayer } from '../MapLayer';
import { KPISection } from '../KPISection';
import { ActiveOrders as CommandOrders } from '../ActiveOrders';
import { AIInsights } from '../AIInsights';
import { LiveEvents } from '../LiveEvents';
import { Order, LiveEvent, AIRecommendation, KPIStats } from '@/types/dispatcher';

interface DashboardTabProps {
  orders: Order[];
  selectedOrderId: string | null;
  setSelectedOrderId: (id: string | null) => void;
  stats: KPIStats;
  filteredCommandOrders: Order[];
  recommendation: AIRecommendation | null;
  handleApplyRecommendation: (id: string) => void;
  handleDismissRecommendation: (id: string) => void;
  filteredEvents: LiveEvent[];
}

export const DashboardTab: React.FC<DashboardTabProps> = ({
  orders,
  selectedOrderId,
  setSelectedOrderId,
  stats,
  filteredCommandOrders,
  recommendation,
  handleApplyRecommendation,
  handleDismissRecommendation,
  filteredEvents,
}) => {
  const delayedOrders = orders.filter((order) => order.status === 'delayed').length;
  const activeOrders = orders.filter((order) => order.status !== 'delivered').length;

  return (
    <>
      <MapLayer
        orders={orders.filter((order) => order.status !== 'delivered')}
        selectedOrderId={selectedOrderId}
        onOrderSelect={setSelectedOrderId}
      />

      <div className="pointer-events-none relative z-10 flex h-full min-h-0 flex-col gap-gutter">
        <div className="pointer-events-auto shrink-0">
          <KPISection stats={stats} />
        </div>

        <div className="relative grid min-h-0 flex-1 grid-cols-1 gap-gutter lg:grid-cols-12">
          <div className="pointer-events-auto h-full min-h-0 lg:col-span-3">
            <CommandOrders
              orders={filteredCommandOrders}
              selectedOrderId={selectedOrderId}
              onOrderSelect={setSelectedOrderId}
            />
          </div>

          <div className="pointer-events-none hidden lg:col-span-6 lg:flex">
            <div className="pointer-events-auto mt-auto w-full">
              <div className="ops-panel-strong rounded-lg p-4">
                <div className="flex items-start justify-between gap-4 border-b border-slate-200 pb-3">
                  <div>
                    <h3 className="flex items-center gap-2 text-[15px] font-bold text-slate-950">
                      <span className="material-symbols-outlined text-[18px] text-[#0f6b7d]">warehouse</span>
                      Điều phối Dock & SLA
                    </h3>
                    <p className="mt-0.5 text-[12px] font-semibold text-slate-500">
                      Theo dõi xe đang vào bãi, nguy cơ lưu dock quá hạn và năng lực xử lý ca hiện tại
                    </p>
                  </div>
                  <span className={`rounded-md border px-2 py-1 text-[11px] font-bold ${
                    delayedOrders > 0
                      ? 'border-rose-200 bg-rose-50 text-rose-800'
                      : 'border-emerald-200 bg-emerald-50 text-emerald-800'
                  }`}>
                    {delayedOrders > 0 ? `${delayedOrders} cần xử lý` : 'Ổn định'}
                  </span>
                </div>

                <div className="mt-4 grid grid-cols-3 gap-3">
                  {[
                    { label: 'Dock trống', value: '05', icon: 'door_open', tone: 'text-emerald-700 bg-emerald-50 border-emerald-200' },
                    { label: 'Xe trong bãi', value: activeOrders.toString().padStart(2, '0'), icon: 'local_shipping', tone: 'text-[#0f6b7d] bg-cyan-50 border-cyan-200' },
                    { label: 'Nguy cơ Overstay', value: delayedOrders.toString().padStart(2, '0'), icon: 'timer', tone: delayedOrders > 0 ? 'text-rose-700 bg-rose-50 border-rose-200' : 'text-slate-600 bg-slate-50 border-slate-200' },
                  ].map((item) => (
                    <div key={item.label} className={`rounded-md border p-3 ${item.tone}`}>
                      <div className="flex items-center justify-between">
                        <span className="text-[12px] font-bold">{item.label}</span>
                        <span className="material-symbols-outlined text-[18px]">{item.icon}</span>
                      </div>
                      <p className="mt-3 font-data-tabular text-[26px] font-bold leading-none">{item.value}</p>
                    </div>
                  ))}
                </div>

                <div className="mt-4 grid grid-cols-2 gap-3">
                  <div className="rounded-md border border-slate-200 bg-white p-3">
                    <p className="text-[12px] font-bold text-slate-500">Luồng ưu tiên</p>
                    <p className="mt-1 text-[13px] font-bold text-slate-900">Hàng lạnh / y tế / trễ ETA</p>
                    <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-100">
                      <div className="h-full w-[72%] rounded-full bg-[#0f6b7d]" />
                    </div>
                  </div>
                  <div className="rounded-md border border-slate-200 bg-white p-3">
                    <p className="text-[12px] font-bold text-slate-500">SLA xử lý bãi</p>
                    <p className="mt-1 font-data-tabular text-[20px] font-bold text-slate-950">93.4%</p>
                    <p className="mt-1 text-[12px] font-semibold text-slate-500">Mục tiêu ca: 95%</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="pointer-events-auto flex h-full min-h-0 flex-col gap-gutter lg:col-span-3">
            {recommendation && !recommendation.dismissed && (
              <AIInsights
                recommendation={recommendation}
                onApply={handleApplyRecommendation}
                onDismiss={handleDismissRecommendation}
              />
            )}

            <LiveEvents events={filteredEvents} />
          </div>
        </div>
      </div>
    </>
  );
};

export default DashboardTab;
