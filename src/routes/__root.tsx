import { createRootRoute, Outlet } from '@tanstack/react-router'
import { RootLayout } from '@/components/templates/RootLayout'

export const Route = createRootRoute({
  component: () => (
    <RootLayout>
      <Outlet />
    </RootLayout>
  ),
})
