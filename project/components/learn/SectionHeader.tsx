'use client'

import { ChevronDown, ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'

interface SectionHeaderProps {
  title: string
  icon?: string | null
  isExpanded: boolean
  onToggle: () => void
}

export default function SectionHeader({
  title,
  isExpanded,
  onToggle
}: SectionHeaderProps) {
  return (
    <button
      onClick={onToggle}
      className={cn(
        "w-full flex items-center gap-2 px-3 py-2 text-sm font-medium",
        "text-sky-700 dark:text-sky-300",
        "hover:bg-sky-100 dark:hover:bg-sky-900/40",
        "transition-colors duration-200 rounded"
      )}
      aria-expanded={isExpanded}
      aria-label={`${isExpanded ? 'Collapse' : 'Expand'} ${title} section`}
    >
      {isExpanded ? (
        <ChevronDown className="w-3.5 h-3.5 flex-shrink-0" />
      ) : (
        <ChevronRight className="w-3.5 h-3.5 flex-shrink-0" />
      )}
      <span className="flex-1 text-left truncate uppercase tracking-wide">
        {title}
      </span>
    </button>
  )
}
