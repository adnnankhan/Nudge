import { create } from 'zustand'
import { persist } from 'zustand/middleware'

// One store for the whole prototype, saved to localStorage (fake-data.md → Persistence).
// M1 holds only the theme; M3 adds the fake data and simulation state.
export const STORAGE_KEY = 'nudge-proto-v1'

export type Theme = 'dark' | 'light'

type State = {
  theme: Theme
  setTheme: (theme: Theme) => void
}

export const useStore = create<State>()(
  persist(
    (set) => ({
      theme: 'dark',
      setTheme: (theme) => set({ theme }),
    }),
    { name: STORAGE_KEY, version: 1 },
  ),
)
