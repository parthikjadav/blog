# Testing Guide

## Running Tests

### Unit & Component Tests
```bash
# Watch mode (recommended during development)
npm test

# Run once
npm run test:run

# With UI
npm run test:ui

# With coverage
npm run test:coverage
```

## Test Structure

- `unit/` - Unit tests for functions and utilities
- `integration/` - Integration tests for database and server utilities
- `components/` - Component tests
- `mocks/` - Mock data
- `fixtures/` - Test fixtures

## Writing Tests

See example tests in each directory for patterns and best practices.

### Example Unit Test

```typescript
import { describe, it, expect } from 'vitest'
import { myFunction } from '@/lib/myFunction'

describe('myFunction', () => {
  it('should do something', () => {
    expect(myFunction('input')).toBe('expected')
  })
})
```

### Example Component Test

```typescript
import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MyComponent } from '@/components/MyComponent'

describe('MyComponent', () => {
  it('should render correctly', () => {
    render(<MyComponent />)
    expect(screen.getByText('Hello')).toBeInTheDocument()
  })
})
```

## Coverage

Run `npm run test:coverage` to generate a coverage report. The report will be available in the `coverage/` directory.

## Troubleshooting

### Issue: "Cannot find module"
**Solution**: Make sure all dependencies are installed with `npm install`

### Issue: "Path alias '@/' not working"
**Solution**: Check `vitest.config.ts` resolve.alias configuration

### Issue: "Tests timing out"
**Solution**: Increase timeout in test file: `test('...', async () => {}, { timeout: 10000 })`
