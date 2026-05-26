import { createClient } from "@/lib/supabase/server";
import { HabitsManager } from "@/components/habits-manager";

export default async function HabitsPage() {
  const supabase = await createClient();
  const { data: habits } = await supabase
    .from("habits")
    .select("*")
    .order("created_at", { ascending: false });

  return (
    <div>
      <h1 className="text-2xl font-bold">Habits</h1>
      <p className="mt-1 text-sm text-gray-500">
        Create, edit, and manage your habits.
      </p>
      <div className="mt-6">
        <HabitsManager initialHabits={habits ?? []} />
      </div>
    </div>
  );
}
