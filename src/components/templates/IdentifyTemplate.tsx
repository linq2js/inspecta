import { useCallback, useEffect, useState } from 'react'
import Markdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { IdentifyToolbar } from '@/components/organisms/IdentifyToolbar'
import { ImageCanvas } from '@/components/organisms/ImageCanvas'
import { UnifiedItemList } from '@/components/organisms/UnifiedItemList'
import { LayerList } from '@/components/organisms/LayerList'
import { MarkdownEditor } from '@/components/organisms/MarkdownEditor'
import { PromptLibrary } from '@/components/organisms/PromptLibrary'
import { ResizablePanel } from '@/components/atoms/ResizablePanel'
import { Button } from '@/components/atoms/Button'
import { Icon } from '@/components/atoms/Icon'
import { useImageStore } from '@/stores/useImageStore'
import { useAnnotationStore } from '@/stores/useAnnotationStore'
import { usePromptStore, buildAnnotationBlock, buildImageMetaBlock } from '@/stores/usePromptStore'
import { usePreviewCanvas } from '@/hooks/usePreviewCanvas'
import { useToastStore } from '@/stores/useToastStore'

function useTimestampedFilename() {
  return useCallback(() => {
    const now = new Date()
    const ts = now
      .toISOString()
      .replace(/[-:T]/g, '')
      .slice(0, 14)
    return `prompt-assistant-${ts}.png`
  }, [])
}

export function IdentifyTemplate() {
  const { images, canvasBounds } = useImageStore()
  const { getUnifiedList } = useAnnotationStore()
  const { markdownContent, appMode, toggleAppMode } = usePromptStore()
  const { canvasRef, previewUrl, handleDownload, handleCopyImage, hasPreview } =
    usePreviewCanvas()
  const addToast = useToastStore((s) => s.addToast)
  const getFilename = useTimestampedFilename()

  const [libraryOpen, setLibraryOpen] = useState(false)

  const handleCopyPrompt = useCallback(async () => {
    const items = getUnifiedList()
    const { includeImageMeta, images: storeImages } = useImageStore.getState()
    const isSingle = storeImages.length === 1
    const effectiveMeta = isSingle
      ? storeImages[0].note.trim().length > 0 && includeImageMeta
      : includeImageMeta
    const compositeDims =
      canvasBounds.totalWidth > 0
        ? { w: canvasBounds.totalWidth, h: canvasBounds.totalHeight }
        : null
    const annotationBlock = buildAnnotationBlock(items, compositeDims, { skipDimensions: effectiveMeta })
    const imageMetaBlock = effectiveMeta
      ? buildImageMetaBlock(storeImages, compositeDims)
      : ''
    const fullPrompt = markdownContent.trim()
      ? markdownContent + imageMetaBlock + annotationBlock
      : (imageMetaBlock + annotationBlock).trim()
    if (!fullPrompt.trim()) return
    await navigator.clipboard.writeText(fullPrompt)
    addToast({ message: 'Prompt copied to clipboard' })
  }, [getUnifiedList, canvasBounds, images, markdownContent, addToast])

  const handleCopyImageWithFeedback = useCallback(async () => {
    await handleCopyImage()
    addToast({ message: 'Image copied to clipboard' })
  }, [handleCopyImage, addToast])

  const handleDownloadWithTimestamp = useCallback(() => {
    handleDownload(getFilename())
  }, [handleDownload, getFilename])

  // Keyboard shortcuts
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      // Ctrl+Shift+P — toggle preview
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'p') {
        e.preventDefault()
        toggleAppMode()
        return
      }
      // Ctrl+Shift+L — toggle library
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'l') {
        e.preventDefault()
        setLibraryOpen((prev) => !prev)
        return
      }
      // Ctrl+Shift+C — copy prompt
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'c') {
        e.preventDefault()
        handleCopyPrompt()
        return
      }
      // Ctrl+Shift+X — copy image
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'x') {
        e.preventDefault()
        handleCopyImageWithFeedback()
        return
      }
      // Ctrl+Shift+D — download image
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'd') {
        e.preventDefault()
        handleDownloadWithTimestamp()
        return
      }
      // Ctrl+Shift+M — toggle image meta
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'm') {
        e.preventDefault()
        const { includeImageMeta, setIncludeImageMeta } = useImageStore.getState()
        setIncludeImageMeta(!includeImageMeta)
        return
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [toggleAppMode, handleCopyPrompt, handleCopyImageWithFeedback, handleDownloadWithTimestamp])

  const hasImages = images.length > 0

  return (
    <div className="px-3 py-4">
      {/* Header */}
      <div className="mb-4 flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">
            Prompt Assistant
          </h1>
          <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
            Write prompts, annotate images, and export to your AI agent.
          </p>
        </div>
        <Button
          variant={appMode === 'preview' ? 'primary' : 'secondary'}
          size="sm"
          onClick={toggleAppMode}
          title="Toggle Preview (Ctrl+Shift+P)"
        >
          <Icon name={appMode === 'preview' ? 'pencilSquare' : 'eye'} size={14} />
          {appMode === 'preview' ? 'Edit' : 'Preview'}
        </Button>
      </div>

      {/* Toolbar — only visible in edit mode */}
      {appMode === 'edit' && (
        <div className="mb-4">
          <IdentifyToolbar />
        </div>
      )}

      {/* Main content area */}
      <div style={{ height: 'calc(100vh - 220px)' }}>
        {appMode === 'edit' ? (
          <EditMode
            hasImages={hasImages}
            onOpenLibrary={() => setLibraryOpen(true)}
          />
        ) : (
          <PreviewMode
            markdownContent={markdownContent}
            previewUrl={previewUrl}
            hasImages={hasImages}
            hasPreview={hasPreview}
            onCopyPrompt={handleCopyPrompt}
            onCopyImage={handleCopyImageWithFeedback}
            onDownload={handleDownloadWithTimestamp}
          />
        )}
      </div>

      {/* Hidden canvas for rendering annotated image */}
      <canvas ref={canvasRef} className="hidden" />

      {/* Prompt Library slide-out */}
      <PromptLibrary
        isOpen={libraryOpen}
        onClose={() => setLibraryOpen(false)}
      />
    </div>
  )
}

// ── Edit Mode ──

function EditMode({
  hasImages,
  onOpenLibrary,
}: {
  hasImages: boolean
  onOpenLibrary: () => void
}) {
  const leftPanel = (
    <div className="flex h-full flex-col">
      <MarkdownEditor onOpenLibrary={onOpenLibrary} />
    </div>
  )

  const rightPanel = (
    <div className="flex h-full flex-col gap-3">
      {hasImages ? (
        <>
          <div className="min-h-0 flex-1">
            <ImageCanvas />
          </div>
          <div className="flex shrink-0 gap-3" style={{ maxHeight: '35%' }}>
            <div className="w-1/3 min-w-0 overflow-y-auto">
              <LayerList />
            </div>
            <div className="min-w-0 flex-1 overflow-y-auto">
              <UnifiedItemList />
            </div>
          </div>
        </>
      ) : (
        <div className="flex h-full items-center justify-center rounded-xl border-2 border-dashed border-zinc-300 dark:border-zinc-700">
          <div className="text-center">
            <p className="text-sm text-zinc-400 dark:text-zinc-500">
              Upload or paste an image (Ctrl+V) to annotate.
            </p>
            <p className="mt-1 text-xs text-zinc-400 dark:text-zinc-600">
              Images are optional — you can write prompts without them.
            </p>
          </div>
        </div>
      )}
    </div>
  )

  return (
    <ResizablePanel
      left={leftPanel}
      right={rightPanel}
      defaultLeftPercent={40}
      minLeftPercent={25}
      maxLeftPercent={65}
      storageKey="edit-panel"
    />
  )
}

// ── Preview Mode ──

function PreviewMode({
  markdownContent,
  previewUrl,
  hasImages,
  hasPreview,
  onCopyPrompt,
  onCopyImage,
  onDownload,
}: {
  markdownContent: string
  previewUrl: string | null
  hasImages: boolean
  hasPreview: boolean
  onCopyPrompt: () => void
  onCopyImage: () => void
  onDownload: () => void
}) {
  const { getUnifiedList } = useAnnotationStore()
  const { images, canvasBounds, includeImageMeta, setIncludeImageMeta } =
    useImageStore()
  const items = getUnifiedList()

  // Single image: show toggler only when the image has a note; force false when no note
  const isSingleImage = images.length === 1
  const singleImageHasNote = isSingleImage && images[0].note.trim().length > 0
  const effectiveImageMeta = isSingleImage
    ? singleImageHasNote && includeImageMeta
    : includeImageMeta

  // Build the full output prompt: user markdown + optional image meta + annotation block
  const compositeDims =
    canvasBounds.totalWidth > 0
      ? { w: canvasBounds.totalWidth, h: canvasBounds.totalHeight }
      : null
  const annotationBlock = buildAnnotationBlock(items, compositeDims, { skipDimensions: effectiveImageMeta })
  const imageMetaBlock = effectiveImageMeta
    ? buildImageMetaBlock(images, compositeDims)
    : ''
  const fullPrompt = markdownContent.trim()
    ? markdownContent + imageMetaBlock + annotationBlock
    : (imageMetaBlock + annotationBlock).trim()

  const leftPanel = (
    <div className="flex h-full flex-col">
      {/* Actions */}
      <div className="mb-3 flex h-8 shrink-0 items-center gap-2">
        <Button
          variant="secondary"
          size="sm"
          onClick={onCopyPrompt}
          disabled={!fullPrompt.trim()}
          title="Copy Prompt (Ctrl+Shift+C)"
        >
          <Icon name="clipboard" size={14} />
          Copy Prompt
        </Button>
      </div>

      {/* Full prompt preview */}
      <div className="min-h-0 flex-1 overflow-y-auto rounded-lg border border-zinc-200 bg-white dark:border-zinc-700 dark:bg-zinc-900">
        {fullPrompt.trim() ? (
          <div className="prose prose-sm prose-zinc max-w-none p-6 dark:prose-invert">
            <Markdown remarkPlugins={[remarkGfm]}>{fullPrompt}</Markdown>
          </div>
        ) : (
          <div className="flex h-full items-center justify-center">
            <p className="text-sm text-zinc-400 dark:text-zinc-500">
              No prompt content yet. Switch to Edit mode to write your prompt.
            </p>
          </div>
        )}
      </div>
    </div>
  )

  const rightPanel = (
    <div className="flex h-full flex-col">
      <div className="mb-3 flex h-8 shrink-0 items-center gap-2">
        {hasImages && (
          <>
            <Button
              variant="secondary"
              size="sm"
              onClick={onCopyImage}
              disabled={!hasPreview}
              title="Copy Image (Ctrl+Shift+X)"
            >
              <Icon name="clipboard" size={14} />
              Copy Image
            </Button>
            <Button
              variant="secondary"
              size="sm"
              onClick={onDownload}
              disabled={!hasPreview}
              title="Download (Ctrl+Shift+D)"
            >
              <Icon name="download" size={14} />
              Download
            </Button>
            {(!isSingleImage || singleImageHasNote) && (
              <div className="ml-auto">
                <button
                  type="button"
                  onClick={() => setIncludeImageMeta(!includeImageMeta)}
                  title={
                    (includeImageMeta
                      ? 'Image meta ON — IDs shown on image, image list appended to prompt'
                      : 'Image meta OFF — no IDs on image, no image list in prompt') +
                    ' (Ctrl+Shift+M)'
                  }
                  className={`flex items-center gap-1.5 rounded-md border px-2 py-1 text-xs font-medium transition-colors ${
                    includeImageMeta
                      ? 'border-blue-500 bg-blue-50 text-blue-700 dark:border-blue-500 dark:bg-blue-950/40 dark:text-blue-300'
                      : 'border-zinc-300 text-zinc-500 hover:border-zinc-400 dark:border-zinc-600 dark:text-zinc-400 dark:hover:border-zinc-500'
                  }`}
                >
                  <svg
                    width={14}
                    height={14}
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={2}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <rect x="3" y="3" width="18" height="18" rx="2" />
                    <circle cx="8.5" cy="8.5" r="1.5" />
                    <path d="M21 15l-5-5L5 21" />
                  </svg>
                  Image Meta
                </button>
              </div>
            )}
          </>
        )}
      </div>
      <div className="min-h-0 flex-1 overflow-auto rounded-lg border border-zinc-200 bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-800">
        {previewUrl ? (
          <img
            src={previewUrl}
            alt="Annotated preview"
            className="block max-w-full"
            draggable={false}
          />
        ) : (
          <div className="flex h-full items-center justify-center">
            <p className="text-sm text-zinc-400 dark:text-zinc-500">
              {hasImages
                ? 'Add annotations to generate a preview.'
                : 'No images uploaded.'}
            </p>
          </div>
        )}
      </div>
    </div>
  )

  return (
    <ResizablePanel
      left={leftPanel}
      right={rightPanel}
      defaultLeftPercent={50}
      minLeftPercent={30}
      maxLeftPercent={70}
      storageKey="preview-panel"
    />
  )
}
