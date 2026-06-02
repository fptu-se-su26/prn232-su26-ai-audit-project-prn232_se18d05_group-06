import React from 'react';
import AdminSidebar from '@components/AdminSidebar';

const kpiCards = [
  {
    title: 'Active Vehicles',
    value: '142',
    valueClass: 'text-on-surface',
    icon: 'directions_car',
    iconColorClass: 'text-primary',
    trendIcon: 'trending_up',
    trendText: '+12 from last week',
    trendClass: 'text-tertiary',
  },
  {
    title: 'Maintenance Alerts',
    value: '3',
    valueClass: 'text-error',
    icon: 'build',
    iconColorClass: 'text-error',
    trendIcon: null,
    trendText: 'Requires immediate attention',
    trendClass: 'text-on-surface-variant',
  },
  {
    title: 'Fuel Efficiency',
    value: '2.4',
    valueSuffix: ' L/km',
    valueClass: 'text-on-surface',
    icon: 'local_gas_station',
    iconColorClass: 'text-tertiary',
    trendIcon: 'trending_down',
    trendText: '-0.2 improvement',
    trendClass: 'text-tertiary',
  },
];

const priorityVehicles = [
  {
    id: 'TRK-8492',
    model: 'Volvo FH16',
    status: 'Healthy',
    statusClass: 'text-tertiary',
    fuel: '60%',
    fuelValue: 60,
    fuelColor: 'bg-primary',
    insurance: 'Valid (11 mo)',
    mileage: '124k mi',
    dotColor: 'bg-primary shadow-[0_0_8px_rgba(0,74,198,0.6)]',
    containerClass: 'hover:border-primary/50 transition-colors',
  },
  {
    id: 'V-993',
    model: 'Ford Transit',
    status: 'Needs Service',
    statusClass: 'text-error',
    fuel: '15%',
    fuelValue: 15,
    fuelColor: 'bg-error',
    insurance: 'Valid (2 mo)',
    mileage: '89k mi',
    dotColor: 'bg-error shadow-[0_0_8px_rgba(186,26,26,0.6)] animate-pulse',
    containerClass: 'border-error/30 hover:border-error/60 transition-colors bg-error/5',
  },
];

const driverRoster = [
  {
    name: 'Sarah Jenkins',
    id: 'DR-4402',
    avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBDq9zlccjrsG76FUN-F4pEXGbQvRijz6RKxowlMTHKkMpa6pqqWH6BS7TfjNvag3qqiBruKBDgt0Zcq1k99TzLE0mw18DM3rz6_uXnKJlxOJKHrPmKC4_NobKs_wDuAOtLSor97FQEC94p2AFJj6Pw_J-IZwT9fG4pQAjb-gGsZORjw0stdQPGRrmQ5yYmZqQGYWtpqnzHCLf7xINUQTQTHUKgAK3DnvktnUk-c653cj0Ys2282K46r8K781gYjdbjV0jYuHVtbV_b',
    statusText: 'Active',
    statusClass: 'bg-tertiary/10 text-tertiary border-tertiary/20',
    performance: '99% Delivery',
    violations: '0 Violations',
    violationsClass: 'text-on-surface-variant',
    onlineText: 'Online (In Transit)',
    onlineDot: 'bg-primary shadow-[0_0_8px_rgba(0,74,198,0.4)]',
    onlineTextClass: 'text-on-surface',
  },
  {
    name: 'Michael Chen',
    id: 'DR-8831',
    avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCdLVDjGcmiFFAbYpyhtkItTapxmv8z7oxBBPncGRXC08sYzwY97kplSOZ_0RGlff-JydLdq1b1ZhIHrkHOFa5-25pL7DDBVOEAk4E-_Hj4TxAICqf6vrytnS1sNRJmVRFrJINtqacHXQccPICjix8deUVKVWnRYEjVQawpiECOtYgOOgWga4vYCCHcxcIdnLCmZMSQqCh8tnz3Fe2U0slmJKyv4_rUEHSYvJTvJzIV9jT50nBJ7PYHQh9yFOwafs20ThR1hSo6ZUHw',
    statusText: 'Expiring (14d)',
    statusClass: 'bg-error/10 text-error border-error/20',
    performance: '94% Delivery',
    violations: '2 Violations',
    violationsClass: 'text-error',
    onlineText: 'Offline (Rest)',
    onlineDot: 'bg-outline shadow-sm',
    onlineTextClass: 'text-on-surface-variant',
  },
];

const AdminFleetMap: React.FC = () => {
  return (
    <div className="text-on-surface antialiased min-h-screen flex font-body-md" style={{ backgroundColor: '#faf8ff', backgroundImage: 'radial-gradient(circle at 100% 0%, #dde2f8 0%, transparent 40%), radial-gradient(circle at 0% 100%, #00788c 0%, transparent 30%)', backgroundAttachment: 'fixed' }}>
      {/* SideNavBar */}
      <AdminSidebar />

      {/* Main Content Area */}
      <main className="flex-1 md:ml-[280px] w-full max-w-[1600px] mx-auto min-h-screen pb-20 md:pb-8">
        {/* TopNavBar */}
        <header className="flex justify-between items-center w-full h-[72px] px-8 max-w-[1600px] ml-auto bg-surface/70 backdrop-blur-md docked full-width top-0 sticky shadow-sm z-40 bg-transparent">
          <div className="flex items-center gap-8">
            <h2 className="font-headline-sm text-headline-sm font-bold text-on-surface">Admin Dashboard</h2>
            <div className="relative hidden lg:block">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline">search</span>
              <input className="h-[48px] pl-10 pr-4 w-[300px] bg-black/5 rounded-[18px] border-none focus:ring-2 focus:ring-primary transition-all font-body-sm text-body-sm" placeholder="Search vehicles, drivers..." type="text" />
            </div>
          </div>
          <nav className="hidden md:flex gap-6">
            <a className="text-on-surface-variant hover:text-on-surface transition-colors font-body-md text-body-md hover:bg-surface-container-low rounded-lg transition-all px-3 py-2" href="#">Analytics</a>
            <a className="text-on-surface-variant hover:text-on-surface transition-colors font-body-md text-body-md hover:bg-surface-container-low rounded-lg transition-all px-3 py-2" href="#">Reports</a>
            <a className="text-on-surface-variant hover:text-on-surface transition-colors font-body-md text-body-md hover:bg-surface-container-low rounded-lg transition-all px-3 py-2" href="#">Logs</a>
          </nav>
          <div className="flex items-center gap-4">
            <button className="material-symbols-outlined text-on-surface-variant hover:text-primary transition-colors p-2 rounded-full hover:bg-surface-container-low">notifications</button>
            <button className="material-symbols-outlined text-on-surface-variant hover:text-primary transition-colors p-2 rounded-full hover:bg-surface-container-low">apps</button>
            <button className="text-white px-5 py-2 font-headline-sm text-[14px] leading-tight hover:opacity-90 transition-opacity rounded-[18px]" style={{ background: 'linear-gradient(135deg, #004ac6 0%, #2563eb 100%)' }}>New Shipment</button>
            <img alt="User profile" className="w-10 h-10 rounded-full ml-2 border border-outline-variant" src="https://lh3.googleusercontent.com/aida-public/AB6AXuCEdcB28cA_OB2wpbQyTDMLE3hQrvYQAJsInCoQFbKRSK1P7l2xTZ5lvKjvEQmyEnf_yZnzcUvSpoS5n6DcdNeSC8hDdLgDTHnDXgiw5VEDoc4S2ShK7Ckm22q6x2ACFu_jtwX7w-0rAKL482gu1ewCoPt3KwS7B3jo7GcPVLL2LKvrf4BAE5jRBNwqGRLBM_Hcg9VQtZgU69_k5cYpnW25y3TPSmvUZZWqmIMme_X_Ssi1HZ48CJGXhGt2uLuWXCM22yTrXAYkIObr" />
          </div>
        </header>
        
        <div className="p-container-padding space-y-gutter">
          {/* Fleet Analytics Bento Grid */}
          <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-gutter">
            {kpiCards.map((kpi, index) => (
              <div key={index} className="glass-card p-6 flex flex-col justify-between h-[160px]" style={{ background: 'rgba(255, 255, 255, 0.7)', backdropFilter: 'blur(12px)', borderTop: '1px solid rgba(255, 255, 255, 0.3)', borderLeft: '1px solid rgba(255, 255, 255, 0.2)', boxShadow: '0 10px 30px rgba(0, 0, 0, 0.04)', borderRadius: '18px' }}>
                <div className="flex justify-between items-start">
                  <div className="font-body-sm text-body-sm text-on-surface-variant">{kpi.title}</div>
                  <span className={`material-symbols-outlined ${kpi.iconColorClass}`} style={{ fontVariationSettings: "'FILL' 1" }}>{kpi.icon}</span>
                </div>
                <div>
                  <div className={`font-display-lg text-display-lg ${kpi.valueClass}`}>
                    {kpi.value} {kpi.valueSuffix && <span className="text-[24px] text-on-surface-variant font-normal">{kpi.valueSuffix}</span>}
                  </div>
                  <div className={`font-label-md text-label-md flex items-center gap-1 mt-1 ${kpi.trendClass}`}>
                    {kpi.trendIcon && <span className="material-symbols-outlined text-[16px]">{kpi.trendIcon}</span>}
                    {kpi.trendText}
                  </div>
                </div>
              </div>
            ))}
            
            <div className="glass-card p-6 flex flex-col justify-between h-[160px] relative overflow-hidden" style={{ background: 'rgba(255, 255, 255, 0.7)', backdropFilter: 'blur(12px)', borderTop: '1px solid rgba(255, 255, 255, 0.3)', borderLeft: '1px solid rgba(255, 255, 255, 0.2)', boxShadow: '0 10px 30px rgba(0, 0, 0, 0.04)', borderRadius: '18px' }}>
              <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-2xl -mr-10 -mt-10"></div>
              <div className="flex justify-between items-start relative z-10">
                <div className="font-body-sm text-body-sm text-on-surface-variant">Driver Performance</div>
                <span className="text-white font-label-md text-[10px] px-2 py-1 rounded-full uppercase tracking-wider" style={{ background: 'linear-gradient(135deg, #005e6e 0%, #4cd7f6 100%)' }}>AI Insight</span>
              </div>
              <div className="relative z-10">
                <div className="font-display-lg text-display-lg text-on-surface">98%</div>
                <div className="font-label-md text-label-md text-on-surface-variant mt-1">Success delivery rate</div>
              </div>
            </div>
          </section>

          {/* Realtime Map & Vehicle Details */}
          <section className="grid grid-cols-1 xl:grid-cols-3 gap-gutter h-auto min-h-[500px]">
            {/* Map Area */}
            <div className="glass-card xl:col-span-2 overflow-hidden flex flex-col relative" style={{ background: 'rgba(255, 255, 255, 0.7)', backdropFilter: 'blur(12px)', borderTop: '1px solid rgba(255, 255, 255, 0.3)', borderLeft: '1px solid rgba(255, 255, 255, 0.2)', boxShadow: '0 10px 30px rgba(0, 0, 0, 0.04)', borderRadius: '18px' }}>
              <div className="p-4 border-b border-outline-variant/30 flex justify-between items-center bg-white/50 z-10">
                <h3 className="font-headline-sm text-headline-sm font-semibold flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary">my_location</span> Realtime Fleet Map
                </h3>
                <div className="flex gap-2">
                  <button className="px-3 py-1 bg-white rounded-md border border-outline-variant font-label-md text-label-md hover:bg-surface-container-low transition-colors">All</button>
                  <button className="px-3 py-1 bg-transparent rounded-md border border-transparent font-label-md text-label-md text-on-surface-variant hover:bg-white/50 transition-colors">Active</button>
                  <button className="px-3 py-1 bg-transparent rounded-md border border-transparent font-label-md text-label-md text-on-surface-variant hover:bg-white/50 transition-colors">Maintenance</button>
                </div>
              </div>
              {/* Mock Map Background */}
              <div className="flex-1 w-full h-[400px] xl:h-auto relative bg-[#e5e9ea] overflow-hidden">
                <img alt="Stylized map view" className="absolute inset-0 w-full h-full object-cover opacity-60 mix-blend-multiply" src="https://lh3.googleusercontent.com/aida-public/AB6AXuCsqm8FqrAvow77V5xbPJIAKUvHfquyvjeOPKuaXEQPVgYWQQXGyNa-4pBuTyTsvgzP3jDgu6iz2rHBvmzn8kgUjn4YHfPoZLCUOvnYaP2WVz1rLFQN4LXwXXxGelC8iVJB8mVaGq-o9w5eFrql8eIbA5fggE2rLs8N8g-_I-z0zaaCYp30mJJdqH8vJSbSw_yKh6siqEW8hzGu_0u_uH0YOqs8A8ZdDLhfcABrXJRf7DgCnPS4VNE0AJnnl1cJGOFvIoWDj9qRkMOP" />
                {/* Map Pins */}
                <div className="absolute top-[30%] left-[40%] flex flex-col items-center animate-pulse">
                  <div className="w-8 h-8 bg-primary/20 rounded-full flex items-center justify-center">
                    <div className="w-4 h-4 bg-primary rounded-full border-2 border-white shadow-lg"></div>
                  </div>
                  <div className="mt-1 bg-white/90 backdrop-blur-sm px-2 py-1 rounded shadow-sm font-label-md text-[10px] text-on-surface font-bold">TRK-8492</div>
                </div>
                <div className="absolute top-[60%] left-[65%] flex flex-col items-center">
                  <div className="w-8 h-8 bg-tertiary/20 rounded-full flex items-center justify-center">
                    <div className="w-4 h-4 bg-tertiary rounded-full border-2 border-white shadow-lg"></div>
                  </div>
                  <div className="mt-1 bg-white/90 backdrop-blur-sm px-2 py-1 rounded shadow-sm font-label-md text-[10px] text-on-surface font-bold">TRK-1024</div>
                </div>
                <div className="absolute top-[20%] left-[70%] flex flex-col items-center">
                  <div className="w-8 h-8 bg-error/20 rounded-full flex items-center justify-center">
                    <div className="w-4 h-4 bg-error rounded-full border-2 border-white shadow-lg"></div>
                  </div>
                  <div className="mt-1 bg-white/90 backdrop-blur-sm px-2 py-1 rounded shadow-sm font-label-md text-[10px] text-on-surface font-bold">V-993</div>
                </div>
              </div>
            </div>
            
            {/* Vehicle Details Grid */}
            <div className="flex flex-col gap-4 overflow-y-auto max-h-[500px] pr-2 custom-scrollbar">
              <h3 className="font-headline-sm text-headline-sm font-semibold mb-2">Priority Vehicles</h3>
              {priorityVehicles.map((vehicle, index) => (
                <div key={index} className={`glass-card p-5 cursor-pointer ${vehicle.containerClass}`} style={{ background: 'rgba(255, 255, 255, 0.7)', backdropFilter: 'blur(12px)', borderTop: '1px solid rgba(255, 255, 255, 0.3)', borderLeft: '1px solid rgba(255, 255, 255, 0.2)', boxShadow: '0 10px 30px rgba(0, 0, 0, 0.04)', borderRadius: '18px' }}>
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h4 className="font-headline-sm text-headline-sm text-on-surface font-bold">{vehicle.id}</h4>
                      <span className="font-label-md text-label-md text-on-surface-variant">{vehicle.model}</span>
                    </div>
                    <div className={`w-2 h-2 rounded-full mt-2 ${vehicle.dotColor}`}></div>
                  </div>
                  <div className="grid grid-cols-2 gap-3 mt-4">
                    <div>
                      <div className="font-label-md text-[10px] text-on-surface-variant uppercase">Status</div>
                      <div className={`font-body-sm text-body-sm font-medium ${vehicle.statusClass}`}>{vehicle.status}</div>
                    </div>
                    <div>
                      <div className="font-label-md text-[10px] text-on-surface-variant uppercase">Fuel</div>
                      <div className="font-body-sm text-body-sm font-medium">{vehicle.fuel}</div>
                      <div className="w-full bg-surface-variant h-1 rounded-full mt-1"><div className={`${vehicle.fuelColor} h-1 rounded-full`} style={{ width: `${vehicle.fuelValue}%` }}></div></div>
                    </div>
                    <div>
                      <div className="font-label-md text-[10px] text-on-surface-variant uppercase">Insurance</div>
                      <div className="font-body-sm text-body-sm font-medium">{vehicle.insurance}</div>
                    </div>
                    <div>
                      <div className="font-label-md text-[10px] text-on-surface-variant uppercase">Mileage</div>
                      <div className="font-body-sm text-body-sm font-medium">{vehicle.mileage}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Driver Status Table */}
          <section className="glass-card overflow-hidden" style={{ background: 'rgba(255, 255, 255, 0.7)', backdropFilter: 'blur(12px)', borderTop: '1px solid rgba(255, 255, 255, 0.3)', borderLeft: '1px solid rgba(255, 255, 255, 0.2)', boxShadow: '0 10px 30px rgba(0, 0, 0, 0.04)', borderRadius: '18px' }}>
            <div className="p-6 border-b border-outline-variant/30 flex justify-between items-center">
              <h3 className="font-headline-sm text-headline-sm font-semibold">Driver Roster</h3>
              <button className="text-primary font-label-md text-label-md hover:underline flex items-center gap-1">View All <span className="material-symbols-outlined text-[16px]">arrow_forward</span></button>
            </div>
            <div className="w-full overflow-x-auto">
              <div className="min-w-[800px] p-4 flex flex-col gap-3">
                {/* Header Row */}
                <div className="grid grid-cols-5 px-4 py-2 font-label-md text-label-md text-on-surface-variant uppercase tracking-wider">
                  <div className="col-span-2">Driver</div>
                  <div>License</div>
                  <div>Performance</div>
                  <div>Status</div>
                </div>
                {/* Data Rows */}
                {driverRoster.map((driver, index) => (
                  <div key={index} className="grid grid-cols-5 items-center px-4 py-3 bg-white/40 rounded-xl transition-all duration-300 border border-transparent hover:-translate-y-[2px] hover:shadow-[0_8px_24px_rgba(0,0,0,0.06)] hover:bg-white/90">
                    <div className="col-span-2 flex items-center gap-3">
                      <img alt={driver.name} className="w-10 h-10 rounded-full" src={driver.avatar} />
                      <div>
                        <div className="font-body-md text-body-md font-semibold text-on-surface">{driver.name}</div>
                        <div className="font-label-md text-label-md text-on-surface-variant">ID: {driver.id}</div>
                      </div>
                    </div>
                    <div>
                      <span className={`px-2 py-1 rounded font-label-md text-[11px] border ${driver.statusClass}`}>{driver.statusText}</span>
                    </div>
                    <div>
                      <div className="font-body-sm text-body-sm">{driver.performance}</div>
                      <div className={`font-label-md text-[10px] mt-0.5 ${driver.violationsClass}`}>{driver.violations}</div>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${driver.onlineDot}`}></div>
                      <span className={`font-body-sm text-body-sm ${driver.onlineTextClass}`}>{driver.onlineText}</span>
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

export default AdminFleetMap;
