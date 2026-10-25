import { useEffect, useState } from 'react'
import { CategoryManager } from './components/CategoryManager'
import { BoardView } from './components/BoardView'
import { InboxView } from './components/InboxView'
import { ListView } from './components/ListView'
import { useI18n, type MessageKey } from './i18n'
import {
  createCategory,
  createTask,
  deleteTask,
  loadData,
  saveData,
  setTaskStatus,
  updateTask,
} from './store'
import type { Category, Task, TaskStatus, ViewId } from './types'

const NAV: Array<{ id: ViewId; labelKey: MessageKey }> = [
  { id: 'inbox', labelKey: 'navInbox' },
  { id: 'list', labelKey: 'navList' },
  { id: 'board', labelKey: 'navBoard' },
]

export default function App() {
  const { t, locale, setLocale } = useI18n()
  const [tasks, setTasks] = useState<Task[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [view, setView] = useState<ViewId>('inbox')
  const [ready, setReady] = useState(false)

  useEffect(() => {
    const data = loadData()
    setTasks(data.tasks)
    setCategories(data.categories)
    setReady(true)
  }, [])

  useEffect(() => {
    if (!ready) return
    saveData({ tasks, categories })
  }, [tasks, categories, ready])

  function handleCapture(title: string) {
    setTasks((current) => [createTask(title), ...current])
  }

  function handleUpdate(
    id: string,
    patch: Partial<Pick<Task, 'title' | 'notes' | 'categoryId' | 'priority' | 'status'>>,
  ) {
    setTasks((current) => updateTask(current, id, patch))
  }

  function handleDelete(id: string) {
    setTasks((current) => deleteTask(current, id))
  }

  function handlePromote(id: string) {
    setTasks((current) => setTaskStatus(current, id, 'todo'))
  }

  function handleMove(id: string, status: TaskStatus) {
    setTasks((current) => setTaskStatus(current, id, status))
  }

  function handleAddCategory(name: string, color: string) {
    setCategories((current) => [...current, createCategory(name, color)])
  }

  function handleDeleteCategory(id: string) {
    setCategories((current) => current.filter((category) => category.id !== id))
    setTasks((current) =>
      current.map((task) =>
        task.categoryId === id
          ? { ...task, categoryId: undefined, updatedAt: new Date().toISOString() }
          : task,
      ),
    )
  }

  const inboxCount = tasks.filter((task) => task.status === 'inbox').length

  return (
    <div className="app-shell">
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-6">
        <header className="fade-in panel panel-header px-5 py-6 sm:px-8 sm:py-8">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="mb-2 text-xs font-medium tracking-[0.12em] text-[var(--accent)]">
                {t('tagline')}
              </p>
              <h1 className="brand-title text-4xl text-[var(--ink)] sm:text-5xl">ClearMind</h1>
              <p className="mt-3 max-w-md text-[var(--ink-muted)]">{t('subtitle')}</p>
            </div>

            <div className="relative z-[50] flex flex-wrap items-center gap-2">
              <div
                className="flex rounded-full border border-[var(--line)] bg-white/55 p-1"
                role="group"
                aria-label={t('switchLanguage')}
              >
                <button
                  type="button"
                  onClick={() => setLocale('fa')}
                  className={`rounded-full px-2.5 py-1 text-xs font-medium transition ${
                    locale === 'fa'
                      ? 'bg-[var(--accent)] text-white'
                      : 'text-[var(--ink-muted)] hover:text-[var(--ink)]'
                  }`}
                >
                  {t('langFa')}
                </button>
                <button
                  type="button"
                  onClick={() => setLocale('en')}
                  className={`rounded-full px-2.5 py-1 text-xs font-medium transition ${
                    locale === 'en'
                      ? 'bg-[var(--accent)] text-white'
                      : 'text-[var(--ink-muted)] hover:text-[var(--ink)]'
                  }`}
                >
                  {t('langEn')}
                </button>
              </div>

              <nav className="flex rounded-full border border-[var(--line)] bg-white/55 p-1">
                {NAV.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setView(item.id)}
                    className={`rounded-full px-3.5 py-1.5 text-sm transition ${
                      view === item.id
                        ? 'bg-[var(--ink)] text-[var(--surface-strong)]'
                        : 'text-[var(--ink-muted)] hover:text-[var(--ink)]'
                    }`}
                  >
                    {t(item.labelKey)}
                    {item.id === 'inbox' && inboxCount > 0 ? ` (${inboxCount})` : ''}
                  </button>
                ))}
              </nav>
              <CategoryManager
                categories={categories}
                onAdd={handleAddCategory}
                onDelete={handleDeleteCategory}
              />
            </div>
          </div>
        </header>

        <main className="panel panel-main px-5 py-6 sm:px-8 sm:py-8">
          {view === 'inbox' && (
            <InboxView
              tasks={tasks}
              categories={categories}
              onCapture={handleCapture}
              onUpdate={handleUpdate}
              onDelete={handleDelete}
              onPromote={handlePromote}
            />
          )}
          {view === 'list' && (
            <ListView
              tasks={tasks}
              categories={categories}
              onUpdate={handleUpdate}
              onDelete={handleDelete}
            />
          )}
          {view === 'board' && (
            <BoardView
              tasks={tasks}
              categories={categories}
              onUpdate={handleUpdate}
              onDelete={handleDelete}
              onMove={handleMove}
            />
          )}
        </main>
      </div>
    </div>
  )
}
