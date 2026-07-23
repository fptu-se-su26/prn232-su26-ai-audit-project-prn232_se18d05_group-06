import { useState, useEffect } from 'react'
import Sidebar from '../../components/Sidebar'
import api from '../../lib/api'

// Types
type Zone = { zoneId: number; zoneCode: string; zoneName: string; shelves: Shelf[] }
type Shelf = { shelfId: number; bins: Bin[] }
type Bin = { binId: number; binCode: string }
type SkuInventory = { skuId: number; skuCode: string; skuName: string; quantity: number }

type WriteOff = {
  writeOffId: number
  writeOffCode: string
  skuCode: string
  skuName: string
  binCode: string | null
  zoneName: string | null
  quantity: number
  reason: string | null
  status: string | null
  createdByName: string | null
  createdAt: string | null
  approvedByName: string | null
  approvedAt: string | null
}

const REASON_OPTIONS = [
  'Hàng bị hỏng / móp méo / vỡ',
  'Hết hạn sử dụng',
  'Thất thoát không rõ nguyên nhân',
  'Hàng bị ẩm mốc / ô nhiễm',
  'Lý do khác',
]

const StatusBadge = ({ status }: { status: string | null }) => {
  const map: Record<string, { cls: string; label: string; icon: string }> = {
    PENDING:  { cls: 'bg-yellow-100 text-yellow-700', label: 'Chờ duyệt',   icon: 'schedule' },
    APPROVED: { cls: 'bg-green-100 text-green-700',   label: 'Đã duyệt',    icon: 'check_circle' },
    REJECTED: { cls: 'bg-red-100 text-red-700',       label: 'Từ chối',     icon: 'cancel' },
  }
  const s = status && map[status] ? map[status] : { cls: 'bg-slate-100 text-slate-600', label: status ?? '—', icon: 'help' }
  return (
    <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold ${s.cls}`}>
      <span className="material-symbols-outlined text-xs">{s.icon}</span>
      {s.label}
    </span>
  )
}

// Modal xác nhận
const ConfirmModal = ({
  item, onConfirm, onCancel
}: {
  item: WriteOff | null
  onConfirm: (approved: boolean, note: string) => void
  onCancel: () => void
}) => {
  const [approving, setApproving] = useState(true)
  const [note, setNote] = useState('')

  if (!item) return null
  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 space-y-5">
        <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
          <span className="material-symbols-outlined text-[#00687a]">gavel</span>
          Xử lý phiếu {item.writeOffCode}
        </h3>
        <div className="bg-slate-50 rounded-xl p-4 space-y-2 text-sm">
          <div className="flex justify-between"><span className="text-slate-500">Mặt hàng</span><span className="font-semibold">{item.skuName}</span></div>
          <div className="flex justify-between"><span className="text-slate-500">Bin</span><span className="font-semibold">{item.binCode || '—'}</span></div>
          <div className="flex justify-between"><span className="text-slate-500">Số lượng thanh lý</span><span className="font-bold text-red-600">{item.quantity}</span></div>
          <div className="flex justify-between"><span className="text-slate-500">Lý do</span><span className="font-medium max-w-[200px] text-right">{item.reason}</span></div>
        </div>
        <div className="flex gap-3">
          <button onClick={() => setApproving(true)}
            className={`flex-1 py-2 rounded-lg font-semibold border-2 transition ${approving ? 'bg-green-600 text-white border-green-600' : 'border-slate-200 text-slate-600'}`}>
            ✅ Phê duyệt
          </button>
          <button onClick={() => setApproving(false)}
            className={`flex-1 py-2 rounded-lg font-semibold border-2 transition ${!approving ? 'bg-red-600 text-white border-red-600' : 'border-slate-200 text-slate-600'}`}>
            ❌ Từ chối
          </button>
        </div>
        {!approving && (
          <div>
            <label className="text-sm font-medium text-slate-700">Lý do từ chối</label>
            <textarea
              className="w-full mt-1 border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-red-500"
              rows={3}
              placeholder="Nhập lý do từ chối..."
              value={note}
              onChange={e => setNote(e.target.value)}
            />
          </div>
        )}
        <div className="flex gap-3 pt-2">
          <button onClick={onCancel} className="flex-1 py-2.5 rounded-lg border border-slate-300 text-slate-600 font-semibold hover:bg-slate-50">
            Hủy
          </button>
          <button
            onClick={() => onConfirm(approving, note)}
            className={`flex-1 py-2.5 rounded-lg text-white font-bold transition ${approving ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'}`}
          >
            Xác nhận {approving ? 'Duyệt' : 'Từ chối'}
          </button>
        </div>
      </div>
    </div>
  )
}

// Bảng lịch sử phiếu
const WriteOffTable = ({ data, onApprove, isAdmin }: { data: WriteOff[]; onApprove?: (item: WriteOff) => void; isAdmin: boolean }) => {
  if (data.length === 0)
    return <div className="p-10 text-center text-slate-400 text-sm">Chưa có dữ liệu.</div>
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left text-sm">
        <thead>
          <tr className="bg-slate-50 text-slate-500 text-xs uppercase">
            <th className="px-5 py-3 font-semibold">Mã phiếu</th>
            <th className="px-5 py-3 font-semibold">Mặt hàng</th>
            <th className="px-5 py-3 font-semibold">Vị trí</th>
            <th className="px-5 py-3 font-semibold text-center">Số lượng</th>
            <th className="px-5 py-3 font-semibold">Lý do</th>
            <th className="px-5 py-3 font-semibold text-center">Trạng thái</th>
            <th className="px-5 py-3 font-semibold">Người tạo</th>
            <th className="px-5 py-3 font-semibold">Thời gian</th>
            {isAdmin && <th className="px-5 py-3 font-semibold text-center">Thao tác</th>}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {data.map(item => (
            <tr key={item.writeOffId} className="hover:bg-slate-50 transition-colors">
              <td className="px-5 py-4 font-mono font-semibold text-[#00687a] text-xs">{item.writeOffCode}</td>
              <td className="px-5 py-4">
                <p className="font-semibold text-slate-900">{item.skuName}</p>
                <p className="text-xs text-slate-400">{item.skuCode}</p>
              </td>
              <td className="px-5 py-4">
                <p className="font-semibold">{item.binCode || '—'}</p>
                <p className="text-xs text-slate-400">{item.zoneName || ''}</p>
              </td>
              <td className="px-5 py-4 text-center">
                <span className="inline-flex items-center justify-center bg-red-50 text-red-700 font-bold px-3 py-1 rounded-full text-sm">
                  -{item.quantity}
                </span>
              </td>
              <td className="px-5 py-4 max-w-[180px]">
                <p className="text-slate-700 text-xs line-clamp-2">{item.reason || '—'}</p>
              </td>
              <td className="px-5 py-4 text-center"><StatusBadge status={item.status} /></td>
              <td className="px-5 py-4 text-slate-600 text-sm">{item.createdByName || 'N/A'}</td>
              <td className="px-5 py-4 text-slate-500 text-xs">
                {item.createdAt ? new Date(item.createdAt).toLocaleString('vi-VN') : '—'}
              </td>
              {isAdmin && (
                <td className="px-5 py-4 text-center">
                  {item.status === 'PENDING' ? (
                    <button
                      onClick={() => onApprove?.(item)}
                      className="bg-[#00687a] hover:bg-[#005161] text-white px-4 py-1.5 rounded-lg text-xs font-semibold transition"
                    >
                      Xử lý
                    </button>
                  ) : (
                    <span className="text-xs text-slate-400">
                      {item.approvedByName ? `Bởi ${item.approvedByName}` : '—'}
                    </span>
                  )}
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

// ============================================================
// MAIN COMPONENT
// ============================================================
const StockWriteOff = () => {
  // Lấy role từ localStorage
  const userStr = localStorage.getItem('user')
  const userRole: string = userStr ? (JSON.parse(userStr).role ?? '') : ''
  const isAdmin = userRole === 'ADMIN'

  // Tab state: 'create' | 'my' | 'approve'
  const [activeTab, setActiveTab] = useState<'create' | 'my' | 'approve'>('create')

  // Layout tree
  const [zones, setZones] = useState<Zone[]>([])

  // Form state
  const [sourceZoneId, setSourceZoneId] = useState<number | ''>('')
  const [sourceBinId, setSourceBinId] = useState<number | ''>('')
  const [binInventories, setBinInventories] = useState<SkuInventory[]>([])
  const [skuId, setSkuId] = useState<number | ''>('')
  const [maxQty, setMaxQty] = useState(0)
  const [quantity, setQuantity] = useState<number | ''>('')
  const [reason, setReason] = useState('')
  const [customNote, setCustomNote] = useState('')
  const [sourceBins, setSourceBins] = useState<Bin[]>([])

  // Data
  const [myWriteOffs, setMyWriteOffs] = useState<WriteOff[]>([])
  const [allWriteOffs, setAllWriteOffs] = useState<WriteOff[]>([])
  const [pendingCount, setPendingCount] = useState(0)

  // UI state
  const [submitting, setSubmitting] = useState(false)
  const [msg, setMsg] = useState({ type: '', text: '' })
  const [confirmItem, setConfirmItem] = useState<WriteOff | null>(null)

  useEffect(() => {
    fetchLayout()
    fetchMyWriteOffs()
    if (isAdmin) fetchAllWriteOffs()
  }, [])

  const fetchLayout = async () => {
    try {
      const res = await api.get('/admin/warehouse-layout/tree')
      if (res.data?.length > 0) {
        const allZones = res.data.flatMap((wh: any) => wh.zones || [])
        setZones(allZones)
      }
    } catch { /* ignore */ }
  }

  const fetchMyWriteOffs = async () => {
    try {
      const res = await api.get('/stock-writeoff/my')
      setMyWriteOffs(res.data)
    } catch { /* ignore */ }
  }

  const fetchAllWriteOffs = async () => {
    try {
      const res = await api.get('/stock-writeoff')
      setAllWriteOffs(res.data)
      setPendingCount(res.data.filter((w: WriteOff) => w.status === 'PENDING').length)
    } catch { /* ignore */ }
  }

  const handleZoneChange = (zoneId: number) => {
    setSourceZoneId(zoneId)
    setSourceBinId('')
    setSkuId('')
    setBinInventories([])
    const zone = zones.find(z => z.zoneId === zoneId)
    setSourceBins(zone ? zone.shelves.flatMap(s => s.bins) : [])
  }

  const handleBinChange = async (binId: number) => {
    setSourceBinId(binId)
    setSkuId('')
    setBinInventories([])
    if (!binId) return
    try {
      const res = await api.get(`/stock-transfer/bins/${binId}/inventory`)
      setBinInventories(res.data)
    } catch { /* ignore */ }
  }

  const handleSkuChange = (sid: number) => {
    setSkuId(sid)
    const inv = binInventories.find(i => i.skuId === sid)
    setMaxQty(inv?.quantity ?? 0)
    setQuantity('')
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!sourceBinId || !skuId || !quantity || !reason) {
      setMsg({ type: 'error', text: 'Vui lòng điền đầy đủ thông tin.' })
      return
    }
    if (Number(quantity) > maxQty) {
      setMsg({ type: 'error', text: `Số lượng thanh lý (${quantity}) vượt quá tồn kho thực tế (${maxQty}).` })
      return
    }
    const fullReason = reason === 'Lý do khác' && customNote
      ? `Lý do khác: ${customNote}`
      : reason

    setSubmitting(true)
    setMsg({ type: '', text: '' })
    try {
      await api.post('/stock-writeoff', {
        skuId: Number(skuId),
        binId: Number(sourceBinId),
        quantity: Number(quantity),
        reason: fullReason
      })
      setMsg({ type: 'success', text: 'Tạo phiếu thanh lý thành công! Đang chờ Admin phê duyệt.' })
      // Reset form
      setSourceZoneId(''); setSourceBinId(''); setSkuId('')
      setQuantity(''); setReason(''); setCustomNote(''); setBinInventories([])
      fetchMyWriteOffs()
    } catch (err: any) {
      setMsg({ type: 'error', text: err.response?.data?.message || 'Có lỗi xảy ra.' })
    } finally {
      setSubmitting(false)
    }
  }

  const handleApproveConfirm = async (approved: boolean, note: string) => {
    if (!confirmItem) return
    try {
      await api.put(`/stock-writeoff/${confirmItem.writeOffId}/approve`, {
        approved,
        rejectionNote: note || null
      })
      setMsg({
        type: 'success',
        text: approved
          ? `✅ Đã phê duyệt phiếu ${confirmItem.writeOffCode}. Tồn kho đã được giảm.`
          : `❌ Đã từ chối phiếu ${confirmItem.writeOffCode}.`
      })
      setConfirmItem(null)
      fetchAllWriteOffs()
      fetchMyWriteOffs()
    } catch (err: any) {
      setMsg({ type: 'error', text: err.response?.data?.message || 'Lỗi khi xử lý phiếu.' })
      setConfirmItem(null)
    }
  }

  const tabs = [
    { key: 'create', label: 'Tạo phiếu mới', icon: 'add_circle' },
    { key: 'my', label: 'Lịch sử của tôi', icon: 'history' },
    ...(isAdmin ? [{ key: 'approve', label: `Duyệt phiếu${pendingCount > 0 ? ` (${pendingCount})` : ''}`, icon: 'gavel' }] : [])
  ] as const

  return (
    <div className="min-h-screen bg-[#f7f9fb] text-[#191c1e] antialiased">
      <Sidebar />
      <main className="ml-[280px] min-h-screen">
        {/* Header */}
        <header className="h-20 bg-white/80 backdrop-blur-md fixed top-0 right-0 w-[calc(100%-280px)] z-40 px-8 flex items-center justify-between border-b border-slate-200">
          <div className="flex items-center gap-3">
            <span className="material-symbols-outlined text-red-500 text-3xl">delete_sweep</span>
            <div>
              <h2 className="text-xl font-bold text-slate-900">Xử lý hàng hỏng & Thanh lý</h2>
              <p className="text-xs text-slate-500">Stock Write-off (UC010)</p>
            </div>
          </div>
        </header>

        <div className="pt-24 p-8 space-y-6">
          {/* Alert message */}
          {msg.text && (
            <div className={`p-4 rounded-xl flex items-start gap-3 ${msg.type === 'success' ? 'bg-green-50 text-green-800 border border-green-200' : 'bg-red-50 text-red-800 border border-red-200'}`}>
              <span className="material-symbols-outlined mt-0.5">{msg.type === 'success' ? 'check_circle' : 'error'}</span>
              <p className="font-medium">{msg.text}</p>
              <button onClick={() => setMsg({ type: '', text: '' })} className="ml-auto opacity-60 hover:opacity-100">
                <span className="material-symbols-outlined text-sm">close</span>
              </button>
            </div>
          )}

          {/* Tabs */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="flex border-b border-slate-200">
              {tabs.map(tab => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key as any)}
                  className={`flex items-center gap-2 px-6 py-4 text-sm font-semibold transition-colors border-b-2 ${
                    activeTab === tab.key
                      ? 'border-[#00687a] text-[#00687a] bg-teal-50/50'
                      : 'border-transparent text-slate-500 hover:text-slate-800 hover:bg-slate-50'
                  }`}
                >
                  <span className="material-symbols-outlined text-base">{tab.icon}</span>
                  {tab.label}
                </button>
              ))}
            </div>

            {/* ===== TAB 1: TẠO PHIẾU ===== */}
            {activeTab === 'create' && (
              <form onSubmit={handleSubmit} className="p-6 space-y-6">
                <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex gap-3">
                  <span className="material-symbols-outlined text-amber-600 mt-0.5">warning</span>
                  <div className="text-sm text-amber-800">
                    <p className="font-bold">Lưu ý quan trọng</p>
                    <p>Phiếu thanh lý sau khi được Admin phê duyệt sẽ <strong>giảm vĩnh viễn</strong> số lượng tồn kho. Hãy kiểm tra kỹ thông tin trước khi gửi.</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Cột trái: Chọn hàng hóa */}
                  <div className="space-y-4 bg-slate-50 rounded-xl p-5 border border-slate-100">
                    <h4 className="font-bold text-slate-700 flex items-center gap-2">
                      <span className="material-symbols-outlined text-[#00687a]">inventory_2</span>
                      Thông tin hàng hóa
                    </h4>

                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Zone (Khu vực)</label>
                      <select
                        className="w-full bg-white border border-slate-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-[#00687a]"
                        value={sourceZoneId}
                        onChange={e => handleZoneChange(Number(e.target.value))}
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
                        className="w-full bg-white border border-slate-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-[#00687a]"
                        value={sourceBinId}
                        onChange={e => handleBinChange(Number(e.target.value))}
                        disabled={!sourceZoneId}
                      >
                        <option value="">-- Chọn Bin --</option>
                        {sourceBins.map(b => (
                          <option key={b.binId} value={b.binId}>{b.binCode}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Mặt hàng (SKU)</label>
                      <select
                        className="w-full bg-white border border-slate-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-[#00687a]"
                        value={skuId}
                        onChange={e => handleSkuChange(Number(e.target.value))}
                        disabled={!sourceBinId || binInventories.length === 0}
                      >
                        <option value="">-- Chọn SKU --</option>
                        {binInventories.map(inv => (
                          <option key={inv.skuId} value={inv.skuId}>
                            {inv.skuCode} – {inv.skuName} (Tồn: {inv.quantity})
                          </option>
                        ))}
                      </select>
                      {sourceBinId && binInventories.length === 0 && (
                        <p className="text-xs text-amber-600 mt-1">Bin này không có hàng hóa.</p>
                      )}
                    </div>

                    {skuId && (
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">
                          Số lượng thanh lý <span className="text-slate-400">(tối đa: {maxQty})</span>
                        </label>
                        <input
                          type="number" min={1} max={maxQty}
                          className="w-full bg-white border border-slate-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-red-500"
                          value={quantity}
                          onChange={e => setQuantity(e.target.value ? Number(e.target.value) : '')}
                          placeholder={`Nhập số lượng (1 - ${maxQty})`}
                        />
                        {quantity && Number(quantity) > maxQty && (
                          <p className="text-xs text-red-500 mt-1">Vượt quá tồn kho!</p>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Cột phải: Lý do */}
                  <div className="space-y-4 bg-slate-50 rounded-xl p-5 border border-slate-100">
                    <h4 className="font-bold text-slate-700 flex items-center gap-2">
                      <span className="material-symbols-outlined text-red-500">report_problem</span>
                      Lý do thanh lý
                    </h4>

                    <div className="space-y-2">
                      {REASON_OPTIONS.map(opt => (
                        <label key={opt} className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer border-2 transition ${reason === opt ? 'border-[#00687a] bg-teal-50' : 'border-slate-200 bg-white hover:border-slate-300'}`}>
                          <input
                            type="radio" name="reason" value={opt}
                            checked={reason === opt}
                            onChange={() => setReason(opt)}
                            className="accent-[#00687a]"
                          />
                          <span className="text-sm font-medium text-slate-700">{opt}</span>
                        </label>
                      ))}
                    </div>

                    {reason === 'Lý do khác' && (
                      <textarea
                        className="w-full border border-slate-300 rounded-lg px-4 py-3 text-sm focus:ring-2 focus:ring-[#00687a]"
                        rows={3}
                        placeholder="Mô tả chi tiết lý do..."
                        value={customNote}
                        onChange={e => setCustomNote(e.target.value)}
                      />
                    )}

                    {/* Tóm tắt */}
                    {skuId && sourceBinId && quantity && reason && (
                      <div className="mt-4 bg-red-50 border border-red-200 rounded-xl p-4 space-y-1 text-sm">
                        <p className="font-bold text-red-700 flex items-center gap-1">
                          <span className="material-symbols-outlined text-sm">summarize</span>
                          Tóm tắt phiếu
                        </p>
                        <p className="text-slate-700">Thanh lý <strong className="text-red-700">{quantity}</strong> đơn vị
                          {' '}<strong>{binInventories.find(i => i.skuId === Number(skuId))?.skuName}</strong>
                          {' '}tại Bin <strong>{sourceBins.find(b => b.binId === Number(sourceBinId))?.binCode}</strong>
                        </p>
                        <p className="text-slate-500">Lý do: {reason === 'Lý do khác' ? customNote || '(chưa nhập)' : reason}</p>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex justify-end pt-2 border-t border-slate-200">
                  <button
                    type="submit"
                    disabled={submitting || !skuId || !quantity || !reason}
                    className="bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white px-8 py-3 rounded-xl font-bold flex items-center gap-2 transition"
                  >
                    <span className="material-symbols-outlined">send</span>
                    {submitting ? 'Đang gửi...' : 'Gửi phiếu thanh lý'}
                  </button>
                </div>
              </form>
            )}

            {/* ===== TAB 2: LỊCH SỬ CỦA TÔI ===== */}
            {activeTab === 'my' && (
              <div>
                <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
                  <p className="text-sm text-slate-500">Danh sách phiếu thanh lý bạn đã tạo</p>
                  <button onClick={fetchMyWriteOffs} className="flex items-center gap-1 text-sm text-slate-500 hover:text-[#00687a] font-medium">
                    <span className="material-symbols-outlined text-sm">refresh</span> Làm mới
                  </button>
                </div>
                <WriteOffTable data={myWriteOffs} isAdmin={false} />
              </div>
            )}

            {/* ===== TAB 3: DUYỆT PHIẾU (ADMIN ONLY) ===== */}
            {activeTab === 'approve' && isAdmin && (
              <div>
                <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
                  <p className="text-sm text-slate-500">
                    Phiếu đang chờ duyệt: <strong className="text-[#00687a]">{pendingCount}</strong>
                  </p>
                  <button onClick={fetchAllWriteOffs} className="flex items-center gap-1 text-sm text-slate-500 hover:text-[#00687a] font-medium">
                    <span className="material-symbols-outlined text-sm">refresh</span> Làm mới
                  </button>
                </div>
                <WriteOffTable
                  data={allWriteOffs}
                  isAdmin={true}
                  onApprove={item => setConfirmItem(item)}
                />
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Confirm Modal */}
      <ConfirmModal
        item={confirmItem}
        onConfirm={handleApproveConfirm}
        onCancel={() => setConfirmItem(null)}
      />
    </div>
  )
}

export default StockWriteOff
