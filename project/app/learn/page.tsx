import { getAllTopics, TopicWithLessons } from '@/lib/learn'
import TopicCard from '@/components/learn/TopicCard'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Learn - Interactive Tutorials',
  description: 'Learn web development with interactive tutorials and hands-on lessons',
  keywords: ['tutorials', 'learn', 'web development', 'programming', 'courses']
}

export default async function LearnPage() {
  const topics = await getAllTopics()

  return (
    <div className="container py-12">
      <div className="mb-12">
        <h1 className="text-4xl font-bold mb-4">Learn</h1>
        <p className="text-lg text-muted-foreground">
          Choose a topic to start learning with interactive tutorials
        </p>
      </div>

      {topics.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground">No topics available yet. Check back soon!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {topics.map((topic: any) => (
            <TopicCard key={topic.id} topic={topic} />
          ))}
        </div>
      )}
    </div>
  )
}
