import Sidebar from './components/Sidebar'
import Topbar from './components/Topbar'
import KpiCards from './components/KpiCards'
import WarehouseMap from './components/WarehouseMap'
import RecentOrders from './components/RecentOrders'
import RightPanel from './components/RightPanel'
import FloatingActionButton from './components/FloatingActionButton'
import { activityData, orderData } from './data'

const WarehouseDashboard = () => {
  return (
    <div className="min-h-screen bg-[#f7f9fb] text-[#191c1e] antialiased overflow-hidden">
      <Sidebar />

      <main className="ml-[280px] flex-1 h-screen overflow-y-auto custom-scrollbar flex flex-col animate-fade-in-up">
        <Topbar />

        <div className="p-8 space-y-8">
          <KpiCards />

          <div className="grid grid-cols-12 gap-6">
            <section className="col-span-12 lg:col-span-8 space-y-6">
              <WarehouseMap />
              <RecentOrders orders={orderData} />
            </section>

            <section className="col-span-12 lg:col-span-4 space-y-6">
              <RightPanel activity={activityData} />
            </section>
          </div>
        </div>
      </main>

      <FloatingActionButton />
    </div>
  )
}

export default WarehouseDashboard
