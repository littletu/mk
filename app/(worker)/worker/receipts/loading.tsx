export default function Loading() {
  return (
    <div className="animate-pulse">
      <div className="mb-5">
        <div className="h-7 w-28 bg-gray-200 rounded mb-2" />
        <div className="h-4 w-52 bg-gray-100 rounded" />
      </div>
      <div className="space-y-3">
        <div className="h-40 bg-gray-100 rounded-xl border-2 border-dashed border-gray-200" />
        <div className="h-12 bg-gray-100 rounded-xl" />
        <div className="h-12 bg-gray-100 rounded-xl" />
        <div className="space-y-2 mt-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-16 bg-gray-50 rounded-xl" />
          ))}
        </div>
      </div>
    </div>
  )
}
