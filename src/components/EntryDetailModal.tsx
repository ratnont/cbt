import type { Entry } from '../types'
import type { Strings, Lang } from '../i18n'
import { EmotionBadge } from './EmotionBadge'

interface Props {
  entry: Entry
  lang: Lang
  t: Strings
  onClose: () => void
}

function formatDatetime(iso: string, lang: Lang) {
  return new Date(iso).toLocaleString(lang === 'th' ? 'th-TH' : 'en-GB', {
    dateStyle: 'long',
    timeStyle: 'short',
  })
}

interface FieldProps {
  label: string
  children: React.ReactNode
}

function Field({ label, children }: FieldProps) {
  return (
    <div className="space-y-1">
      <p className="text-xs font-semibold text-stone-400 uppercase tracking-wide">{label}</p>
      <div className="text-sm text-stone-700 leading-relaxed">{children}</div>
    </div>
  )
}

export function EntryDetailModal({ entry, lang, t, onClose }: Props) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/40 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="bg-white w-full sm:max-w-lg sm:rounded-2xl rounded-t-2xl shadow-xl max-h-[90svh] flex flex-col"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 pt-5 pb-3 border-b border-stone-100 shrink-0">
          <p className="text-sm font-semibold text-stone-700">
            {formatDatetime(entry.datetime, lang)}
          </p>
          <button
            onClick={onClose}
            className="text-stone-400 hover:text-stone-600 text-xl leading-none px-1"
            aria-label="Close"
          >
            ×
          </button>
        </div>

        {/* Scrollable body */}
        <div className="overflow-y-auto px-5 py-4 space-y-5">
          {entry.situation && (
            <Field label={t.situation}>
              <p className="whitespace-pre-wrap">{entry.situation}</p>
            </Field>
          )}

          {entry.thoughts && (
            <Field label={t.thoughts}>
              <p className="whitespace-pre-wrap">{entry.thoughts}</p>
            </Field>
          )}

          {entry.emotions.length > 0 && (
            <Field label={t.emotions}>
              <div className="flex flex-wrap gap-1.5 pt-0.5">
                {entry.emotions.map(e => (
                  <EmotionBadge key={e.name} emotion={e} />
                ))}
              </div>
            </Field>
          )}

          {entry.physical && (
            <Field label={t.physical}>
              <p className="whitespace-pre-wrap">{entry.physical}</p>
            </Field>
          )}

          {entry.behaviors && (
            <Field label={t.behaviors}>
              <p className="whitespace-pre-wrap">{entry.behaviors}</p>
            </Field>
          )}
        </div>

        {/* Bottom padding for mobile safe area */}
        <div className="shrink-0 h-4 sm:h-2" />
      </div>
    </div>
  )
}
