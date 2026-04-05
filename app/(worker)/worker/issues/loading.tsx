export default function Loading() {
  return (
    <div className="animate-pulse">
      <div className="flex items-center justify-between mb-5">
        <div>
          <div className="h-7 w-28 bg-gray-200 rounded mb-2" />
          <div className="h-4 w-48 bg-gray-100 rounded" />
        </div>
        <div className="h-8 w-20 bg-orange-100 rounded-full" />
      </div>
      <div className="h-14 bg-orange-50 rounded-xl border border-orange-100 mb-5" />
      <div className="space-y-3">
        {[1, 2, 3, 4, 5].map(i => (
          <div key={i} className="border border-gray-100 rounded-xl p-4 space-y-2">
            <div className="flex gap-2">
              <div className="h-4 w-16 bg-gray-200 rounded-full" />
              <div className="h-4 w-12 bg-gray-100 rounded-full" />
            </div>
            <div className="h-5 w-3/4 bg-gray-200 rounded" />
            <div className="flex justify-between mt-1">
              <div className="h-3 w-20 bg-gray-100 rounded" />
              <div className="h-3 w-8 bg-gray-100 rounded" />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
