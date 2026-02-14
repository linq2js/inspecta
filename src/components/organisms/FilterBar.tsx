import { SearchBar } from '@/components/molecules/SearchBar'
import { ChipGroup } from '@/components/molecules/ChipGroup'
import { Chip } from '@/components/atoms/Chip'
import { platforms } from '@/data/platforms'
import { categories } from '@/data/categories'
import type { PlatformId, CategoryId } from '@/types'

interface FilterBarProps {
  query: string
  onQueryChange: (query: string) => void
  activePlatforms: PlatformId[]
  onTogglePlatform: (platform: PlatformId) => void
  category: CategoryId | ''
  onCategoryChange: (category: CategoryId | '') => void
}

export function FilterBar({
  query,
  onQueryChange,
  activePlatforms,
  onTogglePlatform,
  category,
  onCategoryChange,
}: FilterBarProps) {
  const platformChips = platforms.map((p) => ({
    id: p.id,
    label: p.label,
    color: p.color,
  }))

  return (
    <div className="flex flex-col gap-4">
      <SearchBar value={query} onChange={onQueryChange} />

      <div className="flex flex-col gap-3">
        {/* Platform row */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-medium uppercase tracking-wider text-zinc-400 mr-1">
            Platform
          </span>
          <ChipGroup
            items={platformChips}
            activeIds={activePlatforms}
            onToggle={(id) => onTogglePlatform(id as PlatformId)}
          />
        </div>

        {/* Category row */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-medium uppercase tracking-wider text-zinc-400 mr-1">
            Category
          </span>
          <Chip
            label="All"
            active={category === ''}
            onClick={() => onCategoryChange('')}
          />
          {categories.map((cat) => (
            <Chip
              key={cat.id}
              label={cat.label}
              active={category === cat.id}
              onClick={() =>
                onCategoryChange(category === cat.id ? '' : cat.id)
              }
            />
          ))}
        </div>
      </div>
    </div>
  )
}
