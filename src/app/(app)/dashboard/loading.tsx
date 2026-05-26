export default function DashboardLoading() {
  return (
    <div>
      <div className="flex items-baseline justify-between">
        <div className="h-8 w-16 animate-pulse rounded bg-gray-200" />
        <div className="h-4 w-32 animate-pulse rounded bg-gray-200" />
      </div>
      <div className="mt-6 space-y-4">
        <div className="flex items-center gap-3">
          <div className="h-2 flex-1 animate-pulse rounded-full bg-gray-200" />
          <div className="h-4 w-8 animate-pulse rounded bg-gray-200" />
        </div>
        <div className="divide-y divide-gray-100 rounded-lg border border-gray-200 bg-white">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex items-center gap-3 px-4 py-3">
              <div className="h-5 w-5 animate-pulse rounded border bg-gray-200" />
              <div className="h-4 flex-1 animate-pulse rounded bg-gray-200" />
              <div className="h-4 w-12 animate-pulse rounded bg-gray-200" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
