import type { Entry } from './types'
import type { Strings } from './i18n'

function escapeCSV(value: string): string {
  // RFC 4180: wrap in quotes if contains comma, quote, or newline
  if (/[",\r\n]/.test(value)) {
    return `"${value.replace(/"/g, '""')}"`
  }
  return value
}

export function exportCSV(entries: Entry[], t: Strings) {
  const headers = [
    t.csvDatetime,
    t.csvSituation,
    t.csvThoughts,
    t.csvEmotions,
    t.csvPhysical,
    t.csvBehaviors,
  ].map(escapeCSV).join(',')

  const rows = entries.map(e => {
    const emotionStr = e.emotions.map(em => `${em.name} ${em.score}/10`).join('; ')
    return [
      new Date(e.datetime).toLocaleString('th-TH'),
      e.situation,
      e.thoughts,
      emotionStr,
      e.physical,
      e.behaviors,
    ].map(escapeCSV).join(',')
  })

  // UTF-8 BOM so Excel/Sheets renders Thai correctly
  const bom = '﻿'
  const csv = bom + [headers, ...rows].join('\r\n')
  downloadText(csv, 'thought-record.csv', 'text/csv;charset=utf-8;')
}

export function exportJSON(entries: Entry[]) {
  const json = JSON.stringify({ version: 1, entries }, null, 2)
  downloadText(json, 'thought-record-backup.json', 'application/json')
}

export async function importJSON(file: File): Promise<Entry[]> {
  const text = await file.text()
  const parsed = JSON.parse(text)
  // Accept both { version, entries } and bare array
  const entries: Entry[] = Array.isArray(parsed) ? parsed : parsed.entries
  if (!Array.isArray(entries)) throw new Error('Invalid format')
  return entries
}

function downloadText(content: string, filename: string, mime: string) {
  const blob = new Blob([content], { type: mime })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}
