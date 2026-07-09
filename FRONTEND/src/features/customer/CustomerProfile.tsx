import React, { useState, useEffect } from 'react';
import { 
  User, Mail, Phone, MapPin, Edit, Save, X, Award, History, Ticket, 
  ChevronRight, ShieldCheck, Heart, Star, Zap, Crown, ArrowRight,
  TrendingUp, Gift, CreditCard
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Header from './Header';
import Footer from './Footer';
import { getCustomerTier, getTierConfigs } from '../../lib/api/customerTier';
import { TierConfigDto } from '../../types/customerTier';

const CustomerProfile: React.FC = () => {
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);
  const [profile, setProfile] = useState({
    fullName: 'Lê Văn Tùng',
    email: 'tung.le@example.com',
    phone: '0901 234 567',
    address: '123 Đường Lê Lợi, Quận 1, TP. HCM',
    memberTier: 'Gold',
    points: 2450,
  });

  const [tierConfigs, setTierConfigs] = useState<TierConfigDto[]>([]);

  useEffect(() => {
    const userStr = localStorage.getItem('user');
    let userId = 1; // Default mock user id for testing
    if (userStr) {
      try {
        const user = JSON.parse(userStr);
        setProfile(prev => ({
          ...prev,
          fullName: user.name || prev.fullName,
          email: user.email || prev.email,
        }));
        if (user.id) userId = user.id;
      } catch (e) {
        console.error('Lỗi khi đọc thông tin user từ localStorage', e);
      }
    }

    // Fetch real tier from backend
    const fetchTierInfo = async () => {
      try {
        const configs = await getTierConfigs();
        setTierConfigs(configs.sort((a, b) => a.minRevenue - b.minRevenue));

        const tierData = await getCustomerTier(userId);
        if (tierData && tierData.tier) {
          setProfile(prev => ({
            ...prev,
            memberTier: tierData.tier as string,
          }));
        }
      } catch (e) {
        console.error('Failed to fetch tier info', e);
      }
    };
    fetchTierInfo();
  }, []);

  return (
    <div className="min-h-screen bg-[#FFF5F7] font-sans selection:bg-rose-100">
      <Header />
      
      <main className="pt-32 pb-20 px-8">
        <div className="max-w-7xl mx-auto">
          {/* Top Profile Header */}
          <div className="bg-white rounded-[3rem] p-10 shadow-sm border border-rose-100 mb-12 relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-96 h-96 bg-rose-50 rounded-full blur-3xl -mr-48 -mt-48 transition-transform group-hover:scale-110 duration-700"></div>
            
            <div className="relative z-10 flex flex-col md:flex-row items-center gap-10">
              <div className="relative">
                <div className="w-44 h-44 rounded-full ring-8 ring-rose-50 p-1.5 bg-white shadow-2xl relative">
                  <img 
                    src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?ixlib=rb-1.2.1&auto=format&fit=crop&w=300&q=80" 
                    alt="Profile" 
                    className="w-full h-full object-cover rounded-full" 
                  />
                  <div className="absolute -bottom-2 -right-2 p-4 bg-rose-500 text-white rounded-full shadow-lg border-4 border-white cursor-pointer hover:scale-110 transition-transform active:scale-90">
                    <Edit size={22} />
                  </div>
                </div>
              </div>

              <div className="flex-1 text-center md:text-left">
                <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 mb-4">
                  <h1 className="text-5xl font-extrabold text-slate-900 tracking-tight">{profile.fullName}</h1>
                  <div className="px-5 py-2 bg-gradient-to-r from-rose-500 to-pink-500 text-white rounded-full text-[10px] font-extrabold uppercase tracking-widest flex items-center gap-2 shadow-xl shadow-rose-200">
                    <Crown size={14} strokeWidth={3} />
                    {profile.memberTier} Platinum Member
                  </div>
                </div>
                <p className="text-slate-500 text-xl font-medium mb-8">
                  Mã định danh SmartLog: <span className="text-rose-600 font-extrabold">SL-USR-10293</span>
                </p>
                <div className="flex flex-wrap justify-center md:justify-start gap-4">
                  <div className="px-6 py-3 bg-slate-900 text-white rounded-2xl font-bold flex items-center gap-3 shadow-lg shadow-slate-200">
                    <Star size={20} className="text-rose-400" />
                    <span>{profile.points.toLocaleString()} Points</span>
                  </div>
                  <button 
                    onClick={() => navigate('/voucher-center')}
                    className="px-6 py-3 bg-white border border-rose-100 text-rose-600 rounded-2xl font-bold flex items-center gap-3 hover:bg-rose-50 transition-all shadow-sm"
                  >
                    <Ticket size={20} />
                    <span>12 Ưu đãi khả dụng</span>
                  </button>
                </div>
              </div>

              <div className="hidden lg:flex flex-col items-end gap-3 text-right">
                <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">Tiến độ thăng hạng VIP</p>
                <p className="text-sm font-bold text-slate-800">Cần <span className="text-rose-600 font-extrabold">550 pts</span> để lên Kim Cương</p>
                <div className="w-56 h-3 bg-slate-100 rounded-full overflow-hidden mt-1 p-0.5">
                  <div className="h-full bg-gradient-to-r from-rose-400 to-rose-600 rounded-full shadow-[0_0_10px_rgba(255,20,147,0.3)] animate-pulse" style={{ width: '75%' }}></div>
                </div>
                <button className="text-xs font-bold text-rose-500 flex items-center gap-1 hover:underline mt-2">
                  Xem đặc quyền Diamond <ArrowRight size={14} />
                </button>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-12 gap-8">
            {/* Left: General Info & CRM */}
            <div className="col-span-12 lg:col-span-8 space-y-8">
              {/* Account Form */}
              <div className="bg-white rounded-[2.5rem] p-10 md:p-12 shadow-sm border border-rose-100">
                <div className="flex items-center justify-between mb-10">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-rose-50 text-rose-500 rounded-2xl">
                      <User size={28} />
                    </div>
                    <h2 className="text-2xl font-extrabold text-slate-900">Chi tiết tài khoản</h2>
                  </div>
                  <button 
                    onClick={() => setIsEditing(!isEditing)}
                    className={`flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold text-sm transition-all ${
                      isEditing ? 'bg-slate-900 text-white' : 'bg-slate-50 text-slate-600 hover:bg-rose-50 hover:text-rose-600'
                    }`}
                  >
                    {isEditing ? <><X size={18} /> Hủy bỏ</> : <><Edit size={18} /> Chỉnh sửa</>}
                  </button>
                </div>

                <div className="grid md:grid-cols-2 gap-x-12 gap-y-8">
                  {[
                    { label: 'Họ và tên người dùng', value: profile.fullName, icon: User, key: 'fullName' },
                    { label: 'Địa chỉ Email chính', value: profile.email, icon: Mail, key: 'email' },
                    { label: 'Số điện thoại liên lạc', value: profile.phone, icon: Phone, key: 'phone' },
                    { label: 'Địa chỉ nhận hàng mặc định', value: profile.address, icon: MapPin, key: 'address' },
                  ].map((field) => (
                    <div key={field.key} className="space-y-3 group">
                      <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest ml-1">{field.label}</label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none text-rose-300 group-hover:text-rose-500 transition-colors">
                          <field.icon size={20} />
                        </div>
                        {isEditing ? (
                          <input 
                            className="w-full pl-14 pr-6 py-5 bg-slate-50 border-2 border-transparent focus:border-rose-200 focus:bg-white rounded-2xl outline-none font-bold text-slate-700 transition-all text-lg shadow-inner"
                            defaultValue={field.value}
                          />
                        ) : (
                          <div className="w-full pl-14 pr-6 py-5 bg-slate-50/50 border-2 border-transparent rounded-2xl font-bold text-slate-700 truncate text-lg">
                            {field.value}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                {isEditing && (
                  <div className="flex gap-4 mt-12">
                     <button className="flex-1 py-5 bg-rose-500 text-white rounded-[1.5rem] font-bold shadow-2xl shadow-rose-500/30 hover:scale-[1.01] active:scale-95 transition-all flex items-center justify-center gap-3 text-lg">
                        <Save size={24} />
                        Xác nhận lưu thay đổi
                     </button>
                  </div>
                )}
              </div>

              {/* Utility Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                 {[
                   { label: 'Lịch sử vận đơn', desc: '4 đơn mới', icon: History, color: 'rose' },
                   { label: 'Sổ địa chỉ AI', desc: '8 địa chỉ', icon: MapPin, color: 'pink' },
                   { label: 'Ví SmartPay', desc: '4.500.000đ', icon: CreditCard, color: 'slate' },
                 ].map((card, idx) => (
                   <button key={idx} className="bg-white p-8 rounded-[2rem] border border-rose-100 shadow-sm hover:shadow-xl transition-all text-left flex flex-col gap-6 group">
                      <div className={`p-4 bg-${card.color}-50 text-${card.color}-500 rounded-2xl w-fit group-hover:scale-110 transition-transform`}>
                        <card.icon size={28} />
                      </div>
                      <div>
                        <h4 className="font-extrabold text-slate-900">{card.label}</h4>
                        <p className="text-xs text-slate-400 font-bold uppercase mt-1">{card.desc}</p>
                      </div>
                   </button>
                 ))}
              </div>
            </div>

            {/* Right: Loyalty Sidebar */}
            <div className="col-span-12 lg:col-span-4 space-y-8">
              <div className="bg-slate-900 rounded-[3rem] p-10 text-white shadow-2xl relative overflow-hidden flex flex-col h-full">
                 <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-rose-500/20 to-transparent pointer-events-none"></div>
                 
                 <div className="flex items-center gap-4 mb-10">
                    <div className="w-14 h-14 bg-rose-500/10 rounded-2xl flex items-center justify-center text-rose-400 border border-white/5">
                      <Gift size={32} />
                    </div>
                    <div>
                      <h3 className="text-2xl font-extrabold">Đặc quyền VIP</h3>
                      <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">Hạng Platinum</p>
                    </div>
                 </div>

                 <div className="space-y-8 flex-1">
                   {[
                     { label: 'Ưu tiên lấy hàng', desc: 'Shipper có mặt sau 30p yêu cầu.', icon: Zap, highlight: '⚡ Nhanh nhất' },
                     { label: 'Bảo hiểm tối đa', icon: ShieldCheck, desc: 'Bồi thường 110% giá trị hóa đơn.', highlight: '🛡️ An tâm' },
                     { label: 'Phòng chờ SmartLog', icon: Heart, desc: 'Sử dụng lounge tại các HUB trung chuyển.', highlight: '✨ Miễn phí' },
                     { label: 'Số liệu thời gian thực', icon: TrendingUp, desc: 'Truy cập báo cáo AI dashboard chi tiết.', highlight: '📊 Thông minh' },
                   ].map((perk, idx) => (
                     <div key={idx} className="flex gap-4 group">
                        <div className="p-3 bg-white/5 rounded-xl text-rose-400 flex-shrink-0 border border-white/5 transition-colors group-hover:bg-rose-500 group-hover:text-white">
                          <perk.icon size={22} />
                        </div>
                        <div>
                          <p className="font-extrabold text-sm mb-1">{perk.label}</p>
                          <p className="text-xs text-slate-400 leading-relaxed font-medium mb-1.5">{perk.desc}</p>
                          <span className="text-[10px] font-extrabold text-rose-400 uppercase tracking-tighter">{perk.highlight}</span>
                        </div>
                     </div>
                   ))}
                 </div>

                 <button className="w-full mt-12 py-5 bg-white/5 text-white border border-white/10 rounded-full font-bold hover:bg-white/10 transition-all flex items-center justify-center gap-3 text-sm group">
                    <span>Tìm hiểu lộ trình thăng hạng</span>
                    <ArrowRight size={18} className="transition-transform group-hover:translate-x-1" />
                 </button>
              </div>

              {/* Quick Voucher Badge */}
              <div className="bg-gradient-to-br from-rose-500 to-pink-600 rounded-[2.5rem] p-8 text-white shadow-xl shadow-rose-200 flex items-center justify-between group cursor-pointer">
                 <div>
                    <p className="text-xs font-bold uppercase tracking-widest opacity-80 mb-1">Voucher mới nhận</p>
                    <h4 className="text-xl font-extrabold">FREESHIP TOÀN QUỐC</h4>
                 </div>
                 <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center shadow-inner group-hover:scale-110 transition-transform">
                   <Ticket size={32} strokeWidth={2.5} />
                 </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />

      <style>{`
        .bg-rose-500 { background-color: #FF1493; }
        .text-rose-500 { color: #FF1493; }
        .text-rose-400 { color: #FF69B4; }
        .text-rose-600 { color: #C71585; }
        .bg-rose-50 { background-color: #FFF0F5; }
        .bg-pink-50 { background-color: #FFF5F7; }
        .text-pink-500 { color: #FF69B4; }
        .border-rose-100 { border-color: #FFB6C1; }
        .border-rose-200 { border-color: #FF69B4; }
      `}</style>
    </div>
  );
};

export default CustomerProfile;
