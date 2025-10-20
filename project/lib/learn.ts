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
 * Get all published topics with lesson count
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
 * Get a single topic with all its published lessons and sections
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
 * Get a single lesson with navigation (prev/next)
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
 * Get topic progress (for future use with user tracking)
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
