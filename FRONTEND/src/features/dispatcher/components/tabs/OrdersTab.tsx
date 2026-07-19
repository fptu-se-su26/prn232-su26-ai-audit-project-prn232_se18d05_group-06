import React, { useState, useEffect } from 'react';
import { Order } from '@/types/dispatcher';
import axios from 'axios';

const REGISTRY_ORDERS: Order[] = [
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
    status: 'approaching',
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
    status: 'transit',
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

interface OrdersTabProps {
  searchQuery: string;
  setToastMessage: (msg: string | null) => void;
}

export const OrdersTab: React.FC<OrdersTabProps> = ({ searchQuery, setToastMessage }) => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [selectedRegistryOrder, setSelectedRegistryOrder] = useState<Order | null>(null);
  const [showFilterDropdown, setShowFilterDropdown] = useState(false);
  const [statusFilter, setStatusFilter] = useState<'all' | 'transit' | 'pending' | 'delayed' | 'delivered'>('all');
  const [dateFilter, setDateFilter] = useState<'all' | 'today'>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  
  const ITEMS_PER_PAGE = 7;

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const response = await axios.get('http://localhost:5200/api/bookings/dispatcher-orders');
      setOrders(response.data);
      if (response.data.length > 0) {
        setSelectedRegistryOrder(response.data[0]);
      }
    } catch (error) {
      console.error('Lỗi khi tải danh sách xe:', error);
      setToastMessage('Lỗi khi tải danh sách đơn & xe.');
    } finally {
      setLoading(false);
    }
  };

  // Action: Export Order Registry CSV
  const handleExportRegistry = () => {
    setToastMessage('Registry Export: CSV exported successfully. Ready to download.');
  };

  // Action: Contact Driver Satellite Link
  const handleContactDriver = (driver: string) => {
    if (driver === 'Unassigned' || driver === 'Chưa phân công') {
      setToastMessage('Chưa có tài xế được phân công cho đơn này.');
      return;
    }

    setToastMessage(`Opening encrypted satellite communication link with ${driver}...`);
  };

  // Action: Update Driver route
  const handleUpdateRoute = (orderId: string) => {
    setToastMessage(`AI Route Engine recalculating optimized path for ${orderId}...`);
  };

  // Status mapping utility for display badges
  const renderStatusBadge = (status: string, id: string) => {
    switch (status) {
      case 'approaching':
        return (
          <span className="px-2 py-1 rounded border border-slate-300 bg-slate-100 text-slate-950 text-[11px] font-bold flex items-center w-max gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-slate-500 animate-pulse"></span>
            Đang chờ
          </span>
        );
      case 'transit':
        return (
          <span className="px-2 py-1 rounded border border-blue-500/30 bg-blue-500/10 text-slate-950 text-[11px] font-bold flex items-center w-max gap-1">
            <span className="material-symbols-outlined text-[12px]">local_shipping</span>
            Đang di chuyển
          </span>
        );
      case 'delayed':
        return (
          <span className="px-2 py-1 rounded border border-error/30 bg-error/10 text-slate-950 text-[11px] font-bold flex items-center w-max gap-1">
            <span className="material-symbols-outlined text-[12px]">schedule</span>
            Trễ hạn
          </span>
        );
      case 'delivered':
        return (
          <span className="px-2 py-1 rounded border border-[#10b981]/30 bg-[#10b981]/10 text-slate-950 text-[11px] font-bold flex items-center w-max gap-1">
            <span className="material-symbols-outlined text-[12px]">check_circle</span>
            Đã giao
          </span>
        );
      default:
        // fallback
        return (
          <span className="px-2 py-1 rounded border border-slate-300 bg-slate-100 text-slate-950 text-[11px] font-bold flex items-center w-max gap-1">
            {status}
          </span>
        );
    }
  };

  // Filters mapping - Order Registry Grid
  const filteredRegistryOrders = orders.filter((order) => {
    const q = searchQuery.toLowerCase().trim();
    const matchesSearch = !q || (
      order.id.toLowerCase().includes(q) ||
      (order.customer || '').toLowerCase().includes(q) ||
      (order.destination || '').toLowerCase().includes(q) ||
      order.driverName.toLowerCase().includes(q) ||
      order.vehicle.toLowerCase().includes(q)
    );

    if (!matchesSearch) return false;
    if (statusFilter === 'all') return true;
    if (statusFilter === 'pending') return order.status === 'approaching';
    if (statusFilter === 'transit') return order.status === 'transit';
    if (statusFilter === 'delayed') return order.status === 'delayed';
    if (statusFilter === 'delivered') return order.status === 'delivered';
    return true;
  }).filter((order) => {
    if (dateFilter === 'all') return true;
    if (dateFilter === 'today') {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);
      
      // Lọc theo ngày lịch trình (bookingDate hoặc timeRange)
      if (order.bookingDate) {
        const bookingDate = new Date(order.bookingDate);
        return bookingDate >= today && bookingDate < tomorrow;
      }
      
      // Nếu không có bookingDate, thử lấy từ timeRange hoặc eta
      if (order.timeRange) {
        const timeRangeDate = new Date(order.timeRange);
        if (!isNaN(timeRangeDate.getTime())) {
          return timeRangeDate >= today && timeRangeDate < tomorrow;
        }
      }
      
      return false;
    }
    return true;
  });

  const totalPages = Math.ceil(filteredRegistryOrders.length / ITEMS_PER_PAGE) || 1;
  const paginatedOrders = filteredRegistryOrders.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  return (
    <div className="flex flex-col gap-gutter h-full min-h-0 relative z-10 transition-all duration-300">
      <div className="absolute inset-0 -z-10 opacity-30 select-none pointer-events-none rounded-xl overflow-hidden">
        <img
          alt="Map Background"
          className="w-full h-full object-cover"
          src="https://lh3.googleusercontent.com/aida-public/AB6AXuC7DwZn6maf5qjgyD-FFwdOaAbQcUChG_0yRp83CPIv3BCP6W_iDCyxIjvSO49hxEl2XWvhc65TkVKTxk_N18E8ZrJ4ANy06Kf_nSlAQQwm-66YxPML3cBLQ8l0X9WX-CuED4-hfXw7_Zxm907xSsGbYIC6AtBK5d8nqbAjeV3n1m4ItZKeUQjAXpUN1GsYyefLU8EHLyBGXojOJO9kMNp3vvQ2LOsYIbv0cp2CrqAV3Qpm7525lyXcTz2cVrntjPcyx46zX95ejZ7W"
        />
      </div>

      <div className="flex flex-col xl:flex-row gap-6 justify-between items-start shrink-0 relative">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 w-full xl:w-2/3">
          <div className="glass-panel p-4 rounded-xl relative overflow-hidden group select-none">
            <div className="absolute top-0 right-0 p-3 opacity-20 group-hover:opacity-40 transition-opacity">
              <span className="material-symbols-outlined text-4xl text-slate-950">hourglass_empty</span>
            </div>
            <p className="font-label-caps text-label-caps text-slate-950 uppercase tracking-wider mb-1">Chờ xử lý</p>
            <p className="font-display-lg text-display-lg text-slate-950 font-bold">142</p>
            <div className="mt-2 flex items-center text-slate-950 text-sm font-semibold">
              <span className="material-symbols-outlined text-[16px] mr-1">trending_up</span>
              <span>12%</span>
            </div>
          </div>

          <div className="glass-panel p-4 rounded-xl relative overflow-hidden group select-none">
            <div className="absolute top-0 right-0 p-3 opacity-20 group-hover:opacity-40 transition-opacity">
              <span className="material-symbols-outlined text-4xl text-slate-950">assignment_ind</span>
            </div>
            <p className="font-label-caps text-label-caps text-slate-950 uppercase tracking-wider mb-1">Đã phân công</p>
            <p className="font-display-lg text-display-lg text-slate-950 font-bold">86</p>
            <div className="mt-2 flex items-center text-slate-950 text-sm font-semibold">
              <span className="material-symbols-outlined text-[16px] mr-1">trending_flat</span>
              <span>Ổn định</span>
            </div>
          </div>

          <div className="glass-panel p-4 rounded-xl relative overflow-hidden neon-glow select-none">
            <div className="absolute inset-0 bg-secondary/5"></div>
            <div className="absolute top-0 right-0 p-3 opacity-30">
              <span className="material-symbols-outlined text-4xl text-slate-950" style={{ fontVariationSettings: "'FILL' 1" }}>local_shipping</span>
            </div>
            <p className="font-label-caps text-label-caps text-slate-950 uppercase tracking-wider mb-1 text-glow font-bold">Đang di chuyển</p>
            <p className="font-display-lg text-display-lg text-slate-950 relative z-10 font-bold">324</p>
            <div className="mt-2 flex items-center text-slate-950 text-sm relative z-10 font-semibold">
              <span className="material-symbols-outlined text-[16px] mr-1 animate-pulse">sensors</span>
              <span>Theo dõi Trực tuyến</span>
            </div>
          </div>

          <div className="glass-panel p-4 rounded-xl relative overflow-hidden group select-none">
            <div className="absolute top-0 right-0 p-3 opacity-20 group-hover:opacity-40 transition-opacity">
              <span className="material-symbols-outlined text-4xl text-slate-950">check_circle</span>
            </div>
            <p className="font-label-caps text-label-caps text-slate-950 uppercase tracking-wider mb-1">Đã giao hôm nay</p>
            <p className="font-display-lg text-display-lg text-slate-950 font-bold">1,028</p>
            <div className="mt-2 flex items-center text-slate-950 text-sm font-semibold">
              <span className="material-symbols-outlined text-[16px] mr-1">trending_up</span>
              <span>4% so với hôm qua</span>
            </div>
          </div>
        </div>

        <div className="glass-panel p-4 rounded-xl flex gap-3 w-full xl:w-1/3 justify-end items-center relative">
          <div className="relative">
            <button
              onClick={() => setShowFilterDropdown(!showFilterDropdown)}
              className="bg-surface-container-high border border-outline-variant/30 text-slate-950 px-4 py-2 rounded-lg font-body-md text-body-md flex items-center gap-2 hover:bg-surface-variant/50 transition-colors"
            >
              <span className="material-symbols-outlined text-[18px]">filter_list</span>
              Bộ lọc: {statusFilter === 'all' ? 'TẤT CẢ' : statusFilter === 'transit' ? 'ĐANG DI CHUYỂN' : statusFilter === 'pending' ? 'CHỜ XỬ LÝ' : statusFilter === 'delayed' ? 'TRỄ HẠN' : 'ĐÃ GIAO'}
            </button>

            {showFilterDropdown && (
              <div className="absolute right-0 mt-2 w-48 glass-panel rounded-lg shadow-2xl z-30 border border-outline-variant/30 overflow-hidden animate-fade-in">
                <div className="py-1 bg-surface-container-lowest">
                  {([
                    { key: 'all', label: 'TẤT CẢ' },
                    { key: 'transit', label: 'ĐANG DI CHUYỂN' },
                    { key: 'pending', label: 'CHỜ XỬ LÝ' },
                    { key: 'delayed', label: 'TRỄ HẠN' },
                    { key: 'delivered', label: 'ĐÃ GIAO' }
                  ] as const).map((filter) => (
                    <button
                      key={filter.key}
                      onClick={() => {
                        setStatusFilter(filter.key);
                        setShowFilterDropdown(false);
                      }}
                      className={`w-full text-left px-4 py-2 text-xs font-semibold transition-colors hover:bg-primary-container/20 hover:text-slate-950 ${
                        statusFilter === filter.key ? 'text-slate-950 bg-primary-container/10 border-l-2 border-primary' : 'text-slate-950'
                      }`}
                    >
                      {filter.label}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          <button 
            onClick={() => setDateFilter(dateFilter === 'today' ? 'all' : 'today')}
            className={`bg-surface-container-high border border-outline-variant/30 text-slate-950 px-4 py-2 rounded-lg font-body-md text-body-md flex items-center gap-2 hover:bg-surface-variant/50 transition-colors select-none ${dateFilter === 'today' ? 'bg-primary-container text-slate-950' : ''}`}
          >
            <span className="material-symbols-outlined text-[18px]">calendar_today</span>
            Hôm nay
          </button>

          <button
            onClick={handleExportRegistry}
            className="bg-primary-container text-slate-950 px-4 py-2 rounded-lg font-body-md text-body-md font-semibold flex items-center gap-2 hover:bg-primary-container/90 transition-all hover:scale-[1.02] shadow-[0_0_15px_rgba(37,99,235,0.3)]"
          >
            <span className="material-symbols-outlined text-[18px]">download</span>
            Xuất file
          </button>
        </div>
      </div>

      <div className="glass-panel rounded-xl flex-1 overflow-hidden flex flex-col relative z-10 transition-all duration-300">
        <div className="p-4 border-b border-slate-200 flex justify-between items-center bg-white/90 backdrop-blur-md shrink-0 shadow-sm rounded-t-xl">
          <h3 className="font-headline-sm text-lg text-slate-800 font-bold flex items-center gap-2">
            <span className="material-symbols-outlined text-[20px] text-slate-950">inventory_2</span>
            Danh mục Hoạt động
          </h3>
          <div className="text-sm text-slate-950 font-medium bg-slate-100 px-3 py-1 rounded-full">
            Hiển thị {(currentPage - 1) * ITEMS_PER_PAGE + 1}-{Math.min(currentPage * ITEMS_PER_PAGE, filteredRegistryOrders.length)} trên {filteredRegistryOrders.length} bản ghi
          </div>
        </div>

        <div className="flex-1 overflow-auto min-h-0 bg-white/80 backdrop-blur-sm">
          <table className="w-full text-left border-collapse min-w-[700px]">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/80 select-none">
                <th className="p-4 font-bold text-slate-950 uppercase tracking-wider text-[11px]">Booking ID</th>
                <th className="p-4 font-bold text-slate-950 uppercase tracking-wider text-[11px]">Cửa Kho (Dock)</th>
                <th className="p-4 font-bold text-slate-950 uppercase tracking-wider text-[11px]">Lịch Trình</th>
                <th className="p-4 font-bold text-slate-950 uppercase tracking-wider text-[11px]">Biển Số Xe</th>
                <th className="p-4 font-bold text-slate-950 uppercase tracking-wider text-[11px]">Email Người Nhận</th>
                <th className="p-4 font-bold text-slate-950 uppercase tracking-wider text-[11px]">Trạng Thái</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={6} className="p-12 text-center text-slate-950">
                    <span className="material-symbols-outlined text-[36px] opacity-40 mb-2 block animate-spin">
                      sync
                    </span>
                    <span className="font-medium">Đang tải dữ liệu...</span>
                  </td>
                </tr>
              ) : paginatedOrders.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-12 text-center text-slate-950">
                    <span className="material-symbols-outlined text-[36px] opacity-40 mb-2 block">
                      inbox
                    </span>
                    <span className="font-medium">Không tìm thấy dữ liệu đặt lịch nào.</span>
                  </td>
                </tr>
              ) : (
                paginatedOrders.map((order) => {
                  const isSelected = selectedRegistryOrder?.id === order.id;

                  return (
                    <tr
                      key={order.id}
                      onClick={() => setSelectedRegistryOrder(order)}
                      className={`transition-colors cursor-pointer group hover:bg-blue-50/50 ${
                        isSelected ? 'bg-blue-50 border-l-4 border-blue-500' : 'border-l-4 border-transparent'
                      }`}
                    >
                      <td className="p-4 font-bold text-slate-950 group-hover:text-blue-700 transition-colors">
                        {order.id}
                      </td>
                      <td className="p-4 text-slate-950 truncate max-w-[200px] font-medium">
                        {order.location}
                      </td>
                      <td className="p-4 text-slate-950 font-medium">
                        <div className="flex flex-col gap-0.5">
                          <span>{order.timeRange || "00:00 - 00:00"}</span>
                          <span className="text-[12px] text-slate-400 font-normal">{order.bookingDate || order.eta?.split(' ')[0]}</span>
                        </div>
                      </td>
                      <td className="p-4">
                        <span className="px-2 py-1 bg-slate-100 border border-slate-200 rounded text-slate-800 font-bold font-mono tracking-wider">
                          {order.vehicle}
                        </span>
                      </td>
                      <td className="p-4 text-slate-950 text-sm truncate max-w-[150px] font-medium">
                        {order.recipientEmail || "dauboquay@gmail.com"}
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

        <div className="p-4 border-t border-slate-200 flex justify-between items-center bg-white/90 backdrop-blur-md shrink-0 mt-auto select-none rounded-b-xl">
          <button
            onClick={() => currentPage > 1 && setCurrentPage(currentPage - 1)}
            disabled={currentPage === 1}
            className={`flex items-center gap-1 text-sm transition-colors font-medium ${
              currentPage === 1 ? 'text-slate-300 cursor-not-allowed' : 'text-slate-950 hover:text-slate-950'
            }`}
          >
            <span className="material-symbols-outlined text-[18px]">chevron_left</span> Trước
          </button>
          <div className="flex gap-2">
            {Array.from({ length: totalPages }).map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentPage(idx + 1)}
                className={`w-8 h-8 rounded font-bold flex items-center justify-center text-sm transition-colors ${
                  currentPage === idx + 1 ? 'bg-blue-600 text-slate-950 shadow-md' : 'border border-slate-200 text-slate-950 hover:bg-slate-50'
                }`}
              >
                {idx + 1}
              </button>
            ))}
          </div>
          <button
            onClick={() => currentPage < totalPages && setCurrentPage(currentPage + 1)}
            disabled={currentPage === totalPages}
            className={`flex items-center gap-1 text-sm transition-colors font-medium ${
              currentPage === totalPages ? 'text-slate-300 cursor-not-allowed' : 'text-slate-950 hover:text-slate-950'
            }`}
          >
            Sau <span className="material-symbols-outlined text-[18px]">chevron_right</span>
          </button>
        </div>
      </div>

      {selectedRegistryOrder && (
        <aside className="fixed right-0 top-16 bottom-0 w-full sm:w-[400px] glass-panel border-l border-outline-variant/20 z-40 transform transition-all duration-300 translate-x-0 shadow-[-10px_0_30px_rgba(0,0,0,0.5)] flex flex-col pointer-events-auto animate-slide-in">
          <div className="p-6 border-b border-outline-variant/20 flex justify-between items-start shrink-0">
            <div>
              <div className="flex items-center gap-2 mb-1">
                {selectedRegistryOrder.id === '#ORD-9929-BY' ? (
                  <span className="px-2 py-0.5 rounded border border-[#f59e0b]/30 bg-[#f59e0b]/10 text-[#f59e0b] text-[10px] uppercase font-bold tracking-wider">Chờ xử lý</span>
                ) : selectedRegistryOrder.status === 'delayed' ? (
                  <span className="px-2 py-0.5 rounded border border-error/30 bg-error/10 text-slate-950 text-[10px] uppercase font-bold tracking-wider font-semibold">Trễ hạn</span>
                ) : selectedRegistryOrder.status === 'delivered' ? (
                  <span className="px-2 py-0.5 rounded border border-[#10b981]/30 bg-[#10b981]/10 text-slate-950 text-[10px] uppercase font-bold tracking-wider font-semibold">Đã giao</span>
                ) : (
                  <span className="px-2 py-0.5 rounded border border-secondary/30 bg-secondary/10 text-slate-950 text-[10px] uppercase font-bold tracking-wider">Đang di chuyển</span>
                )}

                {selectedRegistryOrder.priority === 'high' && (
                  <span className="px-2 py-0.5 rounded border border-outline-variant/30 bg-surface-container text-slate-950 text-[10px] uppercase font-bold tracking-wider animate-pulse">
                    Ưu tiên cao
                  </span>
                )}
              </div>
              <h2 className="font-headline-md text-headline-md font-bold text-slate-950 mt-2 select-none">
                {selectedRegistryOrder.id}
              </h2>
              <p className="text-sm text-slate-950 font-semibold select-none">
                {selectedRegistryOrder.customer}
              </p>
            </div>
            <button
              onClick={() => setSelectedRegistryOrder(null)}
              className="text-slate-950 hover:text-slate-950 p-1.5 rounded-full hover:bg-surface-variant/50 transition-colors shrink-0"
              title="Đóng Bảng"
            >
              <span className="material-symbols-outlined text-[20px]">close</span>
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-6 space-y-6">
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
                  <circle cx="20" cy="80" fill="#8d90a0" r="4"></circle>
                  <circle
                    className="animate-pulse pulse-marker"
                    cx={selectedRegistryOrder.coordinates.x}
                    cy={selectedRegistryOrder.coordinates.y}
                    fill={selectedRegistryOrder.status === 'delayed' ? '#ffb4ab' : '#4cd7f6'}
                    r="5"
                  ></circle>
                  <circle cx="80" cy="40" fill="#2563eb" r="4"></circle>
                </svg>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="bg-surface-container-low/50 p-3 rounded border border-outline-variant/10">
                <p className="text-[11px] text-slate-950 uppercase tracking-wider mb-1 font-bold">Tài xế</p>
                <p className="text-sm text-slate-950 font-medium flex items-center gap-2">
                  <span className="material-symbols-outlined text-[16px] text-slate-950">person</span>
                  {selectedRegistryOrder.driverName === 'Unassigned' ? 'Chưa phân công' : selectedRegistryOrder.driverName}
                </p>
              </div>
              <div className="bg-surface-container-low/50 p-3 rounded border border-outline-variant/10">
                <p className="text-[11px] text-slate-950 uppercase tracking-wider mb-1 font-bold">Phương tiện</p>
                <p className="text-sm text-slate-950 font-medium flex items-center gap-2">
                  <span className="material-symbols-outlined text-[16px] text-slate-950">local_shipping</span>
                  {selectedRegistryOrder.vehicle === 'Pending Scheduling' ? 'Đang lên lịch' : selectedRegistryOrder.vehicle}
                </p>
              </div>
            </div>

            <div>
              <h4 className="font-headline-sm text-sm text-slate-950 font-semibold mb-4">Lịch trình Theo dõi</h4>
              <div className="relative pl-4 space-y-6 border-l-2 border-outline-variant/30 ml-2">
                {selectedRegistryOrder.timeline && selectedRegistryOrder.timeline.map((point, idx) => (
                  <div key={idx} className="relative">
                    <div className={`absolute -left-[21px] top-1.5 w-2.5 h-2.5 rounded-full ${
                      point.active
                        ? selectedRegistryOrder.status === 'delayed'
                          ? 'bg-error shadow-[0_0_8px_#ffdad6]'
                          : 'bg-secondary shadow-[0_0_8px_#4cd7f6]'
                        : 'bg-surface-container-high border-2 border-outline-variant'
                    }`}></div>
                    <p className={`text-sm font-semibold ${
                      point.active
                        ? selectedRegistryOrder.status === 'delayed'
                          ? 'text-slate-950'
                          : 'text-slate-950'
                        : 'text-slate-950'
                    }`}>
                      {point.title === 'Order Received' ? 'Đã nhận đơn hàng' : point.title === 'Order Assigned to TRK-442' ? 'Đã phân đơn cho TRK-442' : point.title === 'Order Assigned to TRK-201' ? 'Đã phân đơn cho TRK-201' : point.title === 'Order Assigned to VAN-019' ? 'Đã phân đơn cho VAN-019' : point.title === 'Departed Sorting Facility Node 2' ? 'Đã xuất trạm phân loại Node 2' : point.title === 'Departed sorting hub A' ? 'Đã xuất trạm phân loại A' : point.title === 'Departed regional hub' ? 'Đã xuất kho khu vực' : point.title === 'In Transit - Sector 7 Checkpoint' ? 'Đang di chuyển - Trạm gác Sector 7' : point.title === 'In Transit - Downtown Highway' ? 'Đang di chuyển - Đường cao tốc nội đô' : point.title === 'In Transit - Highway East' ? 'Đang di chuyển - Đường cao tốc phía Đông' : point.title === 'Stuck in Traffic: City Center' ? 'Bị kẹt xe: Trung tâm thành phố' : point.title === 'Delivered successfully' ? 'Giao hàng thành công' : point.title}
                    </p>
                    <p className="text-[11px] text-slate-950 mt-0.5">{point.timestamp}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="p-4 border-t border-outline-variant/20 bg-surface-container-lowest/85 flex gap-3 shrink-0 select-none">
            <button
              onClick={() => handleContactDriver(selectedRegistryOrder.driverName)}
              className="flex-1 bg-surface-container border border-outline-variant/30 text-slate-950 py-2 rounded-lg text-sm font-semibold hover:bg-surface-variant/50 transition-colors shadow-inner"
            >
              Liên hệ Tài xế
            </button>
            <button
              onClick={() => handleUpdateRoute(selectedRegistryOrder.id)}
              className="flex-1 bg-secondary/20 border border-secondary text-slate-950 py-2 rounded-lg text-sm font-semibold hover:bg-secondary/30 transition-colors shadow-[0_0_10px_rgba(76,215,246,0.15)]"
            >
              Cập nhật Lộ trình
            </button>
          </div>
        </aside>
      )}
    </div>
  );
};

export default OrdersTab;
