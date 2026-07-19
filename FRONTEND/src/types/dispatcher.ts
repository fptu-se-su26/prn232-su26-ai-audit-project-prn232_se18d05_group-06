export interface Order {
  id: string;
  eta: string;
  driverName: string;
  vehicle: string;
  driverAvatar: string;
  status: 'approaching' | 'delayed' | 'transit' | 'delivered';
  location: string;
  coordinates: { x: number; y: number }; // Percentage position on the mock map (top/left)
  delayReason?: string;
  customer?: string;
  destination?: string;
  priority?: 'high' | 'normal';
  timeline?: Array<{ title: string; timestamp: string; active?: boolean }>;
  timeRange?: string;
  bookingDate?: string;
  recipientEmail?: string;
}

export interface LiveEvent {
  id: string;
  title: string;
  timestamp: string;
  type: 'success' | 'warning' | 'info' | 'error';
  description: string;
}

export interface AIRecommendation {
  id: string;
  title: string;
  description: string;
  type: 'route' | 'alert';
  orderId: string;
  applied: boolean;
  dismissed: boolean;
}

export interface KPIStats {
  activeDeliveries: number;
  vehiclesOnRoute: number;
  delayedOrders: number;
  availableDrivers: number;
  fuelConsumption: number;
  successRate: number;
}
