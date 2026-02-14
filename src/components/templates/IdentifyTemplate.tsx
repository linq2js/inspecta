import { useCallback } from 'react'
import { IdentifyToolbar } from '@/components/organisms/IdentifyToolbar'
import { ImageCanvas } from '@/components/organisms/ImageCanvas'
import { UnifiedItemList } from '@/components/organisms/UnifiedItemList'
import { PromptBlock } from '@/components/molecules/PromptBlock'
import { Textarea } from '@/components/atoms/Textarea'
import { Button } from '@/components/atoms/Button'
import { Icon } from '@/components/atoms/Icon'
import { useIdentifyStore, promptTypes } from '@/stores/useIdentifyStore'
import { usePreviewCanvas } from '@/hooks/usePreviewCanvas'
import { useToastStore } from '@/stores/useToastStore'

function useTimestampedFilename() {
  return useCallback(() => {
    const now = new Date()
    const ts = now
      .toISOString()
      .replace(/[-:T]/g, '')
      .slice(0, 14) // 20260213143022
    return `inspecta-${ts}.png`
  }, [])
}

export function IdentifyTemplate() {
  const {
    image,
    extraPrompt,
    setExtraPrompt,
    generatePrompt,
    promptType,
    setPromptType,
  } = useIdentifyStore()
  const { canvasRef, handleDownload, handleCopyImage, hasPreview } =
    usePreviewCanvas()
  const prompt = generatePrompt()
  const addToast = useToastStore((s) => s.addToast)
  const getFilename = useTimestampedFilename()

  const handleCopyPrompt = async () => {
    if (!prompt) return
    await navigator.clipboard.writeText(prompt)
    addToast({ message: 'Prompt copied to clipboard' })
  }

  const handleCopyImageWithFeedback = async () => {
    await handleCopyImage()
    addToast({ message: 'Image copied to clipboard' })
  }

  const handleDownloadWithTimestamp = () => {
    handleDownload(getFilename())
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">
          Inspector
        </h1>
        <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
          Upload a screenshot, annotate regions, and generate bug-reporting
          prompts.
        </p>
      </div>

      {/* Toolbar */}
      <div className="mb-6">
        <IdentifyToolbar />
      </div>

      {image ? (
        <div className="space-y-6">
          {/* ── Row 1: Original Image (70%) | Annotations (30%) ── */}
          <section>
            <h2 className="mb-3 text-xs font-semibold uppercase tracking-wider text-zinc-400">
              Annotate
            </h2>
            <div className="flex items-stretch gap-6" style={{ height: '70vh' }}>
              {/* Image — 70% */}
              <div className="min-w-0 flex flex-col" style={{ flex: '0 0 70%' }}>
                <ImageCanvas />
              </div>

              {/* Annotations — 30%, matches canvas height */}
              <div className="min-w-0" style={{ flex: '0 0 calc(30% - 1.5rem)' }}>
                <UnifiedItemList />
              </div>
            </div>
          </section>

          {/* ── Row 2: Output ── */}
          <section>
            <h2 className="mb-3 text-xs font-semibold uppercase tracking-wider text-zinc-400">
              Output
            </h2>

            {/* Prompt type selector */}
            <div className="mb-4 flex gap-2">
              {promptTypes.map((pt) => (
                <button
                  key={pt.id}
                  type="button"
                  onClick={() => setPromptType(pt.id)}
                  className={`rounded-lg border px-3 py-2 text-left transition-all ${
                    promptType === pt.id
                      ? 'border-primary-600 bg-primary-600 dark:bg-primary-500 dark:border-primary-500'
                      : 'border-zinc-200 hover:border-zinc-300 dark:border-zinc-700 dark:hover:border-zinc-600'
                  }`}
                >
                  <span className={`block text-sm font-medium ${
                    promptType === pt.id
                      ? 'text-white'
                      : 'text-zinc-900 dark:text-zinc-100'
                  }`}>
                    {pt.label}
                  </span>
                  <span className={`block text-xs ${
                    promptType === pt.id
                      ? 'text-white/70'
                      : 'text-zinc-500 dark:text-zinc-400'
                  }`}>
                    {pt.description}
                  </span>
                </button>
              ))}
            </div>

            <div className="flex items-stretch gap-6">
              {/* Extra Prompt — 40% */}
              <div className="min-w-0 flex flex-col" style={{ flex: '0 0 40%' }}>
                <Textarea
                  label="Extra Prompt"
                  wrapperClassName="flex-1 flex flex-col"
                  value={extraPrompt}
                  onChange={(e) => setExtraPrompt(e.target.value)}
                  placeholder="Add additional context (e.g., platform version, device, screen context)..."
                  className="flex-1"
                />
              </div>

              {/* Generated Prompt — 40% */}
              <div className="min-w-0 flex flex-col" style={{ flex: '0 0 40%' }}>
                <h3 className="mb-2 text-sm font-semibold text-zinc-700 dark:text-zinc-300">
                  Generated Prompt
                </h3>
                <div className="flex-1">
                  <PromptBlock text={prompt} />
                </div>
              </div>

              {/* Action Buttons — 20% */}
              <div className="min-w-0" style={{ flex: '0 0 calc(20% - 3rem)' }}>
                <h3 className="mb-2 text-sm font-semibold text-zinc-700 dark:text-zinc-300">
                  Actions
                </h3>
                <div className="flex flex-col gap-3">
                  <Button
                    variant="primary"
                    size="md"
                    onClick={handleCopyPrompt}
                    disabled={!prompt}
                    className="w-full"
                  >
                    <Icon name="clipboard" size={16} />
                    Copy Prompt
                  </Button>
                  <Button
                    variant="secondary"
                    size="md"
                    onClick={handleCopyImageWithFeedback}
                    disabled={!hasPreview}
                    className="w-full"
                  >
                    <Icon name="clipboard" size={16} />
                    Copy Image
                  </Button>
                  <Button
                    variant="secondary"
                    size="md"
                    onClick={handleDownloadWithTimestamp}
                    disabled={!hasPreview}
                    className="w-full"
                  >
                    <Icon name="download" size={16} />
                    Download Image
                  </Button>
                </div>
              </div>
            </div>
          </section>

          {/* Hidden canvas for rendering annotated image */}
          <canvas ref={canvasRef} className="hidden" />
        </div>
      ) : (
        <div className="flex min-h-[40vh] items-center justify-center rounded-xl border-2 border-dashed border-zinc-300 dark:border-zinc-700">
          <div className="text-center">
            <p className="text-sm text-zinc-400 dark:text-zinc-500">
              Upload an image or paste from clipboard (Ctrl+V) to get started.
            </p>
          </div>
        </div>
      )}
    </div>
  )
}
