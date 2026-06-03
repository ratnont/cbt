import { useState } from 'react'
import { supabase } from '../lib/supabase'
import type { Strings } from '../i18n'

interface Props {
  t: Strings
}

export function LoginScreen({ t }: Props) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function signInWithGoogle() {
    setLoading(true)
    setError('')
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: window.location.origin + window.location.pathname,
      },
    })
    if (error) {
      setError(error.message)
      setLoading(false)
    }
    // On success the browser redirects — no further action needed here
  }

  return (
    <div className="min-h-svh bg-stone-50 flex flex-col">
      <header className="px-4 py-3 bg-white border-b border-stone-100 shadow-sm">
        <h1 className="text-base font-semibold text-stone-800">{t.appTitle}</h1>
        <p className="text-xs text-stone-400">{t.appSubtitle}</p>
      </header>

      <main className="flex-1 flex items-center justify-center p-8">
        <div className="bg-white rounded-2xl border border-stone-100 shadow-sm p-8 max-w-sm w-full space-y-6 text-center">
          <div className="space-y-2">
            <p className="text-3xl">📓</p>
            <h2 className="font-semibold text-stone-800 text-lg">{t.appTitle}</h2>
            <p className="text-sm text-stone-500">{t.loginPrompt}</p>
          </div>

          <button
            onClick={signInWithGoogle}
            disabled={loading}
            className="w-full flex items-center justify-center gap-3 py-3 px-4 rounded-xl border border-stone-200 bg-white hover:bg-stone-50 transition-colors font-medium text-stone-700 disabled:opacity-60 disabled:cursor-not-allowed shadow-sm"
          >
            {/* Google logo SVG */}
            <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true">
              <path fill="#4285F4" d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615Z"/>
              <path fill="#34A853" d="M9 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18Z"/>
              <path fill="#FBBC05" d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332Z"/>
              <path fill="#EA4335" d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.958L3.964 6.29C4.672 4.163 6.656 3.58 9 3.58Z"/>
            </svg>
            {loading ? t.signingIn : t.signInWithGoogle}
          </button>

          {error && (
            <p className="text-xs text-rose-500">{error}</p>
          )}

          <p className="text-xs text-stone-400">{t.loginPrivacy}</p>
        </div>
      </main>
    </div>
  )
}
