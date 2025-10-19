import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { RelatedPosts } from '@/components/blog/related-posts'
import { mockPosts } from '@/tests/mocks/data'

describe('RelatedPosts', () => {
  it('should render section title', () => {
    render(<RelatedPosts posts={mockPosts} type="category" />)
    expect(screen.getByRole('heading', { name: /Read More/i })).toBeInTheDocument()
  })

  it('should render all posts', () => {
    render(<RelatedPosts posts={mockPosts} type="category" />)
    mockPosts.forEach(post => {
      expect(screen.getByText(post.title)).toBeInTheDocument()
    })
  })

  it('should not render when posts array is empty', () => {
    const { container } = render(<RelatedPosts posts={[]} type="category" />)
    expect(container.firstChild).toBeNull()
  })

  it('should render correct type label for tags', () => {
    render(<RelatedPosts posts={mockPosts} type="tags" />)
    expect(screen.getByText(/Related Posts/i)).toBeInTheDocument()
  })

  it('should render correct type label for recent', () => {
    render(<RelatedPosts posts={mockPosts} type="recent" />)
    expect(screen.getByText(/Recent Posts/i)).toBeInTheDocument()
  })

  it('should render PostCard for each post', () => {
    render(<RelatedPosts posts={mockPosts} type="category" />)
    // Verify each post's description is rendered (part of PostCard)
    mockPosts.forEach(post => {
      expect(screen.getByText(post.description)).toBeInTheDocument()
    })
  })
})
