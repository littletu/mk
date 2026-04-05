export default function Loading() {
  return (
    <div className="animate-pulse">
      <div className="mb-5">
        <div className="h-7 w-32 bg-gray-200 rounded mb-2" />
        <div className="h-4 w-48 bg-gray-100 rounded" />
      </div>
      <div className="space-y-3">
        <div className="h-12 bg-gray-100 rounded-xl" />
        <div className="h-12 bg-gray-100 rounded-xl" />
        <div className="h-32 bg-gray-100 rounded-xl" />
        <div className="h-20 bg-gray-100 rounded-xl" />
        <div className="h-20 bg-gray-100 rounded-xl" />
      </div>
    </div>
  )
}
