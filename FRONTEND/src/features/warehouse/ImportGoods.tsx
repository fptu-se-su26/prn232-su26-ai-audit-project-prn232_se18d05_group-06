import { useEffect, useMemo, useRef, useState } from 'react'
import Sidebar from '../../components/Sidebar'
import api from '../../lib/api'

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
  photoCount: number
  requiresMinPhotos: boolean
  minPhotos: number
  photos: CargoPhoto[]
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
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [photoAngle, setPhotoAngle] = useState<string>('FRONT')
  const [markDamaged, setMarkDamaged] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const selectedOrder = useMemo(
    () => orders.find((o) => o.inboundId === selectedOrderId) ?? null,
    [orders, selectedOrderId],
  )
  const selectedLine = useMemo(
    () => lines.find((l) => l.lineId === selectedLineId) ?? null,
    [lines, selectedLineId],
  )

  // Tải danh sách đơn nhập kho khi mở trang.
  useEffect(() => {
    let active = true
    setLoadingOrders(true)
    api
      .get<InboundOrder[]>('/inbound')
      .then((res) => {
        if (!active) return
        setOrders(res.data)
        if (res.data.length > 0) setSelectedOrderId(res.data[0].inboundId)
      })
      .catch(() => active && setError('Không tải được danh sách đơn nhập kho.'))
      .finally(() => active && setLoadingOrders(false))
    return () => {
      active = false
    }
  }, [])

  // Tải dòng hàng mỗi khi đổi đơn nhập.
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

  // Kiện hư hỏng thì mặc định bật cờ "đánh dấu hư hỏng".
  useEffect(() => {
    setMarkDamaged(Boolean(selectedLine?.requiresMinPhotos))
  }, [selectedLine?.lineId, selectedLine?.requiresMinPhotos])

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

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) handleUpload(file)
  }

  // UC002: kiện hư hỏng phải đủ tối thiểu minPhotos góc ảnh trước khi xác nhận.
  const currentPhotos = selectedLine?.photos?.length ?? 0
  const photosNeeded = selectedLine?.requiresMinPhotos
    ? Math.max(0, selectedLine.minPhotos - currentPhotos)
    : 0
  const blockConfirm = lines.some(
    (l) => l.requiresMinPhotos && (l.photos?.length ?? 0) < l.minPhotos,
  )

  const conditionBadge = (status: string | null) => {
    const s = (status ?? 'GOOD').toUpperCase()
    if (s === 'DAMAGED') return 'bg-red-100 text-red-700'
    if (s === 'PARTIAL') return 'bg-amber-100 text-amber-700'
    return 'bg-emerald-100 text-emerald-700'
  }
  const conditionText = (status: string | null) =>
    CONDITION_LABELS[(status ?? 'GOOD').toUpperCase()] ?? status ?? 'Nguyên vẹn'

  return (
    <div className="min-h-screen bg-[#f7f9fb] text-[#191c1e] antialiased overflow-hidden">
      <Sidebar />

      <header className="fixed top-0 right-0 w-[calc(100%-280px)] h-20 bg-white/80 backdrop-blur-md z-40 border-b border-slate-200/70 flex items-center justify-between px-8">
        <div>
          <h1 className="text-2xl font-bold">Nhập kho hàng hóa</h1>
          <p className="text-xs text-slate-500">Chụp ảnh tình trạng hàng khi nhập (UC002)</p>
        </div>
        <div className="flex items-center gap-4">
          <button className="relative rounded-full p-2 text-slate-600 hover:bg-slate-100 transition-all duration-200">
            <span className="material-symbols-outlined">notifications</span>
            <span className="absolute top-1 right-1 h-2.5 w-2.5 rounded-full bg-red-600" />
          </button>
          <button className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-900 transition hover:bg-slate-200">
            <span className="material-symbols-outlined text-base">smart_toy</span>
            Trạng thái AI: Sẵn sàng
          </button>
        </div>
      </header>

      <main className="ml-[280px] mt-20 p-8 pb-10 animate-fade-in-up">
        {error && (
          <div className="mb-6 flex items-center gap-2 rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm font-medium text-red-700">
            <span className="material-symbols-outlined text-base">error</span>
            {error}
          </div>
        )}

        <div className="grid gap-6 lg:grid-cols-[1.75fr_1fr]">
          <div className="space-y-6">
            {/* Thông tin đơn nhập */}
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
                      <option value="">{loadingOrders ? 'Đang tải…' : 'Không có đơn nhập'}</option>
                    )}
                    {orders.map((o) => (
                      <option key={o.inboundId} value={o.inboundId}>
                        {o.inboundCode} — {o.customerName ?? 'Không rõ'}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-slate-500">Khách hàng</label>
                  <div className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium text-slate-900">
                    {selectedOrder?.customerName ?? '—'}
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-slate-500">Kho</label>
                  <div className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium text-slate-900">
                    {selectedOrder?.warehouseName ?? '—'}
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-slate-500">Mã đơn</label>
                  <div className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium text-slate-900">
                    {selectedOrder?.inboundCode ?? '—'}
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-slate-500">Trạng thái</label>
                  <div className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium text-slate-900">
                    {selectedOrder?.status ?? '—'}
                  </div>
                </div>
              </div>
            </section>

            {/* Chi tiết hàng hóa */}
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
                          Đang tải dòng hàng…
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
                            <td className="px-4 py-4 font-semibold text-slate-900">{row.skucode ?? '—'}</td>
                            <td className="px-4 py-4">{row.productName ?? '—'}</td>
                            <td className="px-4 py-4">{row.receivedQty ?? row.expectedQty}</td>
                            <td className="px-4 py-4 text-slate-500">{row.binCode ?? '—'}</td>
                            <td className="px-4 py-4">
                              <span
                                className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${conditionBadge(
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

            {/* Vị trí lưu kho (trang trí) */}
            <section className="glass-card rounded-[28px] border border-white/80 p-6 shadow-xl shadow-slate-900/5">
              <div className="flex items-center gap-3 mb-5">
                <span className="material-symbols-outlined text-primary">warehouse</span>
                <h2 className="text-xl font-semibold">Vị trí lưu kho</h2>
              </div>
              <div className="grid gap-4 md:grid-cols-3">
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-slate-500">Khu vực</label>
                  <select className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none focus:border-primary focus:ring-2 focus:ring-primary/20">
                    <option>Khu A (Kho lạnh)</option>
                    <option>Khu B (Hàng khô)</option>
                    <option>Khu C (Hàng nguy hiểm)</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-slate-500">Kệ</label>
                  <select className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none focus:border-primary focus:ring-2 focus:ring-primary/20">
                    <option>Kệ S1-01</option>
                    <option>Kệ S1-02</option>
                    <option>Kệ S2-01</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-slate-500">Ô chứa (Bin)</label>
                  <select className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none focus:border-primary focus:ring-2 focus:ring-primary/20">
                    <option>Bin B10</option>
                    <option>Bin B11</option>
                    <option>Bin B12</option>
                  </select>
                </div>
              </div>
            </section>
          </div>

          <div className="space-y-6">
            {/* Quét hóa đơn AI (trang trí) */}
            <section className="glass-card rounded-[28px] border border-white/80 p-6 shadow-xl shadow-slate-900/5">
              <div className="flex items-center gap-3 mb-5">
                <span className="material-symbols-outlined text-primary">document_scanner</span>
                <h2 className="text-xl font-semibold">Quét hóa đơn bằng AI</h2>
              </div>
              <div className="relative rounded-[28px] border-2 border-dashed border-primary/35 bg-slate-50 p-8 text-center">
                <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-transparent via-primary to-transparent" />
                <span className="material-symbols-outlined mb-4 inline-block text-4xl text-primary/70">cloud_upload</span>
                <p className="mx-auto max-w-xs text-sm text-slate-500">
                  Kéo thả file PDF hoặc ảnh hóa đơn vào đây để tự động điền thông tin
                </p>
                <button className="mt-6 rounded-full bg-primary px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-primary/15 transition hover:bg-blue-700">
                  Chọn file
                </button>
              </div>
            </section>

            {/* UC002 — Ảnh tình trạng hàng */}
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
                  Chọn một dòng hàng ở bảng bên trái để chụp / xem ảnh tình trạng.
                </div>
              )}

              {selectedLine && (
                <div className="space-y-5">
                  <div className="rounded-2xl bg-slate-50 px-4 py-3">
                    <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Đang thao tác</p>
                    <p className="text-sm font-semibold text-slate-900">
                      {selectedLine.skucode} · {selectedLine.productName}
                    </p>
                  </div>

                  {/* Cảnh báo ràng buộc UC002 */}
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

                  {/* Khu vực upload */}
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
                    >
                      <span className="material-symbols-outlined">add_a_photo</span>
                      {uploading ? 'Đang tải lên…' : 'Chụp / Tải ảnh lên'}
                    </button>
                  </div>

                  {/* Thư viện ảnh từ DB */}
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
                        <div
                          key={p.photoId}
                          className="group relative overflow-hidden rounded-2xl bg-slate-950 shadow-sm"
                        >
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

            {/* Nhãn theo dõi (trang trí) */}
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
                  <p className="text-xs text-slate-500">
                    MÃ NHÃN: {selectedOrder?.inboundCode ?? 'IMP-—'}
                  </p>
                  <p className="mt-2 text-sm font-semibold text-slate-900">
                    Dòng hàng: {selectedLine?.skucode ?? '—'}
                  </p>
                  <button className="mt-4 inline-flex items-center gap-2 rounded-full bg-slate-900 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-800">
                    <span className="material-symbols-outlined">print</span>
                    In nhãn
                  </button>
                </div>
              </div>
            </section>
          </div>
        </div>

        <div className="mt-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-end">
          {blockConfirm && (
            <p className="flex items-center gap-1.5 text-sm font-medium text-red-600">
              <span className="material-symbols-outlined text-base">block</span>
              Còn kiện hàng lỗi chưa đủ số ảnh bắt buộc — chưa thể xác nhận.
            </p>
          )}
          <button className="rounded-full border border-blue-600 bg-white px-8 py-4 text-sm font-bold text-blue-600 transition hover:bg-blue-50">
            Lưu nháp
          </button>
          <button
            disabled={blockConfirm}
            className="rounded-full bg-blue-600 px-10 py-4 text-sm font-bold text-white shadow-[0_20px_50px_rgba(37,99,235,0.25)] transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Xác nhận nhập kho
          </button>
        </div>
      </main>
    </div>
  )
}

export default ImportGoods
