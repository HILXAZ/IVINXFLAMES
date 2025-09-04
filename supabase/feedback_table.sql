-- Feedback table for landing page submissions
create table if not exists public.feedback (
  id uuid primary key default gen_random_uuid(),
  user_id uuid null,
  name text null,
  email text null,
  type text null check (type in ('feature-request', 'bug-report', 'general-feedback', 'user-experience', 'suggestion', 'compliment')),
  rating int2 null check (rating between 1 and 5),
  message text not null,
  status text default 'pending' check (status in ('pending', 'reviewed', 'resolved', 'closed')),
  created_at timestamptz not null default now(),
  updated_at timestamptz default now()
);

-- Create indexes for better performance
create index if not exists idx_feedback_user_id on public.feedback(user_id);
create index if not exists idx_feedback_type on public.feedback(type);
create index if not exists idx_feedback_status on public.feedback(status);
create index if not exists idx_feedback_created_at on public.feedback(created_at);

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

-- Admin users can view all feedback (modify as needed)
create policy if not exists feedback_select_admin
on public.feedback for select
to authenticated
using (
  exists (
    select 1 from public.profiles 
    where id = auth.uid() 
    and role = 'admin'
  )
);

-- Create trigger to update updated_at timestamp
create or replace function public.handle_updated_at_feedback()
returns trigger as $$
begin
    new.updated_at = now();
    return new;
end;
$$ language plpgsql;

create trigger if not exists set_updated_at_feedback
    before update on public.feedback
    for each row
    execute function public.handle_updated_at_feedback();
