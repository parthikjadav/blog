# Phase 9: Nested Lessons Implementation

## Overview
Implement a hierarchical lesson structure with expandable/collapsible sections in the sidebar, similar to W3Schools' navigation system. This will allow organizing lessons into logical groups and sub-topics.

## Current State Analysis

### Existing Structure
- **Flat hierarchy**: Topics → Lessons (single level)
- **Schema**: `Topic` has many `Lessons`, no nesting
- **Sidebar**: Simple list of lessons without grouping
- **Navigation**: Linear lesson progression

### Limitations
- Cannot group related lessons together
- No visual hierarchy for complex topics
- Difficult to organize large topics with many lessons
- No way to show lesson categories or sections

## Goals

1. **Database Schema**: Add support for lesson sections/groups
2. **UI Components**: Create expandable/collapsible sidebar sections
3. **Navigation**: Maintain lesson order within sections
4. **State Management**: Track expanded/collapsed sections
5. **User Experience**: Smooth animations and intuitive interactions
6. **Flexible Display**: Support both simple flat structure (no sections) and nested structure (with sections) in the same codebase

## Display Modes

### Mode 1: Simple Flat Structure (No Sections)
**When**: Topic has no sections, only lessons
**Display**: Clean flat list like W3Schools simple pages

```
HTML Paragraphs
HTML Styles
HTML Formatting
HTML Quotations
HTML Comments
HTML Colors  ← Active
HTML CSS
HTML Links
```

### Mode 2: Nested Structure (With Sections)
**When**: Topic has sections with grouped lessons
**Display**: Collapsible sections with indented lessons

```
HTML Paragraphs (standalone)
HTML Styles (standalone)
HTML Colors ▼
  Colors      ← Active (indented)
  RGB
  HEX
  HSL
HTML CSS (standalone)
HTML Links ▼
  Links
  Anchors
```

### Mode 3: Mixed Structure
**When**: Topic has both standalone lessons and sections
**Display**: Combination of flat and nested

```
01. Introduction (flat)
02. Getting Started (flat)
HTML Basics ▼
  03. Elements
  04. Attributes
05. Comments (flat)
HTML Colors ▼
  06. Colors
  07. RGB
```

**Key Feature**: The sidebar automatically detects which mode to use based on data structure. No configuration needed!

## Implementation Plan

### Phase 9.1: Database Schema Updates

#### Option A: Add Section Model (Recommended)
**File**: `prisma/schema.prisma`

```prisma
model Section {
  id          String   @id @default(uuid())
  slug        String
  title       String
  description String?
  icon        String?  // Optional icon for section
  order       Int      // Order within topic
  published   Boolean  @default(false)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  
  topicId     String
  topic       Topic    @relation(fields: [topicId], references: [id], onDelete: Cascade)
  lessons     Lesson[]
  
  @@unique([topicId, slug])
  @@index([topicId, order])
}

model Lesson {
  // ... existing fields ...
  
  // Add optional sectionId
  sectionId   String?
  section     Section?  @relation(fields: [sectionId], references: [id], onDelete: Cascade)
  
  // Keep topicId for backward compatibility and direct access
  topicId     String
  topic       Topic    @relation(fields: [topicId], references: [id], onDelete: Cascade)
}

model Topic {
  // ... existing fields ...
  sections    Section[]
  lessons     Lesson[]
}
```

**Benefits**:
- Clean separation of concerns
- Flexible: lessons can be in sections or directly under topic
- Easy to query and filter
- Supports nested structure

#### Option B: Self-Referencing Lesson (Alternative)
```prisma
model Lesson {
  // ... existing fields ...
  
  parentId    String?
  parent      Lesson?   @relation("LessonHierarchy", fields: [parentId], references: [id])
  children    Lesson[]  @relation("LessonHierarchy")
}
```

**Comparison**:
- Option A: Better for distinct section headers (like "HTML Colors", "HTML Forms")
- Option B: More flexible for unlimited nesting depth
- **Recommendation**: Use Option A for W3Schools-style navigation

### Phase 9.2: Migration Strategy

#### Step 1: Create Migration
```bash
npx prisma migrate dev --name add_sections
```

#### Step 2: Update Seed Script
**File**: `scripts/seed-learning-content.ts`

```typescript
// Example: HTML Topic with Sections
const htmlTopic = await prisma.topic.create({
  data: {
    slug: 'html',
    title: 'HTML Tutorial',
    description: 'Learn HTML from basics to advanced',
    icon: 'Code',
    order: 1,
    published: true,
    sections: {
      create: [
        {
          slug: 'basics',
          title: 'HTML Basics',
          order: 1,
          published: true,
          lessons: {
            create: [
              {
                slug: 'introduction',
                title: 'HTML Introduction',
                content: '...',
                order: 1,
                published: true
              },
              {
                slug: 'elements',
                title: 'HTML Elements',
                content: '...',
                order: 2,
                published: true
              }
            ]
          }
        },
        {
          slug: 'colors',
          title: 'HTML Colors',
          order: 2,
          published: true,
          lessons: {
            create: [
              {
                slug: 'colors-intro',
                title: 'Colors',
                content: '...',
                order: 1,
                published: true
              },
              {
                slug: 'rgb',
                title: 'RGB',
                content: '...',
                order: 2,
                published: true
              },
              {
                slug: 'hex',
                title: 'HEX',
                content: '...',
                order: 3,
                published: true
              },
              {
                slug: 'hsl',
                title: 'HSL',
                content: '...',
                order: 4,
                published: true
              }
            ]
          }
        },
        {
          slug: 'forms',
          title: 'HTML Forms',
          order: 3,
          published: true,
          lessons: {
            create: [
              {
                slug: 'forms-intro',
                title: 'Forms',
                content: '...',
                order: 1,
                published: true
              },
              {
                slug: 'input-types',
                title: 'Input Types',
                content: '...',
                order: 2,
                published: true
              }
            ]
          }
        }
      ]
    }
  },
  include: {
    sections: {
      include: {
        lessons: true
      }
    }
  }
})
```

#### Step 3: Data Migration Script
**File**: `scripts/migrate-lessons-to-sections.ts`

```typescript
// Script to migrate existing flat lessons into sections
// Group lessons by category or create a default "Core Concepts" section
```

### Phase 9.3: Update Data Access Layer

#### Update `lib/learn.ts`

```typescript
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

export interface TopicWithSections {
  id: string
  slug: string
  title: string
  description: string | null
  icon: string | null
  order: number
  sections: SectionWithLessons[]
  // Keep standalone lessons for backward compatibility
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
 * Get a topic with sections and lessons
 */
export async function getTopicWithSections(
  topicSlug: string
): Promise<TopicWithSections | null> {
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
      // Standalone lessons (not in any section)
      lessons: {
        where: { 
          published: true,
          sectionId: null 
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
 * Get lesson with section context
 */
export async function getLessonWithSection(
  topicSlug: string,
  lessonSlug: string
): Promise<LessonWithNavigation | null> {
  // ... implementation with section awareness
}
```

### Phase 9.4: UI Components

#### Component 1: SectionHeader
**File**: `components/learn/SectionHeader.tsx`

```typescript
'use client'

import { ChevronDown, ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'

interface SectionHeaderProps {
  title: string
  icon?: string
  isExpanded: boolean
  onToggle: () => void
  lessonCount: number
}

export default function SectionHeader({
  title,
  icon,
  isExpanded,
  onToggle,
  lessonCount
}: SectionHeaderProps) {
  return (
    <button
      onClick={onToggle}
      className={cn(
        "w-full flex items-center gap-2 px-2 py-2 text-xs font-medium",
        "text-sky-700 dark:text-sky-300",
        "hover:bg-sky-100 dark:hover:bg-sky-900/40",
        "transition-colors duration-200 rounded"
      )}
    >
      {isExpanded ? (
        <ChevronDown className="w-3 h-3 flex-shrink-0" />
      ) : (
        <ChevronRight className="w-3 h-3 flex-shrink-0" />
      )}
      <span className="flex-1 text-left truncate uppercase tracking-wide">
        {title}
      </span>
      <span className="text-[10px] text-sky-500 dark:text-sky-400">
        {lessonCount}
      </span>
    </button>
  )
}
```

#### Component 2: LessonItem
**File**: `components/learn/LessonItem.tsx`

```typescript
'use client'

import Link from 'next/link'
import { cn } from '@/lib/utils'

interface LessonItemProps {
  lesson: {
    slug: string
    title: string
    duration: number | null
  }
  topicSlug: string
  index: number
  isActive: boolean
  isNested?: boolean
}

export default function LessonItem({
  lesson,
  topicSlug,
  index,
  isActive,
  isNested = false
}: LessonItemProps) {
  const lessonUrl = `/learn/${topicSlug}/${lesson.slug}`
  
  return (
    <Link
      href={lessonUrl}
      className={cn(
        "flex items-center gap-2 py-1.5 rounded text-xs transition-all duration-200",
        isNested ? "px-6" : "px-2", // Indent nested lessons
        isActive 
          ? "bg-sky-500 dark:bg-sky-600 text-white hover:bg-sky-600 dark:hover:bg-sky-700 font-medium" 
          : "text-sky-900 dark:text-sky-200 hover:bg-sky-100 dark:hover:bg-sky-900/40"
      )}
    >
      <span className={cn(
        "text-[10px] font-mono font-semibold flex-shrink-0",
        isActive ? "text-white/80" : "text-sky-400 dark:text-sky-500"
      )}>
        {String(index).padStart(2, '0')}
      </span>
      <span className="flex-1 truncate">{lesson.title}</span>
      {lesson.duration && (
        <span className={cn(
          "text-[10px] flex-shrink-0",
          isActive ? "text-white/70" : "text-sky-400 dark:text-sky-500"
        )}>
          {lesson.duration}m
        </span>
      )}
    </Link>
  )
}
```

#### Component 3: Updated LearningSidebar (Mixed Structure Support)
**File**: `components/learn/LearningSidebar.tsx`

**Key Feature**: Automatically detects if topic has sections. If no sections exist, displays simple flat list like the image. If sections exist, shows collapsible nested structure.

```typescript
'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { BookOpen } from 'lucide-react'
import SectionHeader from './SectionHeader'
import LessonItem from './LessonItem'

interface LearningSidebarProps {
  topic: TopicWithSections
  currentLessonSlug: string
}

export default function LearningSidebar({
  topic,
  currentLessonSlug
}: LearningSidebarProps) {
  // Check if topic has sections (determines display mode)
  const hasSections = topic.sections && topic.sections.length > 0
  
  // Track expanded sections (default: expand section with active lesson)
  const [expandedSections, setExpandedSections] = useState<Set<string>>(() => {
    if (!hasSections) return new Set()
    
    const activeSection = topic.sections.find(section =>
      section.lessons.some(lesson => lesson.slug === currentLessonSlug)
    )
    return new Set(activeSection ? [activeSection.id] : [])
  })

  // Persist expanded state in localStorage (only if has sections)
  useEffect(() => {
    if (!hasSections) return
    
    const key = `sidebar-expanded-${topic.slug}`
    const saved = localStorage.getItem(key)
    if (saved) {
      setExpandedSections(new Set(JSON.parse(saved)))
    }
  }, [topic.slug, hasSections])

  useEffect(() => {
    if (!hasSections) return
    
    const key = `sidebar-expanded-${topic.slug}`
    localStorage.setItem(key, JSON.stringify([...expandedSections]))
  }, [expandedSections, topic.slug, hasSections])

  const toggleSection = (sectionId: string) => {
    setExpandedSections(prev => {
      const next = new Set(prev)
      if (next.has(sectionId)) {
        next.delete(sectionId)
      } else {
        next.add(sectionId)
      }
      return next
    })
  }

  let lessonIndex = 0

  return (
    <aside className="w-64 border-r border-sky-200 dark:border-sky-900/50 bg-sky-50 dark:bg-sky-950/50 h-screen sticky top-0 overflow-y-auto">
      {/* Header */}
      <div className="p-3 border-b border-sky-200 dark:border-sky-900/50 bg-white dark:bg-sky-900/30">
        <h2 className="text-sm font-semibold flex items-center gap-2 text-sky-900 dark:text-sky-100">
          <BookOpen className="w-4 h-4 text-sky-500 dark:text-sky-400" />
          <span className="truncate">{topic.title}</span>
        </h2>
      </div>

      <nav className="p-1.5">
        {/* SIMPLE MODE: No sections - show flat list (like image) */}
        {!hasSections && topic.lessons.map((lesson) => {
          lessonIndex++
          return (
            <LessonItem
              key={lesson.id}
              lesson={lesson}
              topicSlug={topic.slug}
              index={lessonIndex}
              isActive={lesson.slug === currentLessonSlug}
              isNested={false}
            />
          )
        })}

        {/* NESTED MODE: Has sections - show collapsible structure */}
        {hasSections && (
          <>
            {/* Standalone lessons (not in sections) - shown first */}
            {topic.lessons.map((lesson) => {
              lessonIndex++
              return (
                <LessonItem
                  key={lesson.id}
                  lesson={lesson}
                  topicSlug={topic.slug}
                  index={lessonIndex}
                  isActive={lesson.slug === currentLessonSlug}
                  isNested={false}
                />
              )
            })}

            {/* Sections with nested lessons */}
            {topic.sections.map((section) => {
              const isExpanded = expandedSections.has(section.id)
              const sectionStartIndex = lessonIndex + 1
              
              return (
                <div key={section.id} className="mb-1">
                  <SectionHeader
                    title={section.title}
                    icon={section.icon}
                    isExpanded={isExpanded}
                    onToggle={() => toggleSection(section.id)}
                    lessonCount={section.lessons.length}
                  />
                  
                  {isExpanded && (
                    <div className="space-y-0.5">
                      {section.lessons.map((lesson, idx) => {
                        lessonIndex++
                        return (
                          <LessonItem
                            key={lesson.id}
                            lesson={lesson}
                            topicSlug={topic.slug}
                            index={lessonIndex}
                            isActive={lesson.slug === currentLessonSlug}
                            isNested={true}
                          />
                        )
                      })}
                    </div>
                  )}
                  
                  {/* Update lessonIndex even if section is collapsed */}
                  {!isExpanded && (() => {
                    lessonIndex += section.lessons.length
                    return null
                  })()}
                </div>
              )
            })}
          </>
        )}
      </nav>
    </aside>
  )
}
```

### Phase 9.5: Animation & Transitions

#### Add Smooth Expand/Collapse
**File**: `components/learn/CollapsibleSection.tsx`

```typescript
'use client'

import { motion, AnimatePresence } from 'framer-motion'

interface CollapsibleSectionProps {
  isExpanded: boolean
  children: React.ReactNode
}

export default function CollapsibleSection({
  isExpanded,
  children
}: CollapsibleSectionProps) {
  return (
    <AnimatePresence initial={false}>
      {isExpanded && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: 'auto', opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          transition={{ duration: 0.2, ease: 'easeInOut' }}
          style={{ overflow: 'hidden' }}
        >
          {children}
        </motion.div>
      )}
    </AnimatePresence>
  )
}
```

**Install dependency**:
```bash
npm install framer-motion
```

### Phase 9.6: Update Page Components

#### Update Lesson Page
**File**: `app/learn/[topic]/[lesson]/page.tsx`

```typescript
const [lesson, topicData] = await Promise.all([
  getLesson(topicSlug, lessonSlug),
  getTopicWithSections(topicSlug) // Use new function
])
```

### Phase 9.7: Breadcrumb Navigation

#### Add Section to Breadcrumbs
**File**: `components/learn/Breadcrumbs.tsx`

```typescript
'use client'

import Link from 'next/link'
import { ChevronRight } from 'lucide-react'

interface BreadcrumbsProps {
  topic: { slug: string; title: string }
  section?: { slug: string; title: string }
  lesson: { slug: string; title: string }
}

export default function Breadcrumbs({ topic, section, lesson }: BreadcrumbsProps) {
  return (
    <nav className="flex items-center gap-2 text-sm text-sky-600 dark:text-sky-400 mb-4">
      <Link href="/learn" className="hover:underline">Learn</Link>
      <ChevronRight className="w-4 h-4" />
      <Link href={`/learn/${topic.slug}`} className="hover:underline">
        {topic.title}
      </Link>
      {section && (
        <>
          <ChevronRight className="w-4 h-4" />
          <span className="text-sky-500 dark:text-sky-300">{section.title}</span>
        </>
      )}
      <ChevronRight className="w-4 h-4" />
      <span className="text-sky-900 dark:text-sky-100 font-medium">{lesson.title}</span>
    </nav>
  )
}
```

### Phase 9.8: Mixed Structure Behavior

#### Automatic Detection
The sidebar automatically detects the structure type:

**Simple Mode (No Sections)**:
```
HTML Paragraphs
HTML Styles
HTML Formatting
HTML Quotations
HTML Comments
HTML Colors  ← Active (highlighted)
HTML CSS
HTML Links
```
- Shows flat list of lessons
- No collapsible sections
- No section headers
- Clean, simple navigation
- Like the reference image

**Nested Mode (With Sections)**:
```
HTML Paragraphs
HTML Styles
HTML Colors ▼
  Colors      ← Active (highlighted, indented)
  RGB
  HEX
  HSL
HTML CSS
HTML Links ▼
  Links
  Anchors
```
- Shows collapsible sections
- Nested lessons indented
- Section headers with chevrons
- Expandable/collapsible functionality

#### Implementation Logic
```typescript
// In LearningSidebar component
const hasSections = topic.sections && topic.sections.length > 0

// Render based on structure
{!hasSections && (
  // Simple flat list
)}

{hasSections && (
  // Nested collapsible structure
)}
```

#### Benefits
1. **Backward Compatible**: Existing topics without sections work perfectly
2. **Gradual Migration**: Can migrate topics one at a time
3. **Flexibility**: Some topics simple, others complex
4. **No Breaking Changes**: Existing functionality preserved
5. **Clean UI**: No unnecessary complexity for simple topics

### Phase 9.9: Testing & Edge Cases

#### Test Cases
1. **Empty sections**: Handle sections with no lessons
2. **Deep nesting**: Test with multiple levels (if using Option B)
3. **State persistence**: Verify localStorage works correctly
4. **Active lesson**: Ensure correct section expands on page load
5. **Navigation**: Test prev/next across sections
6. **Mobile**: Ensure collapsible works on touch devices
7. **Accessibility**: Keyboard navigation, screen readers
8. **Performance**: Test with 50+ lessons across 10+ sections
9. **Mixed structure**: Topic with both standalone lessons and sections
10. **Simple structure**: Topic with only lessons (no sections)
11. **Empty topic**: Topic with no lessons or sections

#### Edge Cases
- Lesson without section (standalone)
- Section without lessons (empty)
- Multiple active lessons (shouldn't happen)
- URL with invalid section/lesson
- Migrating from flat to nested structure
- Topic with 0 sections (should show simple mode)
- Topic with 0 lessons but has sections (edge case)

## Implementation Timeline

### Week 1: Database & Backend
- [ ] Day 1-2: Schema design and migration
- [ ] Day 3: Update data access layer
- [ ] Day 4: Create seed script with sections
- [ ] Day 5: Data migration script

### Week 2: UI Components
- [ ] Day 1-2: Create SectionHeader and LessonItem components
- [ ] Day 3-4: Update LearningSidebar with collapsible sections
- [ ] Day 5: Add animations and transitions

### Week 3: Integration & Polish
- [ ] Day 1-2: Update page components and routing
- [ ] Day 3: Add breadcrumbs and navigation
- [ ] Day 4-5: Testing and bug fixes

### Week 4: Content & Documentation
- [ ] Day 1-2: Migrate existing lessons to sections
- [ ] Day 3: Create comprehensive seed data
- [ ] Day 4: Documentation and examples
- [ ] Day 5: Final testing and deployment

## Success Criteria

✅ **Functional**:
- Sections can be expanded/collapsed
- State persists across page reloads
- Active lesson's section auto-expands
- Navigation works correctly across sections
- Backward compatible with flat structure

✅ **UI/UX**:
- Smooth animations
- Visual hierarchy clear
- Responsive on all devices
- Accessible (keyboard, screen readers)
- Matches W3Schools aesthetic

✅ **Performance**:
- Fast rendering with many lessons
- Smooth animations (60fps)
- Efficient state management
- Optimized database queries

✅ **Code Quality**:
- Type-safe with TypeScript
- Well-documented
- Reusable components
- Comprehensive tests

## Future Enhancements

1. **Search within sections**: Filter lessons by keyword
2. **Progress tracking**: Show completion per section
3. **Collapsible all**: Expand/collapse all sections button
4. **Drag & drop**: Reorder sections/lessons (admin)
5. **Section icons**: Custom icons per section
6. **Section descriptions**: Hover tooltips
7. **Nested sections**: Support 3+ levels of nesting
8. **Section completion**: Badge showing completed lessons

## Files to Create/Modify

### New Files:
1. `components/learn/SectionHeader.tsx`
2. `components/learn/LessonItem.tsx`
3. `components/learn/CollapsibleSection.tsx`
4. `components/learn/Breadcrumbs.tsx`
5. `scripts/migrate-lessons-to-sections.ts`

### Modified Files:
1. `prisma/schema.prisma` - Add Section model
2. `lib/learn.ts` - Add section queries
3. `components/learn/LearningSidebar.tsx` - Add collapsible sections
4. `app/learn/[topic]/[lesson]/page.tsx` - Use new data structure
5. `scripts/seed-learning-content.ts` - Add sections to seed data

### Dependencies:
- `framer-motion` - Smooth animations

## Estimated Effort
- **Development**: 3-4 weeks
- **Testing**: 1 week
- **Total**: 4-5 weeks

## Priority: HIGH
This feature significantly improves content organization and user navigation, especially for topics with many lessons.
