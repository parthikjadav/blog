import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { Header } from '@/components/layout/header'

// Mock child components
vi.mock('@/components/layout/header-search', () => ({
  HeaderSearch: () => <div data-testid="header-search">Search Component</div>
}))

vi.mock('@/components/layout/header-nav', () => ({
  HeaderNav: () => <div data-testid="header-nav">Nav Component</div>
}))

describe('Header', () => {
  it('should render header element', () => {
    const { container } = render(<Header />)
    const header = container.querySelector('header')
    expect(header).toBeInTheDocument()
  })

  it('should render site logo link', () => {
    render(<Header />)
    const logoLink = screen.getByRole('link', { name: /home/i })
    expect(logoLink).toBeInTheDocument()
    expect(logoLink).toHaveAttribute('href', '/')
  })

  it('should render site name', () => {
    render(<Header />)
    const siteName = screen.getByText(/Fast Tech/i)
    expect(siteName).toBeInTheDocument()
  })

  it('should render logo images', () => {
    render(<Header />)
    const images = screen.getAllByAltText(/Fast Tech/i)
    // Should have 2 logo images (light and dark mode)
    expect(images.length).toBe(2)
  })

  it('should render HeaderSearch component', () => {
    render(<Header />)
    const searchComponents = screen.getAllByTestId('header-search')
    // Should render search twice (desktop and mobile)
    expect(searchComponents.length).toBe(2)
  })

  it('should render HeaderNav component', () => {
    render(<Header />)
    const navComponent = screen.getByTestId('header-nav')
    expect(navComponent).toBeInTheDocument()
  })

  it('should have sticky positioning', () => {
    const { container } = render(<Header />)
    const header = container.querySelector('header')
    expect(header?.className).toContain('sticky')
    expect(header?.className).toContain('top-0')
  })

  it('should have backdrop blur', () => {
    const { container } = render(<Header />)
    const header = container.querySelector('header')
    expect(header?.className).toContain('backdrop-blur')
  })

  it('should have border bottom', () => {
    const { container } = render(<Header />)
    const header = container.querySelector('header')
    expect(header?.className).toContain('border-b')
  })

  it('should have z-index for layering', () => {
    const { container } = render(<Header />)
    const header = container.querySelector('header')
    expect(header?.className).toContain('z-50')
  })

  it('should render mobile search section', () => {
    const { container } = render(<Header />)
    const mobileSearch = container.querySelector('.md\\:hidden')
    expect(mobileSearch).toBeInTheDocument()
  })

  it('should hide desktop search on mobile', () => {
    const { container } = render(<Header />)
    const desktopSearch = container.querySelector('.hidden.md\\:block')
    expect(desktopSearch).toBeInTheDocument()
  })

  it('should have container for content', () => {
    const { container } = render(<Header />)
    const containerDiv = container.querySelector('.container')
    expect(containerDiv).toBeInTheDocument()
  })

  it('should have proper height', () => {
    const { container } = render(<Header />)
    const containerDiv = container.querySelector('.h-16')
    expect(containerDiv).toBeInTheDocument()
  })

  it('should have flex layout', () => {
    const { container } = render(<Header />)
    const flexContainer = container.querySelector('.flex.items-center')
    expect(flexContainer).toBeInTheDocument()
  })
})
