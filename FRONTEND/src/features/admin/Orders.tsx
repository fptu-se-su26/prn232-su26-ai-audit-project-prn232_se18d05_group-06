import React, { useState, useEffect } from 'react';
import axios from 'axios';
import AdminSidebar from '@components/AdminSidebar';

const API_BASE = 'http://localhost:5184';

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

// Shape returned by GET /api/outbound
interface RealOutboundRow {
  outboundId: number;
  outboundCode: string;
  orderId: number;
  orderCode: string;
  status: string;
  warehouseName: string;
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

  // Phase D States
  const [outboundDetail, setOutboundDetail] = useState<any | null>(null);
  const [outboundDetailLoading, setOutboundDetailLoading] = useState<boolean>(false);
  const [shippingLabel, setShippingLabel] = useState<any | null>(null);

  // ── Real outbound orders fetched from API ──────────────────────────────────
  const [realOutboundList, setRealOutboundList] = useState<RealOutboundRow[]>([]);
  const [realOutboundListLoading, setRealOutboundListLoading] = useState(false);
  // Label for the drawer header when opened from a real row (not a mock row)
  const [drawerRealRow, setDrawerRealRow] = useState<RealOutboundRow | null>(null);
  // isMockRow = true when the drawer was opened via the mock table
  const [isMockRow, setIsMockRow] = useState(false);

  const selectedOrder = orders[selectedOrderIndex];

  // Helper for auth headers
  const getAuthHeaders = () => {
    const token = localStorage.getItem('token');
    return token ? { headers: { Authorization: `Bearer ${token}` } } : {};
  };

  // Eligible ServiceOrders state for UC004 Phase A
  const [eligibleServiceOrders, setEligibleServiceOrders] = useState<any[]>([]);
  const [eligibleLoading, setEligibleLoading] = useState<boolean>(false);



  const loadEligibleServiceOrders = async () => {
    setEligibleLoading(true);
    try {
      const res = await axios.get<any[]>(`${API_BASE}/api/outbound/eligible-service-orders`, getAuthHeaders());
      setEligibleServiceOrders(res.data);
    } catch (err) {
      console.error('Failed to load eligible service orders:', err);
    } finally {
      setEligibleLoading(false);
    }
  };

  // ── Load real outbound orders from the backend on mount ───────────────────
  const loadRealOutboundList = async () => {
    setRealOutboundListLoading(true);
    try {
      const res = await axios.get<RealOutboundRow[]>(`${API_BASE}/api/outbound`, getAuthHeaders());
      setRealOutboundList(res.data);
    } catch (err) {
      console.error('Failed to load real outbound orders:', err);
    } finally {
      setRealOutboundListLoading(false);
    }
  };

  useEffect(() => {
    loadRealOutboundList();
    loadEligibleServiceOrders();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Fetch outbound detail by outboundId directly (more reliable than searching by orderId)
  const fetchOutboundDetail = async (outboundId: number) => {
    setOutboundDetailLoading(true);
    setShippingLabel(null);
    try {
      const response = await axios.get<any>(`${API_BASE}/api/outbound/${outboundId}`, getAuthHeaders());
      const found = response.data;
      if (found) {
        setOutboundDetail(found);
        // Fetch shipping label if status is PACKED or DISPATCHED
        if (found.status === 'PACKED' || found.status === 'DISPATCHED') {
          try {
            const labelRes = await axios.get(`${API_BASE}/api/outbound/${found.outboundId}/shipping-label`, getAuthHeaders());
            setShippingLabel(labelRes.data);
          } catch (e) {
            console.log('No shipping label found yet.');
          }
        }
      }
    } catch (error) {
      console.error('Error fetching outbound detail:', error);
    } finally {
      setOutboundDetailLoading(false);
    }
  };

  // Open drawer for a mock table row (UC004 tab will show disabled message)
  const openDrawer = (index: number) => {
    setSelectedOrderIndex(index);
    setDrawerTab('tracking');
    setPickedItems(new Set());
    setOutboundResult(null);
    setOutboundDetail(null);
    setShippingLabel(null);
    setDrawerRealRow(null);
    setIsMockRow(true);
    setIsDrawerOpen(true);
  };

  // Open drawer for a real outbound row — loads the real outbound detail immediately
  const openDrawerForReal = (row: RealOutboundRow) => {
    setDrawerRealRow(row);
    setIsMockRow(false);
    setDrawerTab('outbound');
    setPickedItems(new Set());
    setOutboundResult(null);
    setOutboundDetail(null);
    setShippingLabel(null);
    setIsDrawerOpen(true);
    fetchOutboundDetail(row.outboundId);
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

  // Create an outbound order from a real ServiceOrder ID, then reload the detail
  const handleCreateOutbound = async (orderId: number) => {
    if (!orderId || isNaN(orderId)) {
      showToast('❌ Invalid Order ID.');
      return;
    }
    setOutboundLoading(true);
    try {
      const res = await axios.post<any>(`${API_BASE}/api/outbound/create`, {
        orderId
      }, getAuthHeaders());
      showToast(`🚚 Outbound created successfully!`);
      
      // Refresh the eligible service orders list
      await loadEligibleServiceOrders();
      
      // Refresh the real outbound list and open the new outbound
      const freshListRes = await axios.get<RealOutboundRow[]>(`${API_BASE}/api/outbound`, getAuthHeaders());
      setRealOutboundList(freshListRes.data);

      const newOutboundId: number = res.data?.outboundId;
      if (newOutboundId) {
        const foundRow = freshListRes.data.find(r => r.outboundId === newOutboundId);
        if (foundRow) {
          openDrawerForReal(foundRow);
        } else {
          const fallbackRow: RealOutboundRow = {
            outboundId: newOutboundId,
            outboundCode: res.data?.outboundCode || `OUT-${newOutboundId}`,
            orderId: orderId,
            orderCode: '',
            status: 'PENDING',
            warehouseName: '',
            createdAt: new Date().toISOString()
          };
          openDrawerForReal(fallbackRow);
        }
      }
    } catch (error: any) {
      console.error('Error creating outbound order:', error);
      const errMsg = error.response?.data?.details || error.response?.data?.message || error.message || 'Unknown error occurred.';
      showToast(`❌ Outbound failed: ${errMsg}`);
    } finally {
      setOutboundLoading(false);
    }
  };

  const handlePickLine = async (outboundId: number, lineId: number, reqQty: number) => {
    try {
      await axios.post(`${API_BASE}/api/outbound/${outboundId}/lines/${lineId}/pick`, {
        pickedQty: reqQty
      }, getAuthHeaders());
      showToast(`✅ Picked item line ${lineId}`);
      fetchOutboundDetail(outboundId);
    } catch (error: any) {
      const errMsg = error.response?.data?.message || error.message;
      showToast(`❌ Picking failed: ${errMsg}`);
    }
  };

  const handleConfirmPicking = async (outboundId: number) => {
    try {
      await axios.post(`${API_BASE}/api/outbound/${outboundId}/confirm-picking`, {}, getAuthHeaders());
      showToast(`✅ Picking confirmed! Status → PACKED`);
      fetchOutboundDetail(outboundId);
    } catch (error: any) {
      const errMsg = error.response?.data?.message || error.message;
      showToast(`❌ Confirmation failed: ${errMsg}`);
    }
  };

  const handleGenerateShippingLabel = async (outboundId: number) => {
    try {
      const response = await axios.put(`${API_BASE}/api/outbound/${outboundId}/shipping-label`, {}, getAuthHeaders());
      setShippingLabel(response.data);
      showToast(`✅ Waybill generated successfully!`);
      fetchOutboundDetail(outboundId);
    } catch (error: any) {
      const errMsg = error.response?.data?.message || error.message;
      showToast(`❌ Waybill generation failed: ${errMsg}`);
    }
  };

  const handleDispatchOrder = async (outboundId: number) => {
    setOutboundLoading(true);
    try {
      await axios.post(`${API_BASE}/api/outbound/${outboundId}/dispatch`, {}, getAuthHeaders());
      showToast(`🚚 Outbound order dispatched successfully!`);
      fetchOutboundDetail(outboundId);
      loadRealOutboundList();
    } catch (error: any) {
      const errMsg = error.response?.data?.message || error.message;
      showToast(`❌ Dispatch failed: ${errMsg}`);
    } finally {
      setOutboundLoading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleConfirmExport = () => {
    if (!selectedOrder) return;
    // mock rows don't have a valid ServiceOrder — guide user to use the real table below
    showToast('⚠️ Please use the "Live Outbound Orders" table below to create outbound orders.');
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

  // Status badge helper for real outbound rows
  const outboundStatusBadge = (status: string) => {
    const map: Record<string, string> = {
      PENDING:    'bg-yellow-100 text-yellow-800 border-yellow-200',
      PICKING:    'bg-amber-100  text-amber-800  border-amber-200',
      PACKED:     'bg-blue-100   text-blue-800   border-blue-200',
      DISPATCHED: 'bg-green-100  text-green-800  border-green-200',
    };
    return map[status] ?? 'bg-slate-100 text-slate-700 border-slate-200';
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
                <button
                  onClick={() => showToast('New Order belongs to the customer/order module. Warehouse outbound processing starts after a ServiceOrder is CONFIRMED.')}
                  className="px-4 py-2 bg-primary text-white rounded-lg font-label-md text-label-md flex items-center gap-2 hover:bg-primary-container transition-colors shadow-md shadow-primary/20"
                >
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

            {/* ── Approved Service Orders Ready for Outbound (UC004 Phase A) ── */}
            <div className="glass-card rounded-xl flex flex-col mt-6" style={{ background: 'rgba(255, 255, 255, 0.7)', backdropFilter: 'blur(12px)', border: '1px solid rgba(16,185,129,0.25)', boxShadow: '0 10px 30px rgba(0, 0, 0, 0.04)' }}>
              <div className="p-6 border-b border-emerald-100 flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <span className="material-symbols-outlined text-emerald-600">assignment_turned_in</span>
                  <div>
                    <h3 className="font-headline-sm text-headline-sm text-on-surface font-bold">Đơn hàng đã duyệt chờ xuất kho</h3>
                    <p className="text-xs text-secondary mt-0.5">Approved service orders awaiting warehouse outbound fulfillment initialization.</p>
                  </div>
                </div>
                <button
                  onClick={loadEligibleServiceOrders}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-emerald-200 text-emerald-700 text-xs font-semibold hover:bg-emerald-50 transition"
                >
                  <span className="material-symbols-outlined text-sm">refresh</span>
                  Refresh
                </button>
              </div>

              <div className="p-4">
                {eligibleLoading ? (
                  <div className="flex items-center gap-2 py-6 justify-center text-secondary text-sm">
                    <span className="material-symbols-outlined animate-spin text-emerald-500">sync</span>
                    Loading eligible service orders...
                  </div>
                ) : eligibleServiceOrders.length === 0 ? (
                  <div className="text-center py-8 text-secondary text-sm">
                    <span className="material-symbols-outlined text-3xl block mb-2 text-slate-300">check_circle_outline</span>
                    No CONFIRMED service orders are ready for outbound. Create and approve a service order first.
                  </div>
                ) : (
                  <div className="space-y-2">
                    {/* Header */}
                    <div className="grid grid-cols-[80px_160px_1fr_120px_120px_180px] gap-3 px-3 py-1.5 text-[10px] font-bold text-secondary uppercase tracking-wider">
                      <div>Order ID</div>
                      <div>Order Code</div>
                      <div>Customer</div>
                      <div>Status</div>
                      <div>Created</div>
                      <div className="text-right">Action</div>
                    </div>
                    {eligibleServiceOrders.map((so) => (
                      <div
                        key={so.orderId}
                        className="grid grid-cols-[80px_160px_1fr_120px_120px_180px] gap-3 items-center px-3 py-3 bg-white rounded-lg border border-emerald-50 hover:border-emerald-300 hover:shadow-md transition-all group"
                      >
                        <div className="font-mono text-xs font-bold text-slate-700">#{so.orderId}</div>
                        <div className="font-mono text-xs text-slate-800">{so.orderCode}</div>
                        <div className="text-xs text-secondary truncate">{so.customerName ?? '—'}</div>
                        <div>
                          <span className="inline-block px-2 py-0.5 rounded text-[10px] font-bold border bg-emerald-100 text-emerald-800 border-emerald-200">
                            {so.status}
                          </span>
                        </div>
                        <div className="text-[10px] text-slate-400">
                          {so.createdAt ? new Date(so.createdAt).toLocaleDateString() : '—'}
                        </div>
                        <div className="text-right">
                          <button
                            onClick={() => handleCreateOutbound(so.orderId)}
                            className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-xs font-bold shadow-sm transition"
                          >
                            Create Outbound Order
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* ── Live Outbound Orders (UC004) ──────────────────────────────── */}
            <div className="glass-card rounded-xl flex flex-col mt-6" style={{ background: 'rgba(255, 255, 255, 0.7)', backdropFilter: 'blur(12px)', border: '1px solid rgba(59,130,246,0.25)', boxShadow: '0 10px 30px rgba(0, 0, 0, 0.04)' }}>
              <div className="p-6 border-b border-blue-100 flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <span className="material-symbols-outlined text-blue-600">warehouse</span>
                  <div>
                    <h3 className="font-headline-sm text-headline-sm text-on-surface font-bold">Lệnh xuất kho đang xử lý</h3>
                    <p className="text-xs text-secondary mt-0.5">Real orders from the database — click a row to open the outbound picking &amp; dispatch workflow.</p>
                  </div>
                </div>
                <button
                  onClick={loadRealOutboundList}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-blue-200 text-blue-700 text-xs font-semibold hover:bg-blue-50 transition"
                >
                  <span className="material-symbols-outlined text-sm">refresh</span>
                  Refresh
                </button>
              </div>

              <div className="p-4">
                {realOutboundListLoading ? (
                  <div className="flex items-center gap-2 py-6 justify-center text-secondary text-sm">
                    <span className="material-symbols-outlined animate-spin text-blue-500">sync</span>
                    Loading outbound orders...
                  </div>
                ) : realOutboundList.length === 0 ? (
                  <div className="text-center py-8 text-secondary text-sm">
                    <span className="material-symbols-outlined text-3xl block mb-2 text-slate-300">local_shipping</span>
                    No outbound orders found in the database.
                  </div>
                ) : (
                  <div className="space-y-2">
                    {/* Header */}
                    <div className="grid grid-cols-[80px_160px_160px_1fr_120px_100px] gap-3 px-3 py-1.5 text-[10px] font-bold text-secondary uppercase tracking-wider">
                      <div>Outbound ID</div>
                      <div>Outbound Code</div>
                      <div>Order Code</div>
                      <div>Warehouse</div>
                      <div>Status</div>
                      <div>Created</div>
                    </div>
                    {realOutboundList.map((row) => (
                      <div
                        key={row.outboundId}
                        onClick={() => openDrawerForReal(row)}
                        className="grid grid-cols-[80px_160px_160px_1fr_120px_100px] gap-3 items-center px-3 py-3 bg-white rounded-lg border border-blue-50 hover:border-blue-300 hover:shadow-md transition-all cursor-pointer group"
                      >
                        <div className="font-mono text-xs font-bold text-slate-700">#{row.outboundId}</div>
                        <div className="font-mono text-xs text-slate-800">{row.outboundCode}</div>
                        <div className="text-xs text-secondary">{row.orderCode}</div>
                        <div className="text-xs text-secondary truncate">{row.warehouseName ?? '—'}</div>
                        <div>
                          <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold border ${outboundStatusBadge(row.status)}`}>
                            {row.status}
                          </span>
                        </div>
                        <div className="text-[10px] text-slate-400">
                          {new Date(row.createdAt).toLocaleDateString()}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
            {/* ── End Live Outbound Orders ───────────────────────────────────── */}

          </div>
        </main>
      </div>

      {/* Side Drawer */}
      <div className={`fixed right-0 top-0 h-full w-[450px] z-50 transform transition-transform duration-300 ease-in-out flex flex-col shadow-[-20px_0_50px_rgba(0,0,0,0.1)] ${isDrawerOpen ? 'translate-x-0' : 'translate-x-full'}`} style={{ background: 'rgba(255, 255, 255, 0.95)', backdropFilter: 'blur(16px)', borderLeft: '1px solid rgba(255, 255, 255, 0.3)' }}>
        {/* Drawer opened from a REAL outbound row */}
        {!isMockRow && drawerRealRow && (
          <>
            {/* Drawer Header – real outbound row */}
            <div className="p-6 border-b border-outline-variant/20 flex justify-between items-start">
              <div>
                <div className="flex items-center gap-3 mb-1">
                  <h2 className="font-headline-md text-headline-md text-on-surface font-bold text-xl">{drawerRealRow.outboundCode}</h2>
                  <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold border ${outboundStatusBadge(outboundDetail?.status ?? drawerRealRow.status)}`}>
                    <span className="w-1.5 h-1.5 rounded-full bg-current opacity-70"></span>
                    {outboundDetail?.status ?? drawerRealRow.status}
                  </span>
                </div>
                <p className="font-body-sm text-body-sm text-secondary">Order: {drawerRealRow.orderCode} &bull; ID #{drawerRealRow.outboundId}</p>
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
                Outbound &amp; Waybill
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

                  {outboundDetailLoading ? (
                    <div className="flex flex-col items-center justify-center py-12">
                      <span className="material-symbols-outlined text-3xl text-blue-600 animate-spin">sync</span>
                      <p className="text-xs text-secondary mt-2">Loading Outbound Details...</p>
                    </div>
                  ) : outboundDetail ? (
                    <div className="space-y-6">
                      {/* Outbound Order Header Card */}
                      <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 text-xs space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="font-bold text-slate-500 uppercase tracking-wider">Outbound Order:</span>
                          <span className="font-mono font-bold text-slate-800">{outboundDetail.outboundCode}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="font-bold text-slate-500 uppercase tracking-wider">Status:</span>
                          <span className={`px-2 py-0.5 rounded font-bold uppercase text-[10px] ${
                            outboundDetail.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' :
                            outboundDetail.status === 'PICKING' ? 'bg-amber-100 text-amber-800' :
                            outboundDetail.status === 'PACKED' ? 'bg-blue-100 text-blue-800' :
                            'bg-green-100 text-green-800'
                          }`}>{outboundDetail.status}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="font-bold text-slate-500 uppercase tracking-wider">Created:</span>
                          <span>{new Date(outboundDetail.createdAt).toLocaleString()}</span>
                        </div>
                      </div>

                      {/* Display Picking Progress if PENDING or PICKING */}
                      {(outboundDetail.status === 'PENDING' || outboundDetail.status === 'PICKING') && (
                        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm space-y-3">
                          <h4 className="font-bold text-xs text-slate-800 uppercase tracking-wider flex items-center gap-1.5 border-b pb-2">
                            <span className="material-symbols-outlined text-sm">receipt_long</span>
                            Picking Progress
                          </h4>
                          <div className="space-y-2.5">
                            {outboundDetail.outboundLines?.map((line: any) => {
                              const isFullyPicked = line.pickedQty >= line.requiredQty;
                              return (
                                <div key={line.lineId} className="flex justify-between items-center p-2 rounded bg-slate-50 border border-slate-100">
                                  <div className="text-left">
                                    <p className="font-semibold text-xs text-slate-900">{line.skuCode} - {line.skuName}</p>
                                    <p className="text-[10px] text-slate-500">Loc: {line.zoneName} - {line.binCode}</p>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <span className="text-xs font-bold text-slate-600">{line.pickedQty} / {line.requiredQty}</span>
                                    {!isFullyPicked && (
                                      <button
                                        onClick={() => handlePickLine(outboundDetail.outboundId, line.lineId, line.requiredQty - line.pickedQty)}
                                        className="px-2 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded text-[10px] font-bold"
                                      >
                                        Pick All
                                      </button>
                                    )}
                                  </div>
                                </div>
                              );
                            })}
                          </div>

                          {/* Confirm Picking Action */}
                          <div className="pt-2">
                            <button
                              onClick={() => handleConfirmPicking(outboundDetail.outboundId)}
                              disabled={outboundDetail.outboundLines?.some((l: any) => l.pickedQty < l.requiredQty)}
                              className="w-full py-2.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs disabled:opacity-50 disabled:bg-slate-300"
                            >
                              Confirm Picking &amp; Pack Order
                            </button>
                          </div>
                        </div>
                      )}

                      {/* Display Waybill Card if PACKED or DISPATCHED */}
                      {(outboundDetail.status === 'PACKED' || outboundDetail.status === 'DISPATCHED') && (
                        <>
                          {shippingLabel ? (
                            <div className="bg-white border-2 border-slate-900 rounded-xl p-5 shadow-sm relative overflow-hidden text-black space-y-4">
                              <div className="flex justify-between items-start border-b border-slate-200 pb-3">
                                <div>
                                  <span className="text-[10px] font-bold text-blue-600 uppercase tracking-widest bg-blue-50 px-2 py-0.5 rounded">SmartLog Shipping Label</span>
                                  <h4 className="font-bold text-sm mt-1 font-mono text-slate-900">{shippingLabel.waybillCode}</h4>
                                  <p className="text-[10px] text-slate-500 mt-0.5">Created: {new Date(shippingLabel.createdAt).toLocaleString()}</p>
                                </div>
                                {shippingLabel.qrCodeBase64 && (
                                  <img src={`data:image/png;base64,${shippingLabel.qrCodeBase64}`} alt="Waybill QR Code" className="w-20 h-20 border border-slate-100 p-1 bg-white" />
                                )}
                              </div>

                              <div className="space-y-2 text-xs">
                                <div>
                                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Sender:</span>
                                  <p className="font-medium text-slate-800 text-[11px]">{shippingLabel.warehouseName} - {shippingLabel.warehouseAddress}</p>
                                </div>
                                <div>
                                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Receiver:</span>
                                  <p className="font-bold text-slate-900 text-[11px]">{shippingLabel.recipientName}</p>
                                  <p className="text-slate-600 text-[11px] leading-tight mt-0.5">{shippingLabel.destinationAddress}</p>
                                </div>
                                <div className="grid grid-cols-2 gap-4 border-t border-slate-100 pt-2 text-[11px]">
                                  <div>
                                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Total Weight:</span>
                                    <p className="font-semibold text-slate-800">{shippingLabel.totalWeightKg} kg</p>
                                  </div>
                                  <div>
                                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Pallets:</span>
                                    <p className="font-semibold text-slate-800">{shippingLabel.totalPallets}</p>
                                  </div>
                                </div>
                              </div>
                            </div>
                          ) : (
                            <div className="bg-slate-50 border border-dashed border-slate-300 rounded-xl p-6 text-center space-y-3">
                              <span className="material-symbols-outlined text-3xl text-slate-400">barcode_scanner</span>
                              <p className="text-xs text-slate-600">Waybill and Shipping Label not generated yet.</p>
                              <button
                                onClick={() => handleGenerateShippingLabel(outboundDetail.outboundId)}
                                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded text-xs font-bold"
                              >
                                Generate Shipping Label / Waybill
                              </button>
                            </div>
                          )}

                          {outboundDetail.status === 'DISPATCHED' && (
                            <div className="bg-green-50 border border-green-200 rounded-xl p-4 flex gap-3 items-start text-green-800 text-xs">
                              <span className="material-symbols-outlined text-green-600">check_circle</span>
                              <div>
                                <h4 className="font-bold uppercase mb-0.5">Order Dispatched Successfully</h4>
                                <p className="leading-relaxed">This outbound order has been dispatched. The slot booking has been completed, exit gate log has been recorded, and dock session is closed.</p>
                              </div>
                            </div>
                          )}
                        </>
                      )}
                    </div>
                  ) : (
                    /* If no outbound exists yet, prompt creation */
                    <div className="text-center py-10 space-y-4">
                      <span className="material-symbols-outlined text-5xl text-slate-300">local_shipping</span>
                      <div>
                        <h4 className="font-bold text-sm text-slate-800">No Outbound Order Found</h4>
                        <p className="text-xs text-secondary mt-1">This order has not been initiated for outbound fulfillment.</p>
                      </div>
                      <button
                        onClick={() => handleCreateOutbound(drawerRealRow?.orderId ?? 0)}
                        disabled={outboundLoading}
                        className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold transition shadow-md shadow-blue-500/20"
                      >
                        Create Outbound Order
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Drawer Footer actions */}
            <div className="p-6 border-t border-outline-variant/20 flex gap-3 bg-surface/50 backdrop-blur-md">
              {drawerTab === 'outbound' ? (
                outboundDetail ? (
                  outboundDetail.status === 'PACKED' && shippingLabel ? (
                    <button
                      onClick={() => handleDispatchOrder(outboundDetail.outboundId)}
                      disabled={outboundLoading}
                      className="w-full py-2.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs transition shadow-md shadow-blue-500/20 flex items-center justify-center gap-1.5"
                    >
                      {outboundLoading ? (
                        <>
                          <span className="material-symbols-outlined text-sm animate-spin">sync</span>
                          Dispatching...
                        </>
                      ) : (
                        <>
                          <span className="material-symbols-outlined text-sm">local_shipping</span>
                          Dispatch Order
                        </>
                      )}
                    </button>
                  ) : outboundDetail.status === 'DISPATCHED' ? (
                    <button
                      onClick={handlePrint}
                      className="w-full py-2.5 rounded-lg bg-green-600 hover:bg-green-700 text-white font-bold text-xs transition shadow-md shadow-green-500/20 flex items-center justify-center gap-1.5"
                    >
                      <span className="material-symbols-outlined text-sm">print</span>
                      Print Waybill
                    </button>
                  ) : (
                    <div className="text-xs text-center text-secondary w-full py-2">
                      Please complete picking/packing steps above to enable dispatch.
                    </div>
                  )
                ) : (
                  <div className="text-xs text-center text-secondary w-full py-2">
                    Create Outbound Order to begin.
                  </div>
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
        {/* Drawer opened from a MOCK row – UC004 tab is disabled */}
        {isMockRow && selectedOrder && (
          <>
            <div className="p-6 border-b border-outline-variant/20 flex justify-between items-start">
              <div>
                <div className="flex items-center gap-3 mb-1">
                  <h2 className="font-headline-md text-headline-md text-on-surface font-bold text-xl">{selectedOrder.id}</h2>
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold text-green-700 bg-green-50 border border-green-200">
                    <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span>
                    {selectedOrder.status}
                  </span>
                </div>
                <p className="font-body-sm text-body-sm text-secondary">{selectedOrder.customerName} &bull; {selectedOrder.customerType}</p>
              </div>
              <button className="p-2 text-secondary hover:bg-surface-variant rounded-full transition-colors" onClick={() => setIsDrawerOpen(false)}>
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <div className="flex border-b border-outline-variant/10 px-6 bg-slate-50/50">
              <button
                onClick={() => setDrawerTab('tracking')}
                className={`flex-1 py-3 text-center font-medium text-xs border-b-2 transition-all flex items-center justify-center gap-1.5 ${drawerTab === 'tracking' ? 'border-blue-600 text-blue-600' : 'border-transparent text-secondary hover:text-on-surface'}`}
              >
                <span className="material-symbols-outlined text-sm">map</span>
                Tracking &amp; Logistics
              </button>
              <button
                className="flex-1 py-3 text-center font-medium text-xs border-b-2 border-transparent text-slate-300 flex items-center justify-center gap-1.5 cursor-not-allowed"
                disabled
                title="Not available for demo rows"
              >
                <span className="material-symbols-outlined text-sm">warehouse</span>
                Outbound &amp; Waybill
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-6">
              {drawerTab === 'tracking' ? (
                <div className="space-y-4">
                  <div className="p-4 rounded-xl flex gap-3 items-start bg-blue-50/50 border border-blue-100">
                    <span className="material-symbols-outlined text-blue-600">smart_toy</span>
                    <div>
                      <h4 className="font-label-md text-label-md text-on-surface font-semibold mb-1 uppercase tracking-wider text-xs">AI Insight</h4>
                      <p className="font-body-sm text-body-sm text-on-surface-variant text-xs">Route optimization suggests taking the highway to save 15 minutes of transit time.</p>
                    </div>
                  </div>
                  <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl flex gap-3 items-start">
                    <span className="material-symbols-outlined text-amber-600 text-lg">info</span>
                    <div>
                      <p className="text-xs font-bold text-amber-800 mb-0.5">Demo Row — Outbound not available</p>
                      <p className="text-xs text-amber-700 leading-relaxed">
                        This row (<strong>{selectedOrder.id}</strong>) is display-only mock data and is not linked to a real ServiceOrder in the database.
                        To test Outbound flow, scroll down and click a row in the <strong>"Lệnh xuất kho đang xử lý"</strong> table.
                      </p>
                    </div>
                  </div>
                </div>
              ) : null}
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

