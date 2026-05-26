import { createClient } from "@/lib/supabase/server";
import { TodayChecklist } from "@/components/today-checklist";

export default async function DashboardPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const ninetyDaysAgo = new Date(Date.now() - 90 * 86_400_000)
    .toISOString()
    .split("T")[0];

  const [{ data: habits }, { data: recentLogs }] = await Promise.all([
    supabase
      .from("habits")
      .select("*")
      .eq("archived", false)
      .order("created_at", { ascending: true }),
    supabase
      .from("context_logs")
      .select("*")
      .gte("date", ninetyDaysAgo)
      .order("date", { ascending: false }),
  ]);

  const activeHabits = habits ?? [];

  return (
    <div>
      <div className="flex items-baseline justify-between">
        <h1 className="text-2xl font-bold">Today</h1>
        <span className="text-sm text-gray-500">
          {new Date().toLocaleDateString("en-US", {
            weekday: "long",
            month: "long",
            day: "numeric",
          })}
        </span>
      </div>
      <div className="mt-6">
        {activeHabits.length === 0 ? (
          <p className="py-12 text-center text-sm text-gray-500">
            No habits yet.{" "}
            <a href="/habits" className="text-violet-600 hover:underline">
              Add your first habit on the Habits page.
            </a>
          </p>
        ) : (
          <TodayChecklist
            habits={activeHabits}
            allRecentLogs={recentLogs ?? []}
            userId={user!.id}
          />
        )}
      </div>
    </div>
  );
}
