import Link from "next/link"
import { AlertCircle } from "lucide-react"

import { Button } from "@/components/ui/button"

export default function NotFound() {
  return (
    <div className="container flex flex-col items-center justify-center min-h-[60vh] py-12">
      <AlertCircle className="h-16 w-16 text-muted-foreground mb-4" />
      <h1 className="text-3xl font-bold mb-2">Tag Not Found</h1>
      <p className="text-muted-foreground mb-6 text-center max-w-md">
        The tag you're looking for doesn't exist or has no posts.
      </p>
      <Button asChild>
        <Link href="/blog">View All Posts</Link>
      </Button>
    </div>
  )
}
