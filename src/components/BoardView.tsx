import { useState, type DragEvent } from 'react'
import { useI18n, type MessageKey } from '../i18n'
import type { Category, Task, TaskStatus } from '../types'
import { sortTasks } from '../store'
import { TaskItem } from './TaskItem'

interface BoardViewProps {
  tasks: Task[]
  categories: Category[]
  onUpdate: (
    id: string,
    patch: Partial<Pick<Task, 'title' | 'notes' | 'categoryId' | 'priority' | 'status'>>,
  ) => void
  onDelete: (id: string) => void
  onMove: (id: string, status: TaskStatus) => void
}

const COLUMNS: Array<{
  status: Extract<TaskStatus, 'todo' | 'doing' | 'done'>
  labelKey: MessageKey
}> = [
  { status: 'todo', labelKey: 'statusTodo' },
  { status: 'doing', labelKey: 'statusDoing' },
  { status: 'done', labelKey: 'statusDone' },
]

export function BoardView({ tasks, categories, onUpdate, onDelete, onMove }: BoardViewProps) {
  const { t } = useI18n()
  const [draggingId, setDraggingId] = useState<string | null>(null)

  function handleDrop(event: DragEvent, status: TaskStatus) {
    event.preventDefault()
    const id = event.dataTransfer.getData('text/task-id') || draggingId
    if (id) onMove(id, status)
    setDraggingId(null)
  }

  return (
    <section className="fade-in space-y-5">
      <div>
        <h2 className="brand-title mb-1 text-2xl text-[var(--ink)]">{t('boardTitle')}</h2>
        <p className="text-sm text-[var(--ink-muted)]">{t('boardHint')}</p>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        {COLUMNS.map((column) => {
          const columnTasks = sortTasks(
            tasks.filter((task) => task.status === column.status),
          )

          return (
            <div
              key={column.status}
              className="board-column rounded-2xl border border-[var(--line)] bg-black/[0.03] p-3"
              onDragOver={(event) => event.preventDefault()}
              onDrop={(event) => handleDrop(event, column.status)}
            >
              <div className="mb-3 flex items-center justify-between px-1">
                <h3 className="text-sm font-semibold tracking-wide text-[var(--ink)]">
                  {t(column.labelKey)}
                </h3>
                <span className="rounded-full bg-white/70 px-2 py-0.5 text-xs text-[var(--ink-muted)]">
                  {columnTasks.length}
                </span>
              </div>

              <ul className="space-y-2">
                {columnTasks.map((task) => (
                  <li key={task.id} className="space-y-1">
                    <div className={draggingId === task.id ? 'dragging' : ''}>
                      <TaskItem
                        task={task}
                        categories={categories}
                        variant="card"
                        onUpdate={onUpdate}
                        onDelete={onDelete}
                        draggable
                        onDragStart={() => setDraggingId(task.id)}
                        onDragEnd={() => setDraggingId(null)}
                      />
                    </div>
                    <div className="flex flex-wrap gap-1 px-1">
                      {COLUMNS.filter((item) => item.status !== column.status).map((target) => (
                        <button
                          key={target.status}
                          type="button"
                          onClick={() => onMove(task.id, target.status)}
                          className="rounded-full border border-[var(--line)] bg-white/60 px-2 py-0.5 text-[11px] text-[var(--ink-muted)] hover:text-[var(--ink)]"
                        >
                          {t('moveTo')} {t(target.labelKey)}
                        </button>
                      ))}
                    </div>
                  </li>
                ))}
              </ul>

              {columnTasks.length === 0 && (
                <p className="px-1 py-8 text-center text-xs text-[var(--ink-muted)]">
                  {t('dropHere')}
                </p>
              )}
            </div>
          )
        })}
      </div>
    </section>
  )
}
