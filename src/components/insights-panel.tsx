"use client";

import { useState } from "react";
import { generateInsights } from "@/lib/actions/insights";
import type { Habit, ContextLog } from "@/lib/types";
import { CompletionRateChart } from "@/components/completion-rate-chart";

type Result =
  | { type: "ok"; summary: string }
  | { type: "too_few"; message: string }
  | { type: "error"; message: string };

export function InsightsPanel({
  habits,
  logs,
}: {
  habits: Habit[];
  logs: ContextLog[];
}) {
  const [selectedHabit, setSelectedHabit] = useState<string>("all");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<Result | null>(null);

  async function handleSurface() {
    setLoading(true);
    setResult(null);

    const response = await generateInsights(selectedHabit);

    if (response.status === "ok") {
      setResult({ type: "ok", summary: response.summary });
    } else if (response.status === "too_few") {
      setResult({ type: "too_few", message: response.message });
    } else {
      setResult({ type: "error", message: response.message });
    }

    setLoading(false);
  }

  return (
    <div className="space-y-4">
      {/* Chart */}
      <CompletionRateChart logs={logs} habitId={selectedHabit} />

      {/* Controls */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
        <div className="flex-1">
          <label
            htmlFor="habit-select"
            className="block text-sm font-medium text-gray-700"
          >
            Habit
          </label>
          <select
            id="habit-select"
            value={selectedHabit}
            onChange={(e) => {
              setSelectedHabit(e.target.value);
              setResult(null);
            }}
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-violet-500 focus:outline-none focus:ring-1 focus:ring-violet-500"
          >
            <option value="all">All habits</option>
            {habits.map((h) => (
              <option key={h.id} value={h.id}>
                {h.name}
              </option>
            ))}
          </select>
        </div>

        <button
          onClick={handleSurface}
          disabled={loading}
          className="w-full rounded-md bg-violet-600 px-4 py-2 text-sm font-medium text-white hover:bg-violet-700 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:ring-offset-2 disabled:opacity-50 transition-colors sm:w-auto"
        >
          {loading ? "Analyzing…" : "Surface patterns"}
        </button>
      </div>

      {/* Loading */}
      {loading && (
        <div className="flex items-center gap-3 rounded-lg border border-gray-200 bg-white px-4 py-5">
          <svg
            className="h-5 w-5 animate-spin text-violet-600"
            viewBox="0 0 24 24"
            fill="none"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8v8H4z"
            />
          </svg>
          <span className="text-sm text-gray-600">Analyzing your patterns…</span>
        </div>
      )}

      {/* Result */}
      {!loading && result?.type === "ok" && (
        <div className="rounded-lg border border-violet-100 bg-violet-50 px-5 py-4">
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-violet-500">
            Pattern summary
          </p>
          <div className="space-y-2">
            {result.summary.split("\n").filter(Boolean).map((para, i) => (
              <p key={i} className="text-sm leading-relaxed text-gray-800">
                {para}
              </p>
            ))}
          </div>
        </div>
      )}

      {!loading && result?.type === "too_few" && (
        <div className="rounded-lg border border-blue-100 bg-blue-50 px-5 py-4">
          <p className="text-sm text-blue-800">{result.message}</p>
          <a
            href="/dashboard"
            className="mt-2 inline-block text-sm font-medium text-blue-700 underline hover:text-blue-900"
          >
            Go to Today view →
          </a>
        </div>
      )}

      {!loading && result?.type === "error" && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-5 py-4">
          <p className="text-sm font-medium text-red-700">Something went wrong</p>
          <p className="mt-1 text-sm text-red-600">{result.message}</p>
        </div>
      )}
    </div>
  );
}
