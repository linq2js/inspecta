import { Link } from '@tanstack/react-router'
import { Badge } from '@/components/atoms/Badge'
import { getIllustrationThumbnail } from '@/illustrations'
import { categoryMap } from '@/data/categories'
import { platformMap } from '@/data/platforms'
import type { PlatformId, UIComponent } from '@/types'

interface Props {
  component: UIComponent
  activePlatform?: PlatformId | null
  onTogglePlatform?: (platform: PlatformId) => void
}

/** Platform-specific names, filtered when a platform is active */
function getDisplayNames(
  component: UIComponent,
  activePlatform: PlatformId | null,
): string {
  const variations =
    activePlatform
      ? component.platformVariations.filter((v) => v.platform === activePlatform)
      : component.platformVariations
  const unique = [...new Set(variations.map((v) => v.name))]
  return unique.length > 0 ? unique.join(' · ') : component.name
}

export function ComponentOverview({
  component,
  activePlatform = null,
  onTogglePlatform,
}: Props) {
  const cat = categoryMap[component.category]
  const displayName = getDisplayNames(component, activePlatform)
  const Thumbnail = getIllustrationThumbnail(component.slug)

  return (
    <section id="overview" className="scroll-mt-20">
      <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
        Overview
      </h2>

      {/* Component illustration */}
      {Thumbnail && (
        <div className="mt-4 flex items-center justify-center rounded-xl border border-zinc-200 bg-zinc-50 p-8 dark:border-zinc-700 dark:bg-zinc-800/50">
          <div className="scale-[2] transform">
            <Thumbnail />
          </div>
        </div>
      )}

      <div className="mt-4 space-y-3">
        <div>
          <span className="text-xs font-medium uppercase tracking-wider text-zinc-400">
            Official Name
          </span>
          <p className="text-base font-semibold text-zinc-900 dark:text-zinc-100">
            {displayName}
          </p>
        </div>
        {component.alternativeNames.length > 0 && (
          <div>
            <span className="text-xs font-medium uppercase tracking-wider text-zinc-400">
              Alternative Names
            </span>
            <p className="text-sm text-zinc-600 dark:text-zinc-400">
              {component.alternativeNames.join(', ')}
            </p>
          </div>
        )}
        <div>
          <span className="text-xs font-medium uppercase tracking-wider text-zinc-400">
            Platforms
            {activePlatform && (
              <span className="ml-2 normal-case tracking-normal text-zinc-500">
                — filtering by {platformMap[activePlatform]?.label ?? activePlatform}
              </span>
            )}
          </span>
          <div className="mt-1 flex flex-wrap gap-1">
            {component.platforms.map((p) => {
              const isActive = activePlatform === p
              return (
                <button
                  key={p}
                  type="button"
                  onClick={() => onTogglePlatform?.(p)}
                  className={`cursor-pointer rounded-full transition-all ${
                    activePlatform && !isActive
                      ? 'opacity-40 grayscale hover:opacity-70 hover:grayscale-0'
                      : 'hover:opacity-80'
                  } ${isActive ? 'ring-2 ring-primary-500 ring-offset-1 ring-offset-white dark:ring-offset-zinc-900' : ''}`}
                  title={isActive ? 'Clear filter' : `Filter by ${platformMap[p]?.label ?? p}`}
                >
                  <Badge platform={p} size="md" />
                </button>
              )
            })}
          </div>
        </div>
        <div>
          <span className="text-xs font-medium uppercase tracking-wider text-zinc-400">
            Category
          </span>
          <p className="text-sm">
            <Link
              to="/components"
              search={{ category: component.category }}
              className="text-zinc-600 transition-colors hover:text-primary-600 dark:text-zinc-400 dark:hover:text-primary-400"
            >
              {cat?.label ?? component.category}
            </Link>
          </p>
        </div>
        <div>
          <span className="text-xs font-medium uppercase tracking-wider text-zinc-400">
            Description
          </span>
          <p className="text-sm leading-relaxed text-zinc-700 dark:text-zinc-300">
            {component.description}
          </p>
        </div>
      </div>
    </section>
  )
}
