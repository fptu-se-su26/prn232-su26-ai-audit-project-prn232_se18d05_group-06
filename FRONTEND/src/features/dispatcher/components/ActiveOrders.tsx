import React from 'react';
import { Order } from '@/types/dispatcher';

interface ActiveOrdersProps {
  orders: Order[];
  selectedOrderId: string | null;
  onOrderSelect: (orderId: string | null) => void;
}

export const ActiveOrders: React.FC<ActiveOrdersProps> = ({
  orders,
  selectedOrderId,
  onOrderSelect,
}) => {
  return (
    <div className="ops-panel-strong flex h-full flex-col overflow-hidden rounded-lg">
      <div className="flex shrink-0 items-center justify-between border-b border-slate-200 px-4 py-3">
        <div>
          <h3 className="flex items-center gap-2 text-[15px] font-bold text-slate-950">
            <span className="material-symbols-outlined text-[18px] text-[#0f6b7d]">list_alt</span>
            Hàng đợi điều phối
          </h3>
          <p className="mt-0.5 text-[12px] font-semibold text-slate-500">Booking, xe và ETA cần theo dõi</p>
        </div>
        <span className="rounded-md border border-emerald-200 bg-emerald-50 px-2 py-1 text-[11px] font-bold text-emerald-800">
          Live
        </span>
      </div>

      <div className="flex-1 space-y-2 overflow-y-auto p-2.5">
        {orders.length === 0 ? (
          <div className="flex h-36 flex-col items-center justify-center rounded-md border border-dashed border-slate-300 p-4 text-center">
            <span className="material-symbols-outlined mb-2 text-[32px] text-slate-300">inbox</span>
            <p className="text-[13px] font-semibold text-slate-500">Không có đơn phù hợp bộ lọc.</p>
          </div>
        ) : (
          orders.map((order) => {
            const isSelected = selectedOrderId === order.id;
            const isDelayed = order.status === 'delayed';

            return (
              <button
                key={order.id}
                onClick={() => onOrderSelect(isSelected ? null : order.id)}
                className={`w-full rounded-md border p-3 text-left transition-colors ${
                  isSelected
                    ? 'border-[#0f6b7d] bg-cyan-50'
                    : isDelayed
                      ? 'border-rose-200 bg-rose-50 hover:bg-rose-100/70'
                      : 'border-slate-200 bg-white hover:bg-slate-50'
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className={`font-data-tabular text-[13px] font-bold ${isDelayed ? 'text-rose-700' : 'text-[#0f3554]'}`}>
                      {order.id}
                    </p>
                    <p className="mt-1 truncate text-[13px] font-semibold text-slate-700">
                      {order.driverName} • {order.vehicle}
                    </p>
                  </div>
                  <span className={`shrink-0 rounded px-2 py-1 text-[11px] font-bold ${isDelayed ? 'bg-rose-100 text-rose-800' : 'bg-cyan-100 text-cyan-900'}`}>
                    {isDelayed ? 'Trễ hạn' : order.eta}
                  </span>
                </div>
                <div className={`mt-2 flex items-center gap-1.5 text-[12px] font-semibold ${isDelayed ? 'text-rose-700' : 'text-slate-500'}`}>
                  <span className="material-symbols-outlined text-[15px]">{isDelayed ? 'warning' : 'location_on'}</span>
                  <span className="truncate">{isDelayed ? order.delayReason : order.location}</span>
                </div>
              </button>
            );
          })
        )}
      </div>
    </div>
  );
};
