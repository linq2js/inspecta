import { Link } from '@tanstack/react-router'

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-zinc-200 bg-white/80 backdrop-blur-md dark:border-zinc-800 dark:bg-zinc-950/80">
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4 sm:px-6">
        <div className="flex items-center gap-6">
          <Link to="/" className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary-600 dark:bg-primary-500">
              <span className="text-xs font-bold text-white">In</span>
            </div>
            <span className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
              Inspecta
            </span>
          </Link>
          <nav className="hidden items-center gap-1 sm:flex">
            <Link
              to="/"
              className="rounded-md px-3 py-1.5 text-sm text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-100 [&.active]:text-primary-600 [&.active]:dark:text-primary-400"
            >
              Inspector
            </Link>
            <Link
              to="/components"
              className="rounded-md px-3 py-1.5 text-sm text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-100 [&.active]:text-primary-600 [&.active]:dark:text-primary-400"
            >
              Components
            </Link>
          </nav>
        </div>
      </div>
    </header>
  )
}
