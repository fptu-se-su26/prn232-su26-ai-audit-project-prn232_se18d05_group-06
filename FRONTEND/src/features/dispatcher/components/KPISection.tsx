import React from 'react';
import { KPIStats } from '@/types/dispatcher';

interface KPISectionProps {
  stats: KPIStats;
}

const kpiCards = [
  {
    label: 'Xe trong ca',
    icon: 'local_shipping',
    tone: 'text-[#0f3554]',
    getValue: (stats: KPIStats) => stats.vehiclesOnRoute,
    detail: 'Đang theo dõi realtime',
  },
  {
    label: 'Đơn đang xử lý',
    icon: 'inventory_2',
    tone: 'text-[#0f6b7d]',
    getValue: (stats: KPIStats) => stats.activeDeliveries,
    detail: '+12% so với hôm qua',
  },
  {
    label: 'Cảnh báo trễ',
    icon: 'release_alert',
    tone: 'text-rose-700',
    getValue: (stats: KPIStats) => stats.delayedOrders,
    detail: 'Cần điều phối lại',
  },
  {
    label: 'Tài xế sẵn sàng',
    icon: 'groups',
    tone: 'text-emerald-700',
    getValue: (stats: KPIStats) => stats.availableDrivers,
    detail: 'Có thể nhận lệnh',
  },
  {
    label: 'Nhiên liệu',
    icon: 'local_gas_station',
    tone: 'text-amber-700',
    getValue: (stats: KPIStats) => stats.fuelConsumption.toFixed(1),
    suffix: 'L/km',
    detail: '-3% hôm nay',
  },
  {
    label: 'Hoàn tất SLA',
    icon: 'verified',
    tone: 'text-emerald-700',
    getValue: (stats: KPIStats) => stats.successRate.toFixed(1),
    suffix: '%',
    detail: 'Mục tiêu 98%',
  },
];

export const KPISection: React.FC<KPISectionProps> = ({ stats }) => {
  return (
    <div className="grid shrink-0 grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-6">
      {kpiCards.map((card) => {
        const value = card.getValue(stats);
        const isAlert = card.label === 'Cảnh báo trễ' && Number(value) > 0;

        return (
          <div
            key={card.label}
            className={`ops-panel ops-kpi rounded-lg p-4 ${isAlert ? 'border-rose-200 bg-rose-50/80' : ''}`}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="text-[12px] font-bold text-slate-500">{card.label}</p>
                <div className="mt-2 flex items-end gap-1">
                  <span className={`font-data-tabular text-[28px] font-bold leading-none ${isAlert ? 'text-rose-700' : 'text-slate-950'}`}>
                    {value}
                  </span>
                  {card.suffix && <span className="pb-0.5 text-[12px] font-bold text-slate-500">{card.suffix}</span>}
                </div>
              </div>
              <span className={`material-symbols-outlined rounded-md bg-slate-100 p-1.5 text-[20px] ${card.tone}`}>
                {card.icon}
              </span>
            </div>
            <p className={`mt-3 text-[12px] font-semibold ${isAlert ? 'text-rose-700' : 'text-slate-500'}`}>
              {card.detail}
            </p>
          </div>
        );
      })}
    </div>
  );
};
