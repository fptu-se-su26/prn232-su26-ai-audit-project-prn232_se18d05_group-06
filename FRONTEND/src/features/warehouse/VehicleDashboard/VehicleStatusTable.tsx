import React, { useState, useMemo, useEffect } from 'react';
import { VehicleStatusItem } from '../../../types/vehicleDashboard';
import { format } from 'date-fns';
import { Search, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, Edit, X, Save } from 'lucide-react';
import { updateVehicleStatus, getDocksByWarehouse, DockInfo } from '../../../lib/api/vehicleDashboard';

interface VehicleStatusTableProps {
  vehicleList: VehicleStatusItem[];
  selectedStatus: string | null;
  onStatusChange: (status: string | null) => void;
  loading?: boolean;
  onRefresh?: () => void;
}

const PAGE_SIZE = 20;

const statusStyles: Record<string, string> = {
  SCHEDULED: 'bg-blue-100 text-blue-800',
  WAITING: 'bg-orange-100 text-orange-800',
  UNLOADING: 'bg-purple-100 text-purple-800',
  LOADING: 'bg-indigo-100 text-indigo-800',
  COMPLETED: 'bg-green-100 text-green-800',
  DEPARTED: 'bg-gray-100 text-gray-800',
};

const statusLabels: Record<string, string> = {
  SCHEDULED: 'Đã đặt lịch',
  WAITING: 'Đang chờ',
  UNLOADING: 'Đang hạ hàng',
  LOADING: 'Đang lấy hàng',
  COMPLETED: 'Hoàn thành',
  DEPARTED: 'Đã rời kho',
};

export const VehicleStatusTable: React.FC<VehicleStatusTableProps> = ({ 
  vehicleList, 
  selectedStatus, 
  onStatusChange, 
  loading,
  onRefresh
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  
  // Edit modal states
  const [editingItem, setEditingItem] = useState<VehicleStatusItem | null>(null);
  const [newStatus, setNewStatus] = useState<string>('');
  const [newDock, setNewDock] = useState<string>('');
  const [docks, setDocks] = useState<DockInfo[]>([]);
  const [isUpdating, setIsUpdating] = useState(false);
  const [updateError, setUpdateError] = useState<string | null>(null);

  const filteredList = useMemo(() => {
    setCurrentPage(1);
    return vehicleList.filter(item => {
      if (!searchTerm) return true;
      const term = searchTerm.toLowerCase();
      return (
        item.bookingCode.toLowerCase().includes(term) ||
        (item.truckPlate && item.truckPlate.toLowerCase().includes(term)) ||
        (item.driverName && item.driverName.toLowerCase().includes(term))
      );
    });
  }, [vehicleList, searchTerm]);

  const totalPages = Math.max(1, Math.ceil(filteredList.length / PAGE_SIZE));
  const paginatedList = filteredList.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  // Fetch docks when editing an item and new status is UNLOADING or LOADING
  useEffect(() => {
    if (editingItem && (newStatus === 'UNLOADING' || newStatus === 'LOADING')) {
      getDocksByWarehouse(editingItem.warehouseId)
        .then(data => {
          setDocks(data);
          // Set initial dock selection if it matches current dock
          if (editingItem.dockCode && data.some(d => d.dockCode === editingItem.dockCode)) {
            setNewDock(editingItem.dockCode);
          } else if (data.length > 0) {
            setNewDock(data[0].dockCode);
          }
        })
        .catch(err => {
          console.error("Failed to fetch docks:", err);
        });
    } else {
      setDocks([]);
      setNewDock('');
    }
  }, [editingItem, newStatus]);

  const handleOpenEdit = (item: VehicleStatusItem) => {
    setEditingItem(item);
    setNewStatus(item.status || 'SCHEDULED');
    setNewDock(item.dockCode || '');
    setUpdateError(null);
  };

  const handleCloseEdit = () => {
    setEditingItem(null);
    setNewStatus('');
    setNewDock('');
    setUpdateError(null);
  };

  const handleSaveStatus = async () => {
    if (!editingItem) return;
    setIsUpdating(true);
    setUpdateError(null);
    try {
      await updateVehicleStatus(editingItem.bookingId, newStatus, newStatus === 'UNLOADING' || newStatus === 'LOADING' ? newDock : undefined);
      handleCloseEdit();
      if (onRefresh) onRefresh();
    } catch (err: any) {
      setUpdateError(err.message || 'Cập nhật trạng thái thất bại. Vui lòng thử lại.');
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
      {/* Header */}
      <div className="p-4 border-b border-gray-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h3 className="text-lg font-semibold text-gray-800">
          Danh sách phương tiện
          <span className="ml-2 text-sm font-normal text-gray-500">({filteredList.length} kết quả)</span>
        </h3>

        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search size={16} className="text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Tìm BSX, Mã Booking..."
              className="pl-9 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 w-full sm:w-64"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              aria-label="Tìm kiếm phương tiện"
            />
          </div>

          <select
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={selectedStatus || ''}
            onChange={(e) => onStatusChange(e.target.value || null)}
            aria-label="Lọc theo trạng thái"
          >
            <option value="">Tất cả trạng thái</option>
            <option value="SCHEDULED">Đã đặt lịch</option>
            <option value="WAITING">Đang chờ</option>
            <option value="UNLOADING">Đang hạ hàng</option>
            <option value="LOADING">Đang lấy hàng</option>
            <option value="COMPLETED">Hoàn thành</option>
            <option value="DEPARTED">Đã rời kho</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm whitespace-nowrap" role="table" aria-label="Danh sách trạng thái phương tiện">
          <thead className="bg-gray-50 text-gray-600 font-medium">
            <tr>
              <th className="px-6 py-3" scope="col">Mã Booking</th>
              <th className="px-6 py-3" scope="col">Biển Số Xe</th>
              <th className="px-6 py-3" scope="col">Tài Xế</th>
              <th className="px-6 py-3" scope="col">Khách Hàng</th>
              <th className="px-6 py-3" scope="col">Trạng Thái</th>
              <th className="px-6 py-3" scope="col">Giờ Check-in</th>
              <th className="px-6 py-3" scope="col">Dock</th>
              <th className="px-6 py-3 text-center" scope="col">Thao tác</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {loading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <tr key={i} className="animate-pulse">
                  <td className="px-6 py-4"><div className="h-4 bg-gray-200 rounded w-20"></div></td>
                  <td className="px-6 py-4"><div className="h-4 bg-gray-200 rounded w-24"></div></td>
                  <td className="px-6 py-4"><div className="h-4 bg-gray-200 rounded w-32"></div></td>
                  <td className="px-6 py-4"><div className="h-4 bg-gray-200 rounded w-32"></div></td>
                  <td className="px-6 py-4"><div className="h-6 bg-gray-200 rounded-full w-24"></div></td>
                  <td className="px-6 py-4"><div className="h-4 bg-gray-200 rounded w-16"></div></td>
                  <td className="px-6 py-4"><div className="h-4 bg-gray-200 rounded w-16"></div></td>
                  <td className="px-6 py-4"><div className="h-4 bg-gray-200 rounded w-12 mx-auto"></div></td>
                </tr>
              ))
            ) : paginatedList.length > 0 ? (
              paginatedList.map((item) => (
                <tr key={item.bookingId} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 font-medium text-gray-900">{item.bookingCode}</td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col">
                      <span className="font-medium">{item.truckPlate || '-'}</span>
                      {item.trailerPlate && <span className="text-xs text-gray-500">Rờ moóc: {item.trailerPlate}</span>}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-gray-600">{item.driverName || '-'}</td>
                  <td className="px-6 py-4 text-gray-600">{item.customerName || '-'}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${item.status ? statusStyles[item.status] : 'bg-gray-100 text-gray-800'}`}>
                      {item.status ? (statusLabels[item.status] || item.status) : 'Unknown'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-gray-600">
                    {item.checkInAt ? format(new Date(item.checkInAt), 'HH:mm') : '-'}
                  </td>
                  <td className="px-6 py-4 text-gray-600">
                    {item.dockCode ? (
                       <div className="flex flex-col">
                         <span className="font-medium">{item.dockCode}</span>
                         <span className="text-xs text-gray-500">{item.dockName}</span>
                       </div>
                    ) : '-'}
                  </td>
                  <td className="px-6 py-4 text-center">
                    <button
                      onClick={() => handleOpenEdit(item)}
                      className="p-1 text-blue-600 hover:text-blue-950 hover:bg-blue-50 rounded transition-colors inline-flex items-center gap-1.5 text-xs font-semibold"
                      title="Chỉnh sửa trạng thái"
                    >
                      <Edit size={14} />
                      Đổi trạng thái
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={8} className="px-6 py-12 text-center text-gray-500">
                  <div className="flex flex-col items-center gap-2">
                    <Search size={40} className="text-gray-300" />
                    <p className="font-medium">Không tìm thấy dữ liệu phương tiện</p>
                    <p className="text-sm">Thử thay đổi bộ lọc hoặc ngày tìm kiếm</p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {!loading && filteredList.length > PAGE_SIZE && (
        <div className="px-6 py-4 border-t border-gray-200 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-sm text-gray-500">
            Hiển thị {(currentPage - 1) * PAGE_SIZE + 1}–{Math.min(currentPage * PAGE_SIZE, filteredList.length)} trong {filteredList.length} kết quả
          </p>

          <div className="flex items-center gap-1">
            <button
              onClick={() => setCurrentPage(1)}
              disabled={currentPage === 1}
              className="p-2 rounded-lg hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              aria-label="Trang đầu"
            >
              <ChevronsLeft size={16} />
            </button>
            <button
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="p-2 rounded-lg hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              aria-label="Trang trước"
            >
              <ChevronLeft size={16} />
            </button>

            {Array.from({ length: totalPages }, (_, i) => i + 1)
              .filter(page => page === 1 || page === totalPages || Math.abs(page - currentPage) <= 1)
              .reduce<(number | 'ellipsis')[]>((acc, page, idx, arr) => {
                if (idx > 0 && page - (arr[idx - 1]) > 1) {
                  acc.push('ellipsis');
                }
                acc.push(page);
                return acc;
              }, [])
              .map((page, idx) =>
                page === 'ellipsis' ? (
                  <span key={`e-${idx}`} className="px-2 text-gray-400">…</span>
                ) : (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={`min-w-[36px] h-9 rounded-lg text-sm font-medium transition-colors ${
                      currentPage === page
                        ? 'bg-blue-500 text-white'
                        : 'hover:bg-gray-100 text-gray-600'
                    }`}
                  >
                    {page}
                  </button>
                )
              )}

            <button
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="p-2 rounded-lg hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              aria-label="Trang tiếp"
            >
              <ChevronRight size={16} />
            </button>
            <button
              onClick={() => setCurrentPage(totalPages)}
              disabled={currentPage === totalPages}
              className="p-2 rounded-lg hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              aria-label="Trang cuối"
            >
              <ChevronsRight size={16} />
            </button>
          </div>
        </div>
      )}

      {/* Edit Status Modal */}
      {editingItem && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="p-4 border-b border-gray-200 flex items-center justify-between bg-gray-50">
              <h4 className="font-semibold text-gray-800">Cập nhật trạng thái xe</h4>
              <button 
                onClick={handleCloseEdit}
                className="p-1 hover:bg-gray-200 rounded-full transition-colors text-gray-500"
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Mã Booking</label>
                <p className="text-sm font-medium text-gray-800">{editingItem.bookingCode}</p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Biển số xe</label>
                <p className="text-sm font-medium text-gray-800">{editingItem.truckPlate || '-'}</p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Trạng thái mới</label>
                <select
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value)}
                  className="w-full mt-1 border border-gray-300 rounded-lg p-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                >
                  <option value="SCHEDULED">Đã đặt lịch (SCHEDULED)</option>
                  <option value="WAITING">Đang chờ (WAITING)</option>
                  <option value="UNLOADING">Đang hạ hàng (UNLOADING)</option>
                  <option value="LOADING">Đang lấy hàng (LOADING)</option>
                  <option value="COMPLETED">Hoàn thành (COMPLETED)</option>
                  <option value="DEPARTED">Đã rời kho (DEPARTED)</option>
                </select>
              </div>

              {/* Show dock assignment input if unloading or loading */}
              {(newStatus === 'UNLOADING' || newStatus === 'LOADING') && (
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Cửa kho (Dock)</label>
                  {docks.length > 0 ? (
                    <select
                      value={newDock}
                      onChange={(e) => setNewDock(e.target.value)}
                      className="w-full mt-1 border border-gray-300 rounded-lg p-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                    >
                      {docks.map(d => (
                        <option key={d.dockId} value={d.dockCode}>
                          {d.dockCode} - {d.dockName || 'Cửa kho'}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <p className="text-xs text-amber-600 mt-1">Không có cửa kho khả dụng hoặc đang tải dữ liệu...</p>
                  )}
                </div>
              )}

              {updateError && (
                <p className="text-xs text-red-600 bg-red-50 p-2.5 rounded-lg border border-red-150">{updateError}</p>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-gray-200 bg-gray-50 flex items-center justify-end gap-3">
              <button
                onClick={handleCloseEdit}
                disabled={isUpdating}
                className="px-4 py-2 border border-gray-300 text-gray-700 hover:bg-gray-150 rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
              >
                Hủy
              </button>
              <button
                onClick={handleSaveStatus}
                disabled={isUpdating || ((newStatus === 'UNLOADING' || newStatus === 'LOADING') && !newDock)}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors flex items-center gap-1.5 disabled:opacity-50"
              >
                {isUpdating ? 'Đang cập nhật...' : (
                  <>
                    <Save size={16} />
                    Lưu thay đổi
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
