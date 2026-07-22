import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import Sidebar from '../../../components/Sidebar'
import { skuApi } from './SkuApi'
import type { SkuDetail as SkuDetailType } from './Sku.types'

const formatDate = (dateStr: string) =>
  new Date(dateStr).toLocaleDateString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })

const storageTempLabel: Record<string, string> = {
  AMBIENT: 'Nhiệt độ thường',
  COLD: 'Lạnh (2–8°C)',
  FROZEN: 'Đông lạnh (≤ -18°C)',
}

export default function SkuDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [sku, setSku] = useState<SkuDetailType | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true)
        const data = await skuApi.getById(Number(id))
        setSku(data)
      } catch {
        setError('Không thể tải thông tin SKU. Vui lòng thử lại.')
      } finally {
        setLoading(false)
      }
    }
    if (id) load()
  }, [id])

  const handleDelete = async () => {
    if (!sku) return
    if (!confirm(`Bạn có chắc muốn xóa SKU "${sku.skuCode}"?`)) return
    setDeleting(true)
    try {
      await skuApi.delete(sku.skuId)
      navigate('/warehouse/sku')
    } catch {
      alert('Không thể xóa SKU này.')
      setDeleting(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f5f7fb] flex overflow-hidden">
        <Sidebar />
        <main className="ml-[280px] flex-1 flex items-center justify-center">
          <div className="flex flex-col items-center gap-3 text-slate-500">
            <span className="material-symbols-outlined animate-spin text-[40px] text-blue-600">progress_activity</span>
            <p className="font-bold">Đang tải...</p>
          </div>
        </main>
      </div>
    )
  }

  if (error || !sku) {
    return (
      <div className="min-h-screen bg-[#f5f7fb] flex overflow-hidden">
        <Sidebar />
        <main className="ml-[280px] flex-1 flex items-center justify-center">
          <div className="flex flex-col items-center gap-4 text-center">
            <span className="material-symbols-outlined text-[48px] text-rose-500">error</span>
            <p className="font-bold text-slate-700">{error || 'SKU không tồn tại'}</p>
            <button
              onClick={() => navigate('/warehouse/sku')}
              className="inline-flex items-center gap-2 rounded-lg bg-blue-700 px-5 py-2.5 text-sm font-black text-white hover:bg-blue-800"
            >
              <span className="material-symbols-outlined text-[18px]">arrow_back</span>
              Quay lại danh sách
            </button>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#f5f7fb] text-slate-950 antialiased flex overflow-hidden">
      <Sidebar />

      <main className="ml-[280px] h-screen flex-1 overflow-y-auto bg-[#f5f7fb]">
        {/* Header */}
        <header className="sticky top-0 z-40 border-b border-slate-200/80 bg-white/95 px-8 py-5 backdrop-blur-xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate('/warehouse/sku')}
                className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 text-slate-600 transition hover:bg-slate-50"
              >
                <span className="material-symbols-outlined text-[20px]">arrow_back</span>
              </button>
              <div>
                <div className="flex items-center gap-3">
                  <h1 className="text-2xl font-black tracking-tight text-slate-950">
                    {sku.productName}
                  </h1>
                  <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-black ${
                    sku.isActive ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-500'
                  }`}>
                    <span className={`h-1.5 w-1.5 rounded-full ${sku.isActive ? 'bg-emerald-500' : 'bg-slate-400'}`} />
                    {sku.isActive ? 'Hoạt động' : 'Không hoạt động'}
                  </span>
                </div>
                <p className="mt-0.5 font-mono text-sm font-bold text-slate-400">{sku.skuCode}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => navigate(`/warehouse/sku/${sku.skuId}/edit`)}
                className="inline-flex h-10 items-center gap-2 rounded-lg border border-blue-200 bg-blue-50 px-4 text-sm font-black text-blue-700 transition hover:bg-blue-100"
              >
                <span className="material-symbols-outlined text-[18px]">edit</span>
                Chỉnh sửa
              </button>
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="inline-flex h-10 items-center gap-2 rounded-lg border border-rose-200 bg-rose-50 px-4 text-sm font-black text-rose-700 transition hover:bg-rose-100 disabled:opacity-50"
              >
                <span className="material-symbols-outlined text-[18px]">delete</span>
                {deleting ? 'Đang xóa...' : 'Xóa SKU'}
              </button>
            </div>
          </div>
        </header>

        {/* Content */}
        <section className="p-6 lg:p-8 space-y-6">
          <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">

            {/* Left Column */}
            <div className="xl:col-span-2 space-y-6">

              {/* Thông tin cơ bản */}
              <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
                <h2 className="mb-5 flex items-center gap-2 text-base font-black text-slate-900">
                  <span className="material-symbols-outlined text-blue-600">info</span>
                  Thông tin cơ bản
                </h2>
                <div className="grid grid-cols-2 gap-x-8 gap-y-4">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-wide text-slate-400">Mã SKU</p>
                    <p className="mt-1 font-mono text-sm font-black text-slate-900">{sku.skuCode}</p>
                  </div>
                  <div>
                    <p className="text-xs font-bold uppercase tracking-wide text-slate-400">Tên sản phẩm</p>
                    <p className="mt-1 text-sm font-bold text-slate-900">{sku.productName}</p>
                  </div>
                  <div>
                    <p className="text-xs font-bold uppercase tracking-wide text-slate-400">Danh mục</p>
                    <p className="mt-1 text-sm font-semibold text-slate-700">{sku.categoryName || '—'}</p>
                  </div>
                  <div>
                    <p className="text-xs font-bold uppercase tracking-wide text-slate-400">Khách hàng</p>
                    <p className="mt-1 text-sm font-semibold text-slate-700">{sku.customerName || '—'}</p>
                  </div>
                  <div>
                    <p className="text-xs font-bold uppercase tracking-wide text-slate-400">Tạo bởi</p>
                    <p className="mt-1 text-sm font-semibold text-slate-700">{sku.createdByName || '—'}</p>
                  </div>
                  <div>
                    <p className="text-xs font-bold uppercase tracking-wide text-slate-400">Ngày tạo</p>
                    <p className="mt-1 text-sm font-semibold text-slate-700">{formatDate(sku.createdAt)}</p>
                  </div>
                </div>
              </div>

              {/* Mã vạch */}
              <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
                <h2 className="mb-5 flex items-center gap-2 text-base font-black text-slate-900">
                  <span className="material-symbols-outlined text-blue-600">qr_code_2</span>
                  Mã nhận dạng
                </h2>
                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                  <div className="rounded-lg border border-slate-100 bg-slate-50 p-4">
                    <p className="mb-2 text-xs font-bold uppercase tracking-wide text-slate-400">Barcode</p>
                    {sku.barcode ? (
                      <div className="flex flex-col items-start gap-3">
                        <span className="font-mono text-sm font-bold text-slate-900">{sku.barcode}</span>
                        <img
                          src={skuApi.getBarcode(sku.skuId, 200, 60)}
                          alt={`Barcode ${sku.barcode}`}
                          className="rounded border border-slate-200 bg-white p-2"
                          onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }}
                        />
                      </div>
                    ) : (
                      <p className="text-sm font-semibold text-slate-400">Chưa có Barcode</p>
                    )}
                  </div>
                  <div className="rounded-lg border border-slate-100 bg-slate-50 p-4">
                    <p className="mb-2 text-xs font-bold uppercase tracking-wide text-slate-400">QR Code</p>
                    {sku.qrCode ? (
                      <div className="flex flex-col items-start gap-3">
                        <span className="font-mono text-sm font-bold text-slate-900">{sku.qrCode}</span>
                        <img
                          src={skuApi.getQrCode(sku.skuId, 100)}
                          alt={`QR ${sku.qrCode}`}
                          className="h-[100px] w-[100px] rounded border border-slate-200 bg-white p-2"
                          onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }}
                        />
                      </div>
                    ) : (
                      <p className="text-sm font-semibold text-slate-400">Chưa có QR Code</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Kích thước & Trọng lượng */}
              <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
                <h2 className="mb-5 flex items-center gap-2 text-base font-black text-slate-900">
                  <span className="material-symbols-outlined text-blue-600">straighten</span>
                  Kích thước & Trọng lượng
                </h2>
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                  {[
                    { label: 'Chiều dài', value: sku.lengthCm, unit: 'cm' },
                    { label: 'Chiều rộng', value: sku.widthCm, unit: 'cm' },
                    { label: 'Chiều cao', value: sku.heightCm, unit: 'cm' },
                    { label: 'Trọng lượng', value: sku.weightKg, unit: 'kg' },
                  ].map(({ label, value, unit }) => (
                    <div key={label} className="rounded-lg border border-slate-100 bg-slate-50 p-4 text-center">
                      <p className="text-xs font-bold text-slate-400">{label}</p>
                      <p className="mt-1 text-xl font-black text-slate-900">{value ?? '—'}</p>
                      {value && <p className="text-xs font-semibold text-slate-400">{unit}</p>}
                    </div>
                  ))}
                </div>
                {sku.volumeCbm && (
                  <p className="mt-4 text-sm font-semibold text-slate-500">
                    Thể tích: <span className="font-black text-slate-800">{sku.volumeCbm.toFixed(6)} m³</span>
                  </p>
                )}
              </div>
            </div>

            {/* Right Column */}
            <div className="space-y-6">

              {/* Thuộc tính đặc biệt */}
              <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
                <h2 className="mb-5 flex items-center gap-2 text-base font-black text-slate-900">
                  <span className="material-symbols-outlined text-blue-600">label</span>
                  Thuộc tính đặc biệt
                </h2>
                <div className="flex flex-col gap-3">
                  <div className={`flex items-center gap-3 rounded-lg px-4 py-3 ${sku.isFragile ? 'bg-amber-50 text-amber-800' : 'bg-slate-50 text-slate-400'}`}>
                    <span className="material-symbols-outlined text-[20px]">wine_bar</span>
                    <span className="text-sm font-bold">Hàng dễ vỡ</span>
                    {sku.isFragile
                      ? <span className="ml-auto text-xs font-black text-amber-600">✓ Có</span>
                      : <span className="ml-auto text-xs font-bold text-slate-400">Không</span>}
                  </div>
                  <div className={`flex items-center gap-3 rounded-lg px-4 py-3 ${sku.isHazmat ? 'bg-red-50 text-red-800' : 'bg-slate-50 text-slate-400'}`}>
                    <span className="material-symbols-outlined text-[20px]">warning</span>
                    <span className="text-sm font-bold">Hàng nguy hiểm</span>
                    {sku.isHazmat
                      ? <span className="ml-auto text-xs font-black text-red-600">✓ Có</span>
                      : <span className="ml-auto text-xs font-bold text-slate-400">Không</span>}
                  </div>
                  <div className={`flex items-center gap-3 rounded-lg px-4 py-3 ${sku.isHeavy ? 'bg-purple-50 text-purple-800' : 'bg-slate-50 text-slate-400'}`}>
                    <span className="material-symbols-outlined text-[20px]">fitness_center</span>
                    <span className="text-sm font-bold">Hàng nặng</span>
                    {sku.isHeavy
                      ? <span className="ml-auto text-xs font-black text-purple-600">✓ Có</span>
                      : <span className="ml-auto text-xs font-bold text-slate-400">Không</span>}
                  </div>
                </div>
              </div>

              {/* Tồn kho & Cảnh báo */}
              <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
                <h2 className="mb-5 flex items-center gap-2 text-base font-black text-slate-900">
                  <span className="material-symbols-outlined text-blue-600">inventory</span>
                  Tồn kho & Cảnh báo
                </h2>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-bold text-slate-500">Tổng tồn kho</span>
                    <span className="text-lg font-black text-slate-900">{sku.totalStock ?? 0} đơn vị</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-bold text-slate-500">Ngưỡng cảnh báo tối thiểu</span>
                    <span className="font-black text-slate-900">{sku.safetyMinQty}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-bold text-slate-500">Debounce cảnh báo</span>
                    <span className="font-black text-slate-900">{sku.safetyDebounceH}h</span>
                  </div>
                  {sku.expiryDays && (
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-bold text-slate-500">Hạn sử dụng</span>
                      <span className="font-black text-slate-900">{sku.expiryDays} ngày</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Lưu trữ */}
              <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
                <h2 className="mb-5 flex items-center gap-2 text-base font-black text-slate-900">
                  <span className="material-symbols-outlined text-blue-600">thermostat</span>
                  Điều kiện lưu trữ
                </h2>
                <div className="rounded-lg bg-slate-50 px-4 py-3">
                  <p className="text-sm font-bold text-slate-700">
                    {sku.storageTemp ? storageTempLabel[sku.storageTemp] ?? sku.storageTemp : 'Không yêu cầu đặc biệt'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  )
}
