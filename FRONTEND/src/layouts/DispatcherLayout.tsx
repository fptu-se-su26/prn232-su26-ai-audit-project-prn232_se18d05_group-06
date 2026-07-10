import React from 'react';
import { Sidebar } from '@features/dispatcher/components/Sidebar';
import { Header } from '@features/dispatcher/components/Header';

interface DispatcherLayoutProps {
  children: React.ReactNode;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  notificationsCount: number;
  resetNotifications: () => void;
  onAiAssistantClick?: () => void;
}

export const DispatcherLayout: React.FC<DispatcherLayoutProps> = ({
  children,
  activeTab,
  setActiveTab,
  sidebarOpen,
  setSidebarOpen,
  searchQuery,
  setSearchQuery,
  notificationsCount,
  resetNotifications,
  onAiAssistantClick,
}) => {
  const tabLabels: Record<string, string> = {
    Dashboard: 'Tổng quan bãi xe',
    Orders: 'Đơn & lịch xe',
    'Route Planning': 'Lập lộ trình',
    'Assign Driver': 'Điều phối Dock',
    'Live Tracking': 'Theo dõi realtime',
    'Alerts Center': 'Overstay Alert',
    Vehicles: 'Hồ sơ xe',
    Drivers: 'Tài xế',
    'Vehicle Tracking': 'Lịch sử & Chuyến xe',
    'Fleet Monitoring': 'Sức khỏe đội xe',
    Reports: 'Báo cáo vận hành',
    'Delivery Analytics': 'Hiệu suất giao hàng',
    Notifications: 'Thông báo',
    Settings: 'Thiết lập',
  };

  const headerTitle = tabLabels[activeTab] || activeTab;

  return (
    <div className="dark dispatcher-dark-theme bg-[#051424] text-[#d4e4fa] dispatcher-shell relative flex h-screen w-screen overflow-hidden font-body-md text-[15px]">
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        isOpen={sidebarOpen}
        setIsOpen={setSidebarOpen}
      />

      <Header
        title={headerTitle}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        onMenuToggle={() => setSidebarOpen(true)}
        notificationsCount={notificationsCount}
        resetNotifications={resetNotifications}
        onAiAssistantClick={onAiAssistantClick}
      />

      <main className="relative z-10 mt-16 flex h-[calc(100vh-64px)] min-h-0 min-w-0 flex-1 flex-col gap-4 overflow-y-auto overflow-x-hidden p-4 pb-8 md:ml-[264px] lg:p-5 lg:pb-10">
        {children}
      </main>
    </div>
  );
};

export default DispatcherLayout;
