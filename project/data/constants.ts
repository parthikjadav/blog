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
  
  // Homepage
  HERO_TAGLINE: "is the new trend.",
  HERO_DESCRIPTION: "Discover high-quality articles, tutorials, and insights on modern web development.",
  EXPLORE_ARTICLES: "Explore Articles",
  BROWSE_CATEGORIES: "Browse Categories",
  
  // Learning Platform
  START_LEARNING: "Start Learning",
  LEARNING_DESCRIPTION: "Master web development with our structured learning paths",
  VIEW_ALL_TOPICS: "View All Topics",
  NO_TOPICS_AVAILABLE: "No learning topics available yet. Check back soon!",
  LATEST_ARTICLES: "Latest Articles",
  DISCOVER_POSTS: "Discover our most recent posts",
  NO_POSTS_YET: "No posts yet. Check back soon!",
  
  // Learning Page
  LEARNING_TUTORIALS: "Learning Tutorials",
  LEARNING_SUBTITLE: "Interactive tutorials to master web development",
  LESSONS: "lessons",
  LESSON: "lesson",
} as const

export const POST_CATEGORIES = {
  TECHNOLOGY: "technology",
  DESIGN: "design",
  BUSINESS: "business",
  TUTORIAL: "tutorial",
} as const

export type PostCategory =
  (typeof POST_CATEGORIES)[keyof typeof POST_CATEGORIES]
