const WarehouseMap = () => (
  <div className="glass rounded-3xl shadow-sm overflow-hidden flex flex-col h-[600px]">
    <div className="p-6 border-b border-slate-300/30 flex justify-between items-center">
      <div>
        <h2 className="text-2xl font-semibold">Realtime Warehouse Activity Map</h2>
        <p className="text-sm text-slate-500">Live occupancy status across storage zones</p>
      </div>
      <div className="flex gap-2">
        <button className="px-4 py-2 bg-slate-100 rounded-2xl text-sm hover:bg-slate-200 transition-colors">2D View</button>
        <button className="px-4 py-2 bg-blue-600 text-white rounded-2xl text-sm glow-active">3D Map</button>
      </div>
    </div>
    <div className="flex-1 relative bg-slate-50/70 p-8 overflow-hidden">
      <div className="w-full h-full border-2 border-slate-300/30 rounded-3xl relative grid grid-cols-4 grid-rows-4 gap-4 p-4">
        <div className="scanline"></div>
        <div className="relative group cursor-pointer border border-blue-200 bg-blue-50 rounded-3xl flex flex-col items-center justify-center hover:bg-blue-100 transition-all">
          <span className="absolute top-2 left-2 text-[10px] font-bold text-blue-700">ZONE A</span>
          <div className="grid grid-cols-5 gap-1">
            <div className="w-3 h-3 bg-cyan-200 rounded-sm"></div>
            <div className="w-3 h-3 bg-cyan-200 rounded-sm"></div>
            <div className="w-3 h-3 bg-cyan-200 rounded-sm"></div>
            <div className="w-3 h-3 bg-slate-300/30 rounded-sm"></div>
            <div className="w-3 h-3 bg-cyan-200 rounded-sm"></div>
          </div>
          <p className="mt-2 text-[10px] font-bold">82% Full</p>
        </div>
        <div className="relative group cursor-pointer border border-red-200 bg-red-50 rounded-3xl flex flex-col items-center justify-center hover:bg-red-100 transition-all">
          <span className="absolute top-2 left-2 text-[10px] font-bold text-red-700">ZONE B</span>
          <span className="material-symbols-outlined text-red-700 text-xl animate-bounce">rebase_edit</span>
          <p className="mt-2 text-[10px] font-bold text-red-700">AI OPTIMIZING</p>
        </div>
        <div className="relative group cursor-pointer border border-slate-300/30 bg-white rounded-3xl flex flex-col items-center justify-center hover:bg-slate-100 transition-all">
          <span className="absolute top-2 left-2 text-[10px] font-bold text-slate-600">ZONE C</span>
          <div className="grid grid-cols-3 gap-2">
            <div className="w-4 h-4 bg-slate-200 rounded-sm"></div>
            <div className="w-4 h-4 bg-slate-200 rounded-sm"></div>
            <div className="w-4 h-4 bg-slate-200 rounded-sm"></div>
          </div>
          <p className="mt-2 text-[10px] font-bold">12% Occupancy</p>
        </div>
        <div className="col-span-1 row-span-2 relative group cursor-pointer border border-blue-200 bg-blue-50 rounded-3xl flex flex-col items-center justify-center hover:bg-blue-100 transition-all">
          <span className="absolute top-2 left-2 text-[10px] font-bold text-blue-700">ZONE D (Bulk)</span>
          <div className="space-y-2">
            <div className="w-16 h-4 bg-cyan-200 rounded-sm"></div>
            <div className="w-16 h-4 bg-cyan-200 rounded-sm"></div>
            <div className="w-16 h-4 bg-slate-300/30 rounded-sm"></div>
            <div className="w-16 h-4 bg-cyan-200 rounded-sm"></div>
          </div>
          <p className="mt-2 text-[10px] font-bold">64% Full</p>
        </div>
        <div className="col-span-3 row-span-3 grid grid-cols-3 grid-rows-2 gap-4">
          <div className="bg-white rounded-3xl border border-slate-300/10"></div>
          <div className="bg-white rounded-3xl border border-slate-300/10"></div>
          <div className="bg-white rounded-3xl border border-slate-300/10"></div>
          <div className="bg-white rounded-3xl border border-slate-300/10"></div>
          <div className="bg-white rounded-3xl border border-slate-300/10"></div>
          <div className="bg-white rounded-3xl border border-slate-300/10"></div>
        </div>
      </div>
      <div className="absolute bottom-6 right-6 glass p-4 rounded-3xl shadow-lg space-y-2">
        <div className="flex items-center gap-3">
          <div className="w-3 h-3 bg-cyan-200 rounded-sm"></div>
          <span className="text-[11px] font-bold">Occupied Slot</span>
        </div>
        <div className="flex items-center gap-3">
          <div className="w-3 h-3 bg-slate-300/30 rounded-sm"></div>
          <span className="text-[11px] font-bold">Available Slot</span>
        </div>
        <div className="flex items-center gap-3">
          <div className="w-3 h-3 bg-red-500 rounded-sm"></div>
          <span className="text-[11px] font-bold">Bottleneck Alert</span>
        </div>
      </div>
    </div>
  </div>
)

export default WarehouseMap
