import { getTopicWithLessons } from '@/lib/learn'
import { redirect, notFound } from 'next/navigation'

export default async function TopicPage({
  params
}: {
  params: Promise<{ topic: string }>
}) {
  const { topic: topicSlug } = await params
  const topic = await getTopicWithLessons(topicSlug)

  if (!topic) notFound()

  if (topic.lessons.length === 0) {
    return (
      <div className="container py-12">
        <h1 className="text-4xl font-bold mb-4">{topic.title}</h1>
        <p className="text-muted-foreground">No lessons available yet for this topic.</p>
      </div>
    )
  }

  // Redirect to first lesson
  redirect(`/learn/${topicSlug}/${topic.lessons[0].slug}`)
}
