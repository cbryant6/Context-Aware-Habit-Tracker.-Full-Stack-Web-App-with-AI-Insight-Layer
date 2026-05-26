import type { Habit, ContextLog } from "@/lib/types";

function getLongestActiveStreak(
  habits: Habit[],
  logs: ContextLog[],
  today: string
): { name: string; streak: number } | null {
  let best: { name: string; streak: number } | null = null;

  for (const habit of habits) {
    const dateMap = new Map<string, boolean>();
    for (const log of logs) {
      if (log.habit_id === habit.id) {
        dateMap.set(log.date, log.completed);
      }
    }

    let streak = 0;
    const cursor = new Date(today + "T00:00:00");
    while (dateMap.get(cursor.toLocaleDateString("en-CA")) === true) {
      streak++;
      cursor.setTime(cursor.getTime() - 86_400_000);
    }

    if (streak > 0 && (!best || streak > best.streak)) {
      best = { name: habit.name, streak };
    }
  }

  return best;
}

function getMostRecentDate(logs: ContextLog[], today: string): string {
  const todayLogs = logs.filter((l) => l.date === today);
  if (todayLogs.length > 0) return today;
  const dates = [...new Set(logs.map((l) => l.date))].sort().reverse();
  return dates[0] ?? today;
}

export function TodayAtAGlance({
  habits,
  logs,
}: {
  habits: Habit[];
  logs: ContextLog[];
}) {
  const today = new Date().toLocaleDateString("en-CA");
  const displayDate = getMostRecentDate(logs, today);
  const isToday = displayDate === today;
  const displayLogs = logs.filter((l) => l.date === displayDate);
  const completedCount = displayLogs.filter((l) => l.completed).length;
  const totalHabits = habits.length;
  const pct = totalHabits > 0 ? Math.round((completedCount / totalHabits) * 100) : 0;
  const bestStreak = getLongestActiveStreak(habits, logs, displayDate);

  return (
    <div>
      <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-gray-500">
        {isToday ? "Today at a Glance" : "Latest Activity"}
      </h2>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {/* Progress */}
        <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">
            Habits Done
          </p>
          <p className="mt-2 text-3xl font-bold text-gray-900">
            {completedCount}
            <span className="text-lg font-medium text-gray-400">/{totalHabits}</span>
          </p>
          <div className="mt-2 h-1.5 w-full rounded-full bg-gray-100">
            <div
              className="h-1.5 rounded-full bg-violet-500 transition-all duration-500"
              style={{ width: `${pct}%` }}
            />
          </div>
        </div>

        {/* Completion rate */}
        <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">
            Completion
          </p>
          <p className="mt-2 text-3xl font-bold text-gray-900">
            {pct}
            <span className="text-lg font-medium text-gray-400">%</span>
          </p>
          <p className="mt-2 text-xs text-gray-400">
            {completedCount === totalHabits && totalHabits > 0
              ? "Perfect day!"
              : completedCount > 0
                ? "Keep going!"
                : "Let's get started"}
          </p>
        </div>

        {/* Longest streak */}
        <div className="col-span-2 rounded-xl border border-gray-200 bg-white p-4 shadow-sm sm:col-span-1">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">
            Best Active Streak
          </p>
          {bestStreak ? (
            <>
              <p className="mt-2 text-3xl font-bold text-gray-900">
                {bestStreak.streak}
                <span className="text-lg font-medium text-gray-400"> days</span>
              </p>
              <p className="mt-2 truncate text-xs text-gray-400">
                {bestStreak.name}
              </p>
            </>
          ) : (
            <p className="mt-2 text-sm text-gray-400">Complete a habit to start a streak</p>
          )}
        </div>
      </div>
    </div>
  );
}
