import { snapToAxis } from './snap'

describe('snapToAxis', () => {
  it('should snap a nearly horizontal line to 0°', () => {
    const result = snapToAxis(0, 0, 100, 10)
    expect(result.y).toBeCloseTo(0, 5)
    expect(result.x).toBeCloseTo(Math.hypot(100, 10), 5)
  })

  it('should snap a nearly vertical line to 90°', () => {
    const result = snapToAxis(0, 0, 10, 100)
    expect(result.x).toBeCloseTo(0, 5)
    expect(result.y).toBeCloseTo(Math.hypot(10, 100), 5)
  })

  it('should snap to 45° diagonal', () => {
    const result = snapToAxis(0, 0, 100, 90)
    const distance = Math.hypot(100, 90)
    expect(result.x).toBeCloseTo(distance * Math.cos(Math.PI / 4), 5)
    expect(result.y).toBeCloseTo(distance * Math.sin(Math.PI / 4), 5)
  })

  it('should snap to 135° diagonal (up-left)', () => {
    const result = snapToAxis(100, 100, 10, 190)
    const distance = Math.hypot(-90, 90)
    expect(result.x).toBeCloseTo(100 + distance * Math.cos((3 * Math.PI) / 4), 5)
    expect(result.y).toBeCloseTo(100 + distance * Math.sin((3 * Math.PI) / 4), 5)
  })

  it('should preserve distance after snapping', () => {
    const result = snapToAxis(50, 50, 200, 55)
    const originalDist = Math.hypot(150, 5)
    const snappedDist = Math.hypot(result.x - 50, result.y - 50)
    expect(snappedDist).toBeCloseTo(originalDist, 5)
  })

  it('should return same point for zero distance', () => {
    const result = snapToAxis(50, 50, 50, 50)
    expect(result.x).toBe(50)
    expect(result.y).toBe(50)
  })

  it('should snap negative direction to 180°', () => {
    const result = snapToAxis(100, 100, 0, 105)
    expect(result.y).toBeCloseTo(100, 5)
    expect(result.x).toBeLessThan(100)
  })

  it('should snap downward to 270° (-90°)', () => {
    const result = snapToAxis(100, 0, 105, -100)
    expect(result.x).toBeCloseTo(100, 5)
    expect(result.y).toBeLessThan(0)
  })
})
