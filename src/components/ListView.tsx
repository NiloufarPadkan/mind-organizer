import { useMemo, useState } from 'react'
import { categoryLabel, useI18n, type MessageKey } from '../i18n'
import type { Category, Priority, Task, TaskStatus } from '../types'
import { sortTasks } from '../store'
import { TaskItem } from './TaskItem'

interface ListViewProps {
  tasks: Task[]
  categories: Category[]
  onUpdate: (
    id: string,
    patch: Partial<Pick<Task, 'title' | 'notes' | 'categoryId' | 'priority' | 'status'>>,
  ) => void
  onDelete: (id: string) => void
}

const STATUS_FILTERS: Array<{ value: TaskStatus | 'all'; labelKey: MessageKey }> = [
  { value: 'all', labelKey: 'filterAll' },
  { value: 'todo', labelKey: 'statusTodo' },
  { value: 'doing', labelKey: 'statusDoing' },
  { value: 'done', labelKey: 'statusDone' },
  { value: 'inbox', labelKey: 'statusInbox' },
]

const PRIORITY_FILTERS: Array<{ value: Priority | 'all'; labelKey: MessageKey }> = [
  { value: 'all', labelKey: 'filterAnyPriority' },
  { value: 'high', labelKey: 'priorityHigh' },
  { value: 'medium', labelKey: 'priorityMedium' },
  { value: 'low', labelKey: 'priorityLow' },
]

export function ListView({ tasks, categories, onUpdate, onDelete }: ListViewProps) {
  const { t } = useI18n()
  const [statusFilter, setStatusFilter] = useState<TaskStatus | 'all'>('all')
  const [priorityFilter, setPriorityFilter] = useState<Priority | 'all'>('all')
  const [categoryFilter, setCategoryFilter] = useState<string>('all')

  const filtered = useMemo(() => {
    const next = tasks.filter((task) => {
      if (statusFilter !== 'all' && task.status !== statusFilter) return false
      if (priorityFilter !== 'all' && task.priority !== priorityFilter) return false
      if (categoryFilter !== 'all' && task.categoryId !== categoryFilter) return false
      return true
    })
    return sortTasks(next)
  }, [tasks, statusFilter, priorityFilter, categoryFilter])

  return (
    <section className="fade-in space-y-5">
      <div>
        <h2 className="brand-title mb-1 text-2xl text-[var(--ink)]">{t('listTitle')}</h2>
        <p className="text-sm text-[var(--ink-muted)]">{t('listHint')}</p>
      </div>

      <div className="relative z-10 flex flex-wrap gap-2">
        {STATUS_FILTERS.map((filter) => (
          <button
            key={filter.value}
            type="button"
            onClick={() => setStatusFilter(filter.value)}
            className={`rounded-full px-3 py-1.5 text-sm transition ${
              statusFilter === filter.value
                ? 'bg-[var(--ink)] text-[var(--surface-strong)]'
                : 'border border-[var(--line)] bg-white/50 text-[var(--ink-muted)] hover:bg-white'
            }`}
          >
            {t(filter.labelKey)}
          </button>
        ))}
      </div>

      <div className="relative z-10 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => setCategoryFilter('all')}
          className={`rounded-full px-3 py-1.5 text-sm transition ${
            categoryFilter === 'all'
              ? 'bg-[var(--accent)] text-white'
              : 'border border-[var(--line)] bg-white/50 text-[var(--ink-muted)]'
          }`}
        >
          {t('filterAllCategories')}
        </button>
        {categories.map((category) => (
          <button
            key={category.id}
            type="button"
            onClick={() => setCategoryFilter(category.id)}
            className={`rounded-full px-3 py-1.5 text-sm transition ${
              categoryFilter === category.id
                ? 'text-white'
                : 'border border-[var(--line)] bg-white/50 text-[var(--ink-muted)]'
            }`}
            style={
              categoryFilter === category.id
                ? { backgroundColor: category.color }
                : undefined
            }
          >
            {categoryLabel(category, t)}
          </button>
        ))}
      </div>

      <div className="relative z-10 flex flex-wrap gap-2">
        {PRIORITY_FILTERS.map((filter) => (
          <button
            key={filter.value}
            type="button"
            onClick={() => setPriorityFilter(filter.value)}
            className={`rounded-full px-3 py-1.5 text-sm transition ${
              priorityFilter === filter.value
                ? 'bg-[var(--bg-mid)] text-[var(--surface-strong)]'
                : 'border border-[var(--line)] bg-white/50 text-[var(--ink-muted)]'
            }`}
          >
            {t(filter.labelKey)}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <p className="rounded-xl border border-dashed border-[var(--line)] px-4 py-10 text-center text-sm text-[var(--ink-muted)]">
          {t('noTasksMatch')}
        </p>
      ) : (
        <ul className="relative z-0 space-y-3">
          {filtered.map((task) => (
            <li key={task.id} className="relative">
              <TaskItem
                task={task}
                categories={categories}
                onUpdate={onUpdate}
                onDelete={onDelete}
              />
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}
