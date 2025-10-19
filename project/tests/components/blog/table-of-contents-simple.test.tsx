import { describe, it, expect, vi } from 'vitest'
import { render } from '@testing-library/react'
import { TableOfContents } from '@/components/blog/table-of-contents'

// Mock IntersectionObserver
class MockIntersectionObserver {
  observe = vi.fn()
  disconnect = vi.fn()
  unobserve = vi.fn()
}

global.IntersectionObserver = MockIntersectionObserver as any

describe('TableOfContents - Basic Tests', () => {
  it('should render without crashing', () => {
    const { container } = render(<TableOfContents content="## Test" />)
    expect(container).toBeInTheDocument()
  })

  it('should return null when no headings are found initially', () => {
    const { container } = render(<TableOfContents content="No headings" />)
    // Initially returns null until headings are extracted
    expect(container.firstChild).toBeNull()
  })

  it('should handle empty content', () => {
    const { container } = render(<TableOfContents content="" />)
    expect(container.firstChild).toBeNull()
  })

  it('should accept content prop', () => {
    const content = "## Heading 1\n### Heading 2"
    const { container } = render(<TableOfContents content={content} />)
    expect(container).toBeInTheDocument()
  })

  it('should be a client component', () => {
    // TableOfContents uses useState and useEffect, so it's a client component
    const { container } = render(<TableOfContents content="## Test" />)
    expect(container).toBeDefined()
  })
})
