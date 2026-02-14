import type { CategoryMeta } from '@/types'

export const categories: CategoryMeta[] = [
  {
    id: 'navigation',
    label: 'Navigation',
    description: 'Components that help users move between screens and sections.',
  },
  {
    id: 'input',
    label: 'Input',
    description: 'Components that accept user input and actions.',
  },
  {
    id: 'feedback',
    label: 'Feedback',
    description: 'Components that communicate status, results, or alerts to the user.',
  },
  {
    id: 'overlay',
    label: 'Overlay',
    description: 'Components that appear on top of existing content.',
  },
  {
    id: 'layout',
    label: 'Layout',
    description: 'Components that organize and structure content on screen.',
  },
  {
    id: 'actions',
    label: 'Actions',
    description: 'Components that provide prominent or specialized actions.',
  },
]

export const categoryMap = Object.fromEntries(
  categories.map((c) => [c.id, c]),
) as Record<string, CategoryMeta>
