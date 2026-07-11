import React, { useEffect, useState } from 'react';
import { Search, Filter, RefreshCw, ChevronLeft, ChevronRight } from 'lucide-react';
import { CustomerTierDto } from '../../../types/customerTier';
import { getCustomersByTier, recalculateCustomerTier, recalculateAllCustomerTiers } from '../../../lib/api/customerTier';

export const CustomerTierTable: React.FC = () => {
  const [customers, setCustomers] = useState<CustomerTierDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterTier, setFilterTier] = useState<string>('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  const [recalculating, setRecalculating] = useState<number | 'ALL' | null>(null);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const fetchCustomers = async (tier?: string) => {
    try {
      setLoading(true);
      const data = await getCustomersByTier(tier === 'ALL' ? undefined : tier);
      setCustomers(data);
    } catch (error) {
      console.error('Failed to load customers', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers(filterTier);
  }, [filterTier]);

  const handleRecalculate = async (customerId: number) => {
    try {
      setRecalculating(customerId);
      const updated = await recalculateCustomerTier(customerId);
      setCustomers(customers.map(c => c.customerId === customerId ? updated : c));
    } catch (error) {
      console.error('Failed to recalculate tier', error);
      alert('Failed to recalculate tier.');
    } finally {
      setRecalculating(null);
    }
  };

  const handleRecalculateAll = async () => {
    if (!window.confirm('Are you sure you want to recalculate tiers for ALL customers? This may take a while.')) return;
    
    try {
      setRecalculating('ALL');
      await recalculateAllCustomerTiers();
      await fetchCustomers(filterTier);
    } catch (error) {
      console.error('Failed to recalculate all tiers', error);
      alert('Failed to recalculate all tiers.');
    } finally {
      setRecalculating(null);
    }
  };

  const filteredCustomers = customers.filter(c => 
    c.companyName.toLowerCase().includes(searchTerm.toLowerCase()) || 
    c.customerCode.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalPages = Math.ceil(filteredCustomers.length / itemsPerPage);
  const currentData = filteredCustomers.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
  };

  const getTierBadge = (tier: string | null) => {
    if (!tier) return <span className="px-2.5 py-1 text-xs font-bold rounded-full" style={{ background: 'rgba(255,255,255,0.1)', color: '#64748b' }}>None</span>;
    const styles: Record<string, { bg: string; color: string; border: string }> = {
      BRONZE: { bg: 'rgba(180,83,9,0.3)', color: '#fcd34d', border: 'rgba(251,191,36,0.4)' },
      SILVER: { bg: 'rgba(71,85,105,0.3)', color: '#cbd5e1', border: 'rgba(148,163,184,0.4)' },
      GOLD:   { bg: 'rgba(217,119,6,0.3)', color: '#fde68a', border: 'rgba(251,191,36,0.5)' },
    };
    const s = styles[tier] || { bg: 'rgba(255,255,255,0.1)', color: '#94a3b8', border: 'rgba(255,255,255,0.2)' };
    return <span className="px-2.5 py-1 text-xs font-black uppercase rounded-full" style={{ background: s.bg, color: s.color, border: `1px solid ${s.border}` }}>{tier}</span>;
  };

  return (
    <div className="rounded-2xl overflow-hidden transition-all" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', backdropFilter: 'blur(12px)' }}>
      {/* Header */}
      <div className="p-6 flex flex-col md:flex-row md:items-center justify-between gap-4" style={{ borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
        <div>
          <h3 className="text-xl font-bold text-white">Customer List</h3>
          <p className="text-sm text-slate-400 mt-1">Manage customer tiers and recalculate metrics.</p>
        </div>
        <button
          onClick={handleRecalculateAll}
          disabled={recalculating === 'ALL'}
          className="flex items-center justify-center px-4 py-2.5 text-white text-sm font-bold rounded-xl hover:brightness-110 transition-all disabled:opacity-50"
          style={{ background: 'linear-gradient(135deg, #4f46e5, #7c3aed)', boxShadow: '0 4px 16px rgba(79,70,229,0.4)' }}
        >
          <RefreshCw className={`w-4 h-4 mr-2 ${recalculating === 'ALL' ? 'animate-spin' : ''}`} />
          Recalculate All
        </button>
      </div>

      {/* Filters */}
      <div className="p-4 flex flex-col sm:flex-row gap-4" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)', background: 'rgba(255,255,255,0.02)' }}>
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search by name or code..."
            value={searchTerm}
            onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
            className="block w-full pl-10 pr-3 py-2.5 rounded-xl text-sm text-white outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all"
            style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.1)' }}
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-slate-400" />
          <select
            value={filterTier}
            onChange={(e) => { setFilterTier(e.target.value); setCurrentPage(1); }}
            className="block w-full sm:w-40 pl-3 pr-8 py-2.5 text-sm text-white rounded-xl outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all appearance-none"
            style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.1)' }}
          >
            <option value="ALL" style={{ background: '#1e293b' }}>All Tiers</option>
            <option value="GOLD" style={{ background: '#1e293b' }}>Gold</option>
            <option value="SILVER" style={{ background: '#1e293b' }}>Silver</option>
            <option value="BRONZE" style={{ background: '#1e293b' }}>Bronze</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full">
          <thead>
            <tr style={{ background: 'rgba(255,255,255,0.04)' }}>
              <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-slate-400 uppercase tracking-widest">Customer</th>
              <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-slate-400 uppercase tracking-widest">Tier</th>
              <th scope="col" className="px-6 py-4 text-right text-xs font-bold text-slate-400 uppercase tracking-widest">Orders (12M)</th>
              <th scope="col" className="px-6 py-4 text-right text-xs font-bold text-slate-400 uppercase tracking-widest">Revenue (12M)</th>
              <th scope="col" className="px-6 py-4 text-center text-xs font-bold text-slate-400 uppercase tracking-widest">Last Updated</th>
              <th scope="col" className="px-6 py-4 text-right text-xs font-bold text-slate-400 uppercase tracking-widest">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={6} className="px-6 py-10 text-center">
                  <div className="flex justify-center"><div className="animate-spin rounded-full h-6 w-6 border-b-2 border-indigo-400"></div></div>
                </td>
              </tr>
            ) : currentData.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-10 text-center text-slate-500 text-sm">
                  No customers found matching the criteria.
                </td>
              </tr>
            ) : (
              currentData.map((customer, idx) => (
                <tr
                  key={customer.customerId}
                  className="transition-colors hover:bg-white/5"
                  style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex flex-col">
                      <span className="text-sm font-semibold text-white">{customer.companyName}</span>
                      <span className="text-xs text-slate-500">{customer.customerCode}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {getTierBadge(customer.tier)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-bold text-white">
                    {customer.totalOrders12M || 0}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-bold text-white">
                    {formatCurrency(customer.totalRevenue12M)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center text-sm text-slate-400">
                    {customer.tierUpdatedAt ? new Date(customer.tierUpdatedAt).toLocaleDateString('vi-VN') : '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button
                      onClick={() => handleRecalculate(customer.customerId)}
                      disabled={recalculating === customer.customerId || recalculating === 'ALL'}
                      className="inline-flex items-center px-3 py-1.5 text-xs font-bold rounded-lg transition-all disabled:opacity-50 hover:brightness-110"
                      style={{ background: 'rgba(99,102,241,0.2)', color: '#a5b4fc', border: '1px solid rgba(99,102,241,0.3)' }}
                    >
                      {recalculating === customer.customerId ? (
                        <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-indigo-400 mr-1"></div>
                      ) : (
                        <RefreshCw className="w-3 h-3 mr-1" />
                      )}
                      Recalc
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {!loading && totalPages > 1 && (
        <div className="px-6 py-4 flex items-center justify-between" style={{ borderTop: '1px solid rgba(255,255,255,0.06)', background: 'rgba(255,255,255,0.02)' }}>
          <div className="text-sm text-slate-400">
            Showing <span className="font-bold text-white">{(currentPage - 1) * itemsPerPage + 1}</span> to <span className="font-bold text-white">{Math.min(currentPage * itemsPerPage, filteredCustomers.length)}</span> of <span className="font-bold text-white">{filteredCustomers.length}</span> results
          </div>
          <div className="flex gap-1">
            <button
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white transition-colors disabled:opacity-30"
              style={{ background: 'rgba(255,255,255,0.07)' }}
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white transition-colors disabled:opacity-30"
              style={{ background: 'rgba(255,255,255,0.07)' }}
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
