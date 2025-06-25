import { writable } from 'svelte/store'
import { browser } from '$app/environment'

type Theme = 'light' | 'terminal'

function createThemeStore() {
  const { subscribe, set, update } = writable<Theme>('light')

  return {
    subscribe,
    set,
    toggle: () => update(theme => theme === 'light' ? 'terminal' : 'light'),
    init: () => {
      if (browser) {
        const saved = localStorage.getItem('theme') as Theme
        if (saved) {
          set(saved)
        }
      }
    }
  }
}

export const theme = createThemeStore()
