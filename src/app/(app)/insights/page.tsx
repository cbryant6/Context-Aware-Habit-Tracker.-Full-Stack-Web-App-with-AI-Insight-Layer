import { createClient } from "@/lib/supabase/server";
import { InsightsPanel } from "@/components/insights-panel";

export default async function InsightsPage() {
  const supabase = await createClient();

  const thirtyDaysAgo = new Date(Date.now() - 30 * 86_400_000)
    .toISOString()
    .split("T")[0];

  const [{ data: habits }, { data: logs }] = await Promise.all([
    supabase
      .from("habits")
      .select("*")
      .eq("archived", false)
      .order("name", { ascending: true }),
    supabase
      .from("context_logs")
      .select("*")
      .gte("date", thirtyDaysAgo)
      .order("date", { ascending: false }),
  ]);

  return (
    <div>
      <h1 className="text-2xl font-bold">Insights</h1>
      <p className="mt-1 text-sm text-gray-500">
        AI-powered pattern analysis from your habit logs.
      </p>
      <div className="mt-6">
        <InsightsPanel habits={habits ?? []} logs={logs ?? []} />
      </div>
    </div>
  );
}
