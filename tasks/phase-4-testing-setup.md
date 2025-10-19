# Phase 4: Testing Setup Guide

**Project**: Fast Tech - Next.js 15 Blog with Prisma + SQLite  
**Phase**: Testing Infrastructure Setup  
**Date**: October 18, 2025  
**Status**: Ready to Implement

---

## Overview

This guide provides step-by-step instructions to set up a comprehensive testing infrastructure for the blog project (Vitest-only), including:
- **Unit Testing** - Test individual functions and utilities
- **Component Testing** - Test React components in isolation
- **Integration Testing** - Test server utilities and light integration

---

## Testing Stack (Vitest-only)

| Tool | Purpose | Why |
|------|---------|-----|
| **Vitest** | Unit & Integration Testing | Fast, modern, Vite-powered |
| **Testing Library** | Component Testing | React best practices |
| **@testing-library/jest-dom** | DOM Assertions | Better assertions |
| **happy-dom** | DOM Environment | Fast, lightweight DOM for tests |

---

## Phase 4.1: Install Testing Dependencies

### Step 1.1: Install Vitest and Core Testing Tools

```bash
npm install -D vitest @vitest/ui @vitest/coverage-v8
```

**What this installs:**
- `vitest` - Test runner (Jest alternative)
- `@vitest/ui` - Visual test UI
- `@vitest/coverage-v8` - Code coverage reports

**Time**: 2 minutes

---

### Step 1.2: Install React Testing Library

```bash
npm install -D @testing-library/react @testing-library/jest-dom @testing-library/user-event
```

**What this installs:**
- `@testing-library/react` - React component testing utilities
- `@testing-library/jest-dom` - Custom DOM matchers
- `@testing-library/user-event` - Simulate user interactions

**Time**: 2 minutes

---

### Step 1.3: Install Additional Testing Utilities (Optional)

```bash
npm install -D @types/node happy-dom
```

**What this installs:**
- `@types/node` - Node.js type definitions
- `happy-dom` - Lightweight DOM implementation for Vitest

**Time**: 1 minute

---

## Phase 4.2: Configure Vitest

### Step 2.1: Create Vitest Configuration

**File**: `vitest.config.ts`

```typescript
import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'happy-dom',
    globals: true,
    setupFiles: ['./tests/setup.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'tests/',
        '*.config.ts',
        '*.config.js',
        '.next/',
        'coverage/',
      ],
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './'),
    },
  },
})
```

**What this does:**
- Sets up React plugin
- Uses happy-dom for DOM simulation
- Enables global test functions (describe, it, expect)
- Configures code coverage
- Sets up path aliases (@/)

**Time**: 5 minutes

---

### Step 2.2: Create Test Setup File

**File**: `tests/setup.ts`

```typescript
import { expect, afterEach } from 'vitest'
import { cleanup } from '@testing-library/react'
import * as matchers from '@testing-library/jest-dom/matchers'

// Extend Vitest's expect with jest-dom matchers
expect.extend(matchers)

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
}))

// Mock Next.js Image component
vi.mock('next/image', () => ({
  default: (props: any) => {
    // eslint-disable-next-line jsx-a11y/alt-text
    return <img {...props} />
  },
}))
```

**What this does:**
- Extends expect with DOM matchers
- Cleans up after each test
- Mocks Next.js navigation
- Mocks Next.js Image component

**Time**: 5 minutes

---

### Step 2.3: Create TypeScript Config for Tests

**File**: `tests/tsconfig.json`

```json
{
  "extends": "../tsconfig.json",
  "compilerOptions": {
    "types": ["vitest/globals", "@testing-library/jest-dom"]
  },
  "include": ["**/*.ts", "**/*.tsx", "setup.ts"]
}
```

**What this does:**
- Extends main TypeScript config
- Adds test-specific types
- Includes all test files

**Time**: 2 minutes

---

## Phase 4.3: (Skipped) E2E Configuration

We are not using Playwright or any E2E framework in this phase.

## Phase 4.4: Create Test Directory Structure

### Step 4.1: Create Directory Structure

```bash
mkdir -p tests/unit
mkdir -p tests/integration
mkdir -p tests/components
mkdir -p tests/mocks
mkdir -p tests/fixtures
```

**Directory structure:**
```
tests/
├── setup.ts                 # Test setup and global mocks
├── tsconfig.json           # TypeScript config for tests
├── unit/                   # Unit tests
│   ├── lib/               # Test lib functions
│   └── utils/             # Test utility functions
├── integration/           # Integration tests (optional)
├── components/           # Component tests
│   ├── blog/            # Blog component tests
│   ├── layout/          # Layout component tests
│   └── ui/              # UI component tests
├── mocks/              # Mock data (optional)
│   └── data.ts        # Mock data
└── fixtures/          # Test fixtures
    └── posts.ts       # Sample post data
```

**Time**: 2 minutes

---

### Step 4.2: Create Mock Data File

**File**: `tests/mocks/data.ts`

```typescript
import { BlogPost } from '@/types/blog'

export const mockPost: BlogPost = {
  id: 'test-id-1',
  slug: 'test-post',
  title: 'Test Post Title',
  description: 'Test post description',
  content: '# Test Content\n\nThis is test content.',
  published: true,
  publishedAt: new Date('2025-01-01'),
  scheduledFor: null,
  readingTime: 5,
  author: 'Test Author',
  featuredImage: '/images/test.jpg',
  featuredImageAlt: 'Test image',
  keywords: ['test', 'mock'],
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
  ],
}

export const mockPosts: BlogPost[] = [
  mockPost,
  {
    ...mockPost,
    id: 'test-id-2',
    slug: 'test-post-2',
    title: 'Test Post 2',
  },
]
```

**What this does:**
- Provides reusable mock data
- Matches actual data structure
- Easy to extend

**Time**: 5 minutes

---

### Step 4.3: (Optional) API Mocks

For unit/component tests, prefer pure functions and component props. If API mocking is needed later, we can add MSW in a future phase.

### Step 4.4: Create MSW Server Setup

**File**: `tests/mocks/server.ts`

```typescript
import { setupServer } from 'msw/node'
import { handlers } from './handlers'

export const server = setupServer(...handlers)

// Start server before all tests
beforeAll(() => server.listen({ onUnhandledRequest: 'error' }))

// Reset handlers after each test
afterEach(() => server.resetHandlers())

// Clean up after all tests
afterAll(() => server.close())
```

**What this does:**
- Sets up MSW server
- Starts/stops automatically
- Resets between tests

**Time**: 3 minutes

---

## Phase 4.5: Update Package.json Scripts

### Step 5.1: Add Test Scripts

**File**: `package.json` (add to scripts section)

```json
{
  "scripts": {
    "dev": "next dev --turbopack",
    "build": "next build",
    "start": "next start",
    "lint": "next lint",
    "db:migrate": "tsx scripts/migrate-mdx-to-db.ts",
    "db:studio": "npx prisma studio",
    "db:push": "npx prisma db push",
    "db:generate": "npx prisma generate",
    
    "test": "vitest",
    "test:ui": "vitest --ui",
    "test:run": "vitest run",
    "test:coverage": "vitest run --coverage",
    "test:watch": "vitest watch"
  }
}
```

**Script descriptions:**
- `test` - Run tests in watch mode
- `test:ui` - Open Vitest UI
- `test:run` - Run tests once
- `test:coverage` - Generate coverage report
- `test:watch` - Watch mode
- `test:e2e` - Run E2E tests
- `test:e2e:ui` - Playwright UI mode
- `test:e2e:debug` - Debug E2E tests
- `test:e2e:report` - View test report
- `test:all` - Run all tests

**Time**: 3 minutes

---

## Phase 4.6: Configure VS Code for Testing

### Step 6.1: Create VS Code Settings

**File**: `.vscode/settings.json` (add to existing)

```json
{
  "vitest.enable": true,
  "vitest.commandLine": "npm run test",
  "testing.automaticallyOpenPeekView": "never",
  "editor.codeActionsOnSave": {
    "source.organizeImports": true
  }
}
```

**What this does:**
- Enables Vitest extension
- Configures test commands
- Auto-organize imports

**Time**: 2 minutes

---

### Step 6.2: Install Recommended VS Code Extensions

**File**: `.vscode/extensions.json`

```json
{
  "recommendations": [
    "vitest.explorer",
    "dbaeumer.vscode-eslint",
    "esbenp.prettier-vscode"
  ]
}
```

**Extensions:**
- Vitest Explorer - Run tests in VS Code
- ESLint - Code linting
- Prettier - Code formatting

**Time**: 1 minute

---

## Phase 4.7: Create Example Test Files

### Step 7.1: Create Example Unit Test

**File**: `tests/unit/lib/utils.test.ts`

```typescript
import { describe, it, expect } from 'vitest'
import { formatDate, slugify } from '@/lib/utils'

describe('Utils', () => {
  describe('formatDate', () => {
    it('should format date correctly', () => {
      const date = '2025-01-15'
      const result = formatDate(date)
      expect(result).toBeTruthy()
    })
  })

  describe('slugify', () => {
    it('should convert string to slug', () => {
      expect(slugify('Hello World')).toBe('hello-world')
      expect(slugify('Test & Example')).toBe('test-example')
    })
  })
})
```

**Time**: 3 minutes

---

### Step 7.2: Create Example Component Test

**File**: `tests/components/blog/post-card.test.tsx`

```typescript
import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { PostCard } from '@/components/blog/post-card'
import { mockPost } from '@/tests/mocks/data'

describe('PostCard', () => {
  it('should render post title', () => {
    render(<PostCard post={mockPost} />)
    expect(screen.getByText(mockPost.title)).toBeInTheDocument()
  })

  it('should render post description', () => {
    render(<PostCard post={mockPost} />)
    expect(screen.getByText(mockPost.description)).toBeInTheDocument()
  })

  it('should render category badge', () => {
    render(<PostCard post={mockPost} />)
    expect(screen.getByText(mockPost.category.name)).toBeInTheDocument()
  })
})
```

**Time**: 5 minutes

---

<!-- E2E example omitted (Vitest-only setup) -->

## Phase 4.8: Update .gitignore

### Step 8.1: Add Test Artifacts to .gitignore

**File**: `.gitignore` (append)

```
# Testing
coverage/
.vitest/
test-results/
```

**What this does:**
- Excludes coverage reports
- Excludes test artifacts
- Excludes Playwright cache

**Time**: 1 minute

---

## Phase 4.9: Create Test Documentation

### Step 9.1: Create Testing README

**File**: `tests/README.md`

```markdown
# Testing Guide

## Running Tests

### Unit & Component Tests
\`\`\`bash
# Watch mode (recommended during development)
npm test

# Run once
npm run test:run

# With UI
npm run test:ui

# With coverage
npm run test:coverage
\`\`\`

### E2E Tests
\`\`\`bash
# Run all E2E tests
npm run test:e2e

# Run with UI
npm run test:e2e:ui

# Debug mode
npm run test:e2e:debug

# View report
npm run test:e2e:report
\`\`\`

### Run All Tests
\`\`\`bash
npm run test:all
\`\`\`

## Test Structure

- `unit/` - Unit tests for functions and utilities
- `integration/` - Integration tests for database and APIs
- `components/` - Component tests
- `e2e/` - End-to-end tests
- `mocks/` - Mock data and handlers
- `fixtures/` - Test fixtures

## Writing Tests

See example tests in each directory for patterns and best practices.
\`\`\`

**Time**: 5 minutes

---

## Phase 4.10: Verify Installation

### Step 10.1: Run Test Commands

```bash
npm run test:run
# Check coverage setup
npm run test:coverage
```

**Expected output:**
- Vitest runs successfully
- Coverage report generates

**Time**: 3 minutes

---

## Summary

### Total Time Estimate: ~1.5 hours

### What You've Set Up:

✅ **Vitest** - Fast unit testing framework  
✅ **Testing Library** - React component testing  
✅ **happy-dom** - DOM environment for Vitest  
✅ **Coverage Reports** - Track test coverage  
✅ **Test Structure** - Organized test directories  
✅ **Example Tests** - Templates to follow  
✅ **VS Code Integration** - Run tests in editor  

### Next Steps:

**Phase 5** will cover:
- Writing comprehensive unit tests
- Writing component tests
- Writing integration tests (optional)
- Achieving 80%+ code coverage
- Setting up CI test workflow

---

## Troubleshooting

### Issue: "Cannot find module '@testing-library/react'"
**Solution**: Run `npm install` again

### Issue: "Path alias '@/' not working"
**Solution**: Check `vitest.config.ts` resolve.alias configuration

### Issue: "Tests timing out"
**Solution**: Increase timeout in test file: `test('...', async () => {}, { timeout: 10000 })`

---

**Setup Complete!** 🎉

Your testing infrastructure is now ready. Proceed to Phase 5 for writing actual tests.
