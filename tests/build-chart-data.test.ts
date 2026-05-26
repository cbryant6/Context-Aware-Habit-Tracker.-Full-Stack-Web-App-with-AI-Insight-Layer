import { describe, it, expect } from "vitest";
import { buildChartData } from "@/lib/analytics";
import type { ContextLog } from "@/lib/types";

function makeLog(date: string, completed: boolean): ContextLog {
  return {
    id: "1",
    user_id: "u1",
    habit_id: "h1",
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

describe("buildChartData", () => {
  const refDate = new Date("2026-05-25T12:00:00");

  it("returns exactly 30 entries", () => {
    const result = buildChartData([], refDate);
    expect(result).toHaveLength(30);
  });

  it("returns rate: null for days with no logs", () => {
    const result = buildChartData([], refDate);
    expect(result.every((d) => d.rate === null)).toBe(true);
  });

  it("returns rate: 0 when all habits were missed", () => {
    const logs = [makeLog("2026-05-25", false), makeLog("2026-05-25", false)];
    const result = buildChartData(logs, refDate);
    const todayEntry = result[result.length - 1];
    expect(todayEntry.rate).toBe(0);
  });

  it("returns rate: 100 when all habits were completed", () => {
    const logs = [makeLog("2026-05-25", true), makeLog("2026-05-25", true)];
    const result = buildChartData(logs, refDate);
    const todayEntry = result[result.length - 1];
    expect(todayEntry.rate).toBe(100);
  });

  it("calculates correct percentage for mixed completion", () => {
    const logs = [
      makeLog("2026-05-25", true),
      makeLog("2026-05-25", false),
      makeLog("2026-05-25", true),
    ];
    const result = buildChartData(logs, refDate);
    const todayEntry = result[result.length - 1];
    expect(todayEntry.rate).toBe(67); // 2/3 = 66.67 → rounds to 67
  });

  it("distinguishes between no-data (null) and zero-completion (0)", () => {
    const logs = [makeLog("2026-05-25", false)];
    const result = buildChartData(logs, refDate);

    const todayEntry = result[result.length - 1];
    expect(todayEntry.rate).toBe(0);

    const yesterdayEntry = result[result.length - 2];
    expect(yesterdayEntry.rate).toBeNull();
  });
});
