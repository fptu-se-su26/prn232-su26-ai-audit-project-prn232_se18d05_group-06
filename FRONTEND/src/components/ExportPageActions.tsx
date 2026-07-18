type Props = {
  outboundStatus: string | null
  allLinesPicked: boolean
  hasLabel: boolean
  canPick: boolean
  canConfirmPack: boolean
  canGenerateLabel: boolean
  isReadOnly: boolean
  onPickAll: () => void
  onConfirmPacking: () => void
  onGenerateLabel: () => void
  onPrint: () => void
  pickingAll: boolean
  confirming: boolean
  generatingLabel: boolean
}

const ExportPageActions = ({
  outboundStatus,
  allLinesPicked,
  hasLabel,
  canPick,
  canConfirmPack,
  canGenerateLabel,
  isReadOnly,
  onPickAll,
  onConfirmPacking,
  onGenerateLabel,
  onPrint,
  pickingAll,
  confirming,
  generatingLabel,
}: Props) => {
  return (
    <div className="rounded-3xl border border-slate-200/70 bg-white/90 shadow-xl shadow-slate-900/5 p-6">
      <div className="flex flex-wrap items-center gap-3 justify-between">
        {/* Status hint */}
        <div className="text-sm text-slate-500">
          {isReadOnly && (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-4 py-2 font-semibold text-slate-600">
              <span className="material-symbols-outlined text-base">lock</span>
              Đơn hàng đã DISPATCHED — chỉ xem
            </span>
          )}
          {!isReadOnly && outboundStatus === 'PACKED' && (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-100 px-4 py-2 font-semibold text-emerald-700">
              <span className="material-symbols-outlined text-base">inventory</span>
              Đã đóng gói — chờ tạo vận đơn hoặc Dispatcher điều phối
            </span>
          )}
          {!isReadOnly && canPick && !allLinesPicked && (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-100 px-4 py-2 font-semibold text-amber-700">
              <span className="material-symbols-outlined text-base">pending_actions</span>
              Còn hàng chưa gom — hoàn tất trước khi đóng gói
            </span>
          )}
          {!isReadOnly && canPick && allLinesPicked && outboundStatus !== 'PACKED' && (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-100 px-4 py-2 font-semibold text-blue-700">
              <span className="material-symbols-outlined text-base">check_circle</span>
              Đã gom đủ — sẵn sàng đóng gói
            </span>
          )}
        </div>

        {/* Action buttons */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Pick All (only if picking phase and lines not all done) */}
          {canPick && !allLinesPicked && (
            <button
              id="btn-action-pick-all"
              onClick={onPickAll}
              disabled={pickingAll}
              className="inline-flex items-center gap-2 rounded-2xl border border-blue-300 bg-white px-6 py-3 text-sm font-bold text-blue-700 transition hover:bg-blue-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span className="material-symbols-outlined text-base">
                {pickingAll ? 'autorenew' : 'done_all'}
              </span>
              {pickingAll ? 'Đang gom...' : 'Gom Tất Cả'}
            </button>
          )}

          {/* Confirm Packing */}
          {canConfirmPack && (
            <button
              id="btn-confirm-packing"
              onClick={onConfirmPacking}
              disabled={confirming}
              className="inline-flex items-center gap-2 rounded-2xl border border-emerald-400 bg-white px-6 py-3 text-sm font-bold text-emerald-700 transition hover:bg-emerald-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span className="material-symbols-outlined text-base">
                {confirming ? 'autorenew' : 'inventory_2'}
              </span>
              {confirming ? 'Đang đóng gói...' : 'Xác Nhận Đóng Gói'}
            </button>
          )}

          {/* Generate Waybill */}
          {canGenerateLabel && !hasLabel && (
            <button
              id="btn-generate-label"
              onClick={onGenerateLabel}
              disabled={generatingLabel}
              className="inline-flex items-center gap-2 rounded-2xl bg-teal-600 px-8 py-3 text-sm font-bold text-white shadow-lg shadow-teal-600/20 transition hover:bg-teal-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span className="material-symbols-outlined text-base">
                {generatingLabel ? 'autorenew' : 'receipt_long'}
              </span>
              {generatingLabel ? 'Đang tạo vận đơn...' : 'Tạo Vận Đơn / QR'}
            </button>
          )}

          {/* Print existing label */}
          {hasLabel && (
            <button
              id="btn-print-action"
              onClick={onPrint}
              className="inline-flex items-center gap-2 rounded-2xl bg-slate-900 px-8 py-3 text-sm font-bold text-white shadow-lg shadow-slate-900/20 transition hover:bg-slate-700"
            >
              <span className="material-symbols-outlined text-base">print</span>
              In Vận Đơn
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

export default ExportPageActions
