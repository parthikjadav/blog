import { getLesson, getTopicWithLessons } from '@/lib/learn'
import { notFound } from 'next/navigation'
import LearningSidebar from '@/components/learn/LearningSidebar'
import LessonContent from '@/components/learn/LessonContent'
import LessonNavigation from '@/components/learn/LessonNavigation'
import { Metadata } from 'next'

export async function generateMetadata({
  params
}: {
  params: Promise<{ topic: string; lesson: string }>
}): Promise<Metadata> {
  const { topic: topicSlug, lesson: lessonSlug } = await params
  const lesson = await getLesson(topicSlug, lessonSlug)

  if (!lesson) {
    return {
      title: 'Lesson Not Found'
    }
  }

  return {
    title: `${lesson.title} - ${lesson.topic.title}`,
    description: lesson.description || `Learn ${lesson.title}`,
    keywords: [lesson.topic.title, lesson.title, 'tutorial', 'learn']
  }
}

export default async function LessonPage({
  params
}: {
  params: Promise<{ topic: string; lesson: string }>
}) {
  const { topic: topicSlug, lesson: lessonSlug } = await params

  const [lesson, topicData] = await Promise.all([
    getLesson(topicSlug, lessonSlug),
    getTopicWithLessons(topicSlug)
  ])

  if (!lesson || !topicData) notFound()

  return (
    <div className="flex min-h-screen">
      <LearningSidebar
        topic={topicData}
        currentLessonSlug={lessonSlug}
      />

      <main className="flex-1 p-8 max-w-4xl mx-auto">
        {/* Top Navigation */}
        <div className="mb-8">
          <LessonNavigation
            topicSlug={topicSlug}
            prev={lesson.prev}
            next={lesson.next}
          />
        </div>

        <LessonContent lesson={lesson} />
        
        {/* Bottom Navigation */}
        <div className="mt-12 pt-8 border-t">
          <LessonNavigation
            topicSlug={topicSlug}
            prev={lesson.prev}
            next={lesson.next}
          />
        </div>
      </main>
    </div>
  )
}
