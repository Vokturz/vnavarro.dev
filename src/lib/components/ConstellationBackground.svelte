<script lang="ts">
  import { onMount } from 'svelte'
  import * as THREE from 'three'

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

  let canvas: HTMLCanvasElement
  let rawData: ConstellationData | null = $state(null)
  let containerSize = $state({ width: 0, height: 0 })

  // Three.js objects
  let scene: THREE.Scene
  let camera: THREE.OrthographicCamera
  let renderer: THREE.WebGLRenderer
  let starGeometry: THREE.BufferGeometry
  let starMaterial: THREE.ShaderMaterial
  let lineGeometry: THREE.BufferGeometry
  let lineMaterial: THREE.ShaderMaterial
  let starMesh: THREE.Points
  let lineMesh: THREE.LineSegments
  let animationId: number
  let clock: THREE.Clock

  let mouse = new THREE.Vector2(-10, -10) // Initialize off-screen

  const decLimits = { min: -45, max: 45 }
  const raLimits = { min: 10, max: 380 }

  const starsById: Map<number, ConstellationData['stars'][0]> = $derived(
    rawData
      ? new Map((rawData as ConstellationData).stars.map((star) => [star.id, star]))
      : new Map()
  )

  // Derived color values based on theme
  const starColor = new THREE.Color(0.5, 0.5, 0.5)
  const lineColor = new THREE.Color(0.5, 0.5, 0.5)

  const starVertexShader = `
    attribute float size;
    attribute float opacity;
    attribute float twinklePhase;
    attribute float isConstellation;
    uniform float time;
    uniform vec2 uMouse;
    uniform float uHoverRadius;
    uniform float uHoverIntensity;
    varying float vOpacity;
    varying float vHoverFactor;
    
    void main() {
      vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
      gl_Position = projectionMatrix * mvPosition;
      
      // Calculate distance to mouse in world space
      float dist = distance(position.xy, uMouse);
      float hoverFactor = 1.0 - smoothstep(0.0, uHoverRadius, dist);
      // Only apply hover effect to constellation stars
      vHoverFactor = hoverFactor * isConstellation;
      
      // Twinkling effect for opacity
      float opacityTwinkle = sin(time * 2.0 + twinklePhase) * 0.3 + 0.7;
      vOpacity = opacity * opacityTwinkle;
      
      // Spark effect (pulsating size) + hover effect
      float sizeSpark = sin(time * 1.2 + twinklePhase * 1.5) * 0.25 + 1.0;
      float finalSize = size * sizeSpark * (1.0 + vHoverFactor * uHoverIntensity);
      gl_PointSize = max(1.0, finalSize);
    }
  `

  // Updated star fragment shader with hover effect
  const starFragmentShader = `
    uniform vec3 starColor;
    varying float vOpacity;
    varying float vHoverFactor;
    
    void main() {
      vec2 center = gl_PointCoord - 0.5;
      float dist = length(center);
      
      if (dist > 0.5) discard;
      
      // Base alpha with twinkle
      float baseAlpha = smoothstep(0.5, 0.2, dist) * vOpacity;
      
      // Hover adds a bright glow
      float hoverGlow = smoothstep(0.4, 0.0, dist) * vHoverFactor;
      
      // Combine and clamp
      float finalAlpha = min(1.0, baseAlpha + hoverGlow);
      
      gl_FragColor = vec4(starColor, finalAlpha);
    }
  `

  const lineVertexShader = `
    attribute float opacity;
    uniform vec2 uMouse;
    uniform float uHoverRadius;
    varying float vOpacity;
    varying float vHoverFactor;
    varying float vLineWidth;

    
    void main() {
      vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
      gl_Position = projectionMatrix * mvPosition;
      
      // Calculate distance to mouse
      float dist = distance(position.xy, uMouse);
      vHoverFactor = 1.0 - smoothstep(0.0, uHoverRadius, dist);
      
      vOpacity = opacity;
    }
  `

  // Updated line fragment shader with hover effect
  const lineFragmentShader = `
    uniform vec3 lineColor;
    uniform float uHoverIntensity;
    varying float vOpacity;
    varying float vHoverFactor;
    
    void main() {
      float finalOpacity = vOpacity * 0.3 + vHoverFactor * uHoverIntensity;
      gl_FragColor = vec4(lineColor, min(1.0, finalOpacity));
    }
  `

  const initThreeJS = () => {
    if (!canvas) return

    clock = new THREE.Clock()
    scene = new THREE.Scene()
    const aspect = containerSize.width / containerSize.height
    camera = new THREE.OrthographicCamera(-aspect, aspect, 1, -1, 0.1, 1000)
    camera.position.z = 1

    renderer = new THREE.WebGLRenderer({
      canvas,
      alpha: true,
      antialias: true
    })

    const scaleFactor = containerSize.width < 1024 ? 1.5 : 1
    const renderWidth = containerSize.width * scaleFactor
    const renderHeight = containerSize.height * scaleFactor

    renderer.setSize(renderWidth, renderHeight)
    renderer.setPixelRatio(window.devicePixelRatio)

    canvas.style.width = containerSize.width + 'px'
    canvas.style.height = containerSize.height + 'px'

    // Add mouse and hover uniforms to star material
    starMaterial = new THREE.ShaderMaterial({
      vertexShader: starVertexShader,
      fragmentShader: starFragmentShader,
      transparent: true,
      uniforms: {
        time: { value: 0 },
        starColor: { value: starColor },
        uMouse: { value: mouse },
        uHoverRadius: { value: 0.6 },
        uHoverIntensity: { value: 0.8 }
      }
    })

    // Add mouse and hover uniforms to line material
    lineMaterial = new THREE.ShaderMaterial({
      vertexShader: lineVertexShader,
      fragmentShader: lineFragmentShader,
      transparent: true,
      uniforms: {
        lineColor: { value: lineColor },
        uMouse: { value: mouse },
        uHoverRadius: { value: 0.6 },
        uHoverIntensity: { value: 1.5 }
      }
    })
  }

  const updateGeometry = () => {
    if (!rawData || !scene) return

    const { stars, constellations } = rawData
    if (!stars || !constellations) return

    if (starMesh) scene.remove(starMesh)
    if (lineMesh) scene.remove(lineMesh)

    // Create a set of constellation star IDs
    const constellationStarIds = new Set<number>()
    for (const constellationName in constellations) {
      const connections = constellations[constellationName]
      for (const connection of connections) {
        constellationStarIds.add(connection[0])
        constellationStarIds.add(connection[1])
      }
    }

    const starPositions = new Float32Array(stars.length * 3)
    const starSizes = new Float32Array(stars.length)
    const starOpacities = new Float32Array(stars.length)
    const starTwinklePhases = new Float32Array(stars.length)
    const starIsConstellation = new Float32Array(stars.length)

    const aspect = containerSize.width / containerSize.height

    stars.forEach((star, i) => {
      const x = (star.ra / 100) * 2 - 1
      const y = -((star.dec / 100) * 2 - 1)

      starPositions[i * 3] = x * aspect
      starPositions[i * 3 + 1] = y
      starPositions[i * 3 + 2] = 0

      starSizes[i] = magnitudeToSize(star.vmag) * 2
      starOpacities[i] = magnitudeToOpacity(star.vmag)
      starTwinklePhases[i] = Math.random() * Math.PI * 2
      // Set 1.0 if star is part of constellation, 0.0 otherwise
      starIsConstellation[i] = constellationStarIds.has(star.id) ? 1.0 : 0.0
    })

    starGeometry = new THREE.BufferGeometry()
    starGeometry.setAttribute('position', new THREE.BufferAttribute(starPositions, 3))
    starGeometry.setAttribute('size', new THREE.BufferAttribute(starSizes, 1))
    starGeometry.setAttribute('opacity', new THREE.BufferAttribute(starOpacities, 1))
    starGeometry.setAttribute('twinklePhase', new THREE.BufferAttribute(starTwinklePhases, 1))
    starGeometry.setAttribute('isConstellation', new THREE.BufferAttribute(starIsConstellation, 1))

    starMesh = new THREE.Points(starGeometry, starMaterial)
    scene.add(starMesh)

    const linePositions: number[] = []
    const lineOpacities: number[] = []

    for (const constellationName in constellations) {
      const connections = constellations[constellationName]

      for (const connection of connections) {
        const star1 = starsById.get(connection[0])
        const star2 = starsById.get(connection[1])

        if (star1 && star2) {
          const x1 = (star1.ra / 100) * 2 - 1
          const y1 = -((star1.dec / 100) * 2 - 1)
          linePositions.push(x1 * aspect, y1, 0)

          const x2 = (star2.ra / 100) * 2 - 1
          const y2 = -((star2.dec / 100) * 2 - 1)
          linePositions.push(x2 * aspect, y2, 0)

          const dx = x2 - x1
          const dy = y2 - y1
          const distance = Math.sqrt(dx * dx + dy * dy)
          const opacity = Math.max(0.1, 0.4 - distance * 0.3)

          lineOpacities.push(opacity, opacity)
        }
      }
    }

    if (linePositions.length > 0) {
      lineGeometry = new THREE.BufferGeometry()
      lineGeometry.setAttribute(
        'position',
        new THREE.BufferAttribute(new Float32Array(linePositions), 3)
      )
      lineGeometry.setAttribute(
        'opacity',
        new THREE.BufferAttribute(new Float32Array(lineOpacities), 1)
      )

      lineMesh = new THREE.LineSegments(lineGeometry, lineMaterial)
      scene.add(lineMesh)
    }
  }

  const animate = () => {
    if (!renderer || !scene || !camera) return

    const elapsedTime = clock.getElapsedTime()

    if (starMaterial) {
      starMaterial.uniforms.time.value = elapsedTime
    }

    renderer.render(scene, camera)
    animationId = requestAnimationFrame(animate)
  }

  $effect(() => {
    if (starMaterial && lineMaterial) {
      starMaterial.uniforms.starColor.value = starColor
      lineMaterial.uniforms.lineColor.value = lineColor
    }
  })

  let isInitialized = false
  onMount(async () => {
    // Mouse move event handler
    const onMouseMove = (event: MouseEvent) => {
      if (!containerSize.width || !containerSize.height) return
      const aspect = containerSize.width / containerSize.height
      mouse.x = ((event.clientX / containerSize.width) * 2 - 1) * aspect
      mouse.y = -(event.clientY / containerSize.height) * 2 + 1
    }

    // Add event listener
    window.addEventListener('mousemove', onMouseMove)

    try {
      const response = await fetch('/constellations_xy.json')
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      rawData = await response.json()
      if (rawData && rawData.stars.length > 0) {
        for (let i = 0; i < 500; i++) {
          rawData.stars.push({
            id: -i,
            ra: Math.random() * 360 + 10,
            dec: Math.random() * 90 - 45,
            vmag: (Math.random() * 6 + 1).toFixed(2)
          })
        }

        rawData.stars = rawData.stars.filter(
          (star) =>
            star.ra > raLimits.min &&
            star.ra < raLimits.max &&
            star.dec > decLimits.min &&
            star.dec < decLimits.max
        )

        const adjustedRA = (ra: number) =>
          ((ra - raLimits.min) / (raLimits.max - raLimits.min)) * 100
        const adjustedDec = (dec: number) =>
          ((dec + (decLimits.max - decLimits.min) / 2) / (decLimits.max - decLimits.min)) * 100

        rawData.stars.forEach((star) => {
          star.ra = adjustedRA(star.ra)
          star.dec = adjustedDec(star.dec)
        })
      }
    } catch (error) {
      console.error('Error loading constellations:', error)
    }

    return () => {
      if (animationId) {
        cancelAnimationFrame(animationId)
      }
      if (renderer) {
        renderer.dispose()
      }
      // Clean up event listener
      window.removeEventListener('mousemove', onMouseMove)
    }
  })

  $effect(() => {
    if (!isInitialized && canvas && containerSize.width > 0 && containerSize.height > 0) {
      initThreeJS()
      animate()
      isInitialized = true
    }
  })

  $effect(() => {
    if (isInitialized && rawData && scene) {
      updateGeometry()
    }
  })

  $effect(() => {
    if (!isInitialized || !renderer || !camera || !containerSize.width || !containerSize.height)
      return

    const aspect = containerSize.width / containerSize.height
    camera.left = -aspect
    camera.right = aspect
    camera.updateProjectionMatrix()
    
    const scaleFactor = containerSize.width < 1024 ? 1.5 : 1
    const renderWidth = containerSize.width * scaleFactor
    const renderHeight = containerSize.height * scaleFactor
    
    renderer.setSize(renderWidth, renderHeight)
    canvas.style.width = containerSize.width + 'px'
    canvas.style.height = containerSize.height + 'px'

    updateGeometry()
  })

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
  aria-hidden="true"
  bind:clientWidth={containerSize.width}
  bind:clientHeight={containerSize.height}
>
  <canvas bind:this={canvas} width={containerSize.width} height={containerSize.height}></canvas>
  <div class="fade-overlay"></div>
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
    pointer-events: auto;
  }

  canvas {
    width: 100%;
    height: 100%;
    display: block;

    @media (max-width: 1024px) {
      transform: scalex(1.5);
      transform-origin: center center;
    }
  }

  .fade-overlay {
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    height: 400px;
    background: linear-gradient(to top, var(--background) 0%, transparent 100%);
    pointer-events: none;
  }
</style>
