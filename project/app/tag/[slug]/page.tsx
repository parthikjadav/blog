import { Metadata } from "next"
import { notFound } from "next/navigation"
import Link from "next/link"
import { ArrowRight, ArrowLeft, Tag } from "lucide-react"

import { getPostsByTag, getAllTags } from "@/lib/blog"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { formatDate } from "@/lib/utils"
import { UI_TEXT } from "@/data/constants"

interface TagPageProps {
  params: Promise<{
    slug: string
  }>
}

export async function generateStaticParams() {
  const tags = await getAllTags()
  return tags.map((tag) => ({
    slug: tag.slug,
  }))
}

export async function generateMetadata({ params }: TagPageProps): Promise<Metadata> {
  const { slug } = await params
  const tag = decodeURIComponent(slug)
  
  return {
    title: `Posts tagged "${tag}"`,
    description: `All blog posts tagged with ${tag}`,
    keywords: [tag, "blog", "articles", "tutorials"],
  }
}

export default async function TagPage({ params }: TagPageProps) {
  const { slug } = await params
  const posts = await getPostsByTag(slug)

  if (posts.length === 0) {
    notFound()
  }
  
  const tagName = posts[0]?.tags.find(t => t.slug === slug)?.name || slug

  return (
    <div className="container py-12">
      {/* Back Button */}
      <Button asChild variant="ghost" className="mb-8">
        <Link href="/blog">
          <ArrowLeft className="mr-2 h-4 w-4" />
          {UI_TEXT.ALL_POSTS}
        </Link>
      </Button>

      {/* Header */}
      <div className="mb-12">
        <div className="flex items-center gap-2 mb-4">
          <Tag className="h-6 w-6 text-primary" />
          <Badge variant="outline" className="text-base px-4 py-1">
            {tagName}
          </Badge>
        </div>
        <h1 className="text-4xl font-bold tracking-tight mb-4">
          Posts tagged &ldquo;{tagName}&rdquo;
        </h1>
        <p className="text-xl text-muted-foreground">
          {posts.length} {posts.length === 1 ? "post" : "posts"} with this tag
        </p>
      </div>

      {/* Posts Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {posts.map((post) => (
          <Link key={post.slug} href={`/blog/${post.slug}`}>
            <Card className="h-full transition-all hover:shadow-lg hover:scale-[1.02]">
              <CardHeader>
                <div className="flex items-center gap-2 mb-2">
                  <Badge variant="secondary">{post.category.name}</Badge>
                  <span className="text-sm text-muted-foreground">
                    {post.readingTime} min read
                  </span>
                </div>
                <CardTitle className="line-clamp-2">
                  {post.title}
                </CardTitle>
                <CardDescription className="line-clamp-2">
                  {post.description}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between text-sm text-muted-foreground">
                  <span>{formatDate(post.publishedAt?.toISOString() || "")}</span>
                  <span className="flex items-center gap-1">
                    {UI_TEXT.READ_MORE}
                    <ArrowRight className="h-3 w-3" />
                  </span>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  )
}
