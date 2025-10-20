import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { ChevronLeft, ChevronRight } from 'lucide-react'

interface LessonNavigationProps {
  topicSlug: string
  prev: { slug: string; title: string } | null
  next: { slug: string; title: string } | null
}

export default function LessonNavigation({
  topicSlug,
  prev,
  next
}: LessonNavigationProps) {
  return (
    <div className="flex justify-between items-center gap-4">
      {prev ? (
        <Button asChild variant="outline" className="flex-1 max-w-xs">
          <Link href={`/learn/${topicSlug}/${prev.slug}`} className="flex items-center justify-start">
            <ChevronLeft className="w-4 h-4 mr-2 flex-shrink-0" />
            <span className="truncate">{prev.title}</span>
          </Link>
        </Button>
      ) : (
        <div className="flex-1 max-w-xs" />
      )}

      {next ? (
        <Button asChild className="flex-1 max-w-xs">
          <Link href={`/learn/${topicSlug}/${next.slug}`} className="flex items-center justify-end">
            <span className="truncate">{next.title}</span>
            <ChevronRight className="w-4 h-4 ml-2 flex-shrink-0" />
          </Link>
        </Button>
      ) : (
        <div className="flex-1 max-w-xs" />
      )}
    </div>
  )
}
