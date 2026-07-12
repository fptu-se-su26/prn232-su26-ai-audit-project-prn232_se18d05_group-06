import React, { useEffect, useMemo, useState } from 'react';
import AdminSidebar from '@components/AdminSidebar';
import api from '@lib/api';

type FeedbackItem = {
  feedbackId: number;
  customerId: number;
  customerName: string;
  customerEmail?: string | null;
  orderId?: number | null;
  orderCode: string;
  orderStatus: string;
  starRating: number;
  comment?: string | null;
  createdAt: string;
  needsFollowUp: boolean;
  followUpStatus: string;
};

type FeedbackDashboard = {
  totalFeedback: number;
  averageRating: number;
  lowRatingCount: number;
  followUpCount: number;
  ratingDistribution: Record<string, number>;
  items: FeedbackItem[];
};

const emptyDashboard: FeedbackDashboard = {
  totalFeedback: 0,
  averageRating: 0,
  lowRatingCount: 0,
  followUpCount: 0,
  ratingDistribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
  items: [],
};

const formatDate = (value?: string) => {
  if (!value) return '-';
  return new Intl.DateTimeFormat('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(value));
};

const stars = (rating: number) => '★★★★★'.slice(0, rating).padEnd(5, '☆');

const AdminServiceFeedback: React.FC = () => {
  const [dashboard, setDashboard] = useState<FeedbackDashboard>(emptyDashboard);
  const [loading, setLoading] = useState(true);
  const [lowOnly, setLowOnly] = useState(false);
  const [rating, setRating] = useState('all');
  const [keyword, setKeyword] = useState('');
  const [error, setError] = useState<string | null>(null);

  const fetchFeedback = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.get<FeedbackDashboard>('/admin/service-feedback', {
        params: {
          lowOnly,
          rating: rating === 'all' ? undefined : rating,
          keyword: keyword.trim() || undefined,
        },
      });
      setDashboard(response.data);
    } catch (err: any) {
      setError(err?.response?.data?.message || err?.response?.data || 'Không tải được dữ liệu đánh giá dịch vụ.');
      setDashboard(emptyDashboard);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFeedback();
  }, [lowOnly, rating]);

  const maxDistribution = useMemo(() => {
    return Math.max(1, ...Object.values(dashboard.ratingDistribution || {}).map(Number));
  }, [dashboard.ratingDistribution]);

  const kpis = [
    { label: 'Tổng phản hồi', value: dashboard.totalFeedback, icon: 'reviews', tone: 'bg-blue-50 text-blue-700' },
    { label: 'Điểm trung bình', value: dashboard.averageRating.toFixed(2), icon: 'star', tone: 'bg-amber-50 text-amber-700' },
    { label: 'Đánh giá thấp', value: dashboard.lowRatingCount, icon: 'priority_high', tone: 'bg-rose-50 text-rose-700' },
    { label: 'Cần follow-up', value: dashboard.followUpCount, icon: 'support_agent', tone: 'bg-emerald-50 text-emerald-700' },
  ];

  return (
    <div className="min-h-screen bg-slate-100 text-slate-950">
      <AdminSidebar />
      <main className="min-h-screen md:ml-[280px]">
        <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/90 px-6 py-5 backdrop-blur-xl">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.18em] text-blue-600">Customer Experience</p>
              <h1 className="mt-1 text-3xl font-black tracking-tight text-slate-950">Service Feedback Dashboard</h1>
              <p className="mt-1 text-sm font-semibold text-slate-500">Theo dõi chất lượng dịch vụ, đánh giá thấp và phản hồi cần xử lý.</p>
            </div>
            <button onClick={fetchFeedback} className="inline-flex h-11 items-center justify-center rounded-xl bg-blue-600 px-5 text-sm font-bold text-white shadow-lg shadow-blue-600/20 transition hover:bg-blue-700">
              Làm mới
            </button>
          </div>
        </header>

        <section className="space-y-6 p-6">
          {error && <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-bold text-rose-700">{error}</div>}

          <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
            {kpis.map((kpi) => (
              <div key={kpi.label} className="rounded-2xl border border-white bg-white p-5 shadow-sm">
                <div className="flex items-start justify-between">
                  <p className="text-xs font-black uppercase tracking-wide text-slate-400">{kpi.label}</p>
                  <span className={`material-symbols-outlined rounded-xl p-2 ${kpi.tone}`}>{kpi.icon}</span>
                </div>
                <p className="mt-5 text-3xl font-black text-slate-950">{kpi.value}</p>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 gap-5 xl:grid-cols-[420px_1fr]">
            <div className="rounded-2xl border border-white bg-white p-5 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-black text-slate-950">Phân bố sao</h2>
                  <p className="text-sm font-semibold text-slate-500">Tỷ lệ rating từ 1 đến 5 sao.</p>
                </div>
                <span className="rounded-full bg-amber-50 px-3 py-1 text-xs font-black text-amber-700">Avg {dashboard.averageRating.toFixed(2)}</span>
              </div>
              <div className="mt-6 space-y-4">
                {[5, 4, 3, 2, 1].map((star) => {
                  const count = Number(dashboard.ratingDistribution?.[star] || 0);
                  const width = `${Math.max(4, (count / maxDistribution) * 100)}%`;
                  return (
                    <div key={star} className="grid grid-cols-[56px_1fr_36px] items-center gap-3 text-sm font-bold">
                      <span className="text-amber-500">{star} sao</span>
                      <div className="h-3 overflow-hidden rounded-full bg-slate-100">
                        <div className={`h-full rounded-full ${star <= 2 ? 'bg-rose-500' : star === 3 ? 'bg-amber-400' : 'bg-emerald-500'}`} style={{ width }} />
                      </div>
                      <span className="text-right text-slate-500">{count}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="rounded-2xl border border-white bg-white shadow-sm">
              <div className="flex flex-col gap-3 border-b border-slate-100 p-5 lg:flex-row lg:items-center lg:justify-between">
                <div>
                  <h2 className="text-lg font-black text-slate-950">Danh sách phản hồi</h2>
                  <p className="text-sm font-semibold text-slate-500">Feedback 1-2 sao được đánh dấu cần follow-up.</p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <input value={keyword} onChange={(e) => setKeyword(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && fetchFeedback()} placeholder="Tìm khách hàng, đơn hàng..." className="h-10 rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm font-semibold outline-none focus:border-blue-500" />
                  <select value={rating} onChange={(e) => setRating(e.target.value)} className="h-10 rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm font-bold outline-none focus:border-blue-500">
                    <option value="all">Tất cả sao</option>
                    {[5, 4, 3, 2, 1].map((star) => <option key={star} value={star}>{star} sao</option>)}
                  </select>
                  <button onClick={() => setLowOnly((value) => !value)} className={`h-10 rounded-xl px-4 text-sm font-black transition ${lowOnly ? 'bg-rose-600 text-white' : 'bg-rose-50 text-rose-700 hover:bg-rose-100'}`}>Low rating</button>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full min-w-[920px] text-left text-sm">
                  <thead className="bg-slate-50 text-xs font-black uppercase tracking-wide text-slate-400">
                    <tr>
                      <th className="px-5 py-3">Đơn hàng</th>
                      <th className="px-5 py-3">Khách hàng</th>
                      <th className="px-5 py-3">Rating</th>
                      <th className="px-5 py-3">Phản hồi</th>
                      <th className="px-5 py-3">Follow-up</th>
                      <th className="px-5 py-3">Ngày gửi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {loading ? (
                      <tr><td colSpan={6} className="py-14 text-center font-bold text-slate-400">Đang tải feedback...</td></tr>
                    ) : dashboard.items.length === 0 ? (
                      <tr><td colSpan={6} className="py-14 text-center font-bold text-slate-400">Không có phản hồi phù hợp.</td></tr>
                    ) : dashboard.items.map((item) => (
                      <tr key={item.feedbackId} className="align-top transition hover:bg-slate-50/70">
                        <td className="px-5 py-4"><p className="font-black text-blue-600">{item.orderCode || '-'}</p><p className="mt-1 text-xs font-semibold text-slate-400">{item.orderStatus}</p></td>
                        <td className="px-5 py-4"><p className="font-black text-slate-900">{item.customerName}</p><p className="mt-1 text-xs font-semibold text-slate-500">{item.customerEmail || '-'}</p></td>
                        <td className="px-5 py-4"><p className={`font-black ${item.starRating <= 2 ? 'text-rose-600' : 'text-amber-500'}`}>{stars(item.starRating)}</p><p className="mt-1 text-xs font-semibold text-slate-500">{item.starRating}/5</p></td>
                        <td className="max-w-md px-5 py-4 font-semibold text-slate-600">{item.comment || 'Không có nhận xét.'}</td>
                        <td className="px-5 py-4">{item.needsFollowUp ? <span className="rounded-full bg-rose-50 px-3 py-1 text-xs font-black text-rose-700">Cần xử lý</span> : <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-black text-emerald-700">Ổn định</span>}</td>
                        <td className="px-5 py-4 font-semibold text-slate-500">{formatDate(item.createdAt)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
};

export default AdminServiceFeedback;