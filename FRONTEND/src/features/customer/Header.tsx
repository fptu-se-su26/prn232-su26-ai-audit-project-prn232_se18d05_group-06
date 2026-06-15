import React, { useState, useEffect } from 'react';
import { Menu, X, Bell, User, LogOut, Home, Package, MapPin, HelpCircle, DollarSign, Bookmark, Settings, History, LogIn, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface HeaderProps {
  scrollY?: number;
}

const Header: React.FC<HeaderProps> = ({ scrollY = 0 }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [notificationOpen, setNotificationOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userData, setUserData] = useState<{name: string, email: string} | null>(null);
  const navigate = useNavigate();

  // Lấy data từ localStorage
  useEffect(() => {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      try {
        const user = JSON.parse(userStr);
        setUserData(user);
        setIsLoggedIn(true);
      } catch (e) {
        setIsLoggedIn(false);
      }
    } else {
      setIsLoggedIn(false);
    }
  }, []);

  const handleNavigation = (path: string) => {
    navigate(path);
    setMobileMenuOpen(false);
  };

  const handleLogout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    setIsLoggedIn(false);
    setUserData(null);
    setUserDropdownOpen(false);
    navigate('/');
  };

  return (
    <nav
      className="fixed top-0 w-full z-50 transition-all duration-500"
      style={{
        backgroundColor: scrollY > 50 ? 'rgba(255, 255, 255, 0.75)' : 'transparent',
        backdropFilter: scrollY > 50 ? 'blur(24px)' : 'none',
        borderBottom: scrollY > 50 ? '1px solid rgba(0, 74, 198, 0.1)' : 'none',
        boxShadow: scrollY > 50 ? '0 8px 32px rgba(15, 23, 42, 0.08)' : 'none',
      }}
    >
      <div className="max-w-7xl mx-auto px-8 py-4 flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center gap-3 cursor-pointer" onClick={() => handleNavigation('/')}>
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-600 to-cyan-500 flex items-center justify-center shadow-lg">
            <Package size={20} className="text-white" />
          </div>
          <span className="font-bold text-lg text-transparent bg-clip-text bg-gradient-to-r from-blue-700 to-cyan-600">SmartLog AI</span>
        </div>

        {/* Desktop Menu */}
        <div className="hidden lg:flex items-center gap-6">
          {[
            { label: 'Trang chủ', path: '/' },
            { label: 'Dịch vụ', path: '/create-shipment' },
            { label: 'Giá cước', path: '/shipping-quotation' },
            { label: 'Theo dõi đơn hàng', path: '/tracking' },
            { label: 'Đặt lịch xe', path: '/slot-booking' },
            { label: 'Giới thiệu', path: '/about' },
            { label: 'Liên hệ', path: '/support' }
          ].map((item) => (
            <button key={item.path} onClick={() => handleNavigation(item.path)} className="text-gray-600 hover:text-blue-600 text-[13px] font-bold transition-all relative group">
              {item.label}
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-blue-600 transition-all group-hover:w-full"></span>
            </button>
          ))}
        </div>

        {/* Right Side - Auth & User */}
        <div className="flex items-center gap-6">
          {/* Auth Button (Not Logged In) */}
          {!isLoggedIn && (
            <div className="hidden md:flex items-center gap-4">
              <button
                onClick={() => handleNavigation('/auth')}
                className="bg-gradient-to-r from-blue-600 to-cyan-500 text-white px-8 py-3 rounded-xl hover:shadow-lg hover:shadow-blue-600/30 transition-all font-bold text-sm tracking-wide"
              >
                Bắt đầu ngay
              </button>
            </div>
          )}

          {/* User Dropdown (Logged In) */}
          {isLoggedIn && (
            <div className="relative hidden md:block">
              <button
                onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-600 to-cyan-500 flex items-center justify-center text-white hover:shadow-lg transition-all"
              >
                <User size={18} />
              </button>

              {/* User Dropdown Menu */}
              {userDropdownOpen && (
                <div className="absolute right-0 mt-2 w-64 bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden">
                  <div className="p-4 bg-gradient-to-r from-blue-50 to-cyan-50 border-b border-gray-100">
                    <p className="font-bold text-gray-900">{userData?.name || 'User'}</p>
                    <p className="text-xs text-gray-500">{userData?.email || 'user@example.com'}</p>
                  </div>
                  <div className="p-2">
                    {[
                      { label: 'Order History', icon: History, path: '/order-history' },
                      { label: 'Payment History', icon: DollarSign, path: '/payment-history' },
                      { label: 'Vouchers', icon: Bookmark, path: '/voucher-center' },
                      { label: 'Profile', icon: User, path: '/profile' },
                      { label: 'Settings', icon: Settings, path: '/settings' },
                    ].map((item, idx) => {
                      const Icon = item.icon;
                      return (
                        <button
                          key={idx}
                          onClick={() => handleNavigation(item.path)}
                          className="w-full flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors text-sm font-medium rounded-lg"
                        >
                          <Icon size={16} />
                          {item.label}
                        </button>
                      );
                    })}
                    <div className="border-t border-gray-100 mt-2 pt-2">
                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-3 px-4 py-3 text-red-600 hover:bg-red-50 transition-colors text-sm font-medium rounded-lg"
                      >
                        <LogOut size={16} />
                        Logout
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Mobile Menu Button */}
          <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="lg:hidden">
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-white border-t border-blue-100/50 px-8 py-4">
          {[
            { label: 'Home', path: '/', icon: Home },
            { label: 'Create Shipment', path: '/create-shipment', icon: Package },
            { label: 'Slot Booking', path: '/slot-booking', icon: Bookmark },
            { label: 'Pricing', path: '/shipping-quotation', icon: DollarSign },
            { label: 'Tracking', path: '/tracking', icon: MapPin },
            { label: 'Support', path: '/support', icon: HelpCircle },
          ].map((item, idx) => {
            const Icon = item.icon;
            return (
              <button
                key={idx}
                onClick={() => handleNavigation(item.path)}
                className="w-full flex items-center gap-3 py-3 text-gray-700 hover:text-blue-600 text-sm font-medium"
              >
                <Icon size={18} />
                {item.label}
              </button>
            );
          })}

          {!isLoggedIn && (
            <div className="mt-4 border-t border-gray-100 pt-4">
              <button
                onClick={() => handleNavigation('/auth')}
                className="w-full bg-gradient-to-r from-blue-600 to-cyan-500 text-white py-3 rounded-xl text-sm font-bold shadow-lg"
              >
                Bắt đầu ngay
              </button>
            </div>
          )}

          {isLoggedIn && (
            <div className="mt-4 space-y-2 border-t border-gray-100 pt-4">
              <button onClick={() => handleNavigation('/order-history')} className="w-full py-2 text-left text-gray-700 text-sm">
                Order History
              </button>
              <button onClick={() => handleNavigation('/profile')} className="w-full py-2 text-left text-gray-700 text-sm">
                Profile
              </button>
              <button onClick={handleLogout} className="w-full py-2 text-left text-red-600 text-sm font-medium">
                Logout
              </button>
            </div>
          )}
        </div>
      )}
    </nav>
  );
};

export default Header;
