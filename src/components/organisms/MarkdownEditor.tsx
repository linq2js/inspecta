import { useRef, useCallback, useEffect } from 'react'
import { usePromptStore } from '@/stores/usePromptStore'

interface MarkdownEditorProps {
  onOpenLibrary?: () => void
}

export function MarkdownEditor({ onOpenLibrary }: MarkdownEditorProps) {
  const { markdownContent, setMarkdownContent } = usePromptStore()
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  /** Insert text at the current caret position */
  const insertAtCursor = useCallback(
    (text: string) => {
      const ta = textareaRef.current
      if (!ta) {
        setMarkdownContent(markdownContent + text)
        return
      }

      const start = ta.selectionStart
      const end = ta.selectionEnd
      const value = ta.value
      const newValue =
        value.substring(0, start) + text + value.substring(end)
      setMarkdownContent(newValue)

      requestAnimationFrame(() => {
        ta.focus()
        const pos = start + text.length
        ta.setSelectionRange(pos, pos)
      })
    },
    [markdownContent, setMarkdownContent],
  )

  // Register insertAtCursor so PromptLibrary can use it
  const { registerInsertAtCursor, unregisterInsertAtCursor } = usePromptStore()
  useEffect(() => {
    registerInsertAtCursor(insertAtCursor)
    return () => unregisterInsertAtCursor()
  }, [insertAtCursor, registerInsertAtCursor, unregisterInsertAtCursor])

  return (
    <div className="flex h-full flex-col">
      {/* Minimal toolbar — library button only */}
      {onOpenLibrary && (
        <div className="flex shrink-0 items-center rounded-t-lg border border-zinc-200 bg-zinc-50 px-2 py-1.5 dark:border-zinc-700 dark:bg-zinc-800/50">
          <button
            type="button"
            onClick={onOpenLibrary}
            title="Open Snippet Library (Ctrl+Shift+L)"
            className="rounded px-2 py-1 text-xs font-medium text-zinc-600 transition-colors hover:bg-zinc-200 dark:text-zinc-400 dark:hover:bg-zinc-700"
          >
            📚 Snippets
          </button>
        </div>
      )}

      {/* Editor */}
      <textarea
        ref={textareaRef}
        value={markdownContent}
        onChange={(e) => setMarkdownContent(e.target.value)}
        placeholder="Write your prompt here..."
        className={`min-h-0 flex-1 resize-none border border-zinc-200 bg-white p-4 font-mono text-sm text-zinc-800 outline-none placeholder:text-zinc-400 focus:ring-2 focus:ring-inset focus:ring-primary-500 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-200 dark:placeholder:text-zinc-600 ${
          onOpenLibrary
            ? 'rounded-b-lg border-t-0'
            : 'rounded-lg'
        }`}
        spellCheck={false}
      />
    </div>
  )
}
