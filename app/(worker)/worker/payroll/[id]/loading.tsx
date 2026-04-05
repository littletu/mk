export default function Loading() {
  return (
    <div className="animate-pulse">
      <div className="flex items-center gap-3 mb-5">
        <div className="w-5 h-5 bg-gray-200 rounded" />
        <div>
          <div className="h-7 w-24 bg-gray-200 rounded mb-1" />
          <div className="h-4 w-40 bg-gray-100 rounded" />
        </div>
      </div>
      <div className="space-y-4">
        <div className="h-24 bg-orange-50 rounded-xl" />
        <div className="border border-gray-100 rounded-xl p-4 space-y-2">
          <div className="h-5 w-20 bg-gray-200 rounded mb-3" />
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="flex justify-between py-1.5">
              <div className="h-4 w-24 bg-gray-100 rounded" />
              <div className="h-4 w-20 bg-gray-100 rounded" />
            </div>
          ))}
        </div>
        <div className="border border-gray-100 rounded-xl p-4 space-y-2">
          <div className="h-5 w-28 bg-gray-200 rounded mb-3" />
          {[1, 2, 3].map(i => (
            <div key={i} className="h-12 bg-gray-50 rounded-lg" />
          ))}
        </div>
      </div>
    </div>
  )
}
