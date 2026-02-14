import { Badge } from '@/components/atoms/Badge'
import type { PlatformId } from '@/types'

interface PlatformBadgeGroupProps {
  platforms: PlatformId[]
  size?: 'sm' | 'md'
}

export function PlatformBadgeGroup({ platforms, size = 'sm' }: PlatformBadgeGroupProps) {
  return (
    <div className="flex flex-wrap gap-1">
      {platforms.map((p) => (
        <Badge key={p} platform={p} size={size} />
      ))}
    </div>
  )
}
