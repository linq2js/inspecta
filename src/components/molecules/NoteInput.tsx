import { useState, useRef, useCallback, useEffect } from 'react'

interface NoteInputProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  /** When toggled to true externally, expands the input */
  forceExpand?: boolean
}

export function NoteInput({
  value,
  onChange,
  placeholder = 'Add a note...',
  forceExpand = false,
}: NoteInputProps) {
  const [expanded, setExpanded] = useState(!!value)

  // Allow parent to force-expand (e.g. on double-click)
  const [prevForceExpand, setPrevForceExpand] = useState(forceExpand)
  if (forceExpand && !prevForceExpand) {
    setExpanded(true)
  }
  if (prevForceExpand !== forceExpand) {
    setPrevForceExpand(forceExpand)
  }
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const autoResize = useCallback(() => {
    const el = textareaRef.current
    if (!el) return
    el.style.height = 'auto'
    el.style.height = `${el.scrollHeight}px`
  }, [])

  // Resize on value changes (including initial render)
  useEffect(() => {
    autoResize()
  }, [value, expanded, autoResize])

  if (!expanded) {
    return (
      <button
        type="button"
        onClick={() => setExpanded(true)}
        className="text-xs text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300"
      >
        + Add note
      </button>
    )
  }

  return (
    <textarea
      ref={textareaRef}
      value={value}
      onChange={(e) => {
        onChange(e.target.value)
        autoResize()
      }}
      placeholder={placeholder}
      rows={1}
      autoFocus
      className="mt-1 w-full rounded-md border border-zinc-300 bg-white px-2 py-1.5 text-xs text-zinc-900 placeholder:text-zinc-400 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500/20 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100 dark:placeholder:text-zinc-500 resize-none overflow-hidden"
      onBlur={() => {
        if (!value) setExpanded(false)
      }}
    />
  )
}
