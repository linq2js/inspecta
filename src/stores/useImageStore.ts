import { create } from 'zustand'
import type { ImageEntry, CanvasBounds } from '@/types'
import { computeCanvasBounds } from '@/lib/composite'

interface ImageHistorySnapshot {
  images: ImageEntry[]
}

const MAX_HISTORY = 50
const NEW_LAYER_OFFSET = 20

function pushImageHistory(
  history: ImageHistorySnapshot[],
  historyIndex: number,
  snapshot: ImageHistorySnapshot,
): { imageHistory: ImageHistorySnapshot[]; imageHistoryIndex: number } {
  const truncated = history.slice(0, historyIndex + 1)
  const next = [...truncated, snapshot]
  if (next.length > MAX_HISTORY) next.shift()
  return { imageHistory: next, imageHistoryIndex: next.length - 1 }
}

interface ImageState {
  images: ImageEntry[]
  canvasBounds: CanvasBounds

  /** Which layer is currently selected for dragging */
  selectedLayerId: string | null

  /** Whether to show image ID badges on the canvas */
  showImageIds: boolean

  /** Whether to include image metadata (IDs, sizes, positions) in preview output */
  includeImageMeta: boolean

  imageHistory: ImageHistorySnapshot[]
  imageHistoryIndex: number

  addImage: (dataUrl: string, dimensions: { w: number; h: number }) => void
  removeImage: (id: string) => void
  setSelectedLayer: (id: string | null) => void
  moveLayer: (id: string, x: number, y: number) => void
  reorderLayer: (id: string, newIndex: number) => void
  setShowImageIds: (show: boolean) => void
  setIncludeImageMeta: (include: boolean) => void
  canUndoImage: () => boolean
  canRedoImage: () => boolean
  undoImage: () => void
  redoImage: () => void
  resetImages: () => void
}

let imageCounter = 0

export const useImageStore = create<ImageState>((set, get) => ({
  images: [],
  canvasBounds: computeCanvasBounds([]),
  selectedLayerId: null,
  showImageIds: true,
  includeImageMeta: false,
  imageHistory: [{ images: [] }],
  imageHistoryIndex: 0,

  addImage: (dataUrl, dimensions) => {
    imageCounter++
    const displayId = imageCounter
    set((state) => {
      const lastImage = state.images[state.images.length - 1]
      const x = lastImage ? lastImage.x + NEW_LAYER_OFFSET : 0
      const y = lastImage ? lastImage.y + NEW_LAYER_OFFSET : 0

      const entry: ImageEntry = {
        id: `img-${displayId}-${Date.now()}`,
        displayId,
        dataUrl,
        dimensions,
        x,
        y,
      }
      const newImages = [...state.images, entry]
      return {
        images: newImages,
        canvasBounds: computeCanvasBounds(newImages),
        selectedLayerId: state.images.length > 0 ? entry.id : state.selectedLayerId,
        ...pushImageHistory(state.imageHistory, state.imageHistoryIndex, {
          images: newImages,
        }),
      }
    })
  },

  removeImage: (id) =>
    set((state) => {
      const newImages = state.images.filter((img) => img.id !== id)
      return {
        images: newImages,
        canvasBounds: computeCanvasBounds(newImages),
        selectedLayerId:
          state.selectedLayerId === id ? null : state.selectedLayerId,
        ...pushImageHistory(state.imageHistory, state.imageHistoryIndex, {
          images: newImages,
        }),
      }
    }),

  setSelectedLayer: (id) => set({ selectedLayerId: id }),

  setShowImageIds: (show) => set({ showImageIds: show }),

  setIncludeImageMeta: (include) => set({ includeImageMeta: include }),

  moveLayer: (id, x, y) =>
    set((state) => {
      const newImages = state.images.map((img) =>
        img.id === id ? { ...img, x: Math.max(0, x), y: Math.max(0, y) } : img,
      )
      return {
        images: newImages,
        canvasBounds: computeCanvasBounds(newImages),
      }
    }),

  reorderLayer: (id, newIndex) =>
    set((state) => {
      const oldIndex = state.images.findIndex((img) => img.id === id)
      if (oldIndex === -1 || oldIndex === newIndex) return state
      const newImages = [...state.images]
      const [removed] = newImages.splice(oldIndex, 1)
      newImages.splice(newIndex, 0, removed)
      return {
        images: newImages,
        ...pushImageHistory(state.imageHistory, state.imageHistoryIndex, {
          images: newImages,
        }),
      }
    }),

  canUndoImage: () => get().imageHistoryIndex > 0,
  canRedoImage: () =>
    get().imageHistoryIndex < get().imageHistory.length - 1,

  undoImage: () => {
    const { imageHistoryIndex, imageHistory } = get()
    if (imageHistoryIndex <= 0) return
    const prev = imageHistory[imageHistoryIndex - 1]
    set({
      images: [...prev.images],
      canvasBounds: computeCanvasBounds(prev.images),
      imageHistoryIndex: imageHistoryIndex - 1,
    })
  },

  redoImage: () => {
    const { imageHistoryIndex, imageHistory } = get()
    if (imageHistoryIndex >= imageHistory.length - 1) return
    const next = imageHistory[imageHistoryIndex + 1]
    set({
      images: [...next.images],
      canvasBounds: computeCanvasBounds(next.images),
      imageHistoryIndex: imageHistoryIndex + 1,
    })
  },

  resetImages: () =>
    set({
      images: [],
      canvasBounds: computeCanvasBounds([]),
      selectedLayerId: null,
      imageHistory: [{ images: [] }],
      imageHistoryIndex: 0,
    }),
}))
