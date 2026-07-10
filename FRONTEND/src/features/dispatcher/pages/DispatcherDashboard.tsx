import { useState, useEffect } from 'react';
import { DispatcherLayout } from '@layouts/DispatcherLayout';
import { Order, LiveEvent, AIRecommendation, KPIStats } from '@/types/dispatcher';

// Import Separated Tab Views
import { DashboardTab } from '../components/tabs/DashboardTab';
import { OrdersTab } from '../components/tabs/OrdersTab';
import { AssignDispatcherTab } from '../components/tabs/AssignDispatcherTab';
import { LiveTrackingTab } from '../components/tabs/LiveTrackingTab';
import { DispatchersTab } from '../components/tabs/DispatchersTab';
import { VehiclesTab } from '../components/tabs/VehiclesTab';
import { FleetMonitoringTab } from '../components/tabs/FleetMonitoringTab';
import { AlertsTab } from '../components/tabs/AlertsTab';
import { DispatchOptimizationTab } from '../components/tabs/DispatchOptimizationTab';
import { ReportsTab } from '../components/tabs/ReportsTab';
import { VehicleTrackingDashboard } from './VehicleTrackingDashboard';

// --- MOCK DATABASE CONFIGURATIONS ---

// 1. Initial Mock Database for Command Room
const INITIAL_ORDERS: Order[] = [
  {
    id: '#ORD-9942A',
    eta: '12m',
    driverName: 'J. Smith',
    vehicle: 'Van 4',
    driverAvatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCV3HB7jIUDekm1qtBEwLR7yglIuWN-XBfAEdH6QbsjfmYOr5r5Ha1Y7S_cKOTLkU7jFVPX0IYn7aBuNr_62yZaDQ5lQ8cqy2-MYGRPjtG2XQRMnEQ9cStR1KEwjvMVjigERAjyY-5DeA441wmqSTyS2mZwnISX0gBsykt17pMBN6kxHCe1EjiCZ3c3yAxtNbVjWbH0CMebUsBTmbdQRgAcdwUF319GgrvgfnVYoPv0VH2VNp7IbcXe-04MjIF6LNHMhjfdmgf9mOze',
    status: 'approaching',
    location: 'Đang tiếp cận Đại lộ 7 / Đường Main',
    coordinates: { x: 40, y: 30 },
  },
  {
    id: '#ORD-8812B',
    eta: '45m',
    driverName: 'A. Chen',
    vehicle: 'Truck 2',
    driverAvatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBFphp93EauehW_sDUQAvnW4tFNhnyvwfXsvQskwHygrrWEHPpMl6xG9jLxj7hDSAw5GT1UdxUN6fG3tnY9tdF33VqvLzAbYr4hLwoebn6GnOZsA_LPxgdCMwDUd-stNlTJYZmqV-A69ARo1_hia0KsR5fkfqjlW5jVLAca2w0iH2J94b7-DrwnClsCK3rtJi4JGxknDn59fmU8ytZoO2JfL7Q1N35yY-bLDkmJIFDi8Om6ANRPpcB3L84irhGAR9r1hjHLeWUVrik6',
    status: 'transit',
    location: 'Hướng bắc I-95, Lối ra 4A',
    coordinates: { x: 65, y: 60 },
  },
  {
    id: '#ORD-7731C',
    eta: 'Trễ hạn',
    driverName: 'M. Davis',
    vehicle: 'Van 1',
    driverAvatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuASqTXf-ypHHWbfwlINGzbcEGe3z3RiKidT_mtsY-wHSUzQ6JWwQI-ukqGcDjnYcnXK33Wx1Mt8TNVl3hDDzTtgyHZyaS0BnTnWm0_i33oCpRAm3Rhucp7z8OnvTmIS3ouWF-FC9hpn4ase0Rz6dy4v3P7Jen9PO6D_3hnekqR704oMWhv_mXWKgKXCCYpKziBQzGLx_eA3b1tfVRWq8SWaI6mxv18j5zjR9yghh0nD8RoyeP4MsOSZON60qOm9wfozrspOTqeUK-Kt',
    status: 'delayed',
    location: 'Kẹt xe: Trung tâm thành phố',
    delayReason: 'Kẹt xe: Trung tâm thành phố',
    coordinates: { x: 55, y: 45 },
  },
  {
    id: '#ORD-9945X',
    eta: '24m',
    driverName: 'K. Tanaka',
    vehicle: 'Van 3',
    driverAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
    status: 'transit',
    location: 'Đang di chuyển đến Trạm A',
    coordinates: { x: 30, y: 70 },
  },
];

const INITIAL_EVENTS: LiveEvent[] = [
  {
    id: 'evt-1',
    title: 'Đã giao kiện hàng: #ORD-9941',
    timestamp: 'Vừa xong',
    type: 'success',
    description: 'Đã chụp chữ ký khách hàng tại Tổ hợp văn phòng Phố 5.',
  },
  {
    id: 'evt-2',
    title: 'Xe 2 đi lệch lộ trình',
    timestamp: '2 phút trước',
    type: 'info',
    description: 'Đang tính lại lộ trình do rào chắn thi công trên Đường Oak.',
  },
  {
    id: 'evt-3',
    title: 'Xe đã dừng: Xe tải 5',
    timestamp: '8 phút trước',
    type: 'error',
    description: 'Phát hiện dừng chẩn đoán động cơ ngoài kế hoạch trên I-280 Hướng Tây.',
  },
  {
    id: 'evt-4',
    title: 'Đã nhận đơn hàng: #ORD-9945X',
    timestamp: '15 phút trước',
    type: 'info',
    description: 'Kho A đã xuất kho thành công cho K. Tanaka.',
  },
];

const INITIAL_RECOMMENDATION: AIRecommendation = {
  id: 'rec-1',
  title: 'Tìm thấy lộ trình nhanh hơn cho Xe 4',
  description: 'Tránh tai nạn trên I-95. Tiết kiệm dự kiến 14 phút.',
  type: 'route',
  orderId: '#ORD-9942A',
  applied: false,
  dismissed: false,
};

const INITIAL_STATS: KPIStats = {
  activeDeliveries: 342,
  vehiclesOnRoute: 184,
  delayedOrders: 1,
  availableDrivers: 28,
  fuelConsumption: 2.4,
  successRate: 98.2,
};

// 2. Mock Database for Assign Driver tab
interface AssignOrder {
  id: string;
  priority: 'HIGH PRIORITY' | 'STANDARD';
  weight: string;
  route: string;
}

interface AssignDriver {
  name: string;
  avatar: string;
  rating: number;
  distance: string;
  recommended: boolean;
}

interface AssignVehicle {
  id: string;
  type: string;
  capacity: string;
  fuel: string;
  fuelValue: number;
  status: 'READY' | 'MAINTENANCE';
}

const INITIAL_ASSIGN_ORDERS: AssignOrder[] = [
  { id: 'ORD-8992A', priority: 'HIGH PRIORITY', weight: '2.4 Tấn • Đóng pallet', route: 'Trung tâm Phân phối Alpha → Cảng biển' },
  { id: 'ORD-9014B', priority: 'STANDARD', weight: '1.8 Tấn • Hàng dễ vỡ', route: 'Kho 4 → Trạm Trung tâm' },
  { id: 'ORD-8993C', priority: 'STANDARD', weight: '3.1 Tấn • Hàng nặng', route: 'Trạm Khu vực phía Đông → Sân bay' },
];

const INITIAL_ASSIGN_DRIVERS: AssignDriver[] = [
  { name: 'Marcus T.', avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDD4ht36shvD8aqIjMlFeDSYFcF8zN7_VZncE9yC6MDXukjP7a8mzhlvq7CvY21D2AWJBFa4RYc9bpVwGscpQqZNWgtyt6g-0dYk48pVkU1HjAICclx5_k9iCo7_HauXlqEcDYxpGjPluTBP9hOz5JjEdJRhcrEEMioLqh6JJ9uA-zy0n0nAssEEg6cP5HJ_UEn5P_LqJpWGHahd9cS0gKgB7_hu6npSXdjhXs26xcizk_Bm3CJMBtjtAqCpZbaL4So29DIuNnu4afK', rating: 4.9, distance: 'Cách 0.8 mi (Đang rảnh)', recommended: true },
  { name: 'Sarah J.', avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBZDABhu9aOCsvy2MgYdHWtzvw53FyiD7lsQhGHBG34AWeEFy7X7EtqP0d-FK5C8PJpPfgrhy8LBxsDQJ3Xl_MmJQcsXnA8UG38VdM2UnyyfgwrDliJeFnG6Yy3__PQzQJQhauTg4obfbADIAUDcgXgc5Mswhqa8l__PGQmILyW7skKuZhUSsG3F8g8XOHhD4zw2ve-2Kk-ZxNNuPy8wcz5H4c6kRr99gqamCfUpcTBTOp2JHSc1Uj8JLtXkuabnnf-mLLO_SZzMbdG', rating: 4.7, distance: 'Cách 3.2 mi', recommended: false },
  { name: 'David K.', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=facearea&facepad=2&w=256&h=256&q=80', rating: 4.8, distance: 'Cách 1.5 mi', recommended: false },
];

const INITIAL_ASSIGN_VEHICLES: AssignVehicle[] = [
  { id: 'V-402', type: 'Box Truck', capacity: 'Tối đa 3.5 Tấn', fuel: '85% EV', fuelValue: 85, status: 'READY' },
  { id: 'V-109', type: 'Van Truck', capacity: 'Tối đa 1.5 Tấn', fuel: '62% EV', fuelValue: 62, status: 'READY' },
  { id: 'V-305', type: 'Semi Reefer', capacity: 'Tối đa 15.0 Tấn', fuel: '90% Diesel', fuelValue: 90, status: 'READY' },
];

export const DispatcherDashboard = () => {
  const [activeTab, setActiveTab] = useState('Dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [notificationsCount, setNotificationsCount] = useState(2);

  // --- Command Room States ---
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  const [orders, setOrders] = useState<Order[]>(INITIAL_ORDERS);
  const [events, setEvents] = useState<LiveEvent[]>(INITIAL_EVENTS);
  const [recommendation, setRecommendation] = useState<AIRecommendation | null>(
    INITIAL_RECOMMENDATION
  );
  const [stats, setStats] = useState<KPIStats>(INITIAL_STATS);

  // --- Assign Driver Matrix States ---
  const [unassignedOrders, setUnassignedOrders] = useState<AssignOrder[]>(INITIAL_ASSIGN_ORDERS);
  const [selectedAssignOrder, setSelectedAssignOrder] = useState<AssignOrder | null>(INITIAL_ASSIGN_ORDERS[1]); 
  const [selectedAssignDriver, setSelectedAssignDriver] = useState<AssignDriver | null>(INITIAL_ASSIGN_DRIVERS[0]); 
  const [selectedAssignVehicle, setSelectedAssignVehicle] = useState<AssignVehicle | null>(INITIAL_ASSIGN_VEHICLES[0]); 
  const [assignFilter, setAssignFilter] = useState<'ALL' | 'HIGH' | 'STANDARD'>('ALL');

  // --- AI Co-pilot Modal / Toast State ---
  const [showAiModal, setShowAiModal] = useState(false);
  const [aiPrompt, setAiPrompt] = useState('');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Toast clear timeout
  useEffect(() => {
    if (toastMessage) {
      const timer = setTimeout(() => setToastMessage(null), 4000);
      return () => clearTimeout(timer);
    }
  }, [toastMessage]);

  // Telemetry simulator interval
  useEffect(() => {
    const interval = setInterval(() => {
      // 1. Stats updates
      setStats((prev) => {
        const fuelChange = (Math.random() - 0.5) * 0.1;
        const successChange = (Math.random() - 0.5) * 0.05;
        const newFuel = Math.max(2.1, Math.min(2.8, prev.fuelConsumption + fuelChange));
        const newSuccess = Math.max(97.5, Math.min(99.5, prev.successRate + successChange));
        const deliveryDelta = Math.random() > 0.6 ? (Math.random() > 0.5 ? 1 : -1) : 0;

        return {
          ...prev,
          activeDeliveries: Math.max(300, prev.activeDeliveries + deliveryDelta),
          fuelConsumption: newFuel,
          successRate: newSuccess,
        };
      });

      // 2. Events feeds
      if (Math.random() > 0.7) {
        const mockLogTemplates = [
          {
            title: 'Xe 3 dừng tiếp nhiên liệu',
            desc: 'Tiếp nhiên liệu tại trạm Pilot #12. Bình xăng ở mức 95%.',
            type: 'info' as const,
          },
          {
            title: 'Cảnh báo giới hạn tốc độ: Xe tải 2',
            desc: 'Vượt quá giới hạn tốc độ một chút trên Quốc lộ 101. Đã ghi nhận cảnh báo.',
            type: 'warning' as const,
          },
          {
            title: 'Kiện hàng đã xử lý: Trạm B',
            desc: 'Hệ thống phân loại đã xếp 84 bưu kiện lên tuyến trung chuyển.',
            type: 'info' as const,
          },
          {
            title: 'Đã cập nhật dữ liệu đo lường: Xe 1',
            desc: 'Lộ trình tránh tắc nghẽn đã cập nhật hướng dẫn GPS thành công.',
            type: 'success' as const,
          },
        ];

        const rollIndex = Math.floor(Math.random() * mockLogTemplates.length);
        const rolledLog = mockLogTemplates[rollIndex];

        const newEvent: LiveEvent = {
          id: `evt-${Date.now()}`,
          title: rolledLog.title,
          timestamp: 'Vừa xong',
          type: rolledLog.type,
          description: rolledLog.desc,
        };

        setNotificationsCount((prev) => prev + 1);

        setEvents((prev) => [
          newEvent,
          ...prev.map((e) => {
            if (e.timestamp === 'Vừa xong') return { ...e, timestamp: '1 phút trước' };
            if (e.timestamp.includes('phút trước')) {
              const minutes = parseInt(e.timestamp) + 1;
              return { ...e, timestamp: `${minutes} phút trước` };
            }
            return e;
          }),
        ]);
      }

      // 3. Command Order ETA ticks
      setOrders((prevOrders) =>
        prevOrders.map((order) => {
          if (order.status === 'delayed' || order.eta === 'Đã giao') return order;
          const currentEtaMinutes = parseInt(order.eta);
          if (isNaN(currentEtaMinutes)) return order;

          if (currentEtaMinutes <= 1) {
            const arrivalEvent: LiveEvent = {
              id: `evt-arrival-${order.id}`,
              title: `Đơn hàng đã giao: ${order.id}`,
              timestamp: 'Vừa xong',
              type: 'success',
              description: `Giao hàng thành công bởi ${order.driverName} (${order.vehicle}).`,
            };

            setEvents((prevEvents) => [arrivalEvent, ...prevEvents]);
            setToastMessage(`Thành công: Đã giao đơn ${order.id}!`);

            return {
              ...order,
              eta: 'Đã giao',
              status: 'delivered',
              location: 'Đã đến điểm đích.',
            };
          }

          return {
            ...order,
            eta: `${currentEtaMinutes - 1}m`,
          };
        })
      );
    }, 15000);

    return () => clearInterval(interval);
  }, []);

  // Action: Apply AI Route optimization
  const handleApplyRecommendation = (id: string) => {
    if (!recommendation || recommendation.id !== id) return;

    setOrders((prevOrders) =>
      prevOrders.map((o) => {
        if (o.id === recommendation.orderId) {
          return {
            ...o,
            eta: '7m',
            location: 'Đã đổi lộ trình qua Đường vòng Đại lộ 10 (Lộ trình nhanh)',
            status: 'approaching',
            coordinates: { x: 42, y: 28 },
          };
        }
        return o;
      })
    );

    const rerouteLog: LiveEvent = {
      id: `evt-reroute-${Date.now()}`,
      title: 'Đã áp dụng tối ưu hóa AI cho Xe 4',
      timestamp: 'Vừa xong',
      type: 'success',
      description: 'Tránh kẹt xe lớn trên I-95. Thời gian dự kiến (ETA) giảm 5 phút.',
    };

    setEvents((prev) => [rerouteLog, ...prev]);
    setRecommendation((prev) => (prev ? { ...prev, applied: true } : null));
    setToastMessage('Lộ trình đã tối ưu: Lộ trình tránh cho Xe 4 đã được triển khai thành công!');
  };

  // Action: Dismiss AI Insight
  const handleDismissRecommendation = (id: string) => {
    if (recommendation && recommendation.id === id) {
      setRecommendation((prev) => (prev ? { ...prev, dismissed: true } : null));
      setToastMessage('Đã bỏ qua gợi ý.');
    }
  };

  // Action: Clear notifications count
  const handleResetNotifications = () => {
    setNotificationsCount(0);
  };

  // Action: AI dispatcher chat prompt execution
  const handleExecuteAiQuery = (promptText: string) => {
    const normalizedPrompt = promptText.toLowerCase();

    if (normalizedPrompt.includes('delay') || normalizedPrompt.includes('traffic') || normalizedPrompt.includes('trễ') || normalizedPrompt.includes('kẹt')) {
      setSearchQuery('delayed');
      setToastMessage('AI Copilot: Đã lọc hiển thị các xe trễ và sự cố.');
    } else if (normalizedPrompt.includes('smith') || normalizedPrompt.includes('van 4') || normalizedPrompt.includes('xe 4')) {
      setSearchQuery('#ORD-9942A');
      setSelectedOrderId('#ORD-9942A');
      setToastMessage('AI Copilot: Đã định vị bản đồ theo dõi theo Xe 4.');
    } else if (normalizedPrompt.includes('optimize') || normalizedPrompt.includes('bypass') || normalizedPrompt.includes('tối ưu')) {
      if (recommendation && !recommendation.applied && !recommendation.dismissed) {
        handleApplyRecommendation(recommendation.id);
      } else {
        setToastMessage('AI Copilot: Tối ưu hóa lộ trình đã được kích hoạt.');
      }
    } else {
      setSearchQuery(promptText);
      setToastMessage(`AI Copilot đã tìm kiếm: "${promptText}"`);
    }

    setAiPrompt('');
    setShowAiModal(false);
  };

  // Action: Dispatch Execution Matrix
  const handleExecuteDispatch = () => {
    if (!selectedAssignOrder || !selectedAssignDriver || !selectedAssignVehicle) {
      setToastMessage('Cảnh báo Điều phối: Vui lòng chọn đơn hàng, tài xế và phương tiện trước.');
      return;
    }

    const orderId = selectedAssignOrder.id;
    const driverName = selectedAssignDriver.name;
    const vehicleId = selectedAssignVehicle.id;

    // 1. Remove dispatched order from list
    setUnassignedOrders((prev) => prev.filter((o) => o.id !== orderId));

    // 2. Increment stats
    setStats((prev) => ({
      ...prev,
      activeDeliveries: prev.activeDeliveries + 1,
      vehiclesOnRoute: prev.vehiclesOnRoute + 1,
    }));

    // 3. Record timeline event logs
    const dispatchLog: LiveEvent = {
      id: `evt-dispatch-${Date.now()}`,
      title: `Đã thực hiện điều phối: ${orderId}`,
      timestamp: 'Vừa xong',
      type: 'success',
      description: `Tài xế ${driverName} đã được phân công lái xe ${vehicleId} cho lộ trình ${selectedAssignOrder.route}.`,
    };
    setEvents((prev) => [dispatchLog, ...prev]);

    // 4. Update orders database (adding the newly assigned dispatch order)
    const newActiveOrder: Order = {
      id: `#${orderId}`,
      eta: '40m',
      driverName: driverName,
      vehicle: selectedAssignVehicle.type,
      driverAvatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
      status: 'transit',
      location: selectedAssignOrder.route.split('→')[0].trim(),
      coordinates: { x: 50, y: 50 },
    };
    setOrders((prev) => [...prev, newActiveOrder]);

    // 5. Toast notification
    setToastMessage(`Điều phối thành công: Ma trận điều phối đã triển khai! ${driverName} đã xuất phát cùng ${vehicleId} cho đơn ${orderId}.`);

    // Reset selection
    setSelectedAssignOrder(null);
  };

  // Action: AI Auto Match Dispatch Matrix
  const handleAiAutoMatch = () => {
    if (unassignedOrders.length === 0) {
      setToastMessage('Ma trận AI: Không còn đơn hàng chưa phân công để tự động ghép cặp.');
      return;
    }
    // Automatically match recommended Marcus, Standard standard order, and capacity V-402
    setSelectedAssignOrder(unassignedOrders[0]);
    setSelectedAssignDriver(INITIAL_ASSIGN_DRIVERS[0]);
    setSelectedAssignVehicle(INITIAL_ASSIGN_VEHICLES[0]);
    setToastMessage('Tối ưu hóa Ma trận AI: Đã tìm thấy cặp ghép hoàn hảo (Marcus T. ↔ V-402 ↔ ORD-8992A). Sẵn sàng thực hiện.');
  };

  // Filters mapping - Command room
  const filteredCommandOrders = orders.filter((order) => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return true;
    if (q === 'delayed') return order.status === 'delayed';

    return (
      order.id.toLowerCase().includes(q) ||
      order.driverName.toLowerCase().includes(q) ||
      order.vehicle.toLowerCase().includes(q) ||
      order.location.toLowerCase().includes(q)
    );
  });

  // Filters mapping - Live events feed
  const filteredEvents = events.filter((evt) => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return true;
    return (
      evt.title.toLowerCase().includes(q) ||
      evt.description.toLowerCase().includes(q) ||
      evt.timestamp.toLowerCase().includes(q)
    );
  });

  return (
    <DispatcherLayout
      activeTab={activeTab}
      setActiveTab={setActiveTab}
      sidebarOpen={sidebarOpen}
      setSidebarOpen={setSidebarOpen}
      searchQuery={searchQuery}
      setSearchQuery={setSearchQuery}
      notificationsCount={notificationsCount}
      resetNotifications={handleResetNotifications}
      onAiAssistantClick={() => setShowAiModal(true)}
    >
      {/* =========================================================================
          VIEW A: Dashboard View (Tách thành DashboardTab)
          ========================================================================= */}
      {activeTab === 'Dashboard' && (
        <DashboardTab
          orders={orders}
          selectedOrderId={selectedOrderId}
          setSelectedOrderId={setSelectedOrderId}
          stats={stats}
          filteredCommandOrders={filteredCommandOrders}
          recommendation={recommendation}
          handleApplyRecommendation={handleApplyRecommendation}
          handleDismissRecommendation={handleDismissRecommendation}
          filteredEvents={filteredEvents}
        />
      )}

      {/* =========================================================================
          VIEW B: Orders View (Tách thành OrdersTab)
          ========================================================================= */}
      {activeTab === 'Orders' && (
        <OrdersTab
          searchQuery={searchQuery}
          setToastMessage={setToastMessage}
        />
      )}

      {/* =========================================================================
          VIEW C: Assign Driver View (Tách thành AssignDriverTab)
          ========================================================================= */}
      {activeTab === 'Assign Driver' && (
        <AssignDispatcherTab
          searchQuery={searchQuery}
          unassignedOrders={unassignedOrders}
          selectedAssignOrder={selectedAssignOrder}
          setSelectedAssignOrder={setSelectedAssignOrder}
          selectedAssignDriver={selectedAssignDriver}
          setSelectedAssignDriver={setSelectedAssignDriver}
          selectedAssignVehicle={selectedAssignVehicle}
          setSelectedAssignVehicle={setSelectedAssignVehicle}
          assignFilter={assignFilter}
          setAssignFilter={setAssignFilter}
          handleExecuteDispatch={handleExecuteDispatch}
          handleAiAutoMatch={handleAiAutoMatch}
        />
      )}

      {/* =========================================================================
          VIEW D: Live Tracking View (Tách thành LiveTrackingTab)
          ========================================================================= */}
      {activeTab === 'Live Tracking' && (
        <LiveTrackingTab
          searchQuery={searchQuery}
          setToastMessage={setToastMessage}
        />
      )}

      {/* =========================================================================
          VIEW E: Drivers View (Tách thành DriversTab)
          ========================================================================= */}
      {activeTab === 'Drivers' && (
        <DispatchersTab
          searchQuery={searchQuery}
          setToastMessage={setToastMessage}
          setSelectedAssignDriver={setSelectedAssignDriver}
        />
      )}

      {/* =========================================================================
          VIEW E2: Vehicles View (Tách thành VehiclesTab)
          ========================================================================= */}
      {activeTab === 'Vehicles' && (
        <VehiclesTab
          searchQuery={searchQuery}
          setToastMessage={setToastMessage}
          setActiveTab={setActiveTab}
        />
      )}

      {activeTab === 'Vehicle Tracking' && (
        <VehicleTrackingDashboard />
      )}

      {/* =========================================================================
          VIEW E3: Fleet Monitoring View (Tách thành FleetMonitoringTab)
          ========================================================================= */}
      {activeTab === 'Fleet Monitoring' && (
        <FleetMonitoringTab
          searchQuery={searchQuery}
          setToastMessage={setToastMessage}
          setActiveTab={setActiveTab}
        />
      )}

      {/* =========================================================================
          VIEW E4: Alerts Center View (Integrated tab AlertsTab)
          ========================================================================= */}
      {activeTab === 'Alerts Center' && (
        <AlertsTab
          searchQuery={searchQuery}
          setToastMessage={setToastMessage}
          setActiveTab={setActiveTab}
        />
      )}

      {activeTab === 'Flow Optimization' && (
        <DispatchOptimizationTab
          searchQuery={searchQuery}
          setToastMessage={setToastMessage}
        />
      )}
      {/* =========================================================================
          VIEW E5: Reports & Analytics View (Integrated tab ReportsTab)
          ========================================================================= */}
      {(activeTab === 'Reports' || activeTab === 'Delivery Analytics') && (
        <ReportsTab
          searchQuery={searchQuery}
          setToastMessage={setToastMessage}
          setActiveTab={setActiveTab}
        />
      )}

      {/* =========================================================================
          VIEW F: Placeholder views for non-integrated modules
          ========================================================================= */}
      {activeTab !== 'Dashboard' && activeTab !== 'Orders' && activeTab !== 'Assign Driver' && activeTab !== 'Live Tracking' && activeTab !== 'Drivers' && activeTab !== 'Vehicles' && activeTab !== 'Fleet Monitoring' && activeTab !== 'Alerts Center' && activeTab !== 'Flow Optimization' && activeTab !== 'Reports' && activeTab !== 'Delivery Analytics' && (
        <div className="flex-1 glass-panel rounded-lg flex flex-col items-center justify-center text-center p-8 select-none relative z-10">
          <span className="material-symbols-outlined text-[64px] text-primary animate-pulse mb-4">
            construction
          </span>
          <h3 className="font-headline-md text-headline-md font-bold text-on-surface mb-2">
            Phân hệ {activeTab}
          </h3>
          <p className="text-on-surface-variant max-w-md">
            Phần {activeTab} đã được tích hợp hoàn toàn vào sơ đồ điều phối. Dữ liệu đo lường từ xa đã sẵn sàng truyền trực tuyến thời gian thực.
          </p>
          <button
            onClick={() => setActiveTab('Dashboard')}
            className="mt-6 bg-primary hover:bg-inverse-primary text-on-primary font-semibold px-5 py-2 rounded-lg transition-colors"
          >
            Quay lại Phòng Điều khiển
          </button>
        </div>
      )}

      {/* =========================================================================
          DYNAMIC DIALOGS & OVERLAYS (AI assistant prompt modal)
          ========================================================================= */}
      {showAiModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in pointer-events-auto">
          <div className="w-full max-w-lg glass-panel rounded-xl overflow-hidden border border-outline-variant/30 shadow-2xl animate-scale-up">
            <div className="p-4 border-b border-white/10 flex justify-between items-center bg-primary-container/10">
              <h3 className="font-headline-sm text-headline-sm font-bold text-primary flex items-center gap-2">
                <span className="material-symbols-outlined text-[20px] text-primary animate-bounce">
                  smart_toy
                </span>
                Trợ lý Điều phối SmartLog AI
              </h3>
              <button
                onClick={() => setShowAiModal(false)}
                className="text-on-surface-variant hover:text-error transition-colors p-1"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            <div className="p-5 flex flex-col gap-4">
              <p className="text-body-md text-on-surface-variant leading-relaxed text-left">
                Xin chào Điều phối viên. Tôi là trợ lý tối ưu hóa của bạn. Hãy yêu cầu tôi kiểm tra dữ liệu đo lường xe thời gian thực hoặc áp dụng các lộ trình điều phối:
              </p>

              <div className="relative">
                <input
                  type="text"
                  className="w-full bg-black/30 border border-outline-variant/40 rounded-lg p-3 pl-4 pr-10 text-on-surface text-body-md focus:outline-none focus:ring-1 focus:ring-secondary/50 focus:border-secondary/50 transition-all placeholder-on-surface-variant/45"
                  placeholder='Ví dụ: "Hiển thị xe trễ", "Định vị Xe 4", "Tối ưu lộ trình"...'
                  value={aiPrompt}
                  onChange={(e) => setAiPrompt(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleExecuteAiQuery(aiPrompt)}
                />
                <button
                  onClick={() => handleExecuteAiQuery(aiPrompt)}
                  className="absolute right-3 top-3 text-secondary hover:text-primary transition-colors"
                >
                  <span className="material-symbols-outlined text-[22px]">send</span>
                </button>
              </div>

              <div className="flex flex-col gap-2">
                <span className="text-[11px] font-bold text-on-surface-variant uppercase tracking-wider text-left">
                  Yêu cầu nhanh:
                </span>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => handleExecuteAiQuery('Show delayed')}
                    className="bg-error/10 hover:bg-error/20 text-error border border-error/25 px-3 py-1.5 rounded-full text-[11px] font-semibold transition-all"
                  >
                    ⚠️ Lọc Đơn trễ
                  </button>
                  <button
                    onClick={() => handleExecuteAiQuery('Optimize route')}
                    className="bg-secondary/15 hover:bg-secondary/25 text-secondary border border-secondary/25 px-3 py-1.5 rounded-full text-[11px] font-semibold transition-all"
                  >
                    ⚡ Lộ trình tránh cho Xe 4
                  </button>
                  <button
                    onClick={() => handleExecuteAiQuery('Center on Van 4')}
                    className="bg-primary/10 hover:bg-primary/20 text-primary border border-primary/25 px-3 py-1.5 rounded-full text-[11px] font-semibold transition-all"
                  >
                    📍 Theo dõi J. Smith (Xe 4)
                  </button>
                  <button
                    onClick={() => {
                      setSearchQuery('');
                      setShowAiModal(false);
                      setToastMessage('AI Copilot: Đã xóa các bộ lọc.');
                    }}
                    className="bg-white/5 hover:bg-white/10 text-on-surface-variant border border-outline-variant/30 px-3 py-1.5 rounded-full text-[11px] font-semibold transition-all"
                  >
                    🔄 Đặt lại Bộ lọc Bảng điều khiển
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Floating Ops notification toast banner */}
      {toastMessage && (
        <div className="fixed bottom-4 right-4 z-50 max-w-sm glass-panel rounded-lg shadow-[0_4px_25px_rgba(0,0,0,0.5)] border-l-4 border-secondary p-3.5 flex items-start gap-3 select-none animate-slide-up pointer-events-auto">
          <span className="material-symbols-outlined text-[20px] text-secondary mt-0.5 animate-pulse">
            info
          </span>
          <div className="flex-1 text-left">
            <p className="text-[12px] font-bold text-on-surface uppercase tracking-wider mb-0.5">
              Cập nhật Trung tâm Điều khiển
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

export default DispatcherDashboard;
