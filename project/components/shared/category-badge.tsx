import Link from "next/link"

import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

interface CategoryBadgeProps {
  category: string
  variant?: "default" | "secondary" | "outline"
  clickable?: boolean
  className?: string
}

/**
 * Reusable category badge component with optional link
 * @param category - Category name
 * @param variant - Badge visual variant
 * @param clickable - Whether badge links to category page
 * @param className - Additional CSS classes
 */
export function CategoryBadge({
  category,
  variant = "secondary",
  clickable = true,
  className,
}: CategoryBadgeProps) {
  const badge = (
    <Badge
      variant={variant}
      className={cn(
        clickable && "cursor-pointer hover:opacity-80 transition-opacity",
        className
      )}
    >
      {category}
    </Badge>
  )

  if (clickable) {
    return <Link href={`/category/${category.toLowerCase()}`}>{badge}</Link>
  }

  return badge
}
