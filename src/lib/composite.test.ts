import { computeCanvasBounds } from './composite'
import type { ImageEntry } from '@/types'

let testCounter = 0
const makeImage = (
  id: string,
  w: number,
  h: number,
  x = 0,
  y = 0,
): ImageEntry => ({
  id,
  displayId: ++testCounter,
  dataUrl: `data:image/png;base64,${id}`,
  dimensions: { w, h },
  x,
  y,
})

describe('computeCanvasBounds', () => {
  it('should return empty bounds for no images', () => {
    const result = computeCanvasBounds([])
    expect(result.totalWidth).toBe(0)
    expect(result.totalHeight).toBe(0)
  })

  it('should compute bounds for a single image at origin', () => {
    const images = [makeImage('a', 100, 200)]
    const result = computeCanvasBounds(images)
    expect(result.totalWidth).toBe(100)
    expect(result.totalHeight).toBe(200)
  })

  it('should compute bounds for a single image with offset', () => {
    const images = [makeImage('a', 100, 200, 50, 30)]
    const result = computeCanvasBounds(images)
    expect(result.totalWidth).toBe(150)
    expect(result.totalHeight).toBe(230)
  })

  it('should compute bounding box for multiple non-overlapping images', () => {
    const images = [
      makeImage('a', 100, 200, 0, 0),
      makeImage('b', 150, 100, 100, 0),
    ]
    const result = computeCanvasBounds(images)
    expect(result.totalWidth).toBe(250)
    expect(result.totalHeight).toBe(200)
  })

  it('should compute bounding box for vertically stacked images', () => {
    const images = [
      makeImage('a', 100, 200, 0, 0),
      makeImage('b', 150, 100, 0, 200),
    ]
    const result = computeCanvasBounds(images)
    expect(result.totalWidth).toBe(150)
    expect(result.totalHeight).toBe(300)
  })

  it('should handle overlapping images', () => {
    const images = [
      makeImage('a', 100, 100, 0, 0),
      makeImage('b', 100, 100, 50, 50),
    ]
    const result = computeCanvasBounds(images)
    expect(result.totalWidth).toBe(150)
    expect(result.totalHeight).toBe(150)
  })

  it('should handle three images at various positions', () => {
    const images = [
      makeImage('a', 100, 50, 0, 0),
      makeImage('b', 200, 100, 20, 20),
      makeImage('c', 50, 75, 300, 0),
    ]
    const result = computeCanvasBounds(images)
    expect(result.totalWidth).toBe(350)
    expect(result.totalHeight).toBe(120)
  })
})
