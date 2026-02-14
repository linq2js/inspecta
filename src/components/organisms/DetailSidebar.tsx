const sections = [
  { id: 'overview', label: 'Overview' },
  { id: 'anatomy', label: 'Visual Anatomy' },
  { id: 'placement', label: 'Placement' },
  { id: 'behavior', label: 'Behavior' },
  { id: 'platform-variations', label: 'Platform Variations' },
]

export function DetailSidebar() {
  return (
    <nav className="sticky top-20 space-y-0.5">
      <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-zinc-400">
        On this page
      </p>
      {sections.map((s) => (
        <a
          key={s.id}
          href={`#${s.id}`}
          className="block rounded-md px-3 py-1.5 text-sm text-zinc-500 hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-100"
        >
          {s.label}
        </a>
      ))}
    </nav>
  )
}
