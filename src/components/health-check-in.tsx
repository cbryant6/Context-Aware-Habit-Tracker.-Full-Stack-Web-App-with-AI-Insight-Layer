"use client";

import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { useState } from "react";
import type { DailyCheckIn } from "@/lib/types";

const FIELDS = [
  {
    key: "steps" as const,
    label: "Steps",
    icon: "👟",
    unit: "steps",
    placeholder: "7,500",
    color: "from-violet-500 to-violet-600",
    bgLight: "bg-violet-50",
  },
  {
    key: "sleep_hours" as const,
    label: "Sleep",
    icon: "🌙",
    unit: "hours",
    placeholder: "7.5",
    color: "from-blue-500 to-blue-600",
    bgLight: "bg-blue-50",
  },
  {
    key: "calories" as const,
    label: "Calories",
    icon: "🔥",
    unit: "kcal",
    placeholder: "2,000",
    color: "from-orange-500 to-orange-600",
    bgLight: "bg-orange-50",
  },
  {
    key: "water_glasses" as const,
    label: "Water",
    icon: "💧",
    unit: "glasses",
    placeholder: "8",
    color: "from-cyan-500 to-cyan-600",
    bgLight: "bg-cyan-50",
  },
];

export function HealthCheckIn({
  existing,
  userId,
  date,
}: {
  existing: DailyCheckIn | null;
  userId: string;
  date: string;
}) {
  const router = useRouter();
  const supabase = createClient();

  const isFromToday = existing?.date === date;
  const display = existing;

  const [values, setValues] = useState<Record<string, string>>({
    steps: "",
    sleep_hours: "",
    calories: "",
    water_glasses: "",
  });
  const [saving, setSaving] = useState<string | null>(null);

  async function handleSave(key: string) {
    const raw = values[key].trim();
    if (!raw) return;

    setSaving(key);

    const numericValue = parseFloat(raw.replace(/,/g, ""));
    if (isNaN(numericValue)) {
      setSaving(null);
      return;
    }

    const payload: Record<string, unknown> = {
      user_id: userId,
      date,
      [key]: key === "sleep_hours" ? numericValue : Math.round(numericValue),
    };

    await supabase
      .from("daily_check_ins")
      .upsert(payload, { onConflict: "user_id,date" });

    setSaving(null);
    router.refresh();
  }

  return (
    <div>
      <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-gray-500">
        {isFromToday || !display ? "Daily Health Check-in" : "Latest Health Check-in"}
      </h2>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {FIELDS.map((field) => {
          const displayValue = display?.[field.key];
          const hasDisplayValue = displayValue != null;
          const todayHasValue = isFromToday && hasDisplayValue;

          return (
            <div
              key={field.key}
              className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm"
            >
              <div className="flex items-center gap-2">
                <span className="text-lg">{field.icon}</span>
                <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                  {field.label}
                </span>
              </div>

              {hasDisplayValue ? (
                <div className="mt-3">
                  <p className="text-2xl font-bold text-gray-900">
                    {field.key === "sleep_hours"
                      ? displayValue
                      : displayValue?.toLocaleString()}
                  </p>
                  <p className="text-xs text-gray-400">{field.unit}</p>
                </div>
              ) : (
                <div className="mt-3">
                  <input
                    type="text"
                    inputMode="decimal"
                    value={values[field.key]}
                    onChange={(e) =>
                      setValues((prev) => ({ ...prev, [field.key]: e.target.value }))
                    }
                    onKeyDown={(e) => {
                      if (e.key === "Enter") handleSave(field.key);
                    }}
                    placeholder={field.placeholder}
                    className="w-full rounded-lg border border-gray-200 bg-gray-50 px-2.5 py-1.5 text-sm text-gray-900 placeholder-gray-300 focus:border-violet-400 focus:outline-none focus:ring-1 focus:ring-violet-400"
                  />
                  <button
                    onClick={() => handleSave(field.key)}
                    disabled={saving === field.key || !values[field.key].trim()}
                    className={`mt-2 w-full rounded-lg bg-gradient-to-r ${field.color} px-2 py-1.5 text-xs font-medium text-white transition-opacity disabled:opacity-40`}
                  >
                    {saving === field.key ? "Saving..." : "Save"}
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
