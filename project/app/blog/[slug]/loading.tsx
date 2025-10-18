import { Skeleton } from '@/components/ui/skeleton'

export default function Loading() {
  return (
    <div className="container py-12">
      {/* Back Button Skeleton */}
      <Skeleton className="h-10 w-32 mb-8" />

      <div className="flex gap-8">
        {/* Main Content */}
        <article className="flex-1 max-w-4xl">
          {/* Post Header Skeleton */}
          <div className="mb-8">
            <Skeleton className="h-4 w-24 mb-4" />
            <Skeleton className="h-12 w-full mb-4" />
            <Skeleton className="h-6 w-3/4 mb-6" />
            <div className="flex items-center gap-4">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-4 w-24" />
            </div>
          </div>

          {/* Featured Image Skeleton */}
          <Skeleton className="h-[400px] w-full rounded-lg mb-8" />

          {/* Content Skeleton */}
          <div className="space-y-4">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-5/6" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-4/5" />
            <Skeleton className="h-8 w-48 mt-8" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
          </div>
        </article>

        {/* Sidebar Skeleton (Desktop) */}
        <aside className="hidden lg:block w-64 shrink-0">
          <div className="sticky top-24">
            <Skeleton className="h-6 w-32 mb-4" />
            <div className="space-y-2">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-4 w-full" />
              ))}
            </div>
          </div>
        </aside>
      </div>
    </div>
  )
}
