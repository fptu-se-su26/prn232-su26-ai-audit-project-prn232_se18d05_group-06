type Props = {
  title: string
  value: string
  label?: string
  icon?: string
  tone?: 'primary' | 'secondary' | 'error' | 'tertiary'
  note?: string
}

const toneMap: Record<string, string> = {
  primary: 'bg-primary-fixed text-primary',
  secondary: 'bg-secondary-fixed text-secondary',
  error: 'bg-error/10 text-error',
  tertiary: 'bg-tertiary-fixed text-tertiary',
}

const StatsCard = ({ title, value, label, icon, tone = 'primary', note }: Props) => {
  return (
    <div className="glass-card p-6 rounded-lg flex flex-col justify-between hover:glow-primary transition-all duration-300">
      <div className="flex justify-between items-start">
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${toneMap[tone]}`}>
          <span className="material-symbols-outlined">{icon}</span>
        </div>
        {label && <span className={`px-2 py-1 rounded text-[12px] font-bold ${tone === 'error' ? 'bg-error/10 text-error' : ''}`}>{label}</span>}
      </div>
      <div className="mt-4">
        <h3 className="text-on-surface-variant text-sm">{title}</h3>
        <p className="text-4xl font-bold">{value}</p>
        {note ? <p className="text-sm mt-1 text-on-surface-variant">{note}</p> : null}
      </div>
    </div>
  )
}

export default StatsCard
