import React from 'react';

interface MaintenanceEvent {
  id: string;
  type: string;
  date: string;
  status: 'COMPLETED' | 'PENDING' | 'OVERDUE';
  notes: string;
}

interface MaintenanceTimelineProps {
  events: MaintenanceEvent[];
}

const getStatusColor = (status: string) => {
  switch (status) {
    case 'COMPLETED': return 'bg-[#4cd7f6] text-[#005e6e] border-[#4cd7f6]/30';
    case 'PENDING': return 'bg-tertiary/20 text-tertiary border-tertiary/30';
    case 'OVERDUE': return 'bg-error/20 text-error border-error/30';
    default: return 'bg-surface-variant text-on-surface border-outline/30';
  }
};

const getStatusDot = (status: string) => {
  switch (status) {
    case 'COMPLETED': return 'bg-[#4cd7f6]';
    case 'PENDING': return 'bg-tertiary';
    case 'OVERDUE': return 'bg-error';
    default: return 'bg-outline';
  }
};

export const MaintenanceTimeline: React.FC<MaintenanceTimelineProps> = ({ events }) => {
  return (
    <div className="glass-card p-6" style={{ background: 'rgba(255, 255, 255, 0.7)', backdropFilter: 'blur(12px)', borderTop: '1px solid rgba(255, 255, 255, 0.3)', borderLeft: '1px solid rgba(255, 255, 255, 0.2)', boxShadow: '0 10px 30px rgba(0, 0, 0, 0.04)', borderRadius: '18px' }}>
      <h3 className="font-headline-sm text-headline-sm font-semibold mb-4 text-on-surface">Maintenance History</h3>
      
      <div className="relative border-l border-outline-variant/40 ml-3 pl-6 space-y-6">
        {events.map((event, index) => (
          <div key={event.id || index} className="relative">
            {/* Timeline Dot */}
            <div className={`absolute -left-[31px] top-1 w-3 h-3 rounded-full ${getStatusDot(event.status)} ring-4 ring-white/80`}></div>
            
            <div className="bg-white/50 rounded-xl p-4 border border-white/60 shadow-sm hover:bg-white/80 transition-colors">
              <div className="flex justify-between items-start mb-2">
                <h4 className="font-title-md text-title-md font-bold text-on-surface">{event.type}</h4>
                <span className={`px-2 py-0.5 rounded font-label-md text-[11px] border ${getStatusColor(event.status)}`}>
                  {event.status}
                </span>
              </div>
              
              <div className="flex items-center gap-2 text-on-surface-variant font-body-sm text-body-sm mb-2">
                <span className="material-symbols-outlined text-[16px]">calendar_today</span>
                <span>{event.date}</span>
              </div>
              
              {event.notes && (
                <p className="font-body-sm text-body-sm text-on-surface mt-2 bg-surface-container-low/50 p-2 rounded-lg italic border border-outline-variant/20">
                  "{event.notes}"
                </p>
              )}
            </div>
          </div>
        ))}
      </div>
      
      {events.length === 0 && (
        <div className="text-center py-6 text-on-surface-variant font-body-md">
          No maintenance records found.
        </div>
      )}
    </div>
  );
};
