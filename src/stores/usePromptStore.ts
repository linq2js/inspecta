import { create } from 'zustand'
import type { UnifiedItem, ImageEntry } from '@/types'

export type AppMode = 'edit' | 'preview'

const STORAGE_KEY = 'prompt-assistant-content'

function loadPersistedContent(): string {
  try {
    return localStorage.getItem(STORAGE_KEY) ?? ''
  } catch {
    return ''
  }
}

interface PromptState {
  markdownContent: string
  appMode: AppMode
  showPreview: boolean

  /** Registered by MarkdownEditor — inserts text at the current caret position */
  insertAtCursor: ((text: string) => void) | null
  registerInsertAtCursor: (fn: (text: string) => void) => void
  unregisterInsertAtCursor: () => void

  setMarkdownContent: (content: string) => void
  setAppMode: (mode: AppMode) => void
  toggleAppMode: () => void
  setShowPreview: (show: boolean) => void
  resetPrompt: () => void
}

export const usePromptStore = create<PromptState>((set) => ({
  markdownContent: loadPersistedContent(),
  appMode: 'edit',
  showPreview: false,
  insertAtCursor: null,

  registerInsertAtCursor: (fn) => set({ insertAtCursor: fn }),
  unregisterInsertAtCursor: () => set({ insertAtCursor: null }),

  setMarkdownContent: (content) => set({ markdownContent: content }),

  setAppMode: (mode) => set({ appMode: mode }),

  toggleAppMode: () =>
    set((state) => ({
      appMode: state.appMode === 'edit' ? 'preview' : 'edit',
    })),

  setShowPreview: (show) => set({ showPreview: show }),

  resetPrompt: () =>
    set({
      markdownContent: '',
      appMode: 'edit',
      showPreview: false,
    }),
}))

// Persist markdownContent to localStorage on change
usePromptStore.subscribe((state, prevState) => {
  if (state.markdownContent !== prevState.markdownContent) {
    try {
      localStorage.setItem(STORAGE_KEY, state.markdownContent)
    } catch { /* quota exceeded — ignore */ }
  }
})

// ── Prompt Generation Helpers ──

export function buildAnnotationBlock(
  items: UnifiedItem[],
  compositeDims: { w: number; h: number } | null,
  options?: { skipDimensions?: boolean },
): string {
  const visible = items.filter((item) => item.kind !== 'blur')
  if (visible.length === 0) return ''

  let lines = '\n## Annotations\n\n'
  if (!options?.skipDimensions && compositeDims) {
    lines += `Image dimensions: ${Math.round(compositeDims.w)}×${Math.round(compositeDims.h)}px\n\n`
  }
  for (const item of visible) {
    if ((item.kind === 'arrow' || item.kind === 'line') && item.arrow) {
      const label = item.kind === 'arrow' ? 'arrow' : 'line'
      lines += `- **[${item.index}]** ${label} from (${Math.round(item.arrow.x1)},${Math.round(item.arrow.y1)}) to (${Math.round(item.arrow.x2)},${Math.round(item.arrow.y2)})`
    } else {
      lines += `- **[${item.index}]** at (x:${Math.round(item.rect.x)}px y:${Math.round(item.rect.y)}px w:${Math.round(item.rect.width)}px h:${Math.round(item.rect.height)}px)`
    }
    if (item.note.trim()) {
      lines += ` — ${item.note.trim()}`
    }
    lines += '\n'
  }
  return lines
}

/**
 * Build a markdown block describing image layers (IDs, dimensions, positions).
 * Appended to the prompt when the "Include image meta" toggle is on.
 */
export function buildImageMetaBlock(
  images: ImageEntry[],
  compositeDims: { w: number; h: number } | null,
): string {
  if (images.length === 0) return ''

  const dimSuffix = compositeDims
    ? ` (canvas: ${Math.round(compositeDims.w)}×${Math.round(compositeDims.h)}px)`
    : ''
  let lines = `\n## Images${dimSuffix}\n\n`
  for (const img of images) {
    lines += `- **[Image ${img.displayId}]** ${img.dimensions.w}×${img.dimensions.h}px at (${Math.round(img.x)}, ${Math.round(img.y)})`
    if (img.note.trim()) {
      lines += ` — ${img.note.trim()}`
    }
    lines += '\n'
  }
  return lines
}
