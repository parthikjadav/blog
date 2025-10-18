"use client"

import { useEffect, useState } from "react"
import { cn } from "@/lib/utils"

interface TOCItem {
  id: string
  text: string
  level: number
}

interface TableOfContentsProps {
  content: string
}

/**
 * Table of Contents component that auto-generates from MDX headings
 * @param content - MDX content string to extract headings from
 */
export function TableOfContents({ content }: TableOfContentsProps) {
  const [headings, setHeadings] = useState<TOCItem[]>([])
  const [activeId, setActiveId] = useState<string>("")

  useEffect(() => {
    // Wait for DOM to be ready, then extract headings from actual rendered content
    const timer = setTimeout(() => {
      const articleElement = document.querySelector('article')
      if (!articleElement) return

      const headingElements = articleElement.querySelectorAll('h2, h3')
      const items: TOCItem[] = Array.from(headingElements).map((heading) => {
        const level = parseInt(heading.tagName.substring(1))
        const text = heading.textContent || ''
        const id = heading.id || text
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/(^-|-$)/g, "")
        
        // Ensure heading has an ID
        if (!heading.id && id) {
          heading.id = id
        }
        
        return { id, text, level }
      })
      
      setHeadings(items)
    }, 200) // Small delay to ensure MDX is rendered

    return () => clearTimeout(timer)
  }, [content])

  useEffect(() => {
    // Track active heading on scroll
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id)
          }
        })
      },
      { 
        rootMargin: "-20% 0px -35% 0px",
        threshold: 1.0
      }
    )

    // Small delay to ensure DOM is ready
    const timer = setTimeout(() => {
      headings.forEach(({ id }) => {
        const element = document.getElementById(id)
        if (element) {
          observer.observe(element)
        }
      })
    }, 100)

    return () => {
      clearTimeout(timer)
      observer.disconnect()
    }
  }, [headings])

  if (headings.length === 0) {
    return null
  }

  return (
    <nav className="sticky top-20 hidden xl:block">
      <div className="space-y-2">
        <p className="font-semibold text-sm mb-4">On This Page</p>
        <ul className="space-y-2 text-sm">
          {headings.map((heading) => (
            <li
              key={heading.id}
              className={cn(
                "border-l-2 transition-colors",
                heading.level === 3 && "pl-4",
                activeId === heading.id
                  ? "border-primary text-primary font-medium"
                  : "border-border text-muted-foreground hover:text-foreground"
              )}
            >
              <a
                href={`#${heading.id}`}
                onClick={(e) => {
                  e.preventDefault()
                  const element = document.getElementById(heading.id)
                  if (element) {
                    const yOffset = -80 // Offset for fixed header
                    const y = element.getBoundingClientRect().top + window.pageYOffset + yOffset
                    window.scrollTo({ top: y, behavior: "smooth" })
                    setActiveId(heading.id)
                  }
                }}
                className="block py-1 pl-4 hover:text-foreground transition-colors"
                aria-label={`Jump to ${heading.text}`}
                aria-current={activeId === heading.id ? "location" : undefined}
              >
                {heading.text}
              </a>
            </li>
          ))}
        </ul>
      </div>
    </nav>
  )
}
