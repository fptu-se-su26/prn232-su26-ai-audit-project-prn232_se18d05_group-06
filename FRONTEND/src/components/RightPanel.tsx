type ActivityItem = {
  title: string
  detail: string
  time: string
  badge: string
}

type RightPanelProps = {
  activity: ActivityItem[]
}

const RightPanel = ({ activity }: RightPanelProps) => (
  <>
    <div className="glass rounded-3xl shadow-sm p-6 relative overflow-hidden border border-blue-100">
      <div className="absolute -right-4 -top-4 w-32 h-32 bg-blue-100 rounded-full blur-3xl"></div>
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white shadow-lg">
          <span className="material-symbols-outlined">bolt</span>
        </div>
        <div>
          <h3 className="text-xl font-semibold leading-tight">AI Insights</h3>
          <p className="text-[10px] uppercase tracking-widest text-blue-600 font-bold">Optimization Engine</p>
        </div>
      </div>
      <div className="space-y-4">
        <div className="p-4 bg-blue-50 rounded-3xl border border-blue-100">
          <p className="text-sm font-bold text-slate-900 mb-2">Efficiency Recommendation</p>
          <p className="text-sm text-slate-600 mb-3">
            Reorganize Zone B to improve picking efficiency by <span className="text-blue-600 font-bold">15%</span> based on next week's outbound forecast.
          </p>
          <button className="w-full py-2 bg-blue-600 text-white rounded-2xl text-sm font-semibold hover:opacity-90 transition-all">
            Accept Suggestion
          </button>
        </div>
        <div className="p-4 bg-red-50 rounded-3xl border border-red-100">
          <div className="flex items-center gap-2 mb-2">
            <span className="material-symbols-outlined text-red-700 text-sm">priority_high</span>
            <p className="text-sm font-bold text-red-700">Critical Alert</p>
          </div>
          <p className="text-sm text-slate-600">
            SKU-104 reaching critical low level. Predicted stockout in <span className="font-bold">4 hours</span>.
          </p>
          <button className="mt-3 text-blue-600 text-sm font-bold flex items-center gap-1">
            Restock Now <span className="material-symbols-outlined text-sm">chevron_right</span>
          </button>
        </div>
      </div>
    </div>

    <div className="glass rounded-3xl shadow-sm flex flex-col h-[500px]">
      <div className="p-6 border-b border-slate-300/30 flex justify-between items-center">
        <h3 className="text-xl font-semibold">Live Activity</h3>
        <div className="flex items-center gap-1 px-2 py-1 bg-emerald-100 text-emerald-700 rounded-xl text-[10px] font-bold">
          <span className="w-1.5 h-1.5 bg-emerald-600 rounded-full animate-ping"></span> LIVE
        </div>
      </div>
      <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
        {activity.map((item) => (
          <div key={item.title} className="flex gap-4 group">
            <div className="flex flex-col items-center">
              <div className={`w-2 h-2 ${item.badge} rounded-full`} />
              <div className="w-[2px] flex-1 bg-slate-300/30" />
            </div>
            <div className="pb-4">
              <p className="text-sm font-bold">{item.title}</p>
              <p className="text-sm text-slate-500">{item.detail}</p>
              <p className="text-[10px] text-slate-400 mt-1 italic">{item.time}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  </>
)

export type { ActivityItem }
export default RightPanel
