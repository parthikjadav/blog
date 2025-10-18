# Phase 1: Setup (Foundation)

## Overview
Set up the Next.js project with all necessary dependencies, configure Supabase, MDX processing, and create the base layout with theming support.

---

## Task 1: Initialize Next.js Project

### Steps
1. Create Next.js 15 app with TypeScript and App Router
   ```bash
   npx create-next-app@latest . --typescript --tailwind --app --no-src-dir
   ```

2. Verify project structure:
   - `app/` directory exists
   - `tailwind.config.ts` created
   - `tsconfig.json` configured

### Expected Output
- Working Next.js app
- TypeScript configured
- TailwindCSS integrated
- App Router enabled

---

## Task 2: Install Dependencies

### Core Dependencies
```bash
npm install @supabase/supabase-js
npm install next-mdx-remote gray-matter reading-time
npm install rehype-highlight rehype-slug rehype-autolink-headings
npm install remark-gfm
npm install lucide-react
npm install class-variance-authority clsx tailwind-merge
npm install date-fns
```

### Dev Dependencies
```bash
npm install -D @types/node @types/react @types/react-dom
npm install -D @tailwindcss/typography
```

### shadcn/ui Setup
```bash
npx shadcn-ui@latest init
```
**Config options:**
- Style: Default
- Base color: Slate
- CSS variables: Yes

**Install components:**
```bash
npx shadcn-ui@latest add button
npx shadcn-ui@latest add card
npx shadcn-ui@latest add badge
npx shadcn-ui@latest add input
npx shadcn-ui@latest add separator
npx shadcn-ui@latest add dropdown-menu
```

### Verification
- Check `package.json` for all dependencies
- Verify `components/ui/` folder created
- Test build: `npm run build`

---

## Task 3: Configure Supabase Client

### 3.1 Create Supabase Project
1. Go to https://supabase.com
2. Create new project
3. Note down:
   - Project URL
   - Anon/Public Key

### 3.2 Environment Variables
Create `.env.local`:
```env
NEXT_PUBLIC_SUPABASE_URL=your_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
```

Add to `.gitignore`:
```
.env*.local
```

### 3.3 Create Supabase Client
File: `lib/supabase.ts`
```typescript
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
```

### 3.4 Create TypeScript Types
File: `types/blog.ts`
```typescript
export interface Post {
  id: string
  slug: string
  title: string
  description: string
  content: string
  category: string
  tags: string[]
  published_at: string
  updated_at: string
  reading_time: number
  featured_image: string | null
  published: boolean
}

export interface Category {
  id: string
  slug: string
  name: string
  description: string
  post_count: number
}

export interface PostMetadata {
  title: string
  description: string
  date: string
  category: string
  tags: string[]
  featured_image?: string
  published?: boolean
}
```

### Verification
- Environment variables loaded
- Supabase client exports successfully
- Types defined

---

## Task 4: Setup MDX Processing

### 4.1 MDX Utilities
File: `lib/mdx.ts`
```typescript
import fs from 'fs'
import path from 'path'
import matter from 'gray-matter'
import readingTime from 'reading-time'
import { PostMetadata } from '@/types/blog'

const postsDirectory = path.join(process.cwd(), 'content/posts')

export function getPostSlugs() {
  return fs.readdirSync(postsDirectory)
    .filter(file => file.endsWith('.mdx'))
    .map(file => file.replace(/\.mdx$/, ''))
}

export function getPostBySlug(slug: string) {
  const fullPath = path.join(postsDirectory, `${slug}.mdx`)
  const fileContents = fs.readFileSync(fullPath, 'utf8')
  const { data, content } = matter(fileContents)
  const { text } = readingTime(content)

  return {
    slug,
    metadata: data as PostMetadata,
    content,
    readingTime: text,
  }
}

export function getAllPosts() {
  const slugs = getPostSlugs()
  const posts = slugs
    .map(slug => getPostBySlug(slug))
    .filter(post => post.metadata.published !== false)
    .sort((a, b) => {
      return new Date(b.metadata.date).getTime() - new Date(a.metadata.date).getTime()
    })
  
  return posts
}
```

### 4.2 MDX Components
File: `components/blog/mdx-components.tsx`
```typescript
import { MDXComponents } from 'mdx/types'
import Image from 'next/image'

export const mdxComponents: MDXComponents = {
  h1: ({ children }) => (
    <h1 className="text-4xl font-bold mt-8 mb-4">{children}</h1>
  ),
  h2: ({ children }) => (
    <h2 className="text-3xl font-semibold mt-6 mb-3">{children}</h2>
  ),
  h3: ({ children }) => (
    <h3 className="text-2xl font-semibold mt-4 mb-2">{children}</h3>
  ),
  p: ({ children }) => (
    <p className="mb-4 leading-7">{children}</p>
  ),
  a: ({ href, children }) => (
    <a href={href} className="text-blue-600 hover:underline">
      {children}
    </a>
  ),
  code: ({ children }) => (
    <code className="bg-gray-100 dark:bg-gray-800 px-1.5 py-0.5 rounded text-sm">
      {children}
    </code>
  ),
  pre: ({ children }) => (
    <pre className="bg-gray-100 dark:bg-gray-900 p-4 rounded-lg overflow-x-auto mb-4">
      {children}
    </pre>
  ),
  img: ({ src, alt }) => (
    <Image
      src={src || ''}
      alt={alt || ''}
      width={800}
      height={400}
      className="rounded-lg my-4"
    />
  ),
}
```

### 4.3 Create Content Directory
```bash
mkdir -p content/posts
```

### 4.4 Sample MDX Post
File: `content/posts/welcome.mdx`
```mdx
---
title: "Welcome to My Blog"
description: "First post on this amazing blog platform"
date: "2025-01-15"
category: "General"
tags: ["welcome", "introduction"]
featured_image: "/images/welcome.jpg"
published: true
---

# Welcome!

This is my first blog post using **MDX**. Here's what makes it awesome:

- Write in Markdown
- Use React components
- Full TypeScript support

## Code Example

```javascript
const greeting = "Hello, World!"
console.log(greeting)
```

Stay tuned for more content!
```

### Verification
- MDX utilities export correctly
- Sample post renders
- Reading time calculated

---

## Task 5: Create Base Layout and Theme

### 5.1 Utility Functions
File: `lib/utils.ts`
```typescript
import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(date: string) {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}
```

### 5.2 Site Configuration
File: `data/site-config.ts`
```typescript
export const siteConfig = {
  name: "My Blog",
  description: "A modern blog built with Next.js and Supabase",
  url: "https://yourblog.com",
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
  ],
}
```

### 5.3 Theme Provider
File: `components/theme-provider.tsx`
```typescript
"use client"

import * as React from "react"
import { ThemeProvider as NextThemesProvider } from "next-themes"
import { type ThemeProviderProps } from "next-themes/dist/types"

export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  return <NextThemesProvider {...props}>{children}</NextThemesProvider>
}
```

Install next-themes:
```bash
npm install next-themes
```

### 5.4 Header Component
File: `components/layout/header.tsx`
```typescript
import Link from "next/link"
import { siteConfig } from "@/data/site-config"
import { ThemeToggle } from "./theme-toggle"

export function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        <Link href="/" className="font-bold text-xl">
          {siteConfig.name}
        </Link>
        
        <nav className="flex items-center gap-6">
          {siteConfig.navigation.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="text-sm font-medium transition-colors hover:text-primary"
            >
              {item.name}
            </Link>
          ))}
          <ThemeToggle />
        </nav>
      </div>
    </header>
  )
}
```

### 5.5 Footer Component
File: `components/layout/footer.tsx`
```typescript
import { siteConfig } from "@/data/site-config"

export function Footer() {
  return (
    <footer className="border-t py-6 md:py-0">
      <div className="container flex flex-col items-center justify-between gap-4 md:h-24 md:flex-row">
        <p className="text-center text-sm leading-loose text-muted-foreground md:text-left">
          Built by {siteConfig.author.name}. Powered by Next.js & Supabase.
        </p>
      </div>
    </footer>
  )
}
```

### 5.6 Theme Toggle
File: `components/layout/theme-toggle.tsx`
```typescript
"use client"

import * as React from "react"
import { Moon, Sun } from "lucide-react"
import { useTheme } from "next-themes"
import { Button } from "@/components/ui/button"

export function ThemeToggle() {
  const { theme, setTheme } = useTheme()

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={() => setTheme(theme === "light" ? "dark" : "light")}
    >
      <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
      <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
      <span className="sr-only">Toggle theme</span>
    </Button>
  )
}
```

### 5.7 Root Layout
File: `app/layout.tsx`
```typescript
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import { siteConfig } from "@/data/site-config"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: {
    default: siteConfig.name,
    template: `%s | ${siteConfig.name}`,
  },
  description: siteConfig.description,
  authors: [{ name: siteConfig.author.name }],
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <div className="relative flex min-h-screen flex-col">
            <Header />
            <main className="flex-1">{children}</main>
            <Footer />
          </div>
        </ThemeProvider>
      </body>
    </html>
  )
}
```

### 5.8 Update Tailwind Config
File: `tailwind.config.ts`
Add typography plugin and dark mode:
```typescript
import type { Config } from "tailwindcss"

const config: Config = {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      typography: {
        DEFAULT: {
          css: {
            maxWidth: '65ch',
          },
        },
      },
    },
  },
  plugins: [require("@tailwindcss/typography")],
}
export default config
```

### Verification
- Theme toggle works (light/dark mode)
- Header and footer render
- Layout responsive
- Typography styles applied

---

## Completion Checklist

- [ ] Next.js project initialized with TypeScript
- [ ] All dependencies installed
- [ ] shadcn/ui components added
- [ ] Supabase client configured
- [ ] Environment variables set
- [ ] MDX utilities created
- [ ] Sample MDX post created
- [ ] Theme provider working
- [ ] Header component complete
- [ ] Footer component complete
- [ ] Theme toggle functional
- [ ] Root layout configured
- [ ] Dev server runs: `npm run dev`
- [ ] Build succeeds: `npm run build`

---

## Next Steps
After completing Phase 1, proceed to **Phase 2: Core Features** (database schema and blog functionality).
