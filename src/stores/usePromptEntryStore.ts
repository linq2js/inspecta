import { create } from 'zustand'
import { db } from '@/lib/db'
import type { PromptEntry, PromptEntryType, Folder, Tag } from '@/types'

interface PromptEntryState {
  entries: PromptEntry[]
  folders: Folder[]
  tags: Tag[]
  loading: boolean
  activeTab: PromptEntryType
  searchQuery: string
  selectedFolderId: number | null
  selectedTags: string[]

  setActiveTab: (tab: PromptEntryType) => void
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

  createFolder: (name: string, type: PromptEntryType) => Promise<number>
  renameFolder: (id: number, name: string) => Promise<void>
  deleteFolder: (id: number) => Promise<void>
  moveEntry: (entryId: number, folderId: number | null) => Promise<void>

  createTag: (name: string) => Promise<number>
  removeTag: (name: string) => Promise<void>

  exportByType: (type: PromptEntryType) => Promise<string>
  exportAll: () => Promise<string>
  importFromJSON: (jsonStr: string) => Promise<number>

  seedBuiltInTemplates: () => Promise<void>

  getFilteredEntries: () => PromptEntry[]
}

export const usePromptEntryStore = create<PromptEntryState>((set, get) => ({
  entries: [],
  folders: [],
  tags: [],
  loading: false,
  activeTab: 'snippet',
  searchQuery: '',
  selectedFolderId: null,
  selectedTags: [],

  setActiveTab: (tab) => set({ activeTab: tab, searchQuery: '', selectedFolderId: null, selectedTags: [] }),
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

  createFolder: async (name, type) => {
    const id = await db.folders.add({ name, type } as Folder)
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

  seedBuiltInTemplates: async () => {
    const existing = await db.entries.where('isBuiltIn').equals(1).count()
    if (existing > 0) return

    const now = Date.now()
    const templates: Omit<PromptEntry, 'id'>[] = [
      {
        type: 'template',
        title: 'Report Issues',
        description: 'Describe UI bugs and visual issues for developers to fix.',
        content: [
          "# Bug Report",
          "",
          "I'm reporting UI issues{{#if hasImages}} on a screenshot (see attached annotated image){{/if}}.",
          "",
          "{{annotations}}",
          "",
          "## Additional Context",
          "",
          "<!-- Add platform version, device, screen context... -->",
          "",
          "---",
          "",
          "Please analyze each marked issue and suggest specific fixes.",
        ].join('\n'),
        tags: ['built-in', 'bugs'],
        folderId: null,
        variables: [],
        isBuiltIn: true,
        createdAt: now,
        updatedAt: now,
      },
      {
        type: 'template',
        title: 'Refactor UI',
        description: 'Request UI improvements, modernization, or redesign.',
        content: [
          "# UI Refactor Request",
          "",
          "I'd like to refactor and improve the UI{{#if hasImages}} shown in this screenshot (see attached annotated image){{/if}}.",
          "",
          "{{annotations}}",
          "",
          "## Additional Context",
          "",
          "<!-- Describe the improvements you want... -->",
          "",
          "---",
          "",
          "Please suggest modern UI/UX improvements for each area, including layout, spacing, typography, and visual hierarchy changes.",
        ].join('\n'),
        tags: ['built-in', 'refactor'],
        folderId: null,
        variables: [],
        isBuiltIn: true,
        createdAt: now,
        updatedAt: now,
      },
    ]

    for (const template of templates) {
      await db.entries.add(template as PromptEntry)
    }

    await get().loadEntries()
  },

  getFilteredEntries: () => {
    const { entries, activeTab, searchQuery, selectedFolderId, selectedTags } =
      get()

    let filtered = entries.filter((e) => e.type === activeTab)

    if (selectedFolderId !== null) {
      filtered = filtered.filter((e) => e.folderId === selectedFolderId)
    }

    if (selectedTags.length > 0) {
      filtered = filtered.filter((e) =>
        selectedTags.every((tag) => e.tags.includes(tag)),
      )
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase()
      filtered = filtered.filter(
        (e) =>
          e.title.toLowerCase().includes(q) ||
          e.description.toLowerCase().includes(q) ||
          e.content.toLowerCase().includes(q),
      )
    }

    return filtered.sort((a, b) => b.updatedAt - a.updatedAt)
  },
}))
