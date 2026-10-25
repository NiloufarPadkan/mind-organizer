import { useI18n } from '../i18n'
import type { Category, Task } from '../types'
import { sortTasks } from '../store'
import { QuickCapture } from './QuickCapture'
import { TaskItem } from './TaskItem'

interface InboxViewProps {
  tasks: Task[]
  categories: Category[]
  onCapture: (title: string) => void
  onUpdate: (
    id: string,
    patch: Partial<Pick<Task, 'title' | 'notes' | 'categoryId' | 'priority' | 'status'>>,
  ) => void
  onDelete: (id: string) => void
  onPromote: (id: string) => void
}

export function InboxView({
  tasks,
  categories,
  onCapture,
  onUpdate,
  onDelete,
  onPromote,
}: InboxViewProps) {
  const { t } = useI18n()
  const inboxTasks = sortTasks(tasks.filter((task) => task.status === 'inbox'))

  return (
    <section className="fade-in space-y-5">
      <div>
        <h2 className="brand-title mb-1 text-2xl text-[var(--ink)]">{t('inboxTitle')}</h2>
        <p className="text-sm text-[var(--ink-muted)]">{t('inboxHint')}</p>
      </div>

      <QuickCapture onCapture={onCapture} autoFocus />

      {inboxTasks.length === 0 ? (
        <p className="rounded-xl border border-dashed border-[var(--line)] px-4 py-10 text-center text-sm text-[var(--ink-muted)]">
          {t('inboxEmpty')}
        </p>
      ) : (
        <ul className="space-y-3">
          {inboxTasks.map((task) => (
            <li key={task.id} className="space-y-2">
              <TaskItem
                task={task}
                categories={categories}
                onUpdate={onUpdate}
                onDelete={onDelete}
              />
              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={() => onPromote(task.id)}
                  className="rounded-full bg-[var(--ink)] px-3 py-1.5 text-xs font-medium text-[var(--surface-strong)] transition hover:opacity-90"
                >
                  {t('moveToTodo')}
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}
