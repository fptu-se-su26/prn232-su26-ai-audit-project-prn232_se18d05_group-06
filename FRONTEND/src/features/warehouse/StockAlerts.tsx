import { useEffect, useRef } from 'react'
import Sidebar from '../../components/Sidebar'

const StockAlerts = () => {
  const cardsRef = useRef<HTMLDivElement[]>([])

  useEffect(() => {
    cardsRef.current.forEach((card, index) => {
      if (card) {
        card.style.opacity = '0'
        card.style.transform = 'translateY(20px)'
        setTimeout(() => {
          card.style.transition = 'all 0.5s ease-out'
          card.style.opacity = '1'
          card.style.transform = 'translateY(0)'
        }, index * 100)
      }
    })
  }, [])

  const addToCardsRef = (el: HTMLDivElement | null) => {
    if (el && !cardsRef.current.includes(el)) {
      cardsRef.current.push(el)
    }
  }

  return (
    <div className="min-h-screen bg-background text-on-surface antialiased overflow-hidden flex">
      <Sidebar />

      <main className="ml-[280px] flex-1 h-screen overflow-y-auto custom-scrollbar flex flex-col relative animate-fade-in-up">
        {/* Top Navigation */}
        <header className="sticky top-0 w-full h-20 bg-surface/75 backdrop-blur-md border-b border-outline-variant/30 flex justify-between items-center px-gutter z-40">
          <div className="flex items-center gap-4">
            <h2 className="font-headline-md text-headline-md font-bold text-on-surface">Stock Alerts</h2>
            <div className="h-6 w-px bg-outline-variant/50"></div>
            <span className="text-on-surface-variant font-label-md">
              System Health: <span className="text-primary font-bold">Optimal</span>
            </span>
          </div>
          
          <div className="flex items-center gap-6">
            <div className="relative group">
              <span className="material-symbols-outlined p-2 hover:bg-surface-container-high/50 rounded-full cursor-pointer transition-all duration-200">search</span>
            </div>
            
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined p-2 hover:bg-surface-container-high/50 rounded-full cursor-pointer transition-all duration-200">notifications</span>
              <span className="material-symbols-outlined p-2 hover:bg-surface-container-high/50 rounded-full cursor-pointer transition-all duration-200">smart_toy</span>
            </div>
            
            <div className="flex items-center gap-3 ml-2 pl-4 border-l border-outline-variant/30">
              <div className="text-right">
                <p className="font-label-md text-on-surface leading-none">Warehouse Staff</p>
                <p className="text-[10px] text-on-surface-variant uppercase tracking-wider">Sector A-12</p>
              </div>
              <div className="w-10 h-10 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center overflow-hidden">
                <img 
                  alt="User Profile" 
                  className="w-full h-full object-cover" 
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuA0hyBnUR7_hnYs1cCNEfeCcZzThnM76FZtVXItDSgV12eAVHB0RzWpshmH6dhIfZFa6ErcYVAIW5pbF8QmlK2fuvtXD0Tpbfn1tV1_q0ICPttg6rSSwtYNp6Hssv9gtiym1DrUCNBM64ZMpP9MXa-4YwmaLKSQHTXiv9IAkvvU6CDD1ERAIlKS6UnKg4nAYwSwpleL0uz1489QoiYWq5x_j-PZgqqlLNUn-xqD_8nB3ZHcH4g2YnTnGO_BxpxTa-CO8aDUpUJzCHsw" 
                />
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <div className="p-container_padding min-h-screen">
          {/* Statistics Bento Grid */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-gutter mb-stack_lg">
            {/* Low Stock Card */}
            <div ref={addToCardsRef} className="glass-card p-6 rounded-lg flex flex-col justify-between hover:glow-primary transition-all duration-300">
              <div className="flex justify-between items-start">
                <div className="w-12 h-12 rounded-xl bg-error/10 text-error flex items-center justify-center">
                  <span className="material-symbols-outlined">trending_down</span>
                </div>
                <span className="px-2 py-1 bg-error/10 text-error rounded text-[12px] font-bold">CRITICAL</span>
              </div>
              <div className="mt-4">
                <h3 className="text-on-surface-variant font-label-md">Low Stock</h3>
                <p className="text-display-lg font-display-lg leading-tight">24</p>
                <p className="text-error font-label-md mt-1">↑ 12% from yesterday</p>
              </div>
            </div>

            {/* Expiring Soon Card */}
            <div ref={addToCardsRef} className="glass-card p-6 rounded-lg flex flex-col justify-between hover:glow-primary transition-all duration-300">
              <div className="flex justify-between items-start">
                <div className="w-12 h-12 rounded-xl bg-secondary-container/20 text-on-secondary-container flex items-center justify-center">
                  <span className="material-symbols-outlined">event_busy</span>
                </div>
                <span className="px-2 py-1 bg-secondary-container/20 text-on-secondary-container rounded text-[12px] font-bold">UERGENT</span>
              </div>
              <div className="mt-4">
                <h3 className="text-on-surface-variant font-label-md">Expiring Soon</h3>
                <p className="text-display-lg font-display-lg leading-tight">08</p>
                <p className="text-on-surface-variant font-label-md mt-1">Sectors A, D, and F</p>
              </div>
            </div>

            {/* Long-term Storage */}
            <div ref={addToCardsRef} className="glass-card p-6 rounded-lg flex flex-col justify-between hover:glow-primary transition-all duration-300">
              <div className="flex justify-between items-start">
                <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                  <span className="material-symbols-outlined">hourglass_empty</span>
                </div>
                <span className="px-2 py-1 bg-primary/10 text-primary rounded text-[12px] font-bold">MONITOR</span>
              </div>
              <div className="mt-4">
                <h3 className="text-on-surface-variant font-label-md">Long-term Storage</h3>
                <p className="text-display-lg font-display-lg leading-tight">112</p>
                <p className="text-on-surface-variant font-label-md mt-1">Items &gt; 90 days</p>
              </div>
            </div>

            {/* Overstock */}
            <div ref={addToCardsRef} className="glass-card p-6 rounded-lg flex flex-col justify-between hover:glow-primary transition-all duration-300">
              <div className="flex justify-between items-start">
                <div className="w-12 h-12 rounded-xl bg-tertiary-container/10 text-tertiary flex items-center justify-center">
                  <span className="material-symbols-outlined">inventory</span>
                </div>
                <span className="px-2 py-1 bg-tertiary-container/10 text-tertiary rounded text-[12px] font-bold">INFO</span>
              </div>
              <div className="mt-4">
                <h3 className="text-on-surface-variant font-label-md">Overstock</h3>
                <p className="text-display-lg font-display-lg leading-tight">42</p>
                <p className="text-on-surface-variant font-label-md mt-1">High holding cost</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-gutter">
            {/* Detailed Alert Table */}
            <div className="lg:col-span-2 glass-card rounded-lg overflow-hidden flex flex-col">
              <div className="p-6 border-b border-outline-variant/30 flex justify-between items-center">
                <h3 className="font-headline-md text-headline-md">Active Alerts Inventory</h3>
                <button className="flex items-center gap-2 px-4 py-2 bg-surface-container-high rounded-lg hover:bg-surface-container-highest transition-colors font-label-md">
                  <span className="material-symbols-outlined text-[20px]">filter_list</span>
                  Filter Alerts
                </button>
              </div>
              
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-surface-container-low/50">
                      <th className="px-6 py-4 font-label-md text-outline">SKU</th>
                      <th className="px-6 py-4 font-label-md text-outline">Product</th>
                      <th className="px-6 py-4 font-label-md text-outline">Qty / Min</th>
                      <th className="px-6 py-4 font-label-md text-outline">Alert Type</th>
                      <th className="px-6 py-4 font-label-md text-outline">Severity</th>
                      <th className="px-6 py-4 font-label-md text-outline">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-outline-variant/20">
                    {/* Row 1 */}
                    <tr className="hover:bg-surface-container-high/20 transition-colors group">
                      <td className="px-6 py-4 font-data-mono text-primary">LOG-7239-X</td>
                      <td className="px-6 py-4">
                        <div className="font-body-md">Precision Gasket Set</div>
                        <div className="text-[12px] text-on-surface-variant">Industrial Mechanical</div>
                      </td>
                      <td className="px-6 py-4 font-data-mono">12 / <span className="text-outline">50</span></td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2 text-error">
                          <span className="material-symbols-outlined text-[18px]">report_problem</span>
                          <span className="font-label-md">Low Stock</span>
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
                    
                    {/* Row 2 */}
                    <tr className="bg-surface-container-low/20 hover:bg-surface-container-high/20 transition-colors group">
                      <td className="px-6 py-4 font-data-mono text-primary">ELC-1022-A</td>
                      <td className="px-6 py-4">
                        <div className="font-body-md">Lithium Core Cell</div>
                        <div className="text-[12px] text-on-surface-variant">Electronics / Power</div>
                      </td>
                      <td className="px-6 py-4 font-data-mono">85 / <span className="text-outline">100</span></td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2 text-secondary">
                          <span className="material-symbols-outlined text-[18px]">history</span>
                          <span className="font-label-md">Expiring</span>
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
                    
                    {/* Row 3 */}
                    <tr className="hover:bg-surface-container-high/20 transition-colors group">
                      <td className="px-6 py-4 font-data-mono text-primary">MEC-4450-Z</td>
                      <td className="px-6 py-4">
                        <div className="font-body-md">Hydraulic Valve B2</div>
                        <div className="text-[12px] text-on-surface-variant">Heavy Machinery</div>
                      </td>
                      <td className="px-6 py-4 font-data-mono">450 / <span className="text-outline">200</span></td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2 text-primary">
                          <span className="material-symbols-outlined text-[18px]">layers</span>
                          <span className="font-label-md">Overstock</span>
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
                    
                    {/* Row 4 */}
                    <tr className="bg-surface-container-low/20 hover:bg-surface-container-high/20 transition-colors group">
                      <td className="px-6 py-4 font-data-mono text-primary">CHM-8812-K</td>
                      <td className="px-6 py-4">
                        <div className="font-body-md">Solvent Cleaner 5L</div>
                        <div className="text-[12px] text-on-surface-variant">Chemical / Hazardous</div>
                      </td>
                      <td className="px-6 py-4 font-data-mono">5 / <span className="text-outline">20</span></td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2 text-error">
                          <span className="material-symbols-outlined text-[18px]">warning</span>
                          <span className="font-label-md">Critical Low</span>
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
              <div className="p-4 border-t border-outline-variant/30 flex justify-center mt-auto">
                <button className="text-primary font-label-md hover:underline">View All Active Alerts</button>
              </div>
            </div>

            {/* Right Column: AI & Trends */}
            <div className="space-y-gutter flex flex-col gap-6">
              {/* AI Prediction Panel */}
              <div ref={addToCardsRef} className="glass-card rounded-lg p-6 glow-primary-active border-primary/30 relative overflow-hidden">
                <div className="absolute top-0 right-0 p-4 opacity-10">
                  <span className="material-symbols-outlined text-[80px]">smart_toy</span>
                </div>
                
                <h3 className="font-headline-md text-headline-md mb-4 flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary">auto_awesome</span>
                  AI Prediction
                </h3>
                
                <div className="space-y-6 relative z-10">
                  <div className="p-4 bg-primary/5 rounded-lg border border-primary/10">
                    <p className="font-label-md text-on-surface mb-2">Out-of-Stock Risk</p>
                    <div className="flex items-end gap-4 mb-2">
                      <span className="text-headline-lg font-headline-lg text-primary leading-none">82%</span>
                      <span className="text-on-surface-variant font-label-md mb-1">Probability for Sector B</span>
                    </div>
                    <div className="w-full bg-outline-variant/30 h-2 rounded-full overflow-hidden">
                      <div className="bg-primary h-full w-[82%] rounded-full shadow-[0_0_8px_rgba(0,74,198,0.5)]"></div>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <h4 className="font-label-md text-outline uppercase tracking-widest text-[10px]">Upcoming Demand Spikes</h4>
                    
                    <div className="flex items-center gap-4">
                      <div className="flex-1">
                        <p className="font-body-md">Cold Storage Units</p>
                        <p className="text-[12px] text-on-surface-variant">Predicting +45% increase next week</p>
                      </div>
                      <div className="w-12 h-12 flex items-center justify-center text-primary">
                        <span className="material-symbols-outlined text-[32px]">trending_up</span>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-4">
                      <div className="flex-1">
                        <p className="font-body-md">Packaging Material</p>
                        <p className="text-[12px] text-on-surface-variant">Holiday season preparation start</p>
                      </div>
                      <div className="w-12 h-12 flex items-center justify-center text-secondary">
                        <span className="material-symbols-outlined text-[32px]">insights</span>
                      </div>
                    </div>
                  </div>
                  
                  <button className="w-full py-3 bg-primary text-on-primary rounded-lg font-label-md shadow-lg shadow-primary/20 hover:scale-[0.98] transition-transform flex items-center justify-center gap-2">
                    <span className="material-symbols-outlined text-[20px]">bolt</span>
                    Execute Smart Reorder
                  </button>
                </div>
              </div>

              {/* Demand Trend Mini Graph */}
              <div ref={addToCardsRef} className="glass-card rounded-lg p-6 overflow-hidden">
                <h3 className="font-label-md text-on-surface mb-4">Stock Velocity Trend</h3>
                <div className="h-32 w-full flex items-end gap-1 px-2">
                  <div className="flex-1 bg-primary/20 h-[40%] rounded-t-sm hover:bg-primary transition-all cursor-help" title="Mon: 40%"></div>
                  <div className="flex-1 bg-primary/20 h-[55%] rounded-t-sm hover:bg-primary transition-all cursor-help" title="Tue: 55%"></div>
                  <div className="flex-1 bg-primary/20 h-[45%] rounded-t-sm hover:bg-primary transition-all cursor-help" title="Wed: 45%"></div>
                  <div className="flex-1 bg-primary/20 h-[70%] rounded-t-sm hover:bg-primary transition-all cursor-help" title="Thu: 70%"></div>
                  <div className="flex-1 bg-primary/20 h-[85%] rounded-t-sm hover:bg-primary transition-all cursor-help" title="Fri: 85%"></div>
                  <div className="flex-1 bg-primary h-[95%] rounded-t-sm relative group cursor-help" title="Sat: 95%">
                    <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-on-surface text-on-primary text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">Peak Demand</div>
                  </div>
                  <div className="flex-1 bg-primary/20 h-[60%] rounded-t-sm hover:bg-primary transition-all cursor-help" title="Sun: 60%"></div>
                </div>
                <div className="flex justify-between mt-2 text-[10px] text-outline-variant font-data-mono">
                  <span>MON</span>
                  <span>WED</span>
                  <span>FRI</span>
                  <span>SUN</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Floating Action Button */}
      <button className="fixed bottom-10 right-10 w-16 h-16 bg-primary-container text-on-primary-container rounded-full shadow-2xl flex items-center justify-center glow-primary-active hover:scale-110 active:scale-95 transition-all z-50">
        <span className="material-symbols-outlined text-[32px]">add</span>
      </button>
    </div>
  )
}

export default StockAlerts
