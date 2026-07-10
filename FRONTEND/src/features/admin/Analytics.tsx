import React, { useEffect } from 'react';
import AdminSidebar from '@components/AdminSidebar';

const metricCards = [
  {
    icon: 'payments',
    iconBgClass: 'bg-primary-container',
    iconTextClass: 'text-on-primary-container',
    chip: {
      text: '+12.4%',
      icon: 'trending_up',
      className: 'ai-chip px-2 py-1 rounded-full font-label-md text-label-md flex items-center gap-1',
    },
    title: 'Gross Revenue (Mtd)',
    value: '$4.2M',
    hasSparkline: true,
  },
  {
    icon: 'speed',
    iconBgClass: 'bg-tertiary-container',
    iconTextClass: 'text-on-tertiary-container',
    chip: {
      text: 'AI Optimized',
      icon: 'psychology',
      className: 'ai-chip px-2 py-1 rounded-full font-label-md text-label-md flex items-center gap-1 bg-gradient-to-r from-teal-500/10 to-cyan-500/10 border-teal-500/20 text-teal-700',
    },
    title: 'Fleet Efficiency Score',
    value: '94.2/100',
  },
  {
    icon: 'route',
    iconBgClass: 'bg-secondary-container',
    iconTextClass: 'text-on-secondary-container',
    title: 'Active Global Routes',
    value: '1,204',
  },
  {
    icon: 'warning',
    iconBgClass: 'bg-error-container',
    iconTextClass: 'text-on-error-container',
    chip: {
      text: '3 Critical',
      icon: null,
      className: 'px-2 py-1 rounded-full bg-error/10 text-error font-label-md text-label-md flex items-center gap-1',
    },
    title: 'Bottleneck Alerts',
    value: '12',
  },
];

const AdminAnalytics: React.FC = () => {
  useEffect(() => {
    // If you want to initialize Chart.js, you would do it here.
    // Ensure Chart.js is imported or loaded in your app.
  }, []);

  return (
    <div className="bg-background text-on-background font-body-md text-body-md antialiased overflow-x-hidden flex h-screen">
      {/* SideNavBar */}
      <AdminSidebar />

      {/* Main Content Area */}
      <div className="flex-1 md:ml-[280px] flex flex-col min-h-screen relative bg-background">
        {/* Abstract Background Elements */}
        <div className="absolute top-0 left-0 w-full h-[500px] bg-gradient-to-b from-primary-fixed/30 to-transparent pointer-events-none -z-10"></div>
        <div className="absolute top-[-20%] right-[-10%] w-[800px] h-[800px] bg-tertiary-fixed/20 rounded-full blur-3xl pointer-events-none -z-10"></div>

        {/* TopNavBar */}
        <header className="bg-surface/70 backdrop-blur-md docked full-width top-0 sticky bg-transparent shadow-sm z-40">
          <div className="flex justify-between items-center w-full h-[72px] px-8 max-w-[1600px] ml-auto">
            <div className="flex items-center gap-6">
              <h2 className="font-headline-sm text-headline-sm font-bold text-on-surface">BI Analytics</h2>
              <div className="hidden lg:flex items-center gap-4 ml-4">
                <nav className="flex gap-1">
                  <a className="px-4 py-2 text-primary font-bold border-b-2 border-primary pb-1 font-body-md text-body-md opacity-80" href="#">Analytics</a>
                  <a className="px-4 py-2 text-on-surface-variant hover:text-on-surface transition-colors hover:bg-surface-container-low rounded-lg transition-all font-body-md text-body-md" href="#">Reports</a>
                  <a className="px-4 py-2 text-on-surface-variant hover:text-on-surface transition-colors hover:bg-surface-container-low rounded-lg transition-all font-body-md text-body-md" href="#">Logs</a>
                </nav>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="relative hidden sm:block">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant">search</span>
                <input className="w-64 h-[48px] bg-black/5 border-none rounded-[18px] pl-10 pr-4 focus:ring-2 focus:ring-primary focus:bg-white transition-all font-body-md text-body-md" placeholder="Search analytics..." type="text" />
              </div>
              <div className="flex items-center gap-2">
                <button className="p-2 text-on-surface-variant hover:bg-surface-container-low rounded-full transition-colors relative">
                  <span className="material-symbols-outlined" data-icon="notifications">notifications</span>
                  <span className="absolute top-1 right-1 w-2 h-2 bg-error rounded-full"></span>
                </button>
                <button className="p-2 text-on-surface-variant hover:bg-surface-container-low rounded-full transition-colors hidden sm:block">
                  <span className="material-symbols-outlined" data-icon="apps">apps</span>
                </button>
              </div>
              <div className="h-8 w-px bg-outline-variant mx-2"></div>
              <button className="hidden sm:block px-4 py-2 btn-primary-gradient text-white rounded-[18px] font-body-md text-body-md font-medium shadow-sm hover:shadow-md transition-shadow">
                New Shipment
              </button>
              <img alt="User profile" className="w-10 h-10 rounded-full border-2 border-white shadow-sm cursor-pointer" data-alt="A professional headshot of a corporate logistics administrator in a well-lit modern office. The lighting is soft and bright, emphasizing a clean, premium light-mode aesthetic. The color palette includes neutral grays and subtle blue tones, projecting confidence and executive control. The mood is focused and efficient, suitable for a high-end enterprise SaaS dashboard." src="https://lh3.googleusercontent.com/aida-public/AB6AXuAUhXljdoI6w-a-ooz62iQ3bvMCG3gbhH3EZRx1egynIB8glAznaWowfjkANuzSQ4brM2ZpAZbBG58LSEspDcY3QYt8upJcSO7MWnwfZ8aGZsxyTEZcF6g5wQNh2jblW4S6HvZ3FBWuKvb8jTaLCr3cAiBDZGKQgpYFz55Z-mw1XnZAw_nuEK4SsKPWV_H-3JhQ933k-Xuce1zuJWZ8n3ynW5s_eLwDtEFqm7n9FaUm3i2_mcE3swNj3Ohf0NZYYWbLimxfiXKx9s-3" />
            </div>
          </div>
        </header>

        {/* Dashboard Canvas */}
        <main className="flex-1 p-4 md:p-8 max-w-[1600px] w-full mx-auto flex flex-col gap-8">
          {/* Page Header & Filters */}
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
            <div>
              <h2 className="font-display-lg text-display-lg text-on-surface">Business Intelligence</h2>
              <p className="font-body-lg text-body-lg text-on-surface-variant mt-1">Real-time predictive analytics and executive summary.</p>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <div className="glass-panel px-3 py-2 rounded-lg flex items-center gap-2 cursor-pointer hover:bg-white/90 transition-colors border border-outline-variant/30">
                <span className="material-symbols-outlined text-on-surface-variant text-sm">calendar_month</span>
                <span className="font-label-md text-label-md text-on-surface font-medium">Last 30 Days</span>
                <span className="material-symbols-outlined text-on-surface-variant text-sm">expand_more</span>
              </div>
              <div className="glass-panel px-3 py-2 rounded-lg flex items-center gap-2 cursor-pointer hover:bg-white/90 transition-colors border border-outline-variant/30">
                <span className="material-symbols-outlined text-on-surface-variant text-sm">public</span>
                <span className="font-label-md text-label-md text-on-surface font-medium">Global Region</span>
                <span className="material-symbols-outlined text-on-surface-variant text-sm">expand_more</span>
              </div>
              <div className="glass-panel px-3 py-2 rounded-lg flex items-center gap-2 cursor-pointer hover:bg-white/90 transition-colors border border-outline-variant/30">
                <span className="material-symbols-outlined text-primary text-sm">download</span>
                <span className="font-label-md text-label-md text-primary font-medium">Export</span>
              </div>
            </div>
          </div>

          {/* Bento Grid Layout */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
            {metricCards.map((card, index) => (
              <div key={index} className="glass-panel rounded-xl p-6 flex flex-col gap-4 relative overflow-hidden group hover:shadow-lg transition-all">
                <div className="flex justify-between items-start">
                  <div className={`w-10 h-10 rounded-full ${card.iconBgClass} flex items-center justify-center`}>
                    <span className={`material-symbols-outlined ${card.iconTextClass}`}>{card.icon}</span>
                  </div>
                  {card.chip && (
                    <span className={card.chip.className}>
                      {card.chip.icon && (
                        <span className="material-symbols-outlined text-[14px]">{card.chip.icon}</span>
                      )}
                      {card.chip.icon ? ` ${card.chip.text}` : card.chip.text}
                    </span>
                  )}
                </div>
                <div>
                  <p className="font-label-md text-label-md text-on-surface-variant uppercase tracking-wider font-bold">{card.title}</p>
                  <h3 className="font-headline-lg text-headline-lg text-on-surface mt-1 font-black">{card.value}</h3>
                </div>
                {/* Mini Sparkline Placeholder */}
                {card.hasSparkline && (
                  <div className="absolute bottom-0 left-0 w-full h-12 bg-gradient-to-t from-primary/10 to-transparent -z-10"></div>
                )}
              </div>
            ))}
          </div>

          {/* Complex Visualization Row */}
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
            {/* Revenue Trends Chart */}
            <div className="glass-panel rounded-xl p-6 xl:col-span-2 flex flex-col h-[400px]">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-headline-sm text-headline-sm font-bold text-on-surface">Revenue &amp; Volume Forecasting</h3>
                <div className="flex gap-2">
                  <button className="px-3 py-1 bg-surface-container-low rounded-md font-label-md text-label-md text-on-surface">Vol</button>
                  <button className="px-3 py-1 bg-primary text-on-primary rounded-md font-label-md text-label-md shadow-sm">Rev</button>
                </div>
              </div>
              <div className="flex-1 relative w-full h-full">
                <canvas id="revenueChart"></canvas>
              </div>
            </div>

            {/* Geography Heatmap Placeholder */}
            <div className="glass-panel rounded-xl p-0 flex flex-col h-[400px] overflow-hidden relative">
              <div className="absolute top-0 left-0 w-full p-6 z-10 bg-gradient-to-b from-background/80 to-transparent">
                <h3 className="font-headline-sm text-headline-sm font-bold text-on-surface">Density Heatmap</h3>
                <p className="font-body-sm text-body-sm font-medium text-on-surface-variant">High-volume delivery zones</p>
              </div>
              <div className="flex-1 w-full h-full bg-surface-variant/30 relative">
                {/* Abstract Map Visual */}
                <div className="absolute inset-0 opacity-40 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0MDAiIGhlaWdodD0iNDAwIj48cGF0aCBkPSJNMTAwIDEwMFEyMDAgNTAgMzAwIDIwMFEyNTAgMzAwIDE1MCAzMDBaIiBmaWxsPSIjYmI5OTk5Ii8+PC9zdmc+')] bg-cover bg-center"></div>
                
                {/* Heatmap dots */}
                <div className="absolute top-[40%] left-[30%] w-6 h-6 rounded-full bg-error/50 blur-sm shadow-[0_0_20px_10px_rgba(186,26,26,0.3)]"></div>
                <div className="absolute top-[45%] left-[32%] w-3 h-3 rounded-full bg-error"></div>
                <div className="absolute top-[60%] left-[60%] w-8 h-8 rounded-full bg-primary/40 blur-md shadow-[0_0_20px_10px_rgba(0,74,198,0.3)]"></div>
                
                <div className="absolute bottom-4 right-4 glass-panel px-3 py-2 rounded-lg flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-error"></span>
                  <span className="font-label-md text-label-md text-on-surface">Critical Density</span>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminAnalytics;
