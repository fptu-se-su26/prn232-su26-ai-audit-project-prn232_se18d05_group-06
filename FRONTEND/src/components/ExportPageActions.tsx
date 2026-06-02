const ExportPageActions = () => (
  <div className="flex flex-col gap-4 sm:flex-row justify-end">
    <button className="w-full sm:w-auto rounded-2xl border border-[#2563eb] bg-white px-10 py-4 text-sm font-black text-[#2563eb] transition hover:bg-[#eff6ff]">
      <span className="material-symbols-outlined mr-2 align-middle">fact_check</span>
      CONFIRM PICKING
    </button>
    <button className="w-full sm:w-auto rounded-2xl bg-[#2563eb] px-12 py-4 text-sm font-black text-white shadow-[0_20px_50px_rgba(37,99,235,0.25)] transition hover:scale-[1.02] active:scale-95">
      <span className="material-symbols-outlined mr-2 align-middle">local_shipping</span>
      DISPATCH ORDER
    </button>
  </div>
)

export default ExportPageActions
