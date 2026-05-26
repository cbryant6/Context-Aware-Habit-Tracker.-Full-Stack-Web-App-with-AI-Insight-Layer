"use client";

import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { useState } from "react";
import type { Habit, ContextLog } from "@/lib/types";

const MOOD_OPTIONS = [
  { label: "Great", value: "great" },
  { label: "Good", value: "good" },
  { label: "Neutral", value: "neutral" },
  { label: "Low", value: "low" },
  { label: "Bad", value: "bad" },
];

export function ContextLogForm({
  habit,
  existingLog,
  date,
  userId,
  onClose,
}: {
  habit: Habit;
  existingLog: ContextLog | null;
  date: string;
  userId: string;
  onClose: () => void;
}) {
  const router = useRouter();
  const supabase = createClient();

  const [completed, setCompleted] = useState(existingLog?.completed ?? false);
  const [sleepScore, setSleepScore] = useState<number | null>(existingLog?.sleep_score ?? null);
  const [stressScore, setStressScore] = useState<number | null>(existingLog?.stress_score ?? null);
  const [mood, setMood] = useState<string | null>(existingLog?.mood ?? null);
  const [scheduleDisrupted, setScheduleDisrupted] = useState(existingLog?.schedule_disrupted ?? false);
  const [notes, setNotes] = useState(existingLog?.notes ?? "");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [validationError, setValidationError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setValidationError(null);
    setError(null);

    

    setLoading(true);

    const payload = {
      user_id: userId,
      habit_id: habit.id,
      date,
      completed,
      sleep_score: sleepScore,
      stress_score: stressScore,
      mood,
      schedule_disrupted: scheduleDisrupted,
      notes: notes.trim() || null,
    };

    const { error: supabaseError } = await supabase
      .from("context_logs")
      .upsert(payload, { onConflict: "user_id,habit_id,date" });

    if (supabaseError) {
      setError(supabaseError.message);
      setLoading(false);
      return;
    }

    router.refresh();
    onClose();
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="relative w-full max-w-md max-h-[calc(100dvh-2rem)] overflow-y-auto rounded-xl bg-white p-4 shadow-xl sm:p-6">
        {/* Header */}
        <div className="mb-5 flex items-start justify-between">
          <div className="min-w-0 flex-1">
            <h2 className="truncate text-lg font-semibold text-gray-900">{habit.name}</h2>
            <p className="mt-0.5 text-sm text-gray-500">{date}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="ml-2 flex h-11 w-11 shrink-0 items-center justify-center rounded-md text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors"
            aria-label="Close"
          >
            <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {habit.motivation && (
            <p className="text-sm italic text-gray-400">{habit.motivation}</p>
          )}

          {/* Completed toggle */}
          <div className="flex items-center justify-between rounded-lg border border-gray-200 px-4 py-3">
            <span className="text-sm font-medium text-gray-900">Completed</span>
            <button
              type="button"
              onClick={() => setCompleted(!completed)}
              className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:ring-offset-2 ${
                completed ? "bg-violet-600" : "bg-gray-200"
              }`}
              role="switch"
              aria-checked={completed}
            >
              <span
                className={`pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow ring-0 transition-transform duration-200 ${
                  completed ? "translate-x-5" : "translate-x-0"
                }`}
              />
            </button>
          </div>

          {/* Sleep score */}
          <div>
            <p className="mb-2 text-sm font-medium text-gray-900">Sleep Quality <span className="text-gray-400 font-normal">(optional)</span></p>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map((n) => (
                <button
                  key={n}
                  type="button"
                  onClick={() => setSleepScore(n)}
                  className={`flex h-10 flex-1 items-center justify-center rounded-md border text-sm font-medium transition-colors ${
                    sleepScore === n
                      ? "border-violet-600 bg-violet-600 text-white"
                      : "border-gray-300 bg-white text-gray-700 hover:border-violet-400 hover:bg-violet-50"
                  }`}
                >
                  {n}
                </button>
              ))}
            </div>
            <div className="mt-1 flex justify-between text-xs text-gray-400">
              <span>Poor</span>
              <span>Great</span>
            </div>
          </div>

          {/* Stress score */}
          <div>
            <p className="mb-2 text-sm font-medium text-gray-900">Stress Level <span className="text-gray-400 font-normal">(optional)</span></p>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map((n) => (
                <button
                  key={n}
                  type="button"
                  onClick={() => setStressScore(n)}
                  className={`flex h-10 flex-1 items-center justify-center rounded-md border text-sm font-medium transition-colors ${
                    stressScore === n
                      ? "border-violet-600 bg-violet-600 text-white"
                      : "border-gray-300 bg-white text-gray-700 hover:border-violet-400 hover:bg-violet-50"
                  }`}
                >
                  {n}
                </button>
              ))}
            </div>
            <div className="mt-1 flex justify-between text-xs text-gray-400">
              <span>Low</span>
              <span>High</span>
            </div>
          </div>

          {/* Mood */}
          <div>
            <p className="mb-2 text-sm font-medium text-gray-900">Mood <span className="text-gray-400 font-normal">(optional)</span></p>
            <div className="flex flex-wrap gap-2">
              {MOOD_OPTIONS.map(({ label, value }) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setMood(value)}
                  className={`flex h-10 min-w-[3.5rem] flex-1 items-center justify-center rounded-md border text-xs font-medium transition-colors ${
                    mood === value
                      ? "border-violet-600 bg-violet-600 text-white"
                      : "border-gray-300 bg-white text-gray-700 hover:border-violet-400 hover:bg-violet-50"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* Schedule disrupted */}
          <div className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-gray-200 px-4 py-3">
            <span className="text-sm font-medium text-gray-900">Day off-routine?</span>
            <div className="flex gap-2">
              {[
                { label: "No", value: false },
                { label: "Yes", value: true },
              ].map(({ label, value }) => (
                <button
                  key={label}
                  type="button"
                  onClick={() => setScheduleDisrupted(value)}
                  className={`rounded-md px-4 py-1.5 text-sm font-medium transition-colors ${
                    scheduleDisrupted === value
                      ? "bg-violet-600 text-white"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* Notes */}
          <div>
            <label htmlFor="log-notes" className="block text-sm font-medium text-gray-900">
              Notes <span className="text-gray-400">(optional)</span>
            </label>
            <textarea
              id="log-notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              maxLength={500}
              rows={3}
              placeholder="Anything else worth noting..."
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-violet-500 focus:outline-none focus:ring-1 focus:ring-violet-500 resize-none"
            />
            <p className="mt-1 text-right text-xs text-gray-400">{notes.length}/500</p>
          </div>

          {/* Errors */}
          {(validationError || error) && (
            <p className="text-sm text-red-600">{validationError ?? error}</p>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-md bg-violet-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-violet-700 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:ring-offset-2 disabled:opacity-50 transition-colors"
          >
            {loading ? "Saving..." : "Save Log"}
          </button>
        </form>
      </div>
    </div>
  );
}
