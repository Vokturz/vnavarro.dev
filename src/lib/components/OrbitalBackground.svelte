<script lang="ts">
  import { onMount } from 'svelte'
  import { theme } from '$lib/stores/theme'

  let container: HTMLDivElement
  let canvas: HTMLCanvasElement

  onMount(() => {
    const context = canvas.getContext('2d')
    if (!context) return

    const motion = window.matchMedia('(prefers-reduced-motion: reduce)')
    let dark = false
    let visible = false
    let width = 0
    let height = 0
    let time = 0
    let previousTime = 0
    let frame = 0

    function draw() {
      if (!context || !width || !height) return
      context.clearRect(0, 0, width, height)
      const compact = window.innerWidth < 640
      const radius = compact ? Math.min(width * 0.3, 112) : width * 0.48
      const colors = dark ? ['167, 139, 250', '125, 173, 225'] : ['112, 80, 168', '69, 108, 154']

      function point(angle: number, orbit: number) {
        const tilt = (orbit - 1.5) * (compact ? 0.24 : 0.11)
        const x = Math.cos(angle) * radius * (1 - orbit * 0.12)
        const y = Math.sin(angle) * Math.min(height * 0.31, radius * 0.48)
        return {
          x: width / 2 + x * Math.cos(tilt) - y * Math.sin(tilt),
          y: height / 2 + x * Math.sin(tilt) + y * Math.cos(tilt)
        }
      }

      for (let orbit = 0; orbit < 4; orbit++) {
        const color = colors[orbit % 2]
        context.beginPath()
        for (let step = 0; step <= 160; step++) {
          const { x, y } = point((step / 160) * Math.PI * 2, orbit)
          if (step === 0) context.moveTo(x, y)
          else context.lineTo(x, y)
        }
        context.strokeStyle = `rgba(${color}, ${dark ? 0.23 : 0.18})`
        context.lineWidth = orbit === 0 ? 1 : 0.7
        context.stroke()

        const angle = time * (0.1 + orbit * 0.025) + orbit * 1.8
        for (let trail = 22; trail >= 0; trail--) {
          const { x, y } = point(angle - trail * 0.014, orbit)
          context.beginPath()
          context.arc(x, y, trail === 0 ? 2.5 : 1.2, 0, Math.PI * 2)
          context.fillStyle = `rgba(${color}, ${(1 - trail / 23) * (trail === 0 ? 0.85 : 0.24)})`
          context.fill()
        }

        const { x, y } = point(angle, orbit)
        const glow = context.createRadialGradient(x, y, 0, x, y, 14)
        glow.addColorStop(0, `rgba(${color}, 0.2)`)
        glow.addColorStop(1, `rgba(${color}, 0)`)
        context.fillStyle = glow
        context.fillRect(x - 14, y - 14, 28, 28)
      }
    }

    function animate(timestamp: number) {
      time += Math.min((timestamp - previousTime) / 1000, 0.05)
      previousTime = timestamp
      draw()
      frame = requestAnimationFrame(animate)
    }

    function updatePlayback() {
      cancelAnimationFrame(frame)
      if (!visible || document.hidden) return
      draw()
      if (!motion.matches) {
        previousTime = performance.now()
        frame = requestAnimationFrame(animate)
      }
    }

    const resizeObserver = new ResizeObserver(() => {
      width = container.clientWidth
      height = container.clientHeight
      const ratio = Math.min(window.devicePixelRatio || 1, 1.5)
      canvas.width = Math.round(width * ratio)
      canvas.height = Math.round(height * ratio)
      context.setTransform(ratio, 0, 0, ratio, 0, 0)
      draw()
    })
    resizeObserver.observe(container)
    const intersectionObserver = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting
      updatePlayback()
    })
    intersectionObserver.observe(container)
    const unsubscribe = theme.subscribe((value) => {
      dark = value === 'dark'
      if (visible && !document.hidden) draw()
    })
    motion.addEventListener('change', updatePlayback)
    document.addEventListener('visibilitychange', updatePlayback)

    return () => {
      cancelAnimationFrame(frame)
      resizeObserver.disconnect()
      intersectionObserver.disconnect()
      unsubscribe()
      motion.removeEventListener('change', updatePlayback)
      document.removeEventListener('visibilitychange', updatePlayback)
    }
  })
</script>

<div
  bind:this={container}
  aria-hidden="true"
  class="pointer-events-none absolute inset-x-0 top-0 -z-10 h-32 overflow-hidden sm:h-full sm:[mask-image:radial-gradient(ellipse_at_center,transparent_30%,black_80%)] print:hidden"
>
  <canvas bind:this={canvas} class="block h-full w-full"></canvas>
</div>
