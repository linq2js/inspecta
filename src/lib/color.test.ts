import { rgbToHex, getPixelColor } from './color'

describe('rgbToHex', () => {
  it('should convert black (0,0,0) to #000000', () => {
    expect(rgbToHex(0, 0, 0)).toBe('#000000')
  })

  it('should convert white (255,255,255) to #ffffff', () => {
    expect(rgbToHex(255, 255, 255)).toBe('#ffffff')
  })

  it('should convert red (255,0,0) to #ff0000', () => {
    expect(rgbToHex(255, 0, 0)).toBe('#ff0000')
  })

  it('should convert arbitrary color (18,52,86) to #123456', () => {
    expect(rgbToHex(18, 52, 86)).toBe('#123456')
  })

  it('should pad single-digit hex values with zero', () => {
    expect(rgbToHex(1, 2, 3)).toBe('#010203')
  })
})

describe('getPixelColor', () => {
  it('should return the hex color at given coordinates', () => {
    // 2x2 image, RGBA format: 4 bytes per pixel
    const data = new Uint8ClampedArray([
      255, 0, 0, 255, // (0,0) red
      0, 255, 0, 255, // (1,0) green
      0, 0, 255, 255, // (0,1) blue
      255, 255, 0, 255, // (1,1) yellow
    ])
    const imageData = { data, width: 2, height: 2 } as ImageData

    expect(getPixelColor(imageData, 0, 0)).toBe('#ff0000')
    expect(getPixelColor(imageData, 1, 0)).toBe('#00ff00')
    expect(getPixelColor(imageData, 0, 1)).toBe('#0000ff')
    expect(getPixelColor(imageData, 1, 1)).toBe('#ffff00')
  })

  it('should clamp out-of-bounds coordinates to image edges', () => {
    const data = new Uint8ClampedArray([
      10, 20, 30, 255, // (0,0)
      40, 50, 60, 255, // (1,0)
      70, 80, 90, 255, // (0,1)
      100, 110, 120, 255, // (1,1)
    ])
    const imageData = { data, width: 2, height: 2 } as ImageData

    // Negative coords → clamped to 0
    expect(getPixelColor(imageData, -5, -5)).toBe('#0a141e')
    // Over-max coords → clamped to max
    expect(getPixelColor(imageData, 100, 100)).toBe('#646e78')
  })

  it('should floor fractional coordinates', () => {
    const data = new Uint8ClampedArray([
      255, 0, 0, 255, // (0,0) red
      0, 255, 0, 255, // (1,0) green
      0, 0, 255, 255, // (0,1) blue
      255, 255, 0, 255, // (1,1) yellow
    ])
    const imageData = { data, width: 2, height: 2 } as ImageData

    expect(getPixelColor(imageData, 0.7, 0.3)).toBe('#ff0000') // floors to (0,0)
    expect(getPixelColor(imageData, 1.9, 0.1)).toBe('#00ff00') // floors to (1,0)
  })
})
