import Sidebar from './components/Sidebar'
import { useState } from 'react'

const Notifications = () => {
  const [activeTab, setActiveTab] = useState('All Alerts')

  const tabs = ['All Alerts', 'Low Stock', 'Transfers', 'Audits', 'AI Warnings']

  return (
    <div className="min-h-screen bg-surface text-on-surface antialiased overflow-hidden flex">
      <Sidebar />

      <main className="ml-[280px] h-screen flex-1 flex flex-col relative overflow-hidden bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-primary-fixed/20 via-surface to-surface">
        {/* Top Navigation Bar */}
        <header className="h-20 bg-surface/75 backdrop-blur-md border-b border-outline-variant/30 flex justify-between items-center px-gutter shrink-0 z-40">
          <div className="flex items-center gap-stack_md">
            <h2 className="font-headline-md text-headline-md font-bold text-on-surface">Notification Center</h2>
            <div className="px-3 py-1 bg-primary-container/10 border border-primary-container/20 rounded-full flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-primary animate-pulse"></span>
              <span className="text-label-md text-primary font-bold">LIVE FEED</span>
            </div>
          </div>
          
          <div className="flex items-center gap-6">
            <div className="relative group">
              <span className="absolute inset-y-0 left-3 flex items-center text-outline">
                <span className="material-symbols-outlined text-[20px]">search</span>
              </span>
              <input 
                className="bg-surface-container-low border-none rounded-full pl-10 pr-4 py-2 w-64 text-body-md focus:ring-2 focus:ring-primary transition-all duration-300 group-focus-within:w-80" 
                placeholder="Search alerts..." 
                type="text" 
              />
            </div>
            
            <div className="flex items-center gap-3">
              <button className="p-2 hover:bg-surface-container-high/50 rounded-full transition-all duration-200">
                <span className="material-symbols-outlined text-on-surface-variant">smart_toy</span>
              </button>
              <button className="p-2 hover:bg-surface-container-high/50 rounded-full transition-all duration-200">
                <span className="material-symbols-outlined text-on-surface-variant">help_outline</span>
              </button>
            </div>
          </div>
        </header>

        {/* Content Canvas */}
        <div className="flex-1 overflow-y-auto p-container_padding custom-scrollbar animate-fade-in-up">
          {/* Filters & Global Actions */}
          <div className="flex justify-between items-center mb-stack_lg">
            <div className="flex gap-stack_sm">
              {tabs.map(tab => (
                <button 
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-5 py-2.5 rounded-full font-label-md text-label-md transition-all ${
                    activeTab === tab 
                      ? 'bg-primary text-on-primary shadow-md shadow-primary/20 hover:opacity-90' 
                      : 'bg-surface-container-high text-on-surface-variant hover:bg-primary-container/20 hover:text-primary'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>
            
            <div className="flex items-center gap-stack_md">
              <button className="flex items-center gap-2 text-primary font-label-md text-label-md hover:underline">
                <span className="material-symbols-outlined text-[18px]">done_all</span>
                Mark all as read
              </button>
              <button className="flex items-center gap-2 text-outline font-label-md text-label-md hover:text-error transition-colors">
                <span className="material-symbols-outlined text-[18px]">delete_sweep</span>
                Clear all
              </button>
            </div>
          </div>

          {/* Notification Bento Grid / List */}
          <div className="grid grid-cols-1 gap-stack_md">
            {/* RED ALERT: Low Stock */}
            <div className="notification-entry glass-card p-stack_md rounded-xl flex items-start gap-stack_md status-glow-red relative group hover:opacity-100 cursor-pointer" style={{ animationDelay: '0.1s' }}>
              <div className="w-1.5 h-full absolute left-0 top-0 rounded-l-xl bg-error"></div>
              <div className="w-12 h-12 rounded-xl bg-error/10 flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined text-error">warning</span>
              </div>
              <div className="flex-1">
                <div className="flex justify-between items-start mb-1">
                  <h3 className="font-headline-sm text-lg font-bold text-on-surface">Low Stock Alert</h3>
                  <span className="text-[12px] text-outline-variant font-medium">2 mins ago</span>
                </div>
                <p className="text-body-md text-on-surface-variant">SKU-7239-X reaching critical level in <span className="font-bold text-on-surface">Zone B</span>. Current inventory: 12 units. Reorder point: 50 units.</p>
                <div className="mt-4 flex items-center gap-3">
                  <button className="px-4 py-1.5 rounded-lg bg-error text-on-error text-label-md font-bold hover:opacity-90 transition-all shadow-sm">Initiate Restock</button>
                  <button className="px-4 py-1.5 rounded-lg border border-outline-variant text-on-surface-variant text-label-md font-bold hover:bg-surface-variant transition-all">View Analytics</button>
                </div>
              </div>
              <button className="opacity-0 group-hover:opacity-100 p-2 text-outline-variant hover:text-on-surface-variant transition-opacity">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            {/* GREEN SUCCESS: Transfer Completed */}
            <div className="notification-entry glass-card p-stack_md rounded-xl flex items-start gap-stack_md status-glow-green relative group hover:opacity-100 cursor-pointer" style={{ animationDelay: '0.2s' }}>
              <div className="w-1.5 h-full absolute left-0 top-0 rounded-l-xl bg-secondary"></div>
              <div className="w-12 h-12 rounded-xl bg-secondary-container/20 flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined text-secondary">check_circle</span>
              </div>
              <div className="flex-1">
                <div className="flex justify-between items-start mb-1">
                  <h3 className="font-headline-sm text-lg font-bold text-on-surface">Transfer Completed</h3>
                  <span className="text-[12px] text-outline-variant font-medium">15 mins ago</span>
                </div>
                <p className="text-body-md text-on-surface-variant">Shipment <span className="font-data-mono text-primary">#WT-2024-8842</span> arrived at <span className="font-bold">Hub-Alpha</span>. All 48 pallets accounted for and processed.</p>
                <div className="mt-4 flex items-center gap-3">
                  <button className="px-4 py-1.5 rounded-lg bg-secondary text-on-secondary text-label-md font-bold hover:opacity-90 transition-all shadow-sm">View Manifest</button>
                  <button className="px-4 py-1.5 rounded-lg border border-outline-variant text-on-surface-variant text-label-md font-bold hover:bg-surface-variant transition-all">Acknowledge</button>
                </div>
              </div>
              <button className="opacity-0 group-hover:opacity-100 p-2 text-outline-variant hover:text-on-surface-variant transition-opacity">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            {/* BLUE INFO: Audit Reminder */}
            <div className="notification-entry glass-card p-stack_md rounded-xl flex items-start gap-stack_md status-glow-blue relative group hover:opacity-100 cursor-pointer" style={{ animationDelay: '0.3s' }}>
              <div className="w-1.5 h-full absolute left-0 top-0 rounded-l-xl bg-primary"></div>
              <div className="w-12 h-12 rounded-xl bg-primary-container/10 flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined text-primary">calendar_today</span>
              </div>
              <div className="flex-1">
                <div className="flex justify-between items-start mb-1">
                  <h3 className="font-headline-sm text-lg font-bold text-on-surface">Audit Reminder</h3>
                  <span className="text-[12px] text-outline-variant font-medium">1 hour ago</span>
                </div>
                <p className="text-body-md text-on-surface-variant">Quarterly audit for <span className="font-bold">Zone C</span> scheduled for tomorrow. Please ensure all scanners are calibrated.</p>
                <div className="mt-4 flex items-center gap-3">
                  <button className="px-4 py-1.5 rounded-lg bg-primary text-on-primary text-label-md font-bold hover:opacity-90 transition-all shadow-sm">Prepare Zone</button>
                  <button className="px-4 py-1.5 rounded-lg border border-outline-variant text-on-surface-variant text-label-md font-bold hover:bg-surface-variant transition-all">Reschedule</button>
                </div>
              </div>
              <button className="opacity-0 group-hover:opacity-100 p-2 text-outline-variant hover:text-on-surface-variant transition-opacity">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            {/* ORANGE WARNING: AI Warning */}
            <div className="notification-entry glass-card p-stack_md rounded-xl flex items-start gap-stack_md status-glow-orange relative group hover:opacity-100 cursor-pointer" style={{ animationDelay: '0.4s' }}>
              <div className="w-1.5 h-full absolute left-0 top-0 rounded-l-xl bg-[#ff9800]"></div>
              <div className="w-12 h-12 rounded-xl bg-[#ff98001a] flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined text-[#e68a00]">psychology</span>
              </div>
              <div className="flex-1">
                <div className="flex justify-between items-start mb-1">
                  <h3 className="font-headline-sm text-lg font-bold text-on-surface flex items-center gap-2">
                    AI Warning
                    <span className="px-2 py-0.5 rounded text-[10px] bg-[#ff9800] text-white font-black uppercase tracking-tighter">Predictive</span>
                  </h3>
                  <span className="text-[12px] text-outline-variant font-medium">2 hours ago</span>
                </div>
                <p className="text-body-md text-on-surface-variant">Predicted bottleneck in <span className="font-bold">Loading Dock 4</span> based on incoming traffic. Inbound volume up 24% from typical Tuesday patterns.</p>
                <div className="mt-4 flex items-center gap-3">
                  <button className="px-4 py-1.5 rounded-lg bg-[#e68a00] text-white text-label-md font-bold hover:opacity-90 transition-all shadow-sm">Reroute Fleet</button>
                  <button className="px-4 py-1.5 rounded-lg border border-outline-variant text-on-surface-variant text-label-md font-bold hover:bg-surface-variant transition-all">View Forecast</button>
                </div>
              </div>
              <button className="opacity-0 group-hover:opacity-100 p-2 text-outline-variant hover:text-on-surface-variant transition-opacity">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
          </div>

          {/* SECONDARY CONTENT: AI INSIGHTS CARD */}
          <div className="mt-stack_lg grid grid-cols-1 md:grid-cols-3 gap-stack_md pb-8">
            <div className="col-span-2 glass-card p-stack_md rounded-2xl bg-gradient-to-br from-primary-fixed/30 to-surface border-primary/10">
              <div className="flex items-center gap-3 mb-4">
                <span className="material-symbols-outlined text-primary">query_stats</span>
                <h3 className="font-headline-md text-xl font-bold">Alert Distribution</h3>
              </div>
              
              {/* Visualized data */}
              <div className="h-48 w-full flex items-end justify-between px-8 py-4 gap-4">
                <div className="flex-1 bg-primary/20 rounded-t-lg transition-all hover:bg-primary/40 h-[60%] relative group">
                  <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-inverse-surface text-on-primary text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity">Mon</div>
                </div>
                <div className="flex-1 bg-primary/20 rounded-t-lg transition-all hover:bg-primary/40 h-[45%] relative group">
                  <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-inverse-surface text-on-primary text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity">Tue</div>
                </div>
                <div className="flex-1 bg-primary rounded-t-lg transition-all hover:opacity-80 h-[95%] relative group shadow-[0_0_15px_rgba(37,99,235,0.4)]">
                  <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-inverse-surface text-on-primary text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity font-bold">Today</div>
                </div>
                <div className="flex-1 bg-primary/20 rounded-t-lg transition-all hover:bg-primary/40 h-[30%] relative group"></div>
                <div className="flex-1 bg-primary/20 rounded-t-lg transition-all hover:bg-primary/40 h-[55%] relative group"></div>
                <div className="flex-1 bg-primary/20 rounded-t-lg transition-all hover:bg-primary/40 h-[70%] relative group"></div>
                <div className="flex-1 bg-primary/20 rounded-t-lg transition-all hover:bg-primary/40 h-[40%] relative group"></div>
              </div>
            </div>

            <div className="glass-card p-stack_md rounded-2xl flex flex-col justify-between overflow-hidden relative min-h-[250px]">
              <img 
                alt="Warehouse visual" 
                className="absolute inset-0 w-full h-full object-cover opacity-20 z-0" 
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuCdY7RTTl4uN9Uffa323qLDMqNk7g9qhR2M7Gf6rPJ90DqbLij_9GTEgrAoqtNptVJxJo-xPXZKs2hNbaP0niO6Dpao0ng3pcQywk7j8sCw9SDroD7WBvQ31gzHk0P7k_smGMKFVGk3v7hiA3gz0eE07EqIC2lht__fOVft6cACkKMFuthY4v5ukxzKaUGa0TFYZsesskcA4MfKDagJhFgYIEaz2LPPGgPOZ0ZcFHCGN3XyN6FUN_HGJSuSkc9e1lAF-38nEiCmx_bm" 
              />
              <div className="relative z-10">
                <h3 className="font-headline-sm text-lg font-bold mb-2">Smart Assist</h3>
                <p className="text-body-md text-on-surface-variant">The system has identified 3 recurring bottlenecks in Zone B this week. Would you like to generate a layout optimization report?</p>
              </div>
              <button className="mt-4 w-full py-3 bg-primary text-on-primary font-bold rounded-xl hover:bg-primary/90 transition-all relative z-10 flex items-center justify-center gap-2">
                <span className="material-symbols-outlined">bolt</span>
                Generate Optimization AI
              </button>
            </div>
          </div>
        </div>

        {/* Floating Action Button */}
        <button className="absolute bottom-10 right-10 w-16 h-16 rounded-full bg-primary text-on-primary shadow-2xl flex items-center justify-center hover:scale-105 transition-all group z-50">
          <span className="material-symbols-outlined text-[32px] group-hover:rotate-90 transition-transform">add</span>
          <div className="absolute bottom-full right-0 mb-4 bg-inverse-surface text-on-primary px-4 py-2 rounded-lg text-label-md opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap shadow-xl">
            Manual Alert
          </div>
        </button>
      </main>
    </div>
  )
}

export default Notifications
