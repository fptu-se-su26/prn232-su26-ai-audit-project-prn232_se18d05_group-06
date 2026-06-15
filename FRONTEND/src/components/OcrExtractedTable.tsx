import { useState } from 'react'

const initialRows = [
  { supplier: 'Global Logistics Corp', product: 'Industrial Pallet Jack V2', qty: 12, price: '$1,240.00', date: '2023-11-24', confidence: 99 },
  { supplier: 'TechParts Solutions', product: 'RFID Sensor Array (400pk)', qty: 50, price: '$850.50', date: '2023-11-23', confidence: 97 },
  { supplier: 'N0rthW3st Distro', product: 'Steel Reinforcement Rods', qty: 200, price: '$3,100.00', date: '2023-11-22', confidence: 64 },
]

const OcrExtractedTable = () => {
  const [rows, setRows] = useState(initialRows)

  function addRow() {
    setRows((prev) => [...prev, { supplier: '', product: '', qty: 0, price: '$0.00', date: '', confidence: 0 }])
  }

  function removeRow(index: number) {
    setRows((prev) => prev.filter((_, i) => i !== index))
  }

  return (
    <section className="rounded-[28px] border border-slate-200/70 bg-white shadow-sm mt-8 overflow-hidden">
      <div className="flex flex-col gap-4 px-6 py-5 sm:flex-row sm:items-center sm:justify-between border-b border-slate-200/70 bg-slate-50">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <h3 className="text-lg font-semibold text-slate-900">Extracted Data</h3>
          <span className="inline-flex items-center gap-2 rounded-full bg-[#d8f7ff] px-3 py-1 text-xs font-semibold text-[#006172]">
            <span className="material-symbols-outlined text-sm">verified</span>
            98.4% Confidence
          </span>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <button className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-100">
            Export CSV
          </button>
          <button className="rounded-full bg-[#2563eb] px-6 py-2 text-sm font-semibold text-white transition hover:bg-[#1d4ed8]">
            Confirm to Inventory
          </button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full text-left text-sm text-slate-700">
          <thead>
            <tr className="bg-slate-50 text-slate-500">
              <th className="px-6 py-4 font-semibold">Supplier</th>
              <th className="px-6 py-4 font-semibold">Product</th>
              <th className="px-6 py-4 font-semibold">Qty</th>
              <th className="px-6 py-4 font-semibold">Price</th>
              <th className="px-6 py-4 font-semibold">Date</th>
              <th className="px-6 py-4 font-semibold">AI Confidence</th>
              <th className="px-6 py-4 font-semibold">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200/70">
            {rows.map((row, index) => (
              <tr key={index} className="hover:bg-slate-50 transition-colors">
                <td className="px-6 py-4 text-slate-900 font-medium">{row.supplier}</td>
                <td className="px-6 py-4">{row.product}</td>
                <td className="px-6 py-4">{row.qty}</td>
                <td className="px-6 py-4">{row.price}</td>
                <td className="px-6 py-4">{row.date}</td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="h-2.5 w-28 overflow-hidden rounded-full bg-slate-200">
                      <div
                        className={`h-full ${row.confidence > 80 ? 'bg-[#0f766e]' : row.confidence > 50 ? 'bg-[#f59e0b]' : 'bg-[#dc2626]'}`}
                        style={{ width: `${row.confidence}%` }}
                      />
                    </div>
                    <span className={`text-sm font-semibold ${row.confidence > 80 ? 'text-[#0f766e]' : row.confidence > 50 ? 'text-[#b45309]' : 'text-[#b91c1c]'}`}>{row.confidence}%</span>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <button className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 text-slate-600 transition hover:bg-slate-200" onClick={() => removeRow(index)}>
                    <span className="material-symbols-outlined text-base">delete</span>
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="border-t border-slate-200/70 px-6 py-4 flex justify-center">
        <button onClick={addRow} className="inline-flex items-center gap-2 text-sm font-semibold text-[#2563eb] hover:text-[#1d4ed8] transition">
          <span className="material-symbols-outlined">add_circle</span>
          Add Manual Row
        </button>
      </div>
    </section>
  )
}

export default OcrExtractedTable
