import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useDebounce } from '@/hooks/use-debounce'

describe('useDebounce', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.clearAllTimers()
    vi.useRealTimers()
  })

  it('should return initial value immediately', () => {
    const { result } = renderHook(() => useDebounce('test', 500))
    expect(result.current).toBe('test')
  })

  it('should debounce value changes', () => {
    const { result, rerender } = renderHook(
      ({ value, delay }) => useDebounce(value, delay),
      { initialProps: { value: 'initial', delay: 500 } }
    )

    expect(result.current).toBe('initial')

    // Update value
    rerender({ value: 'updated', delay: 500 })

    // Value should not change immediately
    expect(result.current).toBe('initial')

    // Fast-forward time
    act(() => {
      vi.advanceTimersByTime(500)
    })

    // Value should now be updated
    expect(result.current).toBe('updated')
  })

  it('should use default delay of 500ms', () => {
    const { result, rerender } = renderHook(
      ({ value }) => useDebounce(value),
      { initialProps: { value: 'initial' } }
    )

    rerender({ value: 'updated' })

    // Should not update before 500ms
    act(() => {
      vi.advanceTimersByTime(499)
    })
    expect(result.current).toBe('initial')

    // Should update after 500ms
    act(() => {
      vi.advanceTimersByTime(1)
    })
    expect(result.current).toBe('updated')
  })

  it('should cancel previous timeout on rapid changes', () => {
    const { result, rerender } = renderHook(
      ({ value }) => useDebounce(value, 500),
      { initialProps: { value: 'initial' } }
    )

    // First update
    rerender({ value: 'update1' })
    act(() => {
      vi.advanceTimersByTime(200)
    })

    // Second update before first completes
    rerender({ value: 'update2' })
    act(() => {
      vi.advanceTimersByTime(200)
    })

    // Third update before second completes
    rerender({ value: 'update3' })

    // Value should still be initial
    expect(result.current).toBe('initial')

    // Complete the delay
    act(() => {
      vi.advanceTimersByTime(500)
    })

    // Should only have the last value
    expect(result.current).toBe('update3')
  })

  it('should handle different delay values', () => {
    const { result, rerender } = renderHook(
      ({ value, delay }) => useDebounce(value, delay),
      { initialProps: { value: 'initial', delay: 1000 } }
    )

    rerender({ value: 'updated', delay: 1000 })

    // Should not update before 1000ms
    act(() => {
      vi.advanceTimersByTime(999)
    })
    expect(result.current).toBe('initial')

    // Should update after 1000ms
    act(() => {
      vi.advanceTimersByTime(1)
    })
    expect(result.current).toBe('updated')
  })

  it('should handle number values', () => {
    const { result, rerender } = renderHook(
      ({ value }) => useDebounce(value, 300),
      { initialProps: { value: 0 } }
    )

    rerender({ value: 42 })
    act(() => {
      vi.advanceTimersByTime(300)
    })

    expect(result.current).toBe(42)
  })

  it('should handle boolean values', () => {
    const { result, rerender } = renderHook(
      ({ value }) => useDebounce(value, 300),
      { initialProps: { value: false } }
    )

    rerender({ value: true })
    act(() => {
      vi.advanceTimersByTime(300)
    })

    expect(result.current).toBe(true)
  })

  it('should handle object values', () => {
    const { result, rerender } = renderHook(
      ({ value }) => useDebounce(value, 300),
      { initialProps: { value: { name: 'initial' } } }
    )

    const newValue = { name: 'updated' }
    rerender({ value: newValue })
    act(() => {
      vi.advanceTimersByTime(300)
    })

    expect(result.current).toEqual(newValue)
  })

  it('should handle array values', () => {
    const { result, rerender } = renderHook(
      ({ value }) => useDebounce(value, 300),
      { initialProps: { value: [1, 2, 3] } }
    )

    const newValue = [4, 5, 6]
    rerender({ value: newValue })
    act(() => {
      vi.advanceTimersByTime(300)
    })

    expect(result.current).toEqual(newValue)
  })

  it('should handle empty string', () => {
    const { result, rerender } = renderHook(
      ({ value }) => useDebounce(value, 300),
      { initialProps: { value: 'test' } }
    )

    rerender({ value: '' })
    act(() => {
      vi.advanceTimersByTime(300)
    })

    expect(result.current).toBe('')
  })

  it('should handle null values', () => {
    const { result, rerender } = renderHook(
      ({ value }) => useDebounce(value, 300),
      { initialProps: { value: 'test' } }
    )

    rerender({ value: null as any })
    act(() => {
      vi.advanceTimersByTime(300)
    })

    expect(result.current).toBe(null)
  })
})
