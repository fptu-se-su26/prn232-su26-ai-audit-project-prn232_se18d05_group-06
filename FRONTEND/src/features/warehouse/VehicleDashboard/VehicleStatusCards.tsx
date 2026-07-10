import React from 'react';
import { VehicleStatusSummary } from '../../../types/vehicleDashboard';
import { 
  CalendarClock, 
  Hourglass, 
  ArrowDownToLine, 
  ArrowUpFromLine, 
  CheckCircle2, 
  LogOut 
} from 'lucide-react';

interface VehicleStatusCardsProps {
  summary: VehicleStatusSummary | null;
  selectedStatus: string | null;
  onStatusClick: (status: string | null) => void;
  loading?: boolean;
}

const statusConfig = [
  { key: 'SCHEDULED', label: 'Đã đặt lịch', icon: CalendarClock, color: 'bg-blue-50 text-blue-600', borderColor: 'border-blue-200', valueKey: 'scheduled' },
  { key: 'WAITING', label: 'Đang chờ', icon: Hourglass, color: 'bg-orange-50 text-orange-600', borderColor: 'border-orange-200', valueKey: 'waiting' },
  { key: 'UNLOADING', label: 'Đang hạ hàng', icon: ArrowDownToLine, color: 'bg-purple-50 text-purple-600', borderColor: 'border-purple-200', valueKey: 'unloading' },
  { key: 'LOADING', label: 'Đang lấy hàng', icon: ArrowUpFromLine, color: 'bg-indigo-50 text-indigo-600', borderColor: 'border-indigo-200', valueKey: 'loading' },
  { key: 'COMPLETED', label: 'Hoàn thành', icon: CheckCircle2, color: 'bg-green-50 text-green-600', borderColor: 'border-green-200', valueKey: 'completed' },
  { key: 'DEPARTED', label: 'Đã rời kho', icon: LogOut, color: 'bg-gray-50 text-gray-600', borderColor: 'border-gray-200', valueKey: 'departed' },
];

export const VehicleStatusCards: React.FC<VehicleStatusCardsProps> = ({ summary, selectedStatus, onStatusClick, loading }) => {
  return (
    <div className="space-y-4 mb-6">
      {/* Total badge */}
      <div className="flex items-center gap-3">
        <h3 className="text-sm font-medium text-gray-500">Tổng phương tiện hôm nay:</h3>
        {loading ? (
          <div className="h-6 w-10 bg-gray-200 animate-pulse rounded-full"></div>
        ) : (
          <span className="bg-blue-600 text-white text-sm font-bold px-3 py-0.5 rounded-full">
            {summary?.total ?? 0}
          </span>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4" role="group" aria-label="Bộ lọc trạng thái phương tiện">
        {statusConfig.map((status) => {
          const Icon = status.icon;
          const count = summary ? summary[status.valueKey as keyof VehicleStatusSummary] : 0;
          const isSelected = selectedStatus === status.key;

          return (
            <div
              key={status.key}
              role="button"
              tabIndex={0}
              aria-pressed={isSelected}
              aria-label={`${status.label}: ${count} phương tiện. ${isSelected ? 'Đang lọc' : 'Nhấn để lọc'}`}
              title={`${status.label} – Nhấn để ${isSelected ? 'bỏ lọc' : 'lọc theo trạng thái này'}`}
              onClick={() => onStatusClick(isSelected ? null : status.key)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  onStatusClick(isSelected ? null : status.key);
                }
              }}
              className={`p-4 rounded-xl border cursor-pointer transition-all duration-200 hover:shadow-md hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                isSelected ? 'ring-2 ring-offset-2 ring-blue-500 ' + status.borderColor : 'border-gray-200 bg-white'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex flex-col">
                  <span className="text-sm font-medium text-gray-500 mb-1">{status.label}</span>
                  {loading ? (
                    <div className="h-8 w-16 bg-gray-200 animate-pulse rounded"></div>
                  ) : (
                    <span className="text-2xl font-bold text-gray-900">{count}</span>
                  )}
                </div>
                <div className={`p-3 rounded-lg ${status.color}`}>
                  <Icon size={24} aria-hidden="true" />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
