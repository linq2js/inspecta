import { create } from 'zustand'
import type { UnifiedItem, ImageEntry } from '@/types'

export type AppMode = 'edit' | 'preview'

interface PromptState {
  markdownContent: string
  appMode: AppMode
  showPreview: boolean

  setMarkdownContent: (content: string) => void
  setAppMode: (mode: AppMode) => void
  toggleAppMode: () => void
  setShowPreview: (show: boolean) => void
  resetPrompt: () => void
}

export const usePromptStore = create<PromptState>((set) => ({
  markdownContent: '',
  appMode: 'edit',
  showPreview: false,

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

// ── Prompt Generation Helpers ──

export function buildAnnotationBlock(
  items: UnifiedItem[],
  compositeDims: { w: number; h: number } | null,
  options?: { skipDimensions?: boolean },
): string {
  if (items.length === 0) return ''

  let lines = '\n## Annotations\n\n'
  if (!options?.skipDimensions && compositeDims) {
    lines += `Image dimensions: ${Math.round(compositeDims.w)}×${Math.round(compositeDims.h)}px\n\n`
  }
  for (const item of items) {
    if (item.kind === 'arrow' && item.arrow) {
      lines += `- **[${item.index}]** arrow from (${Math.round(item.arrow.x1)},${Math.round(item.arrow.y1)}) to (${Math.round(item.arrow.x2)},${Math.round(item.arrow.y2)})`
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

export function generateReportIssuesTemplate(
  items: UnifiedItem[],
  compositeDims: { w: number; h: number } | null,
): string {
  const hasImages = compositeDims !== null
  let prompt = "# Bug Report\n\nI'm reporting UI issues"
  if (hasImages) {
    prompt += ' on a screenshot (see attached annotated image)'
  }
  prompt += '.\n'

  if (hasImages && items.length > 0) {
    prompt += buildAnnotationBlock(items, compositeDims)
  }

  prompt += '\n## Additional Context\n\n<!-- Add platform version, device, screen context... -->\n'
  prompt += '\n---\n\nPlease analyze each marked issue and suggest specific fixes.\n'
  return prompt
}

export function generateRefactorUITemplate(
  items: UnifiedItem[],
  compositeDims: { w: number; h: number } | null,
): string {
  const hasImages = compositeDims !== null
  let prompt = "# UI Refactor Request\n\nI'd like to refactor and improve the UI"
  if (hasImages) {
    prompt += ' shown in this screenshot (see attached annotated image)'
  }
  prompt += '.\n'

  if (hasImages && items.length > 0) {
    prompt += buildAnnotationBlock(items, compositeDims)
  }

  prompt += '\n## Additional Context\n\n<!-- Describe the improvements you want... -->\n'
  prompt +=
    '\n---\n\nPlease suggest modern UI/UX improvements for each area, including layout, spacing, typography, and visual hierarchy changes.\n'
  return prompt
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
