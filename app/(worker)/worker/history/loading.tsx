export default function Loading() {
  return (
    <div className="animate-pulse">
      <div className="mb-5">
        <div className="h-7 w-24 bg-gray-200 rounded mb-2" />
        <div className="h-4 w-40 bg-gray-100 rounded" />
      </div>
      <div className="h-10 bg-gray-100 rounded-xl mb-4" />
      <div className="space-y-2">
        {[1, 2, 3, 4, 5].map(i => (
          <div key={i} className="border border-gray-100 rounded-xl p-4 space-y-2">
            <div className="flex justify-between">
              <div className="h-4 w-20 bg-gray-200 rounded" />
              <div className="h-4 w-16 bg-gray-100 rounded" />
            </div>
            <div className="h-3 w-32 bg-gray-100 rounded" />
          </div>
        ))}
      </div>
    </div>
  )
}
