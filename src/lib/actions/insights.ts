"use server";

import Anthropic from "@anthropic-ai/sdk";
import { createClient } from "@/lib/supabase/server";

type InsightsResult =
  | { status: "ok"; summary: string }
  | { status: "too_few"; message: string }
  | { status: "error"; message: string };

export async function generateInsights(
  habitId: string | "all"
): Promise<InsightsResult> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { status: "error", message: "Not authenticated" };
    }

    const sixtyDaysAgo = new Date(Date.now() - 60 * 86_400_000)
      .toISOString()
      .split("T")[0];

    let query = supabase
      .from("context_logs")
      .select("*, habits!inner(id, name)")
      .eq("user_id", user.id)
      .gte("date", sixtyDaysAgo)
      .order("date", { ascending: false });

    if (habitId !== "all") {
      query = query.eq("habit_id", habitId);
    }

    const { data: logs, error } = await query;

    if (error) {
      return { status: "error", message: error.message };
    }

    if (!logs || logs.length < 7) {
      return {
        status: "too_few",
        message: "Log at least 7 days of context to surface patterns.",
      };
    }

    const client = new Anthropic();

    const system =
      "You are an analyst helping a user understand their habit patterns. " +
      "Respond in plain, encouraging language. Be specific with numbers (percentages, counts). " +
      "Identify the top 2 to 3 correlations between context fields (sleep_score, stress_score, mood, schedule_disrupted) " +
      "and habit completion across the user's data as a whole. " +
      "Keep your response under 200 words. Do not use markdown headers.";

    const trimmed = logs.map((log) => ({
      habit: (log as { habits: { name: string } }).habits.name,
      date: log.date,
      completed: log.completed,
      sleep_score: log.sleep_score,
      stress_score: log.stress_score,
      mood: log.mood,
      schedule_disrupted: log.schedule_disrupted,
    }));

    let userMessage: string;

    if (habitId !== "all") {
      const habitName = trimmed[0].habit;
      userMessage =
        `Here are my logs for ${habitName} from the last 60 days. ` +
        `Each entry includes the date, whether I completed it, and the context I recorded. ` +
        `Identify the top patterns that explain when I succeed and when I slip.\n\n` +
        JSON.stringify(trimmed);
    } else {
      userMessage =
        `Here are all my habit logs from the last 60 days, across every habit I track. ` +
        `Aggregate the patterns across all habits — do not break the response down per habit. ` +
        `Identify the top context conditions that correlate with completion or skipping in general.\n\n` +
        JSON.stringify(trimmed);
    }

    const response = await client.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 500,
      system,
      messages: [{ role: "user", content: userMessage }],
    });

    const block = response.content[0];
    if (block.type !== "text") {
      return { status: "error", message: "Unexpected response format from AI" };
    }

    return { status: "ok", summary: block.text };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return { status: "error", message };
  }
}
