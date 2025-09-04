-- Breathing sessions table
create table if not exists public.breathing_sessions (
  id bigint generated always as identity primary key,
  user_id uuid not null,
  start_time timestamptz not null,
  end_time timestamptz,
  duration integer, -- seconds
  cycles integer,
  mode text not null, -- '478' | 'box' | 'custom'
  mood_before text,
  mood_after text,
  created_at timestamptz default now()
);

-- Optional foreign key to auth.users if desired
-- alter table public.breathing_sessions add constraint breathing_sessions_user_fk foreign key (user_id) references auth.users(id) on delete cascade;

-- Aggregate user stats
create table if not exists public.user_stats (
  user_id uuid primary key,
  total_sessions integer default 0,
  total_minutes integer default 0,
  current_streak integer default 0,
  longest_streak integer default 0,
  last_session_date date
);

-- Indexes
create index if not exists breathing_sessions_user_idx on public.breathing_sessions(user_id);
create index if not exists breathing_sessions_time_idx on public.breathing_sessions(start_time);
