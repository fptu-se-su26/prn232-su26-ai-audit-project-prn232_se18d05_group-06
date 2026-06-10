import React, { useState, useEffect } from 'react';

interface VehicleUnit {
  id: string; // LicensePlate
  name: string; // Display Name
  vehicleModel: string; // VehicleModel in DB
  type: string;
  status: 'Active' | 'Alert' | 'Idle' | 'Pending';
  img: string;
  capacityPercent: number;
  capacityText: string;
  fuelPercent: number;
  maintText: string;
  maintStatus: 'ok' | 'warning' | 'alert';
  // Technical live diagnostics
  engineTemp: number;
  oilPressure: number;
  batteryVoltage: number;
  dpfLevel: number;
  lat: number;
  lon: number;
  speed: number;
  // Strict specs required by DB
  payloadKg: number;
  volumeCbm: number;
  fuelConsumptionRate: number;
  registrationExpiry: string;
  insuranceExpiry: string;
}

const INITIAL_VEHICLES: VehicleUnit[] = [
  {
    id: 'TRK-8492',
    name: 'Volvo FH16',
    vehicleModel: 'Volvo FH16',
    type: 'Xe vận tải hạng nặng',
    status: 'Active',
    img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAhRsM2TlznkPIuzMGNeTy4rkLREL28LX2vZ4mvSjn6ET-OXDdaEyiy1EhAfnZFKbUJ8sgxyc6sjsCoqlVz8Cz-9Hb267kLaNfmDX6ryhyTEQ2E852MZWO3pKwxyhtVnera6HulDcZnKnD9Q44OT_dEmmrvchLnOA3nEjFMdfqfQBIz-Fs4qzmyOiKiExkIUTTytRjVfIIUT6MuA6i74dOQzqsb8NB3aGbOFfCm4LNs3PYKUIrVEdmzQODjR6ysYTSUW4D6cr0vqDr5',
    capacityPercent: 85,
    capacityText: '85% (20.4 tấn)',
    fuelPercent: 60,
    maintText: 'Bảo trì: TỐT',
    maintStatus: 'ok',
    engineTemp: 195,
    oilPressure: 42,
    batteryVoltage: 13.8,
    dpfLevel: 24,
    lat: 41.8781,
    lon: -87.6298,
    speed: 62,
    payloadKg: 24000,
    volumeCbm: 80,
    fuelConsumptionRate: 32.5,
    registrationExpiry: '2026-12-31',
    insuranceExpiry: '2027-01-01'
  },
  {
    id: 'TRK-1024',
    name: 'MB Sprinter',
    vehicleModel: 'MB Sprinter',
    type: 'Xe van giao hàng',
    status: 'Alert',
    img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCdhNKh0-GzAhH3e6mggj2qnjPIY5WLiL3dtC8dEYS3DoFmd_c8FrkOQuB320RwdOh7jAEcNZbo-sDFE1qkwipLnRBnSXUETeG84yeKpQQmohyZbrgFofdEZU6BI0JXb0rrX78XhqeAFbsS_1KVZgiv-Dvqupt_bYBtwfE5LK_7Fxn7oVM3VLuy8nfA1tPEPiBnBclX_8irReX__gxkdgJEI4N5xOjkflnAw2jkWDc54_gD2BzYYLR9YHbRGkjhwcvHjQ1mB5B8rIQT',
    capacityPercent: 40,
    capacityText: '40% (0.6 tấn)',
    fuelPercent: 15,
    maintText: 'Đăng kiểm hết hạn',
    maintStatus: 'alert',
    engineTemp: 215,
    oilPressure: 34,
    batteryVoltage: 12.2,
    dpfLevel: 78,
    lat: 34.0522,
    lon: -118.2437,
    speed: 0,
    payloadKg: 1500,
    volumeCbm: 12,
    fuelConsumptionRate: 9.5,
    registrationExpiry: '2026-06-01',
    insuranceExpiry: '2026-06-15'
  },
  {
    id: 'TRK-5510',
    name: 'F-650 Box',
    vehicleModel: 'F-650 Box',
    type: 'Xe tải hạng trung',
    status: 'Idle',
    img: 'https://lh3.googleusercontent.com/aida-public/AB6AXu3A6rMNM418T8G08FXMLY-ftT-MgvMQ83G1I9dh6NTk2BY36MxMyzAXqTuNL6IcXaQUClS2pGp3CdZvXv4Ztljenc2xgAkgerRxGMIv5zbl5WijJ6J2qCQ2WKEfKuLyimdvg3gBQf9Hpg3R7Mu6a0McIpGqnCrg4kArBmSOuxAe0ducd_rrhk3td3wNAVlB3w-HJLCmHVWg3PdH2nUV4sdOIOTlFuASLtZRTBfAU_V8WBkAckJn-2uE9rKFJUCw33rUJLGDTbytS07',
    capacityPercent: 0,
    capacityText: '0% (Trống)',
    fuelPercent: 90,
    maintText: 'Bảo trì sau 14 ngày',
    maintStatus: 'warning',
    engineTemp: 140,
    oilPressure: 38,
    batteryVoltage: 12.6,
    dpfLevel: 10,
    lat: 40.7128,
    lon: -74.0060,
    speed: 0,
    payloadKg: 5000,
    volumeCbm: 30,
    fuelConsumptionRate: 18.0,
    registrationExpiry: '2026-10-10',
    insuranceExpiry: '2026-10-15'
  },
  // Mock ALPR detected Pending vehicles
  {
    id: '29H-123.45',
    name: 'TEMP_ALPR',
    vehicleModel: 'TEMP_ALPR',
    type: 'Xe tải hạng trung',
    status: 'Pending',
    img: 'https://lh3.googleusercontent.com/aida-public/AB6AXu3A6rMNM418T8G08FXMLY-ftT-MgvMQ83G1I9dh6NTk2BY36MxMyzAXqTuNL6IcXaQUClS2pGp3CdZvXv4Ztljenc2xgAkgerRxGMIv5zbl5WijJ6J2qCQ2WKEfKuLyimdvg3gBQf9Hpg3R7Mu6a0McIpGqnCrg4kArBmSOuxAe0ducd_rrhk3td3wNAVlB3w-HJLCmHVWg3PdH2nUV4sdOIOTlFuASLtZRTBfAU_V8WBkAckJn-2uE9rKFJUCw33rUJLGDTbytS07',
    capacityPercent: 0,
    capacityText: '0%',
    fuelPercent: 0,
    maintText: 'Chờ phê duyệt',
    maintStatus: 'warning',
    engineTemp: 0,
    oilPressure: 0,
    batteryVoltage: 0,
    dpfLevel: 0,
    lat: 21.0285,
    lon: 105.8542,
    speed: 0,
    payloadKg: 1900,
    volumeCbm: 10,
    fuelConsumptionRate: 12.5,
    registrationExpiry: '',
    insuranceExpiry: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000 - 30 * 60 * 1000).toISOString() // Expiry timestamp (Current Time + 7 days)
  },
  {
    id: '51C-999.99',
    name: 'TEMP_ALPR',
    vehicleModel: 'TEMP_ALPR',
    type: 'Xe vận tải hạng nặng',
    status: 'Pending',
    img: 'https://lh3.googleusercontent.com/aida-public/AB6AXu3A6rMNM418T8G08FXMLY-ftT-MgvMQ83G1I9dh6NTk2BY36MxMyzAXqTuNL6IcXaQUClS2pGp3CdZvXv4Ztljenc2xgAkgerRxGMIv5zbl5WijJ6J2qCQ2WKEfKuLyimdvg3gBQf9Hpg3R7Mu6a0McIpGqnCrg4kArBmSOuxAe0ducd_rrhk3td3wNAVlB3w-HJLCmHVWg3PdH2nUV4sdOIOTlFuASLtZRTBfAU_V8WBkAckJn-2uE9rKFJUCw33rUJLGDTbytS07',
    capacityPercent: 0,
    capacityText: '0%',
    fuelPercent: 0,
    maintText: 'Chờ phê duyệt',
    maintStatus: 'warning',
    engineTemp: 0,
    oilPressure: 0,
    batteryVoltage: 0,
    dpfLevel: 0,
    lat: 10.8231,
    lon: 106.6297,
    speed: 0,
    payloadKg: 5000,
    volumeCbm: 25,
    fuelConsumptionRate: 18.0,
    registrationExpiry: '',
    insuranceExpiry: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000 + 4 * 60 * 60 * 1000).toISOString()
  }
];

interface VehiclesTabProps {
  searchQuery: string;
  setToastMessage: (msg: string | null) => void;
  setActiveTab: (tab: string) => void;
}

export const VehiclesTab: React.FC<VehiclesTabProps> = ({
  searchQuery,
  setToastMessage,
  setActiveTab,
}) => {
  const [vehicles, setVehicles] = useState<VehicleUnit[]>(INITIAL_VEHICLES);
  const [selectedVehicleId, setSelectedVehicleId] = useState<string>('TRK-8492');
  const [showAddVehicleModal, setShowAddVehicleModal] = useState(false);
  const [statusFilter, setStatusFilter] = useState<'all' | 'Active' | 'Alert' | 'Idle' | 'Pending'>('all');

  // Input states for adding new vehicle
  const [newId, setNewId] = useState('');
  const [newName, setNewName] = useState('');
  const [newType, setNewType] = useState('Heavy Duty Hauler');
  const [newStatus, setNewStatus] = useState<'Active' | 'Alert' | 'Idle'>('Active');
  const [newCapacity, setNewCapacity] = useState(50);
  const [newFuel, setNewFuel] = useState(80);

  // Approval flow state tracking & strict tech specs
  const [approvingLicensePlate, setApprovingLicensePlate] = useState<string | null>(null);
  const [newPayloadKg, setNewPayloadKg] = useState<number>(1900);
  const [newVolumeCbm, setNewVolumeCbm] = useState<number>(10);
  const [newFuelConsumptionRate, setNewFuelConsumptionRate] = useState<number>(12.5);
  const [newRegistrationExpiry, setNewRegistrationExpiry] = useState<string>('');
  const [newInsuranceExpiry, setNewInsuranceExpiry] = useState<string>('');

  // Live telemetry diagnostics fluctuation interval ticker
  useEffect(() => {
    const interval = setInterval(() => {
      setVehicles((prevVehicles) =>
        prevVehicles.map((v) => {
          if (v.status !== 'Active') return v;
          // Fluctuate speed, temp, pressure, and voltage slightly
          const speedDelta = (Math.random() - 0.5) * 4;
          const tempDelta = (Math.random() - 0.5) * 2;
          const pressDelta = (Math.random() - 0.5) * 1.5;
          const voltDelta = (Math.random() - 0.5) * 0.1;

          return {
            ...v,
            speed: Math.max(50, Math.min(75, Math.round(v.speed + speedDelta))),
            engineTemp: Math.max(190, Math.min(205, Math.round(v.engineTemp + tempDelta))),
            oilPressure: Math.max(38, Math.min(48, Math.round(v.oilPressure + pressDelta))),
            batteryVoltage: Math.max(13.2, Math.min(14.2, parseFloat((v.batteryVoltage + voltDelta).toFixed(1)))),
          };
        })
      );
    }, 4000);

    return () => clearInterval(interval);
  }, []);

  const focusedVehicle = vehicles.find((v) => v.id === selectedVehicleId) || vehicles[0];

  // Helper function to calculate countdown to expiration for ALPR pending entries
  const getExpiryCountdown = (expiryStr?: string) => {
    if (!expiryStr) return 'N/A';
    const expiryDate = new Date(expiryStr);
    const diffMs = expiryDate.getTime() - Date.now();
    if (diffMs <= 0) return 'Hết hạn (Auto-deleted)';
    
    const diffDays = Math.floor(diffMs / (24 * 60 * 60 * 1000));
    const diffHours = Math.floor((diffMs % (24 * 60 * 60 * 1000)) / (60 * 60 * 1000));
    const diffMins = Math.floor((diffMs % (60 * 60 * 1000)) / (60 * 1000));
    
    if (diffDays > 0) {
      return `Hết hạn sau ${diffDays} ngày ${diffHours} giờ`;
    }
    return `Hết hạn sau ${diffHours} giờ ${diffMins} phút`;
  };

  // Async API Hook: Approve a pending strange vehicle
  const handleApprovePendingVehicle = async (payload: {
    id: string;
    vehicleModel: string;
    type: string;
    status: 'Active' | 'Alert' | 'Idle';
    capacityPercent: number;
    capacityText: string;
    fuelPercent: number;
    maintText: string;
    maintStatus: 'ok' | 'warning' | 'alert';
    engineTemp: number;
    oilPressure: number;
    batteryVoltage: number;
    dpfLevel: number;
    lat: number;
    lon: number;
    speed: number;
    payloadKg: number;
    volumeCbm: number;
    fuelConsumptionRate: number;
    registrationExpiry: string;
    insuranceExpiry: string;
  }) => {
    try {
      setToastMessage(`Đang phê duyệt phương tiện ${payload.id}...`);

      // =======================================================================
      // TODO: Connect Axios/Fetch API call here to persist in database
      // Example:
      // const response = await axios.post('/api/vehicles/approve', payload);
      // =======================================================================

      // Simulate API latency
      await new Promise((resolve) => setTimeout(resolve, 1000));

      const newUnit: VehicleUnit = {
        ...payload,
        name: payload.vehicleModel, // Sync display name
        status: payload.status,
        img: 'https://lh3.googleusercontent.com/aida-public/AB6AXu3A6rMNM418T8G08FXMLY-ftT-MgvMQ83G1I9dh6NTk2BY36MxMyzAXqTuNL6IcXaQUClS2pGp3CdZvXv4Ztljenc2xgAkgerRxGMIv5zbl5WijJ6J2qCQ2WKEfKuLyimdvg3gBQf9Hpg3R7Mu6a0McIpGqnCrg4kArBmSOuxAe0ducd_rrhk3td3wNAVlB3w-HJLCmHVWg3PdH2nUV4sdOIOTlFuASLtZRTBfAU_V8WBkAckJn-2uE9rKFJUCw33rUJLGDTbytS07', // default placeholder truck img
      };

      // Filter out the pending instance, insert the newly approved vehicle
      setVehicles((prev) => [newUnit, ...prev.filter((v) => v.id !== payload.id)]);
      setSelectedVehicleId(newUnit.id);
      setToastMessage(`Cập nhật Hạm đội: Mã phương tiện ${newUnit.id} (${newUnit.vehicleModel}) đã được phê duyệt vào hạm đội thành công!`);
      return true;
    } catch (error) {
      console.error('Failed to approve vehicle', error);
      setToastMessage(`Lỗi phê duyệt: Không thể phê duyệt phương tiện ${payload.id}.`);
      return false;
    }
  };

  // Async API Hook: Reject a pending strange vehicle
  const handleRejectPendingVehicle = async (plate: string) => {
    try {
      setToastMessage(`Đang từ chối phương tiện ${plate}...`);

      // =======================================================================
      // TODO: Connect Axios/Fetch API call here to reject/delete from database
      // Example:
      // await axios.delete(`/api/vehicles/pending/${plate}`);
      // =======================================================================

      // Simulate API latency
      await new Promise((resolve) => setTimeout(resolve, 1000));

      setVehicles((prev) => prev.filter((v) => v.id !== plate));
      setToastMessage(`Cập nhật Hạm đội: Đã từ chối và xóa biển số ${plate} khỏi danh sách chờ duyệt.`);
      
      // Select the first remaining vehicle
      setVehicles((latest) => {
        if (latest.length > 0) {
          setSelectedVehicleId(latest[0].id);
        }
        return latest;
      });
    } catch (error) {
      console.error('Failed to reject vehicle', error);
      setToastMessage(`Lỗi: Không thể từ chối phương tiện ${plate}.`);
    }
  };

  // Action: Add new vehicle to the registry database (Normal flow or Approval flow)
  const handleAddVehicle = async () => {
    if (!newId.trim() || !newName.trim()) {
      setToastMessage('Cảnh báo Điều phối: Mã phương tiện và Tên mẫu xe không được để trống.');
      return;
    }

    if (newPayloadKg <= 0 || newVolumeCbm <= 0 || newFuelConsumptionRate <= 0) {
      setToastMessage('Cảnh báo Điều phối: Tải trọng, Thể tích, và Mức tiêu thụ phải lớn hơn 0.');
      return;
    }

    if (!newRegistrationExpiry || !newInsuranceExpiry) {
      setToastMessage('Cảnh báo Điều phối: Hạn đăng kiểm và Hạn bảo hiểm không được để trống.');
      return;
    }

    const payload = {
      id: newId.toUpperCase(),
      vehicleModel: newName,
      type: newType === 'Heavy Duty Hauler' ? 'Xe vận tải hạng nặng' : newType === 'Delivery Van' ? 'Xe van giao hàng' : 'Xe tải hạng trung',
      status: newStatus,
      capacityPercent: newCapacity,
      capacityText: `${newCapacity}% (${Math.round(newCapacity * (newPayloadKg / 1000))} tấn)`,
      fuelPercent: newFuel,
      maintText: newStatus === 'Alert' ? 'Cảnh báo cảm biến chẩn đoán' : 'Bảo trì: TỐT',
      maintStatus: (newStatus === 'Alert' ? 'alert' : newStatus === 'Idle' ? 'warning' : 'ok') as 'ok' | 'warning' | 'alert',
      engineTemp: newStatus === 'Idle' ? 140 : 194,
      oilPressure: 40,
      batteryVoltage: 13.6,
      dpfLevel: 15,
      lat: 41.8781 + (Math.random() - 0.5) * 0.1,
      lon: -87.6298 + (Math.random() - 0.5) * 0.1,
      speed: newStatus === 'Active' ? 60 : 0,
      payloadKg: newPayloadKg,
      volumeCbm: newVolumeCbm,
      fuelConsumptionRate: newFuelConsumptionRate,
      registrationExpiry: newRegistrationExpiry,
      insuranceExpiry: newInsuranceExpiry
    };

    if (approvingLicensePlate) {
      const success = await handleApprovePendingVehicle(payload);
      if (success) {
        setNewId('');
        setNewName('');
        setApprovingLicensePlate(null);
        setShowAddVehicleModal(false);
      }
    } else {
      // Normal Add Flow
      const newUnit: VehicleUnit = {
        ...payload,
        name: payload.vehicleModel,
        img: 'https://lh3.googleusercontent.com/aida-public/AB6AXu3A6rMNM418T8G08FXMLY-ftT-MgvMQ83G1I9dh6NTk2BY36MxMyzAXqTuNL6IcXaQUClS2pGp3CdZvXv4Ztljenc2xgAkgerRxGMIv5zbl5WijJ6J2qCQ2WKEfKuLyimdvg3gBQf9Hpg3R7Mu6a0McIpGqnCrg4kArBmSOuxAe0ducd_rrhk3td3wNAVlB3w-HJLCmHVWg3PdH2nUV4sdOIOTlFuASLtZRTBfAU_V8WBkAckJn-2uE9rKFJUCw33rUJLGDTbytS07', // default placeholder truck img
      };

      setVehicles((prev) => [newUnit, ...prev]);
      setSelectedVehicleId(newUnit.id);
      setToastMessage(`Cập nhật Hạm đội: Mã phương tiện ${newUnit.id} (${newUnit.vehicleModel}) đã được đăng ký thành công!`);
      
      // Clear inputs
      setNewId('');
      setNewName('');
      setShowAddVehicleModal(false);
    }
  };

  // Filters mapping - Vehicle grid
  const filteredVehicles = vehicles.filter((v) => {
    const q = searchQuery.toLowerCase().trim();
    const matchesSearch = !q || (
      v.id.toLowerCase().includes(q) ||
      (v.name && v.name.toLowerCase().includes(q)) ||
      (v.vehicleModel && v.vehicleModel.toLowerCase().includes(q)) ||
      v.type.toLowerCase().includes(q) ||
      v.status.toLowerCase().includes(q)
    );

    if (!matchesSearch) return false;
    if (statusFilter === 'all') return true;
    return v.status === statusFilter;
  });

  const alertsCount = vehicles.filter((v) => v.status === 'Alert').length;
  const pendingCount = vehicles.filter((v) => v.status === 'Pending').length;

  return (
    <div className="flex-1 flex flex-col md:flex-row gap-gutter h-full min-h-0 relative select-none">
      
      {/* LEFT: Vehicle Cards List */}
      <div className="flex-1 flex flex-col gap-4 overflow-hidden h-full">
        
        {/* Context bar */}
        <div className="glass-panel rounded-xl p-4 flex justify-between items-center shrink-0">
          <div className="text-left">
            <h2 className="font-headline-sm text-headline-sm text-on-surface font-bold">Hạm đội hoạt động</h2>
            <p className="font-body-md text-body-md text-on-surface-variant text-sm mt-1">
              {vehicles.length - pendingCount} Phương tiện • {alertsCount} Cảnh báo bảo trì • {pendingCount} Xe chờ duyệt AI
            </p>
          </div>
          
          <div className="flex gap-2">
            <div className="relative">
              <button
                onClick={() => setStatusFilter(statusFilter === 'all' ? 'Active' : statusFilter === 'Active' ? 'Alert' : statusFilter === 'Alert' ? 'Idle' : statusFilter === 'Idle' ? 'Pending' : 'all')}
                className="bg-surface-variant/40 border border-outline-variant/50 text-on-surface rounded-lg px-3 py-1.5 font-data-tabular text-data-tabular flex items-center gap-2 hover:border-secondary/50 transition-colors text-xs font-semibold"
              >
                <span className="material-symbols-outlined text-[16px]">filter_list</span>
                Bộ lọc: {statusFilter === 'all' ? 'TẤT CẢ' : statusFilter === 'Active' ? 'HOẠT ĐỘNG' : statusFilter === 'Alert' ? 'CẢNH BÁO' : statusFilter === 'Idle' ? 'ĐANG RẢNH' : 'CHỜ DUYỆT'}
              </button>
            </div>
            
            <button
              onClick={() => {
                setApprovingLicensePlate(null);
                setNewId('');
                setNewName('');
                setNewType('Heavy Duty Hauler');
                setNewStatus('Active');
                setNewCapacity(0);
                setNewFuel(100);
                setNewPayloadKg(1900);
                setNewVolumeCbm(10);
                setNewFuelConsumptionRate(12.5);
                setNewRegistrationExpiry(new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]);
                setNewInsuranceExpiry(new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]);
                setShowAddVehicleModal(true);
              }}
              className="bg-primary-container text-on-primary-container rounded-lg px-4 py-1.5 font-label-caps text-label-caps text-xs font-bold shadow-[0_0_10px_rgba(37,99,235,0.3)] hover:shadow-[0_0_15px_rgba(37,99,235,0.5)] transition-all flex items-center gap-1.5"
            >
              <span className="material-symbols-outlined text-[16px] font-bold">add</span>
              THÊM PHƯƠNG TIỆN
            </button>
          </div>
        </div>

        {/* Scrollable grid */}
        <div className="flex-1 overflow-y-auto pr-2 pb-20 md:pb-0">
          {filteredVehicles.length === 0 ? (
            <div className="glass-panel rounded-xl p-8 text-center text-on-surface-variant">
              <span className="material-symbols-outlined text-[42px] opacity-40 mb-2 block">
                no_transport
              </span>
              Không có phương tiện hạm đội nào khớp với tiêu chí của bạn.
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-gutter">
              {filteredVehicles.map((vehicle) => {
                const isSelected = selectedVehicleId === vehicle.id;
                const isAlert = vehicle.status === 'Alert';
                const isIdle = vehicle.status === 'Idle';
                const isPending = vehicle.status === 'Pending';

                return (
                  <div
                    key={vehicle.id}
                    onClick={() => setSelectedVehicleId(vehicle.id)}
                    className={`glass-panel rounded-xl p-4 cursor-pointer relative overflow-hidden group transition-all duration-300 ${
                      isSelected
                        ? 'glass-panel-active border-primary/70 shadow-[0_0_15px_rgba(37,99,235,0.3)] scale-[0.99]'
                        : isAlert
                        ? 'border-error/25 hover:border-error/50 shadow-[0_0_10px_rgba(255,180,171,0.05)]'
                        : isPending
                        ? 'border-amber-500/25 hover:border-amber-500/50 shadow-[0_0_10px_rgba(245,158,11,0.05)]'
                        : 'hover:border-secondary/30'
                    }`}
                  >
                    {/* Left highlight indicator */}
                    {isSelected && (
                      <div className="absolute top-0 left-0 w-1 h-full bg-primary shadow-[0_0_10px_rgba(37,99,235,1)]" />
                    )}
                    {isAlert && !isSelected && (
                      <div className="absolute top-0 left-0 w-1 h-full bg-error shadow-[0_0_10px_rgba(255,180,171,0.5)]" />
                    )}
                    {isPending && !isSelected && (
                      <div className="absolute top-0 left-0 w-1 h-full bg-amber-500 shadow-[0_0_10px_rgba(245,158,11,0.5)]" />
                    )}

                    <div className="flex justify-between items-start mb-3">
                      <span className={`font-label-caps text-label-caps px-2 py-0.5 rounded border text-[10px] font-bold ${
                        isSelected
                          ? 'text-primary bg-primary/10 border-primary/30'
                          : isPending
                          ? 'text-amber-500 bg-amber-500/10 border-amber-500/30'
                          : 'text-on-surface bg-surface-variant border-outline-variant/30'
                      }`}>
                        {vehicle.id}
                      </span>
                      
                      {isAlert ? (
                        <span className="bg-error/15 text-error border border-error/20 px-2 py-0.5 rounded text-[9px] font-label-caps text-label-caps uppercase flex items-center gap-1 font-bold animate-pulse">
                          <span className="material-symbols-outlined text-[11px]" style={{ fontVariationSettings: "'FILL' 1" }}>warning</span> Cảnh báo
                        </span>
                      ) : vehicle.status === 'Active' ? (
                        <span className="bg-secondary/15 text-secondary border border-secondary/20 px-2 py-0.5 rounded text-[9px] font-label-caps text-label-caps uppercase flex items-center gap-1 font-bold">
                          <span className="w-1.5 h-1.5 bg-secondary rounded-full animate-pulse" /> Hoạt động
                        </span>
                      ) : isPending ? (
                        <span className="bg-amber-500/15 text-amber-500 border border-amber-500/20 px-2 py-0.5 rounded text-[9px] font-label-caps text-label-caps uppercase flex items-center gap-1 font-bold animate-pulse">
                          <span className="material-symbols-outlined text-[11px]">photo_camera</span> Chờ duyệt
                        </span>
                      ) : (
                        <span className="bg-surface-variant/50 text-on-surface-variant border border-outline-variant/20 px-2 py-0.5 rounded text-[9px] font-label-caps text-label-caps uppercase font-bold">
                          Đang rảnh
                        </span>
                      )}
                    </div>

                    {/* Image cabin view */}
                    <div className="w-full h-24 mb-4 rounded-lg overflow-hidden border border-outline-variant/30 relative select-none">
                      <img alt={vehicle.vehicleModel} className={`w-full h-full object-cover transition-transform duration-500 group-hover:scale-102 ${isAlert ? 'opacity-60 grayscale-[20%]' : isPending ? 'opacity-50 grayscale' : 'opacity-80'}`} src={vehicle.img} />
                      <div className="absolute bottom-2 right-2 bg-surface/85 backdrop-blur px-1.5 py-0.5 rounded text-[9px] font-data-tabular text-on-surface font-semibold select-none border border-white/5">
                        {vehicle.vehicleModel}
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-y-3 gap-x-2 text-left">
                      <div>
                        <div className="text-[9px] font-label-caps text-on-surface-variant uppercase mb-0.5 font-bold">Tải trọng</div>
                        <div className="font-data-tabular text-data-tabular text-on-surface text-[12px] font-semibold">
                          {isPending ? 'Chờ nhập liệu' : vehicle.capacityText}
                        </div>
                      </div>
                      <div>
                        <div className="text-[9px] font-label-caps text-on-surface-variant uppercase mb-0.5 font-bold">Nhiên liệu / Điện</div>
                        <div className={`font-data-tabular text-data-tabular text-[12px] flex items-center gap-1 font-bold ${isAlert && vehicle.fuelPercent <= 15 ? 'text-error' : 'text-on-surface'}`}>
                          {isPending ? (
                            'N/A'
                          ) : (
                            <>
                              <div className="w-12 h-1 bg-surface-variant rounded-full overflow-hidden select-none">
                                <div className={`h-full rounded-full ${isAlert && vehicle.fuelPercent <= 15 ? 'bg-error shadow-[0_0_5px_#ffdad6]' : isIdle ? 'bg-secondary-container' : 'bg-secondary'}`} style={{ width: `${vehicle.fuelPercent}%` }}></div>
                              </div>
                              {vehicle.fuelPercent}%
                            </>
                          )}
                        </div>
                      </div>
                      <div className="col-span-2 mt-2 pt-2 border-t border-outline-variant/10">
                        {isPending ? (
                          <div className="flex items-center gap-1.5 text-amber-500 font-data-tabular text-data-tabular text-[11px] font-bold animate-pulse">
                            <span className="material-symbols-outlined text-[14px]">lock_clock</span> Tự xóa: {getExpiryCountdown(vehicle.insuranceExpiry)}
                          </div>
                        ) : vehicle.maintStatus === 'ok' ? (
                          <div className="flex items-center gap-1.5 text-primary font-data-tabular text-data-tabular text-[11px] font-semibold">
                            <span className="material-symbols-outlined text-[14px]">check_circle</span> {vehicle.maintText}
                          </div>
                        ) : vehicle.maintStatus === 'alert' ? (
                          <div className="flex items-center gap-1.5 text-error font-data-tabular text-data-tabular text-[11px] font-bold animate-pulse">
                            <span className="material-symbols-outlined text-[14px]">engineering</span> {vehicle.maintText}
                          </div>
                        ) : (
                          <div className="flex items-center gap-1.5 text-on-surface-variant font-data-tabular text-data-tabular text-[11px] font-medium">
                            <span className="material-symbols-outlined text-[14px]">schedule</span> {vehicle.maintText}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* RIGHT: Detail HUD Panel */}
      <aside className="w-full md:w-[320px] lg:w-[380px] shrink-0 glass-panel rounded-xl flex flex-col overflow-hidden h-full">
        {/* Header */}
        <div className="p-5 border-b border-outline-variant/10 bg-surface-container-low/50 text-left">
          <div className="flex justify-between items-center mb-2">
            <h3 className="font-display-lg text-display-lg text-on-surface text-xl font-bold">{focusedVehicle.id}</h3>
            
            {focusedVehicle.status === 'Alert' ? (
              <span className="bg-error/15 text-error border border-error/20 px-2.5 py-0.5 rounded text-[10px] font-label-caps text-label-caps uppercase flex items-center gap-1 font-bold animate-pulse">
                <span className="material-symbols-outlined text-[12px]" style={{ fontVariationSettings: "'FILL' 1" }}>warning</span> Cảnh báo nguy hiểm
              </span>
            ) : focusedVehicle.status === 'Active' ? (
              <span className="bg-secondary/15 text-secondary border border-secondary/20 px-2.5 py-0.5 rounded text-[10px] font-label-caps text-label-caps uppercase flex items-center gap-1 font-bold shadow-[0_0_10px_rgba(76,215,246,0.15)]">
                <span className="w-1.5 h-1.5 bg-secondary rounded-full animate-pulse shadow-[0_0_8px_#4cd7f6]" /> Đang di chuyển
              </span>
            ) : focusedVehicle.status === 'Pending' ? (
              <span className="bg-amber-500/15 text-amber-500 border border-amber-500/20 px-2.5 py-0.5 rounded text-[10px] font-label-caps text-label-caps uppercase flex items-center gap-1 font-bold animate-pulse">
                <span className="material-symbols-outlined text-[12px]">pending_actions</span> Chờ duyệt (ALPR)
              </span>
            ) : (
              <span className="bg-surface-variant/50 text-on-surface-variant border border-outline-variant/20 px-2.5 py-0.5 rounded text-[10px] font-label-caps text-label-caps uppercase font-bold">
                Đang rảnh
              </span>
            )}
          </div>
          <div className="font-body-md text-body-md text-on-surface-variant text-sm font-medium">{focusedVehicle.vehicleModel} • {focusedVehicle.type}</div>
        </div>

        {/* Scrollable Details */}
        <div className="flex-1 overflow-y-auto p-5 space-y-6">
          
          {focusedVehicle.status === 'Pending' ? (
            <div className="space-y-6 text-left">
              {/* ALPR CAMERA DETECTED BANNER */}
              <div className="bg-amber-500/10 border border-amber-500/20 p-4 rounded-xl">
                <div className="flex items-center gap-2 text-amber-500 mb-2 font-bold text-xs uppercase tracking-wider">
                  <span className="material-symbols-outlined text-[18px]">photo_camera</span>
                  Phát hiện từ camera ALPR
                </div>
                <p className="text-sm text-on-surface leading-relaxed mb-4">
                  Hệ thống ALPR phát hiện một phương tiện lạ ở lối vào kho. Dữ liệu này là tạm thời và sẽ bị xóa nếu không được phê duyệt.
                </p>
                <div className="flex items-center gap-2 text-error text-xs font-bold font-data-tabular bg-error/5 p-2 rounded border border-error/10">
                  <span className="material-symbols-outlined text-[16px] animate-pulse">schedule</span>
                  {getExpiryCountdown(focusedVehicle.insuranceExpiry)}
                </div>
              </div>

              {/* TEMP SPECS */}
              <div className="bg-surface-variant/15 border border-outline-variant/20 rounded-xl p-4">
                <h4 className="text-[10px] font-label-caps text-on-surface-variant uppercase mb-3 font-bold tracking-wider">Thông tin nhận diện</h4>
                
                <div className="grid grid-cols-2 gap-y-4 gap-x-2 text-xs font-data-tabular">
                  <div>
                    <span className="text-[9px] text-on-surface-variant uppercase font-bold tracking-wider font-label-caps block mb-0.5">Biển số nhận diện</span>
                    <span className="font-bold text-on-surface text-sm">{focusedVehicle.id}</span>
                  </div>
                  <div>
                    <span className="text-[9px] text-on-surface-variant uppercase font-bold tracking-wider font-label-caps block mb-0.5">Độ tin cậy AI</span>
                    <span className="font-bold text-secondary">98.4%</span>
                  </div>
                  <div>
                    <span className="text-[9px] text-on-surface-variant uppercase font-bold tracking-wider font-label-caps block mb-0.5">Mẫu xe AI gợi ý</span>
                    <span className="font-bold text-on-surface">{focusedVehicle.vehicleModel}</span>
                  </div>
                  <div>
                    <span className="text-[9px] text-on-surface-variant uppercase font-bold tracking-wider font-label-caps block mb-0.5">Phân loại xe AI</span>
                    <span className="font-bold text-on-surface">{focusedVehicle.type}</span>
                  </div>
                  <div className="col-span-2 border-t border-outline-variant/10 pt-2.5">
                    <span className="text-[9px] text-on-surface-variant uppercase font-bold tracking-wider font-label-caps block mb-0.5">Địa điểm camera</span>
                    <span className="font-bold text-on-surface-variant">Cổng Kiểm soát Cảng số 2 (Phía Bắc)</span>
                  </div>
                </div>
              </div>

              {/* ACTION CALLOUT */}
              <p className="text-[11px] text-on-surface-variant leading-relaxed italic text-center">
                Vui lòng click "PHÊ DUYỆT" để bổ sung các chỉ số tải trọng, thể tích, đăng kiểm bắt buộc của SQL Server để lưu vào Cơ sở dữ liệu.
              </p>
            </div>
          ) : (
            <>
              {/* GPS / Map Widget */}
              <div className="text-left">
                <h4 className="text-[10px] font-label-caps text-on-surface-variant uppercase mb-3 flex items-center gap-2 font-bold tracking-wider">
                  <span className="material-symbols-outlined text-[14px]">my_location</span> Đo lường từ xa
                </h4>
                
                <div className="h-32 rounded-lg border border-outline-variant/30 overflow-hidden relative bg-surface-variant/20 flex items-center justify-center select-none">
                  <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'radial-gradient(circle at center, #2563eb 1.2px, transparent 1.2px)', backgroundSize: '12px 12px' }}></div>
                  
                  <div className="relative z-10 flex flex-col items-center">
                    <span className={`material-symbols-outlined text-primary text-[26px] mb-1 ${focusedVehicle.status === 'Active' ? 'animate-bounce animate-[pulse_2s_infinite]' : ''}`}>
                      near_me
                    </span>
                    <div className="bg-surface/90 backdrop-blur px-2.5 py-1 rounded font-data-tabular text-data-tabular text-[11px] border border-outline-variant/30 text-center font-bold">
                      <div>{focusedVehicle.lat.toFixed(4)}° N, {Math.abs(focusedVehicle.lon).toFixed(4)}° W</div>
                      <div className="text-secondary mt-0.5">Tốc độ: {focusedVehicle.speed} mph</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Diagnostics Grid */}
              <div className="text-left">
                <h4 className="text-[10px] font-label-caps text-on-surface-variant uppercase mb-3 flex items-center gap-2 font-bold tracking-wider">
                  <span className="material-symbols-outlined text-[14px]">speed</span> Chẩn đoán Trực tiếp
                </h4>
                
                <div className="grid grid-cols-2 gap-3 text-left font-data-tabular">
                  <div className="bg-surface-variant/15 border border-outline-variant/20 rounded-lg p-3">
                    <div className="text-[9px] text-on-surface-variant mb-1 uppercase font-bold tracking-wider font-label-caps">Nhiệt độ động cơ</div>
                    <div className={`font-bold text-[16px] ${focusedVehicle.engineTemp >= 210 ? 'text-error animate-pulse' : 'text-on-surface'}`}>
                      {focusedVehicle.engineTemp}°F
                    </div>
                  </div>
                  
                  <div className="bg-surface-variant/15 border border-outline-variant/20 rounded-lg p-3">
                    <div className="text-[9px] text-on-surface-variant mb-1 uppercase font-bold tracking-wider font-label-caps">Áp suất dầu</div>
                    <div className="font-bold text-[16px] text-on-surface">{focusedVehicle.oilPressure} PSI</div>
                  </div>
                  
                  <div className="bg-surface-variant/15 border border-outline-variant/20 rounded-lg p-3">
                    <div className="text-[9px] text-on-surface-variant mb-1 uppercase font-bold tracking-wider font-label-caps">Ắc quy</div>
                    <div className="font-bold text-[16px] text-primary">{focusedVehicle.batteryVoltage}V</div>
                  </div>
                  
                  <div className="bg-surface-variant/15 border border-outline-variant/20 rounded-lg p-3">
                    <div className="text-[9px] text-on-surface-variant mb-1 uppercase font-bold tracking-wider font-label-caps">Mức DPF</div>
                    <div className={`font-bold text-[16px] ${focusedVehicle.dpfLevel >= 70 ? 'text-error font-semibold' : 'text-on-surface'}`}>
                      {focusedVehicle.dpfLevel}%
                    </div>
                  </div>
                </div>
              </div>

              {/* Compliance / Specs Info */}
              <div className="text-left">
                <h4 className="text-[10px] font-label-caps text-on-surface-variant uppercase mb-3 flex items-center gap-2 font-bold tracking-wider">
                  <span className="material-symbols-outlined text-[14px]">verified_user</span> Thông số kỹ thuật & Pháp lý
                </h4>
                
                <ul className="space-y-2">
                  <li className="flex items-center justify-between p-2.5 rounded bg-surface-variant/10 border border-outline-variant/10 select-none">
                    <div className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-primary text-[16px]">weight</span>
                      <span className="font-data-tabular text-data-tabular text-[12px] text-on-surface font-semibold">Tải trọng tối đa</span>
                    </div>
                    <span className="text-on-surface text-[12px] font-bold font-data-tabular">{focusedVehicle.payloadKg} Kg</span>
                  </li>

                  <li className="flex items-center justify-between p-2.5 rounded bg-surface-variant/10 border border-outline-variant/10 select-none">
                    <div className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-primary text-[16px]">box</span>
                      <span className="font-data-tabular text-data-tabular text-[12px] text-on-surface font-semibold">Thể tích thùng xe</span>
                    </div>
                    <span className="text-on-surface text-[12px] font-bold font-data-tabular">{focusedVehicle.volumeCbm} Cbm</span>
                  </li>

                  <li className="flex items-center justify-between p-2.5 rounded bg-surface-variant/10 border border-outline-variant/10 select-none">
                    <div className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-primary text-[16px]">local_gas_station</span>
                      <span className="font-data-tabular text-data-tabular text-[12px] text-on-surface font-semibold">Định mức nhiên liệu</span>
                    </div>
                    <span className="text-on-surface text-[12px] font-bold font-data-tabular">{focusedVehicle.fuelConsumptionRate} L/100km</span>
                  </li>

                  <li className="flex items-center justify-between p-2.5 rounded bg-surface-variant/10 border border-outline-variant/10 select-none">
                    <div className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-primary text-[16px]">article</span>
                      <span className="font-data-tabular text-data-tabular text-[12px] text-on-surface font-semibold">Hạn Đăng kiểm</span>
                    </div>
                    <span className="text-on-surface text-[11px] font-bold font-data-tabular">{focusedVehicle.registrationExpiry}</span>
                  </li>
                  
                  <li className="flex items-center justify-between p-2.5 rounded bg-surface-variant/10 border border-outline-variant/10 select-none">
                    <div className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-primary text-[16px]">shield</span>
                      <span className="font-data-tabular text-data-tabular text-[12px] text-on-surface font-semibold">Hạn Bảo hiểm</span>
                    </div>
                    <span className="text-on-surface text-[11px] font-bold font-data-tabular">{focusedVehicle.insuranceExpiry}</span>
                  </li>
                </ul>
              </div>
            </>
          )}
        </div>

        {/* Actions */}
        <div className="p-5 border-t border-outline-variant/10 bg-surface-container-low/50 grid grid-cols-2 gap-3 shrink-0">
          {focusedVehicle.status === 'Pending' ? (
            <>
              <button
                onClick={() => handleRejectPendingVehicle(focusedVehicle.id)}
                className="bg-error/10 border border-error/35 text-error rounded-lg py-2 font-label-caps text-label-caps hover:bg-error/20 transition-colors text-xs font-bold active:scale-[0.98]"
              >
                TỪ CHỐI DUYỆT
              </button>
              
              <button
                onClick={() => {
                  setNewId(focusedVehicle.id);
                  setNewName(''); // Clear to force user to choose a real model
                  setNewType(focusedVehicle.type === 'Xe tải hạng trung' ? 'Medium Duty Truck' : focusedVehicle.type === 'Xe van giao hàng' ? 'Delivery Van' : 'Heavy Duty Hauler');
                  setNewStatus('Idle'); // Put into idle status in parking lot initially
                  setNewCapacity(0);
                  setNewFuel(100);
                  
                  // Initialize fields
                  setNewPayloadKg(focusedVehicle.payloadKg || 1900);
                  setNewVolumeCbm(focusedVehicle.volumeCbm || 10);
                  setNewFuelConsumptionRate(focusedVehicle.fuelConsumptionRate || 12.5);
                  setNewRegistrationExpiry('');
                  setNewInsuranceExpiry('');
                  
                  setApprovingLicensePlate(focusedVehicle.id);
                  setShowAddVehicleModal(true);
                }}
                className="bg-primary border border-primary text-on-primary rounded-lg py-2 font-label-caps text-label-caps shadow-[inset_0_0_10px_rgba(255,255,255,0.2)] hover:bg-primary-container transition-colors text-xs font-bold active:scale-[0.98]"
              >
                PHÊ DUYỆT
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => setToastMessage(`Truyền thông vệ tinh: Đang mở kênh liên lạc an toàn với tài xế phương tiện ${focusedVehicle.id}.`)}
                className="bg-surface-variant/40 border border-secondary text-secondary rounded-lg py-2 font-label-caps text-label-caps hover:bg-secondary/10 transition-colors text-xs font-bold active:scale-[0.98]"
              >
                LIÊN HỆ TÀI XẾ
              </button>
              
              <button
                onClick={() => {
                  setActiveTab('Live Tracking');
                  setToastMessage(`Khóa lộ trình: Chuyển màn hình điều phối sang theo dõi phương tiện ${focusedVehicle.id} trên bản đồ đo lường.`);
                }}
                className="bg-primary border border-primary text-on-primary rounded-lg py-2 font-label-caps text-label-caps shadow-[inset_0_0_10px_rgba(255,255,255,0.2)] hover:bg-primary-container transition-colors text-xs font-bold active:scale-[0.98]"
              >
                BẢN ĐỒ LỘ TRÌNH
              </button>
            </>
          )}
        </div>
      </aside>

      {/* DYNAMIC Add Vehicle Modal Drawer */}
      {showAddVehicleModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in pointer-events-auto">
          <div className="w-full max-w-md glass-panel rounded-xl overflow-hidden border border-outline-variant/30 shadow-2xl animate-scale-up">
            <div className="p-4 border-b border-white/10 flex justify-between items-center bg-primary-container/10">
              <h3 className="font-headline-sm text-headline-sm font-bold text-primary flex items-center gap-2">
                <span className="material-symbols-outlined text-[20px] text-primary">local_shipping</span>
                {approvingLicensePlate ? 'Phê duyệt & Đăng ký Phương tiện ALPR' : 'Đăng ký Phương tiện Hạm đội'}
              </h3>
              
              <button
                onClick={() => setShowAddVehicleModal(false)}
                className="text-on-surface-variant hover:text-error transition-colors p-1"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            <div className="p-5 flex flex-col gap-4 text-left font-body-md overflow-y-auto max-h-[75vh]">
              {/* License Plate (Pre-fill and lock if in approval flow) */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider">Biển số xe (License Plate)</label>
                <input
                  type="text"
                  disabled={!!approvingLicensePlate}
                  className={`bg-black/30 border border-outline-variant/40 rounded-lg p-2.5 text-on-surface text-xs focus:outline-none focus:ring-1 focus:ring-secondary/50 focus:border-secondary/50 transition-all placeholder-on-surface-variant/45 ${
                    approvingLicensePlate ? 'opacity-60 cursor-not-allowed bg-black/60' : ''
                  }`}
                  placeholder="Ví dụ: 29H-123.45, 51C-999.99..."
                  value={newId}
                  onChange={(e) => setNewId(e.target.value)}
                />
              </div>

              {/* Vehicle Model */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider">Mẫu xe / Tên cabin (VehicleModel)</label>
                <input
                  type="text"
                  className="bg-black/30 border border-outline-variant/40 rounded-lg p-2.5 text-on-surface text-xs focus:outline-none focus:ring-1 focus:ring-secondary/50 focus:border-secondary/50 transition-all placeholder-on-surface-variant/45"
                  placeholder="Ví dụ: Isuzu 1.9 Tấn, Hino 5 Tấn..."
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider">Loại phương tiện</label>
                  <select
                    className="bg-black/40 border border-outline-variant/40 rounded-lg p-2.5 text-on-surface text-xs focus:outline-none focus:ring-1 focus:ring-secondary/50 focus:border-secondary/50 transition-all"
                    value={newType}
                    onChange={(e) => setNewType(e.target.value)}
                  >
                    <option value="Heavy Duty Hauler">Xe vận tải hạng nặng (Semi)</option>
                    <option value="Delivery Van">Xe van thương mại</option>
                    <option value="Medium Duty Truck">Xe tải hạng trung (Thùng hộp)</option>
                  </select>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider">Trạng thái ban đầu</label>
                  <select
                    className="bg-black/40 border border-outline-variant/40 rounded-lg p-2.5 text-on-surface text-xs focus:outline-none focus:ring-1 focus:ring-secondary/50 focus:border-secondary/50 transition-all"
                    value={newStatus}
                    onChange={(e) => setNewStatus(e.target.value as any)}
                  >
                    <option value="Active">Hoạt động (Làm nhiệm vụ)</option>
                    <option value="Idle">Đang rảnh (Trong bãi)</option>
                    <option value="Alert">Cảnh báo (Cảm biến báo lỗi)</option>
                  </select>
                </div>
              </div>

              {/* TECHNICAL SPECS REQUIRED BY SQL SERVER */}
              <div className="border-t border-outline-variant/20 pt-4 flex flex-col gap-4">
                <span className="text-[11px] font-bold text-primary uppercase tracking-wider">Thông số kỹ thuật bắt buộc (DB schema)</span>
                
                <div className="grid grid-cols-3 gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[9px] font-bold text-on-surface-variant uppercase tracking-wider">Tải trọng (Kg)</label>
                    <input
                      type="number"
                      required
                      min="1"
                      className="bg-black/30 border border-outline-variant/40 rounded-lg p-2 text-on-surface text-xs focus:outline-none focus:ring-1 focus:ring-secondary/50 focus:border-secondary/50 transition-all font-data-tabular"
                      value={newPayloadKg || ''}
                      onChange={(e) => setNewPayloadKg(parseFloat(e.target.value) || 0)}
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[9px] font-bold text-on-surface-variant uppercase tracking-wider">Thể tích (Cbm)</label>
                    <input
                      type="number"
                      required
                      min="0.1"
                      step="0.1"
                      className="bg-black/30 border border-outline-variant/40 rounded-lg p-2 text-on-surface text-xs focus:outline-none focus:ring-1 focus:ring-secondary/50 focus:border-secondary/50 transition-all font-data-tabular"
                      value={newVolumeCbm || ''}
                      onChange={(e) => setNewVolumeCbm(parseFloat(e.target.value) || 0)}
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[9px] font-bold text-on-surface-variant uppercase tracking-wider">Hao phí (L/100km)</label>
                    <input
                      type="number"
                      required
                      min="0.1"
                      step="0.1"
                      className="bg-black/30 border border-outline-variant/40 rounded-lg p-2 text-on-surface text-xs focus:outline-none focus:ring-1 focus:ring-secondary/50 focus:border-secondary/50 transition-all font-data-tabular"
                      value={newFuelConsumptionRate || ''}
                      onChange={(e) => setNewFuelConsumptionRate(parseFloat(e.target.value) || 0)}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[9px] font-bold text-on-surface-variant uppercase tracking-wider">Hạn đăng kiểm (Registration)</label>
                    <input
                      type="date"
                      required
                      className="bg-black/30 border border-outline-variant/40 rounded-lg p-2 text-on-surface text-xs focus:outline-none focus:ring-1 focus:ring-secondary/50 focus:border-secondary/50 transition-all text-left"
                      value={newRegistrationExpiry}
                      onChange={(e) => setNewRegistrationExpiry(e.target.value)}
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[9px] font-bold text-on-surface-variant uppercase tracking-wider">Hạn bảo hiểm (Insurance)</label>
                    <input
                      type="date"
                      required
                      className="bg-black/30 border border-outline-variant/40 rounded-lg p-2 text-on-surface text-xs focus:outline-none focus:ring-1 focus:ring-secondary/50 focus:border-secondary/50 transition-all text-left"
                      value={newInsuranceExpiry}
                      onChange={(e) => setNewInsuranceExpiry(e.target.value)}
                    />
                  </div>
                </div>
              </div>

              {/* Capacity and Fuel defaults */}
              {!approvingLicensePlate && (
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider">% Tải trọng ban đầu</label>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      className="bg-black/30 border border-outline-variant/40 rounded-lg p-2.5 text-on-surface text-xs focus:outline-none focus:ring-1 focus:ring-secondary/50 focus:border-secondary/50 transition-all"
                      value={newCapacity}
                      onChange={(e) => setNewCapacity(parseInt(e.target.value) || 0)}
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider">% Nhiên liệu / Điện ban đầu</label>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      className="bg-black/30 border border-outline-variant/40 rounded-lg p-2.5 text-on-surface text-xs focus:outline-none focus:ring-1 focus:ring-secondary/50 focus:border-secondary/50 transition-all"
                      value={newFuel}
                      onChange={(e) => setNewFuel(parseInt(e.target.value) || 0)}
                    />
                  </div>
                </div>
              )}

              <button
                onClick={handleAddVehicle}
                className="mt-4 bg-primary-container text-white py-2.5 rounded-lg text-sm font-bold tracking-wider hover:brightness-110 active:scale-[0.98] transition-all shadow-[0_0_15px_rgba(37,99,235,0.45)] flex items-center justify-center gap-1.5"
              >
                <span className="material-symbols-outlined text-[18px]">how_to_reg</span>
                {approvingLicensePlate ? 'XÁC NHẬN PHÊ DUYỆT' : 'ĐĂNG KÝ VÀO HẠM ĐỘI'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default VehiclesTab;
