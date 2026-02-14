import { createFileRoute } from '@tanstack/react-router'
import { IdentifyTemplate } from '@/components/templates/IdentifyTemplate'

export const Route = createFileRoute('/')({
  component: InspectorPage,
})

function InspectorPage() {
  return <IdentifyTemplate />
}
