const Topbar = () => (
  <header className="h-20 bg-white/75 backdrop-blur-md sticky top-0 flex justify-between items-center px-8 z-40 border-b border-slate-300/30">
    <div className="flex items-center gap-4 flex-1">
      <div className="relative w-full max-w-md">
        <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">search</span>
        <input
          className="w-full pl-10 pr-4 py-2 bg-slate-100 border-none rounded-full focus:ring-2 focus:ring-blue-300 text-sm"
          placeholder="Search SKUs, Bins, or Orders..."
          type="text"
        />
      </div>
    </div>

    <div className="flex items-center gap-4">
      <button className="p-2 hover:bg-slate-100 rounded-full transition-all duration-200 relative">
        <span className="material-symbols-outlined text-slate-800">notifications</span>
        <span className="absolute top-2 right-2 w-2 h-2 bg-red-600 rounded-full"></span>
      </button>
      <button className="p-2 hover:bg-slate-100 rounded-full transition-all duration-200">
        <span className="material-symbols-outlined text-blue-600">smart_toy</span>
      </button>
      <div className="h-8 w-px bg-slate-300/70 mx-2"></div>
      <div className="text-right">
        <p className="text-sm font-bold">Warehouse Staff</p>
        <p className="text-[10px] text-slate-500">Zone A | North Wing</p>
      </div>
    </div>
  </header>
)

export default Topbar
