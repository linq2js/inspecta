import { PlatformBadgeGroup } from '@/components/molecules/PlatformBadgeGroup'
import { categoryMap } from '@/data/categories'
import type { UIComponent } from '@/types'

interface Props {
  component: UIComponent
}

/** All unique platform-specific names joined with " / " */
function getAllPlatformNames(component: UIComponent): string {
  const names = component.platformVariations.map((v) => v.name)
  const unique = [...new Set(names)]
  return unique.length > 0 ? unique.join(' / ') : component.name
}

export function ComponentOverview({ component }: Props) {
  const cat = categoryMap[component.category]
  const fullName = getAllPlatformNames(component)

  return (
    <section id="overview" className="scroll-mt-20">
      <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
        Overview
      </h2>
      <div className="mt-4 space-y-3">
        <div>
          <span className="text-xs font-medium uppercase tracking-wider text-zinc-400">
            Official Name
          </span>
          <p className="text-base font-semibold text-zinc-900 dark:text-zinc-100">
            {fullName}
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
          </span>
          <div className="mt-1">
            <PlatformBadgeGroup platforms={component.platforms} size="md" />
          </div>
        </div>
        <div>
          <span className="text-xs font-medium uppercase tracking-wider text-zinc-400">
            Category
          </span>
          <p className="text-sm text-zinc-600 dark:text-zinc-400">
            {cat?.label ?? component.category}
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
