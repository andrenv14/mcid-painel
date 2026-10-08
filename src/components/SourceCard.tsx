import { Icon, type IconName } from './Icon'

interface SourceCardProps {
  icon: IconName
  title: string
  detail: string
  meta: string
  tone: 'blue' | 'violet' | 'amber'
  connected: boolean
}

export function SourceCard({
  icon,
  title,
  detail,
  meta,
  tone,
  connected,
}: SourceCardProps) {
  return (
    <article className="source-card">
      <span className={`source-icon source-icon--${tone}`}>
        <Icon name={icon} size={21} />
      </span>
      <div className="source-card__copy">
        <div>
          <strong>{title}</strong>
          {connected && (
            <span className="connected-badge">
              <span />
              Conectado
            </span>
          )}
        </div>
        <span>{detail}</span>
        <small>{meta}</small>
      </div>
      <button
        type="button"
        className="icon-button icon-button--small"
        aria-label="Opções da fonte"
      >
        <Icon name="more" size={18} />
      </button>
    </article>
  )
}
