import type { EligibleServiceOrder, OutboundOrder } from '../features/warehouse/ExportGoods'

type Props = {
  eligibleOrders: EligibleServiceOrder[]
  selectedEligibleId: number | null
  onSelectEligible: (id: number) => void
  onCreateOutbound: () => void
  creating: boolean
  loadingEligible: boolean
  activeOutbounds: OutboundOrder[]
  selectedOutboundId: number | null
  onSelectOutbound: (id: number | null) => void
  loadingOutbounds: boolean
  outboundDetail: OutboundOrder | null
  loadingDetail: boolean
}

const STATUS_LABELS: Record<string, { label: string; color: string }> = {
  PENDING: { label: 'Chờ gom hàng', color: 'bg-amber-100 text-amber-700' },
  PICKING: { label: 'Đang gom hàng', color: 'bg-blue-100 text-blue-700' },
  PACKED: { label: 'Đã đóng gói', color: 'bg-emerald-100 text-emerald-700' },
  DISPATCHED: { label: 'Đã điều phối', color: 'bg-slate-100 text-slate-600' },
}

const ExportOrderSummary = ({
  eligibleOrders,
  selectedEligibleId,
  onSelectEligible,
  onCreateOutbound,
  creating,
  loadingEligible,
  activeOutbounds,
  selectedOutboundId,
  onSelectOutbound,
  loadingOutbounds,
  outboundDetail,
  loadingDetail,
}: Props) => {
  const statusInfo = outboundDetail
    ? STATUS_LABELS[outboundDetail.status] ?? { label: outboundDetail.status, color: 'bg-slate-100 text-slate-700' }
    : null

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      {/* ── Create New Outbound Order ─────────────────────────────── */}
      <div className="glass-card rounded-3xl border border-slate-200/70 bg-white/90 p-6 shadow-xl shadow-slate-900/5">
        <div className="flex items-center gap-3 mb-5">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-teal-50 text-teal-600">
            <span className="material-symbols-outlined">add_box</span>
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-900">Tạo lệnh xuất kho mới</h2>
            <p className="text-xs text-slate-500">Chọn đơn CONFIRMED chưa có lệnh xuất</p>
          </div>
        </div>

        {loadingEligible ? (
          <div className="flex items-center gap-2 text-sm text-slate-400 py-3">
            <span className="material-symbols-outlined animate-spin text-base">autorenew</span>
            Đang tải danh sách đơn hàng...
          </div>
        ) : eligibleOrders.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-4 py-5 text-sm text-slate-500 text-center">
            Không có đơn CONFIRMED nào đang chờ tạo lệnh xuất.
          </div>
        ) : (
          <div className="space-y-3">
            <select
              id="eligible-order-select"
              className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium text-slate-900 outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-500/15"
              value={selectedEligibleId ?? ''}
              onChange={(e) => onSelectEligible(Number(e.target.value))}
            >
              {eligibleOrders.map((o) => (
                <option key={o.orderId} value={o.orderId}>
                  {o.orderCode} — {o.customerName}
                </option>
              ))}
            </select>
            <button
              id="btn-create-outbound"
              onClick={onCreateOutbound}
              disabled={creating || !selectedEligibleId}
              className="w-full inline-flex items-center justify-center gap-2 rounded-2xl bg-teal-600 px-6 py-3 text-sm font-bold text-white shadow-lg shadow-teal-600/20 transition hover:bg-teal-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <span className="material-symbols-outlined text-base">
                {creating ? 'autorenew' : 'assignment_add'}
              </span>
              {creating ? 'Đang tạo...' : 'Tạo Lệnh Xuất'}
            </button>
          </div>
        )}
      </div>

      {/* ── Select Existing Outbound ─────────────────────────────────── */}
      <div className="glass-card rounded-3xl border border-slate-200/70 bg-white/90 p-6 shadow-xl shadow-slate-900/5">
        <div className="flex items-center gap-3 mb-5">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
            <span className="material-symbols-outlined">manage_search</span>
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-900">Lệnh xuất hiện có</h2>
            <p className="text-xs text-slate-500">Chọn lệnh để xem chi tiết và thao tác</p>
          </div>
        </div>

        {loadingOutbounds ? (
          <div className="flex items-center gap-2 text-sm text-slate-400 py-3">
            <span className="material-symbols-outlined animate-spin text-base">autorenew</span>
            Đang tải lệnh xuất...
          </div>
        ) : activeOutbounds.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-4 py-5 text-sm text-slate-500 text-center">
            Chưa có lệnh xuất kho nào.
          </div>
        ) : (
          <select
            id="active-outbound-select"
            className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium text-slate-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/15"
            value={selectedOutboundId ?? ''}
            onChange={(e) => onSelectOutbound(e.target.value ? Number(e.target.value) : null)}
          >
            <option value="">-- Chọn lệnh xuất kho --</option>
            {activeOutbounds.map((o) => {
              const s = STATUS_LABELS[o.status]
              return (
                <option key={o.outboundId} value={o.outboundId}>
                  {o.outboundCode} [{s?.label ?? o.status}]
                </option>
              )
            })}
          </select>
        )}

        {/* Detail summary strip */}
        {outboundDetail && !loadingDetail && (
          <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
            <InfoChip label="Mã lệnh" value={outboundDetail.outboundCode} />
            <InfoChip label="Mã đơn hàng" value={outboundDetail.orderCode} />
            <InfoChip label="Kho" value={outboundDetail.warehouseName} />
            <div className="space-y-1">
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Trạng thái</p>
              <span
                className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-bold ${statusInfo?.color ?? 'bg-slate-100 text-slate-700'}`}
              >
                {statusInfo?.label ?? outboundDetail.status}
              </span>
            </div>
          </div>
        )}

        {loadingDetail && (
          <div className="mt-4 flex items-center gap-2 text-sm text-slate-400">
            <span className="material-symbols-outlined animate-spin text-base">autorenew</span>
            Đang tải chi tiết...
          </div>
        )}
      </div>
    </div>
  )
}

const InfoChip = ({ label, value }: { label: string; value: string }) => (
  <div className="space-y-1">
    <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">{label}</p>
    <p className="text-sm font-semibold text-slate-900 truncate">{value || '—'}</p>
  </div>
)

export default ExportOrderSummary
