import { useRef, useEffect, useCallback } from 'react'
import { IndexBadge } from '@/components/atoms/IndexBadge'
import { Icon } from '@/components/atoms/Icon'
import { useAnnotationStore } from '@/stores/useAnnotationStore'

export function UnifiedItemList() {
  const {
    getUnifiedList,
    selectedItemId,
    setSelected,
    setItemNote,
    removeAnnotation,
    clearAnnotations,
  } = useAnnotationStore()

  const items = getUnifiedList()
  const listRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!selectedItemId || !listRef.current) return
    const el = listRef.current.querySelector(
      `[data-item-id="${selectedItemId}"]`,
    )
    el?.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
  }, [selectedItemId])

  return (
    <div className="flex h-full flex-col">
      <div className="mb-2 flex shrink-0 items-center justify-between">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
          Annotations ({items.length})
        </h3>
        {items.length > 0 && (
          <button
            type="button"
            onClick={clearAnnotations}
            className="text-xs text-zinc-400 transition-colors hover:text-red-500"
          >
            Clear all
          </button>
        )}
      </div>

      <div ref={listRef} className="min-h-0 flex-1 overflow-y-auto">
        {items.length > 0 ? (
          <div className="space-y-2">
            {items.map((item) => {
              const isSelected = item.id === selectedItemId
              return (
                <div
                  key={item.id}
                  data-item-id={item.id}
                  onClick={() => setSelected(item.id)}
                  className={`cursor-pointer rounded-lg border p-3 transition-colors ${
                    isSelected
                      ? 'border-orange-400 bg-orange-50 dark:border-orange-600 dark:bg-orange-950/30'
                      : 'border-zinc-200 hover:border-zinc-300 dark:border-zinc-700 dark:hover:border-zinc-600'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <IndexBadge
                      index={item.index}
                      type="annotation"
                      size="sm"
                    />
                    <div className="flex min-w-0 flex-1 items-baseline gap-1.5">
                      <span className="shrink-0 text-sm text-zinc-700 dark:text-zinc-300">
                        {item.kind === 'arrow'
                          ? 'Arrow'
                          : item.kind === 'line'
                            ? 'Line'
                            : item.kind === 'blur'
                              ? 'Blur'
                              : 'Box'}
                      </span>
                      {item.kind === 'blur' ? (
                        <span className="rounded-full bg-blue-100 px-1.5 py-0.5 text-[10px] font-medium text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">
                          Hidden
                        </span>
                      ) : (
                        <span className="truncate text-[10px] text-zinc-400">
                          {(item.kind === 'arrow' || item.kind === 'line') && item.arrow
                            ? `(${Math.round(item.arrow.x1)},${Math.round(item.arrow.y1)}) → (${Math.round(item.arrow.x2)},${Math.round(item.arrow.y2)})`
                            : `${Math.round(item.rect.x)},${Math.round(item.rect.y)} · ${Math.round(item.rect.width)}×${Math.round(item.rect.height)}`}
                        </span>
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation()
                        removeAnnotation(item.id)
                      }}
                      className="shrink-0 text-zinc-400 hover:text-red-500"
                    >
                      <Icon name="trash" size={14} />
                    </button>
                  </div>
                  {item.kind !== 'blur' && (
                    isSelected ? (
                      <AutoResizeTextarea
                        value={item.note}
                        onChange={(note) => setItemNote(item.id, note)}
                        autoFocus
                      />
                    ) : item.note.trim() ? (
                      <div className="mt-1 whitespace-pre-wrap text-[10px] text-zinc-500 italic dark:text-zinc-400">
                        {item.note}
                      </div>
                    ) : null
                  )}
                </div>
              )
            })}
          </div>
        ) : (
          <p className="py-8 text-center text-sm text-zinc-400 dark:text-zinc-500">
            Draw boxes or arrows on the image to annotate regions.
          </p>
        )}
      </div>
    </div>
  )
}

function AutoResizeTextarea({
  value,
  onChange,
  autoFocus = false,
}: {
  value: string
  onChange: (value: string) => void
  autoFocus?: boolean
}) {
  const ref = useRef<HTMLTextAreaElement>(null)

  const resize = useCallback(() => {
    const el = ref.current
    if (!el) return
    el.style.height = 'auto'
    el.style.height = `${el.scrollHeight}px`
  }, [])

  useEffect(() => {
    resize()
  }, [value, resize])

  useEffect(() => {
    if (autoFocus && ref.current) {
      ref.current.focus()
    }
  }, [autoFocus])

  return (
    <textarea
      ref={ref}
      value={value}
      onChange={(e) => {
        onChange(e.target.value)
        resize()
      }}
      onClick={(e) => e.stopPropagation()}
      onKeyDown={(e) => e.stopPropagation()}
      placeholder="Add note…"
      rows={1}
      className="mt-1.5 w-full resize-none overflow-hidden rounded border border-zinc-300 bg-transparent px-1.5 py-0.5 text-[11px] text-zinc-600 placeholder:text-zinc-400 focus:border-orange-400 focus:outline-none dark:border-zinc-600 dark:text-zinc-300 dark:placeholder:text-zinc-500 dark:focus:border-orange-500"
    />
  )
}
