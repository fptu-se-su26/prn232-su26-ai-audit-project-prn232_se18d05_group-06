import { useState } from 'react'
import Sidebar from './components/Sidebar'

const productRows = [
  {
    sku: 'SL-H882-W',
    name: 'Precision Servo Motor',
    subtitle: 'OEM-Series 400',
    category: 'Electronics',
    quantity: '1,240',
    location: 'Warehouse North',
    locationMeta: 'Zone A / Shelf 4',
    updated: '2 hrs ago',
    status: 'In Stock',
    statusVariant: 'bg-emerald-100 text-emerald-700',
  },
  {
    sku: 'SL-X421-B',
    name: 'Titanium Alloy Bolt Set',
    subtitle: 'M12 Industrial',
    category: 'Heavy Duty',
    quantity: '42',
    location: 'South B',
    locationMeta: 'Zone F / Bin 12',
    updated: '15 min ago',
    status: 'Low Stock',
    statusVariant: 'bg-amber-100 text-amber-700',
  },
  {
    sku: 'SL-P009-Z',
    name: 'High-Cap Li-Ion Module',
    subtitle: 'Energy Unit 5kW',
    category: 'Electronics',
    quantity: '2,850',
    location: 'North A',
    locationMeta: 'Zone D / Shelf 2',
    updated: 'Yesterday',
    status: 'Overstock',
    statusVariant: 'bg-sky-100 text-sky-700',
  },
  {
    sku: 'SL-Q771-K',
    name: 'Structural Frame V2',
    subtitle: 'Polymer Resin 80',
    category: 'Construction',
    quantity: '0',
    location: 'Cold Storage',
    locationMeta: 'Zone R / Bin 5',
    updated: 'Just Now',
    status: 'Out of Stock',
    statusVariant: 'bg-rose-100 text-rose-700',
  },
]

const Inventory = () => {
  const [activeSku, setActiveSku] = useState<string | null>('SL-H882-W')

  return (
    <div className="min-h-screen bg-[#f7f9fb] text-[#191c1e] antialiased">
      <Sidebar />

      <header className="fixed top-0 right-0 w-[calc(100%-280px)] h-20 bg-white/80 backdrop-blur-md z-40 border-b border-slate-200/70 flex items-center justify-between px-8 shadow-sm">
        <div>
          <h1 className="text-2xl font-bold">Inventory Management</h1>
        </div>
        <div className="flex items-center gap-4">
          <div className="relative hidden xl:block w-96">
            <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">search</span>
            <input
              className="w-full rounded-full border border-slate-200 bg-white px-12 py-3 text-sm text-slate-700 outline-none focus:border-[#2563eb] focus:ring-2 focus:ring-[#2563eb]/20"
              placeholder="Global SKU Search..."
              type="text"
            />
          </div>
          <button className="relative rounded-full p-2 text-slate-600 hover:bg-slate-100 transition-all duration-200">
            <span className="material-symbols-outlined">notifications</span>
            <span className="absolute top-1 right-1 h-2.5 w-2.5 rounded-full bg-red-600" />
          </button>
          <button className="rounded-full bg-slate-100 px-4 py-2 text-sm font-semibold text-[#0f172a] transition hover:bg-slate-200 flex items-center gap-2">
            <span className="material-symbols-outlined">smart_toy</span>
            Warehouse Staff
          </button>
        </div>
      </header>

      <main className="ml-[280px] pt-28 pb-10 px-8">
        <div className="grid gap-6 xl:grid-cols-4">
          <div className="relative overflow-hidden rounded-[30px] border border-slate-200/70 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-md duration-300">
            <div className="absolute top-6 left-0 h-20 w-2 rounded-r-full bg-sky-500" />
            <div className="p-6">
              <div className="flex items-center justify-between gap-4 mb-5">
                <span className="rounded-2xl bg-sky-50 p-3 text-sky-700 shadow-sm">
                  <span className="material-symbols-outlined">inventory</span>
                </span>
              </div>
              <p className="text-sm uppercase tracking-[0.25em] text-slate-500">Total Products</p>
              <p className="mt-4 text-4xl font-black">12,458</p>
            </div>
          </div>
          <div className="relative overflow-hidden rounded-[30px] border border-slate-200/70 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-md duration-300">
            <div className="absolute top-6 left-0 h-20 w-2 rounded-r-full bg-cyan-400" />
            <div className="p-6">
              <div className="flex items-center justify-between gap-4 mb-5">
                <span className="rounded-2xl bg-cyan-50 p-3 text-cyan-700 shadow-sm">
                  <span className="material-symbols-outlined">warehouse</span>
                </span>
              </div>
              <p className="text-sm uppercase tracking-[0.25em] text-slate-500">Overstock Items</p>
              <p className="mt-4 text-4xl font-black">432</p>
            </div>
          </div>
          <div className="relative overflow-hidden rounded-[30px] border border-slate-200/70 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-md duration-300">
            <div className="absolute top-6 left-0 h-20 w-2 rounded-r-full bg-red-500" />
            <div className="p-6">
              <div className="flex items-center justify-between gap-4 mb-5">
                <span className="rounded-2xl bg-red-50 p-3 text-red-700 shadow-sm">
                  <span className="material-symbols-outlined">warning</span>
                </span>
              </div>
              <p className="text-sm uppercase tracking-[0.25em] text-slate-500">Low Stock Alerts</p>
              <p className="mt-4 text-4xl font-black">86</p>
            </div>
          </div>
          <div className="relative overflow-hidden rounded-[30px] border border-slate-200/70 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-md duration-300">
            <div className="absolute top-6 left-0 h-20 w-2 rounded-r-full bg-slate-900" />
            <div className="p-6">
              <div className="flex items-center justify-between gap-4 mb-5">
                <span className="rounded-2xl bg-slate-100 p-3 text-slate-900 shadow-sm">
                  <span className="material-symbols-outlined">event_busy</span>
                </span>
              </div>
              <p className="text-sm uppercase tracking-[0.25em] text-slate-500">Expiring Soon</p>
              <p className="mt-4 text-4xl font-black">24</p>
            </div>
          </div>
        </div>

        <section className="glass-card mt-6 rounded-[28px] border border-white/80 p-6 shadow-xl shadow-slate-900/5">
          <div className="grid gap-4 lg:grid-cols-[1.5fr_1fr_1fr_1fr]">
            <div>
              <label className="block text-xs uppercase tracking-[0.24em] text-slate-500 mb-2">Search SKU</label>
              <input className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20" placeholder="e.g. SL-2024-X" />
            </div>
            <div>
              <label className="block text-xs uppercase tracking-[0.24em] text-slate-500 mb-2">Category</label>
              <select className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20">
                <option>All Categories</option>
                <option>Electronics</option>
                <option>Heavy Duty</option>
              </select>
            </div>
            <div>
              <label className="block text-xs uppercase tracking-[0.24em] text-slate-500 mb-2">Warehouse Zone</label>
              <select className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20">
                <option>North A</option>
                <option>South B</option>
                <option>Cold Storage</option>
              </select>
            </div>
            <div>
              <label className="block text-xs uppercase tracking-[0.24em] text-slate-500 mb-2">Status</label>
              <select className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20">
                <option>All Status</option>
                <option>In Stock</option>
                <option>Low Stock</option>
              </select>
            </div>
          </div>
          <div className="mt-4 flex justify-end">
            <button className="rounded-2xl bg-[#2563eb] px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-[#2563eb]/15 transition hover:bg-[#1d4ed8]">
              Apply Filters
            </button>
          </div>
        </section>

        <section className="glass-card mt-6 overflow-hidden rounded-[28px] border border-slate-200/70 shadow-xl shadow-slate-900/5">
          <div className="overflow-x-auto">
            <table className="min-w-full text-left border-collapse">
              <thead className="bg-surface-container-low border-b border-slate-200/30">
                <tr>
                  <th className="px-6 py-4 text-xs uppercase tracking-[0.2em] text-slate-500">SKU</th>
                  <th className="px-6 py-4 text-xs uppercase tracking-[0.2em] text-slate-500">Product</th>
                  <th className="px-6 py-4 text-xs uppercase tracking-[0.2em] text-slate-500">Category</th>
                  <th className="px-6 py-4 text-xs uppercase tracking-[0.2em] text-slate-500">Quantity</th>
                  <th className="px-6 py-4 text-xs uppercase tracking-[0.2em] text-slate-500">Location</th>
                  <th className="px-6 py-4 text-xs uppercase tracking-[0.2em] text-slate-500">Last Updated</th>
                  <th className="px-6 py-4 text-xs uppercase tracking-[0.2em] text-slate-500">Status</th>
                  <th className="px-6 py-4" />
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200/20">
                {productRows.map((row) => (
                  <tr
                    key={row.sku}
                    className="cursor-pointer hover:bg-slate-50 transition-colors"
                    onClick={() => setActiveSku(row.sku)}
                  >
                    <td className="px-6 py-4 font-semibold text-[#2563eb]">{row.sku}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="h-12 w-12 rounded-xl bg-slate-100 flex items-center justify-center border border-slate-200">
                          <span className="material-symbols-outlined text-slate-500">inventory_2</span>
                        </div>
                        <div>
                          <p className="font-semibold text-slate-900">{row.name}</p>
                          <p className="text-xs text-slate-500">{row.subtitle}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-slate-700">{row.category}</td>
                    <td className="px-6 py-4 text-slate-900">{row.quantity} Units</td>
                    <td className="px-6 py-4">
                      <p className="font-semibold text-slate-900">{row.location}</p>
                      <p className="text-xs text-slate-500">{row.locationMeta}</p>
                    </td>
                    <td className="px-6 py-4 text-slate-700">{row.updated}</td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${row.statusVariant}`}>
                        {row.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button className="rounded-full p-2 text-slate-400 hover:bg-slate-100 transition-all">
                        <span className="material-symbols-outlined">more_vert</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="flex flex-col gap-4 border-t border-slate-200/30 bg-slate-50 px-6 py-4 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-slate-500">Showing 1 to 4 of 12,458 entries</p>
            <div className="flex gap-2">
              <button className="rounded-full border border-slate-200 px-4 py-2 text-sm text-slate-700 hover:bg-slate-100">Previous</button>
              <button className="rounded-full bg-[#2563eb] px-4 py-2 text-sm font-semibold text-white">1</button>
              <button className="rounded-full border border-slate-200 px-4 py-2 text-sm text-slate-700 hover:bg-slate-100">2</button>
              <button className="rounded-full border border-slate-200 px-4 py-2 text-sm text-slate-700 hover:bg-slate-100">Next</button>
            </div>
          </div>
        </section>
      </main>

      <aside className={`fixed top-0 right-0 z-50 h-full w-[500px] bg-[#f7f9fb] shadow-2xl border-l border-slate-200 overflow-y-auto transition-transform duration-500 ${activeSku ? 'translate-x-0' : 'translate-x-full'}`}>
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-200/30 bg-[#f7f9fb] px-8 py-6">
          <div>
            <h2 className="text-xl font-semibold">Product Detail</h2>
            <p className="text-sm text-slate-500">{activeSku}</p>
          </div>
          <button className="rounded-full p-2 text-slate-600 hover:bg-slate-100 transition" onClick={() => setActiveSku(null)}>
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>
        <div className="p-8 space-y-8 animate-fade-in-up">
          <div className="rounded-[28px] overflow-hidden border border-slate-200 bg-white shadow-sm">
            <img
              className="h-64 w-full object-cover"
              src="https://images.unsplash.com/photo-1518780664697-55e3ad937233?auto=format&fit=crop&w=1200&q=80"
              alt="Product detail"
            />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-3xl border border-slate-200 bg-white p-4">
              <p className="text-xs uppercase tracking-[0.24em] text-slate-500">Internal QR</p>
              <div className="mt-4 rounded-3xl bg-slate-100 p-4">
                <img className="mx-auto h-32 w-32" src="https://images.unsplash.com/photo-1545239351-1141bd82e8a6?auto=format&fit=crop&w=400&q=80" alt="QR code" />
              </div>
            </div>
            <div className="space-y-4">
              <div className="rounded-3xl border border-slate-200 bg-white p-4">
                <p className="text-xs uppercase tracking-[0.24em] text-slate-500">Current Stock</p>
                <p className="mt-3 text-3xl font-black text-[#111827]">1,240</p>
                <p className="text-xs text-slate-500">PCS</p>
              </div>
              <div className="rounded-3xl border border-slate-200 bg-white p-4">
                <p className="text-xs uppercase tracking-[0.24em] text-slate-500">Stock Value</p>
                <p className="mt-3 text-3xl font-black text-[#111827]">$14,880.00</p>
              </div>
            </div>
          </div>
          <div className="glass-card rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm font-semibold text-slate-900">Inventory History</p>
              <select className="rounded-full border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-700 outline-none">
                <option>Last 30 Days</option>
              </select>
            </div>
            <div className="h-40 rounded-3xl bg-slate-100" />
          </div>
          <div className="space-y-3">
            <div className="flex items-center gap-3 text-sm font-semibold text-slate-900">
              <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
              Received Batch #902
            </div>
            <p className="text-xs text-slate-500">Added +200 units from Supplier TechCore</p>
          </div>
          <div className="flex gap-3">
            <button className="flex-1 rounded-2xl bg-[#2563eb] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#1d4ed8]">
              Edit Item
            </button>
            <button className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50">
              Print
            </button>
          </div>
        </div>
      </aside>
    </div>
  )
}

export default Inventory
