import { useState, useEffect } from 'react';
import Sidebar from '../../components/Sidebar';
import WarehouseHeader from '../../components/WarehouseHeader';
import { getTransferHistory, createTransfer, getTransferOptions, StockTransferResponse, StockTransferOptions } from '../../lib/stockTransferApi';

const WarehouseTransfer = () => {
  const [history, setHistory] = useState<StockTransferResponse[]>([]);
  const [options, setOptions] = useState<StockTransferOptions>({ skus: [], fromBins: [], allBins: [] });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Pagination states
  const [page, setPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const pageSize = 5; // Reduced page size to test pagination easier

  // Form states
  const [skuid, setSkuid] = useState('');
  const [fromBinId, setFromBinId] = useState('');
  const [toBinId, setToBinId] = useState('');
  const [quantity, setQuantity] = useState('');

  useEffect(() => {
    fetchOptions();
  }, []);

  useEffect(() => {
    fetchHistory();
  }, [page]);

  const fetchOptions = async () => {
    try {
      const data = await getTransferOptions();
      setOptions(data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchHistory = async () => {
    try {
      const data = await getTransferHistory(page, pageSize);
      setHistory(data.items);
      setTotalCount(data.totalCount);
    } catch (err) {
      console.error(err);
    }
  };

  const handleTransfer = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      await createTransfer({
        skuid: parseInt(skuid),
        fromBinId: parseInt(fromBinId),
        toBinId: parseInt(toBinId),
        quantity: parseInt(quantity)
      });
      setSuccess('Transfer created successfully!');
      setSkuid(''); setFromBinId(''); setToBinId(''); setQuantity('');
      fetchHistory();
      fetchOptions();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error creating transfer');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f7f9fb] text-[#191c1e] antialiased overflow-hidden">
      <Sidebar />

      <main className="ml-[280px] min-h-screen flex flex-col">
        <WarehouseHeader 
          title=""
        />

        <div className="pt-24 p-8 space-y-6 flex-1 flex flex-col animate-fade-in-up max-w-[1600px] mx-auto w-full">
          
          {/* Top Stats Row to fill empty space */}
          <div className="grid grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center text-blue-600">
                <span className="material-symbols-outlined">swap_horiz</span>
              </div>
              <div>
                <p className="text-sm text-slate-500 font-medium">Total Transfers (History)</p>
                <p className="text-2xl font-bold">{history.length}</p>
              </div>
            </div>
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-green-50 flex items-center justify-center text-green-600">
                <span className="material-symbols-outlined">inventory_2</span>
              </div>
              <div>
                <p className="text-sm text-slate-500 font-medium">Available SKUs</p>
                <p className="text-2xl font-bold">{options.skus.length}</p>
              </div>
            </div>
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-6 rounded-2xl shadow-md text-white flex items-center gap-4 relative overflow-hidden">
              <span className="material-symbols-outlined absolute -right-4 -bottom-4 text-[100px] opacity-20">local_shipping</span>
              <div className="relative z-10">
                <p className="text-sm text-blue-100 font-medium">System Status</p>
                <p className="text-xl font-bold mt-1">Ready for Transfer</p>
              </div>
            </div>
          </div>

          {/* Form Section - Full Width to fix truncation */}
          <div className="bg-white p-6 rounded-[20px] shadow-sm border border-slate-100">
            <div className="flex items-center gap-2 mb-6">
              <span className="material-symbols-outlined text-blue-600">add_circle</span>
              <h3 className="text-lg font-bold text-slate-800">New Transfer Order</h3>
            </div>
            
            {error && <div className="bg-red-50 text-red-600 p-4 rounded-xl text-sm mb-6 border border-red-100 font-medium">{error}</div>}
            {success && <div className="bg-green-50 text-green-700 p-4 rounded-xl text-sm mb-6 border border-green-100 font-medium">{success}</div>}

            <form onSubmit={handleTransfer} className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-5 gap-6 items-end">
              <div className="xl:col-span-1">
                <label className="text-xs text-slate-500 font-bold uppercase tracking-wider">SKU ID</label>
                <select 
                  required value={skuid} onChange={e => setSkuid(e.target.value)}
                  className="w-full mt-2 p-3.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all font-medium text-slate-700" 
                >
                  <option value="">-- Select SKU --</option>
                  {options.skus.map(s => (
                    <option key={s.skuid} value={s.skuid}>{s.skucode} - {s.productName}</option>
                  ))}
                </select>
              </div>
              
              <div className="xl:col-span-1">
                <label className="text-xs text-slate-500 font-bold uppercase tracking-wider">From Bin</label>
                <select 
                  required value={fromBinId} onChange={e => setFromBinId(e.target.value)}
                  className="w-full mt-2 p-3.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all font-medium text-slate-700" 
                >
                  <option value="">-- Select Source Bin --</option>
                  {options.fromBins
                    .filter(b => b.skuid === parseInt(skuid))
                    .map(b => (
                    <option key={b.binId + '-' + b.skuid} value={b.binId}>
                      {b.binCode} ({b.zoneName}) - Qty: {b.quantity}
                    </option>
                  ))}
                </select>
              </div>

              <div className="xl:col-span-1">
                <label className="text-xs text-slate-500 font-bold uppercase tracking-wider">To Bin</label>
                <select 
                  required value={toBinId} onChange={e => setToBinId(e.target.value)}
                  className="w-full mt-2 p-3.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all font-medium text-slate-700" 
                >
                  <option value="">-- Select Dest Bin --</option>
                  {options.allBins.map(b => (
                    <option key={b.binId} value={b.binId}>{b.binCode} ({b.zoneName})</option>
                  ))}
                </select>
              </div>

              <div className="xl:col-span-1">
                <label className="text-xs text-slate-500 font-bold uppercase tracking-wider">Quantity</label>
                <input 
                  type="number" required min="1" value={quantity} onChange={e => setQuantity(e.target.value)}
                  className="w-full mt-2 p-3.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all font-medium text-slate-700" 
                  placeholder="Amount" 
                />
              </div>
              
              <div className="xl:col-span-1">
                <button 
                  type="submit" disabled={loading}
                  className="w-full bg-blue-600 text-white font-bold h-[52px] rounded-xl hover:bg-blue-700 transition-all disabled:opacity-50 shadow-md shadow-blue-500/20 flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <span className="material-symbols-outlined animate-spin">refresh</span>
                  ) : (
                    <>
                      <span className="material-symbols-outlined">send</span>
                      CONFIRM
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>

          {/* History Section - Fills remaining space */}
          <div className="bg-white rounded-[20px] shadow-sm border border-slate-100 flex-1 flex flex-col overflow-hidden">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-slate-500">history</span>
                <h3 className="text-lg font-bold text-slate-800">Recent Transfers</h3>
              </div>
              <button onClick={fetchHistory} className="flex items-center gap-2 text-sm font-semibold text-blue-600 hover:bg-blue-50 px-3 py-1.5 rounded-lg transition-colors">
                <span className="material-symbols-outlined text-[18px]">refresh</span>
                Refresh
              </button>
            </div>

            <div className="overflow-x-auto flex-1">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-100">
                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">TRANSFER ID</th>
                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">PRODUCT</th>
                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-center">QTY</th>
                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">ROUTING (FROM &rarr; TO)</th>
                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">TIMESTAMP</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {history.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-6 py-12 text-center text-slate-400">
                        <span className="material-symbols-outlined text-4xl mb-2 block opacity-50">inbox</span>
                        <p>No transfer history found in the database.</p>
                      </td>
                    </tr>
                  ) : (
                    history.map((tx) => (
                      <tr key={tx.transferId} className="hover:bg-slate-50/80 transition-colors group">
                        <td className="px-6 py-4 font-mono text-sm font-medium text-blue-600">{tx.transferCode}</td>
                        <td className="px-6 py-4">
                          <p className="font-bold text-slate-800">{tx.productName || 'Unknown SKU'}</p>
                          <p className="text-xs text-slate-500 mt-0.5">SKU: {tx.skucode || tx.skuid}</p>
                        </td>
                        <td className="px-6 py-4 text-center font-bold text-slate-700 text-lg">{tx.quantity}</td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3 text-sm">
                            <span className="bg-rose-50 text-rose-700 border border-rose-100 px-2.5 py-1 rounded-md font-mono font-medium shadow-sm">{tx.fromBinCode || tx.fromBinId}</span>
                            <span className="material-symbols-outlined text-slate-300">arrow_forward</span>
                            <span className="bg-emerald-50 text-emerald-700 border border-emerald-100 px-2.5 py-1 rounded-md font-mono font-medium shadow-sm">{tx.toBinCode || tx.toBinId}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-slate-500 font-medium">
                          {new Date(tx.createdAt).toLocaleString('en-GB', { 
                            day: '2-digit', month: 'short', year: 'numeric', 
                            hour: '2-digit', minute: '2-digit' 
                          })}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination Controls */}
            {totalCount > 0 && (
              <div className="p-4 border-t border-slate-100 flex items-center justify-between bg-slate-50">
                <p className="text-sm text-slate-500">
                  Showing <span className="font-bold">{((page - 1) * pageSize) + 1}</span> to <span className="font-bold">{Math.min(page * pageSize, totalCount)}</span> of <span className="font-bold">{totalCount}</span> entries
                </p>
                <div className="flex gap-2">
                  <button 
                    disabled={page === 1} 
                    onClick={() => setPage(page - 1)}
                    className="px-3 py-1 bg-white border border-slate-200 rounded-md text-sm font-medium hover:bg-slate-100 disabled:opacity-50 transition"
                  >
                    Previous
                  </button>
                  <button 
                    disabled={page * pageSize >= totalCount} 
                    onClick={() => setPage(page + 1)}
                    className="px-3 py-1 bg-white border border-slate-200 rounded-md text-sm font-medium hover:bg-slate-100 disabled:opacity-50 transition"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </div>

        </div>
      </main>
    </div>
  );
};

export default WarehouseTransfer;
