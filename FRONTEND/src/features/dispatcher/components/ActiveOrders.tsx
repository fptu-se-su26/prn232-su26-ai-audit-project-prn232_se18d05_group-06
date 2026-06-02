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
    <div className="lg:col-span-3 glass-panel rounded-lg flex flex-col h-full overflow-hidden transition-all duration-300">
      <div className="p-4 border-b border-white/10 flex justify-between items-center bg-surface/40 shrink-0">
        <h3 className="font-headline-sm text-headline-sm text-on-surface flex items-center gap-2 font-semibold">
          <span className="material-symbols-outlined text-[18px] text-primary">list_alt</span>
          Đơn hàng Hoạt động
        </h3>
        <span className="bg-primary/25 text-primary font-data-tabular text-[11px] px-2 py-0.5 rounded border border-primary/30 flex items-center gap-1 select-none animate-pulse">
          <span className="w-1.5 h-1.5 bg-primary rounded-full"></span>
          Trực tiếp
        </span>
      </div>

      <div className="flex-1 overflow-y-auto p-2 flex flex-col gap-2">
        {orders.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-32 p-4 text-center">
            <span className="material-symbols-outlined text-[32px] text-on-surface-variant/45 mb-2">
              inbox
            </span>
            <p className="text-[12px] text-on-surface-variant">Không tìm thấy đơn hàng phù hợp</p>
          </div>
        ) : (
          orders.map((order) => {
            const isSelected = selectedOrderId === order.id;
            const isDelayed = order.status === 'delayed';

            return (
              <div
                key={order.id}
                onClick={() => onOrderSelect(isSelected ? null : order.id)}
                className={`transition-all duration-300 rounded p-3 cursor-pointer relative overflow-hidden select-none border ${isSelected
                    ? isDelayed
                      ? 'bg-error/15 border-error/50 shadow-[0_0_15px_rgba(255,180,171,0.2)]'
                      : 'bg-primary-container/20 border-primary shadow-[0_0_15px_rgba(37,99,235,0.2)]'
                    : isDelayed
                      ? 'bg-error/5 border-error/25 hover:bg-error/10 hover:border-error/45'
                      : 'bg-black/20 border-outline-variant/30 hover:bg-surface-variant/40 hover:border-outline-variant/50'
                  }`}
              >
                <div
                  className={`absolute left-0 top-0 bottom-0 w-1 transition-all duration-300 ${isDelayed ? 'bg-error' : isSelected ? 'bg-primary' : 'bg-transparent'
                    }`}
                />

                <div className="flex justify-between items-start mb-2 pl-1">
                  <span
                    className={`font-data-tabular text-data-tabular font-bold ${isDelayed ? 'text-error' : 'text-primary'
                      }`}
                  >
                    {order.id}
                  </span>
                  <span
                    className={`font-data-tabular text-[11px] font-semibold flex items-center gap-1 ${isDelayed ? 'text-error' : 'text-secondary'
                      }`}
                  >
                    {isDelayed && (
                      <span className="material-symbols-outlined text-[12px] animate-pulse">
                        warning
                      </span>
                    )}
                    {isDelayed ? 'Trễ hạn' : `Dự kiến: ${order.eta}`}
                  </span>
                </div>

                <div className="flex items-center gap-2 mb-1.5 pl-1">
                  <div className="w-5 h-5 rounded-full bg-surface-variant overflow-hidden border border-outline-variant/20">
                    <img
                      alt={order.driverName}
                      className="w-full h-full object-cover"
                      src={order.driverAvatar}
                    />
                  </div>
                  <span className="text-[13px] text-on-surface-variant font-medium">
                    {order.driverName} ({order.vehicle})
                  </span>
                </div>

                <div
                  className={`flex items-center gap-1 text-[12px] pl-1 truncate ${isDelayed ? 'text-error/85 font-medium' : 'text-on-surface-variant'
                    }`}
                >
                  <span className="material-symbols-outlined text-[14px]">location_on</span>
                  <span className="truncate">{isDelayed ? order.delayReason : order.location}</span>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
