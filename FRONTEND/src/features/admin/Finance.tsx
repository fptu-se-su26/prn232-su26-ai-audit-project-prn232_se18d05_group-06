import React from 'react';
import AdminSidebar from '@components/AdminSidebar';

const kpiCards = [
  {
    title: 'Total Revenue',
    icon: 'payments',
    iconColor: 'text-primary',
    iconBg: 'bg-primary/10',
    circleBg: 'bg-primary/10',
    value: '$2.4M',
    trendIcon: 'trending_up',
    trendIconColor: 'text-success',
    trendValue: '+12.5%',
    trendValueColor: 'text-success',
    trendText: 'vs last month',
  },
  {
    title: 'Expenses',
    icon: 'money_off',
    iconColor: 'text-error',
    iconBg: 'bg-error/10',
    circleBg: 'bg-error/5',
    value: '$1.8M',
    trendIcon: 'trending_up',
    trendIconColor: 'text-error',
    trendValue: '+4.2%',
    trendValueColor: 'text-error',
    trendText: 'vs last month',
  },
  {
    title: 'COD Collected',
    icon: 'local_shipping',
    iconColor: 'text-tertiary',
    iconBg: 'bg-tertiary/10',
    circleBg: 'bg-tertiary/10',
    value: '$450k',
    customTrend: (
      <div className="flex items-center gap-1 bg-surface-container-high px-2 py-0.5 rounded text-xs font-medium text-on-surface-variant">
        <span className="w-1.5 h-1.5 rounded-full bg-success"></span>
        92% Reconciled
      </div>
    ),
  },
  {
    title: 'Profit Margin',
    icon: 'monitoring',
    iconColor: 'text-success',
    iconBg: 'bg-success/10',
    circleBg: 'bg-success/10',
    value: '25%',
    trendIcon: 'trending_up',
    trendIconColor: 'text-success',
    trendValue: '+2.1%',
    trendValueColor: 'text-success',
    trendText: 'vs last quarter',
  },
];

const codReconciliations = [
  {
    name: 'John Doe',
    initials: 'JD',
    avatarBg: 'bg-primary-container text-primary',
    amount: '$1,250.00',
    status: 'Reconciled',
    statusBg: 'bg-success/10 text-success',
    statusDot: 'bg-success',
    date: 'Today',
  },
  {
    name: 'Sarah Ahmed',
    initials: 'SA',
    avatarBg: 'bg-secondary-container text-secondary',
    amount: '$840.50',
    status: 'Pending',
    statusBg: 'bg-surface-variant/30 text-on-surface-variant',
    statusDot: 'bg-outline',
    date: 'Yesterday',
  },
  {
    name: 'Mike Ross',
    initials: 'MR',
    avatarBg: 'bg-tertiary-container text-tertiary',
    amount: '$2,100.00',
    status: 'Reconciled',
    statusBg: 'bg-success/10 text-success',
    statusDot: 'bg-success',
    date: 'Jun 14',
  },
];

const recentInvoices = [
  {
    id: 'INV-2023-089',
    client: 'Acme Logistics Corp.',
    iconBg: 'bg-primary/10 text-primary',
    amount: '$14,500.00',
    amountClass: 'text-on-surface',
    statusText: 'Due in 5 days',
    statusClass: 'text-on-surface-variant',
    hasActions: true,
  },
  {
    id: 'INV-2023-088',
    client: 'Global Freightways',
    iconBg: 'bg-primary/10 text-primary',
    amount: '$8,240.00',
    amountClass: 'text-on-surface',
    statusText: 'Overdue',
    statusClass: 'text-error',
    hasActions: true,
  },
  {
    id: 'INV-2023-087',
    client: 'Prime Delivery Co.',
    iconBg: 'bg-surface-variant/50 text-on-surface-variant',
    amount: '$3,100.00',
    amountClass: 'text-on-surface-variant line-through',
    statusText: 'Paid',
    statusClass: 'text-success',
    hasActions: false,
  },
];

const AdminFinance: React.FC = () => {
  return (
    <div className="bg-background text-on-background font-body-md min-h-screen flex antialiased">
      {/* SideNavBar */}
      <AdminSidebar />

      {/* Main Content Area */}
      <main className="flex-1 md:ml-[280px] w-full max-w-[1600px] mx-auto min-h-screen flex flex-col relative bg-surface-container-low/30">
        {/* Background Decorative Gradient */}
        <div className="absolute top-0 left-0 w-full h-96 bg-gradient-to-b from-primary/5 to-transparent -z-10 pointer-events-none"></div>
        
        {/* TopNavBar */}
        <header className="docked full-width top-0 sticky z-40 bg-surface/70 backdrop-blur-md shadow-sm w-full h-[72px] px-8 flex justify-between items-center text-primary dark:text-inverse-primary">
          <div className="flex items-center gap-8">
            <h2 className="font-headline-sm text-headline-sm font-bold text-on-surface">Finance Management</h2>
            <nav className="hidden lg:flex gap-6 font-body-md text-body-md">
              <a className="text-on-surface-variant hover:text-on-surface hover:bg-surface-container-low rounded-lg px-3 py-1 transition-all" href="#">Analytics</a>
              <a className="text-on-surface-variant hover:text-on-surface hover:bg-surface-container-low rounded-lg px-3 py-1 transition-all" href="#">Reports</a>
              <a className="text-on-surface-variant hover:text-on-surface hover:bg-surface-container-low rounded-lg px-3 py-1 transition-all" href="#">Logs</a>
            </nav>
          </div>
          <div className="flex items-center gap-4">
            <div className="relative hidden md:block">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant/50">search</span>
              <input className="h-12 pl-10 pr-4 w-64 bg-black/5 border-none rounded-[18px] focus:ring-2 focus:ring-primary focus:bg-white transition-all font-body-sm text-body-sm placeholder:text-on-surface-variant/50" placeholder="Search invoices, drivers..." type="text" />
            </div>
            <button className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-surface-container-low transition-colors text-on-surface-variant">
              <span className="material-symbols-outlined">notifications</span>
            </button>
            <button className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-surface-container-low transition-colors text-on-surface-variant">
              <span className="material-symbols-outlined">apps</span>
            </button>
            <div className="w-10 h-10 rounded-full bg-primary/20 overflow-hidden ml-2 border border-primary/30">
              <img alt="Admin User Avatar" className="w-full h-full object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuASnhvk-lpw0ncLpzk09bea-FErx8tGqfIyV__puhA0GNgkq408-W_VO9XhARNhwN61Om4SD_DkR5WGJTn62Mvz8DRIgw8rLwT6iMtlI5_asZFW3PklqXUZxZ-5Ru5-yCkruldLfzJDAjKPHwFk4Panh0xu1csj9eJiyKY1eY5hdJQ-8G2SUluCfyVXSZPUROOcj7ytmtRhRSEIaRH6IfuPD26_V-5P36xmPjhJsTiQVXHPd_AguFMOlGI3RwAU-y6I2G_dhqfO10xL" />
            </div>
          </div>
        </header>

        {/* Content Canvas */}
        <div className="p-4 md:p-container-padding space-y-gutter flex-1">
          {/* KPIs */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
            {kpiCards.map((kpi, index) => (
              <div key={index} className="glass-card rounded-xl p-6 flex flex-col gap-2 relative overflow-hidden group" style={{ backgroundColor: 'rgba(255, 255, 255, 0.7)', backdropFilter: 'blur(12px)', border: '1px solid rgba(255, 255, 255, 0.2)', boxShadow: '0 10px 30px rgba(0, 0, 0, 0.04)', borderTop: '1px solid rgba(255, 255, 255, 0.3)' }}>
                <div className={`absolute top-0 right-0 w-24 h-24 ${kpi.circleBg} rounded-bl-full -mr-4 -mt-4 transition-transform group-hover:scale-110`}></div>
                <div className="flex justify-between items-start">
                  <p className="font-label-md text-label-md text-on-surface-variant uppercase tracking-wider">{kpi.title}</p>
                  <div className={`w-8 h-8 rounded-full ${kpi.iconBg} flex items-center justify-center ${kpi.iconColor}`}>
                    <span className="material-symbols-outlined text-[20px]">{kpi.icon}</span>
                  </div>
                </div>
                <h3 className="font-display-lg text-display-lg text-on-surface mt-2">{kpi.value}</h3>
                <div className="flex items-center gap-2 mt-1">
                  {kpi.customTrend ? (
                    kpi.customTrend
                  ) : (
                    <>
                      <span className={`material-symbols-outlined ${kpi.trendIconColor} text-[16px]`}>{kpi.trendIcon}</span>
                      <span className={`font-body-sm text-body-sm ${kpi.trendValueColor} font-medium`}>{kpi.trendValue}</span>
                      <span className="font-body-sm text-body-sm text-on-surface-variant/70">{kpi.trendText}</span>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Bento Grid Main Content */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Revenue vs Cost Chart (Spans 2 columns) */}
            <div className="lg:col-span-2 glass-card rounded-xl p-6 flex flex-col" style={{ backgroundColor: 'rgba(255, 255, 255, 0.7)', backdropFilter: 'blur(12px)', border: '1px solid rgba(255, 255, 255, 0.2)', boxShadow: '0 10px 30px rgba(0, 0, 0, 0.04)', borderTop: '1px solid rgba(255, 255, 255, 0.3)' }}>
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h3 className="font-headline-sm text-headline-sm text-on-surface font-semibold">Revenue vs Operations</h3>
                  <p className="font-body-sm text-body-sm text-on-surface-variant mt-1">Last 6 months performance</p>
                </div>
                <div className="flex gap-2">
                  <button className="px-3 py-1.5 text-sm font-medium bg-surface-container-low text-on-surface rounded-lg hover:bg-surface-container transition-colors">Monthly</button>
                  <button className="px-3 py-1.5 text-sm font-medium text-on-surface-variant hover:bg-surface-container-low rounded-lg transition-colors">Quarterly</button>
                </div>
              </div>
              {/* Placeholder for Chart */}
              <div className="flex-1 w-full min-h-[300px] relative mt-4 border-b border-l border-surface-variant/50">
                {/* Y-Axis Labels */}
                <div className="absolute -left-10 h-full flex flex-col justify-between text-xs text-on-surface-variant pb-6">
                  <span>$3M</span>
                  <span>$2M</span>
                  <span>$1M</span>
                  <span>0</span>
                </div>
                {/* Grid Lines */}
                <div className="absolute inset-0 flex flex-col justify-between pointer-events-none pb-6">
                  <div className="w-full h-px bg-surface-variant/30"></div>
                  <div className="w-full h-px bg-surface-variant/30"></div>
                  <div className="w-full h-px bg-surface-variant/30"></div>
                  <div className="w-full h-px"></div>
                </div>
                {/* SVG Chart Lines (Visual Mockup) */}
                <svg className="w-full h-full pb-6 overflow-visible" preserveAspectRatio="none" viewBox="0 0 100 100">
                  {/* Revenue Line */}
                  <path className="drop-shadow-md" d="M0,80 Q15,75 30,60 T50,50 T70,30 T100,10" fill="none" stroke="#004ac6" strokeWidth="2"></path>
                  {/* Cost Line */}
                  <path d="M0,90 Q20,85 40,80 T60,65 T80,70 T100,55" fill="none" stroke="#5e6476" strokeDasharray="4,2" strokeWidth="2"></path>
                  {/* Data Points Revenue */}
                  <circle cx="0" cy="80" fill="#004ac6" r="1.5"></circle>
                  <circle cx="30" cy="60" fill="#004ac6" r="1.5"></circle>
                  <circle cx="50" cy="50" fill="#004ac6" r="1.5"></circle>
                  <circle cx="70" cy="30" fill="#004ac6" r="1.5"></circle>
                  <circle cx="100" cy="10" fill="#004ac6" r="1.5"></circle>
                </svg>
                {/* X-Axis Labels */}
                <div className="absolute bottom-0 w-full flex justify-between text-xs text-on-surface-variant px-2">
                  <span>Jan</span>
                  <span>Feb</span>
                  <span>Mar</span>
                  <span>Apr</span>
                  <span>May</span>
                  <span>Jun</span>
                </div>
              </div>
              <div className="flex justify-center gap-6 mt-6">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-primary"></div>
                  <span className="font-body-sm text-body-sm text-on-surface-variant">Revenue</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-secondary border border-surface-variant"></div>
                  <span className="font-body-sm text-body-sm text-on-surface-variant">Operational Costs</span>
                </div>
              </div>
            </div>
            
            {/* AI Forecast */}
            <div className="glass-card rounded-xl p-6 flex flex-col relative overflow-hidden" style={{ backgroundColor: 'rgba(255, 255, 255, 0.7)', backdropFilter: 'blur(12px)', border: '1px solid rgba(255, 255, 255, 0.2)', boxShadow: '0 10px 30px rgba(0, 0, 0, 0.04)', borderTop: '1px solid rgba(255, 255, 255, 0.3)' }}>
              <div className="absolute top-0 left-0 w-full h-1" style={{ background: 'linear-gradient(135deg, #a855f7, #06b6d4)' }}></div>
              <div className="flex justify-between items-start mb-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="material-symbols-outlined text-[18px] text-purple-500">auto_awesome</span>
                    <h3 className="font-headline-sm text-headline-sm text-on-surface font-semibold">AI Forecast</h3>
                  </div>
                  <p className="font-body-sm text-body-sm text-on-surface-variant">July Projected Revenue</p>
                </div>
                <span className="px-2.5 py-1 rounded-full bg-surface-container-high text-xs font-label-md font-medium text-on-surface-variant">
                  94% Confidence
                </span>
              </div>
              <div className="mt-4 flex items-baseline gap-2">
                <span className="font-display-lg text-display-lg text-on-surface">$2.85M</span>
                <span className="text-sm text-on-surface-variant">est.</span>
              </div>
              {/* Mini AI Chart */}
              <div className="flex-1 w-full mt-6 relative min-h-[150px]">
                <svg className="w-full h-full overflow-visible" preserveAspectRatio="none" viewBox="0 0 100 100">
                  {/* Historical Line */}
                  <path d="M0,90 Q30,70 50,50" fill="none" stroke="#004ac6" strokeWidth="2"></path>
                  {/* AI Forecast Cone (Confidence Interval) */}
                  <path d="M50,50 L100,10 L100,50 Z" fill="url(#ai-cone)" opacity="0.2"></path>
                  {/* AI Forecast Line */}
                  <path d="M50,50 Q75,30 100,20" fill="none" stroke="#a855f7" strokeDasharray="2,2" strokeWidth="2"></path>
                  {/* Defs for gradients */}
                  <defs>
                    <linearGradient id="ai-cone" x1="0" x2="1" y1="0" y2="0">
                      <stop offset="0%" stopColor="#06b6d4"></stop>
                      <stop offset="100%" stopColor="#a855f7"></stop>
                    </linearGradient>
                  </defs>
                </svg>
              </div>
              <div className="mt-6 p-3 bg-primary/5 rounded-lg border border-primary/10">
                <p className="font-body-sm text-body-sm text-on-surface">
                  <span className="font-semibold text-primary">Insight:</span> Expanding route efficiency in Sector 4 is projected to increase margins by 2.4% next month.
                </p>
              </div>
            </div>
          </div>

          {/* Bottom Row: Tables & Actions */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* COD Reconciliation */}
            <div className="glass-card rounded-xl p-6 flex flex-col" style={{ backgroundColor: 'rgba(255, 255, 255, 0.7)', backdropFilter: 'blur(12px)', border: '1px solid rgba(255, 255, 255, 0.2)', boxShadow: '0 10px 30px rgba(0, 0, 0, 0.04)', borderTop: '1px solid rgba(255, 255, 255, 0.3)' }}>
              <div className="flex justify-between items-center mb-6">
                <h3 className="font-headline-sm text-headline-sm text-on-surface font-semibold">COD Reconciliation</h3>
                <button className="text-primary hover:text-primary-fixed-variant text-sm font-medium transition-colors">View All</button>
              </div>
              <div className="flex flex-col gap-3">
                {/* Table Header */}
                <div className="grid grid-cols-12 gap-4 px-4 py-2 text-xs font-label-md text-on-surface-variant uppercase tracking-wider border-b border-surface-variant/30">
                  <div className="col-span-4">Driver</div>
                  <div className="col-span-3 text-right">Amount</div>
                  <div className="col-span-3">Status</div>
                  <div className="col-span-2 text-right">Date</div>
                </div>
                {/* Rows */}
                {codReconciliations.map((item, index) => (
                  <div key={index} className="grid grid-cols-12 gap-4 px-4 py-3 bg-surface-container-lowest/50 hover:bg-surface-container-lowest hover:shadow-md rounded-lg transition-all items-center border border-transparent hover:border-surface-variant/30 cursor-pointer">
                    <div className="col-span-4 flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-full ${item.avatarBg} font-bold flex items-center justify-center text-xs`}>{item.initials}</div>
                      <span className="font-body-sm text-body-sm font-medium text-on-surface">{item.name}</span>
                    </div>
                    <div className="col-span-3 text-right font-label-md text-sm text-on-surface">{item.amount}</div>
                    <div className="col-span-3">
                      <span className={`inline-flex items-center gap-1.5 px-2 py-1 rounded ${item.statusBg} text-xs font-medium`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${item.statusDot}`}></span>
                        {item.status}
                      </span>
                    </div>
                    <div className="col-span-2 text-right font-body-sm text-body-sm text-on-surface-variant">{item.date}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Invoice Management */}
            <div className="glass-card rounded-xl p-6 flex flex-col" style={{ backgroundColor: 'rgba(255, 255, 255, 0.7)', backdropFilter: 'blur(12px)', border: '1px solid rgba(255, 255, 255, 0.2)', boxShadow: '0 10px 30px rgba(0, 0, 0, 0.04)', borderTop: '1px solid rgba(255, 255, 255, 0.3)' }}>
              <div className="flex justify-between items-center mb-6">
                <h3 className="font-headline-sm text-headline-sm text-on-surface font-semibold">Recent Invoices</h3>
                <div className="flex gap-2">
                  <button className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-surface-container transition-colors text-on-surface-variant">
                    <span className="material-symbols-outlined text-[20px]">filter_list</span>
                  </button>
                </div>
              </div>
              <div className="flex flex-col gap-3">
                {/* Invoice Items */}
                {recentInvoices.map((invoice, index) => (
                  <div key={index} className="flex items-center justify-between p-4 bg-surface-container-lowest/50 hover:bg-surface-container-lowest hover:shadow-md rounded-lg border border-transparent hover:border-surface-variant/30 transition-all group">
                    <div className="flex items-center gap-4">
                      <div className={`w-10 h-10 rounded-lg ${invoice.iconBg} flex items-center justify-center`}>
                        <span className="material-symbols-outlined">description</span>
                      </div>
                      <div>
                        <h4 className="font-body-md text-body-md font-medium text-on-surface">{invoice.id}</h4>
                        <p className="font-body-sm text-body-sm text-on-surface-variant">{invoice.client}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-6">
                      <div className="text-right">
                        <p className={`font-label-md text-sm ${invoice.amountClass}`}>{invoice.amount}</p>
                        <p className={`font-body-sm text-xs ${invoice.statusClass} mt-0.5`}>{invoice.statusText}</p>
                      </div>
                      <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button className="px-3 py-1.5 text-xs font-medium border border-outline-variant text-on-surface-variant hover:bg-surface-container hover:text-on-surface rounded-md transition-colors flex items-center gap-1">
                          <span className="material-symbols-outlined text-[16px]">picture_as_pdf</span>
                          PDF
                        </button>
                        {invoice.hasActions && (
                          <button className="px-3 py-1.5 text-xs font-medium bg-primary/10 text-primary hover:bg-primary/20 rounded-md transition-colors flex items-center gap-1">
                            <span className="material-symbols-outlined text-[16px]">download</span>
                            Export
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <button className="w-full mt-4 py-3 rounded-xl border border-dashed border-outline-variant text-on-surface-variant hover:text-primary hover:border-primary hover:bg-primary/5 transition-all flex items-center justify-center gap-2 font-medium text-sm">
                <span className="material-symbols-outlined text-[18px]">add</span>
                Create New Invoice
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default AdminFinance;
