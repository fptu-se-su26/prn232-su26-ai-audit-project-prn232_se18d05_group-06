import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  CheckCircle2,
  Clock3,
  Download,
  Eye,
  FileText,
  Filter,
  Loader2,
  PackageCheck,
  RefreshCw,
  Search,
  Star,
  Truck,
  WalletCards,
} from 'lucide-react';
import Header from './Header';
import Footer from './Footer';
import api from '@lib/api';

type ToastType = 'success' | 'error' | 'info';

interface CustomerOrderSummary {
  orderId: number;
  orderCode: string;
  serviceType: string;
  currentStatus: string;
  currentDisplayStatus: string;
  pickupAddress?: string;
  deliveryAddress?: string;
  destination?: string;
  warehouseName?: string;
  createdAt?: string;
  deliveredAt?: string;
  finalCost?: number;
  hasInvoice: boolean;
  invoiceId?: number;
  invoiceNo?: string;
  invoiceStatus?: string;
  invoicePdfPath?: string;
  hasFeedback: boolean;
}

const serviceLabels: Record<string, string> = {
  IMPORT: 'Nhập kho',
  EXPORT: 'Xuất kho',
  STORAGE: 'Lưu kho',
  TRANSPORT: 'Vận chuyển',
  STANDARD: 'Vận chuyển',
  EXPRESS: 'Giao nhanh',
};

const statusLabels: Record<string, { text: string; badge: string; dot: string }> = {
  DRAFT: { text: 'Nháp', badge: 'bg-slate-50 text-slate-600 border-slate-200', dot: 'bg-slate-400' },
  CREATED: { text: 'Đã tạo đơn', badge: 'bg-blue-50 text-blue-700 border-blue-100', dot: 'bg-blue-500' },
  PENDING: { text: 'Đã tạo đơn', badge: 'bg-blue-50 text-blue-700 border-blue-100', dot: 'bg-blue-500' },
  PENDING_PAYMENT: { text: 'Chờ thanh toán', badge: 'bg-amber-50 text-amber-700 border-amber-100', dot: 'bg-amber-500' },
  CONFIRMED: { text: 'Đã xác nhận', badge: 'bg-indigo-50 text-indigo-700 border-indigo-100', dot: 'bg-indigo-500' },
  PICKING: { text: 'Đang lấy hàng', badge: 'bg-violet-50 text-violet-700 border-violet-100', dot: 'bg-violet-500' },
  IN_STORAGE: { text: 'Đang lưu kho', badge: 'bg-orange-50 text-orange-700 border-orange-100', dot: 'bg-orange-500' },
  DISPATCHED: { text: 'Đang vận chuyển', badge: 'bg-cyan-50 text-cyan-700 border-cyan-100', dot: 'bg-cyan-500' },
  DELIVERED: { text: 'Hoàn thành', badge: 'bg-emerald-50 text-emerald-700 border-emerald-100', dot: 'bg-emerald-500' },
  CANCELLED: { text: 'Đã hủy', badge: 'bg-rose-50 text-rose-700 border-rose-100', dot: 'bg-rose-500' },
};

const invoiceLabels: Record<string, { text: string; badge: string }> = {
  PENDING: { text: 'Chờ thanh toán', badge: 'bg-amber-50 text-amber-700 border-amber-100' },
  PAID: { text: 'Đã thanh toán', badge: 'bg-emerald-50 text-emerald-700 border-emerald-100' },
  PARTIAL: { text: 'Thanh toán một phần', badge: 'bg-cyan-50 text-cyan-700 border-cyan-100' },
  OVERDUE: { text: 'Quá hạn', badge: 'bg-rose-50 text-rose-700 border-rose-100' },
  CANCELLED: { text: 'Đã hủy', badge: 'bg-slate-50 text-slate-600 border-slate-200' },
};

const formatMoney = (value?: number) => {
  if (value === null || value === undefined) return 'Đang tính phí';
  return `${Number(value).toLocaleString('vi-VN')} đ`;
};

const formatDate = (value?: string) => {
  if (!value) return '-';
  return new Intl.DateTimeFormat('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' }).format(new Date(value));
};

const normalize = (value?: string) => (value || '').trim().toUpperCase();

const getErrorMessage = (err: any, fallback: string) => {
  const data = err?.response?.data;
  if (typeof data === 'string') return data;
  return data?.message || data?.Message || err?.message || fallback;
};

const getStatusMeta = (status?: string, display?: string) => {
  const key = normalize(status);
  return statusLabels[key] || {
    text: display || status || 'Chưa có trạng thái',
    badge: 'bg-slate-50 text-slate-600 border-slate-200',
    dot: 'bg-slate-400',
  };
};

const getInvoiceMeta = (status?: string, hasInvoice?: boolean) => {
  if (!hasInvoice) return { text: 'Chưa có hóa đơn', badge: 'bg-slate-50 text-slate-600 border-slate-200' };
  return invoiceLabels[normalize(status)] || { text: status || 'Chưa rõ', badge: 'bg-slate-50 text-slate-600 border-slate-200' };
};

const isProcessing = (status?: string) => !['DELIVERED', 'CANCELLED'].includes(normalize(status));

const OrderHistory: React.FC = () => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState<CustomerOrderSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [keyword, setKeyword] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [serviceFilter, setServiceFilter] = useState('all');
  const [timeFilter, setTimeFilter] = useState('30');
  const [toast, setToast] = useState<{ message: string; type: ToastType } | null>(null);
  const [feedbackOrder, setFeedbackOrder] = useState<CustomerOrderSummary | null>(null);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [busyAction, setBusyAction] = useState<string | null>(null);
  const [submittingFeedback, setSubmittingFeedback] = useState(false);

  const showToast = (message: string, type: ToastType = 'info') => {
    setToast({ message, type });
    window.setTimeout(() => setToast(null), 4200);
  };

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const res = await api.get<CustomerOrderSummary[]>('/customer/orders');
      setOrders(res.data || []);
    } catch (err) {
      showToast(getErrorMessage(err, 'Không thể tải danh sách đơn hàng.'), 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const stats = useMemo(() => {
    const delivered = orders.filter((order) => normalize(order.currentStatus) === 'DELIVERED');
    return {
      total: orders.length,
      processing: orders.filter((order) => isProcessing(order.currentStatus)).length,
      delivered: delivered.length,
      awaitingFeedback: delivered.filter((order) => !order.hasFeedback).length,
    };
  }, [orders]);

  const filteredOrders = useMemo(() => {
    const q = keyword.trim().toLowerCase();
    const now = Date.now();
    const days = timeFilter === 'all' ? null : Number(timeFilter);

    return orders.filter((order) => {
      const searchText = [
        order.orderCode,
        order.destination,
        order.warehouseName,
        order.deliveryAddress,
        order.pickupAddress,
        order.invoiceNo,
      ].join(' ').toLowerCase();
      const matchesKeyword = !q || searchText.includes(q);
      const matchesStatus = statusFilter === 'all' || normalize(order.currentStatus) === statusFilter;
      const matchesService = serviceFilter === 'all' || normalize(order.serviceType) === serviceFilter;
      const createdAt = order.createdAt ? new Date(order.createdAt).getTime() : 0;
      const matchesTime = !days || !createdAt || now - createdAt <= days * 24 * 60 * 60 * 1000;
      return matchesKeyword && matchesStatus && matchesService && matchesTime;
    });
  }, [keyword, orders, serviceFilter, statusFilter, timeFilter]);

  const openDetails = (order: CustomerOrderSummary) => {
    navigate(`/order-details?id=${order.orderId}&code=${encodeURIComponent(order.orderCode)}`);
  };

  const handlePdfAction = async (order: CustomerOrderSummary, mode: 'view' | 'download') => {
    if (!order.invoiceId) {
      showToast('Đơn hàng này chưa có hóa đơn để mở.', 'error');
      return;
    }

    const actionKey = `${mode}-${order.invoiceId}`;
    try {
      setBusyAction(actionKey);
      const response = await api.get(`/customer/invoices/${order.invoiceId}/pdf`, {
        responseType: 'blob',
        params: { download: mode === 'download' },
      });
      const blob = new Blob([response.data], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);

      if (mode === 'view') {
        const opened = window.open(url, '_blank', 'noopener,noreferrer');
        if (!opened) {
          showToast('Trình duyệt đã chặn tab PDF. Vui lòng cho phép pop-up rồi thử lại.', 'error');
          URL.revokeObjectURL(url);
          return;
        }
        showToast(`Đã mở PDF ${order.invoiceNo || order.orderCode}.`, 'success');
        window.setTimeout(() => URL.revokeObjectURL(url), 30000);
        return;
      }

      const link = document.createElement('a');
      link.href = url;
      link.download = `${order.invoiceNo || order.orderCode}.pdf`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.setTimeout(() => URL.revokeObjectURL(url), 1000);
      showToast(`Đã tải PDF ${order.invoiceNo || order.orderCode}.`, 'success');
    } catch (err) {
      showToast(getErrorMessage(err, mode === 'view' ? 'Không thể mở PDF hóa đơn.' : 'Không thể tải PDF hóa đơn.'), 'error');
    } finally {
      setBusyAction(null);
    }
  };

  const openPayment = (order: CustomerOrderSummary) => {
    if (!order.invoiceId) {
      showToast('Đơn hàng chưa có hóa đơn thanh toán.', 'error');
      return;
    }
    navigate(`/payment?orderId=${order.orderId}`, { state: { invoiceId: order.invoiceId } });
  };

  const openFeedback = (order: CustomerOrderSummary) => {
    if (normalize(order.currentStatus) !== 'DELIVERED') {
      showToast('Bạn chỉ có thể đánh giá đơn hàng đã hoàn thành.', 'error');
      return;
    }
    if (order.hasFeedback) {
      showToast('Bạn đã gửi đánh giá cho đơn hàng này.', 'info');
      return;
    }
    setFeedbackOrder(order);
    setRating(5);
    setComment('');
  };

  const submitFeedback = async () => {
    if (!feedbackOrder) return;
    if (!rating) {
      showToast('Vui lòng chọn số sao đánh giá.', 'error');
      return;
    }
    if (comment.length > 1000) {
      showToast('Nội dung phản hồi không được vượt quá 1000 ký tự.', 'error');
      return;
    }

    try {
      setSubmittingFeedback(true);
      await api.post(`/customer/orders/${feedbackOrder.orderId}/feedback`, {
        starRating: rating,
        comment,
      });
      showToast('Đã gửi đánh giá dịch vụ thành công.', 'success');
      setFeedbackOrder(null);
      setComment('');
      setRating(5);
      await fetchOrders();
    } catch (err) {
      showToast(getErrorMessage(err, 'Gửi đánh giá thất bại.'), 'error');
    } finally {
      setSubmittingFeedback(false);
    }
  };

  const renderActionSpinner = (key: string) => busyAction === key ? <Loader2 size={14} className="animate-spin" /> : null;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-950">
      <Header scrollY={51} />

      {toast && (
        <div className={`fixed right-4 top-24 z-[70] flex max-w-md items-center gap-2.5 rounded-2xl border px-4 py-3 text-sm font-bold shadow-xl backdrop-blur-xl ${toast.type === 'success' ? 'border-emerald-100 bg-emerald-50/95 text-emerald-800' : toast.type === 'error' ? 'border-rose-100 bg-rose-50/95 text-rose-800' : 'border-blue-100 bg-blue-50/95 text-blue-800'}`}>
          <div className={`h-2 w-2 rounded-full ${toast.type === 'success' ? 'bg-emerald-500' : toast.type === 'error' ? 'bg-rose-500' : 'bg-blue-500'}`} />
          {toast.message}
        </div>
      )}

      <main className="mx-auto flex w-full max-w-[1440px] flex-col gap-6 px-4 pb-20 pt-28 sm:px-6 lg:px-8">
        <section className="overflow-hidden rounded-[2rem] border border-blue-100 bg-white shadow-[0_24px_80px_rgba(15,23,42,0.08)]">
          <div className="relative bg-[linear-gradient(135deg,#eef6ff_0%,#ffffff_54%,#e6fbff_100%)] px-5 py-8 sm:px-8 lg:px-10">
            <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
              <div className="max-w-3xl">
                <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-blue-200 bg-white/80 px-4 py-2 text-xs font-black uppercase tracking-[0.24em] text-blue-700">
                  Customer Portal
                </div>
                <h1 className="text-4xl font-black tracking-tight text-slate-950 sm:text-5xl">Đơn hàng của tôi</h1>
                <p className="mt-3 max-w-2xl text-base font-semibold leading-7 text-slate-600">
                  Theo dõi trạng thái đơn logistics, hóa đơn PDF và đánh giá chất lượng dịch vụ sau khi hoàn thành.
                </p>
              </div>
              <div className="flex flex-col gap-3 sm:flex-row">
                <button
                  onClick={fetchOrders}
                  className="inline-flex items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-black text-slate-800 shadow-sm transition hover:border-blue-200 hover:text-blue-700"
                >
                  <RefreshCw size={17} className={loading ? 'animate-spin' : ''} />
                  Làm mới
                </button>
                <button
                  onClick={() => navigate('/create-shipment')}
                  className="inline-flex items-center justify-center gap-2 rounded-2xl bg-blue-600 px-5 py-3 text-sm font-black text-white shadow-lg shadow-blue-600/25 transition hover:bg-blue-700"
                >
                  <Truck size={17} />
                  Tạo đơn mới
                </button>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 border-t border-slate-100 bg-white p-5 sm:grid-cols-2 lg:grid-cols-4 lg:p-6">
            {[
              { label: 'Tổng đơn hàng', value: stats.total, icon: PackageCheck, tone: 'blue' },
              { label: 'Đang xử lý', value: stats.processing, icon: Clock3, tone: 'amber' },
              { label: 'Hoàn thành', value: stats.delivered, icon: CheckCircle2, tone: 'emerald' },
              { label: 'Chờ đánh giá', value: stats.awaitingFeedback, icon: Star, tone: 'rose' },
            ].map((card) => {
              const Icon = card.icon;
              const toneClass = card.tone === 'blue' ? 'bg-blue-50 text-blue-700' : card.tone === 'amber' ? 'bg-amber-50 text-amber-700' : card.tone === 'emerald' ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700';
              return (
                <div key={card.label} className="rounded-3xl border border-slate-100 bg-slate-50/70 p-5 shadow-sm">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-xs font-black uppercase tracking-[0.16em] text-slate-500">{card.label}</p>
                      <p className="mt-3 text-4xl font-black text-slate-950">{card.value}</p>
                    </div>
                    <div className={`rounded-2xl p-3 ${toneClass}`}>
                      <Icon size={22} />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        <section className="rounded-[1.5rem] border border-slate-100 bg-white p-4 shadow-[0_14px_40px_rgba(15,23,42,0.05)]">
          <div className="grid grid-cols-1 gap-3 lg:grid-cols-[1.5fr_1fr_1fr_1fr_auto]">
            <label className="relative block">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={19} />
              <input
                value={keyword}
                onChange={(event) => setKeyword(event.target.value)}
                className="h-12 w-full rounded-2xl border border-slate-200 bg-slate-50 pl-12 pr-4 text-sm font-semibold outline-none transition focus:border-blue-300 focus:bg-white focus:ring-4 focus:ring-blue-100"
                placeholder="Tìm mã đơn, điểm đến, kho..."
              />
            </label>
            <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)} className="h-12 rounded-2xl border border-slate-200 bg-slate-50 px-4 text-sm font-bold outline-none focus:border-blue-300 focus:bg-white focus:ring-4 focus:ring-blue-100">
              <option value="all">Trạng thái: Tất cả</option>
              <option value="CONFIRMED">Đã xác nhận</option>
              <option value="PICKING">Đang lấy hàng</option>
              <option value="IN_STORAGE">Đang lưu kho</option>
              <option value="DISPATCHED">Đang vận chuyển</option>
              <option value="DELIVERED">Hoàn thành</option>
              <option value="CANCELLED">Đã hủy</option>
            </select>
            <select value={timeFilter} onChange={(event) => setTimeFilter(event.target.value)} className="h-12 rounded-2xl border border-slate-200 bg-slate-50 px-4 text-sm font-bold outline-none focus:border-blue-300 focus:bg-white focus:ring-4 focus:ring-blue-100">
              <option value="30">30 ngày qua</option>
              <option value="90">90 ngày qua</option>
              <option value="365">12 tháng qua</option>
              <option value="all">Tất cả thời gian</option>
            </select>
            <select value={serviceFilter} onChange={(event) => setServiceFilter(event.target.value)} className="h-12 rounded-2xl border border-slate-200 bg-slate-50 px-4 text-sm font-bold outline-none focus:border-blue-300 focus:bg-white focus:ring-4 focus:ring-blue-100">
              <option value="all">Dịch vụ: Tất cả</option>
              <option value="IMPORT">Nhập kho</option>
              <option value="EXPORT">Xuất kho</option>
              <option value="STORAGE">Lưu kho</option>
              <option value="TRANSPORT">Vận chuyển</option>
            </select>
            <button className="inline-flex h-12 items-center justify-center gap-2 rounded-2xl bg-slate-950 px-5 text-sm font-black text-white transition hover:bg-blue-700">
              <Filter size={17} />
              Lọc dữ liệu
            </button>
          </div>
        </section>

        <section className="overflow-hidden rounded-[1.75rem] border border-slate-100 bg-white shadow-[0_24px_80px_rgba(15,23,42,0.07)]">
          <div className="flex flex-col gap-2 border-b border-slate-100 px-5 py-5 sm:flex-row sm:items-center sm:justify-between lg:px-7">
            <div>
              <h2 className="text-2xl font-black text-slate-950">Danh sách đơn hàng</h2>
              <p className="mt-1 text-sm font-semibold text-slate-500">{filteredOrders.length} đơn phù hợp với bộ lọc hiện tại.</p>
            </div>
          </div>

          {loading ? (
            <div className="flex min-h-[340px] flex-col items-center justify-center gap-4 text-slate-500">
              <Loader2 className="animate-spin text-blue-600" size={34} />
              <p className="font-bold">Đang tải đơn hàng...</p>
            </div>
          ) : filteredOrders.length === 0 ? (
            <div className="flex min-h-[340px] flex-col items-center justify-center px-6 text-center">
              <div className="mb-5 rounded-3xl bg-blue-50 p-5 text-blue-700">
                <PackageCheck size={38} />
              </div>
              <h3 className="text-xl font-black text-slate-950">Không tìm thấy đơn hàng phù hợp</h3>
              <p className="mt-2 max-w-md text-sm font-semibold text-slate-500">Vui lòng thay đổi bộ lọc hoặc tạo đơn logistics mới để bắt đầu theo dõi.</p>
              <button onClick={() => navigate('/create-shipment')} className="mt-6 rounded-2xl bg-blue-600 px-5 py-3 text-sm font-black text-white shadow-lg shadow-blue-600/20 transition hover:bg-blue-700">
                Tạo đơn mới
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[1120px] text-left">
                <thead className="bg-slate-50 text-xs font-black uppercase tracking-[0.12em] text-slate-500">
                  <tr>
                    <th className="px-6 py-4">Mã đơn hàng</th>
                    <th className="px-6 py-4">Dịch vụ</th>
                    <th className="px-6 py-4">Điểm đến / Kho</th>
                    <th className="px-6 py-4">Trạng thái</th>
                    <th className="px-6 py-4">Ngày</th>
                    <th className="px-6 py-4 text-right">Chi phí</th>
                    <th className="px-6 py-4">Thanh toán</th>
                    <th className="px-6 py-4 text-right">Thao tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredOrders.map((order) => {
                    const status = getStatusMeta(order.currentStatus, order.currentDisplayStatus);
                    const invoice = getInvoiceMeta(order.invoiceStatus, order.hasInvoice);
                    const delivered = normalize(order.currentStatus) === 'DELIVERED';
                    const canRate = delivered && !order.hasFeedback;
                    const canPay = order.hasInvoice && !['PAID', 'CANCELLED'].includes(normalize(order.invoiceStatus));
                    return (
                      <tr key={order.orderId} className="transition hover:bg-blue-50/35">
                        <td className="px-6 py-5 align-top">
                          <button onClick={() => openDetails(order)} className="text-left text-base font-black text-blue-700 hover:text-blue-900">
                            {order.orderCode}
                          </button>
                          <p className="mt-1 text-xs font-bold uppercase tracking-[0.14em] text-slate-400">{order.invoiceNo || 'Chưa có hóa đơn'}</p>
                        </td>
                        <td className="px-6 py-5 align-top">
                          <span className="inline-flex rounded-full border border-blue-100 bg-blue-50 px-3 py-1 text-xs font-black text-blue-700">
                            {serviceLabels[normalize(order.serviceType)] || order.serviceType}
                          </span>
                        </td>
                        <td className="max-w-[260px] px-6 py-5 align-top">
                          <p className="font-bold text-slate-900">{order.destination || order.warehouseName || order.deliveryAddress || 'Chưa cập nhật'}</p>
                          <p className="mt-1 text-xs font-semibold text-slate-500">{order.warehouseName || order.pickupAddress || 'SmartLog AI'}</p>
                        </td>
                        <td className="px-6 py-5 align-top">
                          <span className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-black ${status.badge}`}>
                            <span className={`h-2 w-2 rounded-full ${status.dot}`} />
                            {status.text}
                          </span>
                        </td>
                        <td className="px-6 py-5 align-top">
                          <p className="text-sm font-bold text-slate-900">{delivered ? 'Hoàn thành' : 'Ngày tạo'}</p>
                          <p className="mt-1 text-sm font-semibold text-slate-500">{formatDate(delivered ? order.deliveredAt : order.createdAt)}</p>
                        </td>
                        <td className="px-6 py-5 text-right align-top">
                          <p className="font-black text-slate-950">{formatMoney(order.finalCost)}</p>
                        </td>
                        <td className="px-6 py-5 align-top">
                          <span className={`inline-flex rounded-full border px-3 py-1.5 text-xs font-black ${invoice.badge}`}>
                            {invoice.text}
                          </span>
                        </td>
                        <td className="px-6 py-5 align-top">
                          <div className="flex flex-wrap justify-end gap-2">
                            <button onClick={() => openDetails(order)} className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-black text-slate-700 transition hover:border-blue-200 hover:text-blue-700">
                              <Eye size={14} /> Xem
                            </button>
                            {order.hasInvoice && (
                              <>
                                <button onClick={() => handlePdfAction(order, 'view')} className="inline-flex items-center gap-1.5 rounded-xl border border-blue-100 bg-blue-50 px-3 py-2 text-xs font-black text-blue-700 transition hover:bg-blue-100">
                                  {renderActionSpinner(`view-${order.invoiceId}`) || <FileText size={14} />} PDF
                                </button>
                                <button onClick={() => handlePdfAction(order, 'download')} className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-black text-slate-700 transition hover:border-blue-200 hover:text-blue-700">
                                  {renderActionSpinner(`download-${order.invoiceId}`) || <Download size={14} />} Tải
                                </button>
                              </>
                            )}
                            {canPay && (
                              <button onClick={() => openPayment(order)} className="inline-flex items-center gap-1.5 rounded-xl border border-amber-100 bg-amber-50 px-3 py-2 text-xs font-black text-amber-700 transition hover:bg-amber-100">
                                <WalletCards size={14} /> Thanh toán
                              </button>
                            )}
                            {canRate ? (
                              <button onClick={() => openFeedback(order)} className="inline-flex items-center gap-1.5 rounded-xl border border-rose-100 bg-rose-50 px-3 py-2 text-xs font-black text-rose-700 transition hover:bg-rose-100">
                                <Star size={14} /> Đánh giá
                              </button>
                            ) : delivered && order.hasFeedback ? (
                              <span className="inline-flex items-center gap-1.5 rounded-xl border border-emerald-100 bg-emerald-50 px-3 py-2 text-xs font-black text-emerald-700">
                                <CheckCircle2 size={14} /> Đã đánh giá
                              </span>
                            ) : null}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </main>

      {feedbackOrder && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center bg-slate-950/50 px-4 backdrop-blur-sm">
          <div className="w-full max-w-xl rounded-[2rem] bg-white p-6 shadow-2xl sm:p-7">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.2em] text-blue-700">Đánh giá dịch vụ</p>
                <h3 className="mt-2 text-2xl font-black text-slate-950">{feedbackOrder.orderCode}</h3>
                <p className="mt-1 text-sm font-semibold text-slate-500">
                  {serviceLabels[normalize(feedbackOrder.serviceType)] || feedbackOrder.serviceType} · {feedbackOrder.warehouseName || feedbackOrder.destination || 'SmartLog AI'}
                </p>
              </div>
              <button onClick={() => setFeedbackOrder(null)} className="rounded-full bg-slate-100 px-3 py-1.5 text-sm font-black text-slate-500 hover:bg-slate-200">×</button>
            </div>

            <div className="mt-7 rounded-3xl bg-slate-50 p-5">
              <p className="mb-3 text-sm font-black text-slate-800">Bạn đánh giá dịch vụ này như thế nào?</p>
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    onClick={() => setRating(star)}
                    className={`rounded-2xl p-2 transition ${star <= rating ? 'bg-amber-100 text-amber-500' : 'bg-white text-slate-300 hover:text-amber-400'}`}
                    aria-label={`${star} sao`}
                  >
                    <Star size={30} fill={star <= rating ? 'currentColor' : 'none'} />
                  </button>
                ))}
              </div>
              <p className="mt-3 text-sm font-bold text-slate-600">{rating <= 2 ? 'Chúng tôi sẽ chuyển phản hồi này để bộ phận vận hành theo dõi.' : 'Cảm ơn bạn đã chia sẻ trải nghiệm.'}</p>
            </div>

            <label className="mt-5 block">
              <span className="text-sm font-black text-slate-800">Nhận xét</span>
              <textarea
                value={comment}
                onChange={(event) => setComment(event.target.value)}
                maxLength={1000}
                rows={5}
                className="mt-2 w-full resize-none rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold outline-none transition focus:border-blue-300 focus:bg-white focus:ring-4 focus:ring-blue-100"
                placeholder="Nhập phản hồi của bạn về chất lượng phục vụ, thời gian xử lý hoặc tình trạng hàng hóa..."
              />
              <span className="mt-1 block text-right text-xs font-bold text-slate-400">{comment.length}/1000</span>
            </label>

            <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <button onClick={() => setFeedbackOrder(null)} className="rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-black text-slate-700 transition hover:bg-slate-50">
                Hủy
              </button>
              <button onClick={submitFeedback} disabled={submittingFeedback} className="inline-flex items-center justify-center gap-2 rounded-2xl bg-blue-600 px-5 py-3 text-sm font-black text-white shadow-lg shadow-blue-600/20 transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60">
                {submittingFeedback && <Loader2 size={16} className="animate-spin" />}
                Gửi đánh giá
              </button>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
};

export default OrderHistory;