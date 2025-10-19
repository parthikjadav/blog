import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(date: string | undefined): string {
  if (!date) return "Invalid Date"
  
  try {
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  } catch {
    return "Invalid Date"
  }
}

/**
 * Converts a string to a URL-friendly slug
 * @param text - The text to slugify
 * @returns URL-friendly slug
 */
export function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-")       // Replace spaces with -
    .replace(/[^\w\-]+/g, "")   // Remove all non-word chars
    .replace(/\-\-+/g, "-")     // Replace multiple - with single -
    .replace(/^-+/, "")         // Trim - from start of text
    .replace(/-+$/, "")         // Trim - from end of text
}
