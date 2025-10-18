# Phase 3: Categories & Tags System

## Overview
Implement a complete category and tag filtering system with dedicated pages, dynamic routing, and enhanced navigation for better content organization and discovery.

---

## Task 1: Create Category Pages

### 1.1 Create Dynamic Category Route

**File**: `app/category/[slug]/page.tsx`

```typescript
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
  params: {
    slug: string
  }
}

export async function generateStaticParams() {
  const categories = getAllCategories()
  return categories.map((category) => ({
    slug: category.toLowerCase(),
  }))
}

export async function generateMetadata({ params }: CategoryPageProps): Promise<Metadata> {
  const category = params.slug.charAt(0).toUpperCase() + params.slug.slice(1)
  
  return {
    title: `${category} Posts`,
    description: `All blog posts in the ${category} category`,
  }
}

export default function CategoryPage({ params }: CategoryPageProps) {
  const posts = getPostsByCategory(params.slug)
  const category = params.slug.charAt(0).toUpperCase() + params.slug.slice(1)

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
```

### 1.2 Create Category Not Found Page

**File**: `app/category/[slug]/not-found.tsx`

```typescript
import Link from "next/link"
import { AlertCircle } from "lucide-react"

import { Button } from "@/components/ui/button"

export default function NotFound() {
  return (
    <div className="container flex flex-col items-center justify-center min-h-[60vh] py-12">
      <AlertCircle className="h-16 w-16 text-muted-foreground mb-4" />
      <h1 className="text-3xl font-bold mb-2">Category Not Found</h1>
      <p className="text-muted-foreground mb-6 text-center max-w-md">
        The category you're looking for doesn't exist or has no posts.
      </p>
      <Button asChild>
        <Link href="/blog">View All Posts</Link>
      </Button>
    </div>
  )
}
```

### Verification
- [ ] Category pages render correctly
- [ ] Category name displays capitalized
- [ ] Post count accurate
- [ ] Back button works
- [ ] 404 shows for invalid categories
- [ ] Static paths generated for all categories

---

## Task 2: Create Categories Overview Page

### 2.1 Create Categories Index Page

**File**: `app/categories/page.tsx`

```typescript
import { Metadata } from "next"
import Link from "next/link"
import { Folder, FileText } from "lucide-react"

import { getAllPosts, getAllCategories } from "@/lib/mdx"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

export const metadata: Metadata = {
  title: "Categories",
  description: "Browse all blog post categories",
}

export default function CategoriesPage() {
  const posts = getAllPosts()
  const categories = getAllCategories()

  // Count posts per category
  const categoryStats = categories.map((category) => {
    const categoryPosts = posts.filter(
      (post) => post.metadata.category.toLowerCase() === category.toLowerCase()
    )
    return {
      name: category,
      slug: category.toLowerCase(),
      count: categoryPosts.length,
      description: `Explore ${categoryPosts.length} ${
        categoryPosts.length === 1 ? "post" : "posts"
      } about ${category}`,
    }
  })

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
```

### Verification
- [ ] All categories display with post counts
- [ ] Cards are clickable
- [ ] Icons and badges show correctly
- [ ] Responsive grid layout
- [ ] Empty state works

---

## Task 3: Create Tag System

### 3.1 Add Tag Functions to MDX Library

**File**: `lib/mdx.ts` (add these functions)

```typescript
export function getAllTags(): string[] {
  const posts = getAllPosts()
  const tags = posts.flatMap((post) => post.metadata.tags)
  return Array.from(new Set(tags)).sort()
}

export function getPostsByTag(tag: string): PostWithMetadata[] {
  const allPosts = getAllPosts()
  return allPosts.filter((post) =>
    post.metadata.tags.some((t) => t.toLowerCase() === tag.toLowerCase())
  )
}

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
```

### 3.2 Create Tag Page Route

**File**: `app/tag/[slug]/page.tsx`

```typescript
import { Metadata } from "next"
import { notFound } from "next/navigation"
import Link from "next/link"
import { ArrowRight, ArrowLeft, Tag } from "lucide-react"

import { getPostsByTag, getAllTags } from "@/lib/mdx"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { formatDate } from "@/lib/utils"
import { UI_TEXT } from "@/data/constants"

interface TagPageProps {
  params: {
    slug: string
  }
}

export async function generateStaticParams() {
  const tags = getAllTags()
  return tags.map((tag) => ({
    slug: tag.toLowerCase(),
  }))
}

export async function generateMetadata({ params }: TagPageProps): Promise<Metadata> {
  const tag = decodeURIComponent(params.slug)
  
  return {
    title: `Posts tagged "${tag}"`,
    description: `All blog posts tagged with ${tag}`,
  }
}

export default function TagPage({ params }: TagPageProps) {
  const tag = decodeURIComponent(params.slug)
  const posts = getPostsByTag(tag)

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
        <div className="flex items-center gap-2 mb-4">
          <Tag className="h-6 w-6 text-primary" />
          <Badge variant="outline" className="text-base px-4 py-1">
            {tag}
          </Badge>
        </div>
        <h1 className="text-4xl font-bold tracking-tight mb-4">
          Posts tagged "{tag}"
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
                  <Badge variant="secondary">{post.metadata.category}</Badge>
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
```

### 3.3 Create Tag Not Found Page

**File**: `app/tag/[slug]/not-found.tsx`

```typescript
import Link from "next/link"
import { AlertCircle } from "lucide-react"

import { Button } from "@/components/ui/button"

export default function NotFound() {
  return (
    <div className="container flex flex-col items-center justify-center min-h-[60vh] py-12">
      <AlertCircle className="h-16 w-16 text-muted-foreground mb-4" />
      <h1 className="text-3xl font-bold mb-2">Tag Not Found</h1>
      <p className="text-muted-foreground mb-6 text-center max-w-md">
        The tag you're looking for doesn't exist or has no posts.
      </p>
      <Button asChild>
        <Link href="/blog">View All Posts</Link>
      </Button>
    </div>
  )
}
```

### Verification
- [ ] Tag pages render correctly
- [ ] Tag name displays properly
- [ ] Post count accurate
- [ ] Back button works
- [ ] 404 shows for invalid tags
- [ ] Static paths generated for all tags

---

## Task 4: Create Tags Overview Page

### 4.1 Create Tags Index Page

**File**: `app/tags/page.tsx`

```typescript
import { Metadata } from "next"
import Link from "next/link"
import { Tag } from "lucide-react"

import { getTagStats } from "@/lib/mdx"
import { Badge } from "@/components/ui/badge"

export const metadata: Metadata = {
  title: "Tags",
  description: "Browse all blog post tags",
}

export default function TagsPage() {
  const tagStats = getTagStats()

  return (
    <div className="container py-12">
      {/* Header */}
      <div className="mb-12">
        <h1 className="text-4xl font-bold tracking-tight mb-4">Tags</h1>
        <p className="text-xl text-muted-foreground">
          Browse posts by tag
        </p>
      </div>

      {/* Tags Cloud */}
      <div className="flex flex-wrap gap-3">
        {tagStats.map((tag) => (
          <Link key={tag.name} href={`/tag/${tag.name.toLowerCase()}`}>
            <Badge
              variant="outline"
              className="text-base px-4 py-2 cursor-pointer hover:bg-accent transition-all hover:scale-105"
            >
              <Tag className="h-3 w-3 mr-2" />
              {tag.name}
              <span className="ml-2 text-xs text-muted-foreground">
                ({tag.count})
              </span>
            </Badge>
          </Link>
        ))}
      </div>

      {/* Empty State */}
      {tagStats.length === 0 && (
        <div className="text-center py-12">
          <p className="text-muted-foreground">No tags found.</p>
        </div>
      )}
    </div>
  )
}
```

### Verification
- [ ] All tags display with counts
- [ ] Tags sorted by popularity (count)
- [ ] Badges are clickable
- [ ] Hover effects work
- [ ] Empty state works

---

## Task 5: Update Navigation

### 5.1 Update Site Config

**File**: `data/site-config.ts`

```typescript
export const siteConfig = {
  name: "My Blog",
  description: "A modern, high-performance blog built with Next.js and Supabase",
  url: process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000",
  author: {
    name: "Your Name",
    email: "your.email@example.com",
    twitter: "@yourhandle",
  },
  links: {
    twitter: "https://twitter.com/yourhandle",
    github: "https://github.com/yourusername",
  },
  navigation: [
    { name: "Home", href: "/" },
    { name: "Blog", href: "/blog" },
    { name: "Categories", href: "/categories" },
    { name: "Tags", href: "/tags" },
  ],
} as const
```

### Verification
- [ ] Navigation updated in header
- [ ] All links work correctly
- [ ] Active state shows current page

---

## Task 6: Make Tags Clickable in Posts

### 6.1 Update Post Page Footer

**File**: `app/blog/[slug]/page.tsx` (update footer section)

```typescript
{/* Post Footer */}
<footer className="mt-12 pt-8 border-t">
  <div className="space-y-4">
    <div>
      <h3 className="text-sm font-semibold mb-3 text-muted-foreground uppercase tracking-wide">
        Tags
      </h3>
      <div className="flex flex-wrap gap-2">
        {post.metadata.tags.map((tag) => (
          <Link key={tag} href={`/tag/${tag.toLowerCase()}`}>
            <Badge variant="outline" className="cursor-pointer hover:bg-accent">
              #{tag}
            </Badge>
          </Link>
        ))}
      </div>
    </div>
    
    <div>
      <h3 className="text-sm font-semibold mb-3 text-muted-foreground uppercase tracking-wide">
        Category
      </h3>
      <Link href={`/category/${post.metadata.category.toLowerCase()}`}>
        <Badge variant="secondary" className="cursor-pointer hover:opacity-80">
          {post.metadata.category}
        </Badge>
      </Link>
    </div>
  </div>
</footer>
```

### Verification
- [ ] Tags are clickable
- [ ] Category is clickable
- [ ] Links navigate correctly
- [ ] Hover effects work

---

## Task 7: Add Category/Tag Filters to Blog Page

### 7.1 Create Filter Component

**File**: `components/blog/category-filter.tsx`

```typescript
"use client"

import { useRouter, useSearchParams } from "next/navigation"
import { Badge } from "@/components/ui/badge"

interface CategoryFilterProps {
  categories: string[]
}

export function CategoryFilter({ categories }: CategoryFilterProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const selectedCategory = searchParams.get("category")

  const handleCategoryClick = (category: string | null) => {
    if (category) {
      router.push(`/blog?category=${category.toLowerCase()}`)
    } else {
      router.push("/blog")
    }
  }

  return (
    <div className="mb-8">
      <h2 className="text-sm font-semibold mb-3 text-muted-foreground uppercase tracking-wide">
        Filter by Category
      </h2>
      <div className="flex flex-wrap gap-2">
        <Badge
          variant={!selectedCategory ? "default" : "outline"}
          className="cursor-pointer"
          onClick={() => handleCategoryClick(null)}
        >
          All
        </Badge>
        {categories.map((category) => (
          <Badge
            key={category}
            variant={
              selectedCategory?.toLowerCase() === category.toLowerCase()
                ? "default"
                : "outline"
            }
            className="cursor-pointer"
            onClick={() => handleCategoryClick(category)}
          >
            {category}
          </Badge>
        ))}
      </div>
    </div>
  )
}
```

### 7.2 Update Blog Page with Filtering

**File**: `app/blog/page.tsx` (update to support filtering)

```typescript
import { CategoryFilter } from "@/components/blog/category-filter"

export default function BlogPage({
  searchParams,
}: {
  searchParams: { category?: string }
}) {
  const allPosts = getAllPosts()
  const categories = getAllCategories()

  // Filter posts by category if specified
  const posts = searchParams.category
    ? allPosts.filter(
        (post) =>
          post.metadata.category.toLowerCase() ===
          searchParams.category?.toLowerCase()
      )
    : allPosts

  return (
    <div className="container py-12">
      {/* Header */}
      <div className="mb-12">
        <h1 className="text-4xl font-bold tracking-tight mb-4">Blog</h1>
        <p className="text-xl text-muted-foreground">
          {posts.length} {posts.length === 1 ? "post" : "posts"}
          {searchParams.category && ` in ${searchParams.category}`}
        </p>
      </div>

      {/* Category Filter */}
      <CategoryFilter categories={categories} />

      {/* Posts Grid */}
      {/* ... rest of the code ... */}
    </div>
  )
}
```

### Verification
- [ ] Filter works with URL params
- [ ] Active filter highlighted
- [ ] Post count updates
- [ ] "All" button clears filter

---

## Completion Checklist

### Pages Created
- [ ] `/category/[slug]` - Category filtered posts
- [ ] `/categories` - All categories overview
- [ ] `/tag/[slug]` - Tag filtered posts
- [ ] `/tags` - All tags overview
- [ ] Not found pages for both routes

### Components Created
- [ ] CategoryFilter component
- [ ] Updated post footer with clickable tags/category

### Functionality Implemented
- [ ] Category pages with post filtering
- [ ] Tag pages with post filtering
- [ ] Categories overview with stats
- [ ] Tags cloud with counts
- [ ] Clickable tags in posts
- [ ] Clickable category in posts
- [ ] URL-based filtering on blog page
- [ ] Navigation updated

### MDX Library Enhanced
- [ ] `getAllTags()` function
- [ ] `getPostsByTag()` function
- [ ] `getTagStats()` function

### Testing
- [ ] All category routes work
- [ ] All tag routes work
- [ ] Filtering works correctly
- [ ] Navigation links work
- [ ] 404 pages display
- [ ] Static paths generated
- [ ] Responsive on mobile

---

## Next Steps

After Phase 3 completion, proceed to **Phase 4: Search & Enhancement** which includes:
- Search functionality
- RSS feed generation
- Reading progress bar
- Share buttons
- Related posts
- Performance optimization
