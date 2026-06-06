import { useState } from 'react'
import type { Entry } from '../types'
import type { Strings, Lang } from '../i18n'
import { EmotionBadge } from './EmotionBadge'
import { EntryDetailModal } from './EntryDetailModal'

interface Props {
  entry: Entry
  lang: Lang
  onEdit: () => void
  onDelete: () => void
  t: Strings
}

function formatDatetime(iso: string, lang: Lang) {
  const d = new Date(iso)
  return d.toLocaleString(lang === 'th' ? 'th-TH' : 'en-GB', {
    dateStyle: 'medium',
    timeStyle: 'short',
  })
}

export function EntryCard({ entry, lang, onEdit, onDelete, t }: Props) {
  const [showDetail, setShowDetail] = useState(false)
  const snippet = entry.situation.slice(0, 80) + (entry.situation.length > 80 ? '…' : '')

  return (
    <>
      <div
        className="bg-white rounded-2xl border border-stone-100 shadow-sm p-4 space-y-3 cursor-pointer hover:border-stone-200 hover:shadow-md transition-all"
        onClick={() => setShowDetail(true)}
      >
        <div className="flex items-start justify-between gap-2">
          <span className="text-xs text-stone-400 font-medium">
            {formatDatetime(entry.datetime, lang)}
          </span>
          <div className="flex gap-2 shrink-0">
            <button
              onClick={e => { e.stopPropagation(); onEdit() }}
              className="text-xs text-teal-600 hover:text-teal-700 font-medium px-2 py-1 rounded-lg hover:bg-teal-50 transition-colors"
            >
              {t.editEntry}
            </button>
            <button
              onClick={e => { e.stopPropagation(); onDelete() }}
              className="text-xs text-stone-400 hover:text-rose-500 font-medium px-2 py-1 rounded-lg hover:bg-rose-50 transition-colors"
            >
              {t.delete}
            </button>
          </div>
        </div>

        {snippet && (
          <p className="text-sm text-stone-700 leading-relaxed">{snippet}</p>
        )}

        {entry.emotions.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {entry.emotions.map(e => (
              <EmotionBadge key={e.name} emotion={e} />
            ))}
          </div>
        )}
      </div>

      {showDetail && (
        <EntryDetailModal
          entry={entry}
          lang={lang}
          t={t}
          onClose={() => setShowDetail(false)}
        />
      )}
    </>
  )
}
