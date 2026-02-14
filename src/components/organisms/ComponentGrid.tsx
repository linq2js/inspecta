import { ComponentCard } from '@/components/molecules/ComponentCard'
import type { UIComponent, PlatformId } from '@/types'

interface ComponentGridProps {
  components: UIComponent[]
  activePlatforms?: PlatformId[]
}

export function ComponentGrid({ components, activePlatforms = [] }: ComponentGridProps) {
  if (components.length === 0) {
    return (
      <div className="flex min-h-[30vh] items-center justify-center">
        <p className="text-sm text-zinc-400 dark:text-zinc-500">
          No components match your filters.
        </p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {components.map((c) => (
        <ComponentCard key={c.slug} component={c} activePlatforms={activePlatforms} />
      ))}
    </div>
  )
}
