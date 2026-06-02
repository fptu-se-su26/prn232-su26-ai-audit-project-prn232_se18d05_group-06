const ExportAssistantCard = () => (
  <div className="glass-card rounded-3xl border border-slate-200/70 p-6 shadow-xl shadow-slate-900/5 relative overflow-hidden">
    <div className="absolute -right-16 -top-16 h-40 w-40 rounded-full bg-[#0f766e]/10 blur-3xl"></div>
    <div className="relative z-10 space-y-5">
      <div className="flex items-center gap-3 text-[#0f766e]">
        <span className="material-symbols-outlined text-2xl">auto_awesome</span>
        <h3 className="text-lg font-semibold">AI Packing Assistant</h3>
      </div>
      <div className="rounded-3xl border border-slate-200 bg-white p-4">
        <p className="text-xs uppercase tracking-[0.24em] text-slate-500">RECOMMENDED SIZE</p>
        <div className="mt-4 flex items-center gap-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-[#eff6ff] text-[#0f766e] text-3xl">
            <span className="material-symbols-outlined">inventory</span>
          </div>
          <div>
            <p className="text-xl font-bold text-slate-900">Box Large #4</p>
            <p className="text-sm text-slate-500">450 x 300 x 300 mm</p>
          </div>
        </div>
      </div>
      <div className="space-y-3">
        <div className="flex items-center gap-3 rounded-3xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-semibold text-amber-700">
          <span className="material-symbols-outlined">priority_high</span>
          Fragile Protection Required
        </div>
        <div className="flex items-center gap-3 rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-700">
          <span className="material-symbols-outlined">eco</span>
          Optimized Fill (88% Volume)
        </div>
      </div>
      <button className="w-full rounded-2xl bg-[#2563eb] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#1d4ed8]">
        ACKNOWLEDGE TIPS
      </button>
    </div>
  </div>
)

export default ExportAssistantCard
