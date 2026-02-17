import { buildAnnotationBlock } from './usePromptStore'
import type { UnifiedItem } from '@/types'

function makeItem(overrides: Partial<UnifiedItem> & { index: number; kind: UnifiedItem['kind'] }): UnifiedItem {
  return {
    id: `ann-${overrides.index}`,
    type: 'annotation',
    label: overrides.kind === 'arrow' ? 'Arrow annotation' : overrides.kind === 'blur' ? 'Blur box' : 'User annotation',
    rect: { x: 10, y: 20, width: 100, height: 50 },
    note: '',
    ...overrides,
  }
}

describe('buildAnnotationBlock', () => {
  const dims = { w: 800, h: 600 }

  it('should include box annotations in output', () => {
    const items = [makeItem({ index: 1, kind: 'box', note: 'Fix spacing' })]
    const result = buildAnnotationBlock(items, dims)
    expect(result).toContain('**[1]**')
    expect(result).toContain('Fix spacing')
  })

  it('should include arrow annotations in output', () => {
    const items = [
      makeItem({
        index: 1,
        kind: 'arrow',
        arrow: { x1: 10, y1: 20, x2: 100, y2: 200 },
      }),
    ]
    const result = buildAnnotationBlock(items, dims)
    expect(result).toContain('**[1]**')
    expect(result).toContain('arrow from')
  })

  it('should skip blur annotations in output', () => {
    const items = [
      makeItem({ index: 1, kind: 'box', note: 'Fix this' }),
      makeItem({ index: 2, kind: 'blur' }),
      makeItem({ index: 3, kind: 'arrow', arrow: { x1: 0, y1: 0, x2: 50, y2: 50 } }),
    ]
    const result = buildAnnotationBlock(items, dims)
    expect(result).toContain('**[1]**')
    expect(result).not.toContain('**[2]**')
    expect(result).toContain('**[3]**')
  })

  it('should preserve original indices when blur items are filtered', () => {
    const items = [
      makeItem({ index: 1, kind: 'blur' }),
      makeItem({ index: 2, kind: 'box', note: 'Second item' }),
    ]
    const result = buildAnnotationBlock(items, dims)
    expect(result).not.toContain('**[1]**')
    expect(result).toContain('**[2]**')
    expect(result).toContain('Second item')
  })

  it('should return empty string when only blur items exist', () => {
    const items = [
      makeItem({ index: 1, kind: 'blur' }),
      makeItem({ index: 2, kind: 'blur' }),
    ]
    const result = buildAnnotationBlock(items, dims)
    expect(result).toBe('')
  })

  it('should return empty string when no items', () => {
    const result = buildAnnotationBlock([], dims)
    expect(result).toBe('')
  })

  it('should include line annotations with "line from" format', () => {
    const items = [
      makeItem({
        index: 1,
        kind: 'line',
        arrow: { x1: 10, y1: 20, x2: 100, y2: 200 },
      }),
    ]
    const result = buildAnnotationBlock(items, dims)
    expect(result).toContain('**[1]**')
    expect(result).toContain('line from')
  })

  it('should include lines alongside arrows and boxes', () => {
    const items = [
      makeItem({ index: 1, kind: 'box', note: 'A box' }),
      makeItem({ index: 2, kind: 'line', arrow: { x1: 0, y1: 0, x2: 50, y2: 50 } }),
      makeItem({ index: 3, kind: 'arrow', arrow: { x1: 10, y1: 10, x2: 80, y2: 80 } }),
    ]
    const result = buildAnnotationBlock(items, dims)
    expect(result).toContain('**[1]**')
    expect(result).toContain('**[2]** line from')
    expect(result).toContain('**[3]** arrow from')
  })
})
