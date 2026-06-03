import { useState } from 'react'
import type { Emotion } from '../types'
import type { Strings } from '../i18n'

interface Props {
  emotions: Emotion[]
  onChange: (emotions: Emotion[]) => void
  t: Strings
}

function intensityColor(score: number) {
  if (score <= 3) return 'bg-teal-100 text-teal-800 border-teal-200'
  if (score <= 6) return 'bg-amber-100 text-amber-800 border-amber-200'
  return 'bg-rose-100 text-rose-800 border-rose-200'
}

export function EmotionEditor({ emotions, onChange, t }: Props) {
  const [customName, setCustomName] = useState('')
  const [showCustom, setShowCustom] = useState(false)

  function addEmotion(name: string) {
    if (!name.trim()) return
    if (emotions.some(e => e.name === name.trim())) return
    onChange([...emotions, { name: name.trim(), score: 5 }])
    setCustomName('')
    setShowCustom(false)
  }

  function removeEmotion(name: string) {
    onChange(emotions.filter(e => e.name !== name))
  }

  function setScore(name: string, score: number) {
    onChange(emotions.map(e => e.name === name ? { ...e, score } : e))
  }

  const chipNames = t.emotionChips as readonly string[]

  return (
    <div className="space-y-3">
      {/* Quick-pick chips */}
      <div className="flex flex-wrap gap-2">
        {chipNames.map(chip => {
          const active = emotions.some(e => e.name === chip)
          return (
            <button
              key={chip}
              type="button"
              onClick={() => active ? removeEmotion(chip) : addEmotion(chip)}
              className={`px-3 py-1 rounded-full text-sm border transition-colors ${
                active
                  ? 'bg-teal-600 text-white border-teal-600'
                  : 'bg-white text-stone-600 border-stone-200 hover:border-teal-400'
              }`}
            >
              {chip}
            </button>
          )
        })}
        <button
          type="button"
          onClick={() => setShowCustom(v => !v)}
          className="px-3 py-1 rounded-full text-sm border border-dashed border-stone-300 text-stone-500 hover:border-teal-400 transition-colors"
        >
          {t.customEmotion}
        </button>
      </div>

      {/* Custom emotion input */}
      {showCustom && (
        <div className="flex gap-2">
          <input
            type="text"
            value={customName}
            onChange={e => setCustomName(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addEmotion(customName))}
            placeholder={t.emotionName}
            className="flex-1 rounded-lg border border-stone-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-400"
            autoFocus
          />
          <button
            type="button"
            onClick={() => addEmotion(customName)}
            className="px-4 py-2 rounded-lg bg-teal-600 text-white text-sm hover:bg-teal-700 transition-colors"
          >
            +
          </button>
        </div>
      )}

      {/* Per-emotion sliders */}
      {emotions.length > 0 && (
        <div className="space-y-2 pt-1">
          {emotions.map(e => (
            <div key={e.name} className="flex items-center gap-3">
              <span className={`shrink-0 px-2 py-0.5 rounded-full text-xs border font-medium ${intensityColor(e.score)}`}>
                {e.name}
              </span>
              <input
                type="range"
                min={0}
                max={10}
                value={e.score}
                onChange={ev => setScore(e.name, Number(ev.target.value))}
                className="flex-1"
              />
              <span className="shrink-0 w-10 text-center font-semibold text-sm text-stone-700">
                {e.score}/10
              </span>
              <button
                type="button"
                onClick={() => removeEmotion(e.name)}
                className="shrink-0 text-stone-300 hover:text-rose-400 transition-colors text-lg leading-none"
                aria-label={`Remove ${e.name}`}
              >
                ×
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
