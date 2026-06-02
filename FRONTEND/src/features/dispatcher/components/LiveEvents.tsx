import React from 'react';
import { LiveEvent } from '@/types/dispatcher';

interface LiveEventsProps {
  events: LiveEvent[];
}

export const LiveEvents: React.FC<LiveEventsProps> = ({ events }) => {
  return (
    <div className="glass-panel rounded-lg flex flex-col flex-1 overflow-hidden transition-all duration-300">
      <div className="p-4 border-b border-white/10 flex justify-between items-center bg-surface/40 shrink-0">
        <h3 className="font-headline-sm text-[15px] font-semibold text-on-surface flex items-center gap-2">
          <span className="material-symbols-outlined text-[18px] text-primary">history</span>
          Sự kiện Trực tiếp
        </h3>
        <span className="text-[10px] text-on-surface-variant font-data-tabular bg-white/5 border border-white/15 px-2 py-0.5 rounded select-none">
          {events.length} nhật ký
        </span>
      </div>

      <div className="flex-1 overflow-y-auto p-4 relative min-h-0">
        {events.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center py-8">
            <span className="material-symbols-outlined text-[28px] text-on-surface-variant/40 mb-2">
              event_busy
            </span>
            <p className="text-[12px] text-on-surface-variant">Không có sự kiện gần đây</p>
          </div>
        ) : (
          <>
            <div className="absolute left-[27px] top-6 bottom-6 w-px bg-outline-variant/30" />

            <div className="flex flex-col gap-5 relative z-10">
              {events.map((event, index) => {
                let dotColor = 'bg-primary';
                if (event.type === 'success') dotColor = 'bg-secondary';
                if (event.type === 'error' || event.type === 'warning') dotColor = 'bg-error';
                if (index > 2) dotColor = 'bg-outline-variant';

                return (
                  <div
                    key={event.id}
                    className={`flex items-start gap-4 transition-all duration-500 animate-slide-up ${
                      index > 2 ? 'opacity-55 hover:opacity-100' : 'opacity-100'
                    }`}
                  >
                    <div className="relative flex items-center justify-center mt-1.5 shrink-0">
                      <div className={`w-[10px] h-[10px] rounded-full ${dotColor} ring-4 ring-surface z-10`} />
                      {index === 0 && (
                        <div className={`absolute w-4 h-4 rounded-full pulse-marker ${
                          event.type === 'success' ? 'bg-secondary/35' : event.type === 'error' ? 'bg-error/35' : 'bg-primary/35'
                        }`} />
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <p className="text-[13px] text-on-surface font-semibold leading-snug">
                        {event.title}
                      </p>
                      <p className="text-[11px] text-on-surface-variant mt-0.5 leading-relaxed">
                        {event.description}
                      </p>
                      <span className="text-[10px] text-primary/70 font-data-tabular block mt-1">
                        {event.timestamp}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>
    </div>
  );
};
