# Modern Blog Platform

A high-performance, production-ready blog built with Next.js 15, Supabase, MDX, and TailwindCSS. Designed for extreme speed, excellent SEO, and beautiful user experience.

## ✨ Features

- ⚡ **Blazing Fast** - Server-side rendering with Next.js 15 App Router
- 📝 **MDX Support** - Write content in Markdown with React components
- 🎨 **Beautiful UI** - Modern design with shadcn/ui and TailwindCSS
- 🌙 **Dark Mode** - Seamless theme switching with next-themes
- 🔍 **SEO Optimized** - Meta tags, Open Graph, Twitter Cards
- 📱 **Responsive** - Mobile-first design
- 🚀 **Performance** - Optimized images, code splitting, static generation
- ♿ **Accessible** - WCAG compliant with proper ARIA labels
- 🎯 **Type Safe** - Full TypeScript support with strict mode

## 🛠️ Tech Stack

- **Framework**: [Next.js 15](https://nextjs.org/)
- **Database**: [PostgreSQL](https://www.postgresql.org/) with [Prisma ORM](https://www.prisma.io/)
- **Hosting**: [Neon](https://neon.tech/) (PostgreSQL Database)
- **Styling**: [TailwindCSS](https://tailwindcss.com/)
- **UI Components**: [shadcn/ui](https://ui.shadcn.com/)
- **Content**: [MDX](https://mdxjs.com/)
- **Icons**: [Lucide React](https://lucide.dev/)
- **Theme**: [next-themes](https://github.com/pacocoursey/next-themes)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Testing**: [Vitest](https://vitest.dev/) + [React Testing Library](https://testing-library.com/)

## 📁 Project Structure

```
project/
├── app/                    # Next.js App Router
│   ├── layout.tsx         # Root layout with theme provider
│   ├── page.tsx           # Homepage
│   └── globals.css        # Global styles with CSS variables
├── components/
│   ├── ui/                # shadcn/ui components
│   ├── blog/              # Blog-specific components
│   └── layout/            # Layout components (Header, Footer)
├── content/
│   └── posts/             # MDX blog posts
├── data/
│   ├── site-config.ts     # Site metadata and configuration
│   └── constants.ts       # App-wide constants
├── lib/
│   ├── mdx.ts             # MDX processing utilities
│   ├── supabase.ts        # Supabase client
│   └── utils.ts           # Helper functions
└── types/
    └── blog.ts            # TypeScript type definitions
```

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ and npm
- PostgreSQL database (local or cloud-hosted)
  - **Recommended**: [Neon](https://neon.tech/) - Free serverless PostgreSQL
  - **Alternatives**: Supabase, Railway, Vercel Postgres, or local PostgreSQL

### Installation

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd project
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up PostgreSQL Database**
   
   Choose one option:
   
   **Option A: Neon (Recommended - Free Tier)**
   - Sign up at [neon.tech](https://neon.tech/)
   - Create a new project
   - Copy the connection string
   
   **Option B: Local PostgreSQL**
   ```bash
   # Install PostgreSQL (if not installed)
   # Create database
   createdb fast_tech_blog
   ```

4. **Set up environment variables**
   
   Create `.env` file (see `ENV-TEMPLATE.md` for examples):
   ```bash
   cp ENV-TEMPLATE.md .env
   ```
   
   Update with your PostgreSQL connection string:
   ```env
   DATABASE_URL="postgresql://user:password@host:5432/database?schema=public"
   ```

5. **Set up database schema**
   ```bash
   # Push schema to database
   npx prisma db push
   
   # Generate Prisma Client
   npx prisma generate
   ```

6. **Migrate MDX content to database**
   ```bash
   npm run db:migrate
   ```

7. **Run the development server**
   ```bash
   npm run dev
   ```

8. **Open your browser**
   
   Navigate to [http://localhost:3000](http://localhost:3000)

### Database Management

```bash
# Open Prisma Studio (Database GUI)
npm run db:studio

# Push schema changes
npm run db:push

# Generate Prisma Client
npm run db:generate

# Migrate MDX files to database
npm run db:migrate
```

## 📝 Creating Blog Posts

Blog posts are written in MDX format and stored in `content/posts/`.

### Create a new post

1. Create a new `.mdx` file in `content/posts/`:
   ```bash
   touch content/posts/my-new-post.mdx
   ```

2. Add frontmatter and content:
   ```mdx
   ---
   title: "My Awesome Post"
   description: "A brief description of the post"
   date: "2025-01-20"
   category: "Tutorial"
   tags: ["nextjs", "react", "tutorial"]
   featured_image: "/images/my-post.jpg"
   published: true
   ---

   # My Awesome Post

   Your content here...
   ```

### Frontmatter Fields

- `title` (required): Post title
- `description` (required): Brief description for SEO
- `date` (required): Publication date (YYYY-MM-DD)
- `category` (required): Post category
- `tags` (required): Array of tags
- `featured_image` (optional): Featured image URL
- `published` (optional): Set to `false` to hide post

## 🎨 Customization

### Site Configuration

Edit `data/site-config.ts` to customize:
- Site name and description
- Author information
- Social media links
- Navigation menu

### Theme Colors

Modify CSS variables in `app/globals.css` to change the color scheme.

### UI Components

All UI components are in `components/ui/` and can be customized using Tailwind classes.

## 🏗️ Building for Production

```bash
npm run build
npm start
```

## 📊 Performance Targets

- **Lighthouse Score**: 95+ (all categories)
- **First Contentful Paint**: < 1.5s
- **Time to Interactive**: < 3s
- **Largest Contentful Paint**: < 2.5s
- **Cumulative Layout Shift**: < 0.1

## 📚 Documentation

- See `../instructions.md` for detailed coding standards
- See `../tasks/phase-1-setup.md` for setup instructions
- See `../data/project-outline.md` for project architecture

## 🤝 Contributing

Contributions are welcome! Please follow the coding standards in `instructions.md`.

## 📄 License

MIT License - feel free to use this project for your own blog!

## 🙏 Acknowledgments

- [Next.js](https://nextjs.org/) - The React Framework
- [Supabase](https://supabase.com/) - Open Source Firebase Alternative
- [shadcn/ui](https://ui.shadcn.com/) - Beautiful UI Components
- [Vercel](https://vercel.com/) - Deployment Platform
