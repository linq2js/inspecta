import { useRef, useEffect, useState, useCallback } from 'react'
import { IndexBadge } from '@/components/atoms/IndexBadge'
import { Icon } from '@/components/atoms/Icon'
import { NoteInput } from '@/components/molecules/NoteInput'
import { useIdentifyStore } from '@/stores/useIdentifyStore'

export function UnifiedItemList() {
  const {
    getUnifiedList,
    selectedItemId,
    setSelected,
    setItemNote,
    removeAnnotation,
    clearAnnotations,
  } = useIdentifyStore()

  const items = getUnifiedList()
  const listRef = useRef<HTMLDivElement>(null)

  // Track which item had its note expanded via double-click
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null)

  const handleDoubleClick = useCallback((id: string) => {
    setSelected(id)
    setEditingNoteId(id)
  }, [setSelected])

  // Scroll selected item into view
  useEffect(() => {
    if (!selectedItemId || !listRef.current) return
    const el = listRef.current.querySelector(`[data-item-id="${selectedItemId}"]`)
    el?.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
  }, [selectedItemId])

  return (
    <div className="flex h-full flex-col">
      {/* Fixed header */}
      <div className="mb-2 flex shrink-0 items-center justify-between">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
          Annotations ({items.length})
        </h3>
        {items.length > 0 && (
          <button
            type="button"
            onClick={clearAnnotations}
            className="text-xs text-zinc-400 hover:text-red-500 transition-colors"
          >
            Clear all
          </button>
        )}
      </div>

      {/* Scrollable list */}
      <div ref={listRef} className="min-h-0 flex-1 overflow-y-auto">
        {items.length > 0 ? (
          <div className="space-y-2">
            {items.map((item) => {
              const hasNote = !!item.note.trim()
              return (
                <div
                  key={item.id}
                  data-item-id={item.id}
                  onClick={() => setSelected(item.id)}
                  onDoubleClick={() => handleDoubleClick(item.id)}
                  className={`rounded-lg border p-3 transition-colors cursor-pointer ${
                    item.id === selectedItemId
                      ? 'border-orange-400 bg-orange-50 dark:border-orange-600 dark:bg-orange-950/30'
                      : 'border-zinc-200 hover:border-zinc-300 dark:border-zinc-700 dark:hover:border-zinc-600'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <IndexBadge index={item.index} type="annotation" size="sm" />
                      <span className="text-sm text-zinc-700 dark:text-zinc-300">
                        Annotation
                      </span>
                      {!hasNote && (
                        <span className="rounded-full bg-amber-100 px-1.5 py-0.5 text-[10px] font-medium text-amber-700 dark:bg-amber-900/30 dark:text-amber-400">
                          No note
                        </span>
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation()
                        removeAnnotation(item.id)
                      }}
                      className="text-zinc-400 hover:text-red-500"
                    >
                      <Icon name="trash" size={14} />
                    </button>
                  </div>
                  <div className="mt-1 text-xs text-zinc-400">
                    Position: {Math.round(item.rect.x)}px, {Math.round(item.rect.y)}px
                    · Size: {Math.round(item.rect.width)}×{Math.round(item.rect.height)}px
                  </div>
                  <div className="mt-2">
                    <NoteInput
                      value={item.note}
                      onChange={(note) => setItemNote(item.id, note)}
                      forceExpand={editingNoteId === item.id}
                    />
                  </div>
                </div>
              )
            })}
          </div>
        ) : (
          <p className="text-center text-sm text-zinc-400 dark:text-zinc-500 py-8">
            Draw rectangles on the image to annotate regions.
          </p>
        )}
      </div>
    </div>
  )
}
