import Sidebar from './components/Sidebar'
import ExportHeader from './components/ExportHeader'
import ExportOrderSummary from './components/ExportOrderSummary'
import ExportRoutePanel from './components/ExportRoutePanel'
import ShippingLabelPreview from './components/ShippingLabelPreview'
import ExportPickingQueue from './components/ExportPickingQueue'
import ExportAssistantCard from './components/ExportAssistantCard'
import ExportPageActions from './components/ExportPageActions'
import ExportBottomWidget from './components/ExportBottomWidget'

const ExportGoods = () => {
  return (
    <div className="min-h-screen bg-[#f7f9fb] text-[#191c1e] antialiased overflow-hidden">
      <Sidebar />
      <main className="ml-[280px] min-h-screen">
        <ExportHeader />
        <section className="pt-28 pb-10 px-8 space-y-8 animate-fade-in-up">
          <ExportOrderSummary />

          <div className="grid gap-6 xl:grid-cols-[2fr_1fr]">
            <ExportRoutePanel />
            <ShippingLabelPreview />
          </div>

          <div className="grid gap-6 lg:grid-cols-[2fr_1fr]">
            <ExportPickingQueue />
            <ExportAssistantCard />
          </div>

          <ExportPageActions />
        </section>
      </main>
      <ExportBottomWidget />
    </div>
  )
}

export default ExportGoods
