import { useState, useCallback } from 'react'
import { Button } from '@/components/atoms/Button'
import { Icon } from '@/components/atoms/Icon'
import type { PromptEntry, PromptEntryType, PromptVariable } from '@/types'
import { syncVariablesFromContent } from '@/lib/variables'

interface PromptEntryEditorProps {
  entry?: PromptEntry
  type: PromptEntryType
  onSave: (data: {
    title: string
    description: string
    content: string
    tags: string[]
    variables: PromptVariable[]
  }) => void
  onCancel: () => void
  existingTags: string[]
}

export function PromptEntryEditor({
  entry,
  type,
  onSave,
  onCancel,
  existingTags,
}: PromptEntryEditorProps) {
  const [title, setTitle] = useState(entry?.title ?? '')
  const [description, setDescription] = useState(entry?.description ?? '')
  const [content, setContent] = useState(entry?.content ?? '')
  const [tagInput, setTagInput] = useState('')
  const [tags, setTags] = useState<string[]>(entry?.tags ?? [])
  const [variables, setVariables] = useState<PromptVariable[]>(
    entry?.variables ?? [],
  )

  const handleContentChange = useCallback(
    (newContent: string) => {
      setContent(newContent)
      setVariables(syncVariablesFromContent(newContent, variables))
    },
    [variables],
  )

  const handleAddTag = useCallback(() => {
    const trimmed = tagInput.trim().toLowerCase()
    if (trimmed && !tags.includes(trimmed)) {
      setTags([...tags, trimmed])
    }
    setTagInput('')
  }, [tagInput, tags])

  const handleRemoveTag = useCallback(
    (tag: string) => {
      setTags(tags.filter((t) => t !== tag))
    },
    [tags],
  )

  const handleUpdateVariable = useCallback(
    (index: number, field: keyof PromptVariable, value: string) => {
      setVariables((prev) =>
        prev.map((v, i) => (i === index ? { ...v, [field]: value } : v)),
      )
    },
    [],
  )

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim()) return
    onSave({
      title: title.trim(),
      description: description.trim(),
      content,
      tags,
      variables,
    })
  }

  const typeLabel = type === 'template' ? 'Template' : 'Snippet'

  return (
    <form onSubmit={handleSubmit} className="flex h-full flex-col gap-4 p-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">
          {entry ? `Edit ${typeLabel}` : `New ${typeLabel}`}
        </h3>
        <button
          type="button"
          onClick={onCancel}
          className="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300"
        >
          <Icon name="x" size={16} />
        </button>
      </div>

      <div>
        <label className="mb-1 block text-xs font-medium text-zinc-600 dark:text-zinc-400">
          Title
        </label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder={`${typeLabel} title...`}
          className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary-500 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-200"
          required
        />
      </div>

      <div>
        <label className="mb-1 block text-xs font-medium text-zinc-600 dark:text-zinc-400">
          Description
        </label>
        <input
          type="text"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Short description..."
          className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary-500 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-200"
        />
      </div>

      <div className="min-h-0 flex-1">
        <label className="mb-1 block text-xs font-medium text-zinc-600 dark:text-zinc-400">
          Content (Markdown)
        </label>
        <textarea
          value={content}
          onChange={(e) => handleContentChange(e.target.value)}
          placeholder="Write content in Markdown... Use {{variable_name}} for variables."
          className="h-full w-full resize-none rounded-lg border border-zinc-300 bg-white p-3 font-mono text-sm outline-none focus:ring-2 focus:ring-primary-500 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-200"
        />
      </div>

      {/* Tags */}
      <div>
        <label className="mb-1 block text-xs font-medium text-zinc-600 dark:text-zinc-400">
          Tags
        </label>
        <div className="flex flex-wrap gap-1 mb-1.5">
          {tags.map((tag) => (
            <span
              key={tag}
              className="inline-flex items-center gap-1 rounded-full bg-zinc-100 px-2 py-0.5 text-xs text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400"
            >
              {tag}
              <button
                type="button"
                onClick={() => handleRemoveTag(tag)}
                className="hover:text-red-500"
              >
                ×
              </button>
            </span>
          ))}
        </div>
        <div className="flex gap-2">
          <input
            type="text"
            value={tagInput}
            onChange={(e) => setTagInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault()
                handleAddTag()
              }
            }}
            placeholder="Add tag..."
            list="tag-suggestions"
            className="flex-1 rounded-lg border border-zinc-300 bg-white px-3 py-1.5 text-xs outline-none focus:ring-2 focus:ring-primary-500 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-200"
          />
          <datalist id="tag-suggestions">
            {existingTags
              .filter((t) => !tags.includes(t))
              .map((t) => (
                <option key={t} value={t} />
              ))}
          </datalist>
          <Button type="button" variant="ghost" size="sm" onClick={handleAddTag}>
            Add
          </Button>
        </div>
      </div>

      {/* Variables */}
      {variables.length > 0 && (
        <div>
          <label className="mb-1 block text-xs font-medium text-zinc-600 dark:text-zinc-400">
            Variables ({variables.length})
          </label>
          <div className="space-y-2">
            {variables.map((v, i) => (
              <div
                key={v.name}
                className="flex items-center gap-2 rounded-lg border border-zinc-200 p-2 dark:border-zinc-700"
              >
                <code className="shrink-0 text-xs font-medium text-primary-600 dark:text-primary-400">
                  {`{{${v.name}}}`}
                </code>
                <input
                  type="text"
                  value={v.description}
                  onChange={(e) =>
                    handleUpdateVariable(i, 'description', e.target.value)
                  }
                  placeholder="Description"
                  className="flex-1 rounded border border-zinc-200 px-2 py-1 text-xs outline-none dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300"
                />
                <input
                  type="text"
                  value={v.defaultValue}
                  onChange={(e) =>
                    handleUpdateVariable(i, 'defaultValue', e.target.value)
                  }
                  placeholder="Default"
                  className="w-24 rounded border border-zinc-200 px-2 py-1 text-xs outline-none dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300"
                />
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="flex justify-end gap-3 pt-2">
        <Button type="button" variant="ghost" size="md" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" variant="primary" size="md" disabled={!title.trim()}>
          {entry ? 'Save Changes' : `Create ${typeLabel}`}
        </Button>
      </div>
    </form>
  )
}
