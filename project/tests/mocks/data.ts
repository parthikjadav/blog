import { BlogPost } from '@/types/blog'

export const mockPost: BlogPost = {
  id: 'test-id-1',
  slug: 'test-post',
  title: 'Test Post Title',
  description: 'Test post description for testing purposes',
  content: '# Test Content\n\nThis is test content for unit testing.',
  published: true,
  publishedAt: new Date('2025-01-01'),
  scheduledFor: null,
  readingTime: 5,
  author: 'Test Author',
  featuredImage: '/images/test.jpg',
  featuredImageAlt: 'Test image alt text',
  keywords: ['test', 'mock', 'unit-testing'],
  category: {
    id: 'cat-1',
    name: 'Test Category',
    slug: 'test-category',
  },
  tags: [
    {
      id: 'tag-1',
      name: 'Test Tag',
      slug: 'test-tag',
    },
    {
      id: 'tag-2',
      name: 'JavaScript',
      slug: 'javascript',
    },
  ],
}

export const mockPost2: BlogPost = {
  ...mockPost,
  id: 'test-id-2',
  slug: 'test-post-2',
  title: 'Test Post 2 Title',
  description: 'Second test post description',
  readingTime: 8,
}

export const mockPosts: BlogPost[] = [mockPost, mockPost2]

export const mockCategory = {
  id: 'cat-1',
  name: 'Test Category',
  slug: 'test-category',
  description: 'Test category description',
  createdAt: new Date('2025-01-01'),
  _count: {
    posts: 2,
  },
}

export const mockTag = {
  name: 'Test Tag',
  slug: 'test-tag',
  count: 5,
}

export const mockTags = [
  mockTag,
  {
    name: 'JavaScript',
    slug: 'javascript',
    count: 10,
  },
  {
    name: 'React',
    slug: 'react',
    count: 8,
  },
]
