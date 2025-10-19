import { z } from "zod";

/**
 * Zod schema for validating a single post input
 */
export const PostInputZ = z.object({
  slug: z
    .string()
    .min(1)
    .max(100)
    .regex(
      /^[a-z0-9-]+$/,
      "Slug must contain only lowercase letters, numbers, and hyphens"
    ),
  title: z
    .string()
    .min(1, "Title is required")
    .max(150, "Title must be 150 characters or less"),
  description: z
    .string()
    .min(1, "Description is required")
    .max(300, "Description must be 300 characters or less"),
  content: z.string().min(1, "Content is required"),
  excerpt: z
    .string()
    .max(300, "Excerpt must be 300 characters or less")
    .optional(),

  author: z
    .string()
    .min(1, "Author is required")
    .max(100, "Author must be 100 characters or less"),
  readingTime: z
    .number()
    .int("Reading time must be an integer")
    .min(0, "Reading time cannot be negative")
    .max(3600, "Reading time must be less than 3600 minutes"),

  published: z.boolean().default(false),
  featured: z.boolean().default(false),
  publishedAt: z
    .string()
    .refine((val) => !isNaN(Date.parse(val)), {
      message: "Invalid datetime format for publishedAt",
    })
    .optional(),
  scheduledFor: z
    .string()
    .refine((val) => !isNaN(Date.parse(val)), {
      message: "Invalid datetime format for scheduledFor",
    })
    .optional(),

  categorySlug: z
    .string()
    .min(1, "Category slug is required")
    .max(60, "Category slug must be 60 characters or less"),
  tags: z
    .array(z.string().min(1).max(60))
    .max(30, "Maximum 30 tags allowed")
    .default([]),
  keywords: z
    .array(z.string().min(1).max(40))
    .max(40, "Maximum 40 keywords allowed")
    .default([]),

  featuredImage: z.string().optional(),
  featuredImageAlt: z
    .string()
    .max(160, "Featured image alt text must be 160 characters or less")
    .optional(),
});

/**
 * Zod schema for validating an array of post inputs
 */
export const BulkPostsZ = z
  .array(PostInputZ)
  .min(1, "At least one post is required");

/**
 * TypeScript type inferred from the Zod schema
 */
export type PostInput = z.infer<typeof PostInputZ>;

/**
 * TypeScript type for the bulk posts array
 */
export type BulkPosts = z.infer<typeof BulkPostsZ>;
