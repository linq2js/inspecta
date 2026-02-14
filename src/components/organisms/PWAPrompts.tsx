import { usePWA } from '@/hooks/usePWA'
import { Icon } from '@/components/atoms/Icon'

export function PWAPrompts() {
  const {
    needRefresh,
    updateApp,
    dismissUpdate,
    canInstall,
    installApp,
    dismissInstall,
  } = usePWA()

  return (
    <>
      {/* ── Update available toast ── */}
      {needRefresh && (
        <Toast
          title="Update available"
          message="A new version of Inspecta is ready."
          actionLabel="Update now"
          onAction={updateApp}
          onDismiss={dismissUpdate}
          variant="update"
        />
      )}

      {/* ── Install prompt toast ── */}
      {canInstall && (
        <Toast
          title="Install Inspecta"
          message="Add to your home screen for a better experience."
          actionLabel="Install"
          onAction={installApp}
          onDismiss={dismissInstall}
          variant="install"
        />
      )}
    </>
  )
}

function Toast({
  title,
  message,
  actionLabel,
  onAction,
  onDismiss,
  variant,
}: {
  title: string
  message: string
  actionLabel: string
  onAction: () => void
  onDismiss: () => void
  variant: 'update' | 'install'
}) {
  const iconName = variant === 'update' ? 'sparkles' : 'download'
  const actionColor =
    variant === 'update'
      ? 'bg-primary-600 hover:bg-primary-700 text-white'
      : 'bg-zinc-900 hover:bg-zinc-800 text-white dark:bg-white dark:hover:bg-zinc-200 dark:text-zinc-900'

  return (
    <div className="fixed bottom-4 right-4 z-50 animate-slide-up">
      <div className="flex max-w-sm items-start gap-3 rounded-xl border border-zinc-200 bg-white p-4 shadow-lg dark:border-zinc-700 dark:bg-zinc-900">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary-100 text-primary-600 dark:bg-primary-900/30 dark:text-primary-400">
          <Icon name={iconName} size={16} />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
            {title}
          </p>
          <p className="mt-0.5 text-xs text-zinc-500 dark:text-zinc-400">
            {message}
          </p>
          <div className="mt-3 flex items-center gap-2">
            <button
              type="button"
              onClick={onAction}
              className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${actionColor}`}
            >
              {actionLabel}
            </button>
            <button
              type="button"
              onClick={onDismiss}
              className="rounded-lg px-3 py-1.5 text-xs font-medium text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-200"
            >
              Later
            </button>
          </div>
        </div>
        <button
          type="button"
          onClick={onDismiss}
          className="shrink-0 rounded-md p-1 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300"
          aria-label="Dismiss"
        >
          <Icon name="x" size={14} />
        </button>
      </div>
    </div>
  )
}
