import { describe, it, expect } from 'vitest'
import { PostInputZ, BulkPostsZ } from '@/lib/validation/posts-upload'

describe('PostInputZ Schema', () => {
  const validPost = {
    slug: 'test-post',
    title: 'Test Post',
    description: 'A test post description',
    content: '# Test Content',
    author: 'Test Author',
    readingTime: 5,
    published: true,
    featured: false,
    categorySlug: 'test-category',
    tags: ['tag1', 'tag2'],
    keywords: ['keyword1', 'keyword2'],
  }

  describe('Valid Input', () => {
    it('should accept valid post with all required fields', () => {
      const result = PostInputZ.safeParse(validPost)
      expect(result.success).toBe(true)
    })

    it('should accept post with optional fields', () => {
      const postWithOptionals = {
        ...validPost,
        excerpt: 'This is an excerpt',
        publishedAt: new Date().toISOString(),
        scheduledFor: new Date().toISOString(),
        featuredImage: 'https://example.com/image.jpg',
        featuredImageAlt: 'Image alt text',
      }

      const result = PostInputZ.safeParse(postWithOptionals)
      expect(result.success).toBe(true)
    })

    it('should apply default values for boolean fields', () => {
      const minimalPost = {
        slug: 'test',
        title: 'Test',
        description: 'Test description',
        content: 'Test content',
        author: 'Author',
        readingTime: 5,
        categorySlug: 'category',
      }

      const result = PostInputZ.safeParse(minimalPost)
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.published).toBe(false)
        expect(result.data.featured).toBe(false)
        expect(result.data.tags).toEqual([])
        expect(result.data.keywords).toEqual([])
      }
    })
  })

  describe('Slug Validation', () => {
    it('should reject empty slug', () => {
      const post = { ...validPost, slug: '' }
      const result = PostInputZ.safeParse(post)
      expect(result.success).toBe(false)
    })

    it('should reject slug with uppercase letters', () => {
      const post = { ...validPost, slug: 'Test-Post' }
      const result = PostInputZ.safeParse(post)
      expect(result.success).toBe(false)
    })

    it('should reject slug with spaces', () => {
      const post = { ...validPost, slug: 'test post' }
      const result = PostInputZ.safeParse(post)
      expect(result.success).toBe(false)
    })

    it('should reject slug with special characters', () => {
      const post = { ...validPost, slug: 'test_post!' }
      const result = PostInputZ.safeParse(post)
      expect(result.success).toBe(false)
    })

    it('should accept slug with hyphens and numbers', () => {
      const post = { ...validPost, slug: 'test-post-123' }
      const result = PostInputZ.safeParse(post)
      expect(result.success).toBe(true)
    })

    it('should reject slug longer than 100 characters', () => {
      const post = { ...validPost, slug: 'a'.repeat(101) }
      const result = PostInputZ.safeParse(post)
      expect(result.success).toBe(false)
    })
  })

  describe('Title Validation', () => {
    it('should reject empty title', () => {
      const post = { ...validPost, title: '' }
      const result = PostInputZ.safeParse(post)
      expect(result.success).toBe(false)
    })

    it('should reject title longer than 150 characters', () => {
      const post = { ...validPost, title: 'a'.repeat(151) }
      const result = PostInputZ.safeParse(post)
      expect(result.success).toBe(false)
    })

    it('should accept title at max length', () => {
      const post = { ...validPost, title: 'a'.repeat(150) }
      const result = PostInputZ.safeParse(post)
      expect(result.success).toBe(true)
    })
  })

  describe('Description Validation', () => {
    it('should reject empty description', () => {
      const post = { ...validPost, description: '' }
      const result = PostInputZ.safeParse(post)
      expect(result.success).toBe(false)
    })

    it('should reject description longer than 300 characters', () => {
      const post = { ...validPost, description: 'a'.repeat(301) }
      const result = PostInputZ.safeParse(post)
      expect(result.success).toBe(false)
    })
  })

  describe('Content Validation', () => {
    it('should reject empty content', () => {
      const post = { ...validPost, content: '' }
      const result = PostInputZ.safeParse(post)
      expect(result.success).toBe(false)
    })

    it('should accept long content', () => {
      const post = { ...validPost, content: 'a'.repeat(10000) }
      const result = PostInputZ.safeParse(post)
      expect(result.success).toBe(true)
    })
  })

  describe('Excerpt Validation', () => {
    it('should accept missing excerpt', () => {
      const post = { ...validPost }
      delete (post as any).excerpt
      const result = PostInputZ.safeParse(post)
      expect(result.success).toBe(true)
    })

    it('should reject excerpt longer than 300 characters', () => {
      const post = { ...validPost, excerpt: 'a'.repeat(301) }
      const result = PostInputZ.safeParse(post)
      expect(result.success).toBe(false)
    })
  })

  describe('Author Validation', () => {
    it('should reject empty author', () => {
      const post = { ...validPost, author: '' }
      const result = PostInputZ.safeParse(post)
      expect(result.success).toBe(false)
    })

    it('should reject author longer than 100 characters', () => {
      const post = { ...validPost, author: 'a'.repeat(101) }
      const result = PostInputZ.safeParse(post)
      expect(result.success).toBe(false)
    })
  })

  describe('Reading Time Validation', () => {
    it('should reject negative reading time', () => {
      const post = { ...validPost, readingTime: -1 }
      const result = PostInputZ.safeParse(post)
      expect(result.success).toBe(false)
    })

    it('should reject reading time over 3600', () => {
      const post = { ...validPost, readingTime: 3601 }
      const result = PostInputZ.safeParse(post)
      expect(result.success).toBe(false)
    })

    it('should reject non-integer reading time', () => {
      const post = { ...validPost, readingTime: 5.5 }
      const result = PostInputZ.safeParse(post)
      expect(result.success).toBe(false)
    })

    it('should accept zero reading time', () => {
      const post = { ...validPost, readingTime: 0 }
      const result = PostInputZ.safeParse(post)
      expect(result.success).toBe(true)
    })
  })

  describe('DateTime Validation', () => {
    it('should accept valid ISO datetime for publishedAt', () => {
      const post = { ...validPost, publishedAt: '2025-01-01T00:00:00.000Z' }
      const result = PostInputZ.safeParse(post)
      expect(result.success).toBe(true)
    })

    it('should reject invalid datetime format for publishedAt', () => {
      const post = { ...validPost, publishedAt: 'not-a-date' }
      const result = PostInputZ.safeParse(post)
      expect(result.success).toBe(false)
    })

    it('should accept valid ISO datetime for scheduledFor', () => {
      const post = { ...validPost, scheduledFor: '2025-12-31T23:59:59.999Z' }
      const result = PostInputZ.safeParse(post)
      expect(result.success).toBe(true)
    })

    it('should reject invalid datetime format for scheduledFor', () => {
      const post = { ...validPost, scheduledFor: '2025-13-01' }
      const result = PostInputZ.safeParse(post)
      expect(result.success).toBe(false)
    })
  })

  describe('Category Validation', () => {
    it('should reject empty category slug', () => {
      const post = { ...validPost, categorySlug: '' }
      const result = PostInputZ.safeParse(post)
      expect(result.success).toBe(false)
    })

    it('should reject category slug longer than 60 characters', () => {
      const post = { ...validPost, categorySlug: 'a'.repeat(61) }
      const result = PostInputZ.safeParse(post)
      expect(result.success).toBe(false)
    })
  })

  describe('Tags Validation', () => {
    it('should accept empty tags array', () => {
      const post = { ...validPost, tags: [] }
      const result = PostInputZ.safeParse(post)
      expect(result.success).toBe(true)
    })

    it('should reject more than 30 tags', () => {
      const post = { ...validPost, tags: Array(31).fill('tag') }
      const result = PostInputZ.safeParse(post)
      expect(result.success).toBe(false)
    })

    it('should reject tag longer than 60 characters', () => {
      const post = { ...validPost, tags: ['a'.repeat(61)] }
      const result = PostInputZ.safeParse(post)
      expect(result.success).toBe(false)
    })

    it('should reject empty tag string', () => {
      const post = { ...validPost, tags: [''] }
      const result = PostInputZ.safeParse(post)
      expect(result.success).toBe(false)
    })
  })

  describe('Keywords Validation', () => {
    it('should accept empty keywords array', () => {
      const post = { ...validPost, keywords: [] }
      const result = PostInputZ.safeParse(post)
      expect(result.success).toBe(true)
    })

    it('should reject more than 40 keywords', () => {
      const post = { ...validPost, keywords: Array(41).fill('keyword') }
      const result = PostInputZ.safeParse(post)
      expect(result.success).toBe(false)
    })

    it('should reject keyword longer than 40 characters', () => {
      const post = { ...validPost, keywords: ['a'.repeat(41)] }
      const result = PostInputZ.safeParse(post)
      expect(result.success).toBe(false)
    })
  })

  describe('Featured Image Validation', () => {
    it('should accept valid URL for featured image', () => {
      const post = { ...validPost, featuredImage: 'https://example.com/image.jpg' }
      const result = PostInputZ.safeParse(post)
      expect(result.success).toBe(true)
    })

    it('should reject invalid URL for featured image', () => {
      const post = { ...validPost, featuredImage: 'not-a-url' }
      const result = PostInputZ.safeParse(post)
      expect(result.success).toBe(false)
    })

    it('should accept missing featured image', () => {
      const post = { ...validPost }
      delete (post as any).featuredImage
      const result = PostInputZ.safeParse(post)
      expect(result.success).toBe(true)
    })
  })

  describe('Featured Image Alt Validation', () => {
    it('should reject alt text longer than 160 characters', () => {
      const post = { ...validPost, featuredImageAlt: 'a'.repeat(161) }
      const result = PostInputZ.safeParse(post)
      expect(result.success).toBe(false)
    })

    it('should accept alt text at max length', () => {
      const post = { ...validPost, featuredImageAlt: 'a'.repeat(160) }
      const result = PostInputZ.safeParse(post)
      expect(result.success).toBe(true)
    })
  })
})

describe('BulkPostsZ Schema', () => {
  const validPost = {
    slug: 'test-post',
    title: 'Test Post',
    description: 'A test post description',
    content: '# Test Content',
    author: 'Test Author',
    readingTime: 5,
    categorySlug: 'test-category',
  }

  it('should accept array with one post', () => {
    const result = BulkPostsZ.safeParse([validPost])
    expect(result.success).toBe(true)
  })

  it('should accept array with multiple posts', () => {
    const result = BulkPostsZ.safeParse([validPost, validPost, validPost])
    expect(result.success).toBe(true)
  })

  it('should reject empty array', () => {
    const result = BulkPostsZ.safeParse([])
    expect(result.success).toBe(false)
  })

  it('should reject non-array input', () => {
    const result = BulkPostsZ.safeParse(validPost)
    expect(result.success).toBe(false)
  })

  it('should reject array with invalid post', () => {
    const invalidPost = { ...validPost, slug: '' }
    const result = BulkPostsZ.safeParse([invalidPost])
    expect(result.success).toBe(false)
  })

  it('should reject if any post in array is invalid', () => {
    const invalidPost = { ...validPost, title: '' }
    const result = BulkPostsZ.safeParse([validPost, invalidPost, validPost])
    expect(result.success).toBe(false)
  })
})
