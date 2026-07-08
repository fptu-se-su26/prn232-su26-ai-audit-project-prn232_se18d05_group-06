import React, { useEffect, useMemo, useState } from 'react';
import { Area, CartesianGrid, ComposedChart, Line, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import api from '@lib/api';
import FinanceExportButtons from './FinanceExportButtons';

interface ProfitReportItem {
  period: string;
  revenue: number;
  expense: number;
  profit: number;
  profitMargin: number;
}

interface ProfitReport {
  totalRevenue: number;
  totalExpense: number;
  totalProfit: number;
  profitMargin: number;
  fromDate: string;
  toDate: string;
  period: string;
  items: ProfitReportItem[];
}

const fallbackReport: ProfitReport = {
  totalRevenue: 0,
  totalExpense: 0,
  totalProfit: 0,
  profitMargin: 0,
  fromDate: '2025-05-01',
  toDate: '2025-12-31',
  period: 'month',
  items: [],
};

const moneyFull = new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND', maximumFractionDigits: 0 });
const moneyCompact = new Intl.NumberFormat('vi-VN', { maximumFractionDigits: 1, notation: 'compact' });
const formatMoney = (value = 0) => moneyFull.format(value);
const formatCompact = (value = 0) => `${moneyCompact.format(value)} VND`;

const periodOptions = [
  { value: 'day', label: 'Theo ng\u00e0y' },
  { value: 'month', label: 'Theo th\u00e1ng' },
  { value: 'quarter', label: 'Theo qu\u00fd' },
  { value: 'year', label: 'Theo n\u0103m' },
];

const ProfitReportPanel: React.FC = () => {
  const [report, setReport] = useState<ProfitReport>(fallbackReport);
  const [fromDate, setFromDate] = useState('2025-05-01');
  const [toDate, setToDate] = useState('2025-12-31');
  const [period, setPeriod] = useState('month');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const chartData = useMemo(() => report.items.map((item) => ({ ...item, label: item.period })), [report.items]);

  const loadReport = async () => {
    try {
      setLoading(true);
      const response = await api.get<ProfitReport>('/finance/reports/profit', {
        params: { fromDate, toDate, period },
      });
      setReport(response.data);
      setError(null);
    } catch {
      setReport(fallbackReport);
      setError('Kh\u00f4ng t\u1ea3i \u0111\u01b0\u1ee3c b\u00e1o c\u00e1o l\u1ee3i nhu\u1eadn.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReport();
  }, [fromDate, toDate, period]);

  const cards = [
    { label: 'T\u1ed5ng doanh thu', value: formatMoney(report.totalRevenue), icon: 'payments', tone: 'bg-blue-50 text-blue-700', hint: 'SubTotal tr\u1eeb discount, kh\u00f4ng t\u00ednh VAT' },
    { label: 'T\u1ed5ng chi ph\u00ed', value: formatMoney(report.totalExpense), icon: 'receipt_long', tone: 'bg-rose-50 text-rose-700', hint: 'Chi ph\u00ed v\u1eadn h\u00e0nh trong c\u00f9ng k\u1ef3' },
    { label: 'L\u1ee3i nhu\u1eadn', value: formatMoney(report.totalProfit), icon: 'monitoring', tone: report.totalProfit >= 0 ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700', hint: 'Doanh thu tr\u1eeb chi ph\u00ed' },
    { label: 'Bi\u00ean l\u1ee3i nhu\u1eadn', value: `${report.profitMargin}%`, icon: 'percent', tone: report.profitMargin >= 0 ? 'bg-slate-100 text-slate-700' : 'bg-amber-50 text-amber-700', hint: 'Profit / Revenue' },
  ];

  return (
    <section className="space-y-5">
      <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-emerald-700">Finance / Profit Report</p>
            <h2 className="mt-1 text-xl font-semibold text-slate-950">{'B\u00e1o c\u00e1o l\u1ee3i nhu\u1eadn theo th\u1eddi gian'}</h2>
            <p className="mt-1 text-sm text-slate-500">{'T\u00ednh l\u1ee3i nhu\u1eadn t\u1eeb doanh thu v\u1eadn h\u00e0nh tr\u1eeb chi ph\u00ed theo ng\u00e0y, th\u00e1ng, qu\u00fd ho\u1eb7c n\u0103m.'}</p>
          </div>
          <div className="grid w-full grid-cols-1 gap-3 sm:grid-cols-2 xl:w-auto xl:grid-cols-[160px_160px_180px_auto_auto]">
            <input type="date" value={fromDate} onChange={(event) => setFromDate(event.target.value)} className="h-11 rounded-lg border border-slate-300 bg-white px-3 text-sm text-slate-900 outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100" />
            <input type="date" value={toDate} onChange={(event) => setToDate(event.target.value)} className="h-11 rounded-lg border border-slate-300 bg-white px-3 text-sm text-slate-900 outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100" />
            <select value={period} onChange={(event) => setPeriod(event.target.value)} className="h-11 rounded-lg border border-slate-300 bg-white px-3 text-sm text-slate-900 outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100">
              {periodOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
            </select>
            <button type="button" onClick={loadReport} className="inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-emerald-700 px-4 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-800 active:translate-y-px">
              <span className="material-symbols-outlined text-[18px]">sync</span>
              {'L\u00e0m m\u1edbi'}
            </button>
            <FinanceExportButtons reportType="profit" fromDate={fromDate} toDate={toDate} period={period} compact className="sm:col-span-2 xl:col-span-1" />
          </div>
        </div>
      </div>

      {error && <div className="rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</div>}

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
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

      <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
        <div className="mb-4 flex items-center justify-between gap-3">
          <h3 className="text-lg font-semibold text-slate-950">{'Xu h\u01b0\u1edbng l\u1ee3i nhu\u1eadn'}</h3>
          {loading && <span className="text-sm font-medium text-emerald-700">Loading...</span>}
        </div>
        <div className="h-[340px]">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={chartData} margin={{ top: 12, right: 12, left: 8, bottom: 0 }}>
              <CartesianGrid stroke="#e2e8f0" vertical={false} />
              <XAxis dataKey="label" tick={{ fill: '#64748b', fontSize: 12 }} axisLine={false} tickLine={false} />
              <YAxis tickFormatter={formatCompact} tick={{ fill: '#64748b', fontSize: 12 }} axisLine={false} tickLine={false} width={92} />
              <Tooltip formatter={(value: number) => formatMoney(value)} />
              <Area type="monotone" dataKey="profit" name="Loi nhuan" fill="#dcfce7" stroke="#16a34a" strokeWidth={3} />
              <Line type="monotone" dataKey="revenue" name="Doanh thu" stroke="#1d4ed8" strokeWidth={2} dot={{ r: 3 }} />
              <Line type="monotone" dataKey="expense" name="Chi phi" stroke="#dc2626" strokeWidth={2} dot={{ r: 3 }} />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </section>

      <section className="rounded-lg border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-200 px-5 py-4">
          <h3 className="text-lg font-semibold text-slate-950">{'B\u1ea3ng l\u1ee3i nhu\u1eadn theo k\u1ef3'}</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200 text-sm">
            <thead className="bg-slate-50 text-xs uppercase text-slate-500">
              <tr>
                <th className="px-5 py-3 text-left font-semibold">{'K\u1ef3'}</th>
                <th className="px-5 py-3 text-right font-semibold">{'Doanh thu'}</th>
                <th className="px-5 py-3 text-right font-semibold">{'Chi ph\u00ed'}</th>
                <th className="px-5 py-3 text-right font-semibold">{'L\u1ee3i nhu\u1eadn'}</th>
                <th className="px-5 py-3 text-right font-semibold">{'Bi\u00ean LN'}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {report.items.map((item) => (
                <tr key={item.period} className="hover:bg-slate-50">
                  <td className="px-5 py-4 font-semibold text-slate-900">{item.period}</td>
                  <td className="px-5 py-4 text-right text-slate-700">{formatMoney(item.revenue)}</td>
                  <td className="px-5 py-4 text-right text-rose-700">{formatMoney(item.expense)}</td>
                  <td className={`px-5 py-4 text-right font-semibold ${item.profit >= 0 ? 'text-emerald-700' : 'text-rose-700'}`}>{formatMoney(item.profit)}</td>
                  <td className="px-5 py-4 text-right font-semibold text-slate-950">{item.profitMargin}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {!report.items.length && <div className="px-5 py-10 text-center text-sm text-slate-500">{'Kh\u00f4ng c\u00f3 d\u1eef li\u1ec7u l\u1ee3i nhu\u1eadn trong b\u1ed9 l\u1ecdc hi\u1ec7n t\u1ea1i.'}</div>}
      </section>
    </section>
  );
};

export default ProfitReportPanel;