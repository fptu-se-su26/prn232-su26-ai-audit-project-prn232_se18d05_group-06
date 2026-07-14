import React, { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Clock3,
  CreditCard,
  Gift,
  Loader2,
  LockKeyhole,
  MapPin,
  PackageCheck,
  QrCode,
  ShieldCheck,
  Sparkles,
  Truck,
  WalletCards,
  XCircle,
} from 'lucide-react';
import Header from './Header';
import Footer from './Footer';
import api from '../../lib/api';

type PayOsPaymentLink = {
  orderId: number;
  orderCode: string;
  payOsOrderCode: number;
  amount: number;
  originalAmount?: number;
  discountAmount?: number;
  voucherCode?: string | null;
  status: string;
  checkoutUrl: string;
  qrCode?: string | null;
  paymentLinkId?: string | null;
};

type PayOsPaymentStatus = {
  orderId: number;
  orderCode: string;
  amount: number;
  originalAmount?: number;
  discountAmount?: number;
  voucherCode?: string | null;
  orderStatus: string;
  invoiceStatus: string;
  paymentStatus: string;
  checkoutUrl?: string | null;
  paymentLinkId?: string | null;
  paidAt?: string | null;
};

type PaymentVoucher = {
  voucherId: number;
  voucherCode: string;
  title: string;
  description: string;
  discountAmount: number;
  discountPct: number;
  minOrderValue: number;
  validTo: string;
  isEligible: boolean;
  ineligibleReason: string;
};

type CustomerOrderSummary = {
  orderId: number;
  orderCode: string;
  serviceType: string;
  currentStatus: string;
  currentDisplayStatus: string;
  pickupAddress?: string | null;
  deliveryAddress?: string | null;
  createdAt?: string | null;
  deliveredAt?: string | null;
  finalCost?: number | null;
};

const formatMoney = (value?: number | null) => {
  if (value == null) return '--';
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    maximumFractionDigits: 0,
  }).format(value);
};

const formatDateTime = (value?: string | null) => {
  if (!value) return '--';
  return new Intl.DateTimeFormat('vi-VN', {
    hour: '2-digit',
    minute: '2-digit',
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(new Date(value));
};

const normalizeStatus = (value?: string | null) => (value ?? '').toUpperCase();

const readApiMessage = (err: any, fallback: string) =>
  err?.response?.data?.message || err?.response?.data?.Message || err?.message || fallback;

const PaymentPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const orderId = Number(searchParams.get('orderId') ?? 0);
  const initialPaymentLink =
    (location.state as { paymentLink?: PayOsPaymentLink | null; paymentError?: string } | null)?.paymentLink ?? null;

  const [paymentLink, setPaymentLink] = useState<PayOsPaymentLink | null>(initialPaymentLink);
  const [paymentStatus, setPaymentStatus] = useState<PayOsPaymentStatus | null>(null);
  const [orderSummary, setOrderSummary] = useState<CustomerOrderSummary | null>(null);
  const [vouchers, setVouchers] = useState<PaymentVoucher[]>([]);
  const [selectedVoucherCode, setSelectedVoucherCode] = useState(initialPaymentLink?.voucherCode ?? '');
  const [loading, setLoading] = useState(true);
  const [creatingLink, setCreatingLink] = useState(false);

  const returnedFromPayOs = useMemo(() => {
    return Boolean(searchParams.get('code') || searchParams.get('status') || searchParams.get('cancel'));
  }, [searchParams]);

  const loadOrderSummary = async () => {
    if (!orderId) return null;
    const response = await api.get<CustomerOrderSummary[]>('/customer/orders');
    const found = response.data.find((order) => Number(order.orderId) === orderId) ?? null;
    setOrderSummary(found);
    return found;
  };

  const loadVouchers = async () => {
    if (!orderId) return;
    const response = await api.get<PaymentVoucher[]>(`/payments/vouchers/${orderId}`);
    setVouchers(response.data ?? []);
  };

  const loadStatus = async () => {
    if (!orderId) return null;
    const response = await api.get<PayOsPaymentStatus>(`/payments/payos/status/${orderId}`);
    const status = response.data;
    setPaymentStatus(status);
    if (status?.voucherCode) setSelectedVoucherCode(status.voucherCode);
    if (status?.checkoutUrl) {
      setPaymentLink((current) =>
        current?.checkoutUrl
          ? current
          : {
              orderId: status.orderId,
              orderCode: status.orderCode,
              payOsOrderCode: Number(status.paymentLinkId ?? 0),
              amount: status.amount,
              originalAmount: status.originalAmount,
              discountAmount: status.discountAmount,
              voucherCode: status.voucherCode,
              status: status.paymentStatus,
              checkoutUrl: status.checkoutUrl ?? '',
              qrCode: null,
              paymentLinkId: status.paymentLinkId,
            },
      );
    }
    return status;
  };

  const syncReturn = async () => {
    const payload = Object.fromEntries(searchParams.entries());
    const response = await api.post<PayOsPaymentStatus>('/payments/payos/sync-return', payload);
    setPaymentStatus(response.data);
    return response.data;
  };

  const refreshPageData = async () => {
    const [status] = await Promise.all([loadStatus(), loadOrderSummary(), loadVouchers()]);
    return status;
  };

  const createPaymentLink = async (voucherCode = selectedVoucherCode) => {
    if (!orderId) return;
    setCreatingLink(true);
    try {
      const response = await api.post<PayOsPaymentLink>('/payments/payos/create-link', {
        orderId,
        voucherCode: voucherCode || undefined,
      });
      setPaymentLink(response.data);
      setSelectedVoucherCode(response.data.voucherCode ?? voucherCode ?? '');
      await refreshPageData();
    } catch (err) {
      console.warn(readApiMessage(err, 'Không thể tạo link thanh toán.'));
    } finally {
      setCreatingLink(false);
    }
  };

  useEffect(() => {
    if (!orderId) {
      navigate('/create-shipment', { replace: true });
      return;
    }

    if (searchParams.get('cancel') === 'true') {
      navigate('/', { replace: true });
      return;
    }

    const init = async () => {
      setLoading(true);
      try {
        if (returnedFromPayOs) {
          const syncedStatus = await syncReturn();
          const successFromReturn =
            normalizeStatus(syncedStatus?.paymentStatus) === 'PAID' ||
            normalizeStatus(syncedStatus?.invoiceStatus) === 'PAID' ||
            searchParams.get('code') === '00' ||
            normalizeStatus(searchParams.get('status')) === 'PAID';

          if (successFromReturn) {
            navigate('/order-history', { replace: true });
            return;
          }
        }

        await refreshPageData();
      } catch (err) {
        console.warn(readApiMessage(err, 'Không thể tải thông tin thanh toán.'));
      } finally {
        setLoading(false);
      }
    };

    init();
  }, [orderId, returnedFromPayOs]);

  const paid =
    normalizeStatus(paymentStatus?.paymentStatus) === 'PAID' || normalizeStatus(paymentStatus?.invoiceStatus) === 'PAID';
  const cancelled = normalizeStatus(paymentStatus?.paymentStatus) === 'CANCELLED';
  const statusHasAppliedVoucher = Boolean(paymentStatus?.voucherCode || (paymentStatus?.discountAmount ?? 0) > 0);
  const linkHasAppliedVoucher = Boolean(paymentLink?.voucherCode || (paymentLink?.discountAmount ?? 0) > 0);
  const paymentView = statusHasAppliedVoucher
    ? paymentStatus
    : linkHasAppliedVoucher
      ? paymentLink
      : paymentStatus ?? paymentLink;

  let originalAmount = paymentView?.originalAmount ?? orderSummary?.finalCost ?? paymentView?.amount ?? 0;
  let discountAmount = paymentView?.discountAmount ?? 0;
  let amount = paymentView?.amount ?? orderSummary?.finalCost ?? 0;
  const appliedVoucherCode = paymentView?.voucherCode ?? null;

  const selectedVoucher = vouchers.find((v) => v.voucherCode === selectedVoucherCode);
  const isPreviewingNew = Boolean(selectedVoucher && selectedVoucherCode !== appliedVoucherCode);
  const isPreviewingRemoval = Boolean(!selectedVoucherCode && appliedVoucherCode);
  const isPreviewing = isPreviewingNew || isPreviewingRemoval;

  if (isPreviewing && !paid) {
    if (isPreviewingRemoval) {
      discountAmount = 0;
      amount = originalAmount;
    } else if (selectedVoucher) {
      const percentDiscount = originalAmount * ((selectedVoucher.discountPct ?? 0) / 100);
      const fixedDiscount = selectedVoucher.discountAmount ?? 0;
      discountAmount = Math.max(percentDiscount, fixedDiscount);
      amount = Math.max(0, originalAmount - discountAmount);
    }
  }

  const displayVoucherCode = isPreviewing ? (selectedVoucherCode || null) : appliedVoucherCode;
  const orderCode = paymentView?.orderCode ?? orderSummary?.orderCode ?? (orderId ? `#${orderId}` : '--');
  const checkoutUrl = paymentView?.checkoutUrl ?? undefined;
  const checkoutReady = Boolean(checkoutUrl) && !isPreviewing;
  const paymentLabel = paid ? 'Đã thanh toán' : cancelled ? 'Đã hủy' : checkoutReady ? 'Sẵn sàng thanh toán' : 'Chờ PayOS';

  return (
    <div className="light-surface min-h-screen bg-[#eef3f8] text-slate-950">
      <Header scrollY={100} />

      <main className="mx-auto max-w-7xl px-4 pb-20 pt-28 sm:px-6 lg:px-8">
        <button
          onClick={() => navigate('/create-shipment')}
          className="mb-5 inline-flex h-11 items-center gap-2 rounded-full border border-slate-200 bg-white px-4 text-sm font-bold text-slate-700 shadow-sm transition hover:border-blue-200 hover:bg-blue-50"
        >
          <ArrowLeft size={17} />
          Quay lại tạo đơn
        </button>

        <section className="overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-[0_24px_80px_rgba(15,23,42,0.10)]">
          <div className="relative bg-[radial-gradient(circle_at_top_left,#dbeafe,transparent_34%),linear-gradient(135deg,#ffffff_0%,#eef6ff_48%,#e8fff7_100%)] px-6 py-8 text-slate-950 sm:px-9 lg:px-12">
            <div className="absolute inset-x-0 top-0 h-1.5 bg-gradient-to-r from-blue-700 via-cyan-500 to-emerald-500" />
            <div className="relative grid gap-7 lg:grid-cols-[minmax(0,1fr)_360px] lg:items-end">
              <div>
                <p className="inline-flex items-center gap-2 rounded-full border border-blue-100 bg-white/85 px-3 py-1 text-xs font-black uppercase tracking-wide text-blue-700 shadow-sm">
                  <Sparkles size={15} />
                  Checkout SmartLog
                </p>
                <h1 className="mt-5 max-w-2xl text-3xl font-black leading-tight text-slate-950 sm:text-5xl">
                  Thanh toán đơn hàng
                </h1>
                <p className="mt-4 max-w-2xl text-base font-semibold leading-relaxed text-slate-600">
                  Kiểm tra tuyến giao nhận, chọn voucher phù hợp và hoàn tất thanh toán qua PayOS để đơn được xử lý.
                </p>
              </div>

              <div className="rounded-[26px] border border-white bg-white p-5 shadow-[0_18px_50px_rgba(15,23,42,0.14)]">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-xs font-black uppercase tracking-wide text-slate-500">Cần thanh toán</p>
                    <p className="mt-2 text-3xl font-black tracking-tight text-slate-950">{formatMoney(amount)}</p>
                  </div>
                  <span className="grid h-12 w-12 place-items-center rounded-2xl bg-blue-50 text-blue-700">
                    <WalletCards size={23} />
                  </span>
                </div>
                <div className="mt-5 grid grid-cols-[84px_1fr] gap-3 rounded-2xl bg-slate-100 px-4 py-3 text-sm">
                  <span className="font-black uppercase text-slate-500">Mã đơn</span>
                  <span className="truncate text-right font-black text-blue-700">{orderCode}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="grid gap-0 lg:grid-cols-[minmax(0,1fr)_420px]">
            <div className="space-y-6 p-5 sm:p-7 lg:p-8">
              <RouteCard
                serviceType={orderSummary?.serviceType ?? 'Vận chuyển'}
                status={paymentLabel}
                pickup={orderSummary?.pickupAddress ?? 'Điểm lấy hàng chưa cập nhật'}
                delivery={orderSummary?.deliveryAddress ?? 'Điểm giao hàng chưa cập nhật'}
              />

              <VoucherSelector
                vouchers={vouchers}
                selectedVoucherCode={selectedVoucherCode}
                appliedVoucherCode={appliedVoucherCode}
                applying={creatingLink}
                onSelect={setSelectedVoucherCode}
                onApply={() => createPaymentLink(selectedVoucherCode)}
              />
            </div>

            <aside className="border-t border-slate-100 bg-slate-50 p-5 sm:p-7 lg:border-l lg:border-t-0 lg:p-8">
              <div className="sticky top-24 space-y-5">
                <CheckoutSummary
                  orderCode={orderCode}
                  createdAt={formatDateTime(orderSummary?.createdAt)}
                  orderStatus={orderSummary?.currentDisplayStatus ?? paymentStatus?.orderStatus ?? '--'}
                  invoiceStatus={paymentStatus?.invoiceStatus ?? 'Chưa phát sinh'}
                  paymentStatus={paymentStatus?.paymentStatus ?? 'Chưa thanh toán'}
                  originalAmount={originalAmount}
                  discountAmount={discountAmount}
                  amount={amount}
                  appliedVoucherCode={displayVoucherCode}
                  checkoutReady={checkoutReady}
                  checkoutUrl={checkoutUrl}
                  paid={paid}
                  loading={loading}
                  onCreateLink={() => createPaymentLink()}
                />

                <ProcessCard paid={paid} />
              </div>
            </aside>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

const PaymentActionCard = ({
  loading,
  creatingLink,
  paid,
  cancelled,
  checkoutReady,
  checkoutUrl,
  qrCode,
  onCreateLink,
  onTrack,
}: {
  loading: boolean;
  creatingLink: boolean;
  paid: boolean;
  cancelled: boolean;
  checkoutReady: boolean;
  checkoutUrl?: string;
  qrCode?: string | null;
  onCreateLink: () => void;
  onTrack: () => void;
}) => {
  const canRenderQr = Boolean(qrCode && (qrCode.startsWith('data:image') || qrCode.startsWith('http')));
  const copy = paid
    ? {
        icon: <CheckCircle2 size={30} />,
        title: 'Thanh toán thành công',
        description: 'Đơn đã được xác nhận. Bạn có thể theo dõi hành trình xử lý ngay bây giờ.',
        tone: 'border-emerald-200 bg-emerald-50 text-emerald-700',
      }
    : cancelled
      ? {
          icon: <XCircle size={30} />,
          title: 'Thanh toán đã hủy',
          description: 'Bạn có thể tạo lại link PayOS để tiếp tục xác nhận đơn hàng.',
          tone: 'border-rose-200 bg-rose-50 text-rose-700',
        }
      : checkoutReady
        ? {
            icon: <QrCode size={30} />,
            title: 'Link PayOS đã sẵn sàng',
            description: 'Quét mã QR hoặc bấm nút thanh toán để hoàn tất đơn hàng an toàn qua PayOS.',
            tone: 'border-blue-200 bg-blue-50 text-blue-700',
          }
        : {
            icon: <CreditCard size={30} />,
            title: 'Đang chuẩn bị thanh toán',
            description: 'Nếu link chưa tự tạo, bạn có thể tạo lại link PayOS tại đây.',
            tone: 'border-slate-200 bg-slate-50 text-blue-700',
          };

  return (
    <div className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_220px] xl:items-center">
        <div className="flex items-start gap-4">
          <span className={`grid h-14 w-14 shrink-0 place-items-center rounded-2xl border ${copy.tone}`}>{copy.icon}</span>
          <div>
            <p className="text-xs font-black uppercase tracking-wide text-slate-500">Thanh toán</p>
            <h2 className="mt-1 text-2xl font-black leading-tight text-slate-950">{copy.title}</h2>
            <p className="mt-2 max-w-xl text-sm font-semibold leading-relaxed text-slate-600">{copy.description}</p>
          </div>
        </div>

        <div className="rounded-[24px] border border-slate-200 bg-slate-50 p-4">
          {checkoutReady && canRenderQr ? (
            <img
              src={qrCode ?? undefined}
              alt="PayOS QR"
              className="mx-auto h-40 w-40 rounded-2xl bg-white object-contain p-2"
              onError={(event) => {
                event.currentTarget.style.display = 'none';
              }}
            />
          ) : (
            <div className="grid h-40 place-items-center rounded-2xl bg-white text-center text-sm font-bold text-slate-500">
              <QrCode size={38} className="mb-2 text-slate-300" />
              QR sẽ hiển thị khi có link
            </div>
          )}
        </div>
      </div>

      <div className="mt-6 flex flex-wrap gap-3">
        {paid ? (
          <button
            onClick={onTrack}
            className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-2xl bg-blue-700 px-5 text-sm font-black text-white shadow-sm transition hover:bg-blue-800 sm:w-auto"
          >
            Theo dõi đơn hàng
            <ArrowRight size={18} />
          </button>
        ) : checkoutReady ? (
          <a
            href={checkoutUrl}
            className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-2xl bg-blue-700 px-5 text-sm font-black text-white shadow-sm transition hover:bg-blue-800 sm:w-auto"
          >
            Thanh toán ngay
            <ArrowRight size={18} />
          </a>
        ) : (
          <button
            onClick={onCreateLink}
            disabled={creatingLink || loading}
            className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-2xl bg-blue-700 px-5 text-sm font-black text-white shadow-sm transition hover:bg-blue-800 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
          >
            {creatingLink ? <Loader2 className="animate-spin" size={18} /> : <QrCode size={18} />}
            Tạo link thanh toán
          </button>
        )}
      </div>
    </div>
  );
};

const VoucherSelector = ({
  vouchers,
  selectedVoucherCode,
  appliedVoucherCode,
  applying,
  onSelect,
  onApply,
}: {
  vouchers: PaymentVoucher[];
  selectedVoucherCode: string;
  appliedVoucherCode?: string | null;
  applying: boolean;
  onSelect: (voucherCode: string) => void;
  onApply: () => void;
}) => (
  <div className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
    <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-center gap-3">
        <span className="grid h-12 w-12 place-items-center rounded-2xl bg-amber-50 text-amber-700">
          <Gift size={22} />
        </span>
        <div>
          <p className="text-xs font-black uppercase tracking-wide text-slate-500">Ưu đãi</p>
          <h2 className="text-xl font-black text-slate-950">Voucher có thể dùng</h2>
        </div>
      </div>
      {appliedVoucherCode && (
        <span className="w-fit rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-black text-emerald-700">
          Đã áp dụng {appliedVoucherCode}
        </span>
      )}
    </div>

    {vouchers.length === 0 ? (
      <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-5 text-sm font-semibold text-slate-500">
        Hiện chưa có voucher khả dụng cho đơn hàng này.
      </div>
    ) : (
      <div className="grid gap-3 md:grid-cols-2">
        {vouchers.map((voucher) => {
          const selected = selectedVoucherCode === voucher.voucherCode;
          const applied = appliedVoucherCode === voucher.voucherCode;
          return (
            <button
              key={voucher.voucherId}
              type="button"
              disabled={!voucher.isEligible}
              onClick={() => onSelect(voucher.voucherCode)}
              className={`min-h-[126px] rounded-2xl border p-4 text-left transition ${
                selected
                  ? 'border-blue-400 bg-blue-50 shadow-sm'
                  : 'border-slate-200 bg-white hover:border-blue-200 hover:bg-blue-50/40'
              } ${!voucher.isEligible ? 'cursor-not-allowed opacity-55' : ''}`}
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-lg font-black text-slate-950">{voucher.title}</p>
                  <p className="mt-1 text-xs font-black uppercase tracking-wide text-blue-700">{voucher.voucherCode}</p>
                </div>
                {applied ? <CheckCircle2 className="text-emerald-600" size={20} /> : <Gift className="text-amber-500" size={19} />}
              </div>
              <p className="mt-3 text-sm font-semibold leading-relaxed text-slate-600">{voucher.description}</p>
              <p className="mt-2 text-xs font-bold text-slate-400">
                {voucher.isEligible ? `Hết hạn ${formatDateTime(voucher.validTo)}` : voucher.ineligibleReason}
              </p>
            </button>
          );
        })}
      </div>
    )}

    <div className="mt-5 flex flex-wrap items-center gap-3">
      <button
        type="button"
        onClick={onApply}
        disabled={!selectedVoucherCode || applying}
        className="inline-flex h-11 items-center justify-center gap-2 rounded-2xl bg-slate-950 px-5 text-sm font-black text-white transition hover:bg-blue-800 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {applying ? <Loader2 className="animate-spin" size={17} /> : <Gift size={17} />}
        Áp dụng voucher
      </button>
      <button
        type="button"
        onClick={() => onSelect('')}
        disabled={!selectedVoucherCode || applying}
        className="inline-flex h-11 items-center justify-center rounded-2xl border border-slate-200 bg-white px-5 text-sm font-black text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
      >
        Bỏ chọn
      </button>
    </div>
  </div>
);

const RouteCard = ({
  serviceType,
  status,
  pickup,
  delivery,
}: {
  serviceType: string;
  status: string;
  pickup: string;
  delivery: string;
}) => (
  <div className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
    <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
      <div>
        <p className="text-xs font-black uppercase tracking-wide text-slate-500">Tuyến vận chuyển</p>
        <h2 className="mt-1 text-2xl font-black text-slate-950">Thông tin giao nhận</h2>
      </div>
      <div className="grid gap-2 sm:grid-cols-2">
        <StatusPill icon={<Truck size={16} />} label={serviceType} />
        <StatusPill icon={<Clock3 size={16} />} label={status} />
      </div>
    </div>

    <div className="grid gap-4 md:grid-cols-2">
      <RoutePoint tone="blue" label="Điểm lấy hàng" value={pickup} icon={<MapPin size={18} />} />
      <RoutePoint tone="emerald" label="Điểm giao hàng" value={delivery} icon={<PackageCheck size={18} />} />
    </div>
  </div>
);

const StatusPill = ({ icon, label }: { icon: React.ReactNode; label: string }) => (
  <span className="inline-flex h-10 items-center justify-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3 text-xs font-black text-slate-700">
    <span className="text-blue-700">{icon}</span>
    <span className="max-w-[150px] truncate">{label}</span>
  </span>
);

const RoutePoint = ({
  tone,
  label,
  value,
  icon,
}: {
  tone: 'blue' | 'emerald';
  label: string;
  value: string;
  icon: React.ReactNode;
}) => (
  <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
    <div className="flex gap-4">
      <span
        className={`grid h-11 w-11 shrink-0 place-items-center rounded-2xl text-white shadow-sm ${
          tone === 'blue' ? 'bg-blue-700' : 'bg-emerald-600'
        }`}
      >
        {icon}
      </span>
      <div className="min-w-0">
        <p className="text-xs font-black uppercase tracking-wide text-slate-500">{label}</p>
        <p className="mt-1 text-sm font-bold leading-relaxed text-slate-900">{value}</p>
      </div>
    </div>
  </div>
);

const CheckoutSummary = ({
  orderCode,
  createdAt,
  orderStatus,
  invoiceStatus,
  paymentStatus,
  originalAmount,
  discountAmount,
  amount,
  appliedVoucherCode,
  checkoutReady,
  checkoutUrl,
  paid,
  loading,
  onCreateLink,
}: {
  orderCode: string;
  createdAt: string;
  orderStatus: string;
  invoiceStatus: string;
  paymentStatus: string;
  originalAmount?: number | null;
  discountAmount: number;
  amount?: number | null;
  appliedVoucherCode?: string | null;
  checkoutReady: boolean;
  checkoutUrl?: string;
  paid: boolean;
  loading: boolean;
  onCreateLink: () => void;
}) => (
  <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
    <div className="flex items-center justify-between gap-4">
      <div>
        <p className="text-xs font-black uppercase tracking-wide text-slate-500">Hóa đơn</p>
        <h2 className="mt-1 text-2xl font-black text-slate-950">Tóm tắt chi phí</h2>
      </div>
      <span className="grid h-12 w-12 place-items-center rounded-2xl bg-emerald-50 text-emerald-700">
        <WalletCards size={24} />
      </span>
    </div>

    <div className="mt-6 space-y-3">
      <ReceiptRow label="Mã đơn" value={orderCode} />
      <ReceiptRow label="Ngày tạo" value={createdAt} />
      <ReceiptRow label="Trạng thái đơn" value={orderStatus} />
      <ReceiptRow label="Hóa đơn" value={invoiceStatus} />
      <ReceiptRow label="Thanh toán" value={paymentStatus} />
    </div>

    <div className="mt-6 rounded-[24px] border border-blue-100 bg-gradient-to-br from-blue-50 via-white to-emerald-50 p-5 text-slate-950 shadow-sm">
      <div className="space-y-3">
        <PriceRow label="Tạm tính" value={formatMoney(originalAmount)} />
        <PriceRow
          label={appliedVoucherCode ? `Voucher ${appliedVoucherCode}` : 'Voucher'}
          value={discountAmount > 0 ? `-${formatMoney(discountAmount)}` : 'Chưa áp dụng'}
          highlight={discountAmount > 0}
        />
      </div>
      <div className="mt-5 border-t border-blue-100 pt-5">
        <div className="flex items-center justify-between gap-4">
          <span className="text-sm font-black text-slate-700">Tổng thanh toán</span>
          <LockKeyhole size={18} className="text-emerald-600" />
        </div>
        <p className="mt-2 break-words text-3xl font-black tracking-tight text-blue-800">{formatMoney(amount)}</p>
        <p className="mt-2 text-xs font-bold uppercase tracking-wide text-slate-500">Bảo mật qua PayOS</p>
      </div>
    </div>

    <div className="mt-5 grid gap-3">
      {paid ? (
        <button className="inline-flex h-12 items-center justify-center gap-2 rounded-2xl bg-emerald-600 px-5 text-sm font-black text-white">
          <CheckCircle2 size={18} />
          Đã thanh toán
        </button>
      ) : checkoutReady ? (
        <a
          href={checkoutUrl}
          className="inline-flex h-12 items-center justify-center gap-2 rounded-2xl bg-blue-700 px-5 text-sm font-black text-white shadow-sm transition hover:bg-blue-800"
        >
          Thanh toán ngay
          <ArrowRight size={18} />
        </a>
      ) : (
        <button
          onClick={onCreateLink}
          disabled={loading}
          className="inline-flex h-12 items-center justify-center gap-2 rounded-2xl bg-blue-700 px-5 text-sm font-black text-white shadow-sm transition hover:bg-blue-800 disabled:opacity-60"
        >
          <QrCode size={18} />
          Tạo link PayOS
        </button>
      )}
    </div>
  </div>
);

const ReceiptRow = ({ label, value }: { label: string; value: string }) => (
  <div className="grid grid-cols-[118px_1fr] items-start gap-4 border-b border-slate-100 pb-3 last:border-b-0 last:pb-0">
    <span className="text-sm font-semibold text-slate-500">{label}</span>
    <span className="break-words text-right text-sm font-black leading-relaxed text-slate-950">{value}</span>
  </div>
);

const PriceRow = ({ label, value, highlight = false }: { label: string; value: string; highlight?: boolean }) => (
  <div className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-4 text-sm">
    <span className="min-w-0 break-words font-semibold text-slate-600">{label}</span>
    <span className={`shrink-0 text-right font-black ${highlight ? 'text-emerald-700' : 'text-slate-950'}`}>{value}</span>
  </div>
);

const ProcessCard = ({ paid }: { paid: boolean }) => (
  <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
    <div className="flex items-center gap-3">
      <span className="grid h-10 w-10 place-items-center rounded-2xl bg-blue-50 text-blue-700">
        <ShieldCheck size={21} />
      </span>
      <div>
        <h3 className="font-black text-slate-950">Quy trình an toàn</h3>
        <p className="text-sm font-semibold text-slate-500">3 bước trước khi xử lý đơn</p>
      </div>
    </div>

    <div className="mt-6 space-y-4">
      <StepItem done title="Kiểm tra đơn" description="Thông tin giao nhận và chi phí đã được ghi nhận." />
      <StepItem done={paid} title="Thanh toán" description="Hoàn tất trên PayOS để xác nhận giao dịch." />
      <StepItem done={paid} title="Theo dõi" description="Sau khi xác nhận, bạn có thể xem hành trình đơn hàng." />
    </div>
  </div>
);

const StepItem = ({ done, title, description }: { done: boolean; title: string; description: string }) => (
  <div className="flex gap-4">
    <div
      className={`mt-1 grid h-8 w-8 shrink-0 place-items-center rounded-full border text-sm font-black ${
        done ? 'border-emerald-200 bg-emerald-100 text-emerald-700' : 'border-slate-200 bg-slate-50 text-slate-400'
      }`}
    >
      {done ? <CheckCircle2 size={17} /> : <Clock3 size={16} />}
    </div>
    <div>
      <h3 className={`font-black ${done ? 'text-slate-950' : 'text-slate-500'}`}>{title}</h3>
      <p className="mt-1 text-sm font-semibold leading-relaxed text-slate-500">{description}</p>
    </div>
  </div>
);

export default PaymentPage;
