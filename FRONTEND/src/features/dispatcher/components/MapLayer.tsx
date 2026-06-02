import React from 'react';
import { Order } from '@/types/dispatcher';

interface MapLayerProps {
  orders: Order[];
  selectedOrderId: string | null;
  onOrderSelect: (orderId: string | null) => void;
}

export const MapLayer: React.FC<MapLayerProps> = ({
  orders,
  selectedOrderId,
  onOrderSelect,
}) => {
  return (
    <div className="absolute inset-0 z-0 bg-surface-container-lowest select-none">
      <img
        alt="Command Center Map Base"
        className="w-full h-full object-cover opacity-25 mix-blend-screen transition-opacity duration-700"
        src="https://lh3.googleusercontent.com/aida-public/AB6AXuCa7DktpFT3Ozv5c3gM_VQP7SL5_nIt_alsUbKj4m3JOarFTqzmlCpwroKSFd4rBasfP_LqBGJ4MB44vvSdwUFQyCEbu8_n8tFt2moxBoB5Dmj3y2q8uEZVrqHzt6hONKx2lrL0qoCxcDBBuFtYrcU-btNhCyV6BpjpIxvtbL7lom4v_4PD2Q86zm8Ln0wi0WtoS6ae9RonPb5Z7mF4ORDgXDwJ7spbtZUYLXOQiScAKFPTp50rPGumvvvAOQDaGQKYnP5j6ZVSf7br"
      />

      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(5,20,36,0.1)_0%,rgba(5,20,36,0.9)_80%)] pointer-events-none" />

      {orders.map((order) => {
        const isSelected = selectedOrderId === order.id;
        const isDelayed = order.status === 'delayed';

        return (
          <div
            key={order.id}
            style={{ top: `${order.coordinates.y}%`, left: `${order.coordinates.x}%` }}
            className="absolute -translate-x-1/2 -translate-y-1/2 flex flex-col items-center justify-center pointer-events-auto z-10 group"
          >
            <button
              onClick={() => onOrderSelect(isSelected ? null : order.id)}
              className={`relative flex items-center justify-center p-2 rounded-full cursor-pointer transition-all duration-300 ${isSelected
                  ? isDelayed
                    ? 'bg-error/30 ring-2 ring-error scale-125 glow-alert'
                    : 'bg-secondary/30 ring-2 ring-secondary scale-125 glow-active'
                  : 'bg-black/40 hover:bg-black/60 hover:scale-110 border border-outline-variant/30'
                }`}
            >
              <span
                className={`material-symbols-outlined text-[18px] select-none ${isDelayed ? 'text-error' : 'text-secondary'
                  }`}
              >
                {isDelayed ? 'warning' : 'local_shipping'}
              </span>

              <div
                className={`absolute w-8 h-8 rounded-full pulse-marker pointer-events-none -z-10 ${isDelayed ? 'bg-error/25' : 'bg-secondary/25'
                  }`}
              />
            </button>

            <div
              className={`absolute top-full mt-2 w-48 p-2.5 glass-panel rounded-lg shadow-2xl pointer-events-none transition-all duration-300 flex flex-col gap-1 border border-outline-variant/20 ${isSelected
                  ? 'opacity-100 translate-y-0 visible z-30 scale-100'
                  : 'opacity-0 -translate-y-2 invisible group-hover:opacity-100 group-hover:translate-y-0 group-hover:visible group-hover:scale-95 group-hover:z-20'
                }`}
            >
              <div className="flex justify-between items-center border-b border-white/5 pb-1">
                <span className="font-data-tabular text-data-tabular text-primary font-bold">
                  {order.id}
                </span>
                <span className={`text-[10px] font-semibold uppercase px-1.5 py-0.25 rounded ${isDelayed ? 'bg-error/20 text-error' : 'bg-secondary/20 text-secondary'
                  }`}>
                  {order.status === 'delayed' ? 'Trễ hạn' : order.status === 'transit' ? 'Đang đi' : order.status === 'approaching' ? 'Đang đến' : order.status === 'delivered' ? 'Đã giao' : order.status}
                </span>
              </div>
              <p className="text-[11px] font-semibold text-on-surface truncate">
                {order.driverName} ({order.vehicle})
              </p>
              <p className="text-[10px] text-on-surface-variant leading-tight truncate">
                {order.location}
              </p>
              <p className="text-[10px] font-bold text-secondary flex items-center gap-1 mt-0.5">
                <span className="material-symbols-outlined text-[12px]">schedule</span>
                Dự kiến: {order.eta}
              </p>
            </div>

            {isSelected && (
              <svg className="absolute w-[600px] h-[600px] -z-10 pointer-events-none opacity-30 animate-pulse">
                <circle
                  cx="300"
                  cy="300"
                  r="60"
                  fill="none"
                  stroke={isDelayed ? '#ffb4ab' : '#4cd7f6'}
                  strokeWidth="1"
                  strokeDasharray="4 4"
                />
                <circle
                  cx="300"
                  cy="300"
                  r="120"
                  fill="none"
                  stroke={isDelayed ? '#ffb4ab' : '#4cd7f6'}
                  strokeWidth="0.5"
                  strokeDasharray="2 6"
                />
              </svg>
            )}
          </div>
        );
      })}
    </div>
  );
};
