import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import WarehouseDashboard from './features/warehouse/WarehouseDashboard'
import ExportGoods from './features/warehouse/ExportGoods'
import ImportGoods from './features/warehouse/ImportGoods'
import Inventory from './features/warehouse/Inventory'
import AIOCRScan from './features/warehouse/AIOCRScan'
import InventoryAudit from './features/warehouse/InventoryAudit'
import WarehouseTransfer from './features/warehouse/WarehouseTransfer'
import StockAlerts from './features/warehouse/StockAlerts'
import Notifications from './features/warehouse/Notifications'
import Reports from './features/warehouse/Reports'
import Settings from './features/warehouse/Settings'
import './App.css'

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<WarehouseDashboard />} />
        <Route path="/import-goods" element={<ImportGoods />} />
        <Route path="/export-goods" element={<ExportGoods />} />
        <Route path="/ocr-scan" element={<AIOCRScan />} />
        <Route path="/inventory" element={<Inventory />} />
        <Route path="/inventory-audit" element={<InventoryAudit />} />
        <Route path="/warehouse-transfer" element={<WarehouseTransfer />} />
        <Route path="/stock-alerts" element={<StockAlerts />} />
        <Route path="/notifications" element={<Notifications />} />
        <Route path="/reports" element={<Reports />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  )
}

export default App
