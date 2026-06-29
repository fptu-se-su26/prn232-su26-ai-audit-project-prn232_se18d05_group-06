import React, { useState, useEffect } from 'react';
import axios from 'axios';

interface RosterDriver {
  id: string;
  dbDriverId?: number;
  name: string;
  avatar: string;
  cdl: string;
  experience: string;
  status: 'En Route' | 'Speeding' | 'Idle' | 'Loading';
  statusDetails?: string;
  deliveries: number;
  rating: number;
  critical?: boolean;
  isBlacklisted?: boolean;
  blacklistReason?: string | null;
}

const INITIAL_ROSTER_DRIVERS: RosterDriver[] = [
  {
    id: 'dr-1',
    name: 'Marcus Chen',
    avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDVTZMCF_i-FkdjUgiVMM7qw878wswVgznw8W823GDbbcaqIYy3Yuntgc0kY3ZNE9ucjepJuVV9aOOI6bB6PNeCeDyCuyw8zPItkqcc2O4ynuMcSJCRPX0PpOv5LaNn4otd2N-z3_n1adFboz-Mzc597fuknTtfjySRWm2ehR_x6hc9MP3xmQZVuPPzYQI4_Zl-xxJkIZvwbMVTkwmVwkhWSmAtngsRhuO6R2yX97TopRH9KW1GZLQcG3XbL6hY83XgKowo6rPBr43o',
    cdl: 'CDL-A',
    experience: '5Y',
    status: 'En Route',
    deliveries: 1204,
    rating: 4.9
  },
  {
    id: 'dr-2',
    name: 'Sarah Jenkins',
    avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDjO9aUxirI4aQizvfalz9QPU5xPn4ig54pDbHJMHjrsOUHWdjTWy4LW9CeHevpaLjSm5616sylYpniCkLRsLBsh8A4AYLDJ8vWr2KClxpqQRk95ixAjHOhWqkj6LewpsyP2sGc29iM20tlwceuTEtRtGOcKbzRTw8jnu9vPcSTPdiWwSeqSyjwb4u_ROykLJnIL5yqthTgjMFIVsO2jaYZXiV-kQhl27WN8LtppYlDjFrevWzrXqnqse3ML3mOceZvnQ6XAFeis0oI',
    cdl: 'CDL-B',
    experience: '2Y',
    status: 'Speeding',
    statusDetails: 'Quá tốc độ (Phân khu 4)',
    deliveries: 432,
    rating: 4.2,
    critical: true
  },
  {
    id: 'dr-3',
    name: 'David Okafor',
    avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDEFFFn67Ehkkg4X3SRf6Cb8y4AbnG7QdmaFMwZ5oLHYnddFa0khRgkq3J14zg06wQr6coPtSaI5WwtGpT7Wn5RBussei_xOawEtio2BtIs2w-Xe8j2o-dORi7JQXVtTylfyfEpwvk4Q8IKnjFbjflKAE0RRPj6D56tBI51wQ0jIkq2kWdL4gFRo0aLPnJSzTIyp8qaDabxhI9i_7mGeIM4jxtSZxlFocIqZP4EZSc7drogpisbkfotR3Tgw6C1vob4EmHLa-WoMsnb',
    cdl: 'CDL-A',
    experience: '12Y',
    status: 'Idle',
    statusDetails: 'Đang rảnh / Nghỉ ngơi',
    deliveries: 3890,
    rating: 5.0
  },
  {
    id: 'dr-4',
    name: 'Tom Wilson',
    avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDy5vlgiomY0AWTSQmwo387AWxRVS03OEAU4586udn_w9eOijqae8M8W8ZSV5AzdERHzw5ydoBYcZwPl6lFrp7YMotgHgWd5SdRJZ7bcl0F45M87BfUD8VTj2k2zn48SvUfeYWUt6IwbyWhl7UfyAksjXjAkD_8Q_t2z7MxAPdw4lOkWWRSqi3u9_-JCnCO6Qu3PVu4ZuAjf0yvE80gBJnToThqv7Ov-UcCs6-j--s9k1eGJge6ef80L9BY6yxb1CbXpEO1Hjk9dR2_',
    cdl: 'CDL-C',
    experience: '1Y',
    status: 'Loading',
    deliveries: 120,
    rating: 4.6
  }
];

interface DispatchersTabProps {
  searchQuery: string;
  setToastMessage: (msg: string | null) => void;
  setSelectedAssignDriver: (driver: any) => void;
}

export const DispatchersTab: React.FC<DispatchersTabProps> = ({
  searchQuery,
  setToastMessage,
  setSelectedAssignDriver,
}) => {
  const [rosterDrivers, setRosterDrivers] = useState<RosterDriver[]>(INITIAL_ROSTER_DRIVERS);
  const [selectedDriverId, setSelectedDriverId] = useState<string | null>(null);
  const [rosterFilter, setRosterFilter] = useState<'all' | 'En Route' | 'Speeding' | 'Idle' | 'Loading'>('all');
  const [showRosterFilterDropdown, setShowRosterFilterDropdown] = useState(false);
  const [showAddDriverModal, setShowAddDriverModal] = useState(false);
  
  const [newDriverName, setNewDriverName] = useState('');
  const [newDriverCdl, setNewDriverCdl] = useState('CDL-A');
  const [newDriverExp, setNewDriverExp] = useState('3Y');
  const [newDriverStatus, setNewDriverStatus] = useState<'En Route' | 'Speeding' | 'Idle' | 'Loading'>('En Route');

  const fetchDrivers = async () => {
    try {
      const response = await axios.get('http://localhost:5184/api/drivers');
      const backendDrivers = response.data.map((d: any) => ({
        id: `drv-${d.driverId}`,
        dbDriverId: d.driverId,
        name: d.fullName,
        avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDVTZMCF_i-FkdjUgiVMM7qw878wswVgznw8W823GDbbcaqIYy3Yuntgc0kY3ZNE9ucjepJuVV9aOOI6bB6PNeCeDyCuyw8zPItkqcc2O4ynuMcSJCRPX0PpOv5LaNn4otd2N-z3_n1adFboz-Mzc597fuknTtfjySRWm2ehR_x6hc9MP3xmQZVuPPzYQI4_Zl-xxJkIZvwbMVTkwmVwkhWSmAtngsRhuO6R2yX97TopRH9KW1GZLQcG3XbL6hY83XgKowo6rPBr43o',
        cdl: d.driverCode,
        experience: '5Y',
        status: d.isBlacklisted ? 'Idle' : 'Idle',
        statusDetails: d.isBlacklisted ? `BLACKLISTED: ${d.blacklistReason}` : 'Đang rảnh / Nghỉ ngơi',
        deliveries: 120,
        rating: 4.8,
        isBlacklisted: d.isBlacklisted,
        blacklistReason: d.blacklistReason
      }));

      setRosterDrivers((prev) => {
        const mockDrivers = prev.filter(driver => !driver.dbDriverId);
        const filteredMock = mockDrivers.filter(mock => !backendDrivers.some((act: any) => act.name === mock.name));
        return [...backendDrivers, ...filteredMock];
      });
    } catch (error) {
      console.error("Lỗi khi tải danh sách tài xế:", error);
    }
  };

  useEffect(() => {
    fetchDrivers();
  }, []);

  const handleToggleDriverBlacklist = async (driverId: string, isChecked: boolean) => {
    const currentDriver = rosterDrivers.find((d) => d.id === driverId);
    if (!currentDriver) return;

    const dbId = currentDriver.dbDriverId;
    if (!dbId) {
      setToastMessage("Không thể thay đổi blacklist cho dữ liệu giả lập (mock data).");
      return;
    }

    let reason: string | null = null;
    if (isChecked) {
      reason = window.prompt("Nhập lý do chặn tài xế này:");
      if (reason === null) {
        return;
      }
      if (!reason.trim()) {
        setToastMessage("Yêu cầu nhập lý do chặn tài xế.");
        return;
      }
    }

    try {
      await axios.post(`http://localhost:5184/api/drivers/${dbId}/blacklist`, {
        isBlacklisted: isChecked,
        blacklistReason: reason
      });

      setToastMessage(
        isChecked
          ? `Đã đưa tài xế ${currentDriver.name} vào danh sách đen.`
          : `Đã gỡ tài xế ${currentDriver.name} khỏi danh sách đen.`
      );

      await fetchDrivers();
    } catch (err: any) {
      console.error(err);
      setToastMessage(`Lỗi cập nhật danh sách đen: ${err.response?.data || err.message}`);
    }
  };

  // Action: Add new driver to roster list
  const handleAddDriver = () => {
    if (!newDriverName.trim()) {
      setToastMessage('Cảnh báo Điều phối: Tên tài xế không được để trống.');
      return;
    }

    const newDriver: RosterDriver = {
      id: `dr-${Date.now()}`,
      name: newDriverName,
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
      cdl: newDriverCdl,
      experience: newDriverExp,
      status: newDriverStatus,
      statusDetails: newDriverStatus === 'Speeding' ? 'Quá tốc độ (Phân khu 4)' : newDriverStatus === 'Idle' ? 'Đang rảnh / Nghỉ ngơi' : undefined,
      deliveries: 0,
      rating: 5.0,
      critical: newDriverStatus === 'Speeding'
    };

    setRosterDrivers((prev) => [newDriver, ...prev]);
    setToastMessage(`Cập nhật danh sách: Đã thêm tài xế ${newDriverName} (${newDriverCdl}) thành công!`);

    // Reset inputs
    setNewDriverName('');
    setShowAddDriverModal(false);
  };

  // Filters mapping - Driver Fleet Roster
  const filteredRosterDrivers = rosterDrivers.filter((driver) => {
    const q = searchQuery.toLowerCase().trim();
    const matchesSearch = !q || (
      driver.name.toLowerCase().includes(q) ||
      driver.cdl.toLowerCase().includes(q) ||
      driver.status.toLowerCase().includes(q)
    );

    if (!matchesSearch) return false;
    if (rosterFilter === 'all') return true;
    return driver.status === rosterFilter;
  });

  const selectedDriver = rosterDrivers.find(d => d.id === selectedDriverId);

  return (
    <div className="flex flex-col gap-gutter h-full min-h-0 relative z-10 transition-all duration-300 overflow-y-auto">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 mt-2 shrink-0 select-none">
        <div>
          <h2 className="font-display-lg text-[22px] md:text-display-lg text-on-surface font-bold">Quản lý Đội ngũ Tài xế</h2>
          <p className="font-body-md text-xs md:text-body-md text-on-surface-variant mt-1">Đo lường thời gian thực và đánh giá hiệu suất đội ngũ.</p>
        </div>
        <div className="flex gap-3">
          <div className="relative">
            <button
              onClick={() => setShowRosterFilterDropdown(!showRosterFilterDropdown)}
              className="glass-panel text-secondary font-data-tabular text-data-tabular px-4 py-2 rounded-lg hover:bg-surface-variant/50 transition-colors flex items-center gap-2 text-xs"
            >
              <span className="material-symbols-outlined text-[18px]">filter_list</span> Bộ lọc: {rosterFilter === 'all' ? 'TẤT CẢ' : rosterFilter === 'En Route' ? 'ĐANG DI CHUYỂN' : rosterFilter === 'Speeding' ? 'QUÁ TỐC ĐỘ' : rosterFilter === 'Idle' ? 'ĐANG RẢNH' : 'ĐANG XẾP HÀNG'}
            </button>

            {showRosterFilterDropdown && (
              <div className="absolute right-0 mt-2 w-48 glass-panel rounded-lg shadow-2xl z-30 border border-outline-variant/30 overflow-hidden animate-fade-in">
                <div className="py-1 bg-surface-container-lowest font-body-md font-semibold">
                  {([
                    { key: 'all', label: 'TẤT CẢ' },
                    { key: 'En Route', label: 'ĐANG DI CHUYỂN' },
                    { key: 'Speeding', label: 'QUÁ TỐC ĐỘ' },
                    { key: 'Idle', label: 'ĐANG RẢNH' },
                    { key: 'Loading', label: 'ĐANG XẾP HÀNG' }
                  ] as const).map((filter) => (
                    <button
                      key={filter.key}
                      onClick={() => {
                        setRosterFilter(filter.key);
                        setShowRosterFilterDropdown(false);
                      }}
                      className={`w-full text-left px-4 py-2 text-xs font-semibold transition-colors hover:bg-primary-container/20 hover:text-primary ${
                        rosterFilter === filter.key ? 'text-primary bg-primary-container/10 border-l-2 border-primary' : 'text-on-surface-variant'
                      }`}
                    >
                      {filter.label}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          <button
            onClick={() => setShowAddDriverModal(true)}
            className="bg-primary-container text-on-primary-container font-data-tabular text-data-tabular px-4 py-2 rounded-lg hover:brightness-110 transition-all flex items-center gap-2 text-xs shadow-[0_0_15px_rgba(37,99,235,0.4)]"
          >
            <span className="material-symbols-outlined text-[18px]">add</span> Thêm Tài xế
          </button>
        </div>
      </div>

      {/* Analytics Grid (Bento Style) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 w-full shrink-0 select-none">
        {/* Metric 1 */}
        <div className="glass-panel p-5 rounded-xl flex flex-col gap-2 relative overflow-hidden group">
          <div className="absolute -right-4 -top-4 w-24 h-24 bg-primary/10 rounded-full blur-xl group-hover:bg-primary/20 transition-all" />
          <div className="flex justify-between items-center z-10">
            <span className="font-label-caps text-label-caps text-on-surface-variant uppercase text-[10px]">Tổng số Tài xế</span>
            <span className="material-symbols-outlined text-primary/70 text-[20px]">group</span>
          </div>
          <div className="flex items-end gap-2 z-10 mt-2">
            <span className="font-display-lg text-display-lg text-on-surface font-bold">{rosterDrivers.length + 138}</span>
            <span className="font-data-tabular text-data-tabular text-secondary mb-1 flex items-center"><span className="material-symbols-outlined text-[14px]">arrow_upward</span> 4%</span>
          </div>
        </div>

        {/* Metric 2 */}
        <div className="glass-panel glow-active p-5 rounded-xl flex flex-col gap-2 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-1 h-full bg-secondary" />
          <div className="flex justify-between items-center z-10">
            <span className="font-label-caps text-label-caps text-on-surface-variant uppercase text-[10px]">Trực tuyến</span>
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-secondary opacity-75" />
              <span className="relative inline-flex rounded-full h-3 w-3 bg-secondary" />
            </span>
          </div>
          <div className="flex items-end gap-2 z-10 mt-2">
            <span className="font-display-lg text-display-lg text-on-surface font-bold">
              {82 + rosterDrivers.filter((d) => d.status !== 'Idle').length}
            </span>
            <span className="font-data-tabular text-data-tabular text-on-surface-variant mb-1">/ {rosterDrivers.length + 138}</span>
          </div>
        </div>

        {/* Metric 3 */}
        <div className="glass-panel p-5 rounded-xl flex flex-col gap-2 relative overflow-hidden">
          <div className="flex justify-between items-center z-10">
            <span className="font-label-caps text-label-caps text-on-surface-variant uppercase text-[10px]">Đang giao hàng</span>
            <span className="material-symbols-outlined text-tertiary-fixed-dim text-[20px]">local_shipping</span>
          </div>
          <div className="flex items-end gap-2 z-10 mt-2">
            <span className="font-display-lg text-display-lg text-on-surface font-bold">
              {61 + rosterDrivers.filter((d) => d.status === 'En Route').length}
            </span>
            <div className="w-full bg-surface-container-highest rounded-full h-1.5 ml-2 mb-2 overflow-hidden">
              <div className="bg-primary-container h-1.5 rounded-full" style={{ width: '74%' }} />
            </div>
          </div>
        </div>

        {/* Metric 4 */}
        <div className="glass-panel border-error-container/50 glow-danger p-5 rounded-xl flex flex-col gap-2 relative overflow-hidden">
          <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-error/10 rounded-full blur-xl" />
          <div className="flex justify-between items-center z-10">
            <span className="font-label-caps text-label-caps text-error uppercase text-[10px]">Vi phạm (24h)</span>
            <span className="material-symbols-outlined text-error text-[20px]">warning</span>
          </div>
          <div className="flex items-end gap-2 z-10 mt-2">
            <span className="font-display-lg text-display-lg text-error font-bold">
              {2 + rosterDrivers.filter((d) => d.status === 'Speeding').length}
            </span>
            <span className="font-data-tabular text-data-tabular text-on-surface-variant mb-1 text-xs">Nghiêm trọng</span>
          </div>
        </div>
      </div>

      {/* Main Data Area split layout */}
      <div className="flex-1 grid grid-cols-1 xl:grid-cols-3 gap-6 w-full min-h-0 pb-8 relative z-10">
        
        {/* Active Roster List (2/3 columns) */}
        <div className="xl:col-span-2 glass-panel rounded-xl flex flex-col overflow-hidden">
          <div className="px-5 py-4 border-b border-outline-variant/10 flex justify-between items-center bg-surface-container-low/30 shrink-0 select-none">
            <h3 className="font-headline-sm text-[16px] md:text-headline-sm text-on-surface font-semibold">Danh sách Hoạt động</h3>
            <div className="flex gap-2">
              <button className="text-on-surface-variant hover:text-secondary transition-colors p-1" title="Tìm kiếm trong danh sách">
                <span className="material-symbols-outlined text-[20px]">search</span>
              </button>
              <button className="text-on-surface-variant hover:text-secondary transition-colors p-1" title="Tùy chọn khác">
                <span className="material-symbols-outlined text-[20px]">more_vert</span>
              </button>
            </div>
          </div>

          <div className="overflow-x-auto flex-1">
            <table className="w-full text-left border-collapse min-w-[550px]">
              <thead>
                <tr className="border-b border-outline-variant/10 bg-surface-container-lowest/50 select-none">
                  <th className="py-3 px-5 font-label-caps text-label-caps text-on-surface-variant uppercase w-10" />
                  <th className="py-3 px-5 font-label-caps text-label-caps text-on-surface-variant uppercase text-[10px] tracking-wider">Chi tiết Tài xế</th>
                  <th className="py-3 px-5 font-label-caps text-label-caps text-on-surface-variant uppercase text-[10px] tracking-wider">Trạng thái</th>
                  <th className="py-3 px-5 font-label-caps text-label-caps text-on-surface-variant uppercase text-right text-[10px] tracking-wider">Đơn hàng đã giao</th>
                  <th className="py-3 px-5 font-label-caps text-label-caps text-on-surface-variant uppercase text-right text-[10px] tracking-wider">Đánh giá</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant/5 font-data-tabular text-data-tabular">
                {filteredRosterDrivers.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="p-8 text-center text-on-surface-variant select-none">
                      <span className="material-symbols-outlined text-[32px] opacity-40 mb-2 block">
                        person_off
                      </span>
                      Không có tài xế hoạt động nào khớp với tiêu chí của bạn.
                    </td>
                  </tr>
                ) : (
                  filteredRosterDrivers.map((driver) => {
                    const isCritical = driver.critical || driver.status === 'Speeding';
                    return (
                      <tr
                        key={driver.id}
                        className={`hover:bg-surface-variant/20 transition-colors group cursor-pointer ${
                          isCritical ? 'bg-error/5 border-l-2 border-error' : ''
                        }`}
                        onClick={() => {
                          setSelectedAssignDriver({
                            name: driver.name,
                            avatar: driver.avatar,
                            rating: driver.rating,
                            distance: driver.status === 'En Route' ? 'Tuyến hoạt động' : 'Đang rảnh',
                            recommended: driver.rating >= 4.9
                          });
                          setSelectedDriverId(driver.id);
                          setToastMessage(`Đã khóa mục tiêu: Chọn định vị tài xế ${driver.name}.`);
                        }}
                      >
                        <td className="py-3 px-5">
                          <div className={`w-8 h-8 rounded-full overflow-hidden border ${isCritical ? 'border-error/50' : 'border-outline-variant/30'}`}>
                            <img alt={driver.name} className="w-full h-full object-cover" src={driver.avatar} />
                          </div>
                        </td>
                        <td className="py-3 px-5">
                          <div className="font-data-tabular text-data-tabular text-on-surface font-semibold group-hover:text-primary transition-colors">
                            {driver.name}
                          </div>
                          <div className="font-label-caps text-label-caps text-on-surface-variant/60 mt-1 select-none text-[9px] font-bold">
                            {driver.cdl} • EXP: {driver.experience}
                          </div>
                        </td>
                        <td className="py-3 px-5 select-none">
                          {driver.status === 'En Route' && (
                            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded border border-secondary/30 bg-secondary/10 text-secondary font-label-caps text-[9px] font-bold">
                              <span className="w-1.5 h-1.5 rounded-full bg-secondary animate-pulse" />
                              Đang di chuyển
                            </span>
                          )}
                          {driver.status === 'Loading' && (
                            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded border border-secondary/30 bg-secondary/10 text-secondary font-label-caps text-[9px] font-bold">
                              <span className="w-1.5 h-1.5 rounded-full bg-secondary animate-pulse" />
                              Đang xếp hàng
                            </span>
                          )}
                          {driver.status === 'Speeding' && (
                            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded border border-error/30 bg-error/10 text-error font-label-caps text-[9px] font-bold animate-pulse">
                              <span className="material-symbols-outlined text-[11px]" style={{ fontVariationSettings: "'FILL' 1" }}>warning</span>
                              {driver.statusDetails || 'Quá tốc độ'}
                            </span>
                          )}
                          {driver.status === 'Idle' && (
                            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded border border-outline-variant/30 bg-surface-variant/30 text-on-surface-variant font-label-caps text-[9px]">
                              {driver.statusDetails || 'Đang rảnh / Nghỉ ngơi'}
                            </span>
                          )}
                        </td>
                        <td className="py-3 px-5 text-right font-medium text-on-surface">
                          {driver.deliveries.toLocaleString()}
                        </td>
                        <td className="py-3 px-5 text-right text-on-surface">
                          <div className="flex justify-end items-center gap-1">
                            {driver.rating.toFixed(1)}{' '}
                            <span className="material-symbols-outlined text-[13px] text-yellow-500" style={{ fontVariationSettings: "'FILL' 1" }}>
                              star
                            </span>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          <div className="px-5 py-3 border-t border-outline-variant/10 flex justify-between items-center text-on-surface-variant text-xs select-none shrink-0 mt-auto">
            <span>Hiển thị 1-{filteredRosterDrivers.length} trên {rosterDrivers.length + 138}</span>
            <div className="flex gap-1">
              <button className="p-1 hover:text-on-surface text-on-surface-variant/65"><span className="material-symbols-outlined text-[18px]">chevron_left</span></button>
              <button className="p-1 hover:text-on-surface text-on-surface-variant/65"><span className="material-symbols-outlined text-[18px]">chevron_right</span></button>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Selected Driver Details & AI Panel */}
        <div className="flex flex-col gap-6 select-none overflow-y-auto">
          {selectedDriver && (
            <div className="glass-panel rounded-xl p-5 flex flex-col relative overflow-hidden select-none border border-outline-variant/20 animate-fade-in text-left">
              <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
                <span className="material-symbols-outlined text-[80px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                  person
                </span>
              </div>
              <h3 className="font-headline-sm text-headline-sm text-secondary flex items-center gap-2 mb-4 font-semibold">
                <span className="material-symbols-outlined">badge</span> Chi tiết Tài xế
              </h3>

              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-full overflow-hidden border border-outline-variant/30">
                  <img alt={selectedDriver.name} className="w-full h-full object-cover" src={selectedDriver.avatar} />
                </div>
                <div>
                  <h4 className="font-bold text-on-surface text-base">{selectedDriver.name}</h4>
                  <p className="text-[10px] font-bold text-on-surface-variant/60 font-label-caps uppercase mt-0.5">
                    Mã: {selectedDriver.cdl}
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between p-2.5 rounded bg-surface-variant/10 border border-outline-variant/10">
                  <span className="text-xs text-on-surface font-semibold">Đánh giá</span>
                  <span className="text-xs text-on-surface font-bold flex items-center gap-0.5 font-data-tabular">
                    {selectedDriver.rating.toFixed(1)}{' '}
                    <span className="material-symbols-outlined text-[13px] text-yellow-500" style={{ fontVariationSettings: "'FILL' 1" }}>
                      star
                    </span>
                  </span>
                </div>

                {/* Blacklist Control */}
                <div className="border-t border-outline-variant/20 pt-4">
                  <span className="text-[10px] font-label-caps text-on-surface-variant uppercase mb-2 block font-bold tracking-wider">
                    Kiểm soát Danh sách Đen
                  </span>
                  <div className="flex items-center justify-between p-3 rounded bg-surface-variant/10 border border-outline-variant/10">
                    <div className="flex flex-col">
                      <span className="text-xs text-on-surface font-semibold font-bold">Chặn tài xế này</span>
                      {selectedDriver.isBlacklisted && (
                        <span className="text-[10px] text-error mt-0.5 max-w-[200px] break-words font-semibold">
                          Lý do: {selectedDriver.blacklistReason || 'Không có'}
                        </span>
                      )}
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        className="sr-only peer"
                        checked={selectedDriver.isBlacklisted || false}
                        disabled={!selectedDriver.dbDriverId}
                        onChange={(e) => handleToggleDriverBlacklist(selectedDriver.id, e.target.checked)}
                      />
                      <div className="w-9 h-5 bg-surface-variant peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-on-surface after:border-outline-variant after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-error peer-checked:after:bg-white"></div>
                    </label>
                  </div>
                  {!selectedDriver.dbDriverId && (
                    <span className="text-[9px] text-on-surface-variant/50 mt-1 block italic text-center">
                      (Không khả dụng với tài xế giả lập)
                    </span>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* AI Evaluation Side Panel */}
          <div className="glass-panel rounded-xl flex flex-col p-5 relative overflow-hidden select-none">
            <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
              <span className="material-symbols-outlined text-[100px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                memory
              </span>
            </div>
            
            <h3 className="font-headline-sm text-headline-sm text-primary flex items-center gap-2 mb-6 font-semibold select-none">
              <span className="material-symbols-outlined">smart_toy</span> Phân tích Hạm đội AI
            </h3>

            <div className="flex flex-col gap-6 relative z-10">
              <div>
                <div className="flex justify-between items-end mb-2">
                  <span className="font-label-caps text-label-caps text-on-surface-variant text-[10px]">Điểm An toàn Hạm đội Tổng thể</span>
                  <span className="font-display-lg text-display-lg text-secondary font-bold text-2xl">
                    92<span className="text-sm text-on-surface-variant">/100</span>
                  </span>
                </div>
                <div className="w-full bg-surface-container-highest rounded-full h-1.5 overflow-hidden">
                  <div className="bg-secondary h-1.5 rounded-full shadow-[0_0_10px_rgba(76,215,246,0.5)]" style={{ width: '92%' }} />
                </div>
              </div>

              <div className="space-y-4 font-body-md">
                <h4 className="font-label-caps text-label-caps text-on-surface-variant uppercase border-b border-outline-variant/20 pb-2 text-[9px] tracking-wider font-bold">Chỉ số chính</h4>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-[16px] text-tertiary-fixed-dim">speed</span>
                    <span className="font-data-tabular text-data-tabular text-on-surface text-xs font-semibold">Tuân thủ Tốc độ</span>
                  </div>
                  <span className="font-data-tabular text-data-tabular text-secondary text-sm font-bold">95%</span>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-[16px] text-tertiary-fixed-dim">route</span>
                    <span className="font-data-tabular text-data-tabular text-on-surface text-xs font-semibold">Bám sát Lộ trình</span>
                  </div>
                  <span className="font-data-tabular text-data-tabular text-secondary text-sm font-bold">88%</span>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-[16px] text-tertiary-fixed-dim">timer</span>
                    <span className="font-data-tabular text-data-tabular text-on-surface text-xs font-semibold">Tỷ lệ Đúng giờ</span>
                  </div>
                  <span className="font-data-tabular text-data-tabular text-secondary text-sm font-bold">91%</span>
                </div>
              </div>

              <div className="pt-4 border-t border-outline-variant/20 mt-4">
                <div className="bg-surface-variant/20 border border-outline-variant/25 rounded-lg p-3.5 flex gap-3 text-left">
                  <span className="material-symbols-outlined text-primary mt-0.5 text-[18px]">tips_and_updates</span>
                  <p className="font-body-md text-body-md text-on-surface-variant text-[12px] leading-snug">
                    <span className="text-on-surface font-semibold block mb-1">Đề xuất từ AI</span>
                    Giám sát Tuyến 4B. Phát hiện thời tiết bất thường. Đề xuất đổi lộ trình chủ động cho 3 tài xế đang hoạt động.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* DYNAMIC Add Driver Dialog Overlay inside view context */}
      {showAddDriverModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in pointer-events-auto">
          <div className="w-full max-w-md glass-panel rounded-xl overflow-hidden border border-outline-variant/30 shadow-2xl animate-scale-up">
            <div className="p-4 border-b border-white/10 flex justify-between items-center bg-primary-container/10">
              <h3 className="font-headline-sm text-headline-sm font-bold text-primary flex items-center gap-2">
                <span className="material-symbols-outlined text-[20px] text-primary">person_add</span>
                Đăng ký Tài xế mới
              </h3>
              <button onClick={() => setShowAddDriverModal(false)} className="text-on-surface-variant hover:text-error transition-colors p-1">
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            <div className="p-5 flex flex-col gap-4 text-left font-body-md">
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider">Tên tài xế</label>
                <input
                  type="text"
                  className="bg-black/30 border border-outline-variant/40 rounded-lg p-2.5 text-on-surface text-xs focus:outline-none focus:ring-1 focus:ring-secondary/50 focus:border-secondary/50 transition-all placeholder-on-surface-variant/45"
                  placeholder="Ví dụ: Marcus Chen, Tom Wilson..."
                  value={newDriverName}
                  onChange={(e) => setNewDriverName(e.target.value)}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider">Hạng CDL</label>
                  <select
                    className="bg-black/40 border border-outline-variant/40 rounded-lg p-2.5 text-on-surface text-xs focus:outline-none focus:ring-1 focus:ring-secondary/50 focus:border-secondary/50 transition-all"
                    value={newDriverCdl}
                    onChange={(e) => setNewDriverCdl(e.target.value)}
                  >
                    <option value="CDL-A">Hạng CDL A</option>
                    <option value="CDL-B">Hạng CDL B</option>
                    <option value="CDL-C">Hạng CDL C</option>
                  </select>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider">Kinh nghiệm</label>
                  <input
                    type="text"
                    className="bg-black/30 border border-outline-variant/40 rounded-lg p-2.5 text-on-surface text-xs focus:outline-none focus:ring-1 focus:ring-secondary/50 focus:border-secondary/50 transition-all placeholder-on-surface-variant/45"
                    placeholder="Ví dụ: 5 năm, 12 năm..."
                    value={newDriverExp}
                    onChange={(e) => setNewDriverExp(e.target.value)}
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider">Trạng thái Điều phối</label>
                <select
                  className="bg-black/40 border border-outline-variant/40 rounded-lg p-2.5 text-on-surface text-xs focus:outline-none focus:ring-1 focus:ring-secondary/50 focus:border-secondary/50 transition-all"
                  value={newDriverStatus}
                  onChange={(e) => setNewDriverStatus(e.target.value as any)}
                >
                  <option value="En Route">Đang di chuyển (Lái xe)</option>
                  <option value="Idle">Đang rảnh (Nghỉ ngơi)</option>
                  <option value="Loading">Đang xếp hàng tại bến</option>
                  <option value="Speeding">Vi phạm quá tốc độ</option>
                </select>
              </div>

              <button
                onClick={handleAddDriver}
                className="mt-2 bg-primary-container text-white py-2.5 rounded-lg text-sm font-bold tracking-wider hover:brightness-110 active:scale-[0.98] transition-all shadow-[0_0_15px_rgba(37,99,235,0.45)] flex items-center justify-center gap-1.5"
              >
                <span className="material-symbols-outlined text-[18px]">how_to_reg</span>
                THÊM VÀO ROSTER
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DispatchersTab;
