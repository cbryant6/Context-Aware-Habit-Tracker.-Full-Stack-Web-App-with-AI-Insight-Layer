"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import type { ContextLog } from "@/lib/types";
import { buildChartData } from "@/lib/analytics";

export function CompletionRateChart({
  logs,
  habitId,
}: {
  logs: ContextLog[];
  habitId: string | "all";
}) {
  const filtered =
    habitId === "all" ? logs : logs.filter((l) => l.habit_id === habitId);
  const data = buildChartData(filtered);
  const hasData = filtered.length > 0;

  return (
    <div className="rounded-lg border border-gray-200 bg-white px-4 py-4">
      <p className="mb-3 text-sm font-medium text-gray-700">
        Completion rate — last 30 days
      </p>
      {!hasData && (
        <div className="flex h-[180px] items-center justify-center">
          <p className="text-sm text-gray-400">No data yet</p>
        </div>
      )}
      <ResponsiveContainer width="100%" height={hasData ? 180 : 0}>
        <BarChart data={data} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
          <XAxis
            dataKey="date"
            tick={{ fontSize: 11, fill: "#9ca3af" }}
            tickLine={false}
            axisLine={false}
            interval={4}
          />
          <YAxis
            domain={[0, 100]}
            tick={{ fontSize: 11, fill: "#9ca3af" }}
            tickLine={false}
            axisLine={false}
            tickFormatter={(v) => `${v}%`}
          />
          <Tooltip
            formatter={(value) =>
              value == null ? ["No data", ""] : [`${value}%`, "Completion"]
            }
            labelStyle={{ fontSize: 12, color: "#374151" }}
            contentStyle={{
              border: "1px solid #e5e7eb",
              borderRadius: "6px",
              fontSize: 12,
            }}
          />
          <Bar
            dataKey={(entry: { rate: number | null }) => entry.rate ?? 4}
            radius={[3, 3, 0, 0]}
            maxBarSize={24}
          >
            {data.map((entry, index) => (
              <Cell
                key={index}
                fill={entry.rate === null ? "#e5e7eb" : "#8b5cf6"}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
