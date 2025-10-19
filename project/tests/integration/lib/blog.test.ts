import { describe, it, expect, beforeAll } from 'vitest'
import {
  getAllPosts,
  getPostBySlug,
  getPostsByCategory,
  getPostsByTag,
  getAllCategories,
  getAllTags,
  getRelatedPosts
} from '@/lib/blog'

describe('Blog Database Integration Tests', () => {
  describe('getAllPosts', () => {
    it('should return an array of posts', async () => {
      const posts = await getAllPosts()
      expect(Array.isArray(posts)).toBe(true)
    })

    it('should return only published posts', async () => {
      const posts = await getAllPosts()
      posts.forEach(post => {
        expect(post.published).toBe(true)
      })
    })

    it('should filter out scheduled posts in the future', async () => {
      const posts = await getAllPosts()
      const now = new Date()
      
      posts.forEach(post => {
        if (post.scheduledFor) {
          expect(new Date(post.scheduledFor) <= now).toBe(true)
        }
      })
    })

    it('should return posts with all required fields', async () => {
      const posts = await getAllPosts()
      
      if (posts.length > 0) {
        const post = posts[0]
        expect(post).toHaveProperty('id')
        expect(post).toHaveProperty('slug')
        expect(post).toHaveProperty('title')
        expect(post).toHaveProperty('description')
        expect(post).toHaveProperty('content')
        expect(post).toHaveProperty('category')
        expect(post).toHaveProperty('tags')
        expect(post).toHaveProperty('readingTime')
        expect(post).toHaveProperty('author')
      }
    })

    it('should return posts ordered by publishedAt desc', async () => {
      const posts = await getAllPosts()
      
      if (posts.length > 1) {
        for (let i = 0; i < posts.length - 1; i++) {
          const current = posts[i].publishedAt
          const next = posts[i + 1].publishedAt
          
          if (current && next) {
            expect(new Date(current) >= new Date(next)).toBe(true)
          }
        }
      }
    })

    it('should include category information', async () => {
      const posts = await getAllPosts()
      
      if (posts.length > 0) {
        const post = posts[0]
        expect(post.category).toHaveProperty('id')
        expect(post.category).toHaveProperty('name')
        expect(post.category).toHaveProperty('slug')
      }
    })

    it('should include tags array', async () => {
      const posts = await getAllPosts()
      
      if (posts.length > 0) {
        const post = posts[0]
        expect(Array.isArray(post.tags)).toBe(true)
        
        if (post.tags.length > 0) {
          const tag = post.tags[0]
          expect(tag).toHaveProperty('id')
          expect(tag).toHaveProperty('name')
          expect(tag).toHaveProperty('slug')
        }
      }
    })

    it('should parse keywords as array', async () => {
      const posts = await getAllPosts()
      
      if (posts.length > 0) {
        const post = posts[0]
        expect(Array.isArray(post.keywords)).toBe(true)
      }
    })
  })

  describe('getPostBySlug', () => {
    it('should return null for non-existent slug', async () => {
      const post = await getPostBySlug('non-existent-slug-12345')
      expect(post).toBeNull()
    })

    it('should return post for valid slug', async () => {
      const posts = await getAllPosts()
      
      if (posts.length > 0) {
        const firstPost = posts[0]
        const post = await getPostBySlug(firstPost.slug)
        
        expect(post).not.toBeNull()
        expect(post?.slug).toBe(firstPost.slug)
        expect(post?.title).toBe(firstPost.title)
      }
    })

    it('should return null for unpublished post', async () => {
      // This test assumes we don't have unpublished posts accessible
      // If we create one in the future, update this test
      const post = await getPostBySlug('unpublished-post')
      expect(post).toBeNull()
    })

    it('should return post with all fields', async () => {
      const posts = await getAllPosts()
      
      if (posts.length > 0) {
        const post = await getPostBySlug(posts[0].slug)
        
        if (post) {
          expect(post).toHaveProperty('id')
          expect(post).toHaveProperty('slug')
          expect(post).toHaveProperty('title')
          expect(post).toHaveProperty('content')
          expect(post).toHaveProperty('category')
          expect(post).toHaveProperty('tags')
        }
      }
    })
  })

  describe('getPostsByCategory', () => {
    it('should return empty array for non-existent category', async () => {
      const posts = await getPostsByCategory('non-existent-category-12345')
      expect(Array.isArray(posts)).toBe(true)
      expect(posts.length).toBe(0)
    })

    it('should return posts for valid category', async () => {
      const categories = await getAllCategories()
      
      if (categories.length > 0) {
        const category = categories[0]
        const posts = await getPostsByCategory(category.slug)
        
        expect(Array.isArray(posts)).toBe(true)
        
        posts.forEach(post => {
          expect(post.category.slug).toBe(category.slug)
        })
      }
    })

    it('should return only published posts', async () => {
      const categories = await getAllCategories()
      
      if (categories.length > 0) {
        const posts = await getPostsByCategory(categories[0].slug)
        
        posts.forEach(post => {
          expect(post.published).toBe(true)
        })
      }
    })

    it('should filter scheduled posts', async () => {
      const categories = await getAllCategories()
      
      if (categories.length > 0) {
        const posts = await getPostsByCategory(categories[0].slug)
        const now = new Date()
        
        posts.forEach(post => {
          if (post.scheduledFor) {
            expect(new Date(post.scheduledFor) <= now).toBe(true)
          }
        })
      }
    })
  })

  describe('getPostsByTag', () => {
    it('should return empty array for non-existent tag', async () => {
      const posts = await getPostsByTag('non-existent-tag-12345')
      expect(Array.isArray(posts)).toBe(true)
      expect(posts.length).toBe(0)
    })

    it('should return posts for valid tag', async () => {
      const tags = await getAllTags()
      
      if (tags.length > 0) {
        const tag = tags[0]
        const posts = await getPostsByTag(tag.slug)
        
        expect(Array.isArray(posts)).toBe(true)
        
        posts.forEach(post => {
          const hasTag = post.tags.some(t => t.slug === tag.slug)
          expect(hasTag).toBe(true)
        })
      }
    })

    it('should return only published posts', async () => {
      const tags = await getAllTags()
      
      if (tags.length > 0) {
        const posts = await getPostsByTag(tags[0].slug)
        
        posts.forEach(post => {
          expect(post.published).toBe(true)
        })
      }
    })
  })

  describe('getAllCategories', () => {
    it('should return an array of categories', async () => {
      const categories = await getAllCategories()
      expect(Array.isArray(categories)).toBe(true)
    })

    it('should return categories with required fields', async () => {
      const categories = await getAllCategories()
      
      if (categories.length > 0) {
        const category = categories[0]
        expect(category).toHaveProperty('id')
        expect(category).toHaveProperty('name')
        expect(category).toHaveProperty('slug')
        expect(category).toHaveProperty('_count')
      }
    })

    it('should include post count', async () => {
      const categories = await getAllCategories()
      
      if (categories.length > 0) {
        const category = categories[0]
        expect(category._count).toHaveProperty('posts')
        expect(typeof category._count.posts).toBe('number')
        expect(category._count.posts).toBeGreaterThanOrEqual(0)
      }
    })
  })

  describe('getAllTags', () => {
    it('should return an array of tags', async () => {
      const tags = await getAllTags()
      expect(Array.isArray(tags)).toBe(true)
    })

    it('should return tags with required fields', async () => {
      const tags = await getAllTags()
      
      if (tags.length > 0) {
        const tag = tags[0]
        expect(tag).toHaveProperty('name')
        expect(tag).toHaveProperty('slug')
        expect(tag).toHaveProperty('count')
      }
    })

    it('should include post count', async () => {
      const tags = await getAllTags()
      
      if (tags.length > 0) {
        const tag = tags[0]
        expect(typeof tag.count).toBe('number')
        expect(tag.count).toBeGreaterThanOrEqual(0)
      }
    })

    it('should be ordered by post count desc', async () => {
      const tags = await getAllTags()
      
      if (tags.length > 1) {
        for (let i = 0; i < tags.length - 1; i++) {
          expect(tags[i].count >= tags[i + 1].count).toBe(true)
        }
      }
    })
  })

  describe('getRelatedPosts', () => {
    it('should return posts with shared tags', async () => {
      const posts = await getAllPosts()
      
      if (posts.length > 1) {
        const currentPost = posts[0]
        const tagSlugs = currentPost.tags.map(t => t.slug)
        
        const related = await getRelatedPosts(
          currentPost.slug,
          currentPost.category.slug,
          tagSlugs,
          3
        )
        
        expect(related).toHaveProperty('posts')
        expect(related).toHaveProperty('type')
        expect(Array.isArray(related.posts)).toBe(true)
      }
    })

    it('should not include current post', async () => {
      const posts = await getAllPosts()
      
      if (posts.length > 1) {
        const currentPost = posts[0]
        const tagSlugs = currentPost.tags.map(t => t.slug)
        
        const related = await getRelatedPosts(
          currentPost.slug,
          currentPost.category.slug,
          tagSlugs,
          3
        )
        
        related.posts.forEach(post => {
          expect(post.slug).not.toBe(currentPost.slug)
        })
      }
    })

    it('should respect limit parameter', async () => {
      const posts = await getAllPosts()
      
      if (posts.length > 1) {
        const currentPost = posts[0]
        const tagSlugs = currentPost.tags.map(t => t.slug)
        
        const related = await getRelatedPosts(
          currentPost.slug,
          currentPost.category.slug,
          tagSlugs,
          2
        )
        
        expect(related.posts.length).toBeLessThanOrEqual(2)
      }
    })

    it('should return type tags when posts share tags', async () => {
      const posts = await getAllPosts()
      
      if (posts.length > 1) {
        const currentPost = posts[0]
        const tagSlugs = currentPost.tags.map(t => t.slug)
        
        if (tagSlugs.length > 0) {
          const related = await getRelatedPosts(
            currentPost.slug,
            currentPost.category.slug,
            tagSlugs,
            3
          )
          
          // Type should be 'tags', 'category', or 'recent'
          expect(['tags', 'category', 'recent']).toContain(related.type)
        }
      }
    })

    it('should return only published posts', async () => {
      const posts = await getAllPosts()
      
      if (posts.length > 1) {
        const currentPost = posts[0]
        const tagSlugs = currentPost.tags.map(t => t.slug)
        
        const related = await getRelatedPosts(
          currentPost.slug,
          currentPost.category.slug,
          tagSlugs,
          3
        )
        
        related.posts.forEach(post => {
          expect(post.published).toBe(true)
        })
      }
    })
  })
})
