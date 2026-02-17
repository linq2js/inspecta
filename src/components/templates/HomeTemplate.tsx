import { useMemo, useEffect } from 'react'
import { useNavigate } from '@tanstack/react-router'
import { FilterBar } from '@/components/organisms/FilterBar'
import { ComponentGrid } from '@/components/organisms/ComponentGrid'
import { useFilterStore } from '@/stores/useFilterStore'
import { searchComponents } from '@/lib/search'
import componentsData from '@/data/components.json'
import type { UIComponent, PlatformId, CategoryId } from '@/types'

interface HomeTemplateProps {
  initialQuery: string
  initialPlatforms: string[]
  initialCategory: string
}

export function HomeTemplate({
  initialQuery,
  initialPlatforms,
  initialCategory,
}: HomeTemplateProps) {
  const { query, platforms, category, setQuery, togglePlatform, setCategory } =
    useFilterStore()
  const navigate = useNavigate()

  // Sync URL params on mount
  useEffect(() => {
    if (initialQuery && !query) setQuery(initialQuery)
    if (initialCategory && !category) setCategory(initialCategory as CategoryId)
    if (initialPlatforms.length > 0 && platforms.length === 0) {
      initialPlatforms.forEach((p) => togglePlatform(p as PlatformId))
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Sync filters to URL
  useEffect(() => {
    navigate({
      to: '/components',
      search: {
        q: query || undefined,
        platforms: platforms.length ? platforms.join(',') : undefined,
        category: category || undefined,
      },
      replace: true,
    })
  }, [query, platforms, category, navigate])

  const filteredComponents = useMemo(() => {
    let results: UIComponent[] = query
      ? searchComponents(query)
      : (componentsData as UIComponent[])

    if (platforms.length > 0) {
      results = results.filter((c) =>
        platforms.some((p) => c.platforms.includes(p)),
      )
    }

    if (category) {
      results = results.filter((c) => c.category === category)
    }

    return results
  }, [query, platforms, category])

  return (
    <div className="px-3 py-4">
      {/* Hero */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100 sm:text-3xl">
          Cross-Platform UI Components
        </h1>
        <p className="mt-2 max-w-2xl text-sm text-zinc-500 dark:text-zinc-400">
          Reference library for identifying UI component names, anatomy,
          behavior, and platform differences across iOS, macOS, Android,
          Windows, and Web.
        </p>
      </div>

      {/* Filters */}
      <div className="mb-8">
        <FilterBar
          query={query}
          onQueryChange={setQuery}
          activePlatforms={platforms}
          onTogglePlatform={(p: string) => togglePlatform(p as PlatformId)}
          category={category}
          onCategoryChange={setCategory}
        />
      </div>

      {/* Results count */}
      <div className="mb-4">
        <p className="text-xs text-zinc-400">
          {filteredComponents.length} component
          {filteredComponents.length !== 1 ? 's' : ''}
        </p>
      </div>

      {/* Grid */}
      <ComponentGrid components={filteredComponents} activePlatforms={platforms} />
    </div>
  )
}
