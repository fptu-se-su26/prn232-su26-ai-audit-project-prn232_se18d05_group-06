import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import Sidebar from '../../../components/Sidebar'
import { skuApi, masterDataApi } from './SkuApi'
import type { CreateSkuRequest, UpdateSkuRequest } from './Sku.types'

const SkuForm = () => {
  const navigate = useNavigate()
  const { id } = useParams<{ id: string }>()
  const isEditMode = !!id && id !== 'new'

  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  // Form state
  const [skuCode, setSkuCode] = useState('')
  const [productName, setProductName] = useState('')
  const [barcode, setBarcode] = useState('')
  const [qrCode, setQrCode] = useState('')
  const [categoryId, setCategoryId] = useState<number | undefined>(undefined)
  const [customerId, setCustomerId] = useState<number | undefined>(undefined)
  const [weightKg, setWeightKg] = useState<string>('')
  const [lengthCm, setLengthCm] = useState<string>('')
  const [widthCm, setWidthCm] = useState<string>('')
  const [heightCm, setHeightCm] = useState<string>('')
  const [storageTemp, setStorageTemp] = useState('')
  const [isFragile, setIsFragile] = useState(false)
  const [isHazmat, setIsHazmat] = useState(false)
  const [isHeavy, setIsHeavy] = useState(false)
  const [safetyMinQty, setSafetyMinQty] = useState<string>('0')
  const [safetyDebounceH, setSafetyDebounceH] = useState<string>('12')
  const [expiryDays, setExpiryDays] = useState<string>('')
  const [isActive, setIsActive] = useState(true)

  // Dropdown options
  const [categories, setCategories] = useState<Array<{ categoryId: number; categoryName: string }>>([])
  const [customers, setCustomers] = useState<Array<{ customerId: number; companyName: string }>>([])
  const [storageTemps, setStorageTemps] = useState<string[]>([])

  // Duplicate check
  const [duplicateError, setDuplicateError] = useState<string | null>(null)

  // Load dropdown options
  useEffect(() => {
    loadMasterData()
  }, [])

  // Load existing data in edit mode
  useEffect(() => {
    if (isEditMode && id) {
      loadSku(parseInt(id))
    }
  }, [isEditMode, id])

  const loadMasterData = async () => {
    try {
      const [cats, custs, temps] = await Promise.all([
        masterDataApi.getCategories(),
        masterDataApi.getCustomers(),
        masterDataApi.getStorageTemps(),
      ])
      setCategories(cats)
      setCustomers(custs)
      setStorageTemps(temps)
    } catch (err) {
      console.error('Failed to load master data:', err)
    }
  }

  const loadSku = async (skuId: number) => {
    setLoading(true)
    try {
      const data = await skuApi.getById(skuId)
      setSkuCode(data.skuCode)
      setProductName(data.productName)
      setBarcode(data.barcode || '')
      setQrCode(data.qrCode || '')
      setCategoryId(data.categoryId || undefined)
      setCustomerId(data.customerId || undefined)
      setWeightKg(data.weightKg?.toString() || '')
      setLengthCm(data.lengthCm?.toString() || '')
      setWidthCm(data.widthCm?.toString() || '')
      setHeightCm(data.heightCm?.toString() || '')
      setStorageTemp(data.storageTemp || '')
      setIsFragile(data.isFragile)
      setIsHazmat(data.isHazmat)
      setIsHeavy(data.isHeavy)
      setSafetyMinQty(data.safetyMinQty?.toString() || '0')
      setSafetyDebounceH(data.safetyDebounceH?.toString() || '12')
      setExpiryDays(data.expiryDays?.toString() || '')
      setIsActive(data.isActive)
    } catch {
      setError('Không thể tải thông tin SKU.')
    } finally {
      setLoading(false)
    }
  }

  const handleGenerateCode = async () => {
    try {
      const prefix = categoryId 
        ? categories.find(c => c.categoryId === categoryId)?.categoryName?.substring(0, 3).toUpperCase() 
        : undefined
      const code = await skuApi.generateCode(prefix)
      setSkuCode(code)
      setDuplicateError(null)
    } catch {
      setError('Không thể sinh mã SKU tự động.')
    }
  }

  const handleCheckDuplicate = async () => {
    if (!skuCode) return
    try {
      const result = await skuApi.checkDuplicate({ skuCode })
      if (result.isDuplicate) {
        setDuplicateError(`Mã SKU '${skuCode}' đã tồn tại cho sản phẩm '${result.existingSkuCode}'`)
      } else {
        setDuplicateError(null)
      }
    } catch {
      // Ignore duplicate check errors
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setSuccess(null)

    // Validation
    if (!skuCode.trim()) {
      setError('Mã SKU là bắt buộc.')
      return
    }
    if (!productName.trim()) {
      setError('Tên sản phẩm là bắt buộc.')
      return
    }

    setSaving(true)
    try {
      if (isEditMode && id) {
        const updateData: UpdateSkuRequest = {
          productName,
          barcode: barcode || undefined,
          qrCode: qrCode || undefined,
          categoryId,
          customerId,
          weightKg: weightKg ? parseFloat(weightKg) : undefined,
          lengthCm: lengthCm ? parseFloat(lengthCm) : undefined,
          widthCm: widthCm ? parseFloat(widthCm) : undefined,
          heightCm: heightCm ? parseFloat(heightCm) : undefined,
          storageTemp: storageTemp || undefined,
          isFragile,
          isHazmat,
          isHeavy,
          safetyMinQty: safetyMinQty ? parseInt(safetyMinQty) : undefined,
          safetyDebounceH: safetyDebounceH ? parseInt(safetyDebounceH) : undefined,
          expiryDays: expiryDays ? parseInt(expiryDays) : undefined,
          isActive,
        }
        await skuApi.update(parseInt(id), updateData)
        setSuccess('Cập nhật SKU thành công!')
      } else {
        const createData: CreateSkuRequest = {
          skuCode,
          productName,
          barcode: barcode || undefined,
          qrCode: qrCode || undefined,
          categoryId,
          customerId,
          weightKg: weightKg ? parseFloat(weightKg) : undefined,
          lengthCm: lengthCm ? parseFloat(lengthCm) : undefined,
          widthCm: widthCm ? parseFloat(widthCm) : undefined,
          heightCm: heightCm ? parseFloat(heightCm) : undefined,
          storageTemp: storageTemp || undefined,
          isFragile,
          isHazmat,
          isHeavy,
          safetyMinQty: safetyMinQty ? parseInt(safetyMinQty) : 0,
          safetyDebounceH: safetyDebounceH ? parseInt(safetyDebounceH) : 12,
          expiryDays: expiryDays ? parseInt(expiryDays) : undefined,
          isActive,
        }
        await skuApi.create(createData)
        setSuccess('Tạo SKU mới thành công!')
        setTimeout(() => navigate('/warehouse/sku'), 1500)
      }
    } catch (err: unknown) {
      const axiosErr = err as { response?: { status?: number; data?: { message?: string; Message?: string } }; message?: string }
      const serverMsg = axiosErr?.response?.data?.message || axiosErr?.response?.data?.Message
      const status = axiosErr?.response?.status
      if (status === 401 || status === 403) {
        setError(`Không có quyền thực hiện thao tác này (${status}). Vui lòng kiểm tra lại role tài khoản.`)
      } else if (serverMsg) {
        setError(serverMsg)
      } else {
        setError(`Đã xảy ra lỗi khi lưu SKU. (${axiosErr?.message || 'Unknown error'})`)
      }
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f5f7fb] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <span className="material-symbols-outlined animate-spin text-5xl text-blue-700">progress_activity</span>
          <p className="text-lg font-bold text-slate-600">Đang tải dữ liệu...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#f5f7fb] text-slate-950 antialiased flex overflow-hidden">
      <Sidebar />

      <main className="ml-[280px] h-screen flex-1 overflow-y-auto bg-[#f5f7fb]">
        {/* Header */}
        <header className="sticky top-0 z-40 border-b border-slate-200/80 bg-white/95 px-8 py-5 backdrop-blur-xl">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate('/warehouse/sku')}
                className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 transition hover:bg-slate-50"
              >
                <span className="material-symbols-outlined text-[20px]">arrow_back</span>
              </button>
              <div>
                <h1 className="text-2xl font-black tracking-tight text-slate-950">
                  {isEditMode ? 'Chỉnh sửa SKU' : 'Thêm SKU mới'}
                </h1>
                <p className="mt-1 text-sm font-semibold text-slate-500">
                  {isEditMode ? 'Cập nhật thông tin sản phẩm trong kho' : 'Đăng ký sản phẩm mới vào hệ thống kho'}
                </p>
              </div>
            </div>
          </div>
        </header>

        {/* Content */}
        <section className="p-6 lg:p-8">
          {/* Alerts */}
          {error && (
            <div className="mb-6 flex items-start gap-3 rounded-lg border border-rose-200 bg-rose-50 px-5 py-4 text-sm font-bold text-rose-800">
              <span className="material-symbols-outlined text-[20px]">error</span>
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="mb-6 flex items-start gap-3 rounded-lg border border-emerald-200 bg-emerald-50 px-5 py-4 text-sm font-bold text-emerald-800">
              <span className="material-symbols-outlined text-[20px]">check_circle</span>
              <span>{success}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="max-w-5xl">
            <div className="space-y-6">
              {/* Basic Info */}
              <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
                <h2 className="mb-4 flex items-center gap-2 text-lg font-black text-slate-950">
                  <span className="material-symbols-outlined text-blue-700">inventory_2</span>
                  Thông tin cơ bản
                </h2>

                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-700">
                      Mã SKU <span className="text-rose-500">*</span>
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={skuCode}
                        onChange={(e) => {
                          setSkuCode(e.target.value)
                          setDuplicateError(null)
                        }}
                        onBlur={handleCheckDuplicate}
                        disabled={isEditMode}
                        placeholder="VD: SKU-TECH-001"
                        className="flex-1 h-11 rounded-lg border border-slate-300 bg-white px-4 text-sm font-semibold text-slate-900 outline-none transition focus:border-blue-600 focus:ring-4 focus:ring-blue-100 disabled:bg-slate-50 disabled:text-slate-500"
                      />
                      {!isEditMode && (
                        <button
                          type="button"
                          onClick={handleGenerateCode}
                          className="inline-flex h-11 items-center gap-2 rounded-lg border border-blue-300 bg-blue-50 px-4 text-sm font-bold text-blue-700 transition hover:bg-blue-100"
                        >
                          <span className="material-symbols-outlined text-[18px]">auto_awesome</span>
                          Sinh tự động
                        </button>
                      )}
                    </div>
                    {duplicateError && (
                      <p className="text-sm font-bold text-rose-600">{duplicateError}</p>
                    )}
                    <p className="text-xs text-slate-500">Mã SKU phải là duy nhất trong hệ thống</p>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-700">
                      Tên sản phẩm <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={productName}
                      onChange={(e) => setProductName(e.target.value)}
                      placeholder="VD: Máy tính xách tay Dell XPS 15"
                      className="h-11 w-full rounded-lg border border-slate-300 bg-white px-4 text-sm font-semibold text-slate-900 outline-none transition focus:border-blue-600 focus:ring-4 focus:ring-blue-100"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-700">Loại hàng</label>
                    <select
                      value={categoryId || ''}
                      onChange={(e) => setCategoryId(e.target.value ? parseInt(e.target.value) : undefined)}
                      className="h-11 w-full rounded-lg border border-slate-300 bg-white px-4 text-sm font-semibold text-slate-900 outline-none transition focus:border-blue-600 focus:ring-4 focus:ring-blue-100"
                    >
                      <option value="">-- Chọn loại hàng --</option>
                      {categories.map((cat) => (
                        <option key={cat.categoryId} value={cat.categoryId}>
                          {cat.categoryName}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-700">Khách hàng</label>
                    <select
                      value={customerId || ''}
                      onChange={(e) => setCustomerId(e.target.value ? parseInt(e.target.value) : undefined)}
                      className="h-11 w-full rounded-lg border border-slate-300 bg-white px-4 text-sm font-semibold text-slate-900 outline-none transition focus:border-blue-600 focus:ring-4 focus:ring-blue-100"
                    >
                      <option value="">-- Chọn khách hàng (hoặc để trống) --</option>
                      {customers.map((cust) => (
                        <option key={cust.customerId} value={cust.customerId}>
                          {cust.companyName}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-700">Barcode</label>
                    <input
                      type="text"
                      value={barcode}
                      onChange={(e) => setBarcode(e.target.value)}
                      placeholder="VD: 1234567890123"
                      className="h-11 w-full rounded-lg border border-slate-300 bg-white px-4 text-sm font-semibold text-slate-900 outline-none transition focus:border-blue-600 focus:ring-4 focus:ring-blue-100"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-700">QR Code</label>
                    <input
                      type="text"
                      value={qrCode}
                      onChange={(e) => setQrCode(e.target.value)}
                      placeholder="Mã QR tùy chỉnh"
                      className="h-11 w-full rounded-lg border border-slate-300 bg-white px-4 text-sm font-semibold text-slate-900 outline-none transition focus:border-blue-600 focus:ring-4 focus:ring-blue-100"
                    />
                  </div>
                </div>
              </div>

              {/* Dimensions */}
              <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
                <h2 className="mb-4 flex items-center gap-2 text-lg font-black text-slate-950">
                  <span className="material-symbols-outlined text-blue-700">straighten</span>
                  Kích thước & Trọng lượng
                </h2>

                <div className="grid grid-cols-2 gap-6 md:grid-cols-5">
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-700">Chiều dài (cm)</label>
                    <input
                      type="number"
                      value={lengthCm}
                      onChange={(e) => setLengthCm(e.target.value)}
                      placeholder="0"
                      min="0"
                      step="0.1"
                      className="h-11 w-full rounded-lg border border-slate-300 bg-white px-4 text-sm font-semibold text-slate-900 outline-none transition focus:border-blue-600 focus:ring-4 focus:ring-blue-100"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-700">Chiều rộng (cm)</label>
                    <input
                      type="number"
                      value={widthCm}
                      onChange={(e) => setWidthCm(e.target.value)}
                      placeholder="0"
                      min="0"
                      step="0.1"
                      className="h-11 w-full rounded-lg border border-slate-300 bg-white px-4 text-sm font-semibold text-slate-900 outline-none transition focus:border-blue-600 focus:ring-4 focus:ring-blue-100"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-700">Chiều cao (cm)</label>
                    <input
                      type="number"
                      value={heightCm}
                      onChange={(e) => setHeightCm(e.target.value)}
                      placeholder="0"
                      min="0"
                      step="0.1"
                      className="h-11 w-full rounded-lg border border-slate-300 bg-white px-4 text-sm font-semibold text-slate-900 outline-none transition focus:border-blue-600 focus:ring-4 focus:ring-blue-100"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-700">Trọng lượng (kg)</label>
                    <input
                      type="number"
                      value={weightKg}
                      onChange={(e) => setWeightKg(e.target.value)}
                      placeholder="0"
                      min="0"
                      step="0.001"
                      className="h-11 w-full rounded-lg border border-slate-300 bg-white px-4 text-sm font-semibold text-slate-900 outline-none transition focus:border-blue-600 focus:ring-4 focus:ring-blue-100"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-700">Nhiệt độ lưu trữ</label>
                    <select
                      value={storageTemp}
                      onChange={(e) => setStorageTemp(e.target.value)}
                      className="h-11 w-full rounded-lg border border-slate-300 bg-white px-4 text-sm font-semibold text-slate-900 outline-none transition focus:border-blue-600 focus:ring-4 focus:ring-blue-100"
                    >
                      <option value="">-- Chọn --</option>
                      {storageTemps.map((temp) => (
                        <option key={temp} value={temp}>
                          {temp}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Attributes */}
              <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
                <h2 className="mb-4 flex items-center gap-2 text-lg font-black text-slate-950">
                  <span className="material-symbols-outlined text-blue-700">category</span>
                  Thuộc tính đặc biệt
                </h2>

                <div className="grid grid-cols-2 gap-6 md:grid-cols-4">
                  <label className="flex cursor-pointer items-center gap-3 rounded-lg border border-slate-200 bg-slate-50 p-4 transition hover:bg-slate-100">
                    <input
                      type="checkbox"
                      checked={isFragile}
                      onChange={(e) => setIsFragile(e.target.checked)}
                      className="h-5 w-5 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                    />
                    <div className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-amber-600">wine_bar</span>
                      <span className="text-sm font-bold text-slate-700">Hàng dễ vỡ</span>
                    </div>
                  </label>

                  <label className="flex cursor-pointer items-center gap-3 rounded-lg border border-slate-200 bg-slate-50 p-4 transition hover:bg-slate-100">
                    <input
                      type="checkbox"
                      checked={isHazmat}
                      onChange={(e) => setIsHazmat(e.target.checked)}
                      className="h-5 w-5 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                    />
                    <div className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-red-600">warning</span>
                      <span className="text-sm font-bold text-slate-700">Hàng nguy hiểm</span>
                    </div>
                  </label>

                  <label className="flex cursor-pointer items-center gap-3 rounded-lg border border-slate-200 bg-slate-50 p-4 transition hover:bg-slate-100">
                    <input
                      type="checkbox"
                      checked={isHeavy}
                      onChange={(e) => setIsHeavy(e.target.checked)}
                      className="h-5 w-5 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                    />
                    <div className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-purple-600">fitness_center</span>
                      <span className="text-sm font-bold text-slate-700">Hàng nặng</span>
                    </div>
                  </label>

                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-700">Trạng thái</label>
                    <select
                      value={isActive ? 'true' : 'false'}
                      onChange={(e) => setIsActive(e.target.value === 'true')}
                      className="h-12 w-full rounded-lg border border-slate-300 bg-white px-4 text-sm font-bold text-slate-900 outline-none transition focus:border-blue-600 focus:ring-4 focus:ring-blue-100"
                    >
                      <option value="true">Hoạt động</option>
                      <option value="false">Không hoạt động</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Stock Alerts */}
              <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
                <h2 className="mb-4 flex items-center gap-2 text-lg font-black text-slate-950">
                  <span className="material-symbols-outlined text-blue-700">notifications_active</span>
                  Cảnh báo tồn kho
                </h2>

                <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-700">Số lượng tối thiểu</label>
                    <input
                      type="number"
                      value={safetyMinQty}
                      onChange={(e) => setSafetyMinQty(e.target.value)}
                      placeholder="0"
                      min="0"
                      className="h-11 w-full rounded-lg border border-slate-300 bg-white px-4 text-sm font-semibold text-slate-900 outline-none transition focus:border-blue-600 focus:ring-4 focus:ring-blue-100"
                    />
                    <p className="text-xs text-slate-500">Cảnh báo khi tồn kho thấp hơn mức này</p>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-700">Thời gian debounce (giờ)</label>
                    <input
                      type="number"
                      value={safetyDebounceH}
                      onChange={(e) => setSafetyDebounceH(e.target.value)}
                      placeholder="12"
                      min="1"
                      className="h-11 w-full rounded-lg border border-slate-300 bg-white px-4 text-sm font-semibold text-slate-900 outline-none transition focus:border-blue-600 focus:ring-4 focus:ring-blue-100"
                    />
                    <p className="text-xs text-slate-500">Khoảng cách giữa các lần gửi cảnh báo</p>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-700">Số ngày hạn sử dụng</label>
                    <input
                      type="number"
                      value={expiryDays}
                      onChange={(e) => setExpiryDays(e.target.value)}
                      placeholder="0"
                      min="0"
                      className="h-11 w-full rounded-lg border border-slate-300 bg-white px-4 text-sm font-semibold text-slate-900 outline-none transition focus:border-blue-600 focus:ring-4 focus:ring-blue-100"
                    />
                    <p className="text-xs text-slate-500">Cảnh báo khi sắp hết hạn</p>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-end gap-4">
                <button
                  type="button"
                  onClick={() => navigate('/warehouse/sku')}
                  className="inline-flex h-12 items-center gap-2 rounded-lg border border-slate-300 bg-white px-6 text-sm font-black text-slate-700 transition hover:bg-slate-50"
                >
                  <span className="material-symbols-outlined text-[20px]">close</span>
                  Hủy bỏ
                </button>
                <button
                  type="submit"
                  disabled={saving || !!duplicateError}
                  className="inline-flex h-12 items-center gap-2 rounded-lg bg-blue-700 px-6 text-sm font-black text-white shadow-lg shadow-blue-700/20 transition hover:bg-blue-800 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {saving ? (
                    <>
                      <span className="material-symbols-outlined animate-spin text-[20px]">progress_activity</span>
                      Đang lưu...
                    </>
                  ) : (
                    <>
                      <span className="material-symbols-outlined text-[20px]">save</span>
                      {isEditMode ? 'Cập nhật' : 'Tạo mới'}
                    </>
                  )}
                </button>
              </div>
            </div>
          </form>
        </section>
      </main>
    </div>
  )
}

export default SkuForm
