import Sidebar from '../../components/Sidebar'
import WarehouseHeader from '../../components/WarehouseHeader'
import OcrDropzone from '../../components/OcrDropzone'
import OcrExtractedTable from '../../components/OcrExtractedTable'

const AIOCRScan = () => {
  return (
    <div className="min-h-screen bg-[#f7f9fb] text-[#191c1e] antialiased overflow-hidden">
      <Sidebar />

      <WarehouseHeader 
        title="AI OCR Tự động bóc tách"
        subtitle="Quét chứng từ và tự động nhận diện chữ"
        rightContent={
          <button className="rounded-full bg-slate-100 px-4 py-2 text-sm font-semibold text-[#0f172a] transition hover:bg-slate-200 flex items-center gap-2">
            <span className="material-symbols-outlined">smart_toy</span>
            Warehouse Staff
          </button>
        }
      />

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
