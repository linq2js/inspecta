/** Convert R, G, B values (0–255) to a lowercase hex string like `#ff00ab`. */
export function rgbToHex(r: number, g: number, b: number): string {
  const toHex = (n: number) => n.toString(16).padStart(2, '0')
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`
}

/**
 * Read the color of a single pixel from an `ImageData` buffer.
 *
 * Fractional coordinates are floored; out-of-bounds values are clamped to the
 * nearest valid pixel.
 */
export function getPixelColor(
  imageData: ImageData,
  x: number,
  y: number,
): string {
  const px = Math.min(Math.max(0, Math.floor(x)), imageData.width - 1)
  const py = Math.min(Math.max(0, Math.floor(y)), imageData.height - 1)
  const i = (py * imageData.width + px) * 4
  return rgbToHex(imageData.data[i], imageData.data[i + 1], imageData.data[i + 2])
}
