import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { PostHeader } from '@/components/blog/post-header'
import { mockPost } from '@/tests/mocks/data'

describe('PostHeader', () => {
  it('should render post title', () => {
    render(<PostHeader post={mockPost} />)
    expect(screen.getByText(mockPost.title)).toBeInTheDocument()
  })

  it('should render post description', () => {
    render(<PostHeader post={mockPost} />)
    expect(screen.getByText(mockPost.description)).toBeInTheDocument()
  })

  it('should render category', () => {
    render(<PostHeader post={mockPost} />)
    expect(screen.getByText(mockPost.category.name)).toBeInTheDocument()
  })

  it('should render all tags', () => {
    render(<PostHeader post={mockPost} />)
    mockPost.tags.forEach(tag => {
      expect(screen.getByText(tag.name)).toBeInTheDocument()
    })
  })

  it('should render reading time', () => {
    render(<PostHeader post={mockPost} />)
    expect(screen.getByText(`${mockPost.readingTime} min read`)).toBeInTheDocument()
  })

  it('should render published date', () => {
    render(<PostHeader post={mockPost} />)
    // Date is rendered as text, verify it's present
    const dateText = screen.getByText(/2025/i)
    expect(dateText).toBeInTheDocument()
  })
})
