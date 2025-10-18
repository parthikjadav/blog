# Blog Website Project Outline

## Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Database**: Supabase (PostgreSQL)
- **Styling**: TailwindCSS + shadcn/ui
- **Content**: MDX (Markdown + JSX)
- **Performance**: Static Site Generation (SSG) + Incremental Static Regeneration (ISR)

## Core Features

1. **Blog Posts** - MDX-based content with rich formatting
2. **Categories/Tags** - Organize posts by topics
3. **Search** - Fast client-side search
4. **SEO Optimized** - Meta tags, Open Graph, sitemap
5. **Dark Mode** - Theme toggle

## Project Structure

```
blog/
├── app/
│   ├── layout.tsx           # Root layout
│   ├── page.tsx             # Homepage (post list)
│   ├── blog/
│   │   └── [slug]/
│   │       └── page.tsx     # Individual blog post
│   ├── category/
│   │   └── [slug]/
│   │       └── page.tsx     # Category page
│   └── api/
│       └── search/
│           └── route.ts     # Search API
├── components/
│   ├── ui/                  # shadcn components
│   ├── blog/
│   │   ├── post-card.tsx
│   │   ├── post-header.tsx
│   │   ├── mdx-components.tsx
│   │   └── search-bar.tsx
│   ├── layout/
│   │   ├── header.tsx
│   │   ├── footer.tsx
│   │   └── theme-toggle.tsx
│   └── shared/
│       └── category-badge.tsx
├── content/
│   └── posts/               # MDX blog posts
│       ├── post-title-1.mdx
│       └── post-title-2.mdx
├── data/
│   ├── project-outline.md   # This file
│   └── site-config.ts       # Site metadata
├── lib/
│   ├── supabase.ts          # Supabase client
│   ├── mdx.ts               # MDX utilities
│   └── utils.ts             # Helper functions
├── public/
│   └── images/              # Blog images
└── types/
    └── index.ts              # TypeScript types
```

## Database Schema (Supabase)

### Table: posts

```sql
- id: uuid (primary key)
- slug: text (unique)
- title: text
- description: text
- content: text (MDX content)
- category: text
- tags: text[]
- published_at: timestamp
- updated_at: timestamp
- reading_time: integer (minutes)
- featured_image: text (URL)
- published: boolean
```

### Table: categories

```sql
- id: uuid (primary key)
- slug: text (unique)
- name: text
- description: text
- post_count: integer
```

## Performance Optimizations

### 1. Static Generation

- Pre-render all blog posts at build time
- Use ISR for updates without full rebuild
- Generate static paths for all routes

### 2. Image Optimization

- Next.js Image component
- WebP format with fallbacks
- Lazy loading below fold

### 3. Code Splitting

- Dynamic imports for heavy components
- Route-based code splitting (automatic)
- Lazy load MDX components

### 4. Caching Strategy

- Static assets: Cache-Control headers
- API routes: Stale-while-revalidate
- Supabase queries: React Query/SWR

### 5. Bundle Optimization

- Tree shaking unused code
- Minimize JavaScript bundle
- CSS purging with TailwindCSS

### 6. Font Optimization

- next/font for optimal loading
- Preload critical fonts
- Font subsetting

## MDX Features

- **Code Syntax Highlighting** - Prism/Shiki
- **Custom Components** - Callouts, alerts, embeds
- **Table of Contents** - Auto-generated from headings
- **Reading Progress** - Scroll indicator
- **Copy Code Button** - Enhanced code blocks

## SEO Features

- Dynamic meta tags per post
- Open Graph images
- Twitter Cards
- Structured data (JSON-LD)
- Sitemap.xml generation
- robots.txt

## Development Workflow

### Phase 1: Setup (Foundation)

1. Initialize Next.js project
2. Install dependencies (TailwindCSS, shadcn/ui)
3. Configure Supabase client
4. Setup MDX processing
5. Create base layout and theme

### Phase 2: Core Features

1. Database schema and migrations
2. MDX content structure
3. Blog post rendering
4. Homepage with post list
5. Category/tag filtering

### Phase 3: Enhancement

1. Search functionality
2. Dark mode toggle
3. RSS feed generation
4. SEO optimization
5. Performance tuning

### Phase 4: Polish

1. Responsive design
2. Animations and transitions
3. Error handling
4. Loading states
5. Accessibility (a11y)

## Key Dependencies

```json
{
  "dependencies": {
    "next": "^14.0.0",
    "@supabase/supabase-js": "^2.39.0",
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "@mdx-js/loader": "^3.0.0",
    "@mdx-js/react": "^3.0.0",
    "next-mdx-remote": "^4.4.1",
    "gray-matter": "^4.0.3",
    "reading-time": "^1.5.0",
    "rehype-highlight": "^7.0.0",
    "rehype-slug": "^6.0.0",
    "remark-gfm": "^4.0.0",
    "lucide-react": "^0.300.0",
    "class-variance-authority": "^0.7.0",
    "clsx": "^2.0.0",
    "tailwind-merge": "^2.0.0"
  },
  "devDependencies": {
    "typescript": "^5.3.0",
    "tailwindcss": "^3.4.0",
    "autoprefixer": "^10.4.0",
    "postcss": "^8.4.0",
    "@types/node": "^20.0.0",
    "@types/react": "^18.2.0"
  }
}
```

## Performance Targets

- **Lighthouse Score**: 95+ (all categories)
- **First Contentful Paint**: < 1.5s
- **Time to Interactive**: < 3s
- **Largest Contentful Paint**: < 2.5s
- **Cumulative Layout Shift**: < 0.1
- **Total Bundle Size**: < 200KB (initial load)

## Content Strategy

- Store MDX files in `/content/posts/`
- Frontmatter for metadata (title, date, tags, etc.)
- Sync metadata to Supabase for querying
- Use Supabase for filtering/searching
- Serve content from MDX files (not DB)

## Deployment

- **Platform**: Vercel (optimal for Next.js)
- **Database**: Supabase (hosted)
- **CDN**: Automatic via Vercel
- **Environment Variables**: Supabase URL & Anon Key

## Future Enhancements (Optional)

- Comments system (giscus/utterances)
- Newsletter subscription
- Related posts
- View counter
- Social share buttons
- Table of contents navigation
- Reading progress bar
- Bookmark/save for later
