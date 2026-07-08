import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import CustomerLandingPage from './features/customer/CustomerLandingPage';
import AuthPage from './features/auth/AuthPage';
import CreateOrder from './features/customer/CreateOrder';
import ShippingQuotation from './features/customer/ShippingQuotation';
import OrderSuccess from './features/customer/OrderSuccess';
import OrderTracking from './features/customer/OrderTracking';
import OrderHistory from './features/customer/OrderHistory';
import CustomerProfile from './features/customer/CustomerProfile';
import Settings from './features/customer/Settings';
import PaymentHistory from './features/customer/PaymentHistory';
import SupportChat from './features/support/SupportChat';
import SupportPage from './features/support/SupportPage';
import ComplaintCenter from './features/customer/ComplaintCenter';
import VoucherCenter from './features/voucher/VoucherCenter';
import OrderDetails from './features/customer/OrderDetails';
import OrderTrackingMap from './features/customer/OrderTrackingMap';
import AboutPage from './features/customer/AboutPage';
import PaymentPage from './features/customer/PaymentPage';
import DispatcherDashboard from '@features/dispatcher/pages/DispatcherDashboard';
import DriverDashboard from './features/driver/pages/DriverDashboard';
import SlotBooking from './features/warehouse/SlotBooking';


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
import WarehouseDashboard from './features/warehouse/WarehouseDashboard';
import WarehouseTransfer from './features/warehouse/WarehouseTransfer';
import WarehouseInventory from './features/warehouse/Inventory';
import WarehouseImport from './features/warehouse/ImportGoods';
import WarehouseExport from './features/warehouse/ExportGoods';
import WarehouseStockAlerts from './features/warehouse/StockAlerts';
import WarehouseInventoryAudit from './features/warehouse/InventoryAudit';
import WarehouseReports from './features/warehouse/Reports';
import WarehouseNotifications from './features/warehouse/Notifications';
import WarehouseSettings from './features/warehouse/Settings';
import WarehouseAIOCR from './features/warehouse/AIOCRScan';
import GateCheckoutDashboard from './features/warehouse/GateCheckoutDashboard';

// Warehouse role pages (RoleID = 2)
import RoleGuard from './components/RoleGuard';
import { ROUTE_PATHS } from './routes';

// Only Admin (RoleID = 1) and Warehouse (RoleID = 2) may access warehouse pages.
const WAREHOUSE_ROLES = ['ADMIN', 'WAREHOUSE', 'WF'];

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

const App: React.FC = () => {
  return (
    <Router>
      <Routes>
        {/* Landing Page */}
        <Route path="/" element={<CustomerLandingPage />} />

        {/* Auth */}
        <Route path="/auth" element={<AuthPage />} />
        <Route path="/login" element={<AuthPage />} />
        <Route path="/register" element={<AuthPage />} />

        {/* Create Shipment Flow (Purple) */}
        <Route path="/create-shipment" element={<CreateOrder />} />
        <Route path="/shipping-quotation" element={<ShippingQuotation />} />
        <Route path="/order-success" element={<OrderSuccess />} />
        <Route path="/payment" element={<PaymentPage />} />

        {/* Tracking Flow (Yellow) */}
        <Route path="/tracking" element={<OrderTracking />} />
        <Route path="/order-details" element={<OrderDetails />} />
        <Route path="/tracking-map" element={<OrderTrackingMap />} />
        <Route path="/slot-booking" element={<SlotBooking />} />

        {/* Complaints (Coral) */}
        <Route path="/complaints" element={<ComplaintCenter />} />

        {/* Profile & CRM (Pink) */}
        <Route path="/profile" element={<CustomerProfile />} />
        <Route path="/order-history" element={<OrderHistory />} />
        <Route path="/voucher-center" element={<VoucherCenter />} />

        {/* Settings (Gray) */}
        <Route path="/settings" element={<Settings />} />
        <Route path="/payment-history" element={<PaymentHistory />} />

        {/* Support */}
        <Route path="/support" element={<SupportPage />} />
        <Route path="/support-chat" element={<SupportChat />} />

        {/* Admin Dashboard & Management */}
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
        <Route path="/admin/warehouses" element={<RoleGuard allow={WAREHOUSE_ROLES}><AdminWarehouses /></RoleGuard>} />
        <Route path="/admin/settings" element={<AdminSettings />} />

        {/* Warehouse Management (Admin + Warehouse roles only) */}
        <Route path={ROUTE_PATHS.WAREHOUSE_DASHBOARD} element={<RoleGuard allow={WAREHOUSE_ROLES}><WarehouseDashboard /></RoleGuard>} />
        <Route path={ROUTE_PATHS.WAREHOUSE_TRANSFER} element={<RoleGuard allow={WAREHOUSE_ROLES}><WarehouseTransfer /></RoleGuard>} />
        <Route path={ROUTE_PATHS.WAREHOUSE_INVENTORY} element={<RoleGuard allow={WAREHOUSE_ROLES}><WarehouseInventory /></RoleGuard>} />
        <Route path={ROUTE_PATHS.WAREHOUSE_IMPORT} element={<RoleGuard allow={WAREHOUSE_ROLES}><WarehouseImport /></RoleGuard>} />
        <Route path={ROUTE_PATHS.WAREHOUSE_EXPORT} element={<RoleGuard allow={WAREHOUSE_ROLES}><WarehouseExport /></RoleGuard>} />
        <Route path={ROUTE_PATHS.WAREHOUSE_STOCK_ALERTS} element={<RoleGuard allow={WAREHOUSE_ROLES}><WarehouseStockAlerts /></RoleGuard>} />
        <Route path={ROUTE_PATHS.WAREHOUSE_INVENTORY_AUDIT} element={<RoleGuard allow={WAREHOUSE_ROLES}><WarehouseInventoryAudit /></RoleGuard>} />
        <Route path={ROUTE_PATHS.WAREHOUSE_REPORTS} element={<RoleGuard allow={WAREHOUSE_ROLES}><WarehouseReports /></RoleGuard>} />
        <Route path={ROUTE_PATHS.WAREHOUSE_NOTIFICATIONS} element={<RoleGuard allow={WAREHOUSE_ROLES}><WarehouseNotifications /></RoleGuard>} />
        <Route path={ROUTE_PATHS.WAREHOUSE_SETTINGS} element={<RoleGuard allow={WAREHOUSE_ROLES}><WarehouseSettings /></RoleGuard>} />
        <Route path={ROUTE_PATHS.WAREHOUSE_AI_OCR} element={<RoleGuard allow={WAREHOUSE_ROLES}><WarehouseAIOCR /></RoleGuard>} />

        {/* Others */}
        <Route path="/about" element={<AboutPage />} />
        {/* Route for Dispatcher Control Room */}
        <Route path="/" element={<DispatcherDashboard />} />
        <Route path="/dispatcher" element={<DispatcherDashboard />} />
        
        {/* Route for Driver Dashboard */}
        <Route path="/driver" element={<DriverDashboard />} />

        {/* Warehouse Routes */}
        <Route path="/warehouse/dashboard" element={<WarehouseDashboard />} />
        <Route path="/warehouse/transfer" element={<WarehouseTransfer />} />
        <Route path="/warehouse/inventory" element={<WarehouseInventory />} />
        <Route path="/warehouse/import" element={<WarehouseImport />} />
        <Route path="/warehouse/export" element={<WarehouseExport />} />
        <Route path="/warehouse/stock-alerts" element={<WarehouseStockAlerts />} />
        <Route path="/warehouse/inventory-audit" element={<WarehouseInventoryAudit />} />
        <Route path="/warehouse/reports" element={<WarehouseReports />} />
        <Route path="/warehouse/notifications" element={<WarehouseNotifications />} />
        <Route path="/warehouse/settings" element={<WarehouseSettings />} />
        <Route path="/warehouse/ai-ocr" element={<WarehouseAIOCR />} />
        <Route path="/warehouse/gate-checkout" element={<GateCheckoutDashboard />} />

        {/* Catch-all redirect to Dispatcher */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  )
}

export default App;
