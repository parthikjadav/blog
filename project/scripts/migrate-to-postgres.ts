/**
 * Complete migration script from SQLite to PostgreSQL
 * 
 * This script:
 * 1. Exports data from SQLite
 * 2. Imports data to PostgreSQL
 * 3. Verifies the migration
 */

import { PrismaClient } from '@prisma/client'
import fs from 'fs'
import path from 'path'

// SQLite connection
const sqlitePrisma = new PrismaClient({
  datasources: {
    db: {
      url: 'file:./prisma/dev.db'
    }
  }
})

// PostgreSQL connection (uses DATABASE_URL from .env)
const postgresPrisma = new PrismaClient()

async function exportFromSQLite() {
  console.log('📦 Step 1: Exporting data from SQLite...\n')
  
  try {
    const categories = await sqlitePrisma.category.findMany({
      include: { posts: true }
    })
    
    const tags = await sqlitePrisma.tag.findMany({
      include: { posts: true }
    })
    
    const posts = await sqlitePrisma.post.findMany({
      include: {
        category: true,
        tags: {
          include: { tag: true }
        }
      }
    })
    
    const data = {
      categories,
      tags,
      posts,
      exportedAt: new Date().toISOString(),
      metadata: {
        totalCategories: categories.length,
        totalTags: tags.length,
        totalPosts: posts.length
      }
    }
    
    const exportPath = path.join(process.cwd(), 'data-export.json')
    fs.writeFileSync(exportPath, JSON.stringify(data, null, 2))
    
    console.log(`✅ Data exported to ${exportPath}`)
    console.log(`   - ${categories.length} categories`)
    console.log(`   - ${tags.length} tags`)
    console.log(`   - ${posts.length} posts\n`)
    
    return data
  } catch (error) {
    console.error('❌ SQLite export failed:', error)
    throw error
  } finally {
    await sqlitePrisma.$disconnect()
  }
}

async function importToPostgreSQL(data: any) {
  console.log('📥 Step 2: Importing data to PostgreSQL...\n')
  
  try {
    // Import categories
    console.log('1️⃣ Importing categories...')
    for (const category of data.categories) {
      await postgresPrisma.category.create({
        data: {
          id: category.id,
          name: category.name,
          slug: category.slug,
          description: category.description,
          createdAt: new Date(category.createdAt)
        }
      })
    }
    console.log(`✅ Imported ${data.categories.length} categories\n`)
    
    // Import tags
    console.log('2️⃣ Importing tags...')
    for (const tag of data.tags) {
      await postgresPrisma.tag.create({
        data: {
          id: tag.id,
          name: tag.name,
          slug: tag.slug,
          createdAt: new Date(tag.createdAt)
        }
      })
    }
    console.log(`✅ Imported ${data.tags.length} tags\n`)
    
    // Import posts
    console.log('3️⃣ Importing posts...')
    for (const post of data.posts) {
      await postgresPrisma.post.create({
        data: {
          id: post.id,
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
              id: pt.id,
              tag: { connect: { id: pt.tagId } }
            }))
          }
        }
      })
    }
    console.log(`✅ Imported ${data.posts.length} posts\n`)
    
  } catch (error) {
    console.error('❌ PostgreSQL import failed:', error)
    throw error
  }
}

async function verifyMigration(data: any) {
  console.log('🔍 Step 3: Verifying migration...\n')
  
  try {
    const verifyCategories = await postgresPrisma.category.count()
    const verifyTags = await postgresPrisma.tag.count()
    const verifyPosts = await postgresPrisma.post.count()
    const verifyPostTags = await postgresPrisma.postTag.count()
    
    console.log('📊 Verification Results:')
    console.log(`   Categories: ${verifyCategories} (expected: ${data.metadata.totalCategories}) ${verifyCategories === data.metadata.totalCategories ? '✅' : '❌'}`)
    console.log(`   Tags: ${verifyTags} (expected: ${data.metadata.totalTags}) ${verifyTags === data.metadata.totalTags ? '✅' : '❌'}`)
    console.log(`   Posts: ${verifyPosts} (expected: ${data.metadata.totalPosts}) ${verifyPosts === data.metadata.totalPosts ? '✅' : '❌'}`)
    console.log(`   Post-Tag Relations: ${verifyPostTags}\n`)
    
    if (verifyCategories === data.metadata.totalCategories &&
        verifyTags === data.metadata.totalTags &&
        verifyPosts === data.metadata.totalPosts) {
      console.log('🎉 Migration completed successfully!\n')
      console.log('✅ All data has been migrated from SQLite to PostgreSQL')
      console.log('✅ Data integrity verified')
      console.log('\n📝 Next steps:')
      console.log('   1. Run tests: npm run test:run')
      console.log('   2. Start dev server: npm run dev')
      console.log('   3. Verify application functionality')
      console.log('   4. Backup SQLite database: prisma/dev.db')
      return true
    } else {
      console.warn('\n⚠️ Migration complete but counts do not match!')
      console.warn('Please verify manually using: npx prisma studio')
      return false
    }
    
  } catch (error) {
    console.error('❌ Verification failed:', error)
    throw error
  }
}

async function migrate() {
  console.log('🚀 Starting SQLite to PostgreSQL Migration\n')
  console.log('=' .repeat(50) + '\n')
  
  try {
    // Step 1: Export from SQLite
    const data = await exportFromSQLite()
    
    // Step 2: Import to PostgreSQL
    await importToPostgreSQL(data)
    
    // Step 3: Verify
    const success = await verifyMigration(data)
    
    if (success) {
      console.log('\n' + '='.repeat(50))
      console.log('✅ MIGRATION SUCCESSFUL')
      console.log('='.repeat(50) + '\n')
    } else {
      console.log('\n' + '='.repeat(50))
      console.log('⚠️ MIGRATION COMPLETED WITH WARNINGS')
      console.log('='.repeat(50) + '\n')
    }
    
  } catch (error) {
    console.error('\n' + '='.repeat(50))
    console.error('❌ MIGRATION FAILED')
    console.error('='.repeat(50))
    console.error('\nError:', error)
    console.error('\n💡 Rollback instructions:')
    console.error('   1. Restore schema.prisma from git')
    console.error('   2. Restore .env from backup')
    console.error('   3. Run: npx prisma generate')
    process.exit(1)
  } finally {
    await postgresPrisma.$disconnect()
  }
}

migrate()
