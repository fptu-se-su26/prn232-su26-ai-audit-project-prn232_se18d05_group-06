type Order = {
  id: string
  sku: string
  qty: string
  status: string
  time: string
  color: string
}

type RecentOrdersProps = {
  orders: Order[]
}

const RecentOrders = ({ orders }: RecentOrdersProps) => (
  <div className="glass rounded-3xl shadow-sm overflow-hidden">
    <div className="p-6 border-b border-slate-300/30">
      <h2 className="text-2xl font-semibold">Recent Warehouse Orders</h2>
    </div>
    <div className="overflow-x-auto">
      <table className="w-full text-left">
        <thead className="bg-slate-100">
          <tr>
            <th className="px-6 py-4 text-sm font-semibold text-slate-500">Order ID</th>
            <th className="px-6 py-4 text-sm font-semibold text-slate-500">SKU</th>
            <th className="px-6 py-4 text-sm font-semibold text-slate-500">Quantity</th>
            <th className="px-6 py-4 text-sm font-semibold text-slate-500">Status</th>
            <th className="px-6 py-4 text-sm font-semibold text-slate-500">Timestamp</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-300/20">
          {orders.map((order) => (
            <tr key={order.id} className="hover:bg-slate-50 transition-colors duration-200 group hover:translate-x-1">
              <td className="px-6 py-4 font-mono text-sm text-slate-900">{order.id}</td>
              <td className="px-6 py-4 text-sm text-slate-700">{order.sku}</td>
              <td className="px-6 py-4 text-sm text-slate-700">{order.qty}</td>
              <td className="px-6 py-4">
                <span className={`px-3 py-1 rounded-full text-[12px] font-bold ${order.color}`}>{order.status}</span>
              </td>
              <td className="px-6 py-4 text-slate-500 text-[12px]">{order.time}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </div>
)

export type { Order }
export default RecentOrders
