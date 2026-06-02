import React from 'react';
import AdminSidebar from '@components/AdminSidebar';

const aiRestockAlerts = [
  {
    priority: 'High Priority',
    priorityClass: 'text-primary bg-primary/10', // Changed to match styles, original had custom ai-chip which was a gradient
    priorityStyle: { background: 'linear-gradient(135deg, rgba(172, 237, 255, 0.2) 0%, rgba(180, 197, 255, 0.2) 100%)', border: '1px solid rgba(172, 237, 255, 0.4)', color: '#004ac6' },
    title: 'Electronics Zone C - Hub East',
    description: 'Predicted stockout in 48h based on current order velocity.',
    icon: 'warning',
    iconClass: 'bg-error-container text-on-error-container',
    actionText: 'Auto-Redistribute',
  },
  {
    priority: 'Optimization',
    priorityClass: 'text-secondary bg-surface-variant',
    priorityStyle: {},
    title: 'Pallet Rebalancing',
    description: 'Shift 120 pallets from Hub North to Hub West to optimize routes.',
    icon: 'info',
    iconClass: 'bg-secondary-container text-on-secondary-container',
    actionText: null,
  },
];

const warehouseDirectory = [
  {
    name: 'Hub East - NY',
    id: 'WH-001',
    occupancy: 92,
    occupancyClass: 'bg-error text-error',
    activeSkus: '4,250',
  },
  {
    name: 'Hub West - CA',
    id: 'WH-002',
    occupancy: 65,
    occupancyClass: 'bg-tertiary-container text-on-surface',
    activeSkus: '6,120',
  },
];

const AdminWarehouses: React.FC = () => {
  return (
    <div className="flex min-h-screen overflow-x-hidden antialiased font-body-md text-body-md bg-background text-on-background">
      {/* SideNavBar */}
      <AdminSidebar />

      {/* Main Content Wrapper */}
      <div className="flex-1 flex flex-col w-full md:ml-[280px] max-w-[1600px] mx-auto min-h-screen">
        {/* TopNavBar */}
        <header className="flex justify-between items-center w-full px-container-padding py-stack-md bg-surface/70 backdrop-blur-md border-b border-outline-variant/20 shadow-sm sticky top-0 z-40">
          <div className="flex items-center gap-4">
            <h2 className="font-headline-sm text-headline-sm font-bold text-on-surface">SmartLog AI Operations Center</h2>
          </div>
          <div className="flex items-center gap-4">
            <div className="relative hidden lg:block w-64">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline">search</span>
              <input className="w-full h-[40px] pl-10 pr-4 bg-black/5 border-none rounded-full font-body-sm text-body-sm focus:ring-2 focus:ring-primary/50 transition-all placeholder:text-outline/70" placeholder="Search warehouses, SKUs..." type="text" />
            </div>
            <button className="p-2 text-on-surface-variant hover:text-primary transition-colors relative">
              <span className="material-symbols-outlined">notifications</span>
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-error rounded-full"></span>
            </button>
            <div className="w-8 h-8 rounded-full bg-secondary-container flex items-center justify-center text-on-secondary-container font-bold border border-outline-variant/50 cursor-pointer hover:ring-2 hover:ring-primary/50 transition-all">
              A
            </div>
            <button className="hidden md:flex px-4 py-2 rounded-lg font-label-md text-label-md items-center gap-2 ml-2 text-white transition-all duration-300 hover:-translate-y-[1px] hover:shadow-[0_8px_20px_rgba(0,74,198,0.3)]" style={{ background: 'linear-gradient(135deg, #004ac6 0%, #005e6e 100%)' }}>
              <span className="material-symbols-outlined text-[18px]">smart_toy</span>
              AI Insights
            </button>
          </div>
        </header>

        {/* Main Dashboard Content */}
        <main className="flex-1 p-4 md:p-container-padding space-y-stack-lg overflow-y-auto">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
            <div>
              <h2 className="font-headline-lg text-headline-lg text-on-surface">Warehouse Hub Overview</h2>
              <p className="font-body-md text-body-md text-on-surface-variant mt-1">Real-time capacity and flow metrics across 12 facilities.</p>
            </div>
            <div className="flex items-center gap-3">
              <button className="px-4 py-2 rounded-lg font-label-md text-label-md flex items-center gap-2 text-on-surface hover:bg-white/50 transition-colors" style={{ background: 'rgba(255, 255, 255, 0.7)', backdropFilter: 'blur(12px)', borderTop: '1px solid rgba(255, 255, 255, 0.3)', borderLeft: '1px solid rgba(255, 255, 255, 0.2)', boxShadow: '0 10px 30px rgba(0, 0, 0, 0.04)' }}>
                <span className="material-symbols-outlined text-[18px]">filter_list</span>
                Filter Region
              </button>
              <button className="px-4 py-2 rounded-lg font-label-md text-label-md flex items-center gap-2 text-white transition-all duration-300 hover:-translate-y-[1px] hover:shadow-[0_8px_20px_rgba(0,74,198,0.3)]" style={{ background: 'linear-gradient(135deg, #004ac6 0%, #005e6e 100%)' }}>
                <span className="material-symbols-outlined text-[18px]">add</span>
                New Facility
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left Column */}
            <div className="lg:col-span-4 flex flex-col gap-6">
              <div className="rounded-xl p-6 relative overflow-hidden" style={{ background: 'rgba(255, 255, 255, 0.7)', backdropFilter: 'blur(12px)', borderTop: '1px solid rgba(255, 255, 255, 0.3)', borderLeft: '1px solid rgba(255, 255, 255, 0.2)', boxShadow: '0 10px 30px rgba(0, 0, 0, 0.04)' }}>
                <div className="absolute top-0 right-0 p-4 opacity-10">
                  <span className="material-symbols-outlined text-[120px]">warehouse</span>
                </div>
                <div className="relative z-10 space-y-6">
                  <div>
                    <p className="font-label-md text-label-md text-on-surface-variant uppercase tracking-wider">Total Network Capacity</p>
                    <div className="flex items-end gap-3 mt-1">
                      <h3 className="font-display-lg text-display-lg text-on-surface">78<span className="text-headline-md text-on-surface-variant">%</span></h3>
                      <span className="font-label-md text-label-md text-tertiary-container bg-tertiary-container/10 px-2 py-1 rounded-md mb-2 flex items-center gap-1">
                        <span className="material-symbols-outlined text-[14px]">trending_up</span> +2.4%
                      </span>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4 pt-4 border-t border-outline-variant/30">
                    <div>
                      <p className="font-label-md text-label-md text-on-surface-variant">Active SKUs</p>
                      <p className="font-headline-md text-headline-md text-on-surface mt-1">14,290</p>
                    </div>
                    <div>
                      <p className="font-label-md text-label-md text-on-surface-variant">Pending Orders</p>
                      <p className="font-headline-md text-headline-md text-on-surface mt-1">842</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* AI Restock Predictions */}
              <div className="rounded-xl p-6 border-l-4 border-l-tertiary-fixed-dim" style={{ background: 'rgba(255, 255, 255, 0.9)', backdropFilter: 'blur(16px)', border: '1px solid rgba(255, 255, 255, 0.4)', borderLeft: '4px solid #4cd7f6', boxShadow: '0 20px 50px rgba(0, 0, 0, 0.1)' }}>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-headline-sm text-headline-sm flex items-center gap-2">
                    <span className="material-symbols-outlined text-tertiary-fixed-dim">smart_toy</span>
                    AI Restock Alerts
                  </h3>
                </div>
                <div className="space-y-4">
                  {aiRestockAlerts.map((alert, index) => (
                    <div key={index} className="flex items-start gap-3 p-3 rounded-lg bg-surface-container-low hover:shadow-md transition-shadow cursor-pointer">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 mt-1 ${alert.iconClass}`}>
                        <span className="material-symbols-outlined text-[16px]">{alert.icon}</span>
                      </div>
                      <div>
                        <p className={`font-label-md text-label-md inline-block px-2 py-0.5 rounded-full mb-1 ${alert.priorityClass}`} style={alert.priorityStyle}>{alert.priority}</p>
                        <p className="font-body-md text-body-md font-medium text-on-surface">{alert.title}</p>
                        <p className="font-body-sm text-body-sm text-on-surface-variant mt-1">{alert.description}</p>
                        {alert.actionText && (
                          <button className="mt-2 text-primary font-label-md text-label-md flex items-center gap-1 hover:underline">
                            {alert.actionText} <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Middle/Right Column */}
            <div className="lg:col-span-8 flex flex-col gap-6">
              {/* Map Visualization */}
              <div className="rounded-xl overflow-hidden h-[400px] relative border border-outline-variant/30 flex flex-col" style={{ background: 'rgba(255, 255, 255, 0.7)', backdropFilter: 'blur(12px)', borderTop: '1px solid rgba(255, 255, 255, 0.3)', borderLeft: '1px solid rgba(255, 255, 255, 0.2)', boxShadow: '0 10px 30px rgba(0, 0, 0, 0.04)', backgroundImage: "radial-gradient(circle at center, #f3f3fe 0%, #e1e2ed 100%)" }}>
                <div className="absolute inset-0" style={{ backgroundImage: "linear-gradient(to right, rgba(0, 74, 198, 0.05) 1px, transparent 1px), linear-gradient(to bottom, rgba(0, 74, 198, 0.05) 1px, transparent 1px)", backgroundSize: '40px 40px', zIndex: 0 }}></div>
                <div className="absolute top-4 left-4 z-10 bg-surface/90 backdrop-blur-md px-4 py-2 rounded-lg shadow-sm border border-outline-variant/20">
                  <h3 className="font-headline-sm text-headline-sm text-on-surface flex items-center gap-2">
                    <span className="material-symbols-outlined text-primary">map</span>
                    Live Regional Map
                  </h3>
                </div>
                <div className="flex-1 relative w-full h-full">
                  <img alt="Map" className="absolute inset-0 w-full h-full object-cover opacity-60 mix-blend-luminosity" src="https://lh3.googleusercontent.com/aida-public/AB6AXuBN43ldXPcBg9uBHhUyGO_suZqtyCnzthNdGN7wwX38UD9xf8p3Yw19aq7UFH2D3DN58wLcJQfVhZMxClDCn_vNXO_EGGTa_ykHByDk1rZd9AjI0HxffBPv3810p38YrNy2FCQj6mjKPQcoFlTiC8oiGo6YsVlaD8-89eszUazyD0eWrkQnIc0RtwL0d9GijuyeMYQqnEaKYfXKtSZfS44Le2NE7dz7h-3BlHDCetSth3xDy7lNhd6uR-cXbzVy9e9F6Y1gyBPi_OCZ" />
                  <div className="absolute top-1/3 left-1/4 w-4 h-4 bg-primary rounded-full shadow-[0_0_15px_rgba(0,74,198,0.8)] animate-pulse border-2 border-white"></div>
                  <div className="absolute top-1/2 left-1/2 w-4 h-4 bg-tertiary-fixed-dim rounded-full shadow-[0_0_15px_rgba(76,215,246,0.8)] border-2 border-white"></div>
                  <div className="absolute bottom-1/3 right-1/3 w-4 h-4 bg-error rounded-full shadow-[0_0_15px_rgba(186,26,26,0.8)] border-2 border-white"></div>
                  <svg className="absolute inset-0 w-full h-full pointer-events-none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M 25% 33% Q 35% 40% 50% 50% T 66% 66%" fill="none" stroke="rgba(0,74,198,0.4)" strokeDasharray="4 4" strokeWidth="2"></path>
                  </svg>
                </div>
              </div>

              {/* Analytics Charts */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="rounded-xl p-6" style={{ background: 'rgba(255, 255, 255, 0.7)', backdropFilter: 'blur(12px)', borderTop: '1px solid rgba(255, 255, 255, 0.3)', borderLeft: '1px solid rgba(255, 255, 255, 0.2)', boxShadow: '0 10px 30px rgba(0, 0, 0, 0.04)' }}>
                  <h3 className="font-headline-sm text-headline-sm text-on-surface mb-4">Inventory Turnover</h3>
                  <div className="h-40 flex items-end gap-2 justify-between">
                    <div className="w-full bg-primary/10 rounded-t-sm h-[40%] hover:bg-primary/30 transition-colors relative group">
                      <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-inverse-surface text-inverse-on-surface text-xs py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">Jan: 4.2</div>
                    </div>
                    <div className="w-full bg-primary/20 rounded-t-sm h-[55%] hover:bg-primary/40 transition-colors"></div>
                    <div className="w-full bg-primary/40 rounded-t-sm h-[80%] hover:bg-primary/60 transition-colors"></div>
                    <div className="w-full bg-primary/60 rounded-t-sm h-[65%] hover:bg-primary/80 transition-colors"></div>
                    <div className="w-full bg-primary rounded-t-sm h-[90%] hover:bg-primary-container transition-colors relative">
                      <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-2 h-2 rounded-full bg-tertiary-fixed-dim shadow-[0_0_8px_rgba(76,215,246,1)]"></div>
                    </div>
                    <div className="w-full bg-primary/30 rounded-t-sm h-[50%] hover:bg-primary/50 transition-colors"></div>
                  </div>
                  <div className="flex justify-between mt-2 font-label-md text-label-md text-on-surface-variant">
                    <span>Jan</span><span>Feb</span><span>Mar</span><span>Apr</span><span>May</span><span>Jun</span>
                  </div>
                </div>

                <div className="rounded-xl p-6" style={{ background: 'rgba(255, 255, 255, 0.7)', backdropFilter: 'blur(12px)', borderTop: '1px solid rgba(255, 255, 255, 0.3)', borderLeft: '1px solid rgba(255, 255, 255, 0.2)', boxShadow: '0 10px 30px rgba(0, 0, 0, 0.04)' }}>
                  <h3 className="font-headline-sm text-headline-sm text-on-surface mb-4 flex justify-between items-center">
                    Flow Trends
                    <span className="font-label-md text-label-md px-2 py-1 bg-surface-variant rounded-md">This Week</span>
                  </h3>
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between font-label-md text-label-md mb-1">
                        <span className="text-on-surface">Inbound (Imports)</span>
                        <span className="text-tertiary-container font-bold">12,450 units</span>
                      </div>
                      <div className="h-2 w-full bg-surface-variant rounded-full overflow-hidden">
                        <div className="h-full bg-tertiary-container rounded-full" style={{ width: '75%' }}></div>
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between font-label-md text-label-md mb-1">
                        <span className="text-on-surface">Outbound (Exports)</span>
                        <span className="text-primary font-bold">14,200 units</span>
                      </div>
                      <div className="h-2 w-full bg-surface-variant rounded-full overflow-hidden">
                        <div className="h-full bg-primary rounded-full" style={{ width: '85%' }}></div>
                      </div>
                    </div>
                    <div className="pt-2">
                      <p className="font-body-sm text-body-sm text-on-surface-variant flex items-center gap-1">
                        <span className="material-symbols-outlined text-[16px] text-tertiary-fixed-dim">trending_flat</span>
                        Net Flow: <span className="text-on-surface font-medium">-1,750 units (Deficit)</span>
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Warehouse List */}
          <div className="mt-8">
            <h3 className="font-headline-md text-headline-md text-on-surface mb-4">Facility Directory</h3>
            <div className="space-y-3">
              {warehouseDirectory.map((wh, index) => (
                <div key={index} className="rounded-xl p-4 flex items-center justify-between hover:-translate-y-1 transition-transform cursor-pointer group" style={{ background: 'rgba(255, 255, 255, 0.7)', backdropFilter: 'blur(12px)', borderTop: '1px solid rgba(255, 255, 255, 0.3)', borderLeft: '1px solid rgba(255, 255, 255, 0.2)', boxShadow: '0 10px 30px rgba(0, 0, 0, 0.04)' }}>
                  <div className="flex items-center gap-4 w-1/4">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-colors">
                      <span className="material-symbols-outlined">warehouse</span>
                    </div>
                    <div>
                      <h4 className="font-headline-sm text-headline-sm text-on-surface text-[16px]">{wh.name}</h4>
                      <p className="font-label-md text-label-md text-on-surface-variant">ID: {wh.id}</p>
                    </div>
                  </div>
                  <div className="w-1/4">
                    <p className="font-label-md text-label-md text-on-surface-variant mb-1">Occupancy</p>
                    <div className="flex items-center gap-2">
                      <div className="h-1.5 flex-1 bg-surface-variant rounded-full overflow-hidden">
                        <div className={`h-full ${wh.occupancyClass.split(' ')[0]} rounded-full`} style={{ width: `${wh.occupancy}%` }}></div>
                      </div>
                      <span className={`font-label-md text-label-md font-bold ${wh.occupancyClass.split(' ')[1]}`}>{wh.occupancy}%</span>
                    </div>
                  </div>
                  <div className="w-1/4 text-center">
                    <p className="font-label-md text-label-md text-on-surface-variant">Active SKUs</p>
                    <p className="font-body-md text-body-md text-on-surface font-medium">{wh.activeSkus}</p>
                  </div>
                  <div className="w-auto flex justify-end">
                    <button className="p-2 text-on-surface-variant hover:text-primary transition-colors">
                      <span className="material-symbols-outlined">more_vert</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminWarehouses;
