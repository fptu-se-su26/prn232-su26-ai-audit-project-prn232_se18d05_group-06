const KpiCards = () => (
  <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
    <div className="relative overflow-hidden rounded-[30px] border border-slate-200/70 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-md duration-300">
      <div className="absolute top-6 left-0 h-20 w-2 rounded-r-full bg-sky-500" />
      <div className="p-6">
        <div className="flex justify-between items-start mb-4">
          <div className="p-3 rounded-2xl bg-sky-50 text-sky-700 shadow-sm">
            <span className="material-symbols-outlined">inventory</span>
          </div>
          <div className="text-emerald-600 flex items-center text-xs font-semibold">
            <span className="material-symbols-outlined text-sm">trending_up</span>
            2.4%
          </div>
        </div>
        <p className="text-slate-500 text-sm font-semibold mb-1">Total Products</p>
        <h3 className="text-4xl font-bold leading-none mb-2">12,458</h3>
        <p className="text-sm text-slate-500">SKUs Tracked</p>
        <div className="mt-6 h-12 w-full rounded-3xl bg-slate-100 p-2 flex items-end gap-2">
          <span className="block h-3/5 w-full rounded-full bg-sky-100" />
          <span className="block h-4/5 w-full rounded-full bg-sky-200" />
          <span className="block h-1/2 w-full rounded-full bg-sky-300" />
          <span className="block h-2/3 w-full rounded-full bg-sky-400" />
          <span className="block h-1/2 w-full rounded-full bg-sky-600" />
        </div>
      </div>
    </div>

    <div className="relative overflow-hidden rounded-[30px] border border-slate-200/70 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-md duration-300">
      <div className="absolute top-6 left-0 h-20 w-2 rounded-r-full bg-cyan-400" />
      <div className="p-6">
        <div className="flex justify-between items-start mb-4">
          <div className="p-3 rounded-2xl bg-cyan-50 text-cyan-700 shadow-sm">
            <span className="material-symbols-outlined">download</span>
          </div>
        </div>
        <p className="text-slate-500 text-sm font-semibold mb-1">Overstock Items</p>
        <div className="flex items-baseline gap-2">
          <h3 className="text-4xl font-bold leading-none mb-2">432</h3>
          <span className="text-sm text-slate-500">items</span>
        </div>
        <p className="text-sm text-slate-500">Currently available</p>
        <div className="mt-5 flex items-center gap-2">
          <div className="h-2.5 w-2.5 rounded-full bg-cyan-600 animate-pulse" />
          <span className="text-xs font-bold text-cyan-700">Stock healthy</span>
        </div>
      </div>
    </div>

    <div className="relative overflow-hidden rounded-[30px] border border-slate-200/70 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-md duration-300">
      <div className="absolute top-6 left-0 h-20 w-2 rounded-r-full bg-rose-500" />
      <div className="p-6">
        <div className="flex justify-between items-start mb-4">
          <div className="p-3 rounded-2xl bg-rose-50 text-rose-700 shadow-sm">
            <span className="material-symbols-outlined">warning</span>
          </div>
        </div>
        <p className="text-slate-500 text-sm font-semibold mb-1">Low Stock Alerts</p>
        <h3 className="text-4xl font-bold text-rose-700 leading-none mb-2">86</h3>
        <p className="text-sm text-slate-500">Items near critical</p>
        <button className="mt-5 w-full rounded-2xl bg-rose-50 py-3 text-sm font-semibold text-rose-700 transition hover:bg-rose-100">
          Review Alerts
        </button>
      </div>
    </div>

    <div className="relative overflow-hidden rounded-[30px] border border-slate-200/70 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-md duration-300">
      <div className="absolute top-6 left-0 h-20 w-2 rounded-r-full bg-slate-900" />
      <div className="p-6">
        <div className="flex justify-between items-start mb-4">
          <div className="p-3 rounded-2xl bg-slate-100 text-slate-700 shadow-sm">
            <span className="material-symbols-outlined">event_busy</span>
          </div>
        </div>
        <p className="text-slate-500 text-sm font-semibold mb-1">Expiring Soon</p>
        <h3 className="text-4xl font-bold leading-none mb-2">24</h3>
        <p className="text-sm text-slate-500">Items leaving storage</p>
        <div className="mt-5 rounded-2xl bg-slate-100 px-4 py-3 text-sm text-slate-700">
          11 items require follow-up
        </div>
      </div>
    </div>
  </section>
)

export default KpiCards
