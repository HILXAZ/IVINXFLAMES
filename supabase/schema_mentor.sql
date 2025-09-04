-- Emotions array + notes + user memory
alter table if exists public.mentor_sessions add column if not exists emotions text[] default '{}';
create table if not exists public.mentor_notes (
  id uuid primary key default uuid_generate_v4(),
  session_id uuid not null references public.mentor_sessions(id) on delete cascade,
  note text not null,
  kind text check (kind in ('summary','action','reflection')) default 'summary',
  created_at timestamptz not null default now()
);
create table if not exists public.user_memory (
  user_id uuid primary key references auth.users(id) on delete cascade,
  preferences jsonb default '{}'::jsonb,
  goals jsonb default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table public.user_memory enable row level security;
create policy if not exists "own_memory" on public.user_memory for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- Messages telemetry
alter table if exists public.mentor_messages
  add column if not exists tokens int,
  add column if not exists latency_ms int,
  add column if not exists emotion text;
