import api from './api';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface DashboardKpi {
  totalActiveVehicles: number;
  maintenanceAlerts: number;
  expiringInspections: number;
  fuelEfficiency: number;
}

export interface DashboardVehicle {
  vehicleId: number;
  truckPlate: string;
  vehicleType?: string;
  status: string;
  inspectionExpiry?: string;
  nextServiceDate?: string;
  isBlacklisted: boolean;
  driverName?: string;
}

export interface DashboardDriver {
  driverId: number;
  driverCode: string;
  fullName: string;
  phone?: string;
  licenseNo?: string;
  licenseExpiry?: string;
  isActive: boolean;
  isBlacklisted: boolean;
}

export interface DashboardData {
  kpi: DashboardKpi;
  priorityVehicles: DashboardVehicle[];
  drivers: DashboardDriver[];
}

export interface MaintenanceScheduleItem {
  id: number;
  vehicleId: number;
  type: string;
  dueDate: string;
  status: string;
  notes?: string;
}

export interface InspectionRecordItem {
  id: number;
  vehicleId: number;
  inspectionDate: string;
  expiryDate: string;
  result: string;
  inspectorName: string;
  notes?: string;
  documentUrl?: string;
}

export interface MaintenanceAnalyticsData {
  monthlyCosts: { month: string; costs: number }[];
  breakdown: { name: string; value: number }[];
}

// ─── API Functions ────────────────────────────────────────────────────────────

/** Get all vehicles */
export const getVehicles = async (): Promise<DashboardVehicle[]> => {
  const response = await api.get('/vehicles');
  return response.data;
};

/** Get aggregated dashboard data (KPIs, priority vehicles, drivers) */
export const getDashboardData = async (): Promise<DashboardData> => {
  const response = await api.get('/vehicles/dashboard');
  return response.data;
};

/** Get maintenance schedules for a specific vehicle */
export const getMaintenanceSchedules = async (vehicleId: string | number): Promise<MaintenanceScheduleItem[]> => {
  const response = await api.get(`/maintenance/vehicle/${vehicleId}/schedules`);
  return response.data;
};

/** Get inspection records for a specific vehicle */
export const getInspectionRecords = async (vehicleId: string | number): Promise<InspectionRecordItem[]> => {
  const response = await api.get(`/maintenance/vehicle/${vehicleId}/inspections`);
  return response.data;
};

/** Get maintenance analytics data */
export const getMaintenanceAnalytics = async (): Promise<MaintenanceAnalyticsData> => {
  const response = await api.get('/maintenance/analytics');
  return response.data;
};

/** Create a new maintenance schedule */
export const createMaintenanceSchedule = async (data: {
  vehicleId: number;
  type: string;
  dueDate: string;
  notes?: string;
}) => {
  const response = await api.post('/maintenance/schedules', data);
  return response.data;
};

/** Create a new inspection record (with optional file upload) */
export const createInspectionRecord = async (formData: FormData) => {
  const response = await api.post('/maintenance/inspections', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return response.data;
};

/** Update a maintenance schedule */
export const updateMaintenanceSchedule = async (id: number, data: {
  status?: string;
  notes?: string;
  dueDate?: string;
}) => {
  const response = await api.put(`/maintenance/schedules/${id}`, data);
  return response.data;
};

/** Delete a maintenance schedule */
export const deleteMaintenanceSchedule = async (id: number) => {
  const response = await api.delete(`/maintenance/schedules/${id}`);
  return response.data;
};
