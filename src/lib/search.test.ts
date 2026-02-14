/**
 * Tests for the search and filter logic.
 * Since Fuse.js has CJS/ESM interop issues in Jest, we test the filtering
 * logic directly with the raw component data.
 */
import componentsData from '@/data/components.json'
import type { UIComponent, PlatformId, CategoryId } from '@/types'

const allComponents = componentsData as UIComponent[]

// Simple filter function that mirrors what HomeTemplate does
function filterComponents(
  query: string,
  platforms: PlatformId[],
  category: CategoryId | '',
): UIComponent[] {
  let results = allComponents

  if (query.trim()) {
    const q = query.toLowerCase()
    results = results.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.alternativeNames.some((n) => n.toLowerCase().includes(q)) ||
        c.description.toLowerCase().includes(q),
    )
  }

  if (platforms.length > 0) {
    results = results.filter((c) =>
      platforms.some((p) => c.platforms.includes(p)),
    )
  }

  if (category) {
    results = results.filter((c) => c.category === category)
  }

  return results
}

describe('Component Data', () => {
  it('should have at least 20 components', () => {
    expect(allComponents.length).toBeGreaterThanOrEqual(20)
  })

  it('should have unique slugs', () => {
    const slugs = allComponents.map((c) => c.slug)
    expect(new Set(slugs).size).toBe(slugs.length)
  })

  it('should have all required fields', () => {
    for (const c of allComponents) {
      expect(c.slug).toBeTruthy()
      expect(c.name).toBeTruthy()
      expect(c.platforms.length).toBeGreaterThan(0)
      expect(c.category).toBeTruthy()
      expect(c.description).toBeTruthy()
      expect(c.anatomy.parts.length).toBeGreaterThan(0)
      expect(c.platformVariations.length).toBeGreaterThan(0)
    }
  })

  it('should have valid categories', () => {
    const validCategories = [
      'navigation',
      'input',
      'feedback',
      'overlay',
      'layout',
      'actions',
    ]
    for (const c of allComponents) {
      expect(validCategories).toContain(c.category)
    }
  })

  it('should have valid platforms', () => {
    const validPlatforms = ['ios', 'macos', 'android', 'windows', 'web']
    for (const c of allComponents) {
      for (const p of c.platforms) {
        expect(validPlatforms).toContain(p)
      }
    }
  })
})

describe('filterComponents', () => {
  it('should return all components with no filters', () => {
    const results = filterComponents('', [], '')
    expect(results.length).toBe(allComponents.length)
  })

  it('should filter by name', () => {
    const results = filterComponents('button', [], '')
    expect(results.some((c) => c.slug === 'button')).toBe(true)
    expect(results.length).toBeLessThan(allComponents.length)
  })

  it('should filter by alternative name', () => {
    const results = filterComponents('FAB', [], '')
    expect(results.some((c) => c.slug === 'floating-action-button')).toBe(true)
  })

  it('should filter by platform', () => {
    const results = filterComponents('', ['ios'], '')
    expect(results.length).toBeGreaterThan(0)
    expect(results.every((c) => c.platforms.includes('ios'))).toBe(true)
  })

  it('should filter by multiple platforms (OR)', () => {
    const results = filterComponents('', ['ios', 'android'], '')
    expect(results.length).toBeGreaterThan(0)
    for (const c of results) {
      expect(
        c.platforms.includes('ios') || c.platforms.includes('android'),
      ).toBe(true)
    }
  })

  it('should filter by category', () => {
    const results = filterComponents('', [], 'navigation')
    expect(results.length).toBeGreaterThan(0)
    expect(results.every((c) => c.category === 'navigation')).toBe(true)
  })

  it('should combine filters', () => {
    const results = filterComponents('bar', ['ios'], 'navigation')
    expect(results.length).toBeGreaterThan(0)
    for (const c of results) {
      expect(c.platforms.includes('ios')).toBe(true)
      expect(c.category).toBe('navigation')
      const matchesQuery =
        c.name.toLowerCase().includes('bar') ||
        c.alternativeNames.some((n) => n.toLowerCase().includes('bar')) ||
        c.description.toLowerCase().includes('bar')
      expect(matchesQuery).toBe(true)
    }
  })

  it('should return empty for no matches', () => {
    const results = filterComponents('xyznonexistent12345', [], '')
    expect(results.length).toBe(0)
  })
})
