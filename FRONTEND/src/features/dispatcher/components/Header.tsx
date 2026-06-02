import React, { useState } from 'react';

interface HeaderProps {
  title: string;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  onMenuToggle: () => void;
  notificationsCount: number;
  resetNotifications: () => void;
  onAiAssistantClick?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  title,
  searchQuery,
  setSearchQuery,
  onMenuToggle,
  notificationsCount,
  resetNotifications,
  onAiAssistantClick,
}) => {
  const [showNotificationDropdown, setShowNotificationDropdown] = useState(false);

  return (
    <header className="fixed top-0 right-0 w-full md:w-[calc(100%-240px)] h-16 z-40 bg-surface/60 dark:bg-surface/60 backdrop-blur-md border-b border-outline-variant/10 shadow-sm flex justify-between items-center px-4 md:px-margin-desktop">
      <div className="flex items-center gap-3">
        <button
          onClick={onMenuToggle}
          className="md:hidden text-on-surface-variant hover:text-primary transition-colors p-2"
        >
          <span className="material-symbols-outlined text-[24px]">menu</span>
        </button>
        <h2 className="font-headline-md text-[18px] md:text-headline-md font-bold text-on-surface truncate">
          {title}
        </h2>
      </div>

      <div className="flex items-center gap-3 md:gap-4 shrink-0">
        <div className="relative hidden sm:block">
          <input
            className="bg-black/25 border border-outline-variant/30 text-on-surface font-data-tabular text-data-tabular rounded-full py-2 pl-10 pr-4 w-48 lg:w-64 focus:outline-none focus:ring-1 focus:ring-secondary/50 focus:border-secondary/50 transition-all placeholder-on-surface-variant/50"
            placeholder="Tìm kiếm đơn hàng, tài xế..."
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <span className="material-symbols-outlined absolute left-3 top-2.5 text-on-surface-variant text-[18px] pointer-events-none">
            search
          </span>
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-2.5 text-on-surface-variant hover:text-error transition-colors"
            >
              <span className="material-symbols-outlined text-[16px]">close</span>
            </button>
          )}
        </div>

        <div className="relative">
          <button
            onClick={() => {
              setShowNotificationDropdown(!showNotificationDropdown);
              if (notificationsCount > 0) {
                resetNotifications();
              }
            }}
            className="text-on-surface-variant hover:text-secondary p-1.5 rounded-full hover:bg-surface-variant/20 transition-all relative"
            title="Thông báo"
          >
            <span className="material-symbols-outlined text-[22px]">notifications</span>
            {notificationsCount > 0 && (
              <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-error rounded-full animate-pulse ring-2 ring-surface"></span>
            )}
          </button>

          {showNotificationDropdown && (
            <div className="absolute right-0 mt-2 w-80 glass-panel rounded-lg overflow-hidden z-50 border border-outline-variant/30 shadow-2xl animate-fade-in">
              <div className="p-3 border-b border-white/10 flex justify-between items-center bg-surface/80">
                <span className="font-semibold text-body-md text-primary">Thông báo</span>
                <button
                  onClick={() => setShowNotificationDropdown(false)}
                  className="text-on-surface-variant hover:text-error"
                >
                  <span className="material-symbols-outlined text-[16px]">close</span>
                </button>
              </div>
              <div className="max-h-64 overflow-y-auto p-2 space-y-1.5">
                <div className="p-2.5 bg-primary-container/10 border border-primary/20 rounded hover:bg-primary-container/15 transition-all text-left">
                  <p className="text-[12px] font-semibold text-primary">SmartLog Live Telemetry</p>
                  <p className="text-[11px] text-on-surface-variant mt-0.5">Trình mô phỏng thời gian thực đang hoạt động. Đang theo dõi sự kiện điều phối...</p>
                </div>
                <div className="p-2.5 bg-error/10 border border-error/20 rounded hover:bg-error/15 transition-all text-left">
                  <p className="text-[12px] font-semibold text-error">Cảnh báo Trễ hạn</p>
                  <p className="text-[11px] text-on-surface-variant mt-0.5">Đơn hàng #ORD-7731C đang bị kẹt xe. Thời gian dự kiến (ETA) tăng.</p>
                </div>
              </div>
            </div>
          )}
        </div>

        <button
          onClick={onAiAssistantClick}
          className="text-on-surface-variant hover:text-secondary p-1.5 rounded-full hover:bg-surface-variant/20 transition-all"
          title="Hỏi Trợ lý AI"
        >
          <span className="material-symbols-outlined text-[22px]">smart_toy</span>
        </button>

        <div className="w-8 h-8 rounded-full bg-surface-variant border border-outline-variant overflow-hidden ml-1 hover:ring-2 hover:ring-secondary/50 transition-all cursor-pointer">
          <img
            alt="User Avatar"
            className="w-full h-full object-cover"
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuBCEllfmv5du0bX7Z3NvSYPH-Htk1GoVEGbJ4S7xTPS6KLdxDKrJ7fHHl3tRIuK7flYpZByJmTZx6zlrZuQ9uUH1P_gfR2GPOqhz3ChcDDi5-TYBDpNexnOZI8jCeardPidbUJzsF5gebjAd0vX_jw6UVxvfsG_eqT35-kWU7NrttIHv9yHp-FP081ytS3JKXS2AeU5KrCaFYWkWUBffAgSg5rp_8wpoL0-rRRyo-EwEV5bEfMsBb7NZNFZ7z8xoc6UbrnWpH46r2Mq"
          />
        </div>
      </div>
    </header>
  );
};
