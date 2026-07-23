import { useMemo, useState, useEffect } from 'react'
import Sidebar from '../../components/Sidebar'
import InventoryAuditHeader from '../../components/InventoryAuditHeader'
import AuditOverviewCard from '../../components/AuditOverviewCard'
import InventoryComparisonTable from '../../components/InventoryComparisonTable'
import AuditSidebarPanel from '../../components/AuditSidebarPanel'
import ScannerModal from '../../components/ScannerModal'
import type { AuditRow, AuditStats } from './InventoryAudit.types'
import api, { uploadReconciliationFile } from '../../lib/api'
import { useRef } from 'react'
const InventoryAudit = () => {
  const [rows, setRows] = useState<AuditRow[]>([])
  const [scannerOpen, setScannerOpen] = useState(false)
  const [showCriticalAlert, setShowCriticalAlert] = useState(false)
  const [uploadedCriticalAlerts, setUploadedCriticalAlerts] = useState(0)
  const [loading, setLoading] = useState(true)
  const [stocktakeId, setStocktakeId] = useState<number | null>(null)
  const [stocktakeList, setStocktakeList] = useState<any[]>([])
  const [isReconciling, setIsReconciling] = useState(false)
  const [selectedZone, setSelectedZone] = useState<string>('All')
  const fileInputRef = useRef<HTMLInputElement>(null)

  const zones = ['All', 'A-1', 'A-2', 'B-1', 'B-2', 'B-3', 'B-4', 'C-1', 'C-2']
  // Load stocktake list on mount
  useEffect(() => {
    loadStocktakeList()
  }, [])

  // Load audit data when stocktakeId changes
  useEffect(() => {
    if (stocktakeId) {
      loadAuditData(stocktakeId)
    }
  }, [stocktakeId])

  // Load comparison data when zone changes
  useEffect(() => {
    loadComparisonData()
  }, [selectedZone])

  const loadStocktakeList = async () => {
    try {
      const res = await api.get('/inventory-audit/stocktake-list')
      setStocktakeList(res.data)
      if (res.data.length > 0) {
        setStocktakeId(res.data[0].stocktakeId)
      } else {
        setLoading(false)
      }
    } catch (error) {
      console.error('Error loading stocktake list:', error)
      setLoading(false)
    }
  }

  const loadAuditData = async (id: number) => {
    setLoading(true)
    try {
      const res = await api.get(`/inventory-audit/stocktake/${id}`)
      const auditData = res.data.data.map((item: any) => ({
        lineId: item.lineId,
        sku: item.sku,
        label: item.label,
        category: item.category,
        systemQty: item.systemQty,
        actualQty: item.actualQty
      }))
      setRows(auditData)
    } catch (error) {
      console.error('Error loading audit data:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadComparisonData = async () => {
    setLoading(true)
    try {
      const url = selectedZone && selectedZone !== 'All'
        ? `http://localhost:5184/api/inventory-audit/comparison?zoneCode=${selectedZone}`
        : 'http://localhost:5184/api/inventory-audit/comparison'
      
      const res = await fetch(url)
      const data = await res.json()
      const comparisonData = data.data.map((item: any) => ({
        lineId: item.skuId,
        sku: item.skuCode,
        label: item.productName,
        category: item.zoneCode,
        systemQty: item.systemQty,
        actualQty: item.actualQty
      }))
      setRows(comparisonData)
    } catch (error) {
      console.error('Error loading comparison data:', error)
    } finally {
      setLoading(false)
    }
  }

  const auditStats: AuditStats = useMemo(() => {
    const verified = rows.filter((row) => row.actualQty === row.systemQty).length
    const mismatches = rows.length - verified
    const percent = Math.round((verified / rows.length) * 100)
    
    // Calculate critical alerts (variance > 10%)
    const criticalAlerts = rows.filter((row) => {
      const diff = Math.abs(row.actualQty - row.systemQty)
      const variance = row.systemQty > 0 ? (diff / row.systemQty) * 100 : 0
      return variance > 10
    }).length
    
    return { verified, mismatches, percent, criticalAlerts }
  }, [rows])

  // Show critical alert if there are any items with variance > 10%
  useEffect(() => {
    if (auditStats.criticalAlerts > 0 || uploadedCriticalAlerts > 0) {
      setShowCriticalAlert(true)
    }
  }, [auditStats.criticalAlerts, uploadedCriticalAlerts])

  const onQtyChange = (index: number, value: number) => {
    setRows((current) => current.map((row, idx) => (idx === index ? { ...row, actualQty: value } : row)))
  }

  const onQtyBlur = async (index: number, value: number) => {
    const row = rows[index]
    if (stocktakeId && row.lineId) {
      try {
        await api.post(`/inventory-audit/stocktake/${stocktakeId}/update-count`, {
          lineId: row.lineId,
          countedQty: value
        })
      } catch (error) {
        console.error('Failed to save actual quantity:', error)
      }
    }
  }

  const exportToExcel = () => {
    const csvContent = [
      ['SKU ID', 'Label', 'Category', 'System Qty', 'Actual Qty', 'Difference', 'Variance %', 'Status'],
      ...rows.map(row => {
        const diff = row.actualQty - row.systemQty
        const variance = row.systemQty > 0 ? (Math.abs(diff) / row.systemQty) * 100 : 0
        const isCritical = variance > 10
        const status = isCritical ? 'CRITICAL' : diff === 0 ? 'MATCHED' : 'MISMATCH'
        
        return [
          row.sku,
          row.label,
          row.category,
          row.systemQty,
          row.actualQty,
          diff,
          variance.toFixed(1) + '%',
          status
        ]
      })
    ]
    .map(row => row.join(','))
    .join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    link.setAttribute('href', url)
    link.setAttribute('download', `inventory-audit-${new Date().toISOString().split('T')[0]}.csv`)
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const handleUploadReconciliation = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setIsReconciling(true)
    try {
      const formData = new FormData()
      formData.append('ActualCountFile', file)
      formData.append('ThresholdPercentage', '0.10')
      
      const { blob, criticalCount } = await uploadReconciliationFile(formData)
      
      if (criticalCount > 0) {
        setUploadedCriticalAlerts(criticalCount)
      }

      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', `ReconciliationReport_${new Date().getTime()}.xlsx`)
      document.body.appendChild(link)
      link.click()
      link.parentNode?.removeChild(link)
      window.URL.revokeObjectURL(url)
    } catch (error) {
      console.error('Failed to process reconciliation file:', error)
      alert('Failed to process reconciliation file.')
    } finally {
      setIsReconciling(false)
      if (e.target) {
        e.target.value = ''
      }
    }
  }

  return (
    <div className="min-h-screen bg-[#f7f9fb] text-[#191c1e] antialiased overflow-hidden">
      <Sidebar />

      <main className="ml-[280px] min-h-screen pb-10">
        <InventoryAuditHeader />

        <div className="p-8 space-y-6 animate-fade-in-up">
          {/* Stocktake Selector & Zone Filter */}
          <div className="flex items-center gap-4 flex-wrap">
            <label className="text-sm font-medium text-slate-700">Select Stocktake:</label>
            <select
              value={stocktakeId || ''}
              onChange={(e) => setStocktakeId(Number(e.target.value))}
              className="px-4 py-2 border border-slate-300 rounded-lg bg-white text-slate-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {stocktakeList.map((st) => (
                <option key={st.stocktakeId} value={st.stocktakeId}>
                  {st.stocktakeCode} - {st.warehouse} ({st.stocktakeDate})
                </option>
              ))}
            </select>

            <div className="w-px h-8 bg-slate-300 mx-2"></div>

            <label className="text-sm font-medium text-slate-700">Zone:</label>
            <select
              value={selectedZone}
              onChange={(e) => setSelectedZone(e.target.value)}
              className="px-4 py-2 border border-slate-300 rounded-lg bg-white text-slate-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {zones.map((zone) => (
                <option key={zone} value={zone}>{zone}</option>
              ))}
            </select>

            <button
              onClick={loadComparisonData}
              disabled={loading}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? 'Loading...' : 'Refresh'}
            </button>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
          ) : (
            <>
              <AuditOverviewCard onBulkScanClick={() => setScannerOpen(true)} />

              <div className="grid gap-6 lg:grid-cols-[1.75fr_1fr]">
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <h3 className="text-2xl font-semibold text-slate-900">Inventory Comparison</h3>
                    <div className="flex gap-2">
                      <button className="inline-flex h-11 w-11 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 transition hover:bg-slate-50">
                        <span className="material-symbols-outlined">table_chart</span>
                      </button>
                      <button 
                        onClick={exportToExcel}
                        className="inline-flex h-11 w-11 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 transition hover:bg-slate-50"
                        title="Export to Excel"
                      >
                        <span className="material-symbols-outlined">download</span>
                      </button>
                      <button 
                        onClick={() => fileInputRef.current?.click()}
                        disabled={isReconciling}
                        className={`inline-flex h-11 px-4 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white text-slate-600 transition hover:bg-slate-50 ${isReconciling ? 'opacity-50 cursor-not-allowed' : ''}`}
                        title="Upload Physical Count Excel for Reconciliation"
                      >
                        <span className="material-symbols-outlined">{isReconciling ? 'hourglass_empty' : 'upload_file'}</span>
                        <span className="font-medium text-sm hidden sm:block">Reconcile</span>
                      </button>
                      <input 
                        type="file" 
                        ref={fileInputRef} 
                        onChange={handleUploadReconciliation} 
                        accept=".xlsx" 
                        className="hidden" 
                      />
                    </div>
                  </div>

                  <InventoryComparisonTable rows={rows} onQtyChange={onQtyChange} onQtyBlur={onQtyBlur} />
                </div>

                <AuditSidebarPanel auditStats={auditStats} />
              </div>
            </>
          )}
        </div>

        <ScannerModal open={scannerOpen} onClose={() => setScannerOpen(false)} />

        {/* Critical Alert Modal */}
        {showCriticalAlert && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 animate-fade-in">
            <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full mx-4 p-6 animate-scale-in">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center">
                  <span className="material-symbols-outlined text-red-600 text-2xl">warning</span>
                </div>
                <div>
                  <h3 className="text-xl font-bold text-red-900">Critical Discrepancy Alert</h3>
                  <p className="text-sm text-red-600">Variance exceeds 10% threshold</p>
                </div>
              </div>
              
              <div className="bg-red-50 rounded-xl p-4 mb-4">
                <p className="text-sm text-red-800">
                  <span className="font-bold">{uploadedCriticalAlerts > 0 ? uploadedCriticalAlerts : auditStats.criticalAlerts}</span> item(s) have variance greater than 10%. 
                  Please recount these items to ensure accuracy.
                </p>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setShowCriticalAlert(false)
                    setUploadedCriticalAlerts(0)
                  }}
                  className="flex-1 px-4 py-2 bg-red-600 text-white rounded-xl font-semibold hover:bg-red-700 transition-colors"
                >
                  Acknowledge & Recount
                </button>
                <button
                  onClick={() => {
                    setShowCriticalAlert(false)
                    setUploadedCriticalAlerts(0)
                  }}
                  className="flex-1 px-4 py-2 border border-slate-300 text-slate-700 rounded-xl font-semibold hover:bg-slate-50 transition-colors"
                >
                  Dismiss
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}

export default InventoryAudit
