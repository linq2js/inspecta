import { useRef, useCallback, useEffect } from 'react'
import { Button } from '@/components/atoms/Button'
import { Icon } from '@/components/atoms/Icon'
import { useIdentifyStore } from '@/stores/useIdentifyStore'

export function IdentifyToolbar() {
  const { setImage, reset, image, annotations, undo, redo, canUndo, canRedo } =
    useIdentifyStore()
  const fileInputRef = useRef<HTMLInputElement>(null)

  /** Guard: confirm before replacing existing image that has annotations */
  const confirmIfNeeded = useCallback((): boolean => {
    if (!image || annotations.length === 0) return true
    return window.confirm(
      'You have existing annotations. Loading a new image will discard them. Continue?',
    )
  }, [image, annotations])

  const handleFile = useCallback(
    (file: File) => {
      if (!confirmIfNeeded()) return
      const reader = new FileReader()
      reader.onload = (e) => {
        const dataUrl = e.target?.result as string
        const img = new Image()
        img.onload = () => {
          setImage(dataUrl, { w: img.naturalWidth, h: img.naturalHeight })
        }
        img.src = dataUrl
      }
      reader.readAsDataURL(file)
    },
    [setImage, confirmIfNeeded],
  )

  const handlePaste = useCallback(
    async (e: ClipboardEvent) => {
      const items = e.clipboardData?.items
      if (!items) return
      for (const item of items) {
        if (item.type.startsWith('image/')) {
          const file = item.getAsFile()
          if (file) handleFile(file)
          break
        }
      }
    },
    [handleFile],
  )

  useEffect(() => {
    const listener = handlePaste as unknown as EventListener
    document.addEventListener('paste', listener)
    return () => document.removeEventListener('paste', listener)
  }, [handlePaste])

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      const file = e.dataTransfer.files[0]
      if (file?.type.startsWith('image/')) handleFile(file)
    },
    [handleFile],
  )

  const handleReset = useCallback(() => {
    if (annotations.length > 0) {
      if (!window.confirm('Discard all annotations and reset? This cannot be undone.'))
        return
    }
    reset()
  }, [reset, annotations])

  return (
    <div className="flex flex-wrap items-center gap-3 rounded-lg border border-zinc-200 bg-white p-3 dark:border-zinc-700 dark:bg-zinc-900">
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0]
          if (file) handleFile(file)
        }}
      />

      <Button
        variant="secondary"
        size="sm"
        onClick={() => fileInputRef.current?.click()}
      >
        <Icon name="upload" size={14} />
        Upload
      </Button>

      <div
        className="flex items-center gap-1 rounded-md border border-dashed border-zinc-300 px-3 py-1.5 text-xs text-zinc-400 dark:border-zinc-600"
        onDragOver={(e) => e.preventDefault()}
        onDrop={handleDrop}
      >
        Drop image or Ctrl+V to paste
      </div>

      {image && (
        <>
          <div className="h-6 w-px bg-zinc-200 dark:bg-zinc-700" />

          <Button
            variant="ghost"
            size="sm"
            onClick={undo}
            disabled={!canUndo()}
            title="Undo (Ctrl+Z)"
          >
            Undo
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={redo}
            disabled={!canRedo()}
            title="Redo (Ctrl+Shift+Z)"
          >
            Redo
          </Button>

          <div className="h-6 w-px bg-zinc-200 dark:bg-zinc-700" />

          <Button variant="ghost" size="sm" onClick={handleReset}>
            Reset
          </Button>
        </>
      )}
    </div>
  )
}
