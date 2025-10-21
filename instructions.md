# Production-Grade Development Instructions for AI

**Version**: 1.0  
**Last Updated**: Oct 17, 2025

This document defines strict coding standards and best practices that MUST be followed when building this project. These rules ensure maintainability, scalability, and production-ready code quality.

---

## 1. Import Standards

### 1.1 Always Use Path Aliases (@)

**REQUIRED**: Use `@/` prefix for all internal imports. Never use relative paths.

✅ **CORRECT**:

```typescript
import { Button } from "@/components/ui/button";
import { siteConfig } from "@/data/site-config";
import { getAllPosts } from "@/lib/mdx";
import { Post } from "@/types/blog";
```

❌ **INCORRECT**:

```typescript
import { Button } from "../../components/ui/button";
import { siteConfig } from "../data/site-config";
```

### 1.2 Import Order

Organize imports in this exact order with blank lines between groups:

1. React and Next.js core
2. Third-party libraries
3. Internal components (@/components)
4. Internal utilities (@/lib)
5. Internal types (@/types)
6. Internal data/config (@/data)
7. Styles (if any)

```typescript
// 1. React/Next.js
import { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";

// 2. Third-party
import { format } from "date-fns";
import { Calendar, Clock } from "lucide-react";

// 3. Components
import { Button } from "@/components/ui/button";
import { PostCard } from "@/components/blog/post-card";

// 4. Utilities
import { cn, formatDate } from "@/lib/utils";
import { getAllPosts } from "@/lib/mdx";

// 5. Types
import { Post, Category } from "@/types/blog";

// 6. Data/Config
import { siteConfig } from "@/data/site-config";
```

### 1.3 Named Imports Only

Prefer named imports over default imports for better tree-shaking and refactoring.

✅ **CORRECT**:

```typescript
import { useState, useEffect } from "react";
```

❌ **AVOID** (unless required by library):

```typescript
import React from "react";
```

---

## 2. Constants and Configuration

### 2.1 No Hardcoded Strings

**NEVER** hardcode text, URLs, or configuration values directly in components.

✅ **CORRECT**:

```typescript
// data/constants.ts
export const SITE_CONSTANTS = {
  POSTS_PER_PAGE: 10,
  MAX_RELATED_POSTS: 3,
  DEFAULT_OG_IMAGE: "/images/og-default.jpg",
  READING_TIME_WPM: 200,
} as const;

export const ERROR_MESSAGES = {
  POST_NOT_FOUND: "The requested post could not be found.",
  NETWORK_ERROR: "Network error. Please try again.",
  INVALID_SLUG: "Invalid post slug provided.",
} as const;

export const UI_TEXT = {
  READ_MORE: "Read more",
  PUBLISHED_ON: "Published on",
  READING_TIME: "min read",
  SHARE_POST: "Share this post",
} as const;

// Component usage
import { SITE_CONSTANTS, UI_TEXT } from "@/data/constants";

<p>{UI_TEXT.READING_TIME}</p>;
```

❌ **INCORRECT**:

```typescript
<p>min read</p>
<p>Published on</p>
```

### 2.2 Environment Variables

Store all sensitive and environment-specific values in `.env.local`.

```typescript
// lib/env.ts
export const env = {
  supabase: {
    url: process.env.NEXT_PUBLIC_SUPABASE_URL!,
    anonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  },
  site: {
    url: process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000",
  },
} as const;

// Validate on startup
if (!env.supabase.url || !env.supabase.anonKey) {
  throw new Error("Missing required environment variables");
}
```

### 2.3 Type-Safe Constants

Use `as const` for type safety and autocomplete.

```typescript
export const POST_CATEGORIES = {
  TECHNOLOGY: "technology",
  DESIGN: "design",
  BUSINESS: "business",
} as const;

export type PostCategory =
  (typeof POST_CATEGORIES)[keyof typeof POST_CATEGORIES];
```

---

## 3. Component Architecture

### 3.1 Component Size Limit

**RULE**: No component should exceed 200 lines. Break into smaller components.

✅ **CORRECT**:

```typescript
// components/blog/post-page.tsx (parent)
export function PostPage({ post }: PostPageProps) {
  return (
    <article>
      <PostHeader post={post} />
      <PostContent content={post.content} />
      <PostFooter post={post} />
      <RelatedPosts category={post.category} />
    </article>
  );
}

// components/blog/post-header.tsx (child)
export function PostHeader({ post }: PostHeaderProps) {
  return (
    <header>
      <h1>{post.title}</h1>
      <PostMeta post={post} />
    </header>
  );
}
```

### 3.2 Single Responsibility Principle

Each component should do ONE thing only.

✅ **CORRECT**:

```typescript
// Separate components for different responsibilities
<PostCard />           // Display post preview
<PostCardImage />      // Handle image
<PostCardMeta />       // Show metadata
<PostCardActions />    // Action buttons
```

❌ **INCORRECT**:

```typescript
// One giant component doing everything
<PostCard /> // 500 lines handling everything
```

### 3.3 Component File Structure

```typescript
// 1. Imports (organized as per section 1.2)
import { ... }

// 2. Types/Interfaces
interface PostCardProps {
  post: Post
  variant?: "default" | "featured"
}

// 3. Constants (component-specific)
const CARD_VARIANTS = {
  default: "...",
  featured: "...",
}

// 4. Component
export function PostCard({ post, variant = "default" }: PostCardProps) {
  // 4a. Hooks (top of component)
  const [isHovered, setIsHovered] = useState(false)

  // 4b. Derived values
  const formattedDate = formatDate(post.date)

  // 4c. Event handlers
  const handleClick = () => { ... }

  // 4d. Render
  return (...)
}

// 5. Sub-components (if small and only used here)
function PostCardImage({ src, alt }: ImageProps) {
  return (...)
}
```

### 3.4 Props Interface Naming

Always name props interfaces as `{ComponentName}Props`.

```typescript
interface PostCardProps { ... }
interface HeaderProps { ... }
interface ThemeToggleProps { ... }
```

### 3.5 Server-Side vs Client-Side Rendering

**CRITICAL RULE**: All pages (routes) MUST be Server Components by default. NEVER use `"use client"` directive in page files.

✅ **CORRECT** - Server Component Page:

```typescript
// app/blog/page.tsx (Server Component - NO "use client")
import { getAllPosts } from "@/lib/mdx";
import { PostList } from "@/components/blog/post-list";
import { SearchBar } from "@/components/blog/search-bar";

export default async function BlogPage() {
  // Server-side data fetching
  const posts = await getAllPosts();

  return (
    <div>
      {/* Client component for interactivity */}
      // <SearchBar />
      {/* Server component for static content */}
      <PostList posts={posts} />
    </div>
  );
}
```

✅ **CORRECT** - Client Component (separate file):

```typescript
// components/blog/search-bar.tsx
"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";

export function SearchBar() {
  const [query, setQuery] = useState("");

  return (
    <Input
      value={query}
      onChange={(e) => setQuery(e.target.value)}
      placeholder="Search posts..."
    />
  );
}
```

❌ **INCORRECT** - Client Component Page:

```typescript
// app/blog/page.tsx
"use client"; // ❌ NEVER do this in page files

import { useState, useEffect } from "react";

export default function BlogPage() {
  const [posts, setPosts] = useState([]);
  // This defeats Next.js SSR benefits
}
```

**When to Use Client Components:**

- User interactions (clicks, hover, input)
- State management (useState, useReducer)
- Effects (useEffect)
- Browser APIs (localStorage, window)
- Event listeners

**When to Use Server Components (Default):**

- Data fetching
- Direct database access
- Static content rendering
- SEO-critical content
- Accessing backend resources

**Best Practice Pattern:**

```
app/
├── blog/
│   └── page.tsx              # Server Component (default)
│
components/
├── blog/
│   ├── post-list.tsx         # Server Component (static)
│   ├── search-bar.tsx        # Client Component ("use client")
│   ├── like-button.tsx       # Client Component ("use client")
│   └── post-card.tsx         # Server Component (static)
```

**Key Rules:**

1. **Pages are always Server Components** - No `"use client"` in `app/**/page.tsx`
2. **Extract interactivity** - Create separate client components in `components/`
3. **Import client into server** - Server components can import client components
4. **Minimize client boundaries** - Keep `"use client"` as deep in tree as possible
5. **Data flows down** - Pass server-fetched data as props to client components

---

## 4. Custom Hooks

### 4.1 Extract Reusable Logic

Create custom hooks for any logic used in multiple places.

✅ **CORRECT**:

```typescript
// hooks/use-posts.ts
export function usePosts(category?: string) {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    async function fetchPosts() {
      try {
        setLoading(true);
        const data = await getAllPosts(category);
        setPosts(data);
      } catch (err) {
        setError(err as Error);
      } finally {
        setLoading(false);
      }
    }
    fetchPosts();
  }, [category]);

  return { posts, loading, error };
}

// Usage in component
const { posts, loading, error } = usePosts("technology");
```

### 4.2 Hook Naming Convention

Always prefix custom hooks with `use`.

```typescript
useDebounce();
useLocalStorage();
useMediaQuery();
useIntersectionObserver();
usePosts();
useSearch();
```

### 4.3 Common Hooks to Create

```typescript
// hooks/use-debounce.ts
export function useDebounce<T>(value: T, delay: number): T;

// hooks/use-local-storage.ts
export function useLocalStorage<T>(key: string, initialValue: T);

// hooks/use-media-query.ts
export function useMediaQuery(query: string): boolean;

// hooks/use-intersection-observer.ts
export function useIntersectionObserver(options?: IntersectionObserverInit);

// hooks/use-scroll-position.ts
export function useScrollPosition(): number;
```

---

## 5. TypeScript Standards

### 5.1 Strict Type Safety

**REQUIRED**: Enable strict mode in `tsconfig.json`.

```json
{
  "compilerOptions": {
    "strict": true,
    "noImplicitAny": true,
    "strictNullChecks": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true
  }
}
```

### 5.2 No `any` Type

**NEVER** use `any`. Use `unknown` if type is truly unknown.

✅ **CORRECT**:

```typescript
function handleError(error: unknown) {
  if (error instanceof Error) {
    console.error(error.message);
  }
}
```

❌ **INCORRECT**:

```typescript
function handleError(error: any) { ... }
```

### 5.3 Explicit Return Types

Always specify return types for functions.

✅ **CORRECT**:

```typescript
export async function getAllPosts(): Promise<Post[]> {
  // ...
}

export function formatDate(date: string): string {
  // ...
}
```

### 5.4 Type vs Interface

- Use `interface` for object shapes and component props
- Use `type` for unions, intersections, and primitives

```typescript
// Interface for objects
interface Post {
  id: string;
  title: string;
}

// Type for unions
type Status = "draft" | "published" | "archived";

// Type for intersections
type PostWithAuthor = Post & { author: Author };
```

### 5.5 Utility Types

Leverage TypeScript utility types.

```typescript
// Partial - make all properties optional
type PartialPost = Partial<Post>;

// Pick - select specific properties
type PostPreview = Pick<Post, "id" | "title" | "description">;

// Omit - exclude specific properties
type PostWithoutContent = Omit<Post, "content">;

// Required - make all properties required
type RequiredPost = Required<Post>;
```

---

## 6. Async/Await and Error Handling

### 6.1 Always Use Try-Catch

**REQUIRED**: Wrap all async operations in try-catch.

✅ **CORRECT**:

```typescript
export async function fetchPosts(): Promise<Post[]> {
  try {
    const { data, error } = await supabase
      .from("posts")
      .select("*")
      .eq("published", true);

    if (error) throw error;
    return data;
  } catch (error) {
    console.error("Failed to fetch posts:", error);
    throw new Error("Unable to load posts. Please try again later.");
  }
}
```

### 6.2 Custom Error Classes

Create specific error types for better error handling.

```typescript
// lib/errors.ts
export class PostNotFoundError extends Error {
  constructor(slug: string) {
    super(`Post not found: ${slug}`);
    this.name = "PostNotFoundError";
  }
}

export class DatabaseError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "DatabaseError";
  }
}

// Usage
if (!post) {
  throw new PostNotFoundError(slug);
}
```

### 6.3 Error Boundaries

Implement error boundaries for client components.

```typescript
// components/error-boundary.tsx
"use client";

import { Component, ReactNode } from "react";

interface Props {
  children: ReactNode;
  fallback: ReactNode;
}

interface State {
  hasError: boolean;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback;
    }
    return this.props.children;
  }
}
```

---

## 7. Performance Optimization

### 7.1 Memoization

Use React memoization hooks appropriately.

```typescript
// useMemo for expensive calculations
const sortedPosts = useMemo(() => {
  return posts.sort((a, b) =>
    new Date(b.date).getTime() - new Date(a.date).getTime()
  )
}, [posts])

// useCallback for functions passed as props
const handleSearch = useCallback((query: string) => {
  setSearchQuery(query)
}, [])

// React.memo for components that rarely change
export const PostCard = memo(function PostCard({ post }: PostCardProps) {
  return (...)
})
```

### 7.2 Dynamic Imports

Lazy load heavy components.

```typescript
import dynamic from "next/dynamic";

// Lazy load with loading state
const CodeEditor = dynamic(() => import("@/components/code-editor"), {
  loading: () => <p>Loading editor...</p>,
  ssr: false,
});

// Lazy load multiple components
const DynamicComponents = {
  Chart: dynamic(() => import("@/components/chart")),
  Map: dynamic(() => import("@/components/map")),
};
```

### 7.3 Image Optimization

Always use Next.js Image component.

```typescript
import Image from "next/image";

// With proper sizing
<Image
  src={post.featured_image}
  alt={post.title}
  width={800}
  height={400}
  priority={isFeatured}
  placeholder="blur"
  blurDataURL={post.blur_data_url}
  className="rounded-lg"
/>;
```

### 7.4 Avoid Unnecessary Re-renders

```typescript
// Extract static content outside component
const FOOTER_LINKS = [
  { name: "About", href: "/about" },
  { name: "Contact", href: "/contact" },
];

export function Footer() {
  // Component only re-renders when necessary
  return (
    <footer>
      {FOOTER_LINKS.map((link) => (
        <Link key={link.href} href={link.href}>
          {link.name}
        </Link>
      ))}
    </footer>
  );
}
```

---

## 8. Styling Standards

### 8.1 Tailwind CSS Best Practices

Use the `cn()` utility for conditional classes.

```typescript
import { cn } from "@/lib/utils";

// Conditional styling
<div
  className={cn(
    "base-class",
    variant === "featured" && "featured-class",
    isActive && "active-class",
    className // Allow prop override
  )}
/>;
```

### 8.2 Component Variants with CVA

Use `class-variance-authority` for variant management.

```typescript
import { cva, type VariantProps } from "class-variance-authority";

const buttonVariants = cva(
  "inline-flex items-center justify-center rounded-md font-medium transition-colors",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90",
        outline: "border border-input hover:bg-accent",
        ghost: "hover:bg-accent hover:text-accent-foreground",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 px-3",
        lg: "h-11 px-8",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

interface ButtonProps extends VariantProps<typeof buttonVariants> {
  // ...
}
```

### 8.3 Responsive Design

Mobile-first approach with Tailwind breakpoints.

```typescript
<div className="
  grid
  grid-cols-1
  md:grid-cols-2
  lg:grid-cols-3
  gap-4
  md:gap-6
  lg:gap-8
">
```

### 8.4 Dark Mode

Use Tailwind's dark mode classes.

```typescript
<div className="bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100">
```

---

## 9. Data Fetching

### 9.1 Server Components (Default)

Prefer Server Components for data fetching.

```typescript
// app/blog/page.tsx (Server Component)
export default async function BlogPage() {
  const posts = await getAllPosts(); // Direct async call

  return (
    <div>
      {posts.map((post) => (
        <PostCard key={post.id} post={post} />
      ))}
    </div>
  );
}
```

### 9.2 Client Components (When Needed)

Use "use client" only when necessary.

```typescript
"use client";

import { useState, useEffect } from "react";

export function SearchBar() {
  const [query, setQuery] = useState("");
  // Client-side interactivity
}
```

### 9.3 Supabase Query Patterns

```typescript
// Good: Select only needed fields
const { data } = await supabase
  .from("posts")
  .select("id, title, description, slug")
  .eq("published", true)
  .order("published_at", { ascending: false })
  .limit(10);

// Bad: Select all fields
const { data } = await supabase.from("posts").select("*");
```

### 9.4 Caching Strategy

```typescript
// app/blog/page.tsx
export const revalidate = 3600; // Revalidate every hour

// Or use on-demand revalidation
export async function generateStaticParams() {
  const posts = await getAllPosts();
  return posts.map((post) => ({ slug: post.slug }));
}
```

---

## 10. SEO and Metadata Standards

### 10.1 Keywords Meta Tag (REQUIRED)

**CRITICAL**: All pages MUST include keywords meta tag for SEO.

✅ **CORRECT**:

```typescript
// Blog post page
export async function generateMetadata({
  params,
}: PostPageProps): Promise<Metadata> {
  const post = getPostBySlug(params.slug);

  return {
    title: post.metadata.title,
    description: post.metadata.description,
    keywords: [...post.metadata.tags, post.metadata.category, siteConfig.name],
    openGraph: {
      title: post.metadata.title,
      description: post.metadata.description,
      type: "article",
      tags: post.metadata.tags,
    },
    twitter: {
      card: "summary_large_image",
      title: post.metadata.title,
      description: post.metadata.description,
    },
  };
}

// Category/Tag pages
export async function generateMetadata({
  params,
}: CategoryPageProps): Promise<Metadata> {
  const category = params.slug;

  return {
    title: `${category} Posts`,
    description: `All blog posts in the ${category} category`,
    keywords: [category, "blog", "articles", "tutorials"],
  };
}

// Blog listing page
export const metadata: Metadata = {
  title: "Blog",
  description: "All blog posts",
  keywords: ["blog", "articles", "tutorials", "technology"],
};
```

❌ **INCORRECT**:

```typescript
// Missing keywords
export const metadata: Metadata = {
  title: "Blog",
  description: "All blog posts",
  // ❌ No keywords!
};
```

### 10.2 Open Graph and Twitter Cards

Always include Open Graph and Twitter Card metadata for social sharing.

```typescript
openGraph: {
  title: post.title,
  description: post.description,
  type: "article",
  publishedTime: post.date,
  authors: [siteConfig.author.name],
  tags: post.tags,
  images: [post.featured_image],
},
twitter: {
  card: "summary_large_image",
  title: post.title,
  description: post.description,
  images: [post.featured_image],
},
```

---

## 11. File and Folder Naming

### 11.1 Naming Conventions

- **Components**: PascalCase (`PostCard.tsx`, `ThemeToggle.tsx`)
- **Utilities**: kebab-case (`format-date.ts`, `mdx-utils.ts`)
- **Hooks**: camelCase with `use` prefix (`usePosts.ts`, `useDebounce.ts`)
- **Types**: kebab-case (`blog-types.ts`, `api-types.ts`)
- **Constants**: kebab-case (`site-config.ts`, `api-endpoints.ts`)

### 10.2 Folder Structure

```
components/
├── ui/              # shadcn components (lowercase)
├── blog/            # Feature-based (lowercase)
├── layout/          # Layout components (lowercase)
└── shared/          # Shared components (lowercase)

lib/
├── utils.ts         # General utilities
├── mdx.ts           # MDX-specific
└── supabase.ts      # Supabase client

hooks/
├── use-posts.ts
├── use-search.ts
└── use-debounce.ts
```

---

## 11. Comments and Documentation

### 11.1 JSDoc for Public APIs

Document all exported functions and components.

```typescript
/**
 * Fetches all published blog posts sorted by date
 * @param category - Optional category filter
 * @returns Array of Post objects
 * @throws {DatabaseError} When database query fails
 */
export async function getAllPosts(category?: string): Promise<Post[]> {
  // Implementation
}
```

### 11.2 Inline Comments

Use comments sparingly, only for complex logic.

```typescript
// Calculate reading time based on average WPM
const readingTime = Math.ceil(wordCount / READING_TIME_WPM);

// Don't comment obvious code
const title = post.title; // Gets the title ❌
```

### 11.3 TODO Comments

Use standardized format for TODOs.

```typescript
// TODO: Add pagination support
// FIXME: Handle edge case when no posts exist
// NOTE: This is a temporary workaround for...
```

---

## 12. Testing Considerations

### 12.1 Testable Code Structure

Write code that's easy to test.

```typescript
// Good: Pure function, easy to test
export function calculateReadingTime(content: string): number {
  const wordCount = content.split(/\s+/).length;
  return Math.ceil(wordCount / READING_TIME_WPM);
}

// Bad: Side effects, hard to test
export function displayReadingTime(content: string) {
  const time = Math.ceil(content.split(/\s+/).length / 200);
  document.getElementById("time").innerText = time;
}
```

### 12.2 Separate Business Logic

Keep business logic separate from UI.

```typescript
// lib/post-utils.ts (pure logic)
export function filterPostsByCategory(posts: Post[], category: string) {
  return posts.filter(post => post.category === category)
}

// components/post-list.tsx (UI)
export function PostList({ posts, category }: PostListProps) {
  const filteredPosts = filterPostsByCategory(posts, category)
  return (...)
}
```

---

## 13. Security Best Practices

### 13.1 Environment Variables

Never commit secrets.

```typescript
// ✅ Good
const apiKey = process.env.API_KEY;

// ❌ Bad
const apiKey = "sk_live_123456789";
```

### 13.2 Input Validation

Validate all user inputs.

```typescript
import { z } from "zod";

const searchSchema = z.object({
  query: z.string().min(1).max(100),
  category: z.string().optional(),
});

export function validateSearchInput(input: unknown) {
  return searchSchema.parse(input);
}
```

### 13.3 Sanitize Content

Sanitize user-generated content.

```typescript
import DOMPurify from "isomorphic-dompurify";

const cleanHTML = DOMPurify.sanitize(userInput);
```

---

## 14. Accessibility (a11y)

### 14.1 Semantic HTML

Use proper HTML elements.

```typescript
// ✅ Good
<article>
  <header>
    <h1>{post.title}</h1>
  </header>
  <main>{post.content}</main>
</article>

// ❌ Bad
<div>
  <div className="title">{post.title}</div>
  <div>{post.content}</div>
</div>
```

### 14.2 ARIA Labels

Add labels for screen readers.

```typescript
<button aria-label="Toggle dark mode">
  <Moon className="h-5 w-5" />
</button>

<nav aria-label="Main navigation">
  {/* navigation items */}
</nav>
```

### 14.3 Keyboard Navigation

Ensure all interactive elements are keyboard accessible.

```typescript
<div
  role="button"
  tabIndex={0}
  onKeyDown={(e) => {
    if (e.key === "Enter" || e.key === " ") {
      handleClick()
    }
  }}
  onClick={handleClick}
>
```

---

## 15. Git and Version Control

### 15.1 Commit Messages

Use conventional commit format.

```
feat: add search functionality to blog
fix: resolve dark mode toggle issue
docs: update README with setup instructions
refactor: extract post card into separate component
perf: optimize image loading with next/image
style: format code with prettier
test: add unit tests for post utilities
```

### 15.2 Branch Naming

```
feature/search-functionality
fix/dark-mode-toggle
refactor/post-components
docs/api-documentation
```

---

## 16. Code Review Checklist

Before submitting code, verify:

- [ ] All imports use `@/` path aliases
- [ ] No hardcoded strings (use constants)
- [ ] Components under 200 lines
- [ ] Custom hooks for reusable logic
- [ ] TypeScript strict mode compliant
- [ ] No `any` types used
- [ ] Proper error handling with try-catch
- [ ] Performance optimizations applied
- [ ] Responsive design implemented
- [ ] Dark mode support added
- [ ] Accessibility attributes present
- [ ] Comments for complex logic only
- [ ] No console.logs in production code
- [ ] Environment variables for secrets
- [ ] Proper TypeScript types/interfaces

---

## 17. Performance Budgets

### 17.1 Bundle Size Limits

- **Initial JS**: < 200KB
- **Initial CSS**: < 50KB
- **Per Route**: < 100KB

### 17.2 Lighthouse Targets

- **Performance**: 95+
- **Accessibility**: 100
- **Best Practices**: 95+
- **SEO**: 100

### 17.3 Core Web Vitals

- **LCP**: < 2.5s
- **FID**: < 100ms
- **CLS**: < 0.1

---

## Summary

These instructions ensure:

- **Maintainability**: Clean, organized, readable code
- **Scalability**: Modular architecture that grows easily
- **Performance**: Optimized for speed and efficiency
- **Quality**: Production-ready, bug-free code
- **Accessibility**: Inclusive for all users
- **Security**: Protected against common vulnerabilities

**STRICT COMPLIANCE REQUIRED**: All code must follow these standards without exception.
