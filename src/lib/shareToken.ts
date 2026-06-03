import { supabase, rowToEntry } from './supabase'
import type { Entry } from '../types'

export interface ShareToken {
  token: string
  expires_at: string
}

export async function getMyToken(userId: string): Promise<ShareToken | null> {
  const { data } = await supabase
    .from('share_tokens')
    .select('token, expires_at')
    .eq('user_id', userId)
    .gt('expires_at', new Date().toISOString())
    .order('created_at', { ascending: false })
    .limit(1)
    .single()
  return data ?? null
}

export async function generateToken(userId: string): Promise<ShareToken> {
  // Revoke any existing tokens first
  await supabase.from('share_tokens').delete().eq('user_id', userId)

  const expiresAt = new Date()
  expiresAt.setDate(expiresAt.getDate() + 7)

  const { data, error } = await supabase
    .from('share_tokens')
    .insert({ user_id: userId, expires_at: expiresAt.toISOString() })
    .select('token, expires_at')
    .single()

  if (error || !data) throw new Error(error?.message ?? 'Failed to generate token')
  return data
}

export async function revokeToken(userId: string): Promise<void> {
  await supabase.from('share_tokens').delete().eq('user_id', userId)
}

export interface SharedData {
  entries: Entry[]
  expires_at: string
}

// Called without auth — uses the security-definer RPC
export async function fetchSharedEntries(token: string): Promise<SharedData | null> {
  const [entriesResult, infoResult] = await Promise.all([
    supabase.rpc('get_shared_entries', { p_token: token }),
    supabase.rpc('get_share_token_info', { p_token: token }),
  ])

  if (entriesResult.error || !infoResult.data?.length) return null

  return {
    entries: (entriesResult.data ?? []).map(rowToEntry),
    expires_at: infoResult.data[0].expires_at,
  }
}

export function buildShareUrl(token: string): string {
  return `${window.location.origin}${window.location.pathname}?share=${token}`
}
