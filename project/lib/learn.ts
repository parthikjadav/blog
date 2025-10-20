import { prisma } from '@/lib/prisma'
import { compileMDX } from 'next-mdx-remote/rsc'
import remarkGfm from 'remark-gfm'
import { rehypePlugins } from '@/lib/rehype-config'
import { mdxComponents } from '@/lib/mdx-components'

export interface LessonWithNavigation {
  id: string
  slug: string
  title: string
  description: string | null
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  content: any // Compiled MDX
  duration: number | null
  topic: {
    id: string
    slug: string
    title: string
  }
  prev: { slug: string; title: string } | null
  next: { slug: string; title: string } | null
}

export interface SectionWithLessons {
  id: string
  slug: string
  title: string
  description: string | null
  icon: string | null
  order: number
  lessons: Array<{
    id: string
    slug: string
    title: string
    description: string | null
    duration: number | null
    order: number
  }>
}

export interface TopicWithLessons {
  id: string
  slug: string
  title: string
  description: string | null
  icon: string | null
  order: number
  sections: SectionWithLessons[]
  lessons: Array<{
    id: string
    slug: string
    title: string
    description: string | null
    duration: number | null
    order: number
  }>
}

/**
 * Fetches all published learning topics with lesson counts
 * @returns Promise resolving to array of topics sorted by order, including lesson count
 * @throws {Error} When database query fails
 * @example
 * const topics = await getAllTopics()
 * console.log(topics[0]._count.lessons) // Number of lessons
 */
export async function getAllTopics() {
  return await prisma.topic.findMany({
    where: { published: true },
    orderBy: { order: 'asc' },
    include: {
      _count: {
        select: { lessons: { where: { published: true } } }
      }
    }
  })
}

/**
 * Fetches a single topic with all its published lessons and sections
 * @param topicSlug - The URL-friendly slug of the topic (e.g., 'html', 'css')
 * @returns Promise resolving to topic with lessons and sections, or null if not found
 * @throws {Error} When database query fails
 * @example
 * const topic = await getTopicWithLessons('html')
 * if (topic) {
 *   console.log(topic.lessons.length) // Standalone lessons
 *   console.log(topic.sections.length) // Sections with nested lessons
 * }
 */
export async function getTopicWithLessons(topicSlug: string): Promise<TopicWithLessons | null> {
  return await prisma.topic.findUnique({
    where: { slug: topicSlug, published: true },
    include: {
      sections: {
        where: { published: true },
        orderBy: { order: 'asc' },
        include: {
          lessons: {
            where: { published: true },
            orderBy: { order: 'asc' },
            select: {
              id: true,
              slug: true,
              title: true,
              description: true,
              duration: true,
              order: true
            }
          }
        }
      },
      lessons: {
        where: { 
          published: true,
          sectionId: null  // Only standalone lessons (not in sections)
        },
        orderBy: { order: 'asc' },
        select: {
          id: true,
          slug: true,
          title: true,
          description: true,
          duration: true,
          order: true
        }
      }
    }
  })
}

/**
 * Fetches a single lesson with compiled MDX content and navigation links
 * @param topicSlug - The URL-friendly slug of the parent topic
 * @param lessonSlug - The URL-friendly slug of the lesson
 * @returns Promise resolving to lesson with prev/next navigation, or null if not found
 * @throws {Error} When database query or MDX compilation fails
 * @example
 * const lesson = await getLesson('html', 'introduction')
 * if (lesson) {
 *   console.log(lesson.content) // Compiled MDX
 *   console.log(lesson.prev?.title) // Previous lesson title
 *   console.log(lesson.next?.title) // Next lesson title
 * }
 */
export async function getLesson(
  topicSlug: string,
  lessonSlug: string
): Promise<LessonWithNavigation | null> {
  const topic = await prisma.topic.findUnique({
    where: { slug: topicSlug, published: true },
    include: {
      lessons: {
        where: { published: true },
        orderBy: { order: 'asc' }
      }
    }
  })

  if (!topic) return null

  const currentIndex = topic.lessons.findIndex(l => l.slug === lessonSlug)
  if (currentIndex === -1) return null

  const currentLesson = topic.lessons[currentIndex]

  // Compile MDX content with same plugins as blog posts
  const { content } = await compileMDX({
    source: currentLesson.content,
    options: {
      parseFrontmatter: true,
      mdxOptions: {
        remarkPlugins: [remarkGfm],
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        rehypePlugins: rehypePlugins as any
      }
    },
    components: mdxComponents
  })

  return {
    id: currentLesson.id,
    slug: currentLesson.slug,
    title: currentLesson.title,
    description: currentLesson.description,
    content,
    duration: currentLesson.duration,
    topic: {
      id: topic.id,
      slug: topic.slug,
      title: topic.title
    },
    prev: currentIndex > 0
      ? { slug: topic.lessons[currentIndex - 1].slug, title: topic.lessons[currentIndex - 1].title }
      : null,
    next: currentIndex < topic.lessons.length - 1
      ? { slug: topic.lessons[currentIndex + 1].slug, title: topic.lessons[currentIndex + 1].title }
      : null
  }
}

/**
 * Calculates learning progress for a topic based on completed lessons
 * @param topicSlug - The URL-friendly slug of the topic
 * @param completedLessonIds - Array of lesson IDs that have been completed (default: [])
 * @returns Promise resolving to progress object with total, completed count, and percentage
 * @throws {Error} When database query fails
 * @example
 * const progress = await getTopicProgress('html', ['lesson-id-1', 'lesson-id-2'])
 * console.log(`${progress.percentage}% complete`) // e.g., "50% complete"
 */
export async function getTopicProgress(topicSlug: string, completedLessonIds: string[] = []) {
  const topic = await getTopicWithLessons(topicSlug)
  if (!topic) return null

  const totalLessons = topic.lessons.length
  const completedCount = topic.lessons.filter(l =>
    completedLessonIds.includes(l.id)
  ).length

  return {
    total: totalLessons,
    completed: completedCount,
    percentage: totalLessons > 0 ? Math.round((completedCount / totalLessons) * 100) : 0
  }
}
