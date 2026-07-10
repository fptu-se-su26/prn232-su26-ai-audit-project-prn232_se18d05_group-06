import { create } from 'zustand';
import { VehicleStatusSummary, VehicleStatusItem } from '../types/vehicleDashboard';
import { format } from 'date-fns';

export type FilterMode = 'all' | 'day' | 'month';

interface VehicleDashboardState {
  filterMode: FilterMode;
  selectedDate: string;
  selectedMonth: string;
  selectedStatus: string | null;
  summary: VehicleStatusSummary | null;
  vehicleList: VehicleStatusItem[];

  setFilterMode: (mode: FilterMode) => void;
  setSelectedDate: (date: string) => void;
  setSelectedMonth: (month: string) => void;
  setSelectedStatus: (status: string | null) => void;
  setSummary: (summary: VehicleStatusSummary | null) => void;
  setVehicleList: (list: VehicleStatusItem[]) => void;
  reset: () => void;
}

const initialState = {
  filterMode: 'day' as FilterMode,
  selectedDate: format(new Date(), 'yyyy-MM-dd'),
  selectedMonth: format(new Date(), 'yyyy-MM'),
  selectedStatus: null,
  summary: null,
  vehicleList: [],
};

export const useVehicleDashboardStore = create<VehicleDashboardState>((set) => ({
  ...initialState,

  setFilterMode: (filterMode) => set({ filterMode }),
  setSelectedDate: (date) => set({ selectedDate: date }),
  setSelectedMonth: (month) => set({ selectedMonth: month }),
  setSelectedStatus: (status) => set({ selectedStatus: status }),
  setSummary: (summary) => set({ summary }),
  setVehicleList: (vehicleList) => set({ vehicleList }),
  reset: () => set(initialState),
}));
