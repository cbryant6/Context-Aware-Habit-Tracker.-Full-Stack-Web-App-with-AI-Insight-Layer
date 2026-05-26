"use client";

import { useRouter } from "next/navigation";
import type { Habit } from "@/lib/types";

interface LogWithHabit {
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
  habits: { id: string; name: string; category: string | null };
}

function formatDate(dateStr: string) {
  const [year, month, day] = dateStr.split("-").map(Number);
  return new Date(year, month - 1, day).toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

export function HistoryList({
  logs,
  habits,
  currentFilter,
  page,
  pageSize,
  totalCount,
}: {
  logs: LogWithHabit[];
  habits: Habit[];
  currentFilter: string;
  page: number;
  pageSize: number;
  totalCount: number;
}) {
  const router = useRouter();

  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));
  const showingFrom = totalCount === 0 ? 0 : (page - 1) * pageSize + 1;
  const showingTo = Math.min(page * pageSize, totalCount);

  const grouped = new Map<string, LogWithHabit[]>();
  for (const log of logs) {
    const existing = grouped.get(log.date);
    if (existing) {
      existing.push(log);
    } else {
      grouped.set(log.date, [log]);
    }
  }

  function buildUrl(params: Record<string, string>) {
    const sp = new URLSearchParams();
    if (currentFilter) sp.set("habit", currentFilter);
    for (const [k, v] of Object.entries(params)) {
      if (v) sp.set(k, v);
    }
    const qs = sp.toString();
    return `/history${qs ? `?${qs}` : ""}`;
  }

  function handleFilterChange(value: string) {
    const sp = new URLSearchParams();
    if (value) sp.set("habit", value);
    router.push(`/history${sp.toString() ? `?${sp}` : ""}`, { scroll: false });
  }

  function handlePageChange(newPage: number) {
    router.push(buildUrl(newPage > 1 ? { page: String(newPage) } : {}), {
      scroll: true,
    });
  }

  return (
    <div className="space-y-6">
      {/* Filter + count row */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <select
          value={currentFilter}
          onChange={(e) => handleFilterChange(e.target.value)}
          className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-violet-500 focus:outline-none focus:ring-1 focus:ring-violet-500 sm:w-64"
        >
          <option value="">All habits</option>
          {habits.map((h) => (
            <option key={h.id} value={h.name}>
              {h.name}
            </option>
          ))}
        </select>

        {totalCount > 0 && (
          <p className="text-xs text-gray-400">
            Showing {showingFrom}–{showingTo} of {totalCount} entries
          </p>
        )}
      </div>

      {/* Empty state */}
      {logs.length === 0 && (
        <p className="py-12 text-center text-sm text-gray-500">
          No log entries yet. Complete a habit on the{" "}
          <a href="/dashboard" className="text-violet-600 hover:underline">
            Today view
          </a>{" "}
          to start logging context.
        </p>
      )}

      {/* Grouped by date */}
      {Array.from(grouped.entries()).map(([date, entries]) => (
        <div key={date}>
          <h2 className="mb-3 text-sm font-semibold text-gray-500 uppercase tracking-wide">
            {formatDate(date)}
          </h2>
          <div className="space-y-3">
            {entries.map((log) => (
              <div
                key={log.id}
                className="rounded-lg border border-gray-200 bg-white px-4 py-3"
              >
                {/* Habit name + completion */}
                <div className="flex items-center gap-2">
                  <span
                    className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                      log.completed
                        ? "bg-green-100 text-green-700"
                        : "bg-red-100 text-red-700"
                    }`}
                  >
                    {log.completed ? "✓" : "✗"}
                  </span>
                  <span className="text-sm font-medium text-gray-900">
                    {log.habits.name}
                  </span>
                  {log.habits.category && (
                    <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-500">
                      {log.habits.category}
                    </span>
                  )}
                </div>

                {/* Context chips */}
                <div className="mt-2 flex flex-wrap gap-2">
                  {log.sleep_score !== null && (
                    <span className="rounded-full bg-blue-50 px-2 py-0.5 text-xs text-blue-700">
                      Sleep: {log.sleep_score}/5
                    </span>
                  )}
                  {log.stress_score !== null && (
                    <span className="rounded-full bg-purple-50 px-2 py-0.5 text-xs text-purple-700">
                      Stress: {log.stress_score}/5
                    </span>
                  )}
                  {log.mood && (
                    <span className="rounded-full bg-amber-50 px-2 py-0.5 text-xs text-amber-700">
                      Mood: {log.mood}
                    </span>
                  )}
                  {log.schedule_disrupted && (
                    <span className="rounded-full bg-red-50 px-2 py-0.5 text-xs text-red-700">
                      Off-routine
                    </span>
                  )}
                </div>

                {/* Notes */}
                {log.notes && (
                  <p className="mt-2 text-sm text-gray-600">{log.notes}</p>
                )}
              </div>
            ))}
          </div>
        </div>
      ))}

      {/* Pagination controls */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 pt-2">
          <button
            onClick={() => handlePageChange(page - 1)}
            disabled={page <= 1}
            className="rounded-md border border-gray-300 px-3 py-1.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
          >
            Previous
          </button>
          <span className="px-2 text-sm text-gray-500">
            Page {page} of {totalPages}
          </span>
          <button
            onClick={() => handlePageChange(page + 1)}
            disabled={page >= totalPages}
            className="rounded-md border border-gray-300 px-3 py-1.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}
