const GRADIENT_COLORS = [
  'linear-gradient(135deg, #3b82f6, #8b5cf6)',
  'linear-gradient(135deg, #8b5cf6, #ec4899)',
  'linear-gradient(135deg, #ec4899, #f59e0b)',
  'linear-gradient(135deg, #f59e0b, #10b981)',
  'linear-gradient(135deg, #10b981, #06b6d4)',
  'linear-gradient(135deg, #06b6d4, #3b82f6)',
  'linear-gradient(135deg, #6366f1, #a855f7)',
  'linear-gradient(135deg, #f43f5e, #fb7185)',
  'linear-gradient(135deg, #14b8a6, #22d3ee)',
  'linear-gradient(135deg, #f97316, #fbbf24)'
]

export function getRandomGradient(): string {
  return GRADIENT_COLORS[Math.floor(Math.random() * GRADIENT_COLORS.length)]
}

export function getRandomImage(): string {
  // Return a data URL with gradient background
  const gradient = getRandomGradient()
  return `data:image/svg+xml,${encodeURIComponent(`
    <svg width="800" height="400" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:${gradient.match(/#[a-fA-F0-9]{6}/g)?.[0] || '#3b82f6'};stop-opacity:1" />
          <stop offset="100%" style="stop-color:${gradient.match(/#[a-fA-F0-9]{6}/g)?.[1] || '#8b5cf6'};stop-opacity:1" />
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
