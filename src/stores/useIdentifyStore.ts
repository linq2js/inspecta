import { create } from 'zustand'
import type { DrawnAnnotation, PixelRect, UnifiedItem } from '@/types'

// ── Prompt Types ──

export type PromptType = 'report-issues' | 'refactor-ui'

export interface PromptTypeOption {
  id: PromptType
  label: string
  description: string
}

export const promptTypes: PromptTypeOption[] = [
  {
    id: 'report-issues',
    label: 'Report Issues',
    description: 'Describe UI bugs and visual issues for developers to fix.',
  },
  {
    id: 'refactor-ui',
    label: 'Refactor UI',
    description: 'Request UI improvements, modernization, or redesign.',
  },
]

// ── Undo/Redo History ──

interface HistorySnapshot {
  annotations: DrawnAnnotation[]
}

const MAX_HISTORY = 50

// ── Store ──

interface IdentifyState {
  image: string | null
  imageDimensions: { w: number; h: number } | null
  annotations: DrawnAnnotation[]
  selectedItemId: string | null
  extraPrompt: string
  promptType: PromptType

  // Undo/Redo
  history: HistorySnapshot[]
  historyIndex: number
  canUndo: () => boolean
  canRedo: () => boolean
  undo: () => void
  redo: () => void

  getUnifiedList: () => UnifiedItem[]
  setImage: (dataUrl: string, dimensions: { w: number; h: number }) => void
  addAnnotation: (rect: PixelRect) => void
  removeAnnotation: (id: string) => void
  updateAnnotationRect: (id: string, rect: PixelRect) => void
  setItemNote: (id: string, note: string) => void
  setSelected: (id: string | null) => void
  clearAnnotations: () => void
  setExtraPrompt: (text: string) => void
  setPromptType: (type: PromptType) => void
  generatePrompt: () => string
  reset: () => void
}

let annotationCounter = 0

/** Push a snapshot and truncate any redo-future */
function pushHistory(
  history: HistorySnapshot[],
  historyIndex: number,
  annotations: DrawnAnnotation[],
): { history: HistorySnapshot[]; historyIndex: number } {
  const truncated = history.slice(0, historyIndex + 1)
  const next = [...truncated, { annotations: [...annotations] }]
  if (next.length > MAX_HISTORY) next.shift()
  return { history: next, historyIndex: next.length - 1 }
}

// ── Prompt Generation ──

function buildAnnotationList(
  items: UnifiedItem[],
  dims: { w: number; h: number } | null,
) {
  const dimSuffix = dims ? ` ${dims.w}×${dims.h}px` : ''
  let lines = `Image dimensions:${dimSuffix}\n\n`
  lines += 'Annotations:\n'
  for (const item of items) {
    lines += `[${item.index}] at (x:${Math.round(item.rect.x)}px y:${Math.round(item.rect.y)}px w:${Math.round(item.rect.width)}px h:${Math.round(item.rect.height)}px)\n`
  }
  return lines
}

function buildNotes(items: UnifiedItem[]) {
  const noted = items.filter((i) => i.note.trim())
  if (noted.length === 0) return ''
  let lines = '\nNotes:\n'
  for (const item of noted) {
    lines += `[${item.index}] "${item.note}"\n`
  }
  return lines
}

function generateReportIssues(
  items: UnifiedItem[],
  dims: { w: number; h: number } | null,
  extraPrompt: string,
) {
  let prompt =
    "I'm reporting UI issues on a screenshot (see attached annotated image).\n\n"
  prompt += buildAnnotationList(items, dims)
  prompt += buildNotes(items)

  if (extraPrompt.trim()) {
    prompt += `\nAdditional context:\n${extraPrompt.trim()}\n`
  }

  prompt += '\nPlease analyze each marked issue and suggest specific fixes.'
  return prompt
}

function generateRefactorUI(
  items: UnifiedItem[],
  dims: { w: number; h: number } | null,
  extraPrompt: string,
) {
  let prompt =
    "I'd like to refactor and improve the UI shown in this screenshot (see attached annotated image).\n\n"
  prompt += buildAnnotationList(items, dims)
  prompt += buildNotes(items)

  if (extraPrompt.trim()) {
    prompt += `\nAdditional context:\n${extraPrompt.trim()}\n`
  }

  prompt +=
    '\nPlease suggest modern UI/UX improvements for each marked area, including layout, spacing, typography, and visual hierarchy changes.'
  return prompt
}

// ── Create Store ──

export const useIdentifyStore = create<IdentifyState>((set, get) => ({
  image: null,
  imageDimensions: null,
  annotations: [],
  selectedItemId: null,
  extraPrompt: '',
  promptType: 'report-issues',
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
    return annotations.map((a, i) => ({
      index: i + 1,
      id: a.id,
      type: 'annotation' as const,
      label: 'User annotation',
      rect: a.rect,
      note: a.note,
    }))
  },

  setImage: (dataUrl, dimensions) =>
    set({
      image: dataUrl,
      imageDimensions: dimensions,
      annotations: [],
      selectedItemId: null,
      history: [{ annotations: [] }],
      historyIndex: 0,
    }),

  addAnnotation: (rect) => {
    annotationCounter++
    const annotation: DrawnAnnotation = {
      id: `ann-${annotationCounter}-${Date.now()}`,
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
        selectedItemId: state.selectedItemId === id ? null : state.selectedItemId,
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

  setItemNote: (id, note) =>
    set((state) => ({
      annotations: state.annotations.map((a) =>
        a.id === id ? { ...a, note } : a,
      ),
    })),

  setSelected: (id) => set({ selectedItemId: id }),

  clearAnnotations: () =>
    set((state) => {
      const newAnnotations: DrawnAnnotation[] = []
      return {
        annotations: newAnnotations,
        selectedItemId: null,
        ...pushHistory(state.history, state.historyIndex, newAnnotations),
      }
    }),

  setExtraPrompt: (text) => set({ extraPrompt: text }),

  setPromptType: (type) => set({ promptType: type }),

  generatePrompt: () => {
    const items = get().getUnifiedList()
    const extraPrompt = get().extraPrompt
    const promptType = get().promptType
    const dims = get().imageDimensions

    if (items.length === 0 && !extraPrompt.trim()) {
      return ''
    }

    switch (promptType) {
      case 'report-issues':
        return generateReportIssues(items, dims, extraPrompt)
      case 'refactor-ui':
        return generateRefactorUI(items, dims, extraPrompt)
      default:
        return generateReportIssues(items, dims, extraPrompt)
    }
  },

  reset: () =>
    set({
      image: null,
      imageDimensions: null,
      annotations: [],
      selectedItemId: null,
      extraPrompt: '',
      history: [{ annotations: [] }],
      historyIndex: 0,
    }),
}))
