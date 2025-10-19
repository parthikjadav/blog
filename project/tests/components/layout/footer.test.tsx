import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { Footer } from '@/components/layout/footer'

describe('Footer', () => {
  const originalDate = Date

  beforeEach(() => {
    // Mock Date to return consistent year
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2025-10-19'))
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('should render footer element', () => {
    const { container } = render(<Footer />)
    const footer = container.querySelector('footer')
    expect(footer).toBeInTheDocument()
  })

  it('should display current year', () => {
    render(<Footer />)
    expect(screen.getByText(/© 2025/i)).toBeInTheDocument()
  })

  it('should display author name', () => {
    render(<Footer />)
    expect(screen.getByText(/Fast Tech Team/i)).toBeInTheDocument()
  })

  it('should display technology stack', () => {
    render(<Footer />)
    expect(screen.getByText(/Built with Next.js & MDX/i)).toBeInTheDocument()
  })

  it('should render GitHub link', () => {
    render(<Footer />)
    const githubLink = screen.getByRole('link', { name: /github/i })
    expect(githubLink).toBeInTheDocument()
  })

  it('should have correct GitHub link href', () => {
    render(<Footer />)
    const githubLink = screen.getByRole('link', { name: /github/i })
    expect(githubLink).toHaveAttribute('href', 'https://github.com/parthikjadav')
  })

  it('should open GitHub link in new tab', () => {
    render(<Footer />)
    const githubLink = screen.getByRole('link', { name: /github/i })
    expect(githubLink).toHaveAttribute('target', '_blank')
  })

  it('should have noreferrer for security', () => {
    render(<Footer />)
    const githubLink = screen.getByRole('link', { name: /github/i })
    expect(githubLink).toHaveAttribute('rel', 'noreferrer')
  })

  it('should have border top', () => {
    const { container } = render(<Footer />)
    const footer = container.querySelector('footer')
    expect(footer?.className).toContain('border-t')
  })

  it('should have proper padding', () => {
    const { container } = render(<Footer />)
    const footer = container.querySelector('footer')
    expect(footer?.className).toContain('py-6')
  })

  it('should have container class', () => {
    const { container } = render(<Footer />)
    const containerDiv = container.querySelector('.container')
    expect(containerDiv).toBeInTheDocument()
  })

  it('should have flex layout', () => {
    const { container } = render(<Footer />)
    const flexContainer = container.querySelector('.flex')
    expect(flexContainer).toBeInTheDocument()
  })

  it('should center items on mobile', () => {
    const { container } = render(<Footer />)
    const flexContainer = container.querySelector('.items-center')
    expect(flexContainer).toBeInTheDocument()
  })

  it('should have responsive layout', () => {
    const { container } = render(<Footer />)
    const responsiveContainer = container.querySelector('.md\\:flex-row')
    expect(responsiveContainer).toBeInTheDocument()
  })

  it('should have text muted color', () => {
    const { container } = render(<Footer />)
    const text = container.querySelector('.text-muted-foreground')
    expect(text).toBeInTheDocument()
  })

  it('should have hover effect on GitHub link', () => {
    render(<Footer />)
    const githubLink = screen.getByRole('link', { name: /github/i })
    expect(githubLink.className).toContain('hover:text-foreground')
  })
})
