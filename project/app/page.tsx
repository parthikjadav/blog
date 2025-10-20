import Link from "next/link";
import { ArrowRight, BookOpen, GraduationCap } from "lucide-react";

import { getAllPosts } from "@/lib/blog";
import { getAllTopics } from "@/lib/learn";
import { PostCard } from "@/components/blog/post-card";
import TopicCard from "@/components/learn/TopicCard";
import { Button } from "@/components/ui/button";
import { siteConfig } from "@/data/site-config";
import { UI_TEXT } from "@/data/constants";
import { Spotlight } from "@/components/ui/spotlight";
import { cn } from "@/lib/utils";

export default async function Home() {
  // Fetch posts with error handling
  let posts: Awaited<ReturnType<typeof getAllPosts>> = [];
  try {
    posts = (await getAllPosts()).slice(0, 6);
  } catch (error) {
    console.error("Error fetching posts:", error);
  }

  // Fetch topics with error handling
  let topics: Awaited<ReturnType<typeof getAllTopics>> = [];
  try {
    topics = await getAllTopics();
  } catch (error) {
    console.error("Error fetching learning topics:", error);
  }

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
              {siteConfig.name} <br /> {UI_TEXT.HERO_TAGLINE}
            </h1>
            <p className="mx-auto mt-4 max-w-lg text-center text-base font-normal text-neutral-700 dark:text-neutral-300">
              {siteConfig.description}. {UI_TEXT.HERO_DESCRIPTION}
            </p>
            
            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-8">
              <Button asChild size="lg" className="bg-black dark:bg-white text-white dark:text-black hover:bg-black/90 dark:hover:bg-white/90 group">
                <Link href="/blog">
                  <BookOpen className="mr-2 h-5 w-5" />
                  {UI_TEXT.EXPLORE_ARTICLES}
                  <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="border-black/20 dark:border-white/20 text-black dark:text-white hover:bg-black/5 dark:hover:bg-white/10">
                <Link href="/categories">
                  {UI_TEXT.BROWSE_CATEGORIES}
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Learning Section */}
      <section className="container py-16 border-b">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-3xl font-bold tracking-tight mb-2 flex items-center gap-2">
              <GraduationCap className="h-8 w-8" />
              {UI_TEXT.START_LEARNING}
            </h2>
            <p className="text-muted-foreground">
              {UI_TEXT.LEARNING_DESCRIPTION}
            </p>
          </div>
          <Button asChild variant="ghost" className="group">
            <Link href="/learn">
              {UI_TEXT.VIEW_ALL_TOPICS}
              <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>
          </Button>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {topics.map((topic) => (
            <TopicCard key={topic.slug} topic={topic} />
          ))}
        </div>

        {topics.length === 0 && (
          <div className="text-center py-12">
            <p className="text-muted-foreground">
              {UI_TEXT.NO_TOPICS_AVAILABLE}
            </p>
          </div>
        )}
      </section>

      {/* Recent Posts */}
      <section className="container py-16">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-3xl font-bold tracking-tight mb-2">
              {UI_TEXT.LATEST_ARTICLES}
            </h2>
            <p className="text-muted-foreground">
              {UI_TEXT.DISCOVER_POSTS}
            </p>
          </div>
          <Button asChild variant="ghost" className="group">
            <Link href="/blog">
              {UI_TEXT.ALL_POSTS}
              <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>
          </Button>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {posts.map((post) => (
            <PostCard key={post.slug} post={post} />
          ))}
        </div>

        {posts.length === 0 && (
          <div className="text-center py-12">
            <p className="text-muted-foreground">
              {UI_TEXT.NO_POSTS_YET}
            </p>
          </div>
        )}
      </section>
    </div>
  );
}
