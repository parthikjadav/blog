/**
 * Get a random placeholder image for blog posts
 * @param seed - Optional seed for consistent placeholder (e.g., post slug)
 * @returns Path to placeholder SVG
 */
export function getPlaceholderImage(seed?: string): string {
  const placeholders = [
    "/placeholder.svg",
    "/placeholder-blue.svg",
    "/placeholder-purple.svg",
    "/placeholder-green.svg",
  ]

  if (seed) {
    // Use seed to get consistent placeholder for same post
    const hash = seed.split("").reduce((acc, char) => {
      return char.charCodeAt(0) + ((acc << 5) - acc)
    }, 0)
    const index = Math.abs(hash) % placeholders.length
    return placeholders[index]
  }

  // Random placeholder
  return placeholders[Math.floor(Math.random() * placeholders.length)]
}
