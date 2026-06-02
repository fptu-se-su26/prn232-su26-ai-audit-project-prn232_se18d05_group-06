import React from 'react';

interface DriverLayoutProps {
  children: React.ReactNode;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onSosTrigger: () => void;
  driverName: string;
  isOnline: boolean;
}

export const DriverLayout: React.FC<DriverLayoutProps> = ({
  children,
  activeTab,
  setActiveTab,
  onSosTrigger,
  driverName,
  isOnline,
}) => {
  const tabs = [
    { id: 'Home', label: 'Home', icon: 'home' },
    { id: 'Routes', label: 'Routes', icon: 'route' },
    { id: 'Alerts', label: 'Alerts', icon: 'notifications' },
    { id: 'Profile', label: 'Profile', icon: 'person' },
  ];

  return (
    <div className="bg-[#f7f9fb] text-[#191c1e] min-h-screen flex flex-col font-body-md antialiased pb-[72px] md:pb-0 md:pl-64">
      {/* TopAppBar (Mobile) */}
      <header className="md:hidden flex justify-between items-center h-14 px-margin-mobile w-full z-40 bg-white border-b border-[#c3c6d7] sticky top-0 shadow-sm">
        <div className="text-headline-md font-headline-md font-bold text-[#004ac6]">SmartLog AI</div>
        <div className="flex gap-2">
          <button className="text-[#434655] hover:bg-[#e6e8ea] active:scale-95 duration-100 p-2 rounded-full h-10 w-10 flex items-center justify-center transition-colors">
            <span className="material-symbols-outlined text-[24px]">help</span>
          </button>
          <button 
            onClick={onSosTrigger}
            className="text-[#ba1a1a] hover:bg-[#ffdad6] active:scale-95 duration-100 p-2 rounded-full h-10 w-10 flex items-center justify-center transition-colors relative"
            title="SOS Alert"
          >
            <span className="material-symbols-outlined text-[24px] animate-pulse">sos</span>
          </button>
        </div>
      </header>

      {/* SideNavBar (Desktop) */}
      <nav className="hidden md:flex flex-col w-64 h-full fixed left-0 top-0 z-50 py-6 bg-[#eceef0] border-r border-[#c3c6d7] shadow-md select-none">
        <div className="px-8 mb-8">
          <div className="font-headline-md font-bold text-[#004ac6] text-xl mb-1">SmartLog AI</div>
          <div className="text-sm font-semibold text-[#434655] flex flex-col gap-0.5">
            <span className="flex items-center gap-2">
              Driver Dashboard
              <span className={`w-2 h-2 rounded-full ${isOnline ? 'bg-green-500 animate-pulse' : 'bg-gray-400'}`}></span>
            </span>
            <span className="text-xs text-gray-500 font-bold uppercase truncate max-w-[180px]">{driverName}</span>
          </div>
        </div>

        <div className="flex-1 flex flex-col gap-2">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-3 px-8 py-3.5 text-left font-semibold transition-all duration-150 active:translate-x-1 border-r-4 ${
                  isActive
                    ? 'text-[#004ac6] border-[#004ac6] bg-[#d3e4fe]/50 font-bold'
                    : 'text-[#434655] border-transparent hover:bg-[#e6e8ea]/60'
                }`}
              >
                <span className={`material-symbols-outlined ${isActive ? 'fill' : ''}`}>
                  {tab.icon}
                </span>
                <span className="text-[16px]">{tab.label}</span>
              </button>
            );
          })}
        </div>

        <div className="px-6 mt-auto">
          <button 
            onClick={onSosTrigger}
            className="w-full bg-[#ba1a1a] text-white font-bold py-3 rounded-lg flex items-center justify-center gap-2 hover:bg-[#93000a] active:scale-95 duration-150 h-12 shadow-md hover:shadow-lg transition-all"
          >
            <span className="material-symbols-outlined text-[22px]">sos</span>
            Initiate SOS
          </button>
        </div>
      </nav>

      {/* Main Content Layout Wrapper */}
      <main className="flex-1 w-full max-w-7xl mx-auto p-4 md:p-8 space-y-6">
        {children}
      </main>

      {/* BottomNavBar (Mobile) */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 w-full h-[72px] z-50 flex justify-around items-center px-2 pb-safe bg-white border-t border-[#c3c6d7] shadow-[0_-4px_12px_rgba(0,0,0,0.08)] select-none">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex flex-col items-center justify-center rounded-xl px-4 py-1.5 active:scale-90 transition-all duration-200 ${
                isActive
                  ? 'bg-[#d3e4fe] text-[#004ac6] font-bold'
                  : 'text-[#3f465c] hover:bg-[#f2f4f6]'
              }`}
            >
              <span className={`material-symbols-outlined ${isActive ? 'fill' : ''}`}>
                {tab.icon}
              </span>
              <span className="text-[12px] font-semibold mt-1">{tab.label}</span>
            </button>
          );
        })}
      </nav>
    </div>
  );
};

export default DriverLayout;
