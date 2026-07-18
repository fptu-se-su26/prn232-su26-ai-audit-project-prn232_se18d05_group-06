import React, { useEffect, useState } from 'react';
import AdminSidebar from '@components/AdminSidebar';
import UserProfileWidget from '@components/UserProfileWidget';
import api from '@lib/api';

interface AuditLogItem {
  logId: number;
  userId: number | null;
  userName: string;
  userEmail: string;
  action?: string | null;
  tableName?: string | null;
  recordId?: string | null;
  ipAddress?: string | null;
  loggedAt?: string | null;
}

// Parse username from action string like "admin: Updated user..."
const parseUsernameFromAction = (action: string | null | undefined): string => {
  if (!action) return 'System';
  const colonIdx = action.indexOf(':');
  if (colonIdx > 0) return action.substring(0, colonIdx).trim();
  return 'System';
};

// Deterministic color based on username for avatar
const getAvatarColor = (name: string): string => {
  const colors = ['bg-blue-500', 'bg-green-500', 'bg-purple-500', 'bg-yellow-500', 'bg-pink-500', 'bg-indigo-500', 'bg-teal-500', 'bg-orange-500'];
  return colors[name.charCodeAt(0) % colors.length] || 'bg-blue-500';
};

const AdminAuditLog: React.FC = () => {
  const [auditLogs, setAuditLogs] = useState<AuditLogItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Filter states
  const [dateRange, setDateRange] = useState('Last 7 Days');
  const [actionType, setActionType] = useState('All Actions');
  const [entityType, setEntityType] = useState('All Tables');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    const loadAuditLogs = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const params = new URLSearchParams();
        params.append('limit', '50');
        
        if (actionType !== 'All Actions') {
          params.append('action', actionType);
        }
        
        if (entityType !== 'All Tables') {
          params.append('tableName', entityType);
        }
        
        // Calculate date range
        if (dateRange === 'Last 7 Days') {
          const startDate = new Date();
          startDate.setDate(startDate.getDate() - 7);
          params.append('startDate', startDate.toISOString());
        } else if (dateRange === 'Last 30 Days') {
          const startDate = new Date();
          startDate.setDate(startDate.getDate() - 30);
          params.append('startDate', startDate.toISOString());
        }

        const response = await api.get<AuditLogItem[]>(`/auditlog?${params.toString()}`);
        setAuditLogs(
          response.data.map((log) => ({
            ...log,
            loggedAt: log.loggedAt ? new Date(log.loggedAt).toLocaleString() : null,
          }))
        );
        setTotalPages(Math.ceil(response.data.length / 50));
      } catch (err: any) {
        setError(err.response?.data?.message || err.message || 'Không tải được nhật ký.');
      } finally {
        setIsLoading(false);
      }
    };

    loadAuditLogs();
  }, [dateRange, actionType, entityType, currentPage]);

  return (
    <div className="bg-background text-on-surface font-body-md text-body-md min-h-screen flex overflow-hidden">
      <AdminSidebar />
      <div className="flex-1 flex flex-col md:ml-[280px] w-full h-screen overflow-hidden relative">
        <div className="absolute inset-0 z-0 pointer-events-none opacity-40">
          <div className="absolute top-[-10%] right-[-5%] w-[800px] h-[800px] rounded-full bg-primary-fixed/30 blur-[120px]"></div>
          <div className="absolute bottom-[-10%] left-[-10%] w-[600px] h-[600px] rounded-full bg-tertiary-fixed/20 blur-[100px]"></div>
        </div>

        <header className="flex justify-between items-center w-full px-container-padding py-stack-md bg-surface/70 backdrop-blur-md sticky top-0 z-40 border-b border-outline-variant/20 shadow-sm">
          <div>
            <p className="text-sm text-on-surface-variant">Admin / Security</p>
            <h2 className="font-headline-md text-headline-md text-primary font-bold">Audit Logs</h2>
          </div>
          <div className="flex items-center gap-4">
            <div className="relative hidden lg:block w-[300px]">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant">search</span>
              <input className="w-full h-[48px] pl-10 pr-4 rounded-[18px] bg-black/5 border-none focus:ring-2 focus:ring-primary/50 font-body-sm text-body-sm text-on-surface placeholder:text-on-surface-variant transition-all" placeholder="Search logs, IPs, or users..." type="text" />
            </div>
            <button className="text-on-surface-variant hover:text-primary transition-colors relative">
              <span className="material-symbols-outlined">notifications</span>
              <span className="absolute top-0 right-0 w-2 h-2 bg-error rounded-full"></span>
            </button>
            <UserProfileWidget avatarOnly={true} />
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-container-padding z-10 relative">
          <div className="max-w-[1600px] mx-auto space-y-stack-lg">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
              <div>
                <h1 className="font-display-lg text-display-lg text-on-surface mb-2">System Audit Trail</h1>
                <p className="font-body-lg text-body-lg text-on-surface-variant">View recent administrative actions and system events for compliance and troubleshooting.</p>
              </div>
              <div className="flex gap-3">
                <button className="flex items-center gap-2 px-4 py-2 bg-surface/70 backdrop-blur-md border border-outline-variant/30 rounded-lg text-on-surface hover:bg-surface-variant transition-colors font-body-sm text-body-sm">
                  <span className="material-symbols-outlined text-[20px]">download</span>
                  Export CSV
                </button>
              </div>
            </div>

            <div className="rounded-[18px] p-stack-md flex flex-wrap gap-4 items-center bg-surface-container-low/50 border border-outline-variant/10">
              <div className="flex-1 min-w-[200px]">
                <label className="block font-label-md text-label-md text-on-surface-variant mb-1 ml-1">Date Range</label>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-[20px]">calendar_today</span>
                  <select 
                    className="w-full h-[40px] pl-10 pr-4 rounded-lg bg-black/5 border-none focus:ring-2 focus:ring-primary/50 font-body-sm text-body-sm text-on-surface appearance-none cursor-pointer"
                    value={dateRange}
                    onChange={(e) => setDateRange(e.target.value)}
                  >
                    <option value="Last 7 Days">Last 7 Days</option>
                    <option value="Last 30 Days">Last 30 Days</option>
                    <option value="Last 90 Days">Last 90 Days</option>
                    <option value="All Time">All Time</option>
                  </select>
                </div>
              </div>
              <div className="flex-1 min-w-[200px]">
                <label className="block font-label-md text-label-md text-on-surface-variant mb-1 ml-1">Action Type</label>
                <select 
                  className="w-full h-[40px] px-4 rounded-lg bg-black/5 border-none focus:ring-2 focus:ring-primary/50 font-body-sm text-body-sm text-on-surface appearance-none cursor-pointer"
                  value={actionType}
                  onChange={(e) => setActionType(e.target.value)}
                >
                  <option value="All Actions">All Actions</option>
                  <option value="CREATE">CREATE</option>
                  <option value="UPDATE">UPDATE</option>
                  <option value="DELETE">DELETE</option>
                  <option value="LOGIN">LOGIN</option>
                  <option value="LOGOUT">LOGOUT</option>
                </select>
              </div>
              <div className="flex-1 min-w-[200px]">
                <label className="block font-label-md text-label-md text-on-surface-variant mb-1 ml-1">Entity</label>
                <select 
                  className="w-full h-[40px] px-4 rounded-lg bg-black/5 border-none focus:ring-2 focus:ring-primary/50 font-body-sm text-body-sm text-on-surface appearance-none cursor-pointer"
                  value={entityType}
                  onChange={(e) => setEntityType(e.target.value)}
                >
                  <option value="All Tables">All Tables</option>
                  <option value="Users">Users</option>
                  <option value="Orders">Orders</option>
                  <option value="GateLogs">Gate Logs</option>
                  <option value="Inventory">Inventory</option>
                </select>
              </div>
              <div className="mt-5">
                <button 
                  className="h-[40px] px-4 bg-surface-variant rounded-lg text-on-surface hover:bg-outline-variant/30 transition-colors font-body-sm text-body-sm flex items-center gap-2"
                  onClick={() => {
                    setDateRange('Last 7 Days');
                    setActionType('All Actions');
                    setEntityType('All Tables');
                    setCurrentPage(1);
                  }}
                >
                  <span className="material-symbols-outlined text-[20px]">refresh</span>
                  Reset Filters
                </button>
              </div>
            </div>

            <div className="rounded-[18px] overflow-hidden border border-outline-variant/10 bg-surface-container-low/70 shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-surface-variant/50 border-b border-outline-variant/20 font-label-md text-label-md text-on-surface-variant uppercase tracking-wider">
                      <th className="p-4 pl-6 font-medium">User</th>
                      <th className="p-4 font-medium">Action</th>
                      <th className="p-4 font-medium">Entity</th>
                      <th className="p-4 font-medium">IP Address</th>
                      <th className="p-4 pr-6 font-medium">Timestamp</th>
                    </tr>
                  </thead>
                  <tbody className="font-body-sm text-body-sm text-on-surface">
                    {isLoading ? (
                      <tr>
                        <td colSpan={5} className="p-6 text-center text-on-surface-variant">Loading audit records...</td>
                      </tr>
                    ) : error ? (
                      <tr>
                        <td colSpan={5} className="p-6 text-center text-error">{error}</td>
                      </tr>
                    ) : auditLogs.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="p-6 text-center text-on-surface-variant">No audit logs found.</td>
                      </tr>
                    ) : (
                      auditLogs.map((log) => (
                        <tr key={log.logId} className="group hover:bg-surface-variant/30 transition-colors border-b border-outline-variant/10">
                          <td className="p-4 pl-6">
                            {(() => {
                              const displayName = log.userName || parseUsernameFromAction(log.action);
                              const initial = displayName.charAt(0).toUpperCase();
                              const colorClass = getAvatarColor(displayName);
                              return (
                                <div className="flex items-center gap-3">
                                  <div className={`w-8 h-8 rounded-full ${colorClass} text-white text-xs font-bold flex items-center justify-center flex-shrink-0`}>
                                    {initial}
                                  </div>
                                  <div>
                                    <div className="font-medium">{displayName}</div>
                                    {log.userEmail && <div className="text-on-surface-variant text-[12px]">{log.userEmail}</div>}
                                  </div>
                                </div>
                              );
                            })()}
                          </td>
                          <td className="p-4">
                            <div className="font-medium">{log.action || 'Unknown action'}</div>
                            <div className="text-on-surface-variant text-[12px]">{log.tableName ?? 'No entity'}</div>
                          </td>
                          <td className="p-4">{log.recordId ?? '—'}</td>
                          <td className="p-4 font-label-md text-label-md text-on-surface-variant">{log.ipAddress || 'Unknown'}</td>
                          <td className="p-4 pr-6 text-on-surface-variant whitespace-nowrap">{log.loggedAt || 'Unknown'}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              <div className="p-4 border-t border-outline-variant/20 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between bg-surface-variant/20">
                <span className="font-body-sm text-body-sm text-on-surface-variant">Showing {auditLogs.length} recent entries</span>
                <div className="flex gap-2">
                  <button 
                    className="w-8 h-8 flex items-center justify-center rounded border border-outline-variant/30 text-on-surface-variant hover:bg-surface-variant transition-colors disabled:opacity-50" 
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  >
                    <span className="material-symbols-outlined text-[20px]">chevron_left</span>
                  </button>
                  {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                    const pageNum = i + 1;
                    return (
                      <button
                        key={pageNum}
                        className={`w-8 h-8 flex items-center justify-center rounded ${currentPage === pageNum ? 'bg-primary text-white font-medium' : 'border border-outline-variant/30 text-on-surface hover:bg-surface-variant'} transition-colors text-sm`}
                        onClick={() => setCurrentPage(pageNum)}
                      >
                        {pageNum}
                      </button>
                    );
                  })}
                  {totalPages > 5 && <span className="w-8 h-8 flex items-center justify-center text-on-surface-variant text-sm">...</span>}
                  <button 
                    className="w-8 h-8 flex items-center justify-center rounded border border-outline-variant/30 text-on-surface hover:bg-surface-variant transition-colors disabled:opacity-50" 
                    disabled={currentPage === totalPages}
                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  >
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

export default AdminAuditLog;
