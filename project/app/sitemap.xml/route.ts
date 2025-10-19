import { redirect } from "next/navigation"

/**
 * Redirects /sitemap.xml to /api/sitemap
 * This ensures backward compatibility with search engines
 */
export async function GET() {
  redirect("/api/sitemap")
}
