import { Metadata } from "next";
import { notFound } from "next/navigation";
import { MDXRemote } from "next-mdx-remote/rsc";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

import { getPostBySlug, getAllPosts, getRelatedPosts } from "@/lib/blog";
import { PostHeader } from "@/components/blog/post-header";
import { TableOfContents } from "@/components/blog/table-of-contents";
import { mdxComponents } from "@/components/blog/mdx-components";
import { rehypePlugins } from "@/lib/rehype-config";
import { getPlaceholderImage } from "@/lib/placeholder";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { UI_TEXT } from "@/data/constants";
import { siteConfig } from "@/data/site-config";
import { RelatedPosts } from "@/components/blog/related-posts";
import { slugify } from "@/lib/utils";

interface PostPageProps {
  params: Promise<{
    slug: string;
  }>;
}

export async function generateStaticParams() {
  const posts = await getAllPosts();
  return posts.map((post) => ({
    slug: post.slug,
  }));
}

export async function generateMetadata({
  params,
}: PostPageProps): Promise<Metadata> {
  const { slug } = await params;
  try {
    const post = await getPostBySlug(slug);
    if (!post) {
      return { title: "Post Not Found" };
    }

    return {
      title: post.title,
      description: post.description,
      keywords: [
        ...post.tags.map(t => t.name),
        post.category.name,
        siteConfig.name,
      ],
      openGraph: {
        title: post.title,
        description: post.description,
        type: "article",
        publishedTime: post.publishedAt?.toISOString(),
        authors: [siteConfig.author.name],
        tags: post.tags.map(t => t.name),
        images: post.featuredImage ? [post.featuredImage] : [],
      },
      twitter: {
        card: "summary_large_image",
        title: post.title,
        description: post.description,
        images: post.featuredImage ? [post.featuredImage] : [],
      },
    };
  } catch {
    return {
      title: "Post Not Found",
    };
  }
}

export default async function PostPage({ params }: PostPageProps) {
  const { slug } = await params;
  let post;

  post = await getPostBySlug(slug);
  
  if (!post) {
    notFound();
  }

  const relatedData = await getRelatedPosts(
    post.slug,
    post.category.slug,
    post.tags.map(t => t.slug),
    3
  );

  return (
    <div className="container py-12">
      {/* Back Button */}
      <Button asChild variant="ghost" className="mb-8">
        <Link href="/">
          <ArrowLeft className="mr-2 h-4 w-4" />
          {UI_TEXT.BACK_TO_BLOG}
        </Link>
      </Button>

      <div className="flex gap-8">
        {/* Main Content */}
        <article className="flex-1 max-w-4xl">
          {/* Post Header */}
          <PostHeader post={post} />

          {/* Featured Image */}
          <div className="mb-8 rounded-lg overflow-hidden bg-muted flex items-center justify-center max-h-[500px]">
            <Image
              src={post.featuredImage || getPlaceholderImage(post.slug)}
              alt={post.title}
              width={1200}
              height={630}
              className="w-full h-auto max-h-[500px] object-contain"
              priority
              unoptimized={(post.featuredImage || getPlaceholderImage(post.slug)).endsWith(".svg")}
            />
          </div>

          {/* Post Content */}
          <div className="prose prose-slate dark:prose-invert max-w-none">
            <MDXRemote
              source={post.content}
              components={mdxComponents}
              options={{
                mdxOptions: {
                  rehypePlugins: rehypePlugins as any,
                },
              }}
            />
          </div>

          {/* Post Footer */}
          <footer className="mt-12 pt-8 border-t">
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-semibold mb-3 text-muted-foreground uppercase tracking-wide">
                  Tags
                </h3>
                <div className="flex flex-wrap gap-2">
                  {post.tags.map((tag) => (
                    <Link key={tag.slug} href={`/tag/${tag.slug}`}>
                      <Badge
                        variant="outline"
                        className="cursor-pointer hover:bg-accent"
                      >
                        #{tag.name}
                      </Badge>
                    </Link>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="text-sm font-semibold mb-3 text-muted-foreground uppercase tracking-wide">
                  Category
                </h3>
                <Link href={`/category/${post.category.slug}`}>
                  <Badge
                    variant="secondary"
                    className="cursor-pointer hover:opacity-80"
                  >
                    {post.category.name}
                  </Badge>
                </Link>
              </div>
            </div>
          </footer>

          {/* Related Posts */}
          <RelatedPosts posts={relatedData.posts} type={relatedData.type} />
        </article>

        {/* Table of Contents Sidebar */}
        <aside className="w-64 shrink-0">
          <TableOfContents content={post.content} />
        </aside>
      </div>
    </div>
  );
}
