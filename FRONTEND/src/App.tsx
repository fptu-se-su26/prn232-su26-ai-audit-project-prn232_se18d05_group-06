import React from 'react';
import { BrowserRouter, Routes, Route, Link, useLocation } from 'react-router-dom';

// Import Admin Components
import AdminDashboard from '@features/admin/Dashboard';
import AdminAnalytics from '@features/admin/Analytics';
import AdminFinance from '@features/admin/Finance';
import AdminAuditLog from '@features/admin/AuditLog';
import AdminNotifications from '@features/admin/Notifications';
import AdminFleetMap from '@features/admin/FleetMap';
import AdminOrders from '@features/admin/Orders';
import AdminUserManagement from '@features/admin/UserManagement';
import AdminRolePermission from '@features/admin/RolePermission';
import AdminSmartLogAI from '@features/admin/SmartLogAI';
import AdminWarehouses from '@features/admin/Warehouses';
import AdminSettings from '@features/admin/Settings';

const modules = [
  { path: '/admin/dashboard', name: 'Dashboard', desc: 'KPI Grid, AI Insights, Maps', icon: 'dashboard', color: 'from-blue-500 to-indigo-600' },
  { path: '/admin/analytics', name: 'BI Analytics', desc: 'Operational Analytics, Reports', icon: 'analytics', color: 'from-purple-500 to-pink-600' },
  { path: '/admin/finance', name: 'Finance', desc: 'Revenue, Reconciliation, Bills', icon: 'payments', color: 'from-emerald-500 to-teal-600' },
  { path: '/admin/audit-log', name: 'Audit Logs', desc: 'Security, Changes, Actions', icon: 'history', color: 'from-slate-500 to-zinc-600' },
  { path: '/admin/notifications', name: 'Notifications', desc: 'System Alerts & Logs', icon: 'notifications', color: 'from-orange-500 to-amber-600' },
  { path: '/admin/fleet-map', name: 'Fleet Map', desc: 'Vehicle Tracking, Drivers', icon: 'map', color: 'from-cyan-500 to-blue-600' },
  { path: '/admin/orders', name: 'Orders Management', desc: 'Shipments, Orders, Side Drawer', icon: 'inventory_2', color: 'from-rose-500 to-red-600' },
  { path: '/admin/user-management', name: 'User Management', desc: 'Accounts, Directory, Profile Drawer', icon: 'group', color: 'from-violet-500 to-purple-600' },
  { path: '/admin/role-permission', name: 'Role & Permission', desc: 'Access Control, Permission Matrix', icon: 'admin_panel_settings', color: 'from-indigo-500 to-violet-600' },
  { path: '/admin/smart-log-ai', name: 'SmartLog AI', desc: 'AI Assistant Chat Interface', icon: 'psychology', color: 'from-fuchsia-500 to-pink-600' },
  { path: '/admin/warehouses', name: 'Warehouses', desc: 'Facilities, Live regional map, Inventory', icon: 'warehouse', color: 'from-sky-500 to-cyan-600' },
  { path: '/admin/settings', name: 'Settings', desc: 'General config, Branding, Engine config', icon: 'settings', color: 'from-gray-500 to-slate-600' },
];

const TestCenterHome: React.FC = () => {
  return (
    <div className="min-h-screen bg-[#faf8ff] text-[#191b23] font-sans relative selection:bg-blue-500/20 selection:text-blue-600">
      {/* Dynamic Background */}
      <div className="fixed inset-0 z-[-1] pointer-events-none opacity-40">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-[#004ac6]/10 rounded-full blur-[120px]"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-[#005e6e]/10 rounded-full blur-[100px]"></div>
      </div>

      <header className="py-12 px-6 text-center max-w-4xl mx-auto">
        <div className="inline-flex items-center gap-3 px-4 py-2 bg-blue-50 border border-blue-200 rounded-full text-blue-700 font-semibold mb-6">
          <span className="material-symbols-outlined text-[20px] animate-pulse">rocket_launch</span>
          <span>FleetNova Admin UI Test Center</span>
        </div>
        <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-4 bg-gradient-to-r from-[#004ac6] to-[#005e6e] bg-clip-text text-transparent">
          Admin Dashboard Migration
        </h1>
        <p className="text-lg text-[#434655]">
          100% migrated to modular React Functional Components. Verify visual fidelity, responsive states, and interactivity.
        </p>
      </header>

      <main className="max-w-6xl mx-auto px-6 pb-24">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {modules.map((m, idx) => (
            <Link
              key={idx}
              to={m.path}
              className="group block p-6 rounded-2xl bg-white/70 backdrop-blur-md border border-white/40 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                <span className="material-symbols-outlined text-[80px]">{m.icon}</span>
              </div>
              <div className="flex items-center gap-4 mb-4">
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${m.color} flex items-center justify-center text-white shadow-md`}>
                  <span className="material-symbols-outlined text-[24px]" style={{ fontVariationSettings: "'FILL' 1" }}>{m.icon}</span>
                </div>
                <div>
                  <h3 className="font-bold text-lg group-hover:text-[#004ac6] transition-colors">{m.name}</h3>
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800 border border-emerald-200">
                    React Component
                  </span>
                </div>
              </div>
              <p className="text-sm text-[#585e70]">{m.desc}</p>
            </Link>
          ))}
        </div>
      </main>
    </div>
  );
};

const FloatingHomeButton: React.FC = () => {
  const location = useLocation();
  if (location.pathname === '/') return null;
  return (
    <Link
      to="/"
      className="fixed bottom-6 right-6 z-[9999] flex items-center justify-center gap-2 px-5 py-3.5 bg-gradient-to-r from-[#004ac6] to-[#005e6e] text-white font-semibold rounded-full shadow-2xl hover:scale-105 transition-all"
    >
      <span className="material-symbols-outlined">home</span>
      <span>Test Center</span>
    </Link>
  );
};

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<TestCenterHome />} />
        <Route path="/admin/dashboard" element={<AdminDashboard />} />
        <Route path="/admin/analytics" element={<AdminAnalytics />} />
        <Route path="/admin/finance" element={<AdminFinance />} />
        <Route path="/admin/audit-log" element={<AdminAuditLog />} />
        <Route path="/admin/notifications" element={<AdminNotifications />} />
        <Route path="/admin/fleet-map" element={<AdminFleetMap />} />
        <Route path="/admin/orders" element={<AdminOrders />} />
        <Route path="/admin/user-management" element={<AdminUserManagement />} />
        <Route path="/admin/role-permission" element={<AdminRolePermission />} />
        <Route path="/admin/smart-log-ai" element={<AdminSmartLogAI />} />
        <Route path="/admin/warehouses" element={<AdminWarehouses />} />
        <Route path="/admin/settings" element={<AdminSettings />} />
      </Routes>
      <FloatingHomeButton />
    </BrowserRouter>
  );
}

export default App;
