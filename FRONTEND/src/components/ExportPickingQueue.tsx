import type { OutboundOrder, OutboundLineItem } from '../features/warehouse/ExportGoods'

type Props = {
  outboundDetail: OutboundOrder
  loadingDetail: boolean
  onPickLine: (lineId: number, requiredQty: number) => void
  onPickAll: () => void
  pickingLineId: number | null
  pickingAll: boolean
  pickedCount: number
  totalCount: number
  canPick: boolean
  isReadOnly: boolean
}

const PICKING_STATUS_STYLE: Record<string, string> = {
  COMPLETED: 'bg-emerald-100 text-emerald-700',
  PICKING: 'bg-blue-100 text-blue-700',
  PENDING: 'bg-amber-100 text-amber-700',
}

const PICKING_STATUS_LABEL: Record<string, string> = {
  COMPLETED: 'Đã gom',
  PICKING: 'Đang gom',
  PENDING: 'Chờ gom',
}

const ExportPickingQueue = ({
  outboundDetail,
  loadingDetail,
  onPickLine,
  onPickAll,
  pickingLineId,
  pickingAll,
  pickedCount,
  totalCount,
  canPick,
  isReadOnly,
}: Props) => {
  const lines: OutboundLineItem[] = outboundDetail.outboundLines

  const allPicked = totalCount > 0 && pickedCount === totalCount
  const pendingCount = totalCount - pickedCount

  return (
    <div className="glass-card rounded-3xl border border-slate-200/70 bg-white/90 shadow-xl shadow-slate-900/5 overflow-hidden">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200/70 bg-white/80 px-6 py-5">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
            <span className="material-symbols-outlined">checklist</span>
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-900">Danh sách gom hàng</h2>
            <p className="text-xs text-slate-500">{outboundDetail.outboundCode}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-sm text-slate-500">
            Đã gom:{' '}
            <span className={`font-bold ${allPicked ? 'text-emerald-600' : 'text-blue-600'}`}>
              {pickedCount} / {totalCount}
            </span>
          </div>
          {canPick && !allPicked && (
            <button
              id="btn-pick-all"
              onClick={onPickAll}
              disabled={pickingAll || loadingDetail}
              className="inline-flex items-center gap-1.5 rounded-xl bg-blue-600 px-4 py-2 text-sm font-bold text-white transition hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span className="material-symbols-outlined text-base">
                {pickingAll ? 'autorenew' : 'done_all'}
              </span>
              {pickingAll ? `Đang gom (${pendingCount} còn lại)...` : 'Gom Tất Cả'}
            </button>
          )}
          {isReadOnly && (
            <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-500">
              <span className="material-symbols-outlined text-base">lock</span>
              Chỉ xem
            </span>
          )}
        </div>
      </div>

      {/* Table */}
      {loadingDetail ? (
        <div className="flex items-center justify-center py-16 text-slate-400">
          <span className="material-symbols-outlined animate-spin mr-2">autorenew</span>
          Đang tải...
        </div>
      ) : lines.length === 0 ? (
        <div className="py-16 text-center text-sm text-slate-400">
          Không có dòng hàng nào trong lệnh xuất này.
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm text-slate-700">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50">
                <th className="px-5 py-3 font-semibold uppercase tracking-wider text-xs text-slate-500">
                  SKU
                </th>
                <th className="px-5 py-3 font-semibold uppercase tracking-wider text-xs text-slate-500">
                  Tên sản phẩm
                </th>
                <th className="px-5 py-3 font-semibold uppercase tracking-wider text-xs text-slate-500 text-center">
                  Cần / Đã gom
                </th>
                <th className="px-5 py-3 font-semibold uppercase tracking-wider text-xs text-slate-500">
                  Bin / Zone
                </th>
                <th className="px-5 py-3 font-semibold uppercase tracking-wider text-xs text-slate-500">
                  Trạng thái
                </th>
                {canPick && (
                  <th className="px-5 py-3 font-semibold uppercase tracking-wider text-xs text-slate-500 text-right">
                    Hành động
                  </th>
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {lines.map((line) => {
                const isBeingPicked = pickingLineId === line.lineId || pickingAll
                const isPending = line.pickingStatus !== 'COMPLETED'
                const styleClass = PICKING_STATUS_STYLE[line.pickingStatus] ?? 'bg-slate-100 text-slate-600'
                const statusLabel = PICKING_STATUS_LABEL[line.pickingStatus] ?? line.pickingStatus

                return (
                  <tr
                    key={line.lineId}
                    className={`transition-colors ${
                      line.pickingStatus === 'COMPLETED' ? 'bg-emerald-50/30' : 'bg-white hover:bg-slate-50'
                    }`}
                  >
                    <td className="px-5 py-4 font-semibold text-slate-900 whitespace-nowrap">
                      {line.skuCode}
                    </td>
                    <td className="px-5 py-4 text-slate-700 max-w-[200px] truncate" title={line.skuName}>
                      {line.skuName}
                    </td>
                    <td className="px-5 py-4 text-center">
                      <span className={`font-bold ${line.pickedQty >= line.requiredQty ? 'text-emerald-600' : 'text-slate-900'}`}>
                        {line.requiredQty}
                      </span>
                      <span className="text-slate-400"> / </span>
                      <span className="font-semibold text-blue-600">{line.pickedQty}</span>
                    </td>
                    <td className="px-5 py-4">
                      <div className="text-slate-900 font-medium">{line.binCode || '—'}</div>
                      {line.zoneName && (
                        <div className="text-xs text-slate-400">{line.zoneName}</div>
                      )}
                    </td>
                    <td className="px-5 py-4">
                      <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold ${styleClass}`}>
                        <span className="material-symbols-outlined text-[12px]">
                          {line.pickingStatus === 'COMPLETED' ? 'check_circle' : 'schedule'}
                        </span>
                        {statusLabel}
                      </span>
                    </td>
                    {canPick && (
                      <td className="px-5 py-4 text-right">
                        {isPending ? (
                          <button
                            id={`btn-pick-line-${line.lineId}`}
                            onClick={() => onPickLine(line.lineId, line.requiredQty)}
                            disabled={isBeingPicked}
                            className="inline-flex items-center gap-1.5 rounded-xl bg-blue-600 px-4 py-2 text-xs font-bold text-white transition hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            <span className="material-symbols-outlined text-[14px]">
                              {pickingLineId === line.lineId ? 'autorenew' : 'add_task'}
                            </span>
                            {pickingLineId === line.lineId ? 'Đang gom...' : 'Gom'}
                          </button>
                        ) : (
                          <span className="material-symbols-outlined text-emerald-500">check_circle</span>
                        )}
                      </td>
                    )}
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Progress bar */}
      {totalCount > 0 && (
        <div className="border-t border-slate-200/70 bg-white/60 px-6 py-4">
          <div className="flex items-center justify-between text-xs text-slate-500 mb-2">
            <span>Tiến độ gom hàng</span>
            <span className="font-bold">{Math.round((pickedCount / totalCount) * 100)}%</span>
          </div>
          <div className="h-2 rounded-full bg-slate-200 overflow-hidden">
            <div
              className="h-full rounded-full bg-emerald-500 transition-all duration-500"
              style={{ width: `${(pickedCount / totalCount) * 100}%` }}
            />
          </div>
        </div>
      )}
    </div>
  )
}

export default ExportPickingQueue
