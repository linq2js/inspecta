import { Chip } from '@/components/atoms/Chip'

interface ChipItem {
  id: string
  label: string
  color?: string
}

interface ChipGroupProps {
  items: ChipItem[]
  activeIds: string[]
  onToggle: (id: string) => void
}

export function ChipGroup({ items, activeIds, onToggle }: ChipGroupProps) {
  return (
    <div className="flex flex-wrap gap-2">
      {items.map((item) => (
        <Chip
          key={item.id}
          label={item.label}
          active={activeIds.includes(item.id)}
          onClick={() => onToggle(item.id)}
          color={item.color}
        />
      ))}
    </div>
  )
}
