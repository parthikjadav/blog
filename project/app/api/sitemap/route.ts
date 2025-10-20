import { NextResponse } from "next/server"
import { getAllPosts, getAllCategories, getAllTags } from "@/lib/blog"
import { getAllTopics, getTopicWithLessons } from "@/lib/learn"
import { siteConfig } from "@/data/site-config"

/**
 * Generates sitemap.xml dynamically via API route
 * Access at: /api/sitemap
 */
export async function GET() {
  const baseUrl = siteConfig.url

  try {
    // Get all posts
    const posts = await getAllPosts()
    const postUrls = posts.map((post) => ({
      loc: `${baseUrl}/blog/${post.slug}`,
      lastmod: post.publishedAt || new Date().toISOString(),
      changefreq: "monthly",
      priority: "0.8",
    }))

    // Get all categories
    const categories = await getAllCategories()
    const categoryUrls = categories.map((category) => ({
      loc: `${baseUrl}/category/${category.slug}`,
      lastmod: new Date().toISOString(),
      changefreq: "weekly",
      priority: "0.6",
    }))

    // Get all tags
    const tags = await getAllTags()
    const tagUrls = tags.map((tag) => ({
      loc: `${baseUrl}/tag/${tag.slug}`,
      lastmod: new Date().toISOString(),
      changefreq: "weekly",
      priority: "0.5",
    }))

    // Get all learning topics and lessons
    const topics = await getAllTopics()
    const topicUrls = topics.map((topic) => ({
      loc: `${baseUrl}/learn/${topic.slug}`,
      lastmod: new Date().toISOString(),
      changefreq: "weekly",
      priority: "0.7",
    }))

    // Get all lessons from all topics
    const lessonUrls: Array<{
      loc: string
      lastmod: string
      changefreq: string
      priority: string
    }> = []

    for (const topic of topics) {
      const topicWithLessons = await getTopicWithLessons(topic.slug)
      if (topicWithLessons) {
        // Add standalone lessons
        topicWithLessons.lessons.forEach((lesson) => {
          lessonUrls.push({
            loc: `${baseUrl}/learn/${topic.slug}/${lesson.slug}`,
            lastmod: new Date().toISOString(),
            changefreq: "monthly",
            priority: "0.6",
          })
        })

        // Add lessons from sections
        topicWithLessons.sections.forEach((section) => {
          section.lessons.forEach((lesson) => {
            lessonUrls.push({
              loc: `${baseUrl}/learn/${topic.slug}/${lesson.slug}`,
              lastmod: new Date().toISOString(),
              changefreq: "monthly",
              priority: "0.6",
            })
          })
        })
      }
    }

    // Static pages
    const staticUrls = [
      {
        loc: baseUrl,
        lastmod: new Date().toISOString(),
        changefreq: "daily",
        priority: "1.0",
      },
      {
        loc: `${baseUrl}/blog`,
        lastmod: new Date().toISOString(),
        changefreq: "daily",
        priority: "0.9",
      },
      {
        loc: `${baseUrl}/learn`,
        lastmod: new Date().toISOString(),
        changefreq: "weekly",
        priority: "0.9",
      },
      {
        loc: `${baseUrl}/categories`,
        lastmod: new Date().toISOString(),
        changefreq: "weekly",
        priority: "0.7",
      },
      {
        loc: `${baseUrl}/tags`,
        lastmod: new Date().toISOString(),
        changefreq: "weekly",
        priority: "0.7",
      },
    ]

    // Combine all URLs
    const allUrls = [
      ...staticUrls,
      ...postUrls,
      ...categoryUrls,
      ...tagUrls,
      ...topicUrls,
      ...lessonUrls,
    ]

    // Generate XML sitemap
    const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${allUrls
  .map(
    (url) => `  <url>
    <loc>${url.loc}</loc>
    <lastmod>${url.lastmod}</lastmod>
    <changefreq>${url.changefreq}</changefreq>
    <priority>${url.priority}</priority>
  </url>`
  )
  .join("\n")}
</urlset>`

    return new NextResponse(sitemap, {
      status: 200,
      headers: {
        "Content-Type": "application/xml",
        "Cache-Control": "public, s-maxage=3600, stale-while-revalidate",
      },
    })
  } catch (error) {
    console.error("Error generating sitemap:", error)
    return new NextResponse("Error generating sitemap", { status: 500 })
  }
}
