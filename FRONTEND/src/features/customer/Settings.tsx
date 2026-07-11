import React, { useState } from 'react';
import { 
  Bell, Lock, Globe, LogOut, Trash2, Save, MapPin, 
  ChevronRight, Shield, ShieldCheck, Smartphone, 
  Cpu, MousePointer2, Settings as SettingsIcon,
  X, Check, AlertCircle, Plus, Edit
} from 'lucide-react';
import Header from './Header';
import Footer from './Footer';

const Settings: React.FC = () => {
  const [settings, setSettings] = useState({
    emailNotifications: true,
    smsNotifications: false,
    pushNotifications: true,
    marketingEmails: false,
    darkMode: false,
    language: 'vi',
    aiAddressOptimization: true,
  });

  const [savedAddresses] = useState([
    { id: 1, label: 'Nhà riêng', addr: '123 Nguyễn Huệ, Quận 1, TP. HCM', aiVerified: true },
    { id: 2, label: 'Văn phòng', addr: 'Tòa nhà Bitexco, Bến Nghé, Quận 1', aiVerified: true },
  ]);

  return (
    <div className="min-h-screen bg-white font-sans light-surface selection:bg-slate-200">
      <Header />
      
      <main className="pt-32 pb-20 px-8">
        <div className="max-w-6xl mx-auto">
          {/* Page Header */}
          <div className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-slate-200 pb-12">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-slate-200 text-slate-600 rounded-full text-[10px] font-extrabold uppercase tracking-widest mb-4">
                <SettingsIcon size={12} />
                Cấu hình hệ thống
              </div>
              <h1 className="text-5xl font-extrabold text-slate-900 tracking-tight">Cài đặt & Bảo mật</h1>
              <p className="text-slate-500 font-medium mt-3 text-lg italic">"Tối ưu hóa trải nghiệm vận chuyển cá nhân của bạn với AI."</p>
            </div>
          </div>

          <div className="grid grid-cols-12 gap-10">
            {/* Left Nav (Simulated tabs) */}
            <div className="col-span-12 lg:col-span-3 space-y-3">
              {[
                { label: 'Thông báo', icon: Bell, active: true },
                { label: 'Bảo mật', icon: Lock, active: false },
                { label: 'Địa chỉ AI', icon: Cpu, active: false },
                { label: 'Ngôn ngữ', icon: Globe, active: false },
              ].map((item, idx) => (
                <button 
                  key={idx}
                  className={`w-full flex items-center gap-4 px-6 py-4 rounded-2xl font-bold transition-all ${
                    item.active ? 'bg-slate-900 text-white shadow-xl translate-x-1' : 'text-slate-500 hover:bg-slate-200/50'
                  }`}
                >
                  <item.icon size={20} />
                  <span>{item.label}</span>
                </button>
              ))}
              <div className="pt-8 mt-8 border-t border-slate-200">
                <button className="w-full flex items-center gap-4 px-6 py-4 rounded-2xl font-bold text-red-500 hover:bg-red-50 transition-all">
                  <LogOut size={20} />
                  <span>Đăng xuất</span>
                </button>
              </div>
            </div>

            {/* Right Content Area */}
            <div className="col-span-12 lg:col-span-9 space-y-10">
              {/* Notification Management */}
              <section className="bg-white rounded-[3rem] p-10 shadow-sm border border-slate-100">
                <h3 className="text-2xl font-extrabold text-slate-900 mb-8 flex items-center gap-4">
                  <div className="p-3 bg-slate-100 rounded-2xl text-slate-600">
                    <Bell size={28} />
                  </div>
                  Kênh nhận thông báo
                </h3>
                <div className="space-y-4">
                  {[
                    { key: 'pushNotifications', label: 'Web Push Real-time', desc: 'Nhận thông báo trạng thái đơn ngay tức thì trên trình duyệt.', icon: Globe },
                    { key: 'smsNotifications', label: 'Xác thực qua SMS', desc: 'Mã OTP và các cài đặt bảo mật quan trọng.', icon: Smartphone },
                    { key: 'emailNotifications', label: 'Báo cáo chi tiết qua Email', desc: 'Hóa đơn và lịch sử hành trình chi tiết hàng tuần.', icon: Check },
                  ].map((notif) => (
                    <label key={notif.key} className="flex items-center justify-between p-6 border-2 border-slate-50 rounded-[2rem] hover:border-slate-200 cursor-pointer transition-all group">
                      <div className="flex items-center gap-5">
                         <div className="w-12 h-12 rounded-2xl bg-slate-50 text-slate-400 flex items-center justify-center group-hover:bg-slate-900 group-hover:text-white transition-all">
                            <notif.icon size={24} />
                         </div>
                         <div>
                           <p className="font-extrabold text-slate-900">{notif.label}</p>
                           <p className="text-xs text-slate-400 font-medium uppercase mt-0.5">{notif.desc}</p>
                         </div>
                      </div>
                      <div className="relative inline-flex items-center cursor-pointer">
                        <input 
                          type="checkbox" 
                          className="sr-only peer"
                          checked={settings[notif.key as keyof typeof settings] as boolean} 
                          onChange={(e) => setSettings({ ...settings, [notif.key]: e.target.checked })} 
                        />
                        <div className="w-14 h-7 bg-slate-100 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[4px] after:left-[4px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-slate-900"></div>
                      </div>
                    </label>
                  ))}
                </div>
              </section>

              {/* AI Address Management */}
              <section className="bg-white rounded-[3rem] p-10 shadow-sm border border-slate-100">
                 <div className="flex justify-between items-center mb-8">
                    <h3 className="text-2xl font-extrabold text-slate-900 flex items-center gap-4">
                      <div className="p-3 bg-slate-100 rounded-2xl text-slate-600">
                        <Cpu size={28} />
                      </div>
                      Sổ địa chỉ AI SmartSense
                    </h3>
                    <button className="p-3 bg-slate-900 text-white rounded-xl hover:scale-110 active:scale-95 transition-transform shadow-lg">
                      <Plus size={20} />
                    </button>
                 </div>
                 
                 <div className="grid md:grid-cols-2 gap-6">
                    {savedAddresses.map((addr) => (
                      <div key={addr.id} className="p-8 bg-slate-50 border border-slate-100 rounded-[2rem] relative group hover:bg-white hover:shadow-xl hover:border-slate-200 transition-all cursor-pointer">
                         <div className="flex justify-between items-start mb-4">
                            <div className="p-3 bg-white rounded-xl text-slate-400 group-hover:text-slate-900 transition-colors">
                              <MapPin size={24} />
                            </div>
                            {addr.aiVerified && (
                              <div className="px-3 py-1 bg-green-50 text-green-600 text-[10px] font-extrabold uppercase rounded-full border border-green-100 flex items-center gap-1">
                                <ShieldCheck size={12} /> AI Verified
                              </div>
                            )}
                         </div>
                         <h4 className="font-extrabold text-slate-900 mb-1">{addr.label}</h4>
                         <p className="text-sm text-slate-500 leading-relaxed font-medium">{addr.addr}</p>
                         
                         <div className="absolute top-8 right-8 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button className="p-2 text-slate-400 hover:text-slate-900"><Edit size={16} /></button>
                            <button className="p-2 text-slate-400 hover:text-red-500"><Trash2 size={16} /></button>
                         </div>
                      </div>
                    ))}
                 </div>

                 <div className="mt-8 p-6 bg-slate-900 rounded-[2rem] text-white flex items-center justify-between">
                    <div className="flex items-center gap-4">
                       <div className="p-2 bg-white/10 rounded-xl text-white">
                         <MousePointer2 size={24} />
                       </div>
                       <div>
                         <p className="font-bold">Tự động gợi ý địa chỉ AI</p>
                         <p className="text-xs text-slate-400 font-medium italic">Tiết kiệm 80% thời gian nhập liệu khi tạo đơn mới.</p>
                       </div>
                    </div>
                    <div className="relative inline-flex items-center cursor-pointer">
                        <input 
                          type="checkbox" 
                          className="sr-only peer"
                          checked={settings.aiAddressOptimization}
                          onChange={(e) => setSettings({ ...settings, aiAddressOptimization: e.target.checked })} 
                        />
                        <div className="w-12 h-6 bg-white/10 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-white/40"></div>
                      </div>
                 </div>
              </section>

              {/* Security Actions */}
              <section className="bg-white rounded-[3rem] p-10 shadow-sm border border-slate-100">
                <h3 className="text-2xl font-extrabold text-slate-900 mb-8 flex items-center gap-4">
                  <div className="p-3 bg-slate-100 rounded-2xl text-slate-600">
                    <Shield size={28} />
                  </div>
                  Bảo mật & Quyền lợi
                </h3>
                <div className="grid md:grid-cols-2 gap-6">
                   <button className="w-full p-8 border-2 border-slate-50 rounded-[2.5rem] hover:border-slate-900 hover:bg-slate-900 hover:text-white transition-all text-left flex items-center justify-between group">
                      <div>
                        <p className="font-extrabold text-xl mb-1">Đổi mật khẩu</p>
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest group-hover:text-slate-300">Cập nhật định kỳ 3 tháng</p>
                      </div>
                      <div className="p-3 bg-slate-50 text-slate-400 rounded-2xl group-hover:bg-white/10 group-hover:text-white">
                        <Lock size={20} />
                      </div>
                   </button>
                   <button className="w-full p-8 border-2 border-slate-50 rounded-[2.5rem] hover:border-slate-900 hover:bg-slate-900 hover:text-white transition-all text-left flex items-center justify-between group">
                      <div>
                        <p className="font-extrabold text-xl mb-1">Mã Pin thanh toán</p>
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest group-hover:text-slate-300">Xác thực cho đơn hỏa tốc</p>
                      </div>
                      <div className="p-3 bg-slate-50 text-slate-400 rounded-2xl group-hover:bg-white/10 group-hover:text-white">
                        <ShieldCheck size={20} />
                      </div>
                   </button>
                </div>
              </section>

              {/* Action Buttons */}
              <div className="flex gap-4 pt-10">
                <button className="flex-1 py-6 bg-slate-200 text-slate-600 rounded-[2rem] font-extrabold hover:bg-slate-300 transition-all scale-100 active:scale-95">
                  Đặt lại mặc định
                </button>
                <button className="flex-[2] py-6 bg-slate-900 text-white rounded-[2rem] font-extrabold text-lg shadow-2xl shadow-slate-300 hover:scale-[1.01] transition-all flex items-center justify-center gap-3 active:scale-95">
                  <Save size={24} />
                  Lưu tất cả thay đổi
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Settings;
