import React, { useEffect, useMemo, useState } from 'react';
import AdminSidebar from '@components/AdminSidebar';
import api from '../../lib/api';

type UserDto = {
  userId: number;
  username: string;
  fullName: string;
  email: string;
  phone?: string | null;
  roleId: number;
  roleCode: string;
  roleName: string;
  isActive: boolean;
  lastLoginAt?: string | null;
  createdAt?: string | null;
};

type RoleDto = {
  roleId: number;
  roleCode: string;
  roleName: string;
};

type NewUserForm = {
  username: string;
  password: string;
  fullName: string;
  email: string;
  phone: string;
  roleId: number;
  isActive: boolean;
};

const AdminUserManagement: React.FC = () => {
  const [users, setUsers] = useState<UserDto[]>([]);
  const [roles, setRoles] = useState<RoleDto[]>([]);
  const [form, setForm] = useState<NewUserForm>({
    username: '',
    password: '',
    fullName: '',
    email: '',
    phone: '',
    roleId: 0,
    isActive: true,
  });
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [saving, setSaving] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null);
  const [feedbackError, setFeedbackError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [isCreatePanelOpen, setIsCreatePanelOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserDto | null>(null);
  const [editRoleId, setEditRoleId] = useState(0);
  const [editIsActive, setEditIsActive] = useState(true);

  type DisplayUser = {
    userId: number;
    roleId: number;
    isActive: boolean;
    name: string;
    email: string;
    avatar?: string | null;
    role: string;
    status: string;
    statusClass: string;
    statusDot: string;
    lastActive: string;
    lastActiveIcon: string;
    isPending: boolean;
    isSuspended: boolean;
  };

  const mapUserToDisplay = (user: UserDto): DisplayUser => {
    const isActive = user.isActive;
    return {
      userId: user.userId,
      roleId: user.roleId,
      isActive,
      name: user.fullName,
      email: user.email,
      avatar: null,
      role: user.roleName,
      status: isActive ? 'Active' : 'Suspended',
      statusClass: isActive ? 'text-tertiary bg-tertiary/10 border-tertiary/20' : 'text-error bg-error/10 border-error/20',
      statusDot: isActive ? 'bg-tertiary shadow-[0_0_8px_rgba(0,94,110,0.6)]' : 'bg-error shadow-[0_0_8px_rgba(186,26,26,0.6)]',
      lastActive: user.lastLoginAt ? new Date(user.lastLoginAt).toLocaleString() : 'No recent activity',
      lastActiveIcon: 'schedule',
      isPending: false,
      isSuspended: !isActive,
    };
  };

  const displayedUsers = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLowerCase();
    return users.filter((user) => {
      const matchesSearch = !normalizedSearch || [user.fullName, user.email, user.username, user.roleName, user.roleCode]
        .filter(Boolean)
        .some((value) => value.toLowerCase().includes(normalizedSearch));
      const matchesRole = !roleFilter || user.roleCode.toLowerCase() === roleFilter.toLowerCase();
      const matchesStatus = !statusFilter || (statusFilter === 'active' ? user.isActive : !user.isActive);
      return matchesSearch && matchesRole && matchesStatus;
    }).map(mapUserToDisplay);
  }, [users, roleFilter, searchTerm, statusFilter]);

  const kpiCards = useMemo(() => {
    const activeAccounts = users.filter((user) => user.isActive).length;
    const suspended = users.filter((user) => !user.isActive).length;
    const newRegistrations = users.filter((user) => {
      if (!user.createdAt) {
        return false;
      }
      const createdAt = new Date(user.createdAt);
      const now = new Date();
      const diffDays = (now.getTime() - createdAt.getTime()) / (1000 * 60 * 60 * 24);
      return diffDays >= 0 && diffDays <= 7;
    }).length;

    return [
      {
        title: 'Total Users',
        value: users.length.toLocaleString(),
        icon: 'groups',
        iconClass: 'text-primary bg-primary/10',
        trendIcon: 'trending_up',
        trendText: `${users.length ? 'Live' : 'No data'}`,
        trendClass: 'text-tertiary-container bg-tertiary-container/10',
        hoverGlow: 'bg-primary/5 group-hover:bg-primary/10',
      },
      {
        title: 'Active Accounts',
        value: activeAccounts.toLocaleString(),
        icon: 'person_check',
        iconClass: 'text-tertiary bg-tertiary/10',
        trendIcon: null,
        trendText: `Active Now: ${activeAccounts}`,
        trendClass: 'text-outline bg-on-surface/5',
        hoverGlow: 'bg-tertiary/5 group-hover:bg-tertiary/10',
      },
      {
        title: 'Suspended',
        value: suspended.toLocaleString(),
        icon: 'person_off',
        iconClass: 'text-error bg-error/10',
        trendIcon: null,
        trendText: 'Needs review',
        trendClass: 'text-error bg-error/10',
        hoverGlow: 'bg-error/5 group-hover:bg-error/10',
      },
      {
        title: 'New Registrations',
        value: newRegistrations.toLocaleString(),
        icon: 'fiber_new',
        iconClass: 'text-primary-container bg-primary-container/10',
        trendIcon: null,
        trendText: 'Last 7 days',
        trendClass: 'text-primary bg-primary/10',
        hoverGlow: 'bg-primary-fixed/30 group-hover:bg-primary-fixed/50',
      },
    ];
  }, [users]);

  useEffect(() => {
    void loadRoles();
    void loadUsers();
  }, []);

  const loadRoles = async () => {
    try {
      const response = await api.get<RoleDto[]>('/admin/roles');
      setRoles(response.data);
      if (response.data.length) {
        setForm((prev) => ({ ...prev, roleId: prev.roleId || response.data[0].roleId }));
      }
    } catch (error) {
      console.error('Failed to load roles', error);
    }
  };

  const loadUsers = async () => {
    setLoadingUsers(true);
    try {
      const response = await api.get<{ total: number; items: UserDto[] }>('/admin/users?limit=100');
      setUsers(response.data.items);
    } catch (error: any) {
      console.error('Failed to load users', error);
      setFeedbackError(error?.response?.data?.message || 'Không thể tải danh sách người dùng.');
    } finally {
      setLoadingUsers(false);
    }
  };

  const handleFormChange = (field: keyof NewUserForm, value: string | boolean | number) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const openUserDrawer = (user: UserDto) => {
    setSelectedUser(user);
    setEditRoleId(user.roleId);
    setEditIsActive(user.isActive);
    setFeedbackError(null);
    setFeedbackMessage(null);
  };

  const handleCreateUser = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setFeedbackMessage(null);
    setFeedbackError(null);
    setSaving(true);

    try {
      const response = await api.post<UserDto>('/admin/users', form);
      setUsers((prev) => [response.data, ...prev]);
      setFeedbackMessage('Tạo người dùng thành công.');
      setForm({
        username: '',
        password: '',
        fullName: '',
        email: '',
        phone: '',
        roleId: roles.length ? roles[0].roleId : 1,
        isActive: true,
      });
      setIsCreatePanelOpen(false);
    } catch (error: any) {
      console.error('Create user failed', error);
      setFeedbackError(error?.response?.data?.message || 'Lỗi khi tạo người dùng.');
    } finally {
      setSaving(false);
    }
  };

  const handleUpdateUser = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!selectedUser) {
      return;
    }

    setSaving(true);
    setFeedbackMessage(null);
    setFeedbackError(null);

    try {
      const response = await api.put<UserDto>(`/admin/users/${selectedUser.userId}`, {
        roleId: editRoleId,
        isActive: editIsActive,
      });
      setUsers((prev) => prev.map((user) => (user.userId === response.data.userId ? response.data : user)));
      setFeedbackMessage('Cập nhật phân quyền thành công.');
      setSelectedUser(null);
    } catch (error: any) {
      console.error('Update user failed', error);
      setFeedbackError(error?.response?.data?.message || 'Lỗi khi cập nhật người dùng.');
    } finally {
      setSaving(false);
    }
  };

  const handleExportUsers = () => {
    const rows = displayedUsers.map((user) => [
      user.name,
      user.email,
      user.role,
      user.status,
      user.lastActive,
    ]);
    const csvContent = [
      ['Name', 'Email', 'Role', 'Status', 'Last Active'],
      ...rows,
    ].map((row) => row.map((value) => `"${String(value).replace(/"/g, '""')}"`).join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'users.csv';
    link.click();
    URL.revokeObjectURL(url);
    setFeedbackMessage('Đã xuất danh sách người dùng.');
  };

  return (
    <div className="bg-background text-on-background antialiased min-h-screen overflow-x-hidden flex selection:bg-primary/20 selection:text-primary relative">
      {/* Background Atmospheric Elements */}
      <div className="fixed inset-0 z-[-1] pointer-events-none opacity-40">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/10 rounded-full blur-[120px]"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[30%] h-[30%] bg-tertiary/10 rounded-full blur-[100px]"></div>
      </div>

      {/* SideNavBar */}
      <AdminSidebar />

      {/* Main Content Canvas */}
      <main className="flex-1 ml-0 md:ml-[280px] min-h-screen flex flex-col relative">
        {/* TopNavBar */}
        <header className="hidden md:flex justify-between items-center w-full px-container-padding py-stack-md bg-surface/70 backdrop-blur-md shadow-sm docked full-width top-0 sticky z-40">
          <div className="flex items-center gap-4">
            <h1 className="font-headline-sm text-headline-sm font-bold text-on-surface tracking-tight">SmartLog AI Operations Center</h1>
          </div>
          <div className="flex items-center gap-6">
            <div className="relative group">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline-variant group-focus-within:text-primary transition-colors text-[20px]">search</span>
              <input className="h-[40px] pl-10 pr-4 bg-on-surface/5 border-none rounded-full font-body-sm text-body-sm text-on-surface focus:ring-2 focus:ring-primary/50 w-[240px] transition-all placeholder:text-outline focus-within:ring-2 focus-within:ring-primary/50 bg-white/40 backdrop-blur-sm" placeholder="Global search..." type="text" />
            </div>
            <div className="flex items-center gap-2">
              <button className="w-10 h-10 rounded-full flex items-center justify-center text-on-surface-variant hover:bg-surface-variant/50 hover:text-primary transition-colors relative">
                <span className="material-symbols-outlined text-[24px]">notifications</span>
                <span className="absolute top-2 right-2 w-2 h-2 bg-error rounded-full ring-2 ring-surface"></span>
              </button>
              <div className="w-px h-6 bg-outline-variant/30 mx-1"></div>
              <button className="h-[40px] px-4 rounded-[18px] bg-gradient-to-r from-primary to-tertiary-fixed-dim text-on-primary font-body-sm font-semibold hover:shadow-[0_4px_12px_rgba(0,74,198,0.3)] transition-all flex items-center gap-2">
                <span className="material-symbols-outlined text-[18px]">smart_toy</span>
                AI Assistant
              </button>
              <button className="w-10 h-10 ml-2 rounded-full overflow-hidden border border-outline-variant/20 hover:ring-2 hover:ring-primary/50 transition-all">
                <img alt="Admin User Profile" className="w-full h-full object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuCEK4N-lCUlo1PU1grrm8iFa7We6H9723-y_supoMo9IMI4Ohgmady9MHBz7fWzxte8uGar4oS7XY0986E_RPH92o7nuyxwmbfMDCe7Byx3HsMsqkZjFKYbdACstUw-ETrUAAlbtSy_oZywonKWHY_Y4HL94LINQma8WPp_mVTxfBniwFdic4_RefVm_wPCvhZd3H_ZyvfIS2G_jJtgUzCV4XP80rUyR2TGqQHyGBpz4CSMdNGozIIUSPe8Vn7TqYTeu319JFEAAmrm" />
              </button>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <div className="flex-1 w-full max-w-[1600px] mx-auto px-container-padding py-stack-lg flex flex-col gap-stack-lg">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <h2 className="font-display-lg text-display-lg text-on-surface">User Management</h2>
              <p className="font-body-lg text-body-lg text-secondary mt-1">Manage platform access, roles, and administrative privileges.</p>
            </div>
            <div className="flex items-center gap-3">
              <button type="button" onClick={handleExportUsers} className="h-[48px] px-6 rounded-[18px] bg-white/50 backdrop-blur-md border border-outline-variant/30 text-on-surface font-body-md font-medium hover:bg-surface-variant/50 transition-all flex items-center gap-2">
                <span className="material-symbols-outlined text-[20px]">download</span>
                Export List
              </button>
              <button type="button" onClick={() => setIsCreatePanelOpen((prev) => !prev)} className="h-[48px] px-6 rounded-[18px] bg-gradient-to-r from-primary to-tertiary-fixed-dim text-on-primary font-body-md font-semibold shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30 hover:-translate-y-0.5 transition-all flex items-center gap-2">
                <span className="material-symbols-outlined text-[20px]">person_add</span>
                {isCreatePanelOpen ? 'Close Form' : 'Invite User'}
              </button>
            </div>
          </div>

          {feedbackMessage && (
            <div className="rounded-[18px] border border-tertiary/20 bg-tertiary/10 px-4 py-3 text-sm text-tertiary">{feedbackMessage}</div>
          )}
          {feedbackError && (
            <div className="rounded-[18px] border border-error/20 bg-error/10 px-4 py-3 text-sm text-error">{feedbackError}</div>
          )}

          {isCreatePanelOpen && (
            <form onSubmit={handleCreateUser} className="rounded-[24px] border border-outline-variant/20 bg-surface-container-lowest/80 p-6 shadow-sm">
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="mb-1 block text-sm font-medium text-on-surface">Username</label>
                  <input required value={form.username} onChange={(event) => handleFormChange('username', event.target.value)} className="w-full rounded-[14px] border border-outline-variant/40 bg-white/80 px-3 py-2" />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-on-surface">Password</label>
                  <input type="password" required value={form.password} onChange={(event) => handleFormChange('password', event.target.value)} className="w-full rounded-[14px] border border-outline-variant/40 bg-white/80 px-3 py-2" />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-on-surface">Full name</label>
                  <input required value={form.fullName} onChange={(event) => handleFormChange('fullName', event.target.value)} className="w-full rounded-[14px] border border-outline-variant/40 bg-white/80 px-3 py-2" />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-on-surface">Email</label>
                  <input type="email" required value={form.email} onChange={(event) => handleFormChange('email', event.target.value)} className="w-full rounded-[14px] border border-outline-variant/40 bg-white/80 px-3 py-2" />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-on-surface">Phone</label>
                  <input value={form.phone} onChange={(event) => handleFormChange('phone', event.target.value)} className="w-full rounded-[14px] border border-outline-variant/40 bg-white/80 px-3 py-2" />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-on-surface">Role</label>
                  <select value={form.roleId} onChange={(event) => handleFormChange('roleId', Number(event.target.value))} className="w-full rounded-[14px] border border-outline-variant/40 bg-white/80 px-3 py-2">
                    {roles.map((role) => (
                      <option key={role.roleId} value={role.roleId}>{role.roleName}</option>
                    ))}
                  </select>
                </div>
              </div>
              <label className="mt-4 flex items-center gap-2 text-sm text-on-surface">
                <input type="checkbox" checked={form.isActive} onChange={(event) => handleFormChange('isActive', event.target.checked)} />
                Active account
              </label>
              <div className="mt-4 flex justify-end gap-3">
                <button type="button" onClick={() => setIsCreatePanelOpen(false)} className="rounded-[14px] border border-outline-variant/40 px-4 py-2">Cancel</button>
                <button type="submit" disabled={saving} className="rounded-[14px] bg-primary px-4 py-2 text-on-primary">{saving ? 'Saving...' : 'Create User'}</button>
              </div>
            </form>
          )}

          {/* KPI Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-stack-md">
            {kpiCards.map((kpi, index) => (
              <div key={index} className="bg-surface-container-lowest/70 backdrop-blur-[12px] border-t border-white/40 shadow-[0_10px_30px_rgba(0,0,0,0.03)] rounded-[24px] p-6 relative overflow-hidden group hover:bg-surface-container-lowest/90 transition-colors">
                <div className={`absolute right-[-10%] top-[-10%] w-24 h-24 rounded-full blur-xl transition-colors ${kpi.hoverGlow}`}></div>
                <div className="flex items-start justify-between mb-4">
                  <div className={`w-12 h-12 rounded-[16px] flex items-center justify-center ${kpi.iconClass}`}>
                    <span className="material-symbols-outlined text-[24px]">{kpi.icon}</span>
                  </div>
                  <span className={`font-label-md text-label-md px-2.5 py-1 rounded-full flex items-center gap-1 ${kpi.trendClass}`}>
                    {kpi.trendIcon && <span className="material-symbols-outlined text-[14px]">{kpi.trendIcon}</span>}
                    {kpi.trendText}
                  </span>
                </div>
                <h3 className="font-body-md text-body-md text-secondary mb-1">{kpi.title}</h3>
                <p className="font-headline-lg text-headline-lg text-on-surface">{kpi.value}</p>
              </div>
            ))}
          </div>

          {/* Toolbar & Data Area */}
          <div className="flex flex-col gap-stack-sm flex-1">
            <div className="flex flex-col md:flex-row items-center gap-4 bg-surface-container-lowest/50 backdrop-blur-md p-2 rounded-[24px] border border-outline-variant/20 shadow-sm">
              <div className="relative flex-1 w-full group">
                <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-outline group-focus-within:text-primary transition-colors text-[24px]">search</span>
                <input value={searchTerm} onChange={(event) => setSearchTerm(event.target.value)} className="w-full h-[48px] pl-12 pr-4 bg-on-surface/5 border-none rounded-[18px] font-body-md text-body-md text-on-surface focus:ring-2 focus:ring-primary/50 focus:bg-white/80 transition-all placeholder:text-outline-variant" placeholder="Search by name, email, or ID..." type="text" />
              </div>
              <div className="flex items-center gap-2 w-full md:w-auto">
                <div className="relative">
                  <select value={roleFilter} onChange={(event) => setRoleFilter(event.target.value)} className="h-[48px] pl-4 pr-10 appearance-none bg-white/50 backdrop-blur-md border border-outline-variant/30 rounded-[18px] font-body-md text-body-md text-on-surface focus:ring-2 focus:ring-primary/50 cursor-pointer min-w-[140px]">
                    <option value="">All Roles</option>
                    {roles.map((role) => (
                      <option key={role.roleId} value={role.roleCode}>{role.roleName}</option>
                    ))}
                  </select>
                  <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-outline-variant pointer-events-none text-[20px]">expand_more</span>
                </div>
                <div className="relative">
                  <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)} className="h-[48px] pl-4 pr-10 appearance-none bg-white/50 backdrop-blur-md border border-outline-variant/30 rounded-[18px] font-body-md text-body-md text-on-surface focus:ring-2 focus:ring-primary/50 cursor-pointer min-w-[140px]">
                    <option value="">All Statuses</option>
                    <option value="active">Active</option>
                    <option value="suspended">Suspended</option>
                  </select>
                  <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-outline-variant pointer-events-none text-[20px]">expand_more</span>
                </div>
                <button className="h-[48px] w-[48px] flex items-center justify-center rounded-[18px] bg-white/50 backdrop-blur-md border border-outline-variant/30 text-on-surface hover:bg-surface-variant/50 transition-all" title="Advanced Filters">
                  <span className="material-symbols-outlined text-[20px]">tune</span>
                </button>
              </div>
            </div>

            <div className="hidden md:grid grid-cols-12 gap-4 px-6 py-3 border-b border-outline-variant/20 mb-2">
              <div className="col-span-4 font-label-md text-label-md text-secondary uppercase tracking-wider">User Details</div>
              <div className="col-span-2 font-label-md text-label-md text-secondary uppercase tracking-wider">Role</div>
              <div className="col-span-2 font-label-md text-label-md text-secondary uppercase tracking-wider">Status</div>
              <div className="col-span-3 font-label-md text-label-md text-secondary uppercase tracking-wider">Last Active</div>
              <div className="col-span-1 text-right font-label-md text-label-md text-secondary uppercase tracking-wider">Actions</div>
            </div>

            <div className="flex flex-col gap-3">
              {(loadingUsers ? [] : displayedUsers).map((user) => (
                <div key={user.userId} className={`grid grid-cols-1 md:grid-cols-12 gap-4 items-center px-4 md:px-6 py-4 bg-surface-container-lowest/80 backdrop-blur-md border border-white/40 shadow-[0_4px_15px_rgba(0,0,0,0.02)] rounded-[20px] hover:-translate-y-[2px] hover:shadow-[0_8px_25px_rgba(0,0,0,0.05)] transition-all cursor-pointer group ${user.isSuspended ? 'opacity-80' : ''}`}>
                  <div className="col-span-1 md:col-span-4 flex items-center gap-4">
                    {user.isPending ? (
                      <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-surface-bright border-dashed shrink-0 flex items-center justify-center bg-surface-variant/30 text-secondary">
                        <span className="material-symbols-outlined text-[24px]">person</span>
                      </div>
                    ) : (
                      <div className={`w-12 h-12 rounded-full overflow-hidden border-2 border-surface-bright shadow-sm shrink-0 ${user.isSuspended ? 'grayscale opacity-60' : ''}`}>
                        <img alt={user.name} className="w-full h-full object-cover" src={user.avatar || ''} />
                      </div>
                    )}
                    <div className="min-w-0">
                      <h4 className="font-headline-sm text-[16px] leading-[24px] font-semibold text-on-surface truncate group-hover:text-primary transition-colors">{user.name}</h4>
                      <p className="font-body-sm text-body-sm text-secondary truncate">{user.email}</p>
                    </div>
                  </div>
                  <div className="col-span-1 md:col-span-2 flex items-center">
                    <span className="inline-flex items-center px-2.5 py-1 rounded-md bg-secondary-container/50 text-on-secondary-container font-label-md text-[13px]">{user.role}</span>
                  </div>
                  <div className="col-span-1 md:col-span-2 flex items-center">
                    <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full border ${user.statusClass}`}>
                      <div className={`w-2 h-2 rounded-full ${user.statusDot}`}></div>
                      <span className="font-label-md text-label-md">{user.status}</span>
                    </div>
                  </div>
                  <div className="col-span-1 md:col-span-3 flex items-center gap-2">
                    <span className="material-symbols-outlined text-[16px] text-outline">{user.lastActiveIcon}</span>
                    <span className="font-body-sm text-body-sm text-on-surface-variant">{user.lastActive}</span>
                  </div>
                  <div className="col-span-1 md:col-span-1 flex items-center justify-end gap-1 opacity-0 md:opacity-100 group-hover:opacity-100 transition-opacity">
                    <button type="button" onClick={(event) => { event.stopPropagation(); openUserDrawer(users.find((item) => item.userId === user.userId) ?? null as any); }} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-surface-variant text-secondary hover:text-on-surface transition-colors" title="Edit user">
                      <span className="material-symbols-outlined text-[20px]">edit</span>
                    </button>
                    <button type="button" onClick={(event) => { event.stopPropagation(); openUserDrawer(users.find((item) => item.userId === user.userId) ?? null as any); }} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-surface-variant text-secondary hover:text-on-surface transition-colors" title="Manage permissions">
                      <span className="material-symbols-outlined text-[20px]">security</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex items-center justify-between mt-4 px-2">
              <p className="font-body-sm text-body-sm text-secondary">Showing {displayedUsers.length} of {users.length} users</p>
              <div className="flex items-center gap-1">
                <button className="w-10 h-10 flex items-center justify-center rounded-xl bg-surface-container-lowest/50 border border-outline-variant/30 text-secondary hover:bg-surface-variant/50 transition-colors disabled:opacity-50" disabled>
                  <span className="material-symbols-outlined text-[20px]">chevron_left</span>
                </button>
                <button className="w-10 h-10 flex items-center justify-center rounded-xl bg-primary text-on-primary shadow-md shadow-primary/20 font-body-sm font-medium">1</button>
                <button className="w-10 h-10 flex items-center justify-center rounded-xl bg-surface-container-lowest/50 border border-outline-variant/30 text-on-surface hover:bg-surface-variant/50 transition-colors font-body-sm font-medium">2</button>
                <button className="w-10 h-10 flex items-center justify-center rounded-xl bg-surface-container-lowest/50 border border-outline-variant/30 text-on-surface hover:bg-surface-variant/50 transition-colors font-body-sm font-medium">3</button>
                <span className="px-2 text-secondary">...</span>
                <button className="w-10 h-10 flex items-center justify-center rounded-xl bg-surface-container-lowest/50 border border-outline-variant/30 text-secondary hover:bg-surface-variant/50 transition-colors">
                  <span className="material-symbols-outlined text-[20px]">chevron_right</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* User Detail Drawer */}
      <div className={`fixed inset-0 z-50 flex justify-end pointer-events-none ${selectedUser ? 'flex' : 'hidden'}`}>
        <div className="absolute inset-0 bg-on-surface/20 backdrop-blur-sm pointer-events-auto transition-opacity" onClick={() => setSelectedUser(null)}></div>
        <div className="relative w-full max-w-[480px] h-full bg-surface-container-lowest/90 backdrop-blur-2xl shadow-[-20px_0_50px_rgba(0,0,0,0.1)] border-l border-white/40 flex flex-col pointer-events-auto translate-x-0 transition-transform duration-300">
          <div className="flex items-center justify-between p-6 border-b border-outline-variant/20">
            <h3 className="font-headline-sm text-headline-sm text-on-surface">Manage Permissions</h3>
            <button type="button" onClick={() => setSelectedUser(null)} className="w-10 h-10 flex items-center justify-center rounded-full bg-surface-variant/50 text-secondary hover:text-on-surface hover:bg-surface-variant transition-colors">
              <span className="material-symbols-outlined text-[24px]">close</span>
            </button>
          </div>
          {selectedUser && (
            <form onSubmit={handleUpdateUser} className="flex-1 overflow-y-auto p-6 flex flex-col gap-6">
              <div className="rounded-[20px] border border-outline-variant/20 bg-surface-container/50 p-4">
                <p className="text-sm text-secondary">User</p>
                <h4 className="mt-1 text-lg font-semibold text-on-surface">{selectedUser.fullName}</h4>
                <p className="text-sm text-secondary">{selectedUser.email}</p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="mb-1 block text-sm font-medium text-on-surface">Role</label>
                  <select value={editRoleId} onChange={(event) => setEditRoleId(Number(event.target.value))} className="w-full rounded-[14px] border border-outline-variant/40 bg-white/80 px-3 py-2">
                    {roles.map((role) => (
                      <option key={role.roleId} value={role.roleId}>{role.roleName}</option>
                    ))}
                  </select>
                </div>
                <label className="flex items-center gap-2 text-sm text-on-surface">
                  <input type="checkbox" checked={editIsActive} onChange={(event) => setEditIsActive(event.target.checked)} />
                  Active account
                </label>
              </div>

              <div className="rounded-[20px] border border-outline-variant/20 bg-surface-container-lowest/50 p-4 text-sm text-secondary">
                Assign a different role or change account status for this user instantly.
              </div>

              <div className="mt-auto flex gap-3">
                <button type="button" onClick={() => setSelectedUser(null)} className="flex-1 h-[48px] rounded-[18px] bg-white border border-outline-variant/30 text-on-surface font-body-md font-medium hover:bg-surface-variant/50 transition-all">
                  Cancel
                </button>
                <button type="submit" disabled={saving} className="flex-1 h-[48px] rounded-[18px] bg-primary text-on-primary font-body-md font-medium hover:bg-primary/90 transition-all">
                  {saving ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminUserManagement;
