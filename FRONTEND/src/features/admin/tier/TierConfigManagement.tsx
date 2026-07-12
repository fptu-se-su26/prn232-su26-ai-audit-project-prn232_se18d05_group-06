import React, { useEffect, useState } from 'react';
import { Save, AlertCircle, CheckCircle2 } from 'lucide-react';
import { TierConfigDto } from '../../../types/customerTier';
import { getTierConfigs, updateTierConfig, recalculateAllCustomerTiers } from '../../../lib/api/customerTier';

export const TierConfigManagement: React.FC = () => {
  const [configs, setConfigs] = useState<TierConfigDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const fetchConfigs = async () => {
    try {
      setLoading(true);
      const data = await getTierConfigs();
      setConfigs(data.sort((a, b) => a.minRevenue - b.minRevenue));
      setError(null);
    } catch (err) {
      setError('Failed to load tier configurations.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchConfigs(); }, []);

  const handleChange = (index: number, field: keyof TierConfigDto, value: any) => {
    const updated = [...configs];
    updated[index] = { ...updated[index], [field]: value };
    setConfigs(updated);
  };

  const handleSave = async (index: number) => {
    const config = configs[index];
    if (config.minOrders < 0) { setError(`Min orders for ${config.tierName} cannot be negative.`); return; }
    if (config.discountPercent < 0 || config.discountPercent > 100) { setError(`Discount for ${config.tierName} must be 0–100.`); return; }

    try {
      setSaving(config.tierId);
      setError(null);
      await updateTierConfig(config.tierId, config);
      try { await recalculateAllCustomerTiers(); } catch(e) { console.error('Recalc failed', e); }
      setSuccess(`${config.tierName} updated! Reloading...`);
      setTimeout(() => { setSuccess(null); window.location.reload(); }, 1500);
    } catch (err) {
      setError(`Failed to update ${config.tierName}.`);
    } finally {
      setSaving(null);
    }
  };

  const getTierStyle = (code: string) => {
    switch (code) {
      case 'BRONZE': return {
        bg: 'linear-gradient(145deg, #7c2d12 0%, #c2410c 60%, #ea580c 100%)',
        border: 'rgba(251,146,60,0.4)',
        glow: 'rgba(234,88,12,0.5)',
        icon: '🥉',
      };
      case 'SILVER': return {
        bg: 'linear-gradient(145deg, #1e3a5f 0%, #2d5a8e 60%, #3b7dd8 100%)',
        border: 'rgba(147,197,253,0.3)',
        glow: 'rgba(59,130,246,0.4)',
        icon: '🥈',
      };
      case 'GOLD': return {
        bg: 'linear-gradient(145deg, #713f12 0%, #a16207 60%, #d97706 100%)',
        border: 'rgba(253,224,71,0.4)',
        glow: 'rgba(217,119,6,0.55)',
        icon: '🥇',
      };
      default: return {
        bg: 'linear-gradient(145deg, #1e293b, #334155)',
        border: 'rgba(255,255,255,0.1)',
        glow: 'transparent',
        icon: '⬜',
      };
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center p-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-400"></div>
      </div>
    );
  }

  return (
    <div className="rounded-2xl p-6" style={{ background: 'rgba(15, 23, 42, 0.96)', border: '1px solid rgba(148, 163, 184, 0.14)', backdropFilter: 'blur(16px)' }}>
      <div className="mb-6">
        <h2 className="text-xl font-bold text-white tracking-tight">Tier Configurations</h2>
        <p className="text-sm text-slate-400 mt-1">Set requirements. Changes auto-apply to all customers.</p>
      </div>

      {error && (
        <div className="mb-4 p-3 rounded-xl flex items-center text-sm" style={{ background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.3)', color: '#fca5a5' }}>
          <AlertCircle className="w-4 h-4 mr-2 flex-shrink-0" /> {error}
        </div>
      )}
      {success && (
        <div className="mb-4 p-3 rounded-xl flex items-center text-sm" style={{ background: 'rgba(34,197,94,0.15)', border: '1px solid rgba(34,197,94,0.3)', color: '#86efac' }}>
          <CheckCircle2 className="w-4 h-4 mr-2 flex-shrink-0" /> {success}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {configs.map((config, index) => {
          const s = getTierStyle(config.tierCode);
          return (
            <div
              key={config.tierId}
              className="rounded-2xl p-5 flex flex-col transition-all duration-300 hover:-translate-y-1 relative overflow-hidden"
              style={{ background: s.bg, border: `1px solid ${s.border}`, boxShadow: `0 8px 32px ${s.glow}` }}
            >
              {/* Sheen overlay */}
              <div className="absolute inset-0 rounded-2xl pointer-events-none" style={{ background: 'linear-gradient(135deg, rgba(255,255,255,0.15) 0%, transparent 60%)' }}></div>

              {/* Header */}
              <div className="flex items-center justify-between mb-5 relative z-10">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">{s.icon}</span>
                  <h3 className="text-lg font-black uppercase tracking-wider text-white drop-shadow-sm">{config.tierName}</h3>
                </div>
                <span className="text-[10px] font-bold px-2 py-1 rounded-full text-white/80 backdrop-blur-sm" style={{ background: 'rgba(0,0,0,0.25)' }}>#{config.tierId}</span>
              </div>

              {/* Fields */}
              <div className="space-y-3 flex-grow relative z-10">
                {[
                  { label: 'Min Orders (12M)', field: 'minOrders' as keyof TierConfigDto, type: 'number', step: 1, suffix: null },
                  { label: 'Min Revenue (VNĐ)', field: 'minRevenue' as keyof TierConfigDto, type: 'number', step: 1000000, suffix: null },
                  { label: 'Discount', field: 'discountPercent' as keyof TierConfigDto, type: 'number', step: 0.1, suffix: '%' },
                ].map(({ label, field, type, step, suffix }) => (
                  <div key={String(field)}>
                    <label className="block text-[10px] font-extrabold uppercase tracking-widest mb-1 text-white/60">{label}</label>
                    <div className="relative">
                      <input
                        type={type}
                        step={step}
                        min={0}
                        max={field === 'discountPercent' ? 100 : undefined}
                        value={config[field] as number}
                        onChange={(e) => handleChange(index, field, parseFloat(e.target.value) || 0)}
                        className="w-full px-3 py-2 rounded-xl text-sm font-bold text-white outline-none transition-all"
                        style={{
                          background: 'rgba(0,0,0,0.25)',
                          border: '1px solid rgba(255,255,255,0.2)',
                        }}
                      />
                      {suffix && <span className="absolute right-3 top-1/2 -translate-y-1/2 text-white/60 font-black text-sm">{suffix}</span>}
                    </div>
                  </div>
                ))}
              </div>

              {/* Save Button */}
              <button
                onClick={() => handleSave(index)}
                disabled={saving === config.tierId}
                className="mt-5 w-full py-2.5 text-white text-xs font-black uppercase tracking-widest rounded-xl flex items-center justify-center gap-2 transition-all disabled:opacity-50 relative z-10 hover:brightness-110 active:scale-95"
                style={{ background: 'rgba(0,0,0,0.35)', border: '1px solid rgba(255,255,255,0.3)', backdropFilter: 'blur(8px)' }}
              >
                {saving === config.tierId
                  ? <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  : <><Save className="w-3.5 h-3.5" /> Save Changes</>
                }
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
};
