-- Feedback table for landing page submissions
create table if not exists public.feedback (
  id uuid primary key default gen_random_uuid(),
  user_id uuid null,
  name text null,
  email text null,
  rating int2 null check (rating between 1 and 5),
  message text not null,
  created_at timestamptz not null default now()
);

-- RLS: allow anonymous inserts if desired (optional); tighten as needed
alter table public.feedback enable row level security;

-- Anonymous insert policy (optional): allows anyone to submit
create policy if not exists feedback_insert_anon
on public.feedback for insert
to anon
with check (true);

-- Authenticated users can insert and read their own feedback
create policy if not exists feedback_insert_auth
on public.feedback for insert
to authenticated
with check (auth.uid() is not null);

create policy if not exists feedback_select_own
on public.feedback for select
to authenticated
using (user_id = auth.uid());
