const ExportOrderSummary = () => (
  <div className="glass-card rounded-3xl border border-slate-200/70 bg-white/90 p-6 shadow-xl shadow-slate-900/5">
    <div className="grid gap-4 lg:grid-cols-[1.4fr_0.85fr_0.85fr_auto] items-end">
      <div className="space-y-3">
        <p className="text-xs uppercase tracking-[0.28em] text-slate-500">Order ID / Reference</p>
        <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 shadow-sm">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#eff6ff] text-[#2563eb]">
            <span className="material-symbols-outlined text-lg">barcode_scanner</span>
          </div>
          <input
            className="w-full bg-transparent text-sm font-semibold text-[#2563eb] outline-none"
            value="ORD-2024-9981-AX"
            readOnly
          />
        </div>
      </div>
      <div className="space-y-3">
        <p className="text-xs uppercase tracking-[0.28em] text-slate-500">SKU Filter</p>
        <input
          className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 shadow-sm focus:border-[#2563eb] focus:ring-2 focus:ring-[#2563eb]/15 outline-none"
          placeholder="Scan SKU..."
          type="text"
        />
      </div>
      <div className="space-y-3">
        <p className="text-xs uppercase tracking-[0.28em] text-slate-500">Destination</p>
        <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-900 shadow-sm">
          Berlin Hub, Germany
        </div>
      </div>
      <div className="flex items-end">
        <button className="inline-flex items-center justify-center rounded-2xl bg-[#0f766e] px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-[#0f766e]/15 transition hover:bg-[#115e59]">
          UPDATE
        </button>
      </div>
    </div>
  </div>
)

export default ExportOrderSummary
