# Phase 7: Posts Upload API (Protected, Zod-validated)

**Goal**: Build a secure API endpoint to bulk-upload posts into PostgreSQL. The API accepts an array of post objects, validates them with Zod, and requires an `x-api-key` header (configured via environment variable).

**Estimated Duration**: 3–4 hours  
**Priority**: High  
**Risk**: Medium (data integrity and idempotency)

---

## Executive Summary

Create a POST-only endpoint at `POST /api/admin/posts/create` that:
- Validates a JSON array of posts with Zod
- Authenticates requests using `x-api-key` header (`POSTS_UPLOAD_API_KEY`)
- Upserts posts by `slug` with relations to `Category` and `Tag`
- Returns a summary: created, updated, and error details

---

## Requirements

- **Runtime**: Next.js 15 App Router
- **ORM**: Prisma (PostgreSQL)
- **Validation**: Zod
- **Auth**: `x-api-key` header, value equals `process.env.POSTS_UPLOAD_API_KEY`
- **Body**: array of post objects (no wrapper object)

---

## API Contract

- **Method**: POST
- **Path**: `/api/admin/posts/create`
- **Headers**:
  - `Content-Type: application/json`
  - `x-api-key: <string>` (required)
- **Body**: `PostInput[]` (array of posts)
- **Responses**:
  - 200 OK: `{ created: number, updated: number, failed: number, results: Array<{ slug: string, status: 'created'|'updated'|'failed', message?: string }> }`
  - 400 Bad Request: invalid payload (Zod errors in `issues`)
  - 401 Unauthorized: missing/invalid `x-api-key`
  - 405 Method Not Allowed: for non-POST methods

---

## Zod Schemas

```ts
import { z } from 'zod'

export const PostInputZ = z.object({
  slug: z.string().min(1).max(100).regex(/^[a-z0-9-]+$/),
  title: z.string().min(1).max(150),
  description: z.string().min(1).max(300),
  content: z.string().min(1),
  excerpt: z.string().max(300).optional(),

  author: z.string().min(1).max(100),
  readingTime: z.number().int().min(0).max(3600),

  published: z.boolean().default(false),
  featured: z.boolean().default(false),
  publishedAt: z.string().datetime().optional(),
  scheduledFor: z.string().datetime().optional(),

  categorySlug: z.string().min(1).max(60),
  tags: z.array(z.string().min(1).max(60)).max(30).default([]),
  keywords: z.array(z.string().min(1).max(40)).max(40).default([]),

  featuredImage: z.string().url().optional(),
  featuredImageAlt: z.string().max(160).optional(),
})

export const BulkPostsZ = z.array(PostInputZ).min(1)
```

Notes:
- `keywords` is an array in input; we persist as `Post.keywords` stringified JSON (existing schema).
- `tags` are tag slugs; we upsert Tag records and create `PostTag` links.
- `categorySlug` must resolve to a `Category`; create if not exists.
- If `published` is true and `publishedAt` is absent, set `publishedAt = now()` server-side.

---

## Implementation Plan

### 7.1 Routing and Security
- **Create** `app/api/admin/posts/create/route.ts`
- Accept only POST; return 405 otherwise
- Read `x-api-key`; compare against `process.env.POSTS_UPLOAD_API_KEY`
- Reject with 401 if missing/invalid

### 7.2 Validation and Parsing
- Parse `await request.json()`
- Validate with `BulkPostsZ.safeParse(payload)`
- On error: 400 with `{ issues }`

### 7.3 Persistence Strategy (Idempotent Upsert)
- For each post (process sequentially to simplify error handling):
  1. Ensure `Category` by `categorySlug` (create if missing)
  2. Ensure all `Tag` rows by slug (create missing)
  3. Upsert `Post` by `slug`
     - On create: set base fields, connect `category`
     - On update: update base fields, ensure `category`
  4. Sync tags relations for this post
     - Easiest: delete existing `PostTag` for post, recreate from incoming tag list
  5. Compute `publishedAt` if `published` and not provided
  6. Persist `keywords` as JSON string: `JSON.stringify(keywords)`
- Use a `$transaction` per post to maintain consistency
- Collect a per-item result `{ slug, status, message? }`

### 7.4 Response Summary
- Aggregate counts: `created`, `updated`, `failed`
- Return results array for transparency

### 7.5 Operational Concerns
- Add basic size protection (document): keep payload < ~1–2 MB
- Add simple rate limiting (optional future step)
- Add structured logging for errors

---

## Example Handler (outline)

```ts
// app/api/admin/posts/create/route.ts
import { NextResponse } from 'next/server'
import { z } from 'zod'
import { PostInputZ, BulkPostsZ } from '@/lib/validation/posts-upload' // place schema here
import { prisma } from '@/lib/db' // singleton client

export async function POST(req: Request) {
  const apiKey = req.headers.get('x-api-key')
  if (!apiKey || apiKey !== process.env.POSTS_UPLOAD_API_KEY) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  let json
  try {
    json = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const parsed = BulkPostsZ.safeParse(json)
  if (!parsed.success) {
    return NextResponse.json({ issues: parsed.error.issues }, { status: 400 })
  }

  const posts = parsed.data
  const results: Array<{ slug: string; status: 'created'|'updated'|'failed'; message?: string }> = []
  let created = 0, updated = 0, failed = 0

  for (const p of posts) {
    try {
      const res = await prisma.$transaction(async (tx) => {
        // ensure category
        const category = await tx.category.upsert({
          where: { slug: p.categorySlug },
          update: {},
          create: { slug: p.categorySlug, name: p.categorySlug, createdAt: new Date() },
        })

        // ensure tags
        const tagRows = [] as { id: string; slug: string }[]
        for (const t of p.tags) {
          const tag = await tx.tag.upsert({ where: { slug: t }, update: {}, create: { slug: t, name: t, createdAt: new Date() } })
          tagRows.push(tag)
        }

        // upsert post
        const base = {
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
          publishedAt: p.published ? new Date(p.publishedAt ?? Date.now()) : null,
          keywords: JSON.stringify(p.keywords ?? []),
          featuredImage: p.featuredImage ?? null,
          featuredImageAlt: p.featuredImageAlt ?? null,
          category: { connect: { id: category.id } },
        }

        const existing = await tx.post.findUnique({ where: { slug: p.slug } })
        const post = existing
          ? await tx.post.update({ where: { id: existing.id }, data: base })
          : await tx.post.create({ data: base })

        // reset and create new PostTag links
        await tx.postTag.deleteMany({ where: { postId: post.id } })
        for (const tr of tagRows) {
          await tx.postTag.create({ data: { postId: post.id, tagId: tr.id } })
        }

        return existing ? 'updated' : 'created'
      })

      if (res === 'created') { created++ } else { updated++ }
      results.push({ slug: p.slug, status: res })
    } catch (e: any) {
      failed++
      results.push({ slug: p.slug, status: 'failed', message: e?.message ?? 'unknown error' })
    }
  }

  return NextResponse.json({ created, updated, failed, results })
}
```

Note: The above shows the design. Actual implementation will be done in the app codebase during execution of this phase.

---

## Folder and Files To Add

- `app/api/admin/posts/create/route.ts` (handler)
- `lib/validation/posts-upload.ts` (Zod schemas)
- Optional: `lib/db.ts` (Prisma singleton) if not present
- Tests: `tests/integration/api/posts-upload.test.ts`

---

## Environment Variables

- Add to `.env` (and deployment environment):
  - `POSTS_UPLOAD_API_KEY="<strong-random-secret>"`
- Add to `ENV-TEMPLATE.md` with a placeholder and docs

Security notes:
- Keep the key out of Git
- Rotate if leaked; support multiple keys in future if needed

---

## Testing Plan

### Unit Tests (Zod)
- `PostInputZ` accepts valid post
- rejects: bad slug, missing title, empty content, invalid dates
- default handling: booleans, arrays, limits

### Integration Tests (API)
- 401 for missing/invalid `x-api-key`
- 400 for invalid payload (schema issues)
- 200 happy path: created entries
- 200 idempotent update when same slug uploaded again
- Tag sync: removes stale tags, adds new
- Category auto-create and link
- Mixed batch: some success, some failed, verify counts

### Performance
- Handle batches up to ~100 posts in <10s target (sequential by default)

### Test Setup
- Use Prisma with test database (`TEST_DATABASE_URL` if configured)
- Clean tables before each test: `postTag`, `post`, `tag`, `category`

---

## Rollout Steps

1. Add env var `POSTS_UPLOAD_API_KEY` locally and in hosting environment
2. Implement handler and schemas
3. Run: `npx prisma generate`
4. Run tests: `npm run test:run`
5. Deploy
6. Smoke test with curl/Postman

---

## Sample Request

```bash
curl -X POST "http://localhost:3000/api/admin/posts/create" \
  -H "Content-Type: application/json" \
  -H "x-api-key: $POSTS_UPLOAD_API_KEY" \
  -d '[{
    "slug": "my-first-post",
    "title": "My First Post",
    "description": "Intro post",
    "content": "# Hello world",
    "author": "Admin",
    "readingTime": 3,
    "published": true,
    "categorySlug": "general",
    "tags": ["intro", "hello"],
    "keywords": ["hello", "world"]
  }]'
```

---

## Acceptance Criteria

- **Auth**: Requests without correct `x-api-key` are rejected with 401
- **Validation**: Malformed payload returns 400 with Zod issues
- **Upsert**: Re-sending a post with same `slug` updates fields and relations
- **Relations**: Category/Tags created on demand; tags fully synced
- **Response**: Returns counts and per-item status
- **Tests**: Unit + integration tests added and passing

---

**Status**: Ready to implement
