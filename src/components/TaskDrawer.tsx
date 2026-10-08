import { projects } from '../data/mockData'
import type { Task, TaskStatus } from '../types'
import { Icon } from './Icon'
import { ProgressBar } from './ProgressBar'

const statusLabels: Record<TaskStatus, string> = {
  backlog: 'A fazer',
  inProgress: 'Em andamento',
  review: 'Em revisão',
  done: 'Concluído',
}

const statusDotClasses: Record<TaskStatus, string> = {
  backlog: 'status-dot--neutral',
  inProgress: 'status-dot--blue',
  review: 'status-dot--amber',
  done: 'status-dot--green',
}

interface TaskDrawerProps {
  task: Task
  onClose: () => void
  onAdvance: () => void
}

export function TaskDrawer({
  task,
  onClose,
  onAdvance,
}: TaskDrawerProps) {
  const project = projects.find((item) => item.id === task.projectId)
  const canAdvance = task.status !== 'done'

  return (
    <div className="drawer-layer">
      <button
        type="button"
        className="drawer-backdrop"
        aria-label="Fechar detalhes"
        onClick={onClose}
      />
      <aside
        className="task-drawer"
        role="dialog"
        aria-modal="true"
        aria-label="Detalhes da tarefa"
      >
        <div className="drawer-heading">
          <div>
            <span className="section-kicker">Detalhes da tarefa</span>
            <span className="task-id">{task.id.toUpperCase()}</span>
          </div>
          <button
            type="button"
            className="icon-button"
            aria-label="Fechar"
            onClick={onClose}
          >
            <Icon name="x" />
          </button>
        </div>

        <div className="drawer-body">
          <span
            className={`priority priority--${task.priority.toLocaleLowerCase('pt-BR')}`}
          >
            Prioridade {task.priority.toLocaleLowerCase('pt-BR')}
          </span>
          <h2>{task.title}</h2>

          <div className="drawer-project">
            <span
              className={`project-icon project-icon--${project?.tone ?? 'blue'}`}
            >
              <Icon name="folder" size={18} />
            </span>
            <div>
              <span>Projeto</span>
              <strong>{project?.name}</strong>
            </div>
          </div>

          <div className="drawer-progress">
            <div>
              <span>Progresso atual</span>
              <strong>{task.progress}%</strong>
            </div>
            <ProgressBar
              value={task.progress}
              tone={project?.tone ?? 'blue'}
              label={`Progresso de ${task.title}`}
            />
          </div>

          <dl className="detail-grid">
            <div>
              <dt>Status</dt>
              <dd>
                <span
                  className={`status-dot ${statusDotClasses[task.status]}`}
                />
                {statusLabels[task.status]}
              </dd>
            </div>
            <div>
              <dt>Responsável</dt>
              <dd>
                <span
                  className="avatar avatar--tiny"
                  style={{ backgroundColor: task.owner.color }}
                >
                  {task.owner.initials}
                </span>
                {task.owner.name}
              </dd>
            </div>
            <div>
              <dt>Fonte</dt>
              <dd>
                <Icon name="database" size={16} />
                {task.source}
              </dd>
            </div>
            <div>
              <dt>Prazo</dt>
              <dd>
                <Icon name="calendar" size={16} />
                {task.dueLabel}
              </dd>
            </div>
          </dl>

          <div className="drawer-files">
            <div>
              <span className="section-kicker">Vínculos</span>
              <h3>Arquivos e conversas</h3>
            </div>
            <div className="drawer-file-row">
              <span>
                <Icon name="paperclip" size={17} />
                {task.files} arquivos vinculados
              </span>
              <Icon name="arrowRight" size={16} />
            </div>
            <div className="drawer-file-row">
              <span>
                <Icon name="message" size={17} />
                {task.comments} comentários
              </span>
              <Icon name="arrowRight" size={16} />
            </div>
          </div>
        </div>

        <div className="drawer-actions">
          <button type="button" className="ghost-button" onClick={onClose}>
            Fechar
          </button>
          {canAdvance && (
            <button type="button" className="primary-button" onClick={onAdvance}>
              Avançar etapa
              <Icon name="arrowRight" size={17} />
            </button>
          )}
        </div>
      </aside>
    </div>
  )
}
