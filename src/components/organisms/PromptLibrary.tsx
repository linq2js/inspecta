import { useState, useEffect, useCallback, useRef } from 'react'
import { Icon } from '@/components/atoms/Icon'
import { PromptEntryCard } from '@/components/molecules/PromptEntryCard'
import { PromptEntryEditor } from '@/components/molecules/PromptEntryEditor'
import { VariableModal } from '@/components/molecules/VariableModal'
import { usePromptEntryStore } from '@/stores/usePromptEntryStore'
import { usePromptStore } from '@/stores/usePromptStore'
import { useToastStore } from '@/stores/useToastStore'
import { extractVariables, substituteVariables } from '@/lib/variables'
import type { PromptEntry, PromptVariable } from '@/types'

interface PromptLibraryProps {
  isOpen: boolean
  onClose: () => void
}

export function PromptLibrary({ isOpen, onClose }: PromptLibraryProps) {
  const {
    searchQuery,
    setSearchQuery,
    folders,
    tags,
    selectedFolderId,
    setSelectedFolderId,
    selectedTags,
    setSelectedTags,
    loadEntries,
    loadFolders,
    loadTags,
    createEntry,
    updateEntry,
    deleteEntry,
    duplicateEntry,
    createFolder,
    deleteFolder,
    seedBuiltInSnippets,
    getFilteredEntries,
    exportByType,
    exportAll,
    importFromJSON,
  } = usePromptEntryStore()

  const { insertAtCursor, markdownContent, setMarkdownContent } = usePromptStore()
  const addToast = useToastStore((s) => s.addToast)

  const [editingEntry, setEditingEntry] = useState<PromptEntry | null>(null)
  const [isCreating, setIsCreating] = useState(false)
  const [variableEntry, setVariableEntry] = useState<PromptEntry | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const searchInputRef = useRef<HTMLInputElement>(null)

  // Initialize on open: seed, load, reset search, focus
  useEffect(() => {
    if (!isOpen) return
    const init = async () => {
      await seedBuiltInSnippets()
      await loadEntries()
      await loadFolders()
      await loadTags()
    }
    init()
    setSearchQuery('')
    requestAnimationFrame(() => searchInputRef.current?.focus())
  }, [isOpen])

  const entries = getFilteredEntries()
  const snippetFolders = folders.filter((f) => f.type === 'snippet')
  const existingTagNames = tags.map((t) => t.name)

  const doInsert = useCallback(
    (entry: PromptEntry) => {
      const vars = extractVariables(entry.content)
      if (vars.length > 0 && entry.variables.length > 0) {
        setVariableEntry(entry)
        return
      }

      if (insertAtCursor) {
        insertAtCursor(entry.content)
      } else {
        setMarkdownContent(markdownContent + entry.content)
      }
      addToast({ message: `Inserted: ${entry.title}` })
      onClose()
    },
    [insertAtCursor, markdownContent, setMarkdownContent, addToast, onClose],
  )

  const handleVariableConfirm = useCallback(
    (values: Record<string, string>) => {
      if (!variableEntry) return
      const resolved = substituteVariables(variableEntry.content, values)

      if (insertAtCursor) {
        insertAtCursor(resolved)
      } else {
        setMarkdownContent(markdownContent + resolved)
      }
      addToast({ message: `Inserted: ${variableEntry.title}` })

      setVariableEntry(null)
      onClose()
    },
    [variableEntry, insertAtCursor, markdownContent, setMarkdownContent, addToast, onClose],
  )

  const handleSearchKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Enter') {
        e.preventDefault()
        if (entries.length > 0) {
          doInsert(entries[0])
        }
        return
      }
      if (e.key === 'Escape') {
        e.preventDefault()
        if (searchQuery) {
          setSearchQuery('')
        } else {
          onClose()
        }
      }
    },
    [entries, doInsert, searchQuery, setSearchQuery, onClose],
  )

  const handleSave = useCallback(
    async (data: {
      title: string
      description: string
      content: string
      tags: string[]
      variables: PromptVariable[]
    }) => {
      if (editingEntry?.id) {
        await updateEntry(editingEntry.id, data)
        addToast({ message: 'Snippet updated' })
      } else {
        await createEntry({
          ...data,
          type: 'snippet',
          folderId: null,
          isBuiltIn: false,
        })
        addToast({ message: 'Snippet created' })
      }
      setEditingEntry(null)
      setIsCreating(false)
    },
    [editingEntry, updateEntry, createEntry, addToast],
  )

  const handleDelete = useCallback(
    async (entry: PromptEntry) => {
      if (entry.isBuiltIn) return
      if (!window.confirm(`Delete "${entry.title}"?`)) return
      await deleteEntry(entry.id!)
      addToast({ message: 'Snippet deleted' })
    },
    [deleteEntry, addToast],
  )

  const handleDuplicate = useCallback(
    async (entry: PromptEntry) => {
      await duplicateEntry(entry.id!)
      addToast({ message: `Duplicated: ${entry.title}` })
    },
    [duplicateEntry, addToast],
  )

  const handleExport = useCallback(async () => {
    const json = await exportByType('snippet')
    const blob = new Blob([json], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'prompt-snippets-export.json'
    a.click()
    URL.revokeObjectURL(url)
    addToast({ message: 'Snippets exported' })
  }, [exportByType, addToast])

  const handleExportAll = useCallback(async () => {
    const json = await exportAll()
    const blob = new Blob([json], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'prompt-library-export.json'
    a.click()
    URL.revokeObjectURL(url)
    addToast({ message: 'Library exported' })
  }, [exportAll, addToast])

  const handleImport = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0]
      if (!file) return
      try {
        const text = await file.text()
        const count = await importFromJSON(text)
        addToast({ message: `Imported ${count} entries` })
      } catch (err) {
        addToast({ message: `Import failed: ${(err as Error).message}` })
      }
      if (fileInputRef.current) fileInputRef.current.value = ''
    },
    [importFromJSON, addToast],
  )

  const handleNewFolder = useCallback(async () => {
    const name = window.prompt('Folder name:')
    if (!name?.trim()) return
    await createFolder(name.trim())
    addToast({ message: 'Folder created' })
  }, [createFolder, addToast])

  if (!isOpen) return null

  // Show editor view
  if (editingEntry || isCreating) {
    return (
      <div className="fixed inset-y-0 right-0 z-40 w-full max-w-lg border-l border-zinc-200 bg-white shadow-xl dark:border-zinc-700 dark:bg-zinc-900">
        <PromptEntryEditor
          entry={editingEntry ?? undefined}
          onSave={handleSave}
          onCancel={() => {
            setEditingEntry(null)
            setIsCreating(false)
          }}
          existingTags={existingTagNames}
        />
      </div>
    )
  }

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-30 bg-black/20"
        onClick={onClose}
      />

      {/* Panel */}
      <div className="fixed inset-y-0 right-0 z-40 flex w-full max-w-xl flex-col border-l border-zinc-200 bg-white shadow-xl dark:border-zinc-700 dark:bg-zinc-900">
        {/* Header */}
        <div className="flex shrink-0 items-center justify-between border-b border-zinc-200 px-4 py-3 dark:border-zinc-700">
          <h2 className="text-sm font-semibold text-zinc-800 dark:text-zinc-200">
            Snippet Library
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300"
          >
            <Icon name="x" size={18} />
          </button>
        </div>

        {/* Search toolbar */}
        <div className="flex shrink-0 items-center gap-2 border-b border-zinc-200 px-4 py-2 dark:border-zinc-700">
          <input
            ref={searchInputRef}
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={handleSearchKeyDown}
            placeholder="Search snippets… (Enter to insert, Esc to clear)"
            className="flex-1 rounded-lg border border-zinc-300 bg-white px-3 py-1.5 text-xs outline-none focus:ring-2 focus:ring-primary-500 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-200"
          />
        </div>

        {/* Body */}
        <div className="flex min-h-0 flex-1">
          {/* Sidebar: folders + tags */}
          <div className="w-40 shrink-0 overflow-y-auto border-r border-zinc-200 p-3 dark:border-zinc-700">
            <button
              type="button"
              onClick={() => setSelectedFolderId(null)}
              className={`mb-1 block w-full rounded px-2 py-1 text-left text-xs transition-colors ${
                selectedFolderId === null
                  ? 'bg-primary-50 font-medium text-primary-700 dark:bg-primary-900/20 dark:text-primary-400'
                  : 'text-zinc-600 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800'
              }`}
            >
              All
            </button>
            {snippetFolders.map((f) => (
              <div key={f.id} className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => setSelectedFolderId(f.id!)}
                  className={`flex-1 truncate rounded px-2 py-1 text-left text-xs transition-colors ${
                    selectedFolderId === f.id
                      ? 'bg-primary-50 font-medium text-primary-700 dark:bg-primary-900/20 dark:text-primary-400'
                      : 'text-zinc-600 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800'
                  }`}
                >
                  📁 {f.name}
                </button>
                <button
                  type="button"
                  onClick={async () => {
                    if (window.confirm(`Delete folder "${f.name}"?`))
                      await deleteFolder(f.id!)
                  }}
                  className="shrink-0 text-zinc-300 hover:text-red-500"
                >
                  <Icon name="x" size={10} />
                </button>
              </div>
            ))}
            <button
              type="button"
              onClick={handleNewFolder}
              className="mt-2 block w-full rounded px-2 py-1 text-left text-xs text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800"
            >
              + New folder
            </button>

            {existingTagNames.length > 0 && (
              <>
                <div className="my-2 h-px bg-zinc-200 dark:bg-zinc-700" />
                <p className="mb-1 text-[10px] font-semibold uppercase tracking-wider text-zinc-400">
                  Tags
                </p>
                <div className="flex flex-wrap gap-1">
                  {existingTagNames.map((tag) => (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => {
                        setSelectedTags(
                          selectedTags.includes(tag)
                            ? selectedTags.filter((t) => t !== tag)
                            : [...selectedTags, tag],
                        )
                      }}
                      className={`rounded-full px-2 py-0.5 text-[10px] transition-colors ${
                        selectedTags.includes(tag)
                          ? 'bg-primary-100 text-primary-700 dark:bg-primary-900/30 dark:text-primary-400'
                          : 'bg-zinc-100 text-zinc-500 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-400'
                      }`}
                    >
                      {tag}
                    </button>
                  ))}
                </div>
              </>
            )}

            {/* Actions */}
            <div className="my-2 h-px bg-zinc-200 dark:bg-zinc-700" />
            <div className="space-y-1">
              <button
                type="button"
                onClick={() => setIsCreating(true)}
                className="block w-full rounded px-2 py-1 text-left text-xs text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800"
              >
                New snippet
              </button>
              <button
                type="button"
                onClick={handleExport}
                className="block w-full rounded px-2 py-1 text-left text-xs text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800"
              >
                Export snippets
              </button>
              <button
                type="button"
                onClick={handleExportAll}
                className="block w-full rounded px-2 py-1 text-left text-xs text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800"
              >
                Export all
              </button>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="block w-full rounded px-2 py-1 text-left text-xs text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800"
              >
                Import
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept=".json"
                className="hidden"
                onChange={handleImport}
              />
            </div>
          </div>

          {/* Entry list */}
          <div className="flex-1 overflow-y-auto p-3">
            {entries.length > 0 ? (
              <div className="space-y-2">
                {entries.map((entry) => (
                  <PromptEntryCard
                    key={entry.id}
                    entry={entry}
                    onInsert={doInsert}
                    onEdit={(e) => setEditingEntry(e)}
                    onDuplicate={handleDuplicate}
                    onDelete={handleDelete}
                  />
                ))}
              </div>
            ) : (
              <p className="py-12 text-center text-sm text-zinc-400 dark:text-zinc-500">
                {searchQuery
                  ? 'No results found.'
                  : 'No snippets yet. Create one to get started.'}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Variable fill-in modal */}
      {variableEntry && (
        <VariableModal
          variables={variableEntry.variables}
          onConfirm={handleVariableConfirm}
          onCancel={() => setVariableEntry(null)}
          actionLabel="Insert"
        />
      )}
    </>
  )
}
