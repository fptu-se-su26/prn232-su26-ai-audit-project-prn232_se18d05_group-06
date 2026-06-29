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
    'Dashboard': 'Bảng điều khiển',
    'Orders': 'Đơn hàng',
    'Route Planning': 'Lập lộ trình',
    'Assign Driver': 'Phân công tài xế',
    'Live Tracking': 'Theo dõi trực tuyến',
    'Drivers': 'Tài xế',
    'Vehicles': 'Phương tiện',
    'Vehicle Tracking': 'Lịch sử & Chuyến xe',
    'Fleet Monitoring': 'Giám sát đội xe',
    'Alerts Center': 'Trung tâm cảnh báo',
    'Delivery Analytics': 'Phân tích giao hàng',
    'Reports': 'Báo cáo',
    'Notifications': 'Thông báo',
    'Settings': 'Cài đặt',
  };

  const headerTitle =
    activeTab === 'Dashboard'
      ? 'Hoạt động Logistics Thời gian thực'
      : `Trung tâm Điều khiển ${tabLabels[activeTab] || activeTab}`;

  return (
    <div className="dark dispatcher-dark-theme bg-[#051424] text-[#d4e4fa] h-screen w-screen overflow-hidden flex font-body-md relative text-body-md">
      {/* Side Navigation Sidebar */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        isOpen={sidebarOpen}
        setIsOpen={setSidebarOpen}
      />

      {/* Top Header Navbar */}
      <Header
        title={headerTitle}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        onMenuToggle={() => setSidebarOpen(true)}
        notificationsCount={notificationsCount}
        resetNotifications={resetNotifications}
        onAiAssistantClick={onAiAssistantClick}
      />

      {/* Main Content Layout Wrapper */}
      <main className="flex-1 relative z-10 md:ml-[240px] mt-16 p-4 md:p-margin-desktop h-[calc(100vh-64px)] overflow-hidden flex flex-col gap-gutter">
        {children}
      </main>
    </div>
  );
};
export default DispatcherLayout;
