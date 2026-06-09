import React from 'react';
import {
  Facebook,
  Twitter,
  Linkedin,
  Github,
  Mail,
  Phone,
  MapPin,
  ChevronRight,
} from 'lucide-react';

const Footer: React.FC = () => {
  return (
    <footer className="bg-slate-950 border-t border-white/5 pt-12 pb-8 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-100/20 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-20 -left-20 w-96 h-96 bg-cyan-100/10 rounded-full blur-3xl"></div>
      </div>
      <div className="max-w-7xl mx-auto px-8 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-12 lg:gap-8 mb-16">
          {/* Brand - Điểm nhấn chính */}
          <div className="lg:col-span-4">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-600 to-cyan-500 flex items-center justify-center shadow-lg"><svg xmlns="http://www.w3.org/2000/svg" width="25" height="25" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" className="text-white"><path d="m7.5 4.27 9 5.15"></path><path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z"></path><path d="m3.3 7 8.7 5 8.7-5"></path><path d="M12 22V12"></path></svg></div>
              <span className="font-extrabold text-2xl text-white tracking-tight">
                SmartLog{' '}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-300">
                  AI
                </span>
              </span>
            </div>
            <p className="text-slate-400 leading-relaxed mb-8 max-w-sm font-medium">
              Global Logistics Command Center. Giải pháp quản lý hệ thống logistics tối ưu, tự động
              hóa và thông minh cho doanh nghiệp toàn cầu.
            </p>
            {/* Social Icons */}
            <div className="flex items-center gap-4">
              {[Facebook, Twitter, Linkedin, Github].map((Icon, idx) => (
                <a
                  key={idx}
                  href="#"
                  className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-slate-400 hover:bg-blue-600 hover:text-white hover:border-blue-500 transition-all shadow-sm hover:-translate-y-1 hover:shadow-md"
                >
                  <Icon size={18} />
                </a>
              ))}
            </div>
          </div>

          {/* Company Info */}
          <div className="lg:col-span-2 lg:col-start-6">
            <h3 className="font-bold text-white mb-6 uppercase tracking-widest text-xs">
              Về SmartLog
            </h3>
            <ul className="space-y-4">
              {['Về chúng tôi', 'Blog & Tin tức', 'Cơ hội việc làm', 'Khách hàng'].map(
                (item, idx) => (
                  <li key={idx}>
                    <a
                      href="#"
                      className="group flex items-center text-slate-400 hover:text-blue-400 transition-all duration-300 p-2 rounded-lg hover:bg-white/5"
                    >
                      <ChevronRight
                        size={14}
                        className="opacity-0 -ml-4 group-hover:opacity-100 group-hover:ml-0 transition-all duration-300 mr-2 text-blue-400"
                      />
                      <span className="font-medium group-hover:font-bold">{item}</span>
                    </a>
                  </li>
                ),
              )}
            </ul>
          </div>

          {/* Support */}
          <div className="lg:col-span-2">
            <h3 className="font-bold text-white mb-6 uppercase tracking-widest text-xs">
              Hỗ trợ
            </h3>
            <ul className="space-y-4">
              {['Tài liệu API', 'Trung tâm trợ giúp', 'Cộng đồng', 'Tình trạng hệ thống'].map(
                (item, idx) => (
                  <li key={idx}>
                    <a
                      href="#"
                      className="group flex items-center text-slate-400 hover:text-blue-400 transition-all duration-300 p-2 rounded-lg hover:bg-white/5"
                    >
                      <ChevronRight
                        size={14}
                        className="opacity-0 -ml-4 group-hover:opacity-100 group-hover:ml-0 transition-all duration-300 mr-2 text-blue-400"
                      />
                      <span className="font-medium group-hover:font-bold">{item}</span>
                    </a>
                  </li>
                ),
              )}
            </ul>
          </div>

          {/* Contact */}
          <div className="lg:col-span-3">
            <h3 className="font-bold text-white mb-6 uppercase tracking-widest text-xs">
              Liên hệ
            </h3>
            <ul className="space-y-4">
              <li>
                <a
                  href="#"
                  className="flex items-start gap-4 text-slate-400 hover:text-blue-400 transition-colors group"
                >
                  <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center flex-shrink-0 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                    <MapPin size={16} className="text-blue-500 group-hover:text-white" />
                  </div>
                  <span className="font-medium text-sm leading-relaxed mt-1">
                    Khu Công Nghệ Cao, Q9, TP. Hồ Chí Minh, Việt Nam
                  </span>
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="flex items-center gap-4 text-slate-400 hover:text-blue-400 transition-colors group"
                >
                  <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center flex-shrink-0 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                    <Phone size={16} className="text-blue-500 group-hover:text-white" />
                  </div>
                  <span className="font-medium">1900 1234 5678</span>
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="flex items-center gap-4 text-slate-400 hover:text-blue-400 transition-colors group"
                >
                  <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center flex-shrink-0 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                    <Mail size={16} className="text-blue-500 group-hover:text-white" />
                  </div>
                  <span className="font-medium">contact@smartlog.ai</span>
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom / Copyright & Legal */}
        <div className="border-t border-white/5 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-xs text-slate-500 font-semibold tracking-wide">
            © {new Date().getFullYear()} SmartLog AI. Tất cả quyền được bảo lưu.
          </p>
          <div className="flex gap-8 text-xs font-semibold text-slate-500">
            <a href="#" className="hover:text-blue-400 transition-colors hover:underline">
              Điều khoản dịch vụ
            </a>
            <a href="#" className="hover:text-blue-400 transition-colors hover:underline">
              Bảo mật
            </a>
            <a href="#" className="hover:text-blue-400 transition-colors hover:underline">
              Cookie Policy
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
