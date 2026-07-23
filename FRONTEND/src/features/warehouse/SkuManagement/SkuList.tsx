import { useState, useEffect, useMemo, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import Sidebar from '../../../components/Sidebar'
import { skuApi } from './SkuApi'
import type { SkuListItem, SkuSearchParams } from './Sku.types'

type AlertBadge = {
  frag: boolean
  hazm: boolean
  heavy: boolean
}

const formatDate = (dateStr: string) => {
  return new Date(dateStr).toLocaleDateString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

const SkuList = () => {
  const navigate = useNavigate()
  const [items, setItems] = useState<SkuListItem[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Pagination
  const [page, setPage] = useState(1)
  const [totalCount, setTotalCount] = useState(0)
  const [pageSize] = useState(20)
  const totalPages = Math.ceil(totalCount / pageSize)

  // Filters
  const [searchText, setSearchText] = useState('')
  const [filterActive, setFilterActive] = useState<boolean | undefined>(undefined)
  const [filterFragile, setFilterFragile] = useState<boolean | undefined>(undefined)
  const [filterHazmat, setFilterHazmat] = useState<boolean | undefined>(undefined)
  const [filterHeavy, setFilterHeavy] = useState<boolean | undefined>(undefined)
  const [sortBy, setSortBy] = useState('CreatedAt')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')

  const loadData = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const params: SkuSearchParams = {
        page,
        pageSize,
        sortBy,
        sortOrder,
      }
      if (searchText) params.query = searchText
      if (filterActive !== undefined) params.isActive = filterActive
      if (filterFragile !== undefined) params.isFragile = filterFragile
      if (filterHazmat !== undefined) params.isHazmat = filterHazmat
      if (filterHeavy !== undefined) params.isHeavy = filterHeavy

      const result = await skuApi.getAll(params)
      setItems(result.items)
      setTotalCount(result.totalCount)
    } catch (err) {
      setError('Không thể tải danh sách SKU. Vui lòng thử lại.')
    } finally {
      setLoading(false)
    }
  }, [page, pageSize, searchText, filterActive, filterFragile, filterHazmat, filterHeavy, sortBy, sortOrder])

  useEffect(() => {
    loadData()
  }, [loadData])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    setPage(1)
    loadData()
  }

  const handleExport = async () => {
    try {
      const blob = await skuApi.export({ query: searchText || undefined })
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `SKUs_Export_${new Date().toISOString().slice(0, 10)}.xlsx`
      a.click()
      window.URL.revokeObjectURL(url)
    } catch {
      setError('Không thể xuất file Excel.')
    }
  }

  const handleDelete = async (id: number) => {
    if (!confirm('Bạn có chắc muốn xóa SKU này?')) return
    try {
      await skuApi.delete(id)
      loadData()
    } catch (err: unknown) {
      const axiosErr = err as { response?: { status?: number; data?: { message?: string } } }
      const status = axiosErr?.response?.status
      const serverMsg = axiosErr?.response?.data?.message
      if (status === 403 || status === 401) {
        setError(`Không có quyền xóa SKU (lỗi ${status}). Vui lòng đăng nhập lại hoặc dùng tài khoản ADMIN.`)
      } else if (serverMsg) {
        setError(`Không thể xóa SKU: ${serverMsg}`)
      } else {
        setError('Không thể xóa SKU. Vui lòng restart backend và thử lại.')
      }
    }
  }

  const filteredItems = useMemo(() => items, [items])

  const summaryStats = useMemo(() => {
    const total = items.length
    const activeCount = items.filter(i => i.isActive).length
    const fragileCount = items.filter(i => i.isFragile).length
    const hazmatCount = items.filter(i => i.isHazmat).length
    return { total, activeCount, fragileCount, hazmatCount }
  }, [items])

  const getBadges = (item: SkuListItem): AlertBadge => ({
    frag: item.isFragile,
    hazm: item.isHazmat,
    heavy: item.isHeavy,
  })

  return (
    <div className="min-h-screen bg-[#f5f7fb] text-slate-950 antialiased flex overflow-hidden">
      <Sidebar />

      <main className="ml-[280px] h-screen flex-1 overflow-y-auto bg-[#f5f7fb]">
        {/* Header */}
        <header className="sticky top-0 z-40 border-b border-slate-200/80 bg-white/95 px-8 py-5 backdrop-blur-xl">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h1 className="text-2xl font-black tracking-tight text-slate-950">Quản lý SKU</h1>
              <p className="mt-1 text-sm font-semibold text-slate-500">
                Tổng cộng {totalCount} SKU trong hệ thống
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <button
                onClick={handleExport}
                className="inline-flex h-12 items-center gap-2 rounded-lg border border-slate-300 bg-white px-5 text-sm font-black text-slate-700 shadow-sm transition hover:bg-slate-50"
              >
                <span className="material-symbols-outlined text-[20px]">download</span>
                Xuất Excel
              </button>
              <button
                onClick={() => navigate('/warehouse/sku/new')}
                className="inline-flex h-12 items-center gap-2 rounded-lg bg-blue-700 px-5 text-sm font-black text-white shadow-lg shadow-blue-700/20 transition hover:bg-blue-800"
              >
                <span className="material-symbols-outlined text-[20px]">add</span>
                Thêm SKU mới
              </button>
            </div>
          </div>
        </header>

        {/* Content */}
        <section className="space-y-6 p-6 lg:p-8">
          {/* Error */}
          {error && (
            <div className="flex items-start gap-3 rounded-lg border border-rose-200 bg-rose-50 px-5 py-4 text-sm font-bold text-rose-800">
              <span className="material-symbols-outlined text-[20px]">error</span>
              <span>{error}</span>
            </div>
          )}

          {/* Stats Cards */}
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4 xl:grid-cols-5">
            <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50">
                  <span className="material-symbols-outlined text-blue-700">inventory_2</span>
                </div>
                <div>
                  <p className="text-sm font-bold text-slate-500">Tổng SKU</p>
                  <p className="text-2xl font-black text-slate-950">{summaryStats.total}</p>
                </div>
              </div>
            </div>
            <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-5">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-100">
                  <span className="material-symbols-outlined text-emerald-700">check_circle</span>
                </div>
                <div>
                  <p className="text-sm font-bold text-emerald-700">Đang hoạt động</p>
                  <p className="text-2xl font-black text-emerald-800">{summaryStats.activeCount}</p>
                </div>
              </div>
            </div>
            <div className="rounded-lg border border-amber-200 bg-amber-50 p-5">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-100">
                  <span className="material-symbols-outlined text-amber-700">wine_bar</span>
                </div>
                <div>
                  <p className="text-sm font-bold text-amber-700">Hàng dễ vỡ</p>
                  <p className="text-2xl font-black text-amber-800">{summaryStats.fragileCount}</p>
                </div>
              </div>
            </div>
            <div className="rounded-lg border border-red-200 bg-red-50 p-5">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-red-100">
                  <span className="material-symbols-outlined text-red-700">warning</span>
                </div>
                <div>
                  <p className="text-sm font-bold text-red-700">Hàng nguy hiểm</p>
                  <p className="text-2xl font-black text-red-800">{summaryStats.hazmatCount}</p>
                </div>
              </div>
            </div>
            <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-100">
                  <span className="material-symbols-outlined text-slate-700">sync</span>
                </div>
                <div>
                  <p className="text-sm font-bold text-slate-500">Đang chờ</p>
                  <p className="text-2xl font-black text-slate-950">{summaryStats.total - summaryStats.activeCount}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Filter Bar */}
          <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
            <form onSubmit={handleSearch} className="flex flex-wrap items-center gap-4">
              <label className="relative flex-1 min-w-[300px]">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[20px] text-slate-400">search</span>
                <input
                  type="text"
                  value={searchText}
                  onChange={(e) => setSearchText(e.target.value)}
                  placeholder="Tìm SKU, tên sản phẩm, barcode..."
                  className="h-11 w-full rounded-lg border border-slate-300 bg-white pl-10 pr-3 text-sm font-semibold text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-600 focus:ring-4 focus:ring-blue-100"
                />
              </label>

              <select
                value={filterActive === undefined ? '' : filterActive.toString()}
                onChange={(e) => setFilterActive(e.target.value === '' ? undefined : e.target.value === 'true')}
                className="h-11 rounded-lg border border-slate-300 bg-white px-3 text-sm font-bold text-slate-900 outline-none transition focus:border-blue-600 focus:ring-4 focus:ring-blue-100"
              >
                <option value="">Tất cả trạng thái</option>
                <option value="true">Hoạt động</option>
                <option value="false">Không hoạt động</option>
              </select>

              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="h-11 rounded-lg border border-slate-300 bg-white px-3 text-sm font-bold text-slate-900 outline-none transition focus:border-blue-600 focus:ring-4 focus:ring-blue-100"
              >
                <option value="CreatedAt">Ngày tạo</option>
                <option value="SkuCode">Mã SKU</option>
                <option value="ProductName">Tên sản phẩm</option>
              </select>

              <select
                value={sortOrder}
                onChange={(e) => setSortOrder(e.target.value as 'asc' | 'desc')}
                className="h-11 rounded-lg border border-slate-300 bg-white px-3 text-sm font-bold text-slate-900 outline-none transition focus:border-blue-600 focus:ring-4 focus:ring-blue-100"
              >
                <option value="desc">Giảm dần</option>
                <option value="asc">Tăng dần</option>
              </select>

              <button
                type="submit"
                className="inline-flex h-11 items-center gap-2 rounded-lg bg-blue-700 px-5 text-sm font-black text-white transition hover:bg-blue-800"
              >
                <span className="material-symbols-outlined text-[20px]">search</span>
                Tìm kiếm
              </button>

              <button
                type="button"
                onClick={() => {
                  setSearchText('')
                  setFilterActive(undefined)
                  setFilterFragile(undefined)
                  setFilterHazmat(undefined)
                  setFilterHeavy(undefined)
                  setPage(1)
                  loadData()
                }}
                className="inline-flex h-11 items-center gap-2 rounded-lg border border-slate-300 bg-white px-5 text-sm font-black text-slate-700 transition hover:bg-slate-50"
              >
                <span className="material-symbols-outlined text-[20px]">clear</span>
                Xóa lọc
              </button>
            </form>
          </div>

          {/* Table */}
          <div className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[1200px] border-collapse text-left">
                <thead className="bg-slate-50 text-xs font-black uppercase tracking-wide text-slate-500">
                  <tr>
                    <th className="px-5 py-4">Mã SKU</th>
                    <th className="px-5 py-4">Sản phẩm</th>
                    <th className="px-5 py-4">Barcode / QR</th>
                    <th className="px-5 py-4">Kích thước / Trọng lượng</th>
                    <th className="px-5 py-4">Loại hàng</th>
                    <th className="px-5 py-4">Trạng thái</th>
                    <th className="px-5 py-4">Ngày tạo</th>
                    <th className="px-5 py-4 text-right">Thao tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {loading && (
                    <tr>
                      <td colSpan={8} className="px-5 py-10 text-center text-sm font-bold text-slate-500">
                        <span className="material-symbols-outlined animate-spin">progress_activity</span>
                        Đang tải dữ liệu...
                      </td>
                    </tr>
                  )}
                  {!loading && filteredItems.length === 0 && (
                    <tr>
                      <td colSpan={8} className="px-5 py-10 text-center text-sm font-bold text-slate-500">
                        Không có SKU nào được tìm thấy.
                      </td>
                    </tr>
                  )}
                  {!loading && filteredItems.map((item) => {
                    const badges = getBadges(item)
                    return (
                      <tr key={item.skuId} className="transition hover:bg-blue-50/50">
                        <td className="px-5 py-4">
                          <p className="font-mono text-sm font-black text-blue-700">{item.skuCode}</p>
                        </td>
                        <td className="px-5 py-4">
                          <p className="max-w-[250px] truncate text-sm font-black text-slate-900">{item.productName}</p>
                          <p className="mt-1 max-w-[250px] truncate text-xs font-semibold text-slate-500">
                            {item.categoryName || 'Chưa phân loại'} · {item.customerName || 'Chung'}
                          </p>
                        </td>
                        <td className="px-5 py-4">
                          <div className="flex flex-col gap-1">
                            {item.barcode && (
                              <span className="inline-flex items-center gap-1 rounded bg-slate-100 px-2 py-0.5 text-xs font-mono font-bold text-slate-700">
                                <span className="material-symbols-outlined text-[14px]">qr_code</span>
                                {item.barcode}
                              </span>
                            )}
                            {item.qrCode && (
                              <span className="inline-flex items-center gap-1 rounded bg-blue-50 px-2 py-0.5 text-xs font-mono font-bold text-blue-700">
                                <span className="material-symbols-outlined text-[14px]">qr_code_2</span>
                                QR
                              </span>
                            )}
                            {!item.barcode && !item.qrCode && (
                              <span className="text-xs font-semibold text-slate-400">Chưa có mã</span>
                            )}
                          </div>
                        </td>
                        <td className="px-5 py-4">
                          <p className="text-sm font-semibold text-slate-700">
                            {item.lengthCm && item.widthCm && item.heightCm
                              ? `${item.lengthCm}×${item.widthCm}×${item.heightCm} cm`
                              : '-'}
                          </p>
                          <p className="mt-1 text-sm font-bold text-slate-500">
                            {item.weightKg ? `${item.weightKg} kg` : '-'}
                          </p>
                        </td>
                        <td className="px-5 py-4">
                          <div className="flex flex-wrap gap-1">
                            {badges.frag && (
                              <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-black text-amber-800">
                                <span className="material-symbols-outlined text-[14px]">wine_bar</span>
                                Dễ vỡ
                              </span>
                            )}
                            {badges.hazm && (
                              <span className="inline-flex items-center gap-1 rounded-full bg-red-100 px-2.5 py-0.5 text-xs font-black text-red-800">
                                <span className="material-symbols-outlined text-[14px]">warning</span>
                                Nguy hiểm
                              </span>
                            )}
                            {badges.heavy && (
                              <span className="inline-flex items-center gap-1 rounded-full bg-purple-100 px-2.5 py-0.5 text-xs font-black text-purple-800">
                                <span className="material-symbols-outlined text-[14px]">fitness_center</span>
                                Nặng
                              </span>
                            )}
                            {!badges.frag && !badges.hazm && !badges.heavy && (
                              <span className="text-xs font-semibold text-slate-400">Bình thường</span>
                            )}
                          </div>
                        </td>
                        <td className="px-5 py-4">
                          <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-black ${
                            item.isActive
                              ? 'bg-emerald-50 text-emerald-700'
                              : 'bg-slate-100 text-slate-500'
                          }`}>
                            <span className={`h-1.5 w-1.5 rounded-full ${item.isActive ? 'bg-emerald-500' : 'bg-slate-400'}`} />
                            {item.isActive ? 'Hoạt động' : 'Không hoạt động'}
                          </span>
                        </td>
                        <td className="px-5 py-4 text-sm font-semibold text-slate-600">
                          {formatDate(item.createdAt)}
                        </td>
                        <td className="px-5 py-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => navigate(`/warehouse/sku/${item.skuId}/edit`)}
                              className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 text-slate-600 transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700"
                              title="Sửa"
                            >
                              <span className="material-symbols-outlined text-[20px]">edit</span>
                            </button>
                            <button
                              onClick={() => navigate(`/warehouse/sku/${item.skuId}`)}
                              className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 text-slate-600 transition hover:border-emerald-200 hover:bg-emerald-50 hover:text-emerald-700"
                              title="Chi tiết"
                            >
                              <span className="material-symbols-outlined text-[20px]">visibility</span>
                            </button>
                            <button
                              onClick={() => handleDelete(item.skuId)}
                              className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 text-slate-600 transition hover:border-red-200 hover:bg-red-50 hover:text-red-700"
                              title="Xóa"
                            >
                              <span className="material-symbols-outlined text-[20px]">delete</span>
                            </button>
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between border-t border-slate-200 px-6 py-4">
                <p className="text-sm font-semibold text-slate-500">
                  Trang {page} / {totalPages} · {totalCount} kết quả
                </p>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setPage(p => Math.max(1, p - 1))}
                    disabled={page === 1}
                    className="inline-flex h-10 items-center gap-1 rounded-lg border border-slate-300 bg-white px-4 text-sm font-bold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <span className="material-symbols-outlined text-[18px]">chevron_left</span>
                    Trước
                  </button>
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    let pageNum = i + 1
                    if (totalPages > 5) {
                      if (page > 3) pageNum = page - 2 + i
                      if (page > totalPages - 2) pageNum = totalPages - 4 + i
                    }
                    return (
                      <button
                        key={pageNum}
                        onClick={() => setPage(pageNum)}
                        className={`h-10 min-w-[40px] rounded-lg px-3 text-sm font-bold transition ${
                          page === pageNum
                            ? 'bg-blue-700 text-white'
                            : 'border border-slate-300 bg-white text-slate-700 hover:bg-slate-50'
                        }`}
                      >
                        {pageNum}
                      </button>
                    )
                  })}
                  <button
                    onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                    disabled={page === totalPages}
                    className="inline-flex h-10 items-center gap-1 rounded-lg border border-slate-300 bg-white px-4 text-sm font-bold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    Sau
                    <span className="material-symbols-outlined text-[18px]">chevron_right</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </section>
      </main>
    </div>
  )
}

export default SkuList
