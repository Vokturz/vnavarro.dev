<script lang="ts">
  import { theme } from '$lib/stores/theme'

  import { onMount } from 'svelte'
  import { slide, fade } from 'svelte/transition'
  import { Linkedin, MoonIcon, SunIcon, Menu, X } from 'lucide-svelte'
  import { Button } from '$lib/components/ui/button'
  import TechIcon from '../TechIcon.svelte'

  let isDarkMode = $derived($theme === 'dark')
  let isMobileMenuOpen = $state(false)

  function toggleMobileMenu() {
    isMobileMenuOpen = !isMobileMenuOpen
  }

  function closeMobileMenu() {
    isMobileMenuOpen = false
  }

  function updateHighlightTheme(theme: string) {
    // Remove existing highlight.js stylesheets
    const existingLinks = document.querySelectorAll('link[href*="highlight.js/styles"]')
    existingLinks.forEach((link) => link.remove())

    // Add new theme stylesheet
    const link = document.createElement('link')
    link.rel = 'stylesheet'
    link.href = `https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/styles/${theme}.min.css`
    document.head.appendChild(link)
  }

  onMount(() => {
    theme.init()

    // Subscribe to theme changes
    const unsubscribe = theme.subscribe((currentTheme: string) => {
      if (currentTheme === 'dark') {
        document.documentElement.classList.add('dark')
        localStorage.setItem('theme', 'dark')
        updateHighlightTheme('atom-one-dark')
      } else {
        document.documentElement.classList.remove('dark')
        localStorage.setItem('theme', 'light')
        updateHighlightTheme('github')
      }
    })

    return unsubscribe
  })
</script>

<nav class="bg-card/90 border-primary/10 sticky top-0 z-50 border-b-1 backdrop-blur-sm">
  <div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
    <div class="flex h-16 items-center justify-between">
      <div class="flex items-center space-x-2">
        <a href="/" class="text-secondary text-2xl font-bold">vnavarro.dev</a>
        <div class="hidden md:block">
          <div class="ml-10 flex items-baseline space-x-8">
            <a href="/" class="nav-link">Home</a>
            <a href="/blog" class="nav-link">Blog</a>
            <a href="/projects" class="nav-link">Projects</a>
          </div>
        </div>
      </div>
      <div class="flex items-center space-x-2">
        <div class="hidden items-center space-x-2 md:flex">
          <a href="/resume" class="nav-link text-sm">Resume</a>
          <Button
            variant="outline"
            size="icon"
            onclick={() => window.open('https://github.com/Vokturz', '_blank')}
          >
            <TechIcon name="github" class="h-5 w-5" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            onclick={() => window.open('https://linkedin.com/in/vnavarroaranguiz', '_blank')}
          >
            <Linkedin class="h-5 w-5" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            onclick={() => window.open('https://huggingface.co/Vokturz', '_blank')}
          >
            <TechIcon name="huggingface" class="h-5 w-5" />
          </Button>
        </div>
        <div class="bg-primary/40 hidden h-6 w-px md:block"></div>
        <Button
          onclick={theme.toggle}
          variant="outline"
          size="icon"
          class="h-10 w-10 flex-shrink-0 cursor-pointer"
        >
          {#if isDarkMode}
            <SunIcon class="h-5 w-5" />
          {:else}
            <MoonIcon class="h-5 w-5" />
          {/if}
        </Button>
        <!-- Mobile menu button -->
        <Button
          onclick={toggleMobileMenu}
          variant="outline"
          size="icon"
          class="h-10 w-10 flex-shrink-0 cursor-pointer md:hidden"
        >
          {#if isMobileMenuOpen}
            <X class="h-5 w-5" />
          {:else}
            <Menu class="h-5 w-5" />
          {/if}
        </Button>
      </div>
    </div>
  </div>

  <!-- Mobile menu -->
  {#if isMobileMenuOpen}
    <div class="md:hidden" transition:slide={{ duration: 300 }}>
      <div class="bg-card/95 space-y-1 border-t px-2 pt-2 pb-3 backdrop-blur-sm sm:px-3">
        <a
          href="/"
          class="nav-link block px-3 py-2 text-base font-medium"
          onclick={closeMobileMenu}
          in:fade={{ delay: 100, duration: 200 }}
        >
          Home
        </a>
        <a
          href="/blog"
          class="nav-link block px-3 py-2 text-base font-medium"
          onclick={closeMobileMenu}
          in:fade={{ delay: 150, duration: 200 }}
        >
          Blog
        </a>
        <a
          href="/projects"
          class="nav-link block px-3 py-2 text-base font-medium"
          onclick={closeMobileMenu}
          in:fade={{ delay: 200, duration: 200 }}
        >
          Projects
        </a>
        <a
          href="/resume"
          class="nav-link block px-3 py-2 text-base font-medium"
          onclick={closeMobileMenu}
          in:fade={{ delay: 200, duration: 200 }}
        >
          Resume
        </a>
        <div
          class="absolute top-0 right-0 flex items-center space-x-2 px-3 py-2"
          in:fade={{ delay: 100, duration: 200 }}
        >
          <Button
            variant="outline"
            size="icon"
            onclick={() => window.open('https://github.com/Vokturz', '_blank')}
          >
            <TechIcon name="github" class="h-5 w-5" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            onclick={() => window.open('https://linkedin.com/in/vnavarroaranguiz', '_blank')}
          >
            <Linkedin class="h-5 w-5" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            onclick={() => window.open('https://huggingface.co/Vokturz', '_blank')}
          >
            <TechIcon name="huggingface" class="h-5 w-5" />
          </Button>
        </div>
      </div>
    </div>
  {/if}
</nav>
