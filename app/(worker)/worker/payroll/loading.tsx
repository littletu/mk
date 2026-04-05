export default function Loading() {
  return (
    <div className="animate-pulse">
      <div className="mb-5">
        <div className="h-7 w-24 bg-gray-200 rounded mb-2" />
        <div className="h-4 w-56 bg-gray-100 rounded" />
      </div>
      <div className="space-y-4">
        {[1, 2, 3].map(i => (
          <div key={i} className="border border-gray-100 rounded-xl p-4 space-y-3">
            <div className="flex justify-between">
              <div className="h-5 w-40 bg-gray-200 rounded" />
              <div className="h-5 w-16 bg-gray-100 rounded" />
            </div>
            <div className="h-16 bg-orange-50 rounded-lg" />
            <div className="grid grid-cols-2 gap-2">
              <div className="h-14 bg-gray-100 rounded" />
              <div className="h-14 bg-gray-100 rounded" />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
