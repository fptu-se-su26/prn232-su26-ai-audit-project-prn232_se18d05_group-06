import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  AlertCircle,
  Check,
  ClipboardList,
  Clock3,
  Loader2,
  Lock,
  MapPin,
  PackageCheck,
  PackageSearch,
  RefreshCw,
  Search,
  Truck,
} from 'lucide-react';
import Header from './Header';
import Footer from './Footer';
import api from '../../lib/api';

type TrackingStep = {
  step: number;
  code: string;
  title: string;
  description: string;
  time: string | null;
  isCompleted: boolean;
  isCurrent: boolean;
};

type TrackingResponse = {
  orderId: number;
  orderCode: string;
  serviceType: string;
  currentStatus: string;
  currentDisplayStatus: string;
  isCancelled: boolean;
  timeline: TrackingStep[];
};

type CustomerOrderSummary = {
  orderId: number;
  orderCode: string;
  serviceType: string;
  currentStatus: string;
  currentDisplayStatus: string;
  pickupAddress: string | null;
  deliveryAddress: string | null;
  createdAt: string | null;
  deliveredAt: string | null;
  finalCost: number | null;
};

type MapCheckpoint = {
  title: string;
  percent: number;
  isCompleted: boolean;
  isCurrent: boolean;
};

const statusTone = {
  active: 'border-blue-200 bg-blue-50 text-blue-700',
  done: 'border-emerald-200 bg-emerald-50 text-emerald-700',
  muted: 'border-slate-200 bg-slate-50 text-slate-600',
  danger: 'border-red-200 bg-red-50 text-red-700',
};

const formatDateTime = (value?: string | null) => {
  if (!value) return 'Chưa cập nhật';

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return 'Chưa cập nhật';

  return new Intl.DateTimeFormat('vi-VN', {
    hour: '2-digit',
    minute: '2-digit',
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(parsed);
};

const formatMoney = (value?: number | null) => {
  if (value == null) return '--';

  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    maximumFractionDigits: 0,
  }).format(value);
};

const getStepIcon = (step: TrackingStep) => {
  if (step.isCompleted) return Check;
  if (step.isCurrent) return Truck;
  return Clock3;
};

const getStepTone = (step: TrackingStep, isCancelled: boolean) => {
  if (isCancelled && step.isCurrent) return statusTone.danger;
  if (step.isCurrent) return statusTone.active;
  if (step.isCompleted) return statusTone.done;
  return statusTone.muted;
};

const isCustomerSession = () => {
  const rawUser = localStorage.getItem('user');
  if (!rawUser) return false;

  try {
    const user = JSON.parse(rawUser);
    return String(user?.role ?? '').trim().toUpperCase() === 'CUSTOMER';
  } catch {
    return false;
  }
};

const OrderTracking: React.FC = () => {
  const [orders, setOrders] = useState<CustomerOrderSummary[]>([]);
  const [selectedOrderId, setSelectedOrderId] = useState<number | null>(null);
  const [tracking, setTracking] = useState<TrackingResponse | null>(null);
  const [ordersLoading, setOrdersLoading] = useState(true);
  const [trackingLoading, setTrackingLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState('');

  const completedCount = useMemo(
    () => tracking?.timeline.filter((item) => item.isCompleted).length ?? 0,
    [tracking],
  );

  const progressPercent = useMemo(() => {
    if (!tracking?.timeline.length) return 0;
    return Math.round((completedCount / tracking.timeline.length) * 100);
  }, [completedCount, tracking]);

  const currentStep = useMemo(
    () => tracking?.timeline.find((item) => item.isCurrent) ?? tracking?.timeline.find((item) => item.isCompleted),
    [tracking],
  );

  const nextStep = useMemo(
    () => tracking?.timeline.find((item) => !item.isCompleted) ?? null,
    [tracking],
  );

  const lastUpdatedAt = useMemo(() => {
    const completed = tracking?.timeline
      .filter((item) => item.isCompleted && item.time)
      .sort((a, b) => new Date(b.time ?? '').getTime() - new Date(a.time ?? '').getTime());

    return completed?.[0]?.time ?? currentStep?.time ?? null;
  }, [currentStep, tracking]);

  const routeProgressPercent = useMemo(() => {
    if (!tracking?.timeline.length) return 0;
    if (tracking.currentStatus === 'DELIVERED') return 100;
    if (tracking.currentStatus === 'CANCELLED') return progressPercent;

    const currentIndex = tracking.timeline.findIndex((item) => item.isCurrent);
    const lastCompletedIndex = tracking.timeline.reduce((latest, item, index) => item.isCompleted ? index : latest, -1);
    const activeIndex = currentIndex >= 0 ? currentIndex : Math.max(0, lastCompletedIndex);
    const denominator = Math.max(1, tracking.timeline.length - 1);

    return Math.round((activeIndex / denominator) * 100);
  }, [progressPercent, tracking]);

  const mapCheckpoints = useMemo<MapCheckpoint[]>(() => {
    if (!tracking?.timeline.length) return [];

    const denominator = Math.max(1, tracking.timeline.length - 1);
    return tracking.timeline.map((step, index) => ({
      title: step.title,
      percent: Math.min(100, Math.max(0, Math.round((index / denominator) * 100))),
      isCompleted: step.isCompleted,
      isCurrent: step.isCurrent,
    }));
  }, [tracking]);

  const selectedOrder = useMemo(
    () => orders.find((order) => order.orderId === selectedOrderId) ?? null,
    [orders, selectedOrderId],
  );

  const filteredOrders = useMemo(() => {
    const keyword = filter.trim().toLowerCase();
    if (!keyword) return orders;

    return orders.filter((order) =>
      [order.orderCode, order.serviceType, order.currentDisplayStatus, order.pickupAddress, order.deliveryAddress]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(keyword)),
    );
  }, [filter, orders]);

  const loadTracking = async (orderId: number) => {
    setTrackingLoading(true);
    setError(null);
    setSelectedOrderId(orderId);

    try {
      const response = await api.get<TrackingResponse>(`/customer/orders/${orderId}/tracking`);
      setTracking(response.data);
    } catch (err: any) {
      const status = err.response?.status;
      if (status === 401) {
        setError('Bạn cần đăng nhập tài khoản khách hàng để xem danh sách đơn.');
      } else if (status === 403) {
        setError('Đơn hàng này không thuộc tài khoản khách hàng đang đăng nhập.');
      } else if (status === 404) {
        setError('Không tìm thấy đơn hàng. Vui lòng chọn đơn khác.');
      } else {
        setError(err.response?.data?.message || 'Không thể tải dữ liệu theo dõi đơn hàng.');
      }
      setTracking(null);
    } finally {
      setTrackingLoading(false);
    }
  };

  const loadOrders = async () => {
    if (!isCustomerSession()) {
      setOrders([]);
      setTracking(null);
      setSelectedOrderId(null);
      setError('Trang theo dõi đơn hàng chỉ dùng cho tài khoản CUSTOMER. Vui lòng đăng xuất và đăng nhập bằng cust.abcfood / Customer@123 để test.');
      setOrdersLoading(false);
      return;
    }

    setOrdersLoading(true);
    setError(null);

    try {
      const response = await api.get<CustomerOrderSummary[]>('/customer/orders');
      setOrders(response.data);

      if (response.data.length > 0) {
        await loadTracking(response.data[0].orderId);
      } else {
        setSelectedOrderId(null);
        setTracking(null);
      }
    } catch (err: any) {
      const status = err.response?.status;
      if (status === 401) {
        setError('Bạn cần đăng nhập tài khoản khách hàng để xem danh sách đơn.');
      } else if (status === 403) {
        setError('Tài khoản hiện tại chưa được liên kết với hồ sơ khách hàng.');
      } else {
        setError(err.response?.data?.message || 'Không thể tải danh sách đơn hàng.');
      }
      setOrders([]);
      setTracking(null);
      setSelectedOrderId(null);
    } finally {
      setOrdersLoading(false);
    }
  };

  useEffect(() => {
    loadOrders();
  }, []);

  return (
    <div className="light-surface min-h-screen bg-[#f6f8fb] font-sans text-slate-950">
      <Header scrollY={100} />

      <main className="mx-auto max-w-7xl px-4 pb-16 pt-28 sm:px-6 lg:px-8">
        <section className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
          <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
            <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
              <span className="inline-flex items-center gap-2 rounded-lg border border-blue-200 bg-blue-50 px-3 py-2 text-xs font-bold uppercase text-blue-700">
                <PackageSearch size={16} />
                Theo dõi đơn hàng
              </span>
              <button
                onClick={loadOrders}
                disabled={ordersLoading || trackingLoading}
                className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-black text-slate-700 transition hover:border-blue-300 hover:bg-blue-50 disabled:cursor-not-allowed disabled:opacity-60"
              >
                <RefreshCw size={15} className={ordersLoading ? 'animate-spin' : ''} />
                Làm mới
              </button>
            </div>

            <h1 className="max-w-3xl text-3xl font-black leading-tight text-slate-950 sm:text-4xl">
              Chọn đơn hàng để theo dõi hành trình
            </h1>
            <p className="mt-4 max-w-2xl text-base font-medium leading-relaxed text-slate-600">
              Danh sách bên dưới lấy trực tiếp từ backend theo tài khoản khách hàng đang đăng nhập. Bấm vào một đơn để xem timeline xử lý chi tiết.
            </p>

            <label className="relative mt-8 flex min-h-[52px] items-center">
              <Search className="absolute left-4 text-slate-500" size={20} />
              <input
                value={filter}
                onChange={(event) => setFilter(event.target.value)}
                className="h-[52px] w-full rounded-lg border border-slate-200 bg-slate-50 py-4 pl-12 pr-4 text-sm font-bold text-slate-950 outline-none transition focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-100"
                placeholder="Lọc theo mã đơn, dịch vụ, trạng thái..."
              />
            </label>

            {error && (
              <div className="mt-5 flex gap-3 rounded-lg border border-red-200 bg-red-50 p-4 text-sm font-semibold text-red-700">
                {error.includes('đăng nhập') ? <Lock size={20} /> : <AlertCircle size={20} />}
                <span>{error}</span>
              </div>
            )}

            <div className="mt-6 max-h-[520px] space-y-3 overflow-y-auto pr-1">
              {ordersLoading ? (
                <div className="grid min-h-[260px] place-items-center rounded-lg border border-dashed border-slate-300 bg-slate-50 p-8 text-center">
                  <Loader2 className="mx-auto animate-spin text-blue-700" size={36} />
                  <p className="mt-4 text-sm font-bold text-slate-700">Đang tải danh sách đơn hàng...</p>
                </div>
              ) : filteredOrders.length === 0 ? (
                <div className="grid min-h-[260px] place-items-center rounded-lg border border-dashed border-slate-300 bg-slate-50 p-8 text-center">
                  <PackageSearch className="mx-auto text-slate-400" size={42} />
                  <h4 className="mt-4 text-lg font-black text-slate-800">Không có đơn phù hợp</h4>
                  <p className="mt-2 text-sm font-medium text-slate-600">
                    Thử xóa bộ lọc hoặc tạo đơn hàng mới.
                  </p>
                </div>
              ) : (
                filteredOrders.map((order) => {
                  const active = order.orderId === selectedOrderId;

                  return (
                    <button
                      key={order.orderId}
                      onClick={() => loadTracking(order.orderId)}
                      className={`w-full rounded-lg border p-4 text-left transition ${
                        active
                          ? 'border-blue-300 bg-blue-50 shadow-sm ring-2 ring-blue-100'
                          : 'border-slate-200 bg-white hover:border-blue-200 hover:bg-blue-50/40'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <p className="text-base font-black text-slate-950">{order.orderCode}</p>
                          <p className="mt-1 text-xs font-bold uppercase text-slate-500">{order.serviceType}</p>
                        </div>
                        <span className={`rounded-lg px-2.5 py-1 text-[11px] font-black uppercase ${
                          order.currentStatus === 'DELIVERED'
                            ? 'bg-emerald-50 text-emerald-700'
                            : order.currentStatus === 'CANCELLED'
                              ? 'bg-red-50 text-red-700'
                              : 'bg-blue-50 text-blue-700'
                        }`}>
                          {order.currentDisplayStatus}
                        </span>
                      </div>
                      <div className="mt-4 grid gap-2 text-xs font-semibold text-slate-600">
                        <span className="line-clamp-1">Từ: {order.pickupAddress || 'Chưa cập nhật'}</span>
                        <span className="line-clamp-1">Đến: {order.deliveryAddress || 'Chưa cập nhật'}</span>
                      </div>
                      <div className="mt-4 flex flex-wrap items-center justify-between gap-3 text-xs font-bold text-slate-500">
                        <span>Tạo: {formatDateTime(order.createdAt)}</span>
                        <span>{formatMoney(order.finalCost)}</span>
                      </div>
                    </button>
                  );
                })
              )}
            </div>
          </div>

          <div className="relative overflow-hidden rounded-lg border border-blue-200 bg-gradient-to-br from-white via-blue-50 to-cyan-50 p-6 text-slate-950 shadow-sm sm:p-8">
            <div className="absolute right-0 top-0 h-40 w-40 bg-blue-200/60 blur-3xl" />
            <div className="relative">
              <div className="mb-8 flex items-center justify-between">
                <div>
                  <p className="text-xs font-black uppercase text-blue-700">Bản đồ theo dõi</p>
                  <h2 className="mt-2 text-2xl font-black text-slate-950">
                    {trackingLoading ? 'Đang tải...' : currentStep?.title ?? tracking?.currentDisplayStatus ?? 'Chưa chọn đơn'}
                  </h2>
                </div>
                <div className="grid h-12 w-12 place-items-center rounded-lg border border-blue-200 bg-white text-blue-700 shadow-sm">
                  {trackingLoading ? <Loader2 className="animate-spin" size={24} /> : <Truck size={24} />}
                </div>
              </div>

              <div className="relative mb-6 h-80 overflow-hidden rounded-lg border border-blue-100 bg-[linear-gradient(90deg,#dbeafe_1px,transparent_1px),linear-gradient(#dbeafe_1px,transparent_1px)] bg-[size:28px_28px] shadow-inner">
                <GoongMapLayer
                  checkpoints={mapCheckpoints}
                  currentStepTitle={currentStep?.title ?? tracking?.currentDisplayStatus ?? 'Chưa có dữ liệu tracking'}
                  deliveryAddress={selectedOrder?.deliveryAddress}
                  pickupAddress={selectedOrder?.pickupAddress}
                  progressPercent={routeProgressPercent}
                  trackingLoading={trackingLoading}
                />

                <div className="absolute bottom-4 left-4 right-4 rounded-lg border border-white/70 bg-white/90 p-3 shadow-sm backdrop-blur">
                  <p className="text-xs font-black uppercase text-slate-500">Vị trí ước tính</p>
                  <p className="mt-1 line-clamp-1 text-sm font-black text-slate-950">
                    {currentStep?.title ?? tracking?.currentDisplayStatus ?? 'Chưa có dữ liệu tracking'}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <Metric label="Mã đơn" value={tracking?.orderCode ?? selectedOrder?.orderCode ?? '--'} />
                <Metric label="Tiến độ" value={`${progressPercent}%`} />
                <Metric label="Số bước" value={tracking ? `${completedCount}/${tracking.timeline.length}` : '--'} />
              </div>

              <div className="mt-8">
                <div className="mb-2 flex items-center justify-between text-xs font-black uppercase text-slate-700">
                  <span>Hoàn tất quy trình</span>
                  <span>{progressPercent}%</span>
                </div>
                <div className="h-3 overflow-hidden rounded-lg bg-slate-200">
                  <div className="h-full rounded-lg bg-blue-700 transition-all" style={{ width: `${progressPercent}%` }} />
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="mt-6 grid gap-6 lg:grid-cols-[0.74fr_0.26fr]">
          <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
            <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
              <div>
                <p className="text-xs font-bold uppercase text-slate-500">Hành trình đơn hàng</p>
                <h3 className="mt-1 text-2xl font-black text-slate-950">
                  {tracking?.orderCode ?? selectedOrder?.orderCode ?? 'Chưa chọn đơn'}
                </h3>
              </div>
              <button
                onClick={() => selectedOrderId && loadTracking(selectedOrderId)}
                disabled={trackingLoading || !selectedOrderId}
                className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm font-bold text-slate-700 transition hover:border-blue-300 hover:bg-blue-50 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <RefreshCw size={16} className={trackingLoading ? 'animate-spin' : ''} />
                Làm mới timeline
              </button>
            </div>

            {trackingLoading ? (
              <div className="grid min-h-[360px] place-items-center rounded-lg border border-dashed border-slate-300 bg-slate-50 p-8 text-center">
                <Loader2 className="mx-auto animate-spin text-blue-700" size={42} />
                <p className="mt-4 text-sm font-bold text-slate-700">Đang tải timeline...</p>
              </div>
            ) : !tracking ? (
              <div className="grid min-h-[360px] place-items-center rounded-lg border border-dashed border-slate-300 bg-slate-50 p-8 text-center">
                <PackageSearch className="mx-auto text-slate-400" size={46} />
                <h4 className="mt-4 text-lg font-black text-slate-800">Chưa chọn đơn hàng</h4>
                <p className="mt-2 max-w-md text-sm font-medium text-slate-600">
                  Chọn một đơn ở danh sách phía trên để xem hành trình.
                </p>
              </div>
            ) : (
              <div className="space-y-5">
                <div className="rounded-lg border border-blue-200 bg-blue-50 p-5">
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div>
                      <p className="text-xs font-black uppercase text-blue-700">Đang ở bước</p>
                      <h4 className="mt-1 text-xl font-black text-slate-950">
                        {currentStep?.title ?? tracking.currentDisplayStatus}
                      </h4>
                      <p className="mt-2 max-w-2xl text-sm font-semibold leading-relaxed text-slate-700">
                        {currentStep?.description ?? 'Đơn hàng đang được cập nhật trạng thái từ hệ thống.'}
                      </p>
                    </div>
                    <div className="rounded-lg border border-blue-200 bg-white px-4 py-3 text-right shadow-sm">
                      <p className="text-xs font-black uppercase text-slate-500">Tiến độ</p>
                      <p className="mt-1 text-2xl font-black text-blue-700">{completedCount}/{tracking.timeline.length}</p>
                    </div>
                  </div>
                  <div className="mt-5 grid gap-3 md:grid-cols-3">
                    <Metric label="Bước tiếp theo" value={nextStep?.title ?? 'Đã hoàn tất'} />
                    <Metric label="Cập nhật gần nhất" value={formatDateTime(lastUpdatedAt)} />
                    <Metric label="Tổng tiến độ" value={`${progressPercent}%`} />
                  </div>
                  <div className="mt-5 h-3 overflow-hidden rounded-lg bg-white">
                    <div className="h-full rounded-lg bg-blue-700 transition-all" style={{ width: `${progressPercent}%` }} />
                  </div>
                </div>
                {tracking.timeline.map((step, index) => {
                  const Icon = getStepIcon(step);
                  const tone = getStepTone(step, tracking.isCancelled);

                  return (
                    <article key={step.code} className="relative grid gap-4 rounded-lg border border-slate-200 bg-white p-4 transition hover:border-blue-200 hover:bg-blue-50/30 sm:grid-cols-[56px_1fr_auto]">
                      {index < tracking.timeline.length - 1 && (
                        <div className="absolute left-[43px] top-[76px] hidden h-[calc(100%-28px)] w-px bg-slate-200 sm:block" />
                      )}
                      <div className={`grid h-12 w-12 place-items-center rounded-lg border ${tone}`}>
                        <Icon size={20} />
                      </div>
                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <h4 className="text-base font-black text-slate-950">{step.title}</h4>
                          {step.isCurrent && (
                            <span className="rounded-lg bg-blue-100 px-2 py-1 text-[11px] font-bold uppercase text-blue-700">
                              Đang hiện tại
                            </span>
                          )}
                        </div>
                        <p className="mt-1 text-sm font-medium leading-relaxed text-slate-600">{step.description}</p>
                      </div>
                      <time className="text-left text-sm font-bold text-slate-700 sm:text-right">
                        {formatDateTime(step.time)}
                      </time>
                    </article>
                  );
                })}
              </div>
            )}
          </div>

          <aside className="space-y-6">
            <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
              <div className="mb-5 flex items-center gap-3">
                <div className="grid h-10 w-10 place-items-center rounded-lg bg-blue-50 text-blue-700">
                  <ClipboardList size={20} />
                </div>
                <div>
                  <p className="text-xs font-bold uppercase text-slate-500">Thông tin đơn</p>
                  <h3 className="font-black text-slate-950">{tracking?.orderCode ?? selectedOrder?.orderCode ?? 'Đang chờ'}</h3>
                </div>
              </div>
              <InfoRow label="Order ID" value={tracking ? String(tracking.orderId) : selectedOrder ? String(selectedOrder.orderId) : '--'} />
              <InfoRow label="Dịch vụ" value={tracking?.serviceType ?? selectedOrder?.serviceType ?? '--'} />
              <InfoRow label="Trạng thái hệ thống" value={tracking?.currentStatus ?? selectedOrder?.currentStatus ?? '--'} />
              <InfoRow label="Mốc hiện tại" value={currentStep?.title ?? tracking?.currentDisplayStatus ?? selectedOrder?.currentDisplayStatus ?? '--'} />
            </div>

            <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
              <div className="mb-5 flex items-center gap-3">
                <div className="grid h-10 w-10 place-items-center rounded-lg bg-emerald-50 text-emerald-700">
                  <MapPin size={20} />
                </div>
                <div>
                  <p className="text-xs font-bold uppercase text-slate-500">Tuyến giao</p>
                  <h3 className="font-black text-slate-950">Điểm gửi - điểm nhận</h3>
                </div>
              </div>
              <InfoRow label="Điểm gửi" value={selectedOrder?.pickupAddress ?? '--'} />
              <InfoRow label="Điểm nhận" value={selectedOrder?.deliveryAddress ?? '--'} />
              <InfoRow label="Vị trí ước tính" value={currentStep?.title ?? '--'} />
            </div>
          </aside>
        </section>
      </main>

      <Footer />
    </div>
  );
};

type LngLat = [number, number];

declare global {
  interface Window {
    goongjs?: any;
    __goongJsPromise?: Promise<any>;
  }
}

const GOONG_JS_URL = 'https://cdn.jsdelivr.net/npm/@goongmaps/goong-js/dist/goong-js.js';
const GOONG_CSS_URL = 'https://cdn.jsdelivr.net/npm/@goongmaps/goong-js/dist/goong-js.css';
const DEFAULT_PICKUP_POINT: LngLat = [106.7009, 10.7769];
const DEFAULT_DELIVERY_POINT: LngLat = [106.7555, 10.8021];

const loadGoongJs = () => {
  if (window.goongjs) return Promise.resolve(window.goongjs);
  if (window.__goongJsPromise) return window.__goongJsPromise;

  window.__goongJsPromise = new Promise((resolve, reject) => {
    if (!document.getElementById('goong-js-css')) {
      const link = document.createElement('link');
      link.id = 'goong-js-css';
      link.rel = 'stylesheet';
      link.href = GOONG_CSS_URL;
      document.head.appendChild(link);
    }

    const existing = document.getElementById('goong-js-script') as HTMLScriptElement | null;
    if (existing) {
      existing.addEventListener('load', () => resolve(window.goongjs));
      existing.addEventListener('error', reject);
      return;
    }

    const script = document.createElement('script');
    script.id = 'goong-js-script';
    script.src = GOONG_JS_URL;
    script.async = true;
    script.onload = () => resolve(window.goongjs);
    script.onerror = reject;
    document.body.appendChild(script);
  });

  return window.__goongJsPromise;
};

const geocodeAddress = async (address: string, apiKey: string): Promise<LngLat | null> => {
  const response = await fetch(`https://rsapi.goong.io/Geocode?address=${encodeURIComponent(address)}&api_key=${apiKey}`);
  if (!response.ok) return null;

  const data = await response.json();
  const location = data?.results?.[0]?.geometry?.location;
  if (typeof location?.lat !== 'number' || typeof location?.lng !== 'number') return null;

  return [location.lng, location.lat];
};

const decodePolyline = (encoded: string): LngLat[] => {
  let index = 0;
  let lat = 0;
  let lng = 0;
  const coordinates: LngLat[] = [];

  while (index < encoded.length) {
    let shift = 0;
    let result = 0;
    let byte = 0;

    do {
      byte = encoded.charCodeAt(index++) - 63;
      result |= (byte & 0x1f) << shift;
      shift += 5;
    } while (byte >= 0x20);

    lat += result & 1 ? ~(result >> 1) : result >> 1;
    shift = 0;
    result = 0;

    do {
      byte = encoded.charCodeAt(index++) - 63;
      result |= (byte & 0x1f) << shift;
      shift += 5;
    } while (byte >= 0x20);

    lng += result & 1 ? ~(result >> 1) : result >> 1;
    coordinates.push([lng / 1e5, lat / 1e5]);
  }

  return coordinates;
};

const getDirections = async (origin: LngLat, destination: LngLat, apiKey: string): Promise<LngLat[]> => {
  const url = new URL('https://rsapi.goong.io/Direction');
  url.searchParams.set('origin', `${origin[1]},${origin[0]}`);
  url.searchParams.set('destination', `${destination[1]},${destination[0]}`);
  url.searchParams.set('vehicle', 'car');
  url.searchParams.set('api_key', apiKey);

  const response = await fetch(url.toString());
  if (!response.ok) return [origin, destination];

  const data = await response.json();
  const points = data?.routes?.[0]?.overview_polyline?.points;
  return points ? decodePolyline(points) : [origin, destination];
};

const getRoutePoint = (route: LngLat[], progressPercent: number): LngLat => {
  if (route.length === 0) return [106.7009, 10.7769];
  if (route.length === 1) return route[0];

  const targetRatio = Math.min(1, Math.max(0, progressPercent / 100));
  const segmentLengths = route.slice(1).map((point, index) => getLngLatDistance(route[index], point));
  const totalLength = segmentLengths.reduce((sum, length) => sum + length, 0);

  if (totalLength === 0) return route[0];

  const targetLength = totalLength * targetRatio;
  let walked = 0;

  for (let index = 0; index < segmentLengths.length; index += 1) {
    const segmentLength = segmentLengths[index];
    if (walked + segmentLength >= targetLength) {
      const start = route[index];
      const end = route[index + 1];
      const segmentRatio = segmentLength === 0 ? 0 : (targetLength - walked) / segmentLength;

      return [
        start[0] + (end[0] - start[0]) * segmentRatio,
        start[1] + (end[1] - start[1]) * segmentRatio,
      ];
    }

    walked += segmentLength;
  }

  return route[route.length - 1];
};

const getLngLatDistance = (from: LngLat, to: LngLat) => {
  const lngDiff = to[0] - from[0];
  const latDiff = to[1] - from[1];
  return Math.sqrt((lngDiff * lngDiff) + (latDiff * latDiff));
};

const getRouteSlice = (route: LngLat[], progressPercent: number): LngLat[] => {
  if (route.length <= 1) return route;

  const targetRatio = Math.min(1, Math.max(0, progressPercent / 100));
  const segmentLengths = route.slice(1).map((point, index) => getLngLatDistance(route[index], point));
  const totalLength = segmentLengths.reduce((sum, length) => sum + length, 0);

  if (totalLength === 0) return [route[0], route[0]];

  const targetLength = totalLength * targetRatio;
  const sliced: LngLat[] = [route[0]];
  let walked = 0;

  for (let index = 0; index < segmentLengths.length; index += 1) {
    const segmentLength = segmentLengths[index];
    const nextPoint = route[index + 1];

    if (walked + segmentLength >= targetLength) {
      sliced.push(getRoutePoint(route, progressPercent));
      return sliced;
    }

    sliced.push(nextPoint);
    walked += segmentLength;
  }

  return route;
};

const createMarkerElement = (label: string, helper: string, color: string) => {
  const element = document.createElement('div');
  element.className = 'goong-tracking-marker';
  element.style.setProperty('--marker-color', color);
  element.innerHTML = `
    <div class="goong-tracking-marker-label">${helper}</div>
    <div class="goong-tracking-marker-pin">${label}</div>
    <div class="goong-tracking-marker-tip"></div>
  `;
  return element;
};

const createCheckpointElement = (title: string, color: string, active: boolean) => {
  const element = document.createElement('div');
  element.className = active ? 'goong-route-checkpoint goong-route-checkpoint-active' : 'goong-route-checkpoint';
  element.style.setProperty('--checkpoint-color', color);
  element.title = title;
  return element;
};

const GoongMapLayer = ({
  checkpoints,
  currentStepTitle,
  deliveryAddress,
  pickupAddress,
  progressPercent,
  trackingLoading,
}: {
  checkpoints: MapCheckpoint[];
  currentStepTitle: string;
  deliveryAddress?: string | null;
  pickupAddress?: string | null;
  progressPercent: number;
  trackingLoading: boolean;
}) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [mapReady, setMapReady] = useState(false);
  const [mapError, setMapError] = useState(false);
  const [mapNotice, setMapNotice] = useState<string | null>(null);

  useEffect(() => {
    const maptilesKey = import.meta.env.VITE_GOONG_MAPTILES_KEY as string | undefined;
    const apiKey = import.meta.env.VITE_GOONG_API_KEY as string | undefined;

    if (!containerRef.current || !maptilesKey || !apiKey) {
      setMapReady(false);
      setMapError(true);
      setMapNotice('Chưa cấu hình Goong Map key cho frontend.');
      return;
    }

    let cancelled = false;
    let map: any;

    setMapError(false);
    setMapReady(false);
    setMapNotice(null);

    const initMap = async () => {
      try {
        const goongjs = await loadGoongJs();
        if (!goongjs || cancelled || !containerRef.current) return;

        const [originGeocode, destinationGeocode] = await Promise.all([
          pickupAddress ? geocodeAddress(pickupAddress, apiKey) : Promise.resolve(null),
          deliveryAddress ? geocodeAddress(deliveryAddress, apiKey) : Promise.resolve(null),
        ]);

        if (cancelled) {
          return;
        }

        const origin = originGeocode ?? DEFAULT_PICKUP_POINT;
        const destination = destinationGeocode ?? DEFAULT_DELIVERY_POINT;

        if (!originGeocode || !destinationGeocode) {
          setMapNotice('Địa chỉ đơn hàng chưa có tọa độ chính xác, đang dùng vị trí ước tính để test tuyến đường.');
        }

        const route = await getDirections(origin, destination, apiKey);
        const packagePosition = getRoutePoint(route, progressPercent);
        const completedRoute = getRouteSlice(route, progressPercent);

        goongjs.accessToken = maptilesKey;
        map = new goongjs.Map({
          center: packagePosition,
          container: containerRef.current,
          style: `https://tiles.goong.io/assets/goong_map_web.json?api_key=${maptilesKey}`,
          zoom: 11,
        });

        // Suppress specific harmless errors from the default goong style
        map.on('error', (e: any) => {
          if (e?.error?.message?.includes('Source layer "trees" does not exist')) {
            // Ignore this specific style configuration error from goong backend
            return;
          }
          console.warn('Goong Map Error:', e);
        });

        map.on('styleimagemissing', (e: any) => {
          const id = e.id;
          if (id) {
            // Provide a 1x1 transparent image to silence missing image warnings like "café"
            map.addImage(id, { width: 1, height: 1, data: new Uint8Array(4) });
          }
        });

        map.on('load', () => {
          if (cancelled) return;

          map.addSource('tracking-route', {
            data: {
              geometry: {
                coordinates: route,
                type: 'LineString',
              },
              properties: {},
              type: 'Feature',
            },
            type: 'geojson',
          });

          map.addLayer({
            id: 'tracking-route-line',
            layout: {
              'line-cap': 'round',
              'line-join': 'round',
            },
            paint: {
              'line-color': '#94a3b8',
              'line-opacity': 0.72,
              'line-width': 7,
            },
            source: 'tracking-route',
            type: 'line',
          });

          map.addSource('tracking-completed-route', {
            data: {
              geometry: {
                coordinates: completedRoute,
                type: 'LineString',
              },
              properties: {},
              type: 'Feature',
            },
            type: 'geojson',
          });

          map.addLayer({
            id: 'tracking-completed-route-line',
            layout: {
              'line-cap': 'round',
              'line-join': 'round',
            },
            paint: {
              'line-color': '#2563eb',
              'line-width': 6,
            },
            source: 'tracking-completed-route',
            type: 'line',
          });

          new goongjs.Marker({ anchor: 'bottom', element: createMarkerElement('Gửi', 'Điểm lấy hàng', '#2563eb') }).setLngLat(origin).addTo(map);
          new goongjs.Marker({ anchor: 'bottom', element: createMarkerElement('Nhận', 'Điểm giao', '#059669') }).setLngLat(destination).addTo(map);
          checkpoints
            .filter((checkpoint) => checkpoint.percent > 0 && checkpoint.percent < 100)
            .forEach((checkpoint) => {
              const point = getRoutePoint(route, checkpoint.percent);
              const color = checkpoint.isCurrent ? '#0f766e' : checkpoint.isCompleted ? '#2563eb' : '#94a3b8';
              new goongjs.Marker({
                anchor: 'center',
                element: createCheckpointElement(checkpoint.title, color, checkpoint.isCurrent),
              }).setLngLat(point).addTo(map);
            });
            
          const createTruckMarker = () => {
            const el = document.createElement('div');
            el.className = 'grid h-12 w-12 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full border-4 border-white bg-blue-700 text-blue-50 shadow-xl transition-all';
            el.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10 17h4V5H2v12h3"/><path d="M20 17h2v-3.34a4 4 0 0 0-1.17-2.83L19 9h-5v8h2"/><path d="M14 17h-4"/><circle cx="7.5" cy="17.5" r="2.5"/><circle cx="17.5" cy="17.5" r="2.5"/></svg>';
            return el;
          };
          new goongjs.Marker({ anchor: 'center', element: createTruckMarker() }).setLngLat(packagePosition).addTo(map);

          const bounds = new goongjs.LngLatBounds(origin, origin);
          route.forEach((point) => bounds.extend(point));
          bounds.extend(destination);
          map.fitBounds(bounds, { padding: 56, maxZoom: 14 });
          map.resize();
          window.setTimeout(() => map.resize(), 120);
          setMapReady(true);
        });
      } catch {
        if (!cancelled) setMapError(true);
      }
    };

    initMap();

    return () => {
      cancelled = true;
      if (map) map.remove();
    };
  }, [checkpoints, deliveryAddress, pickupAddress, progressPercent]);

  if (mapError) {
    return null;
  }

  return (
    <div className="absolute inset-0 z-20 bg-white">
      <div ref={containerRef} className="h-full w-full" />
      {!mapReady && (
        <div className="absolute inset-0 grid place-items-center bg-white/90 backdrop-blur-sm">
          <div className="rounded-lg border border-blue-100 bg-white px-4 py-3 text-center shadow-sm">
            <Loader2 className="mx-auto animate-spin text-blue-700" size={24} />
            <p className="mt-2 text-xs font-black uppercase text-slate-600">Đang tải bản đồ</p>
          </div>
        </div>
      )}
      <div className="pointer-events-none absolute left-4 top-4 flex flex-wrap gap-2 rounded-lg border border-white/80 bg-white/95 p-2 shadow-sm backdrop-blur">
        <span className="inline-flex items-center gap-2 rounded-md px-2 py-1 text-xs font-black text-slate-700">
          <span className="h-2.5 w-2.5 rounded-full bg-blue-600" />
          Gửi
        </span>
        <span className="inline-flex items-center gap-2 rounded-md px-2 py-1 text-xs font-black text-slate-700">
          <span className="h-2.5 w-2.5 rounded-full bg-teal-700" />
          Hàng
        </span>
        <span className="inline-flex items-center gap-2 rounded-md px-2 py-1 text-xs font-black text-slate-700">
          <span className="h-2.5 w-2.5 rounded-full bg-emerald-600" />
          Nhận
        </span>
      </div>
      {mapNotice && mapReady && (
        <div className="pointer-events-none absolute right-4 top-4 max-w-[260px] rounded-lg border border-amber-200 bg-amber-50/95 px-3 py-2 text-xs font-bold leading-relaxed text-amber-800 shadow-sm backdrop-blur">
          {mapNotice}
        </div>
      )}
      <div className="pointer-events-none absolute bottom-4 left-4 right-4 rounded-lg border border-white/80 bg-white/95 p-3 shadow-sm backdrop-blur">
        <p className="text-xs font-black uppercase text-slate-500">Vị trí trên Goong Map</p>
        <p className="mt-1 line-clamp-1 text-sm font-black text-slate-950">
          {trackingLoading ? 'Đang tải bản đồ...' : currentStepTitle}
        </p>
      </div>
    </div>
  );
};

const Metric = ({ label, value }: { label: string; value: string }) => (
  <div className="rounded-lg border border-blue-100 bg-white/80 p-4 shadow-sm">
    <p className="text-[11px] font-black uppercase text-slate-600">{label}</p>
    <p className="mt-2 truncate text-lg font-black text-slate-950">{value}</p>
  </div>
);

const InfoRow = ({ label, value }: { label: string; value: string }) => (
  <div className="flex items-center justify-between border-t border-slate-100 py-3 text-sm">
    <span className="font-bold text-slate-500">{label}</span>
    <span className="max-w-[150px] truncate text-right font-black text-slate-900">{value}</span>
  </div>
);

export default OrderTracking;
