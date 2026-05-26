import { describe, it, expect } from "vitest";
import { findBrokenStreaks } from "@/lib/analytics";
import type { Habit, ContextLog } from "@/lib/types";

function makeHabit(id: string, name: string): Habit {
  return {
    id,
    user_id: "u1",
    name,
    frequency: "daily",
    category: null,
    motivation: null,
    archived: false,
    created_at: "",
  };
}

function makeLog(
  habitId: string,
  date: string,
  completed: boolean
): ContextLog {
  return {
    id: `${habitId}-${date}`,
    user_id: "u1",
    habit_id: habitId,
    date,
    completed,
    sleep_score: null,
    stress_score: null,
    mood: null,
    schedule_disrupted: false,
    notes: null,
    created_at: "",
  };
}

describe("findBrokenStreaks", () => {
  const today = "2026-05-25";
  const yesterday = "2026-05-24";
  const dayBefore = "2026-05-23";

  it("detects a broken streak when 2+ day streak ended day-before-yesterday", () => {
    const habit = makeHabit("h1", "Workout");
    const logs = [
      makeLog("h1", "2026-05-21", true),
      makeLog("h1", "2026-05-22", true),
      makeLog("h1", "2026-05-23", true), // day-before-yesterday: streak active
      // 2026-05-24 (yesterday): missing — streak broken
      // 2026-05-25 (today): no log yet
    ];

    const result = findBrokenStreaks([habit], logs, today, yesterday, dayBefore);
    expect(result).toHaveLength(1);
    expect(result[0].name).toBe("Workout");
  });

  it("does NOT trigger for a habit with only 1-day streak", () => {
    const habit = makeHabit("h1", "Workout");
    const logs = [
      makeLog("h1", "2026-05-23", true), // only 1 day
    ];

    const result = findBrokenStreaks([habit], logs, today, yesterday, dayBefore);
    expect(result).toHaveLength(0);
  });

  it("does NOT trigger if the habit was completed yesterday", () => {
    const habit = makeHabit("h1", "Workout");
    const logs = [
      makeLog("h1", "2026-05-22", true),
      makeLog("h1", "2026-05-23", true),
      makeLog("h1", "2026-05-24", true), // completed yesterday — no break
    ];

    const result = findBrokenStreaks([habit], logs, today, yesterday, dayBefore);
    expect(result).toHaveLength(0);
  });

  it("does NOT trigger if the habit was already logged today", () => {
    const habit = makeHabit("h1", "Workout");
    const logs = [
      makeLog("h1", "2026-05-22", true),
      makeLog("h1", "2026-05-23", true),
      // yesterday missed
      makeLog("h1", "2026-05-25", false), // logged today (even if not completed)
    ];

    const result = findBrokenStreaks([habit], logs, today, yesterday, dayBefore);
    expect(result).toHaveLength(0);
  });

  it("does NOT trigger if day-before-yesterday was not completed", () => {
    const habit = makeHabit("h1", "Workout");
    const logs = [
      makeLog("h1", "2026-05-23", false), // not completed
    ];

    const result = findBrokenStreaks([habit], logs, today, yesterday, dayBefore);
    expect(result).toHaveLength(0);
  });
});
