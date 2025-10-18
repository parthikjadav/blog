import rehypePrettyCode from "rehype-pretty-code"
import rehypeSlug from "rehype-slug"

/**
 * Rehype Pretty Code configuration for syntax highlighting
 */
export const rehypePrettyCodeOptions = {
  theme: "github-dark",
  keepBackground: true,
  onVisitLine(node: any) {
    // Prevent lines from collapsing in `display: grid` mode
    if (node.children.length === 0) {
      node.children = [{ type: "text", value: " " }]
    }
  },
  onVisitHighlightedLine(node: any) {
    if (!node.properties.className) {
      node.properties.className = []
    }
    node.properties.className.push("line--highlighted")
  },
  onVisitHighlightedWord(node: any) {
    node.properties.className = ["word--highlighted"]
  },
}

export const rehypePlugins = [
  rehypeSlug, // Must come before rehype-pretty-code
  [rehypePrettyCode, rehypePrettyCodeOptions]
]
