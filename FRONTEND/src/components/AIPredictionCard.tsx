const AIPredictionCard = () => {
  return (
    <div className="space-y-6">
      <div className="glass-card rounded-lg p-6 glow-primary-active border-primary/30 relative overflow-hidden">
        <div className="absolute top-0 right-0 p-4 opacity-06 pointer-events-none">
          <span className="material-symbols-outlined text-[64px] opacity-10">smart_toy</span>
        </div>
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <span className="material-symbols-outlined text-primary">auto_awesome</span>
          AI Prediction
        </h3>

        <div className="space-y-6">
          <div className="p-4 bg-primary/5 rounded-lg border border-primary/10">
            <p className="text-sm text-on-surface mb-2">Out-of-Stock Risk</p>
            <div className="flex items-end gap-4 mb-2">
              <span className="text-3xl font-bold text-primary">82%</span>
              <span className="text-sm text-on-surface-variant">Probability for Sector B</span>
            </div>
            <div className="w-full bg-outline-variant/30 h-2 rounded-full overflow-hidden">
              <div className="bg-primary h-full w-[82%] rounded-full shadow-[0_0_8px_rgba(0,74,198,0.5)]"></div>
            </div>
          </div>

          <div className="space-y-4">
            <h4 className="text-xs uppercase tracking-widest text-outline-variant">Upcoming Demand Spikes</h4>
            <div className="flex items-center gap-4">
              <div className="flex-1">
                <p className="font-medium">Cold Storage Units</p>
                <p className="text-xs text-on-surface-variant">Predicting +45% increase next week</p>
              </div>
              <div className="w-12 h-12 flex items-center justify-center text-primary">
                <span className="material-symbols-outlined text-[32px]">trending_up</span>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="flex-1">
                <p className="font-medium">Packaging Material</p>
                <p className="text-xs text-on-surface-variant">Holiday season preparation start</p>
              </div>
              <div className="w-12 h-12 flex items-center justify-center text-secondary">
                <span className="material-symbols-outlined text-[32px]">insights</span>
              </div>
            </div>
          </div>

          <button className="w-full py-3 bg-primary text-on-primary rounded-lg font-medium shadow-sm hover:scale-[0.995] transition-transform flex items-center justify-center gap-2">
            <span className="material-symbols-outlined">bolt</span>
            Execute Smart Reorder
          </button>
        </div>
      </div>

      <div className="glass-card rounded-lg p-6 overflow-hidden">
        <h3 className="text-sm font-medium mb-4">Stock Velocity Trend</h3>
        <div className="h-32 w-full flex items-end gap-1 px-2">
          <div className="flex-1 bg-primary/20 h-[40%] rounded-t-sm hover:bg-primary transition-all" title="Mon: 40%"></div>
          <div className="flex-1 bg-primary/20 h-[55%] rounded-t-sm hover:bg-primary transition-all" title="Tue: 55%"></div>
          <div className="flex-1 bg-primary/20 h-[45%] rounded-t-sm hover:bg-primary transition-all" title="Wed: 45%"></div>
          <div className="flex-1 bg-primary/20 h-[70%] rounded-t-sm hover:bg-primary transition-all" title="Thu: 70%"></div>
          <div className="flex-1 bg-primary/20 h-[85%] rounded-t-sm hover:bg-primary transition-all" title="Fri: 85%"></div>
          <div className="flex-1 bg-primary h-[95%] rounded-t-sm relative group" title="Sat: 95%"></div>
          <div className="flex-1 bg-primary/20 h-[60%] rounded-t-sm hover:bg-primary transition-all" title="Sun: 60%"></div>
        </div>
        <div className="flex justify-between mt-2 text-[10px] text-outline-variant font-mono">
          <span>MON</span>
          <span>WED</span>
          <span>FRI</span>
          <span>SUN</span>
        </div>
      </div>

      <button className="fixed bottom-10 right-10 w-16 h-16 bg-primary-container text-on-primary-container rounded-full shadow-2xl flex items-center justify-center glow-primary-active hover:scale-110 active:scale-95 transition-all z-50">
        <span className="material-symbols-outlined">add</span>
      </button>
    </div>
  )
}

export default AIPredictionCard
