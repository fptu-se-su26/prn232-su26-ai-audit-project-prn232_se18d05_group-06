type ExportRow = {
  id: string
  status: 'PENDING' | 'PICKED'
  origin: string
  destination: string
  eta: string
  weight: string
  rack: string
  product: string
}

const exportRows: ExportRow[] = [
  {
    id: 'EXP-1764',
    status: 'PENDING',
    origin: 'Manila Port',
    destination: 'Mactan Pier',
    eta: '13:45',
    weight: '7.2T',
    rack: 'C-04-B',
    product: 'Smart LED Module Gen 4',
  },
  {
    id: 'EXP-1765',
    status: 'PICKED',
    origin: 'Cebu Warehouse',
    destination: 'Batangas Port',
    eta: '15:10',
    weight: '5.4T',
    rack: 'A-12-F',
    product: 'Shielded HDMI Cable 2m',
  },
  {
    id: 'PSU-500-X',
    status: 'PICKED',
    origin: 'Davao Yard',
    destination: 'Manila Port',
    eta: '18:20',
    weight: '8.1T',
    rack: 'B-02-A',
    product: '500W Power Unit',
  },
]

const ExportPickingQueue = () => (
  <div className="glass-card rounded-3xl border border-slate-200/70 p-6 shadow-xl shadow-slate-900/5">
    <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200/70 pb-5">
      <div>
        <h2 className="text-lg font-semibold text-slate-900">Current Picking Queue</h2>
      </div>
      <div className="flex items-center gap-2 text-sm text-slate-500">
        <span>Items Picked:</span>
        <span className="font-semibold text-[#2563eb]">2 / 5</span>
      </div>
    </div>
    <div className="overflow-x-auto">
      <table className="min-w-full border-separate border-spacing-y-3 text-left text-sm text-slate-700">
        <thead>
          <tr className="bg-slate-100">
            <th className="px-6 py-4 font-semibold uppercase tracking-[0.12em] text-slate-500">SKU</th>
            <th className="px-6 py-4 font-semibold uppercase tracking-[0.12em] text-slate-500">Product Name</th>
            <th className="px-6 py-4 font-semibold uppercase tracking-[0.12em] text-slate-500">Qty</th>
            <th className="px-6 py-4 font-semibold uppercase tracking-[0.12em] text-slate-500">Rack</th>
            <th className="px-6 py-4 font-semibold uppercase tracking-[0.12em] text-slate-500">Status</th>
            <th className="px-6 py-4 font-semibold uppercase tracking-[0.12em] text-slate-500 text-right">Action</th>
          </tr>
        </thead>
        <tbody>
          {exportRows.map((row) => (
            <tr key={row.id} className="group rounded-[24px] border border-slate-200 bg-white shadow-sm transition hover:bg-slate-50">
              <td className="px-6 py-5 font-semibold text-[#111827]">{row.id}</td>
              <td className="px-6 py-5 text-slate-600">{row.product}</td>
              <td className="px-6 py-5 font-semibold text-slate-900">{row.id === 'EXP-1764' ? '02' : row.id === 'EXP-1765' ? '05' : '01'}</td>
              <td className="px-6 py-5 text-[#0f766e] font-semibold">{row.rack}</td>
              <td className="px-6 py-5">
                <span
                  className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold uppercase ${
                    row.status === 'PENDING'
                      ? 'bg-amber-100 text-amber-700'
                      : 'bg-emerald-100 text-emerald-700'
                  }`}
                >
                  {row.status === 'PENDING' ? (
                    <span className="material-symbols-outlined text-[14px]">schedule</span>
                  ) : (
                    <span className="material-symbols-outlined text-[14px]">check_circle</span>
                  )}
                  {row.status}
                </span>
              </td>
              <td className="px-6 py-5 text-right">
                {row.status === 'PENDING' ? (
                  <button className="rounded-xl bg-[#2563eb] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#1d4ed8]">
                    PICK
                  </button>
                ) : (
                  <span className="material-symbols-outlined text-slate-400">lock</span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </div>
)

export default ExportPickingQueue
