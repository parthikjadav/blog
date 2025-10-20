import { Badge } from '@/components/ui/badge'
import { Clock } from 'lucide-react'

interface LessonContentProps {
  lesson: {
    title: string
    description: string | null
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    content: any
    duration: number | null
    topic: {
      title: string
    }
  }
}

export default function LessonContent({ lesson }: LessonContentProps) {
  return (
    <article className="prose prose-slate dark:prose-invert max-w-none">
      <div className="mb-6 not-prose">
        <Badge variant="secondary" className="mb-2">
          {lesson.topic.title}
        </Badge>
        <h1 className="text-4xl font-bold mb-2">{lesson.title}</h1>
        {lesson.description && (
          <p className="text-lg text-muted-foreground">{lesson.description}</p>
        )}
        {lesson.duration && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground mt-2">
            <Clock className="w-4 h-4" />
            <span>{lesson.duration} min read</span>
          </div>
        )}
      </div>

      <div className="mdx-content">
        {lesson.content}
      </div>
    </article>
  )
}
