import { MetadataRoute } from "next"
import { getAllPosts, getAllCategories, getAllTags } from "@/lib/mdx"
import { siteConfig } from "@/data/site-config"

/**
 * Generates sitemap.xml for SEO
 * @returns Sitemap entries for all pages
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = siteConfig.url

  // Get all posts
  const posts = getAllPosts()
  const postEntries: MetadataRoute.Sitemap = posts.map((post) => ({
    url: `${baseUrl}/blog/${post.slug}`,
    lastModified: new Date(post.metadata.published_at || post.metadata.date || new Date().toISOString()),
    changeFrequency: "monthly",
    priority: 0.8,
  }))

  // Get all categories
  const categories = getAllCategories()
  const categoryEntries: MetadataRoute.Sitemap = categories.map((category) => ({
    url: `${baseUrl}/category/${category.toLowerCase()}`,
    lastModified: new Date(),
    changeFrequency: "weekly",
    priority: 0.6,
  }))

  // Get all tags
  const tags = getAllTags()
  const tagEntries: MetadataRoute.Sitemap = tags.map((tag) => ({
    url: `${baseUrl}/tag/${encodeURIComponent(tag.name)}`,
    lastModified: new Date(),
    changeFrequency: "weekly",
    priority: 0.5,
  }))

  // Static pages
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1,
    },
    {
      url: `${baseUrl}/blog`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: `${baseUrl}/categories`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.7,
    },
    {
      url: `${baseUrl}/tags`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.7,
    },
  ]

  return [...staticPages, ...postEntries, ...categoryEntries, ...tagEntries]
}
