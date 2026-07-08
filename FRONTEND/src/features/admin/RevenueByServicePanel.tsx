import React, { useEffect, useMemo, useState } from 'react';
import { Bar, BarChart, CartesianGrid, Cell, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import api from '@lib/api';
import FinanceExportButtons from './FinanceExportButtons';

interface RevenueByServiceItem {
  chargeType: string;
  totalAmount: number;
  collectedAmount: number;
  invoiceCount: number;
  percentage: number;
}

interface RevenueByServiceReport {
  totalRevenue: number;
  collectedRevenue: number;
  topServiceType: string;
  fromDate: string;
  toDate: string;
  status: string;
  items: RevenueByServiceItem[];
}

const fallbackReport: RevenueByServiceReport = {
  totalRevenue: 0,
  collectedRevenue: 0,
  topServiceType: 'N/A',
  fromDate: '2025-05-01',
  toDate: '2025-06-30',
  status: 'ALL',
  items: [],
};

const chartColors = ['#1d4ed8', '#0f766e', '#d97706', '#7c3aed', '#be123c', '#475569'];
const moneyCompact = new Intl.NumberFormat('vi-VN', { maximumFractionDigits: 1, notation: 'compact' });
const moneyFull = new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND', maximumFractionDigits: 0 });
const formatMoney = (value = 0) => moneyFull.format(value);
const formatCompact = (value = 0) => `${moneyCompact.format(value)} VND`;

const statusOptions = [
  { value: 'ALL', label: 'T\u1ea5t c\u1ea3 h\u1ee3p l\u1ec7' },
  { value: 'PAID', label: '\u0110\u00e3 thanh to\u00e1n' },
  { value: 'PARTIAL', label: 'Thanh to\u00e1n m\u1ed9t ph\u1ea7n' },
  { value: 'PENDING', label: 'Ch\u1edd thanh to\u00e1n' },
];

const RevenueByServicePanel: React.FC = () => {
  const [report, setReport] = useState<RevenueByServiceReport>(fallbackReport);
  const [fromDate, setFromDate] = useState('2025-05-01');
  const [toDate, setToDate] = useState('2025-06-30');
  const [status, setStatus] = useState('ALL');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const chartData = useMemo(() => report.items.map((item) => ({ ...item, name: item.chargeType })), [report.items]);

  const loadReport = async () => {
    try {
      setLoading(true);
      const response = await api.get<RevenueByServiceReport>('/finance/reports/revenue-by-service', {
        params: { fromDate, toDate, status },
      });
      setReport(response.data);
      setError(null);
    } catch {
      setReport(fallbackReport);
      setError('Kh\u00f4ng t\u1ea3i \u0111\u01b0\u1ee3c b\u00e1o c\u00e1o doanh thu theo d\u1ecbch v\u1ee5.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReport();
  }, [fromDate, toDate, status]);

  const cards = [
    { label: 'Doanh thu ghi nh\u1eadn', value: formatMoney(report.totalRevenue), icon: 'payments', tone: 'bg-blue-50 text-blue-700', hint: 'Ph\u00ed \u0111\u00e3 duy\u1ec7t theo b\u1ed9 l\u1ecdc' },
    { label: 'Doanh thu \u0111\u00e3 thu', value: formatMoney(report.collectedRevenue), icon: 'account_balance', tone: 'bg-emerald-50 text-emerald-700', hint: 'Ch\u1ec9 t\u00ednh h\u00f3a \u0111\u01a1n PAID' },
    { label: 'D\u1ecbch v\u1ee5 cao nh\u1ea5t', value: report.topServiceType || 'N/A', icon: 'leaderboard', tone: 'bg-violet-50 text-violet-700', hint: 'ChargeType doanh thu l\u1edbn nh\u1ea5t' },
    { label: 'Lo\u1ea1i d\u1ecbch v\u1ee5', value: report.items.length.toString(), icon: 'category', tone: 'bg-slate-100 text-slate-700', hint: `${report.fromDate} - ${report.toDate}` },
  ];

  return (
    <section className="space-y-5">
      <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-blue-700">Finance / Revenue by Service</p>
            <h2 className="mt-1 text-xl font-semibold text-slate-950">{'B\u00e1o c\u00e1o doanh thu theo lo\u1ea1i d\u1ecbch v\u1ee5'}</h2>
            <p className="mt-1 text-sm text-slate-500">{'Th\u1ed1ng k\u00ea ServiceCharges \u0111\u00e3 duy\u1ec7t theo tr\u1ea1ng th\u00e1i h\u00f3a \u0111\u01a1n.'}</p>
          </div>
          <div className="grid w-full grid-cols-1 gap-3 sm:grid-cols-2 xl:w-auto xl:grid-cols-[160px_160px_210px_auto_auto]">
            <input type="date" value={fromDate} onChange={(event) => setFromDate(event.target.value)} className="h-11 rounded-lg border border-slate-300 bg-white px-3 text-sm text-slate-900 outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100" />
            <input type="date" value={toDate} onChange={(event) => setToDate(event.target.value)} className="h-11 rounded-lg border border-slate-300 bg-white px-3 text-sm text-slate-900 outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100" />
            <select value={status} onChange={(event) => setStatus(event.target.value)} className="h-11 rounded-lg border border-slate-300 bg-white px-3 text-sm text-slate-900 outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100">
              {statusOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
            </select>
            <button type="button" onClick={loadReport} className="inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-blue-700 px-4 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-800 active:translate-y-px">
              <span className="material-symbols-outlined text-[18px]">sync</span>
              {'L\u00e0m m\u1edbi'}
            </button>
            <FinanceExportButtons reportType="revenue-by-service" fromDate={fromDate} toDate={toDate} status={status} compact className="sm:col-span-2 xl:col-span-1" />
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

      <div className="grid grid-cols-1 gap-5 xl:grid-cols-[minmax(0,1.4fr)_minmax(320px,0.6fr)]">
        <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
          <div className="mb-4 flex items-center justify-between gap-3">
            <h3 className="text-lg font-semibold text-slate-950">{'Bi\u1ec3u \u0111\u1ed3 c\u1ed9t'}</h3>
            {loading && <span className="text-sm font-medium text-blue-700">Loading...</span>}
          </div>
          <div className="h-[320px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 12, right: 12, left: 8, bottom: 0 }}>
                <CartesianGrid stroke="#e2e8f0" vertical={false} />
                <XAxis dataKey="chargeType" tick={{ fill: '#64748b', fontSize: 12 }} axisLine={false} tickLine={false} />
                <YAxis tickFormatter={formatCompact} tick={{ fill: '#64748b', fontSize: 12 }} axisLine={false} tickLine={false} width={92} />
                <Tooltip formatter={(value: number) => formatMoney(value)} />
                <Bar dataKey="totalAmount" name="Doanh thu ghi nhan" fill="#1d4ed8" radius={[6, 6, 0, 0]} />
                <Bar dataKey="collectedAmount" name="Doanh thu da thu" fill="#0f766e" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </section>

        <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
          <h3 className="text-lg font-semibold text-slate-950">{'T\u1ef7 l\u1ec7 \u0111\u00f3ng g\u00f3p'}</h3>
          <div className="mt-4 h-[240px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={chartData} dataKey="totalAmount" nameKey="chargeType" innerRadius="58%" outerRadius="86%" paddingAngle={3}>
                  {chartData.map((entry, index) => <Cell key={entry.chargeType} fill={chartColors[index % chartColors.length]} />)}
                </Pie>
                <Tooltip formatter={(value: number) => formatMoney(value)} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-3 space-y-2">
            {report.items.slice(0, 5).map((item, index) => (
              <div key={item.chargeType} className="flex items-center justify-between gap-3 text-sm">
                <div className="flex min-w-0 items-center gap-2">
                  <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: chartColors[index % chartColors.length] }} />
                  <span className="truncate font-medium text-slate-700">{item.chargeType}</span>
                </div>
                <span className="font-semibold text-slate-950">{item.percentage}%</span>
              </div>
            ))}
          </div>
        </section>
      </div>

      <section className="rounded-lg border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-200 px-5 py-4">
          <h3 className="text-lg font-semibold text-slate-950">{'B\u1ea3ng doanh thu theo lo\u1ea1i d\u1ecbch v\u1ee5'}</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200 text-sm">
            <thead className="bg-slate-50 text-xs uppercase text-slate-500">
              <tr>
                <th className="px-5 py-3 text-left font-semibold">{'Lo\u1ea1i d\u1ecbch v\u1ee5'}</th>
                <th className="px-5 py-3 text-right font-semibold">{'Doanh thu ghi nh\u1eadn'}</th>
                <th className="px-5 py-3 text-right font-semibold">{'Doanh thu \u0111\u00e3 thu'}</th>
                <th className="px-5 py-3 text-right font-semibold">{'H\u00f3a \u0111\u01a1n'}</th>
                <th className="px-5 py-3 text-right font-semibold">{'T\u1ef7 l\u1ec7'}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {report.items.map((item, index) => (
                <tr key={item.chargeType} className="hover:bg-slate-50">
                  <td className="px-5 py-4 font-semibold text-slate-900"><span className="mr-2 inline-block h-2.5 w-2.5 rounded-full" style={{ backgroundColor: chartColors[index % chartColors.length] }} />{item.chargeType}</td>
                  <td className="px-5 py-4 text-right text-slate-700">{formatMoney(item.totalAmount)}</td>
                  <td className="px-5 py-4 text-right text-emerald-700">{formatMoney(item.collectedAmount)}</td>
                  <td className="px-5 py-4 text-right text-slate-700">{item.invoiceCount}</td>
                  <td className="px-5 py-4 text-right font-semibold text-slate-950">{item.percentage}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {!report.items.length && <div className="px-5 py-10 text-center text-sm text-slate-500">{'Kh\u00f4ng c\u00f3 d\u1eef li\u1ec7u doanh thu trong b\u1ed9 l\u1ecdc hi\u1ec7n t\u1ea1i.'}</div>}
      </section>
    </section>
  );
};

export default RevenueByServicePanel;