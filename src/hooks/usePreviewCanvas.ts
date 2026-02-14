import { useRef, useEffect, useCallback, useState } from 'react'
import { useIdentifyStore } from '@/stores/useIdentifyStore'

/**
 * Hook that renders the annotated screenshot onto a hidden <canvas>
 * and exposes the preview data-URL + download / copy-image actions.
 *
 * Returns the canvasRef that must be placed in a hidden <canvas> element.
 */
export function usePreviewCanvas() {
  const { image, imageDimensions, getUnifiedList } = useIdentifyStore()
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const items = getUnifiedList()

  const renderPreview = useCallback(() => {
    if (!canvasRef.current || !image || !imageDimensions) return

    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')!
    const img = new Image()

    img.onload = () => {
      canvas.width = imageDimensions.w
      canvas.height = imageDimensions.h
      ctx.drawImage(img, 0, 0)

      for (const item of items) {
        const color = '#f97316'
        const x = item.rect.x
        const y = item.rect.y
        const w = item.rect.width
        const h = item.rect.height

        // Fill
        ctx.fillStyle = `${color}20`
        ctx.fillRect(x, y, w, h)

        // Border
        ctx.strokeStyle = color
        ctx.lineWidth = 3
        ctx.setLineDash([8, 4])
        ctx.strokeRect(x, y, w, h)
        ctx.setLineDash([])

        // Index badge
        const badgeRadius = 14
        const bx = x + badgeRadius + 4
        const by = y - 4
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

      setPreviewUrl(canvas.toDataURL('image/png'))
    }
    img.src = image
  }, [image, imageDimensions, items])

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

  const hasPreview = !!image && items.length > 0

  return { canvasRef, previewUrl, handleDownload, handleCopyImage, hasPreview }
}
