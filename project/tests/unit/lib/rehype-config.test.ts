import { describe, it, expect } from 'vitest'
import { rehypePlugins } from '@/lib/rehype-config'

describe('rehypePlugins', () => {
  it('should be an array', () => {
    expect(Array.isArray(rehypePlugins)).toBe(true)
  })

  it('should contain plugins', () => {
    expect(rehypePlugins.length).toBeGreaterThan(0)
  })

  it('should have at least 2 plugins', () => {
    // rehype-slug, rehype-autolink-headings (or similar)
    expect(rehypePlugins.length).toBeGreaterThanOrEqual(2)
  })

  it('should export valid plugin configuration', () => {
    rehypePlugins.forEach(plugin => {
      expect(plugin).toBeDefined()
    })
  })
})
