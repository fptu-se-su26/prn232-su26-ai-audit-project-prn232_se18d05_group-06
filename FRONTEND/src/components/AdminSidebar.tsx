import React, { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';

// ─── Types ───────────────────────────────────────────────────────────────────

interface SubMenuItem {
  label: string;
  path: string;
  icon: string;
}

interface NavSection {
  id: string;
  label: string;
  icon: string;
  primaryPath?: string;
  direct?: boolean;
  children?: SubMenuItem[];
}

// ─── Navigation structure ─────────────────────────────────────────────────────

const NAV_SECTIONS: NavSection[] = [
  {
    id: 'dashboard',
    label: 'Dashboard',
    icon: 'dashboard',
    primaryPath: '/admin/dashboard',
    direct: true,
  },
  {
    id: 'orders',
    label: 'Orders',
    icon: 'inventory_2',
    primaryPath: '/admin/orders',
    direct: true,
  },
  {
    id: 'warehouses',
    label: 'Warehouses',
    icon: 'warehouse',
    primaryPath: '/admin/warehouses',
    children: [
      { label: 'Quản lý Kho', icon: 'warehouse', path: '/admin/warehouses' },
      { label: 'Dashboard Kho', icon: 'space_dashboard', path: '/warehouse/dashboard' },
      { label: 'Quản lý SKU', icon: 'qr_code', path: '/warehouse/sku' },
      { label: 'Tồn kho', icon: 'inventory_2', path: '/warehouse/inventory' },
      { label: 'Hàng tồn lâu / sắp hết hạn', icon: 'hourglass_empty', path: '/warehouse/dead-expiry' },
      { label: 'Chuyển kho nội bộ', icon: 'sync_alt', path: '/warehouse/transfer' },
      { label: 'Thanh lý hàng hỏng', icon: 'delete_sweep', path: '/warehouse/write-off' },
      { label: 'Thẻ kho (Stock Ledger)', icon: 'receipt_long', path: '/warehouse/stock-ledger' },
      { label: 'Nhập kho + AI OCR', icon: 'document_scanner', path: '/warehouse/import' },
      { label: 'Xuất kho', icon: 'output', path: '/warehouse/export' },
      { label: 'Kiểm kê', icon: 'checklist', path: '/warehouse/inventory-audit' },
      { label: 'Cảnh báo tồn kho', icon: 'notifications_active', path: '/warehouse/stock-alerts' },
      { label: 'Gate Checkout', icon: 'sensor_door', path: '/warehouse/gate-checkout' },
    ],
  },
  {
    id: 'fleet',
    label: 'Fleet Map',
    icon: 'map',
    primaryPath: '/admin/fleet-map',
    direct: true,
  },
  {
    id: 'finance',
    label: 'Finance',
    icon: 'payments',
    primaryPath: '/admin/finance',
    direct: true,
  },
  {
    id: 'intelligence',
    label: 'Intelligence',
    icon: 'analytics',
    children: [
      { label: 'BI Dashboard', icon: 'insights', path: '/admin/bi-dashboard' },
      { label: 'BI Analytics', icon: 'analytics', path: '/admin/analytics' },
      { label: 'SmartLog AI', icon: 'psychology', path: '/admin/smart-log-ai' },
      { label: 'Customer Tiers', icon: 'military_tech', path: '/admin/tier-management' },
    ],
  },
  {
    id: 'system',
    label: 'System',
    icon: 'admin_panel_settings',
    children: [
      { label: 'User Management', icon: 'group', path: '/admin/user-management' },
      { label: 'Role & Permission', icon: 'admin_panel_settings', path: '/admin/role-permission' },
      { label: 'Notifications', icon: 'notifications', path: '/admin/notifications' },
      { label: 'Audit Logs', icon: 'history', path: '/admin/audit-log' },
      { label: 'Settings', icon: 'settings', path: '/admin/settings' },
    ],
  },
];

// ─── Mobile items ─────────────────────────────────────────────────────────────

const MOBILE_ITEMS = [
  { path: '/admin/dashboard', label: 'Dashboard', icon: 'dashboard' },
  { path: '/admin/orders', label: 'Orders', icon: 'inventory_2' },
  { path: '/admin/warehouses', label: 'Warehouses', icon: 'warehouse' },
  { path: '/admin/finance', label: 'Finance', icon: 'payments' },
  { path: '/admin/settings', label: 'Settings', icon: 'settings' },
];

// ─── Helper: detect which section owns a path ─────────────────────────────────

function getSectionForPath(pathname: string): string | null {
  for (const section of NAV_SECTIONS) {
    if (section.primaryPath && (pathname === section.primaryPath || pathname.startsWith(section.primaryPath + '/'))) {
      return section.id;
    }
    if (section.children?.some(c => pathname === c.path || pathname.startsWith(c.path + '/'))) {
      return section.id;
    }
  }
  return null;
}

// ─── Component ────────────────────────────────────────────────────────────────

const AdminSidebar: React.FC = () => {
  const location = useLocation();
  const [activeSection, setActiveSection] = useState<string | null>(null);

  // Auto-open section matching current URL
  useEffect(() => {
    const matched = getSectionForPath(location.pathname);
    if (matched) setActiveSection(matched);
  }, [location.pathname]);

  useEffect(() => {
    document.body.classList.add('admin-light-theme');
    return () => document.body.classList.remove('admin-light-theme');
  }, []);

  const isPathActive = (path: string) =>
    location.pathname === path || location.pathname.startsWith(path + '/');

  const currentSection = NAV_SECTIONS.find(s => s.id === activeSection);
  const panelItems = (!currentSection?.direct && currentSection?.children?.length)
    ? currentSection.children
    : null;

  const handleIconClick = (section: NavSection) => {
    if (section.direct) {
      setActiveSection(section.id);
    } else {
      setActiveSection(prev => prev === section.id ? null : section.id);
    }
  };

  return (
    <>
      {/* ════════════════════════════════════════════════════════════════
          DESKTOP: 2-Layer Navigation  (total fixed width = 280px)
          Layer 1 │ Icon Rail  (64px, far left, always visible)
          Layer 2 │ Context Panel (216px, slides in next to rail)
         ════════════════════════════════════════════════════════════════ */}
      <div className="hidden md:flex fixed left-0 top-0 z-50 h-screen" style={{ width: 280 }}>

        {/* ── Layer 1: Icon Rail ──────────────────────────────────────── */}
        <aside
          className="admin-sidebar-console relative flex h-full flex-col items-center border-r border-white/10 py-4 shadow-2xl"
          style={{ width: 64, zIndex: 52 }}
        >
          {/* Glow blobs */}
          <div className="pointer-events-none absolute inset-0 overflow-hidden opacity-50">
            <div className="absolute -left-8 top-8 h-24 w-24 rounded-full bg-cyan-400/15 blur-3xl" />
            <div className="absolute bottom-12 right-[-20px] h-28 w-28 rounded-full bg-indigo-400/10 blur-3xl" />
          </div>

          {/* Logo button */}
          <Link
            to="/admin/dashboard"
            className="relative z-10 mb-4 grid h-11 w-11 flex-shrink-0 place-items-center rounded-xl border border-cyan-300/25 bg-cyan-300/15 text-lg font-black text-cyan-100 shadow-[0_8px_24px_rgba(34,211,238,0.18)] transition hover:-translate-y-0.5 hover:bg-cyan-300/20"
            title="SmartLog AI — Home"
            onClick={() => setActiveSection('dashboard')}
          >
            S
          </Link>

          {/* Divider */}
          <div className="relative z-10 mb-2 h-px w-9 bg-white/10" />

          {/* Section icons */}
          <nav
            className="relative z-10 flex flex-1 flex-col items-center gap-1 overflow-y-auto px-1.5 py-1"
            aria-label="Global navigation"
          >
            {NAV_SECTIONS.map(section => {
              const isSelected = activeSection === section.id;
              const ownsCurrent =
                (section.primaryPath && isPathActive(section.primaryPath)) ||
                section.children?.some(c => isPathActive(c.path));

              const btn = (
                <button
                  key={section.id}
                  type="button"
                  title={section.label}
                  onClick={() => handleIconClick(section)}
                  className={[
                    'group relative flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl transition-all duration-200',
                    isSelected || ownsCurrent
                      ? 'bg-cyan-300/20 text-cyan-100 shadow-[0_0_18px_rgba(34,211,238,0.22)]'
                      : 'text-slate-400 hover:bg-white/[0.08] hover:text-white',
                  ].join(' ')}
                >
                  <span
                    className="material-symbols-outlined text-[22px] transition-all"
                    style={{
                      fontVariationSettings:
                        isSelected || ownsCurrent
                          ? "'FILL' 1, 'wght' 500, 'GRAD' 0, 'opsz' 24"
                          : undefined,
                    }}
                  >
                    {section.icon}
                  </span>

                  {/* Active indicator dot */}
                  {(isSelected || ownsCurrent) && (
                    <span className="absolute right-0.5 top-1/2 h-1.5 w-1.5 -translate-y-1/2 rounded-full bg-cyan-300 shadow-[0_0_8px_rgba(165,243,252,0.9)]" />
                  )}

                  {/* Tooltip */}
                  <span className="pointer-events-none absolute left-[calc(100%+8px)] top-1/2 z-[200] -translate-y-1/2 whitespace-nowrap rounded-lg bg-slate-900/95 px-2.5 py-1.5 text-xs font-semibold text-white opacity-0 shadow-xl ring-1 ring-white/10 transition-opacity group-hover:opacity-100">
                    {section.label}
                  </span>
                </button>
              );

              // Wrap direct nav items with Link for accessibility
              if (section.direct && section.primaryPath) {
                return (
                  <Link
                    key={section.id}
                    to={section.primaryPath}
                    className="contents"
                    tabIndex={-1}
                    onClick={() => setActiveSection(section.id)}
                  >
                    {btn}
                  </Link>
                );
              }
              return btn;
            })}
          </nav>

          {/* Bottom: logout + avatar */}
          <div className="relative z-10 mt-auto flex flex-col items-center gap-2 border-t border-white/10 pt-3 w-full px-1.5">
            <button
              title="Sign out"
              onClick={() => { window.location.href = '/'; }}
              className="grid h-9 w-9 place-items-center rounded-lg text-slate-400 transition hover:bg-white/10 hover:text-white"
            >
              <span className="material-symbols-outlined text-[20px]">logout</span>
            </button>
            <div className="h-9 w-9 overflow-hidden rounded-full border border-white/20">
              <img
                alt="Admin"
                className="h-full w-full object-cover"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuCkL04fYHcClwlaI9coEz6Ws1v5PWlrO9066dDZlGrNO4VuAFbbWrsZ1As6P8HBWAsbURx7lkUV5Z4sTEuEsO3INR8ATgC60f6dffPewxr68rle-lrafArPL9bOYABuhX0zafVeaVl8U6Ony1FJxvdl6oPFd04O45nUhpWDqWK2b6c8XRVaeYwtsgwi3TRy5SAAmZ6X_8gtFxndo0x89kn7td1Luk2ORHRMyBowOskJqsefKiFBXuGTcPsmggc0XtdPHw_MJHEGk_rG"
              />
            </div>
          </div>
        </aside>

        {/* ── Layer 2: Context Panel ──────────────────────────────────── */}
        <aside
          className="admin-sidebar-console relative flex h-full flex-col border-r border-white/[0.07] shadow-xl overflow-hidden"
          style={{ width: 216, zIndex: 51 }}
        >
          {/* Ambient blobs */}
          <div className="pointer-events-none absolute inset-0 overflow-hidden opacity-60">
            <div className="absolute -left-10 top-14 h-32 w-32 rounded-full bg-cyan-400/10 blur-3xl" />
            <div className="absolute bottom-16 right-[-30px] h-36 w-36 rounded-full bg-amber-300/8 blur-3xl" />
          </div>

          {panelItems ? (
            /* ── Panel WITH content ────────────────────────────────── */
            <>
              {/* Panel header */}
              <div className="relative flex items-center justify-between px-4 pt-[22px] pb-3 flex-shrink-0">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500">Section</p>
                  <h2 className="mt-0.5 text-[15px] font-black leading-tight text-white">
                    {currentSection!.label}
                  </h2>
                </div>
              </div>

              <div className="mx-4 mb-2 h-px bg-white/10 flex-shrink-0" />

              {/* Sub-items */}
              <nav className="relative flex-1 overflow-y-auto px-3 pb-3 admin-sidebar-scroll space-y-0.5" aria-label={`${currentSection!.label} navigation`}>
                {panelItems.map(child => {
                  const active = isPathActive(child.path);
                  return (
                    <Link
                      key={child.path}
                      to={child.path}
                      className={[
                        'flex min-h-[40px] items-center gap-2.5 rounded-xl px-3 py-2 text-[13px] font-semibold transition-all duration-150 active:scale-[0.98]',
                        active
                          ? 'bg-cyan-300/15 text-cyan-100 shadow-inner ring-1 ring-cyan-300/20'
                          : 'text-slate-300/80 hover:bg-white/[0.07] hover:text-white',
                      ].join(' ')}
                    >
                      <span
                        className={[
                          'material-symbols-outlined flex-shrink-0 text-[17px] transition',
                          active ? 'text-cyan-200' : 'text-slate-400',
                        ].join(' ')}
                        style={{
                          fontVariationSettings: active
                            ? "'FILL' 1, 'wght' 500, 'GRAD' 0, 'opsz' 24"
                            : undefined,
                        }}
                      >
                        {child.icon}
                      </span>
                      <span className="truncate leading-tight">{child.label}</span>
                      {active && (
                        <span className="ml-auto h-1.5 w-1.5 flex-shrink-0 rounded-full bg-cyan-300 shadow-[0_0_8px_rgba(165,243,252,0.9)]" />
                      )}
                    </Link>
                  );
                })}
              </nav>

              {/* System health card */}
              <div className="relative mx-3 mb-3 rounded-xl border border-white/10 bg-white/[0.05] p-3 shadow-inner flex-shrink-0">
                <div className="flex items-center justify-between gap-2">
                  <div>
                    <p className="text-[10px] font-medium text-slate-400">System health</p>
                    <p className="mt-0.5 text-lg font-black tabular-nums text-white">97.4%</p>
                  </div>
                  <div className="grid h-9 w-9 place-items-center rounded-lg bg-emerald-300/12 text-emerald-200">
                    <span className="material-symbols-outlined text-[20px]">monitoring</span>
                  </div>
                </div>
                <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-white/10">
                  <div className="h-full w-[97%] rounded-full bg-gradient-to-r from-emerald-300 via-cyan-300 to-amber-200" />
                </div>
              </div>

              {/* Admin footer */}
              <div className="relative mx-3 mb-4 rounded-xl border border-white/10 bg-white/[0.05] p-3 flex-shrink-0">
                <div className="flex items-center gap-2.5">
                  <div className="grid h-9 w-9 flex-shrink-0 place-items-center rounded-xl bg-gradient-to-br from-cyan-300/20 to-emerald-300/20 text-cyan-100">
                    <span className="material-symbols-outlined text-[18px]">verified_user</span>
                  </div>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-bold text-white">Admin Control</p>
                    <p className="truncate text-[11px] text-slate-400">Finance, AI, security</p>
                  </div>
                </div>
              </div>
            </>
          ) : (
            /* ── Panel EMPTY: elegant placeholder ────────────────────── */
            <div className="relative flex h-full flex-col items-center justify-center gap-3 px-4 text-center">
              <div className="grid h-14 w-14 place-items-center rounded-2xl bg-white/[0.05] ring-1 ring-white/10">
                <span className="material-symbols-outlined text-[28px] text-slate-500">
                  {currentSection?.icon ?? 'apps'}
                </span>
              </div>
              <div>
                <p className="text-sm font-bold text-slate-300">
                  {currentSection?.label ?? 'SmartLog AI'}
                </p>
                <p className="mt-1 text-[11px] text-slate-500">
                  {currentSection ? 'Direct navigation' : 'Select a section'}
                </p>
              </div>
            </div>
          )}
        </aside>
      </div>

      {/* ════════════════════════════════════════════════════════════════
          MOBILE: Bottom Navigation Bar
         ════════════════════════════════════════════════════════════════ */}
      <nav
        className="admin-mobile-nav fixed inset-x-3 bottom-3 z-50 grid grid-cols-5 gap-1 rounded-2xl border border-white/12 bg-slate-950/88 p-1.5 shadow-2xl shadow-slate-950/40 backdrop-blur-xl md:hidden"
        aria-label="Admin mobile navigation"
      >
        {MOBILE_ITEMS.map(item => {
          const active = isPathActive(item.path);
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

export default AdminSidebar;
