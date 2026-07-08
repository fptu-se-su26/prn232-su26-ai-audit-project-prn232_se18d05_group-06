import React from 'react';
import { Link, useLocation } from 'react-router-dom';

interface MenuItem {
  label: string;
  icon: string;
  path: string;
}

const menuItems: MenuItem[] = [
  { label: 'Dashboard', icon: 'dashboard', path: '/admin/dashboard' },
  { label: 'User Management', icon: 'group', path: '/admin/user-management' },
  { label: 'Role & Permission', icon: 'admin_panel_settings', path: '/admin/role-permission' },
  { label: 'Orders', icon: 'inventory_2', path: '/admin/orders' },
  { label: 'Warehouses', icon: 'warehouse', path: '/admin/warehouses' },
  { label: 'Fleet Map', icon: 'map', path: '/admin/fleet-map' },
  { label: 'Finance', icon: 'payments', path: '/admin/finance' },
  { label: 'BI Analytics', icon: 'analytics', path: '/admin/analytics' },
  { label: 'SmartLog AI', icon: 'psychology', path: '/admin/smart-log-ai' },
  { label: 'Customer Tiers', icon: 'military_tech', path: '/admin/tier-management' },
  { label: 'Notifications', icon: 'notifications', path: '/admin/notifications' },
  { label: 'Audit Logs', icon: 'history', path: '/admin/audit-log' },
  { label: 'Settings', icon: 'settings', path: '/admin/settings' },
];

const AdminSidebar: React.FC = () => {
  const location = useLocation();

  return (
    <aside className="hidden md:flex flex-col h-screen py-6 px-4 bg-[#2e3039]/90 backdrop-blur-xl border-r border-white/10 shadow-2xl shadow-[#004ac6]/10 fixed left-0 top-0 w-[280px] z-50">
      {/* Brand Header */}
      <div className="flex items-center gap-4 mb-8 px-2">
        <Link to="/" className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#004ac6] to-[#4cd7f6] flex items-center justify-center text-white font-bold shadow-lg shadow-[#004ac6]/20">
          S
        </Link>
        <div>
          <h2 className="font-headline-sm text-[18px] font-bold text-white tracking-tight leading-tight">SmartLog AI</h2>
          <p className="text-[12px] text-[#c1c6db]/80 font-mono">System Active</p>
        </div>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 overflow-y-auto space-y-1 pr-1 custom-scrollbar">
        {menuItems.map((item, index) => {
          const isActive = location.pathname === item.path;

          // Special rendering for AI assistant promo widget in sidebar if it's not the active page
          if (item.path === '/admin/smart-log-ai' && !isActive) {
            return (
              <React.Fragment key={index}>
                <div className="px-4 py-2 mt-2">
                  <div className="bg-gradient-to-r from-[#6b21a8]/30 to-[#4cd7f6]/30 border border-white/10 rounded-full px-3 py-1.5 flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-[#4cd7f6] animate-pulse"></div>
                    <span className="text-[12px] text-white font-medium">AI Insight Ready</span>
                  </div>
                </div>
                <Link
                  to={item.path}
                  className="flex items-center gap-3 px-4 py-3 rounded-lg text-[#c1c6db] hover:text-white hover:bg-white/5 transition-all duration-300 active:scale-95 mt-2 border border-[#004ac6]/20 bg-[#004ac6]/5 group"
                >
                  <span className="material-symbols-outlined text-[20px] text-[#4cd7f6]">smart_toy</span>
                  <span className="font-body-md text-body-md font-medium text-[#b4c5ff] group-hover:text-white">AI Assistant</span>
                </Link>
              </React.Fragment>
            );
          }

          return (
            <Link
              key={index}
              to={item.path}
              className={
                isActive
                  ? "flex items-center gap-3 px-4 py-3 rounded-lg text-[#b4c5ff] bg-[#004ac6]/20 shadow-[0_0_15px_rgba(76,215,246,0.3)] border-r-2 border-[#b4c5ff] hover:bg-white/5 transition-all duration-300 active:scale-95"
                  : "flex items-center gap-3 px-4 py-3 rounded-lg text-[#c1c6db] hover:text-white hover:bg-white/5 transition-all duration-300 active:scale-95"
              }
            >
              <span className="material-symbols-outlined text-[20px]" style={{ fontVariationSettings: isActive ? "'FILL' 1" : "normal" }}>
                {item.icon}
              </span>
              <span className={`font-body-md text-body-md ${isActive ? 'font-semibold' : 'font-medium'}`}>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Footer support links */}
      <div className="mt-auto pt-4 border-t border-white/5 space-y-1">
        <a className="flex items-center gap-3 text-[#c1c6db] hover:text-white px-4 py-2 transition-colors text-sm" href="#">
          <span className="material-symbols-outlined text-[18px]">help</span>
          <span>Support</span>
        </a>
        <Link className="flex items-center gap-3 text-[#c1c6db] hover:text-white px-4 py-2 transition-colors text-sm" to="/">
          <span className="material-symbols-outlined text-[18px]">logout</span>
          <span>Sign Out</span>
        </Link>
      </div>
    </aside>
  );
};

export default AdminSidebar;
