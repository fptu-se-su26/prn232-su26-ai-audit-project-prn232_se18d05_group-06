const ExportRoutePanel = () => (
  <div className="glass-card rounded-3xl overflow-hidden border border-slate-200/70 shadow-xl shadow-slate-900/5">
    <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200/70 bg-white/80 p-5">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#2563eb]/10 text-[#2563eb]">
          <span className="material-symbols-outlined">navigation</span>
        </div>
        <div>
          <h2 className="text-base font-semibold text-slate-900">Warehouse Route Optimization</h2>
        </div>
      </div>
      <div className="flex gap-2">
        <span className="rounded-full bg-[#2563eb] px-3 py-1 text-xs font-bold uppercase tracking-[0.3em] text-white">Zone C</span>
        <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold uppercase tracking-[0.3em] text-slate-700">Rack 04</span>
      </div>
    </div>
    <div className="relative h-[440px] overflow-hidden bg-slate-950">
      <img
        className="h-full w-full object-cover opacity-70 grayscale transition-all duration-500"
        src="https://images.unsplash.com/photo-1518780664697-55e3ad937233?auto=format&fit=crop&w=1200&q=80"
        alt="Warehouse route visualization"
      />
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute left-8 top-24 w-1/2 border border-dashed border-[#2563eb]/50 rounded-3xl"></div>
        <svg className="absolute inset-0 w-full h-full" viewBox="0 0 1000 600" preserveAspectRatio="none">
          <path d="M 120 400 C 220 400 320 300 420 300 S 620 200 720 200" fill="none" stroke="#2563eb" strokeWidth="6" strokeDasharray="12 8" className="animate-[dash_2s_linear_infinite]" />
          <circle cx="720" cy="200" r="10" fill="#2563eb" className="animate-pulse" />
        </svg>
      </div>
      <div className="absolute bottom-6 left-6 right-6 flex flex-col gap-4 rounded-3xl bg-slate-950/90 p-5 text-white shadow-2xl backdrop-blur-xl">
        <div className="flex items-center gap-2 text-sm uppercase tracking-[0.3em] text-sky-300">
          <span className="material-symbols-outlined">target</span>
          CURRENT TARGET
        </div>
        <div>
          <p className="text-4xl font-black leading-tight">ZONE C, RACK 4-B</p>
          <p className="mt-2 text-sm text-slate-300">Expected transit time: 14s</p>
        </div>
      </div>
      <div className="absolute bottom-6 right-6 flex flex-col gap-2">
        <button className="h-12 w-12 rounded-full bg-white/90 text-slate-900 shadow-lg transition hover:scale-105">
          <span className="material-symbols-outlined">zoom_in</span>
        </button>
        <button className="h-12 w-12 rounded-full bg-white/90 text-slate-900 shadow-lg transition hover:scale-105">
          <span className="material-symbols-outlined">my_location</span>
        </button>
      </div>
    </div>
  </div>
)

export default ExportRoutePanel
