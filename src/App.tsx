import {
  useEffect,
  useMemo,
  useState,
  type DragEvent,
  type FormEvent,
  type KeyboardEvent,
} from 'react'
import { Icon, type IconName } from './components/Icon'
import { ProgressBar } from './components/ProgressBar'
import { activities, initialTasks, projects } from './data/mockData'
import type {
  DataSource,
  NewTaskInput,
  Priority,
  Task,
  TaskStatus,
} from './types'

const STORAGE_KEY = 'mcid-painel-tasks'
const THEME_KEY = 'mcid-painel-theme'

const columns: Array<{
  id: TaskStatus
  title: string
  description: string
  dotClass: string
}> = [
  {
    id: 'backlog',
    title: 'A fazer',
    description: 'Itens aguardando início',
    dotClass: 'status-dot--neutral',
  },
  {
    id: 'inProgress',
    title: 'Em andamento',
    description: 'Trabalho em execução',
    dotClass: 'status-dot--blue',
  },
  {
    id: 'review',
    title: 'Em revisão',
    description: 'Aguardando validação',
    dotClass: 'status-dot--amber',
  },
  {
    id: 'done',
    title: 'Concluído',
    description: 'Entregas finalizadas',
    dotClass: 'status-dot--green',
  },
]

const statusOrder: TaskStatus[] = ['backlog', 'inProgress', 'review', 'done']

function loadTasks(): Task[] {
  try {
    const savedTasks = localStorage.getItem(STORAGE_KEY)
    if (!savedTasks) return initialTasks
    const parsedTasks: unknown = JSON.parse(savedTasks)
    return Array.isArray(parsedTasks) ? (parsedTasks as Task[]) : initialTasks
  } catch {
    return initialTasks
  }
}

function getInitialTheme(): 'light' | 'dark' {
  const savedTheme = localStorage.getItem(THEME_KEY)
  if (savedTheme === 'light' || savedTheme === 'dark') return savedTheme

  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

function App() {
  const [tasks, setTasks] = useState<Task[]>(loadTasks)
  const [theme, setTheme] = useState<'light' | 'dark'>(getInitialTheme)
  const [query, setQuery] = useState('')
  const [projectFilter, setProjectFilter] = useState('all')
  const [sourceFilter, setSourceFilter] = useState<'all' | DataSource>('all')
  const [period, setPeriod] = useState('Este mês')
  const [draggedTaskId, setDraggedTaskId] = useState<string | null>(null)
  const [dropTarget, setDropTarget] = useState<TaskStatus | null>(null)
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null)
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false)
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false)
  const [toast, setToast] = useState<{ id: number; message: string } | null>(null)
  const [activeSection, setActiveSection] = useState('overview')

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks))
  }, [tasks])

  useEffect(() => {
    document.documentElement.dataset.theme = theme
    localStorage.setItem(THEME_KEY, theme)

    const themeMeta = document.querySelector('meta[name="theme-color"]')
    themeMeta?.setAttribute('content', theme === 'dark' ? '#121713' : '#f7f8f5')
  }, [theme])

  useEffect(() => {
    if (!toast) return
    const timeoutId = window.setTimeout(() => setToast(null), 3200)
    return () => window.clearTimeout(timeoutId)
  }, [toast])

  useEffect(() => {
    function handleEscape(event: globalThis.KeyboardEvent) {
      if (event.key !== 'Escape') return
      setIsTaskModalOpen(false)
      setSelectedTaskId(null)
      setIsSidebarOpen(false)
      setIsNotificationsOpen(false)
    }

    window.addEventListener('keydown', handleEscape)
    return () => window.removeEventListener('keydown', handleEscape)
  }, [])

  const showToast = (message: string) => {
    setToast({ id: Date.now(), message })
  }

  const filteredTasks = useMemo(() => {
    const normalizedQuery = query.trim().toLocaleLowerCase('pt-BR')

    return tasks.filter((task) => {
      const project = projects.find((item) => item.id === task.projectId)
      const matchesQuery =
        !normalizedQuery ||
        task.title.toLocaleLowerCase('pt-BR').includes(normalizedQuery) ||
        project?.name.toLocaleLowerCase('pt-BR').includes(normalizedQuery) ||
        task.owner.name.toLocaleLowerCase('pt-BR').includes(normalizedQuery)
      const matchesProject =
        projectFilter === 'all' || task.projectId === projectFilter
      const matchesSource =
        sourceFilter === 'all' || task.source === sourceFilter

      return matchesQuery && matchesProject && matchesSource
    })
  }, [projectFilter, query, sourceFilter, tasks])

  const selectedTask = tasks.find((task) => task.id === selectedTaskId) ?? null
  const overallProgress = Math.round(
    projects.reduce((sum, project) => sum + project.progress, 0) / projects.length,
  )
  const completedCount = tasks.filter((task) => task.status === 'done').length
  const activeCount = tasks.filter(
    (task) => task.status === 'inProgress' || task.status === 'review',
  ).length
  const dueTodayCount = tasks.filter(
    (task) => task.dueLabel === 'Hoje' && task.status !== 'done',
  ).length

  const formattedDate = useMemo(() => {
    const result = new Intl.DateTimeFormat('pt-BR', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
    }).format(new Date())

    return result.charAt(0).toUpperCase() + result.slice(1)
  }, [])

  const moveTask = (taskId: string, nextStatus: TaskStatus) => {
    let changedTaskTitle = ''

    setTasks((currentTasks) =>
      currentTasks.map((task) => {
        if (task.id !== taskId || task.status === nextStatus) return task
        changedTaskTitle = task.title
        return {
          ...task,
          status: nextStatus,
          progress:
            nextStatus === 'done'
              ? 100
              : nextStatus === 'review'
                ? Math.max(task.progress, 80)
                : nextStatus === 'inProgress'
                  ? Math.max(task.progress, 20)
                  : task.progress,
          dueLabel: nextStatus === 'done' ? 'Concluída' : task.dueLabel,
        }
      }),
    )

    if (changedTaskTitle) {
      const destination = columns.find((column) => column.id === nextStatus)?.title
      showToast(`“${changedTaskTitle}” movida para ${destination}.`)
    }
  }

  const handleDrop = (event: DragEvent<HTMLDivElement>, status: TaskStatus) => {
    event.preventDefault()
    if (draggedTaskId) moveTask(draggedTaskId, status)
    setDraggedTaskId(null)
    setDropTarget(null)
  }

  const addTask = (input: NewTaskInput) => {
    const newTask: Task = {
      id: `task-${Date.now()}`,
      title: input.title,
      projectId: input.projectId,
      status: 'backlog',
      priority: input.priority,
      source: input.source,
      owner: {
        name: 'André N.',
        initials: 'AN',
        color: '#244f3b',
      },
      dueLabel: 'Sem prazo',
      progress: 0,
      files: 0,
      comments: 0,
    }

    setTasks((currentTasks) => [newTask, ...currentTasks])
    setIsTaskModalOpen(false)
    setProjectFilter('all')
    showToast('Nova tarefa adicionada ao quadro.')
  }

  const advanceTask = (task: Task) => {
    const currentIndex = statusOrder.indexOf(task.status)
    const nextStatus = statusOrder[currentIndex + 1]
    if (!nextStatus) return
    moveTask(task.id, nextStatus)
  }

  const resetDemo = () => {
    setTasks(initialTasks)
    setProjectFilter('all')
    setSourceFilter('all')
    setQuery('')
    showToast('Dados de demonstração restaurados.')
  }

  const navigateTo = (sectionId: string) => {
    setActiveSection(sectionId)
    setIsSidebarOpen(false)
    document.getElementById(sectionId)?.scrollIntoView({
      behavior: 'smooth',
      block: 'start',
    })
  }

  const selectProject = (projectId: string) => {
    const nextFilter = projectFilter === projectId ? 'all' : projectId
    setProjectFilter(nextFilter)
    setActiveSection('kanban')
    window.setTimeout(() => navigateTo('kanban'), 0)
  }

  const hasActiveFilters =
    query.trim().length > 0 || projectFilter !== 'all' || sourceFilter !== 'all'

  return (
    <div className="app-shell">
      <aside className={`sidebar ${isSidebarOpen ? 'sidebar--open' : ''}`}>
        <div className="sidebar__top">
          <button
            type="button"
            className="brand"
            aria-label="Ir para a visão geral"
            onClick={() => navigateTo('overview')}
          >
            <span className="brand__mark" aria-hidden="true">
              <span />
              <span />
              <span />
            </span>
            <span className="brand__copy">
              <strong>MCID</strong>
              <small>Painel de entregas</small>
            </span>
          </button>

          <button
            type="button"
            className="icon-button sidebar__close"
            aria-label="Fechar menu"
            onClick={() => setIsSidebarOpen(false)}
          >
            <Icon name="x" />
          </button>
        </div>

        <nav className="sidebar__nav" aria-label="Navegação principal">
          <span className="sidebar__label">Área de trabalho</span>
          <SidebarLink
            icon="grid"
            label="Visão geral"
            active={activeSection === 'overview'}
            onClick={() => navigateTo('overview')}
          />
          <SidebarLink
            icon="chart"
            label="Projetos"
            badge={projects.length}
            active={activeSection === 'projects'}
            onClick={() => navigateTo('projects')}
          />
          <SidebarLink
            icon="clipboard"
            label="Quadro Kanban"
            badge={tasks.filter((task) => task.status !== 'done').length}
            active={activeSection === 'kanban'}
            onClick={() => navigateTo('kanban')}
          />
          <SidebarLink
            icon="database"
            label="Fontes de dados"
            active={activeSection === 'sources'}
            onClick={() => navigateTo('sources')}
          />

          <span className="sidebar__label sidebar__label--spaced">Sistema</span>
          <SidebarLink
            icon="settings"
            label="Configurações"
            onClick={() => showToast('Configurações estarão disponíveis na etapa do back-end.')}
          />
          <SidebarLink
            icon="help"
            label="Central de ajuda"
            onClick={() => showToast('A documentação do projeto está no README.')}
          />
        </nav>

        <div className="sidebar__status">
          <div className="sidebar__status-icon">
            <Icon name="database" size={18} />
            <span className="live-dot" />
          </div>
          <div>
            <strong>Sincronização ativa</strong>
            <span>Atualizado há 12 min</span>
          </div>
        </div>

        <div className="sidebar__profile">
          <div className="avatar avatar--profile">AN</div>
          <div className="sidebar__profile-copy">
            <strong>André N.</strong>
            <span>Administrador</span>
          </div>
          <button type="button" className="icon-button" aria-label="Opções do perfil">
            <Icon name="more" />
          </button>
        </div>
      </aside>

      {isSidebarOpen && (
        <button
          type="button"
          className="sidebar-overlay"
          aria-label="Fechar menu"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      <div className="app-body">
        <header className="topbar">
          <button
            type="button"
            className="icon-button topbar__menu"
            aria-label="Abrir menu"
            onClick={() => setIsSidebarOpen(true)}
          >
            <Icon name="menu" />
          </button>

          <label className="search">
            <Icon name="search" size={19} />
            <input
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Buscar tarefa, projeto ou responsável..."
              aria-label="Buscar no painel"
            />
            <kbd>⌘ K</kbd>
          </label>

          <div className="topbar__actions">
            <button
              type="button"
              className="icon-button"
              aria-label={theme === 'light' ? 'Ativar tema escuro' : 'Ativar tema claro'}
              onClick={() => setTheme((current) => (current === 'light' ? 'dark' : 'light'))}
            >
              <Icon name={theme === 'light' ? 'moon' : 'sun'} />
            </button>

            <div className="notification-wrap">
              <button
                type="button"
                className="icon-button notification-button"
                aria-label="Abrir notificações"
                aria-expanded={isNotificationsOpen}
                onClick={() => setIsNotificationsOpen((current) => !current)}
              >
                <Icon name="bell" />
                <span className="notification-dot" />
              </button>

              {isNotificationsOpen && (
                <div className="notification-popover">
                  <div className="popover-heading">
                    <div>
                      <strong>Notificações</strong>
                      <span>3 novidades desde seu último acesso</span>
                    </div>
                    <button
                      type="button"
                      className="icon-button icon-button--small"
                      aria-label="Fechar notificações"
                      onClick={() => setIsNotificationsOpen(false)}
                    >
                      <Icon name="x" size={17} />
                    </button>
                  </div>
                  {activities.map((activity) => (
                    <div className="notification-item" key={activity.id}>
                      <span className={`activity-dot activity-dot--${activity.tone}`} />
                      <div>
                        <strong>{activity.title}</strong>
                        <span>{activity.detail}</span>
                        <small>{activity.time}</small>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="topbar__divider" />
            <button
              type="button"
              className="topbar__profile"
              onClick={() => showToast('Perfil de André N.')}
            >
              <div className="avatar">AN</div>
              <span>André N.</span>
              <Icon name="chevronDown" size={16} />
            </button>
          </div>
        </header>

        <main>
          <section className="welcome" id="overview">
            <div>
              <div className="eyebrow">
                <Icon name="calendar" size={15} />
                {formattedDate}
              </div>
              <h1>Visão geral das entregas</h1>
              <p>Acompanhe o avanço dos projetos e o que precisa da sua atenção.</p>
            </div>

            <div className="welcome__actions">
              <div className="segmented-control" aria-label="Selecionar período">
                {['7 dias', 'Este mês', 'Trimestre'].map((item) => (
                  <button
                    type="button"
                    className={period === item ? 'is-active' : ''}
                    key={item}
                    onClick={() => {
                      setPeriod(item)
                      showToast(`Período alterado para “${item}”.`)
                    }}
                  >
                    {item}
                  </button>
                ))}
              </div>
              <button
                type="button"
                className="primary-button"
                onClick={() => setIsTaskModalOpen(true)}
              >
                <Icon name="plus" size={18} />
                Nova tarefa
              </button>
            </div>
          </section>

          <section className="metrics-grid" aria-label="Indicadores principais">
            <MetricCard
              label="Progresso geral"
              value={`${overallProgress}%`}
              detail="+6% no período"
              icon="chart"
              tone="green"
              mini={
                <div
                  className="mini-ring"
                  style={{
                    background: `conic-gradient(var(--green) ${overallProgress * 3.6}deg, var(--track) 0deg)`,
                  }}
                  aria-hidden="true"
                >
                  <span />
                </div>
              }
            />
            <MetricCard
              label="Tarefas concluídas"
              value={String(completedCount)}
              detail={`de ${tasks.length} tarefas`}
              icon="check"
              tone="blue"
              mini={<MiniBars values={[38, 56, 46, 74, 62, 88, 100]} tone="blue" />}
            />
            <MetricCard
              label="Em andamento"
              value={String(activeCount)}
              detail="2 aguardam revisão"
              icon="clock"
              tone="violet"
              mini={<MiniBars values={[30, 48, 42, 66, 54, 74, 82]} tone="violet" />}
            />
            <MetricCard
              label="Precisam de atenção"
              value={String(dueTodayCount)}
              detail="com prazo para hoje"
              icon="alert"
              tone="amber"
              mini={<span className="attention-badge">Hoje</span>}
            />
          </section>

          <section className="progress-section" id="projects">
            <div className="section-heading">
              <div>
                <span className="section-kicker">Portfólio ativo</span>
                <h2>Progresso por projeto</h2>
              </div>
              <button
                type="button"
                className="text-button"
                onClick={() => {
                  setProjectFilter('all')
                  navigateTo('kanban')
                }}
              >
                Ver todos
                <Icon name="arrowRight" size={17} />
              </button>
            </div>

            <div className="projects-layout">
              <div className="project-grid">
                {projects.map((project) => (
                  <button
                    type="button"
                    className={`project-card project-card--${project.tone} ${
                      projectFilter === project.id ? 'project-card--selected' : ''
                    }`}
                    key={project.id}
                    onClick={() => selectProject(project.id)}
                    aria-pressed={projectFilter === project.id}
                  >
                    <div className="project-card__top">
                      <span className={`project-icon project-icon--${project.tone}`}>
                        <Icon
                          name={
                            project.id === 'planilhas'
                              ? 'sheet'
                              : project.id === 'portal'
                                ? 'globe'
                                : project.id === 'prestacao'
                                  ? 'clipboard'
                                  : 'folder'
                          }
                          size={20}
                        />
                      </span>
                      <span className="trend">
                        <Icon name="arrowUp" size={13} />
                        {project.trend}%
                      </span>
                    </div>
                    <div className="project-card__copy">
                      <h3>{project.name}</h3>
                      <p>{project.description}</p>
                    </div>
                    <div className="project-card__progress">
                      <div>
                        <span>
                          {project.completed} de {project.total} itens
                        </span>
                        <strong>{project.progress}%</strong>
                      </div>
                      <ProgressBar
                        value={project.progress}
                        tone={project.tone}
                        label={`Progresso de ${project.name}`}
                      />
                    </div>
                    <div className="project-card__footer">
                      <span>Atualizado {project.updatedAt}</span>
                      <span className="project-card__action">
                        Abrir projeto
                        <Icon name="arrowRight" size={15} />
                      </span>
                    </div>
                  </button>
                ))}
              </div>

              <aside className="activity-card">
                <div className="activity-card__heading">
                  <div>
                    <span className="section-kicker">Em tempo real</span>
                    <h3>Atividade recente</h3>
                  </div>
                  <span className="live-label">
                    <span />
                    Ao vivo
                  </span>
                </div>
                <div className="activity-list">
                  {activities.map((activity, index) => (
                    <div className="activity-item" key={activity.id}>
                      <div className="activity-rail">
                        <span className={`activity-dot activity-dot--${activity.tone}`} />
                        {index < activities.length - 1 && <span className="activity-line" />}
                      </div>
                      <div>
                        <strong>{activity.title}</strong>
                        <p>{activity.detail}</p>
                        <span>{activity.time}</span>
                      </div>
                    </div>
                  ))}
                </div>
                <button
                  type="button"
                  className="activity-card__button"
                  onClick={() => setIsNotificationsOpen(true)}
                >
                  Ver histórico completo
                  <Icon name="arrowRight" size={16} />
                </button>
              </aside>
            </div>
          </section>

          <section className="kanban-section" id="kanban">
            <div className="section-heading section-heading--kanban">
              <div>
                <span className="section-kicker">Fluxo de trabalho</span>
                <h2>Quadro de tarefas</h2>
                <p>Arraste os cartões para atualizar o andamento.</p>
              </div>
              <div className="kanban-actions">
                <label className="select-field">
                  <span className="sr-only">Filtrar por projeto</span>
                  <select
                    value={projectFilter}
                    onChange={(event) => setProjectFilter(event.target.value)}
                  >
                    <option value="all">Todos os projetos</option>
                    {projects.map((project) => (
                      <option value={project.id} key={project.id}>
                        {project.name}
                      </option>
                    ))}
                  </select>
                  <Icon name="chevronDown" size={15} />
                </label>
                <label className="select-field">
                  <Icon name="filter" size={16} />
                  <span className="sr-only">Filtrar por fonte</span>
                  <select
                    value={sourceFilter}
                    onChange={(event) =>
                      setSourceFilter(event.target.value as 'all' | DataSource)
                    }
                  >
                    <option value="all">Todas as fontes</option>
                    <option value="Pasta">Pastas</option>
                    <option value="Planilha">Planilhas</option>
                    <option value="Site">Sites</option>
                    <option value="Manual">Manual</option>
                  </select>
                  <Icon name="chevronDown" size={15} />
                </label>
                {hasActiveFilters && (
                  <button
                    type="button"
                    className="ghost-button"
                    onClick={() => {
                      setQuery('')
                      setProjectFilter('all')
                      setSourceFilter('all')
                    }}
                  >
                    Limpar filtros
                  </button>
                )}
                <button
                  type="button"
                  className="primary-button primary-button--compact"
                  onClick={() => setIsTaskModalOpen(true)}
                >
                  <Icon name="plus" size={17} />
                  Adicionar
                </button>
              </div>
            </div>

            {filteredTasks.length === 0 && (
              <div className="empty-search">
                <span className="empty-search__icon">
                  <Icon name="search" size={24} />
                </span>
                <div>
                  <strong>Nenhuma tarefa encontrada</strong>
                  <p>Experimente mudar a busca ou limpar os filtros do quadro.</p>
                </div>
                <button
                  type="button"
                  className="ghost-button"
                  onClick={() => {
                    setQuery('')
                    setProjectFilter('all')
                    setSourceFilter('all')
                  }}
                >
                  Limpar filtros
                </button>
              </div>
            )}

            <div className="kanban-board">
              {columns.map((column) => {
                const columnTasks = filteredTasks.filter(
                  (task) => task.status === column.id,
                )

                return (
                  <div
                    className={`kanban-column ${
                      dropTarget === column.id ? 'kanban-column--drop-target' : ''
                    }`}
                    key={column.id}
                    onDragOver={(event) => {
                      event.preventDefault()
                      setDropTarget(column.id)
                    }}
                    onDragLeave={(event) => {
                      if (!event.currentTarget.contains(event.relatedTarget as Node)) {
                        setDropTarget(null)
                      }
                    }}
                    onDrop={(event) => handleDrop(event, column.id)}
                  >
                    <div className="kanban-column__heading">
                      <div>
                        <span className={`status-dot ${column.dotClass}`} />
                        <strong>{column.title}</strong>
                        <span className="count-badge">{columnTasks.length}</span>
                      </div>
                      <button
                        type="button"
                        className="icon-button icon-button--small"
                        aria-label={`Adicionar em ${column.title}`}
                        onClick={() => setIsTaskModalOpen(true)}
                      >
                        <Icon name="plus" size={17} />
                      </button>
                    </div>
                    <p className="kanban-column__description">{column.description}</p>

                    <div className="task-list">
                      {columnTasks.map((task) => (
                        <TaskCard
                          task={task}
                          key={task.id}
                          onOpen={() => setSelectedTaskId(task.id)}
                          onDragStart={() => setDraggedTaskId(task.id)}
                          onDragEnd={() => {
                            setDraggedTaskId(null)
                            setDropTarget(null)
                          }}
                          isDragging={draggedTaskId === task.id}
                        />
                      ))}
                      {columnTasks.length === 0 && filteredTasks.length > 0 && (
                        <div className="empty-column">
                          <Icon name="drag" size={22} />
                          <span>Solte uma tarefa aqui</span>
                        </div>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </section>

          <section className="sources-section" id="sources">
            <div className="section-heading">
              <div>
                <span className="section-kicker">Conectores preparados</span>
                <h2>Fontes de dados</h2>
              </div>
              <button type="button" className="ghost-button" onClick={resetDemo}>
                <Icon name="refresh" size={16} />
                Restaurar demonstração
              </button>
            </div>
            <div className="source-grid">
              <SourceCard
                icon="folder"
                title="Pastas e arquivos"
                detail="2 diretórios monitorados"
                meta="Sincronizado há 12 min"
                tone="blue"
                connected
              />
              <SourceCard
                icon="sheet"
                title="Planilhas"
                detail="4 bases conectadas"
                meta="Sincronizado há 34 min"
                tone="violet"
                connected
              />
              <SourceCard
                icon="globe"
                title="Sites e portais"
                detail="1 endereço monitorado"
                meta="Sincronizado há 1 h"
                tone="amber"
                connected
              />
              <button
                type="button"
                className="source-card source-card--add"
                onClick={() =>
                  showToast('Novos conectores serão configurados na etapa do back-end.')
                }
              >
                <span className="source-card__add-icon">
                  <Icon name="plus" size={21} />
                </span>
                <div>
                  <strong>Adicionar fonte</strong>
                  <span>Conecte uma nova origem de dados</span>
                </div>
              </button>
            </div>
          </section>

          <footer>
            <span>MCID Painel · Interface de demonstração</span>
            <span>Última sincronização simulada: há 12 min</span>
          </footer>
        </main>
      </div>

      {selectedTask && (
        <TaskDrawer
          task={selectedTask}
          onClose={() => setSelectedTaskId(null)}
          onAdvance={() => advanceTask(selectedTask)}
        />
      )}

      <NewTaskModal
        open={isTaskModalOpen}
        onClose={() => setIsTaskModalOpen(false)}
        onSubmit={addTask}
      />

      {toast && (
        <div className="toast" role="status" key={toast.id}>
          <span className="toast__icon">
            <Icon name="check" size={17} />
          </span>
          {toast.message}
        </div>
      )}
    </div>
  )
}

interface SidebarLinkProps {
  icon: IconName
  label: string
  badge?: number
  active?: boolean
  onClick: () => void
}

function SidebarLink({
  icon,
  label,
  badge,
  active = false,
  onClick,
}: SidebarLinkProps) {
  return (
    <button
      type="button"
      className={`sidebar-link ${active ? 'sidebar-link--active' : ''}`}
      onClick={onClick}
    >
      <Icon name={icon} size={19} />
      <span>{label}</span>
      {typeof badge === 'number' && <small>{badge}</small>}
    </button>
  )
}

interface MetricCardProps {
  label: string
  value: string
  detail: string
  icon: IconName
  tone: 'green' | 'blue' | 'violet' | 'amber'
  mini: React.ReactNode
}

function MetricCard({ label, value, detail, icon, tone, mini }: MetricCardProps) {
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

function MiniBars({
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

interface TaskCardProps {
  task: Task
  onOpen: () => void
  onDragStart: () => void
  onDragEnd: () => void
  isDragging: boolean
}

function TaskCard({
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
        <span className={`project-mini-dot project-mini-dot--${project?.tone ?? 'blue'}`} />
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
        <span className={task.dueLabel === 'Hoje' ? 'due-date due-date--urgent' : 'due-date'}>
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

interface SourceCardProps {
  icon: IconName
  title: string
  detail: string
  meta: string
  tone: 'blue' | 'violet' | 'amber'
  connected: boolean
}

function SourceCard({
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
      <button type="button" className="icon-button icon-button--small" aria-label="Opções da fonte">
        <Icon name="more" size={18} />
      </button>
    </article>
  )
}

function TaskDrawer({
  task,
  onClose,
  onAdvance,
}: {
  task: Task
  onClose: () => void
  onAdvance: () => void
}) {
  const project = projects.find((item) => item.id === task.projectId)
  const currentColumn = columns.find((column) => column.id === task.status)
  const canAdvance = task.status !== 'done'

  return (
    <div className="drawer-layer">
      <button
        type="button"
        className="drawer-backdrop"
        aria-label="Fechar detalhes"
        onClick={onClose}
      />
      <aside className="task-drawer" role="dialog" aria-modal="true" aria-label="Detalhes da tarefa">
        <div className="drawer-heading">
          <div>
            <span className="section-kicker">Detalhes da tarefa</span>
            <span className="task-id">{task.id.toUpperCase()}</span>
          </div>
          <button type="button" className="icon-button" aria-label="Fechar" onClick={onClose}>
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
            <span className={`project-icon project-icon--${project?.tone ?? 'blue'}`}>
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
                <span className="status-dot status-dot--blue" />
                {currentColumn?.title}
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

function NewTaskModal({
  open,
  onClose,
  onSubmit,
}: {
  open: boolean
  onClose: () => void
  onSubmit: (input: NewTaskInput) => void
}) {
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
      <div className="task-modal" role="dialog" aria-modal="true" aria-labelledby="new-task-title">
        <div className="modal-heading">
          <div className="modal-heading__icon">
            <Icon name="sparkles" size={21} />
          </div>
          <div>
            <span className="section-kicker">Organize o trabalho</span>
            <h2 id="new-task-title">Adicionar nova tarefa</h2>
          </div>
          <button type="button" className="icon-button" aria-label="Fechar" onClick={onClose}>
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
            <select value={projectId} onChange={(event) => setProjectId(event.target.value)}>
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
                onChange={(event) => setPriority(event.target.value as Priority)}
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
              Nesta versão, os dados ficam salvos no navegador. A sincronização automática
              será conectada na etapa do back-end.
            </p>
          </div>

          <div className="modal-actions">
            <button type="button" className="ghost-button" onClick={onClose}>
              Cancelar
            </button>
            <button type="submit" className="primary-button" disabled={!title.trim()}>
              <Icon name="plus" size={17} />
              Criar tarefa
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default App
