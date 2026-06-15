import Sidebar from '../../components/Sidebar'
import { useMemo } from 'react'

const Reports = () => {
  const heatmapCells = useMemo(() => {
    return Array.from({ length: 60 }).map((_, i) => {
      const val = Math.random()
      let customClass = 'bg-surface-container-highest/30'
      
      if (val > 0.85) {
        customClass = 'bg-primary shadow-[0_0_15px_rgba(37,99,235,0.4)]'
      } else if (val > 0.6) {
        customClass = 'bg-primary/60'
      } else if (val > 0.3) {
        customClass = 'bg-primary/20'
      }

      return (
        <div 
          key={i} 
          className={`aspect-square rounded transition-transform duration-200 hover:scale-110 hover:z-10 cursor-pointer ${customClass}`}
        />
      )
    })
  }, [])

  return (
    <div className="min-h-screen bg-surface text-on-surface antialiased overflow-hidden flex">
      <Sidebar />

      <main className="ml-[280px] h-screen flex-1 flex flex-col relative overflow-hidden bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-primary-fixed/20 via-surface to-surface">
        {/* Top Navbar */}
        <header className="flex justify-between items-center h-20 px-gutter bg-surface/75 backdrop-blur-md sticky top-0 z-40 border-b border-outline-variant/30 shrink-0">
          <div>
            <h1 className="font-headline-lg text-headline-lg font-bold text-on-surface">Warehouse Reports</h1>
            <p className="text-on-surface-variant font-body-md text-body-md">Real-time logistics analytics & insights</p>
          </div>
          <div className="flex items-center gap-stack_md">
            <div className="relative group">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline">search</span>
              <input 
                className="pl-10 pr-4 py-2 bg-surface-container-low border-none rounded-full w-64 focus:ring-2 focus:ring-primary/20 transition-all group-focus-within:w-80" 
                placeholder="Search reports..." 
                type="text"
              />
            </div>
            <button className="p-2 hover:bg-surface-container-high/50 rounded-full transition-all duration-200">
              <span className="material-symbols-outlined text-primary">notifications</span>
            </button>
            <button className="p-2 hover:bg-surface-container-high/50 rounded-full transition-all duration-200">
              <span className="material-symbols-outlined text-primary">smart_toy</span>
            </button>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-container_padding pt-8 flex flex-col gap-stack_lg custom-scrollbar animate-fade-in-up">
          {/* Top Filters Section */}
          <section className="flex flex-wrap items-center gap-4">
            <div className="glass-card px-4 py-2 rounded-lg flex items-center gap-3">
              <span className="material-symbols-outlined text-primary">calendar_today</span>
              <select className="bg-transparent border-none focus:ring-0 font-label-md text-label-md py-0 text-on-surface">
                <option>Last 30 Days</option>
                <option>Last Quarter</option>
                <option>Year to Date</option>
              </select>
            </div>
            <div className="glass-card px-4 py-2 rounded-lg flex items-center gap-3">
              <span className="material-symbols-outlined text-primary">warehouse</span>
              <select className="bg-transparent border-none focus:ring-0 font-label-md text-label-md py-0 text-on-surface">
                <option>Global Warehouse (Zone A-F)</option>
                <option>East Distribution Hub</option>
                <option>West Cold Storage</option>
              </select>
            </div>
            <div className="glass-card px-4 py-2 rounded-lg flex items-center gap-3">
              <span className="material-symbols-outlined text-primary">category</span>
              <select className="bg-transparent border-none focus:ring-0 font-label-md text-label-md py-0 text-on-surface">
                <option>All Product Categories</option>
                <option>Electronics</option>
                <option>Automotive Parts</option>
              </select>
            </div>
            <div className="ml-auto flex gap-2">
              <button className="flex items-center gap-2 px-4 py-2 rounded-lg bg-surface-container-highest hover:bg-surface-variant transition-colors">
                <span className="material-symbols-outlined text-sm">download</span>
                <span className="font-label-md text-label-md">Export PDF</span>
              </button>
              <button className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-on-primary shadow-[0_0_15px_rgba(37,99,235,0.4)] hover:opacity-90 transition-opacity">
                <span className="material-symbols-outlined text-sm">file_download</span>
                <span className="font-label-md text-label-md text-on-primary">Full CSV Report</span>
              </button>
            </div>
          </section>

          {/* Analytics Grid (Bento Style) */}
          <section className="grid grid-cols-12 gap-gutter pb-8 mt-6">
            {/* Inventory Trends Chart */}
            <div className="col-span-12 lg:col-span-8 glass-card p-6 rounded-2xl flex flex-col gap-4 min-h-[400px]">
              <div className="flex justify-between items-center">
                <h3 className="font-headline-md text-headline-md font-bold">Inventory Trends</h3>
                <div className="flex gap-2">
                  <span className="px-3 py-1 rounded-full bg-primary-container/20 text-primary font-label-md text-label-md">Inbound</span>
                  <span className="px-3 py-1 rounded-full bg-secondary-container/20 text-secondary font-label-md text-label-md">Outbound</span>
                </div>
              </div>
              <div className="flex-grow flex items-end justify-between relative pt-10">
                {/* Faux SVG Line Chart */}
                <div className="absolute inset-0 flex items-center justify-center opacity-40">
                  <img 
                    alt="Analytics Dashboard Graphics" 
                    className="w-full h-full object-cover rounded-lg" 
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuBGDFasTH3KWmwei1cj62fmm9QAuJC64hjzdZHux1nFbanAGRMl0-dI9cSolImm17WKhbikTBSsV11jmMWcThDJas0aQFOnbYmKsGL6IJ8EnqifbkZpzTK2KWOt6AdgpiCldd7MZs3YNjf2xbCDzEqlbk5LO3gkSB3WdgtLekDgBe3KVw1qWI4u-u5k5C98t_ZX8ig0lcvzsPTkzV86SOLpXOxy3nqiJSvWLUy4sZDrA3f5d582RyNT6nD_otymqAxu28EyQhUnOZDL"
                  />
                </div>
                <div className="w-full h-full flex items-end gap-2 z-10">
                  <div className="h-[50%] w-full bg-gradient-to-t from-primary/30 to-transparent rounded-t-xl border-t-2 border-primary border-dashed relative group cursor-pointer transition-all hover:bg-primary/50">
                    <div className="hidden group-hover:block absolute -top-8 left-1/2 -translate-x-1/2 bg-inverse-surface text-on-primary text-xs px-2 py-1 rounded">Stock: 14.2k</div>
                  </div>
                  <div className="h-[66%] w-full bg-gradient-to-t from-secondary/30 to-transparent rounded-t-xl border-t-2 border-secondary border-dashed transition-all hover:bg-secondary/50"></div>
                  <div className="h-[75%] w-full bg-gradient-to-t from-primary/30 to-transparent rounded-t-xl border-t-2 border-primary border-dashed transition-all hover:bg-primary/50"></div>
                  <div className="h-[60%] w-full bg-gradient-to-t from-secondary/30 to-transparent rounded-t-xl border-t-2 border-secondary border-dashed transition-all hover:bg-secondary/50"></div>
                  <div className="h-[80%] w-full bg-gradient-to-t from-primary/30 to-transparent rounded-t-xl border-t-2 border-primary border-dashed transition-all hover:bg-primary/50"></div>
                  <div className="h-[90%] w-full bg-gradient-to-t from-secondary/30 to-transparent rounded-t-xl border-t-2 border-secondary border-dashed transition-all hover:bg-secondary/50"></div>
                </div>
              </div>
            </div>

            {/* Warehouse Occupancy Donut */}
            <div className="col-span-12 md:col-span-6 lg:col-span-4 glass-card p-6 rounded-2xl flex flex-col items-center justify-center text-center gap-6">
              <h3 className="font-headline-md text-headline-md font-bold self-start">Storage Capacity</h3>
              <div className="relative w-48 h-48">
                <div className="absolute inset-0 rounded-full border-[12px] border-surface-container-highest"></div>
                <div className="absolute inset-0 rounded-full border-[12px] border-primary border-t-transparent border-r-transparent rotate-45 shadow-[0_0_15px_rgba(37,99,235,0.2)]"></div>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-display-lg font-display-lg font-bold text-primary tracking-tight">82%</span>
                  <span className="font-label-md text-label-md text-on-surface-variant uppercase tracking-wider">Occupied</span>
                </div>
              </div>
              <div className="w-full space-y-3 mt-4">
                <div className="flex justify-between items-center bg-surface-container-low p-2 rounded-lg">
                  <span className="text-body-md text-on-surface font-medium">Rack Storage</span>
                  <span className="font-data-mono text-data-mono font-bold text-primary">94%</span>
                </div>
                <div className="flex justify-between items-center bg-surface-container-low p-2 rounded-lg">
                  <span className="text-body-md text-on-surface font-medium">Bulk Area</span>
                  <span className="font-data-mono text-data-mono font-bold text-secondary">68%</span>
                </div>
              </div>
            </div>

            {/* Import/Export Volume */}
            <div className="col-span-12 md:col-span-6 lg:col-span-4 glass-card p-6 rounded-2xl">
              <h3 className="font-headline-md text-headline-md font-bold mb-8">Movement Volume</h3>
              <div className="space-y-8">
                <div>
                  <div className="flex justify-between mb-3">
                    <span className="font-label-md text-label-md font-bold">Imports</span>
                    <span className="text-primary font-bold">4.2k Units</span>
                  </div>
                  <div className="h-4 w-full bg-surface-container-highest rounded-full overflow-hidden">
                    <div className="h-full bg-primary shadow-[0_0_10px_rgba(37,99,235,0.6)] w-4/5 rounded-full transition-all duration-1000"></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between mb-3">
                    <span className="font-label-md text-label-md font-bold">Exports</span>
                    <span className="text-secondary font-bold">3.8k Units</span>
                  </div>
                  <div className="h-4 w-full bg-surface-container-highest rounded-full overflow-hidden">
                    <div className="h-full bg-secondary shadow-[0_0_10px_rgba(0,104,122,0.6)] w-3/5 rounded-full transition-all duration-1000"></div>
                  </div>
                </div>
              </div>
            </div>

            {/* Product Movement Velocity */}
            <div className="col-span-12 lg:col-span-8 glass-card p-6 rounded-2xl">
              <h3 className="font-headline-md text-headline-md font-bold mb-4">Stock Velocity</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="border-b border-outline-variant/30">
                      <th className="pb-3 font-label-md text-label-md text-on-surface-variant font-bold">SKU</th>
                      <th className="pb-3 font-label-md text-label-md text-on-surface-variant font-bold">Category</th>
                      <th className="pb-3 font-label-md text-label-md text-on-surface-variant font-bold text-right">Turnover Rate</th>
                      <th className="pb-3 font-label-md text-label-md text-on-surface-variant font-bold text-right">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-outline-variant/10">
                    <tr className="hover:bg-primary/5 transition-colors group">
                      <td className="py-4 font-data-mono text-data-mono font-medium">#992-BXA</td>
                      <td className="py-4 text-body-md font-medium">Li-Ion Batteries</td>
                      <td className="py-4 text-right">
                        <span className="text-error font-bold">1.2d</span>
                      </td>
                      <td className="py-4 text-right">
                        <span className="px-2 py-1 rounded bg-error/10 text-error text-[10px] font-black tracking-wider uppercase">Critical</span>
                      </td>
                    </tr>
                    <tr className="hover:bg-primary/5 transition-colors group">
                      <td className="py-4 font-data-mono text-data-mono font-medium">#102-KLT</td>
                      <td className="py-4 text-body-md font-medium">Motor Housing</td>
                      <td className="py-4 text-right">
                        <span className="text-primary font-bold">4.8d</span>
                      </td>
                      <td className="py-4 text-right">
                        <span className="px-2 py-1 rounded bg-primary-container/30 text-primary text-[10px] font-black tracking-wider uppercase">Healthy</span>
                      </td>
                    </tr>
                    <tr className="hover:bg-primary/5 transition-colors group">
                      <td className="py-4 font-data-mono text-data-mono font-medium">#551-ZZP</td>
                      <td className="py-4 text-body-md font-medium">Sensor Modules</td>
                      <td className="py-4 text-right">
                        <span className="text-secondary font-bold">3.1d</span>
                      </td>
                      <td className="py-4 text-right">
                        <span className="px-2 py-1 rounded bg-secondary-container/30 text-secondary text-[10px] font-black tracking-wider uppercase">Fast Move</span>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* 2D/3D Warehouse Utilization Heatmap */}
            <div className="col-span-12 glass-card p-8 rounded-2xl">
              <div className="flex justify-between items-center mb-8">
                <div>
                  <h3 className="font-headline-md text-headline-md font-bold">Zone Utilization Heatmap</h3>
                  <p className="text-on-surface-variant text-body-md">Live density visualizer for Warehouse Alpha</p>
                </div>
                <div className="flex items-center gap-4 bg-surface-container-low px-4 py-2 rounded-full">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded bg-surface-container-highest"></div>
                    <span className="text-xs text-on-surface-variant font-bold">Low</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded bg-primary/50"></div>
                    <span className="text-xs text-on-surface-variant font-bold">Optimal</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded bg-primary shadow-[0_0_8px_rgba(37,99,235,0.6)]"></div>
                    <span className="text-xs text-on-surface-variant font-bold">High Density</span>
                  </div>
                </div>
              </div>

              {/* Heatmap Grid */}
              <div className="bg-on-surface/5 p-6 rounded-2xl border border-outline-variant/20">
                <div className="grid grid-cols-12 gap-8">
                  {/* Zones */}
                  <div className="col-span-12 md:col-span-3 flex flex-row md:flex-col gap-4">
                    <div className="flex-1 p-5 rounded-xl bg-primary text-on-primary shadow-[0_0_15px_rgba(37,99,235,0.4)]">
                      <p className="text-xs font-bold uppercase tracking-widest opacity-80 mb-1">Zone A</p>
                      <p className="text-2xl font-black">92% Load</p>
                    </div>
                    <div className="flex-1 p-5 rounded-xl glass-card border-l-4 border-secondary">
                      <p className="text-xs font-bold uppercase tracking-widest text-on-surface-variant mb-1">Zone B</p>
                      <p className="text-2xl font-black text-on-surface">45% Load</p>
                    </div>
                    <div className="flex-1 p-5 rounded-xl glass-card border-l-4 border-outline-variant">
                      <p className="text-xs font-bold uppercase tracking-widest text-on-surface-variant mb-1">Zone C</p>
                      <p className="text-2xl font-black text-on-surface">12% Load</p>
                    </div>
                  </div>
                  
                  {/* Visual Heatmap Grid */}
                  <div className="col-span-12 md:col-span-9 flex items-center justify-center">
                    <div className="grid grid-cols-12 gap-1 w-full max-w-3xl">
                      {heatmapCells}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </div>

        {/* AI Assistant FAB */}
        <button className="absolute bottom-10 right-10 w-16 h-16 bg-primary text-on-primary rounded-full shadow-[0_0_20px_rgba(37,99,235,0.6)] flex items-center justify-center hover:scale-110 transition-transform z-50 group">
          <span className="material-symbols-outlined text-3xl">smart_toy</span>
          <div className="absolute right-20 bg-inverse-surface text-on-primary px-4 py-2 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap text-sm font-bold shadow-xl">
            How can I help with the reports?
          </div>
        </button>
      </main>
    </div>
  )
}

export default Reports
