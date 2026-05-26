/**
 * Seed script for the demo account.
 *
 * Prerequisites:
 *   1. Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in your environment
 *      (the service role key is in Supabase → Settings → API → service_role)
 *   2. Run: npx tsx scripts/seed-demo.ts
 *
 * This script is idempotent — it deletes existing demo data before re-seeding.
 */

import { readFileSync } from "fs";
import { resolve } from "path";
import { createClient } from "@supabase/supabase-js";

// Load .env.local so the script works without manually setting env vars
try {
  const envPath = resolve(process.cwd(), ".env.local");
  const envFile = readFileSync(envPath, "utf-8");
  for (const line of envFile.split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eqIdx = trimmed.indexOf("=");
    if (eqIdx === -1) continue;
    const key = trimmed.slice(0, eqIdx);
    const val = trimmed.slice(eqIdx + 1);
    if (!process.env[key]) process.env[key] = val;
  }
} catch {}

const SUPABASE_URL = process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.error("Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});

const DEMO_EMAIL = "demo@habittracker.app";
const DEMO_PASSWORD = "demodemo123";

const HABITS = [
  { name: "Morning Workout", frequency: "daily", category: "health", motivation: "I want more energy and a clearer mind to start my day" },
  { name: "Meditate 10 min", frequency: "daily", category: "personal", motivation: "Staying calm under pressure makes everything else easier" },
  { name: "Read 30 pages", frequency: "daily", category: "personal", motivation: "I learn best from books and want to read 30 this year" },
  { name: "Drink 8 glasses of water", frequency: "daily", category: "health", motivation: "I feel so much better when I'm properly hydrated" },
  { name: "Journal before bed", frequency: "daily", category: "personal", motivation: "Writing helps me process the day and sleep better" },
  { name: "Cook a healthy dinner", frequency: "weekdays", category: "health", motivation: "Eating out is expensive and I want to learn to cook well" },
];

function dateStr(daysAgo: number): string {
  const d = new Date();
  d.setDate(d.getDate() - daysAgo);
  return d.toLocaleDateString("en-CA");
}

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function rand(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function seededRandom(seed: number): number {
  const x = Math.sin(seed * 9301 + 49297) * 49297;
  return x - Math.floor(x);
}

async function ensureSchema() {
  // Run pending migrations via supabase-js rpc or raw SQL
  // Using the admin client to add columns/tables if missing
  const { error: motErr } = await supabase.rpc("exec_sql" as string, {
    query: "ALTER TABLE habits ADD COLUMN IF NOT EXISTS motivation text;",
  } as Record<string, unknown>).maybeSingle();

  // If rpc doesn't exist, try a workaround: insert and catch
  if (motErr) {
    // Try direct column check via a dummy query
    const { error: testErr } = await supabase
      .from("habits")
      .select("motivation")
      .limit(0);
    if (testErr?.message?.includes("motivation")) {
      console.error(
        "  ⚠️  The 'motivation' column doesn't exist on the habits table.\n" +
        "  Please run this SQL in Supabase Dashboard → SQL Editor:\n\n" +
        "    ALTER TABLE habits ADD COLUMN motivation text;\n\n" +
        "    CREATE TABLE IF NOT EXISTS daily_check_ins (\n" +
        "      id uuid PRIMARY KEY DEFAULT gen_random_uuid(),\n" +
        "      user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,\n" +
        "      date date NOT NULL DEFAULT current_date,\n" +
        "      steps integer CHECK (steps >= 0),\n" +
        "      sleep_hours numeric(3,1) CHECK (sleep_hours BETWEEN 0 AND 24),\n" +
        "      calories integer CHECK (calories >= 0),\n" +
        "      water_glasses integer CHECK (water_glasses >= 0),\n" +
        "      created_at timestamptz NOT NULL DEFAULT now(),\n" +
        "      UNIQUE (user_id, date)\n" +
        "    );\n" +
        "    ALTER TABLE daily_check_ins ENABLE ROW LEVEL SECURITY;\n" +
        "    CREATE POLICY \"Users can view their own check-ins\" ON daily_check_ins FOR SELECT USING (auth.uid() = user_id);\n" +
        "    CREATE POLICY \"Users can insert their own check-ins\" ON daily_check_ins FOR INSERT WITH CHECK (auth.uid() = user_id);\n" +
        "    CREATE POLICY \"Users can update their own check-ins\" ON daily_check_ins FOR UPDATE USING (auth.uid() = user_id);\n\n" +
        "  Then re-run: npm run seed-demo"
      );
      process.exit(1);
    }
  }

  // Check if daily_check_ins table exists
  const { error: checkTableErr } = await supabase
    .from("daily_check_ins")
    .select("id")
    .limit(0);
  if (checkTableErr?.message?.includes("daily_check_ins")) {
    console.error(
      "  ⚠️  The 'daily_check_ins' table doesn't exist.\n" +
      "  Please run the migration SQL shown above in Supabase Dashboard → SQL Editor,\n" +
      "  then re-run: npm run seed-demo"
    );
    process.exit(1);
  }
}

async function main() {
  console.log("🌱 Seeding demo account...\n");

  await ensureSchema();

  // 1. Create or find the demo user
  let userId: string;

  const { data: existingUsers } = await supabase.auth.admin.listUsers();
  const existingUser = existingUsers?.users?.find((u) => u.email === DEMO_EMAIL);

  if (existingUser) {
    userId = existingUser.id;
    console.log(`  Found existing demo user: ${userId}`);

    // Clean up existing data
    await supabase.from("context_logs").delete().eq("user_id", userId);
    await supabase.from("daily_check_ins").delete().eq("user_id", userId);
    await supabase.from("habits").delete().eq("user_id", userId);
    console.log("  Cleaned up existing demo data");
  } else {
    const { data, error } = await supabase.auth.admin.createUser({
      email: DEMO_EMAIL,
      password: DEMO_PASSWORD,
      email_confirm: true,
    });
    if (error) {
      console.error("Failed to create demo user:", error.message);
      process.exit(1);
    }
    userId = data.user.id;
    console.log(`  Created demo user: ${userId}`);
  }

  // 2. Create habits
  const habitRows = HABITS.map((h) => ({ ...h, user_id: userId }));
  const { data: insertedHabits, error: habitsError } = await supabase
    .from("habits")
    .insert(habitRows)
    .select("id, name");

  if (habitsError || !insertedHabits) {
    console.error("Failed to create habits:", habitsError?.message);
    process.exit(1);
  }

  console.log(`  Created ${insertedHabits.length} habits`);

  // 3. Generate 45 days of context logs with realistic patterns
  const contextLogs: Record<string, unknown>[] = [];
  const moods = ["great", "good", "neutral", "low", "bad"];

  for (let daysAgo = 44; daysAgo >= 0; daysAgo--) {
    const date = dateStr(daysAgo);
    const dayOfWeek = new Date(date + "T00:00:00").getDay(); // 0=Sun
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
    const seed = daysAgo * 7;

    // Base context for the day — sleep and stress influence completion
    const sleepScore = Math.min(5, Math.max(1, Math.round(3.5 + seededRandom(seed) * 2.5 - 0.5)));
    const stressScore = Math.min(5, Math.max(1, Math.round(2 + seededRandom(seed + 1) * 3)));
    const baseMoodIdx = Math.round(
      sleepScore >= 4 && stressScore <= 2
        ? seededRandom(seed + 2) * 1.5
        : sleepScore <= 2 || stressScore >= 4
          ? 2.5 + seededRandom(seed + 2) * 2
          : 1 + seededRandom(seed + 2) * 2
    );
    const mood = moods[Math.min(4, baseMoodIdx)];
    const scheduleDisrupted = isWeekend ? seededRandom(seed + 3) > 0.6 : seededRandom(seed + 3) > 0.85;

    // Completion probability based on context
    const baseProb =
      sleepScore >= 4 ? 0.9 : sleepScore === 3 ? 0.75 : 0.55;
    const stressMod = stressScore >= 4 ? -0.15 : stressScore <= 2 ? 0.05 : 0;
    const disruptMod = scheduleDisrupted ? -0.2 : 0;
    const weekendMod = isWeekend ? -0.1 : 0;

    for (const habit of insertedHabits) {
      // Skip weekday-only habits on weekends sometimes
      const habitDef = HABITS.find((h) => h.name === habit.name);
      if (habitDef?.frequency === "weekdays" && isWeekend) continue;

      const habitSeed = seed + habit.name.length;
      let prob = baseProb + stressMod + disruptMod + weekendMod;

      // Some habits are harder to maintain
      if (habit.name.includes("Workout")) prob -= 0.05;
      if (habit.name.includes("Meditate")) prob += 0.05;
      if (habit.name.includes("water")) prob += 0.1;

      // Create a deliberate "missed streak" pattern around days 10-11 ago
      // to show the recovery nudge working
      if (daysAgo === 10 || daysAgo === 11) {
        if (habit.name.includes("Workout") || habit.name.includes("Journal")) {
          prob = 0.1;
        }
      }

      const completed = seededRandom(habitSeed + daysAgo) < Math.min(0.95, Math.max(0.2, prob));

      contextLogs.push({
        user_id: userId,
        habit_id: habit.id,
        date,
        completed,
        sleep_score: sleepScore,
        stress_score: stressScore,
        mood,
        schedule_disrupted: scheduleDisrupted,
        notes: null,
      });
    }
  }

  // Add a few notes on interesting days
  const noteDays = [3, 7, 14, 21, 30, 38];
  const noteTexts = [
    "Felt really great today — morning routine clicked perfectly.",
    "Tough day at work but still got most habits done. Proud of that.",
    "Traveled today, schedule was completely off but adapted well.",
    "Best week so far! Sleep has been consistently good.",
    "Noticed I do better on habits when stress is low. Need to manage that.",
    "Started strong this week. The workout is becoming automatic.",
  ];
  for (let i = 0; i < noteDays.length; i++) {
    const targetDate = dateStr(noteDays[i]);
    const log = contextLogs.find(
      (l) => l.date === targetDate && l.completed === true
    );
    if (log) log.notes = noteTexts[i];
  }

  // Insert in batches of 100
  for (let i = 0; i < contextLogs.length; i += 100) {
    const batch = contextLogs.slice(i, i + 100);
    const { error } = await supabase.from("context_logs").insert(batch);
    if (error) {
      console.error(`Failed to insert context_logs batch ${i}:`, error.message);
      process.exit(1);
    }
  }
  console.log(`  Created ${contextLogs.length} context log entries`);

  // 4. Generate 45 days of health check-ins
  const checkIns: Record<string, unknown>[] = [];

  for (let daysAgo = 44; daysAgo >= 0; daysAgo--) {
    const date = dateStr(daysAgo);
    const seed = daysAgo * 13;
    const isWeekend = [0, 6].includes(new Date(date + "T00:00:00").getDay());

    checkIns.push({
      user_id: userId,
      date,
      steps: rand(4000, 14000),
      sleep_hours: Math.round((5.5 + seededRandom(seed) * 3.5) * 2) / 2, // rounds to nearest 0.5
      calories: rand(1400, 2600),
      water_glasses: isWeekend ? rand(4, 10) : rand(5, 12),
    });
  }

  const { error: checkInError } = await supabase
    .from("daily_check_ins")
    .insert(checkIns);

  if (checkInError) {
    console.error("Failed to insert check-ins:", checkInError.message);
    process.exit(1);
  }
  console.log(`  Created ${checkIns.length} daily health check-ins`);

  // Summary
  console.log("\n✅ Demo account seeded successfully!");
  console.log(`   Email:    ${DEMO_EMAIL}`);
  console.log(`   Password: ${DEMO_PASSWORD}`);
  console.log(`   Habits:   ${insertedHabits.length}`);
  console.log(`   Logs:     ${contextLogs.length}`);
  console.log(`   Check-ins: ${checkIns.length}`);
  console.log(`\n   Users can click "Try Demo" on the login page.\n`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
