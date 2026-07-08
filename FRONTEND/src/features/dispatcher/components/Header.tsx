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
    <header className="fixed right-0 top-0 z-40 flex h-16 w-full items-center justify-between border-b border-slate-300/70 bg-white/88 px-4 shadow-sm backdrop-blur md:w-[calc(100%-264px)] lg:px-5">
      <div className="flex min-w-0 items-center gap-3">
        <button
          aria-label="Mở menu"
          onClick={onMenuToggle}
          className="rounded-md p-2 text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-950 md:hidden"
        >
          <span className="material-symbols-outlined text-[24px]">menu</span>
        </button>

        <div className="min-w-0">
          <div className="flex items-center gap-2 text-[12px] font-semibold text-slate-500">
            <span>Module M2/M3</span>
            <span className="h-1 w-1 rounded-full bg-slate-300" />
            <span>Điều phối xe & Dock</span>
          </div>
          <h2 className="truncate text-[18px] font-bold leading-tight text-slate-950 md:text-[20px]">
            {title}
          </h2>
        </div>
      </div>

      <div className="flex shrink-0 items-center gap-2 md:gap-3">
        <div className="relative hidden sm:block">
          <input
            className="ops-control h-10 w-56 rounded-md py-2 pl-10 pr-9 text-[14px] font-semibold placeholder:text-slate-400 lg:w-80"
            placeholder="Tìm booking, biển số, dock..."
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <span className="material-symbols-outlined pointer-events-none absolute left-3 top-2.5 text-[18px] text-slate-400">
            search
          </span>
          {searchQuery && (
            <button
              aria-label="Xóa tìm kiếm"
              onClick={() => setSearchQuery('')}
              className="absolute right-2.5 top-2.5 rounded text-slate-400 transition-colors hover:text-slate-950"
            >
              <span className="material-symbols-outlined text-[16px]">close</span>
            </button>
          )}
        </div>

        <button
          onClick={onAiAssistantClick}
          className="hidden h-10 items-center gap-2 rounded-md border border-cyan-200 bg-cyan-50 px-3 text-[13px] font-bold text-cyan-900 transition-colors hover:bg-cyan-100 lg:flex"
          title="Hỏi trợ lý AI"
        >
          <span className="material-symbols-outlined text-[18px]">smart_toy</span>
          AI gợi ý
        </button>

        <div className="relative">
          <button
            onClick={() => {
              setShowNotificationDropdown(!showNotificationDropdown);
              if (notificationsCount > 0) resetNotifications();
            }}
            className="relative grid h-10 w-10 place-items-center rounded-md border border-slate-200 bg-white text-slate-600 transition-colors hover:bg-slate-50 hover:text-slate-950"
            title="Thông báo"
          >
            <span className="material-symbols-outlined text-[22px]">notifications</span>
            {notificationsCount > 0 && (
              <span className="absolute right-2 top-2 h-2.5 w-2.5 rounded-full bg-rose-500 ring-2 ring-white" />
            )}
          </button>

          {showNotificationDropdown && (
            <div className="ops-panel-strong absolute right-0 mt-2 w-80 overflow-hidden rounded-lg">
              <div className="flex items-center justify-between border-b border-slate-200 px-4 py-3">
                <span className="text-[14px] font-bold text-slate-950">Thông báo vận hành</span>
                <button
                  onClick={() => setShowNotificationDropdown(false)}
                  className="rounded p-1 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-950"
                >
                  <span className="material-symbols-outlined text-[16px]">close</span>
                </button>
              </div>
              <div className="max-h-72 space-y-2 overflow-y-auto p-3">
                <div className="rounded-md border border-cyan-200 bg-cyan-50 p-3 text-left">
                  <p className="text-[13px] font-bold text-cyan-900">Telemetry đang hoạt động</p>
                  <p className="mt-1 text-[12px] leading-snug text-slate-600">
                    Dữ liệu xe, dock và cảnh báo SLA đang được cập nhật theo chu kỳ.
                  </p>
                </div>
                <div className="rounded-md border border-amber-200 bg-amber-50 p-3 text-left">
                  <p className="text-[13px] font-bold text-amber-900">Theo dõi Overstay Alert</p>
                  <p className="mt-1 text-[12px] leading-snug text-slate-600">
                    Màn hình điều phối sẽ nổi bật xe đang vượt thời gian lưu bãi theo SLA.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="hidden items-center gap-2 rounded-md border border-slate-200 bg-white px-2.5 py-1.5 md:flex">
          <div className="grid h-7 w-7 place-items-center rounded bg-[#0f3554] text-[12px] font-bold text-white">D</div>
          <div className="leading-tight">
            <p className="text-[12px] font-bold text-slate-950">Dispatcher</p>
            <p className="text-[11px] font-semibold text-slate-500">Ca vận hành</p>
          </div>
        </div>
      </div>
    </header>
  );
};
