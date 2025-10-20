# Blog Website Project Outline

## Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Database**: Prisma + PostgreSQL (Neon serverless)
- **Styling**: TailwindCSS + shadcn/ui
- **Content**: MDX (Markdown + JSX) stored in database
- **Testing**: Vitest + React Testing Library (157 tests passing)
- **Performance**: Static Site Generation (SSG)
- **Learning Platform**: Interactive tutorials with MDX lessons ✅

## Core Features

1. **Blog Posts** - MDX-based content with rich formatting
2. **Categories/Tags** - Organize posts by topics
3. **Search** - Fast client-side search
4. **SEO Optimized** - Meta tags, Open Graph, sitemap
5. **Dark Mode** - Theme toggle
6. **Learning Platform** - Interactive tutorials with lessons ✅

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
│   ├── categories/
│   │   └── page.tsx         # All categories
│   ├── tag/
│   │   └── [slug]/
│   │       └── page.tsx     # Tag page
│   ├── tags/
│   │   └── page.tsx         # All tags
│   ├── learn/               # Learning platform (Phase 8) 🆕
│   │   ├── page.tsx         # Topics listing
│   │   ├── [topic]/
│   │   │   ├── page.tsx     # Redirect to first lesson
│   │   │   └── [lesson]/
│   │   │       └── page.tsx # Lesson page with sidebar
│   ├── api/
│   │   └── admin/
│   │       ├── topics/      # Topic management API 🆕
│   │       └── lessons/     # Lesson management API 🆕
│   └── sitemap.ts           # Dynamic sitemap
├── components/
│   ├── ui/                  # shadcn components
│   ├── blog/
│   │   ├── post-card.tsx
│   │   ├── post-header.tsx
│   │   ├── related-posts.tsx
│   │   ├── table-of-contents.tsx
│   │   ├── mdx-components.tsx
│   │   └── search-bar.tsx
│   ├── layout/
│   │   ├── header.tsx
│   │   ├── header-search.tsx
│   │   ├── footer.tsx
│   │   └── theme-toggle.tsx
│   └── learn/               # Learning platform components 🆕
│       ├── learning-sidebar.tsx
│       ├── lesson-content.tsx
│       ├── lesson-navigation.tsx
│       └── topic-card.tsx
├── prisma/
│   ├── schema.prisma        # Database schema (PostgreSQL)
│   └── migrations/          # Database migrations
├── scripts/
│   └── migrate-mdx-to-db.ts # Migration script
├── tests/
│   ├── setup.ts             # Test configuration
│   ├── tsconfig.json        # Test TypeScript config
│   ├── unit/                # Unit tests
│   ├── integration/         # Integration tests
│   ├── components/          # Component tests
│   ├── mocks/               # Mock data
│   └── README.md            # Testing guide
├── data/
│   ├── site-config.ts       # Site metadata
│   └── constants.ts         # UI constants
├── lib/
│   ├── prisma.ts            # Prisma client singleton
│   ├── db.ts                # Database helpers
│   ├── blog.ts              # Blog data fetching
│   ├── learn.ts             # Learning platform data fetching 🆕
│   ├── placeholder.ts       # Placeholder images
│   ├── rehype-config.ts     # MDX rehype plugins
│   └── utils.ts             # Helper functions
├── hooks/
│   └── use-debounce.ts      # Custom hooks
├── public/
│   └── images/              # Blog images
├── types/
│   └── blog.ts              # TypeScript types
└── vitest.config.ts         # Vitest configuration
```

## Database Schema (Prisma + PostgreSQL)

### Model: Post

```prisma
model Post {
  id                String   @id @default(uuid())
  slug              String   @unique
  title             String
  description       String
  content           String   @db.Text // MDX content
  excerpt           String?
  
  // Metadata
  published         Boolean  @default(false)
  featured          Boolean  @default(false)
  scheduledFor      DateTime? // Post scheduling feature
  publishedAt       DateTime?
  updatedAt         DateTime @updatedAt
  createdAt         DateTime @default(now())
  
  // SEO
  keywords          String   // JSON array as string
  featuredImage     String?
  featuredImageAlt  String?
  
  // Content info
  author            String
  readingTime       Int      // in minutes
  
  // Relationships
  categoryId        String
  category          Category @relation(fields: [categoryId], references: [id])
  tags              PostTag[]
}
```

### Model: Category

```prisma
model Category {
  id          String   @id @default(uuid())
  name        String
  slug        String   @unique
  description String?
  createdAt   DateTime @default(now())
  
  posts       Post[]
}
```

### Model: Tag

```prisma
model Tag {
  id        String   @id @default(uuid())
  name      String
  slug      String   @unique
  createdAt DateTime @default(now())
  
  posts     PostTag[]
}
```

### Model: PostTag (Junction Table)

```prisma
model PostTag {
  id        String   @id @default(uuid())
  postId    String
  tagId     String
  
  post      Post     @relation(fields: [postId], references: [id], onDelete: Cascade)
  tag       Tag      @relation(fields: [tagId], references: [id], onDelete: Cascade)
  
  @@unique([postId, tagId])
}
```

### Model: Topic (Phase 8 - Learning Platform) 🆕

```prisma
model Topic {
  id          String   @id @default(uuid())
  slug        String   @unique
  title       String
  description String?
  icon        String?
  order       Int
  published   Boolean  @default(false)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  
  lessons     Lesson[]
}
```

### Model: Lesson (Phase 8 - Learning Platform) 🆕

```prisma
model Lesson {
  id          String   @id @default(uuid())
  slug        String
  title       String
  description String?
  content     String   @db.Text  // MDX content
  order       Int
  published   Boolean  @default(false)
  duration    Int?     // Reading time in minutes
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  
  topicId     String
  topic       Topic    @relation(fields: [topicId], references: [id], onDelete: Cascade)
  
  @@unique([topicId, slug])
}
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

### Phase 5: Production Ready

1. Code quality and TypeScript strict mode
2. Documentation
3. Testing infrastructure (Vitest)
4. PostgreSQL migration
5. Deployment

### Phase 6: Prisma Migration

1. Setup Prisma with SQLite
2. Create database schema
3. Migrate MDX posts to database
4. Update data fetching layer

### Phase 7: PostgreSQL Migration

1. Migrate from SQLite to Neon PostgreSQL
2. Update schema for PostgreSQL
3. Data migration and verification
4. Testing and validation

### Phase 8: Learning Platform ✅ COMPLETED

1. ✅ Database schema (Topic, Lesson models)
2. ✅ Library functions (`lib/learn.ts`)
3. ✅ Route structure (`/learn/[topic]/[lesson]`)
4. ✅ Sidebar navigation component
5. ✅ Lesson content rendering with MDX
6. ✅ Navigation components (prev/next)
7. ✅ Seed data script (3 topics, 6 lessons)
8. ✅ MDX content styling
9. ✅ Mobile responsive design
10. ✅ Header navigation updated

**Status**: Complete - Learning platform live at `/learn`  
**Content**: 3 topics (HTML, CSS, JavaScript) with 6 lessons  
**Features**: Sidebar navigation, MDX rendering, prev/next navigation

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
- **Database**: Neon PostgreSQL (serverless)
- **CDN**: Automatic via Vercel
- **Environment Variables**: DATABASE_URL (PostgreSQL connection)

## Future Enhancements (Optional)

### Blog Features
- Comments system (giscus/utterances)
- Newsletter subscription
- View counter
- Social share buttons
- Bookmark/save for later

### Learning Platform Features (Phase 8+)
- User progress tracking
- Lesson completion certificates
- Interactive code editor (CodeSandbox integration)
- Exercise validation
- Search across lessons
- Comments/discussion per lesson
- Bookmarks for favorite lessons
- Quizzes and assessments
- Community Q&A section
