import { writable, get } from 'svelte/store'

interface ConstellationData {
  stars: {
    id: number
    ra: number
    dec: number
    vmag: string
  }[]
  constellations: {
    [id: string]: number[][]
  }
}

export const constellationData = writable<ConstellationData | null>(null)
export const isLoading = writable(false)

export async function loadConstellationData() {
  if (get(constellationData)) return // Already loaded
  
  isLoading.set(true)
  try {
    const response = await fetch('/constellations_xy.json')
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    const data = await response.json()
    for (let i = 0; i < 500; i++) {
        data.stars.push({
        id: -i,
        ra: Math.random() * 360 + 10,
        dec: Math.random() * 90 - 45,
        vmag: (Math.random() * 6 + 1).toFixed(2)
        })
    }
    constellationData.set(data)
  } catch (error) {
    console.error('Error loading constellations:', error)
  } finally {
    isLoading.set(false)
  }
}
