<script lang="ts">
  import { onMount } from 'svelte'

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

  let rawData: ConstellationData | null = $state(null)
  let lines: {
    id: string
    width: number
    left: number
    top: number
    angle: number
    opacity: number
  }[] = $state([])
  let containerSize = $state({ width: 0, height: 0 })
  let mousePosition = $state({ x: 0, y: 0 })
  let hoveredStarId = $state<number | null>(null)
  let isHeroHovered = $state(false)

  const decLimits = { min: -45, max: 45 }
  const raLimits = { min: 10, max: 380 }

  const starsById: Map<number, ConstellationData['stars'][0]> = $derived(
    rawData ? new Map((rawData as ConstellationData).stars.map((star) => [star.id, star])) : new Map()
  )

  onMount(async () => {
    try {
      const response = await fetch('/constellations_xy.json')
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      rawData = await response.json()
      if (rawData && rawData.stars.length > 0) {
        for (let i = 0; i < 1000; i++) {
          rawData.stars.push({
            id: -i,
            ra: Math.random() * 360 + 10,
            dec: Math.random() * 90 - 45,
            vmag: (Math.random() * 6 + 1).toFixed(2)
          })
        }
        rawData.stars = rawData.stars.filter(star => star.ra > raLimits.min && star.ra < raLimits.max && star.dec > decLimits.min && star.dec < decLimits.max)


        const adjustedRA = (ra: number) => ((ra - raLimits.min) / (raLimits.max - ra)) * 100
        const adjustedDec = (dec: number) => ((dec + (decLimits.max - decLimits.min)/2) / (decLimits.max - decLimits.min)) * 100
        rawData.stars.forEach(star => {
          star.ra = adjustedRA(star.ra)
          star.dec = adjustedDec(star.dec)
        })
        console.log(`Loaded ${rawData.stars.length} stars and their constellation lines.`)
      }
    } catch (error) {
      console.error('Error loading constellations:', error)
    }

    // Listen for mouse events on the entire document to capture hero hover
    const handleDocumentMouseMove = (event: MouseEvent) => {
      const heroElement = document.querySelector('header')
      if (heroElement) {
        const rect = heroElement.getBoundingClientRect()
        const isOverHero = event.clientX >= rect.left && 
                          event.clientX <= rect.right && 
                          event.clientY >= rect.top && 
                          event.clientY <= rect.bottom
        
        if (isOverHero) {
          isHeroHovered = true
          // Update mouse position relative to the constellation container
          const containerElement = document.querySelector('.constellation-container')
          if (containerElement) {
            const containerRect = containerElement.getBoundingClientRect()
            mousePosition = {
              x: event.clientX - containerRect.left,
              y: event.clientY - containerRect.top
            }
          }
        } else {
          isHeroHovered = false
        }
      }
    }

    document.addEventListener('mousemove', handleDocumentMouseMove)
  })

  $effect(() => {
    if (!rawData || !containerSize.width || !containerSize.height) {
      lines = []
      return
    }

    const { stars, constellations } = rawData
    if (!stars || !constellations) return
    const { width, height } = containerSize

    const calculatedLines = []


    for (const constellationName in constellations) {
      const connections = constellations[constellationName]

      for (const connection of connections) {
        const star1 = starsById.get(connection[0])
        const star2 = starsById.get(connection[1])


        if (star1 && star2) {
          const pos1 = { x: (star1.ra / 100) * width, y: (star1.dec / 100) * height }
          const pos2 = { x: (star2.ra / 100) * width, y: (star2.dec / 100) * height }

          const dx = pos2.x - pos1.x
          const dy = pos2.y - pos1.y
          const distance = Math.sqrt(dx * dx + dy * dy)
          const angle = (Math.atan2(dy, dx) * 180) / Math.PI

          calculatedLines.push({
            id: `${star1.id}-${star2.id}`,
            width: distance,
            left: star1.ra,
            top: star1.dec,
            angle: angle,
            opacity: Math.max(0.1, 0.4 - (distance / Math.max(width, height)) * 0.3)
          })
        }
      }
    }
    lines = calculatedLines
  })

  const handleMouseMove = (event: MouseEvent) => {
    const rect = (event.currentTarget as HTMLElement).getBoundingClientRect()
    mousePosition = {
      x: event.clientX - rect.left,
      y: event.clientY - rect.top
    }
  }

  const getDistanceToStar = (star: { ra: number; dec: number }) => {
    const starX = (star.ra / 100) * containerSize.width
    const starY = (star.dec / 100) * containerSize.height
    const dx = mousePosition.x - starX
    const dy = mousePosition.y - starY
    return Math.sqrt(dx * dx + dy * dy)
  }

  const getDistanceToLine = (star1: { ra: number; dec: number }, star2: { ra: number; dec: number }) => {
    const star1X = (star1.ra / 100) * containerSize.width
    const star1Y = (star1.dec / 100) * containerSize.height
    const star2X = (star2.ra / 100) * containerSize.width
    const star2Y = (star2.dec / 100) * containerSize.height
    
    // Calculate distance from mouse to line segment
    const A = mousePosition.x - star1X
    const B = mousePosition.y - star1Y
    const C = star2X - star1X
    const D = star2Y - star1Y
    
    const dot = A * C + B * D
    const lenSq = C * C + D * D
    
    if (lenSq === 0) return Math.sqrt(A * A + B * B)
    
    let param = dot / lenSq
    param = Math.max(0, Math.min(1, param))
    
    const xx = star1X + param * C
    const yy = star1Y + param * D
    
    const dx = mousePosition.x - xx
    const dy = mousePosition.y - yy
    
    return Math.sqrt(dx * dx + dy * dy)
  }

  const getHoverIntensity = (star: { ra: number; dec: number }) => {
    if (!isHeroHovered) return 0
    const distance = getDistanceToStar(star)
    const maxDistance = 150 // Increased for better hero hover effect
    if (distance > maxDistance) return 0
    return Math.max(0, 1 - distance / maxDistance)
  }

  const getLineVisibility = (star1: { ra: number; dec: number }, star2: { ra: number; dec: number }) => {
    if (!isHeroHovered) return 0
    const distance = getDistanceToLine(star1, star2)
    const maxDistance = 100 // Distance threshold for line visibility
    if (distance > maxDistance) return 0
    return Math.max(0, 1 - distance / maxDistance)
  }

  const magnitudeToSize = (vmag: string) => {
    const clampedMag = Math.max(-2, Math.min(6, parseFloat(vmag)))
    return Math.max(1, 8 - clampedMag)
  }

  const magnitudeToOpacity = (vmag: string) => {
    const clampedMag = Math.max(-2, Math.min(6, parseFloat(vmag)))
    return Math.max(0.2, 1 - (clampedMag + 2) / 8)
  }
</script>

<div 
  class="constellation-container" 
  class:hero-hovered={isHeroHovered}
  aria-hidden="true"
  bind:clientWidth={containerSize.width}
  bind:clientHeight={containerSize.height}
  onmousemove={handleMouseMove}
  onmouseleave={() => { hoveredStarId = null }}
>
  {#if rawData}
    {#each rawData.stars as star (star.id)}
      {@const size = magnitudeToSize(star.vmag)}
      {@const opacity = magnitudeToOpacity(star.vmag)}
      {@const duration = Math.random() * 3 + 2}
      {@const delay = Math.random() * 5}
      {@const hoverIntensity = getHoverIntensity(star)}
      {@const isNearMouse = hoverIntensity > 0}
      <div
        role="presentation"
        class="star"
        class:near-mouse={isNearMouse}
        style:left="{star.ra}%"
        style:top="{star.dec}%"
        style:width="{size}px"
        style:height="{size}px"
        style:--glow="{size * 1.5}px"
        style:--min-opacity={opacity * 0.3}
        style:--max-opacity={opacity}
        style:--duration="{duration}s"
        style:--hover-intensity={hoverIntensity}
        style:animation-delay="{delay}s"
        onmouseenter={() => { hoveredStarId = star.id }}
        onmouseleave={() => { hoveredStarId = null }}
      ></div>
    {/each}

    {#each lines as line (line.id)}
      {@const [star1Id, star2Id] = line.id.split('-').map(Number)}
      {@const star1 = starsById.get(star1Id)}
      {@const star2 = starsById.get(star2Id)}
      {@const isConnectedToHovered = star1Id === hoveredStarId || star2Id === hoveredStarId}
      {@const lineVisibility = star1 && star2 ? getLineVisibility(star1, star2) : 0}
      {@const shouldShowLine = lineVisibility > 0 || isConnectedToHovered}
      {#if shouldShowLine}
        <div
          class="constellation-line"
          class:connected-to-hovered={isConnectedToHovered}
          class:near-mouse={lineVisibility > 0}
          style:left="{line.left}%"
          style:top="{line.top}%"
          style:width="{line.width}px"
          style:transform="rotate({line.angle}deg)"
          style:opacity={isConnectedToHovered ? line.opacity + 0.4 : line.opacity * lineVisibility}
        ></div>
      {/if}
    {/each}
  {/if}
</div>

<style>
  .constellation-container {
    position: absolute;
    inset: 0;
    z-index: -10;
    overflow: hidden;
    background: radial-gradient(
      ellipse at center,
      color-mix(in oklch, var(--background) 90%, transparent 10%) 100%
    );
    pointer-events: none; /* Allow events to pass through to hero content */
  }

  .star {
    position: absolute;
    background-color: var(--foreground);
    border-radius: 50%;
    animation: twinkle var(--duration) infinite ease-in-out;
    opacity: 0;
    box-shadow: 0 0 var(--glow) color-mix(in oklch, var(--foreground) 40%, transparent 20%);
    transition:
      transform 0.3s cubic-bezier(0.22, 1, 0.36, 1),
      opacity 0.3s ease-in-out,
      box-shadow 0.3s ease-in-out;
    cursor: pointer;
  }

  .star.near-mouse {
    transform: scale(calc(1 + var(--hover-intensity) * 0.8));
    box-shadow: 
      0 0 calc(var(--glow) * (1 + var(--hover-intensity) * 2)) 
      color-mix(in oklch, var(--foreground) calc(40% + var(--hover-intensity) * 30%), transparent 20%);
    --min-opacity: calc(var(--min-opacity) + var(--hover-intensity) * 0.5);
    --max-opacity: calc(var(--max-opacity) + var(--hover-intensity) * 0.3);
  }

  .constellation-line {
    position: absolute;
    height: 1px;
    background: color-mix(in oklch, var(--foreground) 30%, transparent 10%);
    opacity: 0.2;
    transform-origin: left center;
    z-index: 10;
    transition: opacity 0.3s ease-in-out;
  }

  .constellation-line.connected-to-hovered {
    background: color-mix(in oklch, var(--foreground) 50%, transparent 10%);
    opacity: 0.4;
  }

  .constellation-line.near-mouse {
    background: color-mix(in oklch, var(--foreground) 70%, transparent 10%);
    opacity: 0.6;
  }

  @keyframes twinkle {
    0%,
    100% {
      opacity: var(--min-opacity);
      transform: scale(0.8);
    }
    50% {
      opacity: var(--max-opacity);
      transform: scale(1.2);
    }
  }

  .constellation-container:hover .star {
    --min-opacity: 0.7;
    --max-opacity: 1;
  }
</style>
