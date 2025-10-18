import { Metadata } from "next"
import Link from "next/link"

import { getAllPosts, getAllCategories } from "@/lib/mdx"
import { PostCard } from "@/components/blog/post-card"
import { Badge } from "@/components/ui/badge"
import { siteConfig } from "@/data/site-config"

export const metadata: Metadata = {
  title: "Blog",
  description: `All blog posts from ${siteConfig.name}`,
  keywords: ["blog", "articles", "tutorials", "technology", siteConfig.name],
}

export default function BlogPage() {
  const posts = getAllPosts()
  const categories = getAllCategories()

  return (
    <div className="container py-12">
      {/* Header */}
      <div className="mb-12">
        <h1 className="text-4xl font-bold tracking-tight mb-4">Blog</h1>
        <p className="text-xl text-muted-foreground">
          {posts.length} {posts.length === 1 ? "post" : "posts"} published
        </p>
      </div>

      {/* Categories Filter */}
      <div className="mb-8">
        <h2 className="text-sm font-semibold mb-3 text-muted-foreground uppercase tracking-wide">
          Categories
        </h2>
        <div className="flex flex-wrap gap-2">
          <Link href="/blog">
            <Badge variant="outline" className="cursor-pointer hover:bg-accent">
              All
            </Badge>
          </Link>
          {categories.map((category) => (
            <Link key={category} href={`/category/${category.toLowerCase()}`}>
              <Badge variant="outline" className="cursor-pointer hover:bg-accent">
                {category}
              </Badge>
            </Link>
          ))}
        </div>
      </div>

      {/* Posts Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {posts.map((post) => (
          <PostCard key={post.slug} post={post} />
        ))}
      </div>

      {/* Empty State */}
      {posts.length === 0 && (
        <div className="text-center py-12">
          <p className="text-muted-foreground">No posts found.</p>
        </div>
      )}
    </div>
  )
}
