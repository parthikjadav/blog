import Link from "next/link";
import Image from "next/image";
import { ArrowRight } from "lucide-react";

import { BlogPost } from "@/types/blog";
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
  post: BlogPost;
  variant?: "default" | "featured";
}

/**
 * Reusable post card component for displaying post previews
 * @param post - Post data from database
 * @param variant - Visual variant (default or featured)
 */
export function PostCard({ post, variant = "default" }: PostCardProps) {
  // Use featuredImage if available, otherwise use placeholder
  const imageSrc = post.featuredImage || getPlaceholderImage(post.slug);

  return (
    <Link href={`/blog/${post.slug}`}>
      <Card className="h-full transition-all hover:shadow-lg hover:scale-[1.02] overflow-hidden">
        {/* Featured Image */}
        <div className="relative w-full h-48 overflow-hidden bg-muted">
          <Image
            src={imageSrc}
            alt={post.title}
            fill
            className="object-cover"
            unoptimized={imageSrc.endsWith(".svg")}
          />
        </div>

        <CardHeader>
          <div className="flex items-center gap-2 mb-2">
            <Badge variant="secondary">{post.category.name}</Badge>
            <span className="text-sm text-muted-foreground">
              {post.readingTime} min read
            </span>
          </div>
          <CardTitle className="line-clamp-2 leading-[140%]">
            {post.title}
          </CardTitle>
          <CardDescription className="line-clamp-2">
            {post.description}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <span>{formatDate(post.publishedAt?.toISOString() || "")}</span>
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
