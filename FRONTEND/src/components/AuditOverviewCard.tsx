type AuditOverviewCardProps = {
  onBulkScanClick: () => void
}

const AuditOverviewCard = ({ onBulkScanClick }: AuditOverviewCardProps) => (
  <section className="glass-card rounded-[28px] border border-slate-200/70 bg-white p-6 shadow-sm flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
    <div className="grid gap-4 sm:grid-cols-3">
      <div className="flex flex-col gap-2">
        <span className="text-xs uppercase tracking-[0.2em] text-slate-500">Audit Period</span>
        <div className="flex items-center gap-2 text-sm text-slate-900 font-semibold">
          <span className="material-symbols-outlined text-[#2563eb]">calendar_today</span>
          October 24, 2024
        </div>
      </div>
      <div className="flex flex-col gap-2">
        <span className="text-xs uppercase tracking-[0.2em] text-slate-500">Lead Auditor</span>
        <div className="flex items-center gap-2 text-sm text-slate-900 font-semibold">
          <span className="material-symbols-outlined text-[#2563eb]">person</span>
          Sarah Mitchell
        </div>
      </div>
      <div className="flex flex-col gap-2">
        <span className="text-xs uppercase tracking-[0.2em] text-slate-500">Current Zone</span>
        <div className="flex items-center gap-2 text-sm text-slate-900 font-semibold">
          <span className="material-symbols-outlined text-[#2563eb]">location_on</span>
          Zone B-4 (High Value)
        </div>
      </div>
    </div>

    <button
      className="inline-flex items-center gap-2 rounded-full bg-[#2563eb] px-6 py-3 text-sm font-semibold text-white shadow-[0_18px_45px_rgba(37,99,235,0.18)] transition hover:bg-[#1d4ed8]"
      onClick={onBulkScanClick}
    >
      <span className="material-symbols-outlined">qr_code_scanner</span>
      Bulk QR Scan Mode
    </button>
  </section>
)

export default AuditOverviewCard
