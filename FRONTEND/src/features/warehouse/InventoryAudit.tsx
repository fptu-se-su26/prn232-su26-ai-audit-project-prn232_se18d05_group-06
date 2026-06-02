import { useMemo, useState } from 'react'
import Sidebar from '../../components/Sidebar'
import InventoryAuditHeader from '../../components/InventoryAuditHeader'
import AuditOverviewCard from '../../components/AuditOverviewCard'
import InventoryComparisonTable from '../../components/InventoryComparisonTable'
import AuditSidebarPanel from '../../components/AuditSidebarPanel'
import ScannerModal from '../../components/ScannerModal'
import type { AuditRow, AuditStats } from './InventoryAudit.types'

const initialRows: AuditRow[] = [
  { sku: 'LOG-BT-9920', label: 'Industrial Battery Pack', category: 'Battery Pack', systemQty: 142, actualQty: 142 },
  { sku: 'X-CHIP-44X', label: 'Micro-Controller Gen 2', category: 'Electronics', systemQty: 1500, actualQty: 1488 },
  { sku: 'ARM-RBT-04', label: 'Hydraulic Robot Arm', category: 'Robotics', systemQty: 8, actualQty: 8 },
  { sku: 'SEN-PX-001', label: 'Proximity Sensor V4', category: 'Sensors', systemQty: 245, actualQty: 247 },
  { sku: 'CAB-OPT-12', label: 'Fiber Optic Cable (10m)', category: 'Cables', systemQty: 54, actualQty: 54 },
]

const InventoryAudit = () => {
  const [rows, setRows] = useState<AuditRow[]>(initialRows)
  const [scannerOpen, setScannerOpen] = useState(false)

  const auditStats: AuditStats = useMemo(() => {
    const verified = rows.filter((row) => row.actualQty === row.systemQty).length
    const mismatches = rows.length - verified
    const percent = Math.round((verified / rows.length) * 100)
    return { verified, mismatches, percent }
  }, [rows])

  const onQtyChange = (index: number, value: number) => {
    setRows((current) => current.map((row, idx) => (idx === index ? { ...row, actualQty: value } : row)))
  }

  return (
    <div className="min-h-screen bg-[#f7f9fb] text-[#191c1e] antialiased overflow-hidden">
      <Sidebar />

      <main className="ml-[280px] min-h-screen pb-10">
        <InventoryAuditHeader />

        <div className="p-8 space-y-6 animate-fade-in-up">
          <AuditOverviewCard onBulkScanClick={() => setScannerOpen(true)} />

          <div className="grid gap-6 lg:grid-cols-[1.75fr_1fr]">
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-2xl font-semibold text-slate-900">Inventory Comparison</h3>
                <div className="flex gap-2">
                  <button className="inline-flex h-11 w-11 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 transition hover:bg-slate-50">
                    <span className="material-symbols-outlined">table_chart</span>
                  </button>
                  <button className="inline-flex h-11 w-11 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 transition hover:bg-slate-50">
                    <span className="material-symbols-outlined">download</span>
                  </button>
                </div>
              </div>

              <InventoryComparisonTable rows={rows} onQtyChange={onQtyChange} />
            </div>

            <AuditSidebarPanel auditStats={auditStats} />
          </div>
        </div>

        <ScannerModal open={scannerOpen} onClose={() => setScannerOpen(false)} />
      </main>
    </div>
  )
}

export default InventoryAudit
