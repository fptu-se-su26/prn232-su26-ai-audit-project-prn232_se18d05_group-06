import { useState } from 'react'
import Sidebar from './components/Sidebar'

const WarehouseTransfer = () => {
  const [progress] = useState(65)

  return (
    <div className="min-h-screen bg-[#f7f9fb] text-[#191c1e] antialiased overflow-hidden">
      <Sidebar />

      <main className="ml-[280px] min-h-screen">
        <header className="h-20 glass-card fixed top-0 right-0 w-[calc(100%-280px)] z-40 px-8 flex justify-between items-center shadow-sm">
          <div className="flex items-center gap-4">
            <h2 className="text-2xl font-bold">Warehouse Transfer</h2>
            <span className="bg-[#00687a] text-white px-3 py-1 rounded-full text-sm">#WT-2024-8842</span>
          </div>
          <div className="flex items-center gap-4">
            <div className="relative w-80">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">search</span>
              <input className="w-full bg-slate-50 rounded-full pl-10 pr-4 py-2 text-sm focus:ring-2 focus:ring-primary/20" placeholder="Search transfers..." />
            </div>
            <button className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-slate-100 transition-all">
              <span className="material-symbols-outlined">notifications</span>
            </button>
            <button className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-slate-100 transition-all">
              <span className="material-symbols-outlined">smart_toy</span>
            </button>
          </div>
        </header>

        <div className="pt-24 p-8 space-y-8 animate-fade-in-up">
          <section className="glass-card p-6 rounded-xl flex items-center justify-between relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-slate-100" />
            <div className="absolute top-0 left-0 w-2/3 h-1 bg-[#2563eb] shadow-md" />

            <div className="flex flex-col items-center gap-2 relative z-10">
              <div className="w-10 h-10 rounded-full bg-[#2563eb] text-white flex items-center justify-center shadow-lg">
                <span className="material-symbols-outlined">assignment</span>
              </div>
              <span className="text-sm font-bold text-[#2563eb]">Requested</span>
              <span className="text-xs text-slate-500">Oct 12, 09:15</span>
            </div>

            <div className="flex-1 h-px bg-slate-200/40 mx-4" />

            <div className="flex flex-col items-center gap-2 relative z-10">
              <div className="w-10 h-10 rounded-full bg-[#2563eb] text-white flex items-center justify-center shadow-lg">
                <span className="material-symbols-outlined">verified</span>
              </div>
              <span className="text-sm font-bold text-[#2563eb]">Approved</span>
              <span className="text-xs text-slate-500">Oct 12, 11:30</span>
            </div>

            <div className="flex-1 h-px bg-slate-200/40 mx-4" />

            <div className="flex flex-col items-center gap-2 relative z-10">
              <div className="w-10 h-10 rounded-full bg-[#2563eb] text-white flex items-center justify-center animate-pulse shadow-md">
                <span className="material-symbols-outlined">local_shipping</span>
              </div>
              <span className="text-sm font-bold text-[#2563eb]">In Transit</span>
              <span className="text-xs text-slate-500">Live Tracking</span>
            </div>

            <div className="flex-1 h-px bg-slate-200/40 mx-4 border-dashed" />

            <div className="flex flex-col items-center gap-2 relative z-10 opacity-40">
              <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center">
                <span className="material-symbols-outlined">inventory</span>
              </div>
              <span className="text-sm font-bold">Completed</span>
              <span className="text-xs text-slate-500">Est: 4:00 PM</span>
            </div>
          </section>

          <div className="grid lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <div className="glass-card p-6 rounded-[20px] shadow-sm border border-slate-200/70">
                <div className="flex items-center gap-2 mb-4">
                  <span className="material-symbols-outlined text-[#2563eb]">settings_ethernet</span>
                  <h3 className="text-lg font-semibold">Logistics Routing</h3>
                </div>
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <label className="text-xs text-slate-500">Source Station</label>
                    <div className="p-4 bg-slate-50 rounded-lg border border-slate-200 flex items-center gap-3">
                      <span className="material-symbols-outlined text-[#00687a]">warehouse</span>
                      <div>
                        <p className="font-semibold">Hub-Alpha (Detroit)</p>
                        <p className="text-xs text-slate-500">Bay 12, Floor 2</p>
                      </div>
                    </div>

                    <label className="text-xs text-slate-500">Destination Station</label>
                    <div className="p-4 bg-slate-50 rounded-lg border border-slate-200 flex items-center gap-3">
                      <span className="material-symbols-outlined text-[#2563eb]">door_front</span>
                      <div>
                        <p className="font-semibold">Dist-Zeta (Chicago)</p>
                        <p className="text-xs text-slate-500">Receiving Dock A</p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <label className="text-xs text-slate-500">Vehicle Unit</label>
                    <div className="p-4 bg-slate-50 rounded-lg border border-slate-200 flex items-center gap-3">
                      <span className="material-symbols-outlined text-[#2563eb]">electric_car</span>
                      <div>
                        <p className="font-semibold">EV-Heavy 904</p>
                        <p className="text-xs text-slate-500">Capacity: 12.5 Tons</p>
                      </div>
                    </div>

                    <label className="text-xs text-slate-500">Assigned Driver</label>
                    <div className="p-4 bg-slate-50 rounded-lg border border-slate-200 flex items-center gap-3">
                      <img className="w-10 h-10 rounded-full" src="https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=256&q=80" />
                      <div>
                        <p className="font-semibold">Jordan Miller</p>
                        <p className="text-xs text-slate-500">ID: #DRV-882</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="glass-card rounded-[20px] overflow-hidden shadow-sm">
                <div className="p-6 border-b border-slate-200/70 flex justify-between items-center">
                  <h3 className="text-lg font-semibold">Items Manifest</h3>
                  <button className="flex items-center gap-2 text-[#2563eb] px-4 py-2 rounded-lg hover:bg-[#eff6ff] transition-all">
                    <span className="material-symbols-outlined">add_circle</span>
                    Add Item
                  </button>
                </div>

                <table className="w-full text-left">
                  <thead>
                    <tr className="bg-slate-50">
                      <th className="px-6 py-4">SKU / PRODUCT</th>
                      <th className="px-6 py-4 text-center">QUANTITY</th>
                      <th className="px-6 py-4">WAREHOUSE TAG</th>
                      <th className="px-6 py-4">STATUS</th>
                      <th className="px-6 py-4 text-right">ACTION</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    <tr className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-slate-100 rounded-md flex items-center justify-center">
                            <span className="material-symbols-outlined text-slate-500">memory</span>
                          </div>
                          <div>
                            <p className="font-semibold">NX-740 Processors</p>
                            <p className="text-xs text-slate-500">SKU: 902-BA-11</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-center">450 Units</td>
                      <td className="px-6 py-4">Zone B-4 / R-12</td>
                      <td className="px-6 py-4">
                        <div className="inline-flex items-center gap-1 bg-[#ecf8ff] text-[#2563eb] px-2 py-1 rounded text-xs font-bold">STAGED</div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button className="material-symbols-outlined text-slate-500 hover:text-red-600">delete</button>
                      </td>
                    </tr>

                    <tr className="hover:bg-slate-50 transition-colors bg-slate-50/20">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-slate-100 rounded-md flex items-center justify-center">
                            <span className="material-symbols-outlined text-slate-500">battery_charging_full</span>
                          </div>
                          <div>
                            <p className="font-semibold">Lithium Cell Packs</p>
                            <p className="text-xs text-slate-500">SKU: BATT-442-X</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-center">12 Pallets</td>
                      <td className="px-6 py-4">Hazmat Area C</td>
                      <td className="px-6 py-4">
                        <div className="inline-flex items-center gap-1 bg-[#ecfffb] text-[#00687a] px-2 py-1 rounded text-xs font-bold">LOADED</div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button className="material-symbols-outlined text-slate-500 hover:text-red-600">delete</button>
                      </td>
                    </tr>

                    <tr className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-slate-100 rounded-md flex items-center justify-center">
                            <span className="material-symbols-outlined text-slate-500">precision_manufacturing</span>
                          </div>
                          <div>
                            <p className="font-semibold">Servo Motors V4</p>
                            <p className="text-xs text-slate-500">SKU: MTR-99-L</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-center">85 Units</td>
                      <td className="px-6 py-4">Zone A-1 / R-02</td>
                      <td className="px-6 py-4">
                        <div className="inline-flex items-center gap-1 bg-[#ecf8ff] text-[#2563eb] px-2 py-1 rounded text-xs font-bold">STAGED</div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button className="material-symbols-outlined text-slate-500 hover:text-red-600">delete</button>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            <div className="space-y-6">
              <div className="glass-card rounded-xl overflow-hidden shadow-sm border border-primary/20">
                <div className="h-64 relative bg-slate-50 overflow-hidden">
                  <img src="https://images.unsplash.com/photo-1529333166437-7750a6dd5a70?auto=format&fit=crop&w=1200&q=80" className="w-full h-full object-cover grayscale opacity-60" />
                  <div className="absolute top-4 left-4 bg-[#0f172a]/80 text-white px-3 py-1 rounded-full text-xs">LIVE TRACKING ACTIVE</div>
                  <div className="absolute inset-0 bg-gradient-to-t from-[#2563eb]/20 to-transparent"></div>
                </div>
                <div className="p-4 space-y-3">
                  <div className="flex justify-between items-end">
                    <div>
                      <p className="text-xs text-slate-500">Current Location</p>
                      <p className="font-semibold">I-94 Eastbound Express</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-slate-500">ETA</p>
                      <p className="text-lg text-[#2563eb]">15:42</p>
                    </div>
                  </div>
                  <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
                    <div className="h-full bg-[#2563eb]" style={{ width: `${progress}%` }} />
                  </div>
                </div>
              </div>

              <div className="bg-[#2563eb] rounded-xl text-white p-6 shadow-xl relative overflow-hidden">
                <div className="absolute -right-10 -top-10 opacity-20 transform rotate-12">
                  <span className="material-symbols-outlined text-[140px]">smart_toy</span>
                </div>
                <div className="relative z-10">
                  <div className="flex items-center gap-2 mb-4">
                    <span className="material-symbols-outlined">auto_awesome</span>
                    <h4 className="font-bold uppercase text-xs">AI Optimization Insight</h4>
                  </div>
                  <p className="mb-4">"Route adjusted for 12% fuel savings. Recommend accelerating departure by 15 mins to avoid localized congestion near Sector 7."</p>
                  <button className="w-full bg-white/20 py-2 rounded-lg">Apply Schedule Update</button>
                </div>
              </div>

              <div className="space-y-3">
                <button className="w-full bg-[#2563eb] text-white font-bold h-12 rounded-lg">CONFIRM TRANSFER LOAD</button>
                <button className="w-full border-2 border-slate-200 text-slate-700 h-12 rounded-lg">DOWNLOAD MANIFEST (PDF)</button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

export default WarehouseTransfer
