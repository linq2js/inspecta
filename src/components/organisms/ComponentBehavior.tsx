import type { UIComponent } from '@/types'

interface Props {
  component: UIComponent
}

export function ComponentBehavior({ component }: Props) {
  const b = component.behavior

  return (
    <section id="behavior" className="scroll-mt-20">
      <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
        Behavior
      </h2>
      <div className="mt-4 space-y-4">
        <div className="overflow-hidden rounded-lg border border-zinc-200 dark:border-zinc-700">
          <table className="w-full text-sm">
            <tbody>
              <tr className="border-b border-zinc-100 dark:border-zinc-800">
                <td className="px-4 py-2.5 font-medium text-zinc-500 dark:text-zinc-400 w-36">
                  Appears
                </td>
                <td className="px-4 py-2.5 text-zinc-900 dark:text-zinc-100">
                  {b.appears}
                </td>
              </tr>
              <tr className="border-b border-zinc-100 dark:border-zinc-800">
                <td className="px-4 py-2.5 font-medium text-zinc-500 dark:text-zinc-400">
                  Interaction
                </td>
                <td className="px-4 py-2.5 text-zinc-900 dark:text-zinc-100">
                  {b.interaction}
                </td>
              </tr>
              <tr className="border-b border-zinc-100 dark:border-zinc-800">
                <td className="px-4 py-2.5 font-medium text-zinc-500 dark:text-zinc-400">
                  Dismissal
                </td>
                <td className="px-4 py-2.5 text-zinc-900 dark:text-zinc-100">
                  {b.dismissal}
                </td>
              </tr>
              <tr>
                <td className="px-4 py-2.5 font-medium text-zinc-500 dark:text-zinc-400">
                  Blocking
                </td>
                <td className="px-4 py-2.5 text-zinc-900 dark:text-zinc-100">
                  {b.blocking ? 'Yes — blocks underlying interaction' : 'No — non-blocking'}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        {b.gestures.length > 0 && (
          <div>
            <h3 className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
              Gesture Support
            </h3>
            <ul className="mt-2 space-y-1">
              {b.gestures.map((g) => (
                <li
                  key={g}
                  className="flex items-start gap-2 text-sm text-zinc-600 dark:text-zinc-400"
                >
                  <span className="mt-1.5 block h-1.5 w-1.5 shrink-0 rounded-full bg-primary-400" />
                  {g}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </section>
  )
}
