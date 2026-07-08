import React, { useEffect, useState } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip, Legend } from 'recharts';
import { Users, TrendingUp, Award } from 'lucide-react';
import { CustomerTierSummaryDto } from '../../../types/customerTier';
import { getTierSummary } from '../../../lib/api/customerTier';

const COLORS: Record<string, string> = {
  'BRONZE': '#f97316',
  'SILVER': '#94a3b8',
  'GOLD': '#f59e0b',
  'UNKNOWN': '#475569'
};

const TIER_BG: Record<string, string> = {
  'BRONZE': 'linear-gradient(135deg, #92400e, #b45309)',
  'SILVER': 'linear-gradient(135deg, #334155, #475569)',
  'GOLD':   'linear-gradient(135deg, #78350f, #d97706)',
};

const TIER_GLOW: Record<string, string> = {
  'BRONZE': '0 4px 20px rgba(180,83,9,0.35)',
  'SILVER': '0 4px 20px rgba(71,85,105,0.35)',
  'GOLD':   '0 4px 20px rgba(217,119,6,0.45)',
};

export const CustomerTierReport: React.FC = () => {
  const [summary, setSummary] = useState<CustomerTierSummaryDto[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSummary = async () => {
      try {
        const data = await getTierSummary();
        setSummary(data);
      } catch (error) {
        console.error('Failed to load tier summary', error);
      } finally {
        setLoading(false);
      }
    };
    fetchSummary();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center p-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-400"></div>
      </div>
    );
  }

  const totalCustomers = summary.reduce((acc, curr) => acc + curr.customerCount, 0);
  const chartData = summary.map(s => ({
    name: s.tierName,
    value: s.customerCount,
    code: s.tierCode
  }));

  return (
    <div className="rounded-2xl p-6 transition-all duration-300" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', backdropFilter: 'blur(12px)' }}>
      <h2 className="text-xl font-bold text-white tracking-tight mb-6">Tier Distribution</h2>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Stats Column */}
        <div className="space-y-3">
          {/* Total card */}
          <div className="rounded-xl p-4 flex items-center justify-between" style={{ background: 'linear-gradient(135deg, #4f46e5, #7c3aed)', boxShadow: '0 8px 32px rgba(79,70,229,0.4)' }}>
            <div>
              <p className="text-indigo-200 text-xs font-semibold uppercase tracking-widest">Total Customers</p>
              <p className="text-white text-3xl font-black mt-1">{totalCustomers}</p>
              <div className="flex items-center gap-1 mt-1 text-indigo-200 text-xs">
                <TrendingUp className="w-3 h-3" />
                <span>Active across all tiers</span>
              </div>
            </div>
            <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ background: 'rgba(255,255,255,0.2)' }}>
              <Users className="w-6 h-6 text-white" />
            </div>
          </div>

          {/* Per-tier cards */}
          {summary.filter(s => s.tierCode !== 'UNKNOWN').map(tier => (
            <div
              key={tier.tierCode}
              className="rounded-xl p-4 flex items-center justify-between transition-all hover:scale-[1.02]"
              style={{ background: TIER_BG[tier.tierCode] || 'rgba(255,255,255,0.07)', boxShadow: TIER_GLOW[tier.tierCode] }}
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: 'rgba(255,255,255,0.2)' }}>
                  <Award className="w-4 h-4 text-white" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white uppercase tracking-wide">{tier.tierName}</h4>
                  <p className="text-xs text-white/60">Discount: {tier.discountPercent}%</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-xl font-black text-white">{tier.customerCount}</p>
                <p className="text-xs text-white/60">
                  {totalCustomers > 0 ? Math.round((tier.customerCount / totalCustomers) * 100) : 0}%
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Chart */}
        <div className="rounded-xl p-4" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)' }}>
          <div className="h-[280px]">
            {totalCustomers === 0 ? (
              <div className="h-full flex items-center justify-center text-slate-500 text-sm">
                No customer data available
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={chartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={70}
                    outerRadius={110}
                    paddingAngle={4}
                    dataKey="value"
                    animationDuration={1200}
                    animationEasing="ease-out"
                  >
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[entry.code] || COLORS.UNKNOWN} stroke="transparent" />
                    ))}
                  </Pie>
                  <RechartsTooltip
                    contentStyle={{ background: '#1e293b', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '12px', color: '#fff' }}
                    itemStyle={{ fontWeight: 700, color: '#fff' }}
                    labelStyle={{ color: '#94a3b8' }}
                  />
                  <Legend
                    verticalAlign="bottom"
                    height={36}
                    iconType="circle"
                    formatter={(value) => <span style={{ color: '#94a3b8', fontSize: '13px', fontWeight: 600 }}>{value}</span>}
                  />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
