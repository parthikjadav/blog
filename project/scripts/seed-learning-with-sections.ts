import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seeding learning content with sections...\n')

  // Delete existing data
  await prisma.lesson.deleteMany()
  await prisma.section.deleteMany()
  await prisma.topic.deleteMany()

  // Create HTML Topic with Sections (Nested Structure)
  const htmlTopic = await prisma.topic.create({
    data: {
      slug: 'html',
      title: 'HTML Tutorial',
      description: 'Learn HTML from basics to advanced with organized sections',
      icon: 'Code',
      order: 1,
      published: true,
      // Standalone lessons (shown before sections)
      lessons: {
        create: [
          {
            slug: 'introduction',
            title: 'HTML Introduction',
            description: 'What is HTML and why learn it?',
            content: `# HTML Introduction

HTML is the standard markup language for Web pages.

## What is HTML?

- HTML stands for **Hyper Text Markup Language**
- HTML is the standard markup language for creating Web pages
- HTML describes the structure of a Web page

\`\`\`html
<!DOCTYPE html>
<html>
<head>
  <title>Page Title</title>
</head>
<body>
  <h1>My First Heading</h1>
  <p>My first paragraph.</p>
</body>
</html>
\`\`\``,
            order: 1,
            duration: 5,
            published: true
          }
        ]
      },
      // Sections with nested lessons
      sections: {
        create: [
          {
            slug: 'basics',
            title: 'HTML Basics',
            description: 'Core HTML concepts',
            order: 1,
            published: true,
            lessons: {
              create: [
                {
                  slug: 'elements',
                  title: 'HTML Elements',
                  description: 'Understanding HTML elements and tags',
                  content: `# HTML Elements

An HTML element is defined by a start tag, some content, and an end tag.

\`\`\`html
<tagname>Content goes here...</tagname>
\`\`\``,
                  order: 1,
                  duration: 8,
                  published: true,
                  topic: {
                    connect: { slug: 'html' }
                  }
                },
                {
                  slug: 'attributes',
                  title: 'HTML Attributes',
                  description: 'Learn about HTML attributes',
                  content: `# HTML Attributes

HTML attributes provide additional information about HTML elements.

\`\`\`html
<a href="https://www.example.com">Visit Example</a>
\`\`\``,
                  order: 2,
                  duration: 10,
                  published: true
                }
              ]
            }
          },
          {
            slug: 'colors',
            title: 'HTML Colors',
            description: 'Working with colors in HTML',
            order: 2,
            published: true,
            lessons: {
              create: [
                {
                  slug: 'colors-intro',
                  title: 'Colors',
                  description: 'Introduction to HTML colors',
                  content: `# HTML Colors

HTML colors are specified with predefined color names, or with RGB, HEX, HSL, RGBA, or HSLA values.`,
                  order: 1,
                  duration: 6,
                  published: true,
                },
                {
                  slug: 'rgb',
                  title: 'RGB',
                  description: 'RGB color values',
                  content: `# RGB Colors

An RGB color value represents RED, GREEN, and BLUE light sources.

\`\`\`css
rgb(255, 0, 0)   /* red */
rgb(0, 255, 0)   /* green */
rgb(0, 0, 255)   /* blue */
\`\`\``,
                  order: 2,
                  duration: 7,
                  published: true,
                },
                {
                  slug: 'hex',
                  title: 'HEX',
                  description: 'HEX color values',
                  content: `# HEX Colors

A hexadecimal color is specified with: #RRGGBB.

\`\`\`css
#ff0000  /* red */
#00ff00  /* green */
#0000ff  /* blue */
\`\`\``,
                  order: 3,
                  duration: 7,
                  published: true,
                },
                {
                  slug: 'hsl',
                  title: 'HSL',
                  description: 'HSL color values',
                  content: `# HSL Colors

HSL stands for Hue, Saturation, and Lightness.

\`\`\`css
hsl(0, 100%, 50%)    /* red */
hsl(120, 100%, 50%)  /* green */
hsl(240, 100%, 50%)  /* blue */
\`\`\``,
                  order: 4,
                  duration: 7,
                  published: true,
                }
              ]
            }
          },
          {
            slug: 'forms',
            title: 'HTML Forms',
            description: 'Creating forms in HTML',
            order: 3,
            published: true,
            lessons: {
              create: [
                {
                  slug: 'forms-intro',
                  title: 'Forms',
                  description: 'Introduction to HTML forms',
                  content: `# HTML Forms

Forms are used to collect user input.

\`\`\`html
<form>
  <input type="text" name="username">
  <input type="submit" value="Submit">
</form>
\`\`\``,
                  order: 1,
                  duration: 12,
                  published: true,
                },
                {
                  slug: 'input-types',
                  title: 'Input Types',
                  description: 'Different input types',
                  content: `# HTML Input Types

HTML has many input types.

\`\`\`html
<input type="text">
<input type="password">
<input type="email">
<input type="number">
\`\`\``,
                  order: 2,
                  duration: 10,
                  published: true,
                }
              ]
            }
          }
        ]
      }
    },
    include: {
      sections: {
        include: {
          lessons: true
        }
      },
      lessons: true
    }
  })

  // Create CSS Topic (Simple Structure - No Sections)
  const cssTopic = await prisma.topic.create({
    data: {
      slug: 'css',
      title: 'CSS Tutorial',
      description: 'Learn CSS styling from scratch',
      icon: 'Palette',
      order: 2,
      published: true,
      lessons: {
        create: [
          {
            slug: 'introduction',
            title: 'CSS Introduction',
            description: 'What is CSS?',
            content: `# CSS Introduction

CSS is the language we use to style an HTML document.

\`\`\`css
body {
  background-color: lightblue;
}
\`\`\``,
            order: 1,
            duration: 5,
            published: true
          },
          {
            slug: 'selectors',
            title: 'CSS Selectors',
            description: 'Understanding CSS selectors',
            content: `# CSS Selectors

CSS selectors are used to select HTML elements.

\`\`\`css
p {
  color: red;
}
\`\`\``,
            order: 2,
            duration: 12,
            published: true
          },
          {
            slug: 'colors',
            title: 'CSS Colors',
            description: 'Working with colors',
            content: `# CSS Colors

Colors in CSS can be specified in various ways.`,
            order: 3,
            duration: 8,
            published: true
          }
        ]
      }
    },
    include: {
      lessons: true,
      sections: true
    }
  })

  // Create JavaScript Topic (Simple Structure)
  const jsTopic = await prisma.topic.create({
    data: {
      slug: 'javascript',
      title: 'JavaScript Tutorial',
      description: 'Learn JavaScript programming fundamentals',
      icon: 'Code2',
      order: 3,
      published: true,
      lessons: {
        create: [
          {
            slug: 'introduction',
            title: 'JavaScript Introduction',
            description: 'What is JavaScript?',
            content: `# JavaScript Introduction

JavaScript is the world's most popular programming language.

\`\`\`javascript
console.log("Hello, World!");
\`\`\``,
            order: 1,
            duration: 7,
            published: true
          }
        ]
      }
    },
    include: {
      lessons: true,
      sections: true
    }
  })

  console.log('✅ Seeded topics:')
  console.log(`   - ${htmlTopic.title}:`)
  console.log(`     • ${htmlTopic.lessons.length} standalone lessons`)
  console.log(`     • ${htmlTopic.sections.length} sections`)
  const htmlTotalLessons = htmlTopic.lessons.length + htmlTopic.sections.reduce((sum, s) => sum + s.lessons.length, 0)
  console.log(`     • ${htmlTotalLessons} total lessons`)
  
  console.log(`   - ${cssTopic.title}:`)
  console.log(`     • ${cssTopic.lessons.length} lessons (simple structure)`)
  
  console.log(`   - ${jsTopic.title}:`)
  console.log(`     • ${jsTopic.lessons.length} lessons (simple structure)`)
  
  console.log(`\n📊 Total: 3 topics, ${htmlTopic.sections.length} sections`)
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
