import React from 'react';
import AdminSidebar from '@components/AdminSidebar';

const kpiCards = [
  {
    title: 'Total Orders',
    icon: 'inventory_2',
    iconColorClass: 'text-primary',
    iconBgClass: 'bg-primary/10',
    circleBgClass: 'bg-primary/5',
    value: '12,482',
    trendIcon: 'trending_up',
    trendText: '+8.4% vs last week',
    trendClass: 'text-tertiary',
  },
  {
    title: 'Active Deliveries',
    icon: 'local_shipping',
    iconColorClass: 'text-tertiary-container',
    iconBgClass: 'bg-tertiary-container/10',
    circleBgClass: 'bg-tertiary-container/5',
    value: '3,194',
    trendIcon: null,
    trendDotClass: 'w-2 h-2 rounded-full bg-tertiary-fixed-dim animate-pulse',
    trendText: '98% on time',
    trendClass: 'text-tertiary',
  },
  {
    title: 'Total Revenue',
    icon: 'payments',
    iconColorClass: 'text-primary',
    iconBgClass: 'bg-primary/10',
    circleBgClass: 'bg-primary/5',
    value: '$2.4M',
    trendIcon: 'trending_up',
    trendText: '+12.1% MTD',
    trendClass: 'text-tertiary',
  },
  {
    title: 'Warehouse Cap.',
    icon: 'warehouse',
    iconColorClass: 'text-error',
    iconBgClass: 'bg-error/10',
    circleBgClass: 'bg-error/5',
    value: '87%',
    hasProgress: true,
    progressValue: '87%',
  },
];

const aiInsights = [
  {
    title: 'Delay Prediction',
    icon: 'warning',
    iconBgClass: 'bg-error-container',
    iconTextClass: 'text-on-error-container',
    description: 'High probability (85%) of 45m delays on Route I-95 North due to severe weather front.',
    actionText: 'Reroute 14 vehicles',
  },
  {
    title: 'Capacity Alert',
    icon: 'warehouse',
    iconBgClass: 'bg-tertiary-container',
    iconTextClass: 'text-on-tertiary-container',
    description: 'Hub Alpha will reach 95% capacity by 14:00. Recommend redirecting incoming freight to Hub Beta.',
  },
];

const AdminDashboard: React.FC = () => {
  return (
    <div className="bg-background text-on-background font-body-md overflow-x-hidden">
      {/* SideNavBar */}
      <AdminSidebar />

      {/* Main Content Area */}
      <main className="md:ml-[280px] min-h-screen flex flex-col relative">
        {/* TopNavBar */}
        <header className="flex justify-between items-center w-full px-container-padding py-stack-md bg-surface/70 backdrop-blur-md border-b border-outline-variant/20 shadow-sm sticky top-0 z-40">
          <div>
            <h2 className="font-headline-md text-headline-md font-bold text-on-surface">Operations Center</h2>
          </div>
          <div className="flex items-center gap-4">
            <div className="relative focus-within:ring-2 focus-within:ring-primary/50 rounded-full transition-all">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline" data-icon="search">search</span>
              <input className="pl-10 pr-4 py-2 bg-surface-variant/50 border-none rounded-full font-body-sm w-64 focus:bg-surface focus:ring-0" placeholder="Search orders, fleets..." type="text" />
            </div>
            <button className="w-10 h-10 rounded-full flex items-center justify-center text-on-surface-variant hover:text-primary transition-colors bg-surface-variant/50 relative">
              <span className="material-symbols-outlined" data-icon="notifications">notifications</span>
              <span className="absolute top-2 right-2 w-2 h-2 bg-error rounded-full"></span>
            </button>
            <button className="w-10 h-10 rounded-full bg-secondary-container overflow-hidden border border-outline-variant/30">
              <img alt="Admin User Profile" className="w-full h-full object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuCkL04fYHcClwlaI9coEz6Ws1v5PWlrO9066dDZlGrNO4VuAFbbWrsZ1As6P8HBWAsbURx7lkUV5Z4sTEuEsO3INR8ATgC60f6dffPewxr68rle-lrafArPL9bOYABuhX0zafVeaVl8U6Ony1FJxvdl6oPFd04O45nUhpWDqWK2b6c8XRVaeYwtsgwi3TRy5SAAmZ6X_8gtFxndo0x89kn7td1Luk2ORHRMyBowOskJqsefKiFBXuGTcPsmggc0XtdPHw_MJHEGk_rG" />
            </button>
          </div>
        </header>

        <div className="flex-1 p-container-padding max-w-[1600px] mx-auto w-full space-y-gutter relative z-10">
          {/* KPI Grid */}
          <section className="grid grid-cols-2 md:grid-cols-4 gap-stack-md">
            {kpiCards.map((kpi, index) => (
              <div key={index} className="glass-card rounded-xl p-4 flex flex-col gap-2 relative overflow-hidden group hover:-translate-y-1 transition-transform duration-300" style={{ background: 'rgba(255, 255, 255, 0.7)', backdropFilter: 'blur(12px)', border: '1px solid rgba(255, 255, 255, 0.4)', boxShadow: '0 10px 30px rgba(0, 74, 198, 0.04)' }}>
                <div className={`absolute -right-4 -top-4 w-16 h-16 ${kpi.circleBgClass} rounded-full group-hover:scale-150 transition-transform duration-500`}></div>
                <div className="flex justify-between items-start">
                  <span className="font-label-md text-label-md text-on-surface-variant uppercase tracking-wider">{kpi.title}</span>
                  <div className={`p-1.5 ${kpi.iconBgClass} rounded-lg ${kpi.iconColorClass}`}>
                    <span className="material-symbols-outlined text-sm" data-icon={kpi.icon}>{kpi.icon}</span>
                  </div>
                </div>
                <div className="font-headline-lg text-headline-lg font-bold text-on-surface">{kpi.value}</div>
                {kpi.hasProgress ? (
                  <div className="w-full bg-surface-variant rounded-full h-1.5 mt-1">
                    <div className="bg-error h-1.5 rounded-full" style={{ width: kpi.progressValue }}></div>
                  </div>
                ) : (
                  <div className={`flex items-center gap-1 font-body-sm text-body-sm ${kpi.trendClass}`}>
                    {kpi.trendIcon ? (
                      <span className="material-symbols-outlined text-sm" data-icon={kpi.trendIcon}>{kpi.trendIcon}</span>
                    ) : (
                      <span className={kpi.trendDotClass}></span>
                    )}
                    <span>{kpi.trendText}</span>
                  </div>
                )}
              </div>
            ))}
          </section>

          {/* Map & AI Section Bento Grid */}
          <section className="grid grid-cols-1 lg:grid-cols-3 gap-stack-md h-[500px]">
            {/* Main Map Canvas */}
            <div className="lg:col-span-2 glass-card rounded-2xl overflow-hidden relative border border-outline-variant/30 flex flex-col shadow-lg" style={{ background: 'rgba(255, 255, 255, 0.7)', backdropFilter: 'blur(12px)', border: '1px solid rgba(255, 255, 255, 0.4)', boxShadow: '0 10px 30px rgba(0, 74, 198, 0.04)' }}>
              <div className="absolute inset-0 z-0">
                <div className="w-full h-full bg-surface-dim relative overflow-hidden">
                  <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1524661135-423995f22d0b?q=80&amp;w=2074&amp;auto=format&amp;fit=crop')] bg-cover bg-center opacity-40 mix-blend-luminosity"></div>
                  {/* Animated Map Elements */}
                  <div className="absolute top-[30%] left-[40%] w-3 h-3 bg-tertiary-fixed-dim rounded-full shadow-[0_0_10px_#4cd7f6] animate-pulse"></div>
                  <div className="absolute top-[45%] left-[60%] w-4 h-4 bg-primary rounded-full shadow-[0_0_15px_#004ac6] flex items-center justify-center">
                    <div className="w-2 h-2 bg-white rounded-full animate-ping"></div>
                  </div>
                  {/* Route Line SVG approximation using CSS */}
                  <svg className="absolute inset-0 w-full h-full pointer-events-none" preserveAspectRatio="none" viewBox="0 0 100 100">
                    <path className="opacity-70" d="M40,30 Q50,40 60,45 T80,60" fill="none" stroke="#4cd7f6" strokeDasharray="2,2" strokeWidth="0.5"></path>
                  </svg>
                </div>
              </div>
              <div className="relative z-10 p-4 flex justify-between items-start" style={{ background: 'linear-gradient(180deg, rgba(250,248,255,0) 0%, rgba(250,248,255,1) 100%)' }}>
                <div className="flex gap-2">
                  <span className="px-3 py-1 bg-surface/90 backdrop-blur rounded-full font-label-md text-label-md border border-outline-variant/20 shadow-sm flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-primary"></span> Live Fleet
                  </span>
                  <span className="px-3 py-1 bg-surface/90 backdrop-blur rounded-full font-label-md text-label-md border border-outline-variant/20 shadow-sm flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-tertiary-fixed-dim"></span> Hubs
                  </span>
                </div>
                <div className="flex gap-2">
                  <button className="w-8 h-8 bg-surface/90 backdrop-blur rounded-lg border border-outline-variant/20 flex items-center justify-center hover:bg-surface-variant transition-colors shadow-sm">
                    <span className="material-symbols-outlined text-sm" data-icon="add">add</span>
                  </button>
                  <button className="w-8 h-8 bg-surface/90 backdrop-blur rounded-lg border border-outline-variant/20 flex items-center justify-center hover:bg-surface-variant transition-colors shadow-sm">
                    <span className="material-symbols-outlined text-sm" data-icon="remove">remove</span>
                  </button>
                </div>
              </div>
            </div>

            {/* AI Insights Panel */}
            <div className="glass-card rounded-2xl p-6 flex flex-col gap-4 border-t-4 border-t-primary-fixed-dim shadow-lg" style={{ background: 'rgba(255, 255, 255, 0.7)', backdropFilter: 'blur(12px)', border: '1px solid rgba(255, 255, 255, 0.4)', boxShadow: '0 10px 30px rgba(0, 74, 198, 0.04)' }}>
              <div className="flex items-center gap-2 mb-2">
                <span className="material-symbols-outlined text-primary-fixed-dim" data-icon="auto_awesome">auto_awesome</span>
                <h3 className="font-headline-sm text-headline-sm font-bold text-on-surface">AI Insights</h3>
              </div>
              <div className="flex-1 space-y-3 overflow-y-auto custom-scrollbar pr-2">
                {aiInsights.map((insight, index) => (
                  <div key={index} className="p-4 rounded-xl bg-surface-container-low border border-outline-variant/20 hover:border-primary/30 transition-colors">
                    <div className="flex items-start gap-3">
                      <div className={`p-2 ${insight.iconBgClass} ${insight.iconTextClass} rounded-lg`}>
                        <span className="material-symbols-outlined text-sm" data-icon={insight.icon}>{insight.icon}</span>
                      </div>
                      <div>
                        <h4 className="font-label-md text-label-md font-bold text-on-surface mb-1">{insight.title}</h4>
                        <p className="font-body-sm text-body-sm text-on-surface-variant leading-tight">{insight.description}</p>
                        {insight.actionText && (
                          <button className="mt-2 text-primary font-label-md text-label-md hover:underline flex items-center gap-1">
                            {insight.actionText} <span className="material-symbols-outlined text-[14px]" data-icon="arrow_forward">arrow_forward</span>
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
};

export default AdminDashboard;
