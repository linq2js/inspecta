import { useFilterStore } from './useFilterStore'

describe('useFilterStore', () => {
  beforeEach(() => {
    useFilterStore.getState().reset()
  })

  it('should have correct initial state', () => {
    const state = useFilterStore.getState()
    expect(state.query).toBe('')
    expect(state.platforms).toEqual([])
    expect(state.category).toBe('')
  })

  it('should set query', () => {
    useFilterStore.getState().setQuery('button')
    expect(useFilterStore.getState().query).toBe('button')
  })

  it('should toggle platform on', () => {
    useFilterStore.getState().togglePlatform('ios')
    expect(useFilterStore.getState().platforms).toEqual(['ios'])
  })

  it('should toggle platform off', () => {
    useFilterStore.getState().togglePlatform('ios')
    useFilterStore.getState().togglePlatform('ios')
    expect(useFilterStore.getState().platforms).toEqual([])
  })

  it('should support multiple platforms', () => {
    useFilterStore.getState().togglePlatform('ios')
    useFilterStore.getState().togglePlatform('android')
    expect(useFilterStore.getState().platforms).toEqual(['ios', 'android'])
  })

  it('should set category', () => {
    useFilterStore.getState().setCategory('navigation')
    expect(useFilterStore.getState().category).toBe('navigation')
  })

  it('should clear category with empty string', () => {
    useFilterStore.getState().setCategory('navigation')
    useFilterStore.getState().setCategory('')
    expect(useFilterStore.getState().category).toBe('')
  })

  it('should reset all filters', () => {
    useFilterStore.getState().setQuery('test')
    useFilterStore.getState().togglePlatform('ios')
    useFilterStore.getState().setCategory('input')
    useFilterStore.getState().reset()

    const state = useFilterStore.getState()
    expect(state.query).toBe('')
    expect(state.platforms).toEqual([])
    expect(state.category).toBe('')
  })
})
