const ExportHeader = () => (
  <header className="fixed top-0 right-0 w-[calc(100%-280px)] h-20 bg-white/75 backdrop-blur-md z-40 border-b border-slate-300/30 flex items-center justify-between px-8">
    <div>
      <h1 className="text-2xl font-bold text-[#111827]">Export Goods</h1>
      <div className="mt-1 flex items-center gap-2 text-sm text-slate-500">
        <span className="inline-flex rounded-full bg-sky-100 px-2.5 py-1 text-xs font-semibold uppercase tracking-[0.24em] text-sky-700">
          ACTIVE SESSION
        </span>
        <span>Order Fulfillment Mode</span>
      </div>
    </div>

    <div className="flex items-center gap-4">
      <div className="relative hidden lg:block">
        <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">search</span>
        <input
          className="w-72 pl-10 pr-4 py-2 rounded-full border border-slate-200 bg-white text-sm text-slate-700 focus:border-[#2563eb] focus:outline-none focus:ring-2 focus:ring-[#2563eb]/20"
          placeholder="Global Inventory Search..."
          type="text"
        />
      </div>
      <button className="p-2 rounded-full text-slate-600 hover:bg-slate-100 transition-all duration-200">
        <span className="material-symbols-outlined">notifications</span>
      </button>
      <button className="p-2 rounded-full text-slate-600 hover:bg-slate-100 transition-all duration-200">
        <span className="material-symbols-outlined">smart_toy</span>
      </button>
    </div>
  </header>
)

export default ExportHeader
