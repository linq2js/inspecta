import { useToastStore } from '@/stores/useToastStore'
import type { Toast } from '@/stores/useToastStore'

function ToastItem({ toast, onDismiss }: { toast: Toast; onDismiss: () => void }) {
  return (
    <div
      role="status"
      className="animate-in slide-in-from-top-2 fade-in flex items-center gap-2 rounded-lg border border-zinc-200 bg-white px-4 py-2.5 text-sm shadow-lg dark:border-zinc-700 dark:bg-zinc-900"
    >
      {toast.colorSwatch && (
        <div
          className="h-5 w-5 shrink-0 rounded border border-zinc-200 dark:border-zinc-600"
          style={{ backgroundColor: toast.colorSwatch }}
        />
      )}
      <span className="font-medium text-zinc-900 dark:text-zinc-100">
        {toast.message}
      </span>
      <button
        type="button"
        onClick={onDismiss}
        className="ml-1 shrink-0 text-zinc-400 transition-colors hover:text-zinc-700 dark:hover:text-zinc-200"
        aria-label="Dismiss"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={1.5}
          stroke="currentColor"
          width={14}
          height={14}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M6 18 18 6M6 6l12 12"
          />
        </svg>
      </button>
    </div>
  )
}

export function ToastContainer() {
  const { toasts, removeToast } = useToastStore()

  if (toasts.length === 0) return null

  return (
    <div className="pointer-events-none fixed inset-x-0 top-0 z-50 flex flex-col items-center gap-2 px-4 pt-4">
      {toasts.map((toast) => (
        <div key={toast.id} className="pointer-events-auto">
          <ToastItem toast={toast} onDismiss={() => removeToast(toast.id)} />
        </div>
      ))}
    </div>
  )
}
