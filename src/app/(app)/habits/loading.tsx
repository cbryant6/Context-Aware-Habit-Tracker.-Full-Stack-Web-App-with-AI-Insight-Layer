export default function HabitsLoading() {
  return (
    <div>
      <div className="h-8 w-20 animate-pulse rounded bg-gray-200" />
      <div className="mt-1 h-4 w-48 animate-pulse rounded bg-gray-200" />
      <div className="mt-6 space-y-4">
        <div className="h-9 w-28 animate-pulse rounded-md bg-gray-200" />
        <div className="divide-y divide-gray-100 rounded-lg border border-gray-200 bg-white">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex items-center justify-between px-4 py-3">
              <div className="space-y-1.5">
                <div className="h-4 w-36 animate-pulse rounded bg-gray-200" />
                <div className="h-3 w-20 animate-pulse rounded bg-gray-200" />
              </div>
              <div className="flex gap-2">
                <div className="h-7 w-10 animate-pulse rounded bg-gray-200" />
                <div className="h-7 w-16 animate-pulse rounded bg-gray-200" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
