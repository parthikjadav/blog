import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { TopicWithLessons } from "./learn";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: string | undefined): string {
  if (!date) return "Invalid Date";

  try {
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  } catch {
    return "Invalid Date";
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
    .replace(/\s+/g, "-") // Replace spaces with -
    .replace(/[^\w\-]+/g, "") // Remove all non-word chars
    .replace(/\-\-+/g, "-") // Replace multiple - with single -
    .replace(/^-+/, "") // Trim - from start of text
    .replace(/-+$/, ""); // Trim - from end of text
}

// helpers (place above return)
export const sortByOrderThenId = <
  T extends { order?: number; id: string | number }
>(
  a: T,
  b: T
) => {
  const ao = a.order ?? Number.MAX_SAFE_INTEGER;
  const bo = b.order ?? Number.MAX_SAFE_INTEGER;
  if (ao !== bo) return ao - bo;
  return String(a.id).localeCompare(String(b.id));
};

export const getMergedItems = (topic: TopicWithLessons) => {
  if (!topic.sections) return null;

  const lessons = (topic.lessons ?? []).map((lesson) => ({
    type: "lesson" as const,
    id: `L:${lesson.id}`,
    order: lesson.order,
    payload: lesson,
  }));

  const sections = (topic.sections ?? []).map((section) => ({
    type: "section" as const,
    id: `S:${section.id}`,
    order: section.order,
    payload: section,
  }));

  return [...lessons, ...sections].sort(sortByOrderThenId);
};
