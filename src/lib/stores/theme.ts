import { writable } from 'svelte/store'
import { browser } from '$app/environment'

type Theme = 'light' | 'dark'

function createThemeStore() {
  const { subscribe, set, update } = writable<Theme>('light')

  return {
    subscribe,
    set,
    toggle: () => update((theme) => (theme === 'light' ? 'dark' : 'light')),
    init: () => {
      if (browser) {
        const saved = localStorage.getItem('theme') as Theme
        if (saved && (saved === 'light' || saved === 'dark')) {
          set(saved)
        } else {
          // Check system preference
          const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
          set(prefersDark ? 'dark' : 'light')
        }
      }
    }
  }
}

export const theme = createThemeStore()
