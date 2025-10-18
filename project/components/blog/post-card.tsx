import Link from "next/link";
import Image from "next/image";
import { ArrowRight } from "lucide-react";

import { PostWithMetadata } from "@/types/blog";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/lib/utils";
import { getPlaceholderImage } from "@/lib/placeholder";
import { UI_TEXT } from "@/data/constants";

interface PostCardProps {
  post: PostWithMetadata;
  variant?: "default" | "featured";
}

/**
 * Reusable post card component for displaying post previews
 * @param post - Post data with metadata
 * @param variant - Visual variant (default or featured)
 */
export function PostCard({ post, variant = "default" }: PostCardProps) {
  // Use featured_image if available, otherwise use placeholder
  const imageSrc = post.metadata.featured_image
    ? post.metadata.featured_image
    : getPlaceholderImage(post.slug);

  return (
    <Link href={`/blog/${post.slug}`}>
      <Card className="h-full transition-all hover:shadow-lg hover:scale-[1.02] overflow-hidden">
        {/* Featured Image */}
        <div className="relative w-full h-48 overflow-hidden bg-muted">
          <Image
            src={imageSrc}
            alt={post.metadata.title}
            fill
            className="object-cover"
            unoptimized={imageSrc.endsWith(".svg")}
          />
        </div>

        <CardHeader>
          <div className="flex items-center gap-2 mb-2">
            <Badge variant="secondary">{post.metadata.category}</Badge>
            <span className="text-sm text-muted-foreground">
              {post.readingTime}
            </span>
          </div>
          <CardTitle className="line-clamp-2 leading-[140%]">
            {post.metadata.title}
          </CardTitle>
          <CardDescription className="line-clamp-2">
            {post.metadata.description}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <span>{formatDate(post.metadata.published_at || post.metadata.date || "")}</span>
            <span className="flex items-center gap-1">
              {UI_TEXT.READ_MORE}
              <ArrowRight className="h-3 w-3" />
            </span>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
