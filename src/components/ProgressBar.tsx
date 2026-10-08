interface ProgressBarProps {
  value: number
  tone?: 'blue' | 'violet' | 'amber' | 'green'
  compact?: boolean
  label?: string
}

export function ProgressBar({
  value,
  tone = 'blue',
  compact = false,
  label = 'Progresso',
}: ProgressBarProps) {
  const normalizedValue = Math.min(100, Math.max(0, value))

  return (
    <div
      className={`progress-bar ${compact ? 'progress-bar--compact' : ''}`}
      role="progressbar"
      aria-label={label}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={normalizedValue}
    >
      <span
        className={`progress-bar__fill progress-bar__fill--${tone}`}
        style={{ width: `${normalizedValue}%` }}
      />
    </div>
  )
}
