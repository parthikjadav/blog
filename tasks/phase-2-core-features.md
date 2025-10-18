# Phase 2: Core Features

## Overview
Implement the core blog functionality including individual post pages, category filtering, database integration, and the complete blog reading experience.

---

## Task 1: Create Individual Blog Post Pages

### 1.1 Create Dynamic Route for Blog Posts

**File**: `app/blog/[slug]/page.tsx`

```typescript
import { Metadata } from "next"
import { notFound } from "next/navigation"
import { MDXRemote } from "next-mdx-remote/rsc"
import { Calendar, Clock, ArrowLeft } from "lucide-react"
import Link from "next/link"

import { getPostBySlug, getAllPosts } from "@/lib/mdx"
import { mdxComponents } from "@/components/blog/mdx-components"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { formatDate } from "@/lib/utils"
import { UI_TEXT } from "@/data/constants"

interface PostPageProps {
  params: {
    slug: string
  }
}

export async function generateStaticParams() {
  const posts = getAllPosts()
  return posts.map((post) => ({
    slug: post.slug,
  }))
}

export async function generateMetadata({ params }: PostPageProps): Promise<Metadata> {
  const post = getPostBySlug(params.slug)

  if (!post) {
    return {
      title: "Post Not Found",
    }
  }

  return {
    title: post.metadata.title,
    description: post.metadata.description,
    openGraph: {
      title: post.metadata.title,
      description: post.metadata.description,
      type: "article",
      publishedTime: post.metadata.date,
      authors: [siteConfig.author.name],
      images: post.metadata.featured_image ? [post.metadata.featured_image] : [],
    },
    twitter: {
      card: "summary_large_image",
      title: post.metadata.title,
      description: post.metadata.description,
      images: post.metadata.featured_image ? [post.metadata.featured_image] : [],
    },
  }
}

export default function PostPage({ params }: PostPageProps) {
  let post
  
  try {
    post = getPostBySlug(params.slug)
  } catch (error) {
    notFound()
  }

  return (
    <article className="container max-w-4xl py-12">
      {/* Back Button */}
      <Button asChild variant="ghost" className="mb-8">
        <Link href="/blog">
          <ArrowLeft className="mr-2 h-4 w-4" />
          {UI_TEXT.BACK_TO_BLOG}
        </Link>
      </Button>

      {/* Post Header */}
      <header className="mb-8">
        <div className="flex flex-wrap items-center gap-2 mb-4">
          <Badge variant="secondary">{post.metadata.category}</Badge>
          {post.metadata.tags.map((tag) => (
            <Badge key={tag} variant="outline">
              {tag}
            </Badge>
          ))}
        </div>

        <h1 className="text-4xl font-bold tracking-tight sm:text-5xl mb-4">
          {post.metadata.title}
        </h1>

        <p className="text-xl text-muted-foreground mb-6">
          {post.metadata.description}
        </p>

        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-1">
            <Calendar className="h-4 w-4" />
            <time dateTime={post.metadata.date}>
              {formatDate(post.metadata.date)}
            </time>
          </div>
          <div className="flex items-center gap-1">
            <Clock className="h-4 w-4" />
            <span>{post.readingTime}</span>
          </div>
        </div>
      </header>

      {/* Featured Image */}
      {post.metadata.featured_image && (
        <div className="mb-8 rounded-lg overflow-hidden">
          <Image
            src={post.metadata.featured_image}
            alt={post.metadata.title}
            width={1200}
            height={630}
            className="w-full h-auto"
            priority
          />
        </div>
      )}

      {/* Post Content */}
      <div className="prose prose-slate dark:prose-invert max-w-none">
        <MDXRemote source={post.content} components={mdxComponents} />
      </div>

      {/* Post Footer */}
      <footer className="mt-12 pt-8 border-t">
        <div className="flex items-center justify-between">
          <div className="flex flex-wrap gap-2">
            {post.metadata.tags.map((tag) => (
              <Link key={tag} href={`/blog?tag=${tag}`}>
                <Badge variant="outline" className="cursor-pointer hover:bg-accent">
                  #{tag}
                </Badge>
              </Link>
            ))}
          </div>
        </div>
      </footer>
    </article>
  )
}
```

### 1.2 Create Not Found Page

**File**: `app/blog/[slug]/not-found.tsx`

```typescript
import Link from "next/link"
import { AlertCircle } from "lucide-react"

import { Button } from "@/components/ui/button"
import { ERROR_MESSAGES } from "@/data/constants"

export default function NotFound() {
  return (
    <div className="container flex flex-col items-center justify-center min-h-[60vh] py-12">
      <AlertCircle className="h-16 w-16 text-muted-foreground mb-4" />
      <h1 className="text-3xl font-bold mb-2">Post Not Found</h1>
      <p className="text-muted-foreground mb-6 text-center max-w-md">
        {ERROR_MESSAGES.POST_NOT_FOUND}
      </p>
      <Button asChild>
        <Link href="/blog">Back to Blog</Link>
      </Button>
    </div>
  )
}
```

### Verification
- [ ] Individual post pages render correctly
- [ ] MDX content displays with proper formatting
- [ ] Metadata (title, description, OG tags) generated
- [ ] Featured images display
- [ ] Reading time shows
- [ ] Tags and category display
- [ ] Back button works
- [ ] 404 page shows for invalid slugs

---

## Task 2: Create Blog Listing Page

### 2.1 Create Blog Page with All Posts

**File**: `app/blog/page.tsx`

```typescript
import { Metadata } from "next"
import Link from "next/link"
import { ArrowRight } from "lucide-react"

import { getAllPosts, getAllCategories } from "@/lib/mdx"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { formatDate } from "@/lib/utils"
import { UI_TEXT } from "@/data/constants"
import { siteConfig } from "@/data/site-config"

export const metadata: Metadata = {
  title: "Blog",
  description: `All blog posts from ${siteConfig.name}`,
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

      {/* Empty State */}
      {posts.length === 0 && (
        <div className="text-center py-12">
          <p className="text-muted-foreground">No posts found.</p>
        </div>
      )}
    </div>
  )
}
```

### Verification
- [ ] All posts display in grid
- [ ] Post count shows correctly
- [ ] Categories filter displays
- [ ] Cards are clickable and navigate to posts
- [ ] Responsive grid layout works
- [ ] Empty state shows when no posts

---

## Task 3: Create Category Pages

### 3.1 Create Dynamic Category Route

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
        <Badge variant="secondary" className="mb-4">
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

### 3.2 Create Category Not Found Page

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
- [ ] Category pages render with filtered posts
- [ ] Category name displays correctly
- [ ] Post count accurate
- [ ] Back button navigates to /blog
- [ ] 404 shows for invalid categories
- [ ] Static paths generated for all categories

---

## Task 4: Enhance MDX Utilities

### 4.1 Add Related Posts Function

**File**: `lib/mdx.ts` (add to existing file)

```typescript
export function getRelatedPosts(currentSlug: string, category: string, limit: number = 3): PostWithMetadata[] {
  const allPosts = getAllPosts()
  
  return allPosts
    .filter((post) => 
      post.slug !== currentSlug && 
      post.metadata.category.toLowerCase() === category.toLowerCase()
    )
    .slice(0, limit)
}

export function getPostsByTag(tag: string): PostWithMetadata[] {
  const allPosts = getAllPosts()
  return allPosts.filter((post) =>
    post.metadata.tags.some((t) => t.toLowerCase() === tag.toLowerCase())
  )
}

export function getAllTags(): string[] {
  const posts = getAllPosts()
  const tags = posts.flatMap((post) => post.metadata.tags)
  return Array.from(new Set(tags))
}
```

### Verification
- [ ] Related posts function returns correct posts
- [ ] Posts filtered by tag work
- [ ] All tags extracted correctly
- [ ] No duplicates in tags array

---

## Task 5: Create Related Posts Component

### 5.1 Related Posts Component

**File**: `components/blog/related-posts.tsx`

```typescript
import Link from "next/link"
import { ArrowRight } from "lucide-react"

import { PostWithMetadata } from "@/types/blog"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { formatDate } from "@/lib/utils"
import { UI_TEXT } from "@/data/constants"

interface RelatedPostsProps {
  posts: PostWithMetadata[]
}

export function RelatedPosts({ posts }: RelatedPostsProps) {
  if (posts.length === 0) {
    return null
  }

  return (
    <section className="mt-16 pt-8 border-t">
      <h2 className="text-2xl font-bold tracking-tight mb-6">
        {UI_TEXT.RELATED_POSTS}
      </h2>
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
    </section>
  )
}
```

### 5.2 Update Post Page to Include Related Posts

Update `app/blog/[slug]/page.tsx` to add:

```typescript
import { getRelatedPosts } from "@/lib/mdx"
import { RelatedPosts } from "@/components/blog/related-posts"

// Inside the PostPage component, after getting the post:
const relatedPosts = getRelatedPosts(post.slug, post.metadata.category, 3)

// Add before closing </article>:
<RelatedPosts posts={relatedPosts} />
```

### Verification
- [ ] Related posts show on post pages
- [ ] Maximum 3 related posts display
- [ ] Posts from same category
- [ ] Current post excluded from related
- [ ] Component doesn't render if no related posts

---

## Task 6: Create Supabase Database Schema

### 6.1 Create Migration File

**File**: `supabase/migrations/001_create_posts_tables.sql`

```sql
-- Create posts table
CREATE TABLE IF NOT EXISTS posts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  slug TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  content TEXT NOT NULL,
  category TEXT NOT NULL,
  tags TEXT[] DEFAULT '{}',
  published_at TIMESTAMP WITH TIME ZONE NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  reading_time INTEGER NOT NULL,
  featured_image TEXT,
  published BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create categories table
CREATE TABLE IF NOT EXISTS categories (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  slug TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  post_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_posts_slug ON posts(slug);
CREATE INDEX IF NOT EXISTS idx_posts_category ON posts(category);
CREATE INDEX IF NOT EXISTS idx_posts_published ON posts(published);
CREATE INDEX IF NOT EXISTS idx_posts_published_at ON posts(published_at DESC);
CREATE INDEX IF NOT EXISTS idx_posts_tags ON posts USING GIN(tags);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for posts table
CREATE TRIGGER update_posts_updated_at
  BEFORE UPDATE ON posts
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security (RLS)
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;

-- Create policies for public read access
CREATE POLICY "Posts are viewable by everyone"
  ON posts FOR SELECT
  USING (published = true);

CREATE POLICY "Categories are viewable by everyone"
  ON categories FOR SELECT
  USING (true);
```

### 6.2 Create Sync Script

**File**: `scripts/sync-posts-to-supabase.ts`

```typescript
import fs from "fs"
import path from "path"
import matter from "gray-matter"
import readingTime from "reading-time"
import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

const supabase = createClient(supabaseUrl, supabaseKey)

async function syncPosts() {
  const postsDirectory = path.join(process.cwd(), "content/posts")
  const files = fs.readdirSync(postsDirectory)

  for (const file of files) {
    if (!file.endsWith(".mdx")) continue

    const slug = file.replace(/\.mdx$/, "")
    const fullPath = path.join(postsDirectory, file)
    const fileContents = fs.readFileSync(fullPath, "utf8")
    const { data, content } = matter(fileContents)
    const { minutes } = readingTime(content)

    const postData = {
      slug,
      title: data.title,
      description: data.description,
      content,
      category: data.category,
      tags: data.tags || [],
      published_at: new Date(data.date).toISOString(),
      reading_time: Math.ceil(minutes),
      featured_image: data.featured_image || null,
      published: data.published !== false,
    }

    const { error } = await supabase
      .from("posts")
      .upsert(postData, { onConflict: "slug" })

    if (error) {
      console.error(`Error syncing ${slug}:`, error)
    } else {
      console.log(`✓ Synced ${slug}`)
    }
  }

  console.log("Sync complete!")
}

syncPosts()
```

### 6.3 Add Sync Script to package.json

```json
{
  "scripts": {
    "sync-posts": "tsx scripts/sync-posts-to-supabase.ts"
  }
}
```

### Verification
- [ ] Migration creates tables successfully
- [ ] Indexes created for performance
- [ ] RLS policies work correctly
- [ ] Sync script uploads posts to Supabase
- [ ] Data matches MDX frontmatter

---

## Task 7: Create Database Query Functions

### 7.1 Supabase Query Utilities

**File**: `lib/supabase-queries.ts`

```typescript
import { supabase } from "@/lib/supabase"
import { Post } from "@/types/blog"

export async function getPostsFromDB(limit?: number): Promise<Post[]> {
  let query = supabase
    .from("posts")
    .select("*")
    .eq("published", true)
    .order("published_at", { ascending: false })

  if (limit) {
    query = query.limit(limit)
  }

  const { data, error } = await query

  if (error) {
    console.error("Error fetching posts:", error)
    return []
  }

  return data || []
}

export async function getPostBySlugFromDB(slug: string): Promise<Post | null> {
  const { data, error } = await supabase
    .from("posts")
    .select("*")
    .eq("slug", slug)
    .eq("published", true)
    .single()

  if (error) {
    console.error("Error fetching post:", error)
    return null
  }

  return data
}

export async function getPostsByCategoryFromDB(category: string): Promise<Post[]> {
  const { data, error } = await supabase
    .from("posts")
    .select("*")
    .eq("category", category)
    .eq("published", true)
    .order("published_at", { ascending: false })

  if (error) {
    console.error("Error fetching posts by category:", error)
    return []
  }

  return data || []
}

export async function getPostsByTagFromDB(tag: string): Promise<Post[]> {
  const { data, error } = await supabase
    .from("posts")
    .select("*")
    .contains("tags", [tag])
    .eq("published", true)
    .order("published_at", { ascending: false })

  if (error) {
    console.error("Error fetching posts by tag:", error)
    return []
  }

  return data || []
}

export async function searchPostsFromDB(query: string): Promise<Post[]> {
  const { data, error } = await supabase
    .from("posts")
    .select("*")
    .or(`title.ilike.%${query}%,description.ilike.%${query}%,content.ilike.%${query}%`)
    .eq("published", true)
    .order("published_at", { ascending: false })

  if (error) {
    console.error("Error searching posts:", error)
    return []
  }

  return data || []
}
```

### Verification
- [ ] All query functions work
- [ ] Only published posts returned
- [ ] Results sorted by date
- [ ] Error handling in place
- [ ] Type safety maintained

---

## Completion Checklist

### Pages Created
- [ ] `/blog/[slug]` - Individual post pages
- [ ] `/blog` - All posts listing
- [ ] `/category/[slug]` - Category filtered posts
- [ ] Not found pages for both routes

### Components Created
- [ ] RelatedPosts component
- [ ] Enhanced MDX components

### Functionality Implemented
- [ ] MDX content rendering
- [ ] Static path generation
- [ ] SEO metadata per page
- [ ] Category filtering
- [ ] Tag filtering
- [ ] Related posts
- [ ] Reading time display
- [ ] Responsive layouts

### Database Setup
- [ ] Supabase tables created
- [ ] Indexes for performance
- [ ] RLS policies configured
- [ ] Sync script working
- [ ] Query functions created

### Testing
- [ ] All routes accessible
- [ ] Navigation works between pages
- [ ] Back buttons functional
- [ ] 404 pages display correctly
- [ ] Mobile responsive
- [ ] Dark mode works on all pages

---

## Next Steps

After Phase 2 completion, proceed to **Phase 3: Enhancement** which includes:
- Search functionality
- RSS feed generation
- Advanced SEO optimization
- Performance monitoring
- Analytics integration
