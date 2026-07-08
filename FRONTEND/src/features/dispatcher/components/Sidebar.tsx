import React from 'react';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  isOpen?: boolean;
  setIsOpen?: (open: boolean) => void;
}

interface MenuItem {
  name: string;
  label: string;
  icon: string;
  group: 'Vận hành' | 'Đội xe' | 'Phân tích';
  badge?: string;
}

const MENU_ITEMS: MenuItem[] = [
  { name: 'Dashboard', label: 'Tổng quan bãi xe', icon: 'space_dashboard', group: 'Vận hành' },
  { name: 'Orders', label: 'Đơn & lịch xe', icon: 'inventory_2', group: 'Vận hành' },
  { name: 'Route Planning', label: 'Lập lộ trình', icon: 'route', group: 'Vận hành' },
  { name: 'Assign Driver', label: 'Điều phối Dock', icon: 'assignment_ind', group: 'Vận hành' },
  { name: 'Live Tracking', label: 'Theo dõi realtime', icon: 'near_me', group: 'Vận hành' },
  { name: 'Alerts Center', label: 'Overstay Alert', icon: 'release_alert', group: 'Vận hành', badge: 'SLA' },
  { name: 'Vehicles', label: 'Hồ sơ xe', icon: 'local_shipping', group: 'Đội xe' },
  { name: 'Drivers', label: 'Tài xế', icon: 'groups', group: 'Đội xe' },
  { name: 'Vehicle Tracking', label: 'Lịch sử & Chuyến xe', icon: 'history_toggle_off', group: 'Đội xe' },
  { name: 'Fleet Monitoring', label: 'Sức khỏe đội xe', icon: 'monitor_heart', group: 'Đội xe' },
  { name: 'Reports', label: 'Báo cáo vận hành', icon: 'query_stats', group: 'Phân tích' },
  { name: 'Delivery Analytics', label: 'Hiệu suất giao hàng', icon: 'analytics', group: 'Phân tích' },
  { name: 'Notifications', label: 'Thông báo', icon: 'notifications', group: 'Phân tích' },
  { name: 'Settings', label: 'Thiết lập', icon: 'tune', group: 'Phân tích' },
];

const GROUPS: MenuItem['group'][] = ['Vận hành', 'Đội xe', 'Phân tích'];

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  setActiveTab,
  isOpen = true,
  setIsOpen,
}) => {
  return (
    <>
      {isOpen && setIsOpen && (
        <button
          aria-label="Đóng menu"
          className="fixed inset-0 z-40 bg-slate-950/45 backdrop-blur-sm md:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      <nav
        className={`fixed left-0 top-0 z-50 flex h-full w-[264px] flex-col border-r border-slate-300/70 bg-[#f8fbfd] shadow-[12px_0_34px_rgba(33,53,71,0.12)] transition-transform duration-200 md:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="border-b border-slate-200 px-5 py-5">
          <div className="flex items-start justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <span className="grid h-9 w-9 place-items-center rounded-lg bg-[#0f3554] text-white">
                  <span className="material-symbols-outlined text-[20px]">hub</span>
                </span>
                <div>
                  <h1 className="text-[18px] font-bold leading-tight text-slate-950">SmartLog AI</h1>
                  <p className="text-[11px] font-semibold text-slate-500">Dispatcher Console</p>
                </div>
              </div>
              <div className="mt-4 flex items-center gap-2 rounded-md border border-emerald-200 bg-emerald-50 px-2.5 py-1.5 text-[12px] font-semibold text-emerald-800">
                <span className="status-dot bg-emerald-500" />
                Trực tuyến
              </div>
            </div>

            {setIsOpen && (
              <button
                aria-label="Đóng menu"
                onClick={() => setIsOpen(false)}
                className="rounded-md p-1 text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-950 md:hidden"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            )}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-3 py-4">
          {GROUPS.map((group) => (
            <div key={group} className="mb-5">
              <p className="mb-2 px-2 text-[11px] font-bold text-slate-500">{group}</p>
              <div className="space-y-1">
                {MENU_ITEMS.filter((item) => item.group === group).map((item) => {
                  const isActive = activeTab === item.name;
                  return (
                    <button
                      key={item.name}
                      onClick={() => {
                        setActiveTab(item.name);
                        if (setIsOpen) setIsOpen(false);
                      }}
                      className={`group flex min-h-11 w-full items-center gap-3 rounded-md px-3 py-2.5 text-left text-[14px] font-semibold transition-colors ${
                        isActive
                          ? 'bg-[#0f3554] text-white shadow-sm'
                          : 'text-slate-600 hover:bg-slate-100 hover:text-slate-950'
                      }`}
                    >
                      <span className={`material-symbols-outlined text-[20px] ${isActive ? 'text-cyan-200' : 'text-slate-400 group-hover:text-[#0f3554]'}`}>
                        {item.icon}
                      </span>
                      <span className="min-w-0 flex-1 truncate">{item.label}</span>
                      {item.badge && (
                        <span className={`rounded px-1.5 py-0.5 text-[10px] font-bold ${isActive ? 'bg-white/15 text-white' : 'bg-amber-100 text-amber-800'}`}>
                          {item.badge}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        <div className="border-t border-slate-200 p-4">
          <div className="rounded-lg border border-slate-200 bg-white p-3">
            <div className="flex items-center justify-between text-[12px] font-semibold text-slate-600">
              <span>Chu kỳ làm mới</span>
              <span className="font-data-tabular text-[#0f6b7d]">10s</span>
            </div>
            <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-slate-100">
              <div className="h-full w-4/5 rounded-full bg-[#0f6b7d]" />
            </div>
          </div>
        </div>
      </nav>
    </>
  );
};

export default Sidebar;
