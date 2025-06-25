<script lang="ts">
  import { onMount } from 'svelte'
  import { theme } from '$lib/stores/theme'
  import * as THREE from 'three'

  interface ConstellationData {
    stars: {
      id: number
      ra: number
      dec: number
      vmag: string
    }[]
    constellations: {
      [id:string]: number[][]
    }
  }

  let canvas: HTMLCanvasElement
  let containerElement: HTMLDivElement
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
  let clock: THREE.Clock // FIX: Declare a clock

  const decLimits = { min: -45, max: 45 }
  const raLimits = { min: 10, max: 380 }

  const starsById: Map<number, ConstellationData['stars'][0]> = $derived(
    rawData
      ? new Map((rawData as ConstellationData).stars.map((star) => [star.id, star]))
      : new Map()
  )

  // Derived color values based on theme
  const starColor = $derived($theme === 'terminal' ? new THREE.Color(1.0, 1.0, 1.0) : new THREE.Color(0.2, 0.2, 0.3))
  const lineColor = $derived($theme === 'terminal' ? new THREE.Color(1.0, 1.0, 1.0) : new THREE.Color(0.3, 0.3, 0.4))

  // Star vertex shader with spark effect
  const starVertexShader = `
    attribute float size;
    attribute float opacity;
    attribute float twinklePhase;
    uniform float time;
    varying float vOpacity;
    varying float vSize;
    
    void main() {
      vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
      gl_Position = projectionMatrix * mvPosition;
      
      // Twinkling effect for opacity
      float opacityTwinkle = sin(time * 2.0 + twinklePhase) * 0.3 + 0.7;
      vOpacity = opacity * opacityTwinkle;
      
      // Spark effect (pulsating size)
      float sizeSpark = sin(time * 1.2 + twinklePhase * 1.5) * 0.25 + 1.0;
      vSize = size * sizeSpark;
      gl_PointSize = max(1.0, vSize);
    }
  `

  // Star fragment shader
  const starFragmentShader = `
    uniform vec3 starColor;
    varying float vOpacity;
    varying float vSize;
    
    void main() {
      vec2 center = gl_PointCoord - 0.5;
      float dist = length(center);
      
      if (dist > 0.5) discard;
      
      float alpha = smoothstep(0.5, 0.2, dist) * vOpacity;
      float glow = smoothstep(0.5, 0.0, dist);
      
      gl_FragColor = vec4(starColor, alpha);
    }
  `

  // Line vertex shader
  const lineVertexShader = `
    attribute float opacity;
    varying float vOpacity;
    
    void main() {
      vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
      gl_Position = projectionMatrix * mvPosition;
      
      vOpacity = opacity;
    }
  `

  // Line fragment shader
  const lineFragmentShader = `
    uniform vec3 lineColor;
    varying float vOpacity;
    
    void main() {
      gl_FragColor = vec4(lineColor, vOpacity * 0.3);
    }
  `

  const initThreeJS = () => {
    if (!canvas) return

    // FIX: Instantiate the clock
    clock = new THREE.Clock()

    // Scene setup
    scene = new THREE.Scene()

    // Camera setup (orthographic for 2D-like projection)
    const aspect = containerSize.width / containerSize.height
    camera = new THREE.OrthographicCamera(-aspect, aspect, 1, -1, 0.1, 1000)
    camera.position.z = 1

    // Renderer setup
    renderer = new THREE.WebGLRenderer({
      canvas,
      alpha: true,
      antialias: true
    })
    renderer.setSize(containerSize.width, containerSize.height)
    renderer.setPixelRatio(window.devicePixelRatio)

    // Star material
    starMaterial = new THREE.ShaderMaterial({
      vertexShader: starVertexShader,
      fragmentShader: starFragmentShader,
      transparent: true,
      uniforms: {
        time: { value: 0 },
        starColor: { value: starColor }
      }
    })

    // Line material
    lineMaterial = new THREE.ShaderMaterial({
      vertexShader: lineVertexShader,
      fragmentShader: lineFragmentShader,
      transparent: true,
      uniforms: {
        lineColor: { value: lineColor }
      }
    })
  }

  const updateGeometry = () => {
    if (!rawData || !scene) return

    const { stars, constellations } = rawData
    if (!stars || !constellations) return

    // Clear existing meshes
    if (starMesh) scene.remove(starMesh)
    if (lineMesh) scene.remove(lineMesh)

    // Star geometry
    const starPositions = new Float32Array(stars.length * 3)
    const starSizes = new Float32Array(stars.length)
    const starOpacities = new Float32Array(stars.length)
    const starTwinklePhases = new Float32Array(stars.length)

    const aspect = containerSize.width / containerSize.height;

    stars.forEach((star, i) => {
      const x = (star.ra / 100) * 2 - 1
      const y = -((star.dec / 100) * 2 - 1)

      starPositions[i * 3] = x * aspect; // Use current aspect ratio
      starPositions[i * 3 + 1] = y
      starPositions[i * 3 + 2] = 0

      starSizes[i] = magnitudeToSize(star.vmag) * 2
      starOpacities[i] = magnitudeToOpacity(star.vmag)
      starTwinklePhases[i] = Math.random() * Math.PI * 2
    })

    starGeometry = new THREE.BufferGeometry()
    starGeometry.setAttribute('position', new THREE.BufferAttribute(starPositions, 3))
    starGeometry.setAttribute('size', new THREE.BufferAttribute(starSizes, 1))
    starGeometry.setAttribute('opacity', new THREE.BufferAttribute(starOpacities, 1))
    starGeometry.setAttribute('twinklePhase', new THREE.BufferAttribute(starTwinklePhases, 1))

    starMesh = new THREE.Points(starGeometry, starMaterial)
    scene.add(starMesh)

    // Line geometry
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
          linePositions.push(x1 * aspect, y1, 0) // Use current aspect ratio

          const x2 = (star2.ra / 100) * 2 - 1
          const y2 = -((star2.dec / 100) * 2 - 1)
          linePositions.push(x2 * aspect, y2, 0) // Use current aspect ratio

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

    // FIX: Use elapsed time from the clock for smooth animation
    const elapsedTime = clock.getElapsedTime()

    if (starMaterial) {
      starMaterial.uniforms.time.value = elapsedTime
    }

    renderer.render(scene, camera)
    animationId = requestAnimationFrame(animate)
  }

  // Update colors when theme changes
  $effect(() => {
    if (starMaterial && lineMaterial) {
      starMaterial.uniforms.starColor.value = starColor
      lineMaterial.uniforms.lineColor.value = lineColor
    }
  })
  
  let isInitialized = false;
  onMount(async () => {
    // The onMount logic can remain largely the same for data fetching.
    // The $effect below will handle the one-time initialization.
    try {
      const response = await fetch('/constellations_xy.json')
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      rawData = await response.json()
      if (rawData && rawData.stars.length > 0) {
        // Add random stars
        for (let i = 0; i < 1000; i++) {
          rawData.stars.push({
            id: -i,
            ra: Math.random() * 360 + 10,
            dec: Math.random() * 90 - 45,
            vmag: (Math.random() * 6 + 1).toFixed(2)
          })
        }

        // Filter stars within limits
        rawData.stars = rawData.stars.filter(
          (star) =>
            star.ra > raLimits.min &&
            star.ra < raLimits.max &&
            star.dec > decLimits.min &&
            star.dec < decLimits.max
        )

        // Convert to percentage coordinates
        const adjustedRA = (ra: number) =>
          ((ra - raLimits.min) / (raLimits.max - raLimits.min)) * 100
        const adjustedDec = (dec: number) =>
          ((dec + (decLimits.max - decLimits.min) / 2) / (decLimits.max - decLimits.min)) * 100

        rawData.stars.forEach((star) => {
          star.ra = adjustedRA(star.ra)
          star.dec = adjustedDec(star.dec)
        })

        console.log(`Loaded ${rawData.stars.length} stars and their constellation lines.`)
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
    }
  })

  // Initialize Three.js ONCE when canvas is available and container is sized
  $effect(() => {
    if (!isInitialized && canvas && containerSize.width > 0 && containerSize.height > 0) {
      initThreeJS()
      animate()
      isInitialized = true
    }
  })

  // Update geometry when data changes
  $effect(() => {
    if (isInitialized && rawData && scene) {
      updateGeometry()
    }
  })

  // Handle container resize
  $effect(() => {
    if (!isInitialized || !renderer || !camera || !containerSize.width || !containerSize.height) return;

    const aspect = containerSize.width / containerSize.height
    camera.left = -aspect
    camera.right = aspect
    camera.updateProjectionMatrix()
    renderer.setSize(containerSize.width, containerSize.height)

    // FIX: Regenerate geometry on resize to correct the aspect ratio of star positions
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
  bind:this={containerElement}
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
    pointer-events: none;
  }

  canvas {
    width: 100%;
    height: 100%;
    display: block;
  }

  .fade-overlay {
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    height: 200px; /* Adjust fade height */
    background: linear-gradient(
      to top,
      var(--background) 0%,
      transparent 100%
    );
    pointer-events: none;
  }
</style>