export default function Loading() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-orange-50">
      <div className="h-16" />
      <div className="max-w-6xl mx-auto px-4 pt-12 pb-20 animate-pulse">
        <div className="h-10 bg-gray-200 rounded w-56 mb-3" />
        <div className="h-5 bg-gray-200 rounded w-80 mb-10" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="bg-white rounded-2xl overflow-hidden border border-gray-100">
              <div className="h-32 bg-gray-200" />
              <div className="p-5 space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-14 h-14 bg-gray-200 rounded-xl -mt-8" />
                  <div className="space-y-2 flex-1">
                    <div className="h-4 bg-gray-200 rounded w-2/3" />
                    <div className="h-3 bg-gray-200 rounded w-1/3" />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
