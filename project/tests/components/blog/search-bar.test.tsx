import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { SearchBar } from '@/components/blog/search-bar'
import { mockPosts } from '@/tests/mocks/data'

// Mock the useDebounce hook to avoid delays in tests
vi.mock('@/hooks/use-debounce', () => ({
  useDebounce: (value: string) => value
}))

describe('SearchBar', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should render search input', () => {
    render(<SearchBar posts={mockPosts} />)
    const input = screen.getByPlaceholderText(/search posts/i)
    expect(input).toBeInTheDocument()
  })

  it('should update query on input change', async () => {
    const user = userEvent.setup()
    render(<SearchBar posts={mockPosts} />)
    
    const input = screen.getByPlaceholderText(/search posts/i)
    await user.type(input, 'test')
    
    expect(input).toHaveValue('test')
  })

  it('should show results dropdown when typing', async () => {
    const user = userEvent.setup()
    render(<SearchBar posts={mockPosts} />)
    
    const input = screen.getByPlaceholderText(/search posts/i)
    await user.type(input, 'Test')
    
    await waitFor(() => {
      expect(screen.getByText(/result/i)).toBeInTheDocument()
    })
  })

  it('should filter posts by title', async () => {
    const user = userEvent.setup()
    render(<SearchBar posts={mockPosts} />)
    
    const input = screen.getByPlaceholderText(/search posts/i)
    await user.type(input, 'Test Post Title')
    
    await waitFor(() => {
      expect(screen.getByText('Test Post Title')).toBeInTheDocument()
    })
  })

  it('should filter posts by description', async () => {
    const user = userEvent.setup()
    render(<SearchBar posts={mockPosts} />)
    
    const input = screen.getByPlaceholderText(/search posts/i)
    await user.type(input, 'description')
    
    await waitFor(() => {
      expect(screen.getByText(/result/i)).toBeInTheDocument()
    })
  })

  it('should filter posts by tags', async () => {
    const user = userEvent.setup()
    render(<SearchBar posts={mockPosts} />)
    
    const input = screen.getByPlaceholderText(/search posts/i)
    await user.type(input, 'Test Tag')
    
    await waitFor(() => {
      expect(screen.getByText(/result/i)).toBeInTheDocument()
    })
  })

  it('should filter posts by category', async () => {
    const user = userEvent.setup()
    render(<SearchBar posts={mockPosts} />)
    
    const input = screen.getByPlaceholderText(/search posts/i)
    await user.type(input, 'Test Category')
    
    await waitFor(() => {
      expect(screen.getByText(/result/i)).toBeInTheDocument()
    })
  })

  it('should show clear button when query is not empty', async () => {
    const user = userEvent.setup()
    render(<SearchBar posts={mockPosts} />)
    
    const input = screen.getByPlaceholderText(/search posts/i)
    
    // Clear button should not be visible initially
    expect(screen.queryByLabelText(/clear search/i)).not.toBeInTheDocument()
    
    // Type something
    await user.type(input, 'test')
    
    // Clear button should now be visible
    await waitFor(() => {
      expect(screen.getByLabelText(/clear search/i)).toBeInTheDocument()
    })
  })

  it('should clear search on clear button click', async () => {
    const user = userEvent.setup()
    render(<SearchBar posts={mockPosts} />)
    
    const input = screen.getByPlaceholderText(/search posts/i)
    await user.type(input, 'test')
    
    await waitFor(() => {
      expect(input).toHaveValue('test')
    })
    
    const clearButton = screen.getByLabelText(/clear search/i)
    await user.click(clearButton)
    
    expect(input).toHaveValue('')
  })

  it('should close dropdown on result click', async () => {
    const user = userEvent.setup()
    render(<SearchBar posts={mockPosts} />)
    
    const input = screen.getByPlaceholderText(/search posts/i)
    await user.type(input, 'Test')
    
    await waitFor(() => {
      expect(screen.getByText('Test Post Title')).toBeInTheDocument()
    })
    
    const result = screen.getByText('Test Post Title')
    await user.click(result)
    
    // Input should be cleared
    expect(input).toHaveValue('')
  })

  it('should show result count', async () => {
    const user = userEvent.setup()
    render(<SearchBar posts={mockPosts} />)
    
    const input = screen.getByPlaceholderText(/search posts/i)
    await user.type(input, 'Test')
    
    await waitFor(() => {
      const resultText = screen.getByText(/result/i)
      expect(resultText).toBeInTheDocument()
      // Should show "2 results found" or "1 result found"
      expect(resultText.textContent).toMatch(/\d+ results? found/)
    })
  })

  it('should show singular "result" for one match', async () => {
    const user = userEvent.setup()
    const singlePost = [mockPosts[0]]
    render(<SearchBar posts={singlePost} />)
    
    const input = screen.getByPlaceholderText(/search posts/i)
    await user.type(input, 'Test')
    
    await waitFor(() => {
      expect(screen.getByText(/1 result found/i)).toBeInTheDocument()
    })
  })

  it('should show plural "results" for multiple matches', async () => {
    const user = userEvent.setup()
    render(<SearchBar posts={mockPosts} />)
    
    const input = screen.getByPlaceholderText(/search posts/i)
    await user.type(input, 'Test')
    
    await waitFor(() => {
      expect(screen.getByText(/2 results found/i)).toBeInTheDocument()
    })
  })

  it('should not show dropdown for empty query', async () => {
    const user = userEvent.setup()
    render(<SearchBar posts={mockPosts} />)
    
    const input = screen.getByPlaceholderText(/search posts/i)
    await user.type(input, 'test')
    
    await waitFor(() => {
      expect(screen.getByText(/result/i)).toBeInTheDocument()
    })
    
    // Clear the input
    await user.clear(input)
    
    await waitFor(() => {
      expect(screen.queryByText(/result/i)).not.toBeInTheDocument()
    })
  })

  it('should be case-insensitive', async () => {
    const user = userEvent.setup()
    render(<SearchBar posts={mockPosts} />)
    
    const input = screen.getByPlaceholderText(/search posts/i)
    await user.type(input, 'TEST POST')
    
    await waitFor(() => {
      expect(screen.getByText('Test Post Title')).toBeInTheDocument()
    })
  })

  it('should show no results when no matches', async () => {
    const user = userEvent.setup()
    render(<SearchBar posts={mockPosts} />)
    
    const input = screen.getByPlaceholderText(/search posts/i)
    await user.type(input, 'nonexistent query xyz123')
    
    await waitFor(() => {
      expect(screen.queryByText(/result/i)).not.toBeInTheDocument()
    })
  })

  it('should render post category and reading time in results', async () => {
    const user = userEvent.setup()
    render(<SearchBar posts={mockPosts} />)
    
    const input = screen.getByPlaceholderText(/search posts/i)
    await user.type(input, 'Test')
    
    await waitFor(() => {
      // There are multiple "Test Category" texts, so use getAllByText
      const categories = screen.getAllByText('Test Category')
      expect(categories.length).toBeGreaterThan(0)
      
      const readingTimes = screen.getAllByText(/min read/i)
      expect(readingTimes.length).toBeGreaterThan(0)
    })
  })

  it('should have correct link href for results', async () => {
    const user = userEvent.setup()
    render(<SearchBar posts={mockPosts} />)
    
    const input = screen.getByPlaceholderText(/search posts/i)
    await user.type(input, 'Test Post Title')
    
    await waitFor(() => {
      const link = screen.getByRole('link', { name: /Test Post Title/i })
      expect(link).toHaveAttribute('href', '/blog/test-post')
    })
  })

  it('should handle empty posts array', () => {
    render(<SearchBar posts={[]} />)
    const input = screen.getByPlaceholderText(/search posts/i)
    expect(input).toBeInTheDocument()
  })

  it('should trim whitespace from query', async () => {
    const user = userEvent.setup()
    render(<SearchBar posts={mockPosts} />)
    
    const input = screen.getByPlaceholderText(/search posts/i)
    await user.type(input, '   ')
    
    // Should not show results for whitespace-only query
    await waitFor(() => {
      expect(screen.queryByText(/result/i)).not.toBeInTheDocument()
    })
  })
})
