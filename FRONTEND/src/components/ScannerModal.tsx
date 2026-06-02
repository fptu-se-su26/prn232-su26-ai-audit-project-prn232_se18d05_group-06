type ScannerModalProps = {
  open: boolean
  onClose: () => void
}

const ScannerModal = ({ open, onClose }: ScannerModalProps) => {
  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 px-4">
      <div className="relative flex flex-col items-center gap-8 rounded-[2rem] border border-white/10 bg-white p-10 shadow-2xl">
        <div className="relative flex h-72 w-72 items-center justify-center rounded-[2rem] border-4 border-dashed border-[#2563eb] bg-slate-50">
          <span className="material-symbols-outlined text-[4rem] text-[#2563eb] animate-pulse">qr_code_2</span>
        </div>
        <button
          className="rounded-full bg-[#dc2626] px-8 py-3 text-sm font-semibold text-white transition hover:bg-[#b91c1c]"
          type="button"
          onClick={onClose}
        >
          Close Scanner
        </button>
      </div>
    </div>
  )
}

export default ScannerModal
