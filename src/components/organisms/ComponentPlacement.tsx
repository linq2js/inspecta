import type { UIComponent } from '@/types'

interface Props {
  component: UIComponent
}

export function ComponentPlacement({ component }: Props) {
  const p = component.placement

  return (
    <section id="placement" className="scroll-mt-20">
      <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
        Placement
      </h2>
      <div className="mt-4 overflow-hidden rounded-lg border border-zinc-200 dark:border-zinc-700">
        <table className="w-full text-sm">
          <tbody>
            <tr className="border-b border-zinc-100 dark:border-zinc-800">
              <td className="px-4 py-2.5 font-medium text-zinc-500 dark:text-zinc-400 w-36">
                Position
              </td>
              <td className="px-4 py-2.5 text-zinc-900 dark:text-zinc-100">
                {p.position}
              </td>
            </tr>
            <tr className="border-b border-zinc-100 dark:border-zinc-800">
              <td className="px-4 py-2.5 font-medium text-zinc-500 dark:text-zinc-400">
                Fixed
              </td>
              <td className="px-4 py-2.5 text-zinc-900 dark:text-zinc-100">
                {p.fixed ? 'Yes — stays fixed during scroll' : 'No — scrolls with content'}
              </td>
            </tr>
            <tr className="border-b border-zinc-100 dark:border-zinc-800">
              <td className="px-4 py-2.5 font-medium text-zinc-500 dark:text-zinc-400">
                Overlay
              </td>
              <td className="px-4 py-2.5 text-zinc-900 dark:text-zinc-100">
                {p.overlay ? 'Yes — appears on top of content' : 'No — embedded in layout'}
              </td>
            </tr>
            <tr>
              <td className="px-4 py-2.5 font-medium text-zinc-500 dark:text-zinc-400">
                Context
              </td>
              <td className="px-4 py-2.5 text-zinc-900 dark:text-zinc-100">
                {p.context}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>
  )
}
