// Function to get CSS variable value from the document
function getCSSVariable(name: string): string {
  if (typeof window === 'undefined') {
    // Fallback for SSR - use light mode defaults
    const defaults: Record<string, string> = {
      '--chart-1': '#3b82f6',
      '--secondary': '#8b5cf6',
      '--accent': '#ec4899'
    }
    return defaults[name] || '#3b82f6'
  }
  return getComputedStyle(document.documentElement).getPropertyValue(name).trim()
}

// Gradient combinations using CSS variables
const GRADIENT_PATTERNS = [
  ['--chart-1', '--secondary'],
  ['--secondary', '--accent'],
  ['--accent', '--chart-1'],
  ['--chart-1', '--accent'],
  ['--secondary', '--chart-1'],
  ['--accent', '--secondary'],
  ['--chart-1', '--secondary', '--accent'],
  ['--secondary', '--accent', '--chart-1'],
  ['--accent', '--chart-1', '--secondary'],
]

export function getRandomGradient(): string {
  const pattern = GRADIENT_PATTERNS[Math.floor(Math.random() * GRADIENT_PATTERNS.length)]
  const color1 = getCSSVariable(pattern[0])
  const color2 = getCSSVariable(pattern[1])
  return `linear-gradient(135deg, ${color1}, ${color2})`
}

export function getRandomImage(): string {
  // Return a data URL with gradient background
  const gradient = getRandomGradient()
  const colors = gradient.match(/#[a-fA-F0-9]{6}/g) || ['#3b82f6', '#8b5cf6']
  return `data:image/svg+xml,${encodeURIComponent(`
    <svg width="800" height="400" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:${colors[0]};stop-opacity:1" />
          <stop offset="100%" style="stop-color:${colors[1]};stop-opacity:1" />
        </linearGradient>
      </defs>
      <rect width="100%" height="100%" fill="url(#grad)" />
    </svg>
  `)}`
}

export function getPostImage(image?: string): string {
  return image || getRandomImage()
}

export function getPostGradient(image?: string): string | null {
  return image ? null : getRandomGradient()
}
