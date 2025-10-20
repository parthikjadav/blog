import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seeding learning content...\n')

  // Create HTML Topic
  const htmlTopic = await prisma.topic.create({
    data: {
      slug: 'html',
      title: 'HTML Tutorial',
      description: 'Learn HTML from basics to advanced',
      icon: 'Code',
      order: 1,
      published: true,
      lessons: {
        create: [
          {
            slug: 'introduction',
            title: 'HTML Introduction',
            description: 'What is HTML and why learn it?',
            content: `# HTML Introduction

HTML is the standard markup language for Web pages.

With HTML you can create your own Website.

HTML is easy to learn - You will enjoy it!

## What is HTML?

- HTML stands for **Hyper Text Markup Language**
- HTML is the standard markup language for creating Web pages
- HTML describes the structure of a Web page
- HTML consists of a series of elements
- HTML elements tell the browser how to display the content

## Why Learn HTML?

HTML is the foundation of all web pages. Without HTML, you wouldn't be able to organize text or add images or videos to your web pages. HTML is the beginning of everything you need to know to create engaging web pages!

## Example

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
          },
          {
            slug: 'elements',
            title: 'HTML Elements',
            description: 'Understanding HTML elements and tags',
            content: `# HTML Elements

An HTML element is defined by a start tag, some content, and an end tag.

## Syntax

\`\`\`html
<tagname>Content goes here...</tagname>
\`\`\`

The HTML **element** is everything from the start tag to the end tag.

## Examples

\`\`\`html
<h1>My First Heading</h1>
<p>My first paragraph.</p>
\`\`\`

## Nested HTML Elements

HTML elements can be nested (elements can contain elements).

All HTML documents consist of nested HTML elements.

\`\`\`html
<!DOCTYPE html>
<html>
<body>
  <h1>My First Heading</h1>
  <p>My first paragraph.</p>
</body>
</html>
\`\`\`

## Empty HTML Elements

HTML elements with no content are called empty elements.

\`\`\`html
<br>
<hr>
<img src="image.jpg" alt="Description">
\`\`\``,
            order: 2,
            duration: 8,
            published: true
          },
          {
            slug: 'attributes',
            title: 'HTML Attributes',
            description: 'Learn about HTML attributes',
            content: `# HTML Attributes

HTML attributes provide additional information about HTML elements.

## Key Points

- All HTML elements can have **attributes**
- Attributes provide **additional information** about elements
- Attributes are always specified in the **start tag**
- Attributes usually come in name/value pairs like: **name="value"**

## The href Attribute

The \`<a>\` tag defines a hyperlink. The \`href\` attribute specifies the URL of the page the link goes to:

\`\`\`html
<a href="https://www.example.com">Visit Example</a>
\`\`\`

## The src Attribute

The \`<img>\` tag is used to embed an image in an HTML page. The \`src\` attribute specifies the path to the image to be displayed:

\`\`\`html
<img src="image.jpg" alt="Description">
\`\`\`

## The alt Attribute

The \`alt\` attribute provides alternative text for an image, if the user cannot view it.

\`\`\`html
<img src="image.jpg" alt="A beautiful sunset">
\`\`\`

## The style Attribute

The \`style\` attribute is used to add styles to an element, such as color, font, size, and more.

\`\`\`html
<p style="color:red;">This is a red paragraph.</p>
\`\`\``,
            order: 3,
            duration: 10,
            published: true
          },
          {
            slug: 'headings-and-paragraphs',
            title: 'HTML Headings and Paragraphs - Complete Guide',
            description: 'Learn how to use headings and paragraphs in HTML',
            content: `# HTML Headings and Paragraphs

Headings and paragraphs are fundamental building blocks of HTML documents.

## Headings

HTML headings are defined with \`<h1>\` to \`<h6>\` tags:

\`\`\`html
<h1>This is heading 1</h1>
<h2>This is heading 2</h2>
<h3>This is heading 3</h3>
\`\`\`

## Paragraphs

HTML paragraphs are defined with the \`<p>\` tag:

\`\`\`html
<p>This is a paragraph.</p>
<p>This is another paragraph.</p>
\`\`\``,
            order: 4,
            duration: 6,
            published: true
          },
          {
            slug: 'links-and-images',
            title: 'Working with Links and Images in HTML',
            description: 'Master HTML links and images',
            content: `# Links and Images

Learn how to add links and images to your web pages.

## Links

\`\`\`html
<a href="https://example.com">Click here</a>
\`\`\`

## Images

\`\`\`html
<img src="image.jpg" alt="Description">
\`\`\``,
            order: 5,
            duration: 8,
            published: true
          },
          {
            slug: 'lists',
            title: 'HTML Lists: Ordered, Unordered, and Description Lists',
            description: 'Learn about different types of lists',
            content: `# HTML Lists

HTML supports three types of lists.

## Unordered List

\`\`\`html
<ul>
  <li>Item 1</li>
  <li>Item 2</li>
</ul>
\`\`\`

## Ordered List

\`\`\`html
<ol>
  <li>First</li>
  <li>Second</li>
</ol>
\`\`\``,
            order: 6,
            duration: 7,
            published: true
          },
          {
            slug: 'tables',
            title: 'Creating Tables in HTML',
            description: 'Learn how to create tables',
            content: `# HTML Tables

Tables are used to display data in rows and columns.

\`\`\`html
<table>
  <tr>
    <th>Name</th>
    <th>Age</th>
  </tr>
  <tr>
    <td>John</td>
    <td>25</td>
  </tr>
</table>
\`\`\``,
            order: 7,
            duration: 10,
            published: true
          },
          {
            slug: 'forms',
            title: 'HTML Forms and Input Elements - A Comprehensive Guide',
            description: 'Master HTML forms',
            content: `# HTML Forms

Forms are used to collect user input.

\`\`\`html
<form>
  <input type="text" name="username">
  <input type="submit" value="Submit">
</form>
\`\`\``,
            order: 8,
            duration: 12,
            published: true
          },
          {
            slug: 'semantic-html',
            title: 'Semantic HTML5 Elements',
            description: 'Learn about semantic HTML',
            content: `# Semantic HTML

Semantic elements clearly describe their meaning.

\`\`\`html
<header>Header content</header>
<nav>Navigation</nav>
<main>Main content</main>
<footer>Footer content</footer>
\`\`\``,
            order: 9,
            duration: 9,
            published: true
          },
          {
            slug: 'multimedia',
            title: 'HTML5 Multimedia: Audio, Video, and Embedding Content',
            description: 'Learn about multimedia in HTML5',
            content: `# HTML5 Multimedia

HTML5 supports audio and video elements.

\`\`\`html
<video controls>
  <source src="movie.mp4" type="video/mp4">
</video>

<audio controls>
  <source src="audio.mp3" type="audio/mpeg">
</audio>
\`\`\``,
            order: 10,
            duration: 11,
            published: true
          }
        ]
      }
    },
    include: {
      lessons: true
    }
  })

  // Create CSS Topic
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

CSS describes how HTML elements should be displayed.

## What is CSS?

- CSS stands for **Cascading Style Sheets**
- CSS describes how HTML elements are to be displayed on screen, paper, or in other media
- CSS saves a lot of work. It can control the layout of multiple web pages all at once
- External stylesheets are stored in CSS files

## Why Use CSS?

CSS is used to define styles for your web pages, including the design, layout and variations in display for different devices and screen sizes.

## CSS Syntax

A CSS rule consists of a selector and a declaration block:

\`\`\`css
selector {
  property: value;
  property: value;
}
\`\`\`

## Example

\`\`\`css
body {
  background-color: lightblue;
}

h1 {
  color: white;
  text-align: center;
}

p {
  font-family: verdana;
  font-size: 20px;
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

CSS selectors are used to "find" (or select) the HTML elements you want to style.

## Types of Selectors

We can divide CSS selectors into five categories:

1. **Simple selectors** (select elements based on name, id, class)
2. **Combinator selectors** (select elements based on a specific relationship between them)
3. **Pseudo-class selectors** (select elements based on a certain state)
4. **Pseudo-elements selectors** (select and style a part of an element)
5. **Attribute selectors** (select elements based on an attribute or attribute value)

## Element Selector

The element selector selects HTML elements based on the element name.

\`\`\`css
p {
  text-align: center;
  color: red;
}
\`\`\`

## ID Selector

The id selector uses the id attribute of an HTML element to select a specific element.

\`\`\`css
#para1 {
  text-align: center;
  color: red;
}
\`\`\`

## Class Selector

The class selector selects HTML elements with a specific class attribute.

\`\`\`css
.center {
  text-align: center;
  color: red;
}
\`\`\`

## Universal Selector

The universal selector (*) selects all HTML elements on the page.

\`\`\`css
* {
  text-align: center;
  color: blue;
}
\`\`\``,
            order: 2,
            duration: 12,
            published: true
          }
        ]
      }
    },
    include: {
      lessons: true
    }
  })

  // Create JavaScript Topic
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

JavaScript is the programming language of the Web.

## What is JavaScript?

- JavaScript is a **lightweight, interpreted programming language**
- JavaScript is designed for creating network-centric applications
- JavaScript is complementary to and integrated with HTML
- JavaScript is open and cross-platform

## Why Learn JavaScript?

JavaScript is one of the 3 languages all web developers **must** learn:

1. **HTML** to define the content of web pages
2. **CSS** to specify the layout of web pages
3. **JavaScript** to program the behavior of web pages

## Example

\`\`\`javascript
// Display a message
console.log("Hello, World!");

// Change HTML content
document.getElementById("demo").innerHTML = "Hello JavaScript!";

// Change HTML styles
document.getElementById("demo").style.fontSize = "25px";
\`\`\``,
            order: 1,
            duration: 7,
            published: true
          }
        ]
      }
    },
    include: {
      lessons: true
    }
  })

  console.log('✅ Seeded topics:')
  console.log(`   - ${htmlTopic.title} (${htmlTopic.lessons.length} lessons)`)
  console.log(`   - ${cssTopic.title} (${cssTopic.lessons.length} lessons)`)
  console.log(`   - ${jsTopic.title} (${jsTopic.lessons.length} lessons)`)
  console.log(`\n📊 Total: 3 topics, ${htmlTopic.lessons.length + cssTopic.lessons.length + jsTopic.lessons.length} lessons`)
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
