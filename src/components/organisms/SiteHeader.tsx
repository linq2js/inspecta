import { Link } from '@tanstack/react-router'

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-zinc-200 bg-white/80 backdrop-blur-md dark:border-zinc-800 dark:bg-zinc-950/80">
      <div className="flex h-14 items-center justify-between px-3">
        <div className="flex items-center gap-6">
          <Link to="/" className="flex items-center gap-2">
            <svg
              className="h-7 w-7"
              viewBox="0 0 32 32"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <rect width="32" height="32" rx="6" className="fill-primary-600 dark:fill-primary-500" />
              <line x1="7" y1="26" x2="18" y2="15" stroke="white" strokeWidth="2.8" strokeLinecap="round" />
              <path d="M23.5,5 L24.8,8.5 L28,9.5 L24.8,10.5 L23.5,14 L22.2,10.5 L19,9.5 L22.2,8.5 Z" fill="white" />
              <circle cx="14" cy="8.5" r="1.1" fill="white" opacity="0.65" />
              <circle cx="26.5" cy="18" r="0.9" fill="white" opacity="0.45" />
            </svg>
            <span className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
              Prompt Assistant
            </span>
          </Link>
          <nav className="hidden items-center gap-1 sm:flex">
            <Link
              to="/"
              className="rounded-md px-3 py-1.5 text-sm text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-100 [&.active]:text-primary-600 [&.active]:dark:text-primary-400"
            >
              Home
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
