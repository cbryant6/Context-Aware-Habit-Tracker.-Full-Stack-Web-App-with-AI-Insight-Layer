import { getTodayChallenge, getCategoryColors } from "@/lib/home-data";

export function DailyChallenge() {
  const challenge = getTodayChallenge();
  const colors = getCategoryColors(challenge.category);

  return (
    <div>
      <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-gray-500">
        Today&apos;s Challenge
      </h2>
      <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <span className="text-lg">⚡</span>
              <h3 className="text-base font-semibold text-gray-900">
                {challenge.title}
              </h3>
            </div>
            <p className="mt-2 text-sm leading-relaxed text-gray-600">
              {challenge.description}
            </p>
          </div>
          <span
            className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-medium ${colors.bg} ${colors.text}`}
          >
            {challenge.category}
          </span>
        </div>
      </div>
    </div>
  );
}
