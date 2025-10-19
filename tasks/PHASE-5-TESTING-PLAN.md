# Phase 5: Comprehensive Testing Plan

**Project**: Fast Tech - Next.js 15 Blog with Prisma + SQLite  
**Phase**: Writing Tests  
**Date**: October 19, 2025  
**Status**: Ready to Implement  
**Goal**: Achieve 80%+ code coverage

---

## Overview

This phase focuses on writing comprehensive tests for all functions, utilities, components, and integrations. We'll follow the testing pyramid: more unit tests, fewer integration tests, and minimal E2E tests (future phase).

### Testing Pyramid

```
        /\
       /  \      E2E (Future)
      /____\
     /      \    Integration (20%)
    /________\
   /          \  Unit + Component (80%)
  /__________\
```

---

## Testing Goals

### Coverage Targets
- **Overall Coverage**: 80%+
- **Functions/Utilities**: 90%+
- **Components**: 75%+
- **Integration**: 60%+

### Quality Metrics
- All tests must pass
- No flaky tests
- Fast execution (< 30s for full suite)
- Clear, descriptive test names
- Proper test organization

---

## Phase 5.1: Unit Testing - Utilities & Functions

### 5.1.1: Test `lib/utils.ts`

**File**: `tests/unit/lib/utils.test.ts` ✅ (Already created)

**Functions to Test**:

#### `formatDate(date: string): string`
- ✅ Should format valid date correctly
- ✅ Should handle invalid dates
- [ ] Should handle different date formats (ISO, timestamp)
- [ ] Should handle null/undefined
- [ ] Should handle empty string

#### `slugify(text: string): string`
- ✅ Should convert spaces to hyphens
- ✅ Should handle special characters
- ✅ Should handle empty string
- [ ] Should convert to lowercase
- [ ] Should handle Unicode characters
- [ ] Should handle multiple consecutive spaces
- [ ] Should trim leading/trailing spaces

**Test Template**:
```typescript
describe('formatDate', () => {
  it('should format ISO date correctly', () => {
    const result = formatDate('2025-01-15T10:30:00Z')
    expect(result).toBe('January 15, 2025') // or your format
  })

  it('should handle null gracefully', () => {
    const result = formatDate(null as any)
    expect(result).toBe('Invalid Date')
  })
})
```

**Time Estimate**: 1 hour

---

### 5.1.2: Test `lib/placeholder.ts`

**File**: `tests/unit/lib/placeholder.test.ts` (Create new)

**Functions to Test**:

#### `getPlaceholderImage(slug: string): string`
- [ ] Should return consistent image for same slug
- [ ] Should return different images for different slugs
- [ ] Should return valid image URL
- [ ] Should handle empty slug
- [ ] Should handle special characters in slug

**Test Template**:
```typescript
import { describe, it, expect } from 'vitest'
import { getPlaceholderImage } from '@/lib/placeholder'

describe('getPlaceholderImage', () => {
  it('should return consistent image for same slug', () => {
    const img1 = getPlaceholderImage('test-post')
    const img2 = getPlaceholderImage('test-post')
    expect(img1).toBe(img2)
  })

  it('should return valid URL', () => {
    const img = getPlaceholderImage('test')
    expect(img).toMatch(/^https?:\/\//)
  })
})
```

**Time Estimate**: 30 minutes

---

### 5.1.3: Test `lib/rehype-config.ts`

**File**: `tests/unit/lib/rehype-config.test.ts` (Create new)

**What to Test**:
- [ ] Should export rehypePlugins array
- [ ] Should contain rehype-slug plugin
- [ ] Should contain rehype-autolink-headings plugin
- [ ] Should contain rehype-code-titles plugin

**Test Template**:
```typescript
import { describe, it, expect } from 'vitest'
import { rehypePlugins } from '@/lib/rehype-config'

describe('rehypePlugins', () => {
  it('should be an array', () => {
    expect(Array.isArray(rehypePlugins)).toBe(true)
  })

  it('should contain plugins', () => {
    expect(rehypePlugins.length).toBeGreaterThan(0)
  })
})
```

**Time Estimate**: 20 minutes

---

## Phase 5.2: Integration Testing - Database Functions

### 5.2.1: Test `lib/blog.ts` - Database Queries

**File**: `tests/integration/lib/blog.test.ts` (Create new)

**Functions to Test**:

#### `getAllPosts()`
- [ ] Should return array of posts
- [ ] Should only return published posts
- [ ] Should filter out scheduled posts
- [ ] Should include category and tags
- [ ] Should sort by publishedAt desc
- [ ] Should return empty array if no posts

#### `getPostBySlug(slug: string)`
- [ ] Should return post with matching slug
- [ ] Should return null for non-existent slug
- [ ] Should include category and tags
- [ ] Should not return unpublished posts
- [ ] Should not return scheduled posts

#### `getPostsByCategory(categorySlug: string)`
- [ ] Should return posts in category
- [ ] Should return empty array for non-existent category
- [ ] Should only return published posts
- [ ] Should filter out scheduled posts

#### `getPostsByTag(tagSlug: string)`
- [ ] Should return posts with tag
- [ ] Should return empty array for non-existent tag
- [ ] Should only return published posts

#### `getAllCategories()`
- [ ] Should return all categories
- [ ] Should include post count
- [ ] Should order by post count desc

#### `getAllTags()`
- [ ] Should return all tags
- [ ] Should include post count
- [ ] Should order by post count desc

#### `getRelatedPosts()`
- [ ] Should return posts with shared tags
- [ ] Should return posts from same category
- [ ] Should not return current post
- [ ] Should not return duplicates
- [ ] Should limit results to specified count
- [ ] Should fallback to recent posts

**Test Template**:
```typescript
import { describe, it, expect, beforeAll, afterAll } from 'vitest'
import { getAllPosts, getPostBySlug } from '@/lib/blog'
import { prisma } from '@/lib/prisma'

describe('Blog Database Functions', () => {
  // Setup test data before all tests
  beforeAll(async () => {
    // Create test category
    await prisma.category.create({
      data: {
        name: 'Test Category',
        slug: 'test-category',
      },
    })
    
    // Create test post
    await prisma.post.create({
      data: {
        slug: 'test-post',
        title: 'Test Post',
        description: 'Test description',
        content: 'Test content',
        published: true,
        publishedAt: new Date(),
        readingTime: 5,
        author: 'Test Author',
        category: {
          connect: { slug: 'test-category' }
        }
      },
    })
  })

  // Cleanup after all tests
  afterAll(async () => {
    await prisma.post.deleteMany({
      where: { slug: 'test-post' }
    })
    await prisma.category.deleteMany({
      where: { slug: 'test-category' }
    })
  })

  describe('getAllPosts', () => {
    it('should return array of posts', async () => {
      const posts = await getAllPosts()
      expect(Array.isArray(posts)).toBe(true)
      expect(posts.length).toBeGreaterThan(0)
    })

    it('should include category and tags', async () => {
      const posts = await getAllPosts()
      expect(posts[0]).toHaveProperty('category')
      expect(posts[0]).toHaveProperty('tags')
    })
  })

  describe('getPostBySlug', () => {
    it('should return post with matching slug', async () => {
      const post = await getPostBySlug('test-post')
      expect(post).not.toBeNull()
      expect(post?.slug).toBe('test-post')
    })

    it('should return null for non-existent slug', async () => {
      const post = await getPostBySlug('non-existent')
      expect(post).toBeNull()
    })
  })
})
```

**Time Estimate**: 3 hours

---

## Phase 5.3: Component Testing - Blog Components

**Note**: We are NOT testing `components/ui/*` as these are shadcn/ui components that are already tested by the library.

### 5.3.1: Test `components/blog/post-card.tsx`

**File**: `tests/components/blog/post-card.test.tsx` ✅ (Already created)

**Additional Tests Needed**:
- [ ] Should render with variant="featured"
- [ ] Should render placeholder image when no featuredImage
- [ ] Should render with custom featuredImage
- [ ] Should format date correctly
- [ ] Should render all tags
- [ ] Should have correct link href

**Test Template**:
```typescript
describe('PostCard', () => {
  it('should render with featured variant', () => {
    render(<PostCard post={mockPost} variant="featured" />)
    // Add assertions for featured styling
  })

  it('should render placeholder when no image', () => {
    const postNoImage = { ...mockPost, featuredImage: null }
    render(<PostCard post={postNoImage} />)
    const img = screen.getByRole('img')
    expect(img.getAttribute('src')).toContain('placeholder')
  })
})
```

**Time Estimate**: 1 hour

---

### 5.3.2: Test `components/blog/post-header.tsx`

**File**: `tests/components/blog/post-header.test.tsx` (Create new)

**What to Test**:
- [ ] Should render post title
- [ ] Should render post description
- [ ] Should render category badge
- [ ] Should render all tags
- [ ] Should render published date
- [ ] Should render reading time

**Test Template**:
```typescript
import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { PostHeader } from '@/components/blog/post-header'
import { mockPost } from '@/tests/mocks/data'

describe('PostHeader', () => {
  it('should render post title', () => {
    render(<PostHeader post={mockPost} />)
    expect(screen.getByText(mockPost.title)).toBeInTheDocument()
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
})
```

**Time Estimate**: 45 minutes

---

### 5.3.3: Test `components/blog/related-posts.tsx`

**File**: `tests/components/blog/related-posts.test.tsx` (Create new)

**What to Test**:
- [ ] Should render section title
- [ ] Should render all posts
- [ ] Should not render when posts array is empty
- [ ] Should render correct type label (tags/category/recent)
- [ ] Should render PostCard for each post

**Time Estimate**: 45 minutes

---

### 5.3.4: Test `components/blog/search-bar.tsx`

**File**: `tests/components/blog/search-bar.test.tsx` (Create new)

**What to Test**:
- [ ] Should render search input
- [ ] Should update query on input change
- [ ] Should show results dropdown when typing
- [ ] Should filter posts by title
- [ ] Should filter posts by description
- [ ] Should filter posts by tags
- [ ] Should filter posts by category
- [ ] Should clear search on clear button click
- [ ] Should close dropdown on result click
- [ ] Should show result count

**Test Template**:
```typescript
import { describe, it, expect } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { SearchBar } from '@/components/blog/search-bar'
import { mockPosts } from '@/tests/mocks/data'

describe('SearchBar', () => {
  it('should render search input', () => {
    render(<SearchBar posts={mockPosts} />)
    expect(screen.getByPlaceholderText('Search posts...')).toBeInTheDocument()
  })

  it('should show results when typing', async () => {
    render(<SearchBar posts={mockPosts} />)
    const input = screen.getByPlaceholderText('Search posts...')
    
    fireEvent.change(input, { target: { value: 'Test' } })
    
    await waitFor(() => {
      expect(screen.getByText(/result/i)).toBeInTheDocument()
    })
  })

  it('should filter posts by title', async () => {
    render(<SearchBar posts={mockPosts} />)
    const input = screen.getByPlaceholderText('Search posts...')
    
    fireEvent.change(input, { target: { value: mockPosts[0].title } })
    
    await waitFor(() => {
      expect(screen.getByText(mockPosts[0].title)).toBeInTheDocument()
    })
  })

  it('should clear search', async () => {
    render(<SearchBar posts={mockPosts} />)
    const input = screen.getByPlaceholderText('Search posts...')
    
    fireEvent.change(input, { target: { value: 'Test' } })
    
    const clearButton = screen.getByLabelText('Clear search')
    fireEvent.click(clearButton)
    
    expect(input).toHaveValue('')
  })
})
```

**Time Estimate**: 1.5 hours

---

### 5.3.5: Test `components/blog/table-of-contents.tsx`

**File**: `tests/components/blog/table-of-contents.test.tsx` (Create new)

**What to Test**:
- [ ] Should extract headings from content
- [ ] Should render heading links
- [ ] Should handle empty content
- [ ] Should handle content with no headings
- [ ] Should create proper anchor links

**Time Estimate**: 1 hour

---

### 5.3.6: Test `components/layout/header.tsx`

**File**: `tests/components/layout/header.test.tsx` (Create new)

**What to Test**:
- [ ] Should render site logo/name
- [ ] Should render navigation links
- [ ] Should render theme toggle
- [ ] Should render search component
- [ ] Should highlight active link
- [ ] Should be responsive (mobile menu)

**Time Estimate**: 1 hour

---

### 5.3.7: Test `components/layout/footer.tsx`

**File**: `tests/components/layout/footer.test.tsx` (Create new)

**What to Test**:
- [ ] Should render copyright text
- [ ] Should render social links
- [ ] Should render GitHub link
- [ ] Should open links in new tab

**Time Estimate**: 30 minutes

---

### 5.3.8: Test `components/layout/theme-toggle.tsx`

**File**: `tests/components/layout/theme-toggle.test.tsx` (Create new)

**What to Test**:
- [ ] Should render toggle button
- [ ] Should toggle theme on click
- [ ] Should show correct icon for current theme
- [ ] Should persist theme preference

**Time Estimate**: 45 minutes

---

## Phase 5.4: Custom Hooks Testing

### 5.4.1: Test `hooks/use-debounce.ts`

**File**: `tests/unit/hooks/use-debounce.test.ts` (Create new)

**What to Test**:
- [ ] Should return initial value immediately
- [ ] Should debounce value changes
- [ ] Should update after delay
- [ ] Should cancel previous timeout on new value
- [ ] Should cleanup on unmount

**Test Template**:
```typescript
import { describe, it, expect, vi } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { useDebounce } from '@/hooks/use-debounce'

describe('useDebounce', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('should return initial value immediately', () => {
    const { result } = renderHook(() => useDebounce('test', 500))
    expect(result.current).toBe('test')
  })

  it('should debounce value changes', async () => {
    const { result, rerender } = renderHook(
      ({ value, delay }) => useDebounce(value, delay),
      { initialProps: { value: 'initial', delay: 500 } }
    )

    expect(result.current).toBe('initial')

    rerender({ value: 'updated', delay: 500 })
    expect(result.current).toBe('initial') // Still old value

    vi.advanceTimersByTime(500)
    await waitFor(() => {
      expect(result.current).toBe('updated')
    })
  })
})
```

**Time Estimate**: 1 hour

---

## Phase 5.5: Test Coverage & Quality

### 5.5.1: Generate Coverage Report

**Command**:
```bash
npm run test:coverage
```

**Review**:
- [ ] Check overall coverage percentage
- [ ] Identify uncovered lines
- [ ] Identify uncovered branches
- [ ] Identify uncovered functions

**Target**:
- Overall: 80%+
- Statements: 80%+
- Branches: 75%+
- Functions: 85%+
- Lines: 80%+

**Time Estimate**: 30 minutes

---

### 5.5.2: Improve Coverage

**Actions**:
- [ ] Add tests for uncovered functions
- [ ] Add tests for edge cases
- [ ] Add tests for error handling
- [ ] Add tests for conditional branches

**Time Estimate**: 2-3 hours

---

### 5.5.3: Test Quality Review

**Checklist**:
- [ ] All tests have descriptive names
- [ ] Tests are independent (no shared state)
- [ ] Tests are fast (< 30s total)
- [ ] No flaky tests
- [ ] Proper use of mocks
- [ ] Proper cleanup after tests
- [ ] Tests follow AAA pattern (Arrange, Act, Assert)

**Time Estimate**: 1 hour

---

## Phase 5.6: CI/CD Integration (Future)

### 5.6.1: GitHub Actions Workflow

**File**: `.github/workflows/test.yml` (Create in future)

**What to Include**:
- Run tests on every PR
- Run tests on every push to main
- Generate coverage report
- Fail if coverage drops below threshold
- Cache dependencies for faster runs

**Time Estimate**: 1 hour (future phase)

---

## Testing Best Practices

### 1. Test Naming Convention

```typescript
// ✅ Good
it('should return user when valid ID is provided', () => {})

// ❌ Bad
it('test user', () => {})
```

### 2. AAA Pattern

```typescript
it('should add two numbers', () => {
  // Arrange
  const a = 5
  const b = 3

  // Act
  const result = add(a, b)

  // Assert
  expect(result).toBe(8)
})
```

### 3. Test One Thing

```typescript
// ✅ Good - Tests one behavior
it('should return error when email is invalid', () => {
  expect(validateEmail('invalid')).toHaveProperty('error')
})

// ❌ Bad - Tests multiple things
it('should validate email and password', () => {
  expect(validateEmail('test@test.com')).toBe(true)
  expect(validatePassword('pass123')).toBe(true)
})
```

### 4. Use Descriptive Assertions

```typescript
// ✅ Good
expect(user.name).toBe('John Doe')

// ❌ Bad
expect(user).toBeTruthy()
```

### 5. Mock External Dependencies

```typescript
// ✅ Good - Mock database
vi.mock('@/lib/prisma', () => ({
  prisma: {
    post: {
      findMany: vi.fn().mockResolvedValue([mockPost])
    }
  }
}))
```

### 6. Clean Up After Tests

```typescript
afterEach(() => {
  cleanup() // React Testing Library cleanup
  vi.clearAllMocks() // Clear all mocks
})
```

---

## Time Estimates Summary

| Section | Time | Priority |
|---------|------|----------|
| 5.1: Unit Tests (Utils) | 2 hours | High |
| 5.2: Integration Tests (DB) | 3 hours | High |
| 5.3: Component Tests (Blog/Layout) | 5.5 hours | High |
| 5.4: Hooks Tests | 1 hour | Medium |
| 5.5: Coverage & Quality | 4 hours | High |
| **Total** | **15.5 hours** | - |

**Note**: We are NOT testing `components/ui/*` (shadcn/ui components) as they are already tested by the library.

**Recommended Schedule**: 3-4 days (4-5 hours per day)

---

## Success Criteria

### Phase 5 Complete When:
- ✅ All utility functions tested
- ✅ All database functions tested
- ✅ All UI components tested
- ✅ All custom hooks tested
- ✅ 80%+ code coverage achieved
- ✅ All tests passing
- ✅ No flaky tests
- ✅ Test suite runs in < 30 seconds
- ✅ Coverage report generated
- ✅ Documentation updated

---

## Next Phase

**Phase 6**: Production Deployment
- Deploy to Netlify/Vercel
- Setup environment variables
- Configure database for production
- Setup monitoring
- Setup error tracking

---

**Document Status**: ✅ Ready for Implementation  
**Last Updated**: October 19, 2025  
**Estimated Completion**: 3-4 days
