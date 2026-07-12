import React, { useEffect, useMemo, useState } from 'react';
import { Area, CartesianGrid, ComposedChart, Line, ResponsiveContainer, Tooltip, XAxis, YAxis, Legend, Bar, PieChart, Pie, Cell } from 'recharts';
import api from '@lib/api';
import FinanceExportButtons from './FinanceExportButtons';

interface ProfitChartPointDto {
  period: string;
  revenueInvoiced: number;
  revenueCollected: number;
  totalExpense: number;
  profitByInvoice: number;
  profitByCollected: number;
}

interface ExpenseBreakdownDto {
  category: string;
  amount: number;
}

interface ServiceRevenueBreakdownDto {
  serviceType: string;
  amount: number;
}

interface ProfitSummaryDto {
  revenueInvoiced: number;
  revenueCollected: number;
  operatingCost: number;
  exceptionCost: number;
  maintenanceCost: number;
  totalExpense: number;
  profitByInvoice: number;
  profitByCollected: number;
  profitMarginByInvoice: number;
  profitMarginByCollected: number;
  totalOrders: number;
  totalInvoices: number;
  paidInvoices: number;
  partialInvoices: number;
  overdueInvoices: number;
}

interface ProfitDashboardResponse {
  success: boolean;
  periodType: string;
  fromDate: string;
  toDate: string;
  summary: ProfitSummaryDto;
  chartData: ProfitChartPointDto[];
  expenseBreakdown: ExpenseBreakdownDto[];
  serviceRevenueBreakdown: ServiceRevenueBreakdownDto[];
}

const fallbackSummary: ProfitSummaryDto = {
  revenueInvoiced: 0,
  revenueCollected: 0,
  operatingCost: 0,
  exceptionCost: 0,
  maintenanceCost: 0,
  totalExpense: 0,
  profitByInvoice: 0,
  profitByCollected: 0,
  profitMarginByInvoice: 0,
  profitMarginByCollected: 0,
  totalOrders: 0,
  totalInvoices: 0,
  paidInvoices: 0,
  partialInvoices: 0,
  overdueInvoices: 0
};

const COLORS = ['#3b82f6', '#f59e0b', '#10b981', '#ef4444', '#8b5cf6'];

const moneyFull = new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND', maximumFractionDigits: 0 });
const moneyCompact = new Intl.NumberFormat('vi-VN', { maximumFractionDigits: 1, notation: 'compact' });
const formatMoney = (value = 0) => moneyFull.format(value);
const formatCompact = (value = 0) => `${moneyCompact.format(value)} VND`;

const periodOptions = [
  { value: 'day', label: 'Theo ngày' },
  { value: 'month', label: 'Theo tháng' },
  { value: 'quarter', label: 'Theo quý' },
  { value: 'year', label: 'Theo năm' },
];

const ProfitReportPanel: React.FC = () => {
  const [reportData, setReportData] = useState<ProfitDashboardResponse | null>(null);
  
  // Default values: From beginning of year to today
  const [fromDate, setFromDate] = useState(() => {
    const d = new Date();
    return new Date(d.getFullYear(), 0, 1).toISOString().split('T')[0];
  });
  const [toDate, setToDate] = useState(() => {
    return new Date().toISOString().split('T')[0];
  });
  
  const [period, setPeriod] = useState('month');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 5;

  const loadReport = async () => {
    try {
      setLoading(true);
      const response = await api.get<ProfitDashboardResponse>('/finance/dashboard/profit-summary', {
        params: { fromDate, toDate, periodType: period },
      });
      setReportData(response.data);
      setCurrentPage(1);
      setError(null);
    } catch (err: any) {
      console.error(err);
      setError(err?.response?.data?.message || 'Không tải được báo cáo lợi nhuận từ server.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReport();
  }, [period]);

  const summary = reportData?.summary || fallbackSummary;
  const chartData = reportData?.chartData || [];
  const filteredChartData = chartData.filter(
    (item) => item.revenueInvoiced > 0 || item.revenueCollected > 0 || item.totalExpense > 0
  );
  const totalPages = Math.ceil(filteredChartData.length / rowsPerPage);
  const paginatedData = filteredChartData.slice((currentPage - 1) * rowsPerPage, currentPage * rowsPerPage);

  const expenseData = reportData?.expenseBreakdown || [];
  const serviceRevData = reportData?.serviceRevenueBreakdown || [];

  const cards = [
    { label: 'Doanh thu (Invoiced)', value: formatMoney(summary.revenueInvoiced), icon: 'receipt', tone: 'bg-indigo-50 text-indigo-700', hint: `${summary.totalInvoices} hóa đơn` },
    { label: 'Thực thu (Collected)', value: formatMoney(summary.revenueCollected), icon: 'payments', tone: 'bg-blue-50 text-blue-700', hint: 'Tiền thực tế đã nhận' },
    { label: 'Tổng chi phí', value: formatMoney(summary.totalExpense), icon: 'account_balance_wallet', tone: 'bg-rose-50 text-rose-700', hint: 'Vận hành, ngoại lệ, bảo trì' },
    { label: 'Lợi nhuận (Theo thực thu)', value: formatMoney(summary.profitByCollected), icon: 'monitoring', tone: summary.profitByCollected >= 0 ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700', hint: 'Collected - Expense' },
    { label: 'Biên lợi nhuận', value: `${summary.profitMarginByCollected}%`, icon: 'percent', tone: summary.profitMarginByCollected >= 0 ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700', hint: 'Tỷ suất dựa trên thực thu' },
    { label: 'Hóa đơn quá hạn', value: summary.overdueInvoices.toString(), icon: 'warning', tone: summary.overdueInvoices > 0 ? 'bg-rose-50 text-rose-700 border-rose-200 border' : 'bg-slate-50 text-slate-500', hint: 'Cần đốc thúc thu hồi' },
  ];

  return (
    <section className="space-y-6">
      {/* Header & Filters */}
      <div className="rounded-xl border border-slate-200 bg-white p-5 lg:p-6 shadow-sm">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-emerald-600">Finance & Analytics</p>
            <h2 className="mt-1 text-2xl font-bold tracking-tight text-slate-900">Dashboard Tổng Hợp Lợi Nhuận</h2>
            <p className="mt-1 text-sm text-slate-500">Phân tích chi tiết dòng tiền, chi phí vận hành và hiệu quả kinh doanh từ dữ liệu thực tế.</p>
          </div>
          <div className="grid w-full grid-cols-1 gap-3 sm:grid-cols-2 xl:w-auto xl:grid-cols-[160px_160px_140px_auto]">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-600 uppercase tracking-wide">Từ ngày</label>
              <input type="date" value={fromDate} onChange={(e) => setFromDate(e.target.value)} className="h-11 w-full rounded-lg border border-slate-300 bg-white px-3 text-sm font-medium text-slate-900 outline-none transition-shadow focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100" />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-600 uppercase tracking-wide">Đến ngày</label>
              <input type="date" value={toDate} onChange={(e) => setToDate(e.target.value)} className="h-11 w-full rounded-lg border border-slate-300 bg-white px-3 text-sm font-medium text-slate-900 outline-none transition-shadow focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100" />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-600 uppercase tracking-wide">Hiển thị theo</label>
              <select value={period} onChange={(e) => setPeriod(e.target.value)} className="h-11 w-full rounded-lg border border-slate-300 bg-white px-3 text-sm font-medium text-slate-900 outline-none transition-shadow focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100">
                {periodOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
              </select>
            </div>
            <div className="flex items-end h-full">
              <button type="button" onClick={loadReport} className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-lg bg-emerald-600 px-5 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-700 active:scale-95">
                <span className="material-symbols-outlined text-[18px]">sync</span>
                Áp dụng lọc
              </button>
            </div>
          </div>
        </div>
      </div>

      {error && (
        <div className="animate-fade-in flex items-center gap-3 rounded-xl border border-rose-200 bg-rose-50 px-5 py-4 text-sm font-medium text-rose-800 shadow-sm">
          <span className="material-symbols-outlined text-[20px]">error</span>
          <span>{error}</span>
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        {cards.map((card, idx) => (
          <article key={idx} className="group relative overflow-hidden rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="text-xs font-bold uppercase tracking-wide text-slate-500">{card.label}</p>
                <p className="mt-2 truncate text-xl font-black text-slate-900">{card.value}</p>
              </div>
              <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${card.tone}`}>
                <span className="material-symbols-outlined text-[22px]">{card.icon}</span>
              </div>
            </div>
            <p className="mt-4 text-xs font-medium text-slate-500">{card.hint}</p>
            <div className="absolute inset-x-0 bottom-0 h-1 scale-x-0 bg-gradient-to-r from-emerald-400 to-teal-500 transition-transform duration-300 group-hover:scale-x-100" />
          </article>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_320px] xl:grid-cols-[1fr_400px]">
        {/* Main Trend Chart */}
        <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="mb-6 flex items-center justify-between gap-3">
            <div>
              <h3 className="text-lg font-bold text-slate-900">Xu Hướng Dòng Tiền</h3>
              <p className="mt-1 text-sm text-slate-500">So sánh doanh thu trên giấy (Invoiced), thực thu, tổng chi phí và lợi nhuận.</p>
            </div>
            {loading && <span className="animate-pulse rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700">Đang tải...</span>}
          </div>
          <div className="h-[380px]">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={chartData} margin={{ top: 12, right: 12, left: 8, bottom: 0 }}>
                <CartesianGrid stroke="#f1f5f9" vertical={false} />
                <XAxis dataKey="period" tick={{ fill: '#64748b', fontSize: 12 }} axisLine={false} tickLine={false} />
                <YAxis tickFormatter={formatCompact} tick={{ fill: '#64748b', fontSize: 12 }} axisLine={false} tickLine={false} width={85} />
                <Tooltip formatter={(value: number) => formatMoney(value)} />
                <Legend iconType="circle" wrapperStyle={{ paddingTop: '20px' }} />
                
                <Bar dataKey="revenueInvoiced" name="Doanh thu (Invoiced)" fill="#c084fc" radius={[4, 4, 0, 0]} barSize={32} />
                <Bar dataKey="revenueCollected" name="Thực thu" fill="#3b82f6" radius={[4, 4, 0, 0]} barSize={32} />
                <Line type="monotone" dataKey="totalExpense" name="Tổng chi phí" stroke="#ef4444" strokeWidth={3} dot={{ r: 4, strokeWidth: 2 }} />
                <Area type="monotone" dataKey="profitByCollected" name="Lợi nhuận (Thực thu)" fill="#d1fae5" stroke="#10b981" strokeWidth={3} />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </section>

        {/* Breakdowns */}
        <div className="flex flex-col gap-6">
          <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <h3 className="text-base font-bold text-slate-900">Cơ cấu chi phí</h3>
            <div className="mt-4 h-[200px]">
              {expenseData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={expenseData} dataKey="amount" nameKey="category" cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={5}>
                      {expenseData.map((_, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
                    </Pie>
                    <Tooltip formatter={(value: number) => formatMoney(value)} />
                    <Legend iconType="circle" />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex h-full items-center justify-center text-sm font-medium text-slate-400">Không có chi phí</div>
              )}
            </div>
          </section>

          <section className="flex-1 rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <h3 className="text-base font-bold text-slate-900">Doanh thu theo Dịch vụ</h3>
            <div className="mt-4 space-y-4">
              {serviceRevData.length > 0 ? (
                serviceRevData.map((item, index) => {
                  const max = Math.max(...serviceRevData.map(d => d.amount));
                  const percentage = max === 0 ? 0 : (item.amount / max) * 100;
                  return (
                    <div key={item.serviceType}>
                      <div className="flex items-center justify-between text-xs font-semibold">
                        <span className="text-slate-700">{item.serviceType}</span>
                        <span className="text-emerald-700">{formatCompact(item.amount)}</span>
                      </div>
                      <div className="mt-1.5 h-2 w-full overflow-hidden rounded-full bg-slate-100">
                        <div className="h-full rounded-full bg-emerald-500 transition-all duration-1000" style={{ width: `${percentage}%` }} />
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="pt-8 text-center text-sm font-medium text-slate-400">Chưa có dữ liệu phi dịch vụ</div>
              )}
            </div>
          </section>
        </div>
      </div>

      {/* Data Table */}
      <section className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
        <div className="border-b border-slate-200 px-5 py-4 flex items-center justify-between">
          <h3 className="text-lg font-bold text-slate-900">Bảng Thống Kê Chi Tiết</h3>
          <FinanceExportButtons reportType="profit" fromDate={fromDate} toDate={toDate} period={period} compact />
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200 text-sm">
            <thead className="bg-slate-50 text-xs font-bold uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-5 py-4 text-left">Kỳ báo cáo</th>
                <th className="px-5 py-4 text-right">Doanh thu (Invoiced)</th>
                <th className="px-5 py-4 text-right">Thực thu (Collected)</th>
                <th className="px-5 py-4 text-right">Tổng chi phí</th>
                <th className="px-5 py-4 text-right">Lợi nhuận (Thực thu)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {paginatedData.map((item) => (
                <tr key={item.period} className="hover:bg-emerald-50/50 transition-colors">
                  <td className="px-5 py-4 font-bold text-slate-900">{item.period}</td>
                  <td className="px-5 py-4 text-right font-medium text-slate-600">{formatMoney(item.revenueInvoiced)}</td>
                  <td className="px-5 py-4 text-right font-bold text-blue-700">{formatMoney(item.revenueCollected)}</td>
                  <td className="px-5 py-4 text-right font-medium text-rose-600">{formatMoney(item.totalExpense)}</td>
                  <td className={`px-5 py-4 text-right font-black ${item.profitByCollected >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                    {formatMoney(item.profitByCollected)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {!filteredChartData.length && (
          <div className="px-5 py-12 text-center">
            <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-slate-400 mb-3">
              <span className="material-symbols-outlined text-[24px]">inbox</span>
            </div>
            <p className="text-sm font-medium text-slate-500">Không có dữ liệu trong khoảng thời gian này.</p>
          </div>
        )}
        {totalPages > 1 && (
          <div className="flex items-center justify-between border-t border-slate-200 bg-white px-5 py-3">
            <span className="text-sm text-slate-500">
              Hiển thị {(currentPage - 1) * rowsPerPage + 1} đến {Math.min(currentPage * rowsPerPage, filteredChartData.length)} trong số {filteredChartData.length} kỳ có dữ liệu
            </span>
            <div className="flex gap-2">
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="rounded border border-slate-200 px-3 py-1 text-sm font-medium text-slate-600 hover:bg-slate-50 disabled:opacity-50 transition-colors"
              >
                Trước
              </button>
              <button
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="rounded border border-slate-200 px-3 py-1 text-sm font-medium text-slate-600 hover:bg-slate-50 disabled:opacity-50 transition-colors"
              >
                Sau
              </button>
            </div>
          </div>
        )}
      </section>
    </section>
  );
};

export default ProfitReportPanel;