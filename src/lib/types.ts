export interface Habit {
  id: string;
  user_id: string;
  name: string;
  frequency: string;
  category: string | null;
  motivation: string | null;
  archived: boolean;
  created_at: string;
}

export interface ContextLog {
  id: string;
  user_id: string;
  habit_id: string;
  date: string;
  completed: boolean;
  sleep_score: number | null;
  stress_score: number | null;
  mood: string | null;
  schedule_disrupted: boolean;
  notes: string | null;
  created_at: string;
}

export interface DailyCheckIn {
  id: string;
  user_id: string;
  date: string;
  steps: number | null;
  sleep_hours: number | null;
  calories: number | null;
  water_glasses: number | null;
  created_at: string;
}
