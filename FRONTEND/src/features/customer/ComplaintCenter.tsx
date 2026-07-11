import React, { useState } from 'react';
import { 
  AlertCircle, 
  Camera, 
  CheckCircle2, 
  ChevronRight, 
  FileText, 
  History, 
  HelpCircle,
  MessageSquare,
  Package,
  Clock,
  ArrowLeft,
  Upload,
  Plus, 
  Bot, 
  Send, 
  Paperclip, 
  X,
  Search,
  Phone
} from 'lucide-react';
import Header from './Header';
import Footer from './Footer';

const ComplaintCenter: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'delayed' | 'lost' | 'damaged' | 'refund'>('delayed');
  const [showForm, setShowForm] = useState(false);

  return (
    <div className="min-h-screen bg-white font-sans light-surface selection:bg-coral-100">
      <Header />
      
      <main className="pt-32 pb-20 px-8">
        <div className="max-w-7xl mx-auto">
          {/* Breadcrumb / Back Navigation */}
          <button 
            onClick={() => window.history.back()}
            className="flex items-center gap-2 text-slate-400 hover:text-coral-500 font-bold text-sm mb-8 transition-colors group"
          >
            <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
            Quay lại Trung tâm hỗ trợ
          </button>

          {/* Page Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between mb-12 gap-6">
            <div>
              <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight">Khiếu nại & Hỗ trợ</h1>
              <p className="text-slate-500 font-medium mt-2">Quản lý và theo dõi các yêu cầu hỗ trợ vận chuyển toàn cầu của bạn.</p>
            </div>
            <button 
              onClick={() => setShowForm(true)}
              className="px-8 py-4 bg-coral-500 text-white rounded-[1.5rem] font-bold shadow-xl shadow-coral-500/20 hover:scale-[1.02] active:scale-95 transition-all flex items-center gap-2"
            >
              <Plus size={20} />
              Tạo khiếu nại mới
            </button>
          </div>

          <div className="grid grid-cols-12 gap-8">
            {/* Left Sidebar */}
            <div className="col-span-12 lg:col-span-3 space-y-6">
              <div className="bg-white rounded-[2rem] p-4 shadow-sm border border-slate-100">
                <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest mb-4 ml-4">Danh mục hỗ trợ</p>
                <div className="space-y-1">
                  {[
                    { id: 'delayed', label: 'Delayed', icon: Clock, count: 2 },
                    { id: 'lost', label: 'Lost', icon: Search, count: 0 },
                    { id: 'damaged', label: 'Damaged', icon: AlertCircle, count: 1 },
                    { id: 'refund', label: 'Refund', icon: History, count: 0 },
                  ].map((item) => (
                    <button
                      key={item.id}
                      onClick={() => setActiveTab(item.id as any)}
                      className={`w-full flex items-center justify-between p-4 rounded-2xl transition-all group ${
                        activeTab === item.id ? 'bg-coral-500 text-white shadow-lg' : 'hover:bg-slate-50 text-slate-600'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <item.icon size={20} />
                        <span className="font-bold">{item.label}</span>
                      </div>
                      {item.count > 0 && (
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          activeTab === item.id ? 'bg-white text-coral-600' : 'bg-coral-100 text-coral-600'
                        }`}>
                          {item.count}
                        </span>
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* AI Agent Status Card */}
              <div className="bg-slate-900 rounded-[2rem] p-8 text-white relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-coral-500/10 rounded-full -mr-16 -mt-16 blur-3xl"></div>
                <div className="relative z-10">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center">
                      <Bot size={20} className="text-coral-400" />
                    </div>
                    <span className="text-sm font-bold">AI Agent Status</span>
                  </div>
                  <p className="text-xs text-slate-400 leading-relaxed mb-6">Trợ lý AI đang phân tích dữ liệu các yêu cầu hỗ trợ theo thời gian thực để phản hồi nhanh nhất.</p>
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                    <span className="text-[10px] font-extrabold uppercase tracking-widest text-green-500">Hệ thống đang hoạt động</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Content Area */}
            <div className="col-span-12 lg:col-span-9 space-y-8">
              {/* Active Ticket Display */}
              <div className="bg-white rounded-[2.5rem] shadow-sm border border-slate-100 overflow-hidden">
                {/* Ticket Header */}
                <div className="p-8 border-b border-slate-50 flex flex-wrap justify-between items-center gap-4">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-coral-50 text-coral-600 rounded-2xl flex items-center justify-center">
                      <FileText size={24} />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-lg font-extrabold text-slate-900">Mã đơn #SL-94021</h3>
                        <span className="px-2 py-0.5 bg-blue-50 text-blue-600 text-[10px] font-extrabold rounded-md uppercase">Processing</span>
                      </div>
                      <p className="text-xs text-slate-500 mt-0.5 font-medium">Chủ đề: Đơn hàng giao trễ hơn 48h - Sài Gòn đi Hà Nội</p>
                    </div>
                  </div>
                  <div className="px-4 py-2 bg-green-50 text-green-600 rounded-full text-[10px] font-extrabold uppercase tracking-widest border border-green-100 flex items-center gap-2">
                    <CheckCircle2 size={14} />
                    Positive AI Sentiment
                  </div>
                </div>

                {/* Chat Flow */}
                <div className="p-8 space-y-8 max-h-[500px] overflow-y-auto bg-slate-50/30">
                  {/* User Message */}
                  <div className="flex gap-4 items-start max-w-3xl">
                    <div className="w-10 h-10 rounded-full bg-slate-200 flex-shrink-0 flex items-center justify-center overflow-hidden">
                      <img src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?ixlib=rb-1.2.1&auto=format&fit=crop&w=100&q=80" alt="User" />
                    </div>
                    <div>
                      <div className="bg-white p-6 rounded-3xl rounded-tl-none shadow-sm border border-slate-100">
                        <p className="text-sm text-slate-700 leading-relaxed font-medium">Chào ban hỗ trợ, đơn hàng số <span className="text-coral-600 font-bold">#SL-94021</span> của tôi đã quá hạn giao 2 ngày nhưng hệ thống vẫn báo đang ở kho luân chuyển. Tôi cần kiện hàng này cho dây chuyền sản xuất gấp.</p>
                      </div>
                      <span className="text-[10px] text-slate-400 font-bold uppercase mt-2 block ml-1">Today at 09:12 AM</span>
                    </div>
                  </div>

                  {/* AI Response */}
                  <div className="flex gap-4 items-start max-w-3xl ml-auto flex-row-reverse">
                    <div className="w-10 h-10 rounded-full bg-coral-500 flex-shrink-0 flex items-center justify-center text-white">
                      <Bot size={20} />
                    </div>
                    <div className="text-right">
                      <div className="bg-coral-500 text-white p-6 rounded-3xl rounded-tr-none shadow-xl shadow-coral-500/10">
                        <p className="text-sm leading-relaxed font-bold mb-2">SmartLog AI Assistant:</p>
                        <p className="text-sm leading-relaxed font-medium">Tôi đã ghi nhận tính cấp thiết của lô hàng linh kiện sản xuất. Tôi đang ưu tiên chuyển tiếp ticket này tới Giám đốc Điều hành Kho (Hub Manager) khu vực Hà Nội. Dự kiến có phản hồi trong <span className="underline decoration-white/50 underline-offset-4">15 phút</span>.</p>
                      </div>
                      <span className="text-[10px] text-slate-400 font-bold uppercase mt-2 block mr-1 text-right">Today at 09:13 AM</span>
                    </div>
                  </div>

                  {/* Status Change Notification */}
                  <div className="flex justify-center">
                    <div className="px-6 py-2 bg-slate-200/50 backdrop-blur rounded-full text-[10px] font-extrabold text-slate-500 uppercase tracking-widest border border-slate-100">
                      Ticket status changed to: <span className="text-slate-900">Processing</span>
                    </div>
                  </div>
                </div>

                {/* Chat Input */}
                <div className="p-8 bg-white border-t border-slate-100">
                  <div className="relative group">
                    <input 
                      type="text" 
                      placeholder="Gửi phản hồi của bạn..."
                      className="w-full pl-6 pr-16 py-5 bg-slate-50 border-none rounded-[1.5rem] focus:ring-2 focus:ring-coral-500/20 outline-none font-medium text-slate-700"
                    />
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-2">
                      <button className="p-3 text-slate-400 hover:text-coral-500 transition-colors">
                        <Paperclip size={20} />
                      </button>
                      <button className="p-3 bg-coral-500 text-white rounded-xl shadow-lg shadow-coral-500/20 hover:scale-105 active:scale-95 transition-all">
                        <Send size={20} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Form Section (Luồng 3: Điền thông tin + đính kèm ảnh) */}
              {showForm && (
                <div className="bg-white rounded-[2.5rem] shadow-sm border border-slate-100 p-10 animate-in slide-in-from-bottom-8 duration-500">
                   <div className="flex justify-between items-center mb-8">
                     <h2 className="text-2xl font-extrabold text-slate-900 flex items-center gap-3">
                        <div className="p-2 bg-coral-50 text-coral-600 rounded-xl"><Plus size={24} /></div>
                        Tạo yêu cầu hỗ trợ mới
                     </h2>
                     <button onClick={() => setShowForm(false)} className="text-slate-400 hover:text-slate-900"><X size={24} /></button>
                   </div>
                   
                   <div className="grid md:grid-cols-2 gap-8 mb-8">
                      <div className="space-y-2">
                        <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest ml-1">Chủ đề (Subject)</label>
                        <input className="w-full px-6 py-4 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-coral-500/20 outline-none font-bold" placeholder="VD: Khiếu nại hàng vỡ, Yêu cầu hoàn tiền..." />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest ml-1">Loại sự cố</label>
                        <select className="w-full px-6 py-4 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-coral-500/20 outline-none font-bold text-slate-700 appearance-none">
                          <option>Hàng hóa bảo hành</option>
                          <option>Trì hoãn vận chuyển</option>
                          <option>Thất lạc sản phẩm</option>
                          <option>Khác</option>
                        </select>
                      </div>
                      <div className="md:col-span-2 space-y-2">
                        <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest ml-1">Chi tiết mô tả</label>
                        <textarea rows={4} className="w-full px-6 py-4 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-coral-500/20 outline-none font-medium resize-none" placeholder="Nhập chi tiết tình trạng đơn và yêu cầu của bạn..." />
                      </div>
                   </div>

                   {/* Upload Area */}
                   <div className="mb-10">
                      <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest ml-1 mb-2 block">Hình ảnh minh chứng</label>
                      <div className="border-2 border-dashed border-slate-100 rounded-3xl p-12 flex flex-col items-center justify-center bg-slate-50/50 hover:bg-slate-50 transition-all cursor-pointer group">
                        <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mb-4 shadow-sm group-hover:scale-110 transition-transform">
                          <Upload size={32} className="text-coral-500" />
                        </div>
                        <p className="font-bold text-slate-700">Kéo thả ảnh hoặc video vào đây</p>
                        <p className="text-xs text-slate-400 mt-1">Hỗ trợ JPG, PNG, MP4 (Tối đa 50MB)</p>
                      </div>
                   </div>

                   <div className="flex gap-4">
                      <button onClick={() => setShowForm(false)} className="flex-1 py-5 bg-slate-50 text-slate-500 rounded-3xl font-bold hover:bg-slate-100 transition-all">Hủy bỏ</button>
                      <button className="flex-[2] py-5 bg-coral-500 text-white rounded-3xl font-bold shadow-xl shadow-coral-500/20 hover:scale-[1.01] active:scale-95 transition-all">Gửi yêu cầu ngay</button>
                   </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      <Footer />
      
      <style>{`
        .bg-coral-500 { background-color: #FF7F50; }
        .text-coral-500 { color: #FF7F50; }
        .text-coral-400 { color: #FFA07A; }
        .text-coral-600 { color: #FF6347; }
        .bg-coral-100 { background-color: #FFDAB9; }
        .bg-coral-50 { background-color: #FFF5EE; }
        .selection\\:bg-coral-100::selection { background-color: #FFDAB9; }
      `}</style>
    </div>
  );
};

export default ComplaintCenter;
