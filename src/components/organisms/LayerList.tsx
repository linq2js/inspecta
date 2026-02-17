import { useCallback, useRef, useState } from 'react'
import { Icon } from '@/components/atoms/Icon'
import { useImageStore } from '@/stores/useImageStore'

export function LayerList() {
  const {
    images,
    selectedLayerId,
    setSelectedLayer,
    removeImage,
    reorderLayer,
    setImageNote,
    showImageIds,
    setShowImageIds,
  } = useImageStore()

  const [dragIdx, setDragIdx] = useState<number | null>(null)
  const [overIdx, setOverIdx] = useState<number | null>(null)
  const listRef = useRef<HTMLDivElement>(null)

  // Display in reverse so top-of-list = front (last in array)
  const displayImages = [...images].reverse()

  const handleSelect = useCallback(
    (id: string) => {
      setSelectedLayer(selectedLayerId === id ? null : id)
    },
    [selectedLayerId, setSelectedLayer],
  )

  const handleDelete = useCallback(
    (id: string) => {
      removeImage(id)
    },
    [removeImage],
  )

  const handleDragStart = (displayIndex: number) => {
    setDragIdx(displayIndex)
  }

  const handleDragOver = (e: React.DragEvent, displayIndex: number) => {
    e.preventDefault()
    setOverIdx(displayIndex)
  }

  const handleDrop = (displayIndex: number) => {
    if (dragIdx === null || dragIdx === displayIndex) {
      setDragIdx(null)
      setOverIdx(null)
      return
    }

    const draggedImage = displayImages[dragIdx]
    // Convert display indices back to array indices (reversed)
    const newArrayIndex = images.length - 1 - displayIndex
    reorderLayer(draggedImage.id, newArrayIndex)
    setDragIdx(null)
    setOverIdx(null)
  }

  const handleDragEnd = () => {
    setDragIdx(null)
    setOverIdx(null)
  }

  if (images.length === 0) return null

  return (
    <div className="flex h-full flex-col">
      <div className="mb-2 flex shrink-0 items-center justify-between">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
          Layers ({images.length})
        </h3>
        <div className="flex items-center gap-1">
          {selectedLayerId && (
            <button
              type="button"
              onClick={() => setSelectedLayer(null)}
              title="Deselect layer (Esc)"
              className="flex items-center gap-1 rounded px-1.5 py-0.5 text-[10px] font-medium text-zinc-500 transition-colors hover:bg-zinc-200 dark:text-zinc-400 dark:hover:bg-zinc-700"
            >
              <Icon name="x" size={10} />
              Deselect
            </button>
          )}
          <button
            type="button"
            onClick={() => setShowImageIds(!showImageIds)}
            title={showImageIds ? 'Hide image IDs' : 'Show image IDs'}
            className={`flex items-center gap-1 rounded px-1.5 py-0.5 text-[10px] font-medium transition-colors ${
              showImageIds
                ? 'bg-zinc-600 text-zinc-200'
                : 'bg-zinc-200 text-zinc-500 dark:bg-zinc-700 dark:text-zinc-400'
            }`}
          >
            <span className="inline-flex h-3.5 w-3.5 items-center justify-center rounded-full border border-current text-[8px] font-bold leading-none">
              #
            </span>
            IDs
          </button>
        </div>
      </div>

      <div ref={listRef} className="min-h-0 flex-1 overflow-y-auto">
        <div className="space-y-1">
          {displayImages.map((img, displayIndex) => {
            const isSelected = img.id === selectedLayerId
            const isDragging = dragIdx === displayIndex
            const isOver = overIdx === displayIndex

            return (
              <div
                key={img.id}
                draggable
                onDragStart={() => handleDragStart(displayIndex)}
                onDragOver={(e) => handleDragOver(e, displayIndex)}
                onDrop={() => handleDrop(displayIndex)}
                onDragEnd={handleDragEnd}
                onClick={() => handleSelect(img.id)}
                className={`flex cursor-pointer items-center gap-2 rounded-lg border p-2 transition-colors ${
                  isSelected
                    ? 'border-blue-400 bg-blue-50 dark:border-blue-600 dark:bg-blue-950/30'
                    : 'border-zinc-200 hover:border-zinc-300 dark:border-zinc-700 dark:hover:border-zinc-600'
                } ${isDragging ? 'opacity-40' : ''} ${
                  isOver && !isDragging
                    ? 'border-blue-300 dark:border-blue-500'
                    : ''
                }`}
              >
                {/* Drag handle */}
                <div className="flex cursor-grab flex-col items-center text-zinc-400">
                  <svg
                    width={10}
                    height={14}
                    viewBox="0 0 10 14"
                    fill="currentColor"
                  >
                    <circle cx={3} cy={2} r={1.5} />
                    <circle cx={7} cy={2} r={1.5} />
                    <circle cx={3} cy={7} r={1.5} />
                    <circle cx={7} cy={7} r={1.5} />
                    <circle cx={3} cy={12} r={1.5} />
                    <circle cx={7} cy={12} r={1.5} />
                  </svg>
                </div>

                {/* Thumbnail */}
                <div className="h-8 w-8 shrink-0 overflow-hidden rounded border border-zinc-200 bg-zinc-50 dark:border-zinc-600 dark:bg-zinc-800">
                  <img
                    src={img.dataUrl}
                    alt=""
                    className="h-full w-full object-cover"
                    draggable={false}
                  />
                </div>

                {/* Label + info */}
                <div className="min-w-0 flex-1">
                  <div className="truncate text-sm text-zinc-700 dark:text-zinc-300">
                    Image {img.displayId}
                  </div>
                  <div className="text-[10px] text-zinc-400">
                    {img.dimensions.w}×{img.dimensions.h}px
                  </div>
                  {isSelected ? (
                    <input
                      type="text"
                      value={img.note}
                      onChange={(e) => setImageNote(img.id, e.target.value)}
                      onClick={(e) => e.stopPropagation()}
                      onKeyDown={(e) => e.stopPropagation()}
                      placeholder="Add note…"
                      className="mt-1 w-full rounded border border-zinc-300 bg-transparent px-1.5 py-0.5 text-[11px] text-zinc-600 placeholder:text-zinc-400 focus:border-blue-400 focus:outline-none dark:border-zinc-600 dark:text-zinc-300 dark:placeholder:text-zinc-500 dark:focus:border-blue-500"
                    />
                  ) : img.note ? (
                    <div className="mt-0.5 truncate text-[10px] text-zinc-500 italic dark:text-zinc-400">
                      {img.note}
                    </div>
                  ) : null}
                </div>

                {/* Delete */}
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation()
                    handleDelete(img.id)
                  }}
                  className="shrink-0 text-zinc-400 hover:text-red-500"
                  title="Remove layer"
                >
                  <Icon name="trash" size={14} />
                </button>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
