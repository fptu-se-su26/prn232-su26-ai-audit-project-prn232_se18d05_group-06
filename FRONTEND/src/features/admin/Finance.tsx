import React, { useEffect, useMemo, useState } from 'react';
import {
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
import InvoicePanel from './InvoicePanel';

type RiskLevel = 'LOW' | 'MEDIUM' | 'HIGH' | string;
type FinanceTab = 'overview' | 'revenue' | 'expenses' | 'profit' | 'reconciliation' | 'forecast' | 'exports' | 'invoices';

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

interface ReconciliationSummary {
  total: number;
  matched: number;
  partial: number;
  unmatched: number;
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
    { trainingLogId: 1, modelName: 'AI Financial Trend Forecasting', modelVersion: 'FIN-TREND-LOCAL', trainingDate: new Date().toISOString(), dataFrom: '2025-01-01', dataTo: '2025-06-01', accuracyScore: 88.5, status: 'SUCCESS', triggerType: 'AUTO' },
  ],
};

const financeTabs: Array<{ key: FinanceTab; label: string; icon: string; description: string }> = [
  { key: 'overview', label: 'Overview', icon: 'space_dashboard', description: 'Tinh hinh tai chinh tong quan' },
  { key: 'revenue', label: 'Revenue', icon: 'trending_up', description: 'Doanh thu theo dich vu' },
  { key: 'expenses', label: 'Expenses', icon: 'receipt_long', description: 'Chi phi van hanh' },
  { key: 'profit', label: 'Profit', icon: 'monitoring', description: 'Loi nhuan theo ky' },
  { key: 'reconciliation', label: 'Reconciliation', icon: 'rule_settings', description: 'Doi soat thanh toan' },
  { key: 'forecast', label: 'Forecast', icon: 'auto_graph', description: 'Du bao tai chinh AI' },
  { key: 'exports', label: 'Exports', icon: 'file_download', description: 'Xuat Excel/PDF' },
  { key: 'invoices', label: 'Invoices', icon: 'description', description: 'Quan ly hoa don thanh toan' },
];

const exportReportOptions = [
  { value: 'revenue-by-service', label: 'Revenue by Service' },
  { value: 'operating-expenses', label: 'Operating Expenses' },
  { value: 'profit', label: 'Profit Report' },
  { value: 'payment-reconciliation', label: 'Payment Reconciliation' },
  { value: 'financial-forecast', label: 'Financial Forecast' },
];

const moneyFormatter = new Intl.NumberFormat('vi-VN', { maximumFractionDigits: 1, notation: 'compact' });
const fullMoneyFormatter = new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND', maximumFractionDigits: 0 });
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

const riskLabels: Record<string, string> = { LOW: 'Thap', MEDIUM: 'Trung binh', HIGH: 'Cao' };
const statusStyles: Record<string, string> = { SUCCESS: 'bg-emerald-50 text-emerald-700', INSUFFICIENT_DATA: 'bg-amber-50 text-amber-700', FAILED: 'bg-rose-50 text-rose-700' };

const AdminFinance: React.FC<{ defaultTab?: FinanceTab }> = ({ defaultTab }) => {
  const [dashboard, setDashboard] = useState<FinancialForecastDashboard>(fallbackDashboard);
  const [reconciliation, setReconciliation] = useState<ReconciliationSummary>({ total: 0, matched: 0, partial: 0, unmatched: 0 });
  const [loading, setLoading] = useState(true);
  const [busyAction, setBusyAction] = useState<'generate' | 'retrain' | null>(null);
  const [forecastMonths, setForecastMonths] = useState<1 | 3 | 6>(3);
  const [activeTab, setActiveTab] = useState<FinanceTab>(defaultTab || 'overview');
  const [notice, setNotice] = useState<string | null>(null);
  const [exportReportType, setExportReportType] = useState('revenue-by-service');
  const [exportFromDate, setExportFromDate] = useState('2025-05-01');
  const [exportToDate, setExportToDate] = useState('2025-06-30');
  const [exportStatus, setExportStatus] = useState('ALL');
  const [exportPeriod, setExportPeriod] = useState('month');

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

  useEffect(() => {
    const loadReconciliationSummary = async () => {
      try {
        const response = await api.get<ReconciliationSummary>('/finance/reconciliations', { params: { status: 'ALL' } });
        setReconciliation({ total: response.data.total || 0, matched: response.data.matched || 0, partial: response.data.partial || 0, unmatched: response.data.unmatched || 0 });
      } catch {
        setReconciliation({ total: 3, matched: 2, partial: 0, unmatched: 1 });
      }
    };

    loadReconciliationSummary();
  }, []);

  const selectedHistory = useMemo(
    () => dashboard.history.slice(-Math.min(forecastMonths, dashboard.history.length || forecastMonths)),
    [dashboard.history, forecastMonths],
  );

  const overviewTotals = useMemo(() => {
    const totals = selectedHistory.reduce(
      (acc, item) => ({ revenue: acc.revenue + item.revenue, expense: acc.expense + item.expense, profit: acc.profit + item.profit }),
      { revenue: 0, expense: 0, profit: 0 },
    );
    const margin = totals.revenue === 0 ? 0 : Math.round((totals.profit / totals.revenue) * 1000) / 10;
    return { ...totals, margin };
  }, [selectedHistory]);

  const trendData = useMemo(() => {
    const history = dashboard.history.map((item) => ({ month: formatMonth(item.month), actualRevenue: item.revenue, actualExpense: item.expense, forecastRevenue: null, forecastExpense: null, profit: item.profit }));
    const forecasts = dashboard.forecasts.map((item) => ({ month: formatMonth(item.month), actualRevenue: null, actualExpense: null, forecastRevenue: item.forecastRevenue, forecastExpense: item.forecastExpense, profit: item.forecastProfit }));
    return [...history, ...forecasts];
  }, [dashboard]);

  const overviewTrendData = useMemo(
    () => selectedHistory.map((item) => ({ month: formatMonth(item.month), revenue: item.revenue, expense: item.expense, profit: item.profit })),
    [selectedHistory],
  );

  const cashFlowData = useMemo(
    () => dashboard.forecasts.map((item) => ({ month: formatMonth(item.month), cashIn: item.cashInForecast, cashOut: item.cashOutForecast, net: item.cashInForecast - item.cashOutForecast })),
    [dashboard],
  );

  const reconciliationChartData = useMemo(
    () => [
      { label: 'Da khop', value: reconciliation.matched, fill: '#059669' },
      { label: 'Mot phan', value: reconciliation.partial, fill: '#d97706' },
      { label: 'Chua khop', value: reconciliation.unmatched, fill: '#dc2626' },
    ],
    [reconciliation],
  );

  const matchRate = reconciliation.total === 0 ? 0 : Math.round((reconciliation.matched / reconciliation.total) * 100);

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
    const rows = dashboard.forecasts.map((item) => [item.month, item.forecastRevenue, item.forecastExpense, item.forecastProfit, item.cashInForecast, item.cashOutForecast, item.confidenceScore, item.riskLevel]);
    const csv = [header, ...rows].map((row) => row.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'ai-financial-trend-forecast.csv';
    link.click();
    URL.revokeObjectURL(url);
  };

  const forecastKpis = [
    { label: 'Doanh thu thang toi', value: formatMoney(dashboard.summary.nextRevenue), icon: 'trending_up', tone: 'text-blue-700 bg-blue-50', hint: `Confidence ${dashboard.summary.averageConfidence}%` },
    { label: 'Chi phi du bao', value: formatMoney(dashboard.summary.nextExpense), icon: 'account_balance_wallet', tone: 'text-slate-700 bg-slate-100', hint: 'Operational cost forecast' },
    { label: 'Loi nhuan du kien', value: formatMoney(dashboard.summary.nextProfit), icon: 'monitoring', tone: dashboard.summary.nextProfit >= 0 ? 'text-emerald-700 bg-emerald-50' : 'text-rose-700 bg-rose-50', hint: 'Revenue minus expense' },
    { label: 'Dong tien rong', value: formatMoney(dashboard.summary.netCashFlow), icon: 'swap_vert', tone: dashboard.summary.netCashFlow >= 0 ? 'text-emerald-700 bg-emerald-50' : 'text-rose-700 bg-rose-50', hint: `Risk ${riskLabels[dashboard.summary.overallRisk] ?? dashboard.summary.overallRisk}` },
  ];

  const overviewCards = [
    { label: 'Tong doanh thu', value: formatMoney(overviewTotals.revenue), hint: `${forecastMonths} thang gan nhat`, icon: 'trending_up', tone: 'bg-blue-50 text-blue-700' },
    { label: 'Tong chi phi', value: formatMoney(overviewTotals.expense), hint: 'Chi phi van hanh', icon: 'receipt_long', tone: 'bg-amber-50 text-amber-700' },
    { label: 'Loi nhuan', value: formatMoney(overviewTotals.profit), hint: `${overviewTotals.margin}% margin`, icon: 'monitoring', tone: overviewTotals.profit >= 0 ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700' },
    { label: 'Ty le doi soat', value: `${matchRate}%`, hint: `${reconciliation.matched}/${reconciliation.total} giao dich`, icon: 'rule_settings', tone: 'bg-indigo-50 text-indigo-700' },
    { label: 'Du bao thang toi', value: formatMoney(dashboard.summary.nextProfit), hint: `Risk ${riskLabels[dashboard.summary.overallRisk] ?? dashboard.summary.overallRisk}`, icon: 'auto_graph', tone: 'bg-cyan-50 text-cyan-700' },
    { label: 'Net cash flow', value: formatMoney(dashboard.summary.netCashFlow), hint: dashboard.summary.modelVersion, icon: 'swap_vert', tone: 'bg-slate-100 text-slate-700' },
  ];

  const renderOverview = () => (
    <section className="space-y-5">
      <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-blue-700">Finance Overview</p>
            <h2 className="mt-1 text-xl font-semibold text-slate-950">Tong quan tai chinh</h2>
            <p className="mt-1 max-w-2xl text-sm text-slate-500">Nam nhanh doanh thu, chi phi, loi nhuan, doi soat va forecast truoc khi di vao bao cao chi tiet.</p>
          </div>
          <button type="button" onClick={() => setActiveTab('exports')} className="inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-slate-300 bg-white px-4 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50">
            <span className="material-symbols-outlined text-[18px]">file_download</span>
            Export reports
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
        {overviewCards.map((card) => (
          <article key={card.label} className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-lg">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="text-sm font-medium text-slate-500">{card.label}</p>
                <p className="mt-2 truncate text-2xl font-semibold tracking-normal text-slate-950">{card.value}</p>
              </div>
              <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${card.tone}`}>
                <span className="material-symbols-outlined text-[22px]">{card.icon}</span>
              </div>
            </div>
            <p className="mt-4 text-sm text-slate-500">{card.hint}</p>
          </article>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-5 xl:grid-cols-[minmax(0,1.55fr)_minmax(340px,0.85fr)]">
        <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
          <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
            <div>
              <h3 className="text-lg font-semibold text-slate-950">Revenue vs Expense vs Profit</h3>
              <p className="mt-1 text-sm text-slate-500">Xu huong tai chinh trong khoang thoi gian dang chon.</p>
            </div>
            <span className="rounded-lg bg-blue-50 px-3 py-2 text-sm font-semibold text-blue-700">{forecastMonths}M view</span>
          </div>
          <div className="h-[320px]">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={overviewTrendData} margin={{ top: 12, right: 12, left: 8, bottom: 0 }}>
                <CartesianGrid stroke="#e2e8f0" vertical={false} />
                <XAxis dataKey="month" tick={{ fill: '#64748b', fontSize: 12 }} axisLine={false} tickLine={false} />
                <YAxis tickFormatter={formatMoney} tick={{ fill: '#64748b', fontSize: 12 }} axisLine={false} tickLine={false} width={92} />
                <Tooltip formatter={(value: number) => fullMoneyFormatter.format(value)} />
                <Legend />
                <Bar dataKey="revenue" name="Revenue" fill="#2563eb" radius={[6, 6, 0, 0]} />
                <Bar dataKey="expense" name="Expense" fill="#f59e0b" radius={[6, 6, 0, 0]} />
                <Line type="monotone" dataKey="profit" name="Profit" stroke="#059669" strokeWidth={3} dot={{ r: 3 }} />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </section>

        <aside className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h3 className="text-lg font-semibold text-slate-950">Payment match status</h3>
              <p className="mt-1 text-sm text-slate-500">Tinh trang doi soat can theo doi.</p>
            </div>
            <span className="rounded-lg bg-indigo-50 px-3 py-2 text-right text-sm font-semibold text-indigo-700">{matchRate}%</span>
          </div>
          <div className="mt-5 space-y-4">
            {reconciliationChartData.map((item) => {
              const percent = reconciliation.total === 0 ? 0 : Math.round((item.value / reconciliation.total) * 100);
              return (
                <div key={item.label}>
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-semibold text-slate-700">{item.label}</span>
                    <span className="text-slate-500">{item.value} giao dich</span>
                  </div>
                  <div className="mt-2 h-2 rounded-full bg-slate-100">
                    <div className="h-2 rounded-full" style={{ width: `${percent}%`, backgroundColor: item.fill }} />
                  </div>
                </div>
              );
            })}
          </div>
          <button type="button" onClick={() => setActiveTab('reconciliation')} className="mt-6 inline-flex h-10 w-full items-center justify-center gap-2 rounded-lg bg-blue-700 px-4 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-800">
            Xu ly doi soat
            <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
          </button>
        </aside>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-6">
        {financeTabs.filter((tab) => tab.key !== 'overview').map((tab) => (
          <button key={tab.key} type="button" onClick={() => setActiveTab(tab.key)} className="rounded-lg border border-slate-200 bg-white p-4 text-left shadow-sm transition hover:-translate-y-0.5 hover:border-blue-200 hover:shadow-lg">
            <span className="material-symbols-outlined text-[22px] text-blue-700">{tab.icon}</span>
            <p className="mt-3 text-sm font-semibold text-slate-950">{tab.label}</p>
            <p className="mt-1 text-xs text-slate-500">{tab.description}</p>
          </button>
        ))}
      </div>
    </section>
  );

  const renderForecast = () => (
    <section className="space-y-5">
      <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-blue-700">Finance / Financial Forecast</p>
            <h2 className="mt-1 text-xl font-semibold text-slate-950">Du bao tai chinh</h2>
            <p className="mt-1 max-w-2xl text-sm text-slate-500">Moving Average, risk level, AI insight va lich su retrain duoc dat rieng trong tab Forecast.</p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <div className="inline-flex h-10 rounded-lg border border-slate-300 bg-slate-50 p-1">
              {([1, 3, 6] as const).map((months) => (
                <button key={months} type="button" onClick={() => setForecastMonths(months)} className={`rounded-md px-3 text-sm font-semibold transition ${forecastMonths === months ? 'bg-blue-700 text-white shadow-sm' : 'text-slate-600 hover:bg-white'}`}>
                  {months}M
                </button>
              ))}
            </div>
            <button type="button" onClick={handleExportCsv} className="inline-flex h-10 items-center gap-2 rounded-lg border border-slate-300 bg-white px-3 text-sm font-medium text-slate-700 shadow-sm transition hover:bg-slate-50">
              <span className="material-symbols-outlined text-[18px]">download</span>
              CSV
            </button>
            <FinanceExportButtons reportType="financial-forecast" compact />
            <button type="button" onClick={handleRetrain} disabled={busyAction !== null} className="inline-flex h-10 items-center gap-2 rounded-lg border border-slate-300 bg-white px-3 text-sm font-medium text-slate-700 shadow-sm transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60">
              <span className="material-symbols-outlined text-[18px]">model_training</span>
              {busyAction === 'retrain' ? 'Retraining...' : 'Retrain'}
            </button>
            <button type="button" onClick={handleGenerate} disabled={busyAction !== null} className="inline-flex h-10 items-center gap-2 rounded-lg bg-blue-700 px-4 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-800 disabled:cursor-not-allowed disabled:opacity-60">
              <span className="material-symbols-outlined text-[18px]">auto_awesome</span>
              {busyAction === 'generate' ? 'Generating...' : `Generate ${forecastMonths}M Forecast`}
            </button>
          </div>
        </div>
      </div>

      {notice && (
        <div className="flex items-center gap-3 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          <span className="material-symbols-outlined text-[20px]">info</span>
          <span>{notice}</span>
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        {forecastKpis.map((item) => (
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
              <p className="mt-1 text-sm text-slate-500">Actual vs forecast theo Moving Average.</p>
            </div>
            <div className="flex flex-wrap gap-2 text-xs font-medium">
              <span className="rounded-md bg-blue-50 px-2 py-1 text-blue-700">Actual</span>
              <span className="rounded-md bg-indigo-50 px-2 py-1 text-indigo-700">Forecast</span>
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
                <Line type="monotone" dataKey="actualRevenue" name="Actual Revenue" stroke="#1d4ed8" strokeWidth={3} dot={{ r: 3 }} connectNulls={false} />
                <Line type="monotone" dataKey="actualExpense" name="Actual Expense" stroke="#64748b" strokeWidth={2} dot={false} connectNulls={false} />
                <Line type="monotone" dataKey="forecastRevenue" name="Forecast Revenue" stroke="#4f46e5" strokeWidth={3} strokeDasharray="6 4" dot={{ r: 3 }} connectNulls={false} />
                <Line type="monotone" dataKey="forecastExpense" name="Forecast Expense" stroke="#f59e0b" strokeWidth={2} strokeDasharray="6 4" dot={false} connectNulls={false} />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </section>

        <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-950">Cash Flow Forecast</h2>
          <p className="mt-1 text-sm text-slate-500">Dong tien vao, ra va net cash flow.</p>
          <div className="mt-4 h-[300px]">
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
      </div>

      <div className="grid grid-cols-1 gap-5 xl:grid-cols-[minmax(0,1.35fr)_minmax(360px,0.95fr)]">
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
                        <div className="h-2 flex-1 rounded-full bg-slate-100"><div className="h-2 rounded-full bg-blue-700" style={{ width: `${item.confidenceScore}%` }} /></div>
                        <span className="text-xs font-semibold text-slate-600">{item.confidenceScore}%</span>
                      </div>
                    </td>
                    <td className="px-5 py-4"><span className={`rounded-full border px-2.5 py-1 text-xs font-semibold ${riskStyles[item.riskLevel] ?? riskStyles.MEDIUM}`}>{riskLabels[item.riskLevel] ?? item.riskLevel}</span></td>
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
                    <p className="text-xs text-slate-500">{log.triggerType} / {new Date(log.trainingDate).toLocaleDateString('vi-VN')}</p>
                  </div>
                  <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${statusStyles[log.status] ?? 'bg-slate-100 text-slate-700'}`}>{log.accuracyScore ? `${log.accuracyScore}%` : log.status}</span>
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>
    </section>
  );

  const renderExports = () => (
    <section className="space-y-5">
      <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
        <p className="text-xs font-semibold uppercase tracking-wide text-blue-700">Finance / Exports</p>
        <h2 className="mt-1 text-xl font-semibold text-slate-950">Xuat bao cao tai chinh</h2>
        <p className="mt-1 max-w-2xl text-sm text-slate-500">Chon loai bao cao, khoang thoi gian va dinh dang de xuat Excel/PDF dung pham vi.</p>
      </div>

      <div className="grid grid-cols-1 gap-5 xl:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
        <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <label className="space-y-2 md:col-span-2">
              <span className="text-sm font-semibold text-slate-700">Loai bao cao</span>
              <select value={exportReportType} onChange={(event) => setExportReportType(event.target.value)} className="h-11 w-full rounded-lg border border-slate-300 bg-white px-3 text-sm text-slate-900 outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100">
                {exportReportOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
              </select>
            </label>
            <label className="space-y-2">
              <span className="text-sm font-semibold text-slate-700">Tu ngay</span>
              <input type="date" value={exportFromDate} onChange={(event) => setExportFromDate(event.target.value)} className="h-11 w-full rounded-lg border border-slate-300 bg-white px-3 text-sm text-slate-900 outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100" />
            </label>
            <label className="space-y-2">
              <span className="text-sm font-semibold text-slate-700">Den ngay</span>
              <input type="date" value={exportToDate} onChange={(event) => setExportToDate(event.target.value)} className="h-11 w-full rounded-lg border border-slate-300 bg-white px-3 text-sm text-slate-900 outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100" />
            </label>
            <label className="space-y-2">
              <span className="text-sm font-semibold text-slate-700">Trang thai</span>
              <select value={exportStatus} onChange={(event) => setExportStatus(event.target.value)} className="h-11 w-full rounded-lg border border-slate-300 bg-white px-3 text-sm text-slate-900 outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100">
                <option value="ALL">Tat ca</option>
                <option value="PAID">PAID</option>
                <option value="PENDING">PENDING</option>
                <option value="PARTIAL">PARTIAL</option>
                <option value="MATCHED">MATCHED</option>
                <option value="UNMATCHED">UNMATCHED</option>
              </select>
            </label>
            <label className="space-y-2">
              <span className="text-sm font-semibold text-slate-700">Period</span>
              <select value={exportPeriod} onChange={(event) => setExportPeriod(event.target.value)} className="h-11 w-full rounded-lg border border-slate-300 bg-white px-3 text-sm text-slate-900 outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100">
                <option value="day">Day</option>
                <option value="month">Month</option>
                <option value="quarter">Quarter</option>
                <option value="year">Year</option>
              </select>
            </label>
          </div>

          <div className="mt-5 border-t border-slate-200 pt-5">
            <FinanceExportButtons reportType={exportReportType} fromDate={exportFromDate} toDate={exportToDate} status={exportStatus} period={exportPeriod} />
          </div>
        </section>

        <aside className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
          <h3 className="text-lg font-semibold text-slate-950">Export scope</h3>
          <div className="mt-4 space-y-3">
            {exportReportOptions.map((option) => (
              <button key={option.value} type="button" onClick={() => setExportReportType(option.value)} className={`flex w-full items-center justify-between rounded-lg border px-4 py-3 text-left transition ${exportReportType === option.value ? 'border-blue-300 bg-blue-50 text-blue-700' : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'}`}>
                <span className="text-sm font-semibold">{option.label}</span>
                <span className="material-symbols-outlined text-[18px]">{exportReportType === option.value ? 'check_circle' : 'radio_button_unchecked'}</span>
              </button>
            ))}
          </div>
        </aside>
      </div>
    </section>
  );

  const renderActiveTab = () => {
    switch (activeTab) {
      case 'overview':
        return renderOverview();
      case 'revenue':
        return <RevenueByServicePanel />;
      case 'expenses':
        return <OperatingExpensePanel />;
      case 'profit':
        return <ProfitReportPanel />;
      case 'reconciliation':
        return <PaymentReconciliationPanel />;
      case 'forecast':
        return renderForecast();
      case 'exports':
        return renderExports();
      case 'invoices':
        return <InvoicePanel />;
      default:
        return renderOverview();
    }
  };

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
              <h1 className="mt-1 text-2xl font-semibold tracking-normal text-slate-950 md:text-3xl">Finance Reports</h1>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <span className="text-sm font-semibold text-slate-500">Date range</span>
              <div className="inline-flex h-10 rounded-lg border border-slate-300 bg-slate-50 p-1">
                {([1, 3, 6] as const).map((months) => (
                  <button key={months} type="button" onClick={() => setForecastMonths(months)} className={`rounded-md px-3 text-sm font-semibold transition ${forecastMonths === months ? 'bg-blue-700 text-white shadow-sm' : 'text-slate-600 hover:bg-white'}`}>
                    {months}M
                  </button>
                ))}
              </div>
            </div>
          </div>

          <nav className="mt-4 flex gap-2 overflow-x-auto pb-1" aria-label="Finance report sections">
            {financeTabs.map((tab) => {
              const active = activeTab === tab.key;
              return (
                <button key={tab.key} type="button" onClick={() => setActiveTab(tab.key)} className={`inline-flex h-10 shrink-0 items-center gap-2 rounded-lg px-3 text-sm font-semibold transition ${active ? 'bg-blue-700 text-white shadow-sm' : 'bg-slate-50 text-slate-600 hover:bg-slate-100 hover:text-slate-900'}`}>
                  <span className="material-symbols-outlined text-[18px]">{tab.icon}</span>
                  {tab.label}
                </button>
              );
            })}
          </nav>
        </header>

        <section className="p-4 md:p-8">
          {renderActiveTab()}
          {loading && activeTab === 'forecast' && (
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
