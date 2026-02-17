import { create } from 'zustand'
import type { ArrowPoints, DrawnAnnotation, PixelRect, UnifiedItem } from '@/types'

interface AnnotationHistorySnapshot {
  annotations: DrawnAnnotation[]
}

const MAX_HISTORY = 50

function pushHistory(
  history: AnnotationHistorySnapshot[],
  historyIndex: number,
  annotations: DrawnAnnotation[],
): { history: AnnotationHistorySnapshot[]; historyIndex: number } {
  const truncated = history.slice(0, historyIndex + 1)
  const next = [...truncated, { annotations: [...annotations] }]
  if (next.length > MAX_HISTORY) next.shift()
  return { history: next, historyIndex: next.length - 1 }
}

export type DrawingTool = 'box' | 'arrow' | 'line' | 'blur'

interface AnnotationState {
  annotations: DrawnAnnotation[]
  selectedItemId: string | null
  drawingTool: DrawingTool

  history: AnnotationHistorySnapshot[]
  historyIndex: number

  canUndo: () => boolean
  canRedo: () => boolean
  undo: () => void
  redo: () => void

  getUnifiedList: () => UnifiedItem[]
  addAnnotation: (rect: PixelRect) => void
  addArrowAnnotation: (arrow: ArrowPoints) => void
  addLineAnnotation: (arrow: ArrowPoints) => void
  addBlurAnnotation: (rect: PixelRect) => void
  removeAnnotation: (id: string) => void
  updateAnnotationRect: (id: string, rect: PixelRect) => void
  /** Move an annotation by delta (works for all shape kinds) */
  moveAnnotation: (id: string, dx: number, dy: number) => void
  /** Snapshot current state into undo history (call after drag ends) */
  pushMoveHistory: () => void
  setItemNote: (id: string, note: string) => void
  setSelected: (id: string | null) => void
  setDrawingTool: (tool: DrawingTool) => void
  clearAnnotations: () => void
  resetAnnotations: () => void
}

let annotationCounter = 0

export const useAnnotationStore = create<AnnotationState>((set, get) => ({
  annotations: [],
  selectedItemId: null,
  drawingTool: 'box',
  history: [{ annotations: [] }],
  historyIndex: 0,

  canUndo: () => get().historyIndex > 0,
  canRedo: () => get().historyIndex < get().history.length - 1,

  undo: () => {
    const { historyIndex, history } = get()
    if (historyIndex <= 0) return
    const prev = history[historyIndex - 1]
    set({
      annotations: [...prev.annotations],
      historyIndex: historyIndex - 1,
      selectedItemId: null,
    })
  },

  redo: () => {
    const { historyIndex, history } = get()
    if (historyIndex >= history.length - 1) return
    const next = history[historyIndex + 1]
    set({
      annotations: [...next.annotations],
      historyIndex: historyIndex + 1,
      selectedItemId: null,
    })
  },

  getUnifiedList: () => {
    const { annotations } = get()
    return annotations.map((a) => ({
      index: a.displayIndex,
      id: a.id,
      type: 'annotation' as const,
      kind: a.kind,
      label:
        a.kind === 'arrow'
          ? 'Arrow annotation'
          : a.kind === 'line'
            ? 'Line annotation'
            : a.kind === 'blur'
              ? 'Blur box'
              : 'User annotation',
      rect: a.rect,
      arrow: a.arrow,
      note: a.note,
    }))
  },

  addAnnotation: (rect) => {
    annotationCounter++
    const annotation: DrawnAnnotation = {
      id: `ann-${annotationCounter}-${Date.now()}`,
      displayIndex: annotationCounter,
      kind: 'box',
      rect,
      note: '',
    }
    set((state) => {
      const newAnnotations = [...state.annotations, annotation]
      return {
        annotations: newAnnotations,
        ...pushHistory(state.history, state.historyIndex, newAnnotations),
      }
    })
  },

  addArrowAnnotation: (arrow) => {
    annotationCounter++
    const rect: PixelRect = {
      x: Math.min(arrow.x1, arrow.x2),
      y: Math.min(arrow.y1, arrow.y2),
      width: Math.abs(arrow.x2 - arrow.x1),
      height: Math.abs(arrow.y2 - arrow.y1),
    }
    const annotation: DrawnAnnotation = {
      id: `ann-${annotationCounter}-${Date.now()}`,
      displayIndex: annotationCounter,
      kind: 'arrow',
      rect,
      arrow,
      note: '',
    }
    set((state) => {
      const newAnnotations = [...state.annotations, annotation]
      return {
        annotations: newAnnotations,
        ...pushHistory(state.history, state.historyIndex, newAnnotations),
      }
    })
  },

  addLineAnnotation: (arrow) => {
    annotationCounter++
    const rect: PixelRect = {
      x: Math.min(arrow.x1, arrow.x2),
      y: Math.min(arrow.y1, arrow.y2),
      width: Math.abs(arrow.x2 - arrow.x1),
      height: Math.abs(arrow.y2 - arrow.y1),
    }
    const annotation: DrawnAnnotation = {
      id: `ann-${annotationCounter}-${Date.now()}`,
      displayIndex: annotationCounter,
      kind: 'line',
      rect,
      arrow,
      note: '',
    }
    set((state) => {
      const newAnnotations = [...state.annotations, annotation]
      return {
        annotations: newAnnotations,
        ...pushHistory(state.history, state.historyIndex, newAnnotations),
      }
    })
  },

  addBlurAnnotation: (rect) => {
    annotationCounter++
    const annotation: DrawnAnnotation = {
      id: `ann-${annotationCounter}-${Date.now()}`,
      displayIndex: annotationCounter,
      kind: 'blur',
      rect,
      note: '',
    }
    set((state) => {
      const newAnnotations = [...state.annotations, annotation]
      return {
        annotations: newAnnotations,
        ...pushHistory(state.history, state.historyIndex, newAnnotations),
      }
    })
  },

  removeAnnotation: (id) =>
    set((state) => {
      const newAnnotations = state.annotations.filter((a) => a.id !== id)
      return {
        annotations: newAnnotations,
        selectedItemId:
          state.selectedItemId === id ? null : state.selectedItemId,
        ...pushHistory(state.history, state.historyIndex, newAnnotations),
      }
    }),

  updateAnnotationRect: (id, rect) =>
    set((state) => {
      const newAnnotations = state.annotations.map((a) =>
        a.id === id ? { ...a, rect } : a,
      )
      return {
        annotations: newAnnotations,
        ...pushHistory(state.history, state.historyIndex, newAnnotations),
      }
    }),

  moveAnnotation: (id, dx, dy) =>
    set((state) => ({
      annotations: state.annotations.map((a) => {
        if (a.id !== id) return a
        const movedRect = {
          ...a.rect,
          x: a.rect.x + dx,
          y: a.rect.y + dy,
        }
        const movedArrow = a.arrow
          ? {
              x1: a.arrow.x1 + dx,
              y1: a.arrow.y1 + dy,
              x2: a.arrow.x2 + dx,
              y2: a.arrow.y2 + dy,
            }
          : undefined
        return { ...a, rect: movedRect, arrow: movedArrow }
      }),
    })),

  pushMoveHistory: () =>
    set((state) => ({
      ...pushHistory(state.history, state.historyIndex, state.annotations),
    })),

  setItemNote: (id, note) =>
    set((state) => ({
      annotations: state.annotations.map((a) =>
        a.id === id ? { ...a, note } : a,
      ),
    })),

  setSelected: (id) => set({ selectedItemId: id }),

  setDrawingTool: (tool) => set({ drawingTool: tool }),

  clearAnnotations: () => {
    annotationCounter = 0
    return set((state) => {
      const newAnnotations: DrawnAnnotation[] = []
      return {
        annotations: newAnnotations,
        selectedItemId: null,
        ...pushHistory(state.history, state.historyIndex, newAnnotations),
      }
    })
  },

  resetAnnotations: () => {
    annotationCounter = 0
    return set({
      annotations: [],
      selectedItemId: null,
      history: [{ annotations: [] }],
      historyIndex: 0,
    })
  },
}))
