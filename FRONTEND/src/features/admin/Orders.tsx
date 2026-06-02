import React, { useState } from 'react';
import AdminSidebar from '@components/AdminSidebar';

const kpiCards = [
  {
    title: 'Total Active Orders',
    value: '1,248',
    icon: 'inventory_2',
    iconBgClass: 'bg-surface-container-high text-primary',
    trendText: '+12% vs yesterday',
    trendClass: 'text-primary-container bg-primary-fixed',
    bgClass: 'bg-primary/5',
  },
  {
    title: 'Delayed Deliveries',
    value: '24',
    icon: 'warning',
    iconBgClass: 'bg-error-container text-error',
    trendText: 'Requires Attention',
    trendClass: 'text-error bg-error-container',
    bgClass: 'bg-error/5',
    valueClass: 'text-error',
  },
  {
    title: 'Completed Today',
    value: '892',
    icon: 'check_circle',
    iconBgClass: 'bg-tertiary-container text-on-tertiary-container',
    trendText: 'Target Met',
    trendClass: 'text-tertiary bg-tertiary-fixed',
    bgClass: 'bg-tertiary/5',
  },
  {
    title: 'Failed / Cancelled',
    value: '7',
    icon: 'cancel',
    iconBgClass: 'bg-surface-variant text-secondary',
    trendText: null,
    trendClass: '',
    bgClass: 'bg-secondary/5',
  },
];

const orders = [
  {
    id: '#ORD-9921',
    customerName: 'Acme Corp Logistics',
    customerType: 'B2B Heavy Freight',
    driverInitials: 'JD',
    driverName: 'John Doe',
    driverBg: 'bg-primary-fixed text-primary-on-fixed',
    destination: '1420 Logistics Way, Hub B',
    status: 'In Transit',
    statusDotClass: 'status-dot-success text-green-700',
    innerDotClass: 'bg-green-500 shadow-[0_0_5px_#22c55e]',
    eta: '14:30 today',
    etaClass: 'text-on-surface',
    cost: '$1,250',
  },
  {
    id: '#ORD-9922',
    customerName: 'Global Supply Inc',
    customerType: 'Cold Chain',
    driverInitials: 'AS',
    driverName: 'Alice Smith',
    driverBg: 'bg-secondary-fixed text-secondary-on-fixed',
    destination: 'Port Terminal 4, Bay Area',
    status: 'Delayed',
    statusDotClass: 'status-dot-warning text-amber-700',
    innerDotClass: 'bg-amber-500 shadow-[0_0_5px_#f59e0b]',
    eta: '16:45 (Late)',
    etaClass: 'text-error',
    cost: '$3,400',
  },
  {
    id: '#ORD-9923',
    customerName: 'TechCorp Parts',
    customerType: 'Express Delivery',
    driverInitials: 'MR',
    driverName: 'Mike Ross',
    driverBg: 'bg-tertiary-fixed text-tertiary-on-fixed',
    destination: '77 Silicon Blvd, Tech Park',
    status: 'Loading',
    statusDotClass: 'status-dot-info text-blue-700',
    innerDotClass: 'bg-blue-500 shadow-[0_0_5px_#3b82f6]',
    eta: '--',
    etaClass: 'text-on-surface',
    cost: '$850',
  },
];

const AdminOrders: React.FC = () => {
  const [selectedOrders, setSelectedOrders] = useState<Set<number>>(new Set());
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const toggleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedOrders(new Set(orders.map((_, i) => i)));
    } else {
      setSelectedOrders(new Set());
    }
  };

  const toggleSelectOrder = (index: number) => {
    const newSelected = new Set(selectedOrders);
    if (newSelected.has(index)) {
      newSelected.delete(index);
    } else {
      newSelected.add(index);
    }
    setSelectedOrders(newSelected);
  };

  return (
    <div className="bg-background text-on-background font-body-sm min-h-screen flex overflow-hidden">
      {/* SideNavBar */}
      <AdminSidebar />

      {/* Main Content Wrapper */}
      <div className="md:ml-[280px] flex-1 flex flex-col h-screen overflow-hidden">
        {/* TopNavBar */}
        <header className="bg-surface/70 backdrop-blur-md border-b border-outline-variant/20 shadow-sm docked full-width top-0 sticky z-40 flex justify-between items-center w-full px-container-padding py-stack-md">
          <div>
            <h2 className="font-headline-sm text-headline-sm font-bold text-on-surface">SmartLog AI Operations Center</h2>
          </div>
          <div className="flex items-center gap-6">
            <div className="relative focus-within:ring-2 focus-within:ring-primary/50 rounded-full transition-all">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline">search</span>
              <input className="h-10 pl-10 pr-4 rounded-full bg-black/5 border-none text-body-sm font-body-sm w-64 focus:w-80 transition-all outline-none" placeholder="Search orders, drivers, IDs..." type="text" />
            </div>
            <div className="flex items-center gap-4">
              <button className="text-on-surface-variant hover:text-primary transition-colors relative">
                <span className="material-symbols-outlined">notifications</span>
                <span className="absolute top-0 right-0 w-2 h-2 bg-error rounded-full"></span>
              </button>
              <button className="text-on-surface-variant hover:text-primary transition-colors">
                <span className="material-symbols-outlined">account_circle</span>
              </button>
              <button className="px-4 py-2 rounded-lg bg-primary-container text-on-primary font-body-sm text-body-sm font-medium hover:bg-primary transition-colors flex items-center gap-2">
                <span className="material-symbols-outlined text-sm">smart_toy</span>
                AI Assistant
              </button>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-container-padding bg-gradient-to-br from-surface to-surface-container-low">
          <div className="max-w-[1600px] mx-auto">
            {/* Header & Actions */}
            <div className="flex justify-between items-end mb-stack-lg">
              <div>
                <h1 className="font-headline-lg text-headline-lg text-on-surface mb-2">Orders Management</h1>
                <p className="font-body-md text-body-md text-secondary">Real-time overview and command center for active logistics.</p>
              </div>
              <div className="flex gap-3">
                <button className="px-4 py-2 glass-card rounded-lg font-label-md text-label-md text-on-surface flex items-center gap-2 hover:bg-white/90 transition-colors" style={{ background: 'rgba(255, 255, 255, 0.7)', backdropFilter: 'blur(12px)', border: '1px solid rgba(255, 255, 255, 0.2)', boxShadow: '0 10px 30px rgba(0, 0, 0, 0.04)' }}>
                  <span className="material-symbols-outlined text-sm">filter_list</span>
                  Filter
                </button>
                <button className="px-4 py-2 bg-primary text-white rounded-lg font-label-md text-label-md flex items-center gap-2 hover:bg-primary-container transition-colors shadow-md shadow-primary/20">
                  <span className="material-symbols-outlined text-sm">add</span>
                  New Order
                </button>
              </div>
            </div>

            {/* Bento Analytics */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-gutter mb-stack-lg">
              {kpiCards.map((kpi, index) => (
                <div key={index} className="glass-card p-6 rounded-xl relative overflow-hidden group" style={{ background: 'rgba(255, 255, 255, 0.7)', backdropFilter: 'blur(12px)', border: '1px solid rgba(255, 255, 255, 0.2)', boxShadow: '0 10px 30px rgba(0, 0, 0, 0.04)' }}>
                  <div className={`absolute top-0 right-0 w-32 h-32 ${kpi.bgClass} rounded-bl-full -mr-8 -mt-8 transition-transform group-hover:scale-110`}></div>
                  <div className="flex justify-between items-start mb-4 relative z-10">
                    <div className={`p-2 ${kpi.iconBgClass} rounded-lg`}>
                      <span className="material-symbols-outlined">{kpi.icon}</span>
                    </div>
                    {kpi.trendText && (
                      <span className={`font-label-md text-label-md px-2 py-1 rounded-full ${kpi.trendClass}`}>{kpi.trendText}</span>
                    )}
                  </div>
                  <h3 className="font-body-sm text-body-sm text-secondary mb-1">{kpi.title}</h3>
                  <p className={`font-display-lg text-display-lg ${kpi.valueClass || 'text-on-surface'}`}>{kpi.value}</p>
                </div>
              ))}
            </div>

            {/* Orders Table Area */}
            <div className="glass-card rounded-xl flex flex-col" style={{ background: 'rgba(255, 255, 255, 0.7)', backdropFilter: 'blur(12px)', border: '1px solid rgba(255, 255, 255, 0.2)', boxShadow: '0 10px 30px rgba(0, 0, 0, 0.04)' }}>
              <div className="p-6 border-b border-outline-variant/20 flex justify-between items-center">
                <h3 className="font-headline-sm text-headline-sm text-on-surface">Active Fleet Orders</h3>
                {/* Bulk Actions */}
                <div className={`flex items-center gap-2 ${selectedOrders.size > 0 ? '' : 'hidden'}`}>
                  <span className="font-body-sm text-body-sm text-secondary mr-2">{selectedOrders.size} selected</span>
                  <button className="px-3 py-1.5 rounded bg-surface-variant text-on-surface font-label-md text-label-md hover:bg-surface-dim transition flex items-center gap-1">
                    <span className="material-symbols-outlined text-sm">swap_horiz</span> Reassign
                  </button>
                  <button className="px-3 py-1.5 rounded bg-error-container text-error font-label-md text-label-md hover:bg-error/20 transition flex items-center gap-1">
                    <span className="material-symbols-outlined text-sm">block</span> Cancel
                  </button>
                </div>
              </div>
              
              {/* Table List */}
              <div className="p-4 flex-1 overflow-auto bg-surface-container-lowest/30">
                <div className="grid grid-cols-[40px_100px_1.5fr_1fr_1.5fr_120px_100px_80px_40px] gap-4 px-4 py-2 mb-2 font-label-md text-label-md text-secondary uppercase tracking-wider">
                  <div><input type="checkbox" className="rounded border-outline-variant text-primary focus:ring-primary/50" onChange={toggleSelectAll} checked={selectedOrders.size === orders.length && orders.length > 0} /></div>
                  <div>Order ID</div>
                  <div>Customer</div>
                  <div>Driver</div>
                  <div>Destination</div>
                  <div>Status</div>
                  <div>ETA</div>
                  <div className="text-right">Cost</div>
                  <div></div>
                </div>

                <div className="space-y-3">
                  {orders.map((order, index) => (
                    <div key={index} onClick={() => setIsDrawerOpen(true)} className="grid grid-cols-[40px_100px_1.5fr_1fr_1.5fr_120px_100px_80px_40px] gap-4 items-center px-4 py-3 bg-white rounded-lg shadow-[0_2px_10px_rgba(0,0,0,0.02)] hover:shadow-[0_5px_15px_rgba(0,0,0,0.05)] border border-transparent hover:border-primary/10 transition-all cursor-pointer group">
                      <div className="relative z-10" onClick={(e) => e.stopPropagation()}>
                        <input type="checkbox" className="rounded border-outline-variant text-primary focus:ring-primary/50" checked={selectedOrders.has(index)} onChange={() => toggleSelectOrder(index)} />
                      </div>
                      <div className="font-label-md text-label-md text-on-surface">{order.id}</div>
                      <div>
                        <p className="font-body-sm text-body-sm font-medium text-on-surface">{order.customerName}</p>
                        <p className="font-label-md text-label-md text-secondary">{order.customerType}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className={`w-6 h-6 rounded-full ${order.driverBg} flex items-center justify-center font-label-md text-label-md`}>{order.driverInitials}</div>
                        <span className="font-body-sm text-body-sm text-on-surface">{order.driverName}</span>
                      </div>
                      <div className="font-body-sm text-body-sm text-secondary truncate">{order.destination}</div>
                      <div>
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full ${order.statusDotClass} font-label-md text-label-md`} style={{ background: 'rgba(var(--status-color), 0.1)', border: '1px solid rgba(var(--status-color), 0.5)' }}>
                          <span className={`w-1.5 h-1.5 rounded-full ${order.innerDotClass}`}></span> {order.status}
                        </span>
                      </div>
                      <div className={`font-body-sm text-body-sm ${order.etaClass}`}>{order.eta}</div>
                      <div className="font-label-md text-label-md text-on-surface text-right">{order.cost}</div>
                      <div className="opacity-0 group-hover:opacity-100 transition-opacity flex justify-end">
                        <button className="text-secondary hover:text-primary"><span className="material-symbols-outlined">more_vert</span></button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* Side Drawer */}
      <div className={`fixed right-0 top-0 h-full w-[400px] z-50 transform transition-transform duration-300 ease-in-out flex flex-col shadow-[-20px_0_50px_rgba(0,0,0,0.1)] ${isDrawerOpen ? 'translate-x-0' : 'translate-x-full'}`} style={{ background: 'rgba(255, 255, 255, 0.9)', backdropFilter: 'blur(12px)', borderLeft: '1px solid rgba(255, 255, 255, 0.3)' }}>
        <div className="p-6 border-b border-outline-variant/20 flex justify-between items-start">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <h2 className="font-headline-md text-headline-md text-on-surface">#ORD-9922</h2>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-amber-700" style={{ background: 'rgba(245, 158, 11, 0.1)', border: '1px solid rgba(245, 158, 11, 0.5)' }}>
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500 shadow-[0_0_5px_#f59e0b]"></span> Delayed
              </span>
            </div>
            <p className="font-body-sm text-body-sm text-secondary">Global Supply Inc • Cold Chain</p>
          </div>
          <button className="p-2 text-secondary hover:bg-surface-variant rounded-full transition-colors" onClick={() => setIsDrawerOpen(false)}>
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-6 space-y-8">
          <div className="p-4 rounded-xl flex gap-3 items-start" style={{ background: 'linear-gradient(135deg, rgba(147, 51, 234, 0.1), rgba(6, 182, 212, 0.1))', border: '1px solid rgba(147, 51, 234, 0.2)' }}>
            <span className="material-symbols-outlined text-primary-container">smart_toy</span>
            <div>
              <h4 className="font-label-md text-label-md text-on-surface font-semibold mb-1 uppercase tracking-wider">AI Insight</h4>
              <p className="font-body-sm text-body-sm text-on-surface-variant">Traffic collision on I-95 has caused a 45-minute delay. Re-routing suggested via Route 1, saving approx. 20 mins. Refrigerator temp stable.</p>
              <button className="mt-2 text-primary font-label-md text-label-md hover:underline">Apply Re-route</button>
            </div>
          </div>
          <div>
            <h3 className="font-headline-sm text-headline-sm text-on-surface mb-3 flex items-center gap-2">
              <span className="material-symbols-outlined text-secondary">map</span> Live Tracking
            </h3>
            <div className="w-full h-48 rounded-xl bg-surface-variant overflow-hidden relative border border-outline-variant/30">
              <div className="absolute inset-0 bg-cover bg-center opacity-80" style={{ backgroundImage: 'url("https://lh3.googleusercontent.com/aida-public/AB6AXuBmLKw9veIdddFjC5CgSU5wCOHw-3h8krtV07EMfjKk-c8h8eTJb2gi8hd9uez1bZOKZd7BDTveEHLH2Luu7ll70c0hMjrmjWWi_Tegjs1HvabscSbuS_J7G-Wc8G3YncwZ9_21--XjzQ6SgO6lTbbtobGNgsrax7dJe6jlU9XOkEfIikzN7Dkooh_a85q0CUGglVksEkpw7ogIrjqdKlAP3z49QaOJhUpPK23_ELPJ4t7OwDPNE-kaG_856hL_abx8nQCUT5ggWkAn")' }}></div>
              <div className="absolute top-2 right-2 bg-surface/90 backdrop-blur px-2 py-1 rounded text-[10px] font-label-md font-bold shadow">GPS Active</div>
            </div>
          </div>
          <div>
            <h3 className="font-headline-sm text-headline-sm text-on-surface mb-4 flex items-center gap-2">
              <span className="material-symbols-outlined text-secondary">timeline</span> Timeline
            </h3>
            <div className="relative border-l-2 border-outline-variant/30 ml-3 space-y-6">
              <div className="relative pl-6">
                <span className="absolute -left-[9px] top-1 w-4 h-4 rounded-full border-2 border-surface bg-amber-500 shadow-[0_0_10px_#f59e0b]"></span>
                <p className="font-label-md text-label-md text-amber-600 mb-0.5">14:05 - Current</p>
                <p className="font-body-sm text-body-sm text-on-surface font-medium">Delayed in Transit</p>
                <p className="font-body-sm text-body-sm text-secondary">Heavy traffic reported on I-95 North.</p>
              </div>
              <div className="relative pl-6">
                <span className="absolute -left-[9px] top-1 w-4 h-4 rounded-full border-2 border-surface bg-primary"></span>
                <p className="font-label-md text-label-md text-secondary mb-0.5">12:30</p>
                <p className="font-body-sm text-body-sm text-on-surface font-medium">Departed Hub A</p>
                <p className="font-body-sm text-body-sm text-secondary">Driver: Alice Smith completed loading.</p>
              </div>
              <div className="relative pl-6">
                <span className="absolute -left-[9px] top-1 w-4 h-4 rounded-full border-2 border-surface bg-outline"></span>
                <p className="font-label-md text-label-md text-secondary mb-0.5">09:15</p>
                <p className="font-body-sm text-body-sm text-on-surface font-medium">Order Confirmed</p>
                <p className="font-body-sm text-body-sm text-secondary">System auto-assigned to Cold Chain fleet.</p>
              </div>
            </div>
          </div>
          <div className="p-4 rounded-xl" style={{ background: 'rgba(255, 255, 255, 0.7)', backdropFilter: 'blur(12px)', border: '1px solid rgba(255, 255, 255, 0.2)', boxShadow: '0 10px 30px rgba(0, 0, 0, 0.04)' }}>
            <h3 className="font-headline-sm text-headline-sm text-on-surface mb-3 flex items-center gap-2">
              <span className="material-symbols-outlined text-secondary">payments</span> Financials
            </h3>
            <div className="flex justify-between items-center mb-2">
              <span className="font-body-sm text-body-sm text-secondary">Total Cost</span>
              <span className="font-body-md text-body-md font-semibold text-on-surface">$3,400.00</span>
            </div>
            <div className="flex justify-between items-center mb-4">
              <span className="font-body-sm text-body-sm text-secondary">Status</span>
              <span className="font-label-md text-label-md px-2 py-1 bg-green-100 text-green-800 rounded">Paid - Net 30</span>
            </div>
            <button className="w-full py-2 bg-surface-variant text-on-surface rounded font-label-md text-label-md hover:bg-surface-dim transition">View Invoice</button>
          </div>
        </div>
        <div className="p-6 border-t border-outline-variant/20 flex gap-3 bg-surface/50 backdrop-blur-md">
          <button className="flex-1 py-2.5 rounded-lg border border-outline text-on-surface font-label-md text-label-md hover:bg-surface-variant transition">Contact Driver</button>
          <button className="flex-1 py-2.5 rounded-lg bg-primary text-white font-label-md text-label-md hover:bg-primary-container transition shadow-md shadow-primary/20">Update Status</button>
        </div>
      </div>

      {/* Backdrop */}
      <div className={`fixed inset-0 bg-on-surface/20 backdrop-blur-sm z-40 transition-opacity ${isDrawerOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`} onClick={() => setIsDrawerOpen(false)}></div>
    </div>
  );
};

export default AdminOrders;
