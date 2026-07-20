import React, { useEffect, useState } from 'react';
import { Gift, Plus, Edit2, Trash2, Filter, Calendar, DollarSign, Award, X, Sparkles, Search, CheckCircle2, Clock, Layers, ArrowLeft, ArrowRight, ShieldCheck } from 'lucide-react';
import AdminPageLayout from '../../components/AdminPageLayout';
import api from '../../lib/api';
import toast, { Toaster } from 'react-hot-toast';

interface Voucher {
  voucherId: number;
  voucherCode: string;
  customerTier?: string | null;
  customerId?: number | null;
  discountPct?: number | null;
  discountAmount?: number | null;
  minOrderValue?: number | null;
  validFrom: string;
  validTo: string;
  isUsed?: boolean | null;
  usedAt?: string | null;
  createdAt?: string | null;
}

const VoucherCenter: React.FC = () => {
  const [vouchers, setVouchers] = useState<Voucher[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedTier, setSelectedTier] = useState<string>('ALL');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [editingVoucher, setEditingVoucher] = useState<Voucher | null>(null);

  const pageSize = 6;

  // Form states
  const [formCode, setFormCode] = useState('');
  const [formTier, setFormTier] = useState('BRONZE');
  const [formPct, setFormPct] = useState<number | ''>(0);
  const [formAmount, setFormAmount] = useState<number | ''>(0);
  const [formMinOrder, setFormMinOrder] = useState<number | ''>(0);
  const [formValidFrom, setFormValidFrom] = useState(new Date().toISOString().split('T')[0]);
  const [formValidTo, setFormValidTo] = useState(new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0]);
  const [formSubmitting, setFormSubmitting] = useState(false);

  const fetchVouchers = async () => {
    setLoading(true);
    try {
      const response = await api.get<Voucher[]>('/vouchers');
      setVouchers(response.data || []);
    } catch (err: any) {
      console.error(err);
      toast.error(err?.response?.data?.message || 'Không thể tải danh sách voucher.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVouchers();
  }, []);

  // Reset to page 1 on search / filter change
  useEffect(() => {
    setCurrentPage(1);
  }, [selectedTier, searchTerm]);

  const openCreateModal = () => {
    setEditingVoucher(null);
    setFormCode('');
    setFormTier('BRONZE');
    setFormPct(0);
    setFormAmount(0);
    setFormMinOrder(0);
    setFormValidFrom(new Date().toISOString().split('T')[0]);
    setFormValidTo(new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0]);
    setIsModalOpen(true);
  };

  const openEditModal = (v: Voucher) => {
    setEditingVoucher(v);
    setFormCode(v.voucherCode);
    setFormTier(v.customerTier || 'BRONZE');
    setFormPct(v.discountPct ?? 0);
    setFormAmount(v.discountAmount ?? 0);
    setFormMinOrder(v.minOrderValue ?? 0);
    setFormValidFrom(v.validFrom ? v.validFrom.toString().split('T')[0] : new Date().toISOString().split('T')[0]);
    setFormValidTo(v.validTo ? v.validTo.toString().split('T')[0] : new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0]);
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formCode.trim()) {
      toast.error('Vui lòng nhập mã voucher.');
      return;
    }
    if (!formTier) {
      toast.error('Vui lòng chọn hạng khách hàng.');
      return;
    }
    if ((Number(formPct) || 0) <= 0 && (Number(formAmount) || 0) <= 0) {
      toast.error('Vui lòng nhập ít nhất một hình thức giảm giá (% hoặc số tiền).');
      return;
    }

    setFormSubmitting(true);
    const payload = {
      voucherCode: formCode.trim().toUpperCase(),
      customerTier: formTier.toUpperCase(),
      discountPct: Number(formPct) || 0,
      discountAmount: Number(formAmount) || 0,
      minOrderValue: Number(formMinOrder) || 0,
      validFrom: formValidFrom,
      validTo: formValidTo,
    };

    try {
      if (editingVoucher) {
        await api.put(`/vouchers/${editingVoucher.voucherId}`, payload);
        toast.success('Cập nhật voucher thành công!');
      } else {
        await api.post('/vouchers', payload);
        toast.success('Tạo voucher mới thành công!');
      }
      setIsModalOpen(false);
      fetchVouchers();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Có lỗi xảy ra khi lưu voucher.');
    } finally {
      setFormSubmitting(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa / vô hiệu hóa voucher này?')) return;
    try {
      await api.delete(`/vouchers/${id}`);
      toast.success('Thao tác xóa / vô hiệu hóa voucher thành công!');
      fetchVouchers();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Không thể xóa voucher.');
    }
  };

  // KPI Calculations
  const totalCount = vouchers.length;
  const activeCount = vouchers.filter(v => !v.isUsed && new Date(v.validTo) >= new Date()).length;
  const expiredCount = vouchers.filter(v => v.isUsed || new Date(v.validTo) < new Date()).length;
  const tierBasedCount = vouchers.filter(v => Boolean(v.customerTier)).length;

  // Filtered & Paginated List
  const filteredVouchers = vouchers.filter(v => {
    const matchesTier = selectedTier === 'ALL' || (v.customerTier || '').toUpperCase() === selectedTier;
    const matchesSearch = !searchTerm.trim() || v.voucherCode.toLowerCase().includes(searchTerm.toLowerCase().trim());
    return matchesTier && matchesSearch;
  });

  const totalPages = Math.max(1, Math.ceil(filteredVouchers.length / pageSize));
  const safePage = Math.min(currentPage, totalPages);
  const startIndex = (safePage - 1) * pageSize;
  const paginatedVouchers = filteredVouchers.slice(startIndex, startIndex + pageSize);

  const getTierBadgeClass = (tier?: string | null) => {
    switch ((tier || '').toUpperCase()) {
      case 'GOLD':
        return 'bg-yellow-100 text-yellow-800 border-yellow-300 font-bold';
      case 'SILVER':
        return 'bg-slate-100 text-slate-800 border-slate-300 font-bold';
      case 'BRONZE':
      default:
        return 'bg-amber-100 text-amber-900 border-amber-300 font-bold';
    }
  };

  return (
    <AdminPageLayout
      title="Quản lý Voucher theo hạng khách"
      subtitle="Hệ thống voucher ưu đãi tự động áp dụng theo hạng hội viên"
    >
      <Toaster position="top-center" />

      {/* 1. High-Contrast Dark Hero Header Banner */}
      <div className="bg-gradient-to-r from-slate-950 via-indigo-950 to-slate-900 text-white rounded-2xl shadow-xl border border-indigo-400/20 p-6 md:p-8 mb-6 relative overflow-hidden">
        {/* Background glow behind content */}
        <div className="absolute right-0 top-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20 z-0"></div>

        {/* Foreground Content */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div className="flex items-start gap-4">
            <div className="p-3.5 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl shadow-lg text-white shrink-0 mt-1 shadow-indigo-500/30">
              <Gift size={28} />
            </div>
            <div>
              <div className="flex items-center gap-2 text-[11px] font-bold text-indigo-300 uppercase tracking-widest mb-1.5">
                <span>ADMIN CONSOLE</span>
                <span>/</span>
                <span>CRM</span>
                <span>/</span>
                <span className="text-white font-extrabold">VOUCHER</span>
              </div>
              <h1 className="text-2xl md:text-3xl font-black text-white tracking-tight drop-shadow-sm">
                Quản lý Voucher theo hạng khách
              </h1>
              <p className="text-indigo-100 text-xs md:text-sm font-medium mt-1.5 max-w-2xl leading-relaxed">
                Tạo và quản lý voucher tự động áp dụng theo hạng khách hàng khi khách tạo đơn.
              </p>
            </div>
          </div>

          <button
            onClick={openCreateModal}
            className="flex items-center justify-center gap-2 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white font-extrabold px-5 py-3 rounded-xl shadow-lg shadow-indigo-500/25 transition-all hover:scale-[1.02] active:scale-95 text-sm shrink-0"
          >
            <Plus size={18} strokeWidth={2.5} />
            Tạo Voucher Mới
          </button>
        </div>
      </div>

      {/* 2. KPI Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-white border border-slate-200 shadow-sm rounded-xl p-5 hover:shadow-md transition-all">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Tổng Voucher</p>
              <h3 className="text-2xl font-black text-slate-900 mt-1">{totalCount}</h3>
            </div>
            <div className="p-2.5 bg-indigo-50 text-indigo-600 rounded-xl">
              <Gift size={20} />
            </div>
          </div>
          <p className="text-[11px] text-slate-500 font-medium mt-3">Toàn bộ voucher trên hệ thống</p>
        </div>

        <div className="bg-white border border-slate-200 shadow-sm rounded-xl p-5 hover:shadow-md transition-all">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Đang Hoạt Động</p>
              <h3 className="text-2xl font-black text-emerald-600 mt-1">{activeCount}</h3>
            </div>
            <div className="p-2.5 bg-emerald-50 text-emerald-600 rounded-xl">
              <CheckCircle2 size={20} />
            </div>
          </div>
          <p className="text-[11px] text-slate-500 font-medium mt-3">Sẵn sàng tự động áp dụng</p>
        </div>

        <div className="bg-white border border-slate-200 shadow-sm rounded-xl p-5 hover:shadow-md transition-all">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Hết Hạn / Đã Khóa</p>
              <h3 className="text-2xl font-black text-rose-600 mt-1">{expiredCount}</h3>
            </div>
            <div className="p-2.5 bg-rose-50 text-rose-600 rounded-xl">
              <Clock size={20} />
            </div>
          </div>
          <p className="text-[11px] text-slate-500 font-medium mt-3">Không thể áp dụng cho đơn mới</p>
        </div>

        <div className="bg-white border border-slate-200 shadow-sm rounded-xl p-5 hover:shadow-md transition-all">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Theo Hạng Khách</p>
              <h3 className="text-2xl font-black text-amber-600 mt-1">{tierBasedCount}</h3>
            </div>
            <div className="p-2.5 bg-amber-50 text-amber-600 rounded-xl">
              <Layers size={20} />
            </div>
          </div>
          <p className="text-[11px] text-slate-500 font-medium mt-3">Cấu hình ưu đãi Bronze/Silver/Gold</p>
        </div>
      </div>

      {/* 3. Filter & Search Toolbar */}
      <div className="bg-white border border-slate-200 p-4 rounded-xl shadow-sm mb-6 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          <span className="text-xs font-bold text-slate-700 uppercase tracking-wider mr-1 flex items-center gap-1">
            <Filter size={14} className="text-indigo-600" /> Hạng khách:
          </span>
          {['ALL', 'BRONZE', 'SILVER', 'GOLD'].map(tier => (
            <button
              key={tier}
              onClick={() => setSelectedTier(tier)}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                selectedTier === tier
                  ? 'bg-indigo-600 text-white shadow'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-200'
              }`}
            >
              {tier === 'ALL' ? 'Tất cả' : `Hạng ${tier}`}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-4 w-full md:w-auto justify-between md:justify-end">
          <span className="text-xs text-slate-500 font-semibold hidden lg:inline">
            Đang hiển thị <strong className="text-slate-800">{paginatedVouchers.length}</strong> / {filteredVouchers.length} voucher
          </span>

          <div className="relative w-full md:w-64">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Tìm theo mã voucher..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full bg-white border border-slate-300 text-slate-900 placeholder-slate-400 text-xs rounded-xl pl-10 pr-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
            />
          </div>
        </div>
      </div>

      {/* 4. Vouchers Grid (Paginated max 6 per page) */}
      {loading ? (
        <div className="text-center py-20 bg-white rounded-2xl border border-slate-200 shadow-sm">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-indigo-600 border-t-transparent mb-3"></div>
          <p className="text-sm font-semibold text-slate-600">Đang tải danh sách voucher hệ thống...</p>
        </div>
      ) : filteredVouchers.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-dashed border-slate-300 p-8 shadow-sm">
          <Gift size={44} className="mx-auto text-slate-400 mb-3" />
          <h3 className="text-base font-bold text-slate-800">Không tìm thấy voucher phù hợp</h3>
          <p className="text-xs text-slate-500 mt-1">Thử thay đổi bộ lọc hạng khách hàng hoặc từ khóa tìm kiếm.</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5 mb-6">
            {paginatedVouchers.map(v => {
              const isExpired = new Date(v.validTo) < new Date();
              const isInactive = v.isUsed === true || isExpired;

              return (
                <div
                  key={v.voucherId}
                  className={`bg-white border rounded-2xl shadow-sm hover:shadow-md overflow-hidden flex flex-col justify-between transition-all ${
                    isInactive ? 'border-slate-300 bg-slate-50/80 opacity-75' : 'border-slate-200'
                  }`}
                >
                  {/* Card Header Strip */}
                  <div className="bg-slate-50 p-4 border-b border-slate-200 flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2 mb-1.5">
                        <span className={`text-[10px] font-black px-2.5 py-0.5 rounded border uppercase tracking-wider ${getTierBadgeClass(v.customerTier)}`}>
                          {v.customerTier ? `HẠNG ${v.customerTier.toUpperCase()}` : 'TẤT CẢ HẠNG'}
                        </span>
                        {isInactive && (
                          <span className="text-[10px] font-black px-2 py-0.5 rounded bg-rose-100 text-rose-700 border border-rose-300 uppercase tracking-wider">
                            {v.isUsed ? 'ĐÃ KHÓA' : 'HẾT HẠN'}
                          </span>
                        )}
                      </div>
                      <h3 className="font-mono font-black text-lg text-slate-900 tracking-wider">{v.voucherCode}</h3>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => openEditModal(v)}
                        title="Sửa voucher"
                        className="p-1.5 rounded-lg text-slate-500 hover:text-indigo-600 hover:bg-slate-200/60 transition-colors"
                      >
                        <Edit2 size={15} />
                      </button>
                      <button
                        onClick={() => handleDelete(v.voucherId)}
                        title="Xóa / Khóa voucher"
                        className="p-1.5 rounded-lg text-rose-500 hover:text-rose-700 hover:bg-rose-50 transition-colors"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </div>

                  {/* Body Details */}
                  <div className="p-4 space-y-3">
                    <div>
                      <div className="text-xl font-black text-indigo-700">
                        {(v.discountPct ?? 0) > 0
                          ? `Giảm ${v.discountPct}%`
                          : `Giảm ${(v.discountAmount ?? 0).toLocaleString('vi-VN')} VNĐ`}
                      </div>
                      {(v.discountPct ?? 0) > 0 && (v.discountAmount ?? 0) > 0 && (
                        <p className="text-xs text-slate-500 mt-0.5 font-medium">
                          Tối đa {(v.discountAmount ?? 0).toLocaleString('vi-VN')} VNĐ
                        </p>
                      )}
                    </div>

                    <div className="space-y-2 pt-2 border-t border-slate-100 text-xs">
                      <div className="flex justify-between items-center">
                        <span className="text-slate-500 font-semibold flex items-center gap-1">
                          <DollarSign size={14} className="text-indigo-600" /> Đơn tối thiểu:
                        </span>
                        <span className="font-bold text-slate-800">
                          {(v.minOrderValue ?? 0) > 0 ? `${(v.minOrderValue ?? 0).toLocaleString('vi-VN')} VNĐ` : 'Không giới hạn'}
                        </span>
                      </div>

                      <div className="flex justify-between items-center">
                        <span className="text-slate-500 font-semibold flex items-center gap-1">
                          <Calendar size={14} className="text-indigo-600" /> Hiệu lực:
                        </span>
                        <span className="font-semibold text-slate-700">
                          {v.validFrom} ~ {v.validTo}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Footer Tag */}
                  <div className="bg-slate-50 px-4 py-2.5 border-t border-slate-100 flex justify-between items-center text-[11px] text-slate-600 font-medium">
                    <span className="flex items-center gap-1">
                      <Sparkles size={13} className="text-indigo-600" /> Tự động áp dụng UC030
                    </span>
                    <Award size={14} className="text-amber-600" />
                  </div>
                </div>
              );
            })}
          </div>

          {/* 5. Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white border border-slate-200 px-5 py-3.5 rounded-xl shadow-sm">
              <span className="text-xs font-semibold text-slate-600">
                Trang <strong className="text-slate-900">{safePage}</strong> / {totalPages} (Tổng {filteredVouchers.length} voucher)
              </span>

              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={safePage === 1}
                  className="flex items-center gap-1 px-3 py-1.5 text-xs font-bold rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  <ArrowLeft size={14} /> Trước
                </button>

                {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={`w-8 h-8 flex items-center justify-center text-xs font-bold rounded-lg transition-colors ${
                      safePage === page
                        ? 'bg-indigo-600 text-white shadow'
                        : 'border border-slate-200 text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    {page}
                  </button>
                ))}

                <button
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={safePage === totalPages}
                  className="flex items-center gap-1 px-3 py-1.5 text-xs font-bold rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  Sau <ArrowRight size={14} />
                </button>
              </div>
            </div>
          )}
        </>
      )}

      {/* 6. Admin Create / Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white text-slate-900 rounded-3xl shadow-2xl max-w-lg w-full overflow-hidden border border-slate-200 animate-in fade-in zoom-in duration-200">
            <div className="bg-slate-900 text-white p-6 flex justify-between items-center">
              <div className="flex items-center gap-2">
                <Gift className="text-amber-400" size={22} />
                <h3 className="text-lg font-bold text-white">
                  {editingVoucher ? 'Cập Nhật Voucher Admin' : 'Tạo Voucher Theo Hạng (UC030)'}
                </h3>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-white transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4 bg-white">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Mã Voucher <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="VD: GOLDVIP50, BRONZE10"
                  value={formCode}
                  onChange={e => setFormCode(e.target.value)}
                  className="w-full bg-white border border-slate-300 text-slate-900 placeholder:text-slate-400 rounded-xl py-2.5 px-4 font-mono font-bold uppercase focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Hạng Áp Dụng <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={formTier}
                    onChange={e => setFormTier(e.target.value)}
                    className="w-full bg-white border border-slate-300 text-slate-900 rounded-xl py-2.5 px-3 font-semibold focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 focus:outline-none"
                  >
                    <option value="BRONZE">BRONZE (Đồng)</option>
                    <option value="SILVER">SILVER (Bạc)</option>
                    <option value="GOLD">GOLD (Vàng)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Đơn Tối Thiểu (VNĐ)</label>
                  <input
                    type="number"
                    min="0"
                    placeholder="VD: 500000"
                    value={formMinOrder}
                    onChange={e => setFormMinOrder(e.target.value ? Number(e.target.value) : '')}
                    className="w-full bg-white border border-slate-300 text-slate-900 placeholder:text-slate-400 rounded-xl py-2.5 px-4 font-semibold focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">% Giảm Giá</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    placeholder="0 - 100"
                    value={formPct}
                    onChange={e => setFormPct(e.target.value ? Number(e.target.value) : '')}
                    className="w-full bg-white border border-slate-300 text-slate-900 placeholder:text-slate-400 rounded-xl py-2.5 px-4 font-semibold focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Số Tiền Giảm (VNĐ)</label>
                  <input
                    type="number"
                    min="0"
                    placeholder="VD: 50000"
                    value={formAmount}
                    onChange={e => setFormAmount(e.target.value ? Number(e.target.value) : '')}
                    className="w-full bg-white border border-slate-300 text-slate-900 placeholder:text-slate-400 rounded-xl py-2.5 px-4 font-semibold focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Hiệu Lực Từ <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="date"
                    required
                    value={formValidFrom}
                    onChange={e => setFormValidFrom(e.target.value)}
                    className="w-full bg-white border border-slate-300 text-slate-900 rounded-xl py-2.5 px-3 text-sm font-semibold focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Đến Ngày <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="date"
                    required
                    value={formValidTo}
                    onChange={e => setFormValidTo(e.target.value)}
                    className="w-full bg-white border border-slate-300 text-slate-900 rounded-xl py-2.5 px-3 text-sm font-semibold focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="pt-4 flex justify-end gap-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-5 py-2.5 rounded-xl border border-slate-300 text-slate-600 font-bold text-sm hover:bg-slate-100 hover:text-slate-900 transition-colors"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={formSubmitting}
                  className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm transition-colors shadow-md disabled:opacity-60"
                >
                  {formSubmitting ? 'Đang lưu...' : editingVoucher ? 'Cập Nhật' : 'Tạo Voucher'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AdminPageLayout>
  );
};

export default VoucherCenter;
