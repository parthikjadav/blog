import { describe, it, expect, beforeEach, beforeAll, afterAll } from 'vitest'
import { prisma } from '@/lib/prisma'
import type { PostInput } from '@/lib/validation/posts-upload'

const BASE_URL = 'http://localhost:3000/api/admin/posts'
const TEST_API_KEY = 'test-api-key-12345'

// Set environment variable for tests
process.env.POSTS_UPLOAD_API_KEY = TEST_API_KEY

describe('Posts CRUD API', () => {
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

  // Helper to create a post
  async function createPost(post: PostInput) {
    return fetch(`${BASE_URL}/create`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': TEST_API_KEY,
      },
      body: JSON.stringify([post]),
    })
  }

  describe('GET /api/admin/posts/create (Get All Posts)', () => {
    it('should return 401 without API key', async () => {
      const response = await fetch(`${BASE_URL}/create`)
      expect(response.status).toBe(401)
    })

    it('should return empty list when no posts exist', async () => {
      const response = await fetch(`${BASE_URL}/create`, {
        headers: { 'x-api-key': TEST_API_KEY },
      })

      expect(response.status).toBe(200)
      const data = await response.json()
      expect(data.success).toBe(true)
      expect(data.posts).toEqual([])
      expect(data.pagination.total).toBe(0)
    })

    it('should return all posts with pagination', async () => {
      // Create 3 posts
      await createPost({ ...validPost, slug: 'post-1', title: 'Post 1' })
      await createPost({ ...validPost, slug: 'post-2', title: 'Post 2' })
      await createPost({ ...validPost, slug: 'post-3', title: 'Post 3' })

      const response = await fetch(`${BASE_URL}/create`, {
        headers: { 'x-api-key': TEST_API_KEY },
      })

      expect(response.status).toBe(200)
      const data = await response.json()
      expect(data.success).toBe(true)
      expect(data.posts.length).toBe(3)
      expect(data.pagination.total).toBe(3)
      expect(data.pagination.page).toBe(1)
      expect(data.pagination.limit).toBe(10)
    })

    it('should support pagination with page and limit', async () => {
      // Create 15 posts
      for (let i = 1; i <= 15; i++) {
        await createPost({ ...validPost, slug: `post-${i}`, title: `Post ${i}` })
      }

      const response = await fetch(`${BASE_URL}/create?page=2&limit=5`, {
        headers: { 'x-api-key': TEST_API_KEY },
      })

      expect(response.status).toBe(200)
      const data = await response.json()
      expect(data.posts.length).toBe(5)
      expect(data.pagination.page).toBe(2)
      expect(data.pagination.limit).toBe(5)
      expect(data.pagination.total).toBe(15)
      expect(data.pagination.totalPages).toBe(3)
      expect(data.pagination.hasNext).toBe(true)
      expect(data.pagination.hasPrev).toBe(true)
    })

    it('should filter by published status', async () => {
      await createPost({ ...validPost, slug: 'published', published: true })
      await createPost({ ...validPost, slug: 'draft', published: false })

      const response = await fetch(`${BASE_URL}/create?published=true`, {
        headers: { 'x-api-key': TEST_API_KEY },
      })

      const data = await response.json()
      expect(data.posts.length).toBe(1)
      expect(data.posts[0].slug).toBe('published')
    })

    it('should filter by featured status', async () => {
      await createPost({ ...validPost, slug: 'featured', featured: true })
      await createPost({ ...validPost, slug: 'normal', featured: false })

      const response = await fetch(`${BASE_URL}/create?featured=true`, {
        headers: { 'x-api-key': TEST_API_KEY },
      })

      const data = await response.json()
      expect(data.posts.length).toBe(1)
      expect(data.posts[0].slug).toBe('featured')
    })

    it('should filter by category', async () => {
      await createPost({ ...validPost, slug: 'tech-post', categorySlug: 'technology' })
      await createPost({ ...validPost, slug: 'design-post', categorySlug: 'design' })

      const response = await fetch(`${BASE_URL}/create?category=technology`, {
        headers: { 'x-api-key': TEST_API_KEY },
      })

      const data = await response.json()
      expect(data.posts.length).toBe(1)
      expect(data.posts[0].slug).toBe('tech-post')
    })

    it('should search in title and description', async () => {
      await createPost({ ...validPost, slug: 'post-1', title: 'React Tutorial', description: 'Learn React' })
      await createPost({ ...validPost, slug: 'post-2', title: 'Vue Guide', description: 'Learn Vue' })

      const response = await fetch(`${BASE_URL}/create?search=React`, {
        headers: { 'x-api-key': TEST_API_KEY },
      })

      const data = await response.json()
      expect(data.posts.length).toBe(1)
      expect(data.posts[0].slug).toBe('post-1')
    })

    it('should include category and tags in response', async () => {
      await createPost(validPost)

      const response = await fetch(`${BASE_URL}/create`, {
        headers: { 'x-api-key': TEST_API_KEY },
      })

      const data = await response.json()
      const post = data.posts[0]
      expect(post.category).toBeDefined()
      expect(post.category.slug).toBe('test-category')
      expect(post.tags).toBeDefined()
      expect(post.tags.length).toBe(2)
    })

    it('should enforce max limit of 100', async () => {
      const response = await fetch(`${BASE_URL}/create?limit=200`, {
        headers: { 'x-api-key': TEST_API_KEY },
      })

      const data = await response.json()
      expect(data.pagination.limit).toBe(100)
    })
  })

  describe('GET /api/admin/posts/[slug] (Get Single Post)', () => {
    it('should return 401 without API key', async () => {
      const response = await fetch(`${BASE_URL}/test-post`)
      expect(response.status).toBe(401)
    })

    it('should return 404 for non-existent post', async () => {
      const response = await fetch(`${BASE_URL}/non-existent`, {
        headers: { 'x-api-key': TEST_API_KEY },
      })

      expect(response.status).toBe(404)
      const data = await response.json()
      expect(data.error).toBe('Not found')
    })

    it('should return post by slug', async () => {
      await createPost(validPost)

      const response = await fetch(`${BASE_URL}/test-post`, {
        headers: { 'x-api-key': TEST_API_KEY },
      })

      expect(response.status).toBe(200)
      const data = await response.json()
      expect(data.slug).toBe('test-post')
      expect(data.title).toBe('Test Post')
      expect(data.content).toBe('# Test Content\n\nThis is test content.')
    })

    it('should include full post data with relations', async () => {
      await createPost(validPost)

      const response = await fetch(`${BASE_URL}/test-post`, {
        headers: { 'x-api-key': TEST_API_KEY },
      })

      const data = await response.json()
      expect(data.category).toBeDefined()
      expect(data.category.slug).toBe('test-category')
      expect(data.tags).toBeDefined()
      expect(data.tags.length).toBe(2)
      expect(data.keywords).toEqual(['test', 'post'])
      expect(data.createdAt).toBeDefined()
      expect(data.updatedAt).toBeDefined()
    })
  })

  describe('PUT /api/admin/posts/[slug] (Update Post)', () => {
    it('should return 401 without API key', async () => {
      const response = await fetch(`${BASE_URL}/test-post`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: 'Updated' }),
      })
      expect(response.status).toBe(401)
    })

    it('should return 404 for non-existent post', async () => {
      const response = await fetch(`${BASE_URL}/non-existent`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': TEST_API_KEY,
        },
        body: JSON.stringify(validPost),
      })

      expect(response.status).toBe(404)
    })

    it('should update existing post', async () => {
      await createPost(validPost)

      const updatedData = {
        title: 'Updated Title',
        description: 'Updated description',
        content: '# Updated Content',
        author: validPost.author,
        readingTime: 10,
        published: true,
        featured: true,
        categorySlug: 'updated-category',
        tags: ['new-tag'],
        keywords: ['updated'],
      }

      const response = await fetch(`${BASE_URL}/test-post`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': TEST_API_KEY,
        },
        body: JSON.stringify(updatedData),
      })

      expect(response.status).toBe(200)
      const data = await response.json()
      expect(data.success).toBe(true)
      expect(data.post.slug).toBe('test-post')

      // Verify in database
      const post = await prisma.post.findUnique({ where: { slug: 'test-post' } })
      expect(post?.title).toBe('Updated Title')
      expect(post?.featured).toBe(true)
      expect(post?.readingTime).toBe(10)
    })

    it('should sync tags when updating', async () => {
      await createPost(validPost)

      const updatedData = {
        ...validPost,
        tags: ['completely', 'different', 'tags'],
      }

      await fetch(`${BASE_URL}/test-post`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': TEST_API_KEY,
        },
        body: JSON.stringify(updatedData),
      })

      const post = await prisma.post.findUnique({
        where: { slug: 'test-post' },
        include: { tags: { include: { tag: true } } },
      })

      expect(post?.tags.length).toBe(3)
      expect(post?.tags.map(pt => pt.tag.slug)).toContain('completely')
      expect(post?.tags.map(pt => pt.tag.slug)).not.toContain('test-tag-1')
    })

    it('should return 400 for invalid data', async () => {
      await createPost(validPost)

      const response = await fetch(`${BASE_URL}/test-post`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': TEST_API_KEY,
        },
        body: JSON.stringify({ title: '' }), // Invalid: empty title
      })

      expect(response.status).toBe(400)
      const data = await response.json()
      expect(data.error).toBe('Validation failed')
    })
  })

  describe('DELETE /api/admin/posts/[slug] (Delete Post)', () => {
    it('should return 401 without API key', async () => {
      const response = await fetch(`${BASE_URL}/test-post`, {
        method: 'DELETE',
      })
      expect(response.status).toBe(401)
    })

    it('should return 404 for non-existent post', async () => {
      const response = await fetch(`${BASE_URL}/non-existent`, {
        method: 'DELETE',
        headers: { 'x-api-key': TEST_API_KEY },
      })

      expect(response.status).toBe(404)
    })

    it('should delete existing post', async () => {
      await createPost(validPost)

      const response = await fetch(`${BASE_URL}/test-post`, {
        method: 'DELETE',
        headers: { 'x-api-key': TEST_API_KEY },
      })

      expect(response.status).toBe(200)
      const data = await response.json()
      expect(data.success).toBe(true)
      expect(data.deletedPost.slug).toBe('test-post')

      // Verify deletion in database
      const post = await prisma.post.findUnique({ where: { slug: 'test-post' } })
      expect(post).toBeNull()
    })

    it('should cascade delete post-tag relations', async () => {
      await createPost(validPost)

      const postBefore = await prisma.post.findUnique({
        where: { slug: 'test-post' },
        include: { tags: true },
      })
      expect(postBefore?.tags.length).toBeGreaterThan(0)

      await fetch(`${BASE_URL}/test-post`, {
        method: 'DELETE',
        headers: { 'x-api-key': TEST_API_KEY },
      })

      // Verify PostTag relations are deleted
      const postTags = await prisma.postTag.findMany({
        where: { postId: postBefore!.id },
      })
      expect(postTags.length).toBe(0)
    })

    it('should not delete tags when deleting post', async () => {
      await createPost(validPost)

      const tagsBefore = await prisma.tag.count()
      expect(tagsBefore).toBe(2)

      await fetch(`${BASE_URL}/test-post`, {
        method: 'DELETE',
        headers: { 'x-api-key': TEST_API_KEY },
      })

      // Tags should still exist
      const tagsAfter = await prisma.tag.count()
      expect(tagsAfter).toBe(2)
    })

    it('should not delete category when deleting post', async () => {
      await createPost(validPost)

      const categoriesBefore = await prisma.category.count()
      expect(categoriesBefore).toBe(1)

      await fetch(`${BASE_URL}/test-post`, {
        method: 'DELETE',
        headers: { 'x-api-key': TEST_API_KEY },
      })

      // Category should still exist
      const categoriesAfter = await prisma.category.count()
      expect(categoriesAfter).toBe(1)
    })
  })

  describe('Complete CRUD Workflow', () => {
    it('should support full CRUD lifecycle', async () => {
      // CREATE
      const createResponse = await createPost(validPost)
      expect(createResponse.status).toBe(200)

      // READ (single)
      const getResponse = await fetch(`${BASE_URL}/test-post`, {
        headers: { 'x-api-key': TEST_API_KEY },
      })
      expect(getResponse.status).toBe(200)
      const getData = await getResponse.json()
      expect(getData.slug).toBe('test-post')

      // READ (all)
      const getAllResponse = await fetch(`${BASE_URL}/create`, {
        headers: { 'x-api-key': TEST_API_KEY },
      })
      expect(getAllResponse.status).toBe(200)
      const getAllData = await getAllResponse.json()
      expect(getAllData.posts.length).toBe(1)

      // UPDATE
      const updateResponse = await fetch(`${BASE_URL}/test-post`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': TEST_API_KEY,
        },
        body: JSON.stringify({ ...validPost, title: 'Updated Title' }),
      })
      expect(updateResponse.status).toBe(200)

      // Verify update
      const verifyResponse = await fetch(`${BASE_URL}/test-post`, {
        headers: { 'x-api-key': TEST_API_KEY },
      })
      const verifyData = await verifyResponse.json()
      expect(verifyData.title).toBe('Updated Title')

      // DELETE
      const deleteResponse = await fetch(`${BASE_URL}/test-post`, {
        method: 'DELETE',
        headers: { 'x-api-key': TEST_API_KEY },
      })
      expect(deleteResponse.status).toBe(200)

      // Verify deletion
      const verifyDeleteResponse = await fetch(`${BASE_URL}/test-post`, {
        headers: { 'x-api-key': TEST_API_KEY },
      })
      expect(verifyDeleteResponse.status).toBe(404)
    })
  })
})
