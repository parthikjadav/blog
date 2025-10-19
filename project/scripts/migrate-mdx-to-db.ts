import fs from 'fs'
import path from 'path'
import matter from 'gray-matter'
import readingTime from 'reading-time'
import { prisma } from '../lib/prisma'
import { getOrCreateCategory, getOrCreateTag } from '../lib/db'

const postsDirectory = path.join(process.cwd(), 'content/posts')

async function migratePost(filename: string) {
  const slug = filename.replace(/\.mdx$/, '')
  const fullPath = path.join(postsDirectory, filename)
  const fileContents = fs.readFileSync(fullPath, 'utf8')
  const { data, content } = matter(fileContents)
  const { minutes } = readingTime(content)

  console.log(`Migrating: ${slug}`)

  // Get or create category
  const category = await getOrCreateCategory(data.category)

  // Parse published_at date
  const publishedAt = data.published_at ? new Date(data.published_at) : new Date()

  // Create or update post
  const post = await prisma.post.upsert({
    where: { slug },
    update: {
      title: data.title,
      description: data.description,
      content: content,
      published: data.published !== false,
      publishedAt: publishedAt,
      keywords: JSON.stringify(data.keywords || []),
      featuredImage: data.featured_image || null,
      featuredImageAlt: data.featured_image_alt || null,
      author: data.author || 'Fast Tech Team',
      readingTime: data.reading_time || Math.ceil(minutes),
      categoryId: category.id,
    },
    create: {
      slug,
      title: data.title,
      description: data.description,
      content: content,
      published: data.published !== false,
      publishedAt: publishedAt,
      keywords: JSON.stringify(data.keywords || []),
      featuredImage: data.featured_image || null,
      featuredImageAlt: data.featured_image_alt || null,
      author: data.author || 'Fast Tech Team',
      readingTime: data.reading_time || Math.ceil(minutes),
      categoryId: category.id,
    }
  })

  // Handle tags
  if (data.tags && Array.isArray(data.tags)) {
    // Delete existing post-tag relationships
    await prisma.postTag.deleteMany({
      where: { postId: post.id }
    })

    // Create new relationships
    for (const tagName of data.tags) {
      const tag = await getOrCreateTag(tagName)
      await prisma.postTag.create({
        data: {
          postId: post.id,
          tagId: tag.id
        }
      })
    }
  }

  console.log(`✓ Migrated: ${slug}`)
}

async function main() {
  console.log('Starting MDX to Database migration...\n')

  const files = fs.readdirSync(postsDirectory).filter(file => file.endsWith('.mdx'))

  console.log(`Found ${files.length} MDX files to migrate\n`)

  for (const file of files) {
    try {
      await migratePost(file)
    } catch (error) {
      console.error(`✗ Error migrating ${file}:`, error)
    }
  }

  console.log('\n✓ Migration complete!')

  // Print statistics
  const postCount = await prisma.post.count()
  const categoryCount = await prisma.category.count()
  const tagCount = await prisma.tag.count()

  console.log(`\nStatistics:`)
  console.log(`- Posts: ${postCount}`)
  console.log(`- Categories: ${categoryCount}`)
  console.log(`- Tags: ${tagCount}`)
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
