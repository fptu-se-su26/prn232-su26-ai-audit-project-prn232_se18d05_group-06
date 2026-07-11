import React, { useEffect, useMemo, useState } from 'react';
import { Calendar, CreditCard, Download, Eye, FileText, RefreshCw, Search, ShieldCheck, Star } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Header from './Header';
import Footer from './Footer';
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

const money = (value?: number) => `${Number(value || 0).toLocaleString('vi-VN')} đ`;

const getStatusStyle = (status: string) => {
  switch (status?.toUpperCase()) {
    case 'PAID':
      return { badge: 'bg-emerald-50 text-emerald-700 border-emerald-100', dot: 'bg-emerald-500', text: 'Đã thanh toán' };
    case 'PARTIAL':
      return { badge: 'bg-cyan-50 text-cyan-700 border-cyan-100', dot: 'bg-cyan-500', text: 'Thanh toán một phần' };
    case 'PENDING':
      return { badge: 'bg-amber-50 text-amber-700 border-amber-100', dot: 'bg-amber-500', text: 'Chờ thanh toán' };
    case 'OVERDUE':
      return { badge: 'bg-rose-50 text-rose-700 border-rose-100', dot: 'bg-rose-500', text: 'Quá hạn' };
    case 'CANCELLED':
      return { badge: 'bg-slate-50 text-slate-600 border-slate-200', dot: 'bg-slate-400', text: 'Đã hủy' };
    default:
      return { badge: 'bg-slate-50 text-slate-600 border-slate-200', dot: 'bg-slate-400', text: status || 'Không rõ' };
  }
};

const getRatingLabel = (stars: number) => {
  switch (stars) {
    case 1: return 'Rất tệ';
    case 2: return 'Chưa hài lòng';
    case 3: return 'Bình thường';
    case 4: return 'Hài lòng';
    case 5: return 'Tuyệt vời';
    default: return '';
  }
};

const PaymentHistory: React.FC = () => {
  const navigate = useNavigate();
  const [invoices, setInvoices] = useState<InvoiceDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [selectedInvoice, setSelectedInvoice] = useState<InvoiceDto | null>(null);
  const [feedbackInvoice, setFeedbackInvoice] = useState<InvoiceDto | null>(null);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [submittingFeedback, setSubmittingFeedback] = useState(false);

  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ message, type });
    window.setTimeout(() => setToast(null), 4000);
  };

  const fetchInvoices = async () => {
    try {
      setLoading(true);
      const res = await api.get<InvoiceDto[]>('/invoices');
      setInvoices(res.data);
    } catch {
      showToast('Không thể kết nối máy chủ để tải danh sách hóa đơn.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInvoices();
  }, []);

  const filteredInvoices = useMemo(() => {
    const keyword = searchQuery.trim().toLowerCase();
    return invoices.filter((invoice) => {
      const matchesStatus = filterStatus === 'all' || invoice.status.toLowerCase() === filterStatus.toLowerCase();
      const matchesSearch = !keyword || invoice.invoiceNo.toLowerCase().includes(keyword) || invoice.orderCode.toLowerCase().includes(keyword);
      return matchesStatus && matchesSearch;
    });
  }, [filterStatus, invoices, searchQuery]);

  const stats = useMemo(() => ({
    totalPaid: invoices.filter(item => item.status === 'PAID').reduce((sum, item) => sum + Number(item.totalAmount || 0), 0),
    totalPending: invoices.filter(item => item.status === 'PENDING').reduce((sum, item) => sum + Number(item.totalAmount || 0), 0),
    totalInvoices: invoices.length
  }), [invoices]);

  const openPdfInTab = (path?: string) => {
    if (!path) {
      showToast('File PDF đang được chuẩn bị. Vui lòng thử lại sau.', 'error');
      return;
    }
    const baseUrl = api.defaults.baseURL?.replace('/api', '') || '';
    window.open(`${baseUrl}${path}`, '_blank');
  };

  const handleViewReceipt = async (id: number) => {
    try {
      const res = await api.get(`/customer/invoices/${id}/receipt`);
      const paid = Number(res.data?.paidAmount || 0).toLocaleString('vi-VN');
      const remaining = Number(res.data?.remainingAmount || 0).toLocaleString('vi-VN');
      showToast(`Bi?n nh?n: ?? nh?n ${paid} ?, c?n l?i ${remaining} ?.`, 'success');
    } catch (err: any) {
      showToast(err.response?.data || 'H?a ??n ch?a c? bi?n nh?n thanh to?n.', 'error');
    }
  };

  const handleRequestResendEmail = async (id: number) => {
    try {
      await api.post(`/customer/invoices/${id}/request-resend`);
      showToast('Hệ thống đã gửi lại email kèm hóa đơn PDF.', 'success');
    } catch (err: any) {
      showToast(err.response?.data?.message || err.response?.data || 'Yêu cầu gửi lại email thất bại.', 'error');
    }
  };

  const handleFeedbackSubmit = async () => {
    if (!feedbackInvoice) return;
    try {
      setSubmittingFeedback(true);
      await api.post(`/customer/orders/${feedbackInvoice.orderId}/feedback`, {
        starRating: rating,
        comment
      });
      showToast('Đã gửi đánh giá dịch vụ thành công.', 'success');
      setFeedbackInvoice(null);
      setComment('');
      setRating(5);
    } catch (err: any) {
      showToast(err.response?.data?.message || err.response?.data || 'Gửi đánh giá thất bại.', 'error');
    } finally {
      setSubmittingFeedback(false);
    }
  };

  return (
    <div className="min-h-screen bg-white text-on-surface light-surface relative selection:bg-blue-100 selection:text-blue-800">
      <Header scrollY={51} />

      {toast && (
        <div className={`fixed top-24 right-6 z-50 flex items-center gap-2.5 rounded-2xl border px-4 py-3.5 text-xs font-bold shadow-xl backdrop-blur-xl ${toast.type === 'success' ? 'bg-emerald-50/95 text-emerald-800 border-emerald-100' : 'bg-rose-50/95 text-rose-800 border-rose-100'}`}>
          <div className={`h-2 w-2 rounded-full ${toast.type === 'success' ? 'bg-emerald-500' : 'bg-rose-500'}`} />
          {toast.message}
        </div>
      )}

      <main className="relative z-10 pt-32 pb-24">
        <div className="mx-auto max-w-6xl px-6 lg:px-8">
          <div className="mb-10 flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
            <div>
              <span className="rounded-full border border-blue-100 bg-blue-50 px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-blue-600">Customer Portal</span>
              <h1 className="mt-3 text-4xl font-extrabold tracking-tight text-slate-900">Hóa đơn của tôi</h1>
              <p className="mt-2 text-sm font-medium text-slate-500">Theo dõi hóa đơn dịch vụ logistics, tải file PDF và kiểm tra trạng thái thanh toán.</p>
            </div>
            <button onClick={fetchInvoices} className="flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-bold text-slate-600 shadow-sm transition hover:bg-slate-50 hover:text-slate-900">
              <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
              Làm mới dữ liệu
            </button>
          </div>

          <div className="mb-8 grid grid-cols-1 gap-5 sm:grid-cols-3">
            <div className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:border-blue-200 hover:shadow-lg">
              <div className="flex items-start justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Đã thanh toán</span>
                <div className="rounded-xl bg-emerald-50 p-2"><CreditCard size={16} className="text-emerald-600" /></div>
              </div>
              <p className="mt-6 text-2xl font-black text-slate-900">{money(stats.totalPaid)}</p>
              <p className="mt-1 text-[10px] font-bold uppercase tracking-wide text-emerald-600">Giá trị đã ghi nhận</p>
            </div>

            <div className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:border-blue-200 hover:shadow-lg">
              <div className="flex items-start justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Chờ thanh toán</span>
                <div className="rounded-xl bg-amber-50 p-2"><FileText size={16} className="text-amber-600" /></div>
              </div>
              <p className="mt-6 text-2xl font-black text-amber-600">{money(stats.totalPending)}</p>
              <p className="mt-1 text-[10px] font-bold uppercase tracking-wide text-amber-600">Cần theo dõi</p>
            </div>

            <div className="rounded-3xl bg-gradient-to-br from-blue-600 via-blue-600 to-indigo-700 p-6 text-white shadow-lg shadow-blue-600/20 transition hover:-translate-y-1 hover:shadow-xl">
              <div className="flex items-start justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-blue-100">Tổng hóa đơn</span>
                <div className="rounded-xl bg-white/10 p-2"><FileText size={16} className="text-white" /></div>
              </div>
              <p className="mt-6 text-3xl font-black">{stats.totalInvoices}</p>
              <p className="mt-1 text-[10px] font-bold uppercase tracking-wide text-blue-100">Hóa đơn phát hành</p>
            </div>
          </div>

          <div className="mb-8 flex flex-col gap-4 rounded-3xl border border-white bg-white/80 p-4 shadow-sm backdrop-blur-xl md:flex-row md:items-center md:justify-between">
            <div className="flex flex-wrap items-center gap-2">
              {['all', 'pending', 'paid', 'overdue'].map((status) => (
                <button key={status} onClick={() => setFilterStatus(status)} className={`rounded-2xl px-4 py-2 text-xs font-bold transition ${filterStatus === status ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20' : 'bg-slate-50 text-slate-600 hover:bg-slate-100 hover:text-slate-900'}`}>
                  {status === 'all' ? 'Tất cả' : getStatusStyle(status).text}
                </button>
              ))}
            </div>
            <div className="relative w-full md:max-w-xs">
              <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input value={searchQuery} onChange={(event) => setSearchQuery(event.target.value)} placeholder="Tìm mã hóa đơn, mã đơn..." className="w-full rounded-2xl border border-slate-200/80 bg-slate-50 py-2 pl-10 pr-4 text-xs font-semibold text-slate-800 outline-none transition focus:ring-2 focus:ring-blue-500/20" />
            </div>
          </div>

          <div className="overflow-hidden rounded-3xl border border-white bg-white/90 shadow-sm backdrop-blur-xl">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[840px] border-collapse text-left">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50/70 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    <th className="px-6 py-4">Mã hóa đơn</th>
                    <th className="px-6 py-4">Đơn hàng</th>
                    <th className="px-6 py-4">Ngày phát hành</th>
                    <th className="px-6 py-4 text-right">Tổng tiền</th>
                    <th className="px-6 py-4 text-center">Trạng thái</th>
                    <th className="px-6 py-4 text-right">Thao tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50 text-xs font-bold text-slate-700">
                  {loading ? (
                    <tr><td colSpan={6} className="py-16 text-center font-medium text-slate-400">Đang tải dữ liệu hóa đơn...</td></tr>
                  ) : filteredInvoices.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-16 text-center">
                        <p className="font-medium text-slate-400">Không tìm thấy hóa đơn phù hợp.</p>
                        <button onClick={() => navigate('/order-history')} className="mt-4 rounded-xl bg-blue-50 px-4 py-2 text-[11px] font-bold text-blue-600 transition hover:bg-blue-100">Xem lịch sử đơn hàng</button>
                      </td>
                    </tr>
                  ) : filteredInvoices.map((invoice) => {
                    const style = getStatusStyle(invoice.status);
                    return (
                      <tr key={invoice.invoiceId} className="transition hover:bg-slate-50/50">
                        <td className="px-6 py-4 font-extrabold text-blue-600"><button onClick={() => setSelectedInvoice(invoice)} className="hover:underline">{invoice.invoiceNo}</button></td>
                        <td className="px-6 py-4 font-mono text-[11px] text-slate-800">{invoice.orderCode}</td>
                        <td className="px-6 py-4 text-slate-500"><span className="inline-flex items-center gap-1.5"><Calendar size={12} />{invoice.issueDate}</span></td>
                        <td className="px-6 py-4 text-right text-sm font-black text-slate-900">{money(invoice.totalAmount)}</td>
                        <td className="px-6 py-4 text-center"><span className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-[10px] font-bold ${style.badge}`}><span className={`h-1.5 w-1.5 rounded-full ${style.dot}`} />{style.text}</span></td>
                        <td className="px-6 py-4">
                          <div className="flex justify-end gap-1.5">
                            <button title="Xem PDF" onClick={() => openPdfInTab(invoice.pdfpath)} className="rounded-xl bg-slate-100 p-2 text-slate-600 transition hover:bg-slate-200"><Eye size={13} /></button>
                            <button title="Tải PDF" onClick={() => openPdfInTab(invoice.pdfpath)} className="rounded-xl bg-blue-50 p-2 text-blue-600 transition hover:bg-blue-100"><Download size={13} /></button>
                            <button title="Đánh giá dịch vụ" onClick={() => setFeedbackInvoice(invoice)} className="rounded-xl border border-yellow-200/40 bg-yellow-50 p-2 text-yellow-700 transition hover:bg-yellow-100"><Star size={13} /></button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </main>

      {selectedInvoice && (
        <div className="fixed inset-0 z-50 flex justify-end bg-slate-950/40 backdrop-blur-sm">
          <div className="flex h-full w-full max-w-lg flex-col overflow-y-auto bg-white p-6 shadow-2xl">
            <div className="flex items-start justify-between border-b border-slate-100 pb-4">
              <div>
                <h3 className="text-base font-extrabold text-slate-800">Hóa đơn {selectedInvoice.invoiceNo}</h3>
                <p className="mt-0.5 text-[10px] font-bold uppercase text-slate-400">Đơn hàng {selectedInvoice.orderCode}</p>
              </div>
              <button onClick={() => setSelectedInvoice(null)} className="rounded-xl p-1.5 text-slate-400 hover:bg-slate-100">×</button>
            </div>

            <div className="flex-grow space-y-6 py-6">
              <div className="flex items-center justify-between rounded-2xl border border-slate-100 bg-slate-50 p-4">
                <div>
                  <span className="text-[9px] font-bold uppercase text-slate-400">Trạng thái thanh toán</span>
                  <p className="mt-0.5 text-sm font-bold text-slate-800">{getStatusStyle(selectedInvoice.status).text}</p>
                </div>
                <span className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-[10px] font-bold ${getStatusStyle(selectedInvoice.status).badge}`}>
                  <span className={`h-1.5 w-1.5 rounded-full ${getStatusStyle(selectedInvoice.status).dot}`} />
                  {selectedInvoice.status}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-4 rounded-2xl border border-slate-100 bg-slate-50 p-4">
                <div><span className="text-[9px] font-bold uppercase text-slate-400">Khách hàng</span><p className="mt-0.5 text-xs font-bold text-slate-800">{selectedInvoice.customerName}</p></div>
                <div><span className="text-[9px] font-bold uppercase text-slate-400">Email</span><p className="mt-0.5 text-xs font-medium text-slate-600">{selectedInvoice.customerEmail || 'N/A'}</p></div>
                <div><span className="text-[9px] font-bold uppercase text-slate-400">Ngày phát hành</span><p className="mt-0.5 text-xs font-medium text-slate-800">{selectedInvoice.issueDate}</p></div>
                <div><span className="text-[9px] font-bold uppercase text-slate-400">Hạn thanh toán</span><p className="mt-0.5 text-xs font-medium text-slate-800">{selectedInvoice.dueDate}</p></div>
              </div>

              <div className="space-y-2.5 border-t border-slate-100 pt-4 text-xs font-bold">
                <div className="flex justify-between text-slate-500"><span>Tạm tính</span><span>{money(selectedInvoice.subTotal)}</span></div>
                <div className="flex justify-between text-rose-600"><span>Giảm giá</span><span>- {money(selectedInvoice.discountAmt)}</span></div>
                <div className="flex justify-between text-slate-500"><span>VAT ({selectedInvoice.vatrate}%)</span><span>{money(selectedInvoice.vatamount)}</span></div>
                <div className="flex justify-between border-t border-slate-100 pt-2 text-base font-black text-slate-900"><span>Tổng thanh toán</span><span className="text-blue-600 text-lg">{money(selectedInvoice.totalAmount)}</span></div>
              </div>

              <div className="flex items-center gap-2 rounded-2xl border border-blue-100/50 bg-blue-50/40 p-3.5 text-[10px] font-medium text-blue-800">
                <ShieldCheck size={16} className="shrink-0 text-blue-600" />
                <span>Hóa đơn chỉ hiển thị cho tài khoản khách hàng sở hữu đơn hàng này.</span>
              </div>

              <div className="grid grid-cols-2 gap-2 pt-4 sm:grid-cols-4">
                <button onClick={() => openPdfInTab(selectedInvoice.pdfpath)} className="rounded-xl bg-slate-100 py-2.5 text-center text-xs font-bold text-slate-800 transition hover:bg-slate-200">Xem PDF</button>
                <button onClick={() => openPdfInTab(selectedInvoice.pdfpath)} className="rounded-xl bg-slate-100 py-2.5 text-center text-xs font-bold text-slate-800 transition hover:bg-slate-200">Tải PDF</button>
                <button onClick={() => handleRequestResendEmail(selectedInvoice.invoiceId)} className="rounded-xl bg-blue-600 py-2.5 text-center text-xs font-bold text-white shadow-sm transition hover:bg-blue-700">Gửi lại Email</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {feedbackInvoice && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md overflow-hidden rounded-3xl border border-slate-100 bg-white p-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-sm font-extrabold text-slate-800">Đánh giá chất lượng dịch vụ</h3>
              <button onClick={() => setFeedbackInvoice(null)} className="rounded-xl p-1.5 text-gray-400 hover:bg-gray-100">×</button>
            </div>

            <div className="space-y-5 py-4">
              <p className="text-xs font-medium text-slate-500">Vui lòng xếp hạng mức độ hài lòng về đơn hàng <strong className="text-slate-800">{feedbackInvoice.orderCode}</strong>.</p>
              <div className="flex flex-col items-center gap-2 rounded-2xl border border-slate-100 bg-slate-50/60 p-4">
                <div className="flex gap-2.5">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button key={star} onClick={() => setRating(star)} className="cursor-pointer transition hover:scale-110 focus:outline-none">
                      <Star size={32} className={`transition-colors ${star <= rating ? 'fill-amber-400 text-amber-400' : 'text-slate-200'}`} />
                    </button>
                  ))}
                </div>
                <span className="mt-2 rounded-full border border-amber-100 bg-amber-50 px-3 py-1 text-xs font-bold text-amber-600">{getRatingLabel(rating)}</span>
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase tracking-wide text-slate-400">Nhận xét</label>
                <textarea value={comment} onChange={(event) => setComment(event.target.value)} placeholder="Quý khách có hài lòng về tốc độ xử lý, bảo quản hàng hóa và thái độ phục vụ không?" rows={4} className="w-full rounded-2xl border border-slate-200 bg-slate-50 p-3 text-xs font-semibold text-slate-800 outline-none focus:ring-2 focus:ring-blue-500/20" />
              </div>
            </div>

            <div className="flex justify-end gap-3 border-t border-slate-100 pt-3">
              <button onClick={() => setFeedbackInvoice(null)} className="rounded-2xl border border-slate-200 px-4 py-2 text-xs font-bold text-slate-600 transition hover:bg-slate-50">Hủy</button>
              <button onClick={handleFeedbackSubmit} disabled={submittingFeedback} className="rounded-2xl bg-blue-600 px-5 py-2 text-xs font-bold text-white shadow-sm transition hover:bg-blue-700 disabled:opacity-50">{submittingFeedback ? 'Đang gửi...' : 'Gửi đánh giá'}</button>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
};

export default PaymentHistory;
