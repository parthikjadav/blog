import { Metadata } from "next"
import { notFound } from "next/navigation"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"

import { getPostsByCategory, getAllCategories } from "@/lib/blog"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { UI_TEXT } from "@/data/constants"
import { PostCard } from "@/components/blog/post-card"

interface CategoryPageProps {
  params: Promise<{
    slug: string
  }>
}

export async function generateStaticParams() {
  const categories = await getAllCategories()
  return categories.map((category) => ({
    slug: category.slug,
  }))
}

export async function generateMetadata({ params }: CategoryPageProps): Promise<Metadata> {
  const { slug } = await params
  const posts = await getPostsByCategory(slug)
  const category = posts.length > 0 ? posts[0].category.name : slug.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')
  
  return {
    title: `${category} Posts`,
    description: `All blog posts in the ${category} category`,
    keywords: [category, "blog", "articles", "tutorials"],
  }
}

export default async function CategoryPage({ params }: CategoryPageProps) {
  const { slug } = await params
  const posts = await getPostsByCategory(slug)
  const category = posts.length > 0 ? posts[0].category.name : slug.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')

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
          <PostCard key={post.slug} post={post} />
        ))}
      </div>
    </div>
  )
}
