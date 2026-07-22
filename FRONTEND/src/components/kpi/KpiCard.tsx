import { Link } from 'react-router-dom';

interface KpiCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: string;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  color: 'blue' | 'green' | 'red' | 'amber' | 'purple' | 'slate' | 'emerald';
  linkTo?: string;
  className?: string;
}

const colorClasses = {
  blue: {
    bg: 'bg-blue-50',
    border: 'border-blue-200',
    icon: 'bg-blue-100 text-blue-700',
    value: 'text-blue-700',
  },
  green: {
    bg: 'bg-emerald-50',
    border: 'border-emerald-200',
    icon: 'bg-emerald-100 text-emerald-700',
    value: 'text-emerald-700',
  },
  red: {
    bg: 'bg-rose-50',
    border: 'border-rose-200',
    icon: 'bg-rose-100 text-rose-700',
    value: 'text-rose-700',
  },
  amber: {
    bg: 'bg-amber-50',
    border: 'border-amber-200',
    icon: 'bg-amber-100 text-amber-700',
    value: 'text-amber-700',
  },
  purple: {
    bg: 'bg-violet-50',
    border: 'border-violet-200',
    icon: 'bg-violet-100 text-violet-700',
    value: 'text-violet-700',
  },
  slate: {
    bg: 'bg-slate-50',
    border: 'border-slate-200',
    icon: 'bg-slate-100 text-slate-700',
    value: 'text-slate-700',
  },
  emerald: {
    bg: 'bg-emerald-50',
    border: 'border-emerald-200',
    icon: 'bg-emerald-100 text-emerald-700',
    value: 'text-emerald-700',
  },
};

const formatNumber = (value: string | number): string => {
  if (typeof value === 'string') return value;
  if (value >= 1000000000) return `${(value / 1000000000).toFixed(1)}B`;
  if (value >= 1000000) return `${(value / 1000000).toFixed(1)}M`;
  if (value >= 1000) return `${(value / 1000).toFixed(1)}K`;
  return value.toLocaleString('vi-VN');
};

const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
};

export const KpiCard: React.FC<KpiCardProps> = ({
  title,
  value,
  subtitle,
  icon,
  trend,
  color,
  linkTo,
  className = '',
}) => {
  const colors = colorClasses[color];

  const cardContent = (
    <div className={`relative overflow-hidden rounded-2xl border ${colors.border} ${colors.bg} p-5 transition-all hover:shadow-md hover:-translate-y-0.5 ${className}`}>
      <div className="flex items-start justify-between">
        <div className={`p-2.5 rounded-xl ${colors.icon}`}>
          <span className="material-symbols-outlined text-xl">{icon}</span>
        </div>
        {trend && (
          <div className={`flex items-center gap-1 text-xs font-bold ${trend.isPositive ? 'text-emerald-600' : 'text-rose-600'}`}>
            <span className="material-symbols-outlined text-sm">
              {trend.isPositive ? 'trending_up' : 'trending_down'}
            </span>
            {Math.abs(trend.value)}%
          </div>
        )}
      </div>

      <div className="mt-4">
        <p className="text-sm font-semibold text-slate-500">{title}</p>
        <p className={`mt-1 text-3xl font-black ${colors.value}`}>
          {typeof value === 'number' && value >= 100000
            ? formatCurrency(value)
            : formatNumber(value)}
        </p>
        {subtitle && (
          <p className="mt-1 text-xs font-semibold text-slate-400">{subtitle}</p>
        )}
      </div>

      <div className="absolute bottom-0 right-0 w-20 h-20 opacity-10">
        <span className="material-symbols-outlined text-[120px] text-current">{icon}</span>
      </div>
    </div>
  );

  if (linkTo) {
    return (
      <Link to={linkTo} className="block">
        {cardContent}
      </Link>
    );
  }

  return cardContent;
};

export default KpiCard;
