import type { ImageEntry, CanvasBounds } from '@/types'

/**
 * Compute the bounding box of all layers on the canvas.
 *
 * Each image carries its own (x, y) position.  The canvas size is the
 * tight bounding box that encompasses every layer.  Positions are
 * expected to be >= 0 (clamped during drag).
 */
export function computeCanvasBounds(images: ImageEntry[]): CanvasBounds {
  if (images.length === 0) return { totalWidth: 0, totalHeight: 0 }

  let maxX = 0
  let maxY = 0
  for (const img of images) {
    maxX = Math.max(maxX, img.x + img.dimensions.w)
    maxY = Math.max(maxY, img.y + img.dimensions.h)
  }
  return { totalWidth: maxX, totalHeight: maxY }
}
