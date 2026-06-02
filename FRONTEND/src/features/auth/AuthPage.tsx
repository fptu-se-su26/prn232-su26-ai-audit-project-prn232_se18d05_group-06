import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, LogIn, ArrowRight, UserPlus, Network } from 'lucide-react';

const bgImage = "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?ixlib=rb-1.2.1&auto=format&fit=crop&w=1500&q=80";

export default function AuthPage() {
  const location = useLocation();
  const navigate = useNavigate();

  const [isLogin, setIsLogin] = useState(() => {
    const searchParams = new URLSearchParams(location.search);
    if (searchParams.get('tab') === 'register' || location.pathname === '/register') return false;
    return true;
  });

  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    if (searchParams.get('tab') === 'register' || location.pathname === '/register') {
      setIsLogin(false);
    } else if (searchParams.get('tab') === 'login' || location.pathname === '/login' || location.pathname === '/auth') {
      setIsLogin(true);
    }
  }, [location.pathname, location.search]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    localStorage.setItem('user', JSON.stringify({ name: 'User', email: 'user@example.com' }));
    navigate('/');
  };
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  return (
    <main className="flex min-h-screen flex-col md:flex-row font-sans">
      {/* Left Section: Visual Branding */}
      <section className="hidden md:flex md:w-1/2 lg:w-3/5 bg-[#151A2B] relative items-center justify-center p-8 md:p-12 overflow-hidden">
        <div className="absolute inset-0 opacity-40">
          <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-blue-600/20 via-transparent to-transparent"></div>
        </div>
        <div className="relative z-10 w-full max-w-xl lg:max-w-2xl flex flex-col items-start gap-8">
          <div className="mb-6 xl:mb-10">
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4 tracking-tight">
              SmartLog AI
            </h1>
            <p className="text-lg text-white/70 max-w-md leading-relaxed">
              Giải pháp quản lý logistics thông minh dựa trên AI, tối ưu hóa mọi hành trình vận tải
              toàn cầu.
            </p>
          </div>
          {/* Visual Card */}
          <div className="relative w-full rounded-2xl overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.5)] border border-white/5 group">
            <img
              alt="Logistics AI Visual"
              className="w-full h-auto object-cover transform group-hover:scale-105 transition-transform duration-700"
              src={bgImage}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#151A2B]/90 via-[#151A2B]/20 to-transparent flex flex-col justify-end p-6 md:p-8">
              <div className="flex items-center gap-3">
                <Network className="text-[#B4C5FF] w-6 h-6" />
                <span className="text-sm font-semibold text-white uppercase tracking-widest">
                  Hệ thống thời gian thực
                </span>
              </div>
            </div>
          </div>
        </div>
        {/* Atmospheric glow nodes */}
        <div className="absolute top-1/4 right-1/4 w-64 h-64 bg-blue-500/10 blur-[120px] rounded-full pointer-events-none"></div>
        <div className="absolute bottom-1/4 left-1/4 w-80 h-80 bg-indigo-500/10 blur-[120px] rounded-full pointer-events-none"></div>
      </section>

      {/* Right Section: Auth Forms */}
      <section className="flex-1 flex items-center justify-center p-6 md:p-12 bg-slate-50 relative overflow-y-auto">
        <div className="w-full max-w-md flex flex-col h-full justify-center py-10">
          {/* Logo for mobile */}
          <div className="md:hidden mb-8 text-center">
            <h2 className="text-3xl font-bold text-blue-600 tracking-tight">SmartLog AI</h2>
          </div>

          {/* Auth Card */}
          <div className="bg-white rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 relative overflow-hidden transition-all duration-500 flex-shrink-0">
            <div className="p-8 sm:p-10 pb-0">
              {/* Form Header */}
              <div className="flex items-start justify-between mb-8">
                <div>
                  <h2 className="text-2xl font-bold text-slate-900 mb-2">
                    {isLogin ? 'Chào mừng trở lại' : 'Tạo tài khoản mới'}
                  </h2>
                  <p className="text-slate-500 text-sm">
                    {isLogin
                      ? 'Vui lòng đăng nhập để tiếp tục.'
                      : 'Bắt đầu hành trình logistics của bạn.'}
                  </p>
                </div>
                <div className="hidden sm:flex items-center justify-center w-12 h-12 text-[#B4C5FF]">
                  {isLogin ? (
                    <LogIn className="w-8 h-8" strokeWidth={2.5} />
                  ) : (
                    <UserPlus className="w-8 h-8" strokeWidth={2.5} />
                  )}
                </div>
              </div>

              {/* Login Form */}
              {isLogin ? (
                <form className="space-y-5" onSubmit={handleSubmit}>
                  <div className="space-y-4">
                    <div className="relative">
                      <input
                        type="email"
                        id="login-email"
                        className="peer w-full h-[52px] bg-[#F2F4F6] rounded-lg px-4 pt-5 pb-1 text-sm border-2 border-transparent focus:bg-white focus:border-blue-600 outline-none transition-all placeholder-transparent text-slate-900"
                        placeholder="Email"
                        required
                      />
                      <label
                        htmlFor="login-email"
                        className="absolute left-4 top-2 text-[11px] text-slate-500 font-medium transition-all peer-placeholder-shown:top-[16px] peer-placeholder-shown:text-sm peer-focus:top-2 peer-focus:text-[11px] peer-focus:text-blue-600 cursor-text"
                      >
                        Email
                      </label>
                    </div>
                    <div className="relative">
                      <input
                        type={showPassword ? 'text' : 'password'}
                        id="login-password"
                        className="peer w-full h-[52px] bg-[#F2F4F6] rounded-lg px-4 pt-5 pb-1 text-sm border-2 border-transparent focus:bg-white focus:border-blue-600 outline-none transition-all placeholder-transparent text-slate-900"
                        placeholder="Mật khẩu"
                        required
                      />
                      <label
                        htmlFor="login-password"
                        className="absolute left-4 top-2 text-[11px] text-slate-500 font-medium transition-all peer-placeholder-shown:top-[16px] peer-placeholder-shown:text-sm peer-focus:top-2 peer-focus:text-[11px] peer-focus:text-blue-600 cursor-text"
                      >
                        Mật khẩu
                      </label>
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-600 hover:text-slate-900 transition-colors"
                      >
                        {showPassword ? (
                          <EyeOff className="w-4 h-4" />
                        ) : (
                          <Eye className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-1">
                    <label className="flex items-center gap-2 cursor-pointer group">
                      <input
                        type="checkbox"
                        className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-600/20 transition-all cursor-pointer"
                      />
                      <span className="text-sm text-slate-600 group-hover:text-slate-900 transition-colors">
                        Ghi nhớ đăng nhập
                      </span>
                    </label>
                    <a
                      href="#"
                      className="text-sm text-[#0050C8] hover:text-blue-800 font-semibold hover:underline"
                    >
                      Quên mật khẩu?
                    </a>
                  </div>

                  <button
                    type="submit"
                    className="w-full h-[52px] bg-[#0050C8] text-white rounded-full font-semibold hover:bg-blue-800 shadow-[0_4px_14px_0_rgba(0,80,200,0.39)] transition-all flex items-center justify-center gap-2 group mt-2"
                  >
                    Đăng nhập
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </button>

                  <div className="relative py-3 flex items-center justify-center">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-slate-200/60"></div>
                    </div>
                    <span className="relative bg-white px-4 text-xs text-slate-500">
                      Hoặc tiếp tục với
                    </span>
                  </div>

                  <button
                    type="button"
                    className="w-full h-[52px] bg-white border border-slate-200 rounded-full font-semibold text-slate-700 hover:bg-slate-50 transition-all flex items-center justify-center gap-3 mb-8"
                  >
                    <svg className="w-5 h-5" viewBox="0 0 24 24">
                      <path
                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                        fill="#4285F4"
                      ></path>
                      <path
                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                        fill="#34A853"
                      ></path>
                      <path
                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"
                        fill="#FBBC05"
                      ></path>
                      <path
                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                        fill="#EA4335"
                      ></path>
                    </svg>
                    Google
                  </button>
                </form>
              ) : (
                <form className="space-y-4 pb-8" onSubmit={handleSubmit}>
                  <div className="space-y-4">
                    <div className="relative">
                      <input
                        type="text"
                        id="reg-name"
                        className="peer w-full h-[52px] bg-[#F2F4F6] rounded-lg px-4 pt-5 pb-1 text-sm border-2 border-transparent focus:bg-white focus:border-blue-600 outline-none transition-all placeholder-transparent text-slate-900"
                        placeholder="Họ và tên"
                        required
                      />
                      <label
                        htmlFor="reg-name"
                        className="absolute left-4 top-2 text-[11px] text-slate-500 font-medium transition-all peer-placeholder-shown:top-[16px] peer-placeholder-shown:text-sm peer-focus:top-2 peer-focus:text-[11px] peer-focus:text-blue-600 cursor-text"
                      >
                        Họ và tên
                      </label>
                    </div>
                    <div className="relative">
                      <input
                        type="email"
                        id="reg-email"
                        className="peer w-full h-[52px] bg-[#F2F4F6] rounded-lg px-4 pt-5 pb-1 text-sm border-2 border-transparent focus:bg-white focus:border-blue-600 outline-none transition-all placeholder-transparent text-slate-900"
                        placeholder="Email"
                        required
                      />
                      <label
                        htmlFor="reg-email"
                        className="absolute left-4 top-2 text-[11px] text-slate-500 font-medium transition-all peer-placeholder-shown:top-[16px] peer-placeholder-shown:text-sm peer-focus:top-2 peer-focus:text-[11px] peer-focus:text-blue-600 cursor-text"
                      >
                        Email
                      </label>
                    </div>
                    <div className="relative">
                      <input
                        type="tel"
                        id="reg-phone"
                        className="peer w-full h-[52px] bg-[#F2F4F6] rounded-lg px-4 pt-5 pb-1 text-sm border-2 border-transparent focus:bg-white focus:border-blue-600 outline-none transition-all placeholder-transparent text-slate-900"
                        placeholder="Số điện thoại"
                        required
                      />
                      <label
                        htmlFor="reg-phone"
                        className="absolute left-4 top-2 text-[11px] text-slate-500 font-medium transition-all peer-placeholder-shown:top-[16px] peer-placeholder-shown:text-sm peer-focus:top-2 peer-focus:text-[11px] peer-focus:text-blue-600 cursor-text"
                      >
                        Số điện thoại
                      </label>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="relative">
                        <input
                          type={showPassword ? 'text' : 'password'}
                          id="reg-pass"
                          className="peer w-full h-[52px] bg-[#F2F4F6] rounded-lg px-4 pt-5 pb-1 text-sm border-2 border-transparent focus:bg-white focus:border-blue-600 outline-none transition-all placeholder-transparent text-slate-900"
                          placeholder="Mật khẩu"
                          required
                        />
                        <label
                          htmlFor="reg-pass"
                          className="absolute left-4 top-2 text-[11px] text-slate-500 font-medium transition-all peer-placeholder-shown:top-[16px] peer-placeholder-shown:text-sm peer-focus:top-2 peer-focus:text-[11px] peer-focus:text-blue-600 cursor-text"
                        >
                          Mật khẩu
                        </label>
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-600 hover:text-slate-900 transition-colors"
                        >
                          {showPassword ? (
                            <EyeOff className="w-4 h-4" />
                          ) : (
                            <Eye className="w-4 h-4" />
                          )}
                        </button>
                      </div>
                      <div className="relative">
                        <input
                          type={showConfirmPassword ? 'text' : 'password'}
                          id="reg-confirm"
                          className="peer w-full h-[52px] bg-[#F2F4F6] rounded-lg px-4 pt-5 pb-1 text-sm border-2 border-transparent focus:bg-white focus:border-blue-600 outline-none transition-all placeholder-transparent text-slate-900"
                          placeholder="Xác nhận"
                          required
                        />
                        <label
                          htmlFor="reg-confirm"
                          className="absolute left-4 top-2 text-[11px] text-slate-500 font-medium transition-all peer-placeholder-shown:top-[16px] peer-placeholder-shown:text-sm peer-focus:top-2 peer-focus:text-[11px] peer-focus:text-blue-600 cursor-text"
                        >
                          Xác nhận
                        </label>
                        <button
                          type="button"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-600 hover:text-slate-900 transition-colors"
                        >
                          {showConfirmPassword ? (
                            <EyeOff className="w-4 h-4" />
                          ) : (
                            <Eye className="w-4 h-4" />
                          )}
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 py-1 mt-2">
                    <input
                      type="checkbox"
                      id="terms"
                      className="mt-[3px] w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-600/20 cursor-pointer transition-all"
                      required
                    />
                    <label htmlFor="terms" className="text-sm text-slate-600 leading-tight">
                      Tôi đồng ý với{' '}
                      <a href="#" className="text-[#0050C8] font-semibold hover:underline">
                        Điều khoản dịch vụ
                      </a>{' '}
                      và{' '}
                      <a href="#" className="text-[#0050C8] font-semibold hover:underline">
                        Chính sách bảo mật
                      </a>
                      .
                    </label>
                  </div>

                  <button
                    type="submit"
                    className="w-full h-[52px] bg-[#0050C8] text-white rounded-full font-semibold hover:bg-blue-800 shadow-[0_4px_14px_0_rgba(0,80,200,0.39)] transition-all flex items-center justify-center gap-2 group mt-4"
                  >
                    Đăng ký ngay
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </button>
                </form>
              )}
            </div>

            {/* Switch Link Container (Footer of Card) */}
            <div className="text-center py-5 border-t border-slate-100 bg-white">
              <p className="text-sm text-slate-600">
                {isLogin ? 'Chưa có tài khoản?' : 'Đã có tài khoản?'}
                <button
                  onClick={() => setIsLogin(!isLogin)}
                  className="text-[#0050C8] font-bold hover:underline ml-1.5 focus:outline-none"
                >
                  {isLogin ? 'Đăng ký' : 'Đăng nhập'}
                </button>
              </p>
            </div>
          </div>

          {/* Bottom Support Info */}
          <div className="mt-8 flex justify-center gap-8 text-slate-500 text-sm">
            <a href="#" className="hover:text-blue-600 font-medium transition-colors">
              Trung tâm hỗ trợ
            </a>
            <a href="#" className="hover:text-blue-600 font-medium transition-colors">
              Bản ngữ: Việt Nam
            </a>
          </div>
        </div>
      </section>
    </main>
  );
}
