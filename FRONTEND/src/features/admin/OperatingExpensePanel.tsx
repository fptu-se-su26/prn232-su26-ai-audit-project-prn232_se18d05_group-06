import React, { useEffect, useMemo, useState } from 'react';
import { Bar, BarChart, CartesianGrid, Cell, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import api from '@lib/api';
import FinanceExportButtons from './FinanceExportButtons';

interface OperatingExpenseItem {
  category: string;
  totalAmount: number;
  entryCount: number;
  percentage: number;
}

interface OperatingExpenseReport {
  totalExpense: number;
  topExpenseCategory: string;
  fromDate: string;
  toDate: string;
  category: string;
  items: OperatingExpenseItem[];
}

const fallbackReport: OperatingExpenseReport = {
  totalExpense: 0,
  topExpenseCategory: 'N/A',
  fromDate: '2025-05-01',
  toDate: '2025-06-30',
  category: 'ALL',
  items: [],
};

const colors = ['#dc2626', '#d97706', '#0f766e', '#2563eb', '#7c3aed', '#475569', '#be123c'];
const moneyFull = new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND', maximumFractionDigits: 0 });
const moneyCompact = new Intl.NumberFormat('vi-VN', { maximumFractionDigits: 1, notation: 'compact' });
const formatMoney = (value = 0) => moneyFull.format(value);
const formatCompact = (value = 0) => `${moneyCompact.format(value)} VND`;

const categoryOptions = [
  { value: 'ALL', label: 'Tất cả loại chi phí' },
  { value: 'MAINTENANCE', label: 'Bảo trì xe' },
  { value: 'FUEL', label: 'Nhiên liệu' },
  { value: 'ELECTRICITY', label: 'Điện nước' },
  { value: 'SALARY', label: 'Nhân sự' },
  { value: 'WAREHOUSE_RENT', label: 'Chi phí kho bãi' },
  { value: 'EQUIPMENT', label: 'Thiết bị' },
  { value: 'OTHER', label: 'Phát sinh khác' },
];

const categoryLabels: Record<string, string> = {
  MAINTENANCE: 'Bảo trì xe',
  FUEL: 'Nhiên liệu',
  ELECTRICITY: 'Điện nước',
  SALARY: 'Nhân sự',
  WAREHOUSE_RENT: 'Chi phí kho bãi',
  EQUIPMENT: 'Thiết bị',
  OTHER: 'Phát sinh khác',
};

const labelOf = (category: string) => categoryLabels[category] ?? category;

const OperatingExpensePanel: React.FC = () => {
  const [report, setReport] = useState<OperatingExpenseReport>(fallbackReport);
  const [fromDate, setFromDate] = useState('2025-05-01');
  const [toDate, setToDate] = useState('2025-06-30');
  const [category, setCategory] = useState('ALL');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const chartData = useMemo(
    () => report.items.map((item) => ({ ...item, categoryLabel: labelOf(item.category) })),
    [report.items],
  );

  const loadReport = async () => {
    try {
      setLoading(true);
      const response = await api.get<OperatingExpenseReport>('/finance/reports/operating-expenses', {
        params: { fromDate, toDate, category },
      });
      setReport(response.data);
      setError(null);
    } catch {
      setReport(fallbackReport);
      setError('Không tải được báo cáo chi phí vận hành.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReport();
  }, [fromDate, toDate, category]);

  const cards = [
    { label: 'Tổng chi phí', value: formatMoney(report.totalExpense), icon: 'receipt_long', tone: 'bg-rose-50 text-rose-700', hint: 'OperatingExpenses + exception + maintenance' },
    { label: 'Loại cao nhất', value: labelOf(report.topExpenseCategory), icon: 'trending_up', tone: 'bg-amber-50 text-amber-700', hint: 'Nhóm chi phí chiếm tỷ trọng lớn nhất' },
    { label: 'Số nhóm chi phí', value: report.items.length.toString(), icon: 'category', tone: 'bg-blue-50 text-blue-700', hint: `${report.fromDate} - ${report.toDate}` },
  ];

  return (
    <section className="space-y-5">
      <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-rose-700">Finance / Operating Expense Report</p>
            <h2 className="mt-1 text-xl font-semibold text-slate-950">{'Báo cáo chi phí vận hành'}</h2>
            <p className="mt-1 text-sm text-slate-500">{'Tổng hợp chi phí định kỳ, chi phí phát sinh và bảo trì xe.'}</p>
          </div>
          <div className="grid w-full grid-cols-1 gap-3 sm:grid-cols-2 xl:w-auto xl:grid-cols-[160px_160px_230px_auto_auto]">
            <input type="date" value={fromDate} onChange={(event) => setFromDate(event.target.value)} className="h-11 rounded-lg border border-slate-300 bg-white px-3 text-sm text-slate-900 outline-none focus:border-rose-600 focus:ring-2 focus:ring-rose-100" />
            <input type="date" value={toDate} onChange={(event) => setToDate(event.target.value)} className="h-11 rounded-lg border border-slate-300 bg-white px-3 text-sm text-slate-900 outline-none focus:border-rose-600 focus:ring-2 focus:ring-rose-100" />
            <select value={category} onChange={(event) => setCategory(event.target.value)} className="h-11 rounded-lg border border-slate-300 bg-white px-3 text-sm text-slate-900 outline-none focus:border-rose-600 focus:ring-2 focus:ring-rose-100">
              {categoryOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
            </select>
            <button type="button" onClick={loadReport} className="inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-rose-700 px-4 text-sm font-semibold text-white shadow-sm transition hover:bg-rose-800 active:translate-y-px">
              <span className="material-symbols-outlined text-[18px]">sync</span>
              {'Làm mới'}
            </button>
            <FinanceExportButtons reportType="operating-expenses" fromDate={fromDate} toDate={toDate} category={category} compact className="sm:col-span-2 xl:col-span-1" />
          </div>
        </div>
      </div>

      {error && <div className="rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</div>}

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {cards.map((card) => (
          <article key={card.label} className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="text-sm font-medium text-slate-500">{card.label}</p>
                <p className="mt-2 truncate text-2xl font-semibold text-slate-950">{card.value}</p>
              </div>
              <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${card.tone}`}>
                <span className="material-symbols-outlined text-[22px]">{card.icon}</span>
              </div>
            </div>
            <p className="mt-4 text-sm text-slate-500">{card.hint}</p>
          </article>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-5 xl:grid-cols-[minmax(0,1.4fr)_minmax(320px,0.6fr)]">
        <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
          <div className="mb-4 flex items-center justify-between gap-3">
            <h3 className="text-lg font-semibold text-slate-950">{'Chi phí theo loại'}</h3>
            {loading && <span className="text-sm font-medium text-rose-700">Loading...</span>}
          </div>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 12, right: 12, left: 8, bottom: 0 }}>
                <CartesianGrid stroke="#e2e8f0" vertical={false} />
                <XAxis dataKey="categoryLabel" tick={{ fill: '#64748b', fontSize: 12 }} axisLine={false} tickLine={false} />
                <YAxis tickFormatter={formatCompact} tick={{ fill: '#64748b', fontSize: 12 }} axisLine={false} tickLine={false} width={92} />
                <Tooltip formatter={(value: number) => formatMoney(value)} />
                <Bar dataKey="totalAmount" name="Chi phi" fill="#dc2626" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </section>

        <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
          <h3 className="text-lg font-semibold text-slate-950">{'Tỷ trọng chi phí'}</h3>
          <div className="mt-4 h-[220px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={chartData} dataKey="totalAmount" nameKey="categoryLabel" innerRadius="58%" outerRadius="86%" paddingAngle={3}>
                  {chartData.map((entry, index) => <Cell key={entry.category} fill={colors[index % colors.length]} />)}
                </Pie>
                <Tooltip formatter={(value: number) => formatMoney(value)} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-3 space-y-2">
            {report.items.slice(0, 5).map((item, index) => (
              <div key={item.category} className="flex items-center justify-between gap-3 text-sm">
                <div className="flex min-w-0 items-center gap-2">
                  <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: colors[index % colors.length] }} />
                  <span className="truncate font-medium text-slate-700">{labelOf(item.category)}</span>
                </div>
                <span className="font-semibold text-slate-950">{item.percentage}%</span>
              </div>
            ))}
          </div>
        </section>
      </div>

      <section className="rounded-lg border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-200 px-5 py-4">
          <h3 className="text-lg font-semibold text-slate-950">{'Bảng chi phí vận hành'}</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200 text-sm">
            <thead className="bg-slate-50 text-xs uppercase text-slate-500">
              <tr>
                <th className="px-5 py-3 text-left font-semibold">{'Loại chi phí'}</th>
                <th className="px-5 py-3 text-right font-semibold">{'Tổng tiền'}</th>
                <th className="px-5 py-3 text-right font-semibold">{'Số bản ghi'}</th>
                <th className="px-5 py-3 text-right font-semibold">{'Tỷ lệ'}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {report.items.map((item, index) => (
                <tr key={item.category} className="hover:bg-slate-50">
                  <td className="px-5 py-4 font-semibold text-slate-900"><span className="mr-2 inline-block h-2.5 w-2.5 rounded-full" style={{ backgroundColor: colors[index % colors.length] }} />{labelOf(item.category)}</td>
                  <td className="px-5 py-4 text-right text-slate-700">{formatMoney(item.totalAmount)}</td>
                  <td className="px-5 py-4 text-right text-slate-700">{item.entryCount}</td>
                  <td className="px-5 py-4 text-right font-semibold text-slate-950">{item.percentage}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {!report.items.length && <div className="px-5 py-10 text-center text-sm text-slate-500">{'Không có dữ liệu chi phí trong bộ lọc hiện tại.'}</div>}
      </section>
    </section>
  );
};

export default OperatingExpensePanel;