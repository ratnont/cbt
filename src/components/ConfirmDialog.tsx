import type { Strings } from '../i18n'

interface Props {
  title: string
  message: string
  onConfirm: () => void
  onCancel: () => void
  t: Strings
}

export function ConfirmDialog({ title, message, onConfirm, onCancel, t }: Props) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-xl max-w-sm w-full p-6 space-y-4">
        <h2 className="text-base font-semibold text-stone-800">{title}</h2>
        <p className="text-sm text-stone-500">{message}</p>
        <div className="flex gap-3 pt-1">
          <button
            onClick={onConfirm}
            className="flex-1 py-2.5 rounded-xl bg-rose-500 text-white text-sm font-medium hover:bg-rose-600 transition-colors"
          >
            {t.yes}
          </button>
          <button
            onClick={onCancel}
            className="flex-1 py-2.5 rounded-xl bg-stone-100 text-stone-600 text-sm font-medium hover:bg-stone-200 transition-colors"
          >
            {t.no}
          </button>
        </div>
      </div>
    </div>
  )
}
