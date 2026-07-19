import React, { useEffect, useState, useMemo } from 'react';
import UserProfileWidget from '@components/UserProfileWidget';
import AdminSidebar from '@components/AdminSidebar';
import api from '@lib/api';

interface NotificationConfig {
  configId: number;
  eventType: string;
  channel: string;
  template: string;
  isActive: boolean;
  createdAt?: string;
}

const EVENT_LABELS: Record<string, { label: string; icon: string; color: string }> = {
  ORDER_CREATED:      { label: 'Tạo đơn hàng',        icon: 'add_shopping_cart', color: 'bg-blue-100 text-blue-800 border-blue-200' },
  BOOKING_CONFIRMED:  { label: 'Đặt lịch thành công', icon: 'event_available',   color: 'bg-green-100 text-green-800 border-green-200' },
  CHECK_IN:           { label: 'Check-in xe',          icon: 'login',             color: 'bg-cyan-100 text-cyan-800 border-cyan-200' },
  ORDER_COMPLETED:    { label: 'Hoàn thành đơn',       icon: 'task_alt',          color: 'bg-emerald-100 text-emerald-800 border-emerald-200' },
  COMPLAINT_CREATED:  { label: 'Khiếu nại mới',        icon: 'report',            color: 'bg-red-100 text-red-800 border-red-200' },
  PAYMENT_SUCCESS:    { label: 'Thanh toán thành công',icon: 'payments',          color: 'bg-violet-100 text-violet-800 border-violet-200' },
  DELIVERY_FAILED:    { label: 'Giao hàng thất bại',   icon: 'local_shipping',    color: 'bg-orange-100 text-orange-800 border-orange-200' },
};

const CHANNEL_META: Record<string, { icon: string; color: string; bgColor: string; borderColor: string }> = {
  EMAIL: { icon: 'email',        color: 'text-blue-700',   bgColor: 'bg-blue-100',   borderColor: 'border-blue-300' },
  SMS:   { icon: 'sms',          color: 'text-green-700',  bgColor: 'bg-green-100',  borderColor: 'border-green-300' },
  ZALO:  { icon: 'chat_bubble',  color: 'text-purple-700', bgColor: 'bg-purple-100', borderColor: 'border-purple-300' },
};

const TEMPLATE_VARIABLES: Record<string, string[]> = {
  ORDER_CREATED:      ['{customerName}', '{orderCode}', '{orderDate}', '{totalAmount}'],
  BOOKING_CONFIRMED:  ['{customerName}', '{bookingCode}', '{bookingDate}', '{slotTime}', '{dockName}'],
  CHECK_IN:           ['{driverName}', '{vehiclePlate}', '{checkInTime}', '{dockName}'],
  ORDER_COMPLETED:    ['{customerName}', '{orderCode}', '{completedDate}', '{totalAmount}'],
  COMPLAINT_CREATED:  ['{customerName}', '{complaintId}', '{complaintDate}', '{issueType}'],
  PAYMENT_SUCCESS:    ['{customerName}', '{orderCode}', '{amount}', '{paymentMethod}', '{paymentDate}'],
  DELIVERY_FAILED:    ['{customerName}', '{orderCode}', '{failReason}', '{retryDate}'],
};

const SAMPLE_TEMPLATES: Record<string, Record<string, string>> = {
  ORDER_CREATED: {
    EMAIL: 'Xin chào {customerName},\n\nĐơn hàng {orderCode} của bạn đã được tạo thành công vào {orderDate}.\nTổng giá trị: {totalAmount} VNĐ.\n\nCảm ơn bạn đã tin tưởng SmartLog AI!',
    SMS:   'SmartLog: Don hang {orderCode} da tao thanh cong. Tong gia tri: {totalAmount} VND. Cam on ban!',
    ZALO:  '🎉 Xin chào {customerName}!\nĐơn hàng #{orderCode} đã được tạo thành công.\n💰 Giá trị: {totalAmount} VNĐ',
  },
  BOOKING_CONFIRMED: {
    EMAIL: 'Xin chào {customerName},\n\nLịch đặt xe {bookingCode} của bạn đã được xác nhận.\nThời gian: {slotTime} ngày {bookingDate}\nVị trí: {dockName}\n\nVui lòng đến đúng giờ!',
    SMS:   'SmartLog: Lich dat xe {bookingCode} xac nhan. Thoi gian: {slotTime} - {bookingDate}. Dock: {dockName}',
    ZALO:  '✅ Đặt lịch thành công!\n📋 Mã đặt xe: {bookingCode}\n🕐 Thời gian: {slotTime} - {bookingDate}\n🏢 Vị trí: {dockName}',
  },
  COMPLAINT_CREATED: {
    EMAIL: 'Xin chào {customerName},\n\nKhiếu nại #{complaintId} của bạn đã được tiếp nhận vào {complaintDate}.\nLoại vấn đề: {issueType}\n\nChúng tôi sẽ xem xét và phản hồi trong vòng 24 giờ.',
    SMS:   'SmartLog: Khieu nai #{complaintId} da tiep nhan ({issueType}). Chung toi se xu ly trong 24 gio.',
    ZALO:  '📩 Khiếu nại đã được tiếp nhận!\n🆔 Mã: #{complaintId}\n📋 Loại: {issueType}\n⏰ Phản hồi trong 24 giờ.',
  },
};

const AdminNotifications: React.FC = () => {
  const [configs, setConfigs] = useState<NotificationConfig[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingConfig, setEditingConfig] = useState<NotificationConfig | null>(null);
  const [filterChannel, setFilterChannel] = useState<string>('ALL');
  const [filterEvent, setFilterEvent] = useState<string>('ALL');
  const [previewConfig, setPreviewConfig] = useState<NotificationConfig | null>(null);
  const [formData, setFormData] = useState({
    eventType: 'ORDER_CREATED',
    channel: 'EMAIL',
    template: '',
    isActive: true
  });

  const eventTypes = Object.keys(EVENT_LABELS);
  const channels = Object.keys(CHANNEL_META);

  useEffect(() => { loadConfigs(); }, []);

  const loadConfigs = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await api.get<NotificationConfig[]>('/notification-config');
      setConfigs(response.data);
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Không tải được cấu hình thông báo.');
    } finally {
      setIsLoading(false);
    }
  };

  const filteredConfigs = useMemo(() => {
    return configs.filter(c => {
      if (filterChannel !== 'ALL' && c.channel !== filterChannel) return false;
      if (filterEvent !== 'ALL' && c.eventType !== filterEvent) return false;
      return true;
    });
  }, [configs, filterChannel, filterEvent]);

  const stats = useMemo(() => ({
    total: configs.length,
    active: configs.filter(c => c.isActive).length,
    email: configs.filter(c => c.channel === 'EMAIL').length,
    sms: configs.filter(c => c.channel === 'SMS').length,
    zalo: configs.filter(c => c.channel === 'ZALO').length,
  }), [configs]);

  const handleCreate = () => {
    setEditingConfig(null);
    setFormData({ eventType: 'ORDER_CREATED', channel: 'EMAIL', template: '', isActive: true });
    setIsModalOpen(true);
  };

  const handleEdit = (config: NotificationConfig) => {
    setEditingConfig(config);
    setFormData({ eventType: config.eventType, channel: config.channel, template: config.template, isActive: config.isActive });
    setIsModalOpen(true);
  };

  const handleDelete = async (configId: number) => {
    if (!confirm('Bạn có chắc muốn xóa cấu hình này?')) return;
    try {
      await api.delete(`/notification-config/${configId}`);
      loadConfigs();
    } catch (err: any) {
      alert('Xóa thất bại: ' + (err.response?.data?.message || err.message));
    }
  };

  const handleToggle = async (configId: number) => {
    try {
      await api.patch(`/notification-config/${configId}/toggle`);
      loadConfigs();
    } catch (err: any) {
      alert('Thay đổi trạng thái thất bại: ' + (err.response?.data?.message || err.message));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingConfig) {
        await api.put(`/notification-config/${editingConfig.configId}`, formData);
      } else {
        await api.post('/notification-config', formData);
      }
      setIsModalOpen(false);
      loadConfigs();
    } catch (err: any) {
      alert('Lưu thất bại: ' + (err.response?.data?.message || err.message));
    }
  };

  const insertVariable = (variable: string) => {
    setFormData(prev => ({ ...prev, template: prev.template + variable }));
  };

  const loadSampleTemplate = () => {
    const sample = SAMPLE_TEMPLATES[formData.eventType]?.[formData.channel];
    if (sample) setFormData(prev => ({ ...prev, template: sample }));
  };

  return (
    <div className="bg-background text-on-surface font-body-md text-body-md min-h-screen flex overflow-hidden">
      <AdminSidebar />
      <div className="flex-1 flex flex-col md:ml-[280px] w-full h-screen overflow-hidden relative">
        {/* Background */}
        <div className="absolute inset-0 z-0 pointer-events-none opacity-40">
          <div className="absolute top-[-10%] right-[-5%] w-[800px] h-[800px] rounded-full bg-primary-fixed/30 blur-[120px]"></div>
          <div className="absolute bottom-[-10%] left-[-10%] w-[600px] h-[600px] rounded-full bg-tertiary-fixed/20 blur-[100px]"></div>
        </div>

        {/* TopNavBar */}
        <header className="flex justify-between items-center w-full px-container-padding py-stack-md bg-surface/70 backdrop-blur-md sticky top-0 z-40 border-b border-outline-variant/20 shadow-sm">
          <div>
            <p className="text-sm text-on-surface-variant">Admin / CRM</p>
            <h2 className="font-headline-md text-headline-md text-primary font-bold">Trung Tâm Thông Báo</h2>
          </div>
          <div className="flex items-center gap-4">
            <button className="text-on-surface-variant hover:text-primary transition-colors relative">
              <span className="material-symbols-outlined">notifications</span>
              <span className="absolute top-0 right-0 w-2 h-2 bg-error rounded-full"></span>
            </button>
            <UserProfileWidget avatarOnly={true} />
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-container-padding z-10 relative">
          <div className="max-w-[1400px] mx-auto space-y-6">

            {/* Page Title + Action */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
              <div>
                <h1 className="font-display-lg text-display-lg text-on-surface mb-1">Cấu Hình Thông Báo Tự Động</h1>
                <p className="font-body-lg text-body-lg text-on-surface-variant">Quản lý mẫu thông báo qua Email / SMS / Zalo cho các sự kiện hệ thống theo UC035.</p>
              </div>
              <button
                onClick={handleCreate}
                className="flex items-center gap-2 px-5 py-2.5 bg-primary text-white rounded-xl hover:bg-primary/90 transition-all shadow-md hover:shadow-lg font-body-sm text-body-sm whitespace-nowrap"
              >
                <span className="material-symbols-outlined text-[20px]">add</span>
                Tạo Cấu Hình Mới
              </button>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              {[
                { label: 'Tổng cấu hình', value: stats.total, icon: 'settings', color: 'text-slate-700', bg: 'bg-slate-100' },
                { label: 'Đang hoạt động', value: stats.active, icon: 'check_circle', color: 'text-green-700', bg: 'bg-green-100' },
                { label: 'Email', value: stats.email, icon: 'email', color: 'text-blue-700', bg: 'bg-blue-100' },
                { label: 'SMS', value: stats.sms, icon: 'sms', color: 'text-green-700', bg: 'bg-green-100' },
                { label: 'Zalo', value: stats.zalo, icon: 'chat_bubble', color: 'text-purple-700', bg: 'bg-purple-100' },
              ].map((stat) => (
                <div key={stat.label} className="bg-surface-container-low/80 border border-outline-variant/10 rounded-2xl p-4 flex items-center gap-3 shadow-sm">
                  <div className={`w-10 h-10 rounded-full ${stat.bg} flex items-center justify-center`}>
                    <span className={`material-symbols-outlined text-[20px] ${stat.color}`}>{stat.icon}</span>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-on-surface leading-tight">{stat.value}</p>
                    <p className="text-[11px] text-on-surface-variant">{stat.label}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Filters */}
            <div className="flex flex-wrap gap-3 items-center">
              <span className="text-on-surface-variant font-label-md text-label-md">Lọc theo:</span>
              <div className="flex gap-2 flex-wrap">
                {['ALL', ...channels].map(ch => {
                  const meta = ch === 'ALL' ? null : CHANNEL_META[ch];
                  return (
                    <button
                      key={ch}
                      onClick={() => setFilterChannel(ch)}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all border ${
                        filterChannel === ch
                          ? 'bg-primary text-white border-primary shadow-sm'
                          : 'bg-surface-container-low border-outline-variant/30 text-on-surface hover:bg-surface-variant'
                      }`}
                    >
                      {meta && <span className="material-symbols-outlined text-[14px]">{meta.icon}</span>}
                      {ch === 'ALL' ? 'Tất cả kênh' : ch}
                    </button>
                  );
                })}
              </div>
              <div className="flex gap-2 flex-wrap">
                <select
                  className="h-[34px] px-3 rounded-lg bg-surface-container-low border border-outline-variant/30 focus:ring-2 focus:ring-primary/50 font-body-sm text-body-sm text-on-surface text-xs"
                  value={filterEvent}
                  onChange={(e) => setFilterEvent(e.target.value)}
                >
                  <option value="ALL">Tất cả sự kiện</option>
                  {eventTypes.map(et => (
                    <option key={et} value={et}>{EVENT_LABELS[et]?.label || et}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Config Grid */}
            {isLoading ? (
              <div className="flex items-center justify-center py-20">
                <div className="w-10 h-10 border-4 border-primary/30 border-t-primary rounded-full animate-spin"></div>
              </div>
            ) : error ? (
              <div className="rounded-2xl border border-error/30 bg-error/10 p-6 text-center text-error">{error}</div>
            ) : filteredConfigs.length === 0 ? (
              <div className="rounded-2xl border border-outline-variant/20 bg-surface-container-low/50 p-12 text-center">
                <span className="material-symbols-outlined text-5xl text-on-surface-variant mb-3 block">notifications_off</span>
                <p className="text-on-surface-variant">Không có cấu hình nào phù hợp bộ lọc.</p>
                <button onClick={handleCreate} className="mt-4 px-4 py-2 bg-primary text-white rounded-lg text-sm hover:bg-primary/90 transition-colors">
                  Tạo cấu hình đầu tiên
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {filteredConfigs.map((config) => {
                  const eventMeta = EVENT_LABELS[config.eventType];
                  const channelMeta = CHANNEL_META[config.channel];
                  return (
                    <div
                      key={config.configId}
                      className={`group bg-surface-container-low/80 border rounded-2xl p-5 shadow-sm hover:shadow-md transition-all ${
                        config.isActive ? 'border-outline-variant/20' : 'border-outline-variant/10 opacity-60'
                      }`}
                    >
                      {/* Card Header */}
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${channelMeta.bgColor}`}>
                            <span className={`material-symbols-outlined text-[18px] ${channelMeta.color}`}>{channelMeta.icon}</span>
                          </div>
                          <div>
                            <span className={`text-xs font-semibold ${channelMeta.color}`}>{config.channel}</span>
                            <div className={`inline-flex items-center gap-1 ml-2 px-2 py-0.5 rounded-full text-[10px] font-medium border ${eventMeta?.color || 'bg-gray-100 text-gray-800 border-gray-200'}`}>
                              <span className="material-symbols-outlined text-[10px]">{eventMeta?.icon || 'notifications'}</span>
                              {eventMeta?.label || config.eventType}
                            </div>
                          </div>
                        </div>
                        <button
                          onClick={() => handleToggle(config.configId)}
                          className={`relative w-10 h-5 rounded-full transition-colors ${config.isActive ? 'bg-green-500' : 'bg-slate-300'}`}
                        >
                          <span className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow-sm transition-all ${config.isActive ? 'left-5' : 'left-0.5'}`}></span>
                        </button>
                      </div>

                      {/* Template Preview */}
                      <div className="bg-black/5 rounded-lg p-3 mb-3 min-h-[70px]">
                        <p className="text-[12px] text-on-surface-variant leading-relaxed line-clamp-3 whitespace-pre-line">
                          {config.template || <em className="text-outline">Chưa có nội dung mẫu</em>}
                        </p>
                      </div>

                      {/* Footer */}
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] text-on-surface-variant">
                          {config.createdAt ? new Date(config.createdAt).toLocaleDateString('vi-VN') : '—'}
                        </span>
                        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={() => setPreviewConfig(config)}
                            className="p-1.5 rounded hover:bg-surface-variant text-on-surface-variant hover:text-primary transition-colors"
                            title="Xem trước"
                          >
                            <span className="material-symbols-outlined text-[16px]">visibility</span>
                          </button>
                          <button
                            onClick={() => handleEdit(config)}
                            className="p-1.5 rounded hover:bg-surface-variant text-on-surface-variant hover:text-primary transition-colors"
                            title="Chỉnh sửa"
                          >
                            <span className="material-symbols-outlined text-[16px]">edit</span>
                          </button>
                          <button
                            onClick={() => handleDelete(config.configId)}
                            className="p-1.5 rounded hover:bg-surface-variant text-on-surface-variant hover:text-error transition-colors"
                            title="Xóa"
                          >
                            <span className="material-symbols-outlined text-[16px]">delete</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </main>

        {/* Create/Edit Modal */}
        {isModalOpen && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-surface rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col">
              {/* Modal Header */}
              <div className="p-6 border-b border-outline-variant/20 flex items-center justify-between">
                <div>
                  <h2 className="font-headline-md text-headline-md text-on-surface">
                    {editingConfig ? '✏️ Cập Nhật Cấu Hình' : '➕ Tạo Cấu Hình Mới'}
                  </h2>
                  <p className="text-sm text-on-surface-variant mt-0.5">Thiết lập mẫu thông báo tự động cho sự kiện hệ thống</p>
                </div>
                <button onClick={() => setIsModalOpen(false)} className="p-2 rounded-lg hover:bg-surface-variant text-on-surface-variant transition-colors">
                  <span className="material-symbols-outlined">close</span>
                </button>
              </div>

              <form onSubmit={handleSubmit} className="p-6 space-y-5 overflow-y-auto flex-1">
                {/* Event + Channel Row */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block font-label-md text-label-md text-on-surface-variant mb-2">Sự kiện kích hoạt</label>
                    <select
                      className="w-full h-[40px] px-3 rounded-lg bg-black/5 border border-outline-variant/30 focus:ring-2 focus:ring-primary/50 font-body-sm text-body-sm text-on-surface"
                      value={formData.eventType}
                      onChange={(e) => setFormData({ ...formData, eventType: e.target.value, template: '' })}
                      required
                    >
                      {eventTypes.map(type => (
                        <option key={type} value={type}>{EVENT_LABELS[type]?.label || type}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block font-label-md text-label-md text-on-surface-variant mb-2">Kênh gửi</label>
                    <div className="flex gap-2">
                      {channels.map(ch => {
                        const meta = CHANNEL_META[ch];
                        return (
                          <button
                            key={ch}
                            type="button"
                            onClick={() => setFormData({ ...formData, channel: ch })}
                            className={`flex-1 h-[40px] flex items-center justify-center gap-1.5 rounded-lg border text-sm font-medium transition-all ${
                              formData.channel === ch
                                ? `${meta.bgColor} ${meta.color} ${meta.borderColor} shadow-sm`
                                : 'bg-black/5 border-outline-variant/30 text-on-surface-variant hover:bg-surface-variant'
                            }`}
                          >
                            <span className="material-symbols-outlined text-[16px]">{meta.icon}</span>
                            {ch}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* Template Variables Hint */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="font-label-md text-label-md text-on-surface-variant">Mẫu thông báo</label>
                    {SAMPLE_TEMPLATES[formData.eventType]?.[formData.channel] && (
                      <button
                        type="button"
                        onClick={loadSampleTemplate}
                        className="text-xs text-primary hover:underline flex items-center gap-1"
                      >
                        <span className="material-symbols-outlined text-[14px]">auto_awesome</span>
                        Dùng mẫu có sẵn
                      </button>
                    )}
                  </div>

                  {/* Variable chips */}
                  {TEMPLATE_VARIABLES[formData.eventType] && (
                    <div className="flex flex-wrap gap-1.5 mb-2">
                      <span className="text-[11px] text-on-surface-variant">Chèn biến:</span>
                      {TEMPLATE_VARIABLES[formData.eventType].map(v => (
                        <button
                          key={v}
                          type="button"
                          onClick={() => insertVariable(v)}
                          className="px-2 py-0.5 rounded bg-primary/10 text-primary text-[11px] font-mono hover:bg-primary/20 transition-colors border border-primary/20"
                        >
                          {v}
                        </button>
                      ))}
                    </div>
                  )}

                  <textarea
                    className="w-full min-h-[150px] p-4 rounded-lg bg-black/5 border border-outline-variant/30 focus:ring-2 focus:ring-primary/50 font-body-sm text-body-sm text-on-surface resize-none font-mono text-[13px]"
                    value={formData.template}
                    onChange={(e) => setFormData({ ...formData, template: e.target.value })}
                    placeholder={`Ví dụ: Xin chào {customerName}, đơn hàng {orderCode} đã được tạo thành công...`}
                    required
                  />
                  <p className="text-[11px] text-on-surface-variant mt-1">{formData.template.length} ký tự</p>
                </div>

                {/* Active toggle */}
                <div className="flex items-center gap-3 p-3 rounded-lg bg-black/5 border border-outline-variant/20">
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, isActive: !formData.isActive })}
                    className={`relative w-11 h-6 rounded-full transition-colors ${formData.isActive ? 'bg-green-500' : 'bg-slate-300'}`}
                  >
                    <span className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow-sm transition-all ${formData.isActive ? 'left-6' : 'left-1'}`}></span>
                  </button>
                  <div>
                    <p className="text-sm font-medium text-on-surface">{formData.isActive ? 'Kích hoạt ngay' : 'Tắt (lưu nháp)'}</p>
                    <p className="text-[11px] text-on-surface-variant">
                      {formData.isActive ? 'Thông báo sẽ được gửi ngay khi sự kiện xảy ra' : 'Cấu hình được lưu nhưng chưa gửi thông báo'}
                    </p>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-5 py-2 rounded-xl border border-outline-variant/30 text-on-surface hover:bg-surface-variant transition-colors font-body-sm text-body-sm"
                  >
                    Hủy
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-xl bg-primary text-white hover:bg-primary/90 transition-colors font-body-sm text-body-sm shadow-md"
                  >
                    {editingConfig ? '💾 Cập Nhật' : '➕ Tạo Mới'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Preview Modal */}
        {previewConfig && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-surface rounded-2xl shadow-2xl w-full max-w-lg">
              <div className="p-6 border-b border-outline-variant/20 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${CHANNEL_META[previewConfig.channel]?.bgColor}`}>
                    <span className={`material-symbols-outlined text-[18px] ${CHANNEL_META[previewConfig.channel]?.color}`}>
                      {CHANNEL_META[previewConfig.channel]?.icon}
                    </span>
                  </div>
                  <div>
                    <h3 className="font-headline-sm text-headline-sm text-on-surface">Xem trước thông báo</h3>
                    <p className="text-[12px] text-on-surface-variant">{EVENT_LABELS[previewConfig.eventType]?.label} · {previewConfig.channel}</p>
                  </div>
                </div>
                <button onClick={() => setPreviewConfig(null)} className="p-2 rounded-lg hover:bg-surface-variant transition-colors">
                  <span className="material-symbols-outlined text-on-surface-variant">close</span>
                </button>
              </div>
              <div className="p-6">
                <div className="bg-black/5 rounded-xl p-4 border border-outline-variant/20">
                  <p className="text-sm text-on-surface whitespace-pre-line leading-relaxed font-mono">{previewConfig.template}</p>
                </div>
                <div className="mt-4 flex flex-wrap gap-2">
                  <span className="text-[11px] text-on-surface-variant">Biến sẽ được thay thế:</span>
                  {TEMPLATE_VARIABLES[previewConfig.eventType]?.map(v => (
                    <span key={v} className="px-2 py-0.5 rounded bg-primary/10 text-primary text-[11px] font-mono border border-primary/20">{v}</span>
                  ))}
                </div>
                <div className="mt-5 flex justify-end gap-3">
                  <button
                    onClick={() => { setPreviewConfig(null); handleEdit(previewConfig); }}
                    className="px-4 py-2 rounded-xl border border-outline-variant/30 text-on-surface hover:bg-surface-variant transition-colors text-sm"
                  >
                    Chỉnh sửa
                  </button>
                  <button onClick={() => setPreviewConfig(null)} className="px-4 py-2 rounded-xl bg-primary text-white hover:bg-primary/90 transition-colors text-sm">
                    Đóng
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminNotifications;
