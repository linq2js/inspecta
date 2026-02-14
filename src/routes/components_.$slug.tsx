import { createFileRoute } from '@tanstack/react-router'
import { DetailTemplate } from '@/components/templates/DetailTemplate'
import componentsData from '@/data/components.json'
import type { UIComponent } from '@/types'

export const Route = createFileRoute('/components_/$slug')({
  component: ComponentDetailPage,
})

function ComponentDetailPage() {
  const { slug } = Route.useParams()
  const component = (componentsData as UIComponent[]).find(
    (c) => c.slug === slug,
  )

  if (!component) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">
            Component Not Found
          </h1>
          <p className="mt-2 text-zinc-500">
            No component found with slug &quot;{slug}&quot;.
          </p>
        </div>
      </div>
    )
  }

  return <DetailTemplate component={component} />
}
