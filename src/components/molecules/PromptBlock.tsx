import { useState } from 'react'
import { Button } from '@/components/atoms/Button'
import { Icon } from '@/components/atoms/Icon'

interface PromptBlockProps {
  text: string
}

export function PromptBlock({ text }: PromptBlockProps) {
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    await navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  if (!text) {
    return (
      <div className="flex h-full items-center justify-center rounded-lg border border-dashed border-zinc-300 p-4 text-center text-sm text-zinc-400 dark:border-zinc-700">
        Add notes to items to generate a prompt.
      </div>
    )
  }

  return (
    <div className="relative flex h-full flex-col rounded-lg border border-zinc-200 bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-800/50">
      <div className="absolute right-2 top-2">
        <Button variant="ghost" size="sm" onClick={handleCopy}>
          <Icon name="clipboard" size={14} />
          {copied ? 'Copied!' : 'Copy'}
        </Button>
      </div>
      <pre className="flex-1 overflow-auto whitespace-pre-wrap p-4 pr-24 text-xs text-zinc-700 dark:text-zinc-300 font-mono">
        {text}
      </pre>
    </div>
  )
}
