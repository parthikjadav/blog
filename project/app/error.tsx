'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import { AlertCircle } from 'lucide-react'

import { Button } from '@/components/ui/button'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // TODO: Integrate with error reporting service (e.g., Sentry)
    // Errors are caught but not logged to avoid console pollution in production
  }, [error])

  return (
    <div className="container flex min-h-[600px] flex-col items-center justify-center py-12">
      <div className="mx-auto max-w-md text-center">
        <AlertCircle className="mx-auto h-12 w-12 text-destructive mb-6" />
        <h2 className="text-2xl font-bold mb-4">Something went wrong. We&apos;re working on fixing the problem.</h2>
        <p className="text-muted-foreground mb-6">
          We encountered an unexpected error. This has been logged and we&apos;ll look into it.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button onClick={reset}>
            Try again
          </Button>
          <Button asChild variant="outline">
            <Link href="/">
              Go home
            </Link>
          </Button>
        </div>
      </div>
    </div>
  )
}
