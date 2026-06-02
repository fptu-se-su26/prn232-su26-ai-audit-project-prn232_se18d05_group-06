import React from 'react';

interface AlertNotification {
  id: string;
  title: string;
  description: string;
  time: string;
  type: 'info' | 'success' | 'warning' | 'error';
}

interface AlertsTabProps {
  alerts: AlertNotification[];
  onClearAlerts: () => void;
}

export const AlertsTab: React.FC<AlertsTabProps> = ({
  alerts,
  onClearAlerts,
}) => {
  return (
    <div className="space-y-6">
      <div className="bg-white p-5 rounded-2xl border border-[#c3c6d7] shadow-sm">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-[#191c1e] flex items-center gap-2 font-headline-md">
            <span className="material-symbols-outlined text-[#ba1a1a]">notifications</span>
            Trung tâm thông báo ({alerts.length})
          </h2>
          {alerts.length > 0 && (
            <button 
              onClick={onClearAlerts}
              className="text-xs text-gray-500 hover:text-red-500 font-bold hover:underline font-label-md"
            >
              Xóa tất cả
            </button>
          )}
        </div>
        
        {alerts.length === 0 ? (
          <div className="text-center py-12 text-gray-400 font-semibold flex flex-col items-center select-none">
            <span className="material-symbols-outlined text-[48px] text-gray-300 mb-2">notifications_off</span>
            Không có thông báo nào mới.
          </div>
        ) : (
          <div className="space-y-3">
            {alerts.map((alert) => (
              <div 
                key={alert.id}
                className={`p-4 rounded-xl border flex gap-3 shadow-sm transition-all hover:translate-x-1 ${
                  alert.type === 'error' 
                    ? 'border-red-200 bg-red-50/50' 
                    : alert.type === 'warning' 
                    ? 'border-amber-200 bg-amber-50/50' 
                    : alert.type === 'success' 
                    ? 'border-emerald-200 bg-emerald-50/50' 
                    : 'border-blue-100 bg-blue-50/50'
                }`}
              >
                <span className={`material-symbols-outlined shrink-0 text-[24px] ${
                  alert.type === 'error' 
                    ? 'text-red-500 fill' 
                    : alert.type === 'warning' 
                    ? 'text-amber-600 fill' 
                    : alert.type === 'success' 
                    ? 'text-emerald-500 fill' 
                    : 'text-blue-500 fill'
                }`}>
                  {alert.type === 'error' ? 'error' : alert.type === 'warning' ? 'warning' : alert.type === 'success' ? 'check_circle' : 'info'}
                </span>
                <div className="flex-1">
                  <div className="flex justify-between items-start gap-2 mb-0.5">
                    <h4 className="font-bold text-sm text-[#191c1e] font-headline-md">{alert.title}</h4>
                    <span className="text-[10px] font-bold text-gray-400 whitespace-nowrap font-label-md">{alert.time}</span>
                  </div>
                  <p className="text-xs text-[#434655] font-medium leading-relaxed font-body-md">{alert.description}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
