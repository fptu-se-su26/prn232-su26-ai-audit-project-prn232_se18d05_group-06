import React, { useEffect, useMemo, useState } from 'react';
import {
  Area,
  Bar,
  CartesianGrid,
  ComposedChart,
  Legend,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import AdminSidebar from '@components/AdminSidebar';
import api from '@lib/api';
import RevenueByServicePanel from './RevenueByServicePanel';
import PaymentReconciliationPanel from './PaymentReconciliationPanel';
import OperatingExpensePanel from './OperatingExpensePanel';
import ProfitReportPanel from './ProfitReportPanel';
import FinanceExportButtons from './FinanceExportButtons';

type RiskLevel = 'LOW' | 'MEDIUM' | 'HIGH' | string;

interface FinancialHistoryPoint {
  month: string;
  revenue: number;
  expense: number;
  profit: number;
  cashIn: number;
  cashOut: number;
  orderVolume: number;
}

interface FinancialForecastPoint {
  forecastId?: number | null;
  month: string;
  forecastRevenue: number;
  forecastExpense: number;
  forecastProfit: number;
  cashInForecast: number;
  cashOutForecast: number;
  confidenceScore: number;
  riskLevel: RiskLevel;
  trendDirection: string;
  modelVersion: string;
  insight: string;
}

interface FinancialForecastSummary {
  nextRevenue: number;
  nextExpense: number;
  nextProfit: number;
  netCashFlow: number;
  averageConfidence: number;
  overallRisk: RiskLevel;
  hasMinimumHistory: boolean;
  historyMonths: number;
  modelVersion: string;
  lastGeneratedAt?: string | null;
}

interface AiModelTrainingLog {
  trainingLogId: number;
  modelName: string;
  modelVersion: string;
  trainingDate: string;
  dataFrom?: string | null;
  dataTo?: string | null;
  accuracyScore?: number | null;
  status: string;
  errorMessage?: string | null;
  triggerType: string;
}

interface FinancialForecastDashboard {
  summary: FinancialForecastSummary;
  history: FinancialHistoryPoint[];
  forecasts: FinancialForecastPoint[];
  alerts: string[];
  trainingLogs: AiModelTrainingLog[];
}

const fallbackDashboard: FinancialForecastDashboard = {
  summary: {
    nextRevenue: 815000000,
    nextExpense: 548000000,
    nextProfit: 267000000,
    netCashFlow: 82000000,
    averageConfidence: 84.7,
    overallRisk: 'LOW',
    hasMinimumHistory: true,
    historyMonths: 6,
    modelVersion: 'FIN-TREND-LOCAL',
    lastGeneratedAt: null,
  },
  history: [
    { month: '2025-01', revenue: 650000000, expense: 421000000, profit: 229000000, cashIn: 520000000, cashOut: 438000000, orderVolume: 28 },
    { month: '2025-02', revenue: 695000000, expense: 448000000, profit: 247000000, cashIn: 562000000, cashOut: 462000000, orderVolume: 31 },
    { month: '2025-03', revenue: 712000000, expense: 468000000, profit: 244000000, cashIn: 581000000, cashOut: 489000000, orderVolume: 34 },
    { month: '2025-04', revenue: 748000000, expense: 486000000, profit: 262000000, cashIn: 604000000, cashOut: 503000000, orderVolume: 37 },
    { month: '2025-05', revenue: 771000000, expense: 502000000, profit: 269000000, cashIn: 618000000, cashOut: 522000000, orderVolume: 39 },
    { month: '2025-06', revenue: 794000000, expense: 522000000, profit: 272000000, cashIn: 639000000, cashOut: 542000000, orderVolume: 42 },
  ],
  forecasts: [
    { month: '2025-07', forecastRevenue: 815000000, forecastExpense: 548000000, forecastProfit: 267000000, cashInForecast: 652000000, cashOutForecast: 570000000, confidenceScore: 88.5, riskLevel: 'LOW', trendDirection: 'GROWTH', modelVersion: 'FIN-TREND-LOCAL', insight: 'Doanh thu du kien tang on dinh, dong tien rong van duong.' },
    { month: '2025-08', forecastRevenue: 852000000, forecastExpense: 604000000, forecastProfit: 248000000, cashInForecast: 681000000, cashOutForecast: 632000000, confidenceScore: 84, riskLevel: 'MEDIUM', trendDirection: 'MARGIN_PRESSURE', modelVersion: 'FIN-TREND-LOCAL', insight: 'Chi phi van hanh tang nhanh, can theo doi bien loi nhuan.' },
    { month: '2025-09', forecastRevenue: 894000000, forecastExpense: 628000000, forecastProfit: 266000000, cashInForecast: 718000000, cashOutForecast: 650000000, confidenceScore: 81.5, riskLevel: 'LOW', trendDirection: 'GROWTH', modelVersion: 'FIN-TREND-LOCAL', insight: 'Dong tien du kien duong neu thu hoi cong no dung han.' },
  ],
  alerts: ['Khong phat hien rui ro tai chinh nghiem trong trong 3 thang forecast.'],
  trainingLogs: [
    {
      trainingLogId: 1,
      modelName: 'AI Financial Trend Forecasting',
      modelVersion: 'FIN-TREND-LOCAL',
      trainingDate: new Date().toISOString(),
      dataFrom: '2025-01-01',
      dataTo: '2025-06-01',
      accuracyScore: 88.5,
      status: 'SUCCESS',
      triggerType: 'AUTO',
    },
  ],
};

const moneyFormatter = new Intl.NumberFormat('vi-VN', {
  maximumFractionDigits: 1,
  notation: 'compact',
});

const fullMoneyFormatter = new Intl.NumberFormat('vi-VN', {
  style: 'currency',
  currency: 'VND',
  maximumFractionDigits: 0,
});

const formatMoney = (value = 0) => `${moneyFormatter.format(value)} VND`;
const formatMonth = (month: string) => {
  const [year, value] = month.split('-');
  return `T${Number(value)}/${year}`;
};

const riskStyles: Record<string, string> = {
  LOW: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  MEDIUM: 'bg-amber-50 text-amber-700 border-amber-200',
  HIGH: 'bg-rose-50 text-rose-700 border-rose-200',
};

const riskLabels: Record<string, string> = {
  LOW: 'Thap',
  MEDIUM: 'Trung binh',
  HIGH: 'Cao',
};

const statusStyles: Record<string, string> = {
  SUCCESS: 'bg-emerald-50 text-emerald-700',
  INSUFFICIENT_DATA: 'bg-amber-50 text-amber-700',
  FAILED: 'bg-rose-50 text-rose-700',
};

const AdminFinance: React.FC = () => {
  const [dashboard, setDashboard] = useState<FinancialForecastDashboard>(fallbackDashboard);
  const [loading, setLoading] = useState(true);
  const [busyAction, setBusyAction] = useState<'generate' | 'retrain' | null>(null);
  const [forecastMonths, setForecastMonths] = useState<1 | 3 | 6>(3);
  const [notice, setNotice] = useState<string | null>(null);

  const fetchDashboard = async () => {
    try {
      setLoading(true);
      const response = await api.get<FinancialForecastDashboard>('/finance/forecasts', { params: { months: forecastMonths } });
      setDashboard(response.data);
      setNotice(null);
    } catch {
      setDashboard(fallbackDashboard);
      setNotice('Dang hien thi du lieu mau vi API forecast chua san sang.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, [forecastMonths]);

  const trendData = useMemo(() => {
    const history = dashboard.history.map((item) => ({
      month: formatMonth(item.month),
      actualRevenue: item.revenue,
      actualExpense: item.expense,
      forecastRevenue: null,
      forecastExpense: null,
      profit: item.profit,
    }));

    const forecasts = dashboard.forecasts.map((item) => ({
      month: formatMonth(item.month),
      actualRevenue: null,
      actualExpense: null,
      forecastRevenue: item.forecastRevenue,
      forecastExpense: item.forecastExpense,
      profit: item.forecastProfit,
    }));

    return [...history, ...forecasts];
  }, [dashboard]);

  const cashFlowData = useMemo(
    () =>
      dashboard.forecasts.map((item) => ({
        month: formatMonth(item.month),
        cashIn: item.cashInForecast,
        cashOut: item.cashOutForecast,
        net: item.cashInForecast - item.cashOutForecast,
      })),
    [dashboard],
  );

  const handleGenerate = async () => {
    try {
      setBusyAction('generate');
      const response = await api.post<FinancialForecastDashboard>('/finance/forecasts/generate', { months: forecastMonths });
      setDashboard(response.data);
      setNotice(`Da tao forecast ${forecastMonths} thang moi theo Moving Average.`);
    } catch {
      setNotice('Khong the tao forecast luc nay. Vui long kiem tra backend va database.');
    } finally {
      setBusyAction(null);
    }
  };

  const handleRetrain = async () => {
    try {
      setBusyAction('retrain');
      await api.post('/finance/forecasts/retrain', {});
      await fetchDashboard();
      setNotice('Da ghi nhan retrain model AI Financial Trend.');
    } catch {
      setNotice('Khong the retrain model luc nay. Vui long kiem tra backend va database.');
    } finally {
      setBusyAction(null);
    }
  };

  const handleExportCsv = () => {
    const header = ['Month', 'Revenue', 'Expense', 'Profit', 'Cash In', 'Cash Out', 'Confidence', 'Risk'];
    const rows = dashboard.forecasts.map((item) => [
      item.month,
      item.forecastRevenue,
      item.forecastExpense,
      item.forecastProfit,
      item.cashInForecast,
      item.cashOutForecast,
      item.confidenceScore,
      item.riskLevel,
    ]);
    const csv = [header, ...rows].map((row) => row.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'ai-financial-trend-forecast.csv';
    link.click();
    URL.revokeObjectURL(url);
  };

  const kpis = [
    {
      label: 'Doanh thu thang toi',
      value: formatMoney(dashboard.summary.nextRevenue),
      icon: 'trending_up',
      tone: 'text-blue-700 bg-blue-50',
      hint: `Confidence ${dashboard.summary.averageConfidence}%`,
    },
    {
      label: 'Chi phi du bao',
      value: formatMoney(dashboard.summary.nextExpense),
      icon: 'account_balance_wallet',
      tone: 'text-slate-700 bg-slate-100',
      hint: 'Operational cost forecast',
    },
    {
      label: 'Loi nhuan du kien',
      value: formatMoney(dashboard.summary.nextProfit),
      icon: 'monitoring',
      tone: dashboard.summary.nextProfit >= 0 ? 'text-emerald-700 bg-emerald-50' : 'text-rose-700 bg-rose-50',
      hint: 'Revenue minus expense',
    },
    {
      label: 'Dong tien rong',
      value: formatMoney(dashboard.summary.netCashFlow),
      icon: 'swap_vert',
      tone: dashboard.summary.netCashFlow >= 0 ? 'text-emerald-700 bg-emerald-50' : 'text-rose-700 bg-rose-50',
      hint: `Risk ${riskLabels[dashboard.summary.overallRisk] ?? dashboard.summary.overallRisk}`,
    },
  ];

  return (
    <div className="min-h-screen bg-[#f5f7fb] text-slate-900 antialiased">
      <AdminSidebar />

      <main className="min-h-screen md:ml-[280px]">
        <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/95 px-4 py-4 shadow-sm md:px-8">
          <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
            <div>
              <div className="flex flex-wrap items-center gap-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
                <span>M4 Finance & Reconciliation</span>
                <span className="h-1 w-1 rounded-full bg-slate-300" />
                <span>Admin</span>
              </div>
              <h1 className="mt-1 text-2xl font-semibold tracking-normal text-slate-950 md:text-3xl">
                Finance Reports
              </h1>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <div className="inline-flex h-10 rounded-lg border border-slate-300 bg-slate-50 p-1">
                {([1, 3, 6] as const).map((months) => (
                  <button
                    key={months}
                    type="button"
                    onClick={() => setForecastMonths(months)}
                    className={`rounded-md px-3 text-sm font-semibold transition ${forecastMonths === months ? 'bg-blue-700 text-white shadow-sm' : 'text-slate-600 hover:bg-white'}`}
                  >
                    {months}M
                  </button>
                ))}
              </div>
              <button
                type="button"
                onClick={handleExportCsv}
                className="inline-flex h-10 items-center gap-2 rounded-lg border border-slate-300 bg-white px-3 text-sm font-medium text-slate-700 shadow-sm transition hover:bg-slate-50"
              >
                <span className="material-symbols-outlined text-[18px]">download</span>
                Export
              </button>
              <FinanceExportButtons reportType="financial-forecast" compact />
              <button
                type="button"
                onClick={handleRetrain}
                disabled={busyAction !== null}
                className="inline-flex h-10 items-center gap-2 rounded-lg border border-slate-300 bg-white px-3 text-sm font-medium text-slate-700 shadow-sm transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
              >
                <span className="material-symbols-outlined text-[18px]">model_training</span>
                {busyAction === 'retrain' ? 'Retraining...' : 'Retrain'}
              </button>
              <button
                type="button"
                onClick={handleGenerate}
                disabled={busyAction !== null}
                className="inline-flex h-10 items-center gap-2 rounded-lg bg-blue-700 px-4 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-800 disabled:cursor-not-allowed disabled:opacity-60"
              >
                <span className="material-symbols-outlined text-[18px]">auto_awesome</span>
                {busyAction === 'generate' ? 'Generating...' : `Generate ${forecastMonths}M Forecast`}
              </button>
            </div>
          </div>
        </header>

        <section className="space-y-5 p-4 md:p-8">
          <PaymentReconciliationPanel />
          <RevenueByServicePanel />
          <OperatingExpensePanel />
          <ProfitReportPanel />
          {notice && (
            <div className="flex items-center gap-3 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
              <span className="material-symbols-outlined text-[20px]">info</span>
              <span>{notice}</span>
            </div>
          )}

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
            {kpis.map((item) => (
              <article key={item.label} className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-medium text-slate-500">{item.label}</p>
                    <p className="mt-2 text-2xl font-semibold tracking-normal text-slate-950">{item.value}</p>
                  </div>
                  <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${item.tone}`}>
                    <span className="material-symbols-outlined text-[22px]">{item.icon}</span>
                  </div>
                </div>
                <p className="mt-4 text-sm text-slate-500">{item.hint}</p>
              </article>
            ))}
          </div>

          <div className="grid grid-cols-1 gap-5 xl:grid-cols-[minmax(0,2fr)_minmax(360px,1fr)]">
            <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
              <div className="mb-4 flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                <div>
                  <h2 className="text-lg font-semibold text-slate-950">Revenue, Cost & Forecast</h2>
                  <p className="mt-1 text-sm text-slate-500">6 thang lich su va forecast Moving Average theo so thang dang chon.</p>
                </div>
                <div className="flex flex-wrap gap-2 text-xs font-medium">
                  <span className="rounded-md bg-blue-50 px-2 py-1 text-blue-700">Actual</span>
                  <span className="rounded-md bg-indigo-50 px-2 py-1 text-indigo-700">Forecast</span>
                  <span className="rounded-md bg-emerald-50 px-2 py-1 text-emerald-700">Moving Average</span>
                  <span className="rounded-md bg-slate-100 px-2 py-1 text-slate-700">{dashboard.summary.modelVersion}</span>
                </div>
              </div>

              <div className="h-[360px]">
                <ResponsiveContainer width="100%" height="100%">
                  <ComposedChart data={trendData} margin={{ top: 16, right: 16, left: 8, bottom: 0 }}>
                    <CartesianGrid stroke="#e2e8f0" vertical={false} />
                    <XAxis dataKey="month" tick={{ fill: '#64748b', fontSize: 12 }} axisLine={false} tickLine={false} />
                    <YAxis tickFormatter={formatMoney} tick={{ fill: '#64748b', fontSize: 12 }} axisLine={false} tickLine={false} width={92} />
                    <Tooltip formatter={(value: number) => fullMoneyFormatter.format(value)} />
                    <Legend />
                    <Area type="monotone" dataKey="profit" name="Profit" fill="#dcfce7" stroke="#16a34a" strokeWidth={2} />
                    <Line type="monotone" dataKey="actualRevenue" name="Actual Revenue" stroke="#1d4ed8" strokeWidth={3} dot={{ r: 3 }} connectNulls={false} />
                    <Line type="monotone" dataKey="actualExpense" name="Actual Expense" stroke="#64748b" strokeWidth={2} dot={false} connectNulls={false} />
                    <Line type="monotone" dataKey="forecastRevenue" name="Forecast Revenue" stroke="#4f46e5" strokeWidth={3} strokeDasharray="6 4" dot={{ r: 3 }} connectNulls={false} />
                    <Line type="monotone" dataKey="forecastExpense" name="Forecast Expense" stroke="#f59e0b" strokeWidth={2} strokeDasharray="6 4" dot={false} connectNulls={false} />
                  </ComposedChart>
                </ResponsiveContainer>
              </div>
            </section>

            <aside className="space-y-5">
              <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-semibold text-slate-950">AI Readiness</h2>
                  <span className={`rounded-full border px-3 py-1 text-xs font-semibold ${riskStyles[dashboard.summary.overallRisk] ?? riskStyles.MEDIUM}`}>
                    Risk {riskLabels[dashboard.summary.overallRisk] ?? dashboard.summary.overallRisk}
                  </span>
                </div>
                <div className="mt-5 grid grid-cols-2 gap-3">
                  <div className="rounded-lg bg-slate-50 p-4">
                    <p className="text-sm text-slate-500">History window</p>
                    <p className="mt-1 text-xl font-semibold text-slate-950">{dashboard.summary.historyMonths}/6</p>
                  </div>
                  <div className="rounded-lg bg-slate-50 p-4">
                    <p className="text-sm text-slate-500">Confidence</p>
                    <p className="mt-1 text-xl font-semibold text-slate-950">{dashboard.summary.averageConfidence}%</p>
                  </div>
                </div>
                <div className="mt-4 rounded-lg border border-slate-200 p-4">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium text-slate-700">Minimum data</span>
                    <span className={dashboard.summary.hasMinimumHistory ? 'text-emerald-700' : 'text-amber-700'}>
                      {dashboard.summary.hasMinimumHistory ? 'Ready' : 'Need more data'}
                    </span>
                  </div>
                  <div className="mt-3 h-2 rounded-full bg-slate-100">
                    <div
                      className="h-2 rounded-full bg-blue-700"
                      style={{ width: `${Math.min(100, (dashboard.summary.historyMonths / 6) * 100)}%` }}
                    />
                  </div>
                </div>
              </section>

              <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
                <h2 className="text-lg font-semibold text-slate-950">Cash Flow Forecast</h2>
                <div className="mt-4 h-[220px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <ComposedChart data={cashFlowData} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                      <CartesianGrid stroke="#e2e8f0" vertical={false} />
                      <XAxis dataKey="month" tick={{ fill: '#64748b', fontSize: 12 }} axisLine={false} tickLine={false} />
                      <YAxis hide />
                      <Tooltip formatter={(value: number) => fullMoneyFormatter.format(value)} />
                      <Bar dataKey="cashIn" name="Cash In" fill="#2563eb" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="cashOut" name="Cash Out" fill="#94a3b8" radius={[4, 4, 0, 0]} />
                      <Line type="monotone" dataKey="net" name="Net" stroke="#16a34a" strokeWidth={2} dot={{ r: 3 }} />
                    </ComposedChart>
                  </ResponsiveContainer>
                </div>
              </section>
            </aside>
          </div>

          <div className="grid grid-cols-1 gap-5 xl:grid-cols-[minmax(0,1.45fr)_minmax(360px,1fr)]">
            <section className="rounded-lg border border-slate-200 bg-white shadow-sm">
              <div className="border-b border-slate-200 px-5 py-4">
                <h2 className="text-lg font-semibold text-slate-950">{forecastMonths}-Month Forecast Plan</h2>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-slate-200 text-sm">
                  <thead className="bg-slate-50 text-xs uppercase text-slate-500">
                    <tr>
                      <th className="px-5 py-3 text-left font-semibold">Month</th>
                      <th className="px-5 py-3 text-right font-semibold">Revenue</th>
                      <th className="px-5 py-3 text-right font-semibold">Expense</th>
                      <th className="px-5 py-3 text-right font-semibold">Profit</th>
                      <th className="px-5 py-3 text-left font-semibold">Confidence</th>
                      <th className="px-5 py-3 text-left font-semibold">Risk</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 bg-white">
                    {dashboard.forecasts.map((item) => (
                      <tr key={item.month} className="hover:bg-slate-50">
                        <td className="px-5 py-4 font-semibold text-slate-900">{formatMonth(item.month)}</td>
                        <td className="px-5 py-4 text-right text-slate-700">{formatMoney(item.forecastRevenue)}</td>
                        <td className="px-5 py-4 text-right text-slate-700">{formatMoney(item.forecastExpense)}</td>
                        <td className="px-5 py-4 text-right font-semibold text-slate-900">{formatMoney(item.forecastProfit)}</td>
                        <td className="px-5 py-4">
                          <div className="flex min-w-[120px] items-center gap-2">
                            <div className="h-2 flex-1 rounded-full bg-slate-100">
                              <div className="h-2 rounded-full bg-blue-700" style={{ width: `${item.confidenceScore}%` }} />
                            </div>
                            <span className="text-xs font-semibold text-slate-600">{item.confidenceScore}%</span>
                          </div>
                        </td>
                        <td className="px-5 py-4">
                          <span className={`rounded-full border px-2.5 py-1 text-xs font-semibold ${riskStyles[item.riskLevel] ?? riskStyles.MEDIUM}`}>
                            {riskLabels[item.riskLevel] ?? item.riskLevel}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>

            <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
              <h2 className="text-lg font-semibold text-slate-950">AI Insights & Model Logs</h2>
              <div className="mt-4 space-y-3">
                {dashboard.forecasts.slice(0, 2).map((item) => (
                  <div key={item.month} className="rounded-lg border border-slate-200 p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-sm font-semibold text-slate-950">{formatMonth(item.month)}</p>
                        <p className="mt-1 text-sm text-slate-600">{item.insight || 'AI dang theo doi bien dong doanh thu va chi phi.'}</p>
                      </div>
                      <span className="material-symbols-outlined text-[20px] text-blue-700">psychology</span>
                    </div>
                  </div>
                ))}
                {dashboard.alerts.map((alert) => (
                  <div key={alert} className="flex gap-3 rounded-lg bg-slate-50 p-4 text-sm text-slate-700">
                    <span className="material-symbols-outlined text-[20px] text-amber-600">warning</span>
                    <span>{alert}</span>
                  </div>
                ))}
              </div>

              <div className="mt-5 border-t border-slate-200 pt-4">
                <h3 className="text-sm font-semibold uppercase text-slate-500">Training history</h3>
                <div className="mt-3 space-y-3">
                  {dashboard.trainingLogs.map((log) => (
                    <div key={log.trainingLogId} className="flex items-center justify-between gap-3 rounded-lg border border-slate-200 px-3 py-3">
                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold text-slate-900">{log.modelVersion}</p>
                        <p className="text-xs text-slate-500">
                          {log.triggerType} / {new Date(log.trainingDate).toLocaleDateString('vi-VN')}
                        </p>
                      </div>
                      <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${statusStyles[log.status] ?? 'bg-slate-100 text-slate-700'}`}>
                        {log.accuracyScore ? `${log.accuracyScore}%` : log.status}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </section>
          </div>

          {loading && (
            <div className="fixed bottom-5 right-5 rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-700 shadow-lg">
              Loading financial trend data...
            </div>
          )}
        </section>
      </main>
    </div>
  );
};

export default AdminFinance;
