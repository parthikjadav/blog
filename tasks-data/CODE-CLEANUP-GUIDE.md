# Code Cleanup Guide - Prisma Migration

## Overview
This document outlines what code to remove, what to keep, and what to update after migrating from MDX files to Prisma database.

---

## ❌ Code to REMOVE

### 1. `lib/mdx.ts` - Remove These Functions
**Functions to DELETE (no longer needed):**
- `getPostSlugs()` - Database handles this
- `getPostBySlug()` - Replaced by database version
- `getAllPosts()` - Replaced by database version
- `getPostsByCategory()` - Replaced by database version
- `getAllCategories()` - Replaced by database version
- `getAllTags()` - Replaced by database version
- `getPostsByTag()` - Replaced by database version
- `getTagStats()` - Replaced by database version
- `getRelatedPosts()` - Replaced by database version

**What to KEEP in `lib/mdx.ts`:**
- Keep file but rename to `lib/mdx-utils.ts` (optional)
- Only if you need MDX-specific utilities in the future
- Or delete the entire file since we're using `next-mdx-remote` directly

**Action:** Delete `lib/mdx.ts` entirely ✅

---

## ✅ Code to UPDATE

### 1. `app/page.tsx` - Home Page
**Current imports:**
```typescript
import { getAllPosts, getAllTags } from "@/lib/mdx"
```

**Update to:**
```typescript
import { getAllPosts } from "@/lib/blog"
```

**Changes needed:**
- Replace `getAllPosts()` call with database version
- Remove `getAllTags()` import (already removed from home page)
- Posts structure remains similar, just from database

---

### 2. `app/blog/page.tsx` - Blog Listing
**Current imports:**
```typescript
import { getAllPosts, getAllCategories } from "@/lib/mdx"
```

**Update to:**
```typescript
import { getAllPosts, getAllCategories } from "@/lib/blog"
```

**Changes needed:**
- Replace both function calls with database versions
- Post structure changes slightly (see type changes below)

---

### 3. `app/blog/[slug]/page.tsx` - Blog Post Page
**Current imports:**
```typescript
import { getPostBySlug, getAllPosts, getRelatedPosts } from "@/lib/mdx"
```

**Update to:**
```typescript
import { getPostBySlug, getAllPosts, getRelatedPosts } from "@/lib/blog"
```

**Changes needed:**
- Replace all function calls with database versions
- Update metadata access (see below)
- MDX rendering stays the same with `next-mdx-remote`

**Metadata access changes:**
```typescript
// OLD (from MDX files)
post.metadata.title
post.metadata.description
post.metadata.category
post.metadata.tags
post.metadata.published_at
post.metadata.featured_image

// NEW (from database)
post.title
post.description
post.category.name
post.tags.map(t => t.name)
post.publishedAt
post.featuredImage
```

---

### 4. `app/category/[slug]/page.tsx` - Category Page
**Current imports:**
```typescript
import { getPostsByCategory, getAllCategories } from "@/lib/mdx"
```

**Update to:**
```typescript
import { getPostsByCategory, getAllCategories } from "@/lib/blog"
```

**Changes needed:**
- Replace function calls with database versions
- Update post structure access

---

### 5. `app/categories/page.tsx` - Categories Listing
**Current imports:**
```typescript
import { getAllPosts, getAllCategories } from "@/lib/mdx"
```

**Update to:**
```typescript
import { getAllCategories } from "@/lib/blog"
```

**Changes needed:**
- Remove `getAllPosts` import (not needed)
- Use database `getAllCategories()` which includes post counts

---

### 6. `app/tag/[slug]/page.tsx` - Tag Page (if exists)
**Current imports:**
```typescript
import { getPostsByTag } from "@/lib/mdx"
```

**Update to:**
```typescript
import { getPostsByTag } from "@/lib/blog"
```

---

### 7. `components/blog/post-card.tsx` - Post Card Component
**Current structure:**
```typescript
interface PostCardProps {
  post: PostWithMetadata; // From MDX
}

// Accessing data
post.metadata.title
post.metadata.description
post.metadata.category
post.readingTime // string like "5 min read"
```

**Update to:**
```typescript
interface PostCardProps {
  post: BlogPost; // From database
}

// Accessing data
post.title
post.description
post.category.name
`${post.readingTime} min read` // number, need to format
```

---

### 8. `components/blog/post-header.tsx` - Post Header
**Update metadata access:**
```typescript
// OLD
post.metadata.title
post.metadata.date
post.metadata.author
post.readingTime

// NEW
post.title
post.publishedAt
post.author
`${post.readingTime} min read`
```

---

### 9. `types/blog.ts` - Type Definitions
**Add new database types:**
```typescript
// Add this new type
export interface BlogPost {
  id: string
  slug: string
  title: string
  description: string
  content: string
  published: boolean
  publishedAt: Date | null
  scheduledFor: Date | null
  readingTime: number
  author: string
  featuredImage: string | null
  featuredImageAlt: string | null
  keywords: string[]
  category: {
    id: string
    name: string
    slug: string
  }
  tags: {
    id: string
    name: string
    slug: string
  }[]
}

// Keep PostMetadata for backward compatibility (optional)
// Or remove if not needed
```

---

## 📝 Key Differences: MDX vs Database

### Post Structure Comparison

| Field | MDX Files | Database |
|-------|-----------|----------|
| Title | `post.metadata.title` | `post.title` |
| Description | `post.metadata.description` | `post.description` |
| Content | `post.content` | `post.content` |
| Category | `post.metadata.category` (string) | `post.category.name` (object) |
| Tags | `post.metadata.tags` (string[]) | `post.tags.map(t => t.name)` (object[]) |
| Published Date | `post.metadata.published_at` | `post.publishedAt` |
| Reading Time | `post.readingTime` (string) | `post.readingTime` (number) |
| Featured Image | `post.metadata.featured_image` | `post.featuredImage` |
| Author | `post.metadata.author` | `post.author` |
| Keywords | `post.metadata.keywords` | `post.keywords` |

### Reading Time Format
```typescript
// MDX (string)
post.readingTime // "5 min read"

// Database (number)
`${post.readingTime} min read` // Need to format
```

---

## 🔄 Migration Checklist

### Step 1: Create New Data Layer
- [x] Create `lib/blog.ts` with database functions
- [x] Create `lib/db.ts` with helper functions
- [x] Create `lib/prisma.ts` with client

### Step 2: Update Type Definitions
- [ ] Add `BlogPost` type to `types/blog.ts`
- [ ] Keep or remove old `PostMetadata` type

### Step 3: Update Page Components (one by one)
- [ ] `app/page.tsx`
- [ ] `app/blog/page.tsx`
- [ ] `app/blog/[slug]/page.tsx`
- [ ] `app/category/[slug]/page.tsx`
- [ ] `app/categories/page.tsx`
- [ ] `app/tag/[slug]/page.tsx`

### Step 4: Update Shared Components
- [ ] `components/blog/post-card.tsx`
- [ ] `components/blog/post-header.tsx`
- [ ] `components/blog/related-posts.tsx`

### Step 5: Clean Up Old Code
- [ ] Delete `lib/mdx.ts` (or keep minimal utils)
- [ ] Remove unused imports
- [ ] Remove old type definitions

### Step 6: Test Everything
- [ ] Home page loads
- [ ] Blog listing works
- [ ] Individual posts render
- [ ] Categories work
- [ ] Tags work
- [ ] Related posts work
- [ ] MDX content renders correctly
- [ ] SEO metadata correct

---

## 🎯 Testing Strategy

### 1. Test Each Page Individually
```bash
# Start dev server
npm run dev

# Test pages:
http://localhost:3000/
http://localhost:3000/blog
http://localhost:3000/blog/[any-post-slug]
http://localhost:3000/category/web-development
http://localhost:3000/category/artificial-intelligence
http://localhost:3000/categories
```

### 2. Check Console for Errors
- Open browser DevTools
- Check for any errors in console
- Verify no 404s or failed requests

### 3. Verify Data Accuracy
- Post titles match
- Descriptions correct
- Categories display properly
- Tags show correctly
- Reading time accurate
- Dates formatted properly

---

## 🚨 Common Issues & Solutions

### Issue 1: "Cannot read property 'title' of undefined"
**Cause:** Trying to access `post.metadata.title` instead of `post.title`
**Solution:** Update all metadata access to direct properties

### Issue 2: "Category is not a string"
**Cause:** Category is now an object, not a string
**Solution:** Use `post.category.name` instead of `post.category`

### Issue 3: "Tags.map is not a function"
**Cause:** Tags structure changed
**Solution:** Use `post.tags.map(t => t.name)` to get tag names

### Issue 4: "Reading time shows number instead of string"
**Cause:** Database stores number, MDX had formatted string
**Solution:** Format as `${post.readingTime} min read`

### Issue 5: "Post not found"
**Cause:** Database might not have the post
**Solution:** Run `npm run db:migrate` to re-import posts

---

## 📦 What Stays the Same

✅ **MDX Rendering** - Still using `next-mdx-remote`
✅ **MDX Components** - All custom components work
✅ **Rehype Plugins** - Code highlighting, etc. still work
✅ **Styling** - No CSS changes needed
✅ **Routes** - All URLs stay the same
✅ **SEO** - Metadata generation works the same

---

## 🎉 Benefits After Migration

✅ **Faster Queries** - Database queries faster than file system
✅ **Better Filtering** - SQL queries for complex filters
✅ **Post Scheduling** - Schedule posts for future publication
✅ **Easier Management** - Use Prisma Studio to manage content
✅ **Scalability** - Handle thousands of posts easily
✅ **Future Features** - Easy to add admin dashboard, search, etc.

---

**Next Action:** Create `lib/blog.ts` with all database query functions
