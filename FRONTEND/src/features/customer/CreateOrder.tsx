import React, { useState } from 'react';
import Header from './Header';
import { useNavigate } from 'react-router-dom';

const CreateOrder: React.FC = () => {
  const navigate = useNavigate();
  const [price, setPrice] = useState(45000);
  const [isFragile, setIsFragile] = useState(false);
  const [isCOD, setIsCOD] = useState(true);

  const handleCreateOrder = () => {
    // Navigate to flow 2 (tracking) via success page
    navigate('/order-success');
  };

  // Micro-interaction animation hook for price
  const animatePrice = () => {
    let start = 0;
    const end = 45000;
    const duration = 1000;
    let startTimestamp: number | null = null;
    const step = (timestamp: number) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const progress = Math.min((timestamp - startTimestamp) / duration, 1);
      setPrice(Math.floor(progress * (end - start) + start));
      if (progress < 1) {
        window.requestAnimationFrame(step);
      }
    };
    window.requestAnimationFrame(step);
  };

  return (
    <div className="bg-slate-50 min-h-screen font-sans text-[#191c1e] overflow-x-hidden">
      <Header />

      {/* Main Content Area */}
      <main className="mt-24 pb-16 px-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
            <div>
              <h2 className="font-sans text-[32px] leading-[40px] font-bold tracking-[-0.01em] text-slate-900">
                Tạo Đơn Hàng Mới
              </h2>
              <p className="font-sans text-[16px] leading-[24px] text-slate-500 mt-1">
                Khởi tạo vận đơn thông minh với sự hỗ trợ của AI
              </p>
            </div>
            <div className="flex gap-3">
              <button className="px-6 py-2.5 rounded-xl border border-slate-200 font-sans text-[14px] font-semibold text-slate-600 hover:bg-slate-100 transition-colors">
                Lưu Nháp
              </button>
              <button className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-sans text-[14px] font-semibold shadow-md active:scale-95 transition-transform">
                Nhập Từ Excel
              </button>
            </div>
          </div>

          <div className="grid grid-cols-12 gap-6">
            {/* Left Column: Form Info */}
            <div className="col-span-12 lg:col-span-7 space-y-6">
              {/* Sender & Receiver */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <section className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 space-y-5 group">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="p-2 bg-purple-50 text-purple-600 rounded-lg material-symbols-outlined">person</span>
                    <h3 className="font-sans text-[18px] font-semibold text-slate-900">Thông Tin Người Gửi</h3>
                  </div>
                  <div className="space-y-4">
                    <div className="space-y-1">
                      <label className="text-[12px] font-bold text-slate-400 uppercase ml-1">Họ và Tên</label>
                      <input className="w-full bg-slate-50 border-none rounded-xl py-3 px-4 focus:ring-2 focus:ring-purple-500/20 outline-none" placeholder="Nguyễn Văn A" type="text" />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[12px] font-bold text-slate-400 uppercase ml-1">Số Điện Thoại</label>
                      <input className="w-full bg-slate-50 border-none rounded-xl py-3 px-4 focus:ring-2 focus:ring-purple-500/20 outline-none" placeholder="0901 234 567" type="tel" />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[12px] font-bold text-slate-400 uppercase ml-1">Địa Chỉ Lấy Hàng</label>
                      <textarea className="w-full bg-slate-50 border-none rounded-xl py-3 px-4 focus:ring-2 focus:ring-purple-500/20 outline-none resize-none" placeholder="Số nhà, tên đường, phường/xã..." rows={2}></textarea>
                    </div>
                  </div>
                </section>

                <section className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 space-y-5 group">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="p-2 bg-indigo-50 text-indigo-600 rounded-lg material-symbols-outlined">location_away</span>
                    <h3 className="font-sans text-[18px] font-semibold text-slate-900">Thông Tin Người Nhận</h3>
                  </div>
                  <div className="space-y-4">
                    <div className="space-y-1">
                      <label className="text-[12px] font-bold text-slate-400 uppercase ml-1">Họ và Tên</label>
                      <input className="w-full bg-slate-50 border-none rounded-xl py-3 px-4 focus:ring-2 focus:ring-indigo-500/20 outline-none" placeholder="Trần Thị B" type="text" />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[12px] font-bold text-slate-400 uppercase ml-1">Số Điện Thoại</label>
                      <input className="w-full bg-slate-50 border-none rounded-xl py-3 px-4 focus:ring-2 focus:ring-indigo-500/20 outline-none" placeholder="0912 888 999" type="tel" />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[12px] font-bold text-slate-400 uppercase ml-1">Địa Chỉ Giao Hàng</label>
                      <textarea className="w-full bg-slate-50 border-none rounded-xl py-3 px-4 focus:ring-2 focus:ring-indigo-500/20 outline-none resize-none" placeholder="Số nhà, tên đường, quận/huyện..." rows={2}></textarea>
                    </div>
                  </div>
                </section>
              </div>

              {/* Package Info */}
              <section className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 space-y-6">
                <div className="flex items-center gap-2">
                  <span className="p-2 bg-purple-50 text-purple-600 rounded-lg material-symbols-outlined">package_2</span>
                  <h3 className="font-sans text-[20px] font-semibold text-slate-900">Chi Tiết Hàng Hóa</h3>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="space-y-1">
                    <label className="text-[12px] font-bold text-slate-400 uppercase">Loại</label>
                    <select className="w-full bg-slate-50 border-none rounded-xl py-3 px-4 focus:ring-2 focus:ring-purple-500/20 outline-none appearance-none font-semibold text-slate-700">
                      <option>Điện tử</option>
                      <option>Thời trang</option>
                      <option>Gia dụng</option>
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[12px] font-bold text-slate-400 uppercase">Khối Lượng (kg)</label>
                    <input className="w-full bg-slate-50 border-none rounded-xl py-3 px-4 focus:ring-2 focus:ring-purple-500/20 outline-none" type="number" defaultValue="1.5" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[12px] font-bold text-slate-400 uppercase">Số Lượng</label>
                    <input className="w-full bg-slate-50 border-none rounded-xl py-3 px-4 focus:ring-2 focus:ring-purple-500/20 outline-none" type="number" defaultValue="1" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[12px] font-bold text-slate-400 uppercase">Kích Thước (cm)</label>
                    <input className="w-full bg-slate-50 border-none rounded-xl py-3 px-4 focus:ring-2 focus:ring-purple-500/20 outline-none" placeholder="D x R x C" type="text" />
                  </div>
                </div>

                <div className="flex flex-wrap gap-6 py-2">
                  <label className="flex items-center gap-3 cursor-pointer group" onClick={() => setIsFragile(!isFragile)}>
                    <div className={`w-6 h-6 rounded border-2 flex items-center justify-center transition-colors ${isFragile ? 'border-purple-600 bg-purple-600' : 'border-slate-200 group-hover:border-purple-500'}`}>
                      <span className={`material-symbols-outlined text-white text-[16px] ${isFragile ? 'block' : 'hidden'}`} style={{ fontVariationSettings: "'FILL' 1" }}>check</span>
                    </div>
                    <span className="font-sans text-[16px] text-slate-600 font-medium">Hàng Dễ Vỡ</span>
                  </label>
                  <label className="flex items-center gap-3 cursor-pointer group" onClick={() => setIsCOD(!isCOD)}>
                    <div className={`w-6 h-6 rounded border-2 flex items-center justify-center transition-colors ${isCOD ? 'border-purple-600 bg-purple-600' : 'border-slate-200 group-hover:border-purple-500'}`}>
                      <span className={`material-symbols-outlined text-white text-[16px] ${isCOD ? 'block' : 'hidden'}`} style={{ fontVariationSettings: "'FILL' 1" }}>check</span>
                    </div>
                    <span className="font-sans text-[16px] text-slate-600 font-medium">Thu Hộ (COD)</span>
                  </label>
                </div>

                <div className="space-y-1">
                  <label className="text-[12px] font-bold text-slate-400 uppercase">Giá trị COD (VNĐ)</label>
                  <input className="w-full bg-slate-50 border-none rounded-2xl py-4 px-6 font-sans text-[24px] text-purple-600 font-bold focus:ring-2 focus:ring-purple-500/20 outline-none" type="text" defaultValue="1.500.000" />
                </div>

                {/* Drag & Drop */}
                <div className="border-2 border-dashed border-slate-100 rounded-3xl p-8 flex flex-col items-center justify-center text-center hover:border-purple-200 hover:bg-purple-50/30 transition-all cursor-pointer group">
                  <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    <span className="material-symbols-outlined text-purple-600 text-[32px]">cloud_upload</span>
                  </div>
                  <p className="font-sans text-[14px] font-bold text-slate-700">Kéo thả ảnh kiện hàng hoặc <span className="text-purple-600 underline block sm:inline">Tải lên</span></p>
                  <p className="font-sans text-[12px] text-slate-400 mt-1">Hỗ trợ JPG, PNG (Tối đa 5MB)</p>
                </div>
              </section>
            </div>

            {/* Right Column: AI Insights & Maps */}
            <div className="col-span-12 lg:col-span-5 space-y-6">
              {/* Smart Quote Panel */}
              <section className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 border-l-4 border-purple-500 overflow-hidden relative" onClick={animatePrice}>
                <div className="absolute top-0 right-0 p-4 opacity-10 pointer-events-none">
                  <span className="material-symbols-outlined text-[80px]">neurology</span>
                </div>
                <div className="flex items-center gap-3 mb-6">
                  <span className="material-symbols-outlined text-purple-600" style={{ fontVariationSettings: "'FILL' 1" }}>auto_awesome</span>
                  <h3 className="font-sans text-[24px] font-bold text-slate-900">AI Smart Quote</h3>
                </div>
                <div className="space-y-5">
                  <div className="bg-purple-50/50 p-6 rounded-2xl border border-purple-100 hover:scale-[1.02] cursor-pointer transition-transform duration-300">
                    <span className="text-[10px] font-extrabold text-purple-600 uppercase tracking-widest block mb-1">Cước phí ước tính</span>
                    <div className="flex items-baseline gap-2">
                      <span className="font-sans text-[48px] font-extrabold tracking-[-0.02em] text-slate-900">
                        {price.toLocaleString('vi-VN')}
                      </span>
                      <span className="font-sans text-[20px] font-bold text-slate-400">VNĐ</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-3">
                    <div className="flex items-center justify-between p-4 bg-slate-50/50 rounded-2xl border border-slate-100 hover:bg-white hover:shadow-md transition-all cursor-pointer group">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center shadow-sm">
                          <span className="material-symbols-outlined text-slate-400 group-hover:text-amber-500 transition-colors">local_shipping</span>
                        </div>
                        <div>
                          <p className="font-bold text-slate-900">Giao Tiết Kiệm</p>
                          <p className="text-xs text-slate-500">3-5 ngày</p>
                        </div>
                      </div>
                      <span className="font-bold text-slate-900">32.000đ</span>
                    </div>
                    <div className="flex items-center justify-between p-4 bg-purple-50/80 rounded-2xl border-2 border-purple-500 transition-all cursor-pointer relative overflow-hidden group">
                      <div className="absolute top-0 right-0 px-4 py-1.5 bg-purple-600 text-white text-[10px] font-bold uppercase rounded-bl-xl shadow-lg shadow-purple-200">Recommend</div>
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center shadow-sm">
                          <span className="material-symbols-outlined text-purple-600">bolt</span>
                        </div>
                        <div>
                          <p className="font-bold text-purple-600">Giao Hỏa Tốc</p>
                          <p className="text-xs text-purple-400">Trong ngày</p>
                        </div>
                      </div>
                      <span className="font-bold text-purple-600">45.000đ</span>
                    </div>
                  </div>
                </div>
              </section>

              {/* Route Map */}
              <section className="bg-white rounded-3xl overflow-hidden shadow-sm border border-slate-100 aspect-video md:aspect-[4/3] lg:aspect-video relative group">
                <img alt="Route visualization" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" src="https://lh3.googleusercontent.com/aida-public/AB6AXuC0PZuNRRi4ZOJmqvbq_ZbBZuWDXQW9nDTazYcfPPbTcytujHQcd2YvbEJ-Ynw4hDjrtLShe5NxPhvTsNGNxQvBwrUtJPIk96anxFi533rx-g0zeH2BDiJRlRQNucsTIpm8cg-8_fZd4Tmnm56KLLosHUi6iTAQJiyAHqDhvTDHzD-54zb1cwVriPoFF_ikMeANjcklm0pP8x7nkbOozH3uVLh6mD_sAEJB3S-asmFwzjKiUdAT0xhpjb4cGOPQ4lDpIhYDEASywhfZ" />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-transparent to-transparent"></div>
                <div className="absolute bottom-6 left-6 right-6 flex justify-between items-end">
                  <div className="text-white">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-white/60 mb-1">Lộ trình đề xuất</p>
                    <p className="text-xl font-bold">Quận 1 → Quận 7</p>
                    <p className="text-xs font-medium text-white/70 mt-1">Khoảng cách: 12.5 km</p>
                  </div>
                  <button className="bg-white/10 backdrop-blur-md p-3 rounded-2xl text-white hover:bg-white/20 border border-white/20 transition-all hover:scale-110">
                    <span className="material-symbols-outlined">fullscreen</span>
                  </button>
                </div>
              </section>

              {/* Final CTA */}
              <button 
                onClick={handleCreateOrder}
                className="w-full h-20 bg-gradient-to-r from-purple-600 to-indigo-700 text-white rounded-[2rem] font-bold text-[22px] shadow-xl shadow-purple-200 hover:shadow-purple-400/30 flex items-center justify-center gap-3 active:scale-95 transition-all hover:-translate-y-1 group mt-8"
              >
                <span>Tạo Đơn Hàng</span>
                <span className="material-symbols-outlined text-[32px] group-hover:translate-x-2 transition-transform duration-300">arrow_right_alt</span>
              </button>

              <p className="text-center font-co-inter text-[12px] leading-[16px] font-medium tracking-[0.02em] text-co-secondary px-8 mt-6">
                Bằng việc tạo đơn hàng, bạn đồng ý với <a className="text-co-primary underline hover:text-blue-800 transition-colors cursor-pointer" href="#">Điều khoản dịch vụ</a> và <a className="text-co-primary underline hover:text-blue-800 transition-colors cursor-pointer" href="#">Chính sách bảo mật</a> của SmartLog AI.
              </p>
            </div>
          </div>
        </div>
      </main>

      {/* Floating AI Assistant */}
      <div className="fixed bottom-8 right-8 z-50">
        <button className="w-16 h-16 kinetic-gradient rounded-full shadow-2xl flex items-center justify-center text-white hover:scale-110 transition-transform relative group">
          <span className="material-symbols-outlined text-[32px]" style={{ fontVariationSettings: "'FILL' 1" }}>smart_toy</span>
          <div className="absolute -top-12 right-0 bg-co-on-background text-white px-4 py-2 rounded-xl font-co-inter text-[12px] leading-[16px] font-medium tracking-[0.02em] opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap shadow-xl">
            Cần trợ giúp với đơn hàng?
          </div>
          <span className="absolute top-0 right-0 w-4 h-4 bg-co-error rounded-full border-2 border-white animate-pulse"></span>
        </button>
      </div>
    </div>
  );
};

export default CreateOrder;
