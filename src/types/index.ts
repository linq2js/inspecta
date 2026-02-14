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

/** Pixel-based bounding box (relative to original image dimensions) */
export interface PixelRect {
  x: number
  y: number
  width: number
  height: number
}

export interface DrawnAnnotation {
  id: string
  rect: PixelRect
  note: string
}

export interface UnifiedItem {
  index: number
  id: string
  type: 'annotation'
  label: string
  rect: PixelRect
  note: string
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
