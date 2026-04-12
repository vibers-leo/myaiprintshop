export default function Loading() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="h-16" />
      {/* Banner skeleton */}
      <div className="h-64 bg-gray-200 animate-pulse" />
      <div className="max-w-6xl mx-auto px-4 -mt-16 relative z-10">
        <div className="bg-white rounded-2xl p-8 shadow-lg animate-pulse">
          <div className="flex gap-6">
            <div className="w-28 h-28 bg-gray-200 rounded-2xl -mt-20" />
            <div className="flex-1 space-y-3">
              <div className="h-8 bg-gray-200 rounded w-48" />
              <div className="h-4 bg-gray-200 rounded w-72" />
            </div>
          </div>
        </div>
      </div>
      <div className="max-w-6xl mx-auto px-4 py-10">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-white rounded-2xl overflow-hidden border border-gray-100 animate-pulse">
              <div className="aspect-square bg-gray-200" />
              <div className="p-4 space-y-2">
                <div className="h-4 bg-gray-200 rounded w-3/4" />
                <div className="h-5 bg-gray-200 rounded w-1/3" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
