import { createClient } from '@supabase/supabase-js'
import type { Entry } from '../types'

const url = import.meta.env.VITE_SUPABASE_URL as string
const key = import.meta.env.VITE_SUPABASE_ANON_KEY as string

export const supabase = createClient(url, key)

// Row shape in the database (snake_case, user_id added)
export interface EntryRow {
  id: string
  user_id: string
  created_at: string
  updated_at: string
  datetime: string
  situation: string
  thoughts: string
  emotions: Entry['emotions']
  physical: string
  behaviors: string
}

export function rowToEntry(row: EntryRow): Entry {
  return {
    id: row.id,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    datetime: row.datetime,
    situation: row.situation,
    thoughts: row.thoughts,
    emotions: row.emotions,
    physical: row.physical,
    behaviors: row.behaviors,
  }
}

export function entryToRow(entry: Entry, userId: string): EntryRow {
  return {
    id: entry.id,
    user_id: userId,
    created_at: entry.createdAt,
    updated_at: entry.updatedAt,
    datetime: entry.datetime,
    situation: entry.situation,
    thoughts: entry.thoughts,
    emotions: entry.emotions,
    physical: entry.physical,
    behaviors: entry.behaviors,
  }
}
