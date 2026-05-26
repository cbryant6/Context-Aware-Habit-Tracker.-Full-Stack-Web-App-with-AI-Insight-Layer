import { createClient } from "@/lib/supabase/server";
import { DailyQuote } from "@/components/daily-quote";
import { DailyChallenge } from "@/components/daily-challenge";
import { TodayAtAGlance } from "@/components/today-at-a-glance";
import { HealthCheckIn } from "@/components/health-check-in";

export default async function HomePage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const today = new Date().toLocaleDateString("en-CA");
  const ninetyDaysAgo = new Date(Date.now() - 90 * 86_400_000)
    .toISOString()
    .split("T")[0];

  const [{ data: habits }, { data: logs }, { data: checkIns }] =
    await Promise.all([
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
      supabase
        .from("daily_check_ins")
        .select("*")
        .order("date", { ascending: false })
        .limit(1),
    ]);

  const firstName = user?.user_metadata?.full_name?.split(" ")[0] ?? null;

  const greeting = getGreeting();

  return (
    <div className="space-y-8">
      {/* Greeting */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          {greeting}
          {firstName ? `, ${firstName}` : ""}
        </h1>
        <p className="mt-1 text-sm text-gray-500">
          {new Date().toLocaleDateString("en-US", {
            weekday: "long",
            month: "long",
            day: "numeric",
          })}
        </p>
      </div>

      {/* Inspirational quote */}
      <DailyQuote />

      {/* Today at a glance */}
      <TodayAtAGlance habits={habits ?? []} logs={logs ?? []} />

      {/* Health check-in */}
      <HealthCheckIn
        existing={checkIns?.[0] ?? null}
        userId={user!.id}
        date={today}
      />

      {/* Daily challenge */}
      <DailyChallenge />

      {/* Quick link to dashboard */}
      <div className="text-center">
        <a
          href="/dashboard"
          className="inline-flex items-center gap-2 rounded-lg bg-violet-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-violet-500"
        >
          Go to Today&apos;s Checklist
          <svg className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
            <path
              fillRule="evenodd"
              d="M7.21 14.77a.75.75 0 01.02-1.06L11.168 10 7.23 6.29a.75.75 0 111.04-1.08l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 01-1.06-.02z"
              clipRule="evenodd"
            />
          </svg>
        </a>
      </div>
    </div>
  );
}

function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}
