import fs from "fs"
import path from "path"
import matter from "gray-matter"
import readingTime from "reading-time"
import { PostMetadata, PostWithMetadata } from "@/types/blog"

const postsDirectory = path.join(process.cwd(), "content/posts")

/**
 * Retrieves all post slugs from the posts directory
 * @returns Array of post slugs (filenames without .mdx extension)
 */
export function getPostSlugs(): string[] {
  if (!fs.existsSync(postsDirectory)) {
    return []
  }
  
  return fs
    .readdirSync(postsDirectory)
    .filter((file) => file.endsWith(".mdx"))
    .map((file) => file.replace(/\.mdx$/, ""))
}

/**
 * Fetches a single blog post by its slug
 * @param slug - The post slug (filename without extension)
 * @returns Post object with metadata and content
 * @throws {Error} When post file is not found
 */
export function getPostBySlug(slug: string): PostWithMetadata {
  const fullPath = path.join(postsDirectory, `${slug}.mdx`)
  const fileContents = fs.readFileSync(fullPath, "utf8")
  const { data, content } = matter(fileContents)
  const { text } = readingTime(content)

  return {
    slug,
    metadata: data as PostMetadata,
    content,
    readingTime: text,
  }
}

/**
 * Fetches all published blog posts sorted by date (newest first)
 * @returns Array of posts with metadata, filtered by published status
 */
export function getAllPosts(): PostWithMetadata[] {
  const slugs = getPostSlugs()
  const posts = slugs
    .map((slug) => getPostBySlug(slug))
    .filter((post) => post.metadata.published !== false)
    .sort((a, b) => {
      const dateA = a.metadata.published_at || a.metadata.date || ""
      const dateB = b.metadata.published_at || b.metadata.date || ""
      return (
        new Date(dateB).getTime() -
        new Date(dateA).getTime()
      )
    })

  return posts
}

/**
 * Filters posts by category (case-insensitive)
 * @param category - Category name to filter by
 * @returns Array of posts in the specified category
 */
export function getPostsByCategory(category: string): PostWithMetadata[] {
  const allPosts = getAllPosts()
  return allPosts.filter(
    (post) => post.metadata.category.toLowerCase() === category.toLowerCase()
  )
}

/**
 * Retrieves all unique categories from published posts
 * @returns Array of category names
 */
export function getAllCategories(): string[] {
  const posts = getAllPosts()
  const categories = posts.map((post) => post.metadata.category)
  return Array.from(new Set(categories))
}

/**
 * Retrieves all unique tags from published posts with their counts
 * @returns Array of tag objects with name and count, sorted by count descending
 */
export function getAllTags(): Array<{ name: string; count: number }> {
  const posts = getAllPosts()
  const tagCounts = new Map<string, number>()
  
  posts.forEach((post) => {
    post.metadata.tags.forEach((tag) => {
      tagCounts.set(tag, (tagCounts.get(tag) || 0) + 1)
    })
  })
  
  return Array.from(tagCounts.entries())
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count) // Sort by count descending
}

/**
 * Filters posts by tag (case-insensitive)
 * @param tag - Tag name to filter by
 * @returns Array of posts with the specified tag
 */
export function getPostsByTag(tag: string): PostWithMetadata[] {
  const allPosts = getAllPosts()
  return allPosts.filter((post) =>
    post.metadata.tags.some((t) => t.toLowerCase() === tag.toLowerCase())
  )
}

/**
 * Calculates post count for each tag, sorted by popularity
 * @returns Array of objects with tag name and post count
 */
export function getTagStats(): Array<{ name: string; count: number }> {
  const posts = getAllPosts()
  const tagCounts: Record<string, number> = {}

  posts.forEach((post) => {
    post.metadata.tags.forEach((tag) => {
      tagCounts[tag] = (tagCounts[tag] || 0) + 1
    })
  })

  return Object.entries(tagCounts)
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count)
}

/**
 * Fetches related posts based on tags, category, or recent posts as fallback
 * Priority: 1) Posts with shared tags, 2) Posts in same category, 3) Recent posts
 * @param currentSlug - Slug of the current post to exclude
 * @param category - Category to filter by
 * @param tags - Tags to match against
 * @param limit - Maximum number of related posts to return (default: 3)
 * @returns Object with related posts and type indicator
 */
export function getRelatedPosts(
  currentSlug: string, 
  category: string, 
  tags: string[] = [],
  limit: number = 3
): { posts: PostWithMetadata[], type: 'tags' | 'category' | 'recent' } {
  const allPosts = getAllPosts().filter(post => post.slug !== currentSlug)
  
  // 1. Try to find posts with shared tags
  if (tags.length > 0) {
    const postsWithSharedTags = allPosts
      .map(post => ({
        post,
        sharedTagsCount: post.metadata.tags.filter(tag => 
          tags.some(t => t.toLowerCase() === tag.toLowerCase())
        ).length
      }))
      .filter(({ sharedTagsCount }) => sharedTagsCount > 0)
      .sort((a, b) => b.sharedTagsCount - a.sharedTagsCount)
      .map(({ post }) => post)
      .slice(0, limit)
    
    if (postsWithSharedTags.length >= limit) {
      return { posts: postsWithSharedTags, type: 'tags' }
    }
    
    // If we have some but not enough, continue to get more from category
    if (postsWithSharedTags.length > 0) {
      const remaining = limit - postsWithSharedTags.length
      const categoryPosts = allPosts
        .filter(post => 
          post.metadata.category.toLowerCase() === category.toLowerCase() &&
          !postsWithSharedTags.some(p => p.slug === post.slug)
        )
        .slice(0, remaining)
      
      if (postsWithSharedTags.length + categoryPosts.length > 0) {
        return { 
          posts: [...postsWithSharedTags, ...categoryPosts], 
          type: 'tags' 
        }
      }
    }
  }
  
  // 2. Try to find posts in the same category
  const categoryPosts = allPosts
    .filter(post => post.metadata.category.toLowerCase() === category.toLowerCase())
    .slice(0, limit)
  
  if (categoryPosts.length > 0) {
    return { posts: categoryPosts, type: 'category' }
  }
  
  // 3. Fallback to recent posts
  const recentPosts = allPosts.slice(0, limit)
  return { posts: recentPosts, type: 'recent' }
}
