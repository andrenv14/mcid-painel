import { useEffect, useMemo, useState, type DragEvent, type FormEvent } from 'react'
import { Icon, type IconName } from './components/Icon'

type View = 'overview' | 'ppsi' | 'indices' | 'plans' | 'kanban' | 'sources'
type TaskStatus = 'backlog' | 'inProgress' | 'review' | 'done'
type Priority = 'Alta' | 'Média' | 'Baixa'

interface GovernanceTask {
  id: string
  title: string
  program: string
  reference: string
  status: TaskStatus
  priority: Priority
  owner: string
  initials: string
  due: string
  progress: number
  evidence: number
  comments: number
}

interface ProgressItem {
  label: string
  value: number
  note?: string
  tone?: 'green' | 'blue' | 'amber' | 'violet'
}

const STORAGE_KEY = 'mcid-governanca-tasks-v1'
const THEME_KEY = 'mcid-governanca-theme'

const navigation: Array<{ id: View; label: string; icon: IconName }> = [
  { id: 'overview', label: 'Visão geral', icon: 'grid' },
  { id: 'ppsi', label: 'PPSI 2.0', icon: 'clipboard' },
  { id: 'indices', label: 'iESGo e iGestTI', icon: 'chart' },
  { id: 'plans', label: 'Planos institucionais', icon: 'folder' },
  { id: 'kanban', label: 'Plano de ação', icon: 'database' },
  { id: 'sources', label: 'Fontes de dados', icon: 'sheet' },
]

const columns: Array<{ id: TaskStatus; title: string; subtitle: string }> = [
  { id: 'backlog', title: 'Não iniciadas', subtitle: 'Aguardando início' },
  { id: 'inProgress', title: 'Em execução', subtitle: 'Trabalho em andamento' },
  { id: 'review', title: 'Em validação', subtitle: 'Evidência ou aceite' },
  { id: 'done', title: 'Concluídas', subtitle: 'Entregas finalizadas' },
]

const initialTasks: GovernanceTask[] = [
  {
    id: 'acao-1',
    title: 'Formalizar inventário de ativos de informação',
    program: 'PPSI',
    reference: 'Controle 1 · GI1',
    status: 'inProgress',
    priority: 'Alta',
    owner: 'Equipe de Segurança',
    initials: 'ES',
    due: '18 out',
    progress: 65,
    evidence: 3,
    comments: 4,
  },
  {
    id: 'acao-2',
    title: 'Revisar plano de comunicação e conscientização',
    program: 'PPSI',
    reference: 'Controle 14',
    status: 'review',
    priority: 'Alta',
    owner: 'Comunicação',
    initials: 'CO',
    due: '14 out',
    progress: 88,
    evidence: 6,
    comments: 2,
  },
  {
    id: 'acao-3',
    title: 'Mapear lacunas do planejamento de TI',
    program: 'iGestTI',
    reference: 'PlanejamentoTI',
    status: 'backlog',
    priority: 'Média',
    owner: 'Governança de TI',
    initials: 'GT',
    due: '24 out',
    progress: 10,
    evidence: 1,
    comments: 1,
  },
  {
    id: 'acao-4',
    title: 'Validar respostas da planilha de simulação',
    program: 'iESGo',
    reference: 'Ciclo 2026',
    status: 'inProgress',
    priority: 'Alta',
    owner: 'Comitê de Governança',
    initials: 'CG',
    due: 'Hoje',
    progress: 54,
    evidence: 2,
    comments: 7,
  },
  {
    id: 'acao-5',
    title: 'Consolidar execução das iniciativas do PDTIC',
    program: 'PDTIC',
    reference: '2023–2026',
    status: 'inProgress',
    priority: 'Média',
    owner: 'Escritório de Projetos',
    initials: 'EP',
    due: '21 out',
    progress: 72,
    evidence: 8,
    comments: 3,
  },
  {
    id: 'acao-6',
    title: 'Instituir fluxo de registro de evidências',
    program: 'PPSI',
    reference: 'Controle 0 · Base',
    status: 'done',
    priority: 'Alta',
    owner: 'Governança',
    initials: 'GO',
    due: 'Concluída',
    progress: 100,
    evidence: 9,
    comments: 5,
  },
  {
    id: 'acao-7',
    title: 'Atualizar matriz de riscos de segurança',
    program: 'iGestTI',
    reference: 'RiscosTISegInfo',
    status: 'backlog',
    priority: 'Alta',
    owner: 'Gestão de Riscos',
    initials: 'GR',
    due: '28 out',
    progress: 0,
    evidence: 0,
    comments: 2,
  },
  {
    id: 'acao-8',
    title: 'Publicar relatório executivo do ciclo',
    program: 'PTD',
    reference: 'Entrega 04',
    status: 'done',
    priority: 'Baixa',
    owner: 'Comunicação',
    initials: 'CO',
    due: 'Concluída',
    progress: 100,
    evidence: 4,
    comments: 1,
  },
]

const ppsiSegments: ProgressItem[] = [
  { label: 'Base e governança', value: 82, note: 'Controle 0', tone: 'blue' },
  { label: 'Segurança da informação', value: 69, note: 'Controles 1–18', tone: 'green' },
  { label: 'Privacidade', value: 57, note: 'Controles 19–25', tone: 'violet' },
]

const ppsiControls = [
  { control: 'Controle 0', title: 'Estrutura básica de governança', group: 'Base', applicable: 12, done: 10, progress: 83, status: 'Em execução' },
  { control: 'Controle 1', title: 'Inventário e controle de ativos', group: 'GI1', applicable: 8, done: 5, progress: 63, status: 'Atenção' },
  { control: 'Controle 5', title: 'Gestão de contas', group: 'GI1', applicable: 6, done: 5, progress: 83, status: 'Em execução' },
  { control: 'Controle 14', title: 'Conscientização e treinamento', group: 'GI1 · GI2', applicable: 10, done: 7, progress: 70, status: 'Em validação' },
  { control: 'Controle 19', title: 'Governança de privacidade', group: 'Privacidade', applicable: 7, done: 4, progress: 57, status: 'Atenção' },
  { control: 'Controle 25', title: 'Resposta a incidentes com dados pessoais', group: 'Privacidade', applicable: 5, done: 2, progress: 40, status: 'Prioritário' },
]

const iesgoDimensions: ProgressItem[] = [
  { label: 'Liderança', value: 72, tone: 'green' },
  { label: 'Estratégia', value: 64, tone: 'blue' },
  { label: 'Controle', value: 59, tone: 'violet' },
  { label: 'Pessoas', value: 67, tone: 'green' },
  { label: 'TI e segurança', value: 58, tone: 'amber' },
  { label: 'Contratações', value: 63, tone: 'blue' },
  { label: 'Orçamento', value: 61, tone: 'violet' },
  { label: 'Ambiental', value: 49, tone: 'amber' },
  { label: 'Social', value: 55, tone: 'blue' },
]

const igestDimensions: ProgressItem[] = [
  { label: 'Planejamento de TI', value: 66, tone: 'blue' },
  { label: 'Serviços de TI', value: 62, tone: 'green' },
  { label: 'Riscos de TI e segurança', value: 47, tone: 'amber' },
  { label: 'Estrutura de segurança', value: 55, tone: 'violet' },
  { label: 'Processos de segurança', value: 51, tone: 'amber' },
  { label: 'Gestão de soluções', value: 68, tone: 'blue' },
]

const plans = [
  { id: 'pdtic', name: 'PDTIC 2023–2026', description: 'Plano Diretor de Tecnologia da Informação e Comunicação', progress: 83, done: 29, total: 35, overdue: 2, owner: 'Governança de TI', updated: '30/09/2026', tone: 'blue' },
  { id: 'ptd', name: 'PTD 2026', description: 'Plano de Transformação Digital', progress: 71, done: 17, total: 24, overdue: 1, owner: 'Transformação Digital', updated: '02/10/2026', tone: 'violet' },
  { id: 'communication', name: 'Plano de comunicação', description: 'Ações de comunicação, conscientização e engajamento', progress: 64, done: 9, total: 14, overdue: 3, owner: 'Comunicação', updated: '05/10/2026', tone: 'amber' },
  { id: 'ppsi-plan', name: 'Plano de trabalho PPSI', description: 'Medidas, responsáveis, prazos e evidências do framework', progress: 68, done: 34, total: 50, overdue: 4, owner: 'Comitê de Segurança', updated: '05/10/2026', tone: 'green' },
]

const sources = [
  { icon: 'sheet' as IconName, name: 'Simulação iESGo 2026', detail: 'correta-iESGo_PlanilhaSimulacao_analise_considerada_2026.xlsx', kind: 'Planilha Excel', cadence: 'Mensal', updated: 'Aguardando arquivo', status: 'pending' },
  { icon: 'sheet' as IconName, name: 'Execução do PDTIC', detail: 'Análise de execução do PDTIC MDR - 2023-2026 finalizada.xlsx', kind: 'Planilha Excel', cadence: 'Mensal', updated: 'Aguardando arquivo', status: 'pending' },
  { icon: 'globe' as IconName, name: 'Framework PPSI 2.0', detail: 'gov.br/governodigital/privacidade-e-seguranca/ppsi-2.0', kind: 'Referência oficial', cadence: 'Sob demanda', updated: 'Referência cadastrada', status: 'ready' },
  { icon: 'globe' as IconName, name: 'Portal iESGo / TCU', detail: 'iesgo.tcu.gov.br', kind: 'Referência oficial', cadence: 'Por ciclo', updated: 'Referência cadastrada', status: 'ready' },
  { icon: 'folder' as IconName, name: 'Evidências institucionais', detail: 'Teams / SharePoint / OneDrive', kind: 'Pasta compartilhada', cadence: 'Semanal', updated: 'Conexão futura', status: 'future' },
  { icon: 'database' as IconName, name: 'Autodiagnóstico iGovSISP', detail: 'Resultado e memória de cálculo do ciclo vigente', kind: 'Base institucional', cadence: 'Anual', updated: 'Aguardando dados', status: 'pending' },
]

function readTasks(): GovernanceTask[] {
  try {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (!saved) return initialTasks
    const parsed: unknown = JSON.parse(saved)
    return Array.isArray(parsed) ? (parsed as GovernanceTask[]) : initialTasks
  } catch {
    return initialTasks
  }
}

function readTheme(): 'light' | 'dark' {
  const saved = localStorage.getItem(THEME_KEY)
  if (saved === 'light' || saved === 'dark') return saved
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

function ProgressBar({ value, tone = 'green', small = false }: { value: number; tone?: ProgressItem['tone']; small?: boolean }) {
  return (
    <div className={small ? 'progress progress--small' : 'progress'} aria-label={value + '%'}>
      <span className={'progress__fill progress__fill--' + tone} style={{ width: value + '%' }} />
    </div>
  )
}

function StatusPill({ children }: { children: string }) {
  const slug = children.toLocaleLowerCase('pt-BR').normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/\s+/g, '-')
  return <span className={'status-pill status-pill--' + slug}>{children}</span>
}

function Ring({ value, color = 'var(--green)' }: { value: number; color?: string }) {
  return (
    <div className="ring" style={{ background: 'conic-gradient(' + color + ' ' + value * 3.6 + 'deg, var(--track) 0deg)' }}>
      <div><strong>{value}%</strong><span>exemplo</span></div>
    </div>
  )
}

function App() {
  const [view, setView] = useState<View>('overview')
  const [theme, setTheme] = useState<'light' | 'dark'>(readTheme)
  const [tasks, setTasks] = useState<GovernanceTask[]>(readTasks)
  const [query, setQuery] = useState('')
  const [program, setProgram] = useState('Todos')
  const [dragId, setDragId] = useState<string | null>(null)
  const [selectedTask, setSelectedTask] = useState<GovernanceTask | null>(null)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [newTaskOpen, setNewTaskOpen] = useState(false)
  const [newTaskTitle, setNewTaskTitle] = useState('')
  const [newTaskProgram, setNewTaskProgram] = useState('PPSI')
  const [toast, setToast] = useState<string | null>(null)

  useEffect(() => {
    document.documentElement.dataset.theme = theme
    localStorage.setItem(THEME_KEY, theme)
  }, [theme])

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks))
  }, [tasks])

  useEffect(() => {
    if (!toast) return
    const timer = window.setTimeout(() => setToast(null), 3200)
    return () => window.clearTimeout(timer)
  }, [toast])

  const filteredTasks = useMemo(() => {
    const normalized = query.trim().toLocaleLowerCase('pt-BR')
    return tasks.filter((task) => {
      const matchesText = !normalized || [task.title, task.program, task.reference, task.owner].some((value) => value.toLocaleLowerCase('pt-BR').includes(normalized))
      return matchesText && (program === 'Todos' || task.program === program)
    })
  }, [program, query, tasks])

  const completed = tasks.filter((task) => task.status === 'done').length
  const active = tasks.filter((task) => task.status === 'inProgress' || task.status === 'review').length
  const attention = tasks.filter((task) => task.priority === 'Alta' && task.status !== 'done').length
  const taskExecution = Math.round(tasks.reduce((sum, task) => sum + task.progress, 0) / tasks.length)

  const navigate = (next: View) => {
    setView(next)
    setSidebarOpen(false)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const moveTask = (taskId: string, status: TaskStatus) => {
    setTasks((current) => current.map((task) => task.id === taskId ? {
      ...task,
      status,
      progress: status === 'done' ? 100 : status === 'review' ? Math.max(task.progress, 80) : status === 'inProgress' ? Math.max(task.progress, 20) : task.progress,
      due: status === 'done' ? 'Concluída' : task.due,
    } : task))
    setDragId(null)
    setToast('Ação movimentada e salva neste navegador.')
  }

  const onDrop = (event: DragEvent<HTMLDivElement>, status: TaskStatus) => {
    event.preventDefault()
    if (dragId) moveTask(dragId, status)
  }

  const addTask = (event: FormEvent) => {
    event.preventDefault()
    if (!newTaskTitle.trim()) return
    const task: GovernanceTask = {
      id: 'acao-' + Date.now(),
      title: newTaskTitle.trim(),
      program: newTaskProgram,
      reference: 'Classificação pendente',
      status: 'backlog',
      priority: 'Média',
      owner: 'A definir',
      initials: 'AD',
      due: 'Sem prazo',
      progress: 0,
      evidence: 0,
      comments: 0,
    }
    setTasks((current) => [task, ...current])
    setNewTaskTitle('')
    setNewTaskOpen(false)
    setView('kanban')
    setToast('Nova ação adicionada ao plano.')
  }

  const titleByView: Record<View, { eyebrow: string; title: string; subtitle: string }> = {
    overview: { eyebrow: 'Visão executiva', title: 'Governança, privacidade e segurança', subtitle: 'Acompanhe indicadores, planos de ação, prazos e evidências em um único lugar.' },
    ppsi: { eyebrow: 'Framework de referência', title: 'Programa de Privacidade e Segurança da Informação', subtitle: 'Visão de implantação dos controles, medidas aplicáveis e execução do plano de trabalho.' },
    indices: { eyebrow: 'Avaliação de capacidade', title: 'iESGo e iGestTI', subtitle: 'Resultados por dimensão, estágio de capacidade e lacunas prioritárias para evolução.' },
    plans: { eyebrow: 'Portfólio institucional', title: 'Planos e entregas estratégicas', subtitle: 'Execução do PDTIC, PTD, plano de comunicação e plano de trabalho do PPSI.' },
    kanban: { eyebrow: 'Acompanhamento operacional', title: 'Plano de ação integrado', subtitle: 'Movimente as ações, registre responsáveis e acompanhe evidências até a conclusão.' },
    sources: { eyebrow: 'Preparação para integração', title: 'Fontes de dados', subtitle: 'Planilhas, pastas e referências que alimentarão o painel na etapa de back-end.' },
  }

  const heading = titleByView[view]

  return (
    <div className="app-shell">
      <aside className={'sidebar ' + (sidebarOpen ? 'sidebar--open' : '')}>
        <button className="brand" type="button" onClick={() => navigate('overview')} aria-label="Ir para a visão geral">
          <span className="brand__mark"><span /><span /><span /></span>
          <span><strong>MCID</strong><small>Governança em foco</small></span>
        </button>

        <nav className="navigation" aria-label="Navegação principal">
          <span className="navigation__label">Monitoramento</span>
          {navigation.map((item) => (
            <button key={item.id} type="button" className={view === item.id ? 'nav-link is-active' : 'nav-link'} onClick={() => navigate(item.id)} aria-current={view === item.id ? 'page' : undefined}>
              <Icon name={item.icon} size={19} />
              <span>{item.label}</span>
              {item.id === 'kanban' && <em>{tasks.filter((task) => task.status !== 'done').length}</em>}
            </button>
          ))}
        </nav>

        <div className="sidebar__context">
          <span className="context-dot" />
          <div><strong>Ambiente demonstrativo</strong><small>Preparado para integração</small></div>
        </div>

        <div className="sidebar__profile">
          <span className="avatar">AN</span>
          <div><strong>André</strong><small>Administrador do painel</small></div>
        </div>
      </aside>

      {sidebarOpen && <button type="button" className="scrim" aria-label="Fechar menu" onClick={() => setSidebarOpen(false)} />}

      <div className="workspace">
        <header className="topbar">
          <button type="button" className="icon-button menu-button" onClick={() => setSidebarOpen(true)} aria-label="Abrir menu"><Icon name="menu" /></button>
          <label className="search">
            <Icon name="search" size={18} />
            <input value={query} onChange={(event) => setQuery(event.target.value)} onFocus={() => query && setView('kanban')} placeholder="Buscar ação, controle ou responsável..." aria-label="Buscar no painel" />
            {query && <button type="button" onClick={() => setQuery('')} aria-label="Limpar busca"><Icon name="x" size={15} /></button>}
          </label>
          <div className="topbar__actions">
            <span className="demo-badge"><Icon name="sparkles" size={15} /> Dados de demonstração</span>
            <button type="button" className="icon-button" onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')} aria-label="Alternar tema"><Icon name={theme === 'light' ? 'moon' : 'sun'} /></button>
            <span className="avatar avatar--small">AN</span>
          </div>
        </header>

        <main>
          <section className="page-heading">
            <div>
              <span className="eyebrow">{heading.eyebrow}</span>
              <h1>{heading.title}</h1>
              <p>{heading.subtitle}</p>
            </div>
            <div className="page-heading__actions">
              <button type="button" className="secondary-button" onClick={() => setToast('A sincronização será ativada com o back-end e as planilhas reais.')}><Icon name="refresh" size={17} /> Sincronizar</button>
              <button type="button" className="primary-button" onClick={() => setNewTaskOpen(true)}><Icon name="plus" size={17} /> Nova ação</button>
            </div>
          </section>

          <div className="data-notice">
            <Icon name="alert" size={18} />
            <div><strong>Protótipo funcional com dados exemplificativos</strong><span>Os números abaixo demonstram a experiência do painel. Eles serão substituídos pelos valores oficiais das planilhas e pastas institucionais.</span></div>
          </div>

          {view === 'overview' && (
            <>
              <section className="metrics-grid" aria-label="Indicadores executivos">
                <article className="metric-card metric-card--featured">
                  <div><span className="metric-label">Execução das ações</span><strong>{taskExecution}%</strong><small>{completed} de {tasks.length} ações concluídas</small></div>
                  <Ring value={taskExecution} />
                </article>
                <article className="metric-card"><span className="metric-icon metric-icon--green"><Icon name="clipboard" /></span><div><span className="metric-label">Cobertura PPSI · GI1</span><strong>74%</strong><small><b>+6 p.p.</b> desde a última medição</small></div></article>
                <article className="metric-card"><span className="metric-icon metric-icon--blue"><Icon name="chart" /></span><div><span className="metric-label">iESGo</span><strong>61%</strong><small>Estágio intermediário</small></div></article>
                <article className="metric-card"><span className="metric-icon metric-icon--amber"><Icon name="alert" /></span><div><span className="metric-label">Precisam de atenção</span><strong>{attention}</strong><small>Ações de alta prioridade</small></div></article>
              </section>

              <section className="dashboard-grid">
                <article className="panel panel--wide">
                  <div className="panel-heading"><div><span className="section-kicker">Visão consolidada</span><h2>Indicadores monitorados</h2></div><button type="button" className="text-button" onClick={() => navigate('indices')}>Ver análise <Icon name="arrowRight" size={16} /></button></div>
                  <div className="indicator-list">
                    <IndicatorRow label="Plano de trabalho PPSI" value={68} note="Execução das ações" tone="green" />
                    <IndicatorRow label="Medidas PPSI · GI1" value={74} note="Cobertura das medidas aplicáveis" tone="blue" />
                    <IndicatorRow label="iESGo" value={61} note="Índice de capacidade" tone="violet" />
                    <IndicatorRow label="iGestTI" value={58} note="Estágio intermediário" tone="amber" />
                    <IndicatorRow label="PDTIC 2023–2026" value={83} note="Execução das iniciativas" tone="blue" />
                  </div>
                </article>

                <article className="panel attention-panel">
                  <div className="panel-heading"><div><span className="section-kicker">Foco da semana</span><h2>Pontos de atenção</h2></div><span className="counter">4</span></div>
                  <div className="attention-list">
                    <button type="button" onClick={() => navigate('ppsi')}><span className="attention-icon attention-icon--red"><Icon name="alert" size={17} /></span><div><strong>Controle 25 com baixa cobertura</strong><small>2 de 5 medidas implantadas</small></div><Icon name="chevronDown" className="rotate-icon" /></button>
                    <button type="button" onClick={() => navigate('indices')}><span className="attention-icon attention-icon--amber"><Icon name="chart" size={17} /></span><div><strong>Riscos de TI abaixo de 50%</strong><small>Lacuna prioritária do iGestTI</small></div><Icon name="chevronDown" className="rotate-icon" /></button>
                    <button type="button" onClick={() => navigate('plans')}><span className="attention-icon attention-icon--blue"><Icon name="calendar" size={17} /></span><div><strong>3 ações de comunicação vencidas</strong><small>Revisar prazos e responsáveis</small></div><Icon name="chevronDown" className="rotate-icon" /></button>
                    <button type="button" onClick={() => navigate('sources')}><span className="attention-icon attention-icon--violet"><Icon name="sheet" size={17} /></span><div><strong>Planilhas ainda não conectadas</strong><small>Dados oficiais aguardando importação</small></div><Icon name="chevronDown" className="rotate-icon" /></button>
                  </div>
                </article>
              </section>

              <section className="panel">
                <div className="panel-heading"><div><span className="section-kicker">Portfólio</span><h2>Planos institucionais</h2></div><button type="button" className="text-button" onClick={() => navigate('plans')}>Ver todos <Icon name="arrowRight" size={16} /></button></div>
                <div className="plan-cards plan-cards--compact">
                  {plans.map((plan) => <PlanCard key={plan.id} plan={plan} onClick={() => navigate('plans')} />)}
                </div>
              </section>

              <section className="panel">
                <div className="panel-heading"><div><span className="section-kicker">Atividade operacional</span><h2>Ações em andamento</h2></div><button type="button" className="text-button" onClick={() => navigate('kanban')}>Abrir quadro <Icon name="arrowRight" size={16} /></button></div>
                <div className="task-table">
                  {tasks.filter((task) => task.status === 'inProgress' || task.status === 'review').slice(0, 5).map((task) => (
                    <button type="button" className="task-row" key={task.id} onClick={() => setSelectedTask(task)}>
                      <span className={'program-mark program-mark--' + task.program.toLocaleLowerCase('pt-BR').replace(/[^a-z0-9]/g, '')}>{task.program.slice(0, 2)}</span>
                      <span className="task-row__title"><strong>{task.title}</strong><small>{task.program} · {task.reference}</small></span>
                      <span className="task-row__owner">{task.owner}</span>
                      <span className="task-row__progress"><ProgressBar value={task.progress} tone={task.progress >= 80 ? 'green' : 'blue'} small /><strong>{task.progress}%</strong></span>
                      <StatusPill>{task.status === 'review' ? 'Em validação' : 'Em execução'}</StatusPill>
                    </button>
                  ))}
                </div>
              </section>
            </>
          )}

          {view === 'ppsi' && (
            <>
              <section className="summary-strip">
                <article><span>Execução do plano</span><strong>68%</strong><small>34 de 50 ações concluídas</small></article>
                <article><span>Medidas aplicáveis</span><strong>153</strong><small>Segurança da informação</small></article>
                <article><span>Evidências validadas</span><strong>92</strong><small>60% do conjunto esperado</small></article>
                <article><span>Ações vencidas</span><strong className="danger-text">4</strong><small>Requerem replanejamento</small></article>
              </section>

              <section className="dashboard-grid">
                <article className="panel">
                  <div className="panel-heading"><div><span className="section-kicker">Cobertura por segmento</span><h2>Implantação do PPSI 2.0</h2></div><span className="legend-note">Medidas implantadas ÷ aplicáveis</span></div>
                  <div className="segment-list">
                    {ppsiSegments.map((item) => (
                      <div className="segment-item" key={item.label}>
                        <div className="segment-item__top"><div><strong>{item.label}</strong><small>{item.note}</small></div><b>{item.value}%</b></div>
                        <ProgressBar value={item.value} tone={item.tone} />
                      </div>
                    ))}
                  </div>
                </article>
                <article className="panel methodology-card">
                  <span className="methodology-card__icon"><Icon name="help" /></span>
                  <span className="section-kicker">Como ler os números</span>
                  <h2>Execução não é o mesmo que cobertura</h2>
                  <p><strong>Execução</strong> mede ações concluídas no plano de trabalho. <strong>Cobertura</strong> mede quantas medidas aplicáveis possuem implantação e evidência.</p>
                  <div className="formula"><span>Ações concluídas</span><i /><span>Ações previstas</span><b>= execução</b></div>
                  <div className="formula"><span>Medidas implantadas</span><i /><span>Medidas aplicáveis</span><b>= cobertura</b></div>
                </article>
              </section>

              <section className="panel">
                <div className="panel-heading"><div><span className="section-kicker">Matriz de controles</span><h2>Controles prioritários</h2></div><button type="button" className="secondary-button" onClick={() => setToast('A exportação será habilitada quando os dados oficiais forem conectados.')}><Icon name="file" size={16} /> Exportar</button></div>
                <div className="data-table-wrap">
                  <table className="data-table">
                    <thead><tr><th>Controle</th><th>Título</th><th>Grupo</th><th>Implantação</th><th>Cobertura</th><th>Situação</th></tr></thead>
                    <tbody>
                      {ppsiControls.map((item) => (
                        <tr key={item.control}>
                          <td><strong>{item.control}</strong></td>
                          <td>{item.title}</td>
                          <td><span className="soft-tag">{item.group}</span></td>
                          <td>{item.done} de {item.applicable}</td>
                          <td><div className="table-progress"><ProgressBar value={item.progress} tone={item.progress < 50 ? 'amber' : item.progress >= 80 ? 'green' : 'blue'} small /><b>{item.progress}%</b></div></td>
                          <td><StatusPill>{item.status}</StatusPill></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </section>

              <section className="control-14-note">
                <span><Icon name="sparkles" /></span>
                <div><strong>Nota sobre o Controle 14</strong><p>O título oficial é “Conscientização e treinamento de competências”. O plano de comunicação pode apoiar o controle, mas a vinculação final deverá ser confirmada no plano de trabalho e nas evidências do órgão.</p></div>
              </section>
            </>
          )}

          {view === 'indices' && (
            <>
              <section className="index-hero-grid">
                <article className="index-score index-score--blue"><div><span>Índice geral</span><h2>iESGo</h2><p>Avaliação ampla de governança e sustentabilidade.</p></div><Ring value={61} color="var(--blue)" /><StatusPill>Intermediário</StatusPill></article>
                <article className="index-score index-score--green"><div><span>Recorte de tecnologia</span><h2>iGestTI</h2><p>Gestão de TI e segurança da informação.</p></div><Ring value={58} color="var(--green)" /><StatusPill>Intermediário</StatusPill></article>
                <article className="index-context"><span className="section-kicker">Relação entre os índices</span><div className="hierarchy"><strong>iESGo</strong><span>Governança e sustentabilidade</span><i /><strong>iGovTI</strong><span>Governança e gestão de TI</span><i /><strong>iGestTI</strong><span>Gestão de TI e segurança</span></div></article>
              </section>

              <section className="dashboard-grid dashboard-grid--equal">
                <article className="panel">
                  <div className="panel-heading"><div><span className="section-kicker">iESGo</span><h2>Resultado por dimensão</h2></div><small className="source-chip">Ciclo demonstrativo 2026</small></div>
                  <div className="dimension-list">{iesgoDimensions.map((item) => <DimensionRow key={item.label} item={item} />)}</div>
                </article>
                <article className="panel">
                  <div className="panel-heading"><div><span className="section-kicker">iGestTI</span><h2>Capacidades de tecnologia</h2></div><small className="source-chip">Recorte de TI</small></div>
                  <div className="dimension-list">{igestDimensions.map((item) => <DimensionRow key={item.label} item={item} />)}</div>
                </article>
              </section>

              <section className="panel maturity-panel">
                <div className="panel-heading"><div><span className="section-kicker">Escala de capacidade</span><h2>Estágio do iGestTI</h2></div><span className="gap-chip">Faltam 12,01 p.p. para o estágio aprimorado</span></div>
                <div className="maturity-scale">
                  <div className="maturity-segment maturity-segment--low" style={{ width: '15%' }}><strong>Inexpressivo</strong><span>0–14,99%</span></div>
                  <div className="maturity-segment maturity-segment--start" style={{ width: '25%' }}><strong>Iniciando</strong><span>15–39,99%</span></div>
                  <div className="maturity-segment maturity-segment--middle" style={{ width: '30%' }}><strong>Intermediário</strong><span>40–70%</span></div>
                  <div className="maturity-segment maturity-segment--high" style={{ width: '30%' }}><strong>Aprimorado</strong><span>70,01–100%</span></div>
                  <span className="maturity-marker" style={{ left: '58%' }}><b>58%</b><i /></span>
                </div>
              </section>
            </>
          )}

          {view === 'plans' && (
            <>
              <section className="summary-strip">
                <article><span>Planos acompanhados</span><strong>4</strong><small>Portfólio institucional</small></article>
                <article><span>Entregas previstas</span><strong>123</strong><small>No ciclo vigente</small></article>
                <article><span>Entregas concluídas</span><strong>89</strong><small>72% do portfólio</small></article>
                <article><span>Prazos vencidos</span><strong className="danger-text">10</strong><small>Em quatro planos</small></article>
              </section>
              <section className="plan-cards">
                {plans.map((plan) => <PlanCard key={plan.id} plan={plan} onClick={() => { setProgram(plan.name.startsWith('PDTIC') ? 'PDTIC' : plan.name.startsWith('PTD') ? 'PTD' : plan.name.includes('PPSI') ? 'PPSI' : 'Todos'); navigate('kanban') }} />)}
              </section>
              <section className="panel timeline-panel">
                <div className="panel-heading"><div><span className="section-kicker">Calendário executivo</span><h2>Próximos marcos</h2></div><span className="legend-note">Outubro · 2026</span></div>
                <div className="timeline">
                  <div><time>14 OUT</time><span /><section><strong>Validação do plano de comunicação</strong><small>Comunicação · PPSI Controle 14</small></section><StatusPill>Em validação</StatusPill></div>
                  <div><time>18 OUT</time><span /><section><strong>Inventário de ativos de informação</strong><small>Segurança · PPSI Controle 1</small></section><StatusPill>Em execução</StatusPill></div>
                  <div><time>21 OUT</time><span /><section><strong>Consolidação das iniciativas do PDTIC</strong><small>Governança de TI · PDTIC 2023–2026</small></section><StatusPill>Em execução</StatusPill></div>
                  <div><time>31 OUT</time><span /><section><strong>Atualização mensal dos indicadores</strong><small>Comitê de Governança · Todas as fontes</small></section><StatusPill>Programado</StatusPill></div>
                </div>
              </section>
            </>
          )}

          {view === 'kanban' && (
            <>
              <section className="kanban-toolbar">
                <div className="filter-field"><Icon name="filter" size={17} /><select value={program} onChange={(event) => setProgram(event.target.value)} aria-label="Filtrar por programa"><option>Todos</option><option>PPSI</option><option>iESGo</option><option>iGestTI</option><option>PDTIC</option><option>PTD</option></select></div>
                <span>{filteredTasks.length} ações exibidas</span>
                <button type="button" className="text-button" onClick={() => { setTasks(initialTasks); setProgram('Todos'); setQuery(''); setToast('Dados demonstrativos restaurados.') }}><Icon name="refresh" size={16} /> Restaurar demonstração</button>
              </section>
              <section className="kanban" aria-label="Quadro de ações">
                {columns.map((column) => {
                  const columnTasks = filteredTasks.filter((task) => task.status === column.id)
                  return (
                    <div className="kanban-column" key={column.id} onDragOver={(event) => event.preventDefault()} onDrop={(event) => onDrop(event, column.id)}>
                      <div className="kanban-column__heading"><div><span className={'column-dot column-dot--' + column.id} /><strong>{column.title}</strong><em>{columnTasks.length}</em></div><small>{column.subtitle}</small></div>
                      <div className="kanban-column__body">
                        {columnTasks.map((task) => (
                          <article className="kanban-card" key={task.id} draggable onDragStart={() => setDragId(task.id)} onClick={() => setSelectedTask(task)}>
                            <div className="kanban-card__top"><span className="soft-tag">{task.program}</span><span className={'priority priority--' + task.priority.toLocaleLowerCase('pt-BR').normalize('NFD').replace(/[\u0300-\u036f]/g, '')}>{task.priority}</span></div>
                            <h3>{task.title}</h3>
                            <p>{task.reference}</p>
                            <ProgressBar value={task.progress} tone={task.progress >= 80 ? 'green' : task.progress < 40 ? 'amber' : 'blue'} small />
                            <div className="kanban-card__meta"><span className="mini-avatar">{task.initials}</span><span><Icon name="calendar" size={14} />{task.due}</span><span><Icon name="paperclip" size={14} />{task.evidence}</span><span><Icon name="message" size={14} />{task.comments}</span></div>
                          </article>
                        ))}
                        {columnTasks.length === 0 && <div className="empty-column"><Icon name="clipboard" /><span>Nenhuma ação nesta etapa</span></div>}
                      </div>
                    </div>
                  )
                })}
              </section>
            </>
          )}

          {view === 'sources' && (
            <>
              <section className="integration-hero">
                <div><span className="integration-hero__icon"><Icon name="database" /></span><div><span className="section-kicker">Arquitetura preparada</span><h2>Uma camada única para diferentes origens</h2><p>O front-end já separa fonte, periodicidade e data de referência. O back-end fará a leitura e a normalização sem alterar a experiência do painel.</p></div></div>
                <div className="flow"><span>Planilhas e pastas</span><Icon name="arrowRight" /><strong>Normalização</strong><Icon name="arrowRight" /><span>Painel</span></div>
              </section>
              <section className="source-grid">
                {sources.map((source) => (
                  <article className="source-card" key={source.name}>
                    <div className="source-card__heading"><span className="source-card__icon"><Icon name={source.icon} /></span><StatusPill>{source.status === 'ready' ? 'Cadastrada' : source.status === 'future' ? 'Etapa futura' : 'Pendente'}</StatusPill></div>
                    <h2>{source.name}</h2><p>{source.detail}</p>
                    <dl><div><dt>Tipo</dt><dd>{source.kind}</dd></div><div><dt>Frequência</dt><dd>{source.cadence}</dd></div><div><dt>Situação</dt><dd>{source.updated}</dd></div></dl>
                    <button type="button" className="secondary-button" onClick={() => setToast(source.status === 'ready' ? 'Referência oficial já mapeada.' : 'Anexe o arquivo real para ativar esta fonte.')}><Icon name={source.status === 'ready' ? 'check' : 'plus'} size={16} />{source.status === 'ready' ? 'Referência mapeada' : 'Conectar fonte'}</button>
                  </article>
                ))}
              </section>
              <section className="panel backend-roadmap">
                <div className="panel-heading"><div><span className="section-kicker">Próxima etapa</span><h2>Roteiro da integração automática</h2></div><span className="source-chip">Back-end</span></div>
                <ol><li><span>1</span><div><strong>Receber os arquivos oficiais</strong><small>Identificar abas, colunas, fórmulas e chaves.</small></div></li><li><span>2</span><div><strong>Definir os conectores</strong><small>SharePoint, OneDrive, Excel e referências web.</small></div></li><li><span>3</span><div><strong>Normalizar os registros</strong><small>Transformar fontes diferentes em indicadores e ações.</small></div></li><li><span>4</span><div><strong>Agendar a sincronização</strong><small>Atualização mensal com acompanhamento semanal.</small></div></li></ol>
              </section>
            </>
          )}
        </main>
        <footer><span>MCID · Painel de Governança</span><span>Protótipo de front-end · dados demonstrativos</span></footer>
      </div>

      {newTaskOpen && (
        <div className="modal-layer" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) setNewTaskOpen(false) }}>
          <form className="modal" onSubmit={addTask}>
            <div className="modal__heading"><div><span className="section-kicker">Plano de ação</span><h2>Adicionar nova ação</h2></div><button type="button" className="icon-button" onClick={() => setNewTaskOpen(false)} aria-label="Fechar"><Icon name="x" /></button></div>
            <label>Título da ação<input autoFocus value={newTaskTitle} onChange={(event) => setNewTaskTitle(event.target.value)} placeholder="Ex.: Validar evidências do Controle 14" required /></label>
            <label>Instrumento<select value={newTaskProgram} onChange={(event) => setNewTaskProgram(event.target.value)}><option>PPSI</option><option>iESGo</option><option>iGestTI</option><option>iGovSISP</option><option>PDTIC</option><option>PTD</option></select></label>
            <div className="modal__actions"><button type="button" className="secondary-button" onClick={() => setNewTaskOpen(false)}>Cancelar</button><button type="submit" className="primary-button">Adicionar ao quadro</button></div>
          </form>
        </div>
      )}

      {selectedTask && (
        <div className="drawer-layer" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) setSelectedTask(null) }}>
          <aside className="task-drawer">
            <div className="drawer__heading"><span className="soft-tag">{selectedTask.program}</span><button type="button" className="icon-button" onClick={() => setSelectedTask(null)} aria-label="Fechar"><Icon name="x" /></button></div>
            <h2>{selectedTask.title}</h2><p>{selectedTask.reference}</p>
            <div className="drawer-progress"><span><strong>Execução</strong><b>{selectedTask.progress}%</b></span><ProgressBar value={selectedTask.progress} tone={selectedTask.progress >= 80 ? 'green' : 'blue'} /></div>
            <dl className="drawer-details"><div><dt>Responsável</dt><dd>{selectedTask.owner}</dd></div><div><dt>Prioridade</dt><dd>{selectedTask.priority}</dd></div><div><dt>Prazo</dt><dd>{selectedTask.due}</dd></div><div><dt>Evidências</dt><dd>{selectedTask.evidence} arquivos</dd></div></dl>
            <div className="drawer-evidence"><Icon name="folder" /><div><strong>Evidências da ação</strong><span>A conexão com Teams/SharePoint será ativada no back-end.</span></div></div>
            {selectedTask.status !== 'done' && <button type="button" className="primary-button primary-button--full" onClick={() => { const order: TaskStatus[] = ['backlog', 'inProgress', 'review', 'done']; moveTask(selectedTask.id, order[Math.min(order.indexOf(selectedTask.status) + 1, 3)]); setSelectedTask(null) }}>Avançar para a próxima etapa <Icon name="arrowRight" size={17} /></button>}
          </aside>
        </div>
      )}

      {toast && <div className="toast"><Icon name="check" size={17} /><span>{toast}</span></div>}
    </div>
  )
}

function IndicatorRow({ label, value, note, tone }: ProgressItem) {
  return <div className="indicator-row"><div className="indicator-row__copy"><strong>{label}</strong><small>{note}</small></div><ProgressBar value={value} tone={tone} /><b>{value}%</b></div>
}

function DimensionRow({ item }: { item: ProgressItem }) {
  return <div className="dimension-row"><span>{item.label}</span><ProgressBar value={item.value} tone={item.tone} small /><b>{item.value}%</b></div>
}

function PlanCard({ plan, onClick }: { plan: typeof plans[number]; onClick: () => void }) {
  return (
    <button type="button" className={'plan-card plan-card--' + plan.tone} onClick={onClick}>
      <div className="plan-card__top"><span className="plan-card__icon"><Icon name={plan.id === 'communication' ? 'message' : plan.id === 'pdtic' ? 'database' : 'clipboard'} /></span><span className="plan-card__updated">Atualizado em {plan.updated}</span></div>
      <h3>{plan.name}</h3><p>{plan.description}</p>
      <div className="plan-card__progress"><span><strong>{plan.progress}%</strong><small>{plan.done} de {plan.total} entregas</small></span><ProgressBar value={plan.progress} tone={plan.tone as ProgressItem['tone']} /></div>
      <div className="plan-card__footer"><span>{plan.owner}</span><em className={plan.overdue ? 'has-overdue' : ''}>{plan.overdue} vencida{plan.overdue !== 1 ? 's' : ''}</em></div>
    </button>
  )
}

export default App
