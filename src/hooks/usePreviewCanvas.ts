import { useRef, useEffect, useCallback, useState } from 'react'
import { useImageStore } from '@/stores/useImageStore'
import { useAnnotationStore } from '@/stores/useAnnotationStore'

/**
 * Hook that renders the annotated composite image onto a hidden <canvas>
 * and exposes the preview data-URL + download / copy-image actions.
 */
export function usePreviewCanvas() {
  const { images, canvasBounds, includeImageMeta } = useImageStore()
  const { getUnifiedList } = useAnnotationStore()
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const items = getUnifiedList()

  const renderPreview = useCallback(() => {
    if (
      !canvasRef.current ||
      images.length === 0 ||
      canvasBounds.totalWidth === 0
    )
      return

    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')!
    canvas.width = canvasBounds.totalWidth
    canvas.height = canvasBounds.totalHeight

    ctx.clearRect(0, 0, canvas.width, canvas.height)

    let loadedCount = 0
    const totalImages = images.length

    // Render images in array order (back to front) using their x, y positions
    for (const imageEntry of images) {
      const img = new Image()
      img.onload = () => {
        ctx.drawImage(img, imageEntry.x, imageEntry.y)
        loadedCount++

        if (loadedCount === totalImages) {
          if (includeImageMeta && images.length > 1) drawImageIdBadges(ctx)
          drawBlurRegions(ctx)
          drawAnnotations(ctx)
          setPreviewUrl(canvas.toDataURL('image/png'))
        }
      }
      img.src = imageEntry.dataUrl
    }
  }, [images, canvasBounds, items, includeImageMeta])

  function drawImageIdBadges(ctx: CanvasRenderingContext2D) {
    for (const img of images) {
      const badgeRadius = 14
      const cx = img.x + 8 + badgeRadius
      const cy = img.y + 8 + badgeRadius

      // Circle background
      ctx.fillStyle = 'rgba(75, 85, 99, 0.75)'
      ctx.beginPath()
      ctx.arc(cx, cy, badgeRadius, 0, Math.PI * 2)
      ctx.fill()

      // Circle border
      ctx.strokeStyle = '#9ca3af'
      ctx.lineWidth = 2
      ctx.setLineDash([])
      ctx.beginPath()
      ctx.arc(cx, cy, badgeRadius, 0, Math.PI * 2)
      ctx.stroke()

      // Text
      ctx.fillStyle = '#e5e7eb'
      ctx.font = 'bold 14px sans-serif'
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      ctx.fillText(String(img.displayId), cx, cy)
    }
  }

  function drawBlurRegions(ctx: CanvasRenderingContext2D) {
    for (const item of items) {
      if (item.kind !== 'blur') continue

      const x = Math.round(item.rect.x)
      const y = Math.round(item.rect.y)
      const w = Math.round(item.rect.width)
      const h = Math.round(item.rect.height)
      if (w <= 0 || h <= 0) continue

      const pixelSize = Math.max(4, Math.round(Math.min(w, h) / 8))
      const imageData = ctx.getImageData(x, y, w, h)
      const { data, width, height } = imageData

      for (let py = 0; py < height; py += pixelSize) {
        for (let px = 0; px < width; px += pixelSize) {
          let r = 0, g = 0, b = 0, count = 0
          for (let dy = 0; dy < pixelSize && py + dy < height; dy++) {
            for (let dx = 0; dx < pixelSize && px + dx < width; dx++) {
              const i = ((py + dy) * width + (px + dx)) * 4
              r += data[i]
              g += data[i + 1]
              b += data[i + 2]
              count++
            }
          }
          r = Math.round(r / count)
          g = Math.round(g / count)
          b = Math.round(b / count)
          for (let dy = 0; dy < pixelSize && py + dy < height; dy++) {
            for (let dx = 0; dx < pixelSize && px + dx < width; dx++) {
              const i = ((py + dy) * width + (px + dx)) * 4
              data[i] = r
              data[i + 1] = g
              data[i + 2] = b
            }
          }
        }
      }

      ctx.putImageData(imageData, x, y)

      // Draw badge
      const badgeRadius = 14
      const bx = x + badgeRadius + 4
      const fitsAbove = y - 4 - badgeRadius >= 0
      const by = fitsAbove ? y - 4 : y + badgeRadius + 4
      ctx.fillStyle = '#3b82f6'
      ctx.beginPath()
      ctx.arc(bx, by, badgeRadius, 0, Math.PI * 2)
      ctx.fill()

      ctx.fillStyle = 'white'
      ctx.font = 'bold 14px sans-serif'
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      ctx.fillText(String(item.index), bx, by)
    }
  }

  function drawAnnotations(ctx: CanvasRenderingContext2D) {
    for (const item of items) {
      if (item.kind === 'blur') continue

      const color = '#f97316'

      if ((item.kind === 'arrow' || item.kind === 'line') && item.arrow) {
        const { x1, y1, x2, y2 } = item.arrow

        // Draw line
        ctx.strokeStyle = color
        ctx.lineWidth = 3
        ctx.setLineDash([])
        ctx.beginPath()
        ctx.moveTo(x1, y1)
        ctx.lineTo(x2, y2)
        ctx.stroke()

        // Arrowhead at end point (arrow only)
        if (item.kind === 'arrow') {
          const angle = Math.atan2(y2 - y1, x2 - x1)
          const headLen = 14
          ctx.fillStyle = color
          ctx.beginPath()
          ctx.moveTo(x2, y2)
          ctx.lineTo(
            x2 - headLen * Math.cos(angle - Math.PI / 6),
            y2 - headLen * Math.sin(angle - Math.PI / 6),
          )
          ctx.lineTo(
            x2 - headLen * Math.cos(angle + Math.PI / 6),
            y2 - headLen * Math.sin(angle + Math.PI / 6),
          )
          ctx.closePath()
          ctx.fill()
        }

        // Badge at start (tail) point
        const badgeRadius = 14
        ctx.fillStyle = color
        ctx.beginPath()
        ctx.arc(x1, y1, badgeRadius, 0, Math.PI * 2)
        ctx.fill()

        ctx.fillStyle = 'white'
        ctx.font = 'bold 14px sans-serif'
        ctx.textAlign = 'center'
        ctx.textBaseline = 'middle'
        ctx.fillText(String(item.index), x1, y1)

        continue
      }

      const x = item.rect.x
      const y = item.rect.y
      const w = item.rect.width
      const h = item.rect.height

      ctx.fillStyle = `${color}20`
      ctx.fillRect(x, y, w, h)

      ctx.strokeStyle = color
      ctx.lineWidth = 3
      ctx.setLineDash([8, 4])
      ctx.strokeRect(x, y, w, h)
      ctx.setLineDash([])

      const badgeRadius = 14
      const bx = x + badgeRadius + 4
      const fitsAbove = y - 4 - badgeRadius >= 0
      const by = fitsAbove ? y - 4 : y + badgeRadius + 4
      ctx.fillStyle = color
      ctx.beginPath()
      ctx.arc(bx, by, badgeRadius, 0, Math.PI * 2)
      ctx.fill()

      ctx.fillStyle = 'white'
      ctx.font = 'bold 14px sans-serif'
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      ctx.fillText(String(item.index), bx, by)
    }
  }

  useEffect(() => {
    renderPreview()
  }, [renderPreview])

  const handleDownload = useCallback(
    (filename?: string) => {
      if (!previewUrl) return
      const a = document.createElement('a')
      a.href = previewUrl
      a.download = filename || 'annotated-screenshot.png'
      a.click()
    },
    [previewUrl],
  )

  const handleCopyImage = useCallback(async () => {
    if (!canvasRef.current) return
    canvasRef.current.toBlob(async (blob) => {
      if (!blob) return
      await navigator.clipboard.write([
        new ClipboardItem({ 'image/png': blob }),
      ])
    })
  }, [])

  const hasPreview = images.length > 0

  return { canvasRef, previewUrl, handleDownload, handleCopyImage, hasPreview }
}
