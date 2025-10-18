export const SITE_CONSTANTS = {
  POSTS_PER_PAGE: 10,
  MAX_RELATED_POSTS: 3,
  DEFAULT_OG_IMAGE: "/images/og-default.jpg",
  READING_TIME_WPM: 200,
} as const

export const ERROR_MESSAGES = {
  POST_NOT_FOUND: "The requested post could not be found.",
  NETWORK_ERROR: "Network error. Please try again.",
  INVALID_SLUG: "Invalid post slug provided.",
} as const

export const UI_TEXT = {
  READ_MORE: "Read more",
  PUBLISHED_ON: "Published on",
  READING_TIME: "min read",
  SHARE_POST: "Share this post",
  BACK_TO_BLOG: "Back to blog",
  RELATED_POSTS: "Related Posts",
  RECENT_POSTS: "Recent Posts",
  READ_MORE_SECTION: "Read More",
  ALL_POSTS: "All Posts",
  SEARCH_PLACEHOLDER: "Search posts...",
} as const

export const POST_CATEGORIES = {
  TECHNOLOGY: "technology",
  DESIGN: "design",
  BUSINESS: "business",
  TUTORIAL: "tutorial",
} as const

export type PostCategory =
  (typeof POST_CATEGORIES)[keyof typeof POST_CATEGORIES]
