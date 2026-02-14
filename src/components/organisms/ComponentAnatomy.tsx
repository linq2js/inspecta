import type { UIComponent } from '@/types'

interface Props {
  component: UIComponent
}

export function ComponentAnatomy({ component }: Props) {
  const { parts } = component.anatomy

  return (
    <section id="anatomy" className="scroll-mt-20">
      <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
        Visual Anatomy
      </h2>
      <div className="mt-4">
        {/* Labeled part list */}
        <div className="space-y-0">
          {parts.map((part, i) => (
            <div
              key={part.label}
              className="flex items-start gap-3 border-l-2 border-primary-200 py-3 pl-4 dark:border-primary-800"
            >
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary-100 text-xs font-bold text-primary-700 dark:bg-primary-900 dark:text-primary-300">
                {i + 1}
              </span>
              <div>
                <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
                  {part.label}
                </p>
                <p className="text-xs text-zinc-500 dark:text-zinc-400">
                  {part.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
