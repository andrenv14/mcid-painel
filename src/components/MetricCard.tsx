import type { ReactNode } from 'react'
import { Icon, type IconName } from './Icon'

interface MetricCardProps {
  label: string
  value: string
  detail: string
  icon: IconName
  tone: 'green' | 'blue' | 'violet' | 'amber'
  mini: ReactNode
}

export function MetricCard({
  label,
  value,
  detail,
  icon,
  tone,
  mini,
}: MetricCardProps) {
  return (
    <article className="metric-card">
      <div className="metric-card__main">
        <span className={`metric-icon metric-icon--${tone}`}>
          <Icon name={icon} size={20} />
        </span>
        <div>
          <span className="metric-card__label">{label}</span>
          <div className="metric-card__value">{value}</div>
          <span className={`metric-card__detail metric-card__detail--${tone}`}>
            {detail}
          </span>
        </div>
      </div>
      <div className="metric-card__mini">{mini}</div>
    </article>
  )
}

export function MiniBars({
  values,
  tone,
}: {
  values: number[]
  tone: 'blue' | 'violet'
}) {
  return (
    <div className={`mini-bars mini-bars--${tone}`} aria-hidden="true">
      {values.map((value, index) => (
        <span key={index} style={{ height: `${value}%` }} />
      ))}
    </div>
  )
}
