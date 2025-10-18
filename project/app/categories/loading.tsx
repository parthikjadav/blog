export default function Loading() {
  return (
    <div className="container py-12">
      <div className="mb-8">
        <div className="h-10 w-40 bg-muted animate-pulse rounded mb-2" />
        <div className="h-4 w-64 bg-muted animate-pulse rounded" />
      </div>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="rounded-lg border p-6">
            <div className="h-6 bg-muted animate-pulse rounded mb-2" />
            <div className="h-4 bg-muted animate-pulse rounded w-3/4 mb-4" />
            <div className="h-4 bg-muted animate-pulse rounded w-1/4" />
          </div>
        ))}
      </div>
    </div>
  );
}
