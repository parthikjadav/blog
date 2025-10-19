// Database post type (from Prisma)
export interface BlogPost {
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

// Legacy types (kept for backward compatibility during migration)
export interface Post {
  id: string
  slug: string
  title: string
  description: string
  content: string
  category: string
  tags: string[]
  published_at: string
  updated_at: string
  reading_time: number
  featured_image: string | null
  published: boolean
}

export interface Category {
  id: string
  slug: string
  name: string
  description: string
  post_count: number
}

export interface PostMetadata {
  title: string
  description: string
  date?: string
  published_at?: string
  updated_at?: string
  category: string
  tags: string[]
  featured_image?: string
  featured_image_alt?: string
  author?: string
  reading_time?: number
  published?: boolean
  keywords?: string[]
}

export interface PostWithMetadata {
  slug: string
  metadata: PostMetadata
  content: string
  readingTime: string
}
