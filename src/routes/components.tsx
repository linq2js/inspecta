import { createFileRoute } from '@tanstack/react-router'
import { HomeTemplate } from '@/components/templates/HomeTemplate'

type ComponentsSearch = {
  q?: string
  platforms?: string
  category?: string
}

export const Route = createFileRoute('/components')({
  validateSearch: (search: Record<string, unknown>): ComponentsSearch => ({
    q: (search.q as string) || '',
    platforms: (search.platforms as string) || '',
    category: (search.category as string) || '',
  }),
  component: ComponentsPage,
})

function ComponentsPage() {
  const { q, platforms, category } = Route.useSearch()
  return (
    <HomeTemplate
      initialQuery={q || ''}
      initialPlatforms={platforms ? platforms.split(',').filter(Boolean) : []}
      initialCategory={category || ''}
    />
  )
}
