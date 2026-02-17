import { useState, useEffect, useCallback, useRef } from 'react'
import { Button } from '@/components/atoms/Button'
import { Icon } from '@/components/atoms/Icon'
import { PromptEntryCard } from '@/components/molecules/PromptEntryCard'
import { PromptEntryEditor } from '@/components/molecules/PromptEntryEditor'
import { VariableModal } from '@/components/molecules/VariableModal'
import { usePromptEntryStore } from '@/stores/usePromptEntryStore'
import { usePromptStore } from '@/stores/usePromptStore'
import { useToastStore } from '@/stores/useToastStore'
import { extractVariables, substituteVariables } from '@/lib/variables'
import type { PromptEntry, PromptEntryType, PromptVariable } from '@/types'

interface PromptLibraryProps {
  isOpen: boolean
  onClose: () => void
}

export function PromptLibrary({ isOpen, onClose }: PromptLibraryProps) {
  const {
    activeTab,
    setActiveTab,
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
    seedBuiltInTemplates,
    getFilteredEntries,
    exportByType,
    exportAll,
    importFromJSON,
  } = usePromptEntryStore()

  const { markdownContent, setMarkdownContent } = usePromptStore()
  const addToast = useToastStore((s) => s.addToast)

  const [editingEntry, setEditingEntry] = useState<PromptEntry | null>(null)
  const [isCreating, setIsCreating] = useState(false)
  const [variableEntry, setVariableEntry] = useState<PromptEntry | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Initialize on first open
  useEffect(() => {
    if (!isOpen) return
    const init = async () => {
      await seedBuiltInTemplates()
      await loadEntries()
      await loadFolders()
      await loadTags()
    }
    init()
  }, [isOpen])

  const entries = getFilteredEntries()
  const tabFolders = folders.filter((f) => f.type === activeTab)
  const existingTagNames = tags.map((t) => t.name)

  const handleInsert = useCallback(
    (entry: PromptEntry) => {
      const vars = extractVariables(entry.content)
      if (vars.length > 0 && entry.variables.length > 0) {
        setVariableEntry(entry)
        return
      }

      if (entry.type === 'template') {
        if (
          markdownContent.trim() &&
          !window.confirm(
            'This will replace your current prompt. Continue?',
          )
        )
          return
        setMarkdownContent(entry.content)
        addToast({ message: `Applied template: ${entry.title}` })
      } else {
        setMarkdownContent(markdownContent + entry.content)
        addToast({ message: `Inserted snippet: ${entry.title}` })
      }
      onClose()
    },
    [markdownContent, setMarkdownContent, addToast, onClose],
  )

  const handleVariableConfirm = useCallback(
    (values: Record<string, string>) => {
      if (!variableEntry) return
      const resolved = substituteVariables(variableEntry.content, values)

      if (variableEntry.type === 'template') {
        setMarkdownContent(resolved)
        addToast({ message: `Applied template: ${variableEntry.title}` })
      } else {
        setMarkdownContent(markdownContent + resolved)
        addToast({ message: `Inserted snippet: ${variableEntry.title}` })
      }

      setVariableEntry(null)
      onClose()
    },
    [variableEntry, markdownContent, setMarkdownContent, addToast, onClose],
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
        addToast({ message: 'Entry updated' })
      } else {
        await createEntry({
          ...data,
          type: activeTab,
          folderId: null,
          isBuiltIn: false,
        })
        addToast({ message: `${activeTab === 'template' ? 'Template' : 'Snippet'} created` })
      }
      setEditingEntry(null)
      setIsCreating(false)
    },
    [editingEntry, activeTab, updateEntry, createEntry, addToast],
  )

  const handleDelete = useCallback(
    async (entry: PromptEntry) => {
      if (entry.isBuiltIn) return
      if (!window.confirm(`Delete "${entry.title}"?`)) return
      await deleteEntry(entry.id!)
      addToast({ message: 'Entry deleted' })
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
    const json = await exportByType(activeTab)
    const blob = new Blob([json], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `prompt-${activeTab}s-export.json`
    a.click()
    URL.revokeObjectURL(url)
    addToast({ message: `${activeTab}s exported` })
  }, [activeTab, exportByType, addToast])

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
    await createFolder(name.trim(), activeTab)
    addToast({ message: 'Folder created' })
  }, [activeTab, createFolder, addToast])

  if (!isOpen) return null

  // Show editor view
  if (editingEntry || isCreating) {
    return (
      <div className="fixed inset-y-0 right-0 z-40 w-full max-w-lg border-l border-zinc-200 bg-white shadow-xl dark:border-zinc-700 dark:bg-zinc-900">
        <PromptEntryEditor
          entry={editingEntry ?? undefined}
          type={activeTab}
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
            Prompt Library
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300"
          >
            <Icon name="x" size={18} />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex shrink-0 border-b border-zinc-200 dark:border-zinc-700">
          {(['snippet', 'template'] as PromptEntryType[]).map((tab) => (
            <button
              key={tab}
              type="button"
              onClick={() => setActiveTab(tab)}
              className={`flex-1 px-4 py-2.5 text-sm font-medium transition-colors ${
                activeTab === tab
                  ? 'border-b-2 border-primary-600 text-primary-600 dark:border-primary-400 dark:text-primary-400'
                  : 'text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-300'
              }`}
            >
              {tab === 'snippet' ? 'Snippets' : 'Templates'}
            </button>
          ))}
        </div>

        {/* Toolbar */}
        <div className="flex shrink-0 items-center gap-2 border-b border-zinc-200 px-4 py-2 dark:border-zinc-700">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search..."
            className="flex-1 rounded-lg border border-zinc-300 bg-white px-3 py-1.5 text-xs outline-none focus:ring-2 focus:ring-primary-500 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-200"
          />
          <Button
            variant="primary"
            size="sm"
            onClick={() => setIsCreating(true)}
          >
            + New
          </Button>
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
            {tabFolders.map((f) => (
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

            {/* Import/Export */}
            <div className="my-2 h-px bg-zinc-200 dark:bg-zinc-700" />
            <div className="space-y-1">
              <button
                type="button"
                onClick={handleExport}
                className="block w-full rounded px-2 py-1 text-left text-xs text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800"
              >
                Export {activeTab}s
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
                    onInsert={handleInsert}
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
                  : `No ${activeTab}s yet. Create one to get started.`}
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
          actionLabel={variableEntry.type === 'template' ? 'Apply' : 'Insert'}
        />
      )}
    </>
  )
}
