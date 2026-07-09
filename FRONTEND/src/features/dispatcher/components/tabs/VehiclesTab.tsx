import React, { useEffect, useMemo, useState } from 'react';
import api from '@/lib/api';

type VehicleStatus = 'ACTIVE' | 'PENDING_APPROVAL' | 'BLACKLISTED' | 'INACTIVE' | 'MAINTENANCE';
type FilterStatus = 'ALL' | VehicleStatus;

interface DispatcherVehicle {
  vehicleId: number;
  truckPlate: string;
  trailerPlate?: string | null;
  vehicleType: string;
  maxWeightTon: number;
  ownerName: string;
  ownerPhone?: string | null;
  isInternal: boolean;
  defaultDriverId?: number | null;
  defaultDriverName?: string | null;
  defaultDriverCode?: string | null;
  inspectionExpiry?: string | null;
  nextServiceDate?: string | null;
  gpsDeviceId?: string | null;
  isBlacklisted: boolean;
  blacklistReason?: string | null;
  status: VehicleStatus | string;
  isActive: boolean;
  createdAt?: string | null;
}

interface Driver {
  driverId: number;
  driverCode: string;
  fullName: string;
  phone?: string | null;
  licenseNo: string;
  licenseExpiry?: string | null;
  isBlacklisted: boolean;
  isActive: boolean;
}

interface VehicleFormState {
  truckPlate: string;
  trailerPlate: string;
  vehicleType: string;
  maxWeightTon: string;
  ownerName: string;
  ownerPhone: string;
  isInternal: boolean;
  defaultDriverId: string;
  inspectionExpiry: string;
  nextServiceDate: string;
  gpsDeviceId: string;
  status: VehicleStatus;
}

interface VehiclesTabProps {
  searchQuery: string;
  setToastMessage: (msg: string | null) => void;
  setActiveTab: (tab: string) => void;
}

const emptyForm: VehicleFormState = {
  truckPlate: '',
  trailerPlate: '',
  vehicleType: 'CONTAINER_40',
  maxWeightTon: '30',
  ownerName: '',
  ownerPhone: '',
  isInternal: false,
  defaultDriverId: '',
  inspectionExpiry: '',
  nextServiceDate: '',
  gpsDeviceId: '',
  status: 'ACTIVE',
};

const statusOptions: VehicleStatus[] = ['ACTIVE', 'PENDING_APPROVAL', 'MAINTENANCE', 'INACTIVE'];
const vehicleTypes = ['CONTAINER_20', 'CONTAINER_40', 'TRUCK_5T', 'TRUCK_10T', 'REEFER', 'VAN', 'OTHER'];

const statusLabels: Record<string, string> = {
  ACTIVE: 'Hoạt động',
  AVAILABLE: 'Hoạt động',
  PENDING_APPROVAL: 'Chờ duyệt',
  BLACKLISTED: 'Hạn chế',
  INACTIVE: 'Vô hiệu hóa',
  MAINTENANCE: 'Bảo trì',
};

const formatDate = (value?: string | null) => {
  if (!value) return 'Chưa có';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value.slice(0, 10);
  return date.toLocaleDateString('vi-VN');
};

const toDateInput = (value?: string | null) => value?.slice(0, 10) ?? '';

const isExpiringSoon = (value?: string | null) => {
  if (!value) return false;
  const expiry = new Date(value);
  if (Number.isNaN(expiry.getTime())) return false;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const threshold = new Date(today);
  threshold.setDate(today.getDate() + 30);
  return expiry >= today && expiry <= threshold;
};

const isExpired = (value?: string | null) => {
  if (!value) return false;
  const expiry = new Date(value);
  if (Number.isNaN(expiry.getTime())) return false;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return expiry < today;
};

const isMaintenanceDueSoon = (value?: string | null) => isExpiringSoon(value);

const isDriverEligible = (driver: Driver) => {
  if (!driver.isActive || driver.isBlacklisted) return false;
  if (!driver.licenseExpiry) return true;
  const expiry = new Date(driver.licenseExpiry);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return expiry >= today;
};

const getErrorMessage = (error: unknown) => {
  if (typeof error === 'object' && error !== null && 'response' in error) {
    const response = (error as { response?: { data?: unknown } }).response;
    const data = response?.data;
    if (typeof data === 'string') return data;
    if (typeof data === 'object' && data !== null && 'message' in data) {
      return String((data as { message?: unknown }).message);
    }
  }

  if (error instanceof Error) return error.message;
  return 'Không thể xử lý yêu cầu.';
};

export const VehiclesTab: React.FC<VehiclesTabProps> = ({
  searchQuery,
  setToastMessage,
  setActiveTab,
}) => {
  const [vehicles, setVehicles] = useState<DispatcherVehicle[]>([]);
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [selectedVehicleId, setSelectedVehicleId] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [statusFilter, setStatusFilter] = useState<FilterStatus>('ALL');
  const [typeFilter, setTypeFilter] = useState('ALL');
  const [ownershipFilter, setOwnershipFilter] = useState<'ALL' | 'INTERNAL' | 'PARTNER'>('ALL');
  const [riskFilter, setRiskFilter] = useState<'ALL' | 'EXPIRING' | 'MAINTENANCE_DUE' | 'BLACKLISTED'>('ALL');
  const [showForm, setShowForm] = useState(false);
  const [editingVehicle, setEditingVehicle] = useState<DispatcherVehicle | null>(null);
  const [form, setForm] = useState<VehicleFormState>(emptyForm);
  const [assignDriverId, setAssignDriverId] = useState('');
  const [blacklistReason, setBlacklistReason] = useState('');

  const eligibleDrivers = useMemo(() => drivers.filter(isDriverEligible), [drivers]);
  const selectedVehicle = vehicles.find((vehicle) => vehicle.vehicleId === selectedVehicleId) ?? vehicles[0];

  const loadData = async () => {
    setLoading(true);
    try {
      const params: Record<string, string | boolean> = {};
      if (statusFilter !== 'ALL') params.status = statusFilter;
      if (typeFilter !== 'ALL') params.vehicleType = typeFilter;
      if (ownershipFilter !== 'ALL') params.isInternal = ownershipFilter === 'INTERNAL';
      if (riskFilter === 'EXPIRING') params.expiringSoon = true;
      if (riskFilter === 'BLACKLISTED') params.blacklisted = true;
      if (searchQuery.trim()) params.search = searchQuery.trim();

      const [vehicleResponse, driverResponse] = await Promise.all([
        api.get<DispatcherVehicle[]>('/dispatcher/vehicles', { params }),
        api.get<Driver[]>('/drivers'),
      ]);

      setVehicles(vehicleResponse.data);
      setDrivers(driverResponse.data);
      setSelectedVehicleId((current) => {
        if (current && vehicleResponse.data.some((vehicle) => vehicle.vehicleId === current)) return current;
        return vehicleResponse.data[0]?.vehicleId ?? null;
      });
    } catch (error) {
      setToastMessage(`Lỗi tải dữ liệu xe: ${getErrorMessage(error)}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [searchQuery, statusFilter, typeFilter, ownershipFilter, riskFilter]);

  useEffect(() => {
    setAssignDriverId(selectedVehicle?.defaultDriverId ? String(selectedVehicle.defaultDriverId) : '');
  }, [selectedVehicle?.vehicleId, selectedVehicle?.defaultDriverId]);

  const openCreateForm = () => {
    setEditingVehicle(null);
    setForm(emptyForm);
    setShowForm(true);
  };

  const openEditForm = (vehicle: DispatcherVehicle) => {
    setEditingVehicle(vehicle);
    setForm({
      truckPlate: vehicle.truckPlate,
      trailerPlate: vehicle.trailerPlate ?? '',
      vehicleType: vehicle.vehicleType || 'OTHER',
      maxWeightTon: String(vehicle.maxWeightTon || ''),
      ownerName: vehicle.ownerName,
      ownerPhone: vehicle.ownerPhone ?? '',
      isInternal: vehicle.isInternal,
      defaultDriverId: vehicle.defaultDriverId ? String(vehicle.defaultDriverId) : '',
      inspectionExpiry: toDateInput(vehicle.inspectionExpiry),
      nextServiceDate: toDateInput(vehicle.nextServiceDate),
      gpsDeviceId: vehicle.gpsDeviceId ?? '',
      status: vehicle.status === 'BLACKLISTED' ? 'ACTIVE' : (vehicle.status as VehicleStatus),
    });
    setShowForm(true);
  };

  const updateForm = (field: keyof VehicleFormState, value: string | boolean) => {
    setForm((current) => ({ ...current, [field]: value }));
  };

  const submitForm = async () => {
    if (!form.truckPlate.trim() || !form.vehicleType.trim() || !form.ownerName.trim()) {
      setToastMessage('Biển số xe, loại xe và chủ xe là bắt buộc.');
      return;
    }

    const maxWeightTon = Number(form.maxWeightTon);
    if (!Number.isFinite(maxWeightTon) || maxWeightTon <= 0) {
      setToastMessage('Tải trọng tối đa phải lớn hơn 0.');
      return;
    }

    const payload = {
      truckPlate: form.truckPlate.trim(),
      trailerPlate: form.trailerPlate.trim() || null,
      vehicleType: form.vehicleType,
      maxWeightTon,
      ownerName: form.ownerName.trim(),
      ownerPhone: form.ownerPhone.trim() || null,
      isInternal: form.isInternal,
      defaultDriverId: form.defaultDriverId ? Number(form.defaultDriverId) : null,
      inspectionExpiry: form.inspectionExpiry || null,
      nextServiceDate: form.nextServiceDate || null,
      gpsDeviceId: form.gpsDeviceId.trim() || null,
      status: form.status,
    };

    setSaving(true);
    try {
      if (editingVehicle) {
        await api.put(`/dispatcher/vehicles/${editingVehicle.vehicleId}`, payload);
        setToastMessage('Đã cập nhật hồ sơ xe.');
      } else {
        await api.post('/dispatcher/vehicles', payload);
        setToastMessage('Tạo hồ sơ xe thành công.');
      }
      setShowForm(false);
      await loadData();
    } catch (error) {
      setToastMessage(`Không lưu được xe: ${getErrorMessage(error)}`);
    } finally {
      setSaving(false);
    }
  };

  const deactivateVehicle = async (vehicle: DispatcherVehicle) => {
    if (!window.confirm(`Vô hiệu hóa xe ${vehicle.truckPlate}?`)) return;
    try {
      await api.patch(`/dispatcher/vehicles/${vehicle.vehicleId}/deactivate`);
      setToastMessage('Xe đã được vô hiệu hóa.');
      await loadData();
    } catch (error) {
      setToastMessage(`Không thể vô hiệu hóa xe: ${getErrorMessage(error)}`);
    }
  };

  const blacklistVehicle = async (vehicle: DispatcherVehicle) => {
    const reason = blacklistReason.trim();
    if (!reason) {
      setToastMessage('Vui lòng nhập lý do blacklist.');
      return;
    }

    try {
      await api.patch(`/dispatcher/vehicles/${vehicle.vehicleId}/blacklist`, { reason });
      setBlacklistReason('');
      setToastMessage('Xe đã được đưa vào danh sách hạn chế.');
      await loadData();
    } catch (error) {
      setToastMessage(`Không thể blacklist xe: ${getErrorMessage(error)}`);
    }
  };

  const assignDriver = async (vehicle: DispatcherVehicle) => {
    if (!assignDriverId) {
      setToastMessage('Vui lòng chọn tài xế phụ trách.');
      return;
    }

    try {
      await api.patch(`/dispatcher/vehicles/${vehicle.vehicleId}/assign-driver`, {
        driverId: Number(assignDriverId),
      });
      setToastMessage('Gán tài xế phụ trách thành công.');
      await loadData();
    } catch (error) {
      setToastMessage(`Không thể gán tài xế: ${getErrorMessage(error)}`);
    }
  };

  const visibleVehicles = vehicles.filter((vehicle) => {
    const keyword = searchQuery.trim().toLowerCase();
    const matchesKeyword = !keyword || [
      vehicle.truckPlate,
      vehicle.trailerPlate,
      vehicle.vehicleType,
      vehicle.ownerName,
      vehicle.defaultDriverName,
      vehicle.defaultDriverCode,
    ].some((value) => (value ?? '').toLowerCase().includes(keyword));

    if (!matchesKeyword) return false;
    if (riskFilter === 'MAINTENANCE_DUE') return isMaintenanceDueSoon(vehicle.nextServiceDate);
    return true;
  });

  const activeCount = vehicles.filter((vehicle) => vehicle.isActive).length;
  const blacklistCount = vehicles.filter((vehicle) => vehicle.isBlacklisted).length;
  const expiredInspectionCount = vehicles.filter((vehicle) => isExpired(vehicle.inspectionExpiry)).length;
  const expiringCount = vehicles.filter((vehicle) => isExpiringSoon(vehicle.inspectionExpiry)).length;
  const maintenanceDueCount = vehicles.filter((vehicle) => isMaintenanceDueSoon(vehicle.nextServiceDate)).length;
  const internalCount = vehicles.filter((vehicle) => vehicle.isInternal).length;

  return (
    <div className="fleet-workspace flex h-full min-h-0 flex-1 flex-col gap-4 overflow-y-auto pb-6 pr-1">
      <section className="fleet-hero relative shrink-0 overflow-hidden rounded-lg px-5 py-4">
        <div className="fleet-hero-stripe absolute inset-x-0 top-0 h-1" />
        <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2 text-xs font-bold uppercase text-[#0f6b7d]">
              <span className="grid h-9 w-9 place-items-center rounded-md bg-[#0f3554] text-white shadow-sm">
                <span className="material-symbols-outlined text-[18px]">local_shipping</span>
              </span>
              Điều phối • Quản lý phương tiện
            </div>
            <h2 className="mt-2 text-2xl font-black tracking-tight text-slate-950">
              Hồ sơ xe
            </h2>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={loadData}
              className="fleet-icon-button grid h-10 w-10 place-items-center rounded-md transition-colors"
              title="Tải lại"
            >
              <span className={`material-symbols-outlined text-[20px] ${loading ? 'animate-spin' : ''}`}>refresh</span>
            </button>
            <button
              type="button"
              onClick={openCreateForm}
              className="flex h-10 items-center gap-2 rounded-md bg-[#0f3554] px-4 text-sm font-bold text-white shadow-[0_10px_22px_rgba(15,53,84,0.22)] transition-colors hover:bg-[#0f4a6d]"
            >
              <span className="material-symbols-outlined text-[18px]">add</span>
              Thêm xe mới
            </button>
          </div>
        </div>
      </section>

      {(expiredInspectionCount > 0 || maintenanceDueCount > 0) && (
        <section className="fleet-alert-strip shrink-0 rounded-lg px-4 py-3 text-white">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-center gap-3">
              <span className="grid h-10 w-10 shrink-0 place-items-center rounded-md bg-white/14">
                <span className="material-symbols-outlined text-[21px]">priority_high</span>
              </span>
              <div className="min-w-0">
                <p className="text-sm font-black">Cảnh báo vận hành đội xe</p>
                <p className="text-xs font-semibold text-white/75">
                  Ưu tiên xử lý đăng kiểm hết hạn và xe sắp đến hạn bảo trì trước khi điều phối.
                </p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs font-black sm:min-w-[300px]">
              <button
                type="button"
                onClick={() => setRiskFilter('EXPIRING')}
                className="rounded-md border border-white/18 bg-white/12 px-3 py-2 text-left transition-colors hover:bg-white/18"
              >
                <span className="block text-lg leading-none">{expiredInspectionCount}</span>
                <span className="text-white/75">Hết đăng kiểm</span>
              </button>
              <button
                type="button"
                onClick={() => setRiskFilter('MAINTENANCE_DUE')}
                className="rounded-md border border-white/18 bg-white/12 px-3 py-2 text-left transition-colors hover:bg-white/18"
              >
                <span className="block text-lg leading-none">{maintenanceDueCount}</span>
                <span className="text-white/75">Sắp bảo trì</span>
              </button>
            </div>
          </div>
        </section>
      )}

      <section className="grid shrink-0 grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-5">
        <SummaryTile icon="inventory_2" label="Tổng hồ sơ" value={vehicles.length} detail={`${internalCount} xe nội bộ`} tone="primary" />
        <SummaryTile icon="verified" label="Được phép vận hành" value={activeCount} detail="ACTIVE và không blacklist" tone="success" />
        <SummaryTile icon="fact_check" label="Sắp hết đăng kiểm" value={expiringCount} detail="Trong vòng 30 ngày" tone="warning" />
        <SummaryTile icon="block" label="Blacklist" value={blacklistCount} detail="Từ chối đặt lịch/check-in" tone="danger" />
        <SummaryTile icon="build_circle" label="Sắp bảo trì" value={maintenanceDueCount} detail="Cảnh báo Dispatcher trong 30 ngày" tone="danger" />
      </section>

      <section className="fleet-panel-muted shrink-0 rounded-lg p-3">
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-[repeat(4,minmax(150px,1fr))]">
          <FilterSelect label="Trạng thái" value={statusFilter} onChange={(value) => {
            if (value === 'MAINTENANCE_DUE') {
              setStatusFilter('ALL');
              setRiskFilter('MAINTENANCE_DUE');
              return;
            }
            setStatusFilter(value as FilterStatus);
          }}>
            <option value="ALL">Tất cả trạng thái</option>
            <option value="ACTIVE">Hoạt động</option>
            <option value="PENDING_APPROVAL">Chờ duyệt</option>
            <option value="MAINTENANCE">Bảo trì</option>
            <option value="INACTIVE">Vô hiệu hóa</option>
            <option value="BLACKLISTED">Blacklist</option>
          </FilterSelect>

          <FilterSelect label="Loại xe" value={typeFilter} onChange={setTypeFilter}>
            <option value="ALL">Tất cả loại xe</option>
            {vehicleTypes.map((type) => (
              <option key={type} value={type}>{type}</option>
            ))}
          </FilterSelect>

          <FilterSelect label="Sở hữu" value={ownershipFilter} onChange={(value) => setOwnershipFilter(value as typeof ownershipFilter)}>
            <option value="ALL">Tất cả</option>
            <option value="INTERNAL">Xe nội bộ</option>
            <option value="PARTNER">Xe đối tác</option>
          </FilterSelect>

          <FilterSelect label="Rủi ro" value={riskFilter} onChange={(value) => setRiskFilter(value as typeof riskFilter)}>
            <option value="ALL">Tất cả</option>
            <option value="EXPIRING">Sắp hết đăng kiểm</option>
            <option value="MAINTENANCE_DUE">Sắp bảo trì</option>
            <option value="BLACKLISTED">Blacklist</option>
          </FilterSelect>
        </div>
      </section>

      <div className="grid min-h-[640px] shrink-0 grid-cols-1 gap-4 overflow-visible xl:grid-cols-[minmax(0,1fr)_400px]">
        <section className="fleet-panel flex min-h-0 flex-col overflow-hidden rounded-lg">
          <div className="flex h-14 shrink-0 items-center justify-between border-b border-slate-200 px-4">
            <div>
              <h3 className="text-sm font-black text-slate-900">Danh sách phương tiện</h3>
              <p className="text-xs font-semibold text-slate-500">{visibleVehicles.length} bản ghi</p>
            </div>
            <span className="rounded-md border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs font-bold text-slate-600">
              {loading ? 'Đang tải' : 'Đã đồng bộ'}
            </span>
          </div>

          <div className="min-h-0 flex-1 overflow-auto pb-24">
            <table className="w-full min-w-[1040px] border-collapse text-left">
              <thead className="fleet-table-header sticky top-0 z-10">
                <tr className="border-b border-slate-200 text-[11px] font-black uppercase text-slate-500">
                  <th className="px-4 py-3">Biển số</th>
                  <th className="px-4 py-3">Rơ-moóc</th>
                  <th className="px-4 py-3">Loại xe</th>
                  <th className="px-4 py-3">Tải trọng</th>
                  <th className="px-4 py-3">Tài xế</th>
                  <th className="px-4 py-3">Chủ xe</th>
                  <th className="px-4 py-3">Đăng kiểm</th>
                  <th className="px-4 py-3">Trạng thái</th>
                  <th className="px-4 py-3 text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {loading ? (
                  <EmptyRow icon="hourglass_empty" text="Đang tải danh sách xe..." />
                ) : visibleVehicles.length === 0 ? (
                  <EmptyRow icon="inbox" text="Không có xe nào khớp với bộ lọc hiện tại." />
                ) : (
                  visibleVehicles.map((vehicle) => (
                    <tr
                      key={vehicle.vehicleId}
                      onClick={() => setSelectedVehicleId(vehicle.vehicleId)}
                      className={`fleet-table-row cursor-pointer ${
                        isExpired(vehicle.inspectionExpiry)
                          ? 'fleet-table-row-risk'
                          : isMaintenanceDueSoon(vehicle.nextServiceDate) || isExpiringSoon(vehicle.inspectionExpiry)
                            ? 'fleet-table-row-warning'
                            : ''
                      } ${selectedVehicle?.vehicleId === vehicle.vehicleId ? 'fleet-table-row-active' : ''}`}
                    >
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <span className="grid h-9 w-9 place-items-center rounded-md bg-[#0f3554] text-white">
                            <span className="material-symbols-outlined text-[18px]">local_shipping</span>
                          </span>
                          <div>
                            <p className="font-black text-slate-950">{vehicle.truckPlate}</p>
                            <p className="text-[11px] font-semibold text-slate-500">{vehicle.isInternal ? 'Nội bộ' : 'Đối tác'}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 font-semibold text-slate-700">{vehicle.trailerPlate || '-'}</td>
                      <td className="px-4 py-3">
                        <span className="rounded-md bg-slate-100 px-2.5 py-1 text-xs font-bold text-slate-700">
                          {vehicle.vehicleType || 'OTHER'}
                        </span>
                      </td>
                      <td className="px-4 py-3 font-data-tabular font-bold text-slate-800">{vehicle.maxWeightTon} t</td>
                      <td className="px-4 py-3">
                        {vehicle.defaultDriverName ? (
                          <div>
                            <p className="font-bold text-slate-900">{vehicle.defaultDriverName}</p>
                            <p className="text-[11px] font-semibold text-slate-500">{vehicle.defaultDriverCode}</p>
                          </div>
                        ) : (
                          <span className="font-semibold text-slate-400">Chưa gán</span>
                        )}
                      </td>
                      <td className="px-4 py-3 font-semibold text-slate-700">{vehicle.ownerName}</td>
                      <td className="px-4 py-3">
                        <span className={isExpired(vehicle.inspectionExpiry) ? 'font-black text-red-700' : isExpiringSoon(vehicle.inspectionExpiry) ? 'font-black text-amber-700' : 'font-semibold text-slate-500'}>
                          {formatDate(vehicle.inspectionExpiry)}
                        </span>
                        {isMaintenanceDueSoon(vehicle.nextServiceDate) && (
                          <span className="mt-1 block text-[11px] font-black text-red-700">
                            Sắp bảo trì: {formatDate(vehicle.nextServiceDate)}
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <StatusBadge status={vehicle.status} blacklisted={vehicle.isBlacklisted} />
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex justify-end gap-1">
                          <IconButton title="Sửa xe" icon="edit" onClick={(event) => {
                            event.stopPropagation();
                            openEditForm(vehicle);
                          }} />
                          <IconButton title="Vô hiệu hóa" icon="pause_circle" onClick={(event) => {
                            event.stopPropagation();
                            deactivateVehicle(vehicle);
                          }} />
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>

        <aside className="fleet-panel min-h-0 overflow-hidden rounded-lg">
          {selectedVehicle ? (
            <div className="flex h-full flex-col">
              <div className="border-b border-slate-200 bg-[#f8fbfd] px-4 py-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <StatusBadge status={selectedVehicle.status} blacklisted={selectedVehicle.isBlacklisted} />
                    <h2 className="mt-3 truncate text-2xl font-black text-slate-950">{selectedVehicle.truckPlate}</h2>
                    <p className="text-sm font-bold text-slate-500">
                      {selectedVehicle.vehicleType} • {selectedVehicle.isInternal ? 'Xe nội bộ' : 'Xe đối tác'}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => openEditForm(selectedVehicle)}
                    className="fleet-icon-button grid h-10 w-10 place-items-center rounded-md transition-colors"
                    title="Sửa hồ sơ"
                  >
                    <span className="material-symbols-outlined text-[18px]">edit</span>
                  </button>
                </div>
              </div>

              <div className="min-h-0 flex-1 space-y-5 overflow-y-auto p-4">
                <div className={`fleet-detail-banner rounded-lg p-3 ${
                  isExpired(selectedVehicle.inspectionExpiry)
                    ? 'border-red-200 bg-red-50'
                    : isMaintenanceDueSoon(selectedVehicle.nextServiceDate) || isExpiringSoon(selectedVehicle.inspectionExpiry)
                      ? 'border-amber-200 bg-amber-50'
                      : ''
                }`}>
                  <div className="flex items-start gap-3">
                    <span className={`grid h-10 w-10 shrink-0 place-items-center rounded-md ${
                      isExpired(selectedVehicle.inspectionExpiry)
                        ? 'bg-red-100 text-red-700'
                        : isMaintenanceDueSoon(selectedVehicle.nextServiceDate) || isExpiringSoon(selectedVehicle.inspectionExpiry)
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-emerald-100 text-emerald-700'
                    }`}>
                      <span className="material-symbols-outlined text-[21px]">
                        {isExpired(selectedVehicle.inspectionExpiry) ? 'block' : isMaintenanceDueSoon(selectedVehicle.nextServiceDate) ? 'build_circle' : 'verified'}
                      </span>
                    </span>
                    <div className="min-w-0">
                      <p className="text-sm font-black text-slate-950">
                        {isExpired(selectedVehicle.inspectionExpiry)
                          ? 'Không đủ điều kiện đặt lịch/check-in'
                          : isMaintenanceDueSoon(selectedVehicle.nextServiceDate)
                            ? 'Cần lên kế hoạch bảo trì'
                            : 'Đủ điều kiện vận hành'}
                      </p>
                      <p className="mt-0.5 text-xs font-semibold text-slate-600">
                        {isExpired(selectedVehicle.inspectionExpiry)
                          ? 'Xe đã hết hạn đăng kiểm nên hệ thống sẽ chặn đặt lịch và AI Camera check-in.'
                          : isMaintenanceDueSoon(selectedVehicle.nextServiceDate)
                            ? `Ngày bảo trì tiếp theo: ${formatDate(selectedVehicle.nextServiceDate)}.`
                            : 'Không có cảnh báo đăng kiểm hoặc bảo trì trong 30 ngày tới.'}
                      </p>
                    </div>
                  </div>
                </div>
                <DetailSection title="Thông tin phương tiện" icon="local_shipping">
                  <DetailRow label="Biển số rơ-moóc" value={selectedVehicle.trailerPlate || '-'} />
                  <DetailRow label="Tải trọng tối đa" value={`${selectedVehicle.maxWeightTon} tấn`} />
                  <DetailRow label="Chủ xe" value={selectedVehicle.ownerName || '-'} />
                  <DetailRow label="Điện thoại chủ xe" value={selectedVehicle.ownerPhone || '-'} />
                  <DetailRow label="Thiết bị GPS" value={selectedVehicle.gpsDeviceId || '-'} />
                </DetailSection>

                <DetailSection title="Kiểm định và bảo trì" icon="fact_check">
                  <DetailRow label="Hạn đăng kiểm" value={formatDate(selectedVehicle.inspectionExpiry)} warning={isExpired(selectedVehicle.inspectionExpiry) || isExpiringSoon(selectedVehicle.inspectionExpiry)} />
                  <DetailRow label="Bảo trì tiếp theo" value={formatDate(selectedVehicle.nextServiceDate)} warning={isMaintenanceDueSoon(selectedVehicle.nextServiceDate)} />
                  <DetailRow label="Có thể đặt lịch" value={selectedVehicle.isActive && !selectedVehicle.isBlacklisted && !isExpired(selectedVehicle.inspectionExpiry) ? 'Có' : 'Không'} warning={!selectedVehicle.isActive || selectedVehicle.isBlacklisted || isExpired(selectedVehicle.inspectionExpiry)} />
                </DetailSection>

                <DetailSection title="Tài xế phụ trách" icon="badge">
                  <div className="flex gap-2">
                    <select
                      value={assignDriverId}
                      onChange={(event) => setAssignDriverId(event.target.value)}
                      className="fleet-control min-w-0 flex-1 rounded-md px-3 py-2 text-sm font-semibold outline-none"
                    >
                      <option value="">Chọn tài xế</option>
                      {eligibleDrivers.map((driver) => (
                        <option key={driver.driverId} value={driver.driverId}>
                          {driver.driverCode} - {driver.fullName}
                        </option>
                      ))}
                    </select>
                    <button
                      type="button"
                      onClick={() => assignDriver(selectedVehicle)}
                      disabled={selectedVehicle.isBlacklisted || !selectedVehicle.isActive}
                      className="grid h-10 w-10 place-items-center rounded-md bg-[#0f3554] text-white shadow-sm disabled:cursor-not-allowed disabled:opacity-40"
                      title="Gán tài xế"
                    >
                      <span className="material-symbols-outlined text-[18px]">person_add</span>
                    </button>
                  </div>
                  <p className="mt-2 text-xs font-semibold text-slate-500">
                    Hiện tại: {selectedVehicle.defaultDriverName || 'Chưa có tài xế phụ trách'}
                  </p>
                </DetailSection>

                <DetailSection title="Blacklist" icon="gavel">
                  {selectedVehicle.isBlacklisted ? (
                    <div className="rounded-md border border-red-200 bg-red-50 p-3 text-sm font-semibold text-red-700">
                      {selectedVehicle.blacklistReason || 'Xe đang nằm trong danh sách hạn chế.'}
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <textarea
                        value={blacklistReason}
                        onChange={(event) => setBlacklistReason(event.target.value)}
                        rows={3}
                        className="fleet-control w-full resize-none rounded-md px-3 py-2 text-sm font-semibold outline-none focus:ring-red-100"
                        placeholder="Nhập lý do hạn chế xe..."
                      />
                      <button
                        type="button"
                        onClick={() => blacklistVehicle(selectedVehicle)}
                        className="flex h-9 w-full items-center justify-center gap-2 rounded-md border border-red-200 bg-red-50 text-sm font-black text-red-700 hover:bg-red-100"
                      >
                        <span className="material-symbols-outlined text-[18px]">block</span>
                        Đưa vào blacklist
                      </button>
                    </div>
                  )}
                </DetailSection>
              </div>

              <div className="grid grid-cols-2 gap-2 border-t border-slate-200 p-4">
                <button
                  type="button"
                  onClick={() => setActiveTab('Vehicle Tracking')}
                  className="flex h-10 items-center justify-center gap-2 rounded-md border border-slate-300 bg-white text-sm font-black text-slate-700 shadow-sm hover:bg-slate-50"
                >
                  <span className="material-symbols-outlined text-[18px]">history_toggle_off</span>
                  Lịch sử
                </button>
                <button
                  type="button"
                  onClick={() => deactivateVehicle(selectedVehicle)}
                  className="flex h-10 items-center justify-center gap-2 rounded-md border border-amber-200 bg-amber-50 text-sm font-black text-amber-800 hover:bg-amber-100"
                >
                  <span className="material-symbols-outlined text-[18px]">pause_circle</span>
                  Vô hiệu hóa
                </button>
              </div>
            </div>
          ) : (
            <div className="grid h-full place-items-center p-8 text-center text-sm font-semibold text-slate-500">
              Chọn một xe để xem chi tiết.
            </div>
          )}
        </aside>
      </div>

      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm">
          <div className="fleet-panel flex max-h-[90vh] w-full max-w-3xl flex-col overflow-hidden rounded-lg bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-200 bg-slate-50 p-4">
              <h3 className="flex items-center gap-2 text-lg font-black text-slate-950">
                <span className="material-symbols-outlined text-[#0f6b7d]">local_shipping</span>
                {editingVehicle ? 'Cập nhật hồ sơ xe' : 'Thêm xe mới'}
              </h3>
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="grid h-9 w-9 place-items-center rounded-md text-slate-500 hover:bg-slate-100 hover:text-red-600"
                title="Đóng"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            <div className="grid min-h-0 gap-4 overflow-y-auto p-4 md:grid-cols-2">
              <Field label="Biển số xe chính" value={form.truckPlate} onChange={(value) => updateForm('truckPlate', value)} required />
              <Field label="Biển số rơ-moóc" value={form.trailerPlate} onChange={(value) => updateForm('trailerPlate', value)} />

              <SelectField label="Loại xe" value={form.vehicleType} onChange={(value) => updateForm('vehicleType', value)}>
                {vehicleTypes.map((type) => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </SelectField>

              <Field label="Tải trọng tối đa (tấn)" type="number" min="0.1" step="0.1" value={form.maxWeightTon} onChange={(value) => updateForm('maxWeightTon', value)} required />
              <Field label="Chủ xe / Đơn vị vận tải" value={form.ownerName} onChange={(value) => updateForm('ownerName', value)} required />
              <Field label="Điện thoại chủ xe" value={form.ownerPhone} onChange={(value) => updateForm('ownerPhone', value)} />

              <SelectField label="Tài xế phụ trách" value={form.defaultDriverId} onChange={(value) => updateForm('defaultDriverId', value)}>
                <option value="">Chưa gán</option>
                {eligibleDrivers.map((driver) => (
                  <option key={driver.driverId} value={driver.driverId}>
                    {driver.driverCode} - {driver.fullName}
                  </option>
                ))}
              </SelectField>

              <SelectField label="Trạng thái" value={form.status} onChange={(value) => updateForm('status', value)}>
                {statusOptions.map((status) => (
                  <option key={status} value={status}>{statusLabels[status]}</option>
                ))}
              </SelectField>

              <Field label="Hạn đăng kiểm" type="date" value={form.inspectionExpiry} onChange={(value) => updateForm('inspectionExpiry', value)} />
              <Field label="Ngày bảo trì tiếp theo" type="date" value={form.nextServiceDate} onChange={(value) => updateForm('nextServiceDate', value)} />
              <Field label="Mã thiết bị GPS" value={form.gpsDeviceId} onChange={(value) => updateForm('gpsDeviceId', value)} />

              <label className="flex min-h-[42px] items-center gap-3 rounded-md border border-slate-300 bg-white px-3 text-sm font-bold text-slate-800">
                <input
                  type="checkbox"
                  checked={form.isInternal}
                  onChange={(event) => updateForm('isInternal', event.target.checked)}
                  className="h-4 w-4 accent-[#0f6b7d]"
                />
                Xe nội bộ SmartLog
              </label>
            </div>

            <div className="flex justify-end gap-2 border-t border-slate-200 p-4">
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="h-10 rounded-md border border-slate-300 px-4 text-sm font-black text-slate-700 hover:bg-slate-50"
              >
                Hủy
              </button>
              <button
                type="button"
                onClick={submitForm}
                disabled={saving}
                className="flex h-10 items-center gap-2 rounded-md bg-[#0f3554] px-4 text-sm font-black text-white disabled:opacity-60"
              >
                <span className="material-symbols-outlined text-[18px]">{saving ? 'sync' : 'save'}</span>
                {saving ? 'Đang lưu...' : 'Lưu hồ sơ'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

interface SummaryTileProps {
  icon: string;
  label: string;
  value: number;
  detail: string;
  tone: 'primary' | 'success' | 'warning' | 'danger';
}

const SummaryTile = ({ icon, label, value, detail, tone }: SummaryTileProps) => {
  const toneClass = {
    primary: 'bg-cyan-50 text-cyan-800 border-cyan-200',
    success: 'bg-emerald-50 text-emerald-800 border-emerald-200',
    warning: 'bg-amber-50 text-amber-800 border-amber-200',
    danger: 'bg-red-50 text-red-800 border-red-200',
  }[tone];

  return (
    <div className="fleet-kpi ops-kpi rounded-lg p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs font-black uppercase text-slate-500">{label}</p>
          <p className="mt-2 font-data-tabular text-3xl font-black text-slate-950">{value}</p>
          <p className="mt-1 text-xs font-semibold text-slate-500">{detail}</p>
        </div>
        <span className={`grid h-11 w-11 shrink-0 place-items-center rounded-md border ${toneClass}`}>
          <span className="material-symbols-outlined text-[22px]">{icon}</span>
        </span>
      </div>
    </div>
  );
};

interface FilterSelectProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  children: React.ReactNode;
}

const FilterSelect = ({ label, value, onChange, children }: FilterSelectProps) => (
  <label className="flex flex-col gap-1 text-[10px] font-black uppercase text-slate-500">
    {label}
    <select
      value={value}
      onChange={(event) => onChange(event.target.value)}
      className="fleet-control h-10 rounded-md px-3 text-sm font-bold normal-case outline-none"
    >
      {children}
    </select>
  </label>
);

interface FieldProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
  required?: boolean;
  min?: string;
  step?: string;
}

const Field = ({ label, value, onChange, type = 'text', required, min, step }: FieldProps) => (
  <label className="flex flex-col gap-1.5 text-xs font-black uppercase text-slate-500">
    {label}{required ? ' *' : ''}
    <input
      type={type}
      value={value}
      min={min}
      step={step}
      onChange={(event) => onChange(event.target.value)}
      className="fleet-control rounded-md px-3 py-2 text-sm font-bold normal-case outline-none"
    />
  </label>
);

interface SelectFieldProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  children: React.ReactNode;
}

const SelectField = ({ label, value, onChange, children }: SelectFieldProps) => (
  <label className="flex flex-col gap-1.5 text-xs font-black uppercase text-slate-500">
    {label}
    <select
      value={value}
      onChange={(event) => onChange(event.target.value)}
      className="fleet-control rounded-md px-3 py-2 text-sm font-bold normal-case outline-none"
    >
      {children}
    </select>
  </label>
);

const EmptyRow = ({ icon, text }: { icon: string; text: string }) => (
  <tr>
    <td colSpan={9} className="px-4 py-12 text-center">
      <span className="material-symbols-outlined mb-2 block text-[34px] text-slate-300">{icon}</span>
      <span className="text-sm font-bold text-slate-500">{text}</span>
    </td>
  </tr>
);

interface StatusBadgeProps {
  status: string;
  blacklisted: boolean;
}

const StatusBadge = ({ status, blacklisted }: StatusBadgeProps) => {
  const effectiveStatus = blacklisted ? 'BLACKLISTED' : status;
  const className = effectiveStatus === 'ACTIVE' || effectiveStatus === 'AVAILABLE'
    ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
    : effectiveStatus === 'BLACKLISTED'
      ? 'border-red-200 bg-red-50 text-red-700'
      : effectiveStatus === 'MAINTENANCE'
        ? 'border-amber-200 bg-amber-50 text-amber-800'
        : 'border-slate-200 bg-slate-100 text-slate-600';

  return (
    <span className={`inline-flex min-h-7 items-center rounded-md border px-2.5 py-1 text-xs font-black ${className}`}>
      {statusLabels[effectiveStatus] ?? effectiveStatus}
    </span>
  );
};

interface IconButtonProps {
  title: string;
  icon: string;
  onClick: (event: React.MouseEvent<HTMLButtonElement>) => void;
}

const IconButton = ({ title, icon, onClick }: IconButtonProps) => (
  <button
    type="button"
    title={title}
    onClick={onClick}
    className="fleet-icon-button grid h-8 w-8 place-items-center rounded-md transition-colors"
  >
    <span className="material-symbols-outlined text-[18px]">{icon}</span>
  </button>
);

interface DetailSectionProps {
  title: string;
  icon: string;
  children: React.ReactNode;
}

const DetailSection = ({ title, icon, children }: DetailSectionProps) => (
  <section>
    <h4 className="mb-3 flex items-center gap-2 text-xs font-black uppercase text-slate-500">
      <span className="material-symbols-outlined text-[16px] text-[#0f6b7d]">{icon}</span>
      {title}
    </h4>
    <div className="space-y-2">{children}</div>
  </section>
);

interface DetailRowProps {
  label: string;
  value: string;
  warning?: boolean;
}

const DetailRow = ({ label, value, warning }: DetailRowProps) => (
  <div className="flex items-center justify-between gap-3 rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-sm">
    <span className="font-semibold text-slate-500">{label}</span>
    <span className={`text-right font-black ${warning ? 'text-amber-700' : 'text-slate-900'}`}>{value}</span>
  </div>
);

export default VehiclesTab;
