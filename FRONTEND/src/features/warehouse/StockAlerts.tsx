import { useEffect, useState } from 'react'
import Sidebar from '../../components/Sidebar'
import api from '../../lib/api'

type StockAlert = {
  alertId: number
  skuid: number
  skucode: string | null
  productName: string | null
  customerName: string | null
  alertType: string
  currentQty: number | null
  thresholdQty: number | null
  emailSentAt: string | null
  nextAllowedAt: string | null
  isResolved: boolean
  createdAt: string | null
  severity: string
}

type StockAlertSummary = {
  lowStock: number
  expiringSoon: number
  deadStock: number
  total: number
}

const ALERT_TYPE_LABELS: Record<string, string> = {
  LOW_STOCK: 'Tồn thấp',
  EXPIRY_SOON: 'Sắp hết hạn',
  DEAD_STOCK: 'Tồn lâu',
}

const StockAlerts = () => {
  const [alerts, setAlerts] = useState<StockAlert[]>([])
  const [summary, setSummary] = useState<StockAlertSummary | null>(null)
  const [loading, setLoading] = useState(false)
  const [scanning, setScanning] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [message, setMessage] = useState<string | null>(null)
  const [filterText, setFilterText] = useState('')
  const [filterType, setFilterType] = useState('ALL')

  const loadData = async () => {
    setLoading(true)
    setError(null)
    try {
      const [alertsRes, summaryRes] = await Promise.all([
        api.get<StockAlert[]>('/stockalerts'),
        api.get<StockAlertSummary>('/stockalerts/summary'),
      ])
      setAlerts(alertsRes.data)
      setSummary(summaryRes.data)
    } catch {
      setError('Không tải được dữ liệu cảnh báo tồn kho.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  const handleScan = async () => {
    setScanning(true)
    setError(null)
    setMessage(null)
    try {
      const res = await api.post<{ emailsSent: number; message: string }>('/stockalerts/scan')
      setMessage(res.data.message)
      await loadData()
    } catch {
      setError('Quét tồn kho thất bại.')
    } finally {
      setScanning(false)
    }
  }

  const handleResolve = async (id: number) => {
    try {
      await api.post(`/stockalerts/${id}/resolve`)
      setAlerts((prev) => prev.filter((a) => a.alertId !== id))
      await api.get<StockAlertSummary>('/stockalerts/summary').then((r) => setSummary(r.data))
    } catch {
      setError('Không thể xử lý cảnh báo.')
    }
  }

  const lowStockCount = summary?.lowStock ?? 0
  const expiringCount = summary?.expiringSoon ?? 0
  const deadStockCount = summary?.deadStock ?? 0
  
  const filteredAlerts = alerts.filter(a => {
    const matchText = (a.skucode?.toLowerCase() || '').includes(filterText.toLowerCase()) || 
                     (a.productName?.toLowerCase() || '').includes(filterText.toLowerCase());
    const matchType = filterType === 'ALL' || a.alertType === filterType;
    return matchText && matchType;
  });

  const criticalCount = filteredAlerts.filter((a) => a.severity === 'CRITICAL').length;

  return (
    <div className="min-h-screen bg-background text-on-surface antialiased overflow-hidden flex">
      <Sidebar />

      <main className="ml-[280px] flex-1 h-screen overflow-y-auto custom-scrollbar flex flex-col relative animate-fade-in-up">
        {/* Top Navigation */}
        <header className="sticky top-0 w-full h-20 bg-surface/75 backdrop-blur-md border-b border-outline-variant/30 flex justify-between items-center px-gutter z-40">
          <div className="flex items-center gap-4">
            <h2 className="font-headline-md text-headline-md font-bold text-on-surface">Cảnh báo tồn kho</h2>
            <div className="h-6 w-px bg-outline-variant/50"></div>
            <span className="text-on-surface-variant font-label-md">
              Quét tự động mỗi <span className="text-primary font-bold">30 phút</span> · Debounce 12 giờ
            </span>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={handleScan}
              disabled={scanning}
              className="flex items-center gap-2 px-4 py-2 bg-primary text-on-primary rounded-lg font-label-md shadow-lg shadow-primary/20 hover:scale-[0.98] transition-transform disabled:opacity-60"
            >
              <span className="material-symbols-outlined text-[20px]">{scanning ? 'hourglass_top' : 'refresh'}</span>
              {scanning ? 'Đang quét…' : 'Quét ngay'}
            </button>
            <span className="material-symbols-outlined p-2 hover:bg-surface-container-high/50 rounded-full cursor-pointer transition-all duration-200">notifications</span>
          </div>
        </header>

        {/* Main Content */}
        <div className="p-8 md:p-12 min-h-screen space-y-10">
          {error && (
            <div className="mb-6 flex items-center gap-2 rounded-lg border border-error/30 bg-error/10 px-5 py-4 text-error font-label-md">
              <span className="material-symbols-outlined text-[20px]">error</span>
              {error}
            </div>
          )}
          {message && (
            <div className="mb-6 flex items-center gap-2 rounded-lg border border-primary/30 bg-primary/10 px-5 py-4 text-primary font-label-md">
              <span className="material-symbols-outlined text-[20px]">mark_email_read</span>
              {message}
            </div>
          )}

          {/* Statistics Bento Grid */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-gutter mb-stack_lg">
            {/* Low Stock Card */}
            <div className="glass-card p-6 rounded-lg flex flex-col justify-between hover:glow-primary transition-all duration-300">
              <div className="flex justify-between items-start">
                <div className="w-12 h-12 rounded-xl bg-error/10 text-error flex items-center justify-center">
                  <span className="material-symbols-outlined">trending_down</span>
                </div>
                <span className="px-2 py-1 bg-error/10 text-error rounded text-[12px] font-bold">NGHIÊM TRỌNG</span>
              </div>
              <div className="mt-4">
                <h3 className="text-on-surface-variant font-label-md">Tồn kho thấp</h3>
                <p className="text-display-lg font-display-lg leading-tight">{lowStockCount}</p>
                <p className="text-error font-label-md mt-1">{criticalCount} mục mức nghiêm trọng</p>
              </div>
            </div>

            {/* Expiring Soon Card */}
            <div className="glass-card p-6 rounded-lg flex flex-col justify-between hover:glow-primary transition-all duration-300">
              <div className="flex justify-between items-start">
                <div className="w-12 h-12 rounded-xl bg-secondary-container/20 text-on-secondary-container flex items-center justify-center">
                  <span className="material-symbols-outlined">event_busy</span>
                </div>
                <span className="px-2 py-1 bg-secondary-container/20 text-on-secondary-container rounded text-[12px] font-bold">KHẨN</span>
              </div>
              <div className="mt-4">
                <h3 className="text-on-surface-variant font-label-md">Sắp hết hạn</h3>
                <p className="text-display-lg font-display-lg leading-tight">{expiringCount}</p>
                <p className="text-on-surface-variant font-label-md mt-1">Cần ưu tiên xuất</p>
              </div>
            </div>

            {/* Long-term Storage */}
            <div className="glass-card p-6 rounded-lg flex flex-col justify-between hover:glow-primary transition-all duration-300">
              <div className="flex justify-between items-start">
                <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                  <span className="material-symbols-outlined">hourglass_empty</span>
                </div>
                <span className="px-2 py-1 bg-primary/10 text-primary rounded text-[12px] font-bold">THEO DÕI</span>
              </div>
              <div className="mt-4">
                <h3 className="text-on-surface-variant font-label-md">Tồn kho lâu</h3>
                <p className="text-display-lg font-display-lg leading-tight">{deadStockCount}</p>
                <p className="text-on-surface-variant font-label-md mt-1">Hàng &gt; 90 ngày</p>
              </div>
            </div>

            {/* Total alerts */}
            <div className="glass-card p-6 rounded-lg flex flex-col justify-between hover:glow-primary transition-all duration-300">
              <div className="flex justify-between items-start">
                <div className="w-12 h-12 rounded-xl bg-tertiary-container/10 text-tertiary flex items-center justify-center">
                  <span className="material-symbols-outlined">notifications_active</span>
                </div>
                <span className="px-2 py-1 bg-tertiary-container/10 text-tertiary rounded text-[12px] font-bold">TỔNG</span>
              </div>
              <div className="mt-4">
                <h3 className="text-on-surface-variant font-label-md">Cảnh báo đang mở</h3>
                <p className="text-display-lg font-display-lg leading-tight">{summary?.total ?? 0}</p>
                <p className="text-on-surface-variant font-label-md mt-1">Chưa xử lý</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-10">
            {/* Detailed Alert Table */}
            <div className="lg:col-span-3 glass-card rounded-2xl border border-outline-variant/30 flex flex-col shadow-2xl">
              <div className="p-8 border-b border-outline-variant/30 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div>
                  <h3 className="font-headline-md text-headline-md font-bold">Danh sách cảnh báo</h3>
                  <p className="text-on-surface-variant font-label-md mt-1">Tổng cộng {filteredAlerts.length} bản ghi</p>
                </div>
                
                <div className="flex flex-wrap items-center gap-4 w-full md:w-auto">
                  <div className="relative flex-1 md:w-64">
                    <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline text-[20px]">search</span>
                    <input 
                      type="text" 
                      placeholder="Tìm SKU, sản phẩm..." 
                      value={filterText}
                      onChange={(e) => setFilterText(e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 bg-surface-container-high rounded-xl border border-outline-variant/50 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all text-sm"
                    />
                  </div>
                  
                  <select 
                    value={filterType}
                    onChange={(e) => setFilterType(e.target.value)}
                    className="pl-4 pr-10 py-2.5 bg-surface-container-high rounded-xl border border-outline-variant/50 focus:border-primary outline-none transition-all text-sm appearance-none cursor-pointer"
                    style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' height=\'24\' viewBox=\'0 -960 960 960\' width=\'24\'%3E%3Cpath d=\'M480-345 240-585l56-56 184 184 184-184 56 56-240 240Z\'/%3E%3C/svg%3E")', backgroundRepeat: 'no-repeat', backgroundPosition: 'right 10px center' }}
                  >
                    <option value="ALL">Tất cả loại</option>
                    <option value="LOW_STOCK">Tồn thấp</option>
                    <option value="EXPIRY_SOON">Sắp hết hạn</option>
                    <option value="DEAD_STOCK">Tồn lâu</option>
                  </select>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse min-w-[900px]">
                  <thead>
                    <tr className="bg-surface-container-low/50">
                      <th className="px-6 py-4 font-label-md text-outline whitespace-nowrap">Mã SKU</th>
                      <th className="px-6 py-4 font-label-md text-outline whitespace-nowrap">Sản phẩm</th>
                      <th className="px-6 py-4 font-label-md text-outline whitespace-nowrap">Tồn / Ngưỡng</th>
                      <th className="px-6 py-4 font-label-md text-outline whitespace-nowrap">Loại cảnh báo</th>
                      <th className="px-6 py-4 font-label-md text-outline whitespace-nowrap">Mức độ</th>
                      <th className="px-6 py-4 font-label-md text-outline whitespace-nowrap">Thao tác</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-outline-variant/20">
                    {loading && (
                      <tr>
                        <td colSpan={6} className="px-6 py-8 text-center text-on-surface-variant">Đang tải…</td>
                      </tr>
                    )}
                    {!loading && alerts.length === 0 && (
                      <tr>
                        <td colSpan={6} className="px-6 py-8 text-center text-on-surface-variant">
                          Không có cảnh báo nào đang mở.
                        </td>
                      </tr>
                    )}
                    {!loading &&
                      filteredAlerts.map((a, idx) => {
                        const isCritical = a.severity === 'CRITICAL'
                        return (
                          <tr
                            key={a.alertId}
                            className={`hover:bg-surface-container-high/20 transition-colors group ${
                              idx % 2 === 1 ? 'bg-surface-container-low/20' : ''
                            }`}
                          >
                            <td className="px-6 py-4 font-data-mono text-primary whitespace-nowrap">{a.skucode ?? '—'}</td>
                            <td className="px-6 py-4">
                              <div className="font-body-md line-clamp-1">{a.productName ?? '—'}</div>
                              <div className="text-[12px] text-on-surface-variant">{a.customerName ?? ''}</div>
                            </td>
                            <td className="px-6 py-4 font-data-mono whitespace-nowrap">
                              {a.currentQty ?? 0} / <span className="text-outline">{a.thresholdQty ?? 0}</span>
                            </td>
                            <td className="px-6 py-4">
                              <div className={`flex items-center gap-2 whitespace-nowrap ${isCritical ? 'text-error' : 'text-secondary'}`}>
                                <span className="material-symbols-outlined text-[18px]">report_problem</span>
                                <span className="font-label-md">{ALERT_TYPE_LABELS[a.alertType] ?? a.alertType}</span>
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <span
                                className={`px-3 py-1 rounded-full text-[12px] font-bold shadow-sm whitespace-nowrap inline-block ${
                                  isCritical
                                    ? 'bg-error text-on-error'
                                    : 'bg-secondary-container text-on-secondary-container'
                                }`}
                              >
                                {isCritical ? 'NGHIÊM TRỌNG' : 'CẢNH BÁO'}
                              </span>
                            </td>
                            <td className="px-6 py-4">
                              <button
                                onClick={() => handleResolve(a.alertId)}
                                title="Đánh dấu đã xử lý"
                                className="p-2 rounded-full hover:bg-primary-container hover:text-on-primary-container transition-all"
                              >
                                <span className="material-symbols-outlined">task_alt</span>
                              </button>
                            </td>
                          </tr>
                        )
                      })}
                  </tbody>
                </table>
              </div>
              <div className="p-6 border-t border-outline-variant/30 flex justify-center bg-surface-container-low/30 rounded-b-2xl">
                <span className="text-on-surface-variant font-label-md font-medium italic">
                  Đang hiển thị {filteredAlerts.length} trên tổng số {alerts.length} cảnh báo
                </span>
              </div>
            </div>

            {/* Right Column: AI & Trends */}
            <div className="lg:col-span-1 space-y-10 flex flex-col">
              {/* AI Prediction Panel */}
              <div className="glass-card rounded-2xl p-8 glow-primary-active border-primary/30 relative overflow-hidden shadow-xl">
                <div className="absolute top-0 right-0 p-4 opacity-10">
                  <span className="material-symbols-outlined text-[80px]">smart_toy</span>
                </div>

                <h3 className="font-headline-md text-headline-md mb-4 flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary">auto_awesome</span>
                  Dự đoán AI
                </h3>

                <div className="space-y-6 relative z-10">
                  <div className="p-4 bg-primary/5 rounded-lg border border-primary/10">
                    <p className="font-label-md text-on-surface mb-2">Nguy cơ hết hàng</p>
                    <div className="flex items-end gap-4 mb-2">
                      <span className="text-headline-lg font-headline-lg text-primary leading-none">
                        {summary && summary.lowStock > 0 ? '82%' : '12%'}
                      </span>
                      <span className="text-on-surface-variant font-label-md mb-1">Dự báo tuần tới</span>
                    </div>
                    <div className="w-full bg-outline-variant/30 h-2 rounded-full overflow-hidden">
                      <div
                        className="bg-primary h-full rounded-full shadow-[0_0_8px_rgba(0,74,198,0.5)]"
                        style={{ width: summary && summary.lowStock > 0 ? '82%' : '12%' }}
                      ></div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h4 className="font-label-md text-outline uppercase tracking-widest text-[10px]">Khuyến nghị</h4>
                    <div className="flex items-center gap-4">
                      <div className="flex-1">
                        <p className="font-body-md">Đặt hàng bổ sung</p>
                        <p className="text-[12px] text-on-surface-variant">Cho {lowStockCount} SKU dưới ngưỡng an toàn</p>
                      </div>
                      <div className="w-12 h-12 flex items-center justify-center text-primary">
                        <span className="material-symbols-outlined text-[32px]">trending_up</span>
                      </div>
                    </div>
                  </div>

                  <button className="w-full py-3 bg-primary text-on-primary rounded-lg font-label-md shadow-lg shadow-primary/20 hover:scale-[0.98] transition-transform flex items-center justify-center gap-2">
                    <span className="material-symbols-outlined text-[20px]">bolt</span>
                    Tạo đề xuất nhập hàng
                  </button>
                </div>
              </div>

              {/* Debounce info */}
              <div className="glass-card rounded-lg p-6 overflow-hidden">
                <h3 className="font-label-md text-on-surface mb-4 flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary text-[20px]">schedule</span>
                  Cơ chế cảnh báo
                </h3>
                <ul className="space-y-3 text-on-surface-variant font-label-md">
                  <li className="flex items-start gap-2">
                    <span className="material-symbols-outlined text-primary text-[18px]">autorenew</span>
                    Quét ngầm tồn kho định kỳ mỗi 30 phút.
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="material-symbols-outlined text-primary text-[18px]">mail</span>
                    Gửi email khi SKU chạm ngưỡng tối thiểu.
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="material-symbols-outlined text-primary text-[18px]">timer</span>
                    Debounce 12 giờ — không gửi lại email trùng trong 12 giờ.
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

export default StockAlerts
