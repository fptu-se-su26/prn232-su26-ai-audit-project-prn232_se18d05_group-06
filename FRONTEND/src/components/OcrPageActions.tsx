const OcrPageActions = () => (
  <div className="flex items-center justify-end gap-3">
    <button className="text-primary hover:bg-primary-container/10 px-4 py-2 rounded-full font-label-md transition-all">Export CSV</button>
    <button className="bg-primary text-on-primary px-6 py-2 rounded-full font-label-md hover:shadow-[0_0_15px_rgba(37,99,235,0.4)] transition-all">Confirm to Inventory</button>
  </div>
)

export default OcrPageActions
