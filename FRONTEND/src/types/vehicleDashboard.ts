export interface VehicleStatusSummary {
  scheduled: number;
  waiting: number;
  unloading: number;
  loading: number;
  completed: number;
  departed: number;
  total: number;
}

export interface VehicleStatusItem {
  bookingId: number;
  bookingCode: string;
  truckPlate: string | null;
  trailerPlate: string | null;
  driverName: string | null;
  customerName: string | null;
  status: string | null;
  checkInAt: string | null;
  checkOutAt: string | null;
  dockCode: string | null;
  dockName: string | null;
  bookingType: string;
  scheduledDate: string;
  scheduledStart: string;
  scheduledEnd: string;
  warehouseId: number;
}
