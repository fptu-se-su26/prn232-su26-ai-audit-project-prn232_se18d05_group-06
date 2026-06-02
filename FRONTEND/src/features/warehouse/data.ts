export type Order = {
  id: string
  sku: string
  qty: string
  status: string
  time: string
  color: string
}

export type ActivityItem = {
  title: string
  detail: string
  time: string
  badge: string
}

export const orderData: Order[] = [
  { id: 'ORD-4492', sku: 'SKU-TECH-901', qty: '120 units', status: 'Completed', time: '10:45 AM', color: 'bg-emerald-100 text-emerald-700' },
  { id: 'ORD-4493', sku: 'SKU-BLUE-12', qty: '45 units', status: 'Processing', time: '11:02 AM', color: 'bg-blue-100 text-blue-700' },
  { id: 'ORD-4494', sku: 'SKU-GEN-88', qty: '200 units', status: 'Processing', time: '11:15 AM', color: 'bg-blue-100 text-blue-700' },
]

export const activityData: ActivityItem[] = [
  { title: 'New Import: SKU-992', detail: 'Logged at Bay 12 by Automated Rover #2', time: '2 mins ago', badge: 'bg-blue-600' },
  { title: 'Export: Order #882', detail: 'Picking started in Zone D. 12 units remaining.', time: '5 mins ago', badge: 'bg-cyan-600' },
  { title: 'QR Scan: A-12', detail: 'Manual audit check completed. No discrepancies found.', time: '12 mins ago', badge: 'bg-slate-600' },
  { title: 'Import: SKU-TECH-901', detail: 'Pallet received and assigned to Zone A-Rack 4.', time: '24 mins ago', badge: 'bg-blue-600' },
]
