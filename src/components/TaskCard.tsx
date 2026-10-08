import type { KeyboardEvent } from 'react'
import { projects } from '../data/mockData'
import type { Task } from '../types'
import { Icon } from './Icon'
import { ProgressBar } from './ProgressBar'

interface TaskCardProps {
  task: Task
  onOpen: () => void
  onDragStart: () => void
  onDragEnd: () => void
  isDragging: boolean
}

export function TaskCard({
  task,
  onOpen,
  onDragStart,
  onDragEnd,
  isDragging,
}: TaskCardProps) {
  const project = projects.find((item) => item.id === task.projectId)

  const handleKeyDown = (event: KeyboardEvent<HTMLElement>) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault()
      onOpen()
    }
  }

  return (
    <article
      className={`task-card ${isDragging ? 'task-card--dragging' : ''}`}
      draggable
      role="button"
      tabIndex={0}
      aria-label={`Abrir tarefa: ${task.title}`}
      onClick={onOpen}
      onKeyDown={handleKeyDown}
      onDragStart={(event) => {
        event.dataTransfer.effectAllowed = 'move'
        event.dataTransfer.setData('text/plain', task.id)
        onDragStart()
      }}
      onDragEnd={onDragEnd}
    >
      <div className="task-card__top">
        <span
          className={`priority priority--${task.priority.toLocaleLowerCase('pt-BR')}`}
        >
          {task.priority}
        </span>
        <button
          type="button"
          className="icon-button icon-button--small"
          aria-label="Opções da tarefa"
          onClick={(event) => event.stopPropagation()}
        >
          <Icon name="more" size={18} />
        </button>
      </div>

      <h3>{task.title}</h3>

      <div className="task-project">
        <span
          className={`project-mini-dot project-mini-dot--${project?.tone ?? 'blue'}`}
        />
        {project?.name ?? 'Projeto'}
      </div>

      {task.status === 'inProgress' || task.status === 'review' ? (
        <div className="task-card__progress">
          <div>
            <span>Progresso</span>
            <strong>{task.progress}%</strong>
          </div>
          <ProgressBar
            value={task.progress}
            tone={project?.tone ?? 'blue'}
            compact
            label={`Progresso da tarefa ${task.title}`}
          />
        </div>
      ) : null}

      <div className="task-card__meta">
        <span className="source-chip">
          <Icon
            name={
              task.source === 'Planilha'
                ? 'sheet'
                : task.source === 'Site'
                  ? 'globe'
                  : task.source === 'Pasta'
                    ? 'folder'
                    : 'file'
            }
            size={14}
          />
          {task.source}
        </span>
        <span
          className={
            task.dueLabel === 'Hoje' ? 'due-date due-date--urgent' : 'due-date'
          }
        >
          <Icon name={task.status === 'done' ? 'check' : 'calendar'} size={14} />
          {task.dueLabel}
        </span>
      </div>

      <div className="task-card__footer">
        <div
          className="avatar avatar--small"
          style={{ backgroundColor: task.owner.color }}
          title={task.owner.name}
        >
          {task.owner.initials}
        </div>
        <div className="task-card__counts">
          <span>
            <Icon name="paperclip" size={14} />
            {task.files}
          </span>
          <span>
            <Icon name="message" size={14} />
            {task.comments}
          </span>
        </div>
      </div>
    </article>
  )
}
