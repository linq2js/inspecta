import { useRef, useState, useCallback, useEffect, type ReactNode } from 'react'

interface ResizablePanelProps {
  left: ReactNode
  right: ReactNode
  defaultLeftPercent?: number
  minLeftPercent?: number
  maxLeftPercent?: number
  storageKey?: string
  className?: string
}

export function ResizablePanel({
  left,
  right,
  defaultLeftPercent = 40,
  minLeftPercent = 20,
  maxLeftPercent = 80,
  storageKey,
  className = '',
}: ResizablePanelProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [leftPercent, setLeftPercent] = useState(() => {
    if (storageKey) {
      const saved = localStorage.getItem(`resize-${storageKey}`)
      if (saved) {
        const parsed = parseFloat(saved)
        if (!isNaN(parsed) && parsed >= minLeftPercent && parsed <= maxLeftPercent) {
          return parsed
        }
      }
    }
    return defaultLeftPercent
  })
  const isDragging = useRef(false)

  useEffect(() => {
    if (storageKey) {
      localStorage.setItem(`resize-${storageKey}`, String(leftPercent))
    }
  }, [leftPercent, storageKey])

  const handlePointerDown = useCallback(
    (e: React.PointerEvent) => {
      e.preventDefault()
      isDragging.current = true
      ;(e.target as HTMLElement).setPointerCapture(e.pointerId)
    },
    [],
  )

  const handlePointerMove = useCallback(
    (e: React.PointerEvent) => {
      if (!isDragging.current || !containerRef.current) return
      const rect = containerRef.current.getBoundingClientRect()
      const x = e.clientX - rect.left
      const pct = (x / rect.width) * 100
      setLeftPercent(Math.min(maxLeftPercent, Math.max(minLeftPercent, pct)))
    },
    [minLeftPercent, maxLeftPercent],
  )

  const handlePointerUp = useCallback(() => {
    isDragging.current = false
  }, [])

  return (
    <div
      ref={containerRef}
      className={`flex h-full ${className}`}
      style={{ position: 'relative' }}
    >
      <div className="min-w-0 overflow-hidden" style={{ width: `${leftPercent}%` }}>
        {left}
      </div>

      {/* Drag handle */}
      <div
        className="relative z-10 flex w-2 shrink-0 cursor-col-resize items-center justify-center hover:bg-primary-100 dark:hover:bg-primary-900/30 transition-colors"
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
      >
        <div className="h-8 w-0.5 rounded-full bg-zinc-300 dark:bg-zinc-600" />
      </div>

      <div className="min-w-0 flex-1 overflow-hidden">
        {right}
      </div>
    </div>
  )
}
