'use client'

import { useState, useEffect } from 'react'
import { BookOpen } from 'lucide-react'
import SectionHeader from './SectionHeader'
import LessonItem from './LessonItem'
import type { TopicWithLessons } from '@/lib/learn'

interface LearningSidebarProps {
  topic: TopicWithLessons
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
      try {
        setExpandedSections(new Set(JSON.parse(saved)))
      } catch {
        // Ignore parse errors
      }
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

  return (
    <aside className="w-64 border-r border-sky-200 dark:border-sky-900/50 bg-sky-50 dark:bg-sky-950/50 h-screen sticky top-0 overflow-y-auto">
      {/* Header */}
      <div className="p-3 border-b border-sky-200 dark:border-sky-900/50 bg-white dark:bg-sky-900/30">
        <h2 className="text-sm font-semibold flex items-center gap-2 text-sky-900 dark:text-sky-100">
          <BookOpen className="w-4 h-4 text-sky-500 dark:text-sky-400" />
          <span className="truncate">{topic.title}</span>
        </h2>
      </div>

      <nav className="p-1.5 space-y-0.5">
        {/* SIMPLE MODE: No sections - show flat list */}
        {!hasSections && topic.lessons.map((lesson) => (
          <LessonItem
            key={lesson.id}
            lesson={lesson}
            topicSlug={topic.slug}
            isActive={lesson.slug === currentLessonSlug}
            isNested={false}
          />
        ))}

        {/* NESTED MODE: Has sections - show collapsible structure */}
        {hasSections && (
          <>
            {/* Standalone lessons (not in sections) - shown first */}
            {topic.lessons.map((lesson) => (
              <LessonItem
                key={lesson.id}
                lesson={lesson}
                topicSlug={topic.slug}
                isActive={lesson.slug === currentLessonSlug}
                isNested={false}
              />
            ))}

            {/* Sections with nested lessons */}
            {topic.sections.map((section) => {
              const isExpanded = expandedSections.has(section.id)
              
              return (
                <div key={section.id} className="space-y-0.5">
                  <SectionHeader
                    title={section.title}
                    isExpanded={isExpanded}
                    onToggle={() => toggleSection(section.id)}
                  />
                  
                  {isExpanded && (
                    <div className="space-y-0.5">
                      {section.lessons.map((lesson) => (
                        <LessonItem
                          key={lesson.id}
                          lesson={lesson}
                          topicSlug={topic.slug}
                          isActive={lesson.slug === currentLessonSlug}
                          isNested={true}
                        />
                      ))}
                    </div>
                  )}
                </div>
              )
            })}
          </>
        )}
      </nav>
    </aside>
  )
}
