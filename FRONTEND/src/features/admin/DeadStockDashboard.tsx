import { useEffect, useMemo, useState } from 'react';
import Sidebar from '../../components/Sidebar';
import WarehouseHeader from '../../components/WarehouseHeader';
import {
  getDeadStock,
  getExpiryStock,
  getDeadStockSummary,
  scanDeadStock,
  getAllDeadAndExpiryStock,
  type DeadStockItem,
  type DeadStockSummary,
  type DeadStockFilter,
} from '../../lib/inventoryReportApi';

const ALERT_TYPE_LABELS: Record<string, string> = {
  DEAD_STOCK: 'Tồn lâu',
  EXPIRY_SOON: 'Sắp hết hạn',
};

const SEVERITY_LABELS: Record<string, { label: string; class: string }> = {
  CRITICAL: { label: 'NGHIÊM TRỌNG', class: 'bg-rose-100 text-rose-800' },
  WARNING: { label: 'CẢNH BÁO', class: 'bg-amber-100 text-amber-800' },
  NORMAL: { label: 'BÌNH THƯỜNG', class: 'bg-emerald-100 text-emerald-800' },
};

const formatDate = (value: string | null) => {
  if (!value) return '-';
  return new Date(value).toLocaleDateString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
};

const formatDays = (days: number | null | undefined, label: string = 'ngày') => {
  if (days === null || days === undefined) return '-';
  return `${days} ${label}`;
};

const DeadStockDashboard = () => {
  const [items, setItems] = useState<DeadStockItem[]>([]);
  const [summary, setSummary] = useState<DeadStockSummary | null>(null);
  const [loading, setLoading] = useState(false);
  const [scanning, setScanning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  // Filters
  const [filterType, setFilterType] = useState<'ALL' | 'DEAD_STOCK' | 'EXPIRY_SOON'>('ALL');
  const [filterText, setFilterText] = useState('');
  const [filterSeverity, setFilterSeverity] = useState<'ALL' | 'CRITICAL' | 'WARNING'>('ALL');
  const [sortBy, setSortBy] = useState<'DaysStored' | 'ExpiryDate' | 'Quantity'>('DaysStored');
  const [sortOrder, setSortOrder] = useState<'ASC' | 'DESC'>('DESC');

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [summaryRes] = await Promise.all([getDeadStockSummary()]);
      setSummary(summaryRes);

      // Load items based on filter
      let filter: Partial<DeadStockFilter> = {
        sortBy,
        sortOrder,
        pageSize: 100,
        alertType: filterType,
      };

      const [deadStockRes, expiryRes] = await Promise.all([
        getDeadStock(filter),
        getExpiryStock(filter),
      ]);

      const allItems =
        filterType === 'ALL'
          ? [...deadStockRes.items, ...expiryRes.items]
          : filterType === 'DEAD_STOCK'
          ? deadStockRes.items
          : expiryRes.items;

      setItems(allItems);
    } catch {
      setError('Không tải được dữ liệu dashboard.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleScan = async () => {
    setScanning(true);
    setError(null);
    setMessage(null);
    try {
      const res = await scanDeadStock(true);
      setMessage(res.message);
      await loadData();
    } catch {
      setError('Quét tồn kho thất bại.');
    } finally {
      setScanning(false);
    }
  };

  const filteredItems = useMemo(() => {
    const keyword = filterText.trim().toLowerCase();
    return items.filter((item) => {
      const matchText =
        !keyword ||
        item.skucode.toLowerCase().includes(keyword) ||
        item.productName.toLowerCase().includes(keyword) ||
        item.customerName.toLowerCase().includes(keyword) ||
        item.binCode.toLowerCase().includes(keyword);

      const matchSeverity =
        filterSeverity === 'ALL' ||
        (filterSeverity === 'CRITICAL' && item.severity === 'CRITICAL') ||
        (filterSeverity === 'WARNING' && item.severity === 'WARNING');

      return matchText && matchSeverity;
    });
  }, [items, filterText, filterSeverity]);

  const metricCards = [
    {
      label: 'Hàng tồn lâu',
      value: summary?.totalDeadStock ?? 0,
      hint: `Tồn trên 90 ngày`,
      icon: 'hourglass_empty',
      tone: 'blue',
      badge: 'DEAD',
    },
    {
      label: 'Sắp hết hạn',
      value: summary?.totalExpiringSoon ?? 0,
      hint: `Trong vòng 30 ngày`,
      icon: 'event_busy',
      tone: 'cyan',
      badge: 'EXPIRY',
    },
    {
      label: 'Nghiêm trọng',
      value: summary?.totalCritical ?? 0,
      hint: `Cần xử lý ngay`,
      icon: 'warning',
      tone: 'rose',
      badge: 'CRITICAL',
    },
    {
      label: 'Cảnh báo',
      value: summary?.totalWarning ?? 0,
      hint: `Theo dõi sát`,
      icon: 'notifications_active',
      tone: 'amber',
      badge: 'WARNING',
    },
  ];

  const toneClasses: Record<string, string> = {
    blue: 'bg-blue-50 text-blue-700 border-blue-200',
    cyan: 'bg-cyan-50 text-cyan-700 border-cyan-200',
    rose: 'bg-rose-50 text-rose-700 border-rose-200',
    amber: 'bg-amber-50 text-amber-700 border-amber-200',
  };

  return (
    <div className="min-h-screen bg-[#f5f7fb] text-slate-950 antialiased flex overflow-hidden">
      <Sidebar />

      <WarehouseHeader
        title="Dashboard Hàng Tồn Lâu / Sắp Hết Hạn"
        subtitle={
          <>
            UC007 – Theo dõi hàng tồn kho quá lâu và sắp hết hạn sử dụng
          </>
        }
        rightContent={
          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={handleScan}
              disabled={scanning}
              className="group relative flex items-center gap-2 overflow-hidden rounded-xl bg-blue-600 px-5 py-2.5 font-semibold text-white shadow-lg shadow-blue-600/30 transition-all hover:bg-blue-700 hover:shadow-blue-600/40 disabled:cursor-not-allowed disabled:bg-blue-400"
            >
              <span
                className={`material-symbols-outlined text-[20px] ${
                  scanning ? 'animate-spin' : 'group-hover:rotate-180 transition-transform duration-500'
                }`}
              >
                sync
              </span>
              {scanning ? 'Đang quét...' : 'Quét ngay'}
            </button>
          </div>
        }
      />

      <main className="ml-[280px] h-screen flex-1 overflow-y-auto bg-[#f5f7fb] pt-24 px-8 pb-10">
        <section className="space-y-6 lg:p-8">
          {/* Error/Message */}
          {error && (
            <div className="flex items-start gap-3 rounded-lg border border-rose-200 bg-rose-50 px-5 py-4 text-sm font-bold text-rose-800">
              <span className="material-symbols-outlined text-[20px]">error</span>
              <span>{error}</span>
            </div>
          )}

          {message && (
            <div className="flex items-start gap-3 rounded-lg border border-emerald-200 bg-emerald-50 px-5 py-4 text-sm font-bold text-emerald-800">
              <span className="material-symbols-outlined text-[20px]">check_circle</span>
              <span>{message}</span>
            </div>
          )}

          {/* Metric Cards */}
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
            {metricCards.map((card) => (
              <div
                key={card.label}
                className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className={`flex h-12 w-12 items-center justify-center rounded-lg border ${toneClasses[card.tone]}`}>
                    <span className="material-symbols-outlined text-[24px]">{card.icon}</span>
                  </div>
                  <span className={`rounded px-2.5 py-1 text-xs font-black ${toneClasses[card.tone]}`}>
                    {card.badge}
                  </span>
                </div>
                <div className="mt-5">
                  <p className="text-sm font-bold text-slate-500">{card.label}</p>
                  <p className="mt-1 text-5xl font-black leading-none text-slate-950">{card.value}</p>
                  <p className="mt-3 text-sm font-bold text-slate-600">{card.hint}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 gap-6 xl:grid-cols-[1fr_320px]">
            {/* Item List */}
            <div className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
              <div className="flex flex-col gap-4 border-b border-slate-200 px-6 py-5 lg:flex-row lg:items-center lg:justify-between">
                <div>
                  <h2 className="text-xl font-black text-slate-950">Danh sách hàng cần theo dõi</h2>
                  <p className="mt-1 text-sm font-semibold text-slate-500">
                    Đang hiển thị {filteredItems.length} bản ghi
                  </p>
                </div>

                {/* Filters */}
                <div className="flex flex-col gap-3 sm:flex-row">
                  {/* Search */}
                  <label className="relative block sm:w-72">
                    <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[20px] text-slate-400">
                      search
                    </span>
                    <input
                      value={filterText}
                      onChange={(e) => setFilterText(e.target.value)}
                      placeholder="Tìm SKU, sản phẩm..."
                      className="h-11 w-full rounded-lg border border-slate-300 bg-white pl-10 pr-3 text-sm font-semibold text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-600 focus:ring-4 focus:ring-blue-100"
                    />
                  </label>

                  {/* Type Filter */}
                  <select
                    value={filterType}
                    onChange={(e) => setFilterType(e.target.value as typeof filterType)}
                    className="h-11 rounded-lg border border-slate-300 bg-white px-3 text-sm font-bold text-slate-900 outline-none transition focus:border-blue-600 focus:ring-4 focus:ring-blue-100"
                  >
                    <option value="ALL">Tất cả</option>
                    <option value="DEAD_STOCK">Tồn lâu</option>
                    <option value="EXPIRY_SOON">Sắp hết hạn</option>
                  </select>

                  {/* Severity Filter */}
                  <select
                    value={filterSeverity}
                    onChange={(e) => setFilterSeverity(e.target.value as typeof filterSeverity)}
                    className="h-11 rounded-lg border border-slate-300 bg-white px-3 text-sm font-bold text-slate-900 outline-none transition focus:border-blue-600 focus:ring-4 focus:ring-blue-100"
                  >
                    <option value="ALL">Mọi mức độ</option>
                    <option value="CRITICAL">Nghiêm trọng</option>
                    <option value="WARNING">Cảnh báo</option>
                  </select>

                  {/* Sort */}
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
                    className="h-11 rounded-lg border border-slate-300 bg-white px-3 text-sm font-bold text-slate-900 outline-none transition focus:border-blue-600 focus:ring-4 focus:ring-blue-100"
                  >
                    <option value="DaysStored">Ngày tồn</option>
                    <option value="ExpiryDate">Hạn sử dụng</option>
                    <option value="Quantity">Số lượng</option>
                  </select>
                </div>
              </div>

              {/* Table */}
              <div className="hidden overflow-x-auto lg:block">
                <table className="w-full min-w-[1100px] border-collapse text-left">
                  <thead className="bg-slate-50 text-xs font-black uppercase tracking-wide text-slate-500">
                    <tr>
                      <th className="px-6 py-4">Mã SKU</th>
                      <th className="px-6 py-4">Sản phẩm</th>
                      <th className="px-6 py-4">Khách hàng</th>
                      <th className="px-6 py-4">Vị trí</th>
                      <th className="px-6 py-4">SL Tồn</th>
                      <th className="px-6 py-4">Ngày nhập</th>
                      <th className="px-6 py-4">Hạn SD</th>
                      <th className="px-6 py-4">Ngày tồn</th>
                      <th className="px-6 py-4">Loại</th>
                      <th className="px-6 py-4">Mức độ</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {loading && (
                      <tr>
                        <td colSpan={10} className="px-6 py-10 text-center text-sm font-bold text-slate-500">
                          Đang tải dữ liệu...
                        </td>
                      </tr>
                    )}
                    {!loading && filteredItems.length === 0 && (
                      <tr>
                        <td colSpan={10} className="px-6 py-10 text-center text-sm font-bold text-slate-500">
                          Không có bản ghi nào.
                        </td>
                      </tr>
                    )}
                    {!loading &&
                      filteredItems.map((item, index) => {
                        const severityInfo = SEVERITY_LABELS[item.severity] || SEVERITY_LABELS.NORMAL;
                        return (
                          <tr key={`${item.skucode}-${index}`} className="transition hover:bg-blue-50/50">
                            <td className="px-6 py-4 font-mono text-sm font-black text-blue-700">
                              {item.skucode}
                            </td>
                            <td className="px-6 py-4">
                              <p className="max-w-[200px] truncate text-sm font-black text-slate-900">
                                {item.productName}
                              </p>
                            </td>
                            <td className="px-6 py-4 text-sm font-semibold text-slate-600">
                              {item.customerName}
                            </td>
                            <td className="px-6 py-4 font-mono text-xs text-slate-600">
                              {item.binCode}
                            </td>
                            <td className="px-6 py-4 text-sm font-black text-slate-900">
                              {item.quantity}
                            </td>
                            <td className="px-6 py-4 text-xs text-slate-600">
                              {formatDate(item.inboundDate)}
                            </td>
                            <td className="px-6 py-4 text-xs text-slate-600">
                              {formatDate(item.expiryDate)}
                            </td>
                            <td className="px-6 py-4">
                              <span
                                className={`rounded-full px-3 py-1 text-xs font-black ${
                                  item.daysStored > 120
                                    ? 'bg-rose-100 text-rose-800'
                                    : item.daysStored > 90
                                    ? 'bg-amber-100 text-amber-800'
                                    : 'bg-slate-100 text-slate-700'
                                }`}
                              >
                                {formatDays(item.daysStored)}
                              </span>
                            </td>
                            <td className="px-6 py-4">
                              <span
                                className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-black ${
                                  item.alertType === 'DEAD_STOCK'
                                    ? 'bg-blue-50 text-blue-700'
                                    : 'bg-cyan-50 text-cyan-700'
                                }`}
                              >
                                <span className="material-symbols-outlined text-[14px]">
                                  {item.alertType === 'DEAD_STOCK' ? 'hourglass_empty' : 'event_busy'}
                                </span>
                                {ALERT_TYPE_LABELS[item.alertType] || item.alertType}
                              </span>
                            </td>
                            <td className="px-6 py-4">
                              <span className={`rounded-full px-3 py-1 text-xs font-black ${severityInfo.class}`}>
                                {severityInfo.label}
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Sidebar */}
            <aside className="space-y-6">
              {/* Filter Info */}
              <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
                <h2 className="flex items-center gap-2 text-base font-black text-slate-950">
                  <span className="material-symbols-outlined text-blue-700">filter_list</span>
                  Bộ lọc nhanh
                </h2>
                <div className="mt-4 space-y-3 text-sm font-semibold text-slate-600">
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-[18px] text-blue-700">schedule</span>
                    Ngày tồn: {filterType === 'DEAD_STOCK' ? '> 90 ngày' : 'Tất cả'}
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-[18px] text-cyan-700">event</span>
                    Hạn SD: {filterType === 'EXPIRY_SOON' ? '< 30 ngày' : 'Tất cả'}
                  </div>
                </div>
              </section>

              {/* Summary by Warehouse */}
              {summary && summary.byWarehouse.length > 0 && (
                <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
                  <h2 className="flex items-center gap-2 text-base font-black text-slate-950">
                    <span className="material-symbols-outlined text-blue-700">warehouse</span>
                    Theo Kho
                  </h2>
                  <div className="mt-4 space-y-3">
                    {summary.byWarehouse.map((wh) => (
                      <div key={wh.warehouseName} className="rounded-lg bg-slate-50 p-3">
                        <p className="font-black text-slate-900">{wh.warehouseName}</p>
                        <div className="mt-2 flex gap-2 text-xs">
                          <span className="rounded bg-blue-100 px-2 py-1 font-semibold text-blue-700">
                            Tồn lâu: {wh.deadStockCount}
                          </span>
                          <span className="rounded bg-cyan-100 px-2 py-1 font-semibold text-cyan-700">
                            Hết hạn: {wh.expiringSoonCount}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </section>
              )}

              {/* Summary by Customer */}
              {summary && summary.byCustomer.length > 0 && (
                <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
                  <h2 className="flex items-center gap-2 text-base font-black text-slate-950">
                    <span className="material-symbols-outlined text-blue-700">business</span>
                    Theo Khách hàng
                  </h2>
                  <div className="mt-4 space-y-3">
                    {summary.byCustomer.slice(0, 5).map((cust) => (
                      <div key={cust.customerName} className="rounded-lg bg-slate-50 p-3">
                        <p className="truncate font-black text-slate-900">{cust.customerName}</p>
                        <div className="mt-2 flex gap-2 text-xs">
                          <span className="rounded bg-blue-100 px-2 py-1 font-semibold text-blue-700">
                            Tồn lâu: {cust.deadStockCount}
                          </span>
                          <span className="rounded bg-cyan-100 px-2 py-1 font-semibold text-cyan-700">
                            Hết hạn: {cust.expiringSoonCount}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </section>
              )}
            </aside>
          </div>
        </section>
      </main>
    </div>
  );
};

export default DeadStockDashboard;
