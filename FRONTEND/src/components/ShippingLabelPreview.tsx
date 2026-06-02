const ShippingLabelPreview = () => (
  <div className="glass-card rounded-3xl border border-slate-200/70 p-6 shadow-xl shadow-slate-900/5 flex flex-col gap-6">
    <div className="flex items-center justify-between">
      <h3 className="text-base font-semibold text-slate-900">Shipping Label Preview</h3>
      <span className="material-symbols-outlined text-slate-500">print</span>
    </div>
    <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex justify-between border-b border-slate-200 pb-4">
        <div className="text-[12px] font-black leading-tight text-slate-900">
          FROM:<br />SMARTLOG AI HUB 7<br />100 LOGISTIC DR.<br />TECH CITY, TC 90210
        </div>
        <div className="flex h-16 w-16 items-center justify-center rounded-xl bg-slate-900 text-2xl font-black text-white">
          B2
        </div>
      </div>
      <div className="py-4">
        <div className="text-[12px] font-black text-slate-900 mb-2">SHIP TO:</div>
        <div className="text-lg font-bold uppercase leading-snug text-slate-900">
          GLOBAL ELECTRONICS GMBH<br />TECHNO-STRASSE 14<br />10117 BERLIN, DE
        </div>
      </div>
      <div className="flex flex-col items-center gap-3 border-y border-slate-200 py-4">
        <div className="w-full h-24 rounded-2xl bg-[url('https://upload.wikimedia.org/wikipedia/commons/d/d0/QR_code_for_mobile_English_Wikipedia.svg')] bg-contain bg-center bg-no-repeat" />
        <div className="text-sm font-bold tracking-[0.18em] text-slate-900">*(420) 10117 9981234123*</div>
      </div>
      <div className="flex items-start justify-between gap-4 pt-4 text-[11px] text-slate-700">
        <div>
          REF: ORD-2024-9981-AX<br />WEIGHT: 14.5 KG<br />BOX: LARGE #4
        </div>
        <div className="w-16 h-16 rounded-2xl bg-slate-100 bg-[url('https://upload.wikimedia.org/wikipedia/commons/d/d0/QR_code_for_mobile_English_Wikipedia.svg')] bg-contain bg-center bg-no-repeat" />
      </div>
    </div>
    <div className="space-y-3">
      <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-100 px-4 py-3 text-sm text-slate-700">
        <span className="material-symbols-outlined text-[#2563eb]">verified</span>
        Address Validated via AI
      </div>
      <button className="w-full rounded-2xl bg-[#111827] px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-900">
        <span className="material-symbols-outlined mr-2 align-middle">download</span>
        GENERATE PDF
      </button>
    </div>
  </div>
)

export default ShippingLabelPreview
