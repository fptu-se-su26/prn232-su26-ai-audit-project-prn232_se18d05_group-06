import { useEffect, useMemo, useState } from 'react'
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

const ALERT_EMAIL = 'tungtvde180109@fpt.edu.vn'

const getCurrentUserEmail = () => {
  try {
    const raw = localStorage.getItem('user')
    if (!raw) return ALERT_EMAIL
    const user = JSON.parse(raw) as { email?: string }
    return user.email?.trim() || ALERT_EMAIL
  } catch {
    return ALERT_EMAIL
  }
}
const ALERT_TYPE_LABELS: Record<string, string> = {
  LOW_STOCK: 'Tồn thấp',
  EXPIRY_SOON: 'Sắp hết hạn',
  DEAD_STOCK: 'Tồn lâu',
}

const formatDateTime = (value: string | null) => {
  if (!value) return 'Chưa gửi'
  return new Date(value).toLocaleString('vi-VN', {
    hour: '2-digit',
    minute: '2-digit',
    day: '2-digit',
    month: '2-digit',
  })
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
  const recipientEmail = getCurrentUserEmail()

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
      const res = await api.post<{ emailsSent: number; message: string }>('/stockalerts/scan?force=true')
      setMessage(res.data.message || `Quét hoàn tất. Email cảnh báo được gửi về ${recipientEmail}.`)
      await loadData()
    } catch (err) {
      const data = (err as { response?: { data?: unknown } }).response?.data
      const detail = typeof data === 'string' ? data : 'Vui lòng kiểm tra cấu hình SMTP trong backend.'
      setError(`Quét tồn kho thất bại. ${detail}`)
    } finally {
      setScanning(false)
    }
  }

  const handleResolve = async (id: number) => {
    setError(null)
    try {
      await api.post(`/stockalerts/${id}/resolve`)
      setAlerts((prev) => prev.filter((a) => a.alertId !== id))
      const res = await api.get<StockAlertSummary>('/stockalerts/summary')
      setSummary(res.data)
    } catch {
      setError('Không thể đánh dấu cảnh báo đã xử lý.')
    }
  }

  const filteredAlerts = useMemo(() => {
    const keyword = filterText.trim().toLowerCase()
    return alerts.filter((alert) => {
      const matchText =
        !keyword ||
        (alert.skucode ?? '').toLowerCase().includes(keyword) ||
        (alert.productName ?? '').toLowerCase().includes(keyword) ||
        (alert.customerName ?? '').toLowerCase().includes(keyword)
      const matchType = filterType === 'ALL' || alert.alertType === filterType
      return matchText && matchType
    })
  }, [alerts, filterText, filterType])

  const criticalCount = filteredAlerts.filter((a) => a.severity === 'CRITICAL').length
  const lowStockCount = summary?.lowStock ?? 0
  const expiringCount = summary?.expiringSoon ?? 0
  const deadStockCount = summary?.deadStock ?? 0
  const totalCount = summary?.total ?? 0

  const metricCards = [
    {
      label: 'Tồn kho thấp',
      value: lowStockCount,
      hint: `${criticalCount} mục nghiêm trọng`,
      icon: 'trending_down',
      tone: 'rose',
      badge: 'NGHIÊM TRỌNG',
    },
    {
      label: 'Sắp hết hạn',
      value: expiringCount,
      hint: 'Cần ưu tiên xuất',
      icon: 'event_busy',
      tone: 'cyan',
      badge: 'KHẨN',
    },
    {
      label: 'Tồn kho lâu',
      value: deadStockCount,
      hint: 'Hàng trên 90 ngày',
      icon: 'hourglass_empty',
      tone: 'blue',
      badge: 'THEO DÕI',
    },
    {
      label: 'Cảnh báo đang mở',
      value: totalCount,
      hint: 'Chưa xử lý',
      icon: 'notifications_active',
      tone: 'slate',
      badge: 'TỔNG',
    },
  ]

  return (
    <div className="min-h-screen bg-[#f5f7fb] text-slate-950 antialiased flex overflow-hidden">
      <Sidebar />

      <main className="ml-[280px] h-screen flex-1 overflow-y-auto bg-[#f5f7fb]">
        <header className="sticky top-0 z-40 border-b border-slate-200/80 bg-white/95 px-8 py-5 backdrop-blur-xl">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h1 className="text-2xl font-black tracking-tight text-slate-950">Cảnh báo tồn kho</h1>
              <p className="mt-1 text-sm font-semibold text-slate-500">
                Quét tự động mỗi <span className="text-blue-700">30 phút</span> · Worker giữ debounce 12 giờ · Quét thủ công gửi lại email để test
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <div className="rounded-full border border-emerald-200 bg-emerald-50 px-4 py-2 text-sm font-bold text-emerald-800">
                Email nhận cảnh báo: {recipientEmail}
              </div>
              <button
                onClick={handleScan}
                disabled={scanning}
                className="inline-flex h-12 items-center gap-2 rounded-lg bg-blue-700 px-5 text-sm font-black text-white shadow-lg shadow-blue-700/20 transition hover:bg-blue-800 disabled:cursor-not-allowed disabled:opacity-60"
              >
                <span className="material-symbols-outlined text-[20px]">{scanning ? 'hourglass_top' : 'refresh'}</span>
                {scanning ? 'Đang quét...' : 'Quét ngay'}
              </button>
            </div>
          </div>
        </header>

        <section className="space-y-6 p-6 lg:p-8">
          {error && (
            <div className="flex items-start gap-3 rounded-lg border border-rose-200 bg-rose-50 px-5 py-4 text-sm font-bold text-rose-800">
              <span className="material-symbols-outlined text-[20px]">error</span>
              <span>{error}</span>
            </div>
          )}

          {message && (
            <div className="flex items-start gap-3 rounded-lg border border-emerald-200 bg-emerald-50 px-5 py-4 text-sm font-bold text-emerald-800">
              <span className="material-symbols-outlined text-[20px]">mark_email_read</span>
              <span>{message}</span>
            </div>
          )}

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
            {metricCards.map((card) => {
              const toneClass =
                card.tone === 'rose'
                  ? 'bg-rose-50 text-rose-700 border-rose-200'
                  : card.tone === 'cyan'
                    ? 'bg-cyan-50 text-cyan-700 border-cyan-200'
                    : card.tone === 'blue'
                      ? 'bg-blue-50 text-blue-700 border-blue-200'
                      : 'bg-slate-100 text-slate-700 border-slate-200'

              return (
                <div key={card.label} className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
                  <div className="flex items-start justify-between gap-3">
                    <div className={`flex h-12 w-12 items-center justify-center rounded-lg border ${toneClass}`}>
                      <span className="material-symbols-outlined text-[24px]">{card.icon}</span>
                    </div>
                    <span className={`rounded px-2.5 py-1 text-xs font-black ${toneClass}`}>{card.badge}</span>
                  </div>
                  <div className="mt-5">
                    <p className="text-sm font-bold text-slate-500">{card.label}</p>
                    <p className="mt-1 text-5xl font-black leading-none text-slate-950">{card.value}</p>
                    <p className="mt-3 text-sm font-bold text-slate-600">{card.hint}</p>
                  </div>
                </div>
              )
            })}
          </div>

          <div className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1fr)_320px]">
            <div className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
              <div className="flex flex-col gap-4 border-b border-slate-200 px-6 py-5 lg:flex-row lg:items-center lg:justify-between">
                <div>
                  <h2 className="text-xl font-black text-slate-950">Danh sách cảnh báo</h2>
                  <p className="mt-1 text-sm font-semibold text-slate-500">Đang hiển thị {filteredAlerts.length} / {alerts.length} bản ghi</p>
                </div>

                <div className="flex flex-col gap-3 sm:flex-row">
                  <label className="relative block sm:w-72">
                    <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[20px] text-slate-400">search</span>
                    <input
                      value={filterText}
                      onChange={(event) => setFilterText(event.target.value)}
                      placeholder="Tìm SKU, sản phẩm..."
                      className="h-11 w-full rounded-lg border border-slate-300 bg-white pl-10 pr-3 text-sm font-semibold text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-600 focus:ring-4 focus:ring-blue-100"
                    />
                  </label>
                  <select
                    value={filterType}
                    onChange={(event) => setFilterType(event.target.value)}
                    className="h-11 rounded-lg border border-slate-300 bg-white px-3 text-sm font-bold text-slate-900 outline-none transition focus:border-blue-600 focus:ring-4 focus:ring-blue-100"
                  >
                    <option value="ALL">Tất cả loại</option>
                    <option value="LOW_STOCK">Tồn thấp</option>
                    <option value="EXPIRY_SOON">Sắp hết hạn</option>
                    <option value="DEAD_STOCK">Tồn lâu</option>
                  </select>
                </div>
              </div>

              <div className="hidden overflow-x-auto lg:block">
                <table className="w-full min-w-[980px] border-collapse text-left">
                  <thead className="bg-slate-50 text-xs font-black uppercase tracking-wide text-slate-500">
                    <tr>
                      <th className="px-6 py-4">Mã SKU</th>
                      <th className="px-6 py-4">Sản phẩm</th>
                      <th className="px-6 py-4">Tồn / Ngưỡng</th>
                      <th className="px-6 py-4">Loại cảnh báo</th>
                      <th className="px-6 py-4">Email gần nhất</th>
                      <th className="px-6 py-4">Mức độ</th>
                      <th className="px-6 py-4 text-right">Thao tác</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {loading && (
                      <tr>
                        <td colSpan={7} className="px-6 py-10 text-center text-sm font-bold text-slate-500">Đang tải dữ liệu...</td>
                      </tr>
                    )}
                    {!loading && filteredAlerts.length === 0 && (
                      <tr>
                        <td colSpan={7} className="px-6 py-10 text-center text-sm font-bold text-slate-500">Không có cảnh báo phù hợp.</td>
                      </tr>
                    )}
                    {!loading && filteredAlerts.map((alert) => {
                      const isCritical = alert.severity === 'CRITICAL'
                      return (
                        <tr key={alert.alertId} className="transition hover:bg-blue-50/50">
                          <td className="px-6 py-4 font-mono text-sm font-black text-blue-700">{alert.skucode ?? '-'}</td>
                          <td className="px-6 py-4">
                            <p className="max-w-[260px] truncate text-sm font-black text-slate-900">{alert.productName ?? '-'}</p>
                            <p className="mt-1 max-w-[260px] truncate text-xs font-semibold text-slate-500">{alert.customerName ?? 'Chưa gán khách hàng'}</p>
                          </td>
                          <td className="px-6 py-4 text-sm font-black text-slate-900">
                            <span className={isCritical ? 'text-rose-700' : 'text-slate-900'}>{alert.currentQty ?? 0}</span>
                            <span className="text-slate-400"> / {alert.thresholdQty ?? 0}</span>
                          </td>
                          <td className="px-6 py-4">
                            <span className="inline-flex items-center gap-2 rounded-full bg-rose-50 px-3 py-1 text-xs font-black text-rose-700">
                              <span className="material-symbols-outlined text-[16px]">report_problem</span>
                              {ALERT_TYPE_LABELS[alert.alertType] ?? alert.alertType}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-xs font-bold text-slate-600">{formatDateTime(alert.emailSentAt)}</td>
                          <td className="px-6 py-4">
                            <span className={`rounded-full px-3 py-1 text-xs font-black ${isCritical ? 'bg-rose-100 text-rose-800' : 'bg-amber-100 text-amber-800'}`}>
                              {isCritical ? 'NGHIÊM TRỌNG' : 'CẢNH BÁO'}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-right">
                            <button
                              onClick={() => handleResolve(alert.alertId)}
                              className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 text-slate-600 transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700"
                              title="Đánh dấu đã xử lý"
                            >
                              <span className="material-symbols-outlined text-[20px]">task_alt</span>
                            </button>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>

              <div className="divide-y divide-slate-100 lg:hidden">
                {loading && <p className="p-5 text-center text-sm font-bold text-slate-500">Đang tải dữ liệu...</p>}
                {!loading && filteredAlerts.length === 0 && <p className="p-5 text-center text-sm font-bold text-slate-500">Không có cảnh báo phù hợp.</p>}
                {!loading && filteredAlerts.map((alert) => {
                  const isCritical = alert.severity === 'CRITICAL'
                  return (
                    <article key={alert.alertId} className="p-5">
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <p className="font-mono text-sm font-black text-blue-700">{alert.skucode ?? '-'}</p>
                          <h3 className="mt-1 text-base font-black text-slate-950">{alert.productName ?? '-'}</h3>
                          <p className="mt-1 text-xs font-semibold text-slate-500">{alert.customerName ?? 'Chưa gán khách hàng'}</p>
                        </div>
                        <span className={`shrink-0 rounded-full px-3 py-1 text-xs font-black ${isCritical ? 'bg-rose-100 text-rose-800' : 'bg-amber-100 text-amber-800'}`}>
                          {isCritical ? 'NGHIÊM TRỌNG' : 'CẢNH BÁO'}
                        </span>
                      </div>
                      <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
                        <div className="rounded-lg bg-slate-50 p-3">
                          <p className="font-bold text-slate-500">Tồn / Ngưỡng</p>
                          <p className="mt-1 font-black text-slate-950">{alert.currentQty ?? 0} / {alert.thresholdQty ?? 0}</p>
                        </div>
                        <div className="rounded-lg bg-slate-50 p-3">
                          <p className="font-bold text-slate-500">Email gần nhất</p>
                          <p className="mt-1 font-black text-slate-950">{formatDateTime(alert.emailSentAt)}</p>
                        </div>
                      </div>
                      <button
                        onClick={() => handleResolve(alert.alertId)}
                        className="mt-4 inline-flex h-10 w-full items-center justify-center gap-2 rounded-lg border border-slate-200 text-sm font-black text-slate-700 transition hover:bg-blue-50 hover:text-blue-700"
                      >
                        <span className="material-symbols-outlined text-[20px]">task_alt</span>
                        Đánh dấu đã xử lý
                      </button>
                    </article>
                  )
                })}
              </div>
            </div>

            <aside className="space-y-6">
              <section className="rounded-lg border border-blue-200 bg-blue-50 p-5">
                <div className="flex items-center gap-3 text-blue-800">
                  <span className="material-symbols-outlined">auto_awesome</span>
                  <h2 className="text-lg font-black">Dự đoán AI</h2>
                </div>
                <div className="mt-5 rounded-lg border border-blue-200 bg-white p-4">
                  <p className="text-sm font-bold text-slate-500">Nguy cơ hết hàng</p>
                  <div className="mt-2 flex items-end gap-3">
                    <span className="text-4xl font-black text-blue-700">{lowStockCount > 0 ? '82%' : '12%'}</span>
                    <span className="pb-1 text-sm font-bold text-slate-500">tuần tới</span>
                  </div>
                  <div className="mt-3 h-2 overflow-hidden rounded-full bg-blue-100">
                    <div className="h-full rounded-full bg-blue-700" style={{ width: lowStockCount > 0 ? '82%' : '12%' }} />
                  </div>
                </div>
                <p className="mt-4 text-sm font-semibold leading-6 text-blue-900">
                  Nên ưu tiên bổ sung các SKU đang dưới ngưỡng an toàn và theo dõi email đã gửi để tránh bỏ sót cảnh báo.
                </p>
              </section>

              <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
                <h2 className="flex items-center gap-2 text-base font-black text-slate-950">
                  <span className="material-symbols-outlined text-blue-700">schedule</span>
                  Cơ chế cảnh báo
                </h2>
                <ul className="mt-4 space-y-3 text-sm font-semibold leading-6 text-slate-600">
                  <li className="flex gap-2"><span className="material-symbols-outlined text-[18px] text-blue-700">autorenew</span>Worker quét nền định kỳ mỗi 30 phút.</li>
                  <li className="flex gap-2"><span className="material-symbols-outlined text-[18px] text-blue-700">mail</span>Nút Quét ngay gửi lại email để test thủ công.</li>
                  <li className="flex gap-2"><span className="material-symbols-outlined text-[18px] text-blue-700">timer</span>Debounce chỉ áp dụng cho quét nền để tránh spam.</li>
                </ul>
              </section>
            </aside>
          </div>
        </section>
      </main>
    </div>
  )
}

export default StockAlerts