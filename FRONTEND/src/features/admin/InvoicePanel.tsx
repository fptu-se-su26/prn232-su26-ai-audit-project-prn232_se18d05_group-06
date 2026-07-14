import React, { useEffect, useMemo, useState } from 'react';
import api from '@lib/api';

interface InvoiceDto {
  invoiceId: number;
  invoiceNo: string;
  orderId: number;
  orderCode: string;
  customerId: number;
  customerName: string;
  customerEmail?: string;
  issueDate: string;
  dueDate: string;
  subTotal: number;
  discountAmt: number;
  vatrate: number;
  vatamount: number;
  totalAmount: number;
  paidAmount: number;
  status: string;
  pdfpath?: string;
}

interface InvoiceDetailDto extends InvoiceDto {
  serviceCharges: Array<{
    chargeId: number;
    chargeCode: string;
    chargeType: string;
    description?: string;
    amount: number;
    isApproved: boolean;
  }>;
}

interface CompletedOrderDto {
  orderId: number;
  orderCode: string;
  customerName: string;
  customerEmail?: string;
  serviceType: string;
  status: string;
  estimatedAmount: number;
  discountAmount: number;
  deliveredAt?: string;
  createdAt?: string;
}

const money = (value?: number) => `${Number(value || 0).toLocaleString('vi-VN')} ?`;

const statusLabel = (status: string) => {
  switch (status?.toUpperCase()) {
    case 'PAID': return 'Da thanh toan';
    case 'PARTIAL': return 'Thanh toan mot phan';
    case 'PENDING': return 'Cho thanh toan';
    case 'OVERDUE': return 'Qua han';
    case 'CANCELLED': return 'Da huy';
    default: return status || 'Khong ro';
  }
};

const statusClass = (status: string) => {
  switch (status?.toUpperCase()) {
    case 'PAID': return 'bg-emerald-50 text-emerald-700 border-emerald-200';
    case 'PARTIAL': return 'bg-cyan-50 text-cyan-700 border-cyan-200';
    case 'PENDING': return 'bg-amber-50 text-amber-700 border-amber-200';
    case 'OVERDUE': return 'bg-rose-50 text-rose-700 border-rose-200';
    case 'CANCELLED': return 'bg-slate-100 text-slate-600 border-slate-200';
    default: return 'bg-slate-50 text-slate-600 border-slate-200';
  }
};

const InvoicePanel: React.FC = () => {
  const [invoices, setInvoices] = useState<InvoiceDto[]>([]);
  const [completedOrders, setCompletedOrders] = useState<CompletedOrderDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [showGenerateModal, setShowGenerateModal] = useState(false);
  const [selectedOrderId, setSelectedOrderId] = useState<number | null>(null);
  const [generating, setGenerating] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<InvoiceDto | null>(null);
  const [invoiceDetails, setInvoiceDetails] = useState<InvoiceDetailDto | null>(null);
  const [detailsLoading, setDetailsLoading] = useState(false);

  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ message, type });
    window.setTimeout(() => setToast(null), 3800);
  };

  const fetchInvoices = async () => {
    try {
      setLoading(true);
      const res = await api.get<InvoiceDto[]>('/invoices', {
        params: {
          status: statusFilter === 'ALL' ? undefined : statusFilter,
          search: search || undefined
        }
      });
      setInvoices(res.data);
    } catch (err: any) {
      showToast(err.response?.data || 'Khong tai duoc danh sach hoa don.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const fetchCompletedOrders = async () => {
    try {
      setOrdersLoading(true);
      const res = await api.get<CompletedOrderDto[]>('/invoices/completed-orders');
      setCompletedOrders(res.data);
    } catch (err: any) {
      showToast(err.response?.data || 'Khong tai duoc don da hoan thanh.', 'error');
      setCompletedOrders([]);
    } finally {
      setOrdersLoading(false);
    }
  };

  useEffect(() => {
    fetchInvoices();
  }, [statusFilter, search]);

  const stats = useMemo(() => ({
    totalAmount: invoices.reduce((sum, item) => sum + Number(item.totalAmount || 0), 0),
    pending: invoices.filter(item => item.status === 'PENDING').length,
    paid: invoices.filter(item => item.status === 'PAID').length,
    overdue: invoices.filter(item => item.status === 'OVERDUE').length
  }), [invoices]);

  const openGenerateModal = async () => {
    setShowGenerateModal(true);
    setSelectedOrderId(null);
    await fetchCompletedOrders();
  };

  const handleGenerateInvoice = async () => {
    if (!selectedOrderId) return;
    try {
      setGenerating(true);
      await api.post(`/invoices/generate/${selectedOrderId}`);
      showToast('Da tao PDF va gui email hoa don cho customer.', 'success');
      setShowGenerateModal(false);
      setSelectedOrderId(null);
      await fetchInvoices();
    } catch (err: any) {
      showToast(err.response?.data || 'Khong the tao hoa don cho don nay.', 'error');
    } finally {
      setGenerating(false);
    }
  };

  const handleSendEmail = async (id: number) => {
    try {
      await api.post(`/invoices/${id}/send-email`);
      showToast('Da gui email kem hoa don PDF.', 'success');
    } catch (err: any) {
      showToast(err.response?.data || 'Gui email that bai.', 'error');
    }
  };

  const handleRegeneratePdf = async (id: number) => {
    try {
      await api.post(`/invoices/${id}/regenerate-pdf`);
      showToast('Da tao lai file PDF hoa don.', 'success');
      await fetchInvoices();
    } catch (err: any) {
      showToast(err.response?.data || 'Tao lai PDF that bai.', 'error');
    }
  };

  const handleConfirmPayment = async (invoice: InvoiceDto) => {
    try {
      const remaining = Math.max(0, Number(invoice.totalAmount || 0) - Number(invoice.paidAmount || 0));
      await api.post('/payments/confirm', {
        invoiceId: invoice.invoiceId,
        amount: remaining || invoice.totalAmount,
        paymentMethod: 'MANUAL',
        bankTxnRef: `MANUAL-${invoice.invoiceNo}`,
        sendEmail: true
      });
      showToast('Da xac nhan payment va gui email xac nhan thanh toan.', 'success');
      await fetchInvoices();
    } catch (err: any) {
      showToast(err.response?.data || 'Xac nhan payment that bai.', 'error');
    }
  };

  const handleSendPaymentConfirmation = async (id: number) => {
    try {
      await api.post(`/invoices/${id}/send-payment-confirmation`);
      showToast('Da gui lai email xac nhan thanh toan.', 'success');
    } catch (err: any) {
      showToast(err.response?.data || 'Gui email xac nhan thanh toan that bai.', 'error');
    }
  };

  const loadInvoiceDetails = async (invoice: InvoiceDto) => {
    try {
      setSelectedInvoice(invoice);
      setDetailsLoading(true);
      const res = await api.get<InvoiceDetailDto>(`/invoices/${invoice.invoiceId}`);
      setInvoiceDetails(res.data);
    } catch {
      showToast('Khong tai duoc chi tiet hoa don.', 'error');
    } finally {
      setDetailsLoading(false);
    }
  };

  const openPdfInTab = (path?: string) => {
    if (!path) {
      showToast('File PDF chua san sang.', 'error');
      return;
    }
    const baseUrl = api.defaults.baseURL?.replace('/api', '') || '';
    window.open(`${baseUrl}${path}`, '_blank');
  };

  return (
    <div className="space-y-6">
      {toast && (
        <div className={`fixed right-6 top-6 z-50 flex items-center gap-3 rounded-2xl border px-4 py-3 text-sm font-semibold shadow-xl ${toast.type === 'success' ? 'border-emerald-200 bg-emerald-50 text-emerald-800' : 'border-rose-200 bg-rose-50 text-rose-800'}`}>
          <span className="material-symbols-outlined text-[20px]">{toast.type === 'success' ? 'check_circle' : 'error'}</span>
          {toast.message}
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-5">
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"><p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Tong hoa don</p><p className="mt-2 text-3xl font-black text-slate-900">{invoices.length}</p></div>
        <div className="rounded-2xl border border-amber-100 bg-amber-50/40 p-4 shadow-sm"><p className="text-[11px] font-bold uppercase tracking-wider text-amber-600">Cho thanh toan</p><p className="mt-2 text-3xl font-black text-amber-700">{stats.pending}</p></div>
        <div className="rounded-2xl border border-emerald-100 bg-emerald-50/40 p-4 shadow-sm"><p className="text-[11px] font-bold uppercase tracking-wider text-emerald-600">Da thanh toan</p><p className="mt-2 text-3xl font-black text-emerald-700">{stats.paid}</p></div>
        <div className="rounded-2xl border border-rose-100 bg-rose-50/40 p-4 shadow-sm"><p className="text-[11px] font-bold uppercase tracking-wider text-rose-600">Qua han</p><p className="mt-2 text-3xl font-black text-rose-700">{stats.overdue}</p></div>
        <div className="rounded-2xl bg-slate-950 p-4 text-white shadow-sm sm:col-span-2 xl:col-span-1"><p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Gia tri phat hanh</p><p className="mt-2 truncate text-2xl font-black">{money(stats.totalAmount)}</p></div>
      </div>

      <div className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-1 flex-col gap-3 sm:flex-row sm:items-center">
          <div className="relative max-w-md flex-1"><span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[20px] text-slate-400">search</span><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Tim hoa don, don hang, khach hang..." className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 pl-10 pr-4 text-sm font-semibold outline-none transition focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-100" /></div>
          <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)} className="h-11 rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm font-bold text-slate-700 outline-none focus:border-blue-500 focus:bg-white">
            <option value="ALL">Tat ca trang thai</option><option value="PENDING">Cho thanh toan</option><option value="PARTIAL">Thanh toan mot phan</option><option value="PAID">Da thanh toan</option><option value="OVERDUE">Qua han</option><option value="CANCELLED">Da huy</option>
          </select>
        </div>
        <button onClick={openGenerateModal} className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 text-sm font-bold text-white shadow-lg shadow-blue-600/20 transition hover:bg-blue-700"><span className="material-symbols-outlined text-[18px]">receipt_long</span>Tao hoa don tu dong</button>
      </div>

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[1080px] text-left text-sm">
            <thead className="bg-slate-50 text-[11px] font-bold uppercase tracking-wider text-slate-500"><tr><th className="px-5 py-4">Ma hoa don</th><th className="px-5 py-4">Don hang</th><th className="px-5 py-4">Khach hang</th><th className="px-5 py-4 text-right">Tong tien</th><th className="px-5 py-4 text-right">Da tra</th><th className="px-5 py-4 text-center">Trang thai</th><th className="px-5 py-4 text-right">Thao tac</th></tr></thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? <tr><td colSpan={7} className="py-14 text-center font-semibold text-slate-400">Dang tai danh sach hoa don...</td></tr> : invoices.length === 0 ? <tr><td colSpan={7} className="py-14 text-center font-semibold text-slate-400">Khong co hoa don phu hop.</td></tr> : invoices.map((invoice) => (
                <tr key={invoice.invoiceId} className="text-slate-700 transition hover:bg-slate-50/70">
                  <td className="px-5 py-4 font-black text-blue-600"><button onClick={() => loadInvoiceDetails(invoice)} className="hover:underline">{invoice.invoiceNo}</button></td>
                  <td className="px-5 py-4 font-mono text-xs font-bold text-slate-900">{invoice.orderCode}</td>
                  <td className="px-5 py-4 font-semibold">{invoice.customerName}</td>
                  <td className="px-5 py-4 text-right font-black text-slate-900">{money(invoice.totalAmount)}</td>
                  <td className="px-5 py-4 text-right font-bold text-emerald-700">{money(invoice.paidAmount)}</td>
                  <td className="px-5 py-4 text-center"><span className={`inline-flex rounded-full border px-3 py-1 text-[11px] font-bold ${statusClass(invoice.status)}`}>{statusLabel(invoice.status)}</span></td>
                  <td className="px-5 py-4"><div className="flex justify-end gap-2">
                    <button title="View PDF" onClick={() => openPdfInTab(invoice.pdfpath)} className="rounded-lg bg-slate-100 p-2 text-slate-600 hover:bg-slate-200"><span className="material-symbols-outlined text-[18px]">visibility</span></button>
                    <button title="Send invoice email" onClick={() => handleSendEmail(invoice.invoiceId)} className="rounded-lg bg-blue-50 p-2 text-blue-600 hover:bg-blue-100"><span className="material-symbols-outlined text-[18px]">mail</span></button>
                    <button title="Regenerate PDF" onClick={() => handleRegeneratePdf(invoice.invoiceId)} className="rounded-lg bg-slate-100 p-2 text-slate-600 hover:bg-slate-200"><span className="material-symbols-outlined text-[18px]">refresh</span></button>
                    {invoice.status !== 'PAID' ? <button title="Confirm Payment" onClick={() => handleConfirmPayment(invoice)} className="rounded-lg bg-emerald-50 p-2 text-emerald-600 hover:bg-emerald-100"><span className="material-symbols-outlined text-[18px]">payments</span></button> : <button title="Send payment confirmation" onClick={() => handleSendPaymentConfirmation(invoice.invoiceId)} className="rounded-lg bg-emerald-50 p-2 text-emerald-600 hover:bg-emerald-100"><span className="material-symbols-outlined text-[18px]">mark_email_read</span></button>}
                  </div></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {selectedInvoice && (
        <div className="fixed inset-0 z-50 flex justify-end bg-slate-950/40 backdrop-blur-sm"><div className="h-full w-full max-w-xl overflow-y-auto bg-white p-6 shadow-2xl"><div className="flex items-start justify-between border-b border-slate-100 pb-4"><div><p className="text-xs font-bold uppercase tracking-wider text-blue-600">Chi tiet hoa don</p><h3 className="mt-1 text-xl font-black text-slate-900">{selectedInvoice.invoiceNo}</h3><p className="mt-1 text-sm font-semibold text-slate-500">Don hang {selectedInvoice.orderCode}</p></div><button onClick={() => { setSelectedInvoice(null); setInvoiceDetails(null); }} className="rounded-xl p-2 text-slate-400 hover:bg-slate-100"><span className="material-symbols-outlined">close</span></button></div>{detailsLoading ? <p className="py-10 text-center font-semibold text-slate-400">Dang tai chi tiet...</p> : invoiceDetails && <div className="space-y-5 py-5"><div className="grid grid-cols-2 gap-3 rounded-2xl border border-slate-100 bg-slate-50 p-4 text-sm"><div><p className="text-xs font-bold uppercase text-slate-400">Khach hang</p><p className="mt-1 font-bold text-slate-900">{invoiceDetails.customerName}</p></div><div><p className="text-xs font-bold uppercase text-slate-400">Email</p><p className="mt-1 font-bold text-slate-700">{invoiceDetails.customerEmail || 'N/A'}</p></div><div><p className="text-xs font-bold uppercase text-slate-400">Da thanh toan</p><p className="mt-1 font-bold text-emerald-700">{money(invoiceDetails.paidAmount)}</p></div><div><p className="text-xs font-bold uppercase text-slate-400">Con lai</p><p className="mt-1 font-bold text-rose-700">{money(Math.max(0, invoiceDetails.totalAmount - invoiceDetails.paidAmount))}</p></div></div><div className="overflow-hidden rounded-2xl border border-slate-100"><div className="bg-slate-50 px-4 py-3 text-xs font-black uppercase tracking-wider text-slate-500">Phi dich vu logistics</div>{invoiceDetails.serviceCharges.length === 0 ? <p className="p-4 text-sm text-slate-400">Khong co dong phi.</p> : invoiceDetails.serviceCharges.map((charge) => <div key={charge.chargeId} className="flex items-start justify-between gap-4 border-t border-slate-100 px-4 py-3 text-sm"><div><p className="font-black text-slate-800">{charge.chargeType}</p><p className="mt-1 text-xs font-semibold text-slate-500">{charge.description || charge.chargeCode}</p></div><p className="font-black text-slate-900">{money(charge.amount)}</p></div>)}</div><div className="space-y-2 rounded-2xl bg-slate-950 p-5 text-sm font-bold text-white"><div className="flex justify-between text-slate-300"><span>Tam tinh</span><span>{money(invoiceDetails.subTotal)}</span></div><div className="flex justify-between text-rose-200"><span>Giam gia</span><span>- {money(invoiceDetails.discountAmt)}</span></div><div className="flex justify-between text-slate-300"><span>VAT ({invoiceDetails.vatrate}%)</span><span>{money(invoiceDetails.vatamount)}</span></div><div className="flex justify-between border-t border-white/10 pt-3 text-lg"><span>Tong thanh toan</span><span>{money(invoiceDetails.totalAmount)}</span></div></div></div>}</div></div>
      )}

      {showGenerateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 p-4 backdrop-blur-sm"><div className="w-full max-w-2xl rounded-3xl bg-white p-6 shadow-2xl"><div className="flex items-start justify-between border-b border-slate-100 pb-4"><div><h3 className="text-lg font-black text-slate-900">Tao hoa don tu dong</h3><p className="mt-1 text-sm font-semibold text-slate-500">Chon don da hoan thanh nhung chua phat hanh hoa don.</p></div><button onClick={() => setShowGenerateModal(false)} className="rounded-xl p-2 text-slate-400 hover:bg-slate-100"><span className="material-symbols-outlined">close</span></button></div><div className="mt-4 max-h-[420px] space-y-3 overflow-y-auto pr-1">{ordersLoading ? <p className="py-10 text-center font-semibold text-slate-400">Dang tai don hoan thanh...</p> : completedOrders.length === 0 ? <p className="py-10 text-center font-semibold text-slate-400">Khong co don nao cho tao hoa don.</p> : completedOrders.map((order) => <label key={order.orderId} className={`flex cursor-pointer items-center gap-4 rounded-2xl border p-4 transition ${selectedOrderId === order.orderId ? 'border-blue-500 bg-blue-50' : 'border-slate-200 hover:bg-slate-50'}`}><input type="radio" name="order" checked={selectedOrderId === order.orderId} onChange={() => setSelectedOrderId(order.orderId)} className="h-4 w-4 text-blue-600" /><div className="min-w-0 flex-1"><p className="font-black text-slate-900">{order.orderCode}</p><p className="mt-1 text-sm font-semibold text-slate-500">{order.customerName} - {order.serviceType}</p></div><div className="text-right"><p className="font-black text-slate-900">{money(order.estimatedAmount)}</p>{order.discountAmount > 0 && <p className="text-xs font-bold text-rose-600">Giam {money(order.discountAmount)}</p>}</div></label>)}</div><div className="mt-5 flex justify-end gap-3 border-t border-slate-100 pt-4"><button onClick={() => setShowGenerateModal(false)} className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-bold text-slate-600 hover:bg-slate-50">Huy</button><button onClick={handleGenerateInvoice} disabled={!selectedOrderId || generating} className="rounded-xl bg-blue-600 px-4 py-2 text-sm font-bold text-white shadow-lg shadow-blue-600/20 hover:bg-blue-700 disabled:opacity-50">{generating ? 'Dang xu ly...' : 'Tao PDF va gui Email'}</button></div></div></div>
      )}
    </div>
  );
};

export default InvoicePanel;
