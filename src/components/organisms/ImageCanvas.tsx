import { useRef, useCallback, useState, useEffect } from 'react'
import { useIdentifyStore } from '@/stores/useIdentifyStore'
import { useColorPicker } from '@/hooks/useColorPicker'
import type { PixelRect } from '@/types'

const BADGE_PAD = 14
const MIN_ZOOM = 0.5
const MAX_ZOOM = 5
const ZOOM_STEP = 0.2

type InteractionMode = 'idle' | 'drawing' | 'panning'

export function ImageCanvas() {
  const {
    image,
    imageDimensions,
    getUnifiedList,
    selectedItemId,
    setSelected,
    addAnnotation,
    removeAnnotation,
    undo,
    redo,
  } = useIdentifyStore()

  const colorPicker = useColorPicker({ imageSrc: image, imageDimensions })

  const containerRef = useRef<HTMLDivElement>(null)
  const [containerSize, setContainerSize] = useState({ w: 0, h: 0 })

  // Zoom & pan
  const [zoom, setZoom] = useState(1)
  const [pan, setPan] = useState({ x: 0, y: 0 })
  const [fitScale, setFitScale] = useState(1) // scale that fits image into container

  // Interaction
  const [mode, setMode] = useState<InteractionMode>('idle')
  const [drawing, setDrawing] = useState<{
    startX: number
    startY: number
    currentX: number
    currentY: number
  } | null>(null)
  const panStart = useRef<{ x: number; y: number; panX: number; panY: number } | null>(null)

  const items = getUnifiedList()

  // Measure container width (height is unreliable before image loads)
  useEffect(() => {
    if (!containerRef.current) return
    const ro = new ResizeObserver((entries) => {
      const { width } = entries[0].contentRect
      setContainerSize((prev) => ({ ...prev, w: width - BADGE_PAD * 2 }))
    })
    ro.observe(containerRef.current)
    return () => ro.disconnect()
  }, [])

  // Compute fit scale based on container width and a fixed max height
  useEffect(() => {
    if (!imageDimensions || containerSize.w <= 0) return
    const MAX_H = 600
    const availW = containerSize.w
    const s = Math.min(availW / imageDimensions.w, MAX_H / imageDimensions.h, 1)
    setFitScale(s)
    setZoom(1)
    // Center after fitScale update — defer to let layout settle
    requestAnimationFrame(() => {
      const el = containerRef.current
      if (!el) return
      const cw = el.clientWidth - BADGE_PAD * 2
      const ch = el.clientHeight - BADGE_PAD * 2
      const iw = imageDimensions.w * s
      const ih = imageDimensions.h * s
      setPan({
        x: Math.max(0, (cw - iw) / 2),
        y: Math.max(0, (ch - ih) / 2),
      })
    })
  }, [imageDimensions, containerSize.w])

  // Effective display dimensions
  const effectiveScale = fitScale * zoom
  const displayW = imageDimensions ? imageDimensions.w * effectiveScale : 0
  const displayH = imageDimensions ? imageDimensions.h * effectiveScale : 0

  /** Compute pan offset to center the image in the container */
  const centerPan = useCallback(() => {
    const el = containerRef.current
    if (!el || !imageDimensions) return { x: 0, y: 0 }
    const cw = el.clientWidth - BADGE_PAD * 2
    const ch = el.clientHeight - BADGE_PAD * 2
    const iw = imageDimensions.w * fitScale
    const ih = imageDimensions.h * fitScale
    return {
      x: Math.max(0, (cw - iw) / 2),
      y: Math.max(0, (ch - ih) / 2),
    }
  }, [imageDimensions, fitScale])

  // Convert client coords → original image pixel coords
  const toPixelCoords = useCallback(
    (clientX: number, clientY: number) => {
      const el = containerRef.current
      if (!el || !imageDimensions) return { px: 0, py: 0 }
      const rect = el.getBoundingClientRect()
      const offsetX = clientX - rect.left - BADGE_PAD - pan.x
      const offsetY = clientY - rect.top - BADGE_PAD - pan.y
      return {
        px: Math.max(0, Math.min(imageDimensions.w, offsetX / effectiveScale)),
        py: Math.max(0, Math.min(imageDimensions.h, offsetY / effectiveScale)),
      }
    },
    [effectiveScale, imageDimensions, pan],
  )

  // ── Mouse handlers ──

  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      // Middle-click or Space+click → pan (always allowed, even in color picker)
      if (e.button === 1 || (e.button === 0 && e.altKey)) {
        setMode('panning')
        panStart.current = { x: e.clientX, y: e.clientY, panX: pan.x, panY: pan.y }
        e.preventDefault()
        return
      }
      if (e.button !== 0) return

      // Color picker mode — pick on click
      if (colorPicker.active) {
        const { px, py } = toPixelCoords(e.clientX, e.clientY)
        colorPicker.onPick(px, py)
        return
      }

      setMode('drawing')
      const { px, py } = toPixelCoords(e.clientX, e.clientY)
      setDrawing({ startX: px, startY: py, currentX: px, currentY: py })
    },
    [toPixelCoords, pan, colorPicker],
  )

  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      if (mode === 'panning' && panStart.current) {
        const dx = e.clientX - panStart.current.x
        const dy = e.clientY - panStart.current.y
        setPan({ x: panStart.current.panX + dx, y: panStart.current.panY + dy })
        return
      }

      // Color picker hover preview
      if (colorPicker.active) {
        const { px, py } = toPixelCoords(e.clientX, e.clientY)
        colorPicker.onHover(px, py)
        return
      }

      if (mode === 'drawing' && drawing) {
        const { px, py } = toPixelCoords(e.clientX, e.clientY)
        setDrawing((prev) => (prev ? { ...prev, currentX: px, currentY: py } : null))
      }
    },
    [mode, drawing, toPixelCoords, colorPicker],
  )

  const handleMouseUp = useCallback(() => {
    if (mode === 'panning') {
      setMode('idle')
      panStart.current = null
      return
    }
    if (colorPicker.active) return
    if (mode === 'drawing' && drawing && imageDimensions) {
      const x = Math.min(drawing.startX, drawing.currentX)
      const y = Math.min(drawing.startY, drawing.currentY)
      const w = Math.abs(drawing.currentX - drawing.startX)
      const h = Math.abs(drawing.currentY - drawing.startY)
      if (w > 5 && h > 5) {
        const rect: PixelRect = { x, y, width: w, height: h }
        addAnnotation(rect)
      }
    }
    setDrawing(null)
    setMode('idle')
  }, [mode, drawing, addAnnotation, imageDimensions, colorPicker.active])

  // ── Wheel: Figma-style scroll/zoom (non-passive to allow preventDefault) ──

  useEffect(() => {
    const el = containerRef.current
    if (!el) return

    const onWheel = (e: WheelEvent) => {
      e.preventDefault()

      // Ctrl/Cmd + scroll → zoom toward cursor
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

      // Shift + scroll → pan horizontally; plain scroll → pan vertically
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
      // Don't intercept when typing in inputs
      const tag = (e.target as HTMLElement)?.tagName
      if (tag === 'INPUT' || tag === 'TEXTAREA') return

      // Ctrl+Z / Cmd+Z → Undo
      if ((e.ctrlKey || e.metaKey) && !e.shiftKey && e.key === 'z') {
        e.preventDefault()
        undo()
        return
      }
      // Ctrl+Shift+Z / Cmd+Shift+Z → Redo
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'z') {
        e.preventDefault()
        redo()
        return
      }
      // Delete / Backspace → Remove selected
      if ((e.key === 'Delete' || e.key === 'Backspace') && selectedItemId) {
        e.preventDefault()
        removeAnnotation(selectedItemId)
        return
      }
      // Escape → Deselect / exit color picker
      if (e.key === 'Escape') {
        if (colorPicker.active) {
          colorPicker.deactivate()
        } else {
          setSelected(null)
        }
        return
      }
      // + / = → Zoom in
      if (e.key === '+' || e.key === '=') {
        setZoom((z) => Math.min(MAX_ZOOM, z + ZOOM_STEP))
        return
      }
      // - → Zoom out
      if (e.key === '-') {
        setZoom((z) => Math.max(MIN_ZOOM, z - ZOOM_STEP))
        return
      }
      // 0 → Reset zoom and center
      if (e.key === '0') {
        setZoom(1)
        requestAnimationFrame(() => setPan(centerPan()))
        return
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [undo, redo, selectedItemId, removeAnnotation, setSelected, centerPan, colorPicker])

  if (!image) return null

  const toDisplay = (px: number) => px * effectiveScale
  const cursor = mode === 'panning'
    ? 'grabbing'
    : colorPicker.active
      ? 'crosshair'
      : 'crosshair'

  return (
    <div className="flex h-full flex-col gap-2 select-none">
      {/* Zoom controls bar */}
      <div className="flex items-center gap-2 text-xs text-zinc-400">
        <button
          type="button"
          onClick={() => setZoom((z) => Math.max(MIN_ZOOM, z - ZOOM_STEP))}
          className="rounded border border-zinc-300 px-1.5 py-0.5 hover:bg-zinc-100 dark:border-zinc-600 dark:hover:bg-zinc-800"
        >
          −
        </button>
        <span className="min-w-[3.5rem] text-center font-mono">
          {Math.round(zoom * 100)}%
        </span>
        <button
          type="button"
          onClick={() => setZoom((z) => Math.min(MAX_ZOOM, z + ZOOM_STEP))}
          className="rounded border border-zinc-300 px-1.5 py-0.5 hover:bg-zinc-100 dark:border-zinc-600 dark:hover:bg-zinc-800"
        >
          +
        </button>
        <button
          type="button"
          onClick={() => {
            setZoom(1)
            requestAnimationFrame(() => setPan(centerPan()))
          }}
          className="rounded border border-zinc-300 px-1.5 py-0.5 hover:bg-zinc-100 dark:border-zinc-600 dark:hover:bg-zinc-800"
        >
          Fit
        </button>

        {/* Divider */}
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

        {/* Hover color preview */}
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
            : `Scroll to pan · ${/Mac|iPhone|iPad/.test(navigator.userAgent) ? '⌘' : 'Ctrl'}+scroll to zoom`}
        </span>
      </div>

      {/* Canvas area */}
      <div
        ref={containerRef}
        className="relative min-h-0 flex-1 overflow-hidden rounded-lg border border-zinc-200 bg-zinc-100 dark:border-zinc-700 dark:bg-zinc-800"
        style={{ cursor, padding: BADGE_PAD }}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        <div
          style={{
            transform: `translate(${pan.x}px, ${pan.y}px)`,
            width: displayW,
            height: displayH,
            position: 'relative',
          }}
        >
          <img
            src={image}
            alt="Uploaded screenshot"
            className="block"
            style={{ width: displayW, height: displayH }}
            draggable={false}
          />

          {/* SVG overlay */}
          <svg
            className="absolute left-0 top-0"
            style={{
              width: displayW,
              height: displayH,
              overflow: 'visible',
            }}
            viewBox={`0 0 ${displayW} ${displayH}`}
            preserveAspectRatio="xMinYMin meet"
          >
            {items.map((item) => {
              const isSelected = item.id === selectedItemId
              const color = '#f97316'
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
                    className={isSelected ? 'animate-pulse' : ''}
                  />
                  <g>
                    <circle cx={dx + 12} cy={dy - 2} r={10} fill={color} />
                    <text
                      x={dx + 12}
                      y={dy + 2}
                      textAnchor="middle"
                      fontSize="11"
                      fontWeight="bold"
                      fill="white"
                    >
                      {item.index}
                    </text>
                  </g>
                </g>
              )
            })}

            {/* Drawing preview */}
            {drawing && (
              <rect
                x={toDisplay(Math.min(drawing.startX, drawing.currentX))}
                y={toDisplay(Math.min(drawing.startY, drawing.currentY))}
                width={toDisplay(Math.abs(drawing.currentX - drawing.startX))}
                height={toDisplay(Math.abs(drawing.currentY - drawing.startY))}
                fill="rgba(249, 115, 22, 0.1)"
                stroke="#f97316"
                strokeWidth={2}
                strokeDasharray="6 3"
                rx={3}
              />
            )}
          </svg>
        </div>
      </div>
    </div>
  )
}
