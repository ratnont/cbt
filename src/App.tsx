import { useCallback, useEffect, useRef, useState } from 'react'
import type { User } from '@supabase/supabase-js'
import type { Entry } from './types'
import { supabase, rowToEntry, entryToRow } from './lib/supabase'
import { useLocalStorage } from './hooks/useLocalStorage'
import { strings, type Lang } from './i18n'
import { LoginScreen } from './components/LoginScreen'
import { EntryCard } from './components/EntryCard'
import { EntryTable } from './components/EntryTable'
import { EntryForm } from './components/EntryForm'
import { ConfirmDialog } from './components/ConfirmDialog'
import { exportCSV, exportJSON, importJSON } from './export'

type View = 'list' | 'form' | 'settings'

export function App() {
  // UI prefs — still in localStorage (device-level)
  const [lang, setLang] = useLocalStorage<Lang>('cbt-lang', 'th')
  const [listLayout, setListLayout] = useLocalStorage<'cards' | 'table'>('cbt-layout', 'cards')
  const [sheetsUrl, setSheetsUrl] = useLocalStorage('cbt-sheets-url', '')

  // Auth + data
  const [user, setUser] = useState<User | null>(null)
  const [authReady, setAuthReady] = useState(false)
  const [entries, setEntries] = useState<Entry[]>([])
  const [loadingEntries, setLoadingEntries] = useState(false)
  const [syncError, setSyncError] = useState('')

  // Migration offer
  const [migrateOffer, setMigrateOffer] = useState(false)

  // UI state
  const [view, setView] = useState<View>('list')
  const [editing, setEditing] = useState<Entry | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [filterEmotion, setFilterEmotion] = useState('')
  const [filterFrom, setFilterFrom] = useState('')
  const [filterTo, setFilterTo] = useState('')
  const [exportMenuOpen, setExportMenuOpen] = useState(false)
  const [pushStatus, setPushStatus] = useState<'idle' | 'sent'>('idle')
  const [settingsUrl, setSettingsUrl] = useState(sheetsUrl)
  const [importError, setImportError] = useState('')
  const fileInputRef = useRef<HTMLInputElement>(null)

  const t = strings[lang]

  // --- Auth listener ---
  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setUser(data.session?.user ?? null)
      setAuthReady(true)
    })
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
    })
    return () => subscription.unsubscribe()
  }, [])

  // --- Load entries + realtime when user logs in ---
  const fetchEntries = useCallback(async (userId: string) => {
    setLoadingEntries(true)
    const { data, error } = await supabase
      .from('entries')
      .select('*')
      .eq('user_id', userId)
      .order('datetime', { ascending: false })
    if (error) {
      setSyncError(t.syncError)
    } else {
      setEntries((data ?? []).map(rowToEntry))
      // Offer migration if localStorage has entries and Supabase is empty
      const local = localStorage.getItem('cbt-entries')
      if (local) {
        try {
          const parsed: Entry[] = JSON.parse(local)
          if (parsed.length > 0 && (data ?? []).length === 0) {
            setMigrateOffer(true)
          }
        } catch { /* ignore */ }
      }
    }
    setLoadingEntries(false)
  }, [t.syncError])

  useEffect(() => {
    if (!user) { setEntries([]); return }
    fetchEntries(user.id)

    const channel = supabase
      .channel('entries-sync')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'entries', filter: `user_id=eq.${user.id}` },
        payload => {
          if (payload.eventType === 'INSERT' || payload.eventType === 'UPDATE') {
            const entry = rowToEntry(payload.new as Parameters<typeof rowToEntry>[0])
            setEntries(prev => {
              const idx = prev.findIndex(e => e.id === entry.id)
              if (idx >= 0) { const next = [...prev]; next[idx] = entry; return next }
              return [entry, ...prev]
            })
          }
          if (payload.eventType === 'DELETE') {
            setEntries(prev => prev.filter(e => e.id !== payload.old.id))
          }
        })
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [user, fetchEntries])

  // --- Migration ---
  async function handleMigrate(accept: boolean) {
    setMigrateOffer(false)
    if (!accept || !user) return
    try {
      const local: Entry[] = JSON.parse(localStorage.getItem('cbt-entries') ?? '[]')
      const rows = local.map(e => entryToRow(e, user.id))
      await supabase.from('entries').upsert(rows)
      localStorage.removeItem('cbt-entries')
      await fetchEntries(user.id)
    } catch { setSyncError(t.syncError) }
  }

  // --- Filtered list ---
  const filtered = entries
    .slice()
    .sort((a, b) => new Date(b.datetime).getTime() - new Date(a.datetime).getTime())
    .filter(e => {
      if (search) {
        const q = search.toLowerCase()
        if (
          !e.situation.toLowerCase().includes(q) &&
          !e.thoughts.toLowerCase().includes(q) &&
          !e.behaviors.toLowerCase().includes(q) &&
          !e.emotions.some(em => em.name.toLowerCase().includes(q))
        ) return false
      }
      if (filterEmotion && !e.emotions.some(em => em.name.toLowerCase().includes(filterEmotion.toLowerCase()))) return false
      if (filterFrom && new Date(e.datetime) < new Date(filterFrom)) return false
      if (filterTo) {
        const to = new Date(filterTo); to.setHours(23, 59, 59, 999)
        if (new Date(e.datetime) > to) return false
      }
      return true
    })

  const hasFilter = search || filterEmotion || filterFrom || filterTo

  // --- CRUD ---
  async function saveEntry(entry: Entry) {
    if (!user) return
    // Optimistic update
    setEntries(prev => {
      const idx = prev.findIndex(e => e.id === entry.id)
      if (idx >= 0) { const next = [...prev]; next[idx] = entry; return next }
      return [entry, ...prev]
    })
    setEditing(null)
    setView('list')
    const { error } = await supabase.from('entries').upsert(entryToRow(entry, user.id))
    if (error) setSyncError(t.syncError)
  }

  async function deleteEntry(id: string) {
    setEntries(prev => prev.filter(e => e.id !== id))
    setDeletingId(null)
    const { error } = await supabase.from('entries').delete().eq('id', id)
    if (error) setSyncError(t.syncError)
  }

  async function handleImport(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file || !user) return
    try {
      const imported = await importJSON(file)
      if (window.confirm(t.importJSONConfirm)) {
        const rows = imported.map(entry => entryToRow(entry, user.id))
        await supabase.from('entries').upsert(rows)
        await fetchEntries(user.id)
        alert(t.importSuccess)
      }
    } catch { setImportError(t.importError) }
    finally { e.target.value = '' }
  }

  function pushToSheets() {
    if (!sheetsUrl) return
    fetch(sheetsUrl, { method: 'POST', body: JSON.stringify(entries), headers: { 'Content-Type': 'text/plain;charset=utf-8' } }).catch(() => {})
    setPushStatus('sent')
    setTimeout(() => setPushStatus('idle'), 5000)
  }

  async function signOut() {
    await supabase.auth.signOut()
    setView('list')
  }

  // --- Auth gate ---
  if (!authReady) {
    return (
      <div className="min-h-svh bg-stone-50 flex items-center justify-center">
        <p className="text-stone-400 text-sm">{t.loading}</p>
      </div>
    )
  }

  if (!user) {
    return <LoginScreen t={t} />
  }

  // ---- Main app ----
  return (
    <div className="min-h-svh bg-stone-50 flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-30 bg-white border-b border-stone-100 px-4 py-3 flex items-center justify-between shadow-sm">
        <div>
          <h1 className="text-base font-semibold text-stone-800 leading-tight">{t.appTitle}</h1>
          <p className="text-xs text-stone-400 truncate max-w-[140px]">{user.email}</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setLang(lang === 'th' ? 'en' : 'th')}
            className="text-xs px-2.5 py-1.5 rounded-lg border border-stone-200 text-stone-500 hover:border-teal-400 hover:text-teal-600 transition-colors font-medium"
          >
            {lang === 'th' ? 'EN' : 'ไทย'}
          </button>
          <button
            onClick={() => { setView(view === 'settings' ? 'list' : 'settings'); setExportMenuOpen(false) }}
            className={`text-xs px-2.5 py-1.5 rounded-lg border transition-colors font-medium ${view === 'settings' ? 'border-teal-400 text-teal-600 bg-teal-50' : 'border-stone-200 text-stone-500 hover:border-teal-400 hover:text-teal-600'}`}
          >
            {t.settings}
          </button>
          <div className="relative">
            <button
              onClick={() => { setExportMenuOpen(v => !v); setView('list') }}
              className="text-xs px-2.5 py-1.5 rounded-lg border border-stone-200 text-stone-500 hover:border-teal-400 hover:text-teal-600 transition-colors font-medium"
            >
              {t.export}
            </button>
            {exportMenuOpen && (
              <div className="absolute right-0 top-full mt-1 bg-white border border-stone-100 rounded-xl shadow-lg p-2 min-w-[220px] z-40 space-y-1">
                <button onClick={() => { exportCSV(entries, t); setExportMenuOpen(false) }} className="w-full text-left px-3 py-2 rounded-lg text-sm text-stone-700 hover:bg-stone-50 transition-colors">{t.exportCSV}</button>
                <p className="px-3 text-xs text-stone-400 pb-1">{t.exportCSVHint}</p>
                <button onClick={() => { exportJSON(entries); setExportMenuOpen(false) }} className="w-full text-left px-3 py-2 rounded-lg text-sm text-stone-700 hover:bg-stone-50 transition-colors">{t.downloadJSON}</button>
                <button onClick={() => { fileInputRef.current?.click(); setExportMenuOpen(false) }} className="w-full text-left px-3 py-2 rounded-lg text-sm text-stone-700 hover:bg-stone-50 transition-colors">{t.importJSON}</button>
                {sheetsUrl && (
                  <>
                    <div className="border-t border-stone-100 my-1" />
                    <button onClick={() => { pushToSheets(); setExportMenuOpen(false) }} className="w-full text-left px-3 py-2 rounded-lg text-sm text-teal-700 hover:bg-teal-50 transition-colors">{t.pushToSheets}</button>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      </header>

      <input ref={fileInputRef} type="file" accept=".json" className="hidden" onChange={handleImport} />

      {/* Toasts */}
      {pushStatus === 'sent' && (
        <div className="fixed bottom-24 inset-x-4 z-50 bg-teal-600 text-white text-sm rounded-xl px-4 py-3 shadow-lg text-center">
          <p>{t.pushSuccess}</p>
          <p className="text-teal-200 text-xs mt-0.5">{t.pushNote}</p>
        </div>
      )}
      {(importError || syncError) && (
        <div className="fixed bottom-24 inset-x-4 z-50 bg-rose-500 text-white text-sm rounded-xl px-4 py-3 shadow-lg flex justify-between items-center">
          <span>{importError || syncError}</span>
          <button onClick={() => { setImportError(''); setSyncError('') }} className="ml-3 text-rose-200">✕</button>
        </div>
      )}
      {exportMenuOpen && <div className="fixed inset-0 z-20" onClick={() => setExportMenuOpen(false)} />}

      {/* Migration offer */}
      {migrateOffer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl max-w-sm w-full p-6 space-y-4">
            <p className="text-sm text-stone-700">{t.migratePrompt}</p>
            <div className="flex gap-3">
              <button onClick={() => handleMigrate(true)} className="flex-1 py-2.5 rounded-xl bg-teal-600 text-white text-sm font-medium hover:bg-teal-700 transition-colors">{t.migrateYes}</button>
              <button onClick={() => handleMigrate(false)} className="flex-1 py-2.5 rounded-xl bg-stone-100 text-stone-600 text-sm font-medium hover:bg-stone-200 transition-colors">{t.migrateNo}</button>
            </div>
          </div>
        </div>
      )}

      {/* Main content */}
      <main className={`flex-1 px-4 py-4 mx-auto w-full ${view === 'list' && listLayout === 'table' ? 'max-w-6xl' : 'max-w-2xl'}`}>

        {/* Settings */}
        {view === 'settings' && (
          <div className="bg-white rounded-2xl border border-stone-100 shadow-sm p-5 space-y-4">
            <h2 className="font-semibold text-stone-800">{t.settings}</h2>
            <div>
              <label className="block text-sm font-medium text-stone-600 mb-1">{t.sheetsUrl}</label>
              <p className="text-xs text-stone-400 mb-2">{t.sheetsUrlHint}</p>
              <input type="url" value={settingsUrl} onChange={e => setSettingsUrl(e.target.value)} placeholder="https://script.google.com/macros/s/..." className="w-full rounded-lg border border-stone-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-400" />
            </div>
            <button onClick={() => { setSheetsUrl(settingsUrl); setView('list') }} className="w-full py-2.5 rounded-xl bg-teal-600 text-white text-sm font-medium hover:bg-teal-700 transition-colors">{t.save_settings}</button>
            <div className="border-t border-stone-100 pt-3">
              <button onClick={signOut} className="w-full py-2.5 rounded-xl bg-stone-100 text-stone-600 text-sm font-medium hover:bg-stone-200 transition-colors">{t.signOut}</button>
            </div>
          </div>
        )}

        {/* Entry form */}
        {view === 'form' && (
          <div className="bg-white rounded-2xl border border-stone-100 shadow-sm p-5">
            <h2 className="font-semibold text-stone-800 mb-4">{editing ? t.editEntry : t.addEntry}</h2>
            <EntryForm initial={editing ?? undefined} onSave={saveEntry} onCancel={() => { setView('list'); setEditing(null) }} t={t} />
          </div>
        )}

        {/* List view */}
        {view === 'list' && (
          <div className="space-y-4">
            <div className="space-y-2">
              <input type="search" value={search} onChange={e => setSearch(e.target.value)} placeholder={t.search} className="w-full rounded-xl border border-stone-200 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-teal-400 bg-white" />
              <div className="flex gap-2">
                <input type="date" value={filterFrom} onChange={e => setFilterFrom(e.target.value)} className="flex-1 rounded-xl border border-stone-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-400 bg-white text-stone-500" />
                <input type="date" value={filterTo} onChange={e => setFilterTo(e.target.value)} className="flex-1 rounded-xl border border-stone-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-400 bg-white text-stone-500" />
              </div>
              <div className="flex gap-2 items-center">
                <input type="search" value={filterEmotion} onChange={e => setFilterEmotion(e.target.value)} placeholder={t.filterEmotion} className="flex-1 rounded-xl border border-stone-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-400 bg-white" />
                {hasFilter && (
                  <button onClick={() => { setSearch(''); setFilterEmotion(''); setFilterFrom(''); setFilterTo('') }} className="text-xs text-teal-600 hover:text-teal-700 whitespace-nowrap px-2 py-2">{t.clearFilter}</button>
                )}
              </div>
            </div>

            {loadingEntries ? (
              <p className="text-center text-sm text-stone-400 py-12">{t.loading}</p>
            ) : (
              <>
                {entries.length > 0 && (
                  <div className="flex items-center justify-between">
                    <p className="text-xs text-stone-400">{t.entriesCount(filtered.length)}</p>
                    <div className="flex rounded-lg border border-stone-200 overflow-hidden text-xs font-medium">
                      <button onClick={() => setListLayout('cards')} className={`px-3 py-1.5 transition-colors ${listLayout === 'cards' ? 'bg-teal-600 text-white' : 'bg-white text-stone-500 hover:bg-stone-50'}`}>{t.viewCards}</button>
                      <button onClick={() => setListLayout('table')} className={`px-3 py-1.5 transition-colors border-l border-stone-200 ${listLayout === 'table' ? 'bg-teal-600 text-white' : 'bg-white text-stone-500 hover:bg-stone-50'}`}>{t.viewTable}</button>
                    </div>
                  </div>
                )}

                {entries.length === 0 && (
                  <div className="text-center py-16 space-y-3">
                    <p className="text-2xl">📓</p>
                    <p className="font-medium text-stone-600">{t.noEntries}</p>
                    <p className="text-sm text-stone-400">{t.noEntriesMsg}</p>
                  </div>
                )}

                {entries.length > 0 && filtered.length === 0 && (
                  <div className="text-center py-12 space-y-2">
                    <p className="text-2xl">🔍</p>
                    <p className="font-medium text-stone-600">{t.noResults}</p>
                    <p className="text-sm text-stone-400">{t.noResultsMsg}</p>
                  </div>
                )}

                {listLayout === 'cards' && filtered.map(entry => (
                  <EntryCard key={entry.id} entry={entry} lang={lang} t={t}
                    onEdit={() => { setEditing(entry); setView('form') }}
                    onDelete={() => setDeletingId(entry.id)} />
                ))}

                {listLayout === 'table' && filtered.length > 0 && (
                  <EntryTable entries={filtered} lang={lang} t={t}
                    onEdit={entry => { setEditing(entry); setView('form') }}
                    onDelete={id => setDeletingId(id)} />
                )}
              </>
            )}
          </div>
        )}
      </main>

      {view === 'list' && (
        <div className="sticky bottom-0 p-4 bg-gradient-to-t from-stone-50 to-transparent pointer-events-none">
          <div className="max-w-2xl mx-auto pointer-events-auto">
            <button onClick={() => { setEditing(null); setView('form') }} className="w-full py-4 rounded-2xl bg-teal-600 text-white font-semibold text-base shadow-lg hover:bg-teal-700 active:scale-95 transition-all">
              + {t.addEntry}
            </button>
          </div>
        </div>
      )}

      {deletingId && (
        <ConfirmDialog title={t.confirmDelete} message={t.confirmDeleteMsg}
          onConfirm={() => deleteEntry(deletingId)} onCancel={() => setDeletingId(null)} t={t} />
      )}
    </div>
  )
}

export default App
