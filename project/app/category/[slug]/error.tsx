'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import { FolderX } from 'lucide-react'

import { Button } from '@/components/ui/button'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error('Category error:', error)
  }, [error])

  return (
    <div className="container flex min-h-[600px] flex-col items-center justify-center py-12">
      <div className="mx-auto max-w-md text-center">
        <FolderX className="mx-auto h-12 w-12 text-muted-foreground mb-6" />
        <h2 className="text-2xl font-bold mb-4">Category not found</h2>
        <p className="text-muted-foreground mb-6">
          We couldn&apos;t load this category. Please try again later. It may not exist or has been removed.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button onClick={reset}>
            Try again
          </Button>
          <Button asChild variant="outline">
            <Link href="/categories">
              View all categories
            </Link>
          </Button>
        </div>
      </div>
    </div>
  )
}
