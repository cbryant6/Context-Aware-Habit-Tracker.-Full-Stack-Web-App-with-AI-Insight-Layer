import { createClient } from "@/lib/supabase/server";
import { HistoryList } from "@/components/history-list";

const PAGE_SIZE = 60;

export default async function HistoryPage({
  searchParams,
}: {
  searchParams: Promise<{ habit?: string; page?: string }>;
}) {
  const supabase = await createClient();
  const params = await searchParams;
  const page = Math.max(1, parseInt(params.page ?? "1", 10) || 1);
  const from = (page - 1) * PAGE_SIZE;
  const to = from + PAGE_SIZE - 1;

  let query = supabase
    .from("context_logs")
    .select("*, habits!inner(id, name, category)", { count: "exact" })
    .order("date", { ascending: false })
    .range(from, to);

  if (params.habit) {
    query = query.eq("habits.name", params.habit);
  }

  const [{ data: logs, count }, { data: habits }] = await Promise.all([
    query,
    supabase.from("habits").select("*").order("name", { ascending: true }),
  ]);

  const totalCount = count ?? 0;

  return (
    <div>
      <h1 className="text-2xl font-bold">History</h1>
      <p className="mt-1 text-sm text-gray-500">
        Browse past log entries by date.
      </p>
      <div className="mt-6">
        <HistoryList
          logs={logs ?? []}
          habits={habits ?? []}
          currentFilter={params.habit ?? ""}
          page={page}
          pageSize={PAGE_SIZE}
          totalCount={totalCount}
        />
      </div>
    </div>
  );
}
