import { useState, useEffect } from 'react'
import Sidebar from '../../components/Sidebar'
import WarehouseHeader from '../../components/WarehouseHeader'
import api from '../../lib/api'

type Zone = {
  zoneId: number
  zoneCode: string
  zoneName: string
  shelves: Shelf[]
}

type Shelf = {
  shelfId: number
  shelfCode: string
  bins: Bin[]
}

type Bin = {
  binId: number
  binCode: string
  binType: string | null
  currentStock: number
}

type SkuInventory = {
  skuId: number
  skuCode: string
  skuName: string
  quantity: number
}

type TransferHistory = {
  transferId: number
  transferCode: string
  skuCode: string
  skuName: string
  fromBinCode: string
  fromZoneName: string
  toBinCode: string
  toZoneName: string
  quantity: number
  status: string
  createdByName: string
  createdAt: string
}

const WarehouseTransfer = () => {
  const [zones, setZones] = useState<Zone[]>([])

  // Form State
  const [sourceZoneId, setSourceZoneId] = useState<number | ''>('')
  const [sourceBinId, setSourceBinId] = useState<number | ''>('')
  const [destZoneId, setDestZoneId] = useState<number | ''>('')
  const [destBinId, setDestBinId] = useState<number | ''>('')
  const [skuId, setSkuId] = useState<number | ''>('')
  const [quantity, setQuantity] = useState<number | ''>('')
  const [note, setNote] = useState('')

  // Options
  const [sourceBins, setSourceBins] = useState<Bin[]>([])
  const [destBins, setDestBins] = useState<Bin[]>([])
  const [binInventories, setBinInventories] = useState<SkuInventory[]>([])
  const [selectedSkuMaxQty, setSelectedSkuMaxQty] = useState(0)

  // Data State
  const [history, setHistory] = useState<TransferHistory[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isLoadingInventory, setIsLoadingInventory] = useState(false)
  const [inventoryError, setInventoryError] = useState<string | null>(null)
  const [message, setMessage] = useState({ type: '', text: '' })

  useEffect(() => {
    fetchLayoutTree()
    fetchHistory()
  }, [])

  const fetchLayoutTree = async () => {
    try {
      const res = await api.get('/admin/warehouse-layout/tree')
      if (res.data && res.data.length > 0) {
        // Gom zones từ TẤT CẢ warehouses, không chỉ warehouse đầu tiên
        const allZones = res.data.flatMap((wh: any) => wh.zones || [])
        setZones(allZones)
      }
    } catch (err) {
      console.error('Failed to fetch layout tree', err)
    }
  }

  const fetchHistory = async () => {
    setIsLoading(true)
    try {
      const res = await api.get('/stock-transfer')
      setHistory(res.data)
    } catch (err) {
      console.error('Failed to fetch transfer history', err)
    } finally {
      setIsLoading(false)
    }
  }

  // Handle Source Zone Change
  const handleSourceZoneChange = (zoneId: number) => {
    setSourceZoneId(zoneId)
    setSourceBinId('')
    setSkuId('')
    setBinInventories([])

    const zone = zones.find(z => z.zoneId === zoneId)
    if (zone) {
      const allBins = zone.shelves.flatMap(s => s.bins)
      setSourceBins(allBins)
    } else {
      setSourceBins([])
    }
  }

  // Handle Dest Zone Change
  const handleDestZoneChange = (zoneId: number) => {
    setDestZoneId(zoneId)
    setDestBinId('')

    const zone = zones.find(z => z.zoneId === zoneId)
    if (zone) {
      const allBins = zone.shelves.flatMap(s => s.bins)
      setDestBins(allBins)
    } else {
      setDestBins([])
    }
  }

  // Handle Source Bin Change
  const handleSourceBinChange = async (binId: number) => {
    setSourceBinId(binId)
    setSkuId('')
    setBinInventories([])
    setInventoryError(null)
    if (!binId) return

    setIsLoadingInventory(true)
    try {
      const res = await api.get(`/stock-transfer/bins/${binId}/inventory`)
      setBinInventories(res.data)
    } catch (err: any) {
      const status = err?.response?.status
      const msg = err?.response?.data?.message || err?.message || 'Lỗi không xác định'
      if (status === 401 || status === 403) {
        setInventoryError(`Không có quyền truy cập (${status}). Vui lòng đăng nhập lại.`)
      } else {
        setInventoryError(`Lỗi tải tồn kho: ${msg} (${status ?? 'network error'})`)
      }
      console.error('Failed to fetch bin inventory', err)
    } finally {
      setIsLoadingInventory(false)
    }
  }

  // Handle SKU Change
  const handleSkuChange = (sid: number) => {
    setSkuId(sid)
    const inv = binInventories.find(i => i.skuId === sid)
    setSelectedSkuMaxQty(inv ? inv.quantity : 0)
    setQuantity('')
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!sourceBinId || !destBinId || !skuId || !quantity) {
      setMessage({ type: 'error', text: 'Vui lòng điền đầy đủ thông tin.' })
      return
    }
    if (sourceBinId === destBinId) {
      setMessage({ type: 'error', text: 'Bin nguồn và đích không được trùng nhau.' })
      return
    }
    if (quantity > selectedSkuMaxQty) {
      setMessage({ type: 'error', text: 'Số lượng chuyển không được vượt quá số lượng tồn.' })
      return
    }

    setIsSubmitting(true)
    setMessage({ type: '', text: '' })
    try {
      await api.post('/stock-transfer', {
        skuId,
        fromBinId: sourceBinId,
        toBinId: destBinId,
        quantity: Number(quantity),
        note
      })

      setMessage({ type: 'success', text: 'Chuyển kho thành công!' })

      // Reset form
      setSourceZoneId('')
      setSourceBinId('')
      setDestZoneId('')
      setDestBinId('')
      setSkuId('')
      setQuantity('')
      setNote('')
      setBinInventories([])

      // Refresh Data
      fetchLayoutTree()
      fetchHistory()
    } catch (err: any) {
      setMessage({ type: 'error', text: err.response?.data?.message || 'Có lỗi xảy ra khi chuyển kho.' })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#f7f9fb] text-[#191c1e] antialiased overflow-hidden">
      <Sidebar />

      <main className="ml-[280px] min-h-screen">
        <WarehouseHeader
          title={
            <div className="flex items-center gap-4">
              <span>Warehouse Transfer</span>
              <span className="bg-[#00687a] text-white px-3 py-1 rounded-full text-sm">#WT-2024-8842</span>
            </div>
          }
          rightContent={
            <>
              <div className="relative w-80">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">search</span>
                <input className="w-full bg-slate-50 rounded-full pl-10 pr-4 py-2 text-sm focus:ring-2 focus:ring-primary/20" placeholder="Search transfers..." />
              </div>
            </>
          }
        />

        <div className="pt-24 p-8 space-y-8">

          {message.text && (
            <div className={`p-4 rounded-lg flex items-center gap-2 ${message.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
              <span className="material-symbols-outlined">{message.type === 'success' ? 'check_circle' : 'error'}</span>
              <p>{message.text}</p>
            </div>
          )}

          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
            <h3 className="text-lg font-semibold mb-6 flex items-center gap-2">
              <span className="material-symbols-outlined text-[#00687a]">sync_alt</span>
              Tạo Lệnh Chuyển Kho
            </h3>

            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* SOURCE */}
              <div className="space-y-4 bg-slate-50 p-5 rounded-xl border border-slate-100">
                <h4 className="font-bold text-[#00687a] flex items-center gap-2">
                  <span className="material-symbols-outlined">logout</span> Từ (Nguồn)
                </h4>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Zone (Khu vực)</label>
                  <select
                    className="w-full bg-white border border-slate-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-[#00687a]"
                    value={sourceZoneId}
                    onChange={(e) => handleSourceZoneChange(Number(e.target.value))}
                  >
                    <option value="">-- Chọn Zone --</option>
                    {zones.map(z => (
                      <option key={z.zoneId} value={z.zoneId}>{z.zoneName} ({z.zoneCode})</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Bin (Vị trí)</label>
                  <select
                    className="w-full bg-white border border-slate-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-[#00687a]"
                    value={sourceBinId}
                    onChange={(e) => handleSourceBinChange(Number(e.target.value))}
                    disabled={!sourceZoneId}
                  >
                    <option value="">-- Chọn Bin --</option>
                    {sourceBins.map(b => (
                      <option key={b.binId} value={b.binId}>{b.binCode} {b.currentStock > 0 ? `(${b.currentStock} items)` : ''}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Mặt hàng (SKU)</label>
                  <select
                    className="w-full bg-white border border-slate-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-[#00687a]"
                    value={skuId}
                    onChange={(e) => handleSkuChange(Number(e.target.value))}
                    disabled={!sourceBinId || binInventories.length === 0}
                  >
                    <option value="">-- Chọn Hàng --</option>
                    {binInventories.map(inv => (
                      <option key={inv.skuId} value={inv.skuId}>{inv.skuCode} - {inv.skuName} (Tồn: {inv.quantity})</option>
                    ))}
                  </select>
                  {isLoadingInventory && (
                    <p className="text-xs text-blue-500 mt-1 flex items-center gap-1">
                      <span className="material-symbols-outlined text-[14px] animate-spin">sync</span>
                      Đang tải tồn kho...
                    </p>
                  )}
                  {!isLoadingInventory && inventoryError && (
                    <p className="text-xs text-red-500 mt-1">⚠️ {inventoryError}</p>
                  )}
                  {!isLoadingInventory && !inventoryError && sourceBinId && binInventories.length === 0 && (
                    <p className="text-xs text-amber-600 mt-1">Bin này không có hàng hóa.</p>
                  )}
                </div>
              </div>

              {/* DESTINATION */}
              <div className="space-y-4 bg-slate-50 p-5 rounded-xl border border-slate-100">
                <h4 className="font-bold text-blue-600 flex items-center gap-2">
                  <span className="material-symbols-outlined">login</span> Đến (Đích)
                </h4>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Zone (Khu vực)</label>
                  <select
                    className="w-full bg-white border border-slate-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-600"
                    value={destZoneId}
                    onChange={(e) => handleDestZoneChange(Number(e.target.value))}
                  >
                    <option value="">-- Chọn Zone --</option>
                    {zones.map(z => (
                      <option key={z.zoneId} value={z.zoneId}>{z.zoneName} ({z.zoneCode})</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Bin (Vị trí)</label>
                  <select
                    className="w-full bg-white border border-slate-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-600"
                    value={destBinId}
                    onChange={(e) => setDestBinId(Number(e.target.value))}
                    disabled={!destZoneId}
                  >
                    <option value="">-- Chọn Bin --</option>
                    {destBins.map(b => (
                      <option key={b.binId} value={b.binId}>{b.binCode}</option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Số lượng chuyển</label>
                    <input
                      type="number"
                      min="1"
                      max={selectedSkuMaxQty || 1}
                      className="w-full bg-white border border-slate-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-600"
                      value={quantity}
                      onChange={(e) => setQuantity(e.target.value ? Number(e.target.value) : '')}
                      placeholder={`Max: ${selectedSkuMaxQty}`}
                      disabled={!skuId}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Ghi chú</label>
                    <input
                      type="text"
                      className="w-full bg-white border border-slate-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-600"
                      value={note}
                      onChange={(e) => setNote(e.target.value)}
                      placeholder="Tùy chọn"
                    />
                  </div>
                </div>
              </div>

              <div className="md:col-span-2 flex justify-end pt-4 border-t border-slate-200">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="bg-[#00687a] hover:bg-[#005161] text-white px-8 py-3 rounded-lg font-bold flex items-center gap-2 transition-colors disabled:opacity-50"
                >
                  <span className="material-symbols-outlined">move_up</span>
                  {isSubmitting ? 'Đang xử lý...' : 'Xác Nhận Chuyển Kho'}
                </button>
              </div>
            </form>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="p-6 border-b border-slate-200 flex justify-between items-center">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <span className="material-symbols-outlined text-[#00687a]">history</span>
                Lịch sử chuyển kho
              </h3>
              <button onClick={fetchHistory} className="text-slate-500 hover:text-[#00687a] flex items-center gap-1 text-sm font-medium">
                <span className="material-symbols-outlined text-sm">refresh</span> Làm mới
              </button>
            </div>

            <div className="overflow-x-auto">
              {isLoading ? (
                <div className="p-8 text-center text-slate-500">Đang tải dữ liệu...</div>
              ) : history.length === 0 ? (
                <div className="p-8 text-center text-slate-500">Chưa có dữ liệu chuyển kho.</div>
              ) : (
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="bg-slate-50 text-slate-500">
                      <th className="px-6 py-4 font-semibold">MÃ PHIẾU</th>
                      <th className="px-6 py-4 font-semibold">MẶT HÀNG</th>
                      <th className="px-6 py-4 font-semibold">TỪ (NGUỒN)</th>
                      <th className="px-6 py-4 font-semibold">ĐẾN (ĐÍCH)</th>
                      <th className="px-6 py-4 font-semibold text-center">SỐ LƯỢNG</th>
                      <th className="px-6 py-4 font-semibold text-center">TRẠNG THÁI</th>
                      <th className="px-6 py-4 font-semibold">THỜI GIAN</th>
                      <th className="px-6 py-4 font-semibold">NGƯỜI TẠO</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {history.map(item => (
                      <tr key={item.transferId} className="hover:bg-slate-50 transition-colors">
                        <td className="px-6 py-4 font-mono font-medium text-[#00687a]">{item.transferCode}</td>
                        <td className="px-6 py-4">
                          <p className="font-semibold text-slate-900">{item.skuName}</p>
                          <p className="text-xs text-slate-500">{item.skuCode}</p>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <span className="material-symbols-outlined text-red-400 text-sm">logout</span>
                            <div>
                              <p className="font-semibold text-slate-900">{item.fromBinCode}</p>
                              <p className="text-xs text-slate-500">{item.fromZoneName}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <span className="material-symbols-outlined text-blue-500 text-sm">login</span>
                            <div>
                              <p className="font-semibold text-slate-900">{item.toBinCode}</p>
                              <p className="text-xs text-slate-500">{item.toZoneName}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <span className="inline-flex items-center justify-center bg-blue-50 text-blue-700 px-3 py-1 rounded-full font-bold">
                            {item.quantity}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold ${
                            item.status === 'COMPLETED'
                              ? 'bg-green-100 text-green-700'
                              : item.status === 'PENDING'
                              ? 'bg-yellow-100 text-yellow-700'
                              : 'bg-red-100 text-red-700'
                          }`}>
                            <span className="material-symbols-outlined text-xs">
                              {item.status === 'COMPLETED' ? 'check_circle' : item.status === 'PENDING' ? 'schedule' : 'cancel'}
                            </span>
                            {item.status === 'COMPLETED' ? 'Hoàn thành' : item.status === 'PENDING' ? 'Đang xử lý' : item.status}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          {new Date(item.createdAt).toLocaleString('vi-VN')}
                        </td>
                        <td className="px-6 py-4 text-slate-600">
                          {item.createdByName || 'N/A'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

export default WarehouseTransfer
