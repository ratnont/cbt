import { useState } from 'react'
import { v4 as uuidv4 } from 'uuid'
import type { Entry, Emotion } from '../types'
import type { Strings } from '../i18n'
import { EmotionEditor } from './EmotionEditor'

interface Props {
  initial?: Entry
  onSave: (entry: Entry) => void
  onCancel: () => void
  t: Strings
}

function localISOString(date = new Date()) {
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`
}

export function EntryForm({ initial, onSave, onCancel, t }: Props) {
  const [datetime, setDatetime] = useState(
    initial ? localISOString(new Date(initial.datetime)) : localISOString()
  )
  const [situation, setSituation] = useState(initial?.situation ?? '')
  const [thoughts, setThoughts] = useState(initial?.thoughts ?? '')
  const [emotions, setEmotions] = useState<Emotion[]>(initial?.emotions ?? [])
  const [physical, setPhysical] = useState(initial?.physical ?? '')
  const [behaviors, setBehaviors] = useState(initial?.behaviors ?? '')

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const now = new Date().toISOString()
    onSave({
      id: initial?.id ?? uuidv4(),
      createdAt: initial?.createdAt ?? now,
      updatedAt: now,
      datetime: new Date(datetime).toISOString(),
      situation,
      thoughts,
      emotions,
      physical,
      behaviors,
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Datetime */}
      <div>
        <label className="block text-sm font-medium text-stone-600 mb-1">{t.datetime}</label>
        <input
          type="datetime-local"
          value={datetime}
          onChange={e => setDatetime(e.target.value)}
          className="w-full rounded-lg border border-stone-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-400 bg-white"
        />
      </div>

      {/* Situation */}
      <div>
        <label className="block text-sm font-medium text-stone-600 mb-1">{t.situation}</label>
        <p className="text-xs text-stone-400 mb-1">{t.situationHint}</p>
        <textarea
          value={situation}
          onChange={e => setSituation(e.target.value)}
          rows={3}
          className="w-full rounded-lg border border-stone-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-400 resize-none"
        />
      </div>

      {/* Thoughts */}
      <div>
        <label className="block text-sm font-medium text-stone-600 mb-1">{t.thoughts}</label>
        <p className="text-xs text-stone-400 mb-1">{t.thoughtsHint}</p>
        <textarea
          value={thoughts}
          onChange={e => setThoughts(e.target.value)}
          rows={3}
          className="w-full rounded-lg border border-stone-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-400 resize-none"
        />
      </div>

      {/* Emotions */}
      <div>
        <label className="block text-sm font-medium text-stone-600 mb-1">{t.emotions}</label>
        <p className="text-xs text-stone-400 mb-2">{t.emotionsHint}</p>
        <EmotionEditor emotions={emotions} onChange={setEmotions} t={t} />
      </div>

      {/* Physical */}
      <div>
        <label className="block text-sm font-medium text-stone-600 mb-1">{t.physical}</label>
        <p className="text-xs text-stone-400 mb-1">{t.physicalHint}</p>
        <textarea
          value={physical}
          onChange={e => setPhysical(e.target.value)}
          rows={2}
          className="w-full rounded-lg border border-stone-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-400 resize-none"
        />
      </div>

      {/* Behaviors */}
      <div>
        <label className="block text-sm font-medium text-stone-600 mb-1">{t.behaviors}</label>
        <p className="text-xs text-stone-400 mb-1">{t.behaviorsHint}</p>
        <textarea
          value={behaviors}
          onChange={e => setBehaviors(e.target.value)}
          rows={2}
          className="w-full rounded-lg border border-stone-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-400 resize-none"
        />
      </div>

      {/* Actions */}
      <div className="flex gap-3 pt-2">
        <button
          type="submit"
          className="flex-1 py-3 rounded-xl bg-teal-600 text-white font-medium hover:bg-teal-700 transition-colors"
        >
          {t.save}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 py-3 rounded-xl bg-stone-100 text-stone-600 font-medium hover:bg-stone-200 transition-colors"
        >
          {t.cancel}
        </button>
      </div>
    </form>
  )
}
