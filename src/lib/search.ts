import Fuse from 'fuse.js'
import type { UIComponent } from '@/types'
import componentsData from '@/data/components.json'

const allComponents = componentsData as UIComponent[]

let fuse: Fuse<UIComponent> | null = null
let slugFuse: Fuse<UIComponent> | null = null

function getFuse(): Fuse<UIComponent> {
  if (!fuse) {
    fuse = new Fuse(allComponents, {
      keys: ['name', 'alternativeNames', 'description'],
      threshold: 0.4,
      includeScore: true,
    })
  }
  return fuse
}

function getSlugFuse(): Fuse<UIComponent> {
  if (!slugFuse) {
    slugFuse = new Fuse(allComponents, {
      keys: ['name', 'alternativeNames'],
      threshold: 0.3,
      includeScore: true,
    })
  }
  return slugFuse
}

export function searchComponents(query: string): UIComponent[] {
  if (!query.trim()) return allComponents
  return getFuse().search(query).map((r) => r.item)
}

export function matchComponentSlug(name: string): string | undefined {
  const results = getSlugFuse().search(name)
  const best = results[0]
  // Only return a match if the score is strong enough (lower = better in Fuse.js)
  if (best && best.score != null && best.score <= 0.3) {
    return best.item.slug
  }
  return undefined
}
