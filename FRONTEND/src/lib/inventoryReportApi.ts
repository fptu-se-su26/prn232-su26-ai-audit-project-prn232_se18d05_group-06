import api from './api';

// Types for Dead Stock / Expiry Stock
export type DeadStockItem = {
  skuid: number;
  skucode: string;
  productName: string;
  customerName: string;
  binCode: string;
  warehouseName?: string;
  zoneName?: string;
  quantity: number;
  expiryDate: string | null;
  inboundDate: string | null;
  daysStored: number;
  daysToExpiry: number | null;
  alertType: string;
  daysOverThreshold: number | null;
  severity: 'CRITICAL' | 'WARNING' | 'NORMAL';
};

export type DeadStockSummary = {
  totalDeadStock: number;
  totalExpiringSoon: number;
  totalCritical: number;
  totalWarning: number;
  totalQuantity: number;
  totalValue: number;
  byWarehouse: Array<{
    warehouseName: string;
    deadStockCount: number;
    expiringSoonCount: number;
    totalQuantity: number;
  }>;
  byCustomer: Array<{
    customerName: string;
    deadStockCount: number;
    expiringSoonCount: number;
    totalQuantity: number;
  }>;
};

export type DeadStockFilter = {
  skucode?: string;
  productName?: string;
  warehouseId?: number;
  zoneId?: number;
  binId?: number;
  customerId?: number;
  inboundDateFrom?: string;
  inboundDateTo?: string;
  expiryDateFrom?: string;
  expiryDateTo?: string;
  minDaysStored?: number;
  maxDaysStored?: number;
  alertType?: 'DEAD_STOCK' | 'EXPIRY_SOON' | 'ALL';
  sortBy?: 'DaysStored' | 'ExpiryDate' | 'Quantity' | 'Skucode';
  sortOrder?: 'ASC' | 'DESC';
  pageNumber?: number;
  pageSize?: number;
};

export type DeadStockPagedResult = {
  items: DeadStockItem[];
  totalCount: number;
  pageNumber: number;
  pageSize: number;
  totalPages: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
};

// API Functions
export const getDeadStock = async (filter?: Partial<DeadStockFilter>): Promise<DeadStockPagedResult> => {
  const params = new URLSearchParams();
  if (filter) {
    Object.entries(filter).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        params.append(key, String(value));
      }
    });
  }
  const response = await api.get<DeadStockPagedResult>(`/inventoryreports/deadstock?${params.toString()}`);
  return response.data;
};

export const getExpiryStock = async (filter?: Partial<DeadStockFilter>): Promise<DeadStockPagedResult> => {
  const params = new URLSearchParams();
  if (filter) {
    Object.entries(filter).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        params.append(key, String(value));
      }
    });
  }
  const response = await api.get<DeadStockPagedResult>(`/inventoryreports/expirystock?${params.toString()}`);
  return response.data;
};

export const getAllDeadAndExpiryStock = async (filter?: Partial<DeadStockFilter>): Promise<DeadStockPagedResult> => {
  const params = new URLSearchParams();
  if (filter) {
    Object.entries(filter).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        params.append(key, String(value));
      }
    });
  }
  const response = await api.get<DeadStockPagedResult>(`/inventoryreports/all?${params.toString()}`);
  return response.data;
};

export const getDeadStockSummary = async (): Promise<DeadStockSummary> => {
  const response = await api.get<DeadStockSummary>('/inventoryreports/summary');
  return response.data;
};

export const scanDeadStock = async (force = false): Promise<{ alertsCreated: number; message: string }> => {
  const response = await api.post<{ alertsCreated: number; message: string }>(`/inventoryreports/scan?force=${force}`);
  return response.data;
};
