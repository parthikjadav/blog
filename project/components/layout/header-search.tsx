import { getAllPosts } from "@/lib/blog"
import { SearchBar } from "@/components/blog/search-bar"

/**
 * Server component wrapper for search bar in header
 * Fetches posts on server and passes to client component
 */
export async function HeaderSearch() {
  const posts = await getAllPosts()
  
  return <SearchBar posts={posts} />
}
