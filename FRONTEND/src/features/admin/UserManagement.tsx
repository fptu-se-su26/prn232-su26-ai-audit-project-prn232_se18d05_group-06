import React from 'react';
import AdminSidebar from '@components/AdminSidebar';

const kpiCards = [
  {
    title: 'Total Users',
    value: '2,405',
    icon: 'groups',
    iconClass: 'text-primary bg-primary/10',
    trendIcon: 'trending_up',
    trendText: '+12%',
    trendClass: 'text-tertiary-container bg-tertiary-container/10',
    hoverGlow: 'bg-primary/5 group-hover:bg-primary/10',
  },
  {
    title: 'Active Accounts',
    value: '2,189',
    icon: 'person_check',
    iconClass: 'text-tertiary bg-tertiary/10',
    trendIcon: null,
    trendText: 'Active Now: 843',
    trendClass: 'text-outline bg-on-surface/5',
    hoverGlow: 'bg-tertiary/5 group-hover:bg-tertiary/10',
  },
  {
    title: 'Suspended',
    value: '42',
    icon: 'person_off',
    iconClass: 'text-error bg-error/10',
    trendIcon: null,
    trendText: 'Requires Review',
    trendClass: 'text-error bg-error/10',
    hoverGlow: 'bg-error/5 group-hover:bg-error/10',
  },
  {
    title: 'New Registrations',
    value: '174',
    icon: 'fiber_new',
    iconClass: 'text-primary-container bg-primary-container/10',
    trendIcon: null,
    trendText: 'This Week',
    trendClass: 'text-primary bg-primary/10',
    hoverGlow: 'bg-primary-fixed/30 group-hover:bg-primary-fixed/50',
  },
];

const usersData = [
  {
    name: 'Sarah Jenkins',
    email: 'sarah.j@smartlog.ai',
    avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBs_gC3ip6c2L9r0gtWOmY2V81k09QAYvfAlX6d0GGlwR1r8sCTMbcnO-doSSb28h5i0gwfiRQdpqWj7HEbOP4nh40BFX3KHZ-IUGCkVyu9Hz4r7N9sX4JYym-XcJuV4DGIolZmsOEvdG42H0vsyowtA9QYDA92H2DdZqEhO810WI3wvQK2usQkVZrQcsxpI5-53Urvl9T9tEguQrHUbrq7X1KY2B9LOJpOnyseFR5zze9a0gutC0TM7BPpAQErv01JNKkbaU0Du7XX',
    role: 'Administrator',
    status: 'Active',
    statusClass: 'text-tertiary bg-tertiary/10 border-tertiary/20',
    statusDot: 'bg-tertiary shadow-[0_0_8px_rgba(0,94,110,0.6)]',
    lastActive: 'Just now (Seattle, WA)',
    lastActiveIcon: 'schedule',
    isPending: false,
    isSuspended: false,
  },
  {
    name: 'Marcus Chen',
    email: 'm.chen@smartlog.ai',
    avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBQCBDhNscUmSjGJMw-qzbMD34eGuMbzPq-PBvXdx8ByvRI4k3G8aAp1xlklVwB8P8EMH0CGW8SU8CZT7ReZk2yDBQXoifaH6ZMy5nR1NPMPueKUctN1nyvH1oSoWSz6eK8p8nuxHcfl1CL03MlXxcyzrou8H4MfNLkVmOqi9tG2-0w9Rl_6CUI4MynGJpiNE6j8gMhDgoejYfP-XQH735-e4zt2WKQB5K3mD0E6PRN9YKwRHiHfq0lTtxHF2Sa6Z08xnHQV2GzKepe',
    role: 'Lead Dispatcher',
    status: 'Active',
    statusClass: 'text-tertiary bg-tertiary/10 border-tertiary/20',
    statusDot: 'bg-tertiary shadow-[0_0_8px_rgba(0,94,110,0.6)]',
    lastActive: '2 hrs ago (Chicago, IL)',
    lastActiveIcon: 'schedule',
    isPending: false,
    isSuspended: false,
  },
  {
    name: 'David Kim',
    email: 'david.k@smartlog.ai',
    avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCdr9r4qxoOb-qihn9dOtzAWYk5yJiwhv-oGRAVHS-VaprY_GlLknYaviWvAovK5bqb9Bg-v8AwnSHxytznkdOXprGEBoyiJfYYoafAyq60FOXAXpkj7cNYdMkyUeZ8jTymZ4alAsl9GvEs17PPGmBO703CZs15jbt_2E720bApG0EACefDCZj3EUNN_Ez_SJT5NCD9Yeab73DBaITQkkUu6_0ArL_GoDtgvP46dB4nw_g-CkfI98zhXyx0XykOtT2Z9SA-nILuBB7P',
    role: 'Field Operator',
    status: 'Suspended',
    statusClass: 'text-error bg-error/10 border-error/20',
    statusDot: 'bg-error shadow-[0_0_8px_rgba(186,26,26,0.6)]',
    lastActive: 'Oct 12, 2023',
    lastActiveIcon: 'schedule',
    isPending: false,
    isSuspended: true,
  },
  {
    name: 'elena.rodriguez@external.com',
    email: 'Invited via Email',
    avatar: null,
    role: 'Viewer',
    status: 'Pending',
    statusClass: 'text-outline bg-outline/10 border-outline/20',
    statusDot: 'bg-outline shadow-[0_0_8px_rgba(115,118,134,0.4)]',
    lastActive: 'Invite sent 4 hrs ago',
    lastActiveIcon: 'mark_email_unread',
    isPending: true,
    isSuspended: false,
  },
];

const AdminUserManagement: React.FC = () => {
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
              <button className="h-[48px] px-6 rounded-[18px] bg-white/50 backdrop-blur-md border border-outline-variant/30 text-on-surface font-body-md font-medium hover:bg-surface-variant/50 transition-all flex items-center gap-2">
                <span className="material-symbols-outlined text-[20px]">download</span>
                Export List
              </button>
              <button className="h-[48px] px-6 rounded-[18px] bg-gradient-to-r from-primary to-tertiary-fixed-dim text-on-primary font-body-md font-semibold shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30 hover:-translate-y-0.5 transition-all flex items-center gap-2">
                <span className="material-symbols-outlined text-[20px]">person_add</span>
                Invite User
              </button>
            </div>
          </div>

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
                <input className="w-full h-[48px] pl-12 pr-4 bg-on-surface/5 border-none rounded-[18px] font-body-md text-body-md text-on-surface focus:ring-2 focus:ring-primary/50 focus:bg-white/80 transition-all placeholder:text-outline-variant" placeholder="Search by name, email, or ID..." type="text" />
              </div>
              <div className="flex items-center gap-2 w-full md:w-auto">
                <div className="relative">
                  <select className="h-[48px] pl-4 pr-10 appearance-none bg-white/50 backdrop-blur-md border border-outline-variant/30 rounded-[18px] font-body-md text-body-md text-on-surface focus:ring-2 focus:ring-primary/50 cursor-pointer min-w-[140px]">
                    <option value="">All Roles</option>
                    <option value="admin">Administrator</option>
                    <option value="dispatcher">Dispatcher</option>
                    <option value="driver">Driver</option>
                    <option value="viewer">Viewer</option>
                  </select>
                  <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-outline-variant pointer-events-none text-[20px]">expand_more</span>
                </div>
                <div className="relative">
                  <select className="h-[48px] pl-4 pr-10 appearance-none bg-white/50 backdrop-blur-md border border-outline-variant/30 rounded-[18px] font-body-md text-body-md text-on-surface focus:ring-2 focus:ring-primary/50 cursor-pointer min-w-[140px]">
                    <option value="">All Statuses</option>
                    <option value="active">Active</option>
                    <option value="suspended">Suspended</option>
                    <option value="pending">Pending</option>
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
              {usersData.map((user, index) => (
                <div key={index} className={`grid grid-cols-1 md:grid-cols-12 gap-4 items-center px-4 md:px-6 py-4 bg-surface-container-lowest/80 backdrop-blur-md border border-white/40 shadow-[0_4px_15px_rgba(0,0,0,0.02)] rounded-[20px] hover:-translate-y-[2px] hover:shadow-[0_8px_25px_rgba(0,0,0,0.05)] transition-all cursor-pointer group ${user.isSuspended ? 'opacity-80' : ''}`}>
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
                    {user.isPending ? (
                      <button className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-surface-variant text-secondary hover:text-on-surface transition-colors" title="Resend Invite">
                        <span className="material-symbols-outlined text-[20px]">send</span>
                      </button>
                    ) : (
                      <button className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-surface-variant text-secondary hover:text-on-surface transition-colors">
                        <span className="material-symbols-outlined text-[20px]">edit</span>
                      </button>
                    )}
                    <button className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-surface-variant text-secondary hover:text-on-surface transition-colors">
                      <span className="material-symbols-outlined text-[20px]">more_vert</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex items-center justify-between mt-4 px-2">
              <p className="font-body-sm text-body-sm text-secondary">Showing 1 to 4 of 2,405 users</p>
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

      {/* User Detail Drawer (Hidden by default) */}
      <div className="fixed inset-0 z-50 flex justify-end pointer-events-none hidden">
        <div className="absolute inset-0 bg-on-surface/20 backdrop-blur-sm pointer-events-auto transition-opacity opacity-0"></div>
        <div className="relative w-full max-w-[480px] h-full bg-surface-container-lowest/90 backdrop-blur-2xl shadow-[-20px_0_50px_rgba(0,0,0,0.1)] border-l border-white/40 flex flex-col pointer-events-auto translate-x-0 transition-transform duration-300">
          <div className="flex items-center justify-between p-6 border-b border-outline-variant/20">
            <h3 className="font-headline-sm text-headline-sm text-on-surface">User Profile</h3>
            <button className="w-10 h-10 flex items-center justify-center rounded-full bg-surface-variant/50 text-secondary hover:text-on-surface hover:bg-surface-variant transition-colors">
              <span className="material-symbols-outlined text-[24px]">close</span>
            </button>
          </div>
          <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-8">
            <div className="flex flex-col items-center text-center">
              <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-surface-bright shadow-lg mb-4 relative">
                <img alt="Sarah Jenkins Detail Profile" className="w-full h-full object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuA4g1ZFIcswmPh0ileW-wGIeYwvWzRaQFEgJphty6twis8_cenGd6zYwowPFJEH6IwxYJ9pTBhi6kwllZ5pZtGmq9uWAdjlmcszEng55gijjBYam6VloDvm43NmDlhzzwzJjdHGjH2vKToxKPljQQkC7dgpVCVoHKzfMzEWSdBjIzOOK3O3Jtqq5H2DltmSKQfXxq3-70xq4T6dh9GfSigTYbK7e4q-0-p-s4lGTbgRvBrkd8I1pSaoq_5BPWQePvj_2lna9rXBP4H9" />
                <div className="absolute bottom-0 right-0 w-6 h-6 bg-tertiary border-2 border-surface-bright rounded-full"></div>
              </div>
              <h2 className="font-headline-md text-headline-md text-on-surface">Sarah Jenkins</h2>
              <p className="font-body-md text-body-md text-secondary mb-3">sarah.j@smartlog.ai</p>
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-tertiary/10 border border-tertiary/20">
                <div className="w-2 h-2 rounded-full bg-tertiary shadow-[0_0_8px_rgba(0,94,110,0.6)]"></div>
                <span className="font-label-md text-label-md text-tertiary">Active Account</span>
              </div>
            </div>
            <div className="bg-surface-container/50 rounded-[20px] p-1 border border-outline-variant/10">
              <div className="grid grid-cols-2 gap-px bg-outline-variant/20 rounded-[18px] overflow-hidden">
                <div className="bg-surface-container-lowest p-4">
                  <p className="font-label-md text-label-md text-secondary uppercase mb-1">Role</p>
                  <p className="font-body-md text-body-md text-on-surface font-medium">Administrator</p>
                </div>
                <div className="bg-surface-container-lowest p-4">
                  <p className="font-label-md text-label-md text-secondary uppercase mb-1">Department</p>
                  <p className="font-body-md text-body-md text-on-surface font-medium">Operations Central</p>
                </div>
                <div className="bg-surface-container-lowest p-4">
                  <p className="font-label-md text-label-md text-secondary uppercase mb-1">Last Login</p>
                  <p className="font-body-md text-body-md text-on-surface font-medium">Oct 24, 09:41 AM</p>
                </div>
                <div className="bg-surface-container-lowest p-4">
                  <p className="font-label-md text-label-md text-secondary uppercase mb-1">Location</p>
                  <p className="font-body-md text-body-md text-on-surface font-medium">Seattle HQ</p>
                </div>
              </div>
            </div>
            <div>
              <h4 className="font-headline-sm text-[16px] text-on-surface mb-4">Key Permissions</h4>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 rounded-xl border border-outline-variant/20 bg-surface-container-lowest/50">
                  <div className="flex items-center gap-3">
                    <span className="material-symbols-outlined text-[20px] text-primary">manage_accounts</span>
                    <span className="font-body-sm text-body-sm text-on-surface">Manage Users & Roles</span>
                  </div>
                  <span className="material-symbols-outlined text-[20px] text-tertiary">check_circle</span>
                </div>
                <div className="flex items-center justify-between p-3 rounded-xl border border-outline-variant/20 bg-surface-container-lowest/50">
                  <div className="flex items-center gap-3">
                    <span className="material-symbols-outlined text-[20px] text-primary">local_shipping</span>
                    <span className="font-body-sm text-body-sm text-on-surface">Fleet Dispatch Authority</span>
                  </div>
                  <span className="material-symbols-outlined text-[20px] text-tertiary">check_circle</span>
                </div>
                <div className="flex items-center justify-between p-3 rounded-xl border border-outline-variant/20 bg-surface-container-lowest/50 opacity-60">
                  <div className="flex items-center gap-3">
                    <span className="material-symbols-outlined text-[20px] text-secondary">payments</span>
                    <span className="font-body-sm text-body-sm text-secondary">Financial Approvals</span>
                  </div>
                  <span className="material-symbols-outlined text-[20px] text-outline">cancel</span>
                </div>
              </div>
            </div>
          </div>
          <div className="p-6 border-t border-outline-variant/20 bg-surface-container-lowest/50 flex gap-3">
            <button className="flex-1 h-[48px] rounded-[18px] bg-white border border-outline-variant/30 text-on-surface font-body-md font-medium hover:bg-surface-variant/50 transition-all">
              Edit Profile
            </button>
            <button className="h-[48px] px-6 rounded-[18px] bg-error/10 text-error font-body-md font-medium hover:bg-error/20 transition-all flex items-center justify-center" title="Suspend Account">
              <span className="material-symbols-outlined text-[20px]">block</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminUserManagement;
