import type { AppData, Category, Priority, Task, TaskStatus } from './types'

const STORAGE_KEY = 'clearmind-data-v1'

const DEFAULT_CATEGORIES: Category[] = [
  { id: 'cat-work', name: 'Work', color: '#2a6f6a' },
  { id: 'cat-personal', name: 'Personal', color: '#c45c26' },
  { id: 'cat-ideas', name: 'Ideas', color: '#3d6b9a' },
]

function createId(prefix: string): string {
  return `${prefix}-${crypto.randomUUID()}`
}

function now(): string {
  return new Date().toISOString()
}

export function loadData(): AppData {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) {
      return { tasks: [], categories: DEFAULT_CATEGORIES }
    }
    const parsed = JSON.parse(raw) as AppData
    return {
      tasks: Array.isArray(parsed.tasks) ? parsed.tasks : [],
      categories:
        Array.isArray(parsed.categories) && parsed.categories.length > 0
          ? parsed.categories
          : DEFAULT_CATEGORIES,
    }
  } catch {
    return { tasks: [], categories: DEFAULT_CATEGORIES }
  }
}

export function saveData(data: AppData): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
}

export function createTask(
  title: string,
  overrides: Partial<Pick<Task, 'notes' | 'categoryId' | 'priority' | 'status'>> = {},
): Task {
  const timestamp = now()
  return {
    id: createId('task'),
    title: title.trim(),
    notes: overrides.notes,
    categoryId: overrides.categoryId,
    priority: overrides.priority ?? 'medium',
    status: overrides.status ?? 'inbox',
    createdAt: timestamp,
    updatedAt: timestamp,
  }
}

export function createCategory(name: string, color: string): Category {
  return {
    id: createId('cat'),
    name: name.trim(),
    color,
  }
}

export function updateTask(
  tasks: Task[],
  id: string,
  patch: Partial<Omit<Task, 'id' | 'createdAt'>>,
): Task[] {
  return tasks.map((task) =>
    task.id === id
      ? {
          ...task,
          ...patch,
          updatedAt: now(),
        }
      : task,
  )
}

export function deleteTask(tasks: Task[], id: string): Task[] {
  return tasks.filter((task) => task.id !== id)
}

export function setTaskStatus(tasks: Task[], id: string, status: TaskStatus): Task[] {
  return updateTask(tasks, id, { status })
}

export function setTaskPriority(tasks: Task[], id: string, priority: Priority): Task[] {
  return updateTask(tasks, id, { priority })
}

export const PRIORITY_ORDER: Record<Priority, number> = {
  high: 0,
  medium: 1,
  low: 2,
}

export function sortTasks(tasks: Task[]): Task[] {
  return [...tasks].sort((a, b) => {
    const byPriority = PRIORITY_ORDER[a.priority] - PRIORITY_ORDER[b.priority]
    if (byPriority !== 0) return byPriority
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  })
}
