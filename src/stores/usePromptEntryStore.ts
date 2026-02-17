import { create } from 'zustand'
import { db } from '@/lib/db'
import { fuzzyMatch, fuzzyScore } from '@/lib/fuzzyMatch'
import type { PromptEntry, PromptEntryType, Folder, Tag } from '@/types'

interface PromptEntryState {
  entries: PromptEntry[]
  folders: Folder[]
  tags: Tag[]
  loading: boolean
  searchQuery: string
  selectedFolderId: number | null
  selectedTags: string[]

  setSearchQuery: (query: string) => void
  setSelectedFolderId: (id: number | null) => void
  setSelectedTags: (tags: string[]) => void

  loadEntries: () => Promise<void>
  loadFolders: () => Promise<void>
  loadTags: () => Promise<void>

  createEntry: (
    entry: Omit<PromptEntry, 'id' | 'createdAt' | 'updatedAt'>,
  ) => Promise<number>
  updateEntry: (
    id: number,
    updates: Partial<Omit<PromptEntry, 'id' | 'createdAt'>>,
  ) => Promise<void>
  deleteEntry: (id: number) => Promise<void>
  duplicateEntry: (id: number) => Promise<number | undefined>

  createFolder: (name: string) => Promise<number>
  renameFolder: (id: number, name: string) => Promise<void>
  deleteFolder: (id: number) => Promise<void>
  moveEntry: (entryId: number, folderId: number | null) => Promise<void>

  createTag: (name: string) => Promise<number>
  removeTag: (name: string) => Promise<void>

  exportByType: (type: PromptEntryType) => Promise<string>
  exportAll: () => Promise<string>
  importFromJSON: (jsonStr: string) => Promise<number>

  seedBuiltInSnippets: () => Promise<void>

  getFilteredEntries: () => PromptEntry[]
}

export const usePromptEntryStore = create<PromptEntryState>((set, get) => ({
  entries: [],
  folders: [],
  tags: [],
  loading: false,
  searchQuery: '',
  selectedFolderId: null,
  selectedTags: [],

  setSearchQuery: (query) => set({ searchQuery: query }),
  setSelectedFolderId: (id) => set({ selectedFolderId: id }),
  setSelectedTags: (tags) => set({ selectedTags: tags }),

  loadEntries: async () => {
    const entries = await db.entries.toArray()
    set({ entries })
  },

  loadFolders: async () => {
    const folders = await db.folders.toArray()
    set({ folders })
  },

  loadTags: async () => {
    const tags = await db.tags.toArray()
    set({ tags })
  },

  createEntry: async (entry) => {
    const now = Date.now()
    const id = await db.entries.add({
      ...entry,
      createdAt: now,
      updatedAt: now,
    } as PromptEntry)
    await get().loadEntries()
    return id as number
  },

  updateEntry: async (id, updates) => {
    await db.entries.update(id, { ...updates, updatedAt: Date.now() })
    await get().loadEntries()
  },

  deleteEntry: async (id) => {
    const entry = await db.entries.get(id)
    if (entry?.isBuiltIn) return
    await db.entries.delete(id)
    await get().loadEntries()
  },

  duplicateEntry: async (id) => {
    const entry = await db.entries.get(id)
    if (!entry) return undefined
    const now = Date.now()
    const newId = await db.entries.add({
      ...entry,
      id: undefined,
      title: `${entry.title} (copy)`,
      isBuiltIn: false,
      createdAt: now,
      updatedAt: now,
    } as PromptEntry)
    await get().loadEntries()
    return newId as number
  },

  createFolder: async (name) => {
    const id = await db.folders.add({ name, type: 'snippet' } as Folder)
    await get().loadFolders()
    return id as number
  },

  renameFolder: async (id, name) => {
    await db.folders.update(id, { name })
    await get().loadFolders()
  },

  deleteFolder: async (id) => {
    await db.entries.where('folderId').equals(id).modify({ folderId: null })
    await db.folders.delete(id)
    await get().loadFolders()
    await get().loadEntries()
  },

  moveEntry: async (entryId, folderId) => {
    await db.entries.update(entryId, { folderId, updatedAt: Date.now() })
    await get().loadEntries()
  },

  createTag: async (name) => {
    const existing = await db.tags.where('name').equals(name).first()
    if (existing) return existing.id!
    const id = await db.tags.add({ name } as Tag)
    await get().loadTags()
    return id as number
  },

  removeTag: async (name) => {
    await db.tags.where('name').equals(name).delete()
    const entriesWithTag = await db.entries.where('tags').equals(name).toArray()
    for (const entry of entriesWithTag) {
      await db.entries.update(entry.id!, {
        tags: entry.tags.filter((t) => t !== name),
        updatedAt: Date.now(),
      })
    }
    await get().loadTags()
    await get().loadEntries()
  },

  exportByType: async (type) => {
    const entries = await db.entries.where('type').equals(type).toArray()
    return JSON.stringify({ entries, exportedAt: Date.now(), version: 1 }, null, 2)
  },

  exportAll: async () => {
    const entries = await db.entries.toArray()
    const folders = await db.folders.toArray()
    const tags = await db.tags.toArray()
    return JSON.stringify(
      { entries, folders, tags, exportedAt: Date.now(), version: 1 },
      null,
      2,
    )
  },

  importFromJSON: async (jsonStr) => {
    const data = JSON.parse(jsonStr)
    if (!data.entries || !Array.isArray(data.entries)) {
      throw new Error('Invalid import data: missing entries array')
    }

    const now = Date.now()
    let count = 0

    for (const entry of data.entries) {
      await db.entries.add({
        type: entry.type || 'snippet',
        title: entry.title || 'Untitled',
        description: entry.description || '',
        content: entry.content || '',
        tags: entry.tags || [],
        folderId: null,
        variables: entry.variables || [],
        isBuiltIn: false,
        createdAt: entry.createdAt || now,
        updatedAt: now,
      } as PromptEntry)
      count++
    }

    if (data.tags && Array.isArray(data.tags)) {
      for (const tag of data.tags) {
        const existing = await db.tags.where('name').equals(tag.name).first()
        if (!existing) {
          await db.tags.add({ name: tag.name } as Tag)
        }
      }
    }

    await get().loadEntries()
    await get().loadTags()
    await get().loadFolders()
    return count
  },

  seedBuiltInSnippets: async () => {
    // Clean up duplicates first: keep only the oldest entry per title+isBuiltIn
    const allEntries = await db.entries.toArray()
    const seen = new Map<string, number>()
    const dupeIds: number[] = []
    for (const entry of allEntries) {
      if (!entry.isBuiltIn) continue
      const key = entry.title
      if (seen.has(key)) {
        dupeIds.push(entry.id!)
      } else {
        seen.set(key, entry.id!)
      }
    }
    if (dupeIds.length > 0) {
      await db.entries.bulkDelete(dupeIds)
    }

    // Only seed entries that don't already exist (by title)
    const existingTitles = new Set(
      allEntries.filter((e) => e.isBuiltIn).map((e) => e.title),
    )

    const now = Date.now()
    const snippets: Omit<PromptEntry, 'id'>[] = [
      {
        type: 'snippet',
        title: 'Bug Report Header',
        description: 'Standard bug report intro paragraph.',
        content: "I'm reporting UI issues on the attached screenshot. Please analyze each marked annotation and suggest specific fixes.\n",
        tags: ['built-in', 'bugs'],
        folderId: null,
        variables: [],
        isBuiltIn: true,
        createdAt: now,
        updatedAt: now,
      },
      {
        type: 'snippet',
        title: 'Refactor Request',
        description: 'UI refactor/improvement intro paragraph.',
        content: "I'd like to refactor and improve the UI shown in this screenshot. Please suggest modern UI/UX improvements including layout, spacing, typography, and visual hierarchy changes.\n",
        tags: ['built-in', 'refactor'],
        folderId: null,
        variables: [],
        isBuiltIn: true,
        createdAt: now,
        updatedAt: now,
      },
      {
        type: 'snippet',
        title: 'Additional Context',
        description: 'Context section for platform/device info.',
        content: "\n## Additional Context\n\n- Platform: \n- Browser/Device: \n- Screen size: \n",
        tags: ['built-in'],
        folderId: null,
        variables: [],
        isBuiltIn: true,
        createdAt: now,
        updatedAt: now,
      },
    ]

    const toAdd = snippets.filter((s) => !existingTitles.has(s.title))
    for (const snippet of toAdd) {
      await db.entries.add(snippet as PromptEntry)
    }

    await get().loadEntries()
  },

  getFilteredEntries: () => {
    const { entries, searchQuery, selectedFolderId, selectedTags } =
      get()

    let filtered = entries.filter((e) => e.type === 'snippet')

    if (selectedFolderId !== null) {
      filtered = filtered.filter((e) => e.folderId === selectedFolderId)
    }

    if (selectedTags.length > 0) {
      filtered = filtered.filter((e) =>
        selectedTags.every((tag) => e.tags.includes(tag)),
      )
    }

    if (searchQuery.trim()) {
      const q = searchQuery.trim()
      filtered = filtered.filter(
        (e) =>
          fuzzyMatch(q, e.title) ||
          fuzzyMatch(q, e.description) ||
          fuzzyMatch(q, e.content),
      )

      // Sort by best fuzzy score (title weighted highest, then description)
      return filtered.sort((a, b) => {
        const scoreA = Math.max(
          fuzzyScore(q, a.title) * 2,
          fuzzyScore(q, a.description),
          fuzzyScore(q, a.content) * 0.5,
        )
        const scoreB = Math.max(
          fuzzyScore(q, b.title) * 2,
          fuzzyScore(q, b.description),
          fuzzyScore(q, b.content) * 0.5,
        )
        return scoreB - scoreA
      })
    }

    return filtered.sort((a, b) => b.updatedAt - a.updatedAt)
  },
}))
