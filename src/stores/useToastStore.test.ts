import { useToastStore } from './useToastStore'

describe('useToastStore', () => {
  beforeEach(() => {
    // Clear all toasts between tests
    useToastStore.setState({ toasts: [] })
    jest.useRealTimers()
  })

  it('should start with an empty toasts array', () => {
    expect(useToastStore.getState().toasts).toEqual([])
  })

  it('should add a toast with default duration', () => {
    useToastStore.getState().addToast({ message: 'Hello' })
    const toasts = useToastStore.getState().toasts
    expect(toasts).toHaveLength(1)
    expect(toasts[0].message).toBe('Hello')
  })

  it('should assign unique ids to each toast', () => {
    useToastStore.getState().addToast({ message: 'First' })
    useToastStore.getState().addToast({ message: 'Second' })
    const toasts = useToastStore.getState().toasts
    expect(toasts[0].id).not.toBe(toasts[1].id)
  })

  it('should remove a toast by id', () => {
    useToastStore.getState().addToast({ message: 'Will be removed' })
    const id = useToastStore.getState().toasts[0].id
    useToastStore.getState().removeToast(id)
    expect(useToastStore.getState().toasts).toHaveLength(0)
  })

  it('should support an optional color swatch', () => {
    useToastStore.getState().addToast({ message: '#ff0000', colorSwatch: '#ff0000' })
    expect(useToastStore.getState().toasts[0].colorSwatch).toBe('#ff0000')
  })

  it('should auto-remove toast after duration', () => {
    jest.useFakeTimers()
    useToastStore.getState().addToast({ message: 'Temp', duration: 1000 })
    expect(useToastStore.getState().toasts).toHaveLength(1)

    jest.advanceTimersByTime(1000)
    expect(useToastStore.getState().toasts).toHaveLength(0)
  })

  it('should not auto-remove toast when duration is 0 (persistent)', () => {
    jest.useFakeTimers()
    useToastStore.getState().addToast({ message: 'Sticky', duration: 0 })
    jest.advanceTimersByTime(10000)
    expect(useToastStore.getState().toasts).toHaveLength(1)
  })

  it('should stack multiple toasts', () => {
    useToastStore.getState().addToast({ message: 'A' })
    useToastStore.getState().addToast({ message: 'B' })
    useToastStore.getState().addToast({ message: 'C' })
    expect(useToastStore.getState().toasts).toHaveLength(3)
  })
})
