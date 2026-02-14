import { Link } from '@tanstack/react-router'
import { Icon } from '@/components/atoms/Icon'
import { ComponentOverview } from '@/components/organisms/ComponentOverview'
import { ComponentAnatomy } from '@/components/organisms/ComponentAnatomy'
import { ComponentPlacement } from '@/components/organisms/ComponentPlacement'
import { ComponentBehavior } from '@/components/organisms/ComponentBehavior'
import { PlatformVariations } from '@/components/organisms/PlatformVariations'
import { DetailSidebar } from '@/components/organisms/DetailSidebar'
import { categoryMap } from '@/data/categories'
import type { UIComponent } from '@/types'

interface DetailTemplateProps {
  component: UIComponent
}

export function DetailTemplate({ component }: DetailTemplateProps) {
  const cat = categoryMap[component.category]

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6">
      {/* Breadcrumb */}
      <nav className="mb-6 flex items-center gap-1.5 text-sm text-zinc-400">
        <Link
          to="/components"
          className="hover:text-zinc-600 dark:hover:text-zinc-300"
        >
          Components
        </Link>
        <Icon name="chevronRight" size={14} />
        <Link
          to="/components"
          search={{ category: component.category }}
          className="hover:text-zinc-600 dark:hover:text-zinc-300"
        >
          {cat?.label ?? component.category}
        </Link>
        <Icon name="chevronRight" size={14} />
        <span className="text-zinc-700 dark:text-zinc-200">
          {component.name}
        </span>
      </nav>

      {/* Two-column layout */}
      <div className="flex gap-8">
        {/* Main content */}
        <div className="min-w-0 flex-1 space-y-10">
          <ComponentOverview component={component} />
          <ComponentAnatomy component={component} />
          <ComponentPlacement component={component} />
          <ComponentBehavior component={component} />
          <PlatformVariations component={component} />
        </div>

        {/* Sidebar */}
        <div className="hidden w-48 shrink-0 lg:block">
          <DetailSidebar />
        </div>
      </div>
    </div>
  )
}
