import {
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type CSSProperties,
  type FormEvent,
} from 'react'
import { createPortal } from 'react-dom'
import { categoryLabel, useI18n } from '../i18n'
import type { Category } from '../types'

const COLOR_OPTIONS = [
  '#2a6f6a',
  '#c45c26',
  '#3d6b9a',
  '#8b4d6b',
  '#6b7c3d',
  '#9a5b2e',
]

interface CategoryManagerProps {
  categories: Category[]
  onAdd: (name: string, color: string) => void
  onDelete: (id: string) => void
}

export function CategoryManager({ categories, onAdd, onDelete }: CategoryManagerProps) {
  const { t, dir } = useI18n()
  const [open, setOpen] = useState(false)
  const [name, setName] = useState('')
  const [color, setColor] = useState(COLOR_OPTIONS[0])
  const [menuStyle, setMenuStyle] = useState<CSSProperties>({})
  const buttonRef = useRef<HTMLButtonElement>(null)
  const menuRef = useRef<HTMLDivElement>(null)

  function updateMenuPosition() {
    const button = buttonRef.current
    if (!button) return
    const rect = button.getBoundingClientRect()
    const width = 288
    const gap = 8
    const style: CSSProperties = {
      position: 'fixed',
      top: rect.bottom + gap,
      width,
      zIndex: 9999,
    }

    if (dir === 'rtl') {
      style.left = Math.max(8, rect.right - width)
    } else {
      style.left = Math.min(window.innerWidth - width - 8, rect.left)
    }

    setMenuStyle(style)
  }

  useLayoutEffect(() => {
    if (!open) return
    updateMenuPosition()
    window.addEventListener('resize', updateMenuPosition)
    window.addEventListener('scroll', updateMenuPosition, true)
    return () => {
      window.removeEventListener('resize', updateMenuPosition)
      window.removeEventListener('scroll', updateMenuPosition, true)
    }
  }, [open, dir])

  useEffect(() => {
    if (!open) return

    function handlePointerDown(event: MouseEvent) {
      const target = event.target as Node
      if (buttonRef.current?.contains(target) || menuRef.current?.contains(target)) return
      setOpen(false)
    }

    function handleKey(event: KeyboardEvent) {
      if (event.key === 'Escape') setOpen(false)
    }

    document.addEventListener('mousedown', handlePointerDown)
    document.addEventListener('keydown', handleKey)
    return () => {
      document.removeEventListener('mousedown', handlePointerDown)
      document.removeEventListener('keydown', handleKey)
    }
  }, [open])

  function handleSubmit(event: FormEvent) {
    event.preventDefault()
    const trimmed = name.trim()
    if (!trimmed) return
    onAdd(trimmed, color)
    setName('')
    setColor(COLOR_OPTIONS[0])
    setOpen(false)
  }

  return (
    <div className="relative">
      <button
        ref={buttonRef}
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-expanded={open}
        className="rounded-full border border-[var(--line)] bg-white/50 px-3 py-1.5 text-sm text-[var(--ink-muted)] transition hover:bg-white hover:text-[var(--ink)]"
      >
        {t('categories')}
      </button>

      {open &&
        createPortal(
          <div
            ref={menuRef}
            style={menuStyle}
            className="rounded-xl border border-[var(--line)] bg-[var(--surface-strong)] p-3 shadow-[var(--shadow)]"
            role="dialog"
            aria-label={t('manageCategories')}
          >
            <p className="mb-2 text-xs font-medium tracking-wide text-[var(--ink-muted)]">
              {t('manageCategories')}
            </p>

            <ul className="mb-3 max-h-40 space-y-1 overflow-auto">
              {categories.map((category) => (
                <li
                  key={category.id}
                  className="flex items-center justify-between gap-2 rounded-lg px-2 py-1.5 hover:bg-black/5"
                >
                  <span className="flex items-center gap-2 text-sm">
                    <span
                      className="h-2.5 w-2.5 rounded-full"
                      style={{ backgroundColor: category.color }}
                    />
                    {categoryLabel(category, t)}
                  </span>
                  <button
                    type="button"
                    onClick={() => onDelete(category.id)}
                    className="text-xs text-[var(--ink-muted)] hover:text-[var(--high)]"
                  >
                    {t('remove')}
                  </button>
                </li>
              ))}
            </ul>

            <form onSubmit={handleSubmit} className="space-y-2 border-t border-[var(--line)] pt-3">
              <input
                type="text"
                value={name}
                onChange={(event) => setName(event.target.value)}
                placeholder={t('newCategory')}
                className="w-full rounded-lg border border-[var(--line)] bg-white/80 px-3 py-2 text-sm outline-none focus:border-[var(--accent)]"
              />
              <div className="flex flex-wrap gap-2">
                {COLOR_OPTIONS.map((option) => (
                  <button
                    key={option}
                    type="button"
                    onClick={() => setColor(option)}
                    aria-label={`${t('pickColor')} ${option}`}
                    className={`h-6 w-6 rounded-full border-2 ${
                      color === option ? 'border-[var(--ink)]' : 'border-transparent'
                    }`}
                    style={{ backgroundColor: option }}
                  />
                ))}
              </div>
              <button
                type="submit"
                className="w-full rounded-lg bg-[var(--ink)] px-3 py-2 text-sm font-medium text-[var(--surface-strong)]"
              >
                {t('addCategory')}
              </button>
            </form>
          </div>,
          document.body,
        )}
    </div>
  )
}
