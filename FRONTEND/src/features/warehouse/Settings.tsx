import { useState } from 'react'
import Sidebar from '../../components/Sidebar'

const Settings = () => {
  const [activeTab, setActiveTab] = useState<'pref' | 'notif' | 'theme'>('pref')
  const [activeTheme, setActiveTheme] = useState<'light' | 'dark' | 'system'>('dark')
  
  const [autoPrint, setAutoPrint] = useState(true)
  const [autoForklift, setAutoForklift] = useState(false)
  const [scannerSens, setScannerSens] = useState(7)

  return (
    <div className="min-h-screen bg-surface text-on-surface antialiased overflow-hidden flex">
      <Sidebar />

      <main className="ml-[280px] flex-1 flex flex-col relative overflow-hidden bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-primary-fixed/20 via-surface to-surface">
        {/* Top Navbar */}
        <header className="sticky top-0 w-full h-20 bg-surface/75 backdrop-blur-md border-b border-outline-variant/30 flex justify-between items-center px-gutter z-40 shrink-0">
          <div className="flex flex-col">
            <h1 className="font-headline-md text-headline-md font-bold text-on-surface">Settings</h1>
            <p className="text-[12px] text-on-surface-variant uppercase tracking-widest font-bold">Configure your workspace</p>
          </div>
          <div className="flex items-center gap-6">
            <div className="relative w-72 group">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline">search</span>
              <input 
                className="w-full pl-10 pr-4 py-2 bg-surface-container rounded-full border-none focus:ring-2 focus:ring-primary text-body-md transition-all group-focus-within:w-80" 
                placeholder="Search settings..." 
                type="text" 
              />
            </div>
            <div className="flex items-center gap-2">
              <button className="p-2 text-on-surface-variant hover:bg-surface-container-high/50 rounded-full transition-all duration-200">
                <span className="material-symbols-outlined">notifications</span>
              </button>
              <button className="p-2 text-on-surface-variant hover:bg-surface-container-high/50 rounded-full transition-all duration-200">
                <span className="material-symbols-outlined">smart_toy</span>
              </button>
              <div className="h-6 w-[1px] bg-outline-variant/50 mx-2"></div>
              <span className="font-label-md text-label-md text-on-surface-variant whitespace-nowrap">Warehouse Staff</span>
            </div>
          </div>
        </header>

        {/* Canvas Area */}
        <div className="p-container_padding flex-1 overflow-y-auto space-y-stack_lg custom-scrollbar animate-fade-in-up">
          
          {/* Tabbed Navigation */}
          <div className="flex gap-stack_lg border-b border-outline-variant/30 overflow-x-auto no-scrollbar">
            <button 
              className={`pb-4 font-label-md text-label-md border-b-2 transition-all duration-200 ${activeTab === 'pref' ? 'border-primary text-primary' : 'border-transparent text-on-surface-variant hover:text-on-surface'}`}
              onClick={() => setActiveTab('pref')}
            >
              Warehouse Preferences
            </button>
            <button 
              className={`pb-4 font-label-md text-label-md border-b-2 transition-all duration-200 ${activeTab === 'notif' ? 'border-primary text-primary' : 'border-transparent text-on-surface-variant hover:text-on-surface'}`}
              onClick={() => setActiveTab('notif')}
            >
              Notification Settings
            </button>
            <button 
              className={`pb-4 font-label-md text-label-md border-b-2 transition-all duration-200 ${activeTab === 'theme' ? 'border-primary text-primary' : 'border-transparent text-on-surface-variant hover:text-on-surface'}`}
              onClick={() => setActiveTab('theme')}
            >
              System / Theme
            </button>
          </div>

          <div className="grid grid-cols-12 gap-gutter pb-32">
            
            {/* Section: Warehouse Preferences */}
            {activeTab === 'pref' && (
              <section className="col-span-12 lg:col-span-8 space-y-stack_md animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="glass-card p-6 rounded-2xl shadow-sm space-y-stack_lg">
                  <div>
                    <h2 className="font-headline-md text-headline-md text-on-surface font-bold mb-2">Default Warehouse</h2>
                    <p className="text-body-md text-on-surface-variant">Set your primary operation zone for auto-routing.</p>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-stack_md">
                    <div className="relative group">
                      <label className="absolute -top-2.5 left-4 bg-surface px-1 text-[12px] font-bold text-primary transition-all group-focus-within:text-primary-fixed-dim">Warehouse Location</label>
                      <select className="w-full px-4 py-4 bg-transparent border-2 border-outline-variant rounded-xl focus:border-primary focus:ring-0 text-body-md appearance-none">
                        <option>Main Distribution Center - North Wing</option>
                        <option>Satellite Hub - East Sector</option>
                        <option>Automated Cold Storage - Level 2</option>
                      </select>
                      <span className="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">expand_more</span>
                    </div>
                    
                    <div className="relative group">
                      <label className="absolute -top-2.5 left-4 bg-surface px-1 text-[12px] font-bold text-outline transition-all group-focus-within:text-primary">Scanner Sensitivity</label>
                      <input 
                        className="w-full mt-6 h-2 bg-surface-container-high rounded-lg appearance-none cursor-pointer accent-primary" 
                        max="10" 
                        min="1" 
                        type="range" 
                        value={scannerSens}
                        onChange={(e) => setScannerSens(parseInt(e.target.value))}
                      />
                      <div className="flex justify-between text-[10px] font-bold text-on-surface-variant mt-2">
                        <span>LOW</span>
                        <span>RECOMMENDED</span>
                        <span>HIGH</span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4 pt-4">
                    <div className="flex items-center justify-between p-4 bg-surface-container-low rounded-xl border border-outline-variant/30">
                      <div className="flex gap-4 items-center">
                        <div className="p-3 bg-secondary-container/20 rounded-xl text-secondary">
                          <span className="material-symbols-outlined">print</span>
                        </div>
                        <div>
                          <h4 className="font-label-md text-label-md text-on-surface font-bold">Auto-print labels</h4>
                          <p className="text-[12px] text-on-surface-variant">Automatically print SKU tags on item registration</p>
                        </div>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input 
                          type="checkbox" 
                          className="sr-only peer" 
                          checked={autoPrint}
                          onChange={(e) => setAutoPrint(e.target.checked)}
                        />
                        <div className="w-12 h-6 bg-outline-variant peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                      </label>
                    </div>

                    <div className="flex items-center justify-between p-4 bg-surface-container-low rounded-xl border border-outline-variant/30">
                      <div className="flex gap-4 items-center">
                        <div className="p-3 bg-primary-container/20 rounded-xl text-primary">
                          <span className="material-symbols-outlined">precision_manufacturing</span>
                        </div>
                        <div>
                          <h4 className="font-label-md text-label-md text-on-surface font-bold">Autonomous Forklift Assist</h4>
                          <p className="text-[12px] text-on-surface-variant">Enable AI pathfinding for pick-up requests</p>
                        </div>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input 
                          type="checkbox" 
                          className="sr-only peer"
                          checked={autoForklift}
                          onChange={(e) => setAutoForklift(e.target.checked)}
                        />
                        <div className="w-12 h-6 bg-outline-variant peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                      </label>
                    </div>
                  </div>
                </div>
              </section>
            )}

            {/* Section: Notification Settings */}
            {activeTab === 'notif' && (
              <section className="col-span-12 lg:col-span-8 space-y-stack_md animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="glass-card p-6 rounded-2xl shadow-sm space-y-stack_lg">
                  <div className="flex justify-between items-center">
                    <div>
                      <h2 className="font-headline-md text-headline-md text-on-surface font-bold mb-2">Alert Preferences</h2>
                      <p className="text-body-md text-on-surface-variant">Choose how you receive system-wide updates.</p>
                    </div>
                    <button className="px-6 py-2 bg-primary text-on-primary rounded-lg font-label-md text-label-md shadow-[0_0_15px_rgba(37,99,235,0.4)] hover:opacity-90 transition-all">Enable All</button>
                  </div>
                  
                  <div className="overflow-hidden border border-outline-variant/30 rounded-xl">
                    <table className="w-full text-left border-collapse">
                      <thead className="bg-surface-container-high/50 font-label-md text-[12px] text-on-surface-variant uppercase tracking-wider">
                        <tr>
                          <th className="px-6 py-4 font-bold">Event Type</th>
                          <th className="px-6 py-4 text-center font-bold">Email</th>
                          <th className="px-6 py-4 text-center font-bold">Push</th>
                          <th className="px-6 py-4 text-center font-bold">SMS</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-outline-variant/30 font-body-md text-on-surface">
                        <tr className="hover:bg-primary-container/5 transition-colors">
                          <td className="px-6 py-4">Stock Levels Low</td>
                          <td className="px-6 py-4 text-center"><input type="checkbox" defaultChecked className="w-5 h-5 rounded border-outline-variant text-primary focus:ring-primary bg-transparent" /></td>
                          <td className="px-6 py-4 text-center"><input type="checkbox" defaultChecked className="w-5 h-5 rounded border-outline-variant text-primary focus:ring-primary bg-transparent" /></td>
                          <td className="px-6 py-4 text-center"><input type="checkbox" className="w-5 h-5 rounded border-outline-variant text-primary focus:ring-primary bg-transparent" /></td>
                        </tr>
                        <tr className="bg-surface-container-low/30 hover:bg-primary-container/5 transition-colors">
                          <td className="px-6 py-4">Inbound Shipments</td>
                          <td className="px-6 py-4 text-center"><input type="checkbox" defaultChecked className="w-5 h-5 rounded border-outline-variant text-primary focus:ring-primary bg-transparent" /></td>
                          <td className="px-6 py-4 text-center"><input type="checkbox" className="w-5 h-5 rounded border-outline-variant text-primary focus:ring-primary bg-transparent" /></td>
                          <td className="px-6 py-4 text-center"><input type="checkbox" className="w-5 h-5 rounded border-outline-variant text-primary focus:ring-primary bg-transparent" /></td>
                        </tr>
                        <tr className="hover:bg-primary-container/5 transition-colors">
                          <td className="px-6 py-4">Security Thresholds</td>
                          <td className="px-6 py-4 text-center"><input type="checkbox" defaultChecked className="w-5 h-5 rounded border-outline-variant text-primary focus:ring-primary bg-transparent" /></td>
                          <td className="px-6 py-4 text-center"><input type="checkbox" defaultChecked className="w-5 h-5 rounded border-outline-variant text-primary focus:ring-primary bg-transparent" /></td>
                          <td className="px-6 py-4 text-center"><input type="checkbox" defaultChecked className="w-5 h-5 rounded border-outline-variant text-primary focus:ring-primary bg-transparent" /></td>
                        </tr>
                        <tr className="bg-surface-container-low/30 hover:bg-primary-container/5 transition-colors">
                          <td className="px-6 py-4">System Maintenance</td>
                          <td className="px-6 py-4 text-center"><input type="checkbox" defaultChecked className="w-5 h-5 rounded border-outline-variant text-primary focus:ring-primary bg-transparent" /></td>
                          <td className="px-6 py-4 text-center"><input type="checkbox" className="w-5 h-5 rounded border-outline-variant text-primary focus:ring-primary bg-transparent" /></td>
                          <td className="px-6 py-4 text-center"><input type="checkbox" className="w-5 h-5 rounded border-outline-variant text-primary focus:ring-primary bg-transparent" /></td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              </section>
            )}

            {/* Section: Theme Switcher */}
            {activeTab === 'theme' && (
              <section className="col-span-12 lg:col-span-8 space-y-stack_md animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="glass-card p-6 rounded-2xl shadow-sm space-y-stack_lg">
                  <div>
                    <h2 className="font-headline-md text-headline-md text-on-surface font-bold mb-2">Visual Appearance</h2>
                    <p className="text-body-md text-on-surface-variant">Customize your workspace for peak focus.</p>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-stack_md">
                    {/* Light Mode */}
                    <button 
                      className={`group relative flex flex-col items-center p-4 rounded-2xl border-2 transition-all ${activeTheme === 'light' ? 'border-primary bg-surface shadow-[0_0_15px_rgba(37,99,235,0.4)]' : 'border-outline-variant bg-white hover:border-primary/50'}`}
                      onClick={() => setActiveTheme('light')}
                    >
                      <div className="w-full aspect-video rounded-xl bg-surface flex items-center justify-center mb-4 overflow-hidden border border-outline-variant/30">
                        <div className="w-1/2 h-full bg-white shadow-lg"></div>
                        <div className="w-1/2 h-full bg-surface-container"></div>
                      </div>
                      <span className={`font-label-md text-label-md ${activeTheme === 'light' ? 'text-primary' : 'text-on-surface'}`}>Prism Light</span>
                      <div className={`absolute top-3 right-3 transition-opacity ${activeTheme === 'light' ? 'opacity-100' : 'opacity-0 group-hover:opacity-50'}`}>
                        <span className="material-symbols-outlined text-primary" style={{ fontVariationSettings: activeTheme === 'light' ? "'FILL' 1" : "'FILL' 0" }}>
                          {activeTheme === 'light' ? 'check_circle' : 'radio_button_unchecked'}
                        </span>
                      </div>
                    </button>
                    
                    {/* Dark Mode */}
                    <button 
                      className={`group relative flex flex-col items-center p-4 rounded-2xl border-2 transition-all ${activeTheme === 'dark' ? 'border-primary bg-on-surface shadow-[0_0_15px_rgba(37,99,235,0.4)]' : 'border-outline-variant bg-on-surface hover:border-primary/50'}`}
                      onClick={() => setActiveTheme('dark')}
                    >
                      <div className="w-full aspect-video rounded-xl bg-on-surface-variant flex items-center justify-center mb-4 overflow-hidden border border-white/10">
                        <div className="w-1/2 h-full bg-black"></div>
                        <div className="w-1/2 h-full bg-on-surface"></div>
                      </div>
                      <span className={`font-label-md text-label-md ${activeTheme === 'dark' ? 'text-primary' : 'text-white'}`}>Midnight Dark</span>
                      <div className={`absolute top-3 right-3 transition-opacity ${activeTheme === 'dark' ? 'opacity-100' : 'opacity-0 group-hover:opacity-50'}`}>
                        <span className="material-symbols-outlined text-primary" style={{ fontVariationSettings: activeTheme === 'dark' ? "'FILL' 1" : "'FILL' 0" }}>
                          {activeTheme === 'dark' ? 'check_circle' : 'radio_button_unchecked'}
                        </span>
                      </div>
                    </button>
                    
                    {/* System Mode */}
                    <button 
                      className={`group relative flex flex-col items-center p-4 rounded-2xl border-2 transition-all ${activeTheme === 'system' ? 'border-primary bg-surface-container-high shadow-[0_0_15px_rgba(37,99,235,0.4)]' : 'border-outline-variant bg-surface-container-high hover:border-primary/50'}`}
                      onClick={() => setActiveTheme('system')}
                    >
                      <div className="w-full aspect-video rounded-xl bg-gradient-to-br from-white to-black flex items-center justify-center mb-4 overflow-hidden">
                        <span className="material-symbols-outlined text-on-surface-variant scale-150">settings_brightness</span>
                      </div>
                      <span className={`font-label-md text-label-md ${activeTheme === 'system' ? 'text-primary' : 'text-on-surface'}`}>OS Adaptive</span>
                      <div className={`absolute top-3 right-3 transition-opacity ${activeTheme === 'system' ? 'opacity-100' : 'opacity-0 group-hover:opacity-50'}`}>
                        <span className="material-symbols-outlined text-primary" style={{ fontVariationSettings: activeTheme === 'system' ? "'FILL' 1" : "'FILL' 0" }}>
                          {activeTheme === 'system' ? 'check_circle' : 'radio_button_unchecked'}
                        </span>
                      </div>
                    </button>
                  </div>
                </div>
              </section>
            )}

            {/* Right Column: Info / Context */}
            <aside className="col-span-12 lg:col-span-4 space-y-stack_md">
              {/* Status Card */}
              <div className="glass-card p-6 rounded-2xl relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-3xl -mr-16 -mt-16 group-hover:bg-secondary/20 transition-all duration-500"></div>
                <h3 className="font-label-md text-label-md text-primary font-bold mb-4 flex items-center gap-2">
                  <span className="material-symbols-outlined">verified</span>
                  System Health
                </h3>
                <div className="space-y-4">
                  <div className="flex justify-between items-end">
                    <span className="text-display-lg font-display-lg font-bold text-on-surface tracking-tight">98<span className="text-headline-md">%</span></span>
                    <span className="text-label-md text-on-error uppercase font-bold bg-error px-3 py-1 rounded-full shadow-sm">Critical 0</span>
                  </div>
                  <div className="w-full h-1.5 bg-surface-container-high rounded-full overflow-hidden">
                    <div className="w-[98%] h-full bg-secondary shadow-[0_0_8px_rgba(76,215,246,0.8)]"></div>
                  </div>
                  <p className="text-[12px] text-on-surface-variant leading-relaxed">
                    AI Core is operating within optimal parameters. Scanning latency is currently <span className="text-primary font-bold">24ms</span>.
                  </p>
                </div>
              </div>

              {/* AI Insights Bento */}
              <div className="glass-card p-6 rounded-2xl border-l-4 border-primary">
                <div className="flex gap-4 items-start mb-6">
                  <div className="w-12 h-12 rounded-xl bg-primary-container text-on-primary-container flex items-center justify-center shrink-0">
                    <span className="material-symbols-outlined">psychology</span>
                  </div>
                  <div>
                    <h3 className="font-headline-md text-headline-md text-on-surface font-bold leading-tight">Optimization Tips</h3>
                    <p className="text-[10px] text-primary uppercase font-black tracking-widest mt-1">AI Powered</p>
                  </div>
                </div>
                <ul className="space-y-stack_md">
                  <li className="flex gap-3 text-body-md text-on-surface-variant p-4 bg-surface/50 rounded-xl border border-outline-variant/10">
                    <span className="material-symbols-outlined text-secondary shrink-0">tips_and_updates</span>
                    <span className="text-sm">"North Wing labels could be auto-grouped to save 12% printer ink."</span>
                  </li>
                  <li className="flex gap-3 text-body-md text-on-surface-variant p-4 bg-surface/50 rounded-xl border border-outline-variant/10">
                    <span className="material-symbols-outlined text-secondary shrink-0">speed</span>
                    <span className="text-sm">"Increasing scanner sensitivity by 2 units may improve throughput by 4%."</span>
                  </li>
                </ul>
              </div>

              {/* Visual Asset */}
              <div className="rounded-2xl overflow-hidden h-48 relative shadow-sm border border-outline-variant/20">
                <img 
                  className="w-full h-full object-cover grayscale brightness-75 hover:grayscale-0 hover:brightness-100 transition-all duration-700" 
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuDho4FAkoOn92m1TWcJkz4x2ad4SKjaHCPllMHCpUhBMjcUfAksiq5YhBiuZsTw0gkPW_R6QJg5hRoLf3RUat5stNyURADJZLZhB7YaOHnjmWbXEkAwSOUmwLDt3qqX-hzo5P5oasQRkWicY6vctsxwrf4VdJCXA5MwT3IhDm6O3SdnXq0puCrc7_-ImR3h-oCT3Rv7E_s3EI5IUbC351t8QDJ1hYfXd-jzCDkFFvHkc5gU-SXiCp1ZfBpAXhdpwMFlf87VRntFmWOE"
                  alt="Warehouse Aisle"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent flex items-end p-6">
                  <p className="text-white font-label-md text-label-md font-bold tracking-wide">DC-North Live View</p>
                </div>
              </div>
            </aside>
          </div>
        </div>

        {/* Bottom Bar fixed inside main */}
        <div className="absolute bottom-0 left-0 right-0 p-container_padding bg-gradient-to-t from-surface via-surface to-transparent pt-20 pointer-events-none">
          <div className="glass-card p-6 rounded-2xl flex flex-col md:flex-row justify-between items-center gap-4 shadow-lg pointer-events-auto border-t border-white/50">
            <div className="flex items-center gap-4">
              <span className="material-symbols-outlined text-outline">history</span>
              <p className="text-body-md text-on-surface-variant">Last saved: <span className="font-bold text-on-surface">Today, 14:32</span> by Alex V.</p>
            </div>
            <div className="flex gap-stack_md w-full md:w-auto">
              <button className="flex-1 md:flex-none px-8 py-3 rounded-xl font-label-md text-label-md font-bold border-2 border-outline-variant text-on-surface-variant hover:bg-surface-container-high transition-all">
                Reset Defaults
              </button>
              <button className="flex-1 md:flex-none px-12 py-3 rounded-xl font-label-md text-label-md font-bold bg-primary text-on-primary shadow-[0_0_15px_rgba(37,99,235,0.4)] transition-all hover:scale-[1.02] hover:opacity-90">
                Save Changes
              </button>
            </div>
          </div>
        </div>

      </main>
    </div>
  )
}

export default Settings
