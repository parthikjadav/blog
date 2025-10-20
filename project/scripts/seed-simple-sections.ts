import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seeding learning content with sections...\n')

  // Delete existing data
  await prisma.lesson.deleteMany()
  await prisma.section.deleteMany()
  await prisma.topic.deleteMany()

  // Create HTML Topic (will have sections)
  const htmlTopic = await prisma.topic.create({
    data: {
      slug: 'html',
      title: 'HTML Tutorial',
      description: 'Learn HTML from basics to advanced',
      icon: 'Code',
      order: 1,
      published: true
    }
  })

  // Create standalone lesson for HTML
  await prisma.lesson.create({
    data: {
      slug: 'introduction',
      title: 'HTML Introduction',
      description: 'What is HTML and why learn it?',
      content: '# HTML Introduction\n\nHTML is the standard markup language for Web pages.',
      order: 1,
      duration: 5,
      published: true,
      topicId: htmlTopic.id
    }
  })

  // Create HTML Basics Section
  const basicsSection = await prisma.section.create({
    data: {
      slug: 'basics',
      title: 'HTML Basics',
      description: 'Core HTML concepts',
      order: 1,
      published: true,
      topicId: htmlTopic.id
    }
  })

  await prisma.lesson.createMany({
    data: [
      {
        slug: 'elements',
        title: 'HTML Elements',
        description: 'Understanding HTML elements',
        content: '# HTML Elements\n\nAn HTML element is defined by a start tag.',
        order: 1,
        duration: 8,
        published: true,
        topicId: htmlTopic.id,
        sectionId: basicsSection.id
      },
      {
        slug: 'attributes',
        title: 'HTML Attributes',
        description: 'Learn about HTML attributes',
        content: '# HTML Attributes\n\nHTML attributes provide additional information.',
        order: 2,
        duration: 10,
        published: true,
        topicId: htmlTopic.id,
        sectionId: basicsSection.id
      }
    ]
  })

  // Create HTML Colors Section
  const colorsSection = await prisma.section.create({
    data: {
      slug: 'colors',
      title: 'HTML Colors',
      description: 'Working with colors in HTML',
      order: 2,
      published: true,
      topicId: htmlTopic.id
    }
  })

  await prisma.lesson.createMany({
    data: [
      {
        slug: 'colors-intro',
        title: 'Colors',
        description: 'Introduction to HTML colors',
        content: '# HTML Colors\n\nHTML colors are specified with predefined color names.',
        order: 1,
        duration: 6,
        published: true,
        topicId: htmlTopic.id,
        sectionId: colorsSection.id
      },
      {
        slug: 'rgb',
        title: 'RGB',
        description: 'RGB color values',
        content: '# RGB Colors\n\nAn RGB color value represents RED, GREEN, and BLUE.',
        order: 2,
        duration: 7,
        published: true,
        topicId: htmlTopic.id,
        sectionId: colorsSection.id
      },
      {
        slug: 'hex',
        title: 'HEX',
        description: 'HEX color values',
        content: '# HEX Colors\n\nA hexadecimal color is specified with: #RRGGBB.',
        order: 3,
        duration: 7,
        published: true,
        topicId: htmlTopic.id,
        sectionId: colorsSection.id
      },
      {
        slug: 'hsl',
        title: 'HSL',
        description: 'HSL color values',
        content: '# HSL Colors\n\nHSL stands for Hue, Saturation, and Lightness.',
        order: 4,
        duration: 7,
        published: true,
        topicId: htmlTopic.id,
        sectionId: colorsSection.id
      }
    ]
  })

  // Create CSS Topic (simple structure - no sections)
  const cssTopic = await prisma.topic.create({
    data: {
      slug: 'css',
      title: 'CSS Tutorial',
      description: 'Learn CSS styling from scratch',
      icon: 'Palette',
      order: 2,
      published: true
    }
  })

  await prisma.lesson.createMany({
    data: [
      {
        slug: 'introduction',
        title: 'CSS Introduction',
        description: 'What is CSS?',
        content: '# CSS Introduction\n\nCSS is the language we use to style an HTML document.',
        order: 1,
        duration: 5,
        published: true,
        topicId: cssTopic.id
      },
      {
        slug: 'selectors',
        title: 'CSS Selectors',
        description: 'Understanding CSS selectors',
        content: '# CSS Selectors\n\nCSS selectors are used to select HTML elements.',
        order: 2,
        duration: 12,
        published: true,
        topicId: cssTopic.id
      },
      {
        slug: 'colors',
        title: 'CSS Colors',
        description: 'Working with colors',
        content: '# CSS Colors\n\nColors in CSS can be specified in various ways.',
        order: 3,
        duration: 8,
        published: true,
        topicId: cssTopic.id
      }
    ]
  })

  console.log('✅ Seeded successfully!')
  console.log(`   - HTML Tutorial: 1 standalone + 2 sections (6 lessons)`)
  console.log(`   - CSS Tutorial: 3 lessons (simple structure)`)
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
