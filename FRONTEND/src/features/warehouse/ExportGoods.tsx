import { useEffect, useState, useCallback, useRef } from 'react'
import { useReactToPrint } from 'react-to-print'
import Sidebar from '../../components/Sidebar'
import WarehouseHeader from '../../components/WarehouseHeader'
import ExportOrderSummary from '../../components/ExportOrderSummary'
import ExportPickingQueue from '../../components/ExportPickingQueue'
import ShippingLabelPreview from '../../components/ShippingLabelPreview'
import ExportPageActions from '../../components/ExportPageActions'
import api from '../../lib/api'

// ─── Type Definitions ─────────────────────────────────────────────────────────

export type EligibleServiceOrder = {
  orderId: number
  orderCode: string
  customerName: string
  status: string
  createdAt: string | null
}

export type OutboundLineItem = {
  lineId: number
  skuid: number
  skuCode: string
  skuName: string
  binId: number | null
  binCode: string
  zoneName: string
  requiredQty: number
  pickedQty: number
  remainingQty: number
  pickingStatus: string // PENDING | PICKING | COMPLETED
  qrLabel: string
}

export type OutboundOrder = {
  outboundId: number
  outboundCode: string
  orderId: number
  orderCode: string
  warehouseId: number
  warehouseName: string
  status: string // PENDING | PICKING | PACKED | DISPATCHED
  labelPrinted: boolean
  createdBy: number | null
  createdByName: string
  createdAt: string | null
  completedAt: string | null
  qrCodeBase64: string
  outboundLines: OutboundLineItem[]
}

export type ShippingLabel = {
  waybillId: number
  waybillCode: string
  outboundId: number
  outboundCode: string
  orderCode: string
  warehouseName: string
  warehouseAddress: string
  destinationAddress: string
  recipientName: string
  recipientPhone: string
  totalWeightKg: number
  totalPallets: number
  createdAt: string
  qrPayload: string
  qrCodeBase64: string
  outboundStatus: string
}

// ─── Main Component ────────────────────────────────────────────────────────────

const ExportGoods = () => {
  // Eligible CONFIRMED service orders (not yet outbounded)
  const [eligibleOrders, setEligibleOrders] = useState<EligibleServiceOrder[]>([])
  const [selectedEligibleId, setSelectedEligibleId] = useState<number | null>(null)

  // Active outbound orders already created
  const [activeOutbounds, setActiveOutbounds] = useState<OutboundOrder[]>([])
  const [selectedOutboundId, setSelectedOutboundId] = useState<number | null>(null)

  // Full outbound detail (lines included)
  const [outboundDetail, setOutboundDetail] = useState<OutboundOrder | null>(null)

  // Shipping label
  const [shippingLabel, setShippingLabel] = useState<ShippingLabel | null>(null)

  // Loading / action states
  const [loadingEligible, setLoadingEligible] = useState(false)
  const [loadingOutbounds, setLoadingOutbounds] = useState(false)
  const [loadingDetail, setLoadingDetail] = useState(false)
  const [creating, setCreating] = useState(false)
  const [pickingLineId, setPickingLineId] = useState<number | null>(null)
  const [pickingAll, setPickingAll] = useState(false)
  const [confirming, setConfirming] = useState(false)
  const [generatingLabel, setGeneratingLabel] = useState(false)

  // Error messages
  const [error, setError] = useState<string | null>(null)
  const [actionError, setActionError] = useState<string | null>(null)

  // Print ref for shipping label
  const printRef = useRef<HTMLDivElement>(null)
  const handlePrint = useReactToPrint({
    contentRef: printRef,
    documentTitle: `VanDon-${shippingLabel?.waybillCode ?? 'LABEL'}`,
  })

  // ─── Data Loaders ─────────────────────────────────────────────────────────

  const loadEligibleOrders = useCallback(async () => {
    setLoadingEligible(true)
    setError(null)
    try {
      const res = await api.get<EligibleServiceOrder[]>('/outbound/eligible-service-orders')
      setEligibleOrders(res.data)
      // Auto-select first only on initial empty state
      setSelectedEligibleId((prev) => {
        if (prev === null && res.data.length > 0) return res.data[0].orderId
        return prev
      })
    } catch {
      setError('Không tải được danh sách đơn CONFIRMED. Vui lòng thử lại.')
    } finally {
      setLoadingEligible(false)
    }
  }, []) // no state deps — uses functional updater instead

  const loadActiveOutbounds = useCallback(async () => {
    setLoadingOutbounds(true)
    try {
      const res = await api.get<OutboundOrder[]>('/outbound')
      setActiveOutbounds(res.data)
      // Auto-select first non-dispatched only on initial empty state
      setSelectedOutboundId((prev) => {
        if (prev === null) {
          const first = res.data.find((o) => o.status !== 'DISPATCHED')
          return first?.outboundId ?? null
        }
        return prev
      })
    } catch {
      // Non-fatal: just show empty list
    } finally {
      setLoadingOutbounds(false)
    }
  }, []) // no state deps — uses functional updater instead

  const loadOutboundDetail = useCallback(async (id: number) => {
    setLoadingDetail(true)
    setOutboundDetail(null)
    setShippingLabel(null)
    setActionError(null)
    try {
      const res = await api.get<OutboundOrder>(`/outbound/${id}`)
      setOutboundDetail(res.data)
      // If PACKED or DISPATCHED, try to load existing shipping label
      if (res.data.status === 'PACKED' || res.data.status === 'DISPATCHED') {
        try {
          const labelRes = await api.get<ShippingLabel>(`/outbound/${id}/shipping-label`)
          setShippingLabel(labelRes.data)
        } catch {
          // No label yet — that's fine
        }
      }
    } catch {
      setActionError('Không tải được chi tiết lệnh xuất kho.')
    } finally {
      setLoadingDetail(false)
    }
  }, [])

  // ─── Effects ──────────────────────────────────────────────────────────────

  useEffect(() => {
    loadEligibleOrders()
    loadActiveOutbounds()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    if (selectedOutboundId !== null) {
      loadOutboundDetail(selectedOutboundId)
    } else {
      setOutboundDetail(null)
      setShippingLabel(null)
    }
  }, [selectedOutboundId, loadOutboundDetail])

  // ─── Action Handlers ──────────────────────────────────────────────────────

  const handleCreateOutbound = async () => {
    if (!selectedEligibleId) return
    setCreating(true)
    setActionError(null)
    try {
      // POST /api/outbound/create returns OutboundResponseDto (no outboundId).
      // After creating, reload the outbound list and find the new record by OrderId.
      await api.post('/outbound/create', { orderId: selectedEligibleId })

      // Refresh both lists in parallel
      const [, outboundsRes] = await Promise.all([
        loadEligibleOrders(),
        api.get<OutboundOrder[]>('/outbound'),
      ])
      setActiveOutbounds(outboundsRes.data)

      // Find the newly created outbound for this orderId
      const newOutbound = outboundsRes.data.find(
        (o) => o.orderId === selectedEligibleId,
      )
      if (newOutbound) {
        setSelectedOutboundId(newOutbound.outboundId)
      }
    } catch (err: any) {
      setActionError(
        err.response?.data?.details ||
          err.response?.data?.message ||
          err.message ||
          'Tạo lệnh xuất kho thất bại. Đơn hàng có thể đã được tạo trước đó.',
      )
    } finally {
      setCreating(false)
    }
  }

  const handlePickLine = async (lineId: number, requiredQty: number) => {
    if (!outboundDetail) return
    setPickingLineId(lineId)
    setActionError(null)
    try {
      await api.post(`/outbound/${outboundDetail.outboundId}/lines/${lineId}/pick`, {
        pickedQty: requiredQty,
      })
      await loadOutboundDetail(outboundDetail.outboundId)
    } catch (err: any) {
      setActionError(err.response?.data?.message || 'Gom hàng thất bại. Vui lòng thử lại.')
    } finally {
      setPickingLineId(null)
    }
  }

  const handlePickAll = async () => {
    if (!outboundDetail) return
    const pendingLines = outboundDetail.outboundLines.filter(
      (l) => l.pickingStatus !== 'COMPLETED',
    )
    if (pendingLines.length === 0) return
    setPickingAll(true)
    setActionError(null)
    try {
      // Sequential to avoid rowversion/concurrency conflicts
      for (const line of pendingLines) {
        await api.post(
          `/outbound/${outboundDetail.outboundId}/lines/${line.lineId}/pick`,
          { pickedQty: line.requiredQty },
        )
      }
      await loadOutboundDetail(outboundDetail.outboundId)
    } catch (err: any) {
      setActionError(err.response?.data?.message || 'Gom tất cả thất bại. Vui lòng thử lại.')
    } finally {
      setPickingAll(false)
    }
  }

  const handleConfirmPacking = async () => {
    if (!outboundDetail) return
    setConfirming(true)
    setActionError(null)
    try {
      await api.post(`/outbound/${outboundDetail.outboundId}/confirm-picking`)
      await loadOutboundDetail(outboundDetail.outboundId)
      await loadActiveOutbounds()
    } catch (err: any) {
      setActionError(
        err.response?.data?.message || 'Xác nhận đóng gói thất bại. Vui lòng thử lại.',
      )
    } finally {
      setConfirming(false)
    }
  }

  const handleGenerateLabel = async () => {
    if (!outboundDetail) return
    setGeneratingLabel(true)
    setActionError(null)
    try {
      const res = await api.put<ShippingLabel>(
        `/outbound/${outboundDetail.outboundId}/shipping-label`,
      )
      setShippingLabel(res.data)
      await loadOutboundDetail(outboundDetail.outboundId)
    } catch (err: any) {
      const backendError = err.response?.data?.details || err.response?.data?.message || err.message;
      setActionError(`Tạo vận đơn thất bại: ${backendError}`)
    } finally {
      setGeneratingLabel(false)
    }
  }

  // ─── Derived State ────────────────────────────────────────────────────────

  const allLinesPicked =
    outboundDetail !== null &&
    outboundDetail.outboundLines.length > 0 &&
    outboundDetail.outboundLines.every((l) => l.pickingStatus === 'COMPLETED')

  const pickedCount =
    outboundDetail?.outboundLines.filter((l) => l.pickingStatus === 'COMPLETED').length ?? 0
  const totalCount = outboundDetail?.outboundLines.length ?? 0

  const status = outboundDetail?.status ?? null

  const canPick = status !== null && status !== 'PACKED' && status !== 'DISPATCHED'
  const canConfirmPack = canPick && allLinesPicked
  const canGenerateLabel = status === 'PACKED' || status === 'DISPATCHED'
  const isReadOnly = status === 'DISPATCHED'

  return (
    <div className="min-h-screen bg-[#f7f9fb] text-[#191c1e] antialiased">
      <Sidebar />
      <WarehouseHeader
        title="Xuất kho hàng hóa"
        subtitle="Tạo lệnh xuất, gom hàng, đóng gói và in vận đơn."
      />

      <main className="ml-[280px] mt-20 p-8 pb-16 animate-fade-in-up space-y-8">
        {/* Page Header Banner */}
        <div className="rounded-[28px] bg-gradient-to-r from-teal-600 to-emerald-700 p-8 text-white shadow-2xl shadow-teal-900/20">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold tracking-tight mb-1">Lệnh Xuất Kho</h1>
              <p className="text-teal-100 max-w-xl">
                Tạo lệnh xuất từ đơn CONFIRMED, gom hàng, đóng gói và in vận đơn QR.
              </p>
            </div>
            <div className="flex items-center gap-2 bg-white/20 backdrop-blur-sm rounded-2xl px-5 py-3">
              <span className="material-symbols-outlined text-teal-100">inventory_2</span>
              <span className="text-sm font-semibold">
                {activeOutbounds.filter((o) => o.status !== 'DISPATCHED').length} lệnh đang xử lý
              </span>
            </div>
          </div>
        </div>

        {/* Dispatcher Notice */}
        <div className="flex items-start gap-3 rounded-2xl border border-blue-200 bg-blue-50 px-5 py-4">
          <span className="material-symbols-outlined text-blue-500 mt-0.5 flex-shrink-0">info</span>
          <p className="text-sm font-medium text-blue-800">
            <strong>Lưu ý Điều phối:</strong> Việc gán phương tiện/tài xế và đặt lịch Dock cho đơn hàng xuất kho sẽ được thực hiện bởi{' '}
            <strong>Dispatcher</strong> sau khi đơn hàng được đóng gói (<strong>PACKED</strong>).
          </p>
        </div>

        {/* Global API Error */}
        {error && (
          <div className="flex items-center gap-2 rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm font-medium text-red-700">
            <span className="material-symbols-outlined text-base">error</span>
            {error}
          </div>
        )}

        {/* Action Error */}
        {actionError && (
          <div className="flex items-start gap-2 rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm font-medium text-red-700">
            <span className="material-symbols-outlined text-base flex-shrink-0">warning</span>
            <span>{actionError}</span>
            <button
              onClick={() => setActionError(null)}
              className="ml-auto text-red-400 hover:text-red-600 flex-shrink-0"
            >
              <span className="material-symbols-outlined text-base">close</span>
            </button>
          </div>
        )}

        {/* Order Summary Panel */}
        <ExportOrderSummary
          eligibleOrders={eligibleOrders}
          selectedEligibleId={selectedEligibleId}
          onSelectEligible={setSelectedEligibleId}
          onCreateOutbound={handleCreateOutbound}
          creating={creating}
          loadingEligible={loadingEligible}
          activeOutbounds={activeOutbounds}
          selectedOutboundId={selectedOutboundId}
          onSelectOutbound={setSelectedOutboundId}
          loadingOutbounds={loadingOutbounds}
          outboundDetail={outboundDetail}
          loadingDetail={loadingDetail}
        />

        {/* Main content: picking queue + shipping label */}
        {outboundDetail && (
          <div className="grid gap-6 xl:grid-cols-[1.6fr_1fr]">
            {/* Picking Queue */}
            <ExportPickingQueue
              outboundDetail={outboundDetail}
              loadingDetail={loadingDetail}
              onPickLine={handlePickLine}
              onPickAll={handlePickAll}
              pickingLineId={pickingLineId}
              pickingAll={pickingAll}
              pickedCount={pickedCount}
              totalCount={totalCount}
              canPick={canPick}
              isReadOnly={isReadOnly}
            />

            {/* Shipping Label Preview */}
            <ShippingLabelPreview
              shippingLabel={shippingLabel}
              outboundStatus={status}
              printRef={printRef}
              onPrint={handlePrint}
            />
          </div>
        )}

        {!outboundDetail && !loadingDetail && (
          <div className="rounded-3xl border border-dashed border-slate-300 bg-white/60 px-8 py-16 text-center">
            <span className="material-symbols-outlined text-5xl text-slate-300 mb-4 block">
              package_2
            </span>
            <p className="text-slate-500 font-medium">
              Chọn một lệnh xuất kho bên trên để xem chi tiết gom hàng.
            </p>
            <p className="text-sm text-slate-400 mt-1">
              Hoặc tạo lệnh mới từ một đơn CONFIRMED chưa có lệnh xuất.
            </p>
          </div>
        )}

        {loadingDetail && (
          <div className="rounded-3xl border border-slate-200 bg-white px-8 py-16 text-center">
            <div className="inline-flex items-center gap-3 text-slate-500">
              <span className="material-symbols-outlined animate-spin text-2xl">autorenew</span>
              <span className="font-medium">Đang tải chi tiết lệnh xuất kho...</span>
            </div>
          </div>
        )}

        {/* Page Actions */}
        {outboundDetail && (
          <ExportPageActions
            outboundStatus={status}
            allLinesPicked={allLinesPicked}
            hasLabel={shippingLabel !== null}
            canPick={canPick}
            canConfirmPack={canConfirmPack}
            canGenerateLabel={canGenerateLabel}
            isReadOnly={isReadOnly}
            onPickAll={handlePickAll}
            onConfirmPacking={handleConfirmPacking}
            onGenerateLabel={handleGenerateLabel}
            onPrint={handlePrint}
            pickingAll={pickingAll}
            confirming={confirming}
            generatingLabel={generatingLabel}
          />
        )}
      </main>
    </div>
  )
}

export default ExportGoods
