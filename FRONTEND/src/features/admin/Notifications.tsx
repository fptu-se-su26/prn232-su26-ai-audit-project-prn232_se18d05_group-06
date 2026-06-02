import React from 'react';
import AdminSidebar from '@components/AdminSidebar';

const auditLogsData = [
  {
    userName: 'Sarah Jenkins',
    userEmail: 'sarah.j@smartlog.ai',
    userAvatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAQOHbD8-mF5zz9Xq1vt00fxaMDfNuUtDSDtesgyJW6noTTdIKvCNrdFMwLg8F-NpVlRwPUm0TRG81odJXhUDFXMd-FrzY9e0aPShn5-nUBGgXWP58-9cRwJR9Fqi_dBYR4OqiQsxK-yNz5fg4syrk9kl5EzD65SOjUU8HY00f9IzCp1sdE_FKyKqSaRBF_0AiTLJ_l3VpEl2u-upnXFWMKMHUPnfoo7LYzj2kH3MZoydf6w8IeRgyDAl1mxf3XvuDL3zvDvDpfThNS',
    actionName: 'Mass Deletion',
    actionColor: 'text-error',
    badgeText: 'Critical Risk',
    badgeColor: 'bg-error/10 text-error',
    badgeDotColor: 'bg-error',
    module: 'Fleet Management',
    ipAddress: '192.168.1.105',
    timestamp: 'Oct 24, 14:32:01',
    isInitials: false,
  },
  {
    userName: 'Marcus Chen',
    userEmail: 'm.chen@smartlog.ai',
    userAvatar: 'MC',
    actionName: 'Suspicious Login',
    actionColor: 'text-tertiary',
    badgeText: 'Unrecognized Device',
    badgeColor: 'bg-tertiary/10 text-tertiary',
    badgeDotColor: 'bg-tertiary',
    module: 'Authentication',
    ipAddress: '45.22.19.102',
    timestamp: 'Oct 24, 11:15:44',
    isInitials: true,
    initialsBg: 'bg-primary/10 text-primary',
  },
  {
    userName: 'David Kim',
    userEmail: 'david.k@smartlog.ai',
    userAvatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDIriyEmkEokf1WTGU7TmZCjFuGg7eZd07WG4WE1R7iqfO9NcgqKcqktYDSX-r-zAAp9-7OCOQsmSOx3e-q1d-RKigRtEEVEN7uBnVwHknu4DajNydPEsVGhjqc-38MLEQlXAMMuVd__msie2fwzq7lm12zZNdTvrC0vOGfVigDiZdwdicxIF3ORMQhwZhgbg-jGay_9LTmN2c-Zd5niStktmpEVWSf7OB0_53fz78UaQPdBdPzPlomzTHAzEgCrP1KCAHlA-vku2Q2',
    actionName: 'Update Configuration',
    actionColor: 'text-on-surface',
    badgeText: null,
    module: 'Warehouses',
    ipAddress: '10.0.0.42',
    timestamp: 'Oct 24, 09:45:12',
    isInitials: false,
  },
  {
    userName: 'System Process',
    userEmail: 'Automated Task',
    userAvatar: 'SYS',
    actionName: 'Data Sync Completed',
    actionColor: 'text-on-surface',
    badgeText: null,
    module: 'BI Analytics',
    ipAddress: 'localhost',
    timestamp: 'Oct 24, 03:00:00',
    isInitials: true,
    initialsBg: 'bg-secondary/10 text-secondary',
  },
  {
    userName: 'Elena Rodriguez',
    userEmail: 'elena.r@smartlog.ai',
    userAvatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBx3h7MlgGKEc0kCkmThoH2nKO2Y0g2X85AWn2FB6mO-VniExRZa-0E29mZKTBdiuvWPf4fmg0AFLBU-jXr6k6XiTS7eJEVDfEkrHRrlGBJ0AV2F51Er6gy1Gmn1WPr_yDGaO32tKwEKh6tTGS_0e5PjuMkxPk9viazd79e7obhHvbrgxUehGF1R-TejyaZAXeFVMA7_QBxVqSb-Ropb1FB9Lwh0WSMEVD8t5DBXdHuTq_vM7fzW16TN8MFMQT9cvj9DzhYU4JyXUyF',
    actionName: 'Report Generated',
    actionColor: 'text-on-surface',
    badgeText: null,
    module: 'Finance',
    ipAddress: '192.168.1.55',
    timestamp: 'Oct 23, 16:20:05',
    isInitials: false,
  },
];

const AdminNotifications: React.FC = () => {
  return (
    <div className="bg-background text-on-surface font-body-md text-body-md min-h-screen flex overflow-hidden">
      {/* SideNavBar */}
      <AdminSidebar />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col md:ml-[280px] w-full h-screen overflow-hidden relative">
        {/* Abstract Background */}
        <div className="absolute inset-0 z-0 pointer-events-none opacity-40">
          <div className="absolute top-[-10%] right-[-5%] w-[800px] h-[800px] rounded-full bg-primary-fixed/30 blur-[120px]"></div>
          <div className="absolute bottom-[-10%] left-[-10%] w-[600px] h-[600px] rounded-full bg-tertiary-fixed/20 blur-[100px]"></div>
        </div>

        {/* TopNavBar */}
        <header className="flex justify-between items-center w-full px-container-padding py-stack-md bg-surface/70 backdrop-blur-md sticky top-0 z-40 border-b border-outline-variant/20 shadow-sm">
          <h2 className="font-headline-md text-headline-md text-primary font-bold">SmartLog AI Operations Center</h2>
          <div className="flex items-center gap-6">
            <div className="relative hidden lg:block w-[300px]">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant">search</span>
              <input className="w-full h-[48px] pl-10 pr-4 rounded-[18px] bg-black/5 border-none focus:ring-2 focus:ring-primary/50 font-body-sm text-body-sm text-on-surface placeholder:text-on-surface-variant transition-all" placeholder="Search logs, IPs, or users..." type="text" />
            </div>
            <div className="flex items-center gap-4">
              <button className="text-on-surface-variant hover:text-primary transition-colors relative">
                <span className="material-symbols-outlined">notifications</span>
                <span className="absolute top-0 right-0 w-2 h-2 bg-error rounded-full"></span>
              </button>
              <button className="text-on-surface-variant hover:text-primary transition-colors">
                <img alt="Admin User Profile" className="w-8 h-8 rounded-full border border-outline-variant/30" src="https://lh3.googleusercontent.com/aida-public/AB6AXuBPe_5zWDB8TgB3p4KI7C0MRBHk2J_TLpRWYXbg7qJnw43EMfiePzygs9jvu47_1TQMzQ6Mpp4veqeIyUMQc8e-NjEpPGzp6NzEyyJLG9Jpw39_svnnCl2c3jUXE3yvDnbPJuVqLC-9OJosHA5AwcG7gwfxdN1aMWuwW546TqrWwDtbiaGo-BhRS0kfprai-rGgs-_2RkfTWjbKA46gG02Fv0B9AHpDV5noH2ncmNCD-xg453YHk_tkBKfhKJp9lLUmvVFh6Vo6D2vk" />
              </button>
            </div>
          </div>
        </header>

        {/* Main Scrollable Content */}
        <main className="flex-1 overflow-y-auto p-container-padding z-10 relative">
          <div className="max-w-[1600px] mx-auto space-y-stack-lg">
            {/* Header & Actions */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
              <div>
                {/* Note: In notifications.html this still said Audit Logs */}
                <h1 className="font-display-lg text-display-lg text-on-surface mb-2">Audit Logs</h1>
                <p className="font-body-lg text-body-lg text-on-surface-variant">Track system activities, security events, and administrative actions.</p>
              </div>
              <div className="flex gap-3">
                <button className="flex items-center gap-2 px-4 py-2 bg-surface/70 backdrop-blur-md border border-outline-variant/30 rounded-lg text-on-surface hover:bg-surface-variant transition-colors font-body-sm text-body-sm">
                  <span className="material-symbols-outlined text-[20px]">download</span>
                  Export CSV
                </button>
              </div>
            </div>

            {/* Advanced Filters */}
            <div className="rounded-[18px] p-stack-md flex flex-wrap gap-4 items-center" style={{ background: 'rgba(255, 255, 255, 0.7)', backdropFilter: 'blur(12px)', borderTop: '1px solid rgba(255, 255, 255, 0.3)', boxShadow: '0 10px 30px rgba(0, 0, 0, 0.04)' }}>
              <div className="flex-1 min-w-[200px]">
                <label className="block font-label-md text-label-md text-on-surface-variant mb-1 ml-1">Date Range</label>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-[20px]">calendar_today</span>
                  <input className="w-full h-[40px] pl-10 pr-4 rounded-lg bg-black/5 border-none focus:ring-2 focus:ring-primary/50 font-body-sm text-body-sm text-on-surface cursor-pointer" readOnly type="text" value="Last 7 Days" />
                </div>
              </div>
              <div className="flex-1 min-w-[200px]">
                <label className="block font-label-md text-label-md text-on-surface-variant mb-1 ml-1">Action Type</label>
                <select className="w-full h-[40px] px-4 rounded-lg bg-black/5 border-none focus:ring-2 focus:ring-primary/50 font-body-sm text-body-sm text-on-surface appearance-none cursor-pointer">
                  <option>All Actions</option>
                  <option>Authentication</option>
                  <option>Data Modification</option>
                  <option>System Configuration</option>
                </select>
              </div>
              <div className="flex-1 min-w-[200px]">
                <label className="block font-label-md text-label-md text-on-surface-variant mb-1 ml-1">Severity</label>
                <select className="w-full h-[40px] px-4 rounded-lg bg-black/5 border-none focus:ring-2 focus:ring-primary/50 font-body-sm text-body-sm text-on-surface appearance-none cursor-pointer">
                  <option>All Severities</option>
                  <option>Info</option>
                  <option>Warning</option>
                  <option>Critical</option>
                </select>
              </div>
              <div className="mt-5">
                <button className="h-[40px] px-4 bg-surface-variant rounded-lg text-on-surface hover:bg-outline-variant/30 transition-colors font-body-sm text-body-sm flex items-center gap-2">
                  <span className="material-symbols-outlined text-[20px]">filter_list</span>
                  More Filters
                </button>
              </div>
            </div>

            {/* AI Insights Section */}
            <div className="rounded-[18px] p-stack-md flex items-center gap-4 border-l-4 border-l-tertiary-fixed" style={{ background: 'rgba(255, 255, 255, 0.7)', backdropFilter: 'blur(12px)', borderTop: '1px solid rgba(255, 255, 255, 0.3)', boxShadow: '0 10px 30px rgba(0, 0, 0, 0.04)' }}>
              <div className="w-10 h-10 rounded-full bg-tertiary-container/10 flex items-center justify-center text-tertiary">
                <span className="material-symbols-outlined">smart_toy</span>
              </div>
              <div className="flex-1">
                <h4 className="font-headline-sm text-headline-sm text-on-surface">AI Security Insights</h4>
                <p className="font-body-sm text-body-sm text-on-surface-variant">Detected 2 anomalies in the last 24 hours. Recommended action: Review foreign IP logins.</p>
              </div>
              <button className="px-4 py-2 rounded-lg bg-tertiary text-white font-body-sm text-body-sm hover:opacity-90 transition-opacity">
                Review Now
              </button>
            </div>

            {/* Data Table Container */}
            <div className="rounded-[18px] overflow-hidden" style={{ background: 'rgba(255, 255, 255, 0.7)', backdropFilter: 'blur(12px)', borderTop: '1px solid rgba(255, 255, 255, 0.3)', boxShadow: '0 10px 30px rgba(0, 0, 0, 0.04)' }}>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-surface-variant/50 border-b border-outline-variant/20 font-label-md text-label-md text-on-surface-variant uppercase tracking-wider">
                      <th className="p-4 pl-6 font-medium">User</th>
                      <th className="p-4 font-medium">Action</th>
                      <th className="p-4 font-medium">Module</th>
                      <th className="p-4 font-medium">IP Address</th>
                      <th className="p-4 pr-6 font-medium">Timestamp</th>
                    </tr>
                  </thead>
                  <tbody className="font-body-sm text-body-sm text-on-surface">
                    {auditLogsData.map((log, index) => (
                      <tr key={index} className={`group hover:bg-surface-variant/30 transition-colors ${index !== auditLogsData.length - 1 ? 'border-b border-outline-variant/10' : ''}`}>
                        <td className="p-4 pl-6">
                          <div className="flex items-center gap-3">
                            {log.isInitials ? (
                              <div className={`w-8 h-8 rounded-full ${log.initialsBg} flex items-center justify-center font-medium`}>
                                {log.userAvatar}
                              </div>
                            ) : (
                              <img alt={log.userName} className="w-8 h-8 rounded-full" src={log.userAvatar} />
                            )}
                            <div>
                              <div className="font-medium">{log.userName}</div>
                              <div className="text-on-surface-variant text-[12px]">{log.userEmail}</div>
                            </div>
                          </div>
                        </td>
                        <td className="p-4">
                          <div className="flex flex-col gap-1">
                            <span className={`font-medium ${log.actionColor}`}>{log.actionName}</span>
                            {log.badgeText && (
                              <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium w-max ${log.badgeColor}`}>
                                <span className={`w-1.5 h-1.5 rounded-full mr-1 ${log.badgeDotColor}`}></span> {log.badgeText}
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="p-4">{log.module}</td>
                        <td className="p-4 font-label-md text-label-md text-on-surface-variant">{log.ipAddress}</td>
                        <td className="p-4 pr-6 text-on-surface-variant whitespace-nowrap">{log.timestamp}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              <div className="p-4 border-t border-outline-variant/20 flex items-center justify-between bg-surface-variant/20">
                <span className="font-body-sm text-body-sm text-on-surface-variant">Showing 1 to 5 of 2,451 entries</span>
                <div className="flex gap-2">
                  <button className="w-8 h-8 flex items-center justify-center rounded border border-outline-variant/30 text-on-surface-variant hover:bg-surface-variant transition-colors disabled:opacity-50" disabled>
                    <span className="material-symbols-outlined text-[20px]">chevron_left</span>
                  </button>
                  <button className="w-8 h-8 flex items-center justify-center rounded bg-primary text-white font-medium text-sm">1</button>
                  <button className="w-8 h-8 flex items-center justify-center rounded border border-outline-variant/30 text-on-surface hover:bg-surface-variant transition-colors text-sm">2</button>
                  <button className="w-8 h-8 flex items-center justify-center rounded border border-outline-variant/30 text-on-surface hover:bg-surface-variant transition-colors text-sm">3</button>
                  <span className="w-8 h-8 flex items-center justify-center text-on-surface-variant text-sm">...</span>
                  <button className="w-8 h-8 flex items-center justify-center rounded border border-outline-variant/30 text-on-surface hover:bg-surface-variant transition-colors">
                    <span className="material-symbols-outlined text-[20px]">chevron_right</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminNotifications;
