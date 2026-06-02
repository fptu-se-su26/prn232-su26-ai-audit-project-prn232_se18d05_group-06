import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, ArrowRight, Clock, Download, Check, Truck, Route, History, Package, AlertCircle, MessageSquare, Phone, Bell } from 'lucide-react';
import Header from './Header';
import Footer from './Footer';

const OrderTracking: React.FC = () => {
  const navigate = useNavigate();
  const [trackingId, setTrackingId] = useState('SL-AI-99283');
  const [isProcessing, setIsProcessing] = useState(false);
  const [notifications, setNotifications] = useState({
    sms: true,
    email: true,
    push: false,
  });

  const handleSearch = () => {
    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
    }, 1500);
  };

  const [activeTab, setActiveTab] = useState<'status' | 'map' | 'history'>('status');

  const handleToggle = (key: keyof typeof notifications) => {
    setNotifications((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900 selection:bg-amber-100 selection:text-amber-900">
      <Header />
      
      <main className="pt-32 pb-20 overflow-x-hidden">
        {/* Hero Search Section */}
        <section className="px-8 py-12 flex flex-col items-center justify-center text-center max-w-7xl mx-auto">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-amber-50 text-amber-600 rounded-full text-[10px] font-extrabold uppercase tracking-widest mb-6 border border-amber-100">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
            </span>
            Kênh theo dõi chính thức
          </div>
          <h1 className="text-5xl md:text-6xl font-extrabold mb-6 text-slate-900 tracking-tight">Tra cứu hành trình đơn</h1>
          <p className="text-slate-500 max-w-2xl mb-12 text-lg font-medium italic">
            "Sức mạnh của AI trong việc tối ưu hóa và minh bạch hóa chuỗi cung ứng của bạn."
          </p>
          <div className="w-full max-w-2xl group relative mb-12">
            <div className="absolute -inset-1 bg-gradient-to-r from-amber-400 to-orange-500 rounded-3xl blur opacity-20 group-hover:opacity-40 transition duration-1000 group-hover:duration-200"></div>
            <div className="relative flex items-center bg-white p-2 rounded-[2rem] shadow-2xl border border-slate-100">
              <div className="pl-6 pr-4 text-slate-400">
                <Search size={24} />
              </div>
              <input
                className="w-full border-none bg-transparent focus:ring-0 px-2 py-4 text-lg font-bold text-slate-900 placeholder:text-slate-300"
                placeholder="Mã vận đơn (VD: SL-AI-99283)"
                type="text"
                value={trackingId}
                onChange={(e) => setTrackingId(e.target.value)}
              />
              <button
                onClick={handleSearch}
                disabled={isProcessing}
                className="bg-amber-500 text-white px-8 py-4 rounded-2xl font-bold hover:bg-amber-600 transition-all flex items-center gap-2 disabled:opacity-75 shadow-lg shadow-amber-200 active:scale-95"
              >
                {isProcessing ? (
                  <>
                    <div className="w-5 h-5 border-3 border-white/30 border-t-white rounded-full animate-spin"></div>
                    <span>Đang tìm...</span>
                  </>
                ) : (
                  <>
                    <span>Truy vết</span>
                    <ArrowRight size={20} />
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Quick Tabs */}
          <div className="flex bg-white/50 backdrop-blur-md p-1.5 rounded-2xl border border-slate-200 shadow-sm relative z-10 scale-90 sm:scale-100">
            {[
              { id: 'status', label: 'Chi tiết đơn', icon: Package },
              { id: 'map', label: 'Bản đồ lộ trình', icon: Route },
              { id: 'history', label: 'Lịch sử vận hành', icon: History },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider transition-all ${
                  activeTab === tab.id 
                  ? 'bg-white text-slate-900 shadow-md ring-1 ring-slate-100 scale-[1.02]' 
                  : 'text-slate-400 hover:text-slate-600'
                }`}
              >
                <tab.icon size={16} />
                {tab.label}
              </button>
            ))}
          </div>
        </section>

        <div className="max-w-7xl mx-auto px-8">
          {activeTab === 'status' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
              {/* Tracking Result Card & Progress */}
              <div className="lg:col-span-8 flex flex-col gap-8">
                {/* Status Glass Card */}
                <div className="bg-white p-10 rounded-[2.5rem] shadow-sm border border-slate-100 relative overflow-hidden">
                   <div className="absolute top-0 right-0 w-64 h-64 bg-amber-50/50 rounded-full blur-3xl -mr-32 -mt-32"></div>
                  
                  <div className="flex flex-wrap justify-between items-start mb-12 relative z-10">
                    <div>
                      <span className="px-4 py-1.5 rounded-full bg-amber-50 text-amber-600 text-[10px] font-extrabold uppercase tracking-widest mb-4 inline-block border border-amber-100">Đang Vận Chuyển</span>
                      <h2 className="text-3xl font-extrabold text-slate-900">Đang trên đường giao tới bạn</h2>
                      <div className="flex items-center gap-2 mt-2 text-slate-500 font-medium">
                        <Clock size={16} />
                        <span>Dự kiến giao: <span className="text-slate-900 font-bold">14:30 - 16:00, Hôm nay</span></span>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button className="p-4 rounded-2xl bg-slate-50 text-slate-400 hover:bg-slate-100 hover:text-slate-900 transition-all">
                        <Download size={20} />
                      </button>
                      <button className="p-4 rounded-2xl bg-slate-50 text-slate-400 hover:bg-slate-100 hover:text-slate-900 transition-all">
                        <Search size={20} />
                      </button>
                    </div>
                  </div>

                  {/* Progress Stepper */}
                  <div className="relative pt-8 pb-4 mx-4">
                    <div className="absolute top-1/2 left-0 w-full h-1 bg-slate-100 -translate-y-1/2 rounded-full"></div>
                    <div className="absolute top-1/2 left-0 w-[75%] h-1 bg-amber-400 -translate-y-1/2 rounded-full"></div>
                    
                    <div className="relative flex justify-between">
                      {[
                        { label: 'Chờ xử lý', active: true },
                        { label: 'Đã lấy hàng', active: true },
                        { label: 'Đang vận chuyển', active: true },
                        { label: 'Đang giao hàng', active: 'current' },
                        { label: 'Đã giao hàng', active: false },
                      ].map((step, idx) => (
                        <div key={idx} className="flex flex-col items-center gap-3 relative">
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center z-10 shadow-sm transition-all border-4 border-white ${
                            step.active === true ? 'bg-amber-400 text-white' : 
                            step.active === 'current' ? 'bg-amber-500 text-white ring-[6px] ring-amber-100' : 'bg-slate-200 text-slate-400'
                          }`}>
                            {step.active === true && <Check size={18} strokeWidth={4} />}
                            {step.active === 'current' && <Truck size={18} className="animate-pulse" />}
                            {step.active === false && <div className="w-2 h-2 bg-slate-300 rounded-full"></div>}
                          </div>
                          <span className={`text-[10px] font-bold uppercase tracking-tight absolute -bottom-10 whitespace-nowrap ${step.active ? 'text-slate-900 font-extrabold' : 'text-slate-300'}`}>
                            {step.label}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="h-16"></div>
                </div>

                {/* Info Grid */}
                <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                  {[
                    { label: 'Mã Vận Đơn', value: 'SL-AI-99283', highlight: true },
                    { label: 'Tài Xế', value: 'Lê Hoàng Nam' },
                    { label: 'Phương Tiện', value: 'Xe Tải EV-400' },
                    { label: 'Dự kiến', value: '15:45 pm', highlight: true },
                    { label: 'Kho Xuất Phát', value: 'Hà Nội Hub A1' },
                    { label: 'Ưu tiên', value: 'AI Optimized' },
                  ].map((info, idx) => (
                    <div key={idx} className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 group hover:border-amber-200 transition-colors">
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">{info.label}</p>
                      <p className={`text-lg font-extrabold ${info.highlight ? 'text-amber-600' : 'text-slate-900'}`}>{info.value}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Sidebar: Driver & Notifications */}
              <div className="lg:col-span-4 flex flex-col gap-8">
                 {/* Driver Card */}
                <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-slate-100 text-center relative overflow-hidden group">
                  <div className="absolute top-0 left-0 w-full h-1 bg-amber-500"></div>
                  <div className="relative z-10 flex flex-col items-center">
                    <div className="w-24 h-24 rounded-full border-4 border-amber-50 p-1 mb-4">
                      <img 
                        src="https://images.unsplash.com/photo-1633332755192-727a05c4013d?ixlib=rb-1.2.1&auto=format&fit=crop&w=250&q=80" 
                        alt="Tài xế"
                        className="w-full h-full object-cover rounded-full"
                      />
                    </div>
                    <h4 className="text-xl font-bold text-slate-900">Lê Hoàng Nam</h4>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Tài xế chuyên nghiệp</p>
                    <div className="flex gap-1 mb-8">
                      {[1,2,3,4,5].map(i => <div key={i} className="w-1.5 h-1.5 rounded-full bg-amber-400"></div>)}
                    </div>
                    <button className="w-full py-4 bg-slate-900 text-white rounded-2xl font-bold hover:scale-[1.02] active:scale-95 transition-all shadow-lg shadow-slate-200 flex items-center justify-center gap-2 mb-3">
                      <Phone size={18} /> Gọi cho tài xế
                    </button>
                    <button className="w-full py-4 bg-white border border-slate-200 text-slate-600 rounded-2xl font-bold hover:bg-slate-50 transition-all flex items-center justify-center gap-2">
                       <MessageSquare size={18} /> Nhắn tin
                    </button>
                  </div>
                </div>

                <div className="bg-slate-900 p-8 rounded-[2rem] text-white shadow-xl relative overflow-hidden">
                   <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-amber-500/10 to-transparent pointer-events-none"></div>
                  <h3 className="text-xl font-bold mb-4 relative z-10 flex items-center gap-2">
                    <Bell size={20} className="text-amber-400" /> Web Push
                  </h3>
                  <p className="text-slate-400 text-sm mb-8 relative z-10">Cập nhật đơn hàng tự động ngay khi trạng thái thay đổi.</p>
                  
                  <div className="space-y-3 relative z-10">
                    {['Thông báo SMS', 'Thông báo ứng dụng'].map((label, idx) => (
                      <label key={idx} className="flex items-center justify-between p-4 bg-white/5 rounded-2xl hover:bg-white/10 transition-all cursor-pointer border border-white/5">
                        <span className="text-xs font-bold tracking-tight">{label}</span>
                        <div className="relative inline-flex items-center cursor-pointer">
                          <input type="checkbox" defaultChecked={idx < 2} className="sr-only peer" />
                          <div className="w-9 h-5 bg-white/10 rounded-full peer peer-checked:bg-amber-500 after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:after:translate-x-4"></div>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'map' && (
            <div className="bg-white p-4 rounded-[2.5rem] shadow-2xl border border-slate-100 overflow-hidden h-[650px] animate-in zoom-in-95 duration-500 relative">
               <div className="absolute top-8 left-8 z-10 space-y-4">
                  <div className="bg-white/90 backdrop-blur-md px-6 py-4 rounded-3xl border border-slate-100 shadow-xl flex items-center gap-4">
                    <div className="w-12 h-12 bg-amber-50 text-amber-600 rounded-2xl flex items-center justify-center">
                      <Truck size={24} />
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-slate-400 uppercase">Shipper đang ở</p>
                      <p className="text-lg font-extrabold text-slate-900">Quận 7, TP. HCM</p>
                    </div>
                  </div>
                  <div className="bg-slate-900/90 backdrop-blur-md px-6 py-4 rounded-3xl border border-white/10 shadow-xl text-white">
                      <p className="text-[10px] font-bold text-slate-400 uppercase">Ước tính khoảng cách</p>
                      <p className="text-lg font-extrabold">3.2 km <span className="text-amber-400">còn lại</span></p>
                  </div>
               </div>
               
               <img 
                alt="Bản đồ theo dõi" 
                className="w-full h-full object-cover grayscale opacity-50" 
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuBWw3nZOdFFAcvZZ8v5svG7ejDViTECkjdPTAlVh538mnZBVlE_mG2drApuSHG-N8HQ0E4PCqDwFzg8HiTR-4YC5qyNRgxxGcPxCZLcQtBf8EjSRNkzR-wE-KrR3izHLldSgHK_KGUYQJ5zD_ttDueTFHOSDsBDz6hM_vZ4Bkfhk3ik87og0MSwYRZh-pVAc7URj_AgdtouBsB5NPN9a3HiitmhWSxGMQT4AeBN9Gbq4zPUfIY7bizUrrMMmdrnztoG3vBJDb5kHNb1"
              />
              
              <div className="absolute inset-0 pointer-events-none p-12">
                 <svg className="w-full h-full" fill="none" viewBox="0 0 1000 500" xmlns="http://www.w3.org/2000/svg">
                    <path d="M100 400 L300 350 L500 380 L750 200" stroke="#f59e0b" strokeDasharray="12 12" strokeWidth="6" className="animate-[dash_10s_linear_infinite]"></path>
                    <circle className="animate-ping" cx="750" cy="200" fill="#f59e0b" r="10"></circle>
                    <circle cx="750" cy="200" fill="#f59e0b" r="8"></circle>
                 </svg>
              </div>
            </div>
          )}

          {activeTab === 'history' && (
            <div className="bg-white p-12 rounded-[2.5rem] shadow-sm border border-slate-100 animate-in slide-in-from-right-8 duration-500">
              <h3 className="text-2xl font-extrabold mb-12 flex items-center gap-4">
                <div className="p-3 bg-amber-50 text-amber-600 rounded-2xl">
                  <History size={32} />
                </div>
                Lịch sử hành trình đơn hàng
              </h3>
              <div className="space-y-12 relative before:absolute before:left-6 before:top-2 before:bottom-2 before:w-1 before:bg-slate-50">
                {[
                  { status: 'Giao hàng không thành công - Lần 1', time: '10:45 AM, Hôm nay', desc: 'Lý do: Không liên lạc được với người nhận. AI đã lên lịch giao lại vào lúc 14:30.', error: true },
                  { status: 'Dời kho trung chuyển Hà Nội', time: '08:20 AM, Hôm nay', desc: 'Đã phân loại xong và xếp lên xe tải EV-400.' },
                  { status: 'Đã nhận tại trạm trung chuyển', time: '06:00 AM, Hôm nay', desc: 'Kiện hàng được kiểm tra an ninh và cân đo AI.' },
                  { status: 'Đã lấy hàng thành công', time: '23:30 PM, Hôm qua', desc: 'Shipper đã lấy hàng từ kho người gửi.' },
                  { status: 'Người gửi đã tạo đơn', time: '21:00 PM, Hôm qua', desc: 'Thông tin AI xác thực thành công.' },
                ].map((item, idx) => (
                  <div key={idx} className="relative flex gap-8 pl-16 group">
                    <div className={`absolute left-0 w-12 h-12 rounded-full flex items-center justify-center border-4 border-white z-10 shadow-md transition-all group-hover:scale-110 ${
                      item.error ? 'bg-red-500 text-white' : idx === 0 ? 'bg-amber-400 text-white' : 'bg-slate-100 text-slate-400'
                    }`}>
                      {item.error ? <AlertCircle size={20} /> : <Check size={20} />}
                    </div>
                    <div className="flex flex-col gap-2">
                       <span className="text-[10px] font-extrabold text-slate-300 uppercase tracking-widest">{item.time}</span>
                       <h4 className={`text-lg font-extrabold ${item.error ? 'text-red-500' : idx === 0 ? 'text-slate-900' : 'text-slate-500'} leading-none`}>
                         {item.status}
                       </h4>
                       <p className="text-sm text-slate-400 max-w-2xl font-medium leading-relaxed">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default OrderTracking;

