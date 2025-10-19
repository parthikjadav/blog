import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { PostInputZ } from '@/lib/validation/posts-upload'

/**
 * Authenticate request with x-api-key header
 */
function authenticate(req: Request): boolean {
  const apiKey = req.headers.get('x-api-key')
  return apiKey === process.env.POSTS_UPLOAD_API_KEY
}

/**
 * GET /api/admin/posts/[slug]
 * 
 * Get a single post by slug
 * 
 * Headers:
 * - x-api-key: Required API key for authentication
 * 
 * Returns:
 * - 200: Post object with all fields
 * - 401: Unauthorized
 * - 404: Post not found
 */
export async function GET(
  req: Request,
  { params }: { params: { slug: string } }
) {
  // Authenticate
  if (!authenticate(req)) {
    return NextResponse.json(
      { error: 'Unauthorized', message: 'Invalid or missing x-api-key header' },
      { status: 401 }
    )
  }

  try {
    const post = await prisma.post.findUnique({
      where: { slug: params.slug },
      include: {
        category: true,
        tags: {
          include: {
            tag: true
          }
        }
      }
    })

    if (!post) {
      return NextResponse.json(
        { error: 'Not found', message: `Post with slug "${params.slug}" not found` },
        { status: 404 }
      )
    }

    // Transform response to match API format
    const response = {
      id: post.id,
      slug: post.slug,
      title: post.title,
      description: post.description,
      content: post.content,
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
        name: post.category.name
      },
      tags: post.tags.map(pt => ({
        id: pt.tag.id,
        slug: pt.tag.slug,
        name: pt.tag.name
      })),
      keywords: JSON.parse(post.keywords),
      featuredImage: post.featuredImage,
      featuredImageAlt: post.featuredImageAlt
    }

    return NextResponse.json(response)
  } catch (error: any) {
    console.error('Error fetching post:', error)
    return NextResponse.json(
      { error: 'Internal server error', message: error?.message || 'Unknown error' },
      { status: 500 }
    )
  }
}

/**
 * PUT /api/admin/posts/[slug]
 * 
 * Update a post by slug
 * 
 * Headers:
 * - x-api-key: Required API key for authentication
 * - Content-Type: application/json
 * 
 * Body: PostInput object (without slug, as it's in the URL)
 * 
 * Returns:
 * - 200: Updated post
 * - 400: Validation error
 * - 401: Unauthorized
 * - 404: Post not found
 */
export async function PUT(
  req: Request,
  { params }: { params: { slug: string } }
) {
  // Authenticate
  if (!authenticate(req)) {
    return NextResponse.json(
      { error: 'Unauthorized', message: 'Invalid or missing x-api-key header' },
      { status: 401 }
    )
  }

  // Parse JSON body
  let json: unknown
  try {
    json = await req.json()
  } catch (error) {
    return NextResponse.json(
      { error: 'Invalid JSON', message: 'Request body must be valid JSON' },
      { status: 400 }
    )
  }

  // Add slug from URL to the data for validation
  const dataWithSlug = { ...json as any, slug: params.slug }

  // Validate with Zod
  const parsed = PostInputZ.safeParse(dataWithSlug)
  if (!parsed.success) {
    return NextResponse.json(
      { 
        error: 'Validation failed',
        issues: parsed.error.issues.map(issue => ({
          path: issue.path.join('.'),
          message: issue.message,
          code: issue.code
        }))
      },
      { status: 400 }
    )
  }

  const p = parsed.data

  try {
    // Check if post exists
    const existing = await prisma.post.findUnique({ where: { slug: params.slug } })
    
    if (!existing) {
      return NextResponse.json(
        { error: 'Not found', message: `Post with slug "${params.slug}" not found` },
        { status: 404 }
      )
    }

    // Update post in transaction
    const updatedPost = await prisma.$transaction(async (tx) => {
      // Ensure category exists
      const category = await tx.category.upsert({
        where: { slug: p.categorySlug },
        update: {},
        create: { 
          slug: p.categorySlug, 
          name: p.categorySlug.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' '),
          createdAt: new Date() 
        },
      })

      // Ensure all tags exist
      const tagRows: Array<{ id: string; slug: string }> = []
      for (const tagSlug of p.tags) {
        const tag = await tx.tag.upsert({ 
          where: { slug: tagSlug }, 
          update: {}, 
          create: { 
            slug: tagSlug, 
            name: tagSlug.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' '),
            createdAt: new Date() 
          } 
        })
        tagRows.push(tag)
      }

      // Compute publishedAt
      const publishedAt = p.published 
        ? (p.publishedAt ? new Date(p.publishedAt) : new Date())
        : null

      // Update post
      const post = await tx.post.update({
        where: { id: existing.id },
        data: {
          title: p.title,
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
          updatedAt: new Date()
        }
      })

      // Sync tags
      await tx.postTag.deleteMany({ where: { postId: post.id } })
      for (const tag of tagRows) {
        await tx.postTag.create({ 
          data: { 
            postId: post.id, 
            tagId: tag.id 
          } 
        })
      }

      return post
    })

    return NextResponse.json({
      success: true,
      message: 'Post updated successfully',
      post: {
        id: updatedPost.id,
        slug: updatedPost.slug,
        title: updatedPost.title
      }
    })
  } catch (error: any) {
    console.error('Error updating post:', error)
    return NextResponse.json(
      { error: 'Internal server error', message: error?.message || 'Unknown error' },
      { status: 500 }
    )
  }
}

/**
 * DELETE /api/admin/posts/[slug]
 * 
 * Delete a post by slug
 * 
 * Headers:
 * - x-api-key: Required API key for authentication
 * 
 * Returns:
 * - 200: Success message
 * - 401: Unauthorized
 * - 404: Post not found
 */
export async function DELETE(
  req: Request,
  { params }: { params: { slug: string } }
) {
  // Authenticate
  if (!authenticate(req)) {
    return NextResponse.json(
      { error: 'Unauthorized', message: 'Invalid or missing x-api-key header' },
      { status: 401 }
    )
  }

  try {
    // Check if post exists
    const existing = await prisma.post.findUnique({ where: { slug: params.slug } })
    
    if (!existing) {
      return NextResponse.json(
        { error: 'Not found', message: `Post with slug "${params.slug}" not found` },
        { status: 404 }
      )
    }

    // Delete post (cascade will delete PostTag relations)
    await prisma.post.delete({
      where: { id: existing.id }
    })

    return NextResponse.json({
      success: true,
      message: `Post "${params.slug}" deleted successfully`,
      deletedPost: {
        id: existing.id,
        slug: existing.slug,
        title: existing.title
      }
    })
  } catch (error: any) {
    console.error('Error deleting post:', error)
    return NextResponse.json(
      { error: 'Internal server error', message: error?.message || 'Unknown error' },
      { status: 500 }
    )
  }
}
