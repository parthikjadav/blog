import { Metadata } from "next"
import Link from "next/link"
import { Folder, FileText } from "lucide-react"

import { getAllCategories } from "@/lib/blog"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

export const metadata: Metadata = {
  title: "Categories",
  description: "Browse all blog post categories",
}

export default async function CategoriesPage() {
  const categories = await getAllCategories()

  // Map categories with post counts
  const categoryStats = categories.map((category) => ({
    name: category.name,
    slug: category.slug,
    count: category._count.posts,
    description: `Explore ${category._count.posts} ${
      category._count.posts === 1 ? "post" : "posts"
    } about ${category.name}`,
  }))

  return (
    <div className="container py-12">
      {/* Header */}
      <div className="mb-12">
        <h1 className="text-4xl font-bold tracking-tight mb-4">Categories</h1>
        <p className="text-xl text-muted-foreground">
          Browse posts by category
        </p>
      </div>

      {/* Categories Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {categoryStats.map((category) => (
          <Link key={category.slug} href={`/category/${category.slug}`}>
            <Card className="h-full transition-all hover:shadow-lg hover:scale-[1.02]">
              <CardHeader>
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 rounded-lg bg-primary/10">
                    <Folder className="h-6 w-6 text-primary" />
                  </div>
                  <Badge variant="secondary">{category.count}</Badge>
                </div>
                <CardTitle className="text-2xl">{category.name}</CardTitle>
                <CardDescription>{category.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <FileText className="h-4 w-4" />
                  <span>
                    {category.count} {category.count === 1 ? "post" : "posts"}
                  </span>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      {/* Empty State */}
      {categories.length === 0 && (
        <div className="text-center py-12">
          <p className="text-muted-foreground">No categories found.</p>
        </div>
      )}
    </div>
  )
}
