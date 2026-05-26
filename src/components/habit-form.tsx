"use client";

import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { useState } from "react";
import type { Habit } from "@/lib/types";

const FREQUENCIES = ["daily", "weekdays", "custom"];
const CATEGORIES = ["health", "work", "personal", "other"];

export function HabitForm({
  habit,
  onClose,
}: {
  habit: Habit | null;
  onClose: () => void;
}) {
  const router = useRouter();
  const supabase = createClient();
  const isEditing = habit !== null;

  const [name, setName] = useState(habit?.name ?? "");
  const [frequency, setFrequency] = useState(habit?.frequency ?? "daily");
  const [category, setCategory] = useState(habit?.category ?? "personal");
  const [motivation, setMotivation] = useState(habit?.motivation ?? "");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const payload = {
      name: name.trim(),
      frequency,
      category,
      motivation: motivation.trim() || null,
    };

    if (isEditing) {
      const { error } = await supabase
        .from("habits")
        .update(payload)
        .eq("id", habit.id);
      if (error) {
        setError(error.message);
        setLoading(false);
        return;
      }
    } else {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        setError("Not authenticated");
        setLoading(false);
        return;
      }
      const { error } = await supabase
        .from("habits")
        .insert({ ...payload, user_id: user.id });
      if (error) {
        setError(error.message);
        setLoading(false);
        return;
      }
    }

    router.refresh();
    onClose();
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-lg border border-gray-200 bg-white p-4 space-y-4"
    >
      <h2 className="text-lg font-semibold">
        {isEditing ? "Edit Habit" : "New Habit"}
      </h2>

      <div>
        <label htmlFor="habit-name" className="block text-sm font-medium">
          Name
        </label>
        <input
          id="habit-name"
          type="text"
          required
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-violet-500 focus:outline-none focus:ring-1 focus:ring-violet-500"
          placeholder="e.g. Morning workout"
        />
      </div>

      <div>
        <label htmlFor="habit-frequency" className="block text-sm font-medium">
          Frequency
        </label>
        <select
          id="habit-frequency"
          value={frequency}
          onChange={(e) => setFrequency(e.target.value)}
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-violet-500 focus:outline-none focus:ring-1 focus:ring-violet-500"
        >
          {FREQUENCIES.map((f) => (
            <option key={f} value={f}>
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label htmlFor="habit-category" className="block text-sm font-medium">
          Category
        </label>
        <select
          id="habit-category"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-violet-500 focus:outline-none focus:ring-1 focus:ring-violet-500"
        >
          {CATEGORIES.map((c) => (
            <option key={c} value={c}>
              {c.charAt(0).toUpperCase() + c.slice(1)}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label htmlFor="habit-motivation" className="block text-sm font-medium">
          Why this matters to you <span className="text-gray-400 font-normal">(optional)</span>
        </label>
        <input
          id="habit-motivation"
          type="text"
          value={motivation}
          onChange={(e) => setMotivation(e.target.value)}
          maxLength={100}
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-violet-500 focus:outline-none focus:ring-1 focus:ring-violet-500"
          placeholder="e.g. I want more energy in the mornings"
        />
        <p className="mt-1 text-right text-xs text-gray-400">{motivation.length}/100</p>
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <div className="flex gap-2">
        <button
          type="submit"
          disabled={loading}
          className="rounded-md bg-violet-600 px-4 py-2 text-sm font-medium text-white hover:bg-violet-700 disabled:opacity-50 transition-colors"
        >
          {loading ? "Saving..." : isEditing ? "Save Changes" : "Create Habit"}
        </button>
        <button
          type="button"
          onClick={onClose}
          className="rounded-md bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200 transition-colors"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
