interface ChipProps {
  label: string
  active?: boolean
  onClick?: () => void
  color?: string
}

export function Chip({ label, active = false, onClick, color }: ChipProps) {
  const baseClasses =
    'inline-flex items-center rounded-full px-3 py-1 text-sm font-medium transition-colors cursor-pointer select-none'

  const activeStyle = color
    ? { backgroundColor: `${color}20`, color, border: `1.5px solid ${color}` }
    : undefined

  const inactiveStyle = color
    ? { border: `1.5px solid ${color}30`, color: `${color}99` }
    : undefined

  return (
    <button
      type="button"
      onClick={onClick}
      className={`${baseClasses} ${
        active
          ? color
            ? ''
            : 'bg-primary-100 text-primary-700 border border-primary-300 dark:bg-primary-900/30 dark:text-primary-300 dark:border-primary-700'
          : color
            ? ''
            : 'bg-zinc-100 text-zinc-600 border border-zinc-200 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-400 dark:border-zinc-700 dark:hover:bg-zinc-700'
      }`}
      style={active ? activeStyle : inactiveStyle}
    >
      {label}
    </button>
  )
}
