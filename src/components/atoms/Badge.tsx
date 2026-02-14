import { platformMap } from '@/data/platforms'
import type { PlatformId } from '@/types'

interface BadgeProps {
  platform: PlatformId | string
  size?: 'sm' | 'md'
}

export function Badge({ platform, size = 'sm' }: BadgeProps) {
  const meta = platformMap[platform]
  const label = meta?.shortLabel ?? platform
  const color = meta?.color ?? '#6b7280'

  return (
    <span
      className={`inline-flex items-center rounded-full font-medium ${
        size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-1 text-sm'
      }`}
      style={{
        backgroundColor: `${color}18`,
        color: color,
        border: `1px solid ${color}30`,
      }}
    >
      {label}
    </span>
  )
}
