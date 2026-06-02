import React from 'react';
import { KPIStats } from '@/types/dispatcher';

interface KPISectionProps {
  stats: KPIStats;
}

export const KPISection: React.FC<KPISectionProps> = ({ stats }) => {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-gutter shrink-0">
      <div className="glass-panel rounded-lg p-4 flex flex-col gap-2 relative overflow-hidden group hover:glow-active transition-all duration-300">
        <div className="flex justify-between items-center">
          <span className="font-label-caps text-label-caps text-on-surface-variant uppercase tracking-wider text-[10px]">
            Đơn hàng Đang giao
          </span>
          <span className="material-symbols-outlined text-secondary text-[16px]">package</span>
        </div>
        <div className="font-display-lg text-display-lg font-bold text-on-surface select-none">
          {stats.activeDeliveries}
        </div>
        <div className="flex items-center gap-1 text-[12px] text-secondary font-semibold">
          <span className="material-symbols-outlined text-[14px]">trending_up</span>
          <span>+12% so với hôm qua</span>
        </div>
      </div>

      <div className="glass-panel rounded-lg p-4 flex flex-col gap-2 relative overflow-hidden group hover:glow-active transition-all duration-300">
        <div className="flex justify-between items-center">
          <span className="font-label-caps text-label-caps text-on-surface-variant uppercase tracking-wider text-[10px]">
            Xe đang di chuyển
          </span>
          <span className="material-symbols-outlined text-primary text-[16px]">local_shipping</span>
        </div>
        <div className="font-display-lg text-display-lg font-bold text-on-surface select-none">
          {stats.vehiclesOnRoute}
        </div>
        <div className="w-full bg-surface-variant h-1 rounded-full mt-2 overflow-hidden">
          <div
            className="bg-primary h-1 rounded-full transition-all duration-500"
            style={{ width: `${(stats.vehiclesOnRoute / 216) * 100}%` }}
          ></div>
        </div>
      </div>

      <div className={`glass-panel rounded-lg p-4 flex flex-col gap-2 relative overflow-hidden group transition-all duration-300 ${
        stats.delayedOrders > 0 ? 'hover:glow-alert border-error/30' : 'hover:glow-active'
      }`}>
        <div className="flex justify-between items-center">
          <span className="font-label-caps text-label-caps text-on-surface-variant uppercase tracking-wider text-[10px]">
            Đơn hàng Trễ
          </span>
          <span className={`material-symbols-outlined text-[16px] ${stats.delayedOrders > 0 ? 'text-error animate-pulse' : 'text-on-surface-variant'}`}>
            warning
          </span>
        </div>
        <div className={`font-display-lg text-display-lg font-bold select-none ${stats.delayedOrders > 0 ? 'text-error' : 'text-on-surface'}`}>
          {stats.delayedOrders}
        </div>
        <div className={`flex items-center gap-1 text-[12px] font-semibold ${stats.delayedOrders > 0 ? 'text-error' : 'text-on-surface-variant'}`}>
          <span className="material-symbols-outlined text-[14px]">schedule</span>
          <span>Trễ trung bình: 14p</span>
        </div>
      </div>

      <div className="glass-panel rounded-lg p-4 flex flex-col gap-2 relative overflow-hidden group hover:glow-active transition-all duration-300">
        <div className="flex justify-between items-center">
          <span className="font-label-caps text-label-caps text-on-surface-variant uppercase tracking-wider text-[10px]">
            Tài xế Sẵn sàng
          </span>
          <span className="material-symbols-outlined text-tertiary text-[16px]">person</span>
        </div>
        <div className="font-display-lg text-display-lg font-bold text-on-surface select-none">
          {stats.availableDrivers}
        </div>
        <div className="flex items-center gap-1 text-[12px] text-on-surface-variant font-semibold">
          <span>Trong số 250 hoạt động</span>
        </div>
      </div>

      <div className="glass-panel rounded-lg p-4 flex flex-col gap-2 relative overflow-hidden group hover:glow-active transition-all duration-300">
        <div className="flex justify-between items-center">
          <span className="font-label-caps text-label-caps text-on-surface-variant uppercase tracking-wider text-[10px]">
            Nhiên liệu Tiêu thụ
          </span>
          <span className="material-symbols-outlined text-secondary-container text-[16px]">local_gas_station</span>
        </div>
        <div className="font-display-lg text-display-lg font-bold text-on-surface select-none">
          {stats.fuelConsumption.toFixed(1)}
          <span className="text-body-md text-on-surface-variant font-normal ml-1">L/km</span>
        </div>
        <div className="flex items-center gap-1 text-[12px] text-secondary font-semibold">
          <span className="material-symbols-outlined text-[14px]">trending_down</span>
          <span>-3% hôm nay</span>
        </div>
      </div>

      <div className="glass-panel rounded-lg p-4 flex flex-col gap-2 relative overflow-hidden group hover:glow-active transition-all duration-300">
        <div className="flex justify-between items-center">
          <span className="font-label-caps text-label-caps text-on-surface-variant uppercase tracking-wider text-[10px]">
            Tỷ lệ Thành công
          </span>
          <span className="material-symbols-outlined text-secondary text-[16px]">check_circle</span>
        </div>
        <div className="font-display-lg text-display-lg font-bold text-on-surface select-none">
          {stats.successRate.toFixed(1)}%
        </div>
        <div className="w-full bg-surface-variant h-1 rounded-full mt-2 overflow-hidden">
          <div
            className="bg-secondary h-1 rounded-full transition-all duration-500"
            style={{ width: `${stats.successRate}%` }}
          ></div>
        </div>
      </div>
    </div>
  );
};
