import { create } from 'zustand'
import type { PlatformId, CategoryId } from '@/types'

interface FilterState {
  query: string
  platforms: PlatformId[]
  category: CategoryId | ''
  setQuery: (query: string) => void
  togglePlatform: (platform: PlatformId) => void
  setCategory: (category: CategoryId | '') => void
  reset: () => void
}

export const useFilterStore = create<FilterState>((set) => ({
  query: '',
  platforms: [],
  category: '',

  setQuery: (query) => set({ query }),

  togglePlatform: (platform) =>
    set((state) => ({
      platforms: state.platforms.includes(platform)
        ? state.platforms.filter((p) => p !== platform)
        : [...state.platforms, platform],
    })),

  setCategory: (category) => set({ category }),

  reset: () => set({ query: '', platforms: [], category: '' }),
}))
