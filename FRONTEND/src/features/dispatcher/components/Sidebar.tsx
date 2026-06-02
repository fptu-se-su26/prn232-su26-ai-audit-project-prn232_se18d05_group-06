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
}

const MENU_ITEMS: MenuItem[] = [
  { name: 'Dashboard', label: 'Bảng điều khiển', icon: 'dashboard' },
  { name: 'Orders', label: 'Đơn hàng', icon: 'inventory_2' },
  { name: 'Route Planning', label: 'Lập lộ trình', icon: 'route' },
  { name: 'Assign Driver', label: 'Phân công tài xế', icon: 'person_add' },
  { name: 'Live Tracking', label: 'Theo dõi trực tuyến', icon: 'location_on' },
  { name: 'Drivers', label: 'Tài xế', icon: 'group' },
  { name: 'Vehicles', label: 'Phương tiện', icon: 'local_shipping' },
  { name: 'Fleet Monitoring', label: 'Giám sát đội xe', icon: 'monitor_heart' },
  { name: 'Alerts Center', label: 'Trung tâm cảnh báo', icon: 'warning' },
  { name: 'Delivery Analytics', label: 'Phân tích giao hàng', icon: 'analytics' },
  { name: 'Reports', label: 'Báo cáo', icon: 'assessment' },
  { name: 'Notifications', label: 'Thông báo', icon: 'notifications' },
  { name: 'Settings', label: 'Cài đặt', icon: 'settings' },
];

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  setActiveTab,
  isOpen = true,
  setIsOpen,
}) => {
  return (
    <>
      {isOpen && setIsOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm md:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      <nav
        className={`fixed left-0 top-0 h-full w-[240px] z-50 bg-surface dark:bg-surface border-r border-outline-variant/20 backdrop-blur-xl shadow-[0_0_15px_rgba(37,99,235,0.1)] flex flex-col py-panel-padding transition-transform duration-300 md:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="px-6 mb-8 flex justify-between items-center">
          <div>
            <h1 className="font-headline-sm text-headline-sm font-bold text-primary tracking-wide">
              SmartLog AI
            </h1>
            <p className="text-on-surface-variant text-[12px] mt-1 font-semibold flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-secondary animate-pulse inline-block"></span>
              Điều phối viên • Trực tuyến
            </p>
          </div>
          {setIsOpen && (
            <button
              onClick={() => setIsOpen(false)}
              className="md:hidden text-on-surface-variant hover:text-primary transition-colors p-1"
            >
              <span className="material-symbols-outlined text-[20px]">close</span>
            </button>
          )}
        </div>

        <div className="flex-1 overflow-y-auto px-2 space-y-1">
          {MENU_ITEMS.map((item) => {
            const isActive = activeTab === item.name;
            return (
              <button
                key={item.name}
                onClick={() => {
                  setActiveTab(item.name);
                  if (setIsOpen) setIsOpen(false);
                }}
                className={`w-full flex items-center px-4 py-3 gap-3 rounded-lg text-body-md transition-all duration-300 ${
                  isActive
                    ? 'border-l-4 border-primary bg-primary-container/10 text-primary shadow-[inset_10px_0_15px_-10px_rgba(37,99,235,0.5)] scale-[0.98]'
                    : 'text-on-surface-variant hover:bg-surface-variant/30 hover:text-primary'
                }`}
              >
                <span className="material-symbols-outlined text-[20px]">{item.icon}</span>
                <span className="font-medium tracking-wide">{item.label}</span>
              </button>
            );
          })}
        </div>
      </nav>
    </>
  );
};
