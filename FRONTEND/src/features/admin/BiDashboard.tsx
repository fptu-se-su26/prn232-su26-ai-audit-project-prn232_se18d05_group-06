import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import Sidebar from '../../components/Sidebar';
import KpiCard from '../../components/kpi/KpiCard';
import { kpiApi } from '../../lib/api/kpi';
import { KpiDashboard, KpiTabType } from '../../types/kpi';
import { ROUTE_PATHS } from '../../routes';

const formatCurrency = (value: number): string => {
  if (value >= 1000000000) return `${(value / 1000000000).toFixed(1)}B`;
  if (value >= 1000000) return `${(value / 1000000).toFixed(1)}M`;
  if (value >= 1000) return `${(value / 1000).toFixed(0)}K`;
  return value.toLocaleString('vi-VN');
};

const BiDashboard = () => {
  const [dashboard, setDashboard] = useState<KpiDashboard | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<KpiTabType>('overview');
  const [exporting, setExporting] = useState(false);

  const loadDashboard = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await kpiApi.getDashboard();
      setDashboard(data);
    } catch {
      setError('Không tải được dữ liệu. Vui lòng kiểm tra kết nối backend.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadDashboard();
  }, [loadDashboard]);

  const handleExport = async (format: 'excel' | 'pdf') => {
    setExporting(true);
    try {
      await kpiApi.exportReport(format);
    } catch {
      setError('Xuất file thất bại.');
    } finally {
      setExporting(false);
    }
  };

  const tabs: { key: KpiTabType; label: string; icon: string }[] = [
    { key: 'overview', label: 'Tổng quan', icon: 'dashboard' },
    { key: 'warehouse', label: 'Kho', icon: 'warehouse' },
    { key: 'dispatcher', label: 'Điều phối', icon: 'local_shipping' },
    { key: 'finance', label: 'Tài chính', icon: 'account_balance' },
  ];

  const renderOverviewTab = () => {
    if (!dashboard) return null;
    const { overview } = dashboard;

    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <KpiCard
            title="Tổng đơn hàng"
            value={overview.totalOrders}
            subtitle={`${overview.completedOrders} hoàn thành`}
            icon="receipt_long"
            color="blue"
            linkTo="/admin/orders"
          />
          <KpiCard
            title="Đơn đang xử lý"
            value={overview.pendingOrders}
            subtitle={`${overview.orderCompletionRate}% hoàn thành`}
            icon="pending_actions"
            color="amber"
          />
          <KpiCard
            title="Tổng xe"
            value={overview.totalVehicles}
            subtitle={`${overview.activeVehicles} đang hoạt động`}
            icon="local_shipping"
            color="green"
            linkTo="/admin/fleet"
          />
          <KpiCard
            title="Tổng SKU"
            value={overview.totalSkus}
            subtitle={`${overview.totalWarehouses} kho`}
            icon="inventory_2"
            color="purple"
            linkTo={ROUTE_PATHS.WAREHOUSE_INVENTORY}
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="rounded-2xl border border-slate-200 bg-white p-6">
            <h3 className="text-lg font-black text-slate-800 mb-4">Xu hướng đơn hàng (7 ngày)</h3>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={overview.orderTrend}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="label" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip />
                <Bar dataKey="value" fill="#3b82f6" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-6">
            <h3 className="text-lg font-black text-slate-800 mb-4">Thông tin hệ thống</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl">
                <div className="flex items-center gap-3">
                  <span className="material-symbols-outlined text-blue-600">store</span>
                  <span className="font-semibold text-slate-700">Tổng kho</span>
                </div>
                <span className="text-2xl font-black text-blue-700">{overview.totalWarehouses}</span>
              </div>
              <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl">
                <div className="flex items-center gap-3">
                  <span className="material-symbols-outlined text-emerald-600">people</span>
                  <span className="font-semibold text-slate-700">Khách hàng</span>
                </div>
                <span className="text-2xl font-black text-emerald-700">{overview.totalCustomers}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderWarehouseTab = () => {
    if (!dashboard) return null;
    const { warehouse } = dashboard;

    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <KpiCard
            title="Tổng tồn kho"
            value={warehouse.totalInventoryItems}
            subtitle={`${warehouse.occupiedBins}/${warehouse.totalBins} bins`}
            icon="inventory"
            color="blue"
            linkTo={ROUTE_PATHS.WAREHOUSE_INVENTORY}
          />
          <KpiCard
            title="Tỷ lệ lấp đầy"
            value={`${warehouse.utilizationRate}%`}
            subtitle={`${warehouse.totalBins} bins`}
            icon="pie_chart"
            color={warehouse.utilizationRate > 80 ? 'amber' : 'green'}
          />
          <KpiCard
            title="Nhập kho hôm nay"
            value={warehouse.inboundToday}
            subtitle={`${warehouse.inboundThisWeek} tuần này`}
            icon="move_to_inbox"
            color="emerald"
            linkTo={ROUTE_PATHS.WAREHOUSE_IMPORT}
          />
          <KpiCard
            title="Xuất kho hôm nay"
            value={warehouse.outboundToday}
            subtitle={`${warehouse.outboundThisWeek} tuần này`}
            icon="output"
            color="purple"
            linkTo={ROUTE_PATHS.WAREHOUSE_EXPORT}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <KpiCard
            title="Hàng tồn lâu"
            value={warehouse.deadStockCount}
            subtitle="> 90 ngày"
            icon="hourglass_empty"
            color="amber"
            linkTo={ROUTE_PATHS.WAREHOUSE_DEAD_EXPIRY}
          />
          <KpiCard
            title="Sắp hết hạn"
            value={warehouse.expirySoonCount}
            subtitle="8-30 ngày"
            icon="event_busy"
            color="red"
            linkTo={ROUTE_PATHS.WAREHOUSE_DEAD_EXPIRY}
          />
          <KpiCard
            title="Khẩn cấp"
            value={warehouse.criticalExpiryCount}
            subtitle="≤ 7 ngày"
            icon="warning"
            color="red"
            linkTo={ROUTE_PATHS.WAREHOUSE_DEAD_EXPIRY}
          />
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-6">
          <h3 className="text-lg font-black text-slate-800 mb-4">Xu hướng nhập kho (7 ngày)</h3>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={warehouse.inventoryTrend}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="label" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip />
              <Line type="monotone" dataKey="value" stroke="#10b981" strokeWidth={3} dot={{ fill: '#10b981' }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    );
  };

  const renderDispatcherTab = () => {
    if (!dashboard) return null;
    const { dispatcher } = dashboard;

    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <KpiCard
            title="Xe trong kho"
            value={dispatcher.totalVehiclesInWarehouse}
            subtitle="Hiện tại"
            icon="local_shipping"
            color="blue"
          />
          <KpiCard
            title="Đã đặt lịch"
            value={dispatcher.scheduledToday}
            subtitle="Hôm nay"
            icon="event_available"
            color="green"
          />
          <KpiCard
            title="Đang chờ"
            value={dispatcher.waitingVehicles}
            subtitle="Trong kho"
            icon="hourglass_top"
            color="amber"
          />
          <KpiCard
            title="Đang xử lý"
            value={dispatcher.processingVehicles}
            subtitle="Tại Dock"
            icon="engineering"
            color="purple"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <KpiCard
            title="Check-in hôm nay"
            value={dispatcher.checkInToday}
            icon="login"
            color="emerald"
          />
          <KpiCard
            title="Check-out hôm nay"
            value={dispatcher.checkOutToday}
            icon="logout"
            color="slate"
          />
          <KpiCard
            title="Dock trống"
            value={`${dispatcher.availableDocks}/${dispatcher.availableDocks + dispatcher.occupiedDocks}`}
            subtitle={`${dispatcher.occupiedDocks} đang bận`}
            icon="deck"
            color={dispatcher.availableDocks > 0 ? 'green' : 'amber'}
          />
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-6">
          <h3 className="text-lg font-black text-slate-800 mb-4">Xu hướng xe vào kho (7 ngày)</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={dispatcher.vehicleTrend}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="label" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip />
              <Bar dataKey="value" fill="#8b5cf6" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    );
  };

  const renderFinanceTab = () => {
    if (!dashboard) return null;
    const { finance } = dashboard;

    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <KpiCard
            title="Doanh thu hôm nay"
            value={finance.todayRevenue}
            subtitle={`${formatCurrency(finance.thisWeekRevenue)} tuần này`}
            icon="payments"
            color="green"
            linkTo="/admin/finance"
          />
          <KpiCard
            title="Doanh thu tháng"
            value={finance.thisMonthRevenue}
            icon="calendar_month"
            color="emerald"
          />
          <KpiCard
            title="Chi phí tháng"
            value={finance.thisMonthExpense}
            icon="account_balance_wallet"
            color={finance.thisMonthExpense > finance.thisMonthRevenue * 0.5 ? 'red' : 'amber'}
          />
          <KpiCard
            title="Lợi nhuận tháng"
            value={finance.thisMonthProfit}
            icon="trending_up"
            color={finance.thisMonthProfit >= 0 ? 'green' : 'red'}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <KpiCard
            title="Công nợ phải thu"
            value={finance.totalReceivable}
            subtitle={`${finance.pendingPayments} hóa đơn`}
            icon="request_quote"
            color="amber"
            linkTo="/admin/finance"
          />
          <KpiCard
            title="Hóa đơn chưa thanh toán"
            value={finance.unpaidInvoices}
            subtitle={`${finance.pendingPayments} hóa đơn`}
            icon="receipt_long"
            color="red"
          />
          <KpiCard
            title="Tỷ lệ thanh toán"
            value={`${finance.paymentRate}%`}
            subtitle="Đã thanh toán"
            icon="verified"
            color={finance.paymentRate > 80 ? 'green' : 'amber'}
          />
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-6">
          <h3 className="text-lg font-black text-slate-800 mb-4">Doanh thu vs Chi phí (7 ngày)</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={finance.revenueTrend.map((r, i) => ({
              label: r.label,
              revenue: r.value,
              expense: finance.expenseTrend[i]?.value || 0,
            }))}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="label" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip formatter={(value: number) => formatCurrency(value)} />
              <Bar dataKey="revenue" name="Doanh thu" fill="#10b981" radius={[8, 8, 0, 0]} />
              <Bar dataKey="expense" name="Chi phí" fill="#ef4444" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-slate-100 text-slate-950 flex overflow-hidden">
      <Sidebar />

      <main className="ml-[280px] flex-1 overflow-y-auto">
        <header className="sticky top-0 z-40 border-b border-slate-200 bg-white px-8 py-5">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h1 className="text-2xl font-black tracking-tight text-slate-950">
                BI Dashboard - Tổng hợp KPIs
              </h1>
              <p className="mt-1 text-sm font-semibold text-slate-500">
                UC050 · Cập nhật theo yêu cầu · Có thể xuất Excel/PDF
              </p>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => handleExport('excel')}
                disabled={exporting || loading}
                className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-5 py-2.5 text-sm font-bold text-white hover:bg-emerald-700 disabled:opacity-60"
              >
                <span className="material-symbols-outlined text-lg">table_view</span>
                {exporting ? 'Đang xuất...' : 'Xuất Excel'}
              </button>
              <button
                onClick={() => handleExport('pdf')}
                disabled={exporting || loading}
                className="inline-flex items-center gap-2 rounded-lg bg-slate-700 px-5 py-2.5 text-sm font-bold text-white hover:bg-slate-800 disabled:opacity-60"
              >
                <span className="material-symbols-outlined text-lg">picture_as_pdf</span>
                PDF
              </button>
              <button
                onClick={loadDashboard}
                disabled={loading}
                className="inline-flex h-11 w-11 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 disabled:opacity-60"
              >
                <span className="material-symbols-outlined text-xl">{loading ? 'hourglass_top' : 'refresh'}</span>
              </button>
            </div>
          </div>
        </header>

        <div className="p-6 lg:p-8">
          {error && (
            <div className="mb-6 flex items-center gap-3 rounded-lg border border-rose-200 bg-rose-50 px-5 py-4 text-sm font-bold text-rose-800">
              <span className="material-symbols-outlined">error</span>
              {error}
            </div>
          )}

          <div className="mb-6 flex gap-2 overflow-x-auto">
            {tabs.map(tab => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`flex items-center gap-2 rounded-lg px-5 py-2.5 text-sm font-bold transition ${
                  activeTab === tab.key
                    ? 'bg-blue-600 text-white'
                    : 'bg-white text-slate-600 hover:bg-slate-50'
                }`}
              >
                <span className="material-symbols-outlined">{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </div>

          {loading ? (
            <div className="flex h-64 items-center justify-center">
              <span className="material-symbols-outlined animate-spin text-5xl text-blue-600">autorenew</span>
            </div>
          ) : (
            <>
              {activeTab === 'overview' && renderOverviewTab()}
              {activeTab === 'warehouse' && renderWarehouseTab()}
              {activeTab === 'dispatcher' && renderDispatcherTab()}
              {activeTab === 'finance' && renderFinanceTab()}
            </>
          )}

          <div className="mt-8 rounded-2xl border border-slate-200 bg-slate-50 p-5">
            <h3 className="text-sm font-black text-slate-600 mb-2">Ghi chú</h3>
            <ul className="space-y-1 text-xs text-slate-500">
              <li>• Dữ liệu được lấy từ các bảng có sẵn trong hệ thống</li>
              <li>• Nhấp vào KPI card để xem chi tiết tại trang tương ứng</li>
              <li>• Báo cáo có thể xuất ra Excel hoặc PDF</li>
              <li>• Nhấn nút Refresh để cập nhật dữ liệu mới nhất</li>
            </ul>
          </div>
        </div>
      </main>
    </div>
  );
};

export default BiDashboard;
