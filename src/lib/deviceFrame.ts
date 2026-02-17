import type { DevicePreset } from '@/types'

/**
 * Generate a blank device-frame PNG as a data URL using an offscreen canvas.
 * Returns `{ dataUrl, width, height }` ready for `useImageStore.addImage()`.
 */
export function generateFrameImage(device: DevicePreset): {
  dataUrl: string
  width: number
  height: number
} {
  const { width, height, radius } = device

  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height
  const ctx = canvas.getContext('2d')!

  // Fill background (zinc-100)
  ctx.fillStyle = '#f4f4f5'
  ctx.beginPath()
  ctx.roundRect(0, 0, width, height, radius)
  ctx.fill()

  // Subtle border (zinc-300)
  ctx.strokeStyle = '#d4d4d8'
  ctx.lineWidth = 1
  ctx.beginPath()
  ctx.roundRect(0.5, 0.5, width - 1, height - 1, Math.max(0, radius - 0.5))
  ctx.stroke()

  return {
    dataUrl: canvas.toDataURL('image/png'),
    width,
    height,
  }
}
