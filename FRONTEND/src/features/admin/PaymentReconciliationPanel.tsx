import React, { useEffect, useMemo, useState } from 'react';
import { Bar, BarChart, CartesianGrid, Cell, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import api from '@lib/api';
import FinanceExportButtons from './FinanceExportButtons';

interface ReconciliationItem {
  reconcileId: number;
  bankTxnRef: string;
  bankTxnDate: string;
  bankAmount: number;
  description?: string | null;
  matchedInvoiceId?: number | null;
  invoiceNo?: string | null;
  invoiceAmount?: number | null;
  invoiceStatus?: string | null;
  matchedPaymentId?: number | null;
  paymentCode?: string | null;
  paymentAmount?: number | null;
  paymentMethod?: string | null;
  status: string;
  matchNote: string;
}

interface ReconciliationList {
  total: number;
  matched: number;
  partial: number;
  unmatched: number;
  items: ReconciliationItem[];
}

interface AutoMatchResponse {
  totalChecked: number;
  matched: number;
  partial: number;
  unmatched: number;
  message: string;
}

const fallbackList: ReconciliationList = {
  total: 0,
  matched: 0,
  partial: 0,
  unmatched: 0,
  items: [],
};

const money = new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND', maximumFractionDigits: 0 });
const formatMoney = (value = 0) => money.format(value);

const statusColors: Record<string, string> = {
  MATCHED: '#059669',
  PARTIAL: '#d97706',
  UNMATCHED: '#dc2626',
};

const compactMoney = new Intl.NumberFormat('vi-VN', { maximumFractionDigits: 1, notation: 'compact' });
const formatCompactMoney = (value = 0) => `${compactMoney.format(value)} VND`;

const statusOptions = [
  { value: 'ALL', label: 'Tất cả' },
  { value: 'UNMATCHED', label: 'Chưa khớp' },
  { value: 'PARTIAL', label: 'Thanh toán một phần' },
  { value: 'MATCHED', label: 'Đã khớp' },
];

const statusStyles: Record<string, string> = {
  MATCHED: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  PARTIAL: 'bg-amber-50 text-amber-700 border-amber-200',
  UNMATCHED: 'bg-rose-50 text-rose-700 border-rose-200',
};

const statusLabels: Record<string, string> = {
  MATCHED: 'Đã khớp',
  PARTIAL: 'Một phần',
  UNMATCHED: 'Chưa khớp',
};

const PaymentReconciliationPanel: React.FC = () => {
  const [data, setData] = useState<ReconciliationList>(fallbackList);
  const [status, setStatus] = useState('ALL');
  const [loading, setLoading] = useState(false);
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [manualTarget, setManualTarget] = useState<ReconciliationItem | null>(null);
  const [manualDraft, setManualDraft] = useState({ invoiceId: '', paymentId: '' });

  const loadData = async () => {
    try {
      setLoading(true);
      const response = await api.get<ReconciliationList>('/finance/reconciliations', {
        params: { status },
      });
      setData(response.data);
      setError(null);
    } catch {
      setData(fallbackList);
      setError('Không tải được danh sách đối soát thanh toán.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [status]);

  const autoMatch = async () => {
    try {
      setBusy(true);
      const response = await api.post<AutoMatchResponse>('/finance/reconciliations/auto-match');
      setNotice(`Auto-match: ${response.data.matched} matched, ${response.data.partial} partial, ${response.data.unmatched} unmatched.`);
      await loadData();
    } catch {
      setError('Auto-match thất bại. Vui lòng kiểm tra backend hoặc database.');
    } finally {
      setBusy(false);
    }
  };

  const openManualMatch = (item: ReconciliationItem) => {
    setManualTarget(item);
    setManualDraft({
      invoiceId: item.matchedInvoiceId ? String(item.matchedInvoiceId) : '',
      paymentId: item.matchedPaymentId ? String(item.matchedPaymentId) : '',
    });
    setError(null);
  };

  const manualMatch = async () => {
    if (!manualTarget) return;
    const invoiceId = Number(manualDraft.invoiceId || manualTarget.matchedInvoiceId || 0);
    const paymentId = Number(manualDraft.paymentId || manualTarget.matchedPaymentId || 0);
    if (!invoiceId || !paymentId) {
      setError('Can nhap InvoiceID va PaymentID de xac nhan thu cong.');
      return;
    }

    try {
      setBusy(true);
      const response = await api.post('/finance/reconciliations/manual-match', {
        reconcileId: manualTarget.reconcileId,
        invoiceId,
        paymentId,
      });
      setNotice(response.data.message || 'Manual match completed.');
      setManualTarget(null);
      await loadData();
    } catch {
      setError('Xac nhan thu cong that bai.');
    } finally {
      setBusy(false);
    }
  };

  const cards = useMemo(() => [
    { label: 'Tổng giao dịch', value: data.total, icon: 'account_balance', tone: 'bg-slate-100 text-slate-700' },
    { label: 'Đã khớp', value: data.matched, icon: 'check_circle', tone: 'bg-emerald-50 text-emerald-700' },
    { label: 'Một phần', value: data.partial, icon: 'rule', tone: 'bg-amber-50 text-amber-700' },
    { label: 'Chưa khớp', value: data.unmatched, icon: 'error', tone: 'bg-rose-50 text-rose-700' },
  ], [data]);

  const statusChartData = useMemo(() => {
    const totals = data.items.reduce<Record<string, { count: number; amount: number }>>((acc, item) => {
      const key = item.status || 'UNMATCHED';
      acc[key] = acc[key] || { count: 0, amount: 0 };
      acc[key].count += 1;
      acc[key].amount += item.bankAmount || 0;
      return acc;
    }, {});

    return ['MATCHED', 'PARTIAL', 'UNMATCHED'].map((key) => ({
      status: key,
      label: statusLabels[key] ?? key,
      count: totals[key]?.count ?? 0,
      amount: totals[key]?.amount ?? 0,
      color: statusColors[key] ?? '#64748b',
    }));
  }, [data.items]);

  const matchRate = data.total === 0 ? 0 : Math.round((data.matched / data.total) * 100);
  const unresolvedAmount = statusChartData
    .filter((item) => item.status !== 'MATCHED')
    .reduce((sum, item) => sum + item.amount, 0);

  return (
    <section className="space-y-5">
      <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-indigo-700">Finance / Payment Reconciliation</p>
            <h2 className="mt-1 text-xl font-semibold text-slate-950">{'Đối soát giao dịch thanh toán'}</h2>
            <p className="mt-1 text-sm text-slate-500">{'Kiểm tra BankTxnRef, số tiền, payment và hóa đơn để xác định trạng thái đối soát.'}</p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row">
            <select value={status} onChange={(event) => setStatus(event.target.value)} className="h-11 rounded-lg border border-slate-300 bg-white px-3 text-sm text-slate-900 outline-none focus:border-indigo-600 focus:ring-2 focus:ring-indigo-100">
              {statusOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
            </select>
            <button type="button" onClick={loadData} className="inline-flex h-11 items-center justify-center gap-2 rounded-lg border border-slate-300 bg-white px-4 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50 active:translate-y-px">
              <span className="material-symbols-outlined text-[18px]">sync</span>
              {'Làm mới'}
            </button>
            <button type="button" onClick={autoMatch} disabled={busy} className="inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-indigo-700 px-4 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-800 disabled:opacity-60 active:translate-y-px">
              <span className="material-symbols-outlined text-[18px]">rule_settings</span>
              {busy ? 'Matching...' : 'Đối soát'}
            </button>
            <FinanceExportButtons reportType="payment-reconciliation" status={status} compact />
          </div>
        </div>
      </div>

      {notice && <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">{notice}</div>}
      {error && <div className="rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</div>}

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        {cards.map((card) => (
          <article key={card.label} className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-sm font-medium text-slate-500">{card.label}</p>
                <p className="mt-2 text-2xl font-semibold text-slate-950">{card.value}</p>
              </div>
              <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${card.tone}`}>
                <span className="material-symbols-outlined text-[22px]">{card.icon}</span>
              </div>
            </div>
          </article>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-5 xl:grid-cols-[minmax(0,0.72fr)_minmax(0,1.28fr)]">
        <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h3 className="text-lg font-semibold text-slate-950">{'Tỷ lệ đối soát'}</h3>
              <p className="mt-1 text-sm text-slate-500">{'Phân bổ giao dịch theo trạng thái khớp.'}</p>
            </div>
            <div className="rounded-lg bg-indigo-50 px-3 py-2 text-right">
              <p className="text-xs font-semibold uppercase tracking-wide text-indigo-700">Match rate</p>
              <p className="text-2xl font-semibold text-indigo-900">{matchRate}%</p>
            </div>
          </div>
          <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-[220px_1fr] md:items-center">
            <div className="h-[220px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={statusChartData} dataKey="count" nameKey="label" innerRadius="58%" outerRadius="86%" paddingAngle={3}>
                    {statusChartData.map((entry) => <Cell key={entry.status} fill={entry.color} />)}
                  </Pie>
                  <Tooltip formatter={(value: number) => `${value} giao dịch`} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="space-y-3">
              {statusChartData.map((item) => (
                <div key={item.status} className="rounded-lg border border-slate-200 p-3">
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex min-w-0 items-center gap-2">
                      <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                      <span className="truncate text-sm font-semibold text-slate-800">{item.label}</span>
                    </div>
                    <span className="text-sm font-semibold text-slate-950">{item.count}</span>
                  </div>
                  <p className="mt-1 text-xs text-slate-500">{formatMoney(item.amount)}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
            <div>
              <h3 className="text-lg font-semibold text-slate-950">{'Giá trị giao dịch theo trạng thái'}</h3>
              <p className="mt-1 text-sm text-slate-500">{'Tổng số tiền ngân hàng cần đối soát theo từng nhóm.'}</p>
            </div>
            <div className="rounded-lg bg-rose-50 px-3 py-2 text-right">
              <p className="text-xs font-semibold uppercase tracking-wide text-rose-700">{'Cần theo dõi'}</p>
              <p className="text-lg font-semibold text-rose-800">{formatCompactMoney(unresolvedAmount)}</p>
            </div>
          </div>
          <div className="mt-5 h-[260px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={statusChartData} margin={{ top: 12, right: 12, left: 8, bottom: 0 }}>
                <CartesianGrid stroke="#e2e8f0" vertical={false} />
                <XAxis dataKey="label" tick={{ fill: '#64748b', fontSize: 12 }} axisLine={false} tickLine={false} />
                <YAxis tickFormatter={formatCompactMoney} tick={{ fill: '#64748b', fontSize: 12 }} axisLine={false} tickLine={false} width={92} />
                <Tooltip formatter={(value: number) => formatMoney(value)} />
                <Bar dataKey="amount" name="Gia tri ngan hang" radius={[6, 6, 0, 0]}>
                  {statusChartData.map((entry) => <Cell key={entry.status} fill={entry.color} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </section>
      </div>
      <section className="rounded-lg border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-200 px-5 py-4">
          <div className="flex items-center justify-between gap-3">
            <h3 className="text-lg font-semibold text-slate-950">{'Danh sách giao dịch ngân hàng'}</h3>
            {loading && <span className="text-sm font-medium text-indigo-700">Loading...</span>}
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-[1120px] divide-y divide-slate-200 text-sm">
            <thead className="bg-slate-50 text-xs uppercase text-slate-500">
              <tr>
                <th className="px-5 py-3 text-left font-semibold">BankTxnRef</th>
                <th className="px-5 py-3 text-right font-semibold">{'Số tiền NH'}</th>
                <th className="px-5 py-3 text-left font-semibold">{'Hóa đơn'}</th>
                <th className="px-5 py-3 text-left font-semibold">Payment</th>
                <th className="px-5 py-3 text-left font-semibold">{'Trạng thái'}</th>
                <th className="px-5 py-3 text-left font-semibold">{'Ghi chú'}</th>
                <th className="px-5 py-3 text-left font-semibold">Thao tac</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {data.items.map((item) => (
                <tr key={item.reconcileId} className="align-top hover:bg-slate-50">
                  <td className="px-5 py-4">
                    <p className="font-semibold text-slate-950">{item.bankTxnRef}</p>
                    <p className="mt-1 text-xs text-slate-500">{item.bankTxnDate}</p>
                  </td>
                  <td className="px-5 py-4 text-right font-semibold text-slate-900">{formatMoney(item.bankAmount)}</td>
                  <td className="px-5 py-4">
                    <p className="font-semibold text-slate-900">{item.invoiceNo || '-'}</p>
                    <p className="mt-1 text-xs text-slate-500">ID {item.matchedInvoiceId || '-'} / {item.invoiceAmount ? formatMoney(item.invoiceAmount) : '-'}</p>
                  </td>
                  <td className="px-5 py-4">
                    <p className="font-semibold text-slate-900">{item.paymentCode || '-'}</p>
                    <p className="mt-1 text-xs text-slate-500">ID {item.matchedPaymentId || '-'} / {item.paymentAmount ? formatMoney(item.paymentAmount) : '-'}</p>
                  </td>
                  <td className="px-5 py-4">
                    <span className={`rounded-full border px-2.5 py-1 text-xs font-semibold ${statusStyles[item.status] ?? statusStyles.UNMATCHED}`}>
                      {statusLabels[item.status] ?? item.status}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-slate-600">{item.matchNote}</td>
                  <td className="px-5 py-4">
                    <button type="button" onClick={() => openManualMatch(item)} disabled={busy} className="inline-flex h-9 items-center justify-center gap-2 rounded-lg border border-indigo-200 bg-indigo-50 px-3 text-xs font-semibold text-indigo-700 transition hover:bg-indigo-100 disabled:opacity-60">
                      <span className="material-symbols-outlined text-[16px]">edit_note</span>
                      Manual Match
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {!data.items.length && <div className="px-5 py-10 text-center text-sm text-slate-500">{'Không có giao dịch đối soát theo bộ lọc hiện tại.'}</div>}
      </section>
      {manualTarget && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center bg-slate-950/40 p-4 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-xl border border-slate-200 bg-white shadow-2xl">
            <div className="border-b border-slate-200 px-5 py-4">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-indigo-700">Manual Match</p>
                  <h3 className="mt-1 text-lg font-semibold text-slate-950">Xac nhan doi soat thu cong</h3>
                </div>
                <button type="button" onClick={() => setManualTarget(null)} className="grid h-9 w-9 place-items-center rounded-lg text-slate-500 transition hover:bg-slate-100 hover:text-slate-900">
                  <span className="material-symbols-outlined text-[20px]">close</span>
                </button>
              </div>
            </div>
            <div className="space-y-4 px-5 py-5">
              <div className="rounded-lg bg-slate-50 p-4 text-sm">
                <div className="flex items-center justify-between gap-3">
                  <span className="font-semibold text-slate-700">BankTxnRef</span>
                  <span className="font-semibold text-slate-950">{manualTarget.bankTxnRef}</span>
                </div>
                <div className="mt-2 flex items-center justify-between gap-3">
                  <span className="font-semibold text-slate-700">So tien NH</span>
                  <span className="font-semibold text-slate-950">{formatMoney(manualTarget.bankAmount)}</span>
                </div>
              </div>
              <label className="block space-y-2">
                <span className="text-sm font-semibold text-slate-700">InvoiceID</span>
                <input value={manualDraft.invoiceId} onChange={(event) => setManualDraft((prev) => ({ ...prev, invoiceId: event.target.value }))} className="h-11 w-full rounded-lg border border-slate-300 px-3 text-sm outline-none focus:border-indigo-600 focus:ring-2 focus:ring-indigo-100" placeholder="Nhap InvoiceID" />
              </label>
              <label className="block space-y-2">
                <span className="text-sm font-semibold text-slate-700">PaymentID</span>
                <input value={manualDraft.paymentId} onChange={(event) => setManualDraft((prev) => ({ ...prev, paymentId: event.target.value }))} className="h-11 w-full rounded-lg border border-slate-300 px-3 text-sm outline-none focus:border-indigo-600 focus:ring-2 focus:ring-indigo-100" placeholder="Nhap PaymentID" />
              </label>
            </div>
            <div className="flex flex-col-reverse gap-2 border-t border-slate-200 px-5 py-4 sm:flex-row sm:justify-end">
              <button type="button" onClick={() => setManualTarget(null)} className="inline-flex h-10 items-center justify-center rounded-lg border border-slate-300 bg-white px-4 text-sm font-semibold text-slate-700 transition hover:bg-slate-50">Huy</button>
              <button type="button" onClick={manualMatch} disabled={busy} className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-indigo-700 px-4 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-800 disabled:opacity-60">
                <span className="material-symbols-outlined text-[18px]">rule_settings</span>
                Xac nhan
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

export default PaymentReconciliationPanel;