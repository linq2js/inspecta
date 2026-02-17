import type { PromptVariable } from '@/types'

const VARIABLE_REGEX = /\{\{([a-zA-Z_][a-zA-Z0-9_]*)\}\}/g

/**
 * Extract all unique variable names from a template string.
 */
export function extractVariables(content: string): string[] {
  const matches = content.matchAll(VARIABLE_REGEX)
  const names = new Set<string>()
  for (const match of matches) {
    names.add(match[1])
  }
  return Array.from(names)
}

/**
 * Substitute variables in content using a values map.
 * Unresolved variables are left as-is.
 */
export function substituteVariables(
  content: string,
  values: Record<string, string>,
): string {
  return content.replace(VARIABLE_REGEX, (match, name: string) => {
    return name in values ? values[name] : match
  })
}

/**
 * Build a PromptVariable array from content, merging with any
 * existing variable definitions (preserving descriptions and defaults).
 */
export function syncVariablesFromContent(
  content: string,
  existing: PromptVariable[],
): PromptVariable[] {
  const names = extractVariables(content)
  const existingMap = new Map(existing.map((v) => [v.name, v]))

  return names.map((name) => {
    const found = existingMap.get(name)
    return found ?? { name, description: '', defaultValue: '' }
  })
}

/**
 * Validate that an import/export JSON blob has the expected shape
 * for snippets/templates.
 */
export function validateImportData(
  data: unknown,
): { valid: true; entries: unknown[] } | { valid: false; error: string } {
  if (!data || typeof data !== 'object') {
    return { valid: false, error: 'Invalid data format' }
  }

  const obj = data as Record<string, unknown>
  if (!Array.isArray(obj.entries)) {
    return { valid: false, error: 'Missing "entries" array' }
  }

  for (let i = 0; i < obj.entries.length; i++) {
    const entry = obj.entries[i] as Record<string, unknown>
    if (!entry.title || typeof entry.title !== 'string') {
      return { valid: false, error: `Entry ${i} missing title` }
    }
    if (!entry.content || typeof entry.content !== 'string') {
      return { valid: false, error: `Entry ${i} missing content` }
    }
    if (!entry.type || !['snippet', 'template'].includes(entry.type as string)) {
      return { valid: false, error: `Entry ${i} has invalid type` }
    }
  }

  return { valid: true, entries: obj.entries }
}
