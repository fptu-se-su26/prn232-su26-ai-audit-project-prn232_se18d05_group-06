import Sidebar from '../../components/Sidebar'

const productRows = [
  {
    sku: 'SKU-293-A',
    name: 'Precision Gasket Set',
    qty: 250,
    weight: '1.2kg',
    category: 'Industrial',
  },
  {
    sku: 'SKU-551-B',
    name: 'Hydraulic Valve Pro',
    qty: 15,
    weight: '14.5kg',
    category: 'Heavy Duty',
  },
]

const ImportGoods = () => {
  return (
    <div className="min-h-screen bg-[#f7f9fb] text-[#191c1e] antialiased overflow-hidden">
      <Sidebar />

      <header className="fixed top-0 right-0 w-[calc(100%-280px)] h-20 bg-white/80 backdrop-blur-md z-40 border-b border-slate-200/70 flex items-center justify-between px-8">
        <h1 className="text-2xl font-bold">Import Goods</h1>
        <div className="flex items-center gap-4">
          <button className="relative rounded-full p-2 text-slate-600 hover:bg-slate-100 transition-all duration-200">
            <span className="material-symbols-outlined">notifications</span>
            <span className="absolute top-1 right-1 h-2.5 w-2.5 rounded-full bg-red-600" />
          </button>
          <button className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-900 transition hover:bg-slate-200">
            <span className="material-symbols-outlined text-base">smart_toy</span>
            AI Status: Ready
          </button>
        </div>
      </header>

      <main className="ml-[280px] mt-20 p-8 pb-10 animate-fade-in-up">
        <div className="grid gap-6 lg:grid-cols-[1.75fr_1fr]">
          <div className="space-y-6">
            <section className="glass-card rounded-[28px] border border-white/80 p-6 shadow-xl shadow-slate-900/5">
              <div className="flex items-center gap-3 mb-6">
                <span className="material-symbols-outlined text-primary">local_shipping</span>
                <h2 className="text-xl font-semibold">Supplier Information</h2>
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-slate-500">Supplier Name</label>
                  <input className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none focus:border-primary focus:ring-2 focus:ring-primary/20" placeholder="e.g. Global Logistics Co." />
                </div>
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-slate-500">Supplier ID</label>
                  <input className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none focus:border-primary focus:ring-2 focus:ring-primary/20" placeholder="SUP-00923" />
                </div>
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-slate-500">Contact Person</label>
                  <input className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none focus:border-primary focus:ring-2 focus:ring-primary/20" placeholder="John Doe" />
                </div>
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-slate-500">Delivery Code</label>
                  <input className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none focus:border-primary focus:ring-2 focus:ring-primary/20" placeholder="DEL-8821-X" />
                </div>
              </div>
            </section>

            <section className="glass-card rounded-[28px] border border-white/80 p-6 shadow-xl shadow-slate-900/5">
              <div className="flex items-center justify-between gap-3 mb-5">
                <div className="flex items-center gap-3">
                  <span className="material-symbols-outlined text-primary">inventory</span>
                  <h2 className="text-xl font-semibold">Product Details</h2>
                </div>
                <button className="inline-flex items-center gap-2 rounded-full bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-700">
                  <span className="material-symbols-outlined">add_circle</span>
                  Add Row
                </button>
              </div>
              <div className="overflow-x-auto rounded-3xl border border-slate-200 bg-white">
                <table className="min-w-full text-left text-sm text-slate-700">
                  <thead className="border-b border-slate-200 bg-slate-50 text-slate-500">
                    <tr>
                      <th className="px-4 py-4 font-medium">SKU</th>
                      <th className="px-4 py-4 font-medium">Product Name</th>
                      <th className="px-4 py-4 font-medium">Qty</th>
                      <th className="px-4 py-4 font-medium">Weight</th>
                      <th className="px-4 py-4 font-medium">Category</th>
                      <th className="px-4 py-4" />
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {productRows.map((row) => (
                      <tr key={row.sku} className="hover:bg-slate-50 transition-colors duration-200">
                        <td className="px-4 py-4 font-semibold text-slate-900">{row.sku}</td>
                        <td className="px-4 py-4">{row.name}</td>
                        <td className="px-4 py-4">{row.qty}</td>
                        <td className="px-4 py-4">{row.weight}</td>
                        <td className="px-4 py-4">
                          <span className="inline-flex rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">
                            {row.category}
                          </span>
                        </td>
                        <td className="px-4 py-4 text-right">
                          <button className="rounded-full p-2 text-slate-400 hover:text-red-600 transition-colors duration-200">
                            <span className="material-symbols-outlined">delete</span>
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>

            <section className="glass-card rounded-[28px] border border-white/80 p-6 shadow-xl shadow-slate-900/5">
              <div className="flex items-center gap-3 mb-5">
                <span className="material-symbols-outlined text-primary">warehouse</span>
                <h2 className="text-xl font-semibold">Storage Placement</h2>
              </div>
              <div className="grid gap-4 md:grid-cols-3">
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-slate-500">Zone</label>
                  <select className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none focus:border-primary focus:ring-2 focus:ring-primary/20">
                    <option>Zone A (Cold Storage)</option>
                    <option>Zone B (Dry Goods)</option>
                    <option>Zone C (Hazmat)</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-slate-500">Shelf</label>
                  <select className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none focus:border-primary focus:ring-2 focus:ring-primary/20">
                    <option>Shelf S1-01</option>
                    <option>Shelf S1-02</option>
                    <option>Shelf S2-01</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-slate-500">Bin</label>
                  <select className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none focus:border-primary focus:ring-2 focus:ring-primary/20">
                    <option>Bin B10</option>
                    <option>Bin B11</option>
                    <option>Bin B12</option>
                  </select>
                </div>
              </div>
            </section>
          </div>

          <div className="space-y-6">
            <section className="glass-card rounded-[28px] border border-white/80 p-6 shadow-xl shadow-slate-900/5">
              <div className="flex items-center gap-3 mb-5">
                <span className="material-symbols-outlined text-primary">document_scanner</span>
                <h2 className="text-xl font-semibold">AI Invoice Scan</h2>
              </div>
              <div className="relative rounded-[28px] border-2 border-dashed border-primary/35 bg-slate-50 p-8 text-center">
                <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-transparent via-primary to-transparent" />
                <span className="material-symbols-outlined mb-4 inline-block text-4xl text-primary/70">cloud_upload</span>
                <p className="mx-auto max-w-xs text-sm text-slate-500">Drag and drop invoice PDF or image here to auto-fill details</p>
                <button className="mt-6 rounded-full bg-primary px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-primary/15 transition hover:bg-blue-700">
                  Browse Files
                </button>
              </div>
              <div className="mt-6 space-y-3 border-t border-slate-200 pt-5">
                <div className="flex justify-between rounded-2xl bg-white px-4 py-3 shadow-sm">
                  <span className="text-xs text-slate-500">Detected Supplier:</span>
                  <span className="font-semibold text-slate-900">Global Logistics Co.</span>
                </div>
                <div className="flex justify-between rounded-2xl bg-white px-4 py-3 shadow-sm">
                  <span className="text-xs text-slate-500">Detected Date:</span>
                  <span className="font-semibold text-slate-900">Oct 24, 2023</span>
                </div>
              </div>
            </section>

            <section className="glass-card rounded-[28px] border border-white/80 p-6 shadow-xl shadow-slate-900/5">
              <div className="flex items-center gap-3 mb-5">
                <span className="material-symbols-outlined text-primary">photo_camera</span>
                <h2 className="text-xl font-semibold">Condition Photo</h2>
              </div>
              <div className="relative overflow-hidden rounded-[28px] bg-slate-950">
                <img
                  className="h-64 w-full object-cover opacity-80"
                  src="https://images.unsplash.com/photo-1518780664697-55e3ad937233?auto=format&fit=crop&w=1200&q=80"
                  alt="Condition inspection"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent" />
                <div className="absolute top-4 right-4 rounded-full bg-white/90 p-2 shadow-lg">
                  <span className="material-symbols-outlined text-slate-900">camera</span>
                </div>
                <div className="absolute bottom-4 left-4 rounded-full bg-slate-900/90 px-3 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-white">
                  AI Analysis Active
                </div>
              </div>
            </section>

            <section className="glass-card rounded-[28px] border border-primary p-6 shadow-xl shadow-slate-900/5">
              <div className="flex items-center gap-3 mb-5">
                <span className="material-symbols-outlined text-primary">qr_code_2</span>
                <h2 className="text-xl font-semibold">Generated Tracking Label</h2>
              </div>
              <div className="grid gap-4">
                <div className="rounded-3xl bg-white p-4 shadow-sm">
                  <img
                    className="mx-auto h-36 w-36 object-contain"
                    src="https://images.unsplash.com/photo-1545239351-1141bd82e8a6?auto=format&fit=crop&w=400&q=80"
                    alt="QR code"
                  />
                </div>
                <div className="rounded-3xl bg-white p-5 shadow-sm">
                  <p className="text-xs text-slate-500">LABEL_ID: IMP-9921-X</p>
                  <p className="mt-2 text-sm font-semibold text-slate-900">Batch: North-Atlantic-A12</p>
                  <button className="mt-4 inline-flex items-center gap-2 rounded-full bg-slate-900 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-800">
                    <span className="material-symbols-outlined">print</span>
                    Print Label
                  </button>
                </div>
              </div>
            </section>
          </div>
        </div>

        <div className="mt-6 flex flex-col gap-4 sm:flex-row sm:justify-end">
          <button className="rounded-full border border-blue-600 bg-white px-8 py-4 text-sm font-bold text-blue-600 transition hover:bg-blue-50">
            Save Draft
          </button>
          <button className="rounded-full bg-blue-600 px-10 py-4 text-sm font-bold text-white shadow-[0_20px_50px_rgba(37,99,235,0.25)] transition hover:bg-blue-700">
            Confirm Import
          </button>
        </div>
      </main>
    </div>
  )
}

export default ImportGoods
