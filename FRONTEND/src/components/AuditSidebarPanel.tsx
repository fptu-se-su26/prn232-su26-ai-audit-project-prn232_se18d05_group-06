import type { AuditStats } from '../features/warehouse/InventoryAudit.types'

type AuditSidebarPanelProps = {
  auditStats: AuditStats
}

const AuditSidebarPanel = ({ auditStats }: AuditSidebarPanelProps) => (
  <aside className="flex flex-col gap-6">
    <div className="glass-card rounded-[28px] border border-slate-200/70 bg-white p-6 shadow-sm overflow-hidden relative">
      <div className="absolute -right-8 -top-8 h-36 w-36 rounded-full bg-[#2563eb]/10 blur-3xl" />
      <div className="relative z-10 flex items-start gap-4">
        <div className="flex h-14 w-14 items-center justify-center rounded-3xl bg-[#2563eb] text-white shadow-[0_15px_35px_rgba(37,99,235,0.18)]">
          <span className="material-symbols-outlined">psychology</span>
        </div>
        <div className="flex-1">
          <h4 className="text-sm font-semibold text-slate-900">Discrepancy Detected</h4>
          <p className="text-xs text-slate-500">SKU: X-CHIP-44X</p>
        </div>
      </div>
      <div className="mt-5 rounded-3xl border-l-4 border-[#b91c1c]/20 bg-[#fef2f2] p-4 text-sm text-slate-700">
        AI analysis of recent shipping logs suggests <span className="font-semibold text-[#b91c1c]">12 units</span> may have been mislabeled during the last Receiving cycle in Zone C-1.
      </div>
      <div className="mt-5 space-y-3">
        <div className="flex items-center justify-between text-xs text-slate-500">
          <span>AI Confidence Score</span>
          <span className="font-semibold text-[#2563eb]">94.2%</span>
        </div>
        <div className="h-1.5 overflow-hidden rounded-full bg-slate-200">
          <div className="h-full rounded-full bg-[#2563eb]" style={{ width: '94.2%' }} />
        </div>
      </div>
      <button className="mt-4 w-full rounded-xl border border-[#2563eb] px-4 py-3 text-sm font-semibold text-[#2563eb] transition hover:bg-[#2563eb]/10">
        Re-verify Zone C-1 Logs
      </button>
    </div>

    <div className="glass-card rounded-[28px] border border-slate-200/70 bg-white p-6 shadow-sm">
      <h4 className="text-sm font-semibold text-slate-900">Audit Completion</h4>
      <div className="mt-4 flex items-end justify-between gap-4">
        <div>
          <p className="text-5xl font-bold text-[#2563eb]">{auditStats.percent}%</p>
          <p className="text-sm text-slate-500">96/142 Items Verified</p>
        </div>
      </div>
      <div className="mt-4 h-3 overflow-hidden rounded-full bg-slate-200">
        <div className="h-full rounded-full bg-[#0f766e]" style={{ width: `${auditStats.percent}%` }} />
      </div>
      <div className="mt-4 grid grid-cols-2 gap-4">
        <div className="rounded-3xl bg-slate-50 p-4 text-sm">
          <p className="text-xs text-slate-500">Mismatches</p>
          <p className="mt-2 text-xl font-semibold text-[#b91c1c]">{auditStats.mismatches}</p>
        </div>
        <div className="rounded-3xl bg-slate-50 p-4 text-sm">
          <p className="text-xs text-slate-500">Matches</p>
          <p className="mt-2 text-xl font-semibold text-[#0f766e]">{auditStats.verified}</p>
        </div>
      </div>
    </div>

    <div className="flex flex-col gap-3">
      <button className="flex items-center justify-between rounded-xl bg-slate-900 px-4 py-4 text-white transition hover:bg-slate-800">
        <span className="flex items-center gap-3 font-semibold">
          <span className="material-symbols-outlined">picture_as_pdf</span>
          Generate Final Report
        </span>
        <span className="material-symbols-outlined">chevron_right</span>
      </button>
      <button className="flex items-center justify-between rounded-xl border border-slate-200 bg-white px-4 py-4 text-slate-900 transition hover:bg-slate-50">
        <span className="flex items-center gap-3 font-semibold">
          <span className="material-symbols-outlined">cloud_upload</span>
          Sync to ERP System
        </span>
        <span className="material-symbols-outlined">sync</span>
      </button>
    </div>
  </aside>
)

export default AuditSidebarPanel
