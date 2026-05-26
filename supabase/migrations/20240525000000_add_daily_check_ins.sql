create table public.daily_check_ins (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  date date not null default current_date,
  steps integer check (steps >= 0),
  sleep_hours numeric(3,1) check (sleep_hours between 0 and 24),
  calories integer check (calories >= 0),
  water_glasses integer check (water_glasses >= 0),
  created_at timestamptz not null default now(),
  unique (user_id, date)
);

alter table public.daily_check_ins enable row level security;

create policy "Users can view their own check-ins"
  on public.daily_check_ins for select
  using (auth.uid() = user_id);

create policy "Users can insert their own check-ins"
  on public.daily_check_ins for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own check-ins"
  on public.daily_check_ins for update
  using (auth.uid() = user_id);
