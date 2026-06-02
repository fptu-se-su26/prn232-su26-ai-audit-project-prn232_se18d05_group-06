import { useState, useEffect } from 'react';
import { DispatcherLayout } from '@layouts/DispatcherLayout';
import { Order } from '@/types/dispatcher';

const MOCK_ORDERS: Order[] = [
  {
    id: '#ORD-9928-AX',
    customer: 'Acme Corp Logistics',
    destination: '142 Đại lộ Công nghiệp, Phân khu 7',
    driverName: 'James Doe',
    vehicle: 'TRK-442 (Xe đông lạnh)',
    driverAvatar: 'JD',
    eta: '14:30 (Trong 45m)',
    status: 'transit',
    priority: 'high',
    location: 'Trạm kiểm soát Phân khu 7',
    coordinates: { x: 60, y: 35 },
    timeline: [
      { title: 'Đang di chuyển - Trạm kiểm soát Phân khu 7', timestamp: 'Hôm nay, 13:45', active: true },
      { title: 'Đã rời Trung tâm phân loại Phân khu 2', timestamp: 'Hôm nay, 11:20' },
      { title: 'Đơn hàng được phân công cho TRK-442', timestamp: 'Hôm nay, 09:05' },
      { title: 'Đã nhận đơn hàng', timestamp: 'Hôm qua, 18:30' },
    ],
  },
  {
    id: '#ORD-9929-BY',
    customer: 'Global Supplies Inc.',
    destination: '880 Đường Trung tâm Công nghệ, Phân khu 4',
    driverName: 'Chưa phân công',
    vehicle: 'Chờ lên lịch',
    driverAvatar: '?',
    eta: 'Chờ lên lịch',
    status: 'approaching', // pending represented as approaching or unassigned status
    priority: 'normal',
    location: 'Trung tâm Phân loại',
    coordinates: { x: 20, y: 80 },
    timeline: [
      { title: 'Đã nhận đơn hàng', timestamp: 'Hôm qua, 20:15', active: true },
    ],
  },
  {
    id: '#ORD-9930-CZ',
    customer: 'Prime Retailers',
    destination: '500 Đại lộ Metro, Trung tâm Thành phố',
    driverName: 'Alan Smith',
    vehicle: 'VAN-019',
    driverAvatar: 'AS',
    eta: 'Trễ hạn (Kẹt xe)',
    status: 'delayed',
    priority: 'high',
    location: 'Kẹt xe Trung tâm Thành phố',
    delayReason: 'Bị kẹt xe: Trung tâm Thành phố',
    coordinates: { x: 55, y: 45 },
    timeline: [
      { title: 'Bị kẹt xe: Trung tâm Thành phố', timestamp: 'Hôm nay, 14:02', active: true },
      { title: 'Đang di chuyển - Đường cao tốc Trung tâm', timestamp: 'Hôm nay, 13:10' },
      { title: 'Đã rời trung tâm phân loại A', timestamp: 'Hôm nay, 11:45' },
      { title: 'Đơn hàng được phân công cho VAN-019', timestamp: 'Hôm nay, 10:00' },
      { title: 'Đã nhận đơn hàng', timestamp: 'Hôm qua, 17:40' },
    ],
  },
  {
    id: '#ORD-9931-DW',
    customer: 'Medical Dist. LLC',
    destination: '100 Đường Y tế, Khu B',
    driverName: 'Maria K.',
    vehicle: 'TRK-201',
    driverAvatar: 'MK',
    eta: '15:15 (Trong 1h 30m)',
    status: 'transit', // assigned represented as transit
    priority: 'normal',
    location: 'Bến xếp dỡ hàng B',
    coordinates: { x: 80, y: 40 },
    timeline: [
      { title: 'Đơn hàng được phân công cho TRK-201', timestamp: 'Hôm nay, 09:40', active: true },
      { title: 'Đã nhận đơn hàng', timestamp: 'Hôm qua, 15:20' },
    ],
  },
  {
    id: '#ORD-9925-ZA',
    customer: 'Tech Hardware Co.',
    destination: 'Nhà kho 9, Bến xếp dỡ hàng 4',
    driverName: 'Robert Brown',
    vehicle: 'TRK-110',
    driverAvatar: 'RB',
    eta: 'Đã giao lúc 10:45',
    status: 'delivered',
    priority: 'normal',
    location: 'Nhà kho 9',
    coordinates: { x: 90, y: 10 },
    timeline: [
      { title: 'Đã giao hàng thành công', timestamp: 'Hôm nay, 10:45', active: true },
      { title: 'Đang di chuyển - Đường cao tốc phía Đông', timestamp: 'Hôm nay, 08:30' },
      { title: 'Đã rời trung tâm khu vực', timestamp: 'Hôm nay, 07:15' },
      { title: 'Đã nhận đơn hàng', timestamp: 'Hôm kia, 14:00' },
    ],
  },
];

export const OrderManagement = () => {
  const [activeTab, setActiveTab] = useState('Orders');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(MOCK_ORDERS[0]);
  const [showFilterDropdown, setShowFilterDropdown] = useState(false);
  const [statusFilter, setStatusFilter] = useState<'all' | 'transit' | 'pending' | 'delayed' | 'delivered'>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Auto-close toast
  useEffect(() => {
    if (toastMessage) {
      const timer = setTimeout(() => setToastMessage(null), 4000);
      return () => clearTimeout(timer);
    }
  }, [toastMessage]);

  // Handle export action
  const handleExport = () => {
    setToastMessage('Xuất danh mục đơn hàng CSV thành công. Sẵn sàng tải xuống.');
  };

  // Status mapping utility for display badges
  const renderStatusBadge = (status: Order['status'], id: string) => {
    if (id === '#ORD-9929-BY') {
      return (
        <span className="px-2 py-1 rounded border border-[#f59e0b]/30 bg-[#f59e0b]/10 text-[#f59e0b] text-xs flex items-center w-max gap-1">
          Chờ xử lý
        </span>
      );
    }
    switch (status) {
      case 'transit':
      case 'approaching':
        return (
          <span className="px-2 py-1 rounded border border-secondary/30 bg-secondary/10 text-secondary text-xs flex items-center w-max gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-secondary animate-pulse"></span>
            Đang di chuyển
          </span>
        );
      case 'delayed':
        return (
          <span className="px-2 py-1 rounded border border-error/30 bg-error/10 text-error text-xs flex items-center w-max gap-1 font-semibold">
            <span className="material-symbols-outlined text-[12px]">warning</span>
            Trễ hạn
          </span>
        );
      case 'delivered':
        return (
          <span className="px-2 py-1 rounded border border-[#10b981]/30 bg-[#10b981]/10 text-[#10b981] text-xs flex items-center w-max gap-1">
            Đã giao
          </span>
        );
      default:
        return (
          <span className="px-2 py-1 rounded border border-primary/30 bg-primary/10 text-primary text-xs flex items-center w-max gap-1">
            Đã phân công
          </span>
        );
    }
  };

  // Action footer clicks
  const handleContactDriver = (driver: string) => {
    setToastMessage(`Đang mở kênh truyền thông vệ tinh mã hóa với ${driver}...`);
  };

  const handleUpdateRoute = (orderId: string) => {
    setToastMessage(`Động cơ AI đang tính toán lại lộ trình tối ưu tránh kẹt xe cho ${orderId}...`);
  };

  // Filtering criteria
  const filteredOrders = MOCK_ORDERS.filter((order) => {
    // 1. Search Query
    const q = searchQuery.toLowerCase().trim();
    const matchesSearch = !q || (
      order.id.toLowerCase().includes(q) ||
      (order.customer || '').toLowerCase().includes(q) ||
      (order.destination || '').toLowerCase().includes(q) ||
      order.driverName.toLowerCase().includes(q) ||
      order.vehicle.toLowerCase().includes(q)
    );

    // 2. Status Filter
    if (!matchesSearch) return false;
    if (statusFilter === 'all') return true;
    if (statusFilter === 'pending') return order.id === '#ORD-9929-BY';
    if (statusFilter === 'transit') return order.status === 'transit' && order.id !== '#ORD-9929-BY';
    if (statusFilter === 'delayed') return order.status === 'delayed';
    if (statusFilter === 'delivered') return order.status === 'delivered';
    return true;
  });

  return (
    <DispatcherLayout
      activeTab={activeTab}
      setActiveTab={setActiveTab}
      sidebarOpen={sidebarOpen}
      setSidebarOpen={setSidebarOpen}
      searchQuery={searchQuery}
      setSearchQuery={setSearchQuery}
      notificationsCount={1}
      resetNotifications={() => {}}
    >
      {/* 1. Top Bento summaries & Action Toolbar */}
      <div className="flex flex-col xl:flex-row gap-6 justify-between items-start shrink-0 relative z-10">
        {/* Summary counts */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 w-full xl:w-2/3">
          {/* Pending card */}
          <div className="glass-panel p-4 rounded-xl relative overflow-hidden group select-none">
            <div className="absolute top-0 right-0 p-3 opacity-20 group-hover:opacity-40 transition-opacity">
              <span className="material-symbols-outlined text-4xl text-secondary">hourglass_empty</span>
            </div>
            <p className="font-label-caps text-label-caps text-on-surface-variant uppercase tracking-wider mb-1">Chờ xử lý</p>
            <p className="font-display-lg text-display-lg text-on-surface font-bold">142</p>
            <div className="mt-2 flex items-center text-error text-sm font-semibold">
              <span className="material-symbols-outlined text-[16px] mr-1">trending_up</span>
              <span>12%</span>
            </div>
          </div>

          {/* Assigned card */}
          <div className="glass-panel p-4 rounded-xl relative overflow-hidden group select-none">
            <div className="absolute top-0 right-0 p-3 opacity-20 group-hover:opacity-40 transition-opacity">
              <span className="material-symbols-outlined text-4xl text-primary">assignment_ind</span>
            </div>
            <p className="font-label-caps text-label-caps text-on-surface-variant uppercase tracking-wider mb-1">Đã phân công</p>
            <p className="font-display-lg text-display-lg text-on-surface font-bold">86</p>
            <div className="mt-2 flex items-center text-primary text-sm font-semibold">
              <span className="material-symbols-outlined text-[16px] mr-1">trending_flat</span>
              <span>Ổn định</span>
            </div>
          </div>

          {/* In Transit active card */}
          <div className="glass-panel p-4 rounded-xl relative overflow-hidden neon-glow select-none">
            <div className="absolute inset-0 bg-secondary/5"></div>
            <div className="absolute top-0 right-0 p-3 opacity-30">
              <span className="material-symbols-outlined text-4xl text-secondary" style={{ fontVariationSettings: "'FILL' 1" }}>local_shipping</span>
            </div>
            <p className="font-label-caps text-label-caps text-secondary uppercase tracking-wider mb-1 text-glow font-bold">Đang di chuyển</p>
            <p className="font-display-lg text-display-lg text-on-surface relative z-10 font-bold">324</p>
            <div className="mt-2 flex items-center text-secondary text-sm relative z-10 font-semibold">
              <span className="material-symbols-outlined text-[16px] mr-1 animate-pulse">sensors</span>
              <span>Theo dõi trực tiếp</span>
            </div>
          </div>

          {/* Delivered today card */}
          <div className="glass-panel p-4 rounded-xl relative overflow-hidden group select-none">
            <div className="absolute top-0 right-0 p-3 opacity-20 group-hover:opacity-40 transition-opacity">
              <span className="material-symbols-outlined text-4xl text-[#10b981]">check_circle</span>
            </div>
            <p className="font-label-caps text-label-caps text-on-surface-variant uppercase tracking-wider mb-1">Đã giao hôm nay</p>
            <p className="font-display-lg text-display-lg text-on-surface font-bold">1,028</p>
            <div className="mt-2 flex items-center text-[#10b981] text-sm font-semibold">
              <span className="material-symbols-outlined text-[16px] mr-1">trending_up</span>
              <span>4% so với hôm qua</span>
            </div>
          </div>
        </div>

        {/* Export/Filter Toolbar */}
        <div className="glass-panel p-4 rounded-xl flex gap-3 w-full xl:w-1/3 justify-end items-center relative">
          <div className="relative">
            <button
              onClick={() => setShowFilterDropdown(!showFilterDropdown)}
              className="bg-surface-container-high border border-outline-variant/30 text-on-surface px-4 py-2 rounded-lg font-body-md text-body-md flex items-center gap-2 hover:bg-surface-variant/50 transition-colors"
            >
              <span className="material-symbols-outlined text-[18px]">filter_list</span>
              Bộ lọc: {statusFilter === 'all' ? 'TẤT CẢ' : statusFilter === 'transit' ? 'ĐANG DI CHUYỂN' : statusFilter === 'pending' ? 'CHỜ XỬ LÝ' : statusFilter === 'delayed' ? 'TRỄ HẠN' : 'ĐÃ GIAO'}
            </button>

            {showFilterDropdown && (
              <div className="absolute right-0 mt-2 w-48 glass-panel rounded-lg shadow-2xl z-30 border border-outline-variant/30 overflow-hidden animate-fade-in">
                <div className="py-1 bg-surface-container-lowest">
                  {(['all', 'transit', 'pending', 'delayed', 'delivered'] as const).map((filter) => (
                    <button
                      key={filter}
                      onClick={() => {
                        setStatusFilter(filter);
                        setShowFilterDropdown(false);
                      }}
                      className={`w-full text-left px-4 py-2 text-xs font-semibold transition-colors hover:bg-primary-container/20 hover:text-primary ${
                        statusFilter === filter ? 'text-primary bg-primary-container/10 border-l-2 border-primary' : 'text-on-surface-variant'
                      }`}
                    >
                      {filter === 'all' ? 'TẤT CẢ' : filter === 'transit' ? 'ĐANG DI CHUYỂN' : filter === 'pending' ? 'CHỜ XỬ LÝ' : filter === 'delayed' ? 'TRỄ HẠN' : 'ĐÃ GIAO'}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          <button className="bg-surface-container-high border border-outline-variant/30 text-on-surface px-4 py-2 rounded-lg font-body-md text-body-md flex items-center gap-2 hover:bg-surface-variant/50 transition-colors select-none">
            <span className="material-symbols-outlined text-[18px]">calendar_today</span>
            Hôm nay
          </button>

          <button
            onClick={handleExport}
            className="bg-primary-container text-on-primary-container px-4 py-2 rounded-lg font-body-md text-body-md font-semibold flex items-center gap-2 hover:bg-primary-container/90 transition-all hover:scale-[1.02] shadow-[0_0_15px_rgba(37,99,235,0.3)]"
          >
            <span className="material-symbols-outlined text-[18px]">download</span>
            Xuất file
          </button>
        </div>
      </div>

      {/* 2. Main Active Orders Table */}
      <div className="glass-panel rounded-xl flex-1 overflow-hidden flex flex-col relative z-10 transition-all duration-300">
        <div className="p-4 border-b border-outline-variant/20 flex justify-between items-center bg-surface-container/50 shrink-0">
          <h3 className="font-headline-sm text-headline-sm text-on-surface font-semibold flex items-center gap-2">
            <span className="material-symbols-outlined text-[18px] text-primary">inventory_2</span>
            Đăng ký hoạt động
          </h3>
          <div className="text-sm text-on-surface-variant font-data-tabular">
            Hiển thị 1-{filteredOrders.length} trên {filteredOrders.length} bản ghi
          </div>
        </div>

        {/* Data Table overflow */}
        <div className="flex-1 overflow-auto min-h-0">
          <table className="w-full text-left border-collapse min-w-[700px]">
            <thead>
              <tr className="border-b border-outline-variant/20 bg-surface-container-low/50 select-none">
                <th className="p-4 font-label-caps text-label-caps text-on-surface-variant uppercase tracking-wider text-[11px]">Mã đơn hàng</th>
                <th className="p-4 font-label-caps text-label-caps text-on-surface-variant uppercase tracking-wider text-[11px]">Khách hàng</th>
                <th className="p-4 font-label-caps text-label-caps text-on-surface-variant uppercase tracking-wider text-[11px]">Điểm đích</th>
                <th className="p-4 font-label-caps text-label-caps text-on-surface-variant uppercase tracking-wider text-[11px]">Tài xế / Xe</th>
                <th className="p-4 font-label-caps text-label-caps text-on-surface-variant uppercase tracking-wider text-[11px]">Dự kiến (ETA)</th>
                <th className="p-4 font-label-caps text-label-caps text-on-surface-variant uppercase tracking-wider text-[11px]">Trạng thái</th>
              </tr>
            </thead>
            <tbody className="font-data-tabular text-data-tabular divide-y divide-outline-variant/10">
              {filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-on-surface-variant">
                    <span className="material-symbols-outlined text-[36px] opacity-40 mb-2 block">
                      inbox
                    </span>
                    Không có đơn hàng nào khớp với tìm kiếm hoặc bộ lọc của bạn.
                  </td>
                </tr>
              ) : (
                filteredOrders.map((order) => {
                  const isSelected = selectedOrder?.id === order.id;
                  const isDelayed = order.status === 'delayed';

                  return (
                    <tr
                      key={order.id}
                      onClick={() => setSelectedOrder(order)}
                      className={`transition-colors cursor-pointer group hover:bg-surface-variant/20 ${
                        isSelected ? 'bg-surface-variant/35 border-l-2 border-primary' : ''
                      } ${isDelayed ? 'bg-error/5' : ''}`}
                    >
                      <td className="p-4 font-bold text-primary group-hover:text-secondary transition-colors pl-4">
                        {order.id}
                      </td>
                      <td className="p-4 text-on-surface font-semibold truncate max-w-[150px]">
                        {order.customer}
                      </td>
                      <td className="p-4 text-on-surface-variant truncate max-w-[200px]">
                        {order.destination}
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-full bg-surface-container-high border border-outline-variant/30 flex items-center justify-center text-[10px] font-bold text-primary select-none">
                            {order.driverAvatar}
                          </div>
                          <span className="text-on-surface font-medium truncate max-w-[120px]">
                            {order.driverName === 'Unassigned' ? (
                              <span className="text-on-surface-variant italic">Chưa phân công</span>
                            ) : (
                              order.vehicle
                            )}
                          </span>
                        </div>
                      </td>
                      <td className={`p-4 font-medium ${isDelayed ? 'text-error font-semibold' : 'text-on-surface'}`}>
                        {order.eta === 'Pending Scheduling' ? 'Chờ lên lịch' : order.eta}
                      </td>
                      <td className="p-4">
                        {renderStatusBadge(order.status, order.id)}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination controller */}
        <div className="p-4 border-t border-outline-variant/20 flex justify-between items-center bg-surface-container/50 shrink-0 mt-auto select-none">
          <button
            onClick={() => currentPage > 1 && setCurrentPage(currentPage - 1)}
            disabled={currentPage === 1}
            className={`flex items-center gap-1 text-sm transition-colors ${
              currentPage === 1 ? 'text-on-surface-variant/30 cursor-not-allowed' : 'text-on-surface-variant hover:text-on-surface'
            }`}
          >
            <span className="material-symbols-outlined text-[18px]">chevron_left</span> Trước
          </button>
          <div className="flex gap-2">
            <button
              onClick={() => setCurrentPage(1)}
              className={`w-8 h-8 rounded font-bold flex items-center justify-center text-sm transition-colors ${
                currentPage === 1 ? 'bg-primary text-on-primary' : 'border border-outline-variant/30 text-on-surface hover:bg-surface-variant/50'
              }`}
            >
              1
            </button>
            <button
              onClick={() => setCurrentPage(2)}
              className={`w-8 h-8 rounded font-bold flex items-center justify-center text-sm transition-colors ${
                currentPage === 2 ? 'bg-primary text-on-primary' : 'border border-outline-variant/30 text-on-surface hover:bg-surface-variant/50'
              }`}
            >
              2
            </button>
            <button
              onClick={() => setCurrentPage(3)}
              className={`w-8 h-8 rounded font-bold flex items-center justify-center text-sm transition-colors ${
                currentPage === 3 ? 'bg-primary text-on-primary' : 'border border-outline-variant/30 text-on-surface hover:bg-surface-variant/50'
              }`}
            >
              3
            </button>
            <span className="text-on-surface-variant flex items-center justify-center">...</span>
          </div>
          <button
            onClick={() => currentPage < 3 && setCurrentPage(currentPage + 1)}
            disabled={currentPage === 3}
            className={`flex items-center gap-1 text-sm transition-colors ${
              currentPage === 3 ? 'text-on-surface-variant/30 cursor-not-allowed' : 'text-on-surface-variant hover:text-on-surface'
            }`}
          >
            Sau <span className="material-symbols-outlined text-[18px]">chevron_right</span>
          </button>
        </div>
      </div>

      {/* 3. Right Slide Detail Panel (Collapsible Overlay Drawer) */}
      {selectedOrder && (
        <aside className="fixed right-0 top-16 bottom-0 w-full sm:w-[400px] glass-panel border-l border-outline-variant/20 z-40 transform transition-all duration-300 translate-x-0 shadow-[-10px_0_30px_rgba(0,0,0,0.5)] flex flex-col pointer-events-auto animate-slide-in">
          {/* Header */}
          <div className="p-6 border-b border-outline-variant/20 flex justify-between items-start shrink-0">
            <div>
              <div className="flex items-center gap-2 mb-1">
                {selectedOrder.id === '#ORD-9929-BY' ? (
                  <span className="px-2 py-0.5 rounded border border-[#f59e0b]/30 bg-[#f59e0b]/10 text-[#f59e0b] text-[10px] uppercase font-bold tracking-wider">Chờ xử lý</span>
                ) : selectedOrder.status === 'delayed' ? (
                  <span className="px-2 py-0.5 rounded border border-error/30 bg-error/10 text-error text-[10px] uppercase font-bold tracking-wider">Trễ hạn</span>
                ) : selectedOrder.status === 'delivered' ? (
                  <span className="px-2 py-0.5 rounded border border-[#10b981]/30 bg-[#10b981]/10 text-[#10b981] text-[10px] uppercase font-bold tracking-wider font-bold">Đã giao</span>
                ) : (
                  <span className="px-2 py-0.5 rounded border border-secondary/30 bg-secondary/10 text-secondary text-[10px] uppercase font-bold tracking-wider">Đang di chuyển</span>
                )}

                {selectedOrder.priority === 'high' && (
                  <span className="px-2 py-0.5 rounded border border-outline-variant/30 bg-surface-container text-on-surface text-[10px] uppercase font-bold tracking-wider select-none animate-pulse">
                    Ưu tiên cao
                  </span>
                )}
              </div>
              <h2 className="font-headline-md text-headline-md font-bold text-on-surface mt-2 select-none">
                {selectedOrder.id}
              </h2>
              <p className="text-sm text-on-surface-variant font-semibold select-none">
                {selectedOrder.customer}
              </p>
            </div>
            <button
              onClick={() => setSelectedOrder(null)}
              className="text-on-surface-variant hover:text-error p-1.5 rounded-full hover:bg-surface-variant/50 transition-colors shrink-0"
              title="Đóng bảng"
            >
              <span className="material-symbols-outlined text-[20px]">close</span>
            </button>
          </div>

          {/* Scrollable details content */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {/* Satellite Mini Map */}
            <div className="w-full h-48 rounded-lg overflow-hidden border border-outline-variant/30 relative select-none">
              <img
                alt="Route Map Details"
                className="w-full h-full object-cover opacity-80"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuBMFcFE_NgqMn1tpvJddpGGuoj6t7e7GMjyI8cHve8ykkd-sO16hTMg8bYyD-uiXGq4s3-h7dRq6dfPYbPGDmP-aqPatF8jLdjNwzCp3vh44uW9vuBjY6ggvzqYJX-cLS19PDyGv5TiLMPS5nUk4V9LyGe2dCnYVwIp6R2ZH-TINNOFFclNTeq9a1G6AB3jXh21qX9C-bcAd6W86vZ0W9NfF2T1x_5gIrPwCskFgS15ar2P-Cy7plasiv3M5r6iyCbfhAVVLWpvtawk"
              />
              <div className="absolute inset-0 z-10">
                <svg className="w-full h-full" preserveAspectRatio="none" viewBox="0 0 100 100">
                  <path
                    className="opacity-70"
                    d="M 20,80 Q 40,20 80,40"
                    fill="none"
                    stroke="#4cd7f6"
                    strokeDasharray="4,4"
                    strokeWidth="2"
                  ></path>
                  {/* Start Point */}
                  <circle cx="20" cy="80" fill="#8d90a0" r="4"></circle>
                  {/* Current animated vehicle Marker coordinates */}
                  <circle
                    className="animate-pulse pulse-marker"
                    cx={selectedOrder.coordinates.x}
                    cy={selectedOrder.coordinates.y}
                    fill={selectedOrder.status === 'delayed' ? '#ffb4ab' : '#4cd7f6'}
                    r="5"
                  ></circle>
                  {/* End Destination Point */}
                  <circle cx="80" cy="40" fill="#2563eb" r="4"></circle>
                </svg>
              </div>
            </div>

            {/* Drivers details grid */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-surface-container-low/50 p-3 rounded border border-outline-variant/10">
                <p className="text-[11px] text-on-surface-variant uppercase tracking-wider mb-1 font-bold">Tài xế</p>
                <p className="text-sm text-on-surface font-medium flex items-center gap-2">
                  <span className="material-symbols-outlined text-[16px] text-primary">person</span>
                  {selectedOrder.driverName}
                </p>
              </div>
              <div className="bg-surface-container-low/50 p-3 rounded border border-outline-variant/10">
                <p className="text-[11px] text-on-surface-variant uppercase tracking-wider mb-1 font-bold">Phương tiện</p>
                <p className="text-sm text-on-surface font-medium flex items-center gap-2">
                  <span className="material-symbols-outlined text-[16px] text-primary">local_shipping</span>
                  {selectedOrder.vehicle}
                </p>
              </div>
            </div>

            {/* Chronological Tracking Timeline */}
            <div>
              <h4 className="font-headline-sm text-sm text-on-surface font-semibold mb-4">Dòng thời gian theo dõi</h4>
              <div className="relative pl-4 space-y-6 border-l-2 border-outline-variant/30 ml-2">
                {selectedOrder.timeline && selectedOrder.timeline.map((point, index) => (
                  <div key={index} className="relative">
                    <div className={`absolute -left-[21px] top-1.5 w-2.5 h-2.5 rounded-full ${
                      point.active
                        ? selectedOrder.status === 'delayed'
                          ? 'bg-error shadow-[0_0_8px_#ffdad6]'
                          : 'bg-secondary shadow-[0_0_8px_#4cd7f6]'
                        : 'bg-surface-container-high border-2 border-outline-variant'
                    }`}></div>
                    <p className={`text-sm font-semibold ${
                      point.active
                        ? selectedOrder.status === 'delayed'
                          ? 'text-error'
                          : 'text-secondary'
                        : 'text-on-surface'
                    }`}>
                      {point.title}
                    </p>
                    <p className="text-[11px] text-on-surface-variant mt-0.5">{point.timestamp}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Action Footer */}
          <div className="p-4 border-t border-outline-variant/20 bg-surface-container-lowest/85 flex gap-3 shrink-0 select-none">
            <button
              onClick={() => handleContactDriver(selectedOrder.driverName)}
              className="flex-1 bg-surface-container border border-outline-variant/30 text-on-surface py-2 rounded-lg text-sm font-semibold hover:bg-surface-variant/50 transition-colors shadow-inner"
            >
              Liên hệ tài xế
            </button>
            <button
              onClick={() => handleUpdateRoute(selectedOrder.id)}
              className="flex-1 bg-secondary/20 border border-secondary text-secondary py-2 rounded-lg text-sm font-semibold hover:bg-secondary/30 transition-colors shadow-[0_0_10px_rgba(76,215,246,0.15)]"
            >
              Cập nhật lộ trình
            </button>
          </div>
        </aside>
      )}

      {/* Operations dynamic Notification toast */}
      {toastMessage && (
        <div className="fixed bottom-4 right-4 z-50 max-w-sm glass-panel rounded-lg shadow-[0_4px_25px_rgba(0,0,0,0.5)] border-l-4 border-secondary p-3.5 flex items-start gap-3 select-none animate-slide-up pointer-events-auto">
          <span className="material-symbols-outlined text-[20px] text-secondary mt-0.5 animate-pulse">
            info
          </span>
          <div className="flex-1 text-left">
            <p className="text-[12px] font-bold text-on-surface uppercase tracking-wider mb-0.5">
              Cảnh báo phòng điều khiển
            </p>
            <p className="text-[11px] text-on-surface-variant leading-tight">{toastMessage}</p>
          </div>
          <button
            onClick={() => setToastMessage(null)}
            className="text-on-surface-variant hover:text-error transition-colors shrink-0"
          >
            <span className="material-symbols-outlined text-[16px]">close</span>
          </button>
        </div>
      )}
    </DispatcherLayout>
  );
};

export default OrderManagement;
