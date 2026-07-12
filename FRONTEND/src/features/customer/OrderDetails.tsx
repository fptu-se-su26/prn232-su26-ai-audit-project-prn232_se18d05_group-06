import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import Header from './Header';
import Footer from './Footer';
import api from '@lib/api';
import { Eye, Download, Star, Calendar, FileText } from 'lucide-react';

interface InvoiceDto {
  invoiceId: number;
  invoiceNo: string;
  orderId: number;
  orderCode: string;
  customerId: number;
  customerName: string;
  issueDate: string;
  dueDate: string;
  totalAmount: number;
  status: string;
  pdfpath?: string;
}

const OrderDetails: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const orderIdStr = searchParams.get('id');
  const orderId = orderIdStr ? parseInt(orderIdStr) : 1;
  const orderCode = searchParams.get('code') || 'ORD-2026-001';

  const [copied, setCopied] = useState(false);
  const [showContent, setShowContent] = useState(false);
  
  // Invoice & Feedback state
  const [invoice, setInvoice] = useState<InvoiceDto | null>(null);
  const [loadingInvoice, setLoadingInvoice] = useState<boolean>(true);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [showFeedbackModal, setShowFeedbackModal] = useState<boolean>(false);
  const [rating, setRating] = useState<number>(5);
  const [comment, setComment] = useState<string>('');
  const [submittingFeedback, setSubmittingFeedback] = useState<boolean>(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowContent(true);
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  const fetchInvoiceForOrder = async () => {
    try {
      setLoadingInvoice(true);
      const res = await api.get<InvoiceDto[]>('/invoices');
      // Find matching invoice for this order
      const found = res.data.find(
        (i) => i.orderId === orderId || i.orderCode === orderCode
      );
      setInvoice(found || null);
    } catch {
      // Quiet fail if API fails, fallback to null
      setInvoice(null);
    } finally {
      setLoadingInvoice(false);
    }
  };

  useEffect(() => {
    fetchInvoiceForOrder();
  }, [orderId, orderCode]);

  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(orderCode);
    setCopied(true);
    setTimeout(() => {
      setCopied(false);
    }, 2000);
  };

  const openPdfInTab = (path?: string) => {
    if (!path) {
      showToast('Tệp PDF đang được hệ thống chuẩn bị.', 'error');
      return;
    }
    const fileUrl = `${api.defaults.baseURL?.replace('/api', '')}${path}`;
    window.open(fileUrl, '_blank');
  };

  const handleFeedbackSubmit = async () => {
    try {
      setSubmittingFeedback(true);
      await api.post(`/customer/orders/${orderId}/feedback`, {
        starRating: rating,
        comment: comment
      });
      showToast('Cảm ơn bạn đã đánh giá chất lượng dịch vụ!', 'success');
      setShowFeedbackModal(false);
      setComment('');
      setRating(5);
    } catch (err: any) {
      showToast(err.response?.data?.message || err.response?.data || 'Gửi đánh giá thất bại.', 'error');
    } finally {
      setSubmittingFeedback(false);
    }
  };

  const getSectionStyle = (delayIndex: number) => ({
    opacity: showContent ? 1 : 0,
    transform: showContent ? 'translateY(0)' : 'translateY(20px)',
    transition: `opacity 0.6s ease-out ${delayIndex * 0.1}s, transform 0.6s ease-out ${delayIndex * 0.1}s`,
  });

  const getStatusBadge = (status: string) => {
    switch (status.toUpperCase()) {
      case 'PAID':
        return 'bg-green-100 text-green-700';
      case 'PENDING':
        return 'bg-blue-100 text-blue-700';
      case 'OVERDUE':
        return 'bg-rose-100 text-rose-700';
      default:
        return 'bg-slate-100 text-slate-700';
    }
  };

  return (
    <div className="bg-surface font-body-md text-on-surface transition-colors duration-300 min-h-screen">
      <Header />

      {/* Toast alert */}
      {toast && (
        <div className={`fixed top-24 right-6 z-50 flex items-center gap-2 px-4 py-3 rounded-xl border shadow-lg ${
          toast.type === 'success' ? 'bg-emerald-50 text-emerald-800 border-emerald-200' : 'bg-rose-50 text-rose-800 border-rose-200'
        }`}>
          <span className="text-xs font-semibold">{toast.message}</span>
        </div>
      )}
      
      <main className="pt-[120px] pb-section-gap px-container-padding max-w-[1440px] mx-auto">
        <div className="flex flex-col gap-6">
          
          {/* Order Header info */}
          <section className="glass-card rounded-xl p-6 shadow-[0_8px_32px_rgba(15,23,42,0.08)] bg-white border border-slate-100" style={getSectionStyle(0)}>
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
              <div>
                <p className="font-label-md text-slate-400 mb-1">Mã vận đơn</p>
                <h1 className="text-3xl font-extrabold text-blue-600 flex items-center gap-2">
                  #{orderCode}
                  <span 
                    className={`material-symbols-outlined cursor-pointer hover:text-blue-700 transition-colors ${copied ? 'text-green-500' : 'text-slate-400'}`}
                    onClick={handleCopy}
                  >
                    {copied ? 'done' : 'content_copy'}
                  </span>
                </h1>
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-3 gap-6 w-full md:w-auto">
                <div className="flex flex-col">
                  <span className="text-xs text-slate-400 font-bold uppercase">Dịch vụ</span>
                  <span className="text-sm font-bold text-slate-800">Storage + Transport Logistics</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs text-slate-400 font-bold uppercase">Tổng cước phí</span>
                  <span className="text-sm font-bold text-slate-800">3.456.000 đ</span>
                </div>
                <div className="flex flex-col col-span-2 md:col-span-1">
                  <span className="text-xs text-slate-400 font-bold uppercase">Trạng thái vận đơn</span>
                  <span className="inline-flex items-center gap-1.5 text-emerald-600 font-bold text-sm">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
                    COMPLETED
                  </span>
                </div>
              </div>
            </div>
          </section>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Main content left */}
            <div className="lg:col-span-2 flex flex-col gap-6">
              
              {/* Sender & Receiver Card */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <section className="glass-card rounded-xl p-6 bg-white border border-slate-100" style={getSectionStyle(1)}>
                  <div className="flex items-center gap-2 mb-4">
                    <span className="material-symbols-outlined text-blue-600 p-2 bg-blue-50 rounded-lg">upload_file</span>
                    <h2 className="text-base font-extrabold text-slate-800">Người gửi</h2>
                  </div>
                  <div className="space-y-3 text-xs text-slate-600 font-medium">
                    <div>
                      <p className="text-[10px] text-slate-400 font-bold uppercase">Họ và tên</p>
                      <p className="font-bold text-slate-800">ABC Food Corporation</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-slate-400 font-bold uppercase">Số điện thoại</p>
                      <p className="text-slate-700">028 3824 1234</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-slate-400 font-bold uppercase">Địa chỉ</p>
                      <p className="text-slate-700">Khu Công nghiệp Tân Bình, Q. Tân Bình, TP. Hồ Chí Minh</p>
                    </div>
                  </div>
                </section>
                
                <section className="glass-card rounded-xl p-6 bg-white border border-slate-100" style={getSectionStyle(2)}>
                  <div className="flex items-center gap-2 mb-4">
                    <span className="material-symbols-outlined text-indigo-600 p-2 bg-indigo-50 rounded-lg">download_for_offline</span>
                    <h2 className="text-base font-extrabold text-slate-800">Người nhận</h2>
                  </div>
                  <div className="space-y-3 text-xs text-slate-600 font-medium">
                    <div>
                      <p className="text-[10px] text-slate-400 font-bold uppercase">Họ và tên</p>
                      <p className="font-bold text-slate-800">VinaMilk Distribution Center</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-slate-400 font-bold uppercase">Số điện thoại</p>
                      <p className="text-slate-700">024 3974 5678</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-slate-400 font-bold uppercase">Địa chỉ</p>
                      <p className="text-slate-700">KCN Quang Minh, Mê Linh, Hà Nội</p>
                    </div>
                  </div>
                </section>
              </div>

              {/* Package Detail info */}
              <section className="glass-card rounded-xl p-6 bg-white border border-slate-100" style={getSectionStyle(3)}>
                <h2 className="text-base font-extrabold text-slate-800 mb-4">Thông tin kiện hàng</h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                  <div className="flex flex-col items-center p-3 bg-slate-50 rounded-xl">
                    <span className="material-symbols-outlined text-slate-400 mb-1">weight</span>
                    <span className="text-[10px] font-bold text-slate-400 uppercase">Trọng lượng</span>
                    <span className="text-xs font-bold text-slate-800 mt-0.5">15.5 Tấn</span>
                  </div>
                  <div className="flex flex-col items-center p-3 bg-slate-50 rounded-xl">
                    <span className="material-symbols-outlined text-slate-400 mb-1">straighten</span>
                    <span className="text-[10px] font-bold text-slate-400 uppercase">Thể tích</span>
                    <span className="text-xs font-bold text-slate-800 mt-0.5">38 CBM</span>
                  </div>
                  <div className="flex flex-col items-center p-3 bg-slate-50 rounded-xl">
                    <span className="material-symbols-outlined text-slate-400 mb-1">category</span>
                    <span className="text-[10px] font-bold text-slate-400 uppercase">Loại hàng</span>
                    <span className="text-xs font-bold text-slate-800 mt-0.5">Thực phẩm lạnh</span>
                  </div>
                  <div className="flex flex-col items-center p-3 bg-slate-50 rounded-xl">
                    <span className="material-symbols-outlined text-slate-400 mb-1">qr_code_2</span>
                    <span className="text-[10px] font-bold text-slate-400 uppercase">Mã QR</span>
                    <span className="text-xs font-bold text-blue-600 underline mt-0.5 cursor-pointer">Xem mã QR</span>
                  </div>
                </div>
              </section>

              {/* Delivery timeline track */}
              <section className="glass-card rounded-xl p-6 bg-white border border-slate-100" style={getSectionStyle(4)}>
                <h2 className="text-base font-extrabold text-slate-800 mb-4">Lịch trình vận chuyển</h2>
                <div className="space-y-4">
                  <div className="flex gap-4">
                    <div className="flex flex-col items-center">
                      <div className="w-6 h-6 rounded-full bg-emerald-500 text-white flex items-center justify-center text-xs font-bold shadow-md">✓</div>
                      <div className="w-0.5 h-full bg-slate-200 mt-2"></div>
                    </div>
                    <div>
                      <p className="text-xs font-bold text-emerald-600">Đã giao hàng thành công (DELIVERED)</p>
                      <p className="text-[11px] text-slate-500 mt-0.5">Hàng đã được bàn giao cho đối tác nhận tại kho Hà Nội.</p>
                      <p className="text-[10px] text-slate-400 mt-1 font-semibold">10 Tháng 7, 2026 - 15:30</p>
                    </div>
                  </div>
                  <div className="flex gap-4">
                    <div className="flex flex-col items-center">
                      <div className="w-6 h-6 rounded-full bg-blue-500 text-white flex items-center justify-center text-xs">🚚</div>
                      <div className="w-0.5 h-full bg-slate-200 mt-2"></div>
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-800">Đang vận chuyển liên tỉnh</p>
                      <p className="text-[11px] text-slate-500 mt-0.5">Container đang di chuyển trên tuyến QL1A hướng ra Bắc.</p>
                      <p className="text-[10px] text-slate-400 mt-1 font-semibold">09 Tháng 7, 2026 - 08:00</p>
                    </div>
                  </div>
                  <div className="flex gap-4">
                    <div className="flex flex-col items-center">
                      <div className="w-6 h-6 rounded-full bg-slate-200 text-slate-500 flex items-center justify-center text-xs font-bold">•</div>
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-800">Đã bốc xếp hoàn tất tại Tân Bình WH</p>
                      <p className="text-[11px] text-slate-500 mt-0.5">Hệ thống ghi nhận xuất kho và đóng seal hàng lạnh.</p>
                      <p className="text-[10px] text-slate-400 mt-1 font-semibold">08 Tháng 7, 2026 - 10:20</p>
                    </div>
                  </div>
                </div>
              </section>
            </div>
            
            {/* Sidebar Invoice & Feedback columns right */}
            <div className="flex flex-col gap-6">
              
              {/* Invoice block (UC037 integration) */}
              <section className="glass-card rounded-xl p-6 bg-white border border-slate-100 shadow-sm" style={getSectionStyle(5)}>
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-sm font-extrabold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                    <FileText size={16} className="text-blue-600" />
                    Hóa đơn thanh toán
                  </h2>
                  {invoice && (
                    <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold border uppercase ${getStatusBadge(invoice.status)}`}>
                      {invoice.status}
                    </span>
                  )}
                </div>

                {loadingInvoice ? (
                  <p className="text-xs text-slate-400 py-3">Đang truy xuất hóa đơn...</p>
                ) : invoice ? (
                  <div className="space-y-4">
                    <div className="bg-slate-50 p-4 border border-slate-100 rounded-xl space-y-2">
                      <div className="flex justify-between text-xs">
                        <span className="text-slate-400">Mã hóa đơn:</span>
                        <strong className="text-slate-800">{invoice.invoiceNo}</strong>
                      </div>
                      <div className="flex justify-between text-xs">
                        <span className="text-slate-400">Tổng tiền:</span>
                        <strong className="text-blue-600">{invoice.totalAmount.toLocaleString('vi-VN')} đ</strong>
                      </div>
                      <div className="flex justify-between text-xs">
                        <span className="text-slate-400">Ngày phát hành:</span>
                        <span className="text-slate-700">{invoice.issueDate}</span>
                      </div>
                      <div className="flex justify-between text-xs">
                        <span className="text-slate-400">Hạn thanh toán:</span>
                        <span className="text-slate-700">{invoice.dueDate}</span>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <button
                        onClick={() => openPdfInTab(invoice.pdfpath)}
                        className="py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg text-xs font-bold transition-all text-center flex items-center justify-center gap-1"
                      >
                        <Eye size={12} />
                        Xem PDF
                      </button>
                      <button
                        onClick={() => openPdfInTab(invoice.pdfpath)}
                        className="py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold transition-all text-center flex items-center justify-center gap-1"
                      >
                        <Download size={12} />
                        Tải PDF
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="p-4 bg-amber-50/40 border border-amber-100 rounded-xl">
                    <p className="text-xs text-amber-700 font-bold">Invoice is being generated.</p>
                    <p className="text-[10px] text-amber-600 mt-1">Hóa đơn đang được hệ thống tạo tự động hoặc chờ tài chính duyệt.</p>
                  </div>
                )}
              </section>

              {/* Feedback Block (UC036) */}
              <section className="glass-card rounded-xl p-6 bg-white border border-slate-100 shadow-sm" style={getSectionStyle(6)}>
                <h2 className="text-sm font-extrabold text-slate-800 uppercase tracking-wider mb-3">Đánh giá chất lượng</h2>
                <p className="text-xs text-slate-500 mb-4">Quý khách đã nhận hàng? Hãy gửi phản hồi đóng góp ý kiến về chất lượng phục vụ của chuyến hàng này.</p>
                <button
                  onClick={() => setShowFeedbackModal(true)}
                  className="w-full py-2.5 bg-yellow-500 text-white rounded-xl text-xs font-bold hover:bg-yellow-600 transition-all flex items-center justify-center gap-1 shadow-sm"
                >
                  <Star size={14} className="fill-white" />
                  Rate Service
                </button>
              </section>

            </div>
          </div>
        </div>
      </main>

      {/* Star Rating Modal (UC036) */}
      {showFeedbackModal && (
        <div className="fixed inset-0 bg-slate-950/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl p-6 overflow-hidden">
            <div className="flex justify-between items-center pb-3 border-b border-slate-100">
              <h3 className="text-sm font-extrabold text-slate-800">Đánh giá dịch vụ đơn hàng</h3>
              <button onClick={() => setShowFeedbackModal(false)} className="text-gray-400 hover:bg-gray-100 p-1.5 rounded-xl">
                ✕
              </button>
            </div>

            <div className="py-4 space-y-4">
              <p className="text-xs text-gray-500">
                Vui lòng xếp hạng sao và gửi nhận xét đóng góp cho SmartLog AI về đơn hàng <strong>{orderCode}</strong>:
              </p>

              {/* Stars */}
              <div className="flex justify-center gap-2 py-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    onClick={() => setRating(star)}
                    className="hover:scale-110 transition-transform cursor-pointer"
                  >
                    <Star
                      size={32}
                      className={star <= rating ? 'text-amber-400 fill-amber-400' : 'text-slate-300'}
                    />
                  </button>
                ))}
              </div>

              {/* Comment text area */}
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase">Nhận xét của bạn</label>
                <textarea
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Ghi nhận xét đóng góp ý kiến về bảo quản hàng hóa lạnh, tốc độ giao nhận..."
                  rows={4}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                />
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 flex justify-end gap-3">
              <button
                onClick={() => setShowFeedbackModal(false)}
                className="px-4 py-2 border border-slate-200 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-50"
              >
                Hủy
              </button>
              <button
                onClick={handleFeedbackSubmit}
                disabled={submittingFeedback}
                className="px-4 py-2 bg-blue-600 text-white rounded-xl text-xs font-bold shadow-sm hover:bg-blue-700 transition-all disabled:opacity-50"
              >
                {submittingFeedback ? 'Đang gửi...' : 'Gửi đánh giá'}
              </button>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
};

export default OrderDetails;
