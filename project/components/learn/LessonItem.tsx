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
  isActive: boolean
  isNested?: boolean
}

export default function LessonItem({
  lesson,
  topicSlug,
  isActive,
  isNested = false
}: LessonItemProps) {
  const lessonUrl = `/learn/${topicSlug}/${lesson.slug}`
  
  return (
    <Link
      href={lessonUrl}
      className={cn(
        "flex items-center gap-2.5 py-2 rounded text-sm transition-all duration-200",
        isNested ? "px-8" : "px-3", // Indent nested lessons
        isActive 
          ? "bg-sky-500 dark:bg-sky-600 text-white hover:bg-sky-600 dark:hover:bg-sky-700 font-medium" 
          : "text-sky-900 dark:text-sky-200 hover:bg-sky-100 dark:hover:bg-sky-900/40"
      )}
    >
      <span className="flex-1 truncate">{lesson.title}</span>
      {lesson.duration && (
        <span className={cn(
          "text-xs flex-shrink-0",
          isActive ? "text-white/70" : "text-sky-400 dark:text-sky-500"
        )}>
          {lesson.duration}m
        </span>
      )}
    </Link>
  )
}
