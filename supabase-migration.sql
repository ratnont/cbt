-- Run this in the Supabase SQL editor (Database → SQL Editor → New query)

create table if not exists entries (
  id          uuid primary key,
  user_id     uuid references auth.users not null,
  created_at  timestamptz not null,
  updated_at  timestamptz not null,
  datetime    timestamptz not null,
  situation   text not null default '',
  thoughts    text not null default '',
  emotions    jsonb not null default '[]',
  physical    text not null default '',
  behaviors   text not null default ''
);

-- Index for fast per-user queries
create index if not exists entries_user_id_datetime
  on entries (user_id, datetime desc);

-- Row-level security: users see only their own entries
alter table entries enable row level security;

create policy "Users manage their own entries"
  on entries for all
  using  (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- Enable Realtime for live sync across devices
alter publication supabase_realtime add table entries;
