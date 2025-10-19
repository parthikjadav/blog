import { afterEach, vi } from 'vitest'
import { cleanup } from '@testing-library/react'
import '@testing-library/jest-dom/vitest'

// Cleanup after each test
afterEach(() => {
  cleanup()
})

// Mock Next.js router
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    prefetch: vi.fn(),
    back: vi.fn(),
  }),
  usePathname: () => '/',
  useSearchParams: () => new URLSearchParams(),
  notFound: vi.fn(),
}))

// Mock Next.js Image component: render a real <img> without JSX
vi.mock('next/image', () => ({
  default: (props: any) => {
    const React = require('react')
    return React.createElement('img', props)
  },
}))

// Mock Next.js Link component: render a real <a> without JSX
vi.mock('next/link', () => ({
  default: ({ children, href, ...rest }: any) => {
    const React = require('react')
    return React.createElement('a', { href, ...rest }, children)
  },
}))
