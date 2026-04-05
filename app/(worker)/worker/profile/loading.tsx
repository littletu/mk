export default function Loading() {
  return (
    <div className="animate-pulse">
      <div className="mb-5">
        <div className="h-7 w-24 bg-gray-200 rounded mb-2" />
        <div className="h-4 w-52 bg-gray-100 rounded" />
      </div>
      {/* Points card */}
      <div className="h-32 bg-orange-200 rounded-2xl mb-5" />
      {/* Profile card */}
      <div className="border border-gray-100 rounded-xl p-4 space-y-3 mb-4">
        <div className="flex justify-between">
          <div className="h-5 w-24 bg-gray-200 rounded" />
          <div className="w-7 h-7 bg-gray-100 rounded" />
        </div>
        {[1, 2, 3, 4].map(i => (
          <div key={i} className="flex justify-between py-2 border-b border-gray-50">
            <div className="h-4 w-16 bg-gray-100 rounded" />
            <div className="h-4 w-28 bg-gray-200 rounded" />
          </div>
        ))}
      </div>
      {/* Password card */}
      <div className="border border-gray-100 rounded-xl p-4">
        <div className="h-5 w-20 bg-gray-200 rounded" />
      </div>
    </div>
  )
}
