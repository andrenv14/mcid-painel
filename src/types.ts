export type TaskStatus = 'backlog' | 'inProgress' | 'review' | 'done'
export type Priority = 'Alta' | 'Média' | 'Baixa'
export type DataSource = 'Pasta' | 'Planilha' | 'Site' | 'Manual'

export interface Project {
  id: string
  name: string
  description: string
  progress: number
  completed: number
  total: number
  trend: number
  tone: 'blue' | 'violet' | 'amber' | 'green'
  updatedAt: string
}

export interface Task {
  id: string
  title: string
  projectId: string
  status: TaskStatus
  priority: Priority
  source: DataSource
  owner: {
    name: string
    initials: string
    color: string
  }
  dueLabel: string
  progress: number
  files: number
  comments: number
}

export interface Activity {
  id: string
  title: string
  detail: string
  time: string
  tone: 'blue' | 'violet' | 'amber' | 'green'
}

export interface NewTaskInput {
  title: string
  projectId: string
  priority: Priority
  source: DataSource
}
