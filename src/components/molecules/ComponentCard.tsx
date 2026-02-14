import { useMemo } from 'react'
import { Link } from '@tanstack/react-router'
import { PlatformBadgeGroup } from './PlatformBadgeGroup'
import { getIllustrationThumbnail } from '@/illustrations'
import type { UIComponent, PlatformId } from '@/types'

interface ComponentCardProps {
  component: UIComponent
  activePlatforms?: PlatformId[]
}

/**
 * Build a display name showing all unique platform-specific names.
 *  - No filter → all platform variations
 *  - Filtered  → only matching platforms
 */
function getDisplayName(
  component: UIComponent,
  activePlatforms: PlatformId[],
): string {
  const variations =
    activePlatforms.length === 0
      ? component.platformVariations
      : component.platformVariations.filter((v) =>
          activePlatforms.includes(v.platform),
        )

  const unique = [...new Set(variations.map((v) => v.name))]
  return unique.length > 0 ? unique.join(' · ') : component.name
}

export function ComponentCard({ component, activePlatforms = [] }: ComponentCardProps) {
  const Thumbnail = getIllustrationThumbnail(component.slug)
  const displayName = useMemo(
    () => getDisplayName(component, activePlatforms),
    [component, activePlatforms],
  )

  return (
    <Link
      to="/components/$slug"
      params={{ slug: component.slug }}
      className="group flex flex-col rounded-xl border border-zinc-200 bg-white p-4 transition-all hover:border-primary-300 hover:shadow-md dark:border-zinc-800 dark:bg-zinc-900 dark:hover:border-primary-700"
    >
      <div className="mb-3 flex h-32 items-center justify-center rounded-lg bg-zinc-50 dark:bg-zinc-800/50">
        {Thumbnail ? (
          <Thumbnail />
        ) : (
          <div className="text-3xl text-zinc-300 dark:text-zinc-600">
            {component.name.charAt(0)}
          </div>
        )}
      </div>
      <h3
        className="line-clamp-3 text-sm font-semibold leading-snug text-zinc-900 group-hover:text-primary-600 dark:text-zinc-100 dark:group-hover:text-primary-400"
        title={displayName}
      >
        {displayName}
      </h3>
      <p className="mt-1 line-clamp-2 text-xs text-zinc-500 dark:text-zinc-400">
        {component.description}
      </p>
      <div className="mt-auto pt-3">
        <PlatformBadgeGroup platforms={component.platforms} />
      </div>
    </Link>
  )
}
