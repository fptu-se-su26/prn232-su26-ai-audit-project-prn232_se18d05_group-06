import React from 'react';
import { Order } from '@/types/dispatcher';

interface MapLayerProps {
  orders: Order[];
  selectedOrderId: string | null;
  onOrderSelect: (orderId: string | null) => void;
}

const statusLabel = (status: Order['status']) => {
  if (status === 'delayed') return 'Trễ hạn';
  if (status === 'transit') return 'Đang đi';
  if (status === 'approaching') return 'Đang đến';
  if (status === 'delivered') return 'Đã giao';
  return status;
};

export const MapLayer: React.FC<MapLayerProps> = ({
  orders,
  selectedOrderId,
  onOrderSelect,
}) => {
  return (
    <div className="absolute inset-0 z-0 select-none bg-[#eef3f7]">
      <img
        alt="Dispatcher operating map"
        className="h-full w-full object-cover opacity-[0.18] mix-blend-multiply saturate-75 transition-opacity duration-700"
        src="https://lh3.googleusercontent.com/aida-public/AB6AXuCa7DktpFT3Ozv5c3gM_VQP7SL5_nIt_alsUbKj4m3JOarFTqzmlCpwroKSFd4rBasfP_LqBGJ4MB44vvSdwUFQyCEbu8_n8tFt2moxBoB5Dmj3y2q8uEZVrqHzt6hONKx2lrL0qoCxcDBBuFtYrcU-btNhCyV6BpjpIxvtbL7lom4v_4PD2Q86zm8Ln0wi0WtoS6ae9RonPb5Z7mF4ORDgXDwJ7spbtZUYLXOQiScAKFPTp50rPGumvvvAOQDaGQKYnP5j6ZVSf7br"
      />

      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(255,255,255,0.22)_0%,rgba(238,243,247,0.96)_78%)]" />
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(15,53,84,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(15,53,84,0.05)_1px,transparent_1px)] bg-[size:44px_44px]" />

      {orders.map((order) => {
        const isSelected = selectedOrderId === order.id;
        const isDelayed = order.status === 'delayed';

        return (
          <div
            key={order.id}
            style={{ top: `${order.coordinates.y}%`, left: `${order.coordinates.x}%` }}
            className="group absolute z-10 flex -translate-x-1/2 -translate-y-1/2 flex-col items-center justify-center pointer-events-auto"
          >
            <button
              onClick={() => onOrderSelect(isSelected ? null : order.id)}
              className={`relative flex h-9 w-9 items-center justify-center rounded-full border shadow-sm transition-all duration-200 ${
                isSelected
                  ? isDelayed
                    ? 'scale-110 border-rose-300 bg-rose-100 text-rose-700 ring-4 ring-rose-100'
                    : 'scale-110 border-cyan-300 bg-cyan-100 text-cyan-800 ring-4 ring-cyan-100'
                  : isDelayed
                    ? 'border-rose-200 bg-white text-rose-700 hover:bg-rose-50'
                    : 'border-slate-200 bg-white text-[#0f6b7d] hover:bg-cyan-50'
              }`}
              aria-label={`Chọn đơn ${order.id}`}
            >
              <span className="material-symbols-outlined text-[18px]">
                {isDelayed ? 'warning' : 'local_shipping'}
              </span>
              <span className={`absolute -z-10 h-10 w-10 rounded-full ${isDelayed ? 'bg-rose-200/60' : 'bg-cyan-200/60'} ${isSelected ? '' : 'animate-ping'}`} />
            </button>

            <div
              className={`pointer-events-none absolute top-full mt-2 w-52 rounded-lg border bg-white p-3 shadow-xl transition-all duration-200 ${
                isSelected
                  ? 'visible z-30 translate-y-0 scale-100 opacity-100'
                  : 'invisible -translate-y-1 scale-95 opacity-0 group-hover:visible group-hover:z-20 group-hover:translate-y-0 group-hover:opacity-100'
              }`}
            >
              <div className="flex items-center justify-between gap-2 border-b border-slate-100 pb-2">
                <span className="font-data-tabular text-[12px] font-bold text-[#0f3554]">
                  {order.id}
                </span>
                <span className={`rounded px-1.5 py-0.5 text-[10px] font-bold ${isDelayed ? 'bg-rose-100 text-rose-700' : 'bg-cyan-100 text-cyan-900'}`}>
                  {statusLabel(order.status)}
                </span>
              </div>
              <p className="mt-2 truncate text-[12px] font-semibold text-slate-800">
                {order.driverName} ({order.vehicle})
              </p>
              <p className="mt-1 truncate text-[11px] font-semibold text-slate-500">
                {order.location}
              </p>
              <p className={`mt-2 flex items-center gap-1 text-[11px] font-bold ${isDelayed ? 'text-rose-700' : 'text-[#0f6b7d]'}`}>
                <span className="material-symbols-outlined text-[13px]">schedule</span>
                ETA: {order.eta}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
};
