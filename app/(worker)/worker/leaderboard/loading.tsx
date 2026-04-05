export default function Loading() {
  return (
    <div className="animate-pulse">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-5 h-5 bg-gray-200 rounded" />
        <div>
          <div className="h-7 w-28 bg-gray-200 rounded mb-1" />
          <div className="h-4 w-36 bg-gray-100 rounded" />
        </div>
      </div>
      <div className="space-y-2">
        {[1, 2, 3, 4, 5].map(i => (
          <div key={i} className={`flex items-center gap-3 p-3 rounded-xl border ${i === 1 ? 'border-yellow-200 bg-yellow-50' : i === 2 ? 'border-gray-200 bg-gray-50' : 'border-gray-100 bg-white'}`}>
            <div className="w-7 h-7 bg-gray-200 rounded" />
            <div className="w-9 h-9 bg-gray-200 rounded-full shrink-0" />
            <div className="flex-1 space-y-1.5">
              <div className="h-4 w-24 bg-gray-200 rounded" />
              <div className="h-3 w-40 bg-gray-100 rounded" />
            </div>
            <div className="text-right space-y-1">
              <div className="h-6 w-10 bg-orange-100 rounded ml-auto" />
              <div className="h-3 w-6 bg-gray-100 rounded ml-auto" />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
