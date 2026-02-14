import type { ReactNode } from 'react'
import { SiteHeader } from '@/components/organisms/SiteHeader'
import { SiteFooter } from '@/components/organisms/SiteFooter'
import { PWAPrompts } from '@/components/organisms/PWAPrompts'
import { ToastContainer } from '@/components/atoms/ToastContainer'

interface RootLayoutProps {
  children: ReactNode
}

export function RootLayout({ children }: RootLayoutProps) {
  return (
    <>
      {/* Mobile screen message */}
      <div className="flex min-h-screen flex-col items-center justify-center bg-white px-6 text-center dark:bg-zinc-950 md:hidden">
        <div className="rounded-xl border border-zinc-200 bg-zinc-50 p-8 dark:border-zinc-700 dark:bg-zinc-900">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-primary-600 dark:bg-primary-500">
            <span className="text-lg font-bold text-white">In</span>
          </div>
          <h1 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
            Desktop Only
          </h1>
          <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
            Inspecta requires a medium or large screen to work properly. Please
            open it on a tablet or desktop device.
          </p>
        </div>
      </div>

      {/* Main app — hidden on small screens */}
      <div className="hidden min-h-screen flex-col bg-white dark:bg-zinc-950 md:flex">
        <SiteHeader />
        <main className="flex-1">{children}</main>
        <SiteFooter />
        <PWAPrompts />
        <ToastContainer />
      </div>
    </>
  )
}
