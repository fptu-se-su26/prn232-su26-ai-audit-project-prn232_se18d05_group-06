import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle, Truck, Download, MapPin, Clock, ArrowRight } from 'lucide-react';
import Header from './Header';
import Footer from './Footer';

const OrderSuccess: React.FC = () => {
  const navigate = useNavigate();
  const [trackingId, setTrackingId] = useState('');
  const [orderId] = useState('ORD-' + Math.floor(100000 + Math.random() * 900000));

  useEffect(() => {
    const id = 'SL' + Math.random().toString(36).substr(2, 9).toUpperCase();
    setTrackingId(id);
  }, []);

  return (
    <div className="min-h-screen bg-slate-50">
      <Header />
      <div className="pt-32 pb-20">
        <div className="max-w-4xl mx-auto px-6">
          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-green-50 text-green-600 mb-8 mx-auto animate-bounce ring-4 ring-green-100">
              <CheckCircle size={56} />
            </div>
            <h1 className="text-4xl font-extrabold text-slate-900 mb-4">Tạo đơn hàng thành công!</h1>
            <p className="text-slate-500 text-lg font-medium">Đơn hàng của bạn đang được xử lý. Bạn có thể theo dõi hành trình ngay bây giờ.</p>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-white rounded-[2rem] p-8 shadow-sm border border-slate-100 text-center">
                <p className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-4">Mã vận đơn của bạn</p>
                <div className="relative inline-block">
                  <p className="text-4xl font-extrabold text-blue-600 font-mono tracking-tighter mb-4">{trackingId}</p>
                  <div className="absolute -right-12 top-1 p-2 bg-blue-50 text-blue-600 rounded-lg cursor-pointer hover:bg-blue-100 transition-colors">
                    <Download size={16} />
                  </div>
                </div>
                <div className="flex items-center justify-center gap-2 mt-4">
                  <span className="px-3 py-1 bg-blue-50 text-blue-600 text-[10px] font-bold rounded-full border border-blue-100 uppercase tracking-widest">Đã xác nhận</span>
                  <span className="text-slate-300">•</span>
                  <p className="text-xs text-slate-400 font-medium italic">Mã đơn hàng: {orderId}</p>
                </div>
              </div>

              <div className="bg-white rounded-[2rem] p-8 shadow-sm border border-slate-100">
                <h3 className="text-lg font-bold text-slate-900 mb-8 flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-orange-50 text-orange-500 flex items-center justify-center">
                    <Truck size={18} />
                  </div>
                  Tiến độ vận chuyển dự kiến
                </h3>
                <div className="relative space-y-8 before:absolute before:left-5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-100">
                  {[
                    { status: 'Đã tạo đơn hàng', completed: true, time: 'Vừa xong', desc: 'Đơn hàng đã được ghi nhận trên hệ thống' },
                    { status: 'Đang lấy hàng', completed: false, time: 'Dự kiến 17:30', desc: 'Shipper đang trên đường đến lấy hàng' },
                    { status: 'Đang vận chuyển', completed: false, time: 'Ngày mai', desc: 'Đang chuyển đến kho phân loại trung tâm' },
                    { status: 'Giao hàng thành công', completed: false, time: '2-3 ngày tới', desc: 'Người nhận ký xác nhận đơn hàng' },
                  ].map((item, idx) => (
                    <div key={idx} className="relative flex gap-6 pl-12 group">
                      <div className={`absolute left-0 w-10 h-10 rounded-full flex items-center justify-center border-4 border-white z-10 transition-colors shadow-sm ${
                        item.completed ? 'bg-green-500 text-white' : 'bg-slate-100 text-slate-400'
                      }`}>
                        {item.completed ? <CheckCircle size={18} /> : <div className="w-2 h-2 bg-current rounded-full"></div>}
                      </div>
                      <div className="pb-2">
                        <div className="flex items-center gap-3">
                          <p className={`font-bold transition-colors ${item.completed ? 'text-slate-900' : 'text-slate-400'}`}>{item.status}</p>
                          <span className="text-[10px] font-bold text-slate-300 uppercase tracking-tighter">{item.time}</span>
                        </div>
                        <p className="text-xs text-slate-400 mt-1">{item.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-[2rem] p-8 text-white shadow-xl relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -mr-16 -mt-16 blur-2xl"></div>
                
                <h3 className="text-lg font-bold mb-8 relative z-10 flex items-center gap-2">
                  Hành động nhanh
                </h3>
                
                <div className="space-y-4 relative z-10">
                  <button
                    onClick={() => navigate('/tracking')}
                    className="w-full py-4 bg-white text-slate-900 rounded-2xl font-bold hover:scale-[1.02] transition-all flex items-center justify-center gap-2 group/btn"
                  >
                    Theo dõi đơn hàng
                    <ArrowRight size={18} className="group-hover/btn:translate-x-1 transition-transform" />
                  </button>
                  <button className="w-full py-4 bg-white/10 text-white rounded-2xl font-bold hover:bg-white/20 transition-all flex items-center justify-center gap-2 border border-white/10">
                    Sửa đổi thông tin
                  </button>
                  <button 
                    onClick={() => navigate('/')}
                    className="w-full py-4 text-white/60 text-sm font-semibold hover:text-white transition-colors"
                  >
                    Quay về trang chủ
                  </button>
                </div>

                <div className="mt-8 pt-8 border-t border-white/5 space-y-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-white/40">Tổng thanh toán</span>
                    <span className="font-bold text-blue-400 text-lg">45.000đ</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-white/40">Hình thức</span>
                    <span className="font-medium">Chuyển khoản</span>
                  </div>
                </div>
              </div>

              <div className="bg-blue-50 rounded-3xl p-6 border border-blue-100 flex items-start gap-4">
                <div className="p-2 bg-white rounded-xl text-blue-600 flex-shrink-0 shadow-sm">
                  <Clock size={20} />
                </div>
                <div>
                  <p className="text-sm font-bold text-slate-900">Thông báo đẩy</p>
                  <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                    Bật thông báo để nhận cập nhật trạng thái đơn hàng ngay trên điện thoại của bạn.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default OrderSuccess;
