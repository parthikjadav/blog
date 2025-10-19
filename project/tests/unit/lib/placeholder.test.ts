import { describe, it, expect } from 'vitest'
import { getPlaceholderImage } from '@/lib/placeholder'

describe('getPlaceholderImage', () => {
  it('should return consistent image for same slug', () => {
    const img1 = getPlaceholderImage('test-post')
    const img2 = getPlaceholderImage('test-post')
    expect(img1).toBe(img2)
  })

  it('should return different images for different slugs', () => {
    const img1 = getPlaceholderImage('test-post-1')
    const img2 = getPlaceholderImage('test-post-2')
    expect(img1).not.toBe(img2)
  })

  it('should return valid path or URL', () => {
    const img = getPlaceholderImage('test')
    // Can be either a full URL or a relative path
    expect(img).toBeTruthy()
    expect(typeof img).toBe('string')
  })

  it('should handle empty slug', () => {
    const img = getPlaceholderImage('')
    expect(img).toBeTruthy()
    expect(typeof img).toBe('string')
  })

  it('should handle special characters in slug', () => {
    const img = getPlaceholderImage('test-post-@#$%')
    expect(img).toBeTruthy()
    expect(typeof img).toBe('string')
  })

  it('should return string type', () => {
    const img = getPlaceholderImage('test')
    expect(typeof img).toBe('string')
  })
})
