import React, { ReactNode } from 'react';
import AdminSidebar from './AdminSidebar';

interface AdminPageLayoutProps {
  title: string;
  subtitle?: string;
  children: ReactNode;
  headerRight?: ReactNode;
}

const AdminPageLayout: React.FC<AdminPageLayoutProps> = ({ title, subtitle, children, headerRight }) => {
  return (
    <div className="flex h-screen overflow-hidden" style={{ background: 'linear-gradient(135deg, #1a1d2e 0%, #16213e 50%, #0f3460 100%)' }}>
      {/* SideNavBar */}
      <AdminSidebar />

      {/* Main Content Area */}
      <div className="flex-1 md:ml-[280px] flex flex-col min-h-screen relative overflow-y-auto">
        {/* Subtle glow accents */}
        <div className="absolute top-0 right-0 w-[600px] h-[400px] rounded-full blur-[120px] pointer-events-none" style={{ background: 'radial-gradient(circle, rgba(99,102,241,0.12) 0%, transparent 70%)' }}></div>
        <div className="absolute bottom-0 left-0 w-[400px] h-[300px] rounded-full blur-[100px] pointer-events-none" style={{ background: 'radial-gradient(circle, rgba(14,165,233,0.08) 0%, transparent 70%)' }}></div>

        {/* TopNavBar */}
        <header className="sticky top-0 z-40 backdrop-blur-xl border-b" style={{ background: 'rgba(22, 33, 62, 0.85)', borderColor: 'rgba(255,255,255,0.06)' }}>
          <div className="flex justify-between items-center w-full h-[72px] px-8 max-w-[1600px] ml-auto">
            <div className="flex items-center gap-4">
              <div>
                <h2 className="text-white font-bold text-xl tracking-tight">{title}</h2>
                {subtitle && <p className="text-slate-400 text-sm mt-0.5">{subtitle}</p>}
              </div>
            </div>
            <div className="flex items-center gap-3">
              {headerRight ?? (
                <>
                  <div className="relative hidden sm:block">
                    <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-[20px]">search</span>
                    <input
                      className="w-60 h-[42px] rounded-xl pl-10 pr-4 text-sm text-white outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all"
                      style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.1)' }}
                      placeholder={`Search...`}
                      type="text"
                    />
                  </div>
                  <button className="w-10 h-10 rounded-xl flex items-center justify-center text-slate-400 hover:text-white transition-colors relative" style={{ background: 'rgba(255,255,255,0.07)' }}>
                    <span className="material-symbols-outlined text-[22px]">notifications</span>
                    <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full"></span>
                  </button>
                  <div className="h-8 w-px mx-1" style={{ background: 'rgba(255,255,255,0.1)' }}></div>
                  <img
                    alt="User profile"
                    className="w-9 h-9 rounded-xl cursor-pointer ring-2 ring-indigo-500/30 hover:ring-indigo-400/60 transition-all"
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuCkL04fYHcClwlaI9coEz6Ws1v5PWlrO9066dDZlGrNO4VuAFbbWrsZ1As6P8HBWAsbURx7lkUV5Z4sTEuEsO3INR8ATgC60f6dffPewxr68rle-lrafArPL9bOYABuhX0zafVeaVl8U6Ony1FJxvdl6oPFd04O45nUhpWDqWK2b6c8XRVaeYwtsgwi3TRy5SAAmZ6X_8gtFxndo0x89kn7td1Luk2ORHRMyBowOskJqsefKiFBXuGTcPsmggc0XtdPHw_MJHEGk_rG"
                  />
                </>
              )}
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-6 md:p-8 max-w-[1600px] w-full mx-auto flex flex-col gap-6">
          {children}
        </main>
      </div>
    </div>
  );
};

export default AdminPageLayout;
