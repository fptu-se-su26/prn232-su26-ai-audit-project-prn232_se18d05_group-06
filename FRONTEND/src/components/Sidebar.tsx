import React, { useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ROUTE_PATHS } from '../routes';

interface MenuItem {
  label: string;
  icon: string;
  path: string;
  group: 'workspace' | 'operations' | 'inventory' | 'system';
}

const menuItems: MenuItem[] = [
  { label: 'Dashboard', icon: 'dashboard', path: ROUTE_PATHS.WAREHOUSE_DASHBOARD, group: 'workspace' },
  { label: 'Gate', icon: 'sensor_door', path: ROUTE_PATHS.WAREHOUSE_GATE_CHECKOUT, group: 'operations' },
  { label: 'Import Goods', icon: 'input', path: ROUTE_PATHS.WAREHOUSE_IMPORT, group: 'operations' },
  { label: 'Export Goods', icon: 'output', path: ROUTE_PATHS.WAREHOUSE_EXPORT, group: 'operations' },
  { label: 'Transfer', icon: 'local_shipping', path: ROUTE_PATHS.WAREHOUSE_TRANSFER, group: 'operations' },
  
  { label: 'Inventory', icon: 'inventory_2', path: ROUTE_PATHS.WAREHOUSE_INVENTORY, group: 'inventory' },
  { label: 'AI OCR Scan', icon: 'document_scanner', path: ROUTE_PATHS.WAREHOUSE_AI_OCR, group: 'inventory' },
  { label: 'Audit & Check', icon: 'checklist', path: ROUTE_PATHS.WAREHOUSE_INVENTORY_AUDIT, group: 'inventory' },
  { label: 'Stock Alerts', icon: 'notifications_active', path: ROUTE_PATHS.WAREHOUSE_STOCK_ALERTS, group: 'inventory' },
  { label: 'Reports', icon: 'assessment', path: ROUTE_PATHS.WAREHOUSE_REPORTS, group: 'inventory' },

  { label: 'Notifications', icon: 'notifications', path: ROUTE_PATHS.WAREHOUSE_NOTIFICATIONS, group: 'system' },
  { label: 'Settings', icon: 'settings', path: ROUTE_PATHS.WAREHOUSE_SETTINGS, group: 'system' },
];

const groupLabels: Record<MenuItem['group'], string> = {
  workspace: 'Workspace',
  operations: 'Operations',
  inventory: 'Inventory & AI',
  system: 'System',
};

const mobileItems = menuItems.filter((item) =>
  [ROUTE_PATHS.WAREHOUSE_DASHBOARD, ROUTE_PATHS.WAREHOUSE_GATE_CHECKOUT, ROUTE_PATHS.WAREHOUSE_INVENTORY, ROUTE_PATHS.WAREHOUSE_NOTIFICATIONS, ROUTE_PATHS.WAREHOUSE_SETTINGS].includes(item.path),
);

const Sidebar: React.FC = () => {
  const location = useLocation();

  useEffect(() => {
    document.body.classList.add('admin-light-theme');
    return () => document.body.classList.remove('admin-light-theme');
  }, []);

  const isActive = (path: string) => location.pathname === path || location.pathname.startsWith(`${path}/`);

  return (
    <>
      <aside className="admin-sidebar-console hidden md:flex fixed left-0 top-0 z-50 h-screen w-[280px] flex-col overflow-hidden border-r border-white/10 px-4 py-5 shadow-2xl">
        <div className="pointer-events-none absolute inset-0 opacity-70">
          <div className="absolute -left-24 top-10 h-48 w-48 rounded-full bg-cyan-400/10 blur-3xl" />
          <div className="absolute bottom-16 right-[-72px] h-56 w-56 rounded-full bg-amber-300/10 blur-3xl" />
        </div>

        <div className="relative flex items-center gap-3 px-2 pb-5">
          <Link
            to={ROUTE_PATHS.WAREHOUSE_DASHBOARD}
            className="grid h-11 w-11 place-items-center rounded-xl border border-cyan-300/25 bg-cyan-300/15 text-lg font-black text-cyan-100 shadow-[0_18px_45px_rgba(34,211,238,0.18)] transition hover:-translate-y-0.5 hover:bg-cyan-300/20"
            aria-label="SmartLog AI warehouse dashboard"
          >
            W
          </Link>
          <div className="min-w-0">
            <h2 className="truncate text-[18px] font-black leading-tight tracking-normal text-white">SmartLog AI</h2>
            <div className="mt-1 flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-cyan-100/70">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-300 shadow-[0_0_16px_rgba(110,231,183,0.8)]" />
              Warehouse
            </div>
          </div>
        </div>

        <div className="relative mb-4 rounded-xl border border-white/10 bg-white/[0.055] p-3 shadow-inner shadow-white/5">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-xs font-medium text-slate-400">Warehouse Capacity</p>
              <p className="mt-1 text-xl font-black tabular-nums text-white">82.5%</p>
            </div>
            <div className="grid h-10 w-10 place-items-center rounded-lg bg-emerald-300/12 text-emerald-200">
              <span className="material-symbols-outlined text-[22px]">inventory_2</span>
            </div>
          </div>
          <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-white/10">
            <div className="h-full w-[82.5%] rounded-full bg-gradient-to-r from-emerald-300 via-cyan-300 to-amber-200" />
          </div>
        </div>

        <nav className="relative flex-1 overflow-y-auto pr-1 admin-sidebar-scroll" aria-label="Warehouse navigation">
          {(Object.keys(groupLabels) as Array<MenuItem['group']>).map((group) => {
            const items = menuItems.filter((item) => item.group === group);
            return (
              <div key={group} className="mb-5">
                <p className="mb-2 px-3 text-[11px] font-bold uppercase tracking-[0.18em] text-slate-500">{groupLabels[group]}</p>
                <div className="space-y-1">
                  {items.map((item) => {
                    const active = isActive(item.path);
                    return (
                      <Link
                        key={item.path}
                        to={item.path}
                        className={[
                          'admin-nav-link group relative flex min-h-[44px] items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition duration-200 active:scale-[0.99]',
                          active
                            ? 'is-active text-white'
                            : 'text-slate-300/85 hover:text-white hover:bg-white/[0.07]',
                        ].join(' ')}
                      >
                        <span
                          className="material-symbols-outlined grid h-8 w-8 place-items-center rounded-lg text-[20px] transition"
                          style={{ fontVariationSettings: active ? "'FILL' 1, 'wght' 500, 'GRAD' 0, 'opsz' 24" : undefined }}
                        >
                          {item.icon}
                        </span>
                        <span className="truncate">{item.label}</span>
                        {active && <span className="ml-auto h-2 w-2 rounded-full bg-cyan-200 shadow-[0_0_14px_rgba(165,243,252,0.9)]" />}
                      </Link>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </nav>

        <div className="relative mt-4 rounded-xl border border-white/10 bg-white/[0.055] p-3 flex flex-col gap-2">
          <div className="flex items-center gap-3">
            <div className="grid h-10 w-10 place-items-center rounded-xl overflow-hidden">
               <img
                className="w-full h-full object-cover"
                alt="Warehouse supervisor"
                src="https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=256&q=80"
              />
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-bold text-white">Marcus Chen</p>
              <p className="truncate text-xs text-slate-400">Floor Manager</p>
            </div>
            <Link to="/" className="grid h-9 w-9 place-items-center rounded-lg text-slate-400 transition hover:bg-white/10 hover:text-white" aria-label="Sign out">
              <span className="material-symbols-outlined text-[20px]">logout</span>
            </Link>
          </div>
          <Link
            to="/admin/warehouses"
            className="mt-1 flex items-center justify-center gap-2 rounded-lg py-2 text-xs font-semibold text-amber-300/80 transition hover:bg-amber-300/10 hover:text-amber-300"
          >
            <span className="material-symbols-outlined text-[16px]">arrow_back</span>
            Back to Admin Console
          </Link>
        </div>
      </aside>

      <nav className="admin-mobile-nav fixed inset-x-3 bottom-3 z-50 grid grid-cols-5 gap-1 rounded-2xl border border-white/12 bg-slate-950/88 p-1.5 shadow-2xl shadow-slate-950/40 backdrop-blur-xl md:hidden" aria-label="Warehouse mobile navigation">
        {mobileItems.map((item) => {
          const active = isActive(item.path);
          return (
            <Link
              key={item.path}
              to={item.path}
              className={[
                'flex min-h-[54px] flex-col items-center justify-center rounded-xl text-[10px] font-bold transition active:scale-95',
                active ? 'bg-cyan-300/18 text-cyan-100' : 'text-slate-400 hover:bg-white/8 hover:text-white',
              ].join(' ')}
            >
              <span className="material-symbols-outlined text-[20px]">{item.icon}</span>
              <span className="mt-0.5 max-w-full truncate px-1">{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </>
  );
};

export default Sidebar;
