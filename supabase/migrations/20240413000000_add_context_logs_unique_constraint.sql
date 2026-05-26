alter table public.context_logs
add constraint context_logs_user_habit_date_unique
unique (user_id, habit_id, date);
