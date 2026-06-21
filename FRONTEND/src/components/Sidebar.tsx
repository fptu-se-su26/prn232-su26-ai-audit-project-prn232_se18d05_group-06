import { NavLink } from 'react-router-dom'

const navItems = [
  { label: 'Dashboard', icon: 'dashboard', to: '/warehouse/dashboard' },
  { label: 'Import Goods', icon: 'input', to: '/warehouse/import' },
  { label: 'Export Goods', icon: 'output', to: '/warehouse/export' },
  { label: 'Inventory', icon: 'inventory_2', to: '/warehouse/inventory' },
  { label: 'Reports', icon: 'assessment', to: '/warehouse/reports' },
  { label: 'QR Scanner', icon: 'qr_code_scanner', to: '/warehouse/qr-scanner' },
  { label: 'AI OCR Scan', icon: 'document_scanner', to: '/warehouse/ai-ocr' },
  { label: 'Inventory Audit', icon: 'checklist', to: '/warehouse/inventory-audit' },
  { label: 'Warehouse Transfer', icon: 'local_shipping', to: '/warehouse/transfer' },
  { label: 'Stock Alerts', icon: 'notifications_active', to: '/warehouse/stock-alerts' },
  { label: 'Notifications', icon: 'notifications', to: '/warehouse/notifications' },
  { label: 'Gate Checkout', icon: 'sensor_door', to: '/warehouse/gate-checkout' },
]

const Sidebar = () => (
  <aside className="fixed left-0 top-0 h-full w-[280px] bg-gradient-to-b from-[#191c1e] to-[#101214] text-white shadow-xl flex flex-col py-6 px-4 gap-4 z-50">
    <div className="mb-8 px-2">
      <h1 className="text-2xl font-black tracking-tight">SmartLog AI</h1>
      <p className="text-sm text-slate-300/80">Warehouse Management</p>
    </div>

    <nav className="flex-1 space-y-2 overflow-y-auto sidebar-scrollbar pr-2">
      {navItems.map((item) => (
        <NavLink
          key={item.label}
          to={item.to}
          end={item.to === '/'}
          className={({ isActive }) =>
            `flex items-center gap-3 transition-all duration-300 px-4 py-3 rounded-xl ${
              isActive
                ? 'bg-blue-600 text-white shadow-[0_0_15px_rgba(37,99,235,0.4)]'
                : 'text-slate-300 hover:text-white hover:bg-slate-800/40'
            }`
          }
        >
          <span className="material-symbols-outlined">{item.icon}</span>
          <span className="font-semibold">{item.label}</span>
        </NavLink>
      ))}
      <div className="pt-4 mt-4 border-t border-slate-500/20">
        <NavLink
          to="/warehouse/settings"
          className={({ isActive }) =>
            `flex items-center gap-3 px-4 py-3 rounded-xl transition-colors duration-200 ${
              isActive
                ? 'bg-blue-600 text-white shadow-[0_0_15px_rgba(37,99,235,0.4)]'
                : 'text-slate-300 hover:text-white hover:bg-slate-800/40'
            }`
          }
        >
          <span className="material-symbols-outlined">settings</span>
          <span className="font-semibold">Settings</span>
        </NavLink>
      </div>
    </nav>

    <div className="mt-auto px-2 flex items-center gap-3">
      <div className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center overflow-hidden">
        <img
          className="w-full h-full object-cover"
          alt="Warehouse supervisor"
          src="https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=256&q=80"
        />
      </div>
      <div>
        <p className="text-sm font-bold">Marcus Chen</p>
        <p className="text-[10px] uppercase tracking-widest text-slate-400">Floor Manager</p>
      </div>
    </div>
  </aside>
)

export default Sidebar
