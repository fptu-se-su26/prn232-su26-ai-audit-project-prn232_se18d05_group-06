import React from 'react';
import AdminSidebar from '@components/AdminSidebar';

const recentQueries = [
  'Show delayed orders in EU sector',
  'Forecast next month revenue',
  'Warehouse overload risk analysis',
];

const savedInsights = [
  'Route Optimization Q3',
  'Fuel Efficiency Report',
];

const suggestedPrompts = [
  { label: 'Show delayed orders', icon: 'schedule' },
  { label: 'Forecast next month revenue', icon: 'trending_up' },
  { label: 'Suggest optimal routes for NYC', icon: 'route' },
];

const AdminSmartLogAI: React.FC = () => {
  return (
    <div className="flex h-screen overflow-hidden font-body-md text-body-md antialiased bg-surface text-on-background">
      {/* SideNavBar */}
      <AdminSidebar />

      {/* Main Content Area */}
      <main className="flex-1 md:ml-[280px] flex flex-col h-full relative bg-surface">
        {/* TopNavBar */}
        <header className="h-[72px] bg-surface/70 backdrop-blur-md flex justify-between items-center px-8 border-b border-outline-variant/30 z-10 sticky top-0 shadow-sm w-full">
          <div className="flex items-center gap-4">
            <span className="material-symbols-outlined text-primary text-2xl">psychology</span>
            <h2 className="font-headline-sm text-headline-sm font-bold text-on-surface">SmartLog Assistant</h2>
          </div>
          <div className="flex items-center gap-4">
            <button className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-surface-container-low transition-colors text-on-surface-variant">
              <span className="material-symbols-outlined">notifications</span>
            </button>
            <button className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-surface-container-low transition-colors text-on-surface-variant">
              <span className="material-symbols-outlined">apps</span>
            </button>
            <img alt="Admin User Avatar" className="w-10 h-10 rounded-full border-2 border-surface-container-low" src="https://lh3.googleusercontent.com/aida-public/AB6AXuAh4S97y995g1U9ks19bdnuPCFrUaginGK2DdYGc1_AUD4irMmZhdpn2hiUlVnTTsVqBbRvOOoHqSIgIcxhz5d7AVzHc7h-uvUJo3UPHzUmcl4RI9m-uYHheecNusHeJnjD_ptBbS3osUYSd3icaHSi5Zpvj2CpLIDLTutVZJz9PyIeVD70oqBaRzNnVkvOjpJlc5_CE65UI7TYfu3xlaNFNcEpB_ntGxJOKqLvKmjm2rIp0tuM5l1uWGNfErG_PSI5W85G5gHewK5m" />
          </div>
        </header>

        {/* Chat Interface Layout */}
        <div className="flex-1 flex overflow-hidden">
          {/* History Sidebar */}
          <aside className="w-80 bg-surface-container-low border-r border-outline-variant/30 flex-col hidden lg:flex">
            <div className="p-6">
              <button className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl border border-outline-variant text-on-surface hover:bg-surface-variant transition-colors">
                <span className="material-symbols-outlined">add</span>
                <span className="font-label-md text-label-md">New Conversation</span>
              </button>
            </div>
            <div className="flex-1 overflow-y-auto px-4 pb-6">
              <div className="mb-6">
                <h3 className="font-label-md text-label-md text-on-surface-variant uppercase tracking-wider mb-3 px-2">Recent Queries</h3>
                <ul className="space-y-1">
                  {recentQueries.map((query, index) => (
                    <li key={index}><a className="block px-3 py-2 rounded-lg hover:bg-surface-variant text-on-surface-variant font-body-sm text-body-sm truncate transition-colors" href="#">{query}</a></li>
                  ))}
                </ul>
              </div>
              <div>
                <h3 className="font-label-md text-label-md text-on-surface-variant uppercase tracking-wider mb-3 px-2">Saved Insights</h3>
                <ul className="space-y-1">
                  {savedInsights.map((insight, index) => (
                    <li key={index}><a className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-surface-variant text-on-surface-variant font-body-sm text-body-sm transition-colors" href="#"><span className="material-symbols-outlined text-[16px]">bookmark</span> {insight}</a></li>
                  ))}
                </ul>
              </div>
            </div>
          </aside>

          {/* Main Chat Area */}
          <div className="flex-1 flex flex-col relative bg-surface-bright">
            <div className="flex-1 overflow-y-auto p-6 md:p-8 flex flex-col gap-8 w-full max-w-4xl mx-auto">
              {/* User Message */}
              <div className="flex gap-4 justify-end">
                <div className="max-w-[80%] bg-surface-container-highest rounded-2xl rounded-tr-none p-4 shadow-sm">
                  <p className="font-body-md text-body-md text-on-surface">Analyze current warehouse capacity and highlight any overload risks for the upcoming holiday peak.</p>
                </div>
                <img alt="User Avatar" className="w-8 h-8 rounded-full flex-shrink-0" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDlOez3Tafm30TaGD5B1ZzmZe-ha19sGwCpLi6-l-_DGbehkBhkfbyge_PjlLdK2Yd7jkc_9gUqJF5oaBeQc3g4GrysmD_1wfNBaxR6yLZhiLsYTySBdwgDthsqQmavUXduZTJ2Px6SIWNvceBNjVQCpj7Z8cbN1BN3_xITIvpxjV9Dcr5Tb_MmcojSMzgUywTJ0X0CVU3louiAJfjesIQLVzh_sbkp09T5EHABA5NYsJ5vzX1uqGhEcqjngBttgvnwTMYDk1lYbBc-" />
              </div>

              {/* AI Response */}
              <div className="flex gap-4">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-cyan-500 flex items-center justify-center text-white flex-shrink-0 shadow-md">
                  <span className="material-symbols-outlined text-[18px]">psychology</span>
                </div>
                <div className="max-w-[85%] space-y-4">
                  <div className="bg-white rounded-2xl rounded-tl-none p-5 shadow-sm border border-outline-variant/20">
                    <p className="font-body-md text-body-md text-on-surface mb-4">I've analyzed the capacity data across all primary distribution centers. There is a high probability of overload in the <strong>Frankfurt</strong> and <strong>Chicago</strong> facilities within the next 14 days based on projected inbound shipments.</p>
                    
                    {/* Embedded Insight Card (Glassmorphism) */}
                    <div className="rounded-xl p-5 mt-4" style={{ background: 'rgba(255, 255, 255, 0.7)', backdropFilter: 'blur(12px)', border: '1px solid rgba(255, 255, 255, 0.2)', borderTop: '1px solid rgba(255, 255, 255, 0.3)', boxShadow: '0 10px 30px rgba(0, 0, 0, 0.04)' }}>
                      <div className="flex justify-between items-center mb-4 border-b border-outline-variant/20 pb-3">
                        <div className="flex items-center gap-2">
                          <span className="material-symbols-outlined text-error">warning</span>
                          <h4 className="font-headline-sm text-headline-sm">Capacity Risk Alert</h4>
                        </div>
                        <span style={{ background: 'linear-gradient(135deg, #a855f7 0%, #06b6d4 100%)', color: 'white', padding: '4px 12px', borderRadius: '9999px', fontFamily: "'JetBrains Mono', monospace", fontSize: '12px', fontWeight: 500 }}>92% Confidence</span>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="bg-surface-container-low rounded-lg p-3 border border-outline-variant/10">
                          <p className="font-label-md text-label-md text-on-surface-variant mb-1">Frankfurt Hub (EU)</p>
                          <div className="flex justify-between items-end">
                            <span className="font-headline-md text-headline-md text-error">98%</span>
                            <span className="font-body-sm text-body-sm text-on-surface-variant">proj. usage</span>
                          </div>
                          <div className="w-full bg-surface-variant h-1.5 rounded-full mt-2">
                            <div className="bg-error h-1.5 rounded-full w-[98%]"></div>
                          </div>
                        </div>
                        <div className="bg-surface-container-low rounded-lg p-3 border border-outline-variant/10">
                          <p className="font-label-md text-label-md text-on-surface-variant mb-1">Chicago Hub (NA)</p>
                          <div className="flex justify-between items-end">
                            <span className="font-headline-md text-headline-md text-orange-500">91%</span>
                            <span className="font-body-sm text-body-sm text-on-surface-variant">proj. usage</span>
                          </div>
                          <div className="w-full bg-surface-variant h-1.5 rounded-full mt-2">
                            <div className="bg-orange-500 h-1.5 rounded-full w-[91%]"></div>
                          </div>
                        </div>
                      </div>
                      
                      <div className="mt-4 pt-3 flex gap-3">
                        <button className="flex-1 py-2 rounded-lg bg-surface-variant text-on-surface font-label-md text-label-md hover:bg-surface-dim transition-colors">View Detailed Forecast</button>
                        <button className="flex-1 py-2 rounded-lg bg-primary text-white font-label-md text-label-md hover:bg-primary-container hover:text-on-primary-container transition-colors shadow-sm">Simulate Rerouting</button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Input Area & Suggested Prompts */}
            <div className="p-6 bg-surface-bright/90 backdrop-blur-md border-t border-outline-variant/20 relative z-20">
              <div className="max-w-4xl mx-auto w-full">
                <div className="flex flex-wrap gap-2 mb-4">
                  {suggestedPrompts.map((prompt, index) => (
                    <button key={index} className="px-4 py-1.5 rounded-full bg-surface border border-outline-variant/40 text-on-surface-variant font-body-sm text-body-sm hover:bg-surface-container-high transition-colors flex items-center gap-2">
                      <span className="material-symbols-outlined text-[16px]">{prompt.icon}</span> {prompt.label}
                    </button>
                  ))}
                </div>
                <div className="relative flex items-center w-full bg-surface-container-lowest rounded-2xl border border-outline-variant/50 shadow-sm focus-within:ring-2 focus-within:ring-primary focus-within:border-transparent transition-all">
                  <button className="pl-4 pr-2 text-on-surface-variant hover:text-primary transition-colors">
                    <span className="material-symbols-outlined">attach_file</span>
                  </button>
                  <input className="flex-1 bg-transparent border-none focus:ring-0 py-4 font-body-md text-body-md text-on-surface placeholder:text-on-surface-variant/60 outline-none" placeholder="Ask SmartLog AI to analyze data, build reports, or forecast trends..." type="text" />
                  <button className="pr-4 pl-2 text-primary hover:text-primary-container transition-colors">
                    <div className="w-10 h-10 rounded-xl bg-primary text-white flex items-center justify-center shadow-md hover:shadow-lg hover:scale-105 transition-all">
                      <span className="material-symbols-outlined">send</span>
                    </div>
                  </button>
                </div>
                <p className="text-center font-label-md text-label-md text-on-surface-variant mt-2 opacity-70">SmartLog AI can make mistakes. Consider verifying critical operational decisions.</p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default AdminSmartLogAI;
