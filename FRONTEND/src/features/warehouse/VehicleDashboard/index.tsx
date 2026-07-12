import React from 'react';
import { useVehicleDashboard } from '../../../hooks/useVehicleDashboard';
import { VehicleStatusCards } from './VehicleStatusCards';
import { VehicleStatusTable } from './VehicleStatusTable';
import { FilterMode } from '../../../store/vehicleDashboardStore';
import { format } from 'date-fns';
import { RefreshCw, AlertCircle, CalendarDays, CalendarRange, List } from 'lucide-react';

const filterModes: { key: FilterMode; label: string; icon: React.ElementType }[] = [
  { key: 'all', label: 'Tất cả', icon: List },
  { key: 'day', label: 'Theo ngày', icon: CalendarDays },
  { key: 'month', label: 'Theo tháng', icon: CalendarRange },
];

const VehicleDashboardContent: React.FC = () => {
  const {
    filterMode,
    summary,
    vehicleList,
    loading,
    error,
    selectedDate,
    selectedMonth,
    selectedStatus,
    lastUpdated,
    isPolling,
    setIsPolling,
    setFilterMode,
    setSelectedDate,
    setSelectedMonth,
    setSelectedStatus,
    refetch
  } = useVehicleDashboard();

  return (
    <div className="max-w-7xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Vehicle Dashboard</h1>
          <p className="text-gray-500 text-sm mt-1">
            Giám sát trạng thái phương tiện tại kho theo thời gian thực
          </p>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          {/* Filter Mode Buttons */}
          <div className="flex rounded-lg border border-gray-200 overflow-hidden">
            {filterModes.map((mode) => {
              const Icon = mode.icon;
              const isActive = filterMode === mode.key;
              return (
                <button
                  key={mode.key}
                  onClick={() => setFilterMode(mode.key)}
                  className={`flex items-center gap-1.5 px-3 py-2 text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-blue-500 text-white'
                      : 'bg-white text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <Icon size={16} />
                  {mode.label}
                </button>
              );
            })}
          </div>

          {/* Date / Month picker */}
          {filterMode === 'day' && (
            <input
              type="date"
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
            />
          )}
          {filterMode === 'month' && (
            <input
              type="month"
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
            />
          )}

          <button
            onClick={() => refetch()}
            className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors border border-gray-200"
            title="Làm mới dữ liệu"
          >
            <RefreshCw size={20} className={loading ? 'animate-spin' : ''} />
          </button>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-md flex items-start gap-3">
          <AlertCircle className="text-red-500 mt-0.5" size={20} />
          <div>
            <h3 className="text-red-800 font-medium text-sm">Lỗi tải dữ liệu</h3>
            <p className="text-red-700 text-sm mt-1">{error}</p>
            <button
              onClick={() => refetch()}
              className="text-red-600 hover:text-red-800 text-sm font-medium mt-2 underline"
            >
              Thử lại
            </button>
          </div>
        </div>
      )}

      {/* Cards */}
      <VehicleStatusCards
        summary={summary}
        selectedStatus={selectedStatus}
        onStatusClick={setSelectedStatus}
        loading={loading}
      />

      {/* Table */}
      <VehicleStatusTable
        vehicleList={vehicleList}
        selectedStatus={selectedStatus}
        onStatusChange={setSelectedStatus}
        loading={loading}
        onRefresh={refetch}
      />

      {/* Footer */}
      <div className="flex items-center justify-between text-xs text-gray-500 pt-4 border-t">
        <div className="flex items-center gap-2">
          <span>Cập nhật lần cuối: {format(lastUpdated, 'HH:mm:ss dd/MM/yyyy')}</span>
        </div>
        <div className="flex items-center gap-2">
          <label className="flex items-center cursor-pointer gap-2">
            <span>Tự động cập nhật (60s)</span>
            <div className="relative">
              <input
                type="checkbox"
                className="sr-only"
                checked={isPolling}
                onChange={(e) => setIsPolling(e.target.checked)}
              />
              <div className={`block w-10 h-6 rounded-full transition-colors ${isPolling ? 'bg-blue-500' : 'bg-gray-300'}`}></div>
              <div className={`dot absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform ${isPolling ? 'transform translate-x-4' : ''}`}></div>
            </div>
          </label>
        </div>
      </div>
    </div>
  );
};

class DashboardErrorBoundary extends React.Component<{children: React.ReactNode}, {hasError: boolean, error: any}> {
  constructor(props: {children: React.ReactNode}) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: any) {
    return { hasError: true, error };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="p-6 max-w-7xl mx-auto">
          <div className="bg-red-50 border border-red-200 p-6 rounded-lg text-center">
            <AlertCircle className="mx-auto text-red-500 mb-4" size={48} />
            <h2 className="text-xl font-bold text-red-700 mb-2">Đã xảy ra lỗi không mong muốn</h2>
            <p className="text-red-600 mb-4">{this.state.error?.message || 'Vui lòng tải lại trang hoặc liên hệ hỗ trợ'}</p>
            <button
              onClick={() => window.location.reload()}
              className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
            >
              Tải lại trang
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

const VehicleDashboard: React.FC = () => {
  return (
    <DashboardErrorBoundary>
      <VehicleDashboardContent />
    </DashboardErrorBoundary>
  );
};

export default VehicleDashboard;
