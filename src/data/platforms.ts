import type { PlatformMeta } from '@/types'

export const platforms: PlatformMeta[] = [
  { id: 'ios', label: 'iOS', shortLabel: 'iOS', color: '#007AFF' },
  { id: 'macos', label: 'macOS', shortLabel: 'Mac', color: '#8E8E93' },
  { id: 'android', label: 'Android', shortLabel: 'And', color: '#34A853' },
  { id: 'windows', label: 'Windows', shortLabel: 'Win', color: '#0078D4' },
  { id: 'web', label: 'Web', shortLabel: 'Web', color: '#F59E0B' },
]

export const platformMap = Object.fromEntries(
  platforms.map((p) => [p.id, p]),
) as Record<string, PlatformMeta>
