export interface KpiDashboard {
  overview: KpiOverview;
  warehouse: KpiWarehouse;
  dispatcher: KpiDispatcher;
  finance: KpiFinance;
  generatedAt: string;
}

export interface KpiOverview {
  totalOrders: number;
  pendingOrders: number;
  completedOrders: number;
  totalVehicles: number;
  activeVehicles: number;
  totalSkus: number;
  totalWarehouses: number;
  totalCustomers: number;
  orderCompletionRate: number;
  orderTrend: KpiTrendItem[];
}

export interface KpiWarehouse {
  totalInventoryItems: number;
  totalBins: number;
  occupiedBins: number;
  utilizationRate: number;
  inboundToday: number;
  inboundThisWeek: number;
  inboundThisMonth: number;
  outboundToday: number;
  outboundThisWeek: number;
  outboundThisMonth: number;
  deadStockCount: number;
  expirySoonCount: number;
  criticalExpiryCount: number;
  inventoryTrend: KpiTrendItem[];
  zoneUtilization: KpiZoneUtilization[];
}

export interface KpiDispatcher {
  totalVehiclesInWarehouse: number;
  scheduledToday: number;
  waitingVehicles: number;
  processingVehicles: number;
  completedToday: number;
  avgWaitingMinutes: number;
  availableDocks: number;
  occupiedDocks: number;
  checkInToday: number;
  checkOutToday: number;
  vehicleTrend: KpiTrendItem[];
  dockStatus: KpiDockStatus[];
}

export interface KpiFinance {
  todayRevenue: number;
  thisWeekRevenue: number;
  thisMonthRevenue: number;
  thisYearRevenue: number;
  todayExpense: number;
  thisWeekExpense: number;
  thisMonthExpense: number;
  thisYearExpense: number;
  todayProfit: number;
  thisMonthProfit: number;
  thisYearProfit: number;
  totalReceivable: number;
  totalPayable: number;
  unpaidInvoices: number;
  pendingPayments: number;
  paymentRate: number;
  revenueTrend: KpiTrendItem[];
  expenseTrend: KpiTrendItem[];
}

export interface KpiTrendItem {
  label: string;
  value: number;
}

export interface KpiZoneUtilization {
  zoneCode: string;
  zoneName: string;
  totalBins: number;
  usedBins: number;
  utilizationRate: number;
}

export interface KpiDockStatus {
  dockCode: string;
  status: string;
  vehicleId: number | null;
  plateNumber: string | null;
  checkInAt: string | null;
}

export type KpiTabType = 'overview' | 'warehouse' | 'dispatcher' | 'finance';
