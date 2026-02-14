import { useRef, useCallback, useEffect, useState } from 'react'
import { getPixelColor } from '@/lib/color'
import { useToastStore } from '@/stores/useToastStore'

interface UseColorPickerOptions {
  /** Data-URL of the loaded image */
  imageSrc: string | null
  /** Natural (original) dimensions of the image */
  imageDimensions: { w: number; h: number } | null
}

interface UseColorPickerReturn {
  /** Whether the eyedropper mode is active */
  active: boolean
  /** Toggle eyedropper mode on/off */
  toggle: () => void
  /** Turn off eyedropper mode */
  deactivate: () => void
  /** The color currently under the cursor (while hovering) */
  hoverColor: string | null
  /** Call on mouse-move with original-image pixel coords */
  onHover: (px: number, py: number) => void
  /** Call on click with original-image pixel coords. Copies hex to clipboard. */
  onPick: (px: number, py: number) => Promise<void>
}

/**
 * Manages an off-screen canvas used to sample pixel colors from the uploaded
 * image.  Provides hover preview and click-to-copy-to-clipboard behaviour.
 */
export function useColorPicker({
  imageSrc,
  imageDimensions,
}: UseColorPickerOptions): UseColorPickerReturn {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const imageDataRef = useRef<ImageData | null>(null)

  const [active, setActive] = useState(false)
  const [hoverColor, setHoverColor] = useState<string | null>(null)

  const addToast = useToastStore((s) => s.addToast)

  // Reset state when image changes (during render, not in an effect)
  const [prevImageSrc, setPrevImageSrc] = useState(imageSrc)
  if (prevImageSrc !== imageSrc) {
    setPrevImageSrc(imageSrc)
    setActive(false)
    setHoverColor(null)
  }

  // Draw the source image onto a hidden canvas so we can read pixel data
  useEffect(() => {
    if (!imageSrc || !imageDimensions) {
      imageDataRef.current = null
      return
    }

    const canvas = document.createElement('canvas')
    canvas.width = imageDimensions.w
    canvas.height = imageDimensions.h
    canvasRef.current = canvas

    const ctx = canvas.getContext('2d', { willReadFrequently: true })
    if (!ctx) return

    const img = new Image()
    img.onload = () => {
      ctx.drawImage(img, 0, 0)
      imageDataRef.current = ctx.getImageData(
        0,
        0,
        imageDimensions.w,
        imageDimensions.h,
      )
    }
    img.src = imageSrc
  }, [imageSrc, imageDimensions])

  const toggle = useCallback(() => {
    setActive((prev) => {
      if (prev) {
        // Turning off — clear hover
        setHoverColor(null)
      }
      return !prev
    })
  }, [])

  const deactivate = useCallback(() => {
    setActive(false)
    setHoverColor(null)
  }, [])

  const onHover = useCallback(
    (px: number, py: number) => {
      if (!active || !imageDataRef.current) return
      setHoverColor(getPixelColor(imageDataRef.current, px, py))
    },
    [active],
  )

  const onPick = useCallback(
    async (px: number, py: number) => {
      if (!active || !imageDataRef.current) return
      const hex = getPixelColor(imageDataRef.current, px, py)

      try {
        await navigator.clipboard.writeText(hex)
        addToast({ message: `Copied ${hex}`, colorSwatch: hex })
      } catch {
        addToast({ message: `${hex} (clipboard unavailable)`, colorSwatch: hex })
      }
    },
    [active, addToast],
  )

  return {
    active,
    toggle,
    deactivate,
    hoverColor,
    onHover,
    onPick,
  }
}
