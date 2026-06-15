import type { AuditRow } from '../InventoryAudit.types'

type InventoryComparisonTableProps = {
  rows: AuditRow[]
  onQtyChange: (index: number, value: number) => void
}

const InventoryComparisonTable = ({ rows, onQtyChange }: InventoryComparisonTableProps) => (
  <div className="glass-card rounded-[28px] border border-slate-200/70 bg-white shadow-sm overflow-hidden">
    <div className="overflow-x-auto">
      <table className="min-w-full text-left text-sm text-slate-700">
        <thead>
          <tr className="bg-slate-50 text-slate-500">
            <th className="px-6 py-4 uppercase tracking-[0.2em]">SKU ID</th>
            <th className="px-6 py-4 text-right uppercase tracking-[0.2em]">System Qty</th>
            <th className="px-6 py-4 text-right uppercase tracking-[0.2em]">Actual Qty</th>
            <th className="px-6 py-4 text-right uppercase tracking-[0.2em]">Difference</th>
            <th className="px-6 py-4 text-center uppercase tracking-[0.2em]">Status</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-200/70">
          {rows.map((row, index) => {
            const diff = row.actualQty - row.systemQty
            const diffText = diff === 0 ? '0' : diff > 0 ? `+${diff}` : `${diff}`
            const actualInputBorder =
              diff === 0
                ? 'border-transparent text-slate-900'
                : diff > 0
                ? 'border-[#0f766e] text-[#0f766e]'
                : 'border-[#b91c1c] text-[#b91c1c]'
            const statusBg = diff === 0 ? 'bg-[#ecfdf5] text-[#0f766e]' : 'bg-[#fee2e2] text-[#b91c1c]'

            return (
              <tr key={row.sku} className="hover:bg-slate-50 transition-colors">
                <td className="px-6 py-4">
                  <div className="flex flex-col gap-1">
                    <span className="font-mono text-slate-900">{row.sku}</span>
                    <span className="text-xs text-slate-500">{row.label}</span>
                  </div>
                </td>
                <td className="px-6 py-4 text-right font-mono text-slate-900">{row.systemQty.toLocaleString()}</td>
                <td className="px-6 py-4 text-right">
                  <input
                    type="number"
                    value={row.actualQty}
                    onChange={(event) => onQtyChange(index, Number(event.target.value))}
                    className={`w-20 bg-transparent border-b-2 ${actualInputBorder} text-right font-mono outline-none focus:ring-0`}
                  />
                </td>
                <td className={`px-6 py-4 text-right font-semibold ${diff === 0 ? 'text-[#0f766e]' : diff > 0 ? 'text-[#0f766e]' : 'text-[#b91c1c]'}`}>{diffText}</td>
                <td className="px-6 py-4 text-center">
                  <span className={`inline-flex rounded-full px-3 py-1 text-xs font-bold ${statusBg}`}>{diff === 0 ? 'MATCHED' : 'MISMATCH'}</span>
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>

    <div className="flex flex-col gap-4 border-t border-slate-200/70 bg-slate-50 p-4 sm:flex-row sm:items-center sm:justify-between">
      <span className="text-sm text-slate-500">Showing {rows.length} of 142 items in Zone B-4</span>
      <div className="flex gap-2">
        <button className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50">Previous</button>
        <button className="rounded-xl bg-[#2563eb] px-4 py-2 text-sm font-medium text-white transition hover:bg-[#1d4ed8]">Next</button>
      </div>
    </div>
  </div>
)

export default InventoryComparisonTable
