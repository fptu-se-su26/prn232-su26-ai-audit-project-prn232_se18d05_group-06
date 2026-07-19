import React, { useEffect, useState } from 'react';
import { Bookmark, DollarSign, HelpCircle, History, Home, LogOut, MapPin, Menu, Package, Settings, User, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface HeaderProps {
  scrollY?: number;
}

const Header: React.FC<HeaderProps> = ({ scrollY = 0 }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userData, setUserData] = useState<{ name?: string; fullName?: string; email?: string } | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const userStr = localStorage.getItem('user');
    if (!userStr) {
      setIsLoggedIn(false);
      return;
    }

    try {
      const user = JSON.parse(userStr);
      setUserData(user);
      setIsLoggedIn(true);
    } catch {
      setIsLoggedIn(false);
    }
  }, []);

  const handleNavigation = (path: string) => {
    navigate(path);
    setMobileMenuOpen(false);
    setUserDropdownOpen(false);
  };

  const handleLogout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    setIsLoggedIn(false);
    setUserData(null);
    setUserDropdownOpen(false);
    navigate('/');
  };

  const desktopItems = [
    { label: 'Trang chủ', path: '/' },
    { label: 'Dịch vụ', path: '/create-shipment' },
    { label: 'Theo dõi đơn hàng', path: '/tracking' },
    { label: 'Giới thiệu', path: '/about' },
    { label: 'Liên hệ', path: '/support' },
  ];

  const accountItems = [
    { label: 'Đơn hàng của tôi', icon: History, path: '/customer/orders' },
    { label: 'Hóa đơn của tôi', icon: DollarSign, path: '/payment-history' },
    { label: 'Voucher', icon: Bookmark, path: '/voucher-center' },
    { label: 'Hồ sơ cá nhân', icon: User, path: '/profile' },
    { label: 'Cài đặt', icon: Settings, path: '/settings' },
  ];

  const mobileItems = [
    { label: 'Trang chủ', path: '/', icon: Home },
    { label: 'Tạo đơn mới', path: '/create-shipment', icon: Package },
    { label: 'Đơn hàng của tôi', path: '/customer/orders', icon: History },
    { label: 'Báo giá', path: '/shipping-quotation', icon: DollarSign },
    { label: 'Theo dõi', path: '/tracking', icon: MapPin },
    { label: 'Hỗ trợ', path: '/support', icon: HelpCircle },
  ];

  const userName = userData?.name || userData?.fullName || 'Customer';

  return (
    <nav
      className="fixed top-0 z-50 w-full transition-all duration-500"
      style={{
        backgroundColor: scrollY > 50 ? 'rgba(255, 255, 255, 0.75)' : 'transparent',
        backdropFilter: scrollY > 50 ? 'blur(24px)' : 'none',
        borderBottom: scrollY > 50 ? '1px solid rgba(0, 74, 198, 0.1)' : 'none',
        boxShadow: scrollY > 50 ? '0 8px 32px rgba(15, 23, 42, 0.08)' : 'none',
      }}
    >
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4 lg:px-8">
        <div className="flex cursor-pointer items-center gap-3" onClick={() => handleNavigation('/')}>
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-cyan-500 shadow-lg">
            <Package size={20} className="text-white" />
          </div>
          <span className="bg-gradient-to-r from-blue-700 to-cyan-600 bg-clip-text text-lg font-black text-transparent">SmartLog AI</span>
        </div>

        <div className="hidden items-center gap-6 lg:flex">
          {desktopItems.map((item) => (
            <button key={item.path} onClick={() => handleNavigation(item.path)} className="group relative text-[13px] font-bold text-gray-600 transition-all hover:text-blue-600">
              {item.label}
              <span className="absolute -bottom-1 left-0 h-0.5 w-0 bg-blue-600 transition-all group-hover:w-full" />
            </button>
          ))}
        </div>

        <div className="flex items-center gap-4">
          {!isLoggedIn && (
            <button
              onClick={() => handleNavigation('/auth')}
              className="hidden rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 px-7 py-3 text-sm font-black tracking-wide text-white shadow-lg transition-all hover:shadow-blue-600/30 md:block"
            >
              Bắt đầu ngay
            </button>
          )}

          {isLoggedIn && (
            <div className="relative hidden md:block">
              <button
                onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-blue-600 to-cyan-500 text-white transition-all hover:shadow-lg"
              >
                <User size={18} />
              </button>

              {userDropdownOpen && (
                <div className="absolute right-0 mt-2 w-64 overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-2xl">
                  <div className="border-b border-gray-100 bg-gradient-to-r from-blue-50 to-cyan-50 p-4">
                    <p className="font-black text-gray-900">{userName}</p>
                    <p className="text-xs text-gray-500">{userData?.email || 'customer@smartlog.ai'}</p>
                  </div>
                  <div className="p-2">
                    {accountItems.map((item) => {
                      const Icon = item.icon;
                      return (
                        <button
                          key={item.path}
                          onClick={() => handleNavigation(item.path)}
                          className="flex w-full items-center gap-3 rounded-lg px-4 py-3 text-sm font-bold text-gray-700 transition-colors hover:bg-blue-50 hover:text-blue-600"
                        >
                          <Icon size={16} />
                          {item.label}
                        </button>
                      );
                    })}
                    <div className="mt-2 border-t border-gray-100 pt-2">
                      <button
                        onClick={handleLogout}
                        className="flex w-full items-center gap-3 rounded-lg px-4 py-3 text-sm font-bold text-red-600 transition-colors hover:bg-red-50"
                      >
                        <LogOut size={16} />
                        Đăng xuất
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="lg:hidden">
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {mobileMenuOpen && (
        <div className="border-t border-blue-100/50 bg-white px-6 py-4 lg:hidden">
          {mobileItems.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.path}
                onClick={() => handleNavigation(item.path)}
                className="flex w-full items-center gap-3 py-3 text-sm font-bold text-gray-700 hover:text-blue-600"
              >
                <Icon size={18} />
                {item.label}
              </button>
            );
          })}

          {!isLoggedIn ? (
            <div className="mt-4 border-t border-gray-100 pt-4">
              <button onClick={() => handleNavigation('/auth')} className="w-full rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 py-3 text-sm font-black text-white shadow-lg">
                Bắt đầu ngay
              </button>
            </div>
          ) : (
            <div className="mt-4 border-t border-gray-100 pt-4">
              <button onClick={handleLogout} className="w-full py-2 text-left text-sm font-bold text-red-600">
                Đăng xuất
              </button>
            </div>
          )}
        </div>
      )}
    </nav>
  );
};

export default Header;