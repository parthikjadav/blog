/**
 * Custom error class for post not found scenarios
 */
export class PostNotFoundError extends Error {
  constructor(slug: string) {
    super(`Post not found: ${slug}`)
    this.name = "PostNotFoundError"
  }
}

/**
 * Custom error class for database-related errors
 */
export class DatabaseError extends Error {
  constructor(message: string) {
    super(message)
    this.name = "DatabaseError"
  }
}

/**
 * Custom error class for MDX parsing errors
 */
export class MDXParseError extends Error {
  constructor(slug: string, originalError?: Error) {
    super(`Failed to parse MDX content for: ${slug}`)
    this.name = "MDXParseError"
    if (originalError) {
      this.cause = originalError
    }
  }
}

/**
 * Custom error class for invalid input validation
 */
export class ValidationError extends Error {
  constructor(field: string, message: string) {
    super(`Validation error for ${field}: ${message}`)
    this.name = "ValidationError"
  }
}
