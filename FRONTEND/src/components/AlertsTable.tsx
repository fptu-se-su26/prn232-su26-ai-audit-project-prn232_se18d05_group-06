const AlertsTable = () => {
  return (
    <div className="lg:col-span-2 glass-card rounded-lg overflow-hidden flex flex-col">
      <div className="p-6 border-b border-outline-variant/30 flex justify-between items-center">
        <h3 className="text-xl font-semibold">Active Alerts Inventory</h3>
        <button className="flex items-center gap-2 px-4 py-2 bg-surface-container-high rounded-lg hover:bg-surface-container-highest transition-colors text-sm">
          <span className="material-symbols-outlined">filter_list</span>
          Filter Alerts
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-surface-container-low/50">
              <th className="px-6 py-4 text-sm text-outline">SKU</th>
              <th className="px-6 py-4 text-sm text-outline">Product</th>
              <th className="px-6 py-4 text-sm text-outline">Qty / Min</th>
              <th className="px-6 py-4 text-sm text-outline">Alert Type</th>
              <th className="px-6 py-4 text-sm text-outline">Severity</th>
              <th className="px-6 py-4 text-sm text-outline">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-outline-variant/20">
            <tr className="hover:bg-surface-container-high/20 transition-colors group">
              <td className="px-6 py-4 font-mono text-primary">LOG-7239-X</td>
              <td className="px-6 py-4">
                <div className="font-medium">Precision Gasket Set</div>
                <div className="text-xs text-on-surface-variant">Industrial Mechanical</div>
              </td>
              <td className="px-6 py-4 font-mono">12 / <span className="text-outline">50</span></td>
              <td className="px-6 py-4">
                <div className="flex items-center gap-2 text-error">
                  <span className="material-symbols-outlined">report_problem</span>
                  <span className="text-sm">Low Stock</span>
                </div>
              </td>
              <td className="px-6 py-4">
                <span className="px-3 py-1 rounded-full bg-error text-on-error text-[12px] font-bold shadow-sm">CRITICAL</span>
              </td>
              <td className="px-6 py-4">
                <button className="p-2 rounded-full hover:bg-primary-container hover:text-on-primary-container transition-all">
                  <span className="material-symbols-outlined">shopping_cart_checkout</span>
                </button>
              </td>
            </tr>

            <tr className="bg-surface-container-low/20 hover:bg-surface-container-high/20 transition-colors group">
              <td className="px-6 py-4 font-mono text-primary">ELC-1022-A</td>
              <td className="px-6 py-4">
                <div className="font-medium">Lithium Core Cell</div>
                <div className="text-xs text-on-surface-variant">Electronics / Power</div>
              </td>
              <td className="px-6 py-4 font-mono">85 / <span className="text-outline">100</span></td>
              <td className="px-6 py-4">
                <div className="flex items-center gap-2 text-secondary">
                  <span className="material-symbols-outlined">history</span>
                  <span className="text-sm">Expiring</span>
                </div>
              </td>
              <td className="px-6 py-4">
                <span className="px-3 py-1 rounded-full bg-secondary-container text-on-secondary-container text-[12px] font-bold shadow-sm">WARNING</span>
              </td>
              <td className="px-6 py-4">
                <button className="p-2 rounded-full hover:bg-primary-container hover:text-on-primary-container transition-all">
                  <span className="material-symbols-outlined">move_up</span>
                </button>
              </td>
            </tr>

            <tr className="hover:bg-surface-container-high/20 transition-colors group">
              <td className="px-6 py-4 font-mono text-primary">MEC-4450-Z</td>
              <td className="px-6 py-4">
                <div className="font-medium">Hydraulic Valve B2</div>
                <div className="text-xs text-on-surface-variant">Heavy Machinery</div>
              </td>
              <td className="px-6 py-4 font-mono">450 / <span className="text-outline">200</span></td>
              <td className="px-6 py-4">
                <div className="flex items-center gap-2 text-primary">
                  <span className="material-symbols-outlined">layers</span>
                  <span className="text-sm">Overstock</span>
                </div>
              </td>
              <td className="px-6 py-4">
                <span className="px-3 py-1 rounded-full bg-primary-fixed text-on-primary-fixed-variant text-[12px] font-bold shadow-sm">OPTIMIZE</span>
              </td>
              <td className="px-6 py-4">
                <button className="p-2 rounded-full hover:bg-primary-container hover:text-on-primary-container transition-all">
                  <span className="material-symbols-outlined">sell</span>
                </button>
              </td>
            </tr>

            <tr className="bg-surface-container-low/20 hover:bg-surface-container-high/20 transition-colors group">
              <td className="px-6 py-4 font-mono text-primary">CHM-8812-K</td>
              <td className="px-6 py-4">
                <div className="font-medium">Solvent Cleaner 5L</div>
                <div className="text-xs text-on-surface-variant">Chemical / Hazardous</div>
              </td>
              <td className="px-6 py-4 font-mono">5 / <span className="text-outline">20</span></td>
              <td className="px-6 py-4">
                <div className="flex items-center gap-2 text-error">
                  <span className="material-symbols-outlined">warning</span>
                  <span className="text-sm">Critical Low</span>
                </div>
              </td>
              <td className="px-6 py-4">
                <span className="px-3 py-1 rounded-full bg-error text-on-error text-[12px] font-bold shadow-sm">CRITICAL</span>
              </td>
              <td className="px-6 py-4">
                <button className="p-2 rounded-full hover:bg-primary-container hover:text-on-primary-container transition-all">
                  <span className="material-symbols-outlined">shopping_cart_checkout</span>
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div className="p-4 border-t border-outline-variant/30 flex justify-center">
        <button className="text-primary hover:underline">View All Active Alerts</button>
      </div>
    </div>
  )
}

export default AlertsTable
