import Link from 'next/link'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { BookOpen } from 'lucide-react'

interface TopicCardProps {
  topic: {
    slug: string
    title: string
    description: string | null
    _count: {
      lessons: number
    }
  }
}

export default function TopicCard({ topic }: TopicCardProps) {
  return (
    <Link href={`/learn/${topic.slug}`}>
      <Card className="hover:shadow-lg transition-shadow h-full hover:border-primary/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="w-5 h-5" />
            {topic.title}
          </CardTitle>
          {topic.description && (
            <CardDescription>{topic.description}</CardDescription>
          )}
        </CardHeader>
        <CardContent>
          <Badge variant="secondary">
            {topic._count.lessons} {topic._count.lessons === 1 ? 'lesson' : 'lessons'}
          </Badge>
        </CardContent>
      </Card>
    </Link>
  )
}
