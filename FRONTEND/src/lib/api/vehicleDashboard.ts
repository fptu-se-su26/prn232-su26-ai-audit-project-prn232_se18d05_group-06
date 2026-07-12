import api from '../api';
import { VehicleStatusSummary, VehicleStatusItem } from '../../types/vehicleDashboard';

export const getVehicleStatusSummary = async (
  filterMode: string,
  date?: string,
  month?: string
): Promise<VehicleStatusSummary> => {
  const params: Record<string, string> = { filterMode };
  if (filterMode === 'day' && date) params.date = date;
  if (filterMode === 'month' && month) params.month = month;

  const response = await api.get<VehicleStatusSummary>('/dashboard/vehicle-status-summary', { params });
  return response.data;
};

export const getVehicleStatusList = async (
  filterMode: string,
  date?: string,
  month?: string,
  status?: string
): Promise<VehicleStatusItem[]> => {
  const params: Record<string, string> = { filterMode };
  if (filterMode === 'day' && date) params.date = date;
  if (filterMode === 'month' && month) params.month = month;
  if (status) params.status = status;

  const response = await api.get<VehicleStatusItem[]>('/dashboard/vehicle-status-list', { params });
  return response.data;
};

export const updateVehicleStatus = async (
  bookingId: number,
  status: string,
  dockCode?: string
): Promise<{ message: string }> => {
  const response = await api.put<{ message: string }>(`/dashboard/vehicle-status/${bookingId}`, { status, dockCode });
  return response.data;
};

export interface DockInfo {
  dockId: number;
  dockCode: string;
  dockName: string | null;
}

export const getDocksByWarehouse = async (warehouseId: number): Promise<DockInfo[]> => {
  const response = await api.get<DockInfo[]>('/dashboard/docks', { params: { warehouseId } });
  return response.data;
};
