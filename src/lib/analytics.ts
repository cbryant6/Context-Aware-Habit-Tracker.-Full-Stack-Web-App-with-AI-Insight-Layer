import type { Habit, ContextLog } from "@/lib/types";

export function buildChartData(
  logs: ContextLog[],
  referenceDate: Date = new Date()
) {
  const data: { date: string; rate: number | null }[] = [];

  for (let i = 29; i >= 0; i--) {
    const d = new Date(referenceDate);
    d.setDate(referenceDate.getDate() - i);
    const dateStr = d.toLocaleDateString("en-CA");
    const label = d.toLocaleDateString("en-US", {
      month: "numeric",
      day: "numeric",
    });

    const dayLogs = logs.filter((l) => l.date === dateStr);
    const rate =
      dayLogs.length > 0
        ? Math.round(
            (dayLogs.filter((l) => l.completed).length / dayLogs.length) * 100
          )
        : null;

    data.push({ date: label, rate });
  }

  return data;
}

export function findBrokenStreaks(
  habits: Habit[],
  logs: ContextLog[],
  today: string,
  yesterday: string,
  dayBeforeYesterday: string
): Habit[] {
  return habits.filter((habit) => {
    const habitLogs = logs.filter((l) => l.habit_id === habit.id);
    const dateMap = new Map<string, boolean>();
    for (const log of habitLogs) {
      dateMap.set(log.date, log.completed);
    }

    const loggedToday = dateMap.has(today);
    const completedYesterday = dateMap.get(yesterday) === true;
    const completedDayBefore = dateMap.get(dayBeforeYesterday) === true;

    if (loggedToday || completedYesterday || !completedDayBefore) return false;

    let priorStreak = 0;
    const cursor = new Date(dayBeforeYesterday + "T00:00:00");
    while (dateMap.get(cursor.toLocaleDateString("en-CA")) === true) {
      priorStreak++;
      cursor.setTime(cursor.getTime() - 86_400_000);
    }

    return priorStreak >= 2;
  });
}

export function trimLogsForAI(
  logs: { date: string; completed: boolean; sleep_score: number | null; stress_score: number | null; mood: string | null; schedule_disrupted: boolean; habits: { name: string }; [key: string]: unknown }[]
) {
  return logs.map((log) => ({
    habit: log.habits.name,
    date: log.date,
    completed: log.completed,
    sleep_score: log.sleep_score,
    stress_score: log.stress_score,
    mood: log.mood,
    schedule_disrupted: log.schedule_disrupted,
  }));
}
