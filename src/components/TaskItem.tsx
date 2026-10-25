import type { DragEvent } from 'react'
import { categoryLabel, useI18n, type MessageKey } from '../i18n'
import type { Category, Priority, Task, TaskStatus } from '../types'

interface TaskItemProps {
  task: Task
  categories: Category[]
  variant?: 'row' | 'card'
  onUpdate: (
    id: string,
    patch: Partial<Pick<Task, 'title' | 'notes' | 'categoryId' | 'priority' | 'status'>>,
  ) => void
  onDelete: (id: string) => void
  draggable?: boolean
  onDragStart?: (event: DragEvent) => void
  onDragEnd?: () => void
}

const PRIORITIES: Priority[] = ['high', 'medium', 'low']
const STATUSES: TaskStatus[] = ['inbox', 'todo', 'doing', 'done']

const PRIORITY_KEYS: Record<Priority, MessageKey> = {
  high: 'priorityHigh',
  medium: 'priorityMedium',
  low: 'priorityLow',
}

const STATUS_KEYS: Record<TaskStatus, MessageKey> = {
  inbox: 'statusInbox',
  todo: 'statusTodo',
  doing: 'statusDoing',
  done: 'statusDone',
}

export function TaskItem({
  task,
  categories,
  variant = 'row',
  onUpdate,
  onDelete,
  draggable = false,
  onDragStart,
  onDragEnd,
}: TaskItemProps) {
  const { t } = useI18n()
  const category = categories.find((item) => item.id === task.categoryId)
  const isCard = variant === 'card'

  return (
    <article
      className={`task-row group rounded-xl border border-[var(--line)] bg-white/45 p-3 ${
        isCard ? 'board-card cursor-grab active:cursor-grabbing' : ''
      }`}
      draggable={draggable}
      onDragStart={(event) => {
        event.dataTransfer.setData('text/task-id', task.id)
        event.dataTransfer.effectAllowed = 'move'
        onDragStart?.(event)
      }}
      onDragEnd={onDragEnd}
    >
      <div className="flex items-start gap-3">
        <button
          type="button"
          aria-label={task.status === 'done' ? t('markIncomplete') : t('markDone')}
          onClick={() =>
            onUpdate(task.id, { status: task.status === 'done' ? 'todo' : 'done' })
          }
          className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 transition ${
            task.status === 'done'
              ? 'border-[var(--low)] bg-[var(--low)] text-white'
              : 'border-[var(--ink-muted)] hover:border-[var(--accent)]'
          }`}
        >
          {task.status === 'done' && (
            <svg
              viewBox="0 0 12 12"
              className="h-3 w-3"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M2 6l3 3 5-5" />
            </svg>
          )}
        </button>

        <div className="min-w-0 flex-1 space-y-2">
          <input
            type="text"
            value={task.title}
            onChange={(event) => onUpdate(task.id, { title: event.target.value })}
            className={`w-full bg-transparent text-[0.95rem] outline-none ${
              task.status === 'done' ? 'text-[var(--ink-muted)] line-through' : ''
            }`}
          />

          {!isCard && (
            <textarea
              value={task.notes ?? ''}
              onChange={(event) => onUpdate(task.id, { notes: event.target.value })}
              placeholder={t('notes')}
              rows={1}
              className="w-full resize-y bg-transparent text-sm text-[var(--ink-muted)] outline-none placeholder:text-[var(--ink-muted)]/60"
            />
          )}

          <div className="task-controls flex flex-wrap items-center gap-2">
            <select
              value={task.categoryId ?? ''}
              onChange={(event) =>
                onUpdate(task.id, {
                  categoryId: event.target.value || undefined,
                })
              }
              className="rounded-full border border-[var(--line)] bg-white px-2 py-1 text-xs outline-none"
              style={category ? { borderColor: category.color } : undefined}
            >
              <option value="">{t('noCategory')}</option>
              {categories.map((item) => (
                <option key={item.id} value={item.id}>
                  {categoryLabel(item, t)}
                </option>
              ))}
            </select>

            <select
              value={task.priority}
              onChange={(event) =>
                onUpdate(task.id, { priority: event.target.value as Priority })
              }
              className={`rounded-full border border-[var(--line)] bg-white px-2 py-1 text-xs outline-none priority-${task.priority}`}
            >
              {PRIORITIES.map((priority) => (
                <option key={priority} value={priority}>
                  {t(PRIORITY_KEYS[priority])}
                </option>
              ))}
            </select>

            {!isCard && (
              <select
                value={task.status}
                onChange={(event) =>
                  onUpdate(task.id, { status: event.target.value as TaskStatus })
                }
                className="rounded-full border border-[var(--line)] bg-white px-2 py-1 text-xs outline-none"
              >
                {STATUSES.map((status) => (
                  <option key={status} value={status}>
                    {t(STATUS_KEYS[status])}
                  </option>
                ))}
              </select>
            )}

            {category && (
              <span
                className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] text-white"
                style={{ backgroundColor: category.color }}
              >
                {categoryLabel(category, t)}
              </span>
            )}
          </div>
        </div>

        <button
          type="button"
          onClick={() => onDelete(task.id)}
          className="shrink-0 text-xs text-[var(--ink-muted)] opacity-0 transition group-hover:opacity-100 hover:text-[var(--high)] group-focus-within:opacity-100"
        >
          {t('delete')}
        </button>
      </div>
    </article>
  )
}
