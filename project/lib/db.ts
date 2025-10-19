import { prisma } from './prisma'
import { slugify } from './utils'

// Category helpers
export async function getOrCreateCategory(name: string) {
  const slug = slugify(name)
  
  let category = await prisma.category.findUnique({
    where: { slug }
  })
  
  if (!category) {
    category = await prisma.category.create({
      data: { name, slug }
    })
  }
  
  return category
}

// Tag helpers
export async function getOrCreateTag(name: string) {
  const slug = slugify(name)
  
  let tag = await prisma.tag.findUnique({
    where: { slug }
  })
  
  if (!tag) {
    tag = await prisma.tag.create({
      data: { name, slug }
    })
  }
  
  return tag
}

// Post helpers
export async function getAllPublishedPosts() {
  const now = new Date()
  
  return prisma.post.findMany({
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
}

export async function getPostBySlug(slug: string) {
  return prisma.post.findUnique({
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
}

export async function getPostsByCategory(categorySlug: string) {
  const now = new Date()
  
  return prisma.post.findMany({
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
}

export async function getPostsByTag(tagSlug: string) {
  const now = new Date()
  
  return prisma.post.findMany({
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
}

export async function getAllCategories() {
  return prisma.category.findMany({
    include: {
      _count: {
        select: { posts: true }
      }
    }
  })
}

export async function getAllTags() {
  return prisma.tag.findMany({
    include: {
      _count: {
        select: { posts: true }
      }
    },
    orderBy: {
      posts: {
        _count: 'desc'
      }
    }
  })
}
