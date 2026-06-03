-- Run this in Supabase SQL Editor after supabase-migration.sql

-- Share tokens table
create table if not exists share_tokens (
  token      uuid primary key default gen_random_uuid(),
  user_id    uuid references auth.users not null,
  created_at timestamptz not null default now(),
  expires_at timestamptz not null default now() + interval '7 days'
);

-- Only the owner can manage their tokens
alter table share_tokens enable row level security;

create policy "Users manage their own share tokens"
  on share_tokens for all
  using  (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- Security-definer function: anon users can call this with a token
-- and get entries only if the token is valid and not expired
create or replace function get_shared_entries(p_token uuid)
returns setof entries
language plpgsql
security definer
stable
as $$
begin
  return query
    select e.*
    from entries e
    inner join share_tokens st on st.user_id = e.user_id
    where st.token = p_token
      and st.expires_at > now();
end;
$$;

-- Allow anonymous (unauthenticated) callers to invoke this function
grant execute on function get_shared_entries(uuid) to anon;

-- Also return token metadata so the share page can show expiry info
create or replace function get_share_token_info(p_token uuid)
returns table (user_id uuid, expires_at timestamptz)
language plpgsql
security definer
stable
as $$
begin
  return query
    select st.user_id, st.expires_at
    from share_tokens st
    where st.token = p_token
      and st.expires_at > now();
end;
$$;

grant execute on function get_share_token_info(uuid) to anon;
