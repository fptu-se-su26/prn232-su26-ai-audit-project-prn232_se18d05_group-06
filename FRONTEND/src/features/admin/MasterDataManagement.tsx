import React, { useEffect, useMemo, useState } from 'react';
import AdminSidebar from '@components/AdminSidebar';
import api from '../../lib/api';

export type MasterCategoryDto = {
  categoryId: number;
  categoryType: string;
  code: string;
  nameVn: string;
  nameEn?: string | null;
  sortOrder?: number | null;
  isActive?: boolean | null;
  isReadOnly: boolean;
};

type CategoryTab = {
  id: string;
  label: string;
  icon: string;
  isReadOnly: boolean;
  safetyModeVn: string;
};

const CATEGORY_TABS: CategoryTab[] = [
  { id: 'UOM', label: 'Đơn vị đo', icon: 'square_foot', isReadOnly: false, safetyModeVn: 'Có thể chỉnh sửa' },
  { id: 'CARGO_TYPE', label: 'Loại hàng', icon: 'category', isReadOnly: false, safetyModeVn: 'Chỉ khóa/kích hoạt' },
  { id: 'VEHICLE_TYPE', label: 'Loại phương tiện', icon: 'local_shipping', isReadOnly: false, safetyModeVn: 'Có thể chỉnh sửa' },
  { id: 'REGION', label: 'Khu vực', icon: 'map', isReadOnly: false, safetyModeVn: 'Có thể chỉnh sửa' },
  { id: 'ORDER_STATUS', label: 'Trạng thái đơn', icon: 'fact_check', isReadOnly: true, safetyModeVn: 'Hệ thống - chỉ xem' },
  { id: 'VEHICLE_STATUS', label: 'Trạng thái xe', icon: 'published_with_changes', isReadOnly: true, safetyModeVn: 'Hệ thống - chỉ xem' },
  { id: 'SERVICE_TYPE', label: 'Loại dịch vụ', icon: 'design_services', isReadOnly: false, safetyModeVn: 'Chỉ khóa/kích hoạt' },
];

const MasterDataManagement: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string>('UOM');
  const [items, setItems] = useState<MasterCategoryDto[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null);
  const [feedbackError, setFeedbackError] = useState<string | null>(null);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<MasterCategoryDto | null>(null);
  const [modalForm, setModalForm] = useState({
    code: '',
    nameVn: '',
    nameEn: '',
    sortOrder: 0,
    isActive: true,
  });

  const currentTabInfo = useMemo(
    () => CATEGORY_TABS.find((tab) => tab.id === activeTab) || CATEGORY_TABS[0],
    [activeTab]
  );

  useEffect(() => {
    void loadMasterData(activeTab);
  }, [activeTab]);

  const loadMasterData = async (categoryType: string) => {
    setLoading(true);
    setFeedbackError(null);
    setFeedbackMessage(null);
    try {
      const response = await api.get<MasterCategoryDto[]>(`/master-data?categoryType=${categoryType}`);
      setItems(response.data);
    } catch (error: any) {
      console.error('Failed to load master data', error);
      setFeedbackError(error?.response?.data?.message || 'Không thể tải dữ liệu danh mục.');
    } finally {
      setLoading(false);
    }
  };

  const filteredItems = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    return items.filter((item) => {
      const matchesSearch =
        !term ||
        item.code.toLowerCase().includes(term) ||
        item.nameVn.toLowerCase().includes(term) ||
        (item.nameEn && item.nameEn.toLowerCase().includes(term));
      const matchesStatus =
        statusFilter === 'all' ||
        (statusFilter === 'active' ? item.isActive !== false : item.isActive === false);
      return matchesSearch && matchesStatus;
    });
  }, [items, searchTerm, statusFilter]);

  const openCreateModal = () => {
    if (currentTabInfo.isReadOnly) {
      setFeedbackError('Danh mục này là trạng thái hệ thống chỉ xem và không thể thêm mới.');
      return;
    }
    setEditingItem(null);
    setModalForm({
      code: '',
      nameVn: '',
      nameEn: '',
      sortOrder: (items.length + 1) * 10,
      isActive: true,
    });
    setFeedbackError(null);
    setFeedbackMessage(null);
    setIsModalOpen(true);
  };

  const openEditModal = (item: MasterCategoryDto) => {
    if (item.isReadOnly || currentTabInfo.isReadOnly) {
      setFeedbackError('Danh mục này là trạng thái hệ thống chỉ xem và không thể chỉnh sửa.');
      return;
    }
    setEditingItem(item);
    setModalForm({
      code: item.code,
      nameVn: item.nameVn,
      nameEn: item.nameEn || '',
      sortOrder: item.sortOrder ?? 0,
      isActive: item.isActive !== false,
    });
    setFeedbackError(null);
    setFeedbackMessage(null);
    setIsModalOpen(true);
  };

  const handleSaveModal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (currentTabInfo.isReadOnly) return;

    if (!modalForm.nameVn.trim()) {
      setFeedbackError('Tên tiếng Việt không được để trống.');
      return;
    }

    if (!editingItem && !modalForm.code.trim()) {
      setFeedbackError('Mã không được để trống.');
      return;
    }

    setSaving(true);
    setFeedbackError(null);
    setFeedbackMessage(null);

    try {
      if (editingItem) {
        // PUT update
        const response = await api.put<MasterCategoryDto>(`/master-data/${editingItem.categoryId}`, {
          nameVn: modalForm.nameVn.trim(),
          nameEn: modalForm.nameEn.trim() || null,
          sortOrder: Number(modalForm.sortOrder) || 0,
          isActive: modalForm.isActive,
        });
        setItems((prev) =>
          prev.map((i) => (i.categoryId === response.data.categoryId ? response.data : i))
        );
        setFeedbackMessage(`Cập nhật '${response.data.nameVn}' thành công.`);
      } else {
        // POST create
        const response = await api.post<MasterCategoryDto>('/master-data', {
          categoryType: activeTab,
          code: modalForm.code.trim().toUpperCase(),
          nameVn: modalForm.nameVn.trim(),
          nameEn: modalForm.nameEn.trim() || null,
          sortOrder: Number(modalForm.sortOrder) || 0,
          isActive: modalForm.isActive,
        });
        setItems((prev) => [...prev, response.data]);
        setFeedbackMessage(`Tạo mới mã '${response.data.code}' thành công.`);
      }
      setIsModalOpen(false);
    } catch (error: any) {
      console.error('Failed to save master category item', error);
      setFeedbackError(error?.response?.data?.message || 'Lỗi khi lưu thông tin danh mục.');
    } finally {
      setSaving(false);
    }
  };

  const handleToggleStatus = async (item: MasterCategoryDto) => {
    if (item.isReadOnly || currentTabInfo.isReadOnly) {
      setFeedbackError('Danh mục này là trạng thái hệ thống chỉ xem và không thể thay đổi trạng thái.');
      return;
    }

    const newStatus = !item.isActive;
    try {
      const response = await api.patch<MasterCategoryDto>(`/master-data/${item.categoryId}/status`, {
        isActive: newStatus,
      });
      setItems((prev) =>
        prev.map((i) => (i.categoryId === response.data.categoryId ? response.data : i))
      );
      setFeedbackMessage(
        `Đã ${newStatus ? 'chuyển sang đang hoạt động' : 'chuyển sang ngưng hoạt động'} danh mục '${item.nameVn}'.`
      );
    } catch (error: any) {
      console.error('Failed to toggle status', error);
      setFeedbackError(error?.response?.data?.message || 'Lỗi khi cập nhật trạng thái.');
    }
  };

  return (
    <div className="bg-background text-on-background antialiased min-h-screen overflow-x-hidden flex selection:bg-primary/20 selection:text-primary relative">
      {/* Background Ambient Glow */}
      <div className="fixed inset-0 z-[-1] pointer-events-none opacity-40">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/10 rounded-full blur-[120px]"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[30%] h-[30%] bg-tertiary/10 rounded-full blur-[100px]"></div>
      </div>

      {/* SideNavBar */}
      <AdminSidebar />

      {/* Main Content Area */}
      <main className="flex-1 ml-0 md:ml-[280px] min-h-screen flex flex-col relative">
        {/* Top Header Bar */}
        <header className="hidden md:flex justify-between items-center w-full px-container-padding py-stack-md bg-surface/70 backdrop-blur-md shadow-sm docked full-width top-0 sticky z-40">
          <div className="flex items-center gap-4">
            <h1 className="font-headline-sm text-headline-sm font-bold text-on-surface tracking-tight">
              SmartLog AI Operations Center
            </h1>
          </div>
        </header>

        {/* Page Content Canvas */}
        <div className="flex-1 w-full max-w-[1600px] mx-auto px-container-padding py-stack-lg flex flex-col gap-stack-lg">
          {/* Header Title Section */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-[18px] bg-gradient-to-br from-primary/20 to-tertiary/20 flex items-center justify-center text-primary border border-primary/20 shadow-sm">
                  <span className="material-symbols-outlined text-[28px]">database</span>
                </div>
                <div>
                  <h2 className="font-display-lg text-display-lg text-on-surface">
                    Quản lý danh mục dùng chung
                  </h2>
                  <p className="font-body-lg text-body-lg text-secondary mt-0.5">
                    Quản lý các danh mục nền tảng dùng chung cho vận hành, CRM và BI.
                  </p>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              {!currentTabInfo.isReadOnly && (
                <button
                  type="button"
                  onClick={openCreateModal}
                  className="h-[48px] px-6 rounded-[18px] bg-gradient-to-r from-primary to-tertiary-fixed-dim text-on-primary font-body-md font-semibold shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30 hover:-translate-y-0.5 transition-all flex items-center gap-2"
                >
                  <span className="material-symbols-outlined text-[20px]">add_circle</span>
                  Thêm mới {currentTabInfo.label}
                </button>
              )}
            </div>
          </div>

          {/* Feedback Alert Banners */}
          {feedbackMessage && (
            <div className="rounded-[18px] border border-tertiary/30 bg-tertiary/10 px-4 py-3 text-sm font-medium text-tertiary flex items-center gap-2">
              <span className="material-symbols-outlined text-[20px]">check_circle</span>
              {feedbackMessage}
            </div>
          )}

          {feedbackError && (
            <div className="rounded-[18px] border border-error/30 bg-error/10 px-4 py-3 text-sm font-medium text-error flex items-center gap-2">
              <span className="material-symbols-outlined text-[20px]">warning</span>
              {feedbackError}
            </div>
          )}

          {/* Category Tabs */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-outline-variant/20 scrollbar-none">
            {CATEGORY_TABS.map((tab) => {
              const isActive = tab.id === activeTab;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-4 py-3 rounded-[16px] text-sm font-bold transition-all whitespace-nowrap ${
                    isActive
                      ? 'bg-primary text-on-primary shadow-md shadow-primary/20 scale-[1.02]'
                      : 'bg-surface-container-lowest/60 text-secondary hover:bg-surface-variant/50 hover:text-on-surface border border-outline-variant/20'
                  }`}
                >
                  <span className="material-symbols-outlined text-[20px]">{tab.icon}</span>
                  <span>{tab.label}</span>
                  {tab.isReadOnly && (
                    <span className="ml-1 text-[10px] px-2 py-0.5 rounded-full bg-slate-900/30 text-amber-200 border border-amber-400/30 uppercase font-extrabold tracking-wider">
                      Chỉ xem
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Current Category Info & Data Source Helper Banner */}
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 p-4 rounded-[20px] bg-surface-container-lowest/80 border border-white/40 shadow-sm">
            <div className="flex items-center gap-3">
              <div
                className={`w-10 h-10 rounded-[14px] flex items-center justify-center shrink-0 ${
                  currentTabInfo.isReadOnly
                    ? 'bg-amber-500/15 text-amber-600'
                    : 'bg-primary/15 text-primary'
                }`}
              >
                <span className="material-symbols-outlined text-[22px]">{currentTabInfo.icon}</span>
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="text-base font-bold text-on-surface">
                    Danh mục: {currentTabInfo.label}
                  </h3>
                  <span className="text-xs text-secondary font-mono">
                    (Mã hệ thống: {currentTabInfo.id})
                  </span>
                  <span
                    className={`text-xs px-2.5 py-0.5 rounded-full border font-semibold ${
                      currentTabInfo.isReadOnly
                        ? 'bg-amber-500/10 text-amber-700 border-amber-500/30'
                        : 'bg-emerald-500/10 text-emerald-700 border-emerald-500/30'
                    }`}
                  >
                    Chế độ an toàn: {currentTabInfo.safetyModeVn}
                  </span>
                </div>
                <p className="text-xs text-secondary mt-1">
                  {currentTabInfo.isReadOnly
                    ? 'Đây là danh mục trạng thái hệ thống, chỉ hiển thị tham khảo để tránh ảnh hưởng quy trình vận hành.'
                    : 'Dữ liệu được quản lý từ bảng MasterCategory.'}
                </p>
              </div>
            </div>
            <div className="text-right shrink-0">
              <span className="text-xs text-secondary font-medium">Tổng số: </span>
              <span className="text-lg font-black text-on-surface ml-1">{filteredItems.length}</span>
            </div>
          </div>

          {/* Toolbar: Search & Status Filter */}
          <div className="flex flex-col md:flex-row items-center gap-4 bg-surface-container-lowest/50 backdrop-blur-md p-2 rounded-[24px] border border-outline-variant/20 shadow-sm">
            <div className="relative flex-1 w-full group">
              <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-outline group-focus-within:text-primary transition-colors text-[24px]">
                search
              </span>
              <input
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full h-[48px] pl-12 pr-4 bg-on-surface/5 border-none rounded-[18px] font-body-md text-body-md text-on-surface focus:ring-2 focus:ring-primary/50 focus:bg-white/80 transition-all placeholder:text-outline-variant"
                placeholder={`Tìm kiếm theo Mã hoặc Tên trong ${currentTabInfo.label}...`}
                type="text"
              />
            </div>

            <div className="flex items-center gap-3 w-full md:w-auto">
              <div className="relative">
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="h-[48px] pl-4 pr-10 appearance-none bg-white/50 backdrop-blur-md border border-outline-variant/30 rounded-[18px] font-body-md text-body-md text-on-surface focus:ring-2 focus:ring-primary/50 cursor-pointer min-w-[170px]"
                >
                  <option value="all">Tất cả trạng thái</option>
                  <option value="active">Đang hoạt động</option>
                  <option value="inactive">Ngưng hoạt động</option>
                </select>
                <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-outline-variant pointer-events-none text-[20px]">
                  expand_more
                </span>
              </div>
            </div>
          </div>

          {/* Table Container */}
          <div className="rounded-[24px] border border-outline-variant/20 bg-surface-container-lowest/80 backdrop-blur-md shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-outline-variant/20 bg-surface-variant/30 text-secondary font-label-md text-label-md uppercase tracking-wider">
                    <th className="py-4 px-6">Mã</th>
                    <th className="py-4 px-6">Tên tiếng Việt</th>
                    <th className="py-4 px-6">Tên tiếng Anh</th>
                    <th className="py-4 px-6">Thứ tự</th>
                    <th className="py-4 px-6">Trạng thái</th>
                    <th className="py-4 px-6">Chế độ an toàn</th>
                    <th className="py-4 px-6 text-right">Thao tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-outline-variant/10 text-sm font-body-md">
                  {loading ? (
                    <tr>
                      <td colSpan={7} className="py-12 text-center text-secondary">
                        <div className="flex items-center justify-center gap-2">
                          <span className="material-symbols-outlined animate-spin text-[24px] text-primary">
                            progress_activity
                          </span>
                          Đang tải dữ liệu danh mục...
                        </div>
                      </td>
                    </tr>
                  ) : filteredItems.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-12 text-center text-secondary">
                        <div className="flex flex-col items-center justify-center gap-2">
                          <span className="material-symbols-outlined text-[48px] text-outline">
                            inbox
                          </span>
                          <p className="font-semibold text-on-surface text-base">
                            Chưa có dữ liệu trong danh mục này.
                          </p>
                          <p className="text-xs text-outline">
                            {currentTabInfo.isReadOnly
                              ? 'Danh mục trạng thái hệ thống chưa được ghi nhận trong cơ sở dữ liệu.'
                              : 'Bạn có thể thêm mới danh mục nếu cần dùng cho vận hành.'}
                          </p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    filteredItems.map((item) => {
                      const isActive = item.isActive !== false;
                      return (
                        <tr
                          key={item.categoryId || item.code}
                          className="hover:bg-surface-variant/20 transition-colors group"
                        >
                          {/* Code */}
                          <td className="py-4 px-6 font-mono font-bold text-on-surface">
                            <span className="px-2.5 py-1 rounded-lg bg-surface-variant/50 border border-outline-variant/30 text-primary">
                              {item.code}
                            </span>
                          </td>

                          {/* Tên tiếng Việt */}
                          <td className="py-4 px-6 font-semibold text-on-surface">
                            {item.nameVn}
                          </td>

                          {/* Tên tiếng Anh */}
                          <td className="py-4 px-6 text-secondary">
                            {item.nameEn || <span className="text-outline-variant italic">Chưa có</span>}
                          </td>

                          {/* Sort Order */}
                          <td className="py-4 px-6 font-mono text-secondary">
                            {item.sortOrder ?? 0}
                          </td>

                          {/* Trạng thái */}
                          <td className="py-4 px-6">
                            <span
                              className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${
                                isActive
                                  ? 'bg-emerald-500/10 text-emerald-700 border border-emerald-500/20'
                                  : 'bg-slate-500/10 text-slate-500 border border-slate-500/20'
                              }`}
                            >
                              <span
                                className={`w-1.5 h-1.5 rounded-full ${
                                  isActive ? 'bg-emerald-500' : 'bg-slate-400'
                                }`}
                              ></span>
                              {isActive ? 'Đang hoạt động' : 'Ngưng hoạt động'}
                            </span>
                          </td>

                          {/* Chế độ an toàn */}
                          <td className="py-4 px-6">
                            {item.isReadOnly ? (
                              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-amber-500/15 text-amber-800 border border-amber-500/30 text-xs font-bold">
                                <span className="material-symbols-outlined text-[14px]">lock</span>
                                Hệ thống - chỉ xem
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-blue-500/10 text-blue-700 border border-blue-500/20 text-xs font-semibold">
                                <span className="material-symbols-outlined text-[14px]">verified_user</span>
                                Có thể chỉnh sửa
                              </span>
                            )}
                          </td>

                          {/* Thao tác */}
                          <td className="py-4 px-6 text-right">
                            {item.isReadOnly ? (
                              <span className="text-xs text-outline italic">Hệ thống - chỉ xem</span>
                            ) : (
                              <div className="flex items-center justify-end gap-2">
                                <button
                                  type="button"
                                  onClick={() => openEditModal(item)}
                                  className="p-2 rounded-xl hover:bg-primary/10 text-primary transition-colors"
                                  title="Chỉnh sửa thông tin"
                                >
                                  <span className="material-symbols-outlined text-[20px]">edit</span>
                                </button>

                                <button
                                  type="button"
                                  onClick={() => handleToggleStatus(item)}
                                  className={`p-2 rounded-xl transition-colors ${
                                    isActive
                                      ? 'hover:bg-amber-500/10 text-amber-600'
                                      : 'hover:bg-emerald-500/10 text-emerald-600'
                                  }`}
                                  title={isActive ? 'Chuyển ngưng hoạt động' : 'Chuyển đang hoạt động'}
                                >
                                  <span className="material-symbols-outlined text-[20px]">
                                    {isActive ? 'toggle_on' : 'toggle_off'}
                                  </span>
                                </button>
                              </div>
                            )}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </main>

      {/* Create / Edit Modal Dialog */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-on-surface/40 backdrop-blur-sm"
            onClick={() => setIsModalOpen(false)}
          ></div>

          <div className="relative w-full max-w-[540px] rounded-[28px] bg-surface-container-lowest border border-white/40 shadow-2xl p-6 flex flex-col gap-6 z-10 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-outline-variant/20 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-[14px] bg-primary/10 text-primary flex items-center justify-center">
                  <span className="material-symbols-outlined text-[24px]">
                    {editingItem ? 'edit_note' : 'add_box'}
                  </span>
                </div>
                <div>
                  <h3 className="font-headline-sm text-lg font-bold text-on-surface">
                    {editingItem
                      ? `Chỉnh sửa mã: ${editingItem.code}`
                      : `Thêm mới ${currentTabInfo.label}`}
                  </h3>
                  <p className="text-xs text-secondary">
                    Danh mục: <strong>{currentTabInfo.label}</strong> (Mã hệ thống: {activeTab})
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="w-9 h-9 flex items-center justify-center rounded-full bg-surface-variant/40 text-secondary hover:text-on-surface transition-colors"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            <form onSubmit={handleSaveModal} className="flex flex-col gap-4">
              {/* Mã (Code) */}
              <div>
                <label className="mb-1 block text-sm font-semibold text-on-surface">
                  Mã danh mục <span className="text-error">*</span>
                </label>
                <input
                  type="text"
                  required
                  disabled={Boolean(editingItem)}
                  value={modalForm.code}
                  onChange={(e) =>
                    setModalForm((prev) => ({ ...prev, code: e.target.value.toUpperCase() }))
                  }
                  className="w-full rounded-[14px] border border-outline-variant/40 bg-white/80 px-4 py-2.5 font-mono text-sm font-bold uppercase focus:ring-2 focus:ring-primary/50 disabled:bg-slate-100 disabled:text-slate-500"
                  placeholder="Ví dụ: PALLET, KG, CHILLED..."
                />
                {editingItem && (
                  <p className="mt-1 text-[11px] text-amber-700 italic">
                    Lưu ý: Mã danh mục không thể thay đổi sau khi tạo để tránh làm hỏng liên kết dữ liệu.
                  </p>
                )}
              </div>

              {/* Tên tiếng Việt */}
              <div>
                <label className="mb-1 block text-sm font-semibold text-on-surface">
                  Tên tiếng Việt <span className="text-error">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={modalForm.nameVn}
                  onChange={(e) =>
                    setModalForm((prev) => ({ ...prev, nameVn: e.target.value }))
                  }
                  className="w-full rounded-[14px] border border-outline-variant/40 bg-white/80 px-4 py-2.5 text-sm focus:ring-2 focus:ring-primary/50"
                  placeholder="Ví dụ: Kiện / Pallet"
                />
              </div>

              {/* Tên tiếng Anh */}
              <div>
                <label className="mb-1 block text-sm font-semibold text-on-surface">
                  Tên tiếng Anh
                </label>
                <input
                  type="text"
                  value={modalForm.nameEn}
                  onChange={(e) =>
                    setModalForm((prev) => ({ ...prev, nameEn: e.target.value }))
                  }
                  className="w-full rounded-[14px] border border-outline-variant/40 bg-white/80 px-4 py-2.5 text-sm focus:ring-2 focus:ring-primary/50"
                  placeholder="Ví dụ: Pallet / Box"
                />
              </div>

              {/* Thứ tự sắp xếp */}
              <div>
                <label className="mb-1 block text-sm font-semibold text-on-surface">
                  Thứ tự sắp xếp
                </label>
                <input
                  type="number"
                  min={0}
                  value={modalForm.sortOrder}
                  onChange={(e) =>
                    setModalForm((prev) => ({ ...prev, sortOrder: Number(e.target.value) }))
                  }
                  className="w-full rounded-[14px] border border-outline-variant/40 bg-white/80 px-4 py-2.5 font-mono text-sm focus:ring-2 focus:ring-primary/50"
                />
              </div>

              {/* Is Active Checkbox */}
              <label className="flex items-center gap-2 cursor-pointer mt-2">
                <input
                  type="checkbox"
                  checked={modalForm.isActive}
                  onChange={(e) =>
                    setModalForm((prev) => ({ ...prev, isActive: e.target.checked }))
                  }
                  className="w-4 h-4 rounded text-primary focus:ring-primary"
                />
                <span className="text-sm font-semibold text-on-surface">
                  Kích hoạt danh mục này trong hệ thống
                </span>
              </label>

              {/* Submit / Cancel Buttons */}
              <div className="mt-4 flex items-center justify-end gap-3 pt-4 border-t border-outline-variant/20">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-5 py-2.5 rounded-[14px] border border-outline-variant/30 text-sm font-medium text-on-surface hover:bg-surface-variant/50 transition-colors"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-6 py-2.5 rounded-[14px] bg-primary text-on-primary font-semibold text-sm shadow-md hover:shadow-lg hover:bg-primary/90 transition-all flex items-center gap-2"
                >
                  {saving ? (
                    <>
                      <span className="material-symbols-outlined animate-spin text-[18px]">
                        progress_activity
                      </span>
                      Đang lưu...
                    </>
                  ) : (
                    'Lưu danh mục'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default MasterDataManagement;
