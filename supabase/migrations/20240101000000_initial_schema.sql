-- habits table
create table public.habits (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  frequency text not null default 'daily',
  category text,
  archived boolean not null default false,
  created_at timestamptz not null default now()
);

alter table public.habits enable row level security;

create policy "Users can view their own habits"
  on public.habits for select
  using (auth.uid() = user_id);

create policy "Users can insert their own habits"
  on public.habits for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own habits"
  on public.habits for update
  using (auth.uid() = user_id);

create policy "Users can delete their own habits"
  on public.habits for delete
  using (auth.uid() = user_id);

-- context_logs table
create table public.context_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  habit_id uuid not null references public.habits(id) on delete cascade,
  date date not null default current_date,
  completed boolean not null default false,
  sleep_score integer check (sleep_score between 1 and 5),
  stress_score integer check (stress_score between 1 and 5),
  mood text,
  schedule_disrupted boolean not null default false,
  notes text,
  created_at timestamptz not null default now()
);

alter table public.context_logs enable row level security;

create policy "Users can view their own context logs"
  on public.context_logs for select
  using (auth.uid() = user_id);

create policy "Users can insert their own context logs"
  on public.context_logs for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own context logs"
  on public.context_logs for update
  using (auth.uid() = user_id);

create policy "Users can delete their own context logs"
  on public.context_logs for delete
  using (auth.uid() = user_id);
