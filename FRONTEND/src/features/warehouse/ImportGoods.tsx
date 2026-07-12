import { useEffect, useMemo, useRef, useState } from 'react'
import { useReactToPrint } from 'react-to-print'
import Sidebar from '../../components/Sidebar'
import api from '../../lib/api'
import FindInboundModal from './FindInboundModal'
import { LabelPrintTemplate } from '../../components/LabelPrintTemplate'
import WarehouseHeader from '../../components/WarehouseHeader'
type CargoPhoto = {
  photoId: number
  photoUrl: string
  photoAngle: string | null
  isDamaged: boolean
  takenAt: string | null
}

type InboundLine = {
  lineId: number
  skucode: string | null
  productName: string | null
  expectedQty: number
  receivedQty: number | null
  conditionStatus: string | null
  binCode: string | null
  aiSlottedBinCode: string | null
  photoCount: number
  requiresMinPhotos: boolean
  minPhotos: number
  photos: CargoPhoto[]
}

type SlottingSuggestion = {
  rank: number
  binId: number
  binCode: string
  binType: string | null
  shelfCode: string | null
  floorLevel: number | null
  zoneCode: string | null
  zoneName: string | null
  zoneType: string | null
  capacityCbm: number
  maxWeightKg: number
  currentVolumeCbm: number
  currentWeightKg: number
  requiredVolumeCbm: number
  requiredWeightKg: number
  remainingVolumeCbm: number
  remainingWeightKg: number
  score: number
  movementClass: string
  reasons: string[]
}

type SlottingResponse = {
  lineId: number
  inboundId: number
  warehouseId: number
  skuCode: string | null
  productName: string | null
  quantityToSlot: number
  statusCode: string
  message: string
  suggestions: SlottingSuggestion[]
}

type InboundOrder = {
  inboundId: number
  inboundCode: string
  customerName: string | null
  warehouseName: string | null
  status: string | null
  actualDate: string | null
  lines: InboundLine[]
}

const PHOTO_ANGLES = [
  { value: 'FRONT', label: 'Mặt trước' },
  { value: 'SIDE', label: 'Mặt bên' },
  { value: 'TOP', label: 'Mặt trên' },
  { value: 'DETAIL', label: 'Chi tiết' },
]

const ANGLE_LABELS: Record<string, string> = {
  FRONT: 'Mặt trước',
  SIDE: 'Mặt bên',
  TOP: 'Mặt trên',
  DETAIL: 'Chi tiết',
}

const CONDITION_LABELS: Record<string, string> = {
  GOOD: 'Nguyên vẹn',
  DAMAGED: 'Hư hỏng',
  PARTIAL: 'Thiếu một phần',
}

const STATUS_LABELS: Record<string, string> = {
  PENDING: 'Đang chờ',
  IN_PROGRESS: 'Đang xử lý',
  COMPLETED: 'Hoàn tất',
  CANCELLED: 'Đã hủy',
}

const getStoredUserId = (): number | null => {
  try {
    const raw = localStorage.getItem('user')
    if (!raw) return null
    const parsed = JSON.parse(raw)
    return typeof parsed.userId === 'number' ? parsed.userId : null
  } catch {
    return null
  }
}

const ImportGoods = () => {
  const [orders, setOrders] = useState<InboundOrder[]>([])
  const [selectedOrderId, setSelectedOrderId] = useState<number | null>(null)
  const [lines, setLines] = useState<InboundLine[]>([])
  const [selectedLineId, setSelectedLineId] = useState<number | null>(null)

  const [loadingOrders, setLoadingOrders] = useState(false)
  const [loadingLines, setLoadingLines] = useState(false)
  const [loadingSlotting, setLoadingSlotting] = useState(false)
  const [confirmingSlot, setConfirmingSlot] = useState<number | null>(null)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [slottingResult, setSlottingResult] = useState<SlottingResponse | null>(null)
  
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')

  const [photoAngle, setPhotoAngle] = useState<string>('FRONT')
  const [markDamaged, setMarkDamaged] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const printRef = useRef<HTMLDivElement>(null)

  const selectedOrder = useMemo(
    () => orders.find((o) => o.inboundId === selectedOrderId) ?? null,
    [orders, selectedOrderId],
  )
  const selectedLine = useMemo(
    () => lines.find((l) => l.lineId === selectedLineId) ?? null,
    [lines, selectedLineId],
  )

  const handlePrint = useReactToPrint({
    contentRef: printRef,
    documentTitle: `LPN-${selectedOrder?.inboundCode}-${selectedLine?.skucode}`
  })

  const loadOrders = () => {
    setLoadingOrders(true)
    api
      .get<InboundOrder[]>('/inbound?statuses=PENDING&statuses=IN_PROGRESS')
      .then((res) => {
        setOrders(res.data)
        if (res.data.length > 0 && !selectedOrderId) setSelectedOrderId(res.data[0].inboundId)
      })
      .catch(() => setError('Không tải được danh sách đơn nhập kho.'))
      .finally(() => setLoadingOrders(false))
  }

  useEffect(() => {
    loadOrders()
  }, [])

  useEffect(() => {
    if (selectedOrderId == null) {
      setLines([])
      setSelectedLineId(null)
      return
    }
    let active = true
    setLoadingLines(true)
    setError(null)
    api
      .get<InboundLine[]>(`/inbound/${selectedOrderId}/lines`)
      .then((res) => {
        if (!active) return
        setLines(res.data)
        setSelectedLineId(res.data.length > 0 ? res.data[0].lineId : null)
      })
      .catch(() => active && setError('Không tải được chi tiết dòng hàng.'))
      .finally(() => active && setLoadingLines(false))
    return () => {
      active = false
    }
  }, [selectedOrderId])

  useEffect(() => {
    setMarkDamaged(Boolean(selectedLine?.requiresMinPhotos))
    setSlottingResult(null)
  }, [selectedLine?.lineId, selectedLine?.requiresMinPhotos])

  const loadSlottingSuggestions = async (lineId = selectedLineId) => {
    if (lineId == null) return
    setLoadingSlotting(true)
    setError(null)
    try {
      const res = await api.get<SlottingResponse>(`/inbound/lines/${lineId}/slotting-suggestions`)
      setSlottingResult(res.data)
    } catch {
      setError('Không tải được gợi ý vị trí lưu kho từ AI.')
    } finally {
      setLoadingSlotting(false)
    }
  }

  const refreshSelectedLinePhotos = async (lineId: number) => {
    const res = await api.get<CargoPhoto[]>(`/inbound/lines/${lineId}/photos`)
    setLines((prev) =>
      prev.map((l) =>
        l.lineId === lineId
          ? { ...l, photos: res.data, photoCount: res.data.length }
          : l,
      ),
    )
  }

  const handleUpload = async (file: File) => {
    if (!selectedLine) return
    setUploading(true)
    setError(null)
    try {
      const form = new FormData()
      form.append('file', file)
      form.append('photoAngle', photoAngle)
      form.append('isDamaged', String(markDamaged))
      const userId = getStoredUserId()
      if (userId != null) form.append('takenBy', String(userId))

      await api.post(`/inbound/lines/${selectedLine.lineId}/photos`, form, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      await refreshSelectedLinePhotos(selectedLine.lineId)
    } catch {
      setError('Tải ảnh lên thất bại. Vui lòng thử lại.')
    } finally {
      setUploading(false)
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  const handleConfirmSlot = async (suggestion: SlottingSuggestion) => {
    if (!selectedLine) return
    setConfirmingSlot(suggestion.binId)
    setError(null)
    try {
      await api.post(`/inbound/lines/${selectedLine.lineId}/confirm-slot`, {
        binId: suggestion.binId,
        isAiSuggestion: true,
      })
      setLines((prev) =>
        prev.map((l) =>
          l.lineId === selectedLine.lineId
            ? { ...l, binCode: suggestion.binCode, aiSlottedBinCode: suggestion.binCode }
            : l,
        ),
      )
      await loadSlottingSuggestions(selectedLine.lineId)
    } catch {
      setError('Vị trí được chọn không còn phù hợp hoặc không đủ sức chứa.')
    } finally {
      setConfirmingSlot(null)
    }
  }

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) handleUpload(file)
  }

  const submitReceiving = async () => {
    if (!selectedOrderId) return
    setError(null)
    try {
      const payload = {
        lines: lines.map((l) => ({
          lineId: l.lineId,
          receivedQty: l.receivedQty ?? l.expectedQty,
          binId: 0, // Backend will handle it using the DB binId
          conditionStatus: l.conditionStatus || 'GOOD',
        })),
      }
      const res = await api.post(`/inbound/${selectedOrderId}/confirm-receiving`, payload)
      if (res.data?.success) {
        alert('Đã xác nhận nhập kho thành công!')
        loadOrders()
        setLines([])
        setSelectedOrderId(null)
      } else {
        setError(res.data?.message || 'Có lỗi xảy ra khi xác nhận.')
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Không thể xác nhận nhập kho. Vui lòng thử lại.')
    }
  }

  const currentPhotos = selectedLine?.photos?.length ?? 0
  const photosNeeded = selectedLine?.requiresMinPhotos
    ? Math.max(0, selectedLine.minPhotos - currentPhotos)
    : 0
  const blockConfirm = lines.some(
    (l) => l.requiresMinPhotos && (l.photos?.length ?? 0) < l.minPhotos,
  )

  const conditionBadge = (status: string | null) => {
    const s = (status ?? 'GOOD').toUpperCase()
    if (s === 'DAMAGED') return 'bg-red-100 text-red-700 ring-red-200'
    if (s === 'PARTIAL') return 'bg-amber-100 text-amber-700 ring-amber-200'
    return 'bg-emerald-100 text-emerald-700 ring-emerald-200'
  }
  const conditionText = (status: string | null) =>
    CONDITION_LABELS[(status ?? 'GOOD').toUpperCase()] ?? status ?? 'Nguyên vẹn'
  const statusText = (status: string | null) => STATUS_LABELS[(status ?? '').toUpperCase()] ?? status ?? 'Chưa có'
  const formatNumber = (value: number) =>
    new Intl.NumberFormat('vi-VN', { maximumFractionDigits: 2 }).format(value)

  return (
    <div className="min-h-screen bg-[#f7f9fb] text-[#191c1e] antialiased overflow-hidden">
      <Sidebar />

      <WarehouseHeader 
        title="Nhập kho hàng hóa" 
        subtitle="Chụp ảnh tình trạng hàng khi nhập"
      />

      <main className="ml-[280px] mt-20 p-8 pb-10 animate-fade-in-up">
        {/* Header */}
        <div className="mb-8 rounded-[32px] bg-gradient-to-r from-blue-600 to-indigo-700 p-8 text-white shadow-2xl shadow-blue-900/20">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <h1 className="text-3xl font-bold tracking-tight mb-2">Nhập Hàng (Inbound)</h1>
              <p className="text-blue-100 text-lg max-w-2xl">
                Quản lý quy trình nhận hàng, kiểm tra chất lượng và sắp xếp vị trí lưu kho.
              </p>
            </div>
            <div className="flex items-center gap-4">
              <button 
                onClick={() => setIsCreateModalOpen(true)}
                className="flex items-center gap-2 bg-white/20 hover:bg-white/30 transition-colors px-6 py-3 rounded-2xl font-semibold backdrop-blur-md border border-white/20"
              >
                <span className="material-symbols-outlined">qr_code_scanner</span>
                Tìm Đơn (QR/Barcode)
              </button>
            </div>
          </div>
        </div>

        {error && (
          <div className="mb-6 flex items-center gap-2 rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm font-medium text-red-700">
            <span className="material-symbols-outlined text-base">error</span>
            {error}
          </div>
        )}

        {/* Modal Find */}
        <FindInboundModal 
          isOpen={isCreateModalOpen}
          onClose={() => setIsCreateModalOpen(false)}
          orders={orders.map(o => ({ inboundId: o.inboundId, inboundCode: o.inboundCode }))}
          onOrderFound={(id) => setSelectedOrderId(id)}
        />

        <div className="grid gap-6 lg:grid-cols-[1.75fr_1fr]">
          <div className="space-y-6">
            <section className="glass-card rounded-[28px] border border-white/80 p-6 shadow-xl shadow-slate-900/5">
              <div className="flex items-center gap-3 mb-6">
                <span className="material-symbols-outlined text-primary">local_shipping</span>
                <h2 className="text-xl font-semibold">Thông tin đơn nhập</h2>
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2 md:col-span-2">
                  <label className="block text-sm font-semibold text-slate-500">Chọn đơn nhập kho</label>
                  <select
                    className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                    value={selectedOrderId ?? ''}
                    onChange={(e) => setSelectedOrderId(Number(e.target.value))}
                    disabled={loadingOrders || orders.length === 0}
                  >
                    {orders.length === 0 && (
                      <option value="">{loadingOrders ? 'Đang tải...' : 'Không có đơn nhập'}</option>
                    )}
                    {orders.map((o) => (
                      <option key={o.inboundId} value={o.inboundId}>
                        {o.inboundCode} - {o.customerName ?? 'Không rõ'}
                      </option>
                    ))}
                  </select>
                </div>
                <InfoBox label="Khách hàng" value={selectedOrder?.customerName ?? '-'} />
                <InfoBox label="Kho" value={selectedOrder?.warehouseName ?? '-'} />
                <InfoBox label="Mã đơn" value={selectedOrder?.inboundCode ?? '-'} />
                <InfoBox label="Trạng thái" value={statusText(selectedOrder?.status ?? null)} />
              </div>
            </section>

            <section className="glass-card rounded-[28px] border border-white/80 p-6 shadow-xl shadow-slate-900/5">
              <div className="flex items-center justify-between gap-3 mb-5">
                <div className="flex items-center gap-3">
                  <span className="material-symbols-outlined text-primary">inventory</span>
                  <h2 className="text-xl font-semibold">Chi tiết hàng hóa</h2>
                </div>
                <span className="text-xs font-medium text-slate-400">Chọn một dòng để chụp ảnh tình trạng</span>
              </div>
              <div className="overflow-x-auto rounded-3xl border border-slate-200 bg-white">
                <table className="min-w-full text-left text-sm text-slate-700">
                  <thead className="border-b border-slate-200 bg-slate-50 text-slate-500">
                    <tr>
                      <th className="px-4 py-4 font-medium">Mã SKU</th>
                      <th className="px-4 py-4 font-medium">Tên sản phẩm</th>
                      <th className="px-4 py-4 font-medium">Số lượng</th>
                      <th className="px-4 py-4 font-medium">Vị trí (Bin)</th>
                      <th className="px-4 py-4 font-medium">Tình trạng</th>
                      <th className="px-4 py-4 font-medium">Ảnh</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {loadingLines && (
                      <tr>
                        <td colSpan={6} className="px-4 py-6 text-center text-slate-400">
                          Đang tải dòng hàng...
                        </td>
                      </tr>
                    )}
                    {!loadingLines && lines.length === 0 && (
                      <tr>
                        <td colSpan={6} className="px-4 py-6 text-center text-slate-400">
                          Không có dòng hàng.
                        </td>
                      </tr>
                    )}
                    {!loadingLines &&
                      lines.map((row) => {
                        const isSelected = row.lineId === selectedLineId
                        const photoNum = row.photos?.length ?? row.photoCount
                        const needsMore = row.requiresMinPhotos && photoNum < row.minPhotos
                        return (
                          <tr
                            key={row.lineId}
                            onClick={() => setSelectedLineId(row.lineId)}
                            className={`cursor-pointer transition-colors duration-200 ${
                              isSelected
                                ? 'bg-blue-50/80 ring-1 ring-inset ring-blue-200'
                                : 'hover:bg-slate-50'
                            }`}
                          >
                            <td className="px-4 py-4 font-semibold text-slate-900">{row.skucode ?? '-'}</td>
                            <td className="px-4 py-4">{row.productName ?? '-'}</td>
                            <td className="px-4 py-4">{row.receivedQty ?? row.expectedQty}</td>
                            <td className="px-4 py-4 text-slate-500">{row.binCode ?? '-'}</td>
                            <td className="px-4 py-4">
                              <span
                                className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ring-1 ${conditionBadge(
                                  row.conditionStatus,
                                )}`}
                              >
                                {conditionText(row.conditionStatus)}
                              </span>
                            </td>
                            <td className="px-4 py-4">
                              <span
                                className={`inline-flex items-center gap-1 text-xs font-semibold ${
                                  needsMore ? 'text-red-600' : 'text-slate-600'
                                }`}
                              >
                                <span className="material-symbols-outlined text-base">photo_camera</span>
                                {photoNum}
                                {row.requiresMinPhotos && `/${row.minPhotos}`}
                              </span>
                            </td>
                          </tr>
                        )
                      })}
                  </tbody>
                </table>
              </div>
            </section>

            <section className="glass-card rounded-[28px] border border-white/80 p-6 shadow-xl shadow-slate-900/5">
              <div className="mb-5 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-3">
                  <span className="material-symbols-outlined text-primary">warehouse</span>
                  <div>
                    <h2 className="text-xl font-semibold">AI gợi ý vị trí lưu kho</h2>
                    <p className="text-xs font-medium text-slate-500">
                      Lọc đúng kho, điều kiện bảo quản, tải trọng và dung tích trước khi chấm điểm.
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => loadSlottingSuggestions()}
                  disabled={!selectedLine || loadingSlotting}
                  className="inline-flex min-w-[168px] items-center justify-center gap-2 rounded-full border border-blue-700 px-5 py-3 text-sm font-bold text-white shadow-lg shadow-blue-700/20 transition hover:brightness-95 disabled:cursor-not-allowed disabled:opacity-50"
                  style={{ backgroundColor: '#0050C8', color: '#ffffff' }}
                  type="button"
                >
                  <span className="material-symbols-outlined text-base">auto_awesome</span>
                  {loadingSlotting ? 'Đang phân tích...' : 'Gợi ý vị trí'}
                </button>
              </div>

              {!selectedLine && (
                <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-4 py-8 text-center text-sm text-slate-500">
                  Chọn một dòng hàng để AI phân tích vị trí lưu kho phù hợp.
                </div>
              )}

              {selectedLine && (
                <div className="space-y-4">
                  <div className="grid gap-3 md:grid-cols-3">
                    <InfoBox label="SKU đang chọn" value={selectedLine.skucode ?? '-'} />
                    <InfoBox label="Số lượng slot" value={String(slottingResult?.quantityToSlot ?? selectedLine.receivedQty ?? selectedLine.expectedQty)} />
                    <InfoBox label="Vị trí đã chốt" value={selectedLine.binCode ?? selectedLine.aiSlottedBinCode ?? '-'} />
                  </div>

                  {slottingResult && (
                    <div className="rounded-2xl border border-cyan-200 bg-cyan-50 px-4 py-3 text-sm font-semibold text-cyan-800">
                      {slottingResult.message}
                    </div>
                  )}

                  {!slottingResult && !loadingSlotting && (
                    <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-4 py-8 text-center text-sm text-slate-500">
                      Bấm “Gợi ý vị trí” để xem top 3-5 ô chứa tốt nhất cho dòng hàng này.
                    </div>
                  )}

                  {slottingResult?.suggestions.length === 0 && (
                    <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-4 text-sm font-semibold text-amber-800">
                      Không tìm thấy vị trí phù hợp. Kiểm tra lại zone bảo quản, tải trọng hoặc dung tích bin.
                    </div>
                  )}

                  <div className="grid gap-3">
                    {slottingResult?.suggestions.map((item) => {
                      const selected = selectedLine.binCode === item.binCode
                      return (
                        <div
                          key={item.binId}
                          className={`rounded-3xl border bg-white p-4 transition ${
                            selected ? 'border-emerald-300 ring-4 ring-emerald-100' : 'border-slate-200 hover:border-blue-200'
                          }`}
                        >
                          <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                            <div className="min-w-0">
                              <div className="flex flex-wrap items-center gap-2">
                                <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-slate-900 text-sm font-bold text-white">
                                  {item.rank}
                                </span>
                                <h3 className="text-lg font-bold text-slate-950">{item.binCode}</h3>
                                <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-bold text-blue-700">
                                  {item.score}/100 điểm
                                </span>
                                {selected && (
                                  <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold text-emerald-700">
                                    Đã xác nhận
                                  </span>
                                )}
                              </div>
                              <p className="mt-2 text-sm text-slate-500">
                                {item.zoneName ?? item.zoneCode ?? 'Zone'} • {item.zoneType ?? 'NORMAL'} • Kệ {item.shelfCode ?? '-'} • Tầng {item.floorLevel ?? '-'}
                              </p>
                              <div className="mt-3 flex flex-wrap gap-2">
                                {item.reasons.map((reason) => (
                                  <span key={reason} className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">
                                    {reason}
                                  </span>
                                ))}
                              </div>
                            </div>

                            <button
                              onClick={() => handleConfirmSlot(item)}
                              disabled={confirmingSlot === item.binId || selected}
                              className="inline-flex items-center justify-center gap-2 rounded-full bg-blue-600 px-5 py-3 text-sm font-bold text-white shadow-lg shadow-blue-600/15 transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
                              type="button"
                            >
                              <span className="material-symbols-outlined text-base">check_circle</span>
                              {confirmingSlot === item.binId ? 'Đang lưu...' : selected ? 'Đã lưu' : 'Xác nhận'}
                            </button>
                          </div>

                          <div className="mt-4 grid gap-3 md:grid-cols-4">
                            <Metric label="Cần chứa" value={`${formatNumber(item.requiredVolumeCbm)} CBM`} sub={`${formatNumber(item.requiredWeightKg)} kg`} />
                            <Metric label="Đang dùng" value={`${formatNumber(item.currentVolumeCbm)} CBM`} sub={`${formatNumber(item.currentWeightKg)} kg`} />
                            <Metric label="Còn trống" value={`${formatNumber(item.remainingVolumeCbm)} CBM`} sub={`${formatNumber(item.remainingWeightKg)} kg`} />
                            <Metric label="Tần suất xuất" value={item.movementClass} sub={item.binType ?? 'Bin thường'} />
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}
            </section>
          </div>

          <div className="space-y-6">
            <section className="glass-card rounded-[28px] border border-white/80 p-6 shadow-xl shadow-slate-900/5">
              <div className="flex items-center justify-between gap-3 mb-5">
                <div className="flex items-center gap-3">
                  <span className="material-symbols-outlined text-primary">photo_camera</span>
                  <h2 className="text-xl font-semibold">Ảnh tình trạng hàng</h2>
                </div>
                {selectedLine?.requiresMinPhotos && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-red-100 px-3 py-1 text-xs font-bold text-red-700">
                    <span className="material-symbols-outlined text-sm">priority_high</span>
                    Bắt buộc {selectedLine.minPhotos} ảnh
                  </span>
                )}
              </div>

              {!selectedLine && (
                <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-4 py-8 text-center text-sm text-slate-500">
                  Chọn một dòng hàng ở bảng bên trái để chụp hoặc xem ảnh tình trạng.
                </div>
              )}

              {selectedLine && (
                <div className="space-y-5">
                  <div className="rounded-2xl bg-slate-50 px-4 py-3">
                    <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Đang thao tác</p>
                    <p className="text-sm font-semibold text-slate-900">
                      {selectedLine.skucode} - {selectedLine.productName}
                    </p>
                  </div>

                  {selectedLine.requiresMinPhotos && (
                    <div
                      className={`flex items-start gap-2 rounded-2xl border px-4 py-3 text-sm font-medium ${
                        photosNeeded > 0
                          ? 'border-red-200 bg-red-50 text-red-700'
                          : 'border-emerald-200 bg-emerald-50 text-emerald-700'
                      }`}
                    >
                      <span className="material-symbols-outlined text-base">
                        {photosNeeded > 0 ? 'warning' : 'check_circle'}
                      </span>
                      <span>
                        {photosNeeded > 0
                          ? `Kiện hàng lỗi: bắt buộc tối thiểu ${selectedLine.minPhotos} góc ảnh chi tiết. Còn thiếu ${photosNeeded} ảnh.`
                          : `Đã đủ ${selectedLine.minPhotos} góc ảnh bằng chứng cho kiện hàng lỗi.`}
                      </span>
                    </div>
                  )}

                  <div className="grid gap-3">
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <label className="block text-xs font-semibold text-slate-500">Góc chụp</label>
                        <select
                          className="w-full rounded-2xl border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                          value={photoAngle}
                          onChange={(e) => setPhotoAngle(e.target.value)}
                        >
                          {PHOTO_ANGLES.map((a) => (
                            <option key={a.value} value={a.value}>
                              {a.label}
                            </option>
                          ))}
                        </select>
                      </div>
                      <label className="flex items-end gap-2 pb-2.5 text-sm font-medium text-slate-700">
                        <input
                          type="checkbox"
                          className="h-4 w-4 rounded border-slate-300"
                          checked={markDamaged}
                          onChange={(e) => setMarkDamaged(e.target.checked)}
                        />
                        Đánh dấu hư hỏng
                      </label>
                    </div>

                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={onFileChange}
                    />
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      disabled={uploading}
                      className="inline-flex items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-primary/40 bg-slate-50 px-6 py-5 text-sm font-semibold text-primary transition hover:bg-primary/5 disabled:opacity-60"
                      type="button"
                    >
                      <span className="material-symbols-outlined">add_a_photo</span>
                      {uploading ? 'Đang tải lên...' : 'Chụp / Tải ảnh lên'}
                    </button>
                  </div>

                  <div>
                    <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-slate-400">
                      Ảnh đã lưu ({currentPhotos})
                    </p>
                    <div className="grid grid-cols-2 gap-3">
                      {currentPhotos === 0 && (
                        <p className="col-span-2 rounded-2xl bg-slate-50 px-4 py-6 text-center text-sm text-slate-400">
                          Chưa có ảnh nào cho dòng hàng này.
                        </p>
                      )}
                      {(selectedLine.photos ?? []).map((p) => (
                        <div key={p.photoId} className="group relative overflow-hidden rounded-2xl bg-slate-950 shadow-sm">
                          <img
                            className="h-32 w-full object-cover opacity-90 transition group-hover:scale-105"
                            src={p.photoUrl}
                            alt={p.photoAngle ?? 'ảnh tình trạng'}
                          />
                          <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-slate-950/80 to-transparent p-2">
                            <span className="text-[11px] font-semibold uppercase tracking-wider text-white">
                              {ANGLE_LABELS[p.photoAngle ?? ''] ?? p.photoAngle ?? 'Ảnh'}
                            </span>
                          </div>
                          {p.isDamaged && (
                            <div className="absolute top-2 right-2 rounded-full bg-red-600 px-2 py-0.5 text-[10px] font-bold text-white">
                              Hư hỏng
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </section>

            <section className="glass-card rounded-[28px] border border-primary p-6 shadow-xl shadow-slate-900/5">
              <div className="flex items-center gap-3 mb-5">
                <span className="material-symbols-outlined text-primary">qr_code_2</span>
                <h2 className="text-xl font-semibold">Nhãn theo dõi</h2>
              </div>
              <div className="grid gap-4">
                <div className="flex items-center justify-center rounded-3xl bg-white p-4 shadow-sm">
                  <span className="material-symbols-outlined text-[120px] text-slate-800">qr_code_2</span>
                </div>
                <div className="rounded-3xl bg-white p-5 shadow-sm">
                  <p className="text-xs text-slate-500">Mã nhãn: {selectedOrder?.inboundCode ?? 'IMP-'}</p>
                  <p className="mt-2 text-sm font-semibold text-slate-900">Dòng hàng: {selectedLine?.skucode ?? '-'}</p>
                  <button 
                    onClick={handlePrint}
                    disabled={!selectedLine || !selectedOrder}
                    className="mt-4 inline-flex items-center gap-2 rounded-full bg-blue-600 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-600/30 transition hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed" 
                    type="button"
                  >
                    <span className="material-symbols-outlined">print</span>
                    In nhãn
                  </button>
                  
                  {/* Print Template (Hidden from screen) */}
                  {selectedOrder && selectedLine && (
                    <LabelPrintTemplate 
                      ref={printRef}
                      inboundCode={selectedOrder.inboundCode}
                      skuCode={selectedLine.skucode || ''}
                      productName={selectedLine.productName || ''}
                      binCode={selectedLine.binCode || selectedLine.aiSlottedBinCode || ''}
                    />
                  )}
                </div>
              </div>
            </section>
          </div>
        </div>

        <div className="mt-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-end">
          {blockConfirm && (
            <p className="flex items-center gap-1.5 text-sm font-medium text-red-600">
              <span className="material-symbols-outlined text-base">block</span>
              Còn kiện hàng lỗi chưa đủ số ảnh bắt buộc - chưa thể xác nhận.
            </p>
          )}

          <button
            onClick={submitReceiving}
            disabled={blockConfirm}
            className="rounded-full bg-blue-600 px-10 py-4 text-sm font-bold text-white shadow-[0_20px_50px_rgba(37,99,235,0.25)] transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
            type="button"
          >
            Xác nhận nhập kho
          </button>
        </div>
      </main>
    </div>
  )
}

const InfoBox = ({ label, value }: { label: string; value: string }) => (
  <div className="space-y-2">
    <label className="block text-sm font-semibold text-slate-500">{label}</label>
    <div className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium text-slate-900">
      {value}
    </div>
  </div>
)

const Metric = ({ label, value, sub }: { label: string; value: string; sub: string }) => (
  <div className="rounded-2xl border border-slate-200 bg-slate-50 px-3 py-3">
    <p className="text-[11px] font-bold uppercase tracking-wide text-slate-400">{label}</p>
    <p className="mt-1 text-sm font-bold text-slate-950">{value}</p>
    <p className="text-xs font-medium text-slate-500">{sub}</p>
  </div>
)

export default ImportGoods
