# Phase 8: Learning Platform with Dynamic Content

## Overview
Create a W3Schools-style learning platform with PostgreSQL/Prisma backend and shadcn/ui collapsible sidebar navigation.

**Route:** `/learn/[topic]/[lesson]`

---

## 1. Database Schema Design

### Prisma Schema Updates (`prisma/schema.prisma`)

```prisma
model Topic {
  id          String   @id @default(uuid())
  slug        String   @unique
  title       String
  description String?
  icon        String?  // Icon name for sidebar
  order       Int      // Display order
  published   Boolean  @default(false)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  
  lessons     Lesson[]
  
  @@index([slug])
  @@index([published])
  @@index([order])
}

model Lesson {
  id          String   @id @default(uuid())
  slug        String
  title       String
  description String?
  content     String   @db.Text  // MDX content
  order       Int      // Order within topic
  published   Boolean  @default(false)
  duration    Int?     // Estimated reading time in minutes
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  
  topicId     String
  topic       Topic    @relation(fields: [topicId], references: [id], onDelete: Cascade)
  
  @@unique([topicId, slug])
  @@index([slug])
  @@index([published])
  @@index([topicId, order])
}
```

**Migration Command:**
```bash
npx prisma migrate dev --name add_learning_platform
```

---

## 2. Library Functions

### Create `lib/learn.ts`

```typescript
import { prisma } from '@/lib/prisma'
import { compileMDX } from 'next-mdx-remote/rsc'
import rehypeHighlight from 'rehype-highlight'
import rehypeSlug from 'rehype-slug'
import rehypeAutolinkHeadings from 'rehype-autolink-headings'
import remarkGfm from 'remark-gfm'

export interface LessonWithNavigation {
  id: string
  slug: string
  title: string
  description: string | null
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

export async function getTopicWithLessons(topicSlug: string) {
  return await prisma.topic.findUnique({
    where: { slug: topicSlug, published: true },
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
  })
}

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
  
  // Compile MDX content
  const { content } = await compileMDX({
    source: currentLesson.content,
    options: {
      parseFrontmatter: true,
      mdxOptions: {
        remarkPlugins: [remarkGfm],
        rehypePlugins: [
          rehypeHighlight,
          rehypeSlug,
          [rehypeAutolinkHeadings, { behavior: 'wrap' }]
        ]
      }
    }
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

export async function getTopicProgress(topicSlug: string, completedLessonIds: string[]) {
  const topic = await getTopicWithLessons(topicSlug)
  if (!topic) return null

  const totalLessons = topic.lessons.length
  const completedCount = topic.lessons.filter(l => 
    completedLessonIds.includes(l.id)
  ).length

  return {
    total: totalLessons,
    completed: completedCount,
    percentage: totalLessons > 0 ? (completedCount / totalLessons) * 100 : 0
  }
}
```

---

## 3. Route Structure

### Create Route Files

**`app/learn/page.tsx`** - Topics listing page
```typescript
import { getAllTopics } from '@/lib/learn'
import TopicCard from '@/components/learn/TopicCard'

export const metadata = {
  title: 'Learn - Interactive Tutorials',
  description: 'Learn web development with interactive tutorials'
}

export default async function LearnPage() {
  const topics = await getAllTopics()

  return (
    <div className="container py-12">
      <h1 className="text-4xl font-bold mb-4">Learn</h1>
      <p className="text-muted-foreground mb-8">
        Choose a topic to start learning
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {topics.map((topic) => (
          <TopicCard key={topic.id} topic={topic} />
        ))}
      </div>
    </div>
  )
}
```

**`app/learn/[topic]/page.tsx`** - Topic overview (redirects to first lesson)
```typescript
import { getTopicWithLessons } from '@/lib/learn'
import { redirect, notFound } from 'next/navigation'

export default async function TopicPage({ 
  params 
}: { 
  params: { topic: string } 
}) {
  const topic = await getTopicWithLessons(params.topic)
  
  if (!topic) notFound()
  if (topic.lessons.length === 0) {
    return <div>No lessons available yet.</div>
  }

  // Redirect to first lesson
  redirect(`/learn/${params.topic}/${topic.lessons[0].slug}`)
}
```

**`app/learn/[topic]/[lesson]/page.tsx`** - Lesson page with sidebar
```typescript
import { getLesson, getTopicWithLessons } from '@/lib/learn'
import { notFound } from 'next/navigation'
import LearningSidebar from '@/components/learn/LearningSidebar'
import LessonContent from '@/components/learn/LessonContent'
import LessonNavigation from '@/components/learn/LessonNavigation'

export async function generateMetadata({ 
  params 
}: { 
  params: { topic: string; lesson: string } 
}) {
  const lesson = await getLesson(params.topic, params.lesson)
  
  if (!lesson) return {}

  return {
    title: `${lesson.title} - ${lesson.topic.title}`,
    description: lesson.description || `Learn ${lesson.title}`
  }
}

export default async function LessonPage({ 
  params 
}: { 
  params: { topic: string; lesson: string } 
}) {
  const [lesson, topicData] = await Promise.all([
    getLesson(params.topic, params.lesson),
    getTopicWithLessons(params.topic)
  ])

  if (!lesson || !topicData) notFound()

  return (
    <div className="flex min-h-screen">
      <LearningSidebar 
        topic={topicData} 
        currentLessonSlug={params.lesson}
      />
      
      <main className="flex-1 p-8 max-w-4xl mx-auto">
        <LessonContent lesson={lesson} />
        <LessonNavigation 
          topicSlug={params.topic}
          prev={lesson.prev}
          next={lesson.next}
        />
      </main>
    </div>
  )
}
```

---

## 4. Shadcn/UI Components

### Install Required Shadcn Components

```bash
npx shadcn@latest add sidebar
npx shadcn@latest add collapsible
npx shadcn@latest add button
npx shadcn@latest add card
npx shadcn@latest add badge
npx shadcn@latest add progress
```

### Create `components/learn/LearningSidebar.tsx`

```typescript
'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { ChevronRight, BookOpen, CheckCircle2 } from 'lucide-react'
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
} from '@/components/ui/sidebar'
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible'
import { cn } from '@/lib/utils'

interface LearningSidebarProps {
  topic: {
    id: string
    slug: string
    title: string
    lessons: Array<{
      id: string
      slug: string
      title: string
      duration: number | null
    }>
  }
  currentLessonSlug: string
}

export default function LearningSidebar({ 
  topic, 
  currentLessonSlug 
}: LearningSidebarProps) {
  const pathname = usePathname()

  return (
    <SidebarProvider>
      <Sidebar className="border-r">
        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupLabel className="text-lg font-bold px-4 py-3">
              <BookOpen className="w-5 h-5 mr-2 inline" />
              {topic.title}
            </SidebarGroupLabel>
            
            <SidebarGroupContent>
              <SidebarMenu>
                {topic.lessons.map((lesson, index) => {
                  const isActive = lesson.slug === currentLessonSlug
                  const lessonUrl = `/learn/${topic.slug}/${lesson.slug}`
                  
                  return (
                    <SidebarMenuItem key={lesson.id}>
                      <SidebarMenuButton
                        asChild
                        isActive={isActive}
                        className={cn(
                          "w-full justify-start",
                          isActive && "bg-primary text-primary-foreground"
                        )}
                      >
                        <Link href={lessonUrl}>
                          <span className="flex items-center gap-2 flex-1">
                            <span className="text-xs text-muted-foreground">
                              {String(index + 1).padStart(2, '0')}
                            </span>
                            <span className="flex-1">{lesson.title}</span>
                            {lesson.duration && (
                              <span className="text-xs text-muted-foreground">
                                {lesson.duration}m
                              </span>
                            )}
                          </span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  )
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>
      </Sidebar>
    </SidebarProvider>
  )
}
```

### Create `components/learn/LessonContent.tsx`

```typescript
import { Badge } from '@/components/ui/badge'
import { Clock } from 'lucide-react'

interface LessonContentProps {
  lesson: {
    title: string
    description: string | null
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
      <div className="mb-6">
        <Badge variant="secondary" className="mb-2">
          {lesson.topic.title}
        </Badge>
        <h1 className="mb-2">{lesson.title}</h1>
        {lesson.description && (
          <p className="text-lg text-muted-foreground">{lesson.description}</p>
        )}
        {lesson.duration && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
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
```

### Create `components/learn/LessonNavigation.tsx`

```typescript
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
    <div className="flex justify-between items-center mt-12 pt-8 border-t">
      {prev ? (
        <Button asChild variant="outline">
          <Link href={`/learn/${topicSlug}/${prev.slug}`}>
            <ChevronLeft className="w-4 h-4 mr-2" />
            {prev.title}
          </Link>
        </Button>
      ) : (
        <div />
      )}

      {next && (
        <Button asChild>
          <Link href={`/learn/${topicSlug}/${next.slug}`}>
            {next.title}
            <ChevronRight className="w-4 h-4 ml-2" />
          </Link>
        </Button>
      )}
    </div>
  )
}
```

### Create `components/learn/TopicCard.tsx`

```typescript
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
      <Card className="hover:shadow-lg transition-shadow h-full">
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
```

---

## 5. Admin API Routes (Optional - for managing content)

### Create `app/api/admin/topics/route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const TopicSchema = z.object({
  slug: z.string().min(1).max(100),
  title: z.string().min(1).max(150),
  description: z.string().optional(),
  icon: z.string().optional(),
  order: z.number().int().min(0),
  published: z.boolean().default(false)
})

// GET all topics
export async function GET() {
  try {
    const topics = await prisma.topic.findMany({
      orderBy: { order: 'asc' },
      include: {
        _count: { select: { lessons: true } }
      }
    })
    return NextResponse.json({ topics })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch topics' }, { status: 500 })
  }
}

// POST create topic
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const data = TopicSchema.parse(body)
    
    const topic = await prisma.topic.create({ data })
    return NextResponse.json({ topic }, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Validation failed', issues: error.errors }, { status: 400 })
    }
    return NextResponse.json({ error: 'Failed to create topic' }, { status: 500 })
  }
}
```

### Create `app/api/admin/lessons/route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const LessonSchema = z.object({
  slug: z.string().min(1).max(100),
  title: z.string().min(1).max(150),
  description: z.string().optional(),
  content: z.string().min(1),
  order: z.number().int().min(0),
  duration: z.number().int().min(0).optional(),
  published: z.boolean().default(false),
  topicId: z.string().uuid()
})

// POST create lesson
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const data = LessonSchema.parse(body)
    
    const lesson = await prisma.lesson.create({ data })
    return NextResponse.json({ lesson }, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Validation failed', issues: error.errors }, { status: 400 })
    }
    return NextResponse.json({ error: 'Failed to create lesson' }, { status: 500 })
  }
}
```

---

## 6. Seed Data Script

### Create `scripts/seed-learning-content.ts`

```typescript
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seeding learning content...\n')

  // Create HTML Topic
  const htmlTopic = await prisma.topic.create({
    data: {
      slug: 'html',
      title: 'HTML Tutorial',
      description: 'Learn HTML from basics to advanced',
      order: 1,
      published: true,
      lessons: {
        create: [
          {
            slug: 'introduction',
            title: 'HTML Introduction',
            description: 'What is HTML and why learn it?',
            content: `# HTML Introduction

HTML is the standard markup language for Web pages.

With HTML you can create your own Website.

HTML is easy to learn - You will enjoy it!

## What is HTML?

- HTML stands for Hyper Text Markup Language
- HTML is the standard markup language for creating Web pages
- HTML describes the structure of a Web page
- HTML consists of a series of elements
- HTML elements tell the browser how to display the content`,
            order: 1,
            duration: 5,
            published: true
          },
          {
            slug: 'elements',
            title: 'HTML Elements',
            description: 'Understanding HTML elements and tags',
            content: `# HTML Elements

An HTML element is defined by a start tag, some content, and an end tag.

## Syntax

\`\`\`html
<tagname>Content goes here...</tagname>
\`\`\`

## Example

\`\`\`html
<h1>My First Heading</h1>
<p>My first paragraph.</p>
\`\`\``,
            order: 2,
            duration: 8,
            published: true
          },
          {
            slug: 'attributes',
            title: 'HTML Attributes',
            description: 'Learn about HTML attributes',
            content: `# HTML Attributes

HTML attributes provide additional information about HTML elements.

## Key Points

- All HTML elements can have attributes
- Attributes provide additional information about elements
- Attributes are always specified in the start tag
- Attributes usually come in name/value pairs like: name="value"

## Example

\`\`\`html
<a href="https://www.example.com">Visit Example</a>
<img src="image.jpg" alt="Description">
\`\`\``,
            order: 3,
            duration: 10,
            published: true
          }
        ]
      }
    }
  })

  // Create CSS Topic
  const cssTopic = await prisma.topic.create({
    data: {
      slug: 'css',
      title: 'CSS Tutorial',
      description: 'Learn CSS styling from scratch',
      order: 2,
      published: true,
      lessons: {
        create: [
          {
            slug: 'introduction',
            title: 'CSS Introduction',
            description: 'What is CSS?',
            content: `# CSS Introduction

CSS is the language we use to style an HTML document.

CSS describes how HTML elements should be displayed.

## What is CSS?

- CSS stands for Cascading Style Sheets
- CSS describes how HTML elements are to be displayed
- CSS saves a lot of work
- External stylesheets are stored in CSS files`,
            order: 1,
            duration: 5,
            published: true
          },
          {
            slug: 'selectors',
            title: 'CSS Selectors',
            description: 'Understanding CSS selectors',
            content: `# CSS Selectors

CSS selectors are used to "find" (or select) the HTML elements you want to style.

## Types of Selectors

1. Element Selector
2. ID Selector
3. Class Selector
4. Universal Selector
5. Grouping Selector

## Examples

\`\`\`css
/* Element selector */
p {
  color: blue;
}

/* Class selector */
.intro {
  font-size: 20px;
}

/* ID selector */
#header {
  background-color: gray;
}
\`\`\``,
            order: 2,
            duration: 12,
            published: true
          }
        ]
      }
    }
  })

  console.log('✅ Seeded topics:')
  console.log(`   - ${htmlTopic.title} (${htmlTopic.lessons.length} lessons)`)
  console.log(`   - ${cssTopic.title} (${cssTopic.lessons.length} lessons)`)
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
```

**Run seed:**
```bash
npx tsx scripts/seed-learning-content.ts
```

---

## 7. Styling Updates

### Add to `globals.css`

```css
/* Learning platform specific styles */
.mdx-content {
  @apply prose prose-slate dark:prose-invert max-w-none;
}

.mdx-content pre {
  @apply bg-slate-900 text-slate-50 rounded-lg p-4 overflow-x-auto;
}

.mdx-content code {
  @apply bg-slate-100 dark:bg-slate-800 px-1 py-0.5 rounded text-sm;
}

.mdx-content pre code {
  @apply bg-transparent p-0;
}

.mdx-content h2 {
  @apply scroll-mt-20;
}

.mdx-content h3 {
  @apply scroll-mt-20;
}
```

---

## 8. Testing Plan

### Unit Tests
- Test `lib/learn.ts` functions
- Test lesson navigation logic
- Test MDX compilation

### Integration Tests
- Test topic listing page
- Test lesson page rendering
- Test sidebar navigation
- Test prev/next navigation

### Create `tests/integration/learn/learn.test.ts`

```typescript
import { describe, it, expect, beforeAll, afterAll } from 'vitest'
import { prisma } from '@/lib/prisma'
import { getAllTopics, getTopicWithLessons, getLesson } from '@/lib/learn'

describe('Learning Platform', () => {
  let testTopicId: string

  beforeAll(async () => {
    // Create test topic and lessons
    const topic = await prisma.topic.create({
      data: {
        slug: 'test-topic',
        title: 'Test Topic',
        order: 999,
        published: true,
        lessons: {
          create: [
            {
              slug: 'lesson-1',
              title: 'Lesson 1',
              content: '# Lesson 1\nTest content',
              order: 1,
              published: true
            },
            {
              slug: 'lesson-2',
              title: 'Lesson 2',
              content: '# Lesson 2\nTest content',
              order: 2,
              published: true
            }
          ]
        }
      }
    })
    testTopicId = topic.id
  })

  afterAll(async () => {
    await prisma.lesson.deleteMany({ where: { topicId: testTopicId } })
    await prisma.topic.delete({ where: { id: testTopicId } })
  })

  it('should get all published topics', async () => {
    const topics = await getAllTopics()
    expect(topics.length).toBeGreaterThan(0)
    expect(topics.every(t => t.published)).toBe(true)
  })

  it('should get topic with lessons', async () => {
    const topic = await getTopicWithLessons('test-topic')
    expect(topic).toBeDefined()
    expect(topic?.lessons.length).toBe(2)
  })

  it('should get lesson with navigation', async () => {
    const lesson = await getLesson('test-topic', 'lesson-1')
    expect(lesson).toBeDefined()
    expect(lesson?.next).toBeDefined()
    expect(lesson?.next?.slug).toBe('lesson-2')
    expect(lesson?.prev).toBeNull()
  })
})
```

---

## 9. Deployment Checklist

- [ ] Run database migration
- [ ] Seed initial learning content
- [ ] Test all routes locally
- [ ] Verify sidebar navigation works
- [ ] Test prev/next navigation
- [ ] Check mobile responsiveness
- [ ] Test MDX rendering with code blocks
- [ ] Verify SEO metadata
- [ ] Deploy to production
- [ ] Test on production database

---

## 10. Future Enhancements

1. **Progress Tracking**
   - Track completed lessons per user
   - Show progress bar in sidebar
   - Certificate on completion

2. **Interactive Code Editor**
   - Embed CodeSandbox or similar
   - Live code preview
   - Exercise validation

3. **Search Functionality**
   - Search across all lessons
   - Filter by topic
   - Highlight search terms

4. **Comments/Discussion**
   - Allow users to ask questions
   - Community answers
   - Upvoting system

5. **Bookmarks**
   - Save favorite lessons
   - Quick access to bookmarked content

---

## Estimated Timeline

- **Database Schema & Migration:** 1 hour
- **Library Functions:** 2 hours
- **Route Files:** 2 hours
- **Shadcn Components:** 3 hours
- **Styling & Polish:** 2 hours
- **Seed Data:** 1 hour
- **Testing:** 2 hours
- **Documentation:** 1 hour

**Total:** ~14 hours

---

## Success Criteria

✅ Users can browse topics
✅ Users can navigate through lessons with sidebar
✅ Sidebar is collapsible and responsive
✅ Prev/Next navigation works correctly
✅ MDX content renders properly with syntax highlighting
✅ Mobile-friendly layout
✅ Fast page loads (< 2s)
✅ SEO-optimized pages
