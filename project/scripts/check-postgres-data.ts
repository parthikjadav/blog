import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function checkData() {
  try {
    const categories = await prisma.category.count()
    const tags = await prisma.tag.count()
    const posts = await prisma.post.count()
    
    console.log('📊 PostgreSQL Database Status:')
    console.log(`   Categories: ${categories}`)
    console.log(`   Tags: ${tags}`)
    console.log(`   Posts: ${posts}`)
    
    if (categories === 0 && tags === 0 && posts === 0) {
      console.log('\n⚠️ Database is empty. You need to:')
      console.log('   1. Run the seed script: npm run db:migrate')
      console.log('   2. Or manually add content')
    } else {
      console.log('\n✅ Database has data!')
    }
  } catch (error) {
    console.error('❌ Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

checkData()
