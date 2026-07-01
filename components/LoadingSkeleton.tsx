export function LoadingSkeleton() {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6">
      {Array.from({ length: 6 }).map((_, i) => (
        <div
          key={i}
          className="bg-white rounded-lg overflow-hidden border border-gray-200 animate-pulse"
        >
          <div className="aspect-square bg-gray-300" />
          <div className="p-4 flex flex-col gap-3">
            <div className="h-4 bg-gray-300 rounded w-3/4" />
            <div className="h-4 bg-gray-300 rounded w-1/2" />
            <div className="h-11 bg-gray-300 rounded w-full mt-2" />
          </div>
        </div>
      ))}
    </div>
  )
}
