import { Badge } from '@/components/atoms/Badge'
import type { UIComponent } from '@/types'

interface Props {
  component: UIComponent
}

export function PlatformVariations({ component }: Props) {
  const variations = component.platformVariations

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
