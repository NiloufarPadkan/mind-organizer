import { useState, type FormEvent } from 'react'
import { useI18n } from '../i18n'

interface QuickCaptureProps {
  onCapture: (title: string) => void
  autoFocus?: boolean
}

export function QuickCapture({ onCapture, autoFocus = false }: QuickCaptureProps) {
  const { t } = useI18n()
  const [value, setValue] = useState('')

  function handleSubmit(event: FormEvent) {
    event.preventDefault()
    const trimmed = value.trim()
    if (!trimmed) return
    onCapture(trimmed)
    setValue('')
  }

  return (
    <form onSubmit={handleSubmit} className="flex gap-2">
      <input
        type="text"
        value={value}
        onChange={(event) => setValue(event.target.value)}
        placeholder={t('capturePlaceholder')}
        autoFocus={autoFocus}
        aria-label={t('captureAria')}
        className="min-w-0 flex-1 rounded-xl border border-[var(--line)] bg-white/70 px-4 py-3 outline-none transition focus:border-[var(--accent)] focus:bg-white focus:ring-2 focus:ring-[var(--accent)]/25"
      />
      <button
        type="submit"
        className="shrink-0 rounded-xl bg-[var(--accent)] px-4 py-3 font-medium text-white transition hover:bg-[var(--accent-deep)] active:scale-[0.98]"
      >
        {t('capture')}
      </button>
    </form>
  )
}
