export default function Loading() {
  return (
    <div className="container py-12">
      <div className="mb-8">
        <div className="h-10 w-32 bg-muted animate-pulse rounded mb-2" />
        <div className="h-4 w-64 bg-muted animate-pulse rounded" />
      </div>
      <div className="flex flex-wrap gap-3">
        {[...Array(20)].map((_, i) => (
          <div key={i} className="h-8 w-24 bg-muted animate-pulse rounded-full" />
        ))}
      </div>
    </div>
  );
}
