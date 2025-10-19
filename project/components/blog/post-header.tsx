import Link from "next/link"
import { Calendar, Clock } from "lucide-react"

import { BlogPost } from "@/types/blog"
import { Badge } from "@/components/ui/badge"
import { formatDate } from "@/lib/utils"

interface PostHeaderProps {
  post: BlogPost
}

/**
 * Post header component displaying title, metadata, and tags
 * @param post - Post data from database
 */
export function PostHeader({ post }: PostHeaderProps) {
  return (
    <header className="mb-8">
      <div className="flex flex-wrap items-center gap-2 mb-4">
        <Badge variant="secondary">{post.category.name}</Badge>
        {post.tags.map((tag) => (
          <Badge key={tag.slug} variant="outline">
            {tag.name}
          </Badge>
        ))}
      </div>

      <h1 className="text-4xl font-bold tracking-tight sm:text-5xl mb-4">
        {post.title}
      </h1>

      <p className="text-xl text-muted-foreground mb-6">
        {post.description}
      </p>

      <div className="flex items-center gap-4 text-sm text-muted-foreground">
        <div className="flex items-center gap-1">
          <Calendar className="h-4 w-4" />
          <time dateTime={post.publishedAt?.toISOString()}>
            {formatDate(post.publishedAt?.toISOString() || "")}
          </time>
        </div>
        <div className="flex items-center gap-1">
          <Clock className="h-4 w-4" />
          <span>{post.readingTime} min read</span>
        </div>
      </div>
    </header>
  )
}
