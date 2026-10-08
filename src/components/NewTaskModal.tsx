import { useEffect, useState, type FormEvent } from 'react'
import { projects } from '../data/mockData'
import type { DataSource, NewTaskInput, Priority } from '../types'
import { Icon } from './Icon'

interface NewTaskModalProps {
  open: boolean
  onClose: () => void
  onSubmit: (input: NewTaskInput) => void
}

export function NewTaskModal({
  open,
  onClose,
  onSubmit,
}: NewTaskModalProps) {
  const [title, setTitle] = useState('')
  const [projectId, setProjectId] = useState(projects[0]?.id ?? '')
  const [priority, setPriority] = useState<Priority>('Média')
  const [source, setSource] = useState<DataSource>('Manual')

  useEffect(() => {
    if (open) return
    setTitle('')
    setProjectId(projects[0]?.id ?? '')
    setPriority('Média')
    setSource('Manual')
  }, [open])

  if (!open) return null

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const normalizedTitle = title.trim()
    if (!normalizedTitle) return
    onSubmit({ title: normalizedTitle, projectId, priority, source })
  }

  return (
    <div className="modal-layer">
      <button
        type="button"
        className="modal-backdrop"
        aria-label="Fechar formulário"
        onClick={onClose}
      />
      <div
        className="task-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="new-task-title"
      >
        <div className="modal-heading">
          <div className="modal-heading__icon">
            <Icon name="sparkles" size={21} />
          </div>
          <div>
            <span className="section-kicker">Organize o trabalho</span>
            <h2 id="new-task-title">Adicionar nova tarefa</h2>
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

        <form onSubmit={handleSubmit}>
          <label className="form-field form-field--full">
            <span>Nome da tarefa</span>
            <input
              autoFocus
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              placeholder="Ex.: Revisar documentos recebidos"
              maxLength={100}
              required
            />
          </label>

          <label className="form-field form-field--full">
            <span>Projeto</span>
            <select
              value={projectId}
              onChange={(event) => setProjectId(event.target.value)}
            >
              {projects.map((project) => (
                <option value={project.id} key={project.id}>
                  {project.name}
                </option>
              ))}
            </select>
          </label>

          <div className="form-row">
            <label className="form-field">
              <span>Prioridade</span>
              <select
                value={priority}
                onChange={(event) =>
                  setPriority(event.target.value as Priority)
                }
              >
                <option value="Alta">Alta</option>
                <option value="Média">Média</option>
                <option value="Baixa">Baixa</option>
              </select>
            </label>

            <label className="form-field">
              <span>Fonte</span>
              <select
                value={source}
                onChange={(event) => setSource(event.target.value as DataSource)}
              >
                <option value="Manual">Manual</option>
                <option value="Pasta">Pasta</option>
                <option value="Planilha">Planilha</option>
                <option value="Site">Site</option>
              </select>
            </label>
          </div>

          <div className="modal-note">
            <Icon name="database" size={18} />
            <p>
              Nesta versão, os dados ficam salvos no navegador. A sincronização
              automática será conectada na etapa do back-end.
            </p>
          </div>

          <div className="modal-actions">
            <button type="button" className="ghost-button" onClick={onClose}>
              Cancelar
            </button>
            <button
              type="submit"
              className="primary-button"
              disabled={!title.trim()}
            >
              <Icon name="plus" size={17} />
              Criar tarefa
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
