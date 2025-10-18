import { getAllPosts } from "@/lib/mdx"
import { SearchBar } from "@/components/blog/search-bar"

/**
 * Server component wrapper for search bar in header
 * Fetches posts on server and passes to client component
 */
export function HeaderSearch() {
  const posts = getAllPosts()
  
  return <SearchBar posts={posts} />
}
