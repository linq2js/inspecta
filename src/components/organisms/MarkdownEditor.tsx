import { useRef, useCallback } from 'react'
import { usePromptStore } from '@/stores/usePromptStore'

interface ToolbarAction {
  label: string
  title: string
  before: string
  after: string
  /** Key to press with Ctrl/Cmd (single char), or null for no hotkey */
  hotkey: string | null
}

const isMac = typeof navigator !== 'undefined' && /Mac|iPhone|iPad/.test(navigator.userAgent)
const mod = isMac ? '⌘' : 'Ctrl'

const toolbarActions: ToolbarAction[] = [
  { label: 'B', title: 'Bold', before: '**', after: '**', hotkey: 'b' },
  { label: 'I', title: 'Italic', before: '_', after: '_', hotkey: 'i' },
  { label: 'H', title: 'Heading', before: '## ', after: '', hotkey: null },
  { label: '•', title: 'Bullet List', before: '- ', after: '', hotkey: null },
  { label: '1.', title: 'Numbered List', before: '1. ', after: '', hotkey: null },
  { label: '<>', title: 'Code Block', before: '```\n', after: '\n```', hotkey: 'e' },
  { label: '🔗', title: 'Link', before: '[', after: '](url)', hotkey: 'k' },
]

interface MarkdownEditorProps {
  onOpenLibrary?: () => void
}

export function MarkdownEditor({ onOpenLibrary }: MarkdownEditorProps) {
  const { markdownContent, setMarkdownContent } = usePromptStore()
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const insertMarkdown = useCallback(
    (before: string, after: string) => {
      const ta = textareaRef.current
      if (!ta) return

      const start = ta.selectionStart
      const end = ta.selectionEnd
      const text = ta.value
      const selected = text.substring(start, end)

      const newText =
        text.substring(0, start) +
        before +
        (selected || 'text') +
        after +
        text.substring(end)

      setMarkdownContent(newText)

      requestAnimationFrame(() => {
        ta.focus()
        const cursorPos = start + before.length + (selected || 'text').length
        ta.setSelectionRange(cursorPos, cursorPos)
      })
    },
    [setMarkdownContent],
  )

  /** Allow the PromptLibrary or templates to insert text at cursor */
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

  // Expose insertAtCursor for parent components
  ;(MarkdownEditor as any).__insertAtCursor = insertAtCursor

  // Auto-closing pairs: opening char → closing char
  const autoPairs: Record<string, string> = {
    '(': ')',
    '[': ']',
    '{': '}',
    '"': '"',
    "'": "'",
    '`': '`',
  }

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      const ta = e.currentTarget

      // Toolbar hotkeys (Ctrl/Cmd + key)
      if (e.ctrlKey || e.metaKey) {
        const key = e.key.toLowerCase()
        const action = toolbarActions.find((a) => a.hotkey === key)
        if (action) {
          e.preventDefault()
          insertMarkdown(action.before, action.after)
        }
        return
      }

      // Auto-close quotes and brackets
      const closing = autoPairs[e.key]
      if (closing) {
        const start = ta.selectionStart
        const end = ta.selectionEnd
        const text = ta.value

        // If text is selected, wrap it
        if (start !== end) {
          e.preventDefault()
          const selected = text.substring(start, end)
          const newText =
            text.substring(0, start) +
            e.key +
            selected +
            closing +
            text.substring(end)
          setMarkdownContent(newText)
          requestAnimationFrame(() => {
            ta.setSelectionRange(start + 1, end + 1)
          })
          return
        }

        // No selection — insert pair and place cursor between
        e.preventDefault()
        const newText =
          text.substring(0, start) + e.key + closing + text.substring(end)
        setMarkdownContent(newText)
        requestAnimationFrame(() => {
          ta.setSelectionRange(start + 1, start + 1)
        })
        return
      }

      // Skip over closing char if it's already the next character
      const closingChars = new Set(Object.values(autoPairs))
      if (closingChars.has(e.key)) {
        const start = ta.selectionStart
        const text = ta.value
        if (text[start] === e.key) {
          e.preventDefault()
          ta.setSelectionRange(start + 1, start + 1)
        }
      }
    },
    [insertMarkdown, setMarkdownContent],
  )

  return (
    <div className="flex h-full flex-col">
      {/* Toolbar */}
      <div className="flex shrink-0 items-center gap-1 rounded-t-lg border border-zinc-200 bg-zinc-50 px-2 py-1.5 dark:border-zinc-700 dark:bg-zinc-800/50">
        {toolbarActions.map((action) => (
          <button
            key={action.title}
            type="button"
            onClick={() => insertMarkdown(action.before, action.after)}
            title={
              action.hotkey
                ? `${action.title} (${mod}+${action.hotkey.toUpperCase()})`
                : action.title
            }
            className="rounded px-2 py-1 text-xs font-medium text-zinc-600 transition-colors hover:bg-zinc-200 dark:text-zinc-400 dark:hover:bg-zinc-700"
          >
            {action.label}
          </button>
        ))}

        <div className="mx-1 h-4 w-px bg-zinc-300 dark:bg-zinc-600" />

        {onOpenLibrary && (
          <button
            type="button"
            onClick={onOpenLibrary}
            title="Open Prompt Library (Ctrl+Shift+L)"
            className="rounded px-2 py-1 text-xs font-medium text-zinc-600 transition-colors hover:bg-zinc-200 dark:text-zinc-400 dark:hover:bg-zinc-700"
          >
            📚 Library
          </button>
        )}
      </div>

      {/* Editor */}
      <textarea
        ref={textareaRef}
        value={markdownContent}
        onChange={(e) => setMarkdownContent(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Write your prompt in Markdown..."
        className="min-h-0 flex-1 resize-none rounded-b-lg border border-t-0 border-zinc-200 bg-white p-4 font-mono text-sm text-zinc-800 outline-none placeholder:text-zinc-400 focus:ring-2 focus:ring-inset focus:ring-primary-500 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-200 dark:placeholder:text-zinc-600"
        spellCheck={false}
      />
    </div>
  )
}
