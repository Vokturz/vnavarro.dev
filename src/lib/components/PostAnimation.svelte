<script lang="ts">
  import { onMount } from 'svelte'
  import { theme } from '$lib/stores/theme'

  const { seed }: { seed: string } = $props()
  let container: HTMLDivElement
  let canvas: HTMLCanvasElement

  onMount(() => {
    const context = canvas.getContext('2d')
    if (!context) return

    let hash = 2166136261
    for (const character of seed) hash = Math.imul(hash ^ character.charCodeAt(0), 16777619) >>> 0
    function random() {
      hash = (Math.imul(hash, 1664525) + 1013904223) >>> 0
      return hash / 4294967296
    }

    const variant = Math.floor(random() * 3)
    const hue = 190 + random() * 100
    const speed = 0.16 + random() * 0.14
    const phase = random() * Math.PI * 2
    const lobes = 3 + Math.floor(random() * 4)
    const particles = Array.from({ length: 100 }, () => ({
      angle: random() * Math.PI * 2,
      radius: 0.35 + random() * 0.65,
      size: 0.6 + random() * 1.1,
      speed: 0.6 + random() * 0.8
    }))
    const motion = window.matchMedia('(prefers-reduced-motion: reduce)')
    let dark = false
    let visible = false
    let width = 0
    let height = 0
    let elapsed = 0
    let previousTime = 0
    let frame = 0

    function draw() {
      if (!context || !width || !height) return
      context.clearRect(0, 0, width, height)
      const radius = Math.min(width, height) * 0.39
      const time = elapsed * speed + phase
      const color = (offset: number, alpha: number) =>
        `hsla(${hue + offset}, ${dark ? 75 : 58}%, ${dark ? 72 : 40}%, ${alpha})`
      context.save()
      context.translate(width / 2, height / 2)

      if (variant === 0) {
        // A turning particle globe, with depth encoded by size and opacity.
        for (const [index, particle] of particles.entries()) {
          const latitude = Math.acos(1 - (2 * (index + 0.5)) / particles.length)
          const angle = particle.angle + time * particle.speed
          const x = Math.sin(latitude) * Math.cos(angle)
          const depth = Math.sin(latitude) * Math.sin(angle)
          const y = Math.cos(latitude)
          const tilt = 0.4
          context.beginPath()
          context.arc(
            (x * Math.cos(tilt) - y * Math.sin(tilt)) * radius,
            (x * Math.sin(tilt) + y * Math.cos(tilt)) * radius,
            particle.size * (0.7 + (depth + 1) * 0.3),
            0,
            Math.PI * 2
          )
          context.fillStyle = color(depth * 25, 0.22 + (depth + 1) * 0.34)
          context.fill()
        }
      } else if (variant === 1) {
        // Interwoven ribbons form a slowly breathing, asymmetric rosette.
        for (let ribbon = 0; ribbon < 9; ribbon++) {
          context.beginPath()
          for (let step = 0; step <= 220; step++) {
            const angle = (step / 220) * Math.PI * 2
            const wave = 0.73 + Math.sin(angle * lobes + time + ribbon * 0.15) * 0.22
            const x = Math.cos(angle + time * 0.15) * radius * wave
            const y = Math.sin(angle + time * 0.15) * radius * wave
            const scale = 0.72 + ribbon * 0.045
            if (step === 0) context.moveTo(x * scale, y * scale)
            else context.lineTo(x * scale, y * scale)
          }
          context.closePath()
          context.strokeStyle = color(ribbon * 4, 0.22 + ribbon * 0.025)
          context.lineWidth = 0.8
          context.stroke()
        }
      } else {
        // A flowing wave field fills both the tall desktop and wide mobile panels.
        for (let line = 0; line < 13; line++) {
          context.beginPath()
          for (let step = 0; step <= 80; step++) {
            const x = (step / 80 - 0.5) * width * 1.2
            const envelope = Math.exp(-((x / (width * 0.6)) ** 2))
            const y =
              (line - 6) * radius * 0.105 +
              Math.sin((x / radius) * 2.4 + time + line * 0.2) * radius * 0.42 * envelope
            if (step === 0) context.moveTo(x, y)
            else context.lineTo(x, y)
          }
          context.strokeStyle = color(line * 3, 0.2 + Math.sin((line / 12) * Math.PI) * 0.35)
          context.lineWidth = 0.9
          context.stroke()
        }
      }

      // A handful of slow drifting accents makes each seeded composition distinct.
      for (const particle of particles.slice(0, 10)) {
        const angle = particle.angle + time * 0.2
        context.beginPath()
        context.arc(
          Math.cos(angle) * radius * (1.15 + particle.radius * 0.2),
          Math.sin(angle) * radius * (1.15 + particle.radius * 0.2),
          0.7,
          0,
          Math.PI * 2
        )
        context.fillStyle = color(15, 0.3)
        context.fill()
      }
      context.restore()
    }

    function animate(timestamp: number) {
      // Throttle each small thumbnail to 30 fps.
      if (timestamp - previousTime >= 1000 / 30) {
        elapsed += Math.min((timestamp - previousTime) / 1000, 0.1)
        previousTime = timestamp
        draw()
      }
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
      if (visible && !document.hidden) draw()
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
  class="pointer-events-none absolute inset-0 bg-slate-100 dark:bg-[#101019]"
>
  <canvas bind:this={canvas} class="block h-full w-full"></canvas>
</div>
