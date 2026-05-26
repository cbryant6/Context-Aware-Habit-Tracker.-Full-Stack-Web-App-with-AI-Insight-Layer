"use client";

import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { useState } from "react";
import type { Habit } from "@/lib/types";
import { HabitForm } from "@/components/habit-form";

export function HabitsManager({ initialHabits }: { initialHabits: Habit[] }) {
  const router = useRouter();
  const supabase = createClient();

  const [showForm, setShowForm] = useState(false);
  const [editingHabit, setEditingHabit] = useState<Habit | null>(null);
  const [showArchived, setShowArchived] = useState(false);

  const activeHabits = initialHabits.filter((h) => !h.archived);
  const archivedHabits = initialHabits.filter((h) => h.archived);

  async function handleArchiveToggle(habit: Habit) {
    await supabase
      .from("habits")
      .update({ archived: !habit.archived })
      .eq("id", habit.id);
    router.refresh();
  }

  function handleEdit(habit: Habit) {
    setEditingHabit(habit);
    setShowForm(true);
  }

  function handleCloseForm() {
    setShowForm(false);
    setEditingHabit(null);
  }

  return (
    <div className="space-y-6">
      <button
        onClick={() => setShowForm(true)}
        className="rounded-md bg-violet-600 px-4 py-2 text-sm font-medium text-white hover:bg-violet-700 transition-colors"
      >
        + New Habit
      </button>

      {showForm && (
        <HabitForm
          habit={editingHabit}
          onClose={handleCloseForm}
        />
      )}

      {activeHabits.length === 0 && !showForm && (
        <p className="text-sm text-gray-500 py-8 text-center">
          No habits yet. Create one to get started.
        </p>
      )}

      {activeHabits.length > 0 && (
        <div className="divide-y divide-gray-200 rounded-lg border border-gray-200 bg-white">
          {activeHabits.map((habit) => (
            <HabitRow
              key={habit.id}
              habit={habit}
              onEdit={handleEdit}
              onArchiveToggle={handleArchiveToggle}
            />
          ))}
        </div>
      )}

      {archivedHabits.length > 0 && (
        <div>
          <button
            onClick={() => setShowArchived(!showArchived)}
            className="text-sm font-medium text-gray-500 hover:text-gray-700 transition-colors"
          >
            {showArchived ? "Hide" : "Show"} archived ({archivedHabits.length})
          </button>

          {showArchived && (
            <div className="mt-3 divide-y divide-gray-200 rounded-lg border border-gray-200 bg-white opacity-75">
              {archivedHabits.map((habit) => (
                <HabitRow
                  key={habit.id}
                  habit={habit}
                  onEdit={handleEdit}
                  onArchiveToggle={handleArchiveToggle}
                />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function HabitRow({
  habit,
  onEdit,
  onArchiveToggle,
}: {
  habit: Habit;
  onEdit: (h: Habit) => void;
  onArchiveToggle: (h: Habit) => void;
}) {
  return (
    <div className="flex items-center justify-between gap-2 px-4 py-2">
      <div className="min-w-0 flex-1">
        <p className="truncate font-medium text-gray-900">{habit.name}</p>
        <div className="flex gap-3 mt-0.5">
          <span className="text-xs text-gray-500">{habit.frequency}</span>
          {habit.category && (
            <span className="text-xs text-gray-400">{habit.category}</span>
          )}
        </div>
      </div>
      <div className="flex shrink-0 items-center gap-1">
        <button
          onClick={() => onEdit(habit)}
          className="rounded-md px-3 py-2 text-xs font-medium text-gray-600 hover:bg-gray-100 transition-colors"
        >
          Edit
        </button>
        <button
          onClick={() => onArchiveToggle(habit)}
          className="rounded-md px-3 py-2 text-xs font-medium text-gray-600 hover:bg-gray-100 transition-colors"
        >
          {habit.archived ? "Restore" : "Archive"}
        </button>
      </div>
    </div>
  );
}
