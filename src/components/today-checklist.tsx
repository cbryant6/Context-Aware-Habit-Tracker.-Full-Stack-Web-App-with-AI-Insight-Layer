"use client";

import { useState } from "react";
import type { Habit, ContextLog } from "@/lib/types";
import { ContextLogForm } from "@/components/context-log-form";

function calculateStreak(
  habitId: string,
  allLogs: ContextLog[],
  todayStr: string
): number {
  const habitLogs = allLogs.filter((l) => l.habit_id === habitId);
  const dateMap = new Map<string, boolean>();
  for (const log of habitLogs) {
    dateMap.set(log.date, log.completed);
  }

  let streak = 0;
  const cursor = new Date(todayStr + "T00:00:00");

  while (true) {
    const dateStr = cursor.toLocaleDateString("en-CA");
    if (dateMap.get(dateStr) === true) {
      streak++;
      cursor.setTime(cursor.getTime() - 86_400_000);
    } else {
      break;
    }
  }

  return streak;
}

function dateStr(daysAgo: number): string {
  const d = new Date();
  d.setDate(d.getDate() - daysAgo);
  return d.toLocaleDateString("en-CA");
}

function findBrokenStreaks(
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

export function TodayChecklist({
  habits,
  allRecentLogs,
  userId,
}: {
  habits: Habit[];
  allRecentLogs: ContextLog[];
  userId: string;
}) {
  const today = dateStr(0);
  const yesterday = dateStr(1);
  const dayBeforeYesterday = dateStr(2);
  const todayLogs = allRecentLogs.filter((l) => l.date === today);

  const [openHabit, setOpenHabit] = useState<Habit | null>(null);
  const [dismissedNudges, setDismissedNudges] = useState<Set<string>>(new Set());

  const brokenStreakHabits = findBrokenStreaks(
    habits,
    allRecentLogs,
    today,
    yesterday,
    dayBeforeYesterday
  ).filter((h) => !dismissedNudges.has(h.id));

  const completedCount = todayLogs.filter((l) => l.completed).length;

  function getTodayLog(habitId: string) {
    return todayLogs.find((l) => l.habit_id === habitId) ?? null;
  }

  function handleClose() {
    setOpenHabit(null);
  }

  if (habits.length === 0) {
    return (
      <p className="py-12 text-center text-sm text-gray-500">
        No active habits. Add some on the{" "}
        <a href="/habits" className="text-violet-600 hover:underline">
          Habits
        </a>{" "}
        page.
      </p>
    );
  }

  return (
    <>
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <div className="h-2 flex-1 rounded-full bg-gray-200">
            <div
              className="h-2 rounded-full bg-violet-600 transition-all duration-300"
              style={{
                width: `${habits.length > 0 ? (completedCount / habits.length) * 100 : 0}%`,
              }}
            />
          </div>
          <span className="text-sm font-medium text-gray-600">
            {completedCount}/{habits.length}
          </span>
        </div>

        {brokenStreakHabits.map((habit) => (
          <div
            key={habit.id}
            className="flex items-start justify-between gap-2 rounded-lg border border-amber-200 bg-amber-50 px-4 py-2.5"
          >
            <p className="text-sm text-amber-800">
              You missed <span className="font-medium">{habit.name}</span> yesterday
              — one miss doesn&apos;t make a pattern. Log today to get back on track.
            </p>
            <button
              type="button"
              onClick={() =>
                setDismissedNudges((prev) => new Set(prev).add(habit.id))
              }
              className="mt-0.5 shrink-0 text-amber-400 hover:text-amber-600 transition-colors"
              aria-label={`Dismiss nudge for ${habit.name}`}
            >
              <svg className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                <path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z" />
              </svg>
            </button>
          </div>
        ))}

        <div className="divide-y divide-gray-200 rounded-lg border border-gray-200 bg-white">
          {habits.map((habit) => {
            const log = getTodayLog(habit.id);
            const isCompleted = log?.completed ?? false;
            const streak = calculateStreak(habit.id, allRecentLogs, today);

            return (
              <button
                key={habit.id}
                onClick={() => setOpenHabit(habit)}
                className="flex w-full items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-gray-50"
              >
                <div
                  className={`flex h-5 w-5 shrink-0 items-center justify-center rounded border transition-colors ${
                    isCompleted
                      ? "border-violet-600 bg-violet-600"
                      : "border-gray-300"
                  }`}
                >
                  {isCompleted && (
                    <svg className="h-3.5 w-3.5 text-white" viewBox="0 0 12 12" fill="none">
                      <path
                        d="M2.5 6L5 8.5L9.5 3.5"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <span
                    className={`text-sm font-medium ${
                      isCompleted ? "text-gray-400 line-through" : "text-gray-900"
                    }`}
                  >
                    {habit.name}
                  </span>
                  {habit.category && (
                    <span className="ml-2 text-xs text-gray-400">
                      {habit.category}
                    </span>
                  )}
                  {streak > 0 && (
                    <span className="ml-2 inline-flex items-center rounded-full bg-orange-100 px-2 py-0.5 text-xs text-orange-700">
                      🔥 {streak}
                    </span>
                  )}
                </div>
                <svg
                  className="h-4 w-4 shrink-0 text-gray-300"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M7.21 14.77a.75.75 0 01.02-1.06L11.168 10 7.23 6.29a.75.75 0 111.04-1.08l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 01-1.06-.02z"
                    clipRule="evenodd"
                  />
                </svg>
              </button>
            );
          })}
        </div>
      </div>

      {openHabit && (
        <ContextLogForm
          habit={openHabit}
          existingLog={getTodayLog(openHabit.id)}
          date={today}
          userId={userId}
          onClose={handleClose}
        />
      )}
    </>
  );
}
