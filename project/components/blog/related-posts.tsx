import { PostWithMetadata } from "@/types/blog";
import { PostCard } from "@/components/blog/post-card";
import { UI_TEXT } from "@/data/constants";

interface RelatedPostsProps {
  posts: PostWithMetadata[];
  type?: "tags" | "category" | "recent";
}

export function RelatedPosts({ posts, type = "category" }: RelatedPostsProps) {
  if (posts.length === 0) {
    return null;
  }

  // Determine the section title based on the type
  const sectionTitle =
    type === "recent" ? UI_TEXT.RECENT_POSTS : UI_TEXT.RELATED_POSTS;

  return (
    <section className="mt-16 pt-8 border-t">
      <div className="mb-6">
        <h2 className="text-2xl font-bold tracking-tight">
          {UI_TEXT.READ_MORE_SECTION}
        </h2>
        <p className="text-sm text-muted-foreground mt-1">{sectionTitle}</p>
      </div>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {posts.map((post) => (
          <PostCard key={post.slug} post={post} />
        ))}
      </div>
    </section>
  );
}
