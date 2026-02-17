import { useRef, useCallback, useEffect } from 'react'
import { Button } from '@/components/atoms/Button'
import { Icon } from '@/components/atoms/Icon'
import { DeviceFrameInserter } from '@/components/molecules/DeviceFrameInserter'
import { useImageStore } from '@/stores/useImageStore'
import { useAnnotationStore } from '@/stores/useAnnotationStore'
import { usePromptStore } from '@/stores/usePromptStore'

/** Read an image File and call addImage on the store directly */
function loadImageFile(file: File) {
  const reader = new FileReader()
  reader.onload = (e) => {
    const dataUrl = e.target?.result as string
    const img = new Image()
    img.onload = () => {
      useImageStore.getState().addImage(dataUrl, {
        w: img.naturalWidth,
        h: img.naturalHeight,
      })
    }
    img.src = dataUrl
  }
  reader.readAsDataURL(file)
}

export function IdentifyToolbar() {
  const {
    images,
    canUndoImage,
    canRedoImage,
    undoImage,
    redoImage,
    resetImages,
  } = useImageStore()
  const { annotations, canUndo, canRedo, undo, redo, resetAnnotations } =
    useAnnotationStore()
  const { resetPrompt } = usePromptStore()
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Global paste listener — capture phase so it fires BEFORE the textarea processes it
  useEffect(() => {
    const onPaste = (e: ClipboardEvent) => {
      const items = e.clipboardData?.items
      if (!items) return
      for (let i = 0; i < items.length; i++) {
        if (items[i].type.startsWith('image/')) {
          e.preventDefault()
          e.stopPropagation()
          const file = items[i].getAsFile()
          if (file) loadImageFile(file)
          return
        }
      }
    }
    // capture: true — fires before any element's own paste handler
    document.addEventListener('paste', onPaste, true)
    return () => document.removeEventListener('paste', onPaste, true)
  }, [])

  const handleReset = useCallback(() => {
    if (images.length > 0 || annotations.length > 0) {
      if (
        !window.confirm(
          'Discard all images, annotations, and prompt content? This cannot be undone.',
        )
      )
        return
    }
    resetImages()
    resetAnnotations()
    resetPrompt()
  }, [resetImages, resetAnnotations, resetPrompt, images, annotations])

  const handleUndo = useCallback(() => {
    if (canUndo()) {
      undo()
    } else if (canUndoImage()) {
      undoImage()
    }
  }, [canUndo, undo, canUndoImage, undoImage])

  const handleRedo = useCallback(() => {
    if (canRedo()) {
      redo()
    } else if (canRedoImage()) {
      redoImage()
    }
  }, [canRedo, redo, canRedoImage, redoImage])

  const canUndoAny = canUndo() || canUndoImage()
  const canRedoAny = canRedo() || canRedoImage()

  return (
    <div className="flex flex-wrap items-center gap-3 rounded-lg border border-zinc-200 bg-white p-3 dark:border-zinc-700 dark:bg-zinc-900">
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0]
          if (file) loadImageFile(file)
          if (fileInputRef.current) fileInputRef.current.value = ''
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

      <div className="h-6 w-px bg-zinc-200 dark:bg-zinc-700" />

      <DeviceFrameInserter />

      {images.length > 0 && (
        <>
          <div className="h-6 w-px bg-zinc-200 dark:bg-zinc-700" />

          <Button
            variant="ghost"
            size="sm"
            onClick={handleUndo}
            disabled={!canUndoAny}
            title="Undo (Ctrl+Z)"
          >
            Undo
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleRedo}
            disabled={!canRedoAny}
            title="Redo (Ctrl+Shift+Z)"
          >
            Redo
          </Button>

          <div className="h-6 w-px bg-zinc-200 dark:bg-zinc-700" />

          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              if (
                !window.confirm(
                  'Remove all images and annotations? This cannot be undone.',
                )
              )
                return
              resetImages()
              resetAnnotations()
            }}
            title="Remove all images and annotations"
          >
            <Icon name="trash" size={14} />
            Remove Image
          </Button>

          <Button variant="ghost" size="sm" onClick={handleReset}>
            Reset
          </Button>
        </>
      )}
    </div>
  )
}
