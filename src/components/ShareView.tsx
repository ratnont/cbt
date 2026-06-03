import { useEffect, useState } from 'react'
import type { Entry } from '../types'
import type { Strings, Lang } from '../i18n'
import { fetchSharedEntries } from '../lib/shareToken'
import { EntryTable } from './EntryTable'
import { EmotionBadge } from './EmotionBadge'

interface Props {
  token: string
  lang: Lang
  t: Strings
}

function formatDate(iso: string, lang: Lang) {
  return new Date(iso).toLocaleDateString(lang === 'th' ? 'th-TH' : 'en-GB', {
    day: 'numeric', month: 'long', year: 'numeric',
  })
}

export function ShareView({ token, lang, t }: Props) {
  const [entries, setEntries] = useState<Entry[]>([])
  const [expiresAt, setExpiresAt] = useState('')
  const [status, setStatus] = useState<'loading' | 'ok' | 'invalid'>('loading')
  const [layout, setLayout] = useState<'cards' | 'table'>('table')

  useEffect(() => {
    fetchSharedEntries(token).then(data => {
      if (!data) { setStatus('invalid'); return }
      setEntries(data.entries.sort((a, b) => new Date(b.datetime).getTime() - new Date(a.datetime).getTime()))
      setExpiresAt(data.expires_at)
      setStatus('ok')
    })
  }, [token])

  if (status === 'loading') {
    return (
      <div className="min-h-svh bg-stone-50 flex items-center justify-center">
        <p className="text-stone-400 text-sm">{t.loading}</p>
      </div>
    )
  }

  if (status === 'invalid') {
    return (
      <div className="min-h-svh bg-stone-50 flex flex-col items-center justify-center gap-3 p-8 text-center">
        <p className="text-2xl">🔒</p>
        <p className="font-medium text-stone-700">{t.shareInvalid}</p>
      </div>
    )
  }

  return (
    <div className="min-h-svh bg-stone-50 flex flex-col">
      <header className="sticky top-0 z-30 bg-white border-b border-stone-100 px-4 py-3 shadow-sm">
        <div className="max-w-6xl mx-auto flex items-center justify-between gap-4">
          <div>
            <h1 className="text-base font-semibold text-stone-800">{t.shareViewTitle}</h1>
            <p className="text-xs text-stone-400">{t.shareViewExpires(formatDate(expiresAt, lang))}</p>
          </div>
          {/* Layout toggle */}
          <div className="flex rounded-lg border border-stone-200 overflow-hidden text-xs font-medium">
            <button
              onClick={() => setLayout('cards')}
              className={`px-3 py-1.5 transition-colors ${layout === 'cards' ? 'bg-teal-600 text-white' : 'bg-white text-stone-500 hover:bg-stone-50'}`}
            >
              {t.viewCards}
            </button>
            <button
              onClick={() => setLayout('table')}
              className={`px-3 py-1.5 transition-colors border-l border-stone-200 ${layout === 'table' ? 'bg-teal-600 text-white' : 'bg-white text-stone-500 hover:bg-stone-50'}`}
            >
              {t.viewTable}
            </button>
          </div>
        </div>
      </header>

      <main className={`flex-1 px-4 py-4 mx-auto w-full ${layout === 'table' ? 'max-w-6xl' : 'max-w-2xl'}`}>
        {entries.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-stone-400 text-sm">{t.shareEmpty}</p>
          </div>
        ) : layout === 'table' ? (
          <EntryTable
            entries={entries}
            lang={lang}
            t={t}
            onEdit={() => {}}
            onDelete={() => {}}
            readOnly
          />
        ) : (
          <div className="space-y-4">
            {entries.map(entry => (
              <div key={entry.id} className="bg-white rounded-2xl border border-stone-100 shadow-sm p-4 space-y-3">
                <p className="text-xs text-stone-400 font-medium">
                  {new Date(entry.datetime).toLocaleString(lang === 'th' ? 'th-TH' : 'en-GB', { dateStyle: 'medium', timeStyle: 'short' })}
                </p>
                {entry.situation && (
                  <div>
                    <p className="text-xs font-medium text-stone-500 mb-0.5">{t.situation}</p>
                    <p className="text-sm text-stone-700 leading-relaxed">{entry.situation}</p>
                  </div>
                )}
                {entry.thoughts && (
                  <div>
                    <p className="text-xs font-medium text-stone-500 mb-0.5">{t.thoughts}</p>
                    <p className="text-sm text-stone-700 leading-relaxed">{entry.thoughts}</p>
                  </div>
                )}
                {entry.emotions.length > 0 && (
                  <div>
                    <p className="text-xs font-medium text-stone-500 mb-1">{t.emotions}</p>
                    <div className="flex flex-wrap gap-1.5">
                      {entry.emotions.map(e => <EmotionBadge key={e.name} emotion={e} />)}
                    </div>
                  </div>
                )}
                {entry.physical && (
                  <div>
                    <p className="text-xs font-medium text-stone-500 mb-0.5">{t.physical}</p>
                    <p className="text-sm text-stone-700 leading-relaxed">{entry.physical}</p>
                  </div>
                )}
                {entry.behaviors && (
                  <div>
                    <p className="text-xs font-medium text-stone-500 mb-0.5">{t.behaviors}</p>
                    <p className="text-sm text-stone-700 leading-relaxed">{entry.behaviors}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
