import { useEffect, useState } from 'react'
import type { Strings } from '../i18n'
import { getMyToken, generateToken, revokeToken, buildShareUrl, type ShareToken } from '../lib/shareToken'

interface Props {
  userId: string
  t: Strings
}

export function SharePanel({ userId, t }: Props) {
  const [token, setToken] = useState<ShareToken | null>(null)
  const [loading, setLoading] = useState(true)
  const [working, setWorking] = useState(false)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    getMyToken(userId).then(tok => { setToken(tok); setLoading(false) })
  }, [userId])

  async function handleGenerate() {
    setWorking(true)
    try {
      const tok = await generateToken(userId)
      setToken(tok)
    } finally { setWorking(false) }
  }

  async function handleRevoke() {
    if (!window.confirm(t.shareRevokeConfirm)) return
    setWorking(true)
    try {
      await revokeToken(userId)
      setToken(null)
    } finally { setWorking(false) }
  }

  async function handleCopy() {
    if (!token) return
    await navigator.clipboard.writeText(buildShareUrl(token.token))
    setCopied(true)
    setTimeout(() => setCopied(false), 2500)
  }

  function formatExpiry(iso: string) {
    return new Date(iso).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' })
  }

  if (loading) return <p className="text-xs text-stone-400">{t.loading}</p>

  return (
    <div className="space-y-3">
      <div>
        <p className="text-sm font-medium text-stone-700">{t.shareTitle}</p>
        <p className="text-xs text-stone-400 mt-0.5">{t.shareDesc}</p>
      </div>

      {token ? (
        <div className="space-y-2">
          {/* Link display */}
          <div className="flex gap-2 items-center">
            <input
              readOnly
              value={buildShareUrl(token.token)}
              className="flex-1 rounded-lg border border-stone-200 px-3 py-2 text-xs text-stone-500 bg-stone-50 focus:outline-none truncate"
            />
            <button
              onClick={handleCopy}
              className={`shrink-0 px-3 py-2 rounded-lg text-xs font-medium transition-colors ${copied ? 'bg-teal-600 text-white' : 'bg-stone-100 text-stone-600 hover:bg-stone-200'}`}
            >
              {copied ? t.shareCopied : t.shareCopy}
            </button>
          </div>

          {/* Expiry + revoke */}
          <div className="flex items-center justify-between">
            <p className="text-xs text-stone-400">{t.shareExpires(formatExpiry(token.expires_at))}</p>
            <button
              onClick={handleRevoke}
              disabled={working}
              className="text-xs text-rose-400 hover:text-rose-600 font-medium disabled:opacity-50"
            >
              {t.shareRevoke}
            </button>
          </div>

          <p className="text-xs text-amber-600 bg-amber-50 rounded-lg px-3 py-2">{t.shareWarning}</p>
        </div>
      ) : (
        <button
          onClick={handleGenerate}
          disabled={working}
          className="w-full py-2.5 rounded-xl border border-teal-200 bg-teal-50 text-teal-700 text-sm font-medium hover:bg-teal-100 transition-colors disabled:opacity-50"
        >
          {working ? t.loading : t.shareGenerate}
        </button>
      )}
    </div>
  )
}
