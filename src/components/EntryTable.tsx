import type { Entry } from '../types'
import type { Strings, Lang } from '../i18n'

interface Props {
  entries: Entry[]
  lang: Lang
  onEdit: (entry: Entry) => void
  onDelete: (id: string) => void
  t: Strings
}

function formatDatetime(iso: string, lang: Lang) {
  return new Date(iso).toLocaleString(lang === 'th' ? 'th-TH' : 'en-GB', {
    dateStyle: 'short',
    timeStyle: 'short',
  })
}

// Split header text at newline for two-line display
function ColHeader({ text }: { text: string }) {
  const [main, sub] = text.split('\n')
  return (
    <div>
      <span className="font-semibold">{main}</span>
      {sub && <span className="block font-normal text-stone-400 mt-0.5">{sub}</span>}
    </div>
  )
}

export function EntryTable({ entries, lang, onEdit, onDelete, t }: Props) {
  return (
    <div className="overflow-x-auto rounded-2xl border border-stone-200 shadow-sm bg-white">
      <table className="w-full text-sm border-collapse min-w-[700px]">
        <thead>
          <tr className="bg-stone-50 border-b border-stone-200">
            <th className="px-3 py-3 text-left text-xs text-stone-600 font-medium border-r border-stone-200 w-24 align-top">
              <ColHeader text={t.colDatetime} />
            </th>
            <th className="px-3 py-3 text-left text-xs text-stone-600 font-medium border-r border-stone-200 align-top">
              <ColHeader text={t.colSituation} />
            </th>
            <th className="px-3 py-3 text-left text-xs text-stone-600 font-medium border-r border-stone-200 align-top">
              <ColHeader text={t.colThoughts} />
            </th>
            <th className="px-3 py-3 text-left text-xs text-stone-600 font-medium border-r border-stone-200 w-40 align-top">
              <ColHeader text={t.colEmotions} />
            </th>
            <th className="px-3 py-3 text-left text-xs text-stone-600 font-medium border-r border-stone-200 align-top">
              <ColHeader text={t.colPhysical} />
            </th>
            <th className="px-3 py-3 text-left text-xs text-stone-600 font-medium border-r border-stone-200 align-top">
              <ColHeader text={t.colBehaviors} />
            </th>
            {/* Actions column — no header text */}
            <th className="px-2 py-3 w-16" />
          </tr>
        </thead>
        <tbody>
          {entries.map((entry, i) => (
            <tr
              key={entry.id}
              className={`border-b border-stone-100 align-top hover:bg-stone-50 transition-colors ${i % 2 === 1 ? 'bg-stone-50/40' : ''}`}
            >
              <td className="px-3 py-3 border-r border-stone-100 text-xs text-stone-500 whitespace-nowrap">
                {formatDatetime(entry.datetime, lang)}
              </td>
              <td className="px-3 py-3 border-r border-stone-100 text-stone-700 leading-relaxed">
                {entry.situation || <span className="text-stone-300">—</span>}
              </td>
              <td className="px-3 py-3 border-r border-stone-100 text-stone-700 leading-relaxed">
                {entry.thoughts || <span className="text-stone-300">—</span>}
              </td>
              <td className="px-3 py-3 border-r border-stone-100">
                {entry.emotions.length > 0 ? (
                  <ul className="space-y-1">
                    {entry.emotions.map(e => (
                      <li key={e.name} className="text-stone-700">
                        {e.name} <span className="text-stone-400">{e.score}/10</span>
                      </li>
                    ))}
                  </ul>
                ) : <span className="text-stone-300">—</span>}
              </td>
              <td className="px-3 py-3 border-r border-stone-100 text-stone-700 leading-relaxed">
                {entry.physical || <span className="text-stone-300">—</span>}
              </td>
              <td className="px-3 py-3 border-r border-stone-100 text-stone-700 leading-relaxed">
                {entry.behaviors || <span className="text-stone-300">—</span>}
              </td>
              <td className="px-2 py-3 whitespace-nowrap">
                <div className="flex flex-col gap-1">
                  <button
                    onClick={() => onEdit(entry)}
                    className="text-xs text-teal-600 hover:text-teal-700 font-medium px-1.5 py-1 rounded hover:bg-teal-50 transition-colors"
                  >
                    ✏️
                  </button>
                  <button
                    onClick={() => onDelete(entry.id)}
                    className="text-xs text-stone-300 hover:text-rose-500 font-medium px-1.5 py-1 rounded hover:bg-rose-50 transition-colors"
                  >
                    🗑
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
