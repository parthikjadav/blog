'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import { FileQuestion } from 'lucide-react'

import { Button } from '@/components/ui/button'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error('Blog post error:', error)
  }, [error])

  return (
    <div className="container flex min-h-[600px] flex-col items-center justify-center py-12">
      <div className="mx-auto max-w-md text-center">
        <FileQuestion className="mx-auto h-12 w-12 text-muted-foreground mb-6" />
        <h2 className="text-2xl font-bold mb-4">Failed to load post</h2>
        <p className="text-muted-foreground mb-6">
          We couldn't load this blog post. It may have been moved or deleted.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button onClick={reset}>
            Try again
          </Button>
          <Button asChild variant="outline">
            <Link href="/blog">
              View all posts
            </Link>
          </Button>
        </div>
      </div>
    </div>
  )
}
