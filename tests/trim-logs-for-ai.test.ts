import { describe, it, expect } from "vitest";
import { trimLogsForAI } from "@/lib/analytics";

describe("trimLogsForAI", () => {
  const rawLog = {
    id: "log-123",
    user_id: "user-abc-456",
    habit_id: "habit-xyz-789",
    date: "2026-05-20",
    completed: true,
    sleep_score: 4 as number | null,
    stress_score: 2 as number | null,
    mood: "good" as string | null,
    schedule_disrupted: false,
    notes: "Had a great day",
    created_at: "2026-05-20T08:00:00Z",
    habits: { id: "habit-xyz-789", name: "Morning Workout" },
  };

  it("includes only the 7 relevant fields", () => {
    const result = trimLogsForAI([rawLog]);
    expect(result).toHaveLength(1);

    const keys = Object.keys(result[0]);
    expect(keys).toEqual([
      "habit",
      "date",
      "completed",
      "sleep_score",
      "stress_score",
      "mood",
      "schedule_disrupted",
    ]);
  });

  it("strips user_id — no PII sent to AI", () => {
    const result = trimLogsForAI([rawLog]);
    expect(result[0]).not.toHaveProperty("user_id");
  });

  it("strips id, habit_id, created_at, and notes", () => {
    const result = trimLogsForAI([rawLog]);
    expect(result[0]).not.toHaveProperty("id");
    expect(result[0]).not.toHaveProperty("habit_id");
    expect(result[0]).not.toHaveProperty("created_at");
    expect(result[0]).not.toHaveProperty("notes");
  });

  it("replaces nested habits object with flat habit name string", () => {
    const result = trimLogsForAI([rawLog]);
    expect(result[0].habit).toBe("Morning Workout");
    expect(result[0]).not.toHaveProperty("habits");
  });

  it("preserves all context values accurately", () => {
    const result = trimLogsForAI([rawLog]);
    expect(result[0]).toEqual({
      habit: "Morning Workout",
      date: "2026-05-20",
      completed: true,
      sleep_score: 4,
      stress_score: 2,
      mood: "good",
      schedule_disrupted: false,
    });
  });

  it("handles null context fields correctly", () => {
    const nullLog = {
      ...rawLog,
      sleep_score: null as number | null,
      stress_score: null as number | null,
      mood: null as string | null,
    };
    const result = trimLogsForAI([nullLog]);
    expect(result[0].sleep_score).toBeNull();
    expect(result[0].stress_score).toBeNull();
    expect(result[0].mood).toBeNull();
  });
});
