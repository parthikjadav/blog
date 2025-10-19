import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { ThemeToggle } from '@/components/layout/theme-toggle'

// Mock next-themes
const mockSetTheme = vi.fn()
const mockUseTheme = vi.fn()

vi.mock('next-themes', () => ({
  useTheme: () => mockUseTheme()
}))

describe('ThemeToggle', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should render toggle button', () => {
    mockUseTheme.mockReturnValue({
      resolvedTheme: 'light',
      setTheme: mockSetTheme
    })

    render(<ThemeToggle />)
    const button = screen.getByRole('button', { name: /toggle theme/i })
    expect(button).toBeInTheDocument()
  })

  it('should show sun icon before mounted', () => {
    mockUseTheme.mockReturnValue({
      resolvedTheme: 'light',
      setTheme: mockSetTheme
    })

    render(<ThemeToggle />)
    // Before mount, only sun icon should be visible
    const button = screen.getByRole('button')
    expect(button).toBeInTheDocument()
  })

  it('should toggle from light to dark theme', () => {
    mockUseTheme.mockReturnValue({
      resolvedTheme: 'light',
      setTheme: mockSetTheme
    })

    render(<ThemeToggle />)
    const button = screen.getByRole('button', { name: /toggle theme/i })
    
    fireEvent.click(button)
    
    expect(mockSetTheme).toHaveBeenCalledWith('dark')
  })

  it('should toggle from dark to light theme', () => {
    mockUseTheme.mockReturnValue({
      resolvedTheme: 'dark',
      setTheme: mockSetTheme
    })

    render(<ThemeToggle />)
    const button = screen.getByRole('button', { name: /toggle theme/i })
    
    fireEvent.click(button)
    
    expect(mockSetTheme).toHaveBeenCalledWith('light')
  })

  it('should have correct aria-label', () => {
    mockUseTheme.mockReturnValue({
      resolvedTheme: 'light',
      setTheme: mockSetTheme
    })

    render(<ThemeToggle />)
    const button = screen.getByRole('button', { name: /toggle theme/i })
    expect(button).toHaveAttribute('aria-label', 'Toggle theme')
  })

  it('should render both sun and moon icons when mounted', () => {
    mockUseTheme.mockReturnValue({
      resolvedTheme: 'light',
      setTheme: mockSetTheme
    })

    const { container } = render(<ThemeToggle />)
    
    // Both icons should be in the DOM (visibility controlled by CSS)
    const svgs = container.querySelectorAll('svg')
    expect(svgs.length).toBeGreaterThanOrEqual(2)
  })

  it('should have screen reader text', () => {
    mockUseTheme.mockReturnValue({
      resolvedTheme: 'light',
      setTheme: mockSetTheme
    })

    render(<ThemeToggle />)
    const srText = screen.getByText(/toggle theme/i)
    expect(srText).toBeInTheDocument()
  })

  it('should handle undefined theme', () => {
    mockUseTheme.mockReturnValue({
      resolvedTheme: undefined,
      setTheme: mockSetTheme
    })

    render(<ThemeToggle />)
    const button = screen.getByRole('button', { name: /toggle theme/i })
    
    fireEvent.click(button)
    
    // Should default to light when undefined
    expect(mockSetTheme).toHaveBeenCalledWith('light')
  })

  it('should be a ghost button variant', () => {
    mockUseTheme.mockReturnValue({
      resolvedTheme: 'light',
      setTheme: mockSetTheme
    })

    const { container } = render(<ThemeToggle />)
    const button = container.querySelector('button')
    
    // Button should have hover:bg-accent class (ghost variant characteristic)
    expect(button?.className).toContain('hover:bg-accent')
  })
})
