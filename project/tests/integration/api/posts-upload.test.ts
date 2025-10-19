import { describe, it, expect, beforeEach, beforeAll, afterAll } from 'vitest'
import { prisma } from '@/lib/prisma'
import type { PostInput } from '@/lib/validation/posts-upload'

const API_URL = 'http://localhost:3000/api/admin/posts/create'
const TEST_API_KEY = 'test-api-key-12345'

// Set environment variable for tests
process.env.POSTS_UPLOAD_API_KEY = TEST_API_KEY

describe('POST /api/admin/posts/create', () => {
  beforeAll(async () => {
    await prisma.$connect()
  })

  beforeEach(async () => {
    // Clean database before each test
    await prisma.postTag.deleteMany()
    await prisma.post.deleteMany()
    await prisma.tag.deleteMany()
    await prisma.category.deleteMany()
  })

  afterAll(async () => {
    await prisma.$disconnect()
  })

  const validPost: PostInput = {
    slug: 'test-post',
    title: 'Test Post',
    description: 'A test post description',
    content: '# Test Content\n\nThis is test content.',
    author: 'Test Author',
    readingTime: 5,
    published: true,
    featured: false,
    categorySlug: 'test-category',
    tags: ['test-tag-1', 'test-tag-2'],
    keywords: ['test', 'post'],
  }

  describe('Authentication', () => {
    it('should return 401 when x-api-key header is missing', async () => {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify([validPost]),
      })

      expect(response.status).toBe(401)
      const data = await response.json()
      expect(data.error).toBe('Unauthorized')
    })

    it('should return 401 when x-api-key header is invalid', async () => {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': 'invalid-key',
        },
        body: JSON.stringify([validPost]),
      })

      expect(response.status).toBe(401)
      const data = await response.json()
      expect(data.error).toBe('Unauthorized')
    })

    it('should accept request with valid x-api-key', async () => {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': TEST_API_KEY,
        },
        body: JSON.stringify([validPost]),
      })

      expect(response.status).toBe(200)
    })
  })

  describe('Validation', () => {
    it('should return 400 for invalid JSON', async () => {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': TEST_API_KEY,
        },
        body: 'invalid json',
      })

      expect(response.status).toBe(400)
      const data = await response.json()
      expect(data.error).toBe('Invalid JSON')
    })

    it('should return 400 for empty array', async () => {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': TEST_API_KEY,
        },
        body: JSON.stringify([]),
      })

      expect(response.status).toBe(400)
      const data = await response.json()
      expect(data.error).toBe('Validation failed')
      expect(data.issues).toBeDefined()
    })

    it('should return 400 for missing required fields', async () => {
      const invalidPost = {
        slug: 'test',
        // missing title, description, content, etc.
      }

      const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': TEST_API_KEY,
        },
        body: JSON.stringify([invalidPost]),
      })

      expect(response.status).toBe(400)
      const data = await response.json()
      expect(data.error).toBe('Validation failed')
      expect(data.issues.length).toBeGreaterThan(0)
    })

    it('should return 400 for invalid slug format', async () => {
      const invalidPost = {
        ...validPost,
        slug: 'Invalid Slug!',
      }

      const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': TEST_API_KEY,
        },
        body: JSON.stringify([invalidPost]),
      })

      expect(response.status).toBe(400)
      const data = await response.json()
      expect(data.issues.some((i: any) => i.path.includes('slug'))).toBe(true)
    })

    it('should return 400 for invalid datetime format', async () => {
      const invalidPost = {
        ...validPost,
        publishedAt: 'not-a-date',
      }

      const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': TEST_API_KEY,
        },
        body: JSON.stringify([invalidPost]),
      })

      expect(response.status).toBe(400)
      const data = await response.json()
      expect(data.issues.some((i: any) => i.path.includes('publishedAt'))).toBe(true)
    })
  })

  describe('Post Creation', () => {
    it('should create a new post successfully', async () => {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': TEST_API_KEY,
        },
        body: JSON.stringify([validPost]),
      })

      expect(response.status).toBe(200)
      const data = await response.json()
      expect(data.success).toBe(true)
      expect(data.created).toBe(1)
      expect(data.updated).toBe(0)
      expect(data.failed).toBe(0)
      expect(data.results[0].status).toBe('created')

      // Verify in database
      const post = await prisma.post.findUnique({ where: { slug: 'test-post' } })
      expect(post).toBeDefined()
      expect(post?.title).toBe('Test Post')
    })

    it('should create category if it does not exist', async () => {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': TEST_API_KEY,
        },
        body: JSON.stringify([validPost]),
      })

      expect(response.status).toBe(200)

      const category = await prisma.category.findUnique({ where: { slug: 'test-category' } })
      expect(category).toBeDefined()
      expect(category?.name).toBe('Test Category')
    })

    it('should create tags if they do not exist', async () => {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': TEST_API_KEY,
        },
        body: JSON.stringify([validPost]),
      })

      expect(response.status).toBe(200)

      const tag1 = await prisma.tag.findUnique({ where: { slug: 'test-tag-1' } })
      const tag2 = await prisma.tag.findUnique({ where: { slug: 'test-tag-2' } })
      expect(tag1).toBeDefined()
      expect(tag2).toBeDefined()
    })

    it('should link tags to post', async () => {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': TEST_API_KEY,
        },
        body: JSON.stringify([validPost]),
      })

      expect(response.status).toBe(200)

      const post = await prisma.post.findUnique({
        where: { slug: 'test-post' },
        include: { tags: { include: { tag: true } } },
      })

      expect(post?.tags.length).toBe(2)
      expect(post?.tags.map(pt => pt.tag.slug)).toContain('test-tag-1')
      expect(post?.tags.map(pt => pt.tag.slug)).toContain('test-tag-2')
    })

    it('should set publishedAt when published is true', async () => {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': TEST_API_KEY,
        },
        body: JSON.stringify([validPost]),
      })

      expect(response.status).toBe(200)

      const post = await prisma.post.findUnique({ where: { slug: 'test-post' } })
      expect(post?.publishedAt).toBeDefined()
    })
  })

  describe('Post Update (Idempotency)', () => {
    it('should update existing post when slug matches', async () => {
      // Create initial post
      await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': TEST_API_KEY,
        },
        body: JSON.stringify([validPost]),
      })

      // Update post with same slug
      const updatedPost = {
        ...validPost,
        title: 'Updated Title',
        description: 'Updated description',
      }

      const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': TEST_API_KEY,
        },
        body: JSON.stringify([updatedPost]),
      })

      expect(response.status).toBe(200)
      const data = await response.json()
      expect(data.created).toBe(0)
      expect(data.updated).toBe(1)
      expect(data.results[0].status).toBe('updated')

      // Verify update in database
      const post = await prisma.post.findUnique({ where: { slug: 'test-post' } })
      expect(post?.title).toBe('Updated Title')
      expect(post?.description).toBe('Updated description')
    })

    it('should sync tags when updating post', async () => {
      // Create initial post
      await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': TEST_API_KEY,
        },
        body: JSON.stringify([validPost]),
      })

      // Update with different tags
      const updatedPost = {
        ...validPost,
        tags: ['new-tag-1', 'new-tag-2', 'new-tag-3'],
      }

      await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': TEST_API_KEY,
        },
        body: JSON.stringify([updatedPost]),
      })

      // Verify tags updated
      const post = await prisma.post.findUnique({
        where: { slug: 'test-post' },
        include: { tags: { include: { tag: true } } },
      })

      expect(post?.tags.length).toBe(3)
      expect(post?.tags.map(pt => pt.tag.slug)).toContain('new-tag-1')
      expect(post?.tags.map(pt => pt.tag.slug)).not.toContain('test-tag-1')
    })
  })

  describe('Bulk Operations', () => {
    it('should create multiple posts in one request', async () => {
      const posts = [
        { ...validPost, slug: 'post-1', title: 'Post 1' },
        { ...validPost, slug: 'post-2', title: 'Post 2' },
        { ...validPost, slug: 'post-3', title: 'Post 3' },
      ]

      const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': TEST_API_KEY,
        },
        body: JSON.stringify(posts),
      })

      expect(response.status).toBe(200)
      const data = await response.json()
      expect(data.created).toBe(3)
      expect(data.total).toBe(3)

      const dbPosts = await prisma.post.findMany()
      expect(dbPosts.length).toBe(3)
    })

    it('should handle mixed create and update operations', async () => {
      // Create first post
      await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': TEST_API_KEY,
        },
        body: JSON.stringify([{ ...validPost, slug: 'post-1' }]),
      })

      // Send batch with one existing and one new
      const posts = [
        { ...validPost, slug: 'post-1', title: 'Updated Post 1' },
        { ...validPost, slug: 'post-2', title: 'New Post 2' },
      ]

      const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': TEST_API_KEY,
        },
        body: JSON.stringify(posts),
      })

      expect(response.status).toBe(200)
      const data = await response.json()
      expect(data.created).toBe(1)
      expect(data.updated).toBe(1)
      expect(data.failed).toBe(0)
    })

    it('should continue processing after one post fails', async () => {
      const posts = [
        validPost,
        { ...validPost, slug: 'post-2', categorySlug: '' }, // Invalid - empty category
        { ...validPost, slug: 'post-3' },
      ]

      const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': TEST_API_KEY,
        },
        body: JSON.stringify(posts),
      })

      expect(response.status).toBe(200)
      const data = await response.json()
      expect(data.created).toBe(2)
      expect(data.failed).toBe(1)
      expect(data.results.find((r: any) => r.slug === 'post-2')?.status).toBe('failed')
    })
  })

  describe('Method Not Allowed', () => {
    it('should return 405 for GET requests', async () => {
      const response = await fetch(API_URL, {
        method: 'GET',
        headers: { 'x-api-key': TEST_API_KEY },
      })

      expect(response.status).toBe(405)
      const data = await response.json()
      expect(data.error).toBe('Method not allowed')
    })

    it('should return 405 for PUT requests', async () => {
      const response = await fetch(API_URL, {
        method: 'PUT',
        headers: { 'x-api-key': TEST_API_KEY },
        body: JSON.stringify([validPost]),
      })

      expect(response.status).toBe(405)
    })

    it('should return 405 for DELETE requests', async () => {
      const response = await fetch(API_URL, {
        method: 'DELETE',
        headers: { 'x-api-key': TEST_API_KEY },
      })

      expect(response.status).toBe(405)
    })

    it('should return 405 for PATCH requests', async () => {
      const response = await fetch(API_URL, {
        method: 'PATCH',
        headers: { 'x-api-key': TEST_API_KEY },
        body: JSON.stringify([validPost]),
      })

      expect(response.status).toBe(405)
    })
  })
})
