import { useCallback, useEffect, useMemo, useState } from 'react'
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts'
import Sidebar from '../../components/Sidebar'
import api from '../../lib/api'

// ─── Types ────────────────────────────────────────────────────────────────────

type AlertType = 'ALL' | 'DEAD_STOCK' | 'EXPIRY_SOON' | 'CRITICAL_EXPIRY'

interface DeadExpiryItem {
  skucode: string
  productName: string
  customerName: string
  binCode: string
  zoneCode: string
  zoneName: string
  quantity: number
  expiryDate: string | null
  inboundDate: string | null
  daysStored: number | null
  daysToExpiry: number | null
  alertType: string
  severity: string
}

interface Summary {
  deadStock: number
  expirySoon: number
  criticalExpiry: number
  total: number
}

// ─── Constants ────────────────────────────────────────────────────────────────

const ALERT_LABELS: Record<string, string> = {
  DEAD_STOCK: 'Tồn lâu',
  EXPIRY_SOON: 'Sắp hết hạn',
  CRITICAL_EXPIRY: 'Khẩn cấp',
}

const SEVERITY_COLORS: Record<string, string> = {
  HIGH: '#ef4444',
  MEDIUM: '#f59e0b',
  LOW: '#64748b',
}

const DONUT_COLORS = ['#3b82f6', '#f59e0b', '#ef4444']

const fmt = (v: string | null) => (v ? new Date(v + 'T00:00:00').toLocaleDateString('vi-VN') : '—')

// ─── Component ────────────────────────────────────────────────────────────────

const DeadExpiryDashboard = () => {
  const [items, setItems] = useState<DeadExpiryItem[]>([])
  const [summary, setSummary] = useState<Summary | null>(null)
  const [zones, setZones] = useState<string[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [exporting, setExporting] = useState(false)

  // Filters
  const [skuFilter, setSkuFilter] = useState('')
  const [alertType, setAlertType] = useState<AlertType>('ALL')
  const [zone, setZone] = useState('ALL')
  const [inboundFrom, setInboundFrom] = useState('')
  const [inboundTo, setInboundTo] = useState('')
  const [expiryFrom, setExpiryFrom] = useState('')
  const [expiryTo, setExpiryTo] = useState('')

  // ─── Data loading ──────────────────────────────────────────────────────────

  const loadAll = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const params: Record<string, string> = {}
      if (skuFilter.trim()) params.sku = skuFilter.trim()
      if (alertType !== 'ALL') params.alertType = alertType
      if (zone !== 'ALL') params.zone = zone
      if (inboundFrom) params.inboundFrom = inboundFrom
      if (inboundTo) params.inboundTo = inboundTo
      if (expiryFrom) params.expiryFrom = expiryFrom
      if (expiryTo) params.expiryTo = expiryTo

      const [itemsRes, summaryRes] = await Promise.all([
        api.get<DeadExpiryItem[]>('/deadexpirystock', { params }),
        api.get<Summary>('/deadexpirystock/summary'),
      ])
      setItems(itemsRes.data)
      setSummary(summaryRes.data)
    } catch {
      setError('Không tải được dữ liệu. Vui lòng kiểm tra kết nối backend.')
    } finally {
      setLoading(false)
    }
  }, [skuFilter, alertType, zone, inboundFrom, inboundTo, expiryFrom, expiryTo])

  useEffect(() => {
    // Load zones once on mount
    api.get<string[]>('/deadexpirystock/zones').then(r => setZones(r.data)).catch(() => {})
  }, [])

  useEffect(() => {
    loadAll()
  }, [loadAll])

  const handleReset = () => {
    setSkuFilter('')
    setAlertType('ALL')
    setZone('ALL')
    setInboundFrom('')
    setInboundTo('')
    setExpiryFrom('')
    setExpiryTo('')
  }

  const handleExport = async (format: 'excel' | 'pdf') => {
    setExporting(true)
    try {
      const params: Record<string, string> = { format }
      if (skuFilter.trim()) params.sku = skuFilter.trim()
      if (alertType !== 'ALL') params.alertType = alertType
      if (zone !== 'ALL') params.zone = zone
      if (inboundFrom) params.inboundFrom = inboundFrom
      if (inboundTo) params.inboundTo = inboundTo
      if (expiryFrom) params.expiryFrom = expiryFrom
      if (expiryTo) params.expiryTo = expiryTo

      const res = await api.get('/deadexpirystock/export', {
        params,
        responseType: 'blob',
      })
      const disposition = res.headers['content-disposition'] ?? ''
      const nameMatch = disposition.match(/filename="?(.+?)"?(?:;|$)/)
      const fileName = nameMatch?.[1] ?? `dead-expiry-stock.${format === 'excel' ? 'xlsx' : 'pdf'}`
      const url = URL.createObjectURL(new Blob([res.data]))
      const a = document.createElement('a')
      a.href = url
      a.download = fileName
      a.click()
      URL.revokeObjectURL(url)
    } catch {
      setError('Xuất file thất bại. Vui lòng thử lại.')
    } finally {
      setExporting(false)
    }
  }

  // ─── Derived data ──────────────────────────────────────────────────────────

  const donutData = useMemo(() => {
    if (!summary) return []
    return [
      { name: 'Tồn lâu', value: summary.deadStock },
      { name: 'Sắp hết hạn', value: summary.expirySoon },
      { name: 'Khẩn cấp', value: summary.criticalExpiry },
    ].filter(d => d.value > 0)
  }, [summary])

  const topCritical = useMemo(() =>
    items
      .filter(i => i.alertType === 'CRITICAL_EXPIRY')
      .slice(0, 5),
    [items]
  )

  const metricCards = [
    {
      label: 'Tồn lâu > 90 ngày',
      value: summary?.deadStock ?? 0,
      icon: 'hourglass_empty',
      badge: 'TỒN LÂU',
      tone: 'blue',
      accent: 'from-blue-500 to-blue-700',
      bg: 'bg-blue-50',
      text: 'text-blue-700',
      border: 'border-blue-200',
      badgeBg: 'bg-blue-100',
    },
    {
      label: 'Sắp hết hạn (8–30 ngày)',
      value: summary?.expirySoon ?? 0,
      icon: 'event_busy',
      badge: 'THEO DÕI',
      tone: 'amber',
      accent: 'from-amber-500 to-orange-600',
      bg: 'bg-amber-50',
      text: 'text-amber-700',
      border: 'border-amber-200',
      badgeBg: 'bg-amber-100',
    },
    {
      label: 'Khẩn cấp (≤7 ngày)',
      value: summary?.criticalExpiry ?? 0,
      icon: 'warning',
      badge: 'KHẨN CẤP',
      tone: 'rose',
      accent: 'from-rose-500 to-red-600',
      bg: 'bg-rose-50',
      text: 'text-rose-700',
      border: 'border-rose-200',
      badgeBg: 'bg-rose-100',
    },
    {
      label: 'Tổng mục cần xử lý',
      value: summary?.total ?? 0,
      icon: 'inventory_2',
      badge: 'TỔNG',
      tone: 'slate',
      accent: 'from-slate-600 to-slate-800',
      bg: 'bg-slate-100',
      text: 'text-slate-800',
      border: 'border-slate-300',
      badgeBg: 'bg-slate-200',
    },
  ]

  // ─── Render ────────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 via-slate-50 to-blue-50/40 text-slate-900 antialiased flex overflow-hidden">
      <Sidebar />

        <main className="ml-[280px] h-screen flex-1 overflow-y-auto">
        {/* Header - SOLID white with strong shadow + accent bar */}
        <header className="sticky top-0 z-40 bg-white shadow-md border-b-2 border-blue-600/80">
          <div className="flex flex-col gap-4 px-8 py-5 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-start gap-4">
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-blue-800 shadow-lg shadow-blue-600/30">
                <span className="material-symbols-outlined text-[32px] text-white">inventory</span>
              </div>
              <div>

              </div>
            </div>

            {/* Export buttons */}
            <div className="flex flex-wrap items-center gap-3">
              <button
                id="btn-export-excel"
                onClick={() => handleExport('excel')}
                disabled={exporting || loading}
                className="inline-flex h-11 items-center gap-2 rounded-lg bg-gradient-to-b from-emerald-600 to-emerald-700 px-5 text-sm font-black text-white shadow-lg shadow-emerald-700/30 transition hover:from-emerald-700 hover:to-emerald-800 hover:shadow-xl active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
              >
                <span className="material-symbols-outlined text-[20px]">table_view</span>
                {exporting ? 'Đang xuất...' : 'Xuất Excel'}
              </button>
              <button
                id="btn-export-pdf"
                onClick={() => handleExport('pdf')}
                disabled={exporting || loading}
                className="inline-flex h-11 items-center gap-2 rounded-lg bg-gradient-to-b from-rose-600 to-rose-700 px-5 text-sm font-black text-white shadow-lg shadow-rose-700/30 transition hover:from-rose-700 hover:to-rose-800 hover:shadow-xl active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
              >
                <span className="material-symbols-outlined text-[20px]">picture_as_pdf</span>
                {exporting ? 'Đang xuất...' : 'Xuất PDF'}
              </button>
              <button
                id="btn-refresh"
                onClick={loadAll}
                disabled={loading}
                className="inline-flex h-11 w-11 items-center justify-center rounded-lg border-2 border-slate-200 bg-white text-slate-700 shadow-sm transition hover:border-blue-500 hover:bg-blue-50 hover:text-blue-700 hover:shadow-md active:scale-[0.97] disabled:opacity-60"
                title="Làm mới"
              >
                <span className="material-symbols-outlined text-[20px]">{loading ? 'hourglass_top' : 'refresh'}</span>
              </button>
            </div>
          </div>
        </header>

        <section className="space-y-6 p-6 lg:p-8">
          {/* Error banner */}
          {error && (
            <div className="flex items-start gap-3 rounded-xl border-2 border-rose-300 bg-gradient-to-r from-rose-50 to-rose-100/60 px-5 py-4 text-sm font-bold text-rose-900 shadow-sm">
              <span className="material-symbols-outlined text-[22px] text-rose-700">error</span>
              <span>{error}</span>
            </div>
          )}

          {/* Summary cards */}
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-4">
            {metricCards.map(card => (
              <div
                key={card.label}
                className={`group relative overflow-hidden rounded-xl border-2 ${card.border} bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-xl`}
              >
                {/* Top accent bar */}
                <div className={`absolute inset-x-0 top-0 h-1.5 bg-gradient-to-r ${card.accent}`} aria-hidden="true" />
                <div className="flex items-start justify-between gap-3">
                  <div className={`flex h-14 w-14 items-center justify-center rounded-xl ${card.bg} ${card.text} border ${card.border}`}>
                    <span className="material-symbols-outlined text-[28px]">{card.icon}</span>
                  </div>
                  <span className={`rounded-md ${card.badgeBg} ${card.text} px-2.5 py-1 text-[11px] font-black uppercase tracking-wider`}>
                    {card.badge}
                  </span>
                </div>
                <div className="mt-5">
                  <p className="text-sm font-bold text-slate-600">{card.label}</p>
                  <p className={`mt-1.5 text-5xl font-black leading-none tracking-tight ${card.text}`}>
                    {loading ? '—' : card.value}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Filters */}
          <div className="overflow-hidden rounded-xl border-2 border-slate-200 bg-white shadow-sm">
            <div className="flex items-center gap-3 border-b-2 border-slate-200 bg-gradient-to-r from-slate-50 to-blue-50/40 px-6 py-4">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-600 text-white shadow-sm">
                <span className="material-symbols-outlined text-[20px]">filter_list</span>
              </div>
              <h2 className="text-base font-black text-slate-900">Bộ lọc</h2>
              <span className="ml-auto text-xs font-bold text-slate-500">{items.length} kết quả</span>
            </div>
            <div className="grid grid-cols-1 gap-3 p-5 sm:grid-cols-2 lg:grid-cols-4">
              {/* Text search */}
              <label className="relative block lg:col-span-1">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[18px] text-slate-400">
                  search
                </span>
                <input
                  id="filter-sku"
                  value={skuFilter}
                  onChange={e => setSkuFilter(e.target.value)}
                  placeholder="Tìm SKU / sản phẩm / khách hàng..."
                  className="h-10 w-full rounded-lg border-2 border-slate-200 bg-white pl-10 pr-3 text-sm font-semibold text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-600 focus:ring-4 focus:ring-blue-100"
                />
              </label>

              {/* Alert type */}
              <select
                id="filter-alert-type"
                value={alertType}
                onChange={e => setAlertType(e.target.value as AlertType)}
                className="h-10 rounded-lg border-2 border-slate-200 bg-white px-3 text-sm font-bold text-slate-900 outline-none transition focus:border-blue-600 focus:ring-4 focus:ring-blue-100"
              >
                <option value="ALL">Tất cả loại</option>
                <option value="DEAD_STOCK">Tồn lâu (&gt;90 ngày)</option>
                <option value="EXPIRY_SOON">Sắp hết hạn (8–30 ngày)</option>
                <option value="CRITICAL_EXPIRY">Khẩn cấp (≤7 ngày)</option>
              </select>

              {/* Zone */}
              <select
                id="filter-zone"
                value={zone}
                onChange={e => setZone(e.target.value)}
                className="h-10 rounded-lg border-2 border-slate-200 bg-white px-3 text-sm font-bold text-slate-900 outline-none transition focus:border-blue-600 focus:ring-4 focus:ring-blue-100"
              >
                <option value="ALL">Tất cả khu vực</option>
                {zones.map(z => (
                  <option key={z} value={z}>{z}</option>
                ))}
              </select>

              {/* Reset button */}
              <button
                id="btn-reset-filters"
                onClick={handleReset}
                className="inline-flex h-10 items-center justify-center gap-1.5 rounded-lg border-2 border-slate-300 bg-white px-4 text-sm font-black text-slate-700 transition hover:border-slate-400 hover:bg-slate-50 hover:text-slate-900"
              >
                <span className="material-symbols-outlined text-[18px]">restart_alt</span>
                Đặt lại bộ lọc
              </button>

              {/* Inbound date range */}
              <div className="flex items-center gap-2 sm:col-span-2">
                <span className="flex shrink-0 items-center gap-1 text-xs font-black text-slate-700">
                  <span className="material-symbols-outlined text-[16px] text-emerald-600">login</span>
                  Ngày nhập:
                </span>
                <input
                  id="filter-inbound-from"
                  type="date"
                  value={inboundFrom}
                  onChange={e => setInboundFrom(e.target.value)}
                  className="h-10 flex-1 rounded-lg border-2 border-slate-200 bg-white px-3 text-sm font-semibold text-slate-900 outline-none transition focus:border-blue-600 focus:ring-4 focus:ring-blue-100"
                />
                <span className="text-xs font-black text-slate-400">→</span>
                <input
                  id="filter-inbound-to"
                  type="date"
                  value={inboundTo}
                  onChange={e => setInboundTo(e.target.value)}
                  className="h-10 flex-1 rounded-lg border-2 border-slate-200 bg-white px-3 text-sm font-semibold text-slate-900 outline-none transition focus:border-blue-600 focus:ring-4 focus:ring-blue-100"
                />
              </div>

              {/* Expiry date range */}
              <div className="flex items-center gap-2 sm:col-span-2">
                <span className="flex shrink-0 items-center gap-1 text-xs font-black text-slate-700">
                  <span className="material-symbols-outlined text-[16px] text-rose-600">event_busy</span>
                  Hạn SD:
                </span>
                <input
                  id="filter-expiry-from"
                  type="date"
                  value={expiryFrom}
                  onChange={e => setExpiryFrom(e.target.value)}
                  className="h-10 flex-1 rounded-lg border-2 border-slate-200 bg-white px-3 text-sm font-semibold text-slate-900 outline-none transition focus:border-blue-600 focus:ring-4 focus:ring-blue-100"
                />
                <span className="text-xs font-black text-slate-400">→</span>
                <input
                  id="filter-expiry-to"
                  type="date"
                  value={expiryTo}
                  onChange={e => setExpiryTo(e.target.value)}
                  className="h-10 flex-1 rounded-lg border-2 border-slate-200 bg-white px-3 text-sm font-semibold text-slate-900 outline-none transition focus:border-blue-600 focus:ring-4 focus:ring-blue-100"
                />
              </div>
            </div>
          </div>

          {/* Main content grid */}
          <div className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1fr)_320px]">
            {/* Data table */}
            <div className="overflow-hidden rounded-xl border-2 border-slate-200 bg-white shadow-sm">
              <div className="flex items-center justify-between border-b-2 border-slate-200 bg-gradient-to-r from-slate-50 to-blue-50/40 px-6 py-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-600 text-white shadow-sm">
                    <span className="material-symbols-outlined text-[20px]">list_alt</span>
                  </div>
                  <div>
                    <h2 className="text-base font-black text-slate-900">Danh sách hàng cần xử lý</h2>
                    <p className="text-xs font-bold text-slate-600">
                      {loading ? 'Đang tải...' : `${items.length} mục`}
                    </p>
                  </div>
                </div>
              </div>

              {/* Desktop table */}
              <div className="hidden overflow-x-auto lg:block">
                <table className="w-full min-w-[960px] border-collapse text-left">
                  <thead>
                    <tr className="bg-gradient-to-r from-slate-100 to-slate-50 text-xs font-black uppercase tracking-wider text-slate-700">
                      <th className="border-b-2 border-slate-300 px-5 py-3">Mã SKU</th>
                      <th className="border-b-2 border-slate-300 px-5 py-3">Sản phẩm</th>
                      <th className="border-b-2 border-slate-300 px-5 py-3">Vị trí</th>
                      <th className="border-b-2 border-slate-300 px-5 py-3">Zone</th>
                      <th className="border-b-2 border-slate-300 px-5 py-3 text-right">SL</th>
                      <th className="border-b-2 border-slate-300 px-5 py-3">Ngày nhập</th>
                      <th className="border-b-2 border-slate-300 px-5 py-3">Hạn SD</th>
                      <th className="border-b-2 border-slate-300 px-5 py-3 text-right">Tồn (ngày)</th>
                      <th className="border-b-2 border-slate-300 px-5 py-3 text-right">Còn lại</th>
                      <th className="border-b-2 border-slate-300 px-5 py-3">Loại / Mức độ</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {loading && (
                      <tr>
                        <td colSpan={10} className="px-6 py-12 text-center text-sm font-bold text-slate-600">
                          <span className="material-symbols-outlined animate-spin text-[40px] text-blue-600">autorenew</span>
                          <p className="mt-2">Đang tải dữ liệu...</p>
                        </td>
                      </tr>
                    )}
                    {!loading && items.length === 0 && (
                      <tr>
                        <td colSpan={10} className="px-6 py-12 text-center text-sm font-bold text-slate-500">
                          <span className="material-symbols-outlined text-[48px] text-slate-300">inventory_2</span>
                          <p className="mt-2">Không có hàng phù hợp với bộ lọc.</p>
                        </td>
                      </tr>
                    )}
                    {!loading && items.map((item, idx) => {
                      const isCritical = item.severity === 'HIGH'
                      const isMedium = item.severity === 'MEDIUM'
                      const rowBg = isCritical
                        ? 'bg-rose-50/70 border-l-4 border-l-rose-500'
                        : isMedium
                          ? 'bg-amber-50/60 border-l-4 border-l-amber-500'
                          : 'border-l-4 border-l-transparent'

                      return (
                        <tr key={`${item.skucode}-${item.binCode}-${idx}`} className={`transition hover:bg-blue-50/60 hover:shadow-sm ${rowBg}`}>
                          <td className="px-5 py-3 font-mono text-sm font-black text-blue-700">{item.skucode}</td>
                          <td className="px-5 py-3">
                            <p className="max-w-[200px] truncate text-sm font-black text-slate-900">{item.productName}</p>
                            <p className="max-w-[200px] truncate text-xs font-semibold text-slate-600">{item.customerName}</p>
                          </td>
                          <td className="px-5 py-3 font-mono text-xs font-bold text-slate-800">{item.binCode}</td>
                          <td className="px-5 py-3">
                            <span className="rounded-md border border-slate-300 bg-slate-100 px-2 py-0.5 text-xs font-black text-slate-800">
                              {item.zoneCode || '—'}
                            </span>
                          </td>
                          <td className="px-5 py-3 text-right text-sm font-black text-slate-900">{item.quantity}</td>
                          <td className="px-5 py-3 text-xs font-semibold text-slate-700">{fmt(item.inboundDate)}</td>
                          <td className="px-5 py-3 text-xs font-semibold text-slate-700">
                            {item.expiryDate ? fmt(item.expiryDate) : <span className="text-slate-400">N/A</span>}
                          </td>
                          <td className="px-5 py-3 text-right text-sm font-black text-slate-900">
                            {item.daysStored ?? '—'}
                          </td>
                          <td className="px-5 py-3 text-right text-sm font-black">
                            {item.daysToExpiry != null ? (
                              <span className={item.daysToExpiry <= 7 ? 'text-rose-700' : item.daysToExpiry <= 30 ? 'text-amber-700' : 'text-slate-700'}>
                                {item.daysToExpiry}
                              </span>
                            ) : <span className="text-slate-400">N/A</span>}
                          </td>
                          <td className="px-5 py-3">
                            <span
                              className={`inline-flex items-center gap-1 rounded-md px-2.5 py-1 text-xs font-black shadow-sm ${
                                item.severity === 'HIGH'
                                  ? 'bg-rose-100 text-rose-900 ring-1 ring-rose-300'
                                  : item.severity === 'MEDIUM'
                                    ? 'bg-amber-100 text-amber-900 ring-1 ring-amber-300'
                                    : 'bg-slate-100 text-slate-700 ring-1 ring-slate-300'
                              }`}
                            >
                              {item.severity === 'HIGH' && <span className="material-symbols-outlined text-[14px]">priority_high</span>}
                              {ALERT_LABELS[item.alertType] ?? item.alertType}
                            </span>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>

              {/* Mobile card view */}
              <div className="divide-y divide-slate-200 lg:hidden">
                {loading && <p className="p-5 text-center text-sm font-bold text-slate-600">Đang tải...</p>}
                {!loading && items.length === 0 && (
                  <p className="p-5 text-center text-sm font-bold text-slate-500">Không có hàng phù hợp.</p>
                )}
                {!loading && items.map((item, idx) => (
                  <article key={`m-${item.skucode}-${idx}`} className={`p-4 ${item.severity === 'HIGH' ? 'bg-rose-50/70 border-l-4 border-l-rose-500' : item.severity === 'MEDIUM' ? 'bg-amber-50/60 border-l-4 border-l-amber-500' : 'border-l-4 border-l-transparent'}`}>
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="font-mono text-sm font-black text-blue-700">{item.skucode}</p>
                        <p className="mt-1 text-base font-black text-slate-900">{item.productName}</p>
                        <p className="text-xs font-semibold text-slate-600">{item.customerName}</p>
                      </div>
                      <span className={`shrink-0 rounded-md px-2.5 py-1 text-xs font-black shadow-sm ${
                        item.severity === 'HIGH' ? 'bg-rose-100 text-rose-900 ring-1 ring-rose-300' : item.severity === 'MEDIUM' ? 'bg-amber-100 text-amber-900 ring-1 ring-amber-300' : 'bg-slate-100 text-slate-700 ring-1 ring-slate-300'
                      }`}>
                        {ALERT_LABELS[item.alertType] ?? item.alertType}
                      </span>
                    </div>
                    <div className="mt-3 grid grid-cols-3 gap-2 text-xs">
                      <div className="rounded-lg border border-slate-200 bg-slate-50 p-2">
                        <p className="font-black text-slate-600">Bin / Zone</p>
                        <p className="font-black text-slate-900">{item.binCode} / {item.zoneCode || '—'}</p>
                      </div>
                      <div className="rounded-lg border border-slate-200 bg-slate-50 p-2">
                        <p className="font-black text-slate-600">Tồn (ngày)</p>
                        <p className="font-black text-slate-900">{item.daysStored ?? '—'}</p>
                      </div>
                      <div className="rounded-lg border border-slate-200 bg-slate-50 p-2">
                        <p className="font-black text-slate-600">Còn lại</p>
                        <p className={`font-black ${item.daysToExpiry != null && item.daysToExpiry <= 7 ? 'text-rose-700' : 'text-slate-900'}`}>
                          {item.daysToExpiry ?? 'N/A'}
                        </p>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            </div>

            {/* Right sidebar panel */}
            <aside className="space-y-5">
              {/* Donut chart */}
              <section className="overflow-hidden rounded-xl border-2 border-slate-200 bg-white shadow-sm">
                <div className="flex items-center gap-3 border-b-2 border-slate-200 bg-gradient-to-r from-slate-50 to-blue-50/40 px-5 py-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600 text-white shadow-sm">
                    <span className="material-symbols-outlined text-[18px]">donut_large</span>
                  </div>
                  <h2 className="text-sm font-black text-slate-900">Phân bổ cảnh báo</h2>
                </div>
                <div className="p-4">
                  {donutData.length > 0 ? (
                    <ResponsiveContainer width="100%" height={200}>
                      <PieChart>
                        <Pie
                          data={donutData}
                          cx="50%"
                          cy="50%"
                          innerRadius={50}
                          outerRadius={80}
                          paddingAngle={3}
                          dataKey="value"
                          strokeWidth={2}
                          stroke="#fff"
                        >
                          {donutData.map((_, i) => (
                            <Cell key={i} fill={DONUT_COLORS[i % DONUT_COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip
                          formatter={(v: number) => [`${v} mục`, '']}
                          contentStyle={{ borderRadius: 8, border: '2px solid #e2e8f0', fontWeight: 700 }}
                        />
                        <Legend iconType="circle" iconSize={10} wrapperStyle={{ fontWeight: 700, fontSize: 12 }} />
                      </PieChart>
                    </ResponsiveContainer>
                  ) : (
                    <p className="py-6 text-center text-sm font-bold text-slate-400">Không có dữ liệu</p>
                  )}
                </div>
              </section>

              {/* Top 5 critical */}
              <section className="overflow-hidden rounded-xl border-2 border-rose-300 bg-gradient-to-br from-rose-50 to-rose-100/60 shadow-sm">
                <div className="flex items-center gap-3 border-b-2 border-rose-300 bg-gradient-to-r from-rose-100 to-rose-50 px-5 py-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-rose-600 text-white shadow-sm">
                    <span className="material-symbols-outlined text-[18px]">alarm</span>
                  </div>
                  <h2 className="text-sm font-black text-rose-900">Top hàng khẩn cấp</h2>
                </div>
                <div className="p-4">
                  {topCritical.length === 0 ? (
                    <p className="text-sm font-bold text-rose-800">Không có hàng khẩn cấp 🎉</p>
                  ) : (
                    <ul className="space-y-2">
                      {topCritical.map((item, i) => (
                        <li key={i} className="flex items-center justify-between rounded-lg border border-rose-200 bg-white/80 px-3 py-2 shadow-sm">
                          <div className="min-w-0">
                            <p className="font-mono text-xs font-black text-rose-800">{item.skucode}</p>
                            <p className="max-w-[140px] truncate text-xs font-bold text-slate-800">{item.productName}</p>
                          </div>
                          <div className="shrink-0 text-right">
                            <p className="text-[10px] font-black uppercase tracking-wider text-slate-500">Còn lại</p>
                            <p className="text-base font-black text-rose-700">{item.daysToExpiry ?? '—'} ngày</p>
                          </div>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </section>

              {/* Legend */}
              <section className="overflow-hidden rounded-xl border-2 border-slate-200 bg-white shadow-sm">
                <div className="flex items-center gap-3 border-b-2 border-slate-200 bg-gradient-to-r from-slate-50 to-blue-50/40 px-5 py-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600 text-white shadow-sm">
                    <span className="material-symbols-outlined text-[18px]">info</span>
                  </div>
                  <h2 className="text-sm font-black text-slate-900">Phân loại màu sắc</h2>
                </div>
                <div className="p-4">
                  <ul className="space-y-2.5 text-sm">
                    {[
                      { color: 'bg-rose-200', border: 'border-rose-500', label: 'Khẩn cấp — ≤ 7 ngày còn lại hoặc đã hết hạn' },
                      { color: 'bg-amber-200', border: 'border-amber-500', label: 'Theo dõi — 8–30 ngày hoặc tồn > 90 ngày' },
                      { color: 'bg-slate-100', border: 'border-slate-300', label: 'Bình thường' },
                    ].map(item => (
                      <li key={item.label} className="flex items-start gap-2.5">
                        <span className={`mt-0.5 h-4 w-4 shrink-0 rounded border-2 ${item.color} ${item.border}`} />
                        <span className="font-bold text-slate-700">{item.label}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </section>
            </aside>
          </div>
        </section>
      </main>
    </div>
  )
}

// Silence unused import warning
void SEVERITY_COLORS

export default DeadExpiryDashboard