import type { RefObject, MutableRefObject } from 'react'
import type { ShippingLabel } from '../features/warehouse/ExportGoods'

type Props = {
  shippingLabel: ShippingLabel | null
  outboundStatus: string | null
  printRef: RefObject<HTMLDivElement | null>
  onPrint: () => void
}

const qrSrc = (base64: string): string => {
  if (!base64) return ''
  if (base64.startsWith('data:image')) return base64
  return `data:image/png;base64,${base64}`
}

const ShippingLabelPreview = ({ shippingLabel, outboundStatus, printRef, onPrint }: Props) => {
  const noLabel = !shippingLabel

  return (
    <div className="glass-card rounded-3xl border border-slate-200/70 bg-white/90 p-6 shadow-xl shadow-slate-900/5 flex flex-col gap-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-teal-50 text-teal-600">
            <span className="material-symbols-outlined">local_shipping</span>
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900">Vận đơn / Shipping Label</h3>
            <p className="text-xs text-slate-500">
              {noLabel ? 'Chưa có vận đơn' : shippingLabel.waybillCode}
            </p>
          </div>
        </div>
        {!noLabel && (
          <button
            id="btn-print-label"
            onClick={onPrint}
            className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
          >
            <span className="material-symbols-outlined text-base">print</span>
            In nhãn
          </button>
        )}
      </div>

      {/* Status gating messages */}
      {noLabel && (outboundStatus === 'PENDING' || outboundStatus === 'PICKING') && (
        <div className="flex items-center gap-2 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-700">
          <span className="material-symbols-outlined text-base">hourglass_top</span>
          Vui lòng hoàn tất gom hàng và đóng gói trước khi tạo vận đơn.
        </div>
      )}

      {noLabel && outboundStatus === 'PACKED' && (
        <div className="flex items-center gap-2 rounded-2xl border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-700">
          <span className="material-symbols-outlined text-base">receipt_long</span>
          Đơn hàng đã đóng gói. Nhấn "Tạo Vận Đơn" bên dưới để tạo mã QR.
        </div>
      )}

      {noLabel && !outboundStatus && (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-4 py-8 text-center text-sm text-slate-400">
          Chọn một lệnh xuất kho để xem vận đơn.
        </div>
      )}

      {/* Printable Label */}
      {!noLabel && (
        <>
          {/* Screen preview */}
          <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm space-y-4">
            {/* FROM / TO */}
            <div className="flex justify-between border-b border-slate-100 pb-4">
              <div className="space-y-1">
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">From</p>
                <p className="text-sm font-bold text-slate-900 leading-snug">
                  {shippingLabel.warehouseName || 'SMARTLOG WAREHOUSE'}
                </p>
                <p className="text-xs text-slate-500 max-w-[180px] leading-snug">
                  {shippingLabel.warehouseAddress || '—'}
                </p>
              </div>
              <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-slate-900 text-white font-black text-lg flex-shrink-0">
                OUT
              </div>
            </div>

            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Ship To</p>
              <p className="text-base font-bold text-slate-900 leading-snug">
                {shippingLabel.recipientName || '—'}
              </p>
              <p className="text-xs text-slate-500 leading-snug mt-0.5">
                {shippingLabel.destinationAddress || '—'}
              </p>
              {shippingLabel.recipientPhone && (
                <p className="text-xs text-slate-500 mt-0.5">📞 {shippingLabel.recipientPhone}</p>
              )}
            </div>

            {/* QR Code */}
            {shippingLabel.qrCodeBase64 ? (
              <div className="flex flex-col items-center gap-2 border-y border-slate-100 py-4">
                <img
                  src={qrSrc(shippingLabel.qrCodeBase64)}
                  alt={`QR: ${shippingLabel.waybillCode}`}
                  className="h-36 w-36 object-contain rounded-xl border border-slate-200 bg-white p-1"
                />
                <p className="text-xs font-bold tracking-wider text-slate-700">
                  {shippingLabel.waybillCode}
                </p>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-2 border-y border-slate-100 py-4 text-slate-400 text-sm">
                <span className="material-symbols-outlined text-4xl">qr_code_2</span>
                <span>QR đang tạo...</span>
              </div>
            )}

            {/* Footer Meta */}
            <div className="flex items-start justify-between gap-4 text-[11px] text-slate-500">
              <div className="space-y-1">
                <p>Mã đơn: <span className="font-semibold text-slate-800">{shippingLabel.orderCode}</span></p>
                <p>Mã lệnh: <span className="font-semibold text-slate-800">{shippingLabel.outboundCode}</span></p>
                <p>Tổng trọng lượng: <span className="font-semibold text-slate-800">{shippingLabel.totalWeightKg} kg</span></p>
                <p>Số pallet: <span className="font-semibold text-slate-800">{shippingLabel.totalPallets}</span></p>
                <p>Trạng thái: <span className="font-semibold text-slate-800">{shippingLabel.outboundStatus}</span></p>
              </div>
            </div>
          </div>

          {/* Validated badge */}
          <div className="flex items-center gap-2 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700">
            <span className="material-symbols-outlined text-base">verified</span>
            Vận đơn đã xác thực — {new Date(shippingLabel.createdAt).toLocaleString('vi-VN')}
          </div>
        </>
      )}

      {/* Hidden printable template */}
      {!noLabel && (
        <div className="hidden">
          <div ref={printRef as MutableRefObject<HTMLDivElement>} style={{ padding: 32, fontFamily: 'monospace', fontSize: 13 }}>
            <h2 style={{ fontSize: 20, fontWeight: 'bold', marginBottom: 8 }}>
              SMARTLOG AI — VẬN ĐƠN XUẤT KHO
            </h2>
            <hr />
            <p style={{ marginTop: 8 }}>
              <strong>Mã vận đơn:</strong> {shippingLabel.waybillCode}
            </p>
            <p><strong>Mã lệnh xuất:</strong> {shippingLabel.outboundCode}</p>
            <p><strong>Mã đơn hàng:</strong> {shippingLabel.orderCode}</p>
            <hr style={{ margin: '12px 0' }} />
            <p><strong>Kho xuất:</strong> {shippingLabel.warehouseName}</p>
            <p style={{ whiteSpace: 'pre-wrap' }}>{shippingLabel.warehouseAddress}</p>
            <hr style={{ margin: '12px 0' }} />
            <p><strong>Giao tới:</strong> {shippingLabel.recipientName}</p>
            <p style={{ whiteSpace: 'pre-wrap' }}>{shippingLabel.destinationAddress}</p>
            {shippingLabel.recipientPhone && <p>ĐT: {shippingLabel.recipientPhone}</p>}
            <hr style={{ margin: '12px 0' }} />
            <p><strong>Trọng lượng:</strong> {shippingLabel.totalWeightKg} kg</p>
            <p><strong>Số pallet:</strong> {shippingLabel.totalPallets}</p>
            <p><strong>Ngày tạo:</strong> {new Date(shippingLabel.createdAt).toLocaleString('vi-VN')}</p>
            {shippingLabel.qrCodeBase64 && (
              <div style={{ marginTop: 16, textAlign: 'center' }}>
                <img
                  src={qrSrc(shippingLabel.qrCodeBase64)}
                  alt="QR Code"
                  style={{ width: 180, height: 180 }}
                />
                <p style={{ marginTop: 4, fontSize: 11 }}>{shippingLabel.waybillCode}</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default ShippingLabelPreview
