import Sidebar from '../../components/Sidebar'
import OcrDropzone from '../../components/OcrDropzone'
import OcrExtractedTable from '../../components/OcrExtractedTable'

const AIOCRScan = () => {
  return (
    <div className="min-h-screen bg-[#f7f9fb] text-[#191c1e] antialiased overflow-hidden">
      <Sidebar />

      <header className="fixed top-0 right-0 w-[calc(100%-280px)] h-20 bg-white/90 backdrop-blur-md z-40 border-b border-slate-200/70 flex items-center justify-between px-8 shadow-sm">
        <div>
          <p className="text-sm text-slate-500">AI OCR Scan</p>
          <h1 className="text-2xl font-semibold text-slate-900">AI OCR Scan</h1>
        </div>

        <div className="flex items-center gap-4">
          <div className="relative hidden xl:block w-96">
            <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">search</span>
            <input
              className="w-full rounded-full border border-slate-200 bg-slate-50 px-12 py-3 text-sm text-slate-700 outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
              placeholder="Search invoices..."
              type="text"
            />
          </div>
          <button className="relative rounded-full p-2 text-slate-600 hover:bg-slate-100 transition-all duration-200">
            <span className="material-symbols-outlined">notifications</span>
            <span className="absolute top-1 right-1 h-2.5 w-2.5 rounded-full bg-red-600" />
          </button>
        </div>
      </header>

      <main className="ml-[280px] mt-20 px-8 pb-10 animate-fade-in-up">
        <div className="max-w-[1180px] mx-auto space-y-8">
          <div className="rounded-[32px] border border-slate-200/70 bg-white shadow-[0_30px_80px_rgba(15,23,42,0.08)] overflow-hidden">
            <div className="p-8">
              <OcrDropzone />
              <OcrExtractedTable />
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

export default AIOCRScan
