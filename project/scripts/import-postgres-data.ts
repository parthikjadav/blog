import { PrismaClient } from '@prisma/client'
import fs from 'fs'
import path from 'path'

const prisma = new PrismaClient()

async function importData() {
  console.log('📥 Importing data to PostgreSQL...')
  
  try {
    const exportPath = path.join(process.cwd(), 'data-export.json')
    
    if (!fs.existsSync(exportPath)) {
      throw new Error(`Export file not found at ${exportPath}. Please run export script first.`)
    }
    
    const data = JSON.parse(fs.readFileSync(exportPath, 'utf-8'))
    
    console.log('\n📊 Import Summary:')
    console.log(`   Exported at: ${data.exportedAt}`)
    console.log(`   Categories to import: ${data.metadata.totalCategories}`)
    console.log(`   Tags to import: ${data.metadata.totalTags}`)
    console.log(`   Posts to import: ${data.metadata.totalPosts}`)
    console.log('\n🔄 Starting import...\n')
    
    // Import categories
    console.log('1️⃣ Importing categories...')
    for (const category of data.categories) {
      await prisma.category.create({
        data: {
          id: category.id, // Keep the same ID
          name: category.name,
          slug: category.slug,
          description: category.description,
          createdAt: new Date(category.createdAt)
        }
      })
    }
    console.log(`✅ Imported ${data.categories.length} categories`)
    
    // Import tags
    console.log('\n2️⃣ Importing tags...')
    for (const tag of data.tags) {
      await prisma.tag.create({
        data: {
          id: tag.id, // Keep the same ID
          name: tag.name,
          slug: tag.slug,
          createdAt: new Date(tag.createdAt)
        }
      })
    }
    console.log(`✅ Imported ${data.tags.length} tags`)
    
    // Import posts
    console.log('\n3️⃣ Importing posts...')
    for (const post of data.posts) {
      await prisma.post.create({
        data: {
          id: post.id, // Keep the same ID
          slug: post.slug,
          title: post.title,
          description: post.description,
          content: post.content,
          excerpt: post.excerpt,
          published: post.published,
          featured: post.featured,
          scheduledFor: post.scheduledFor ? new Date(post.scheduledFor) : null,
          publishedAt: post.publishedAt ? new Date(post.publishedAt) : null,
          keywords: post.keywords,
          featuredImage: post.featuredImage,
          featuredImageAlt: post.featuredImageAlt,
          author: post.author,
          readingTime: post.readingTime,
          createdAt: new Date(post.createdAt),
          updatedAt: new Date(post.updatedAt),
          category: {
            connect: { id: post.categoryId }
          },
          tags: {
            create: post.tags.map((pt: any) => ({
              id: pt.id, // Keep the same ID
              tag: { connect: { id: pt.tagId } }
            }))
          }
        }
      })
    }
    console.log(`✅ Imported ${data.posts.length} posts`)
    
    // Verify import
    console.log('\n🔍 Verifying import...')
    const verifyCategories = await prisma.category.count()
    const verifyTags = await prisma.tag.count()
    const verifyPosts = await prisma.post.count()
    
    console.log(`   Categories: ${verifyCategories} (expected: ${data.metadata.totalCategories})`)
    console.log(`   Tags: ${verifyTags} (expected: ${data.metadata.totalTags})`)
    console.log(`   Posts: ${verifyPosts} (expected: ${data.metadata.totalPosts})`)
    
    if (verifyCategories === data.metadata.totalCategories &&
        verifyTags === data.metadata.totalTags &&
        verifyPosts === data.metadata.totalPosts) {
      console.log('\n🎉 Data import complete and verified!')
    } else {
      console.warn('\n⚠️ Import complete but counts do not match. Please verify manually.')
    }
    
  } catch (error) {
    console.error('❌ Import failed:', error)
    throw error
  }
}

importData()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
