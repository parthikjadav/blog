'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { AlertCircle } from 'lucide-react';

import { Button } from '@/components/ui/button';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Error is caught but not logged to console
    // TODO: Integrate error tracking service
  }, [error]);

  return (
    <div className="container flex min-h-[600px] flex-col items-center justify-center py-12">
      <div className="mx-auto max-w-md text-center">
        <AlertCircle className="mx-auto h-12 w-12 text-destructive mb-6" />
        <h2 className="text-2xl font-bold mb-4">Error Loading Tag</h2>
        <p className="text-muted-foreground mb-6">
          We couldn't load posts for this tag. Please try again.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button onClick={reset}>Try Again</Button>
          <Button asChild variant="outline">
            <Link href="/tags">View All Tags</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
