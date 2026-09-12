<script lang="ts">
  import { onMount } from 'svelte'
  import { theme } from '$lib/stores/theme'
  import * as THREE from 'three'

  let container: HTMLDivElement
  let canvas: HTMLCanvasElement

  onMount(() => {
    let renderer: THREE.WebGLRenderer
    try {
      renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true })
    } catch {
      // The CSS glow remains visible when WebGL is unavailable.
      return
    }

    const scene = new THREE.Scene()
    const camera = new THREE.PerspectiveCamera(40, 1, 0.1, 50)
    camera.position.z = 13
    const nucleus = new THREE.Group()
    nucleus.rotation.set(1.08, 0.12, -0.48)
    scene.add(nucleus)

    const time = { value: 0 }
    const diskOuter = { value: new THREE.Vector3() }
    const diskInner = { value: new THREE.Vector3() }
    const diskRim = { value: new THREE.Vector3() }
    const diskStrength = { value: 1 }
    const jetBase = { value: new THREE.Vector3() }
    const jetTip = { value: new THREE.Vector3() }
    const jetStrength = { value: 1 }
    const jetLength = { value: 5.6 }
    const diskGeometry = new THREE.RingGeometry(0.48, 3.5, 192, 64)
    const diskMaterial = new THREE.ShaderMaterial({
      transparent: true,
      side: THREE.DoubleSide,
      depthWrite: false,
      uniforms: { time, diskOuter, diskInner, diskRim, diskStrength },
      vertexShader: `
        varying vec2 diskPosition;
        void main() {
          diskPosition = position.xy;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        uniform float time;
        uniform vec3 diskOuter;
        uniform vec3 diskInner;
        uniform vec3 diskRim;
        uniform float diskStrength;
        varying vec2 diskPosition;
        void main() {
          float radius = length(diskPosition);
          float angle = atan(diskPosition.y, diskPosition.x);
          // Inner rings orbit faster, winding the luminous filaments into spirals.
          float orbit = angle - time * 0.42 / pow(radius, 1.5);
          float filaments = sin(radius * 44.0 + sin(orbit * 3.0 + radius * 5.0) * 2.6);
          float turbulence = sin(orbit * 9.0 + radius * 17.0) * sin(orbit * 5.0 - radius * 23.0);
          float inner = exp(-(radius - 0.48) * 1.8);
          float rim = exp(-pow((radius - 0.55) * 18.0, 2.0));
          vec3 outerColor = mix(diskOuter, diskInner, inner);
          vec3 color = mix(outerColor, diskRim, min(1.0, inner * 0.8 + rim));
          float edge = (1.0 - smoothstep(2.2, 3.5, radius)) * smoothstep(0.48, 0.53, radius);
          float brightness = 0.48 + filaments * 0.18 + turbulence * 0.14 + inner * 0.25;
          float crescent = 0.72 + 0.28 * cos(angle + 0.7);
          gl_FragColor = vec4(color, edge * brightness * crescent * diskStrength);
        }
      `
    })
    nucleus.add(new THREE.Mesh(diskGeometry, diskMaterial))

    const coreGeometry = new THREE.SphereGeometry(0.47, 48, 32)
    const coreMaterial = new THREE.MeshBasicMaterial({ color: 0x080510 })
    nucleus.add(new THREE.Mesh(coreGeometry, coreMaterial))

    const count = window.innerWidth < 640 ? 1800 : 3600
    const seeds = new Float32Array(count * 3)
    for (let i = 0; i < count; i++) {
      seeds[i * 3] = Math.random()
      seeds[i * 3 + 1] = Math.random() * Math.PI * 2
      seeds[i * 3 + 2] = (i % 2 === 0 ? 1 : -1) * (0.2 + Math.random() * 0.8)
    }
    const jetGeometry = new THREE.BufferGeometry()
    jetGeometry.setAttribute('position', new THREE.BufferAttribute(seeds, 3))
    const pixelRatio = { value: Math.min(window.devicePixelRatio, 1.75) }
    const jetMaterial = new THREE.ShaderMaterial({
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      uniforms: { time, pixelRatio, jetBase, jetTip, jetStrength, jetLength },
      vertexShader: `
        uniform float time;
        uniform float pixelRatio;
        uniform float jetLength;
        varying float opacity;
        varying float distanceAlongJet;
        void main() {
          float travel = fract(position.x + time * 0.13);
          float height = 0.48 + travel * jetLength;
          float width = (0.025 + pow(travel, 1.6) * 0.48) * abs(position.z);
          float twist = position.y + height * 2.8 - time * 0.6;
          vec3 point = vec3(cos(twist) * width, sin(twist) * width, sign(position.z) * height);
          vec4 viewPosition = modelViewMatrix * vec4(point, 1.0);
          gl_Position = projectionMatrix * viewPosition;
          gl_PointSize = clamp((2.0 + abs(position.z) * 2.5) * pixelRatio * 10.0 / -viewPosition.z, 1.0, 12.0);
          opacity = smoothstep(0.0, 0.08, travel) * (1.0 - smoothstep(0.45, 1.0, travel)) * 0.6;
          distanceAlongJet = travel;
        }
      `,
      fragmentShader: `
        uniform vec3 jetBase;
        uniform vec3 jetTip;
        uniform float jetStrength;
        varying float opacity;
        varying float distanceAlongJet;
        void main() {
          float radius = length(gl_PointCoord - 0.5) * 2.0;
          float glow = exp(-radius * radius * 4.0) * (1.0 - smoothstep(0.7, 1.0, radius));
          vec3 color = mix(jetBase, jetTip, distanceAlongJet);
          gl_FragColor = vec4(color, glow * opacity * jetStrength);
        }
      `
    })
    const jets = new THREE.Points(jetGeometry, jetMaterial)
    // Positions are generated in the shader, outside the seed geometry's bounds.
    jets.frustumCulled = false
    nucleus.add(jets)

    const motion = window.matchMedia('(prefers-reduced-motion: reduce)')
    let visible = false
    let contextLost = false
    let frame = 0
    let previousTime = 0

    function render() {
      renderer.render(scene, camera)
    }

    function animate(timestamp: number) {
      time.value += Math.min((timestamp - previousTime) / 1000, 0.05)
      previousTime = timestamp
      render()
      frame = requestAnimationFrame(animate)
    }

    function updatePlayback() {
      cancelAnimationFrame(frame)
      if (contextLost || document.hidden || !visible) return
      render()
      if (!motion.matches) {
        previousTime = performance.now()
        frame = requestAnimationFrame(animate)
      }
    }

    function resize() {
      const { width, height } = container.getBoundingClientRect()
      if (!width || !height || contextLost) return
      camera.aspect = width / height
      const mobile = width < 640
      camera.position.z = mobile ? 22 : camera.aspect < 1 ? 17 : 13
      if (mobile) {
        // Frame the nucleus in the space above the hero copy, in viewport proportions.
        const viewHeight =
          2 * Math.tan(THREE.MathUtils.degToRad(camera.fov / 2)) * camera.position.z
        const viewWidth = viewHeight * camera.aspect
        const centerY = Math.min(140, height * 0.25)
        nucleus.position.set(viewWidth * 0.17, viewHeight * (0.5 - centerY / height), 0)
        nucleus.scale.setScalar(Math.min(1, (viewWidth * 0.56) / 7))
        nucleus.rotation.set(1.05, 0.12, -0.45, 'ZXY')
        jetLength.value = 3.2
      } else {
        nucleus.position.set(camera.aspect > 1.3 ? 3.1 : 0.6, 0, 0)
        nucleus.scale.setScalar(1)
        nucleus.rotation.set(1.08, 0.12, -0.48, 'XYZ')
        jetLength.value = 5.6
      }
      camera.updateProjectionMatrix()
      pixelRatio.value = Math.min(window.devicePixelRatio, 1.75)
      renderer.setPixelRatio(pixelRatio.value)
      renderer.setSize(width, height, false)
      render()
    }

    function loseContext(event: Event) {
      event.preventDefault()
      contextLost = true
      cancelAnimationFrame(frame)
    }

    function restoreContext() {
      contextLost = false
      resize()
      updatePlayback()
    }

    const resizeObserver = new ResizeObserver(resize)
    resizeObserver.observe(container)
    const intersectionObserver = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting
      updatePlayback()
    })
    intersectionObserver.observe(container)
    motion.addEventListener('change', updatePlayback)
    document.addEventListener('visibilitychange', updatePlayback)
    canvas.addEventListener('webglcontextlost', loseContext)
    canvas.addEventListener('webglcontextrestored', restoreContext)
    const unsubscribeTheme = theme.subscribe((currentTheme) => {
      const dark = currentTheme === 'dark'
      diskOuter.value.fromArray(dark ? [0.34, 0.16, 0.66] : [0.2, 0.13, 0.46])
      diskInner.value.fromArray(dark ? [0.95, 0.32, 0.16] : [0.54, 0.2, 0.38])
      diskRim.value.fromArray(dark ? [1.0, 0.86, 0.62] : [0.82, 0.45, 0.3])
      diskStrength.value = dark ? 1 : 0.85
      jetBase.value.fromArray(dark ? [0.7, 0.9, 1.0] : [0.12, 0.32, 0.65])
      jetTip.value.fromArray(dark ? [0.36, 0.32, 1.0] : [0.36, 0.2, 0.62])
      jetStrength.value = dark ? 1 : 0.55
      // Additive light washes out against white; alpha blending retains the blue pigment.
      jetMaterial.blending = dark ? THREE.AdditiveBlending : THREE.NormalBlending
      jetMaterial.needsUpdate = true
      updatePlayback()
    })
    resize()

    return () => {
      unsubscribeTheme()
      cancelAnimationFrame(frame)
      resizeObserver.disconnect()
      intersectionObserver.disconnect()
      motion.removeEventListener('change', updatePlayback)
      document.removeEventListener('visibilitychange', updatePlayback)
      canvas.removeEventListener('webglcontextlost', loseContext)
      canvas.removeEventListener('webglcontextrestored', restoreContext)
      diskGeometry.dispose()
      diskMaterial.dispose()
      coreGeometry.dispose()
      coreMaterial.dispose()
      jetGeometry.dispose()
      jetMaterial.dispose()
      renderer.dispose()
    }
  })
</script>

<div
  bind:this={container}
  class="pointer-events-none absolute inset-0 overflow-hidden [mask-image:linear-gradient(to_bottom,black_25%,transparent_55%)] sm:[mask-image:none]"
  aria-hidden="true"
>
  <div
    class="absolute inset-0 bg-[radial-gradient(ellipse_at_75%_45%,#8b5cf61a,transparent_55%)]"
  ></div>
  <canvas bind:this={canvas} class="block h-full w-full dark:opacity-90"></canvas>
  <div
    class="from-background absolute inset-x-0 bottom-0 h-48 bg-gradient-to-t to-transparent"
  ></div>
</div>
