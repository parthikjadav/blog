import { prisma } from './prisma'
import { cache } from 'react'

export type BlogPost = {
  id: string
  slug: string
  title: string
  description: string
  content: string
  published: boolean
  publishedAt: Date | null
  scheduledFor: Date | null
  readingTime: number
  author: string
  featuredImage: string | null
  featuredImageAlt: string | null
  keywords: string[]
  category: {
    id: string
    name: string
    slug: string
  }
  tags: {
    id: string
    name: string
    slug: string
  }[]
}

// Transform Prisma post to BlogPost type
function transformPost(post: any): BlogPost {
  return {
    id: post.id,
    slug: post.slug,
    title: post.title,
    description: post.description,
    content: post.content,
    published: post.published,
    publishedAt: post.publishedAt,
    scheduledFor: post.scheduledFor,
    readingTime: post.readingTime,
    author: post.author,
    featuredImage: post.featuredImage,
    featuredImageAlt: post.featuredImageAlt,
    keywords: JSON.parse(post.keywords || '[]'),
    category: post.category,
    tags: post.tags.map((pt: any) => pt.tag)
  }
}

// Helper to check if post should be visible
function isPostVisible(post: any): boolean {
  if (!post.published) return false
  if (!post.scheduledFor) return true
  return new Date(post.scheduledFor) <= new Date()
}

// Cache functions for better performance
export const getAllPosts = cache(async () => {
  const now = new Date()
  
  const posts = await prisma.post.findMany({
    where: {
      published: true,
      OR: [
        { scheduledFor: null },
        { scheduledFor: { lte: now } }
      ]
    },
    include: {
      category: true,
      tags: {
        include: {
          tag: true
        }
      }
    },
    orderBy: {
      publishedAt: 'desc'
    }
  })

  return posts.map((post) => ({
    ...post,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    keywords: JSON.parse(post.keywords) as any,
    tags: post.tags.map((pt) => pt.tag),
  }))
})

export const getPostBySlug = cache(async (slug: string) => {
  const post = await prisma.post.findUnique({
    where: { slug },
    include: {
      category: true,
      tags: {
        include: {
          tag: true
        }
      }
    }
  })

  if (!post) return null
  
  // Check if post should be visible
  if (!isPostVisible(post)) return null

  return transformPost(post)
})

export const getPostsByCategory = cache(async (categorySlug: string) => {
  const now = new Date()
  
  const posts = await prisma.post.findMany({
    where: {
      published: true,
      OR: [
        { scheduledFor: null },
        { scheduledFor: { lte: now } }
      ],
      category: {
        slug: categorySlug
      }
    },
    include: {
      category: true,
      tags: {
        include: {
          tag: true
        }
      }
    },
    orderBy: {
      publishedAt: 'desc'
    }
  })

  return posts.map(transformPost)
})

export const getPostsByTag = cache(async (tagSlug: string) => {
  const now = new Date()
  
  const posts = await prisma.post.findMany({
    where: {
      published: true,
      OR: [
        { scheduledFor: null },
        { scheduledFor: { lte: now } }
      ],
      tags: {
        some: {
          tag: {
            slug: tagSlug
          }
        }
      }
    },
    include: {
      category: true,
      tags: {
        include: {
          tag: true
        }
      }
    },
    orderBy: {
      publishedAt: 'desc'
    }
  })

  return posts.map(transformPost)
})

export const getAllCategories = cache(async () => {
  const now = new Date()
  
  return prisma.category.findMany({
    include: {
      _count: {
        select: { 
          posts: { 
            where: { 
              published: true,
              OR: [
                { scheduledFor: null },
                { scheduledFor: { lte: now } }
              ]
            } 
          } 
        }
      }
    }
  })
})

export const getAllTags = cache(async () => {
  const now = new Date()
  
  const tags = await prisma.tag.findMany({
    include: {
      _count: {
        select: { 
          posts: { 
            where: { 
              post: { 
                published: true,
                OR: [
                  { scheduledFor: null },
                  { scheduledFor: { lte: now } }
                ]
              } 
            } 
          } 
        }
      }
    },
    orderBy: {
      posts: {
        _count: 'desc'
      }
    }
  })

  return tags.map(tag => ({
    name: tag.name,
    slug: tag.slug,
    count: tag._count.posts
  }))
})

export const getRelatedPosts = cache(async (
  currentSlug: string,
  categorySlug: string,
  tagSlugs: string[],
  limit: number = 3
) => {
  const now = new Date()
  
  // Get posts with shared tags
  const postsWithSharedTags = await prisma.post.findMany({
    where: {
      published: true,
      OR: [
        { scheduledFor: null },
        { scheduledFor: { lte: now } }
      ],
      slug: { not: currentSlug },
      tags: {
        some: {
          tag: {
            slug: { in: tagSlugs }
          }
        }
      }
    },
    include: {
      category: true,
      tags: {
        include: {
          tag: true
        }
      }
    },
    take: limit
  })

  if (postsWithSharedTags.length >= limit) {
    return {
      posts: postsWithSharedTags.map(transformPost),
      type: 'tags' as const
    }
  }

  // Get posts from same category (excluding already fetched posts)
  const alreadyFetchedSlugs = postsWithSharedTags.map(p => p.slug)
  const categoryPosts = await prisma.post.findMany({
    where: {
      published: true,
      OR: [
        { scheduledFor: null },
        { scheduledFor: { lte: now } }
      ],
      slug: { 
        notIn: [currentSlug, ...alreadyFetchedSlugs]
      },
      category: {
        slug: categorySlug
      }
    },
    include: {
      category: true,
      tags: {
        include: {
          tag: true
        }
      }
    },
    take: limit - postsWithSharedTags.length
  })

  const combinedPosts = [...postsWithSharedTags, ...categoryPosts]

  if (combinedPosts.length > 0) {
    return {
      posts: combinedPosts.map(transformPost),
      type: postsWithSharedTags.length > 0 ? 'tags' as const : 'category' as const
    }
  }

  // Fallback to recent posts
  const recentPosts = await prisma.post.findMany({
    where: {
      published: true,
      OR: [
        { scheduledFor: null },
        { scheduledFor: { lte: now } }
      ],
      slug: { not: currentSlug }
    },
    include: {
      category: true,
      tags: {
        include: {
          tag: true
        }
      }
    },
    orderBy: {
      publishedAt: 'desc'
    },
    take: limit
  })

  return {
    posts: recentPosts.map(transformPost),
    type: 'recent' as const
  }
})

// Helper function to get reading time as formatted string
export function formatReadingTime(minutes: number): string {
  return `${minutes} min read`
}
