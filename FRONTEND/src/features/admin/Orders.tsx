import React, { useState } from 'react';
import axios from 'axios';
import AdminSidebar from '@components/AdminSidebar';

interface PickingListItem {
  productSku: string;
  productName: string;
  quantityToPick: number;
  zoneName: string;
  binName: string;
}

interface OutboundResponse {
  waybillCode: string;
  qrCodeBase64: string; // Chuỗi Base64 của ảnh QR từ Backend
  pickingList: PickingListItem[];
  createdAt: string;
}

// UC004 - Picking list data per order
const orderPickingItems: Record<string, { id: string; sku: string; name: string; qty: number; location: string }[]> = {
  '#ORD-9921': [
    { id: 'p1', sku: 'WTR-AX3K-99', name: 'Wi-Fi 6 Router AX3000', qty: 2, location: 'Zone A - Shelf 04 - Level 2' },
    { id: 'p2', sku: 'CBL-C6-20M', name: 'CAT6 UTP Network Cable 20m', qty: 5, location: 'Zone A - Shelf 07 - Level 1' },
    { id: 'p3', sku: 'PWR-UPS-1K', name: 'UPS Power Supply 1000VA', qty: 1, location: 'Zone B - Shelf 02 - Level 3' },
  ],
  '#ORD-9922': [
    { id: 'p4', sku: 'CLD-PKG-A50', name: 'Cold Pack Insulated Box 50L', qty: 3, location: 'Zone C - Shelf 01 - Level 1 (Cold)' },
    { id: 'p5', sku: 'SEN-TMP-02', name: 'IoT Temperature Sensor', qty: 10, location: 'Zone C - Shelf 03 - Level 2 (Cold)' },
  ],
  '#ORD-9923': [
    { id: 'p6', sku: 'SSD-NVMe-1T', name: 'SSD NVMe 1TB Drive', qty: 20, location: 'Zone D - Shelf 05 - Level 2' },
    { id: 'p7', sku: 'RAM-DDR5-32', name: 'RAM DDR5 32GB ECC Module', qty: 8, location: 'Zone D - Shelf 05 - Level 3' },
    { id: 'p8', sku: 'CPU-EPYC-96', name: 'CPU AMD EPYC 9654 96-Core', qty: 2, location: 'Zone D - Shelf 06 - Level 1 (Secure)' },
  ],
};

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
  // UC004 states
  const [selectedOrderIndex, setSelectedOrderIndex] = useState<number>(0);
  const [drawerTab, setDrawerTab] = useState<'tracking' | 'outbound'>('tracking');
  const [pickedItems, setPickedItems] = useState<Set<string>>(new Set());
  const [isPrintLoading, setIsPrintLoading] = useState<string | null>(null);
  const [isBatchModalOpen, setIsBatchModalOpen] = useState(false);
  const [orderStatuses, setOrderStatuses] = useState<Record<string, string>>(
    Object.fromEntries(orders.map(o => [o.id, o.status]))
  );
  const [toastMsg, setToastMsg] = useState<string | null>(null);
  
  // Real API integration states
  const [outboundLoading, setOutboundLoading] = useState<boolean>(false);
  const [outboundResult, setOutboundResult] = useState<OutboundResponse | null>(null);

  const selectedOrder = orders[selectedOrderIndex];

  const openDrawer = (index: number) => {
    setSelectedOrderIndex(index);
    setDrawerTab('tracking');
    setPickedItems(new Set());
    setOutboundResult(null); // Reset real results when opening drawer for another order
    setIsDrawerOpen(true);
  };

  const handleTogglePick = (itemId: string) => {
    setPickedItems(prev => {
      const next = new Set(prev);
      next.has(itemId) ? next.delete(itemId) : next.add(itemId);
      return next;
    });
  };

  const handleSimulatePrint = (type: string) => {
    setIsPrintLoading(type);
    setTimeout(() => {
      setIsPrintLoading(null);
      showToast(`✅ Sent print command for ${type} of order ${selectedOrder?.id}`);
    }, 1800);
  };

  const handleCreateOutbound = async (orderIdStr: string) => {
    const orderId = parseInt(orderIdStr.replace(/\D/g, ''), 10);
    if (isNaN(orderId)) {
      showToast('❌ Invalid Order ID.');
      return;
    }

    setOutboundLoading(true);
    try {
      const response = await axios.post<OutboundResponse>('http://localhost:5200/api/outbound/create', {
        orderId: orderId
      });

      setOutboundResult(response.data);
      setOrderStatuses(prev => ({ ...prev, [orderIdStr]: 'In Transit' }));
      showToast(`🚚 Outbound successful! Order ${orderIdStr} status updated → In Transit`);
    } catch (error: any) {
      console.error('Error creating outbound order:', error);
      const errMsg = error.response?.data?.message || error.message || 'Unknown error occurred.';
      showToast(`❌ Outbound failed: ${errMsg}`);
    } finally {
      setOutboundLoading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleConfirmExport = () => {
    if (!selectedOrder) return;
    handleCreateOutbound(selectedOrder.id);
  };

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 4000);
  };

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
                  <button
                    onClick={() => setIsBatchModalOpen(true)}
                    className="px-3 py-1.5 rounded bg-blue-600 text-white font-label-md text-label-md hover:bg-blue-700 transition flex items-center gap-1 shadow-md shadow-blue-500/30"
                  >
                    <span className="material-symbols-outlined text-sm">print</span> Create Outbound &amp; Print
                  </button>
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
                    <div key={index} onClick={() => openDrawer(index)} className="grid grid-cols-[40px_100px_1.5fr_1fr_1.5fr_120px_100px_80px_40px] gap-4 items-center px-4 py-3 bg-white rounded-lg shadow-[0_2px_10px_rgba(0,0,0,0.02)] hover:shadow-[0_5px_15px_rgba(0,0,0,0.05)] border border-transparent hover:border-primary/10 transition-all cursor-pointer group">
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
      <div className={`fixed right-0 top-0 h-full w-[450px] z-50 transform transition-transform duration-300 ease-in-out flex flex-col shadow-[-20px_0_50px_rgba(0,0,0,0.1)] ${isDrawerOpen ? 'translate-x-0' : 'translate-x-full'}`} style={{ background: 'rgba(255, 255, 255, 0.95)', backdropFilter: 'blur(16px)', borderLeft: '1px solid rgba(255, 255, 255, 0.3)' }}>
        {selectedOrder && (
          <>
            {/* Drawer Header */}
            <div className="p-6 border-b border-outline-variant/20 flex justify-between items-start">
              <div>
                <div className="flex items-center gap-3 mb-1">
                  <h2 className="font-headline-md text-headline-md text-on-surface font-bold text-xl">{selectedOrder.id}</h2>
                  <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${(orderStatuses[selectedOrder.id] || selectedOrder.status) === 'In Transit'
                      ? 'text-green-700 bg-green-50 border border-green-200'
                      : 'text-amber-700 bg-amber-50 border border-amber-200'
                    }`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${(orderStatuses[selectedOrder.id] || selectedOrder.status) === 'In Transit'
                        ? 'bg-green-500'
                        : 'bg-amber-500'
                      }`}></span>
                    {orderStatuses[selectedOrder.id] || selectedOrder.status}
                  </span>
                </div>
                <p className="font-body-sm text-body-sm text-secondary">{selectedOrder.customerName} • {selectedOrder.customerType}</p>
              </div>
              <button className="p-2 text-secondary hover:bg-surface-variant rounded-full transition-colors" onClick={() => setIsDrawerOpen(false)}>
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            {/* Tab Navigation */}
            <div className="flex border-b border-outline-variant/10 px-6 bg-slate-50/50">
              <button
                onClick={() => setDrawerTab('tracking')}
                className={`flex-1 py-3 text-center font-medium text-xs border-b-2 transition-all flex items-center justify-center gap-1.5 ${drawerTab === 'tracking'
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-secondary hover:text-on-surface'
                  }`}
              >
                <span className="material-symbols-outlined text-sm">map</span>
                Tracking &amp; Logistics
              </button>
              <button
                onClick={() => setDrawerTab('outbound')}
                className={`flex-1 py-3 text-center font-medium text-xs border-b-2 transition-all flex items-center justify-center gap-1.5 ${drawerTab === 'outbound'
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-secondary hover:text-on-surface'
                  }`}
              >
                <span className="material-symbols-outlined text-sm">warehouse</span>
                Outbound &amp; Waybill (UC004)
              </button>
            </div>

            {/* Drawer Body */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {drawerTab === 'tracking' ? (
                /* Tab 1: Tracking, Analytics, Timeline (Original View) */
                <div className="space-y-6">
                  <div className="p-4 rounded-xl flex gap-3 items-start bg-blue-50/50 border border-blue-100">
                    <span className="material-symbols-outlined text-blue-600">smart_toy</span>
                    <div>
                      <h4 className="font-label-md text-label-md text-on-surface font-semibold mb-1 uppercase tracking-wider text-xs">AI Insight</h4>
                      <p className="font-body-sm text-body-sm text-on-surface-variant text-xs">Route optimization suggests taking the highway to save 15 minutes of transit time.</p>
                    </div>
                  </div>

                  <div>
                    <h3 className="font-headline-sm text-headline-sm text-on-surface mb-3 flex items-center gap-2 text-sm font-bold">
                      <span className="material-symbols-outlined text-secondary text-lg">map</span> Live Tracking
                    </h3>
                    <div className="w-full h-40 rounded-xl bg-surface-variant overflow-hidden relative border border-outline-variant/30">
                      <div className="absolute inset-0 bg-cover bg-center opacity-80" style={{ backgroundImage: 'url("https://lh3.googleusercontent.com/aida-public/AB6AXuBmLKw9veIdddFjC5CgSU5wCOHw-3h8krtV07EMfjKk-c8h8eTJb2gi8hd9uez1bZOKZd7BDTveEHLH2Luu7ll70c0hMjrmjWWi_Tegjs1HvabscSbuS_J7G-Wc8G3YncwZ9_21--XjzQ6SgO6lTbbtobGNgsrax7dJe6jlU9XOkEfIikzN7Dkooh_a85q0CUGglVksEkpw7ogIrjqdKlAP3z49QaOJhUpPK23_ELPJ4t7OwDPNE-kaG_856hL_abx8nQCUT5ggWkAn")' }}></div>
                      <div className="absolute top-2 right-2 bg-surface/90 backdrop-blur px-2 py-1 rounded text-[10px] font-label-md font-bold shadow">GPS Active</div>
                    </div>
                  </div>

                  <div>
                    <h3 className="font-headline-sm text-headline-sm text-on-surface mb-4 flex items-center gap-2 text-sm font-bold">
                      <span className="material-symbols-outlined text-secondary text-lg">timeline</span> Timeline
                    </h3>
                    <div className="relative border-l-2 border-outline-variant/30 ml-3 space-y-4">
                      <div className="relative pl-6">
                        <span className={`absolute -left-[9px] top-1 w-4 h-4 rounded-full border-2 border-surface ${(orderStatuses[selectedOrder.id] || selectedOrder.status) === 'In Transit'
                            ? 'bg-green-500 shadow-[0_0_10px_#22c55e]'
                            : 'bg-amber-500 shadow-[0_0_10px_#f59e0b]'
                          }`}></span>
                        <p className="font-label-md text-label-md text-secondary mb-0.5 text-xs">Current</p>
                        <p className="font-body-sm text-body-sm text-on-surface font-semibold text-xs">
                          {(orderStatuses[selectedOrder.id] || selectedOrder.status) === 'In Transit' ? 'In Transit' : 'Processing / Packing at Warehouse'}
                        </p>
                      </div>
                      <div className="relative pl-6">
                        <span className="absolute -left-[9px] top-1 w-4 h-4 rounded-full border-2 border-surface bg-primary"></span>
                        <p className="font-label-md text-label-md text-secondary mb-0.5 text-xs">09:15</p>
                        <p className="font-body-sm text-body-sm text-on-surface font-semibold text-xs">Order Confirmed</p>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 rounded-xl bg-white border border-outline-variant/20 shadow-sm">
                    <h3 className="font-headline-sm text-headline-sm text-on-surface mb-3 flex items-center gap-2 text-sm font-bold">
                      <span className="material-symbols-outlined text-secondary text-lg">payments</span> Financials
                    </h3>
                    <div className="flex justify-between items-center mb-2 text-xs">
                      <span className="text-secondary">Shipping Cost</span>
                      <span className="font-semibold text-on-surface">{selectedOrder.cost}</span>
                    </div>
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-secondary">Payment Status</span>
                      <span className="px-2 py-0.5 bg-green-100 text-green-800 rounded font-semibold">Paid</span>
                    </div>
                  </div>
                </div>
              ) : (
                /* Tab 2: Outbound, Picking List, Waybill (UC004 Flow) */
                <div className="space-y-6">
                  {/* Dynamic Print Style */}
                  <style>{`
                    @media print {
                      body * {
                        visibility: hidden !important;
                      }
                      #print-section, #print-section * {
                        visibility: visible !important;
                      }
                      #print-section {
                        position: absolute;
                        left: 0;
                        top: 0;
                        width: 100%;
                        background: white !important;
                        color: black !important;
                        padding: 20px;
                        box-shadow: none !important;
                      }
                      .no-print {
                        display: none !important;
                      }
                    }
                  `}</style>

                  {outboundResult ? (
                    /* Real Result from Backend */
                    <div id="print-section" className="space-y-6">
                      {/* Waybill Print Card */}
                      <div className="bg-white border-2 border-slate-900 rounded-xl p-5 shadow-sm relative overflow-hidden text-black">
                        <div className="flex justify-between items-start border-b border-slate-200 pb-3 mb-3">
                          <div>
                            <span className="text-[10px] font-bold text-blue-600 uppercase tracking-widest bg-blue-50 px-2 py-0.5 rounded">SmartLog Waybill</span>
                            <h4 className="font-bold text-sm mt-1 font-mono text-slate-900">{outboundResult.waybillCode}</h4>
                            <p className="text-[10px] text-slate-500 mt-0.5">Created: {new Date(outboundResult.createdAt).toLocaleString()}</p>
                          </div>
                          {outboundResult.qrCodeBase64 && (
                            <img src={outboundResult.qrCodeBase64} alt="Waybill QR Code" className="w-20 h-20 border border-slate-100 p-1 bg-white" />
                          )}
                        </div>

                        <div className="space-y-2.5 text-xs">
                          <div>
                            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Sender:</span>
                            <p className="font-medium text-slate-800 text-[11px]">SmartLog Hub A - District 9, HCMC</p>
                          </div>
                          <div>
                            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Receiver:</span>
                            <p className="font-bold text-slate-900 text-[11px]">{selectedOrder.customerName}</p>
                            <p className="text-slate-600 text-[11px] leading-tight mt-0.5">{selectedOrder.destination}</p>
                          </div>
                          <div className="grid grid-cols-2 gap-4 border-t border-slate-100 pt-2 text-[11px]">
                            <div>
                              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Total Weight:</span>
                              <p className="font-semibold text-slate-800">45 kg</p>
                            </div>
                            <div>
                              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Final Cost:</span>
                              <p className="font-semibold text-slate-800">{selectedOrder.cost}</p>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Picking List table */}
                      <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm text-black">
                        <div className="flex items-center gap-2 border-b border-gray-100 pb-3 mb-3">
                          <span className="material-symbols-outlined text-blue-600 text-lg">receipt_long</span>
                          <h4 className="font-bold text-sm text-on-surface">Optimized Picking Path</h4>
                        </div>
                        <div className="overflow-x-auto">
                          <table className="w-full text-xs text-left">
                            <thead>
                              <tr className="border-b border-slate-100 text-slate-400 font-semibold uppercase text-[10px]">
                                <th className="py-2">SKU</th>
                                <th className="py-2">Product</th>
                                <th className="py-2 text-center">Qty</th>
                                <th className="py-2 text-right">Location</th>
                              </tr>
                            </thead>
                            <tbody>
                              {outboundResult.pickingList.map((item, idx) => (
                                <tr key={idx} className="border-b border-slate-100 last:border-0">
                                  <td className="py-2 font-mono text-slate-600">{item.productSku}</td>
                                  <td className="py-2 font-medium text-slate-900 truncate max-w-[120px]">{item.productName}</td>
                                  <td className="py-2 text-center font-bold text-blue-600">{item.quantityToPick}</td>
                                  <td className="py-2 text-right font-semibold text-slate-700">
                                    {item.zoneName} - {item.binName}
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>

                      {/* Print Actions (Visible only on screen) */}
                      <div className="grid grid-cols-1 gap-3 no-print">
                        <button
                          onClick={handlePrint}
                          className="py-2.5 rounded-lg bg-green-600 hover:bg-green-700 text-white font-semibold text-xs transition flex items-center justify-center gap-1.5 shadow-md shadow-green-500/20"
                        >
                          <span className="material-symbols-outlined text-sm">print</span>
                          Print Documents (Waybill &amp; Picking List)
                        </button>
                      </div>
                    </div>
                  ) : (
                    /* Preview mockup when not processed */
                    <>
                      {/* Picking List Checklist */}
                      <div className="bg-white border border-outline-variant/30 rounded-xl p-4 shadow-sm">
                        <div className="flex items-center gap-2 border-b border-gray-100 pb-3 mb-3">
                          <span className="material-symbols-outlined text-blue-600 text-lg">inventory_2</span>
                          <h4 className="font-bold text-sm text-on-surface">Picking List Preview</h4>
                        </div>
                        <p className="text-xs text-secondary mb-3">Please pick items according to the optimized shelf locations below:</p>

                        <div className="space-y-2.5">
                          {orderPickingItems[selectedOrder.id]?.map((item) => {
                            const isPicked = pickedItems.has(item.id);
                            return (
                              <div
                                key={item.id}
                                onClick={() => handleTogglePick(item.id)}
                                className={`flex items-start gap-3 p-3 rounded-lg border transition-all cursor-pointer ${isPicked ? 'bg-blue-50/40 border-blue-200' : 'bg-slate-50 border-slate-100 hover:border-slate-200'
                                  }`}
                              >
                                <input
                                  type="checkbox"
                                  checked={isPicked}
                                  onChange={() => { }} // handled by div onClick
                                  className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 mt-0.5"
                                />
                                <div className="flex-1 min-w-0">
                                  <div className="flex justify-between items-start gap-2">
                                    <p className={`font-semibold text-xs truncate ${isPicked ? 'text-blue-900 line-through' : 'text-slate-900'}`}>{item.name}</p>
                                    <span className="text-xs font-bold text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded shrink-0">Qty: {item.qty}</span>
                                  </div>
                                  <div className="flex justify-between items-center mt-1 text-[11px] text-secondary">
                                    <span>SKU: {item.sku}</span>
                                    <span className="font-medium text-blue-700 bg-blue-50/50 px-1 rounded flex items-center gap-0.5">
                                      <span className="material-symbols-outlined text-[10px]">location_on</span>
                                      {item.location}
                                    </span>
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>

                      {/* Waybill Print Preview Card */}
                      <div className="bg-white border-2 border-dashed border-slate-300 rounded-xl p-5 shadow-inner relative overflow-hidden">
                        <div className="absolute top-0 right-0 bg-slate-100 text-slate-500 px-3 py-1 rounded-bl-lg text-[9px] font-bold tracking-wider uppercase border-l border-b border-slate-200">Waybill Preview</div>

                        {/* Barcode mockup */}
                        <div className="flex flex-col items-center mb-4 mt-2">
                          <div className="flex justify-center items-center gap-[2px] h-10 w-full bg-white p-1 border border-gray-100 rounded">
                            <div className="w-[3px] h-8 bg-black"></div>
                            <div className="w-[1px] h-8 bg-black"></div>
                            <div className="w-[4px] h-8 bg-black"></div>
                            <div className="w-[2px] h-8 bg-black"></div>
                            <div className="w-[1px] h-8 bg-black"></div>
                            <div className="w-[3px] h-8 bg-black"></div>
                            <div className="w-[1px] h-8 bg-black"></div>
                            <div className="w-[5px] h-8 bg-black"></div>
                            <div className="w-[2px] h-8 bg-black"></div>
                            <div className="w-[1px] h-8 bg-black"></div>
                            <div className="w-[3px] h-8 bg-black"></div>
                            <div className="w-[1px] h-8 bg-black"></div>
                            <div className="w-[4px] h-8 bg-black"></div>
                            <div className="w-[2px] h-8 bg-black"></div>
                          </div>
                          <span className="text-[10px] font-mono tracking-widest text-slate-700 mt-1 font-bold">*{selectedOrder.id.replace('#', 'WB')}*</span>
                        </div>

                        <div className="space-y-3 text-xs border-t border-slate-100 pt-3">
                          <div>
                            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Sender:</span>
                            <p className="font-medium text-slate-800 text-[11px]">SmartLog Hub A - District 9, HCMC</p>
                          </div>
                          <div>
                            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Receiver:</span>
                            <p className="font-bold text-slate-900 text-[11px]">{selectedOrder.customerName}</p>
                            <p className="text-slate-600 text-[11px] leading-tight mt-0.5">{selectedOrder.destination}</p>
                          </div>
                          <div className="grid grid-cols-2 gap-4 border-t border-slate-100 pt-2 text-[11px]">
                            <div>
                              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Weight:</span>
                              <p className="font-semibold text-slate-800">45 kg (Est.)</p>
                            </div>
                            <div>
                              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Cost:</span>
                              <p className="font-semibold text-slate-800">{selectedOrder.cost}</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              )}
            </div>

            {/* Drawer Footer actions */}
            <div className="p-6 border-t border-outline-variant/20 flex gap-3 bg-surface/50 backdrop-blur-md">
              {drawerTab === 'outbound' ? (
                outboundResult ? (
                  <button
                    onClick={handlePrint}
                    className="w-full py-2.5 rounded-lg bg-green-600 hover:bg-green-700 text-white font-semibold text-xs transition shadow-md shadow-green-500/20 flex items-center justify-center gap-1.5"
                  >
                    <span className="material-symbols-outlined text-sm">print</span>
                    Print Waybill &amp; Picking List
                  </button>
                ) : outboundLoading ? (
                  <button
                    disabled
                    className="w-full py-2.5 rounded-lg bg-blue-400 text-white font-semibold text-xs flex items-center justify-center gap-1.5 cursor-not-allowed"
                  >
                    <span className="material-symbols-outlined text-sm animate-spin">sync</span>
                    Processing Outbound...
                  </button>
                ) : (
                  <button
                    onClick={handleConfirmExport}
                    disabled={(orderStatuses[selectedOrder.id] || selectedOrder.status) === 'In Transit'}
                    className="w-full py-2.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs transition shadow-md shadow-blue-500/20 flex items-center justify-center gap-1.5 disabled:opacity-50 disabled:bg-slate-300 disabled:shadow-none"
                  >
                    <span className="material-symbols-outlined text-sm">local_shipping</span>
                    Confirm Outbound &amp; Dispatch Driver
                  </button>
                )
              ) : (
                <>
                  <button className="flex-1 py-2.5 rounded-lg border border-outline text-on-surface font-label-md text-label-md hover:bg-surface-variant transition">Contact Driver</button>
                  <button className="flex-1 py-2.5 rounded-lg bg-primary text-white font-label-md text-label-md hover:bg-primary-container transition shadow-md shadow-primary/20">Update Status</button>
                </>
              )}
            </div>
          </>
        )}
      </div>

      {/* Batch Outbound & Print Modal (UC004) */}
      {isBatchModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/55 backdrop-blur-sm">
          <div className="w-full max-w-2xl bg-white rounded-2xl overflow-hidden border border-outline-variant/20 shadow-2xl flex flex-col max-h-[85vh]">
            {/* Modal Header */}
            <div className="p-5 border-b border-gray-100 flex justify-between items-center bg-slate-50">
              <h3 className="font-bold text-base text-slate-900 flex items-center gap-2">
                <span className="material-symbols-outlined text-blue-600">warehouse</span>
                Batch Outbound &amp; Print ({selectedOrders.size} Orders)
              </h3>
              <button onClick={() => setIsBatchModalOpen(false)} className="text-secondary hover:text-error transition-colors p-1">
                <span className="material-symbols-outlined text-lg">close</span>
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto space-y-6 flex-1 text-left">
              {/* Consolidated Picking Checklist */}
              <div>
                <h4 className="font-bold text-xs text-slate-800 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-sm">receipt_long</span>
                  1. Consolidated Picking List
                </h4>
                <div className="border border-slate-100 rounded-xl bg-slate-50/50 p-4 space-y-2">
                  <div className="grid grid-cols-[1.5fr_100px_1fr] gap-4 font-bold text-[10px] text-slate-400 uppercase tracking-wider pb-2 border-b border-slate-100">
                    <div>Product</div>
                    <div className="text-center">Total Qty</div>
                    <div className="text-right">Shelf Location</div>
                  </div>
                  {/* Mock sum items */}
                  <div className="space-y-2 pt-1 text-xs">
                    <div className="grid grid-cols-[1.5fr_100px_1fr] gap-4 py-1 items-center border-b border-dashed border-slate-100">
                      <div className="font-semibold text-slate-800">Wi-Fi 6 Router AX3000</div>
                      <div className="text-center font-bold text-blue-600 bg-blue-50 rounded py-0.5 mx-auto w-12">2</div>
                      <div className="text-right font-medium text-slate-600">Zone A - Shelf 04</div>
                    </div>
                    <div className="grid grid-cols-[1.5fr_100px_1fr] gap-4 py-1 items-center border-b border-dashed border-slate-100">
                      <div className="font-semibold text-slate-800">CAT6 UTP Network Cable 20m</div>
                      <div className="text-center font-bold text-blue-600 bg-blue-50 rounded py-0.5 mx-auto w-12">5</div>
                      <div className="text-right font-medium text-slate-600">Zone A - Shelf 07</div>
                    </div>
                    <div className="grid grid-cols-[1.5fr_100px_1fr] gap-4 py-1 items-center">
                      <div className="font-semibold text-slate-800">Cold Pack Insulated Box 50L</div>
                      <div className="text-center font-bold text-blue-600 bg-blue-50 rounded py-0.5 mx-auto w-12">3</div>
                      <div className="text-right font-medium text-slate-600">Zone C - Shelf 01 (Cold)</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Waybills preview list */}
              <div>
                <h4 className="font-bold text-xs text-slate-800 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-sm">barcode_scanner</span>
                  2. Waybill &amp; Export Document Previews
                </h4>
                <div className="space-y-3">
                  {orders.filter((_, i) => selectedOrders.has(i)).map(order => (
                    <div key={order.id} className="border border-slate-200 rounded-lg p-3 flex justify-between items-center bg-white">
                      <div className="text-xs">
                        <p className="font-bold text-slate-900">{order.id} - Outbound Waybill</p>
                        <p className="text-slate-500 text-[11px]">Cust: {order.customerName} • {order.destination}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-mono bg-slate-100 px-2 py-1 rounded shrink-0">*{order.id.replace('#', 'WB')}*</span>
                        <span className="material-symbols-outlined text-green-600 text-sm">check_circle</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-gray-100 bg-slate-50 flex justify-end gap-3">
              <button
                onClick={() => setIsBatchModalOpen(false)}
                className="px-4 py-2 border border-slate-300 text-slate-700 font-semibold text-xs rounded-lg hover:bg-slate-100 transition"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  const selectedList = orders.filter((_, i) => selectedOrders.has(i));
                  setOrderStatuses(prev => {
                    const next = { ...prev };
                    selectedList.forEach(o => { next[o.id] = 'In Transit'; });
                    return next;
                  });
                  setIsBatchModalOpen(false);
                  setSelectedOrders(new Set());
                  showToast(`🖨️ Batch printed ${selectedList.length} waybills & updated order statuses successfully!`);
                }}
                className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs rounded-lg shadow-md shadow-blue-500/20 transition flex items-center gap-1.5"
              >
                <span className="material-symbols-outlined text-sm">print</span>
                Confirm Outbound &amp; Batch Print
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Floating Ops notification toast banner */}
      {toastMsg && (
        <div className="fixed bottom-4 right-4 z-[99] max-w-sm bg-white rounded-lg shadow-[0_4px_25px_rgba(0,0,0,0.15)] border-l-4 border-blue-600 p-3.5 flex items-start gap-3 select-none animate-slide-up pointer-events-auto border border-slate-100">
          <span className="material-symbols-outlined text-[20px] text-blue-600 mt-0.5">
            info
          </span>
          <div className="flex-1 text-left">
            <p className="text-[12px] font-bold text-slate-900 uppercase tracking-wider mb-0.5">
              Warehouse Ops Update
            </p>
            <p className="text-[11px] text-slate-600 leading-tight">{toastMsg}</p>
          </div>
          <button
            onClick={() => setToastMsg(null)}
            className="text-slate-400 hover:text-error transition-colors shrink-0"
          >
            <span className="material-symbols-outlined text-[16px]">close</span>
          </button>
        </div>
      )}

      {/* Backdrop */}
      <div className={`fixed inset-0 bg-on-surface/20 backdrop-blur-sm z-40 transition-opacity ${isDrawerOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`} onClick={() => setIsDrawerOpen(false)}></div>
    </div>
  );
};

export default AdminOrders;

