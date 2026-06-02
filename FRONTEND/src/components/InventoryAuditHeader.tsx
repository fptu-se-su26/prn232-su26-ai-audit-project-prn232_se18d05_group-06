const InventoryAuditHeader = () => (
  <header className="sticky top-0 z-40 flex h-20 items-center justify-between border-b border-slate-200/70 bg-white/90 backdrop-blur-md px-8 shadow-sm">
    <div className="flex flex-col gap-1">
      <h2 className="text-2xl font-semibold">Inventory Audit</h2>
      <div className="flex items-center gap-2 text-sm text-slate-500">
        <span className="h-2 w-2 rounded-full bg-[#2563eb] shadow-[0_0_15px_rgba(37,99,235,0.25)]" />
        Live Session ID: AUD-2024-0815
      </div>
    </div>

    <div className="flex items-center gap-4">
      <div className="relative hidden lg:block">
        <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">search</span>
        <input
          className="w-72 rounded-full border border-slate-200 bg-slate-50 py-2 pl-10 pr-4 text-sm text-slate-700 outline-none focus:border-[#2563eb] focus:ring-2 focus:ring-[#2563eb]/20"
          placeholder="Search SKU or Bin..."
          type="text"
        />
      </div>
      <button className="relative rounded-full p-2 text-slate-600 hover:bg-slate-100 transition-all duration-200">
        <span className="material-symbols-outlined">notifications</span>
        <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-[#dc2626]" />
      </button>
      <button className="rounded-full p-2 text-slate-600 hover:bg-slate-100 transition-all duration-200">
        <span className="material-symbols-outlined">smart_toy</span>
      </button>
      <div className="h-8 w-px bg-slate-300/70" />
      <div className="flex items-center gap-3">
        <span className="text-sm text-slate-700">Warehouse Staff</span>
        <img
          className="h-10 w-10 rounded-full object-cover"
          src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=256&q=80"
          alt="User profile"
        />
      </div>
    </div>
  </header>
)

export default InventoryAuditHeader
