import { Badge } from '@/components/atoms/Badge'
import { Icon } from '@/components/atoms/Icon'
import type { PlatformId, UIComponent } from '@/types'

interface Props {
  component: UIComponent
  activePlatform?: PlatformId | null
}

export function PlatformVariations({ component, activePlatform = null }: Props) {
  const variations = activePlatform
    ? component.platformVariations.filter((v) => v.platform === activePlatform)
    : component.platformVariations

  return (
    <section id="platform-variations" className="scroll-mt-20">
      <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
        Platform Variations
      </h2>
      <div className="mt-4 space-y-4">
        {variations.map((v) => (
          <div
            key={v.platform}
            className="rounded-lg border border-zinc-200 p-4 dark:border-zinc-700"
          >
            <div className="flex items-center gap-2">
              <Badge platform={v.platform} size="md" />
              <span className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                {v.name}
              </span>
              {v.referenceUrl && (
                <a
                  href={v.referenceUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="ml-auto inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-xs font-medium text-violet-600 transition-colors hover:bg-violet-50 hover:text-violet-700 dark:text-violet-400 dark:hover:bg-violet-950 dark:hover:text-violet-300"
                  title="View official reference"
                >
                  Reference
                  <Icon name="externalLink" size={12} />
                </a>
              )}
            </div>
            <div className="mt-3 grid gap-3 sm:grid-cols-2">
              <div>
                <span className="text-xs font-medium uppercase tracking-wider text-zinc-400">
                  Visual
                </span>
                <p className="mt-0.5 text-sm text-zinc-600 dark:text-zinc-400">
                  {v.visualNotes}
                </p>
              </div>
              <div>
                <span className="text-xs font-medium uppercase tracking-wider text-zinc-400">
                  Behavior
                </span>
                <p className="mt-0.5 text-sm text-zinc-600 dark:text-zinc-400">
                  {v.behaviorNotes}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
