# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Behavioral guidelines (Karpathy)

Before coding: state assumptions, surface tradeoffs, ask when unclear. Minimum code that solves the problem — no speculative features. Touch only what the task requires; every changed line should trace directly to the user's request.

## Commands

```bash
npm run dev      # local dev server (port 5174 — 5173 is taken by another project)
npm run build    # TypeScript check + Vite production build → dist/
npm run lint     # ESLint
```

No test suite exists yet. Build (`npm run build`) is the primary type-correctness check.

## Environment

Copy `.env.example` → `.env.local` and fill in:
- `VITE_SUPABASE_URL` — Supabase project URL
- `VITE_SUPABASE_ANON_KEY` — Supabase publishable key (starts with `sb_publishable_`)

GitHub Actions reads these from repo secrets (`VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`). The build also receives `BASE_URL=/cbt/` for GitHub Pages asset paths — omit this for Cloudflare/Netlify/Vercel.

## Architecture

### Data flow

`App.tsx` is the single root component — no router. Navigation is a `view` state: `'list' | 'form' | 'settings'`. The app renders in three distinct modes determined at startup:

1. **`?share=<token>`** in URL → renders `<ShareView>` immediately, no auth required
2. **No user session** → renders `<LoginScreen>` (Google OAuth via Supabase)
3. **Authenticated** → main app (list/form/settings)

### Persistence split

| What | Where |
|---|---|
| Thought record entries | Supabase Postgres (`entries` table) |
| UI preferences (lang, layout, sheets URL) | `localStorage` via `useLocalStorage` hook |

Entries are fetched from Supabase on login and kept in React state. A Supabase Realtime channel (`entries-sync`) subscribes to `postgres_changes` for the current user's rows, so changes sync across devices/tabs without polling.

CRUD operations do an optimistic state update first, then `supabase.from('entries').upsert/delete`. `rowToEntry` / `entryToRow` (in `src/lib/supabase.ts`) handle the camelCase ↔ snake_case and `user_id` mapping.

### i18n

All UI strings live in `src/i18n.ts` as a `strings` object with `th` and `en` keys. The active language is read from `strings[lang]` where `lang` comes from `useLocalStorage`. When adding strings, add to **both** `th` and `en` — the TypeScript `Strings` type is a union of both shapes, so the compiler will catch missing keys.

### Share link

`share_tokens` table in Supabase holds `(token uuid, user_id, expires_at)` with a 7-day TTL. The anon (unauthenticated) role can call two `security definer` Postgres functions — `get_shared_entries(token)` and `get_share_token_info(token)` — via Supabase RPC. This allows the therapist to open the share URL with no account. `src/lib/shareToken.ts` wraps generate/revoke/fetch. `SharePanel` (shown in Settings) manages the token UI; `ShareView` is the read-only therapist view.

### Export

`src/export.ts` handles CSV (UTF-8 BOM, RFC 4180 escaping) and JSON backup/restore. The optional Google Sheets push is a fire-and-forget `fetch` POST to a user-supplied Apps Script URL stored in localStorage.

## Database migrations

Two SQL files must be run in order in the Supabase SQL Editor:

1. `supabase-migration.sql` — `entries` table, RLS policy, Realtime publication
2. `share-migration.sql` — `share_tokens` table, RLS policy, two RPC functions with `grant execute … to anon`

## Deployment

Every push to `main` auto-deploys via GitHub Actions to [https://ratnont.github.io/cbt/](https://ratnont.github.io/cbt/). The workflow is in `.github/workflows/deploy.yml`. No manual deploy step needed.
