import Link from "next/link";
import { ArrowRight, Sparkles, BookOpen, Zap, Tag } from "lucide-react";

import { getAllPosts, getAllTags } from "@/lib/mdx";
import { PostCard } from "@/components/blog/post-card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { siteConfig } from "@/data/site-config";
import { UI_TEXT } from "@/data/constants";
import { Spotlight } from "@/components/ui/spotlight";
import { cn } from "@/lib/utils";

export default function Home() {
  const posts = getAllPosts().slice(0, 6);
  const tags = getAllTags();

  return (
    <div>
      {/* Hero Section with Spotlight Effect */}
      <section>
        <div className="relative flex h-[40rem] w-full overflow-hidden rounded-md bg-white dark:bg-black/[0.96] antialiased md:items-center md:justify-center">
          {/* Grid Background */}
          <div
            className={cn(
              "pointer-events-none absolute inset-0 [background-size:40px_40px] select-none",
              "bg-[linear-gradient(to_right,#e5e5e5_1px,transparent_1px),linear-gradient(to_bottom,#e5e5e5_1px,transparent_1px)]",
              "dark:bg-[linear-gradient(to_right,#171717_1px,transparent_1px),linear-gradient(to_bottom,#171717_1px,transparent_1px)]"
            )}
          />

          {/* Spotlight - Automatically adapts to theme */}
          <Spotlight className="-top-40 left-0 md:-top-20 md:left-60" />
          <div className="relative z-10 mx-auto w-full max-w-7xl p-4 pt-20 md:pt-0">
            <h1 className="bg-opacity-50 bg-gradient-to-b from-black to-neutral-600 dark:from-neutral-50 dark:to-neutral-400 bg-clip-text text-center text-4xl font-bold text-transparent md:text-7xl">
              {siteConfig.name} <br /> is the new trend.
            </h1>
            <p className="mx-auto mt-4 max-w-lg text-center text-base font-normal text-neutral-700 dark:text-neutral-300">
              {siteConfig.description}. Discover high-quality articles, tutorials, and insights on modern web development.
            </p>
            
            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-8">
              <Button asChild size="lg" className="bg-black dark:bg-white text-white dark:text-black hover:bg-black/90 dark:hover:bg-white/90 group">
                <Link href="/blog">
                  <BookOpen className="mr-2 h-5 w-5" />
                  Explore Articles
                  <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="border-black/20 dark:border-white/20 text-black dark:text-white hover:bg-black/5 dark:hover:bg-white/10">
                <Link href="/categories">
                  Browse Categories
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Recent Posts */}
      <section className="container py-16">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-3xl font-bold tracking-tight mb-2">
              Latest Articles
            </h2>
            <p className="text-muted-foreground">
              Discover our most recent posts
            </p>
          </div>
          <Button asChild variant="ghost" className="group">
            <Link href="/blog">
              {UI_TEXT.ALL_POSTS}
              <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>
          </Button>
        </div>

        {/* Popular Tags */}
        <div className="mb-12 p-6 rounded-lg border bg-muted/30">
          <div className="flex items-center gap-2 mb-4">
            <Tag className="h-5 w-5 text-primary" />
            <h3 className="text-lg font-semibold">Popular Tags</h3>
          </div>
          <div className="flex flex-wrap gap-2">
            {tags.map((tag) => (
              <Link key={tag.name} href={`/tag/${encodeURIComponent(tag.name)}`} className="inline-block">
                <Badge 
                  variant="secondary" 
                  className="cursor-pointer hover:bg-primary hover:text-primary-foreground transition-colors"
                >
                  {tag.name} ({tag.count})
                </Badge>
              </Link>
            ))}
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {posts.map((post) => (
            <PostCard key={post.slug} post={post} />
          ))}
        </div>

        {posts.length === 0 && (
          <div className="text-center py-12">
            <p className="text-muted-foreground">
              No posts yet. Check back soon!
            </p>
          </div>
        )}
      </section>
    </div>
  );
}
