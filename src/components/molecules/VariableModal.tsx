import { useState } from 'react'
import { Button } from '@/components/atoms/Button'
import type { PromptVariable } from '@/types'

interface VariableModalProps {
  variables: PromptVariable[]
  onConfirm: (values: Record<string, string>) => void
  onCancel: () => void
  actionLabel?: string
}

export function VariableModal({
  variables,
  onConfirm,
  onCancel,
  actionLabel = 'Insert',
}: VariableModalProps) {
  const [values, setValues] = useState<Record<string, string>>(() => {
    const initial: Record<string, string> = {}
    for (const v of variables) {
      initial[v.name] = v.defaultValue
    }
    return initial
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onConfirm(values)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-md rounded-xl border border-zinc-200 bg-white p-6 shadow-xl dark:border-zinc-700 dark:bg-zinc-900"
      >
        <h3 className="text-lg font-semibold text-zinc-800 dark:text-zinc-100">
          Fill in Variables
        </h3>
        <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
          Provide values for the template variables below.
        </p>

        <div className="mt-4 space-y-4">
          {variables.map((v) => (
            <div key={v.name}>
              <label className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                {`{{${v.name}}}`}
              </label>
              {v.description && (
                <p className="mb-1 text-xs text-zinc-400">{v.description}</p>
              )}
              <input
                type="text"
                value={values[v.name] || ''}
                onChange={(e) =>
                  setValues((prev) => ({ ...prev, [v.name]: e.target.value }))
                }
                placeholder={v.defaultValue || v.name}
                className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-800 outline-none focus:ring-2 focus:ring-primary-500 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-200"
              />
            </div>
          ))}
        </div>

        <div className="mt-6 flex justify-end gap-3">
          <Button type="button" variant="ghost" size="md" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" size="md">
            {actionLabel}
          </Button>
        </div>
      </form>
    </div>
  )
}
