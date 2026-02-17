import { useRef, useCallback, useState, useEffect } from 'react'
import { useImageStore } from '@/stores/useImageStore'
import { useAnnotationStore } from '@/stores/useAnnotationStore'
import { useColorPicker } from '@/hooks/useColorPicker'
import { Icon } from '@/components/atoms/Icon'
import { snapToAxis } from '@/lib/snap'
import type { PixelRect } from '@/types'

const BADGE_PAD = 14
const MIN_ZOOM = 0.5
const MAX_ZOOM = 5
const ZOOM_STEP = 0.2

type InteractionMode = 'idle' | 'drawing' | 'panning' | 'moving'

export function ImageCanvas() {
  const { images, canvasBounds, selectedLayerId, setSelectedLayer, moveLayer, showImageIds } =
    useImageStore()
  const {
    getUnifiedList,
    selectedItemId,
    setSelected,
    addAnnotation,
    addArrowAnnotation,
    addLineAnnotation,
    addBlurAnnotation,
    removeAnnotation,
    drawingTool,
    setDrawingTool,
    undo,
    redo,
  } = useAnnotationStore()

  const compositeDims =
    canvasBounds.totalWidth > 0
      ? { w: canvasBounds.totalWidth, h: canvasBounds.totalHeight }
      : null

  // Color picker uses first image for sampling (simplified)
  const firstImage = images[0] ?? null
  const colorPicker = useColorPicker({
    imageSrc: firstImage?.dataUrl ?? null,
    imageDimensions: firstImage?.dimensions ?? null,
  })

  const containerRef = useRef<HTMLDivElement>(null)
  const [containerSize, setContainerSize] = useState({ w: 0, h: 0 })

  // Zoom & pan
  const [zoom, setZoom] = useState(1)
  const [pan, setPan] = useState({ x: 0, y: 0 })
  const [fitScale, setFitScale] = useState(1)

  // Interaction
  const [mode, setMode] = useState<InteractionMode>('idle')
  const [drawing, setDrawing] = useState<{
    startX: number
    startY: number
    currentX: number
    currentY: number
  } | null>(null)
  const [shiftHeld, setShiftHeld] = useState(false)
  const panStart = useRef<{
    x: number
    y: number
    panX: number
    panY: number
  } | null>(null)

  // Layer drag state
  const layerDragStart = useRef<{
    imageX: number
    imageY: number
    clientX: number
    clientY: number
  } | null>(null)

  const items = getUnifiedList()

  // Measure container width
  useEffect(() => {
    if (!containerRef.current) return
    const ro = new ResizeObserver((entries) => {
      const { width } = entries[0].contentRect
      setContainerSize((prev) => ({ ...prev, w: width - BADGE_PAD * 2 }))
    })
    ro.observe(containerRef.current)
    return () => ro.disconnect()
  }, [])

  // Compute fit scale based on composite dimensions
  useEffect(() => {
    if (!compositeDims || containerSize.w <= 0) return
    const MAX_H = 600
    const availW = containerSize.w
    const s = Math.min(
      availW / compositeDims.w,
      MAX_H / compositeDims.h,
      1,
    )
    setFitScale(s)
    setZoom(1)
    requestAnimationFrame(() => {
      const el = containerRef.current
      if (!el) return
      const cw = el.clientWidth - BADGE_PAD * 2
      const ch = el.clientHeight - BADGE_PAD * 2
      const iw = compositeDims.w * s
      const ih = compositeDims.h * s
      setPan({
        x: Math.max(0, (cw - iw) / 2),
        y: Math.max(0, (ch - ih) / 2),
      })
    })
  }, [compositeDims?.w, compositeDims?.h, containerSize.w])

  const effectiveScale = fitScale * zoom
  const displayW = compositeDims ? compositeDims.w * effectiveScale : 0
  const displayH = compositeDims ? compositeDims.h * effectiveScale : 0

  const centerPan = useCallback(() => {
    const el = containerRef.current
    if (!el || !compositeDims) return { x: 0, y: 0 }
    const cw = el.clientWidth - BADGE_PAD * 2
    const ch = el.clientHeight - BADGE_PAD * 2
    const iw = compositeDims.w * fitScale
    const ih = compositeDims.h * fitScale
    return {
      x: Math.max(0, (cw - iw) / 2),
      y: Math.max(0, (ch - ih) / 2),
    }
  }, [compositeDims, fitScale])

  // Convert client coords to composite pixel coords
  const toPixelCoords = useCallback(
    (clientX: number, clientY: number) => {
      const el = containerRef.current
      if (!el || !compositeDims) return { px: 0, py: 0 }
      const rect = el.getBoundingClientRect()
      const offsetX = clientX - rect.left - BADGE_PAD - pan.x
      const offsetY = clientY - rect.top - BADGE_PAD - pan.y
      return {
        px: Math.max(
          0,
          Math.min(compositeDims.w, offsetX / effectiveScale),
        ),
        py: Math.max(
          0,
          Math.min(compositeDims.h, offsetY / effectiveScale),
        ),
      }
    },
    [effectiveScale, compositeDims, pan],
  )

  /** Check if a pixel coord falls within the selected layer */
  const isInsideSelectedLayer = useCallback(
    (px: number, py: number) => {
      if (!selectedLayerId) return false
      const layer = images.find((img) => img.id === selectedLayerId)
      if (!layer) return false
      return (
        px >= layer.x &&
        px <= layer.x + layer.dimensions.w &&
        py >= layer.y &&
        py <= layer.y + layer.dimensions.h
      )
    },
    [selectedLayerId, images],
  )

  // ── Mouse handlers ──

  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      if (e.button === 1 || (e.button === 0 && e.altKey)) {
        setMode('panning')
        panStart.current = {
          x: e.clientX,
          y: e.clientY,
          panX: pan.x,
          panY: pan.y,
        }
        e.preventDefault()
        return
      }
      if (e.button !== 0) return

      if (colorPicker.active) {
        const { px, py } = toPixelCoords(e.clientX, e.clientY)
        colorPicker.onPick(px, py)
        return
      }

      // If a layer is selected, check if click is inside it → start moving
      // Clicking outside the layer deselects it without starting a draw
      if (selectedLayerId) {
        const { px, py } = toPixelCoords(e.clientX, e.clientY)
        if (isInsideSelectedLayer(px, py)) {
          const layer = images.find((img) => img.id === selectedLayerId)!
          setMode('moving')
          layerDragStart.current = {
            imageX: layer.x,
            imageY: layer.y,
            clientX: e.clientX,
            clientY: e.clientY,
          }
          e.preventDefault()
          return
        }
        setSelectedLayer(null)
        return
      }

      setMode('drawing')
      const { px, py } = toPixelCoords(e.clientX, e.clientY)
      setDrawing({ startX: px, startY: py, currentX: px, currentY: py })
    },
    [toPixelCoords, pan, colorPicker, selectedLayerId, isInsideSelectedLayer, images, setSelectedLayer],
  )

  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      if (mode === 'panning' && panStart.current) {
        const dx = e.clientX - panStart.current.x
        const dy = e.clientY - panStart.current.y
        setPan({
          x: panStart.current.panX + dx,
          y: panStart.current.panY + dy,
        })
        return
      }

      if (mode === 'moving' && layerDragStart.current && selectedLayerId) {
        const dx = (e.clientX - layerDragStart.current.clientX) / effectiveScale
        const dy = (e.clientY - layerDragStart.current.clientY) / effectiveScale
        moveLayer(
          selectedLayerId,
          layerDragStart.current.imageX + dx,
          layerDragStart.current.imageY + dy,
        )
        return
      }

      if (colorPicker.active) {
        const { px, py } = toPixelCoords(e.clientX, e.clientY)
        colorPicker.onHover(px, py)
        return
      }

      if (mode === 'drawing' && drawing) {
        setShiftHeld(e.shiftKey)
        const { px, py } = toPixelCoords(e.clientX, e.clientY)
        setDrawing((prev) =>
          prev ? { ...prev, currentX: px, currentY: py } : null,
        )
      }
    },
    [mode, drawing, toPixelCoords, colorPicker, selectedLayerId, effectiveScale, moveLayer],
  )

  const handleMouseUp = useCallback((e?: React.MouseEvent) => {
    if (mode === 'panning') {
      setMode('idle')
      panStart.current = null
      return
    }
    if (mode === 'moving') {
      // Push history snapshot after layer drag ends
      const state = useImageStore.getState()
      const { imageHistory, imageHistoryIndex, images: currentImages } = state
      const truncated = imageHistory.slice(0, imageHistoryIndex + 1)
      const next = [...truncated, { images: currentImages }]
      if (next.length > MAX_HISTORY) next.shift()
      useImageStore.setState({
        imageHistory: next,
        imageHistoryIndex: next.length - 1,
      })

      setMode('idle')
      layerDragStart.current = null
      return
    }
    if (colorPicker.active) return
    if (mode === 'drawing' && drawing && compositeDims) {
      const isShift = e?.shiftKey ?? shiftHeld
      if (drawingTool === 'arrow' || drawingTool === 'line') {
        let endX = drawing.currentX
        let endY = drawing.currentY
        if (isShift) {
          const snapped = snapToAxis(drawing.startX, drawing.startY, endX, endY)
          endX = snapped.x
          endY = snapped.y
        }
        const len = Math.hypot(endX - drawing.startX, endY - drawing.startY)
        if (len > 10) {
          const points = {
            x1: drawing.startX,
            y1: drawing.startY,
            x2: endX,
            y2: endY,
          }
          if (drawingTool === 'arrow') {
            addArrowAnnotation(points)
          } else {
            addLineAnnotation(points)
          }
        }
      } else {
        const x = Math.min(drawing.startX, drawing.currentX)
        const y = Math.min(drawing.startY, drawing.currentY)
        const w = Math.abs(drawing.currentX - drawing.startX)
        const h = Math.abs(drawing.currentY - drawing.startY)
        if (w > 5 && h > 5) {
          const rect: PixelRect = { x, y, width: w, height: h }
          if (drawingTool === 'blur') {
            addBlurAnnotation(rect)
          } else {
            addAnnotation(rect)
          }
        }
      }
    }
    setDrawing(null)
    setShiftHeld(false)
    setMode('idle')
  }, [mode, drawing, addAnnotation, addArrowAnnotation, addLineAnnotation, addBlurAnnotation, drawingTool, compositeDims, colorPicker.active, shiftHeld])

  // ── Wheel: Figma-style scroll/zoom ──

  useEffect(() => {
    const el = containerRef.current
    if (!el) return

    const onWheel = (e: WheelEvent) => {
      e.preventDefault()

      if (e.ctrlKey || e.metaKey) {
        const delta = -e.deltaY * 0.01
        setZoom((z) => {
          const next = Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, z + delta))
          const rect = el.getBoundingClientRect()
          const cx = e.clientX - rect.left - BADGE_PAD
          const cy = e.clientY - rect.top - BADGE_PAD
          const scale = next / z
          setPan((p) => ({
            x: cx - (cx - p.x) * scale,
            y: cy - (cy - p.y) * scale,
          }))
          return next
        })
        return
      }

      setPan((p) => ({
        x: p.x - (e.shiftKey ? e.deltaY || e.deltaX : e.deltaX),
        y: p.y - (e.shiftKey ? 0 : e.deltaY),
      }))
    }

    el.addEventListener('wheel', onWheel, { passive: false })
    return () => el.removeEventListener('wheel', onWheel)
  }, [])

  // ── Keyboard shortcuts ──

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement)?.tagName
      if (tag === 'INPUT' || tag === 'TEXTAREA') return

      if ((e.ctrlKey || e.metaKey) && !e.shiftKey && e.key === 'z') {
        e.preventDefault()
        undo()
        return
      }
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'z') {
        e.preventDefault()
        redo()
        return
      }
      if (
        (e.key === 'Delete' || e.key === 'Backspace') &&
        selectedItemId
      ) {
        e.preventDefault()
        removeAnnotation(selectedItemId)
        return
      }
      if (e.key === 'Escape') {
        if (drawingTool === 'blur') {
          setDrawingTool('box')
        } else if (drawingTool === 'line') {
          setDrawingTool('box')
        } else if (drawingTool === 'arrow') {
          setDrawingTool('box')
        } else if (colorPicker.active) {
          colorPicker.deactivate()
        } else if (selectedLayerId) {
          setSelectedLayer(null)
        } else {
          setSelected(null)
        }
        return
      }
      if (e.key === '+' || e.key === '=') {
        setZoom((z) => Math.min(MAX_ZOOM, z + ZOOM_STEP))
        return
      }
      if (e.key === '-') {
        setZoom((z) => Math.max(MIN_ZOOM, z - ZOOM_STEP))
        return
      }
      if (e.key === '0') {
        setZoom(1)
        requestAnimationFrame(() => setPan(centerPan()))
        return
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [
    undo,
    redo,
    selectedItemId,
    removeAnnotation,
    setSelected,
    centerPan,
    colorPicker,
    selectedLayerId,
    setSelectedLayer,
    drawingTool,
    setDrawingTool,
  ])

  if (images.length === 0) return null

  const toDisplay = (px: number) => px * effectiveScale

  const getCursor = () => {
    if (mode === 'panning') return 'grabbing'
    if (mode === 'moving') return 'grabbing'
    if (colorPicker.active) return 'crosshair'
    if (selectedLayerId) return 'grab'
    return 'crosshair'
  }

  return (
    <div className="flex h-full flex-col gap-2 select-none">
      {/* Zoom controls bar */}
      <div className="flex items-center gap-2 text-xs text-zinc-400">
        <button
          type="button"
          onClick={() =>
            setZoom((z) => Math.max(MIN_ZOOM, z - ZOOM_STEP))
          }
          className="flex h-6 items-center justify-center rounded border border-zinc-300 px-1.5 hover:bg-zinc-100 dark:border-zinc-600 dark:hover:bg-zinc-800"
        >
          −
        </button>
        <span className="min-w-14 text-center font-mono">
          {Math.round(zoom * 100)}%
        </span>
        <button
          type="button"
          onClick={() =>
            setZoom((z) => Math.min(MAX_ZOOM, z + ZOOM_STEP))
          }
          className="flex h-6 items-center justify-center rounded border border-zinc-300 px-1.5 hover:bg-zinc-100 dark:border-zinc-600 dark:hover:bg-zinc-800"
        >
          +
        </button>
        <button
          type="button"
          onClick={() => {
            setZoom(1)
            requestAnimationFrame(() => setPan(centerPan()))
          }}
          className="flex h-6 items-center justify-center rounded border border-zinc-300 px-1.5 hover:bg-zinc-100 dark:border-zinc-600 dark:hover:bg-zinc-800"
        >
          Fit
        </button>

        <div className="mx-1 h-4 w-px bg-zinc-300 dark:bg-zinc-600" />

        {/* Drawing tool selector */}
        <div className="flex items-center gap-0.5 rounded border border-zinc-300 dark:border-zinc-600">
          <button
            type="button"
            onClick={() => setDrawingTool('box')}
            title="Box tool"
            className={`flex h-6 items-center justify-center rounded-l px-1.5 transition-colors ${
              drawingTool === 'box'
                ? 'bg-orange-500 text-white'
                : 'hover:bg-zinc-100 dark:hover:bg-zinc-800'
            }`}
          >
            <Icon name="squareOutline" size={14} />
          </button>
          <button
            type="button"
            onClick={() => setDrawingTool('arrow')}
            title="Arrow tool"
            className={`flex h-6 items-center justify-center px-1.5 transition-colors ${
              drawingTool === 'arrow'
                ? 'bg-orange-500 text-white'
                : 'hover:bg-zinc-100 dark:hover:bg-zinc-800'
            }`}
          >
            <Icon name="arrowUpRight" size={14} />
          </button>
          <button
            type="button"
            onClick={() => setDrawingTool('line')}
            title="Line tool — hold Shift to snap"
            className={`flex h-6 items-center justify-center px-1.5 transition-colors ${
              drawingTool === 'line'
                ? 'bg-orange-500 text-white'
                : 'hover:bg-zinc-100 dark:hover:bg-zinc-800'
            }`}
          >
            <Icon name="lineSegment" size={14} />
          </button>
          <button
            type="button"
            onClick={() => setDrawingTool('blur')}
            title="Blur box tool — hide sensitive data"
            className={`flex h-6 items-center justify-center rounded-r px-1.5 transition-colors ${
              drawingTool === 'blur'
                ? 'bg-blue-500 text-white'
                : 'hover:bg-zinc-100 dark:hover:bg-zinc-800'
            }`}
          >
            <Icon name="eyeSlash" size={14} />
          </button>
        </div>

        <div className="mx-1 h-4 w-px bg-zinc-300 dark:bg-zinc-600" />

        {/* Color picker toggle */}
        <button
          type="button"
          onClick={colorPicker.toggle}
          title="Color Picker (click on image to copy hex)"
          className={`flex items-center gap-1 rounded border px-1.5 py-0.5 transition-colors ${
            colorPicker.active
              ? 'border-primary-600 bg-primary-600 text-white dark:border-primary-500 dark:bg-primary-500'
              : 'border-zinc-300 hover:bg-zinc-100 dark:border-zinc-600 dark:hover:bg-zinc-800'
          }`}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="6.5 8.5 14 15"
            strokeWidth={1.5}
            stroke="currentColor"
            width={12}
            height={12}
            className="shrink-0"
            style={{ display: 'block' }}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M15 11.25l1.5-1.5a2.121 2.121 0 113 3L18 14.25M15 11.25l-7.5 7.5V22.5h3.75l7.5-7.5M15 11.25L18.75 15"
            />
          </svg>
          Pick Color
        </button>

        {colorPicker.active && colorPicker.hoverColor && (
          <div className="flex items-center gap-1.5">
            <div
              className="h-4 w-4 rounded border border-zinc-300 dark:border-zinc-600"
              style={{ backgroundColor: colorPicker.hoverColor }}
            />
            <span className="font-mono text-zinc-600 dark:text-zinc-300">
              {colorPicker.hoverColor}
            </span>
          </div>
        )}

        <span className="ml-auto text-zinc-500 dark:text-zinc-500">
          {colorPicker.active
            ? 'Click to pick color · Esc to exit'
            : selectedLayerId
              ? 'Drag to move layer · Esc to deselect'
              : drawingTool === 'arrow'
                ? 'Drag to draw arrow · Shift to snap · Esc to switch back to box'
                : drawingTool === 'line'
                  ? 'Drag to draw line · Shift to snap · Esc to switch back to box'
                  : drawingTool === 'blur'
                    ? 'Drag to draw blur box · Esc to switch back to box'
                  : `${/Mac|iPhone|iPad/.test(navigator.userAgent) ? '⌘V' : 'Ctrl+V'} to paste · Scroll to pan · ${/Mac|iPhone|iPad/.test(navigator.userAgent) ? '⌘' : 'Ctrl'}+scroll to zoom`}
        </span>
      </div>

      {/* Canvas area */}
      <div
        ref={containerRef}
        className="relative min-h-0 flex-1 overflow-hidden rounded-lg border border-zinc-200 bg-zinc-100 dark:border-zinc-700 dark:bg-zinc-800"
        style={{ cursor: getCursor(), padding: BADGE_PAD }}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        <div
          className="bg-zinc-200/60 dark:bg-zinc-700/40"
          style={{
            transform: `translate(${pan.x}px, ${pan.y}px)`,
            width: displayW,
            height: displayH,
            position: 'relative',
          }}
        >
          {/* Render each image at its position (array order = z-order, index 0 = back) */}
          {images.map((img) => (
            <img
              key={img.id}
              src={img.dataUrl}
              alt="Uploaded image"
              className="absolute block"
              style={{
                left: toDisplay(img.x),
                top: toDisplay(img.y),
                width: toDisplay(img.dimensions.w),
                height: toDisplay(img.dimensions.h),
                outline:
                  img.id === selectedLayerId
                    ? '2px solid #3b82f6'
                    : undefined,
                outlineOffset:
                  img.id === selectedLayerId ? '-1px' : undefined,
              }}
              draggable={false}
            />
          ))}

          {/* Image ID badges — hidden when only 1 image */}
          {showImageIds &&
            images.length > 1 &&
            images.map((img) => {
              const badgeSize = 24
              const fontSize = badgeSize * 0.5
              return (
                <div
                  key={`badge-${img.id}`}
                  className="pointer-events-none absolute flex items-center justify-center"
                  style={{
                    left: toDisplay(img.x) + 6,
                    top: toDisplay(img.y) + 6,
                    width: badgeSize,
                    height: badgeSize,
                    borderRadius: '50%',
                    border: '2px solid #9ca3af',
                    backgroundColor: 'rgba(75, 85, 99, 0.7)',
                    color: '#e5e7eb',
                    fontSize,
                    fontWeight: 700,
                    lineHeight: 1,
                    zIndex: 1,
                  }}
                >
                  {img.displayId}
                </div>
              )
            })}

          {/* Blur box overlays — rendered as DOM elements for backdrop-filter */}
          {items
            .filter((item) => item.kind === 'blur')
            .map((item) => {
              const dx = toDisplay(item.rect.x)
              const dy = toDisplay(item.rect.y)
              const badgeSize = 20
              const fitsAbove = dy - 2 - badgeSize / 2 >= 0
              const badgeLeft = dx + 12 - badgeSize / 2
              const badgeTop = fitsAbove
                ? dy - 2 - badgeSize / 2
                : dy + badgeSize / 2 + 4 - badgeSize / 2
              return (
                <div key={`blur-${item.id}`}>
                  {/* Blur overlay */}
                  <div
                    onClick={(e) => {
                      e.stopPropagation()
                      setSelected(item.id)
                    }}
                    className="absolute cursor-pointer"
                    style={{
                      left: toDisplay(item.rect.x),
                      top: toDisplay(item.rect.y),
                      width: toDisplay(item.rect.width),
                      height: toDisplay(item.rect.height),
                      backdropFilter: 'blur(8px)',
                      WebkitBackdropFilter: 'blur(8px)',
                      backgroundColor: 'rgba(0, 0, 0, 0.05)',
                      borderWidth: 2,
                      borderStyle: 'dashed',
                      borderColor: '#3b82f6',
                      backgroundClip: 'padding-box',
                      borderRadius: 3,
                      zIndex: 1,
                    }}
                  />
                  {/* Badge — rendered above blur overlay */}
                  <div
                    className="pointer-events-none absolute flex items-center justify-center rounded-full"
                    style={{
                      left: badgeLeft,
                      top: badgeTop,
                      width: badgeSize,
                      height: badgeSize,
                      backgroundColor: '#3b82f6',
                      color: 'white',
                      fontSize: 11,
                      fontWeight: 700,
                      lineHeight: 1,
                      zIndex: 3,
                    }}
                  >
                    {item.index}
                  </div>
                </div>
              )
            })}

          {/* SVG overlay for annotations */}
          <svg
            className="absolute left-0 top-0"
            style={{
              width: displayW,
              height: displayH,
              overflow: 'visible',
              zIndex: 2,
            }}
            viewBox={`0 0 ${displayW} ${displayH}`}
            preserveAspectRatio="xMinYMin meet"
          >
            <defs>
              <marker
                id="arrowhead"
                markerWidth="10"
                markerHeight="7"
                refX="9"
                refY="3.5"
                orient="auto"
                fill="#f97316"
              >
                <polygon points="0 0, 10 3.5, 0 7" />
              </marker>
              <marker
                id="arrowhead-preview"
                markerWidth="10"
                markerHeight="7"
                refX="9"
                refY="3.5"
                orient="auto"
                fill="#f97316"
              >
                <polygon points="0 0, 10 3.5, 0 7" />
              </marker>
            </defs>
            {items.filter((item) => item.kind !== 'blur').map((item) => {
              const isSelected = item.id === selectedItemId
              const color = '#f97316'

              if ((item.kind === 'arrow' || item.kind === 'line') && item.arrow) {
                const ax1 = toDisplay(item.arrow.x1)
                const ay1 = toDisplay(item.arrow.y1)
                const ax2 = toDisplay(item.arrow.x2)
                const ay2 = toDisplay(item.arrow.y2)
                const badgeR = 10
                return (
                  <g
                    key={item.id}
                    onClick={(e) => {
                      e.stopPropagation()
                      setSelected(item.id)
                    }}
                    className="cursor-pointer"
                  >
                    <line
                      x1={ax1}
                      y1={ay1}
                      x2={ax2}
                      y2={ay2}
                      stroke="transparent"
                      strokeWidth={12}
                    />
                    <line
                      x1={ax1}
                      y1={ay1}
                      x2={ax2}
                      y2={ay2}
                      stroke={color}
                      strokeWidth={isSelected ? 3 : 2}
                      strokeDasharray={isSelected ? '6 3' : undefined}
                      markerEnd={item.kind === 'arrow' ? 'url(#arrowhead)' : undefined}
                      style={isSelected ? { animation: 'marching-ants 0.4s linear infinite' } : undefined}
                    />
                    <circle cx={ax1} cy={ay1} r={badgeR} fill={color} />
                    <text
                      x={ax1}
                      y={ay1 + 4}
                      textAnchor="middle"
                      fontSize="11"
                      fontWeight="bold"
                      fill="white"
                    >
                      {item.index}
                    </text>
                  </g>
                )
              }

              const dx = toDisplay(item.rect.x)
              const dy = toDisplay(item.rect.y)
              const dw = toDisplay(item.rect.width)
              const dh = toDisplay(item.rect.height)

              return (
                <g
                  key={item.id}
                  onClick={(e) => {
                    e.stopPropagation()
                    setSelected(item.id)
                  }}
                  className="cursor-pointer"
                >
                  <rect
                    x={dx}
                    y={dy}
                    width={dw}
                    height={dh}
                    fill={`${color}15`}
                    stroke={color}
                    strokeWidth={isSelected ? 3 : 2}
                    strokeDasharray="6 3"
                    rx={3}
                    style={isSelected ? { animation: 'marching-ants 0.4s linear infinite' } : undefined}
                  />
                  <g>
                    {(() => {
                      const badgeR = 10
                      const fitsAbove = dy - 2 - badgeR >= 0
                      const bx = dx + 12
                      const by = fitsAbove ? dy - 2 : dy + badgeR + 4
                      return (
                        <>
                          <circle
                            cx={bx}
                            cy={by}
                            r={badgeR}
                            fill={color}
                          />
                          <text
                            x={bx}
                            y={by + 4}
                            textAnchor="middle"
                            fontSize="11"
                            fontWeight="bold"
                            fill="white"
                          >
                            {item.index}
                          </text>
                        </>
                      )
                    })()}
                  </g>
                </g>
              )
            })}

            {/* Marching-ants selection border for blur boxes */}
            {items
              .filter((item) => item.kind === 'blur' && item.id === selectedItemId)
              .map((item) => (
                <rect
                  key={`blur-sel-${item.id}`}
                  x={toDisplay(item.rect.x)}
                  y={toDisplay(item.rect.y)}
                  width={toDisplay(item.rect.width)}
                  height={toDisplay(item.rect.height)}
                  fill="none"
                  stroke="#3b82f6"
                  strokeWidth={3}
                  strokeDasharray="6 3"
                  rx={3}
                  style={{ animation: 'marching-ants 0.4s linear infinite' }}
                  pointerEvents="none"
                />
              ))}

            {/* Drawing preview */}
            {drawing && (drawingTool === 'arrow' || drawingTool === 'line') ? (
              (() => {
                let ex = drawing.currentX
                let ey = drawing.currentY
                if (shiftHeld) {
                  const snapped = snapToAxis(drawing.startX, drawing.startY, ex, ey)
                  ex = snapped.x
                  ey = snapped.y
                }
                return (
                  <line
                    x1={toDisplay(drawing.startX)}
                    y1={toDisplay(drawing.startY)}
                    x2={toDisplay(ex)}
                    y2={toDisplay(ey)}
                    stroke="#f97316"
                    strokeWidth={2}
                    strokeDasharray="6 3"
                    markerEnd={drawingTool === 'arrow' ? 'url(#arrowhead-preview)' : undefined}
                  />
                )
              })()
            ) : drawing && drawingTool === 'blur' ? (
              <rect
                x={toDisplay(Math.min(drawing.startX, drawing.currentX))}
                y={toDisplay(Math.min(drawing.startY, drawing.currentY))}
                width={toDisplay(
                  Math.abs(drawing.currentX - drawing.startX),
                )}
                height={toDisplay(
                  Math.abs(drawing.currentY - drawing.startY),
                )}
                fill="rgba(59, 130, 246, 0.15)"
                stroke="#3b82f6"
                strokeWidth={2}
                strokeDasharray="6 3"
                rx={3}
              />
            ) : drawing ? (
              <rect
                x={toDisplay(Math.min(drawing.startX, drawing.currentX))}
                y={toDisplay(Math.min(drawing.startY, drawing.currentY))}
                width={toDisplay(
                  Math.abs(drawing.currentX - drawing.startX),
                )}
                height={toDisplay(
                  Math.abs(drawing.currentY - drawing.startY),
                )}
                fill="rgba(249, 115, 22, 0.1)"
                stroke="#f97316"
                strokeWidth={2}
                strokeDasharray="6 3"
                rx={3}
              />
            ) : null}
          </svg>
        </div>
      </div>
    </div>
  )
}

const MAX_HISTORY = 50
