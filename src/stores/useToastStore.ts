import { create } from 'zustand'

const DEFAULT_DURATION = 3000

export interface Toast {
  id: string
  message: string
  /** Optional hex color to show as a swatch alongside the message */
  colorSwatch?: string
}

interface AddToastOptions {
  message: string
  colorSwatch?: string
  /** Auto-dismiss duration in ms. Defaults to 3 000. Pass 0 for persistent. */
  duration?: number
}

interface ToastState {
  toasts: Toast[]
  addToast: (options: AddToastOptions) => void
  removeToast: (id: string) => void
}

let toastCounter = 0

export const useToastStore = create<ToastState>((set, get) => ({
  toasts: [],

  addToast: ({ message, colorSwatch, duration = DEFAULT_DURATION }) => {
    toastCounter++
    const id = `toast-${toastCounter}-${Date.now()}`
    const toast: Toast = { id, message, colorSwatch }

    set({ toasts: [...get().toasts, toast] })

    if (duration > 0) {
      setTimeout(() => {
        get().removeToast(id)
      }, duration)
    }
  },

  removeToast: (id) => {
    set({ toasts: get().toasts.filter((t) => t.id !== id) })
  },
}))
