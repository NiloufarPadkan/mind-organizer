export type Priority = 'high' | 'medium' | 'low'
export type TaskStatus = 'inbox' | 'todo' | 'doing' | 'done'

export interface Category {
  id: string
  name: string
  color: string
}

export interface Task {
  id: string
  title: string
  notes?: string
  categoryId?: string
  priority: Priority
  status: TaskStatus
  createdAt: string
  updatedAt: string
}

export interface AppData {
  tasks: Task[]
  categories: Category[]
}

export type ViewId = 'inbox' | 'list' | 'board'
