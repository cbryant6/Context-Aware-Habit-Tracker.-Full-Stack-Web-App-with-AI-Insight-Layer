export default function HistoryLoading() {
  return (
    <div>
      <div className="h-8 w-20 animate-pulse rounded bg-gray-200" />
      <div className="mt-1 h-4 w-48 animate-pulse rounded bg-gray-200" />
      <div className="mt-6 space-y-6">
        <div className="h-9 w-full animate-pulse rounded-md bg-gray-200 sm:w-64" />
        {[1, 2].map((group) => (
          <div key={group} className="space-y-3">
            <div className="h-4 w-40 animate-pulse rounded bg-gray-200" />
            {[1, 2, 3].map((i) => (
              <div key={i} className="rounded-lg border border-gray-200 bg-white px-4 py-3 space-y-2">
                <div className="flex items-center gap-2">
                  <div className="h-5 w-5 animate-pulse rounded-full bg-gray-200" />
                  <div className="h-4 w-32 animate-pulse rounded bg-gray-200" />
                  <div className="h-4 w-16 animate-pulse rounded-full bg-gray-200" />
                </div>
                <div className="flex gap-2">
                  <div className="h-5 w-16 animate-pulse rounded-full bg-gray-200" />
                  <div className="h-5 w-16 animate-pulse rounded-full bg-gray-200" />
                  <div className="h-5 w-16 animate-pulse rounded-full bg-gray-200" />
                </div>
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
