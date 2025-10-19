import { Metadata } from "next"
import Link from "next/link"
import { Tag } from "lucide-react"

import { getAllTags } from "@/lib/blog"
import { Badge } from "@/components/ui/badge"

export const metadata: Metadata = {
  title: "Tags",
  description: "Browse all blog post tags",
}

export default async function TagsPage() {
  const tagStats = await getAllTags()

  return (
    <div className="container py-12">
      {/* Header */}
      <div className="mb-12">
        <h1 className="text-4xl font-bold tracking-tight mb-4">Tags</h1>
        <p className="text-xl text-muted-foreground">
          Browse posts by tag
        </p>
      </div>

      {/* Tags Cloud */}
      <div className="flex flex-wrap gap-3">
        {tagStats.map((tag) => (
          <Link key={tag.slug} href={`/tag/${tag.slug}`}>
            <Badge
              variant="outline"
              className="text-base px-4 py-2 cursor-pointer hover:bg-accent transition-all hover:scale-105"
            >
              <Tag className="h-3 w-3 mr-2" />
              {tag.name}
              <span className="ml-2 text-xs text-muted-foreground">
                ({tag.count})
              </span>
            </Badge>
          </Link>
        ))}
      </div>

      {/* Empty State */}
      {tagStats.length === 0 && (
        <div className="text-center py-12">
          <p className="text-muted-foreground">No tags found.</p>
        </div>
      )}
    </div>
  )
}
