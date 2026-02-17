// ── Component Reference Data Types ──

export type PlatformId = 'ios' | 'macos' | 'android' | 'windows' | 'web'

export type CategoryId =
  | 'navigation'
  | 'input'
  | 'feedback'
  | 'overlay'
  | 'layout'
  | 'actions'

export interface AnatomyPart {
  label: string
  description: string
}

export interface PlacementInfo {
  position: string
  fixed: boolean
  overlay: boolean
  context: string
}

export interface BehaviorInfo {
  appears: string
  interaction: string
  dismissal: string
  blocking: boolean
  gestures: string[]
}

export interface PlatformVariation {
  platform: PlatformId
  name: string
  visualNotes: string
  behaviorNotes: string
  referenceUrl?: string
}

export interface UIComponent {
  slug: string
  name: string
  alternativeNames: string[]
  platforms: PlatformId[]
  category: CategoryId
  description: string
  anatomy: {
    parts: AnatomyPart[]
  }
  placement: PlacementInfo
  behavior: BehaviorInfo
  platformVariations: PlatformVariation[]
}

// ── Identify / Annotation Types ──

/** Pixel-based bounding box (relative to composite image dimensions) */
export interface PixelRect {
  x: number
  y: number
  width: number
  height: number
}

export interface ArrowPoints {
  x1: number
  y1: number
  x2: number
  y2: number
}

export interface DrawnAnnotation {
  id: string
  kind: 'box' | 'arrow'
  rect: PixelRect
  arrow?: ArrowPoints
  note: string
}

export interface UnifiedItem {
  index: number
  id: string
  type: 'annotation'
  kind: 'box' | 'arrow'
  label: string
  rect: PixelRect
  arrow?: ArrowPoints
  note: string
}

// ── Multi-Image / Layer Types ──

export interface ImageEntry {
  id: string
  /** Auto-incrementing display ID (never resets, persisted across sessions) */
  displayId: number
  dataUrl: string
  dimensions: { w: number; h: number }
  /** Position on the canvas in pixel space */
  x: number
  y: number
}

export interface CanvasBounds {
  totalWidth: number
  totalHeight: number
}

// ── Prompt Library Types (Snippets + Templates) ──

export type PromptEntryType = 'snippet' | 'template'

export interface PromptVariable {
  name: string
  description: string
  defaultValue: string
}

export interface PromptEntry {
  id?: number
  type: PromptEntryType
  title: string
  description: string
  content: string
  tags: string[]
  folderId: number | null
  variables: PromptVariable[]
  isBuiltIn: boolean
  createdAt: number
  updatedAt: number
}

export interface Folder {
  id?: number
  name: string
  type: PromptEntryType
}

export interface Tag {
  id?: number
  name: string
}

// ── Device Preset Types ──

export interface DevicePreset {
  id?: number
  name: string
  width: number
  height: number
  radius: number
  isBuiltIn: boolean
}

// ── Platform / Category Metadata ──

export interface PlatformMeta {
  id: PlatformId
  label: string
  shortLabel: string
  color: string
}

export interface CategoryMeta {
  id: CategoryId
  label: string
  description: string
}
