import { describe, it, expect } from 'vitest'
import { formatDate, slugify, cn } from '@/lib/utils'

describe('Utils', () => {
  describe('formatDate', () => {
    it('should format date correctly', () => {
      const date = '2025-01-15'
      const result = formatDate(date)
      expect(result).toBeTruthy()
      expect(typeof result).toBe('string')
    })

    it('should handle invalid dates', () => {
      const result = formatDate('invalid-date')
      expect(result).toBe('Invalid Date')
    })

    it('should handle ISO date format', () => {
      const result = formatDate('2025-01-15T10:30:00Z')
      expect(result).toBeTruthy()
      expect(typeof result).toBe('string')
    })

    it('should handle null gracefully', () => {
      const result = formatDate(null as any)
      expect(result).toBe('Invalid Date')
    })

    it('should handle undefined gracefully', () => {
      const result = formatDate(undefined as any)
      expect(result).toBe('Invalid Date')
    })

    it('should handle empty string', () => {
      const result = formatDate('')
      expect(result).toBe('Invalid Date')
    })
  })

  describe('slugify', () => {
    it('should convert string to slug', () => {
      expect(slugify('Hello World')).toBe('hello-world')
      expect(slugify('Test & Example')).toBe('test-example')
      expect(slugify('Multiple   Spaces')).toBe('multiple-spaces')
    })

    it('should handle special characters', () => {
      expect(slugify('Test@#$%Example')).toBe('testexample')
    })

    it('should handle empty string', () => {
      expect(slugify('')).toBe('')
    })

    it('should convert to lowercase', () => {
      expect(slugify('HELLO WORLD')).toBe('hello-world')
      expect(slugify('CamelCase')).toBe('camelcase')
    })

    it('should handle Unicode characters', () => {
      const result = slugify('Café résumé')
      expect(result).toBeTruthy()
      expect(typeof result).toBe('string')
    })

    it('should handle multiple consecutive spaces', () => {
      expect(slugify('Hello    World')).toBe('hello-world')
    })

    it('should trim leading and trailing spaces', () => {
      expect(slugify('  Hello World  ')).toBe('hello-world')
    })
  })

  describe('cn', () => {
    it('should merge class names', () => {
      const result = cn('class1', 'class2')
      expect(result).toContain('class1')
      expect(result).toContain('class2')
    })

    it('should handle conditional classes', () => {
      const result = cn('base', false && 'hidden', true && 'visible')
      expect(result).toContain('base')
      expect(result).toContain('visible')
      expect(result).not.toContain('hidden')
    })

    it('should handle arrays of classes', () => {
      const result = cn(['class1', 'class2'])
      expect(result).toContain('class1')
      expect(result).toContain('class2')
    })

    it('should handle objects with boolean values', () => {
      const result = cn({
        'active': true,
        'disabled': false,
        'visible': true
      })
      expect(result).toContain('active')
      expect(result).toContain('visible')
      expect(result).not.toContain('disabled')
    })

    it('should handle null and undefined values', () => {
      const result = cn('base', null, undefined, 'extra')
      expect(result).toContain('base')
      expect(result).toContain('extra')
    })

    it('should handle duplicate classes', () => {
      const result = cn('class1', 'class1', 'class2')
      // cn may or may not deduplicate - just verify it contains the classes
      expect(result).toContain('class1')
      expect(result).toContain('class2')
    })
  })
})
