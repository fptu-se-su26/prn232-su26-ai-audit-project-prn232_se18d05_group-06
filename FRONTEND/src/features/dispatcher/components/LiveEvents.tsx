import React from 'react';
import { LiveEvent } from '@/types/dispatcher';

interface LiveEventsProps {
  events: LiveEvent[];
}

const eventTone = (type: LiveEvent['type']) => {
  if (type === 'success') {
    return {
      dot: 'bg-emerald-500',
      text: 'text-emerald-800',
      border: 'border-emerald-200',
      panel: 'bg-emerald-50',
    };
  }

  if (type === 'error' || type === 'warning') {
    return {
      dot: 'bg-rose-500',
      text: 'text-rose-800',
      border: 'border-rose-200',
      panel: 'bg-rose-50',
    };
  }

  return {
    dot: 'bg-cyan-500',
    text: 'text-cyan-900',
    border: 'border-cyan-200',
    panel: 'bg-cyan-50',
  };
};

export const LiveEvents: React.FC<LiveEventsProps> = ({ events }) => {
  return (
    <div className="ops-panel-strong flex flex-1 flex-col overflow-hidden rounded-lg">
      <div className="flex shrink-0 items-center justify-between border-b border-slate-200 px-4 py-3">
        <div>
          <h3 className="flex items-center gap-2 text-[15px] font-bold text-slate-950">
            <span className="material-symbols-outlined text-[18px] text-[#0f6b7d]">history</span>
            Nhật ký vận hành (Mô phỏng)
          </h3>
          <p className="mt-0.5 text-[12px] font-semibold text-slate-500">Audit timeline trong ca</p>
        </div>
        <span className="rounded-md border border-slate-200 bg-slate-50 px-2 py-1 text-[11px] font-bold text-slate-600">
          {events.length} dòng
        </span>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto p-4">
        {events.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center rounded-md border border-dashed border-slate-300 py-8 text-center">
            <span className="material-symbols-outlined mb-2 text-[28px] text-slate-300">event_busy</span>
            <p className="text-[13px] font-semibold text-slate-500">Chưa có sự kiện trong ca.</p>
          </div>
        ) : (
          <div className="relative space-y-4">
            <div className="absolute bottom-2 left-[5px] top-2 w-px bg-slate-200" />
            {events.map((event, index) => {
              const tone = eventTone(event.type);

              return (
                <div key={event.id} className={`relative flex gap-3 ${index > 3 ? 'opacity-70' : ''}`}>
                  <span className={`relative z-10 mt-1.5 h-2.5 w-2.5 shrink-0 rounded-full ${tone.dot}`} />
                  <div className={`flex-1 rounded-md border ${tone.border} ${tone.panel} p-3`}>
                    <p className={`text-[13px] font-bold ${tone.text}`}>{event.title}</p>
                    <p className="mt-1 text-[12px] leading-snug text-slate-600">{event.description}</p>
                    <p className="mt-2 font-data-tabular text-[11px] font-semibold text-slate-500">{event.timestamp}</p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
