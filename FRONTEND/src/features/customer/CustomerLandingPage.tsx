import React, { useState, useEffect } from 'react';
import {
  ArrowRight,
  MapPin,
  Radio,
  Zap,
  Warehouse,
  Package,
  FileText,
  TrendingUp,
  MessageSquare,
  Check,
  CheckCircle2,
  Rocket,
} from 'lucide-react';
import Header from './Header';
import Footer from './Footer';

const CustomerLandingPage: React.FC = () => {
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Scroll Reveal Observer
  useEffect(() => {
    const observerOptions = {
      root: null,
      rootMargin: '0px',
      threshold: 0.1,
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-revealed');
        }
      });
    }, observerOptions);

    const revealElements = document.querySelectorAll('.reveal-on-scroll');
    revealElements.forEach((el) => observer.observe(el));

    return () => {
      revealElements.forEach((el) => observer.unobserve(el));
    };
  }, []);

  // Particle animation
  useEffect(() => {
    const particleContainer = document.getElementById('particle-container');
    if (!particleContainer) return;

    const particleCount = 25;
    for (let i = 0; i < particleCount; i++) {
      const particle = document.createElement('div');
      particle.className = 'particle';

      const size = Math.random() * 6 + 2;
      particle.style.width = `${size}px`;
      particle.style.height = `${size}px`;
      particle.style.left = `${Math.random() * 100}%`;
      particle.style.top = `${Math.random() * 100}%`;

      const duration = Math.random() * 15 + 10;
      const delay = Math.random() * 5;

      particle.animate(
        [
          { transform: 'translate(0, 0)', opacity: '0.2' },
          {
            transform: `translate(${Math.random() * 200 - 100}px, ${Math.random() * 200 - 100}px)`,
            opacity: '0.1',
          },
          { transform: 'translate(0, 0)', opacity: '0.2' },
        ],
        {
          duration: duration * 1000,
          delay: delay * 1000,
          iterations: Infinity,
          easing: 'ease-in-out',
        },
      );

      particleContainer.appendChild(particle);
    }
  }, []);

  return (
    <div className="bg-white overflow-x-hidden">
      {/* Header Component */}
      <Header scrollY={scrollY} />

      {/* Hero Section */}
      <section
        className="relative min-h-screen pt-32 pb-20 overflow-hidden"
        style={{
          background:
            'radial-gradient(circle at top right, rgba(0, 74, 198, 0.15), transparent), radial-gradient(circle at bottom left, rgba(123, 208, 255, 0.2), transparent), radial-gradient(circle at center, rgba(147, 51, 234, 0.05), transparent), white',
        }}
      >
        {/* Particles */}
        <div id="particle-container" className="absolute inset-0" />

        <div className="max-w-7xl mx-auto px-8 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center relative z-10">
          {/* Left Content */}
          <div className="reveal-on-scroll">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 mb-6 px-4 py-1.5 bg-blue-50 rounded-full border border-blue-100 hover:bg-blue-100 transition-colors cursor-pointer">
              <CheckCircle2 size={16} className="text-blue-600 animate-pulse" />
              <span className="text-blue-600 text-sm font-semibold">Công nghệ vận tải 4.0</span>
            </div>

            {/* Headline */}
            <h1 className="text-5xl lg:text-7xl font-extrabold text-gray-900 mb-6 leading-[1.1] tracking-tight">
              AI-Powered{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-cyan-500">
                Smart
              </span>
              <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-cyan-500">
                Logistics
              </span>{' '}
              Platform
            </h1>

            {/* Description */}
            <p className="text-lg lg:text-xl text-gray-500 mb-10 leading-relaxed max-w-xl font-medium">
              Tối ưu vận chuyển, theo dõi realtime và quản lý logistics thông minh bằng AI. Giúp
              doanh nghiệp tiết kiệm đến <span className="text-blue-600 font-bold">30%</span> chi
              phí vận hành.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 mb-12">
              <button
                onClick={() => (window.location.href = '/create-shipment')}
                className="px-8 py-4 bg-gradient-to-r from-blue-600 to-blue-800 text-white rounded-xl shadow-lg shadow-blue-600/30 hover:shadow-blue-600/50 hover:scale-[1.02] transition-all duration-300 font-semibold flex items-center justify-center gap-2 group"
              >
                Create Shipment
                <Rocket
                  size={18}
                  className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform duration-300"
                />
              </button>
              <button
                onClick={() => (window.location.href = '/tracking')}
                className="px-8 py-4 bg-white border border-gray-200 text-gray-700 rounded-xl shadow-sm hover:shadow-xl hover:border-blue-200 hover:text-blue-600 hover:scale-[1.02] transition-all duration-300 font-semibold flex items-center justify-center gap-2 group"
              >
                Track Order
                <MapPin size={18} className="group-hover:animate-bounce" />
              </button>
            </div>
          </div>

          {/* Right - Illustration */}
          <div className="relative h-96 lg:h-[500px] rounded-3xl overflow-hidden shadow-2xl reveal-on-scroll delay-200 group animate-float">
            <div className="absolute inset-0 bg-gradient-to-tr from-blue-600/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 z-10"></div>
            <img
              src="/src/assets/images/customer/hero-illustration.png"
              alt="SmartLog AI Dashboard"
              className="w-full h-full object-cover"
            />
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-8 bg-white relative">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16 reveal-on-scroll">
            <div className="text-sm font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-cyan-500 mb-4 tracking-widest uppercase">
              TÍNH NĂNG CỐT LÕI
            </div>
            <h2 className="text-4xl lg:text-5xl font-extrabold text-gray-900 tracking-tight">
              Giải pháp Logistics đột phá
            </h2>
          </div>

          {/* Feature Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
            {[
              {
                icon: Zap,
                title: 'AI Route Optimization',
                desc: 'Sử dụng AI để tìm lộ trình tối ưu, giảm xăng dầu được 40%, tăng năng suất cao.',
                color: 'bg-blue-50 text-blue-600 group-hover:bg-blue-600 group-hover:text-white',
              },
              {
                icon: Radio,
                title: 'Realtime Tracking',
                desc: 'Theo dõi vị trí thực tế, tình trạng hàng hóa theo thời gian 24/7 trên bản đồ.',
                color: 'bg-cyan-50 text-cyan-600 group-hover:bg-cyan-600 group-hover:text-white',
              },
              {
                icon: Warehouse,
                title: 'Smart Warehouse',
                desc: 'Quản lý kho bãi tự động, cập nhật tồn kho, bảo mật tối ưu cho hàng hóa.',
                color:
                  'bg-indigo-50 text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white',
              },
              {
                icon: Package,
                title: 'COD Management',
                desc: 'Đối soát COD minh bạch, báo cáo nhanh chóng, chính xác cho từng đơn hàng.',
                color:
                  'bg-orange-50 text-orange-600 group-hover:bg-orange-600 group-hover:text-white',
              },
            ].map((feature, idx) => {
              const Icon = feature.icon;
              return (
                <div
                  key={idx}
                  className={`text-center p-6 rounded-3xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 border border-transparent hover:border-gray-100 bg-white group reveal-on-scroll delay-${(idx + 1) * 100}`}
                >
                  <div
                    className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-6 mx-auto transition-colors duration-300 ${feature.color}`}
                  >
                    <Icon
                      size={32}
                      className="transform group-hover:scale-110 transition-transform duration-300"
                    />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-3">{feature.title}</h3>
                  <p className="text-gray-500 font-medium leading-relaxed">{feature.desc}</p>
                </div>
              );
            })}
          </div>

          {/* Stats Section */}
          <div
            className="rounded-3xl p-12 overflow-hidden relative reveal-on-scroll delay-200"
            style={{
              background: 'linear-gradient(135deg, #004ac6 0%, #0053db 100%)',
            }}
          >
            {/* Background pattern for stats */}
            <div
              className="absolute inset-0 opacity-10"
              style={{
                backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)',
                backgroundSize: '24px 24px',
              }}
            ></div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center relative z-10">
              <div className="transform hover:scale-105 transition-transform">
                <p className="text-4xl lg:text-5xl font-extrabold text-white">739,980+</p>
                <p className="text-xs font-bold mt-3 text-blue-200 tracking-widest">
                  ĐƠN HÀNG GIAO THÀNH CÔNG
                </p>
              </div>
              <div className="transform hover:scale-105 transition-transform">
                <p className="text-4xl lg:text-5xl font-extrabold text-white">30,832+</p>
                <p className="text-xs font-bold mt-3 text-blue-200 tracking-widest">
                  TÀI XẾ ĐANG HOẠT ĐỘNG
                </p>
              </div>
              <div className="transform hover:scale-105 transition-transform">
                <p className="text-4xl lg:text-5xl font-extrabold text-white">154</p>
                <p className="text-xs font-bold mt-3 text-blue-200 tracking-widest">
                  KHO BÃI TOÀN CẦU
                </p>
              </div>
              <div className="transform hover:scale-105 transition-transform">
                <p className="text-4xl lg:text-5xl font-extrabold text-white">61.6%</p>
                <p className="text-xs font-bold mt-3 text-blue-200 tracking-widest">
                  TỶ LỆ GIAO HÀNG ĐÚNG HẠN
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* AI Section (Combined Ecosystem & Integration) */}
      <section className="py-24 px-8 bg-gray-50 border-t border-gray-100 overflow-hidden relative">
        {/* Dynamic Background Elements */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
          <div className="absolute -top-[20%] -left-[10%] w-[50%] h-[50%] rounded-full bg-blue-100/40 blur-3xl animate-pulse"></div>
          <div
            className="absolute -bottom-[20%] -right-[10%] w-[50%] h-[50%] rounded-full bg-cyan-100/40 blur-3xl animate-pulse"
            style={{ animationDelay: '2s' }}
          ></div>
        </div>

        <div className="max-w-7xl mx-auto relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24 items-center">
            {/* Left Column: Ecosystem Card */}
            <div className="relative group reveal-on-scroll">
              {/* Decorative element behind card */}
              <div className="absolute inset-0 bg-blue-600 rounded-[2rem] transform translate-y-4 translate-x-4 opacity-5 group-hover:translate-y-6 group-hover:translate-x-6 transition-transform duration-500"></div>

              <div className="bg-white rounded-[2rem] p-8 lg:p-10 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 relative transform transition-transform duration-500 hover:-translate-y-2">
                {/* Card Header */}
                <div className="flex items-center gap-4 mb-10">
                  <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center shadow-lg shadow-blue-600/30 text-white">
                    <Zap size={24} className="animate-pulse" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900">Hệ sinh thái SmartLog AI</h3>
                </div>

                {/* Card List Items */}
                <div className="space-y-6">
                  {/* Item 1 */}
                  <div className="flex items-center justify-between p-4 rounded-2xl hover:bg-blue-50/50 transition-colors duration-300 group/item">
                    <div className="flex items-start gap-4">
                      <div className="mt-1 w-10 h-10 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center group-hover/item:bg-blue-600 group-hover/item:text-white transition-colors duration-300">
                        <FileText size={20} />
                      </div>
                      <div>
                        <h4 className="font-bold text-gray-900 group-hover/item:text-blue-600 transition-colors">
                          OCR Invoice
                        </h4>
                        <p className="text-sm text-gray-500 mt-1">
                          Tự động nhận diện và nhập liệu hóa đơn
                        </p>
                      </div>
                    </div>
                    <div className="w-6 h-6 rounded-full bg-green-100 text-green-600 flex items-center justify-center flex-shrink-0">
                      <Check size={14} strokeWidth={3} />
                    </div>
                  </div>

                  {/* Item 2 */}
                  <div className="flex items-center justify-between p-4 rounded-2xl hover:bg-blue-50/50 transition-colors duration-300 group/item">
                    <div className="flex items-start gap-4">
                      <div className="mt-1 w-10 h-10 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center group-hover/item:bg-blue-600 group-hover/item:text-white transition-colors duration-300">
                        <TrendingUp size={20} />
                      </div>
                      <div>
                        <h4 className="font-bold text-gray-900 group-hover/item:text-blue-600 transition-colors">
                          AI Forecast
                        </h4>
                        <p className="text-sm text-gray-500 mt-1">
                          Dự báo nhu cầu vận tải và biến động giá
                        </p>
                      </div>
                    </div>
                    <div className="w-6 h-6 rounded-full bg-green-100 text-green-600 flex items-center justify-center flex-shrink-0">
                      <Check size={14} strokeWidth={3} />
                    </div>
                  </div>

                  {/* Item 3 */}
                  <div className="flex items-center justify-between p-4 rounded-2xl hover:bg-blue-50/50 transition-colors duration-300 group/item">
                    <div className="flex items-start gap-4">
                      <div className="mt-1 w-10 h-10 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center group-hover/item:bg-blue-600 group-hover/item:text-white transition-colors duration-300">
                        <MessageSquare size={20} />
                      </div>
                      <div>
                        <h4 className="font-bold text-gray-900 group-hover/item:text-blue-600 transition-colors">
                          AI Chatbot
                        </h4>
                        <p className="text-sm text-gray-500 mt-1">Hỗ trợ khách hàng tự động 24/7</p>
                      </div>
                    </div>
                    <div className="w-6 h-6 rounded-full bg-green-100 text-green-600 flex items-center justify-center flex-shrink-0">
                      <Check size={14} strokeWidth={3} />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column: Content */}
            <div className="lg:pl-8 reveal-on-scroll delay-200">
              <div className="inline-flex tracking-widest uppercase text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-cyan-500 text-sm font-bold mb-4 relative">
                TRÍ TUỆ NHÂN TẠO
              </div>

              <h2 className="text-4xl lg:text-5xl font-extrabold text-gray-900 mb-6 leading-tight tracking-tight">
                Đưa AI vào trung tâm của chuỗi cung ứng
              </h2>

              <p className="text-lg text-gray-600 mb-10 leading-relaxed font-medium">
                Chúng tôi không chỉ vận chuyển hàng hóa, chúng tôi vận chuyển thông tin. Hệ thống
                SmartLog AI tự học hỏi và tối ưu hóa theo thời gian thực.
              </p>

              <div className="space-y-6">
                {[
                  'Tự động hóa 80% quy trình giấy tờ',
                  'Phản hồi khách hàng ngay lập tức',
                  'Giảm sai sót vận hành xuống mức 0.1%',
                ].map((benefit, idx) => (
                  <div
                    key={idx}
                    className="flex items-center gap-4 group p-3 hover:bg-white rounded-2xl hover:shadow-lg transition-all duration-300"
                  >
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center group-hover:bg-blue-600 transition-colors duration-300">
                      <Check
                        size={16}
                        className="text-blue-600 group-hover:text-white transition-colors duration-300"
                        strokeWidth={3}
                      />
                    </div>
                    <p className="text-gray-700 font-bold group-hover:text-blue-700 transition-colors">
                      {benefit}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* New: Smart Insights & Dashboard Preview */}
      <section className="py-24 px-8 bg-white overflow-hidden">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col lg:flex-row gap-16 items-center">
            <div className="lg:w-1/2 reveal-on-scroll">
              <h2 className="text-4xl lg:text-5xl font-extrabold text-gray-900 mb-8 leading-tight">
                Quản lý thông minh<br />
                <span className="text-blue-600">Trong tầm tay bạn</span>
              </h2>
              <p className="text-lg text-gray-600 mb-10 leading-relaxed font-medium">
                Dashboard của chúng tôi cung cấp cái nhìn toàn diện về hoạt động logistics của bạn, từ theo dõi đơn hàng đến phân tích chi phí và gợi ý tối ưu từ AI.
              </p>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="p-6 bg-blue-50 rounded-2xl border border-blue-100">
                  <div className="w-12 h-12 bg-white rounded-xl shadow-sm flex items-center justify-center text-blue-600 mb-4">
                    <Rocket size={24} />
                  </div>
                  <h4 className="font-bold text-gray-900 mb-2">Tạo đơn siêu tốc</h4>
                  <p className="text-sm text-gray-500">Quy trình tạo đơn chỉ mất 30 giây với sự hỗ trợ của AI Smart Quote.</p>
                </div>
                <div className="p-6 bg-indigo-50 rounded-2xl border border-indigo-100">
                  <div className="w-12 h-12 bg-white rounded-xl shadow-sm flex items-center justify-center text-indigo-600 mb-4">
                    <TrendingUp size={24} />
                  </div>
                  <h4 className="font-bold text-gray-900 mb-2">Phân tích chi phí</h4>
                  <p className="text-sm text-gray-500">Báo cáo chi phí minh bạch, giúp bạn kiểm soát ngân sách vận hành hiệu quả.</p>
                </div>
              </div>
            </div>

            {/* Dashboard Mockup Component */}
            <div className="lg:w-1/2 relative reveal-on-scroll delay-200">
              <div className="bg-slate-900 rounded-[2rem] p-4 shadow-2xl border border-slate-800">
                <div className="bg-slate-800 rounded-t-xl p-3 flex gap-2 border-b border-slate-700">
                  <div className="w-3 h-3 rounded-full bg-red-500"></div>
                  <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                  <div className="w-3 h-3 rounded-full bg-green-500"></div>
                </div>
                <div className="bg-slate-50 rounded-b-xl p-6 h-[400px] overflow-hidden relative">
                  {/* Mock Stats */}
                  <div className="grid grid-cols-2 gap-4 mb-6">
                    <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
                      <p className="text-[10px] font-bold text-gray-400 uppercase">Total Orders</p>
                      <p className="text-xl font-black text-blue-600">1,284</p>
                    </div>
                    <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
                      <p className="text-[10px] font-bold text-gray-400 uppercase">In Transit</p>
                      <p className="text-xl font-black text-cyan-500">142</p>
                    </div>
                  </div>
                  
                  {/* Mock AI Suggestion */}
                  <div className="bg-blue-600 rounded-2xl p-5 text-white shadow-lg mb-6">
                    <div className="flex items-center gap-3 mb-3">
                      <Zap size={18} className="fill-white" />
                      <span className="font-bold text-sm">AI Recommendation</span>
                    </div>
                    <p className="text-xs opacity-90 leading-relaxed">
                      "Gộp 3 đơn hàng tại khu vực Quận 1 giúp bạn tiết kiệm được 220,000 VND phí vận chuyển hôm nay."
                    </p>
                  </div>

                  {/* Mock Timeline */}
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 rounded-full bg-green-500"></div>
                      <div className="h-2 w-full bg-gray-200 rounded-full overflow-hidden">
                        <div className="h-full bg-green-500 w-3/4"></div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                      <div className="h-2 w-full bg-gray-200 rounded-full overflow-hidden">
                        <div className="h-full bg-blue-500 w-1/2"></div>
                      </div>
                    </div>
                  </div>

                  <div className="absolute inset-0 bg-gradient-to-t from-slate-50 via-transparent to-transparent"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer Component */}
      <Footer />

      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-30px); }
        }
        .animate-float {
          animation: float 6s ease-in-out infinite;
        }

        .particle {
          position: absolute;
          background: linear-gradient(to right, #2563eb, #9333ea);
          border-radius: 50%;
          filter: blur(2px);
          pointer-events: none;
          z-index: 1;
        }

        /* Scroll Reveal Utility Classes */
        .reveal-on-scroll {
          opacity: 0;
          transform: translateY(40px);
          transition: all 0.8s cubic-bezier(0.5, 0, 0, 1);
        }
        .reveal-on-scroll.is-revealed {
          opacity: 1;
          transform: translateY(0);
        }
        
        .delay-100 { transition-delay: 100ms; }
        .delay-200 { transition-delay: 200ms; }
        .delay-300 { transition-delay: 300ms; }
        .delay-400 { transition-delay: 400ms; }
      `}</style>
    </div>
  );
};

export default CustomerLandingPage;
