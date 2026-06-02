import React from 'react';
import AdminSidebar from '@components/AdminSidebar';

const systemRoles = [
  {
    name: 'System Administrator',
    description: 'Unrestricted platform access',
    icon: 'shield_person',
    isActive: true,
  },
  {
    name: 'Fleet Dispatcher',
    description: 'Fleet & driver operations',
    icon: 'local_shipping',
    isActive: false,
  },
  {
    name: 'Warehouse Manager',
    description: 'Inventory & fulfillment limits',
    icon: 'warehouse',
    isActive: false,
  },
  {
    name: 'Customer Support L1',
    description: 'Read-only CRM access',
    icon: 'support_agent',
    isActive: false,
  },
];

const permissions = [
  {
    module: 'Order Management',
    icon: 'inventory_2',
    isLocked: false,
    create: { checked: false, disabled: false },
    read: { checked: true, disabled: true },
    update: { checked: false, disabled: false },
    delete: { checked: false, disabled: false, isError: true },
  },
  {
    module: 'Fleet Status',
    icon: 'local_shipping',
    isLocked: false,
    create: { checked: false, disabled: false },
    read: { checked: true, disabled: false },
    update: { checked: true, disabled: false },
    delete: { checked: false, disabled: false, isError: true },
  },
  {
    module: 'User Profiles',
    icon: 'account_circle',
    isLocked: true,
    create: { checked: false, disabled: true, isRemove: true },
    read: { checked: true, disabled: true },
    update: { checked: false, disabled: true, isRemove: true },
    delete: { checked: false, disabled: true, isRemove: true },
  },
  {
    module: 'Financial Records',
    icon: 'payments',
    isLocked: false,
    create: { checked: true, disabled: false },
    read: { checked: true, disabled: false },
    update: { checked: false, disabled: false },
    delete: { checked: false, disabled: false, isError: true },
  },
];

const AdminRolePermission: React.FC = () => {
  return (
    <div className="bg-background text-on-background font-body-md min-h-screen overflow-x-hidden relative selection:bg-primary-fixed selection:text-on-primary-fixed">
      {/* Ambient Background Element */}
      <div className="fixed top-[-20%] left-[-10%] w-[60%] h-[60%] rounded-full bg-primary/5 blur-[120px] pointer-events-none z-0"></div>
      <div className="fixed bottom-[-20%] right-[-10%] w-[50%] h-[50%] rounded-full bg-tertiary/5 blur-[100px] pointer-events-none z-0"></div>

      {/* SideNavBar */}
      <AdminSidebar />

      {/* TopNavBar */}
      <header className="bg-surface/70 backdrop-blur-md border-b border-outline-variant/20 shadow-sm docked full-width top-0 sticky z-40 flex justify-between items-center w-full px-container-padding py-stack-md ml-[280px] max-w-[calc(100%-280px)]">
        <div className="flex items-center gap-stack-md">
          <h1 className="font-headline-sm text-headline-sm font-bold text-on-surface">SmartLog AI Operations Center</h1>
        </div>
        <div className="flex items-center gap-gutter">
          <div className="relative focus-within:ring-2 focus-within:ring-primary/50 rounded-[18px] transition-shadow">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant">search</span>
            <input className="bg-surface-variant/30 border-none rounded-[18px] pl-10 pr-4 h-[48px] w-[300px] font-body-sm text-body-sm text-on-surface placeholder:text-on-surface-variant/60 focus:bg-surface-container-lowest focus:ring-0 transition-colors" placeholder="Search commands or data..." type="text" />
          </div>
          <div className="flex items-center gap-stack-sm">
            <button className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-surface-variant/50 text-on-surface-variant transition-colors relative">
              <span className="material-symbols-outlined">notifications</span>
              <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-error border border-surface"></span>
            </button>
            <button className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-surface-variant/50 text-on-surface-variant transition-colors">
              <img alt="Admin User Profile" className="w-8 h-8 rounded-full border border-outline-variant/30" src="https://lh3.googleusercontent.com/aida-public/AB6AXuALSKciDHRvSq2rnxiEIj1KOD3clz6pcbEFTX_1Pvo9qOW9tsF5MB1WjIr-9l8seAac1xHp6ao0gWJhOO3raSkaEkBwKFKTQBRTd40XOf7VPfzVJIr7mni0X5emrwiSGcAir-KyH-sv0WBhuPXDucVhU-X0T0UpWw4UNURPnH6IVWohMtxKfWLbmk3qMQ2Ilbzqx2P8z65jqxnMBWsRJrY_R43LSEy3K0VPTcBgp-6YoOsIFTwWgf2p6caimYraDcglqWpNml4OFY4m" />
            </button>
          </div>
          <button className="bg-gradient-to-r from-primary to-primary-container text-on-primary font-body-sm text-body-sm font-medium px-4 h-[40px] rounded-xl flex items-center gap-2 hover:shadow-lg hover:shadow-primary/20 transition-all">
            <span className="material-symbols-outlined text-[18px]">smart_toy</span>
            AI Assistant
          </button>
        </div>
      </header>

      {/* Main Content Canvas */}
      <main className="ml-[280px] p-container-padding max-w-[1600px] w-full flex flex-col gap-gutter z-10 relative">
        <div className="flex items-end justify-between">
          <div>
            <h2 className="font-headline-lg text-headline-lg text-on-surface mb-1">Access Control</h2>
            <p className="font-body-sm text-body-sm text-on-surface-variant">Manage role-based policies and operational clearance levels.</p>
          </div>
          <div className="flex gap-stack-sm">
            <button className="bg-surface-container-lowest border border-outline-variant/40 text-on-surface font-body-sm text-body-sm px-4 h-[44px] rounded-[18px] flex items-center gap-2 hover:bg-surface-container transition-colors backdrop-blur-md shadow-sm">
              <span className="material-symbols-outlined text-[18px]">download</span>
              Export Policies
            </button>
            <button className="bg-on-surface text-surface-container-lowest font-body-sm text-body-sm font-medium px-5 h-[44px] rounded-[18px] flex items-center gap-2 hover:opacity-90 transition-opacity shadow-lg shadow-on-surface/10">
              <span className="material-symbols-outlined text-[18px]">add</span>
              Create Role
            </button>
          </div>
        </div>

        <div className="grid grid-cols-12 gap-gutter items-start h-[calc(100vh-220px)] min-h-[600px]">
          {/* Left Panel: Roles List */}
          <div className="col-span-3 bg-surface-container-lowest/80 backdrop-blur-xl border border-white/40 shadow-[0_10px_30px_rgba(0,0,0,0.03)] rounded-2xl p-stack-md flex flex-col h-full overflow-hidden relative">
            <div className="relative mb-stack-md">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-[18px]">search</span>
              <input className="bg-surface-container/50 border border-outline-variant/20 rounded-xl pl-9 pr-3 h-[40px] w-full font-body-sm text-body-sm focus:border-primary/50 focus:ring-0 transition-colors" placeholder="Find role..." type="text" />
            </div>
            <div className="text-label-md font-label-md text-on-surface-variant mb-2 px-2 uppercase tracking-wider">System Roles</div>
            <div className="flex-1 overflow-y-auto space-y-1 matrix-scroll pr-1">
              {systemRoles.map((role, index) => (
                <button
                  key={index}
                  className={`w-full text-left rounded-xl p-3 flex items-start gap-3 relative transition-all group ${role.isActive ? 'bg-primary/5 border border-primary/20 overflow-hidden' : 'hover:bg-surface-container/50 border border-transparent hover:border-outline-variant/20'}`}
                >
                  {role.isActive && <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary rounded-l-xl"></div>}
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 transition-colors ${role.isActive ? 'bg-primary/10 text-primary' : 'bg-surface-variant text-on-surface-variant group-hover:bg-surface-container-high'}`}>
                    <span className="material-symbols-outlined text-[18px]">{role.icon}</span>
                  </div>
                  <div>
                    <div className={`font-body-md text-body-md font-medium transition-colors ${role.isActive ? 'font-semibold text-primary' : 'text-on-surface group-hover:text-primary'}`}>{role.name}</div>
                    <div className="font-body-sm text-body-sm text-on-surface-variant/80 mt-0.5">{role.description}</div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Main Matrix Area */}
          <div className="col-span-9 bg-surface-container-lowest/80 backdrop-blur-xl border border-white/40 shadow-[0_10px_30px_rgba(0,0,0,0.04)] rounded-2xl flex flex-col h-full overflow-hidden">
            <div className="p-stack-md border-b border-outline-variant/20 flex items-center justify-between bg-surface-container-lowest/50">
              <div className="flex items-center gap-stack-md">
                <h3 className="font-headline-sm text-headline-sm text-on-surface">System Administrator <span className="font-normal text-on-surface-variant">Permissions</span></h3>
                <div className="bg-gradient-to-r from-tertiary-container/10 to-primary-container/10 border border-tertiary/20 rounded-full px-3 py-1 flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-[14px] text-tertiary">info</span>
                  <span className="font-label-md text-label-md text-tertiary-fixed-variant">Inherits from Base User</span>
                </div>
              </div>
              <div className="flex items-center gap-stack-sm">
                <div className="text-body-sm font-body-sm text-on-surface-variant mr-2">Bulk Actions:</div>
                <button className="font-label-md text-label-md bg-surface-variant/50 hover:bg-surface-variant text-on-surface px-3 py-1.5 rounded-lg transition-colors border border-outline-variant/20">Select All</button>
                <button className="font-label-md text-label-md bg-surface-variant/50 hover:bg-surface-variant text-on-surface px-3 py-1.5 rounded-lg transition-colors border border-outline-variant/20">Clear All</button>
              </div>
            </div>

            <div className="grid grid-cols-[2fr_1fr_1fr_1fr_1fr] gap-4 px-stack-lg py-stack-sm bg-surface-container-low/50 border-b border-outline-variant/10 text-label-md font-label-md text-on-surface-variant uppercase tracking-wider">
              <div>Module</div>
              <div className="text-center">Create</div>
              <div className="text-center">Read</div>
              <div className="text-center">Update</div>
              <div className="text-center">Delete</div>
            </div>

            <div className="flex-1 overflow-y-auto p-stack-md space-y-3 matrix-scroll bg-background/30">
              {permissions.map((perm, index) => (
                <div key={index} className={`grid grid-cols-[2fr_1fr_1fr_1fr_1fr] gap-4 items-center rounded-xl p-3 border transition-all group ${perm.isLocked ? 'bg-surface-container-lowest/50 border-outline-variant/5 opacity-80' : 'bg-surface-container-lowest shadow-sm border-outline-variant/10 hover:shadow-md hover:border-outline-variant/30'}`}>
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${perm.isLocked ? 'bg-surface-container/50 text-on-surface-variant/50' : 'bg-surface-container text-on-surface-variant'}`}>
                      <span className="material-symbols-outlined text-[18px]">{perm.icon}</span>
                    </div>
                    <div className="flex flex-col">
                      <span className="font-body-md text-body-md font-medium text-on-surface flex items-center gap-1">
                        {perm.module} {perm.isLocked && <span className="material-symbols-outlined text-[14px] text-on-surface-variant" title="Inherited constraint">lock</span>}
                      </span>
                    </div>
                  </div>
                  {['create', 'read', 'update', 'delete'].map((actionName) => {
                    const action = perm[actionName as keyof typeof perm] as { checked: boolean, disabled: boolean, isRemove?: boolean, isError?: boolean };
                    return (
                      <div key={actionName} className="flex justify-center">
                        {action.isRemove ? (
                          <span className="material-symbols-outlined text-outline-variant">remove</span>
                        ) : (
                          <label className="relative inline-flex items-center cursor-pointer">
                            <input type="checkbox" className="sr-only peer" checked={action.checked} disabled={action.disabled} readOnly />
                            <div className={`w-11 h-6 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:rounded-full after:h-5 after:w-5 after:transition-all ${action.disabled ? 'bg-primary/30 after:bg-white/50' : (action.isError ? 'bg-surface-variant peer-checked:bg-error after:bg-white after:border-gray-300 after:border' : (action.checked && action.disabled ? 'bg-primary/50 after:bg-white/80' : 'bg-surface-variant peer-focus:outline-none peer-checked:bg-primary after:bg-white after:border-gray-300 after:border'))}`}></div>
                          </label>
                        )}
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>

            <div className="p-stack-md border-t border-outline-variant/20 bg-surface-container-lowest/80 flex justify-end gap-stack-sm">
              <button className="font-body-sm text-body-sm px-5 py-2.5 rounded-[14px] text-on-surface-variant hover:bg-surface-variant/50 transition-colors">Discard Changes</button>
              <button className="font-body-sm text-body-sm font-medium px-6 py-2.5 rounded-[14px] bg-primary text-on-primary hover:bg-primary/90 shadow-md shadow-primary/20 transition-all">Save Matrix</button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default AdminRolePermission;
