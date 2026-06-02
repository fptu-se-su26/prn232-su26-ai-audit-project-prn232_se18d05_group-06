import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import DispatcherDashboard from '@features/dispatcher/pages/DispatcherDashboard';
import DriverDashboard from './features/driver/pages/DriverDashboard';

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
    <Router>
      <Routes>
        {/* Route for Dispatcher Control Room */}
        <Route path="/" element={<DispatcherDashboard />} />
        <Route path="/dispatcher" element={<DispatcherDashboard />} />
        
        {/* Route for Driver Dashboard */}
        <Route path="/driver" element={<DriverDashboard />} />
        
        {/* Catch-all redirect to Dispatcher */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;

