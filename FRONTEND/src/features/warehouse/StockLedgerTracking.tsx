import { useState, useEffect } from 'react'
import Sidebar from '../../components/Sidebar'
import api from '../../lib/api'

type LedgerRecord = {
  ledgerId: number
  skuId: number
  skuCode: string
  skuName: string
  binId: number | null
  binCode: string | null
  zoneName: string | null
  txnType: string
  qty: number
  qtyBefore: number
  qtyAfter: number
  refType: string | null
  refId: number | null
  note: string | null
  createdByName: string | null
  createdAt: string
}

type LedgerSummary = {
  skuId: number
  skuCode: string
  skuName: string
  totalInbound: number
  totalOutbound: number
  totalTransferIn: number
  totalTransferOut: number
  totalWriteOff: number
  totalStocktakeAdj: number
  currentStock: number
  totalTransactions: number
}

// TxnTypes that REDUCE inventory (show as negative / red)
const NEGATIVE_TXN_TYPES = new Set(['OUTBOUND', 'TRANSFER_OUT', 'WRITE_OFF', 'WRITEOFF'])

const TXN_TYPES = [
  { value: 'INBOUND',      label: 'Nhập kho',    color: 'text-emerald-700', bg: 'bg-emerald-100', icon: 'login' },
  { value: 'OUTBOUND',     label: 'Xuất kho',    color: 'text-red-700',     bg: 'bg-red-100',     icon: 'logout' },
  { value: 'TRANSFER_IN',  label: 'Chuyển vào',  color: 'text-blue-700',   bg: 'bg-blue-100',   icon: 'move_down' },
  { value: 'TRANSFER_OUT', label: 'Chuyển đi',   color: 'text-sky-700',    bg: 'bg-sky-100',    icon: 'move_up' },
  { value: 'WRITE_OFF',    label: 'Thanh lý',    color: 'text-orange-700', bg: 'bg-orange-100', icon: 'delete_sweep' },
  { value: 'WRITEOFF',     label: 'Thanh lý',    color: 'text-orange-700', bg: 'bg-orange-100', icon: 'delete_sweep' },
  { value: 'STOCKTAKE',    label: 'Kiểm kê',     color: 'text-purple-700', bg: 'bg-purple-100', icon: 'checklist' },
  { value: 'ADJUSTMENT',   label: 'Điều chỉnh',  color: 'text-slate-700',  bg: 'bg-slate-100',  icon: 'edit_note' },
]

const getTxnStyle = (type: string) =>
  TXN_TYPES.find(t => t.value === type) ?? { label: type, color: 'text-gray-700', bg: 'bg-gray-100', icon: 'sync' }

/** Returns display sign prefix and Tailwind color class based on transaction type */
const getQtyDisplay = (qty: number, txnType: string) => {
  const isNeg = NEGATIVE_TXN_TYPES.has(txnType)
  const absQty = Math.abs(qty)
  return {
    text:  isNeg ? `-${absQty}` : `+${absQty}`,
    color: isNeg ? 'text-red-600' : 'text-emerald-600',
  }
}

const StockLedgerTracking = () => {
  const [skus, setSkus] = useState<any[]>([])
  const [skuId, setSkuId] = useState<number | ''>('')
  const [txnType, setTxnType] = useState<string>('')
  const [fromDate, setFromDate] = useState<string>('')
  const [toDate, setToDate] = useState<string>('')

  const [ledgers, setLedgers] = useState<LedgerRecord[]>([])
  const [summary, setSummary] = useState<LedgerSummary | null>(null)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalCount, setTotalCount] = useState(0)
  
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    fetchSkus()
  }, [])

  useEffect(() => {
    fetchLedgers()
    if (skuId) {
      fetchSummary()
    } else {
      setSummary(null)
    }
  }, [skuId, txnType, fromDate, toDate, page])

  const fetchSkus = async () => {
    try {
      const res = await api.get('/stock-ledger/sku-list')
      setSkus(res.data)
    } catch (err) {
      console.error(err)
    }
  }

  const fetchLedgers = async () => {
    setIsLoading(true)
    try {
      const params = new URLSearchParams()
      if (skuId) params.append('skuId', skuId.toString())
      if (txnType) params.append('txnType', txnType)
      if (fromDate) params.append('fromDate', fromDate)
      if (toDate) params.append('toDate', toDate)
      params.append('page', page.toString())
      params.append('pageSize', '20')

      const res = await api.get(`/stock-ledger?${params.toString()}`)
      setLedgers(res.data.data)
      setTotalPages(res.data.totalPages)
      setTotalCount(res.data.totalCount)
    } catch (err) {
      console.error(err)
    } finally {
      setIsLoading(false)
    }
  }

  const fetchSummary = async () => {
    if (!skuId) return
    try {
      const res = await api.get(`/stock-ledger/summary?skuId=${skuId}`)
      setSummary(res.data)
    } catch (err) {
      console.error(err)
      setSummary(null)
    }
  }

  const handleExport = () => {
    // Basic CSV export
    if (ledgers.length === 0) return
    const headers = ['Mã Giao Dịch', 'Thời Gian', 'SKU', 'Loại Giao Dịch', 'Bin', 'Tồn Trước', 'Số Lượng', 'Tồn Sau', 'Chứng Từ', 'Ghi Chú', 'Người Tạo']
    const csvData = ledgers.map(l => [
      l.ledgerId,
      new Date(l.createdAt).toLocaleString('vi-VN'),
      l.skuCode,
      getTxnStyle(l.txnType).label,
      l.binCode || '',
      l.qtyBefore,
      l.qty,
      l.qtyAfter,
      `${l.refType || ''} ${l.refId || ''}`,
      l.note || '',
      l.createdByName || ''
    ])
    
    const csvContent = "data:text/csv;charset=utf-8,\uFEFF" 
      + [headers, ...csvData].map(e => e.join(",")).join("\n");
      
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `StockLedger_${new Date().getTime()}.csv`);
    document.body.appendChild(link);
    link.click();
    link.remove();
  }

  return (
    <div className="min-h-screen bg-[#f7f9fb] text-[#191c1e] antialiased">
      <Sidebar />
      <main className="ml-[280px] min-h-screen">
        <header className="h-20 bg-white/80 backdrop-blur-md fixed top-0 right-0 w-[calc(100%-280px)] z-40 px-8 flex justify-between items-center border-b border-slate-200 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center text-blue-600">
              <span className="material-symbols-outlined font-bold">receipt_long</span>
            </div>
            <div>
              <h2 className="text-xl font-black text-slate-800">Thẻ Kho (Stock Ledger)</h2>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Truy vết biến động tồn kho</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button 
              onClick={handleExport}
              disabled={ledgers.length === 0}
              className="px-4 py-2 bg-white border border-slate-300 text-slate-700 rounded-lg font-semibold hover:bg-slate-50 transition-colors flex items-center gap-2 shadow-sm disabled:opacity-50"
            >
              <span className="material-symbols-outlined text-[20px]">download</span>
              Xuất CSV
            </button>
          </div>
        </header>

        <div className="pt-28 p-8 space-y-6 max-w-7xl mx-auto">
          {/* FILTER BAR */}
          <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200 flex flex-wrap gap-4 items-end">
            <div className="flex-1 min-w-[200px]">
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Sản phẩm (SKU)</label>
              <select 
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-blue-500 font-medium"
                value={skuId}
                onChange={e => { setSkuId(e.target.value ? Number(e.target.value) : ''); setPage(1); }}
              >
                <option value="">Tất cả sản phẩm</option>
                {skus.map(s => (
                  <option key={s.skuid} value={s.skuid}>{s.skucode} - {s.productName}</option>
                ))}
              </select>
            </div>
            <div className="w-48">
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Loại giao dịch</label>
              <select 
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-blue-500 font-medium"
                value={txnType}
                onChange={e => { setTxnType(e.target.value); setPage(1); }}
              >
                <option value="">Tất cả</option>
                <option value="INBOUND">Nhập kho</option>
                <option value="OUTBOUND">Xuất kho</option>
                <option value="TRANSFER_IN">Chuyển vào</option>
                <option value="TRANSFER_OUT">Chuyển ra</option>
                <option value="WRITE_OFF">Thanh lý (WRITE_OFF)</option>
                <option value="WRITEOFF">Thanh lý (WRITEOFF)</option>
                <option value="STOCKTAKE">Kiểm kê</option>
                <option value="ADJUSTMENT">Điều chỉnh</option>
              </select>
            </div>
            <div className="w-40">
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Từ ngày</label>
              <input 
                type="date"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-blue-500 font-medium"
                value={fromDate}
                onChange={e => { setFromDate(e.target.value); setPage(1); }}
              />
            </div>
            <div className="w-40">
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Đến ngày</label>
              <input 
                type="date"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-blue-500 font-medium"
                value={toDate}
                onChange={e => { setToDate(e.target.value); setPage(1); }}
              />
            </div>
            <button 
              onClick={() => {
                setSkuId('');
                setTxnType('');
                setFromDate('');
                setToDate('');
                setPage(1);
              }}
              className="px-4 py-2.5 text-slate-500 hover:text-slate-800 font-semibold transition-colors"
            >
              Xóa bộ lọc
            </button>
          </div>

          {/* SUMMARY CARDS */}
          {summary && (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200 flex items-center gap-4 border-l-4 border-l-emerald-500">
                <div className="w-12 h-12 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-600">
                  <span className="material-symbols-outlined">login</span>
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Tổng Nhập</p>
                  <p className="text-2xl font-black text-slate-800">{summary.totalInbound}</p>
                </div>
              </div>
              <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200 flex items-center gap-4 border-l-4 border-l-red-500">
                <div className="w-12 h-12 rounded-full bg-red-50 flex items-center justify-center text-red-600">
                  <span className="material-symbols-outlined">logout</span>
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Tổng Xuất</p>
                  <p className="text-2xl font-black text-slate-800">{summary.totalOutbound}</p>
                </div>
              </div>
              <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200 flex items-center gap-4 border-l-4 border-l-orange-500">
                <div className="w-12 h-12 rounded-full bg-orange-50 flex items-center justify-center text-orange-600">
                  <span className="material-symbols-outlined">delete_sweep</span>
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Thanh Lý / Hủy</p>
                  <p className="text-2xl font-black text-slate-800">{summary.totalWriteOff}</p>
                </div>
              </div>
              <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200 flex items-center gap-4 border-l-4 border-l-blue-500">
                <div className="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center text-blue-600">
                  <span className="material-symbols-outlined">inventory_2</span>
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Tồn Kho Hiện Tại</p>
                  <p className="text-2xl font-black text-slate-800">{summary.currentStock}</p>
                </div>
              </div>
            </div>
          )}

          {/* DATA TABLE */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-slate-600">
                    <th className="px-6 py-4 font-bold uppercase tracking-wider text-xs">Thời Gian</th>
                    <th className="px-6 py-4 font-bold uppercase tracking-wider text-xs">SKU</th>
                    <th className="px-6 py-4 font-bold uppercase tracking-wider text-xs">Giao Dịch</th>
                    <th className="px-6 py-4 font-bold uppercase tracking-wider text-xs">Vị Trí</th>
                    <th className="px-6 py-4 font-bold uppercase tracking-wider text-xs text-right">SL Trước</th>
                    <th className="px-6 py-4 font-bold uppercase tracking-wider text-xs text-right">Biến Động</th>
                    <th className="px-6 py-4 font-bold uppercase tracking-wider text-xs text-right">SL Sau</th>
                    <th className="px-6 py-4 font-bold uppercase tracking-wider text-xs">Chứng Từ / Ghi Chú</th>
                    <th className="px-6 py-4 font-bold uppercase tracking-wider text-xs">Người Tạo</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {isLoading ? (
                    <tr>
                      <td colSpan={9} className="px-6 py-12 text-center text-slate-500">
                        <div className="flex flex-col items-center justify-center gap-3">
                          <span className="material-symbols-outlined animate-spin text-4xl text-blue-500">sync</span>
                          <span className="font-medium">Đang tải dữ liệu...</span>
                        </div>
                      </td>
                    </tr>
                  ) : ledgers.length === 0 ? (
                    <tr>
                      <td colSpan={9} className="px-6 py-12 text-center text-slate-500">
                        <div className="flex flex-col items-center justify-center gap-3">
                          <span className="material-symbols-outlined text-4xl text-slate-300">inventory_2</span>
                          <span className="font-medium">Không tìm thấy giao dịch nào.</span>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    ledgers.map(l => {
                      const style = getTxnStyle(l.txnType)
                      return (
                        <tr key={l.ledgerId} className="hover:bg-slate-50/80 transition-colors group">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="font-medium text-slate-800">{new Date(l.createdAt).toLocaleDateString('vi-VN')}</div>
                            <div className="text-xs text-slate-500">{new Date(l.createdAt).toLocaleTimeString('vi-VN')}</div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="font-bold text-slate-800">{l.skuCode}</div>
                            <div className="text-xs text-slate-500 truncate max-w-[150px]" title={l.skuName}>{l.skuName}</div>
                          </td>
                          <td className="px-6 py-4">
                            <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold ${style.bg} ${style.color}`}>
                              <span className="material-symbols-outlined text-[14px]">{style.icon}</span>
                              {style.label}
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="font-medium text-slate-800">{l.binCode || '-'}</div>
                            <div className="text-xs text-slate-500">{l.zoneName || ''}</div>
                          </td>
                          <td className="px-6 py-4 text-right font-medium text-slate-600">
                            {l.qtyBefore}
                          </td>
                          <td className="px-6 py-4 text-right">
                            {(() => {
                              const { text, color } = getQtyDisplay(l.qty, l.txnType)
                              return <span className={`font-black ${color}`}>{text}</span>
                            })()}
                          </td>
                          <td className="px-6 py-4 text-right font-black text-slate-800">
                            {l.qtyAfter}
                          </td>
                          <td className="px-6 py-4">
                            <div className="font-medium text-slate-700">
                              {l.refType} {l.refId ? `#${l.refId}` : ''}
                            </div>
                            <div className="text-xs text-slate-500 max-w-[200px] truncate" title={l.note || ''}>
                              {l.note}
                            </div>
                          </td>
                          <td className="px-6 py-4 text-slate-600 text-sm">
                            {l.createdByName || <span className="text-slate-400">—</span>}
                          </td>
                        </tr>
                      )
                    })
                  )}
                </tbody>
              </table>
            </div>

            {/* PAGINATION */}
            {!isLoading && totalPages > 1 && (
              <div className="px-6 py-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between">
                <span className="text-sm font-medium text-slate-500">
                  Hiển thị trang <span className="text-slate-800 font-bold">{page}</span> / <span className="text-slate-800 font-bold">{totalPages}</span> (Tổng số {totalCount} giao dịch)
                </span>
                <div className="flex items-center gap-2">
                  <button 
                    disabled={page === 1}
                    onClick={() => setPage(p => p - 1)}
                    className="p-1.5 rounded-lg border border-slate-300 bg-white text-slate-600 hover:bg-slate-50 disabled:opacity-50 transition-colors"
                  >
                    <span className="material-symbols-outlined text-sm">chevron_left</span>
                  </button>
                  <button 
                    disabled={page === totalPages}
                    onClick={() => setPage(p => p + 1)}
                    className="p-1.5 rounded-lg border border-slate-300 bg-white text-slate-600 hover:bg-slate-50 disabled:opacity-50 transition-colors"
                  >
                    <span className="material-symbols-outlined text-sm">chevron_right</span>
                  </button>
                </div>
              </div>
            )}
          </div>

        </div>
      </main>
    </div>
  )
}

export default StockLedgerTracking
