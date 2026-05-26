import { getTodayQuote } from "@/lib/home-data";

export function DailyQuote() {
  const quote = getTodayQuote();

  return (
    <div className="relative overflow-hidden rounded-2xl bg-neutral-900 px-6 py-8 text-white shadow-lg sm:px-8">
      <div className="pointer-events-none absolute -right-8 -top-8 h-40 w-40 rounded-full bg-violet-600/20 blur-2xl" />
      <div className="pointer-events-none absolute -bottom-6 -left-6 h-32 w-32 rounded-full bg-orange-500/15 blur-2xl" />
      <div className="relative">
        <svg
          className="mb-3 h-8 w-8 text-violet-400 opacity-60"
          viewBox="0 0 24 24"
          fill="currentColor"
        >
          <path d="M11.3 2.6C6 5.1 2.8 9.7 2.8 15v5.2h7V15H6c0-3.2 1.9-6 5.3-7.6L11.3 2.6zm11 0C17 5.1 13.8 9.7 13.8 15v5.2h7V15H17c0-3.2 1.9-6 5.3-7.6L22.3 2.6z" />
        </svg>
        <p className="text-lg font-medium leading-relaxed sm:text-xl">
          {quote.text}
        </p>
        <p className="mt-4 text-sm text-neutral-400">— {quote.author}</p>
      </div>
    </div>
  );
}
