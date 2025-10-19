import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { PostCard } from '@/components/blog/post-card'
import { mockPost } from '@/tests/mocks/data'

describe('PostCard', () => {
  it('should render post title', () => {
    render(<PostCard post={mockPost} />)
    expect(screen.getByText(mockPost.title)).toBeInTheDocument()
  })

  it('should render post description', () => {
    render(<PostCard post={mockPost} />)
    expect(screen.getByText(mockPost.description)).toBeInTheDocument()
  })

  it('should render category badge', () => {
    render(<PostCard post={mockPost} />)
    expect(screen.getByText(mockPost.category.name)).toBeInTheDocument()
  })

  it('should render reading time', () => {
    render(<PostCard post={mockPost} />)
    expect(screen.getByText(`${mockPost.readingTime} min read`)).toBeInTheDocument()
  })

  it('should render link to post', () => {
    render(<PostCard post={mockPost} />)
    const link = screen.getByRole('link')
    expect(link).toHaveAttribute('href', `/blog/${mockPost.slug}`)
  })

  it('should render featured image', () => {
    render(<PostCard post={mockPost} />)
    const image = screen.getByAltText(mockPost.title)
    expect(image).toBeInTheDocument()
  })

  it('should render with featured variant', () => {
    render(<PostCard post={mockPost} variant="featured" />)
    // Verify post still renders with featured variant
    expect(screen.getByText(mockPost.title)).toBeInTheDocument()
  })

  it('should render placeholder when no featuredImage', () => {
    const postNoImage = { ...mockPost, featuredImage: null }
    render(<PostCard post={postNoImage} />)
    const img = screen.getByAltText(mockPost.title)
    expect(img).toBeInTheDocument()
  })

  it('should have correct link href', () => {
    render(<PostCard post={mockPost} />)
    const link = screen.getByRole('link')
    expect(link).toHaveAttribute('href', `/blog/${mockPost.slug}`)
  })
})
