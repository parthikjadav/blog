import { NextResponse } from "next/server";
import { BulkPostsZ } from "@/lib/validation/posts-upload";
import { prisma } from "@/lib/prisma";

/**
 * POST /api/admin/posts/create
 *
 * Bulk upload posts to the database with Zod validation and API key authentication.
 *
 * Headers:
 * - x-api-key: Required API key for authentication
 * - Content-Type: application/json
 *
 * Body: Array of PostInput objects
 *
 * Returns:
 * - 200: { created, updated, failed, results }
 * - 400: Invalid payload with Zod validation errors
 * - 401: Unauthorized (missing or invalid API key)
 * - 405: Method not allowed (non-POST requests)
 */
export async function POST(req: Request) {
  // 1. Authenticate with x-api-key header
  const apiKey = req.headers.get("x-api-key");

  if (!apiKey || apiKey !== process.env.POSTS_UPLOAD_API_KEY) {
    return NextResponse.json(
      { error: "Unauthorized", message: "Invalid or missing x-api-key header" },
      { status: 401 }
    );
  }

  // 2. Parse JSON body
  let json: unknown;
  try {
    json = await req.json();
  } catch (error) {
    return NextResponse.json(
      { error: "Invalid JSON", message: "Request body must be valid JSON" },
      { status: 400 }
    );
  }

  // 3. Validate with Zod
  const parsed = BulkPostsZ.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json(
      {
        error: "Validation failed",
        issues: parsed.error.issues.map((issue) => ({
          path: issue.path.join("."),
          message: issue.message,
          code: issue.code,
        })),
      },
      { status: 400 }
    );
  }

  const posts = parsed.data;
  const results: Array<{
    slug: string;
    status: "created" | "updated" | "failed";
    message?: string;
  }> = [];

  let created = 0;
  let updated = 0;
  let failed = 0;

  // 4. Process each post sequentially with transaction
  for (const p of posts) {
    try {
      const res = await prisma.$transaction(async (tx) => {
        // Ensure category exists (upsert)
        const category = await tx.category.upsert({
          where: { slug: p.categorySlug },
          update: {},
          create: {
            slug: p.categorySlug,
            name: p.categorySlug
              .split("-")
              .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
              .join(" "),
            createdAt: new Date(),
          },
        });

        // Ensure all tags exist - batch operation to avoid timeout
        const tagRows: Array<{ id: string; slug: string }> = [];
        
        if (p.tags.length > 0) {
          // First, try to find existing tags
          const existingTags = await tx.tag.findMany({
            where: { slug: { in: p.tags } },
            select: { id: true, slug: true }
          });
          
          const existingTagSlugs = new Set(existingTags.map(t => t.slug));
          const newTagSlugs = p.tags.filter(slug => !existingTagSlugs.has(slug));
          
          // Create new tags in batch if any
          if (newTagSlugs.length > 0) {
            await tx.tag.createMany({
              data: newTagSlugs.map(slug => ({
                slug,
                name: slug.split("-").map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(" "),
                createdAt: new Date(),
              })),
              skipDuplicates: true,
            });
            
            // Fetch the newly created tags
            const newTags = await tx.tag.findMany({
              where: { slug: { in: newTagSlugs } },
              select: { id: true, slug: true }
            });
            
            tagRows.push(...existingTags, ...newTags);
          } else {
            tagRows.push(...existingTags);
          }
        }

        // Compute publishedAt if published but not provided
        const publishedAt = p.published
          ? p.publishedAt
            ? new Date(p.publishedAt)
            : new Date()
          : null;

        // Prepare post data
        const postData = {
          title: p.title,
          slug: p.slug,
          description: p.description,
          content: p.content,
          excerpt: p.excerpt ?? null,
          author: p.author,
          readingTime: p.readingTime,
          featured: p.featured ?? false,
          published: p.published ?? false,
          scheduledFor: p.scheduledFor ? new Date(p.scheduledFor) : null,
          publishedAt,
          keywords: JSON.stringify(p.keywords ?? []),
          featuredImage: p.featuredImage ?? null,
          featuredImageAlt: p.featuredImageAlt ?? null,
          categoryId: category.id,
        };

        // Check if post already exists
        const existing = await tx.post.findUnique({ where: { slug: p.slug } });

        const post = existing
          ? await tx.post.update({
              where: { id: existing.id },
              data: { ...postData, updatedAt: new Date() },
            })
          : await tx.post.create({ data: postData });

        // Sync tags: delete existing and create new ones
        await tx.postTag.deleteMany({ where: { postId: post.id } });
        
        // Use createMany for better performance and to avoid transaction timeout
        if (tagRows.length > 0) {
          await tx.postTag.createMany({
            data: tagRows.map((tag) => ({
              postId: post.id,
              tagId: tag.id,
            })),
          });
        }

        return existing ? "updated" : "created";
      });

      // Update counters
      if (res === "created") {
        created++;
      } else {
        updated++;
      }

      results.push({ slug: p.slug, status: res });
    } catch (error: any) {
      failed++;
      results.push({
        slug: p.slug,
        status: "failed",
        message: error?.message ?? "Unknown error occurred",
      });

      // Log error for debugging
      console.error(`Failed to process post "${p.slug}":`, error);
    }
  }

  // 5. Return summary response
  return NextResponse.json({
    success: true,
    created,
    updated,
    failed,
    total: posts.length,
    results,
  });
}

/**
 * GET /api/admin/posts/create
 *
 * Get all posts with pagination and filtering
 *
 * Query Parameters:
 * - page: Page number (default: 1)
 * - limit: Posts per page (default: 10, max: 100)
 * - published: Filter by published status (true/false)
 * - featured: Filter by featured status (true/false)
 * - category: Filter by category slug
 * - search: Search in title and description
 *
 * Headers:
 * - x-api-key: Required API key for authentication
 *
 * Returns:
 * - 200: Paginated list of posts
 * - 401: Unauthorized
 */
export async function GET(req: Request) {
  // Authenticate
  const apiKey = req.headers.get("x-api-key");
  if (!apiKey || apiKey !== process.env.POSTS_UPLOAD_API_KEY) {
    return NextResponse.json(
      { error: "Unauthorized", message: "Invalid or missing x-api-key header" },
      { status: 401 }
    );
  }

  try {
    // Parse query parameters
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = Math.min(parseInt(searchParams.get("limit") || "10"), 100);
    const published = searchParams.get("published");
    const featured = searchParams.get("featured");
    const categorySlug = searchParams.get("category");
    const search = searchParams.get("search");

    // Build where clause
    const where: any = {};

    if (published !== null) {
      where.published = published === "true";
    }

    if (featured !== null) {
      where.featured = featured === "true";
    }

    if (categorySlug) {
      where.category = { slug: categorySlug };
    }

    if (search) {
      where.OR = [
        { title: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
      ];
    }

    // Get total count
    const total = await prisma.post.count({ where });

    // Get posts
    const posts = await prisma.post.findMany({
      where,
      include: {
        category: true,
        tags: {
          include: {
            tag: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
    });

    // Transform response
    const transformedPosts = posts.map((post) => ({
      id: post.id,
      slug: post.slug,
      title: post.title,
      description: post.description,
      excerpt: post.excerpt,
      author: post.author,
      readingTime: post.readingTime,
      published: post.published,
      featured: post.featured,
      publishedAt: post.publishedAt?.toISOString() || null,
      scheduledFor: post.scheduledFor?.toISOString() || null,
      createdAt: post.createdAt.toISOString(),
      updatedAt: post.updatedAt.toISOString(),
      category: {
        id: post.category.id,
        slug: post.category.slug,
        name: post.category.name,
      },
      tags: post.tags.map((pt) => ({
        id: pt.tag.id,
        slug: pt.tag.slug,
        name: pt.tag.name,
      })),
      keywords: JSON.parse(post.keywords),
      featuredImage: post.featuredImage,
      featuredImageAlt: post.featuredImageAlt,
    }));

    return NextResponse.json({
      success: true,
      posts: transformedPosts,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        hasNext: page * limit < total,
        hasPrev: page > 1,
      },
    });
  } catch (error: any) {
    console.error("Error fetching posts:", error);
    return NextResponse.json(
      {
        error: "Internal server error",
        message: error?.message || "Unknown error",
      },
      { status: 500 }
    );
  }
}

export async function PUT() {
  return NextResponse.json(
    { error: "Method not allowed", message: "Only POST requests are accepted" },
    { status: 405 }
  );
}

export async function DELETE() {
  return NextResponse.json(
    { error: "Method not allowed", message: "Only POST requests are accepted" },
    { status: 405 }
  );
}

export async function PATCH() {
  return NextResponse.json(
    { error: "Method not allowed", message: "Only POST requests are accepted" },
    { status: 405 }
  );
}
