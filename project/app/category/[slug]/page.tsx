import { Metadata } from "next"
import { notFound } from "next/navigation"
import Link from "next/link"
import { ArrowRight, ArrowLeft } from "lucide-react"

import { getPostsByCategory, getAllCategories } from "@/lib/mdx"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { formatDate } from "@/lib/utils"
import { UI_TEXT } from "@/data/constants"

interface CategoryPageProps {
  params: Promise<{
    slug: string
  }>
}

export async function generateStaticParams() {
  const categories = getAllCategories()
  return categories.map((category) => ({
    slug: category.toLowerCase(),
  }))
}

export async function generateMetadata({ params }: CategoryPageProps): Promise<Metadata> {
  const { slug } = await params
  const category = slug.charAt(0).toUpperCase() + slug.slice(1)
  
  return {
    title: `${category} Posts`,
    description: `All blog posts in the ${category} category`,
    keywords: [category, "blog", "articles", "tutorials"],
  }
}

export default async function CategoryPage({ params }: CategoryPageProps) {
  const { slug } = await params
  const posts = getPostsByCategory(slug)
  const category = slug.charAt(0).toUpperCase() + slug.slice(1)

  if (posts.length === 0) {
    notFound()
  }

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
        <Badge variant="secondary" className="mb-4 text-base px-4 py-1">
          {category}
        </Badge>
        <h1 className="text-4xl font-bold tracking-tight mb-4">
          {category} Posts
        </h1>
        <p className="text-xl text-muted-foreground">
          {posts.length} {posts.length === 1 ? "post" : "posts"} in this category
        </p>
      </div>

      {/* Posts Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {posts.map((post) => (
          <Link key={post.slug} href={`/blog/${post.slug}`}>
            <Card className="h-full transition-all hover:shadow-lg hover:scale-[1.02]">
              <CardHeader>
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-sm text-muted-foreground">
                    {post.readingTime}
                  </span>
                </div>
                <CardTitle className="line-clamp-2">
                  {post.metadata.title}
                </CardTitle>
                <CardDescription className="line-clamp-2">
                  {post.metadata.description}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between text-sm text-muted-foreground">
                  <span>{formatDate(post.metadata.date)}</span>
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
