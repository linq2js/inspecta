import { Icon } from '@/components/atoms/Icon'
import type { PromptEntry } from '@/types'

interface PromptEntryCardProps {
  entry: PromptEntry
  onInsert: (entry: PromptEntry) => void
  onEdit: (entry: PromptEntry) => void
  onDuplicate: (entry: PromptEntry) => void
  onDelete: (entry: PromptEntry) => void
}

export function PromptEntryCard({
  entry,
  onInsert,
  onEdit,
  onDuplicate,
  onDelete,
}: PromptEntryCardProps) {
  const preview = entry.content.slice(0, 120) + (entry.content.length > 120 ? '…' : '')
  const formattedDate = new Date(entry.updatedAt).toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
  })

  return (
    <div className="group rounded-lg border border-zinc-200 p-3 transition-colors hover:border-zinc-300 dark:border-zinc-700 dark:hover:border-zinc-600">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <h4 className="truncate text-sm font-medium text-zinc-800 dark:text-zinc-200">
            {entry.title}
            {entry.isBuiltIn && (
              <span className="ml-1.5 inline-block rounded-full bg-primary-100 px-1.5 py-0.5 text-[10px] font-medium text-primary-700 dark:bg-primary-900/30 dark:text-primary-400">
                Built-in
              </span>
            )}
          </h4>
          {entry.description && (
            <p className="mt-0.5 truncate text-xs text-zinc-500 dark:text-zinc-400">
              {entry.description}
            </p>
          )}
        </div>
        <span className="shrink-0 text-[10px] text-zinc-400">{formattedDate}</span>
      </div>

      <p className="mt-2 text-xs leading-relaxed text-zinc-400 dark:text-zinc-500">
        {preview}
      </p>

      {entry.tags.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-1">
          {entry.tags.map((tag) => (
            <span
              key={tag}
              className="rounded-full bg-zinc-100 px-2 py-0.5 text-[10px] text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400"
            >
              {tag}
            </span>
          ))}
        </div>
      )}

      {/* Actions — visible on hover */}
      <div className="mt-2 flex items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100">
        <button
          type="button"
          onClick={() => onInsert(entry)}
          className="rounded px-2 py-1 text-xs font-medium text-primary-600 transition-colors hover:bg-primary-50 dark:text-primary-400 dark:hover:bg-primary-900/20"
        >
          {entry.type === 'template' ? 'Apply' : 'Insert'}
        </button>
        <button
          type="button"
          onClick={() => onEdit(entry)}
          className="rounded px-2 py-1 text-xs text-zinc-500 transition-colors hover:bg-zinc-100 dark:hover:bg-zinc-800"
        >
          Edit
        </button>
        <button
          type="button"
          onClick={() => onDuplicate(entry)}
          className="rounded px-2 py-1 text-xs text-zinc-500 transition-colors hover:bg-zinc-100 dark:hover:bg-zinc-800"
        >
          Duplicate
        </button>
        {!entry.isBuiltIn && (
          <button
            type="button"
            onClick={() => onDelete(entry)}
            className="rounded px-2 py-1 text-xs text-red-500 transition-colors hover:bg-red-50 dark:hover:bg-red-900/20"
          >
            <Icon name="trash" size={12} />
          </button>
        )}
      </div>
    </div>
  )
}
