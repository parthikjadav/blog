import { PrismaClient } from '@prisma/client'
import fs from 'fs'
import path from 'path'

const prisma = new PrismaClient()

async function exportData() {
  console.log('📦 Exporting SQLite data...')
  
  try {
    const categories = await prisma.category.findMany({
      include: { posts: true }
    })
    
    const tags = await prisma.tag.findMany({
      include: { posts: true }
    })
    
    const posts = await prisma.post.findMany({
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
    console.log(`   - ${posts.length} posts`)
    console.log('\n📊 Export Summary:')
    console.log(`   Published posts: ${posts.filter(p => p.published).length}`)
    console.log(`   Featured posts: ${posts.filter(p => p.featured).length}`)
    console.log(`   Scheduled posts: ${posts.filter(p => p.scheduledFor).length}`)
  } catch (error) {
    console.error('❌ Export failed:', error)
    throw error
  }
}

exportData()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
