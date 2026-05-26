export default function InsightsLoading() {
  return (
    <div>
      <div className="h-8 w-24 animate-pulse rounded bg-gray-200" />
      <div className="mt-1 h-4 w-56 animate-pulse rounded bg-gray-200" />
      <div className="mt-6 space-y-4">
        {/* Chart skeleton */}
        <div className="rounded-lg border border-gray-200 bg-white px-4 py-4">
          <div className="mb-3 h-4 w-40 animate-pulse rounded bg-gray-200" />
          <div className="flex items-end gap-1 h-[180px] px-2">
            {Array.from({ length: 15 }).map((_, i) => (
              <div
                key={i}
                className="flex-1 animate-pulse rounded-t bg-gray-200"
                style={{ height: `${20 + Math.sin(i) * 30 + 40}px` }}
              />
            ))}
          </div>
        </div>
        {/* Controls skeleton */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
          <div className="flex-1 space-y-1">
            <div className="h-4 w-10 animate-pulse rounded bg-gray-200" />
            <div className="h-9 w-full animate-pulse rounded-md bg-gray-200" />
          </div>
          <div className="h-9 w-full animate-pulse rounded-md bg-gray-200 sm:w-36" />
        </div>
      </div>
    </div>
  );
}
