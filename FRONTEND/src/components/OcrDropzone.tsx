import { useState } from 'react'

const OcrDropzone = () => {
  const [processing, setProcessing] = useState(false)
  const [message, setMessage] = useState('Extracting text using Vision AI')

  function simulateUpload() {
    if (processing) return
    setProcessing(true)
    const steps = [
      'Scanning document layout...',
      'Running OCR engine...',
      'Identifying entities...',
      'Calculating confidence scores...',
      'Formatting data table...',
    ]

    let step = 0
    const interval = setInterval(() => {
      if (step < steps.length) {
        setMessage(steps[step])
        step++
      } else {
        clearInterval(interval)
        setTimeout(() => {
          setProcessing(false)
          setMessage('Extracting text using Vision AI')
          alert('Data extracted successfully! View the table below.')
        }, 600)
      }
    }, 700)
  }

  return (
    <section className="relative">
      <div
        className="relative rounded-[28px] border border-slate-200/70 bg-white min-h-[260px] flex flex-col items-center justify-center px-8 py-12 text-center shadow-sm cursor-pointer overflow-hidden"
        onClick={simulateUpload}
      >
        <div className={`ocr-scan-line ${processing ? '' : 'hidden'}`} />

        {!processing ? (
          <div className="space-y-5 z-10">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[#eff8ff] text-[#2563eb] shadow-[0_10px_30px_rgba(37,99,235,0.12)]">
              <span className="material-symbols-outlined text-4xl">upload_file</span>
            </div>
            <div>
              <h3 className="text-2xl font-semibold text-slate-900">Drop invoice here or upload image</h3>
              <p className="mx-auto mt-2 max-w-xl text-sm text-slate-500">Our AI engine will instantly extract line items, supplier details, and pricing from your document.</p>
            </div>
            <div className="flex flex-wrap justify-center gap-3 pt-4">
              <button className="inline-flex items-center gap-2 rounded-full bg-[#2563eb] px-6 py-3 text-sm font-semibold text-white shadow-[0_12px_30px_rgba(37,99,235,0.18)] transition hover:bg-[#1d4ed8]">
                <span className="material-symbols-outlined text-base">add</span>
                Select File
              </button>
              <button className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-6 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-100">
                <span className="material-symbols-outlined text-base">photo_camera</span>
                Take Photo
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-5 z-10">
            <div className="flex items-center justify-center gap-2">
              <div className="w-3 h-3 rounded-full bg-[#2563eb] animate-bounce" style={{ animationDelay: '0s' }} />
              <div className="w-3 h-3 rounded-full bg-[#2563eb] animate-bounce" style={{ animationDelay: '0.2s' }} />
              <div className="w-3 h-3 rounded-full bg-[#2563eb] animate-bounce" style={{ animationDelay: '0.4s' }} />
            </div>
            <div>
              <h3 className="text-2xl font-semibold text-[#2563eb]">Analyzing Document...</h3>
              <p className="mt-2 text-sm text-slate-500">{message}</p>
            </div>
          </div>
        )}
      </div>
    </section>
  )
}

export default OcrDropzone
