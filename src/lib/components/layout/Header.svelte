<script lang="ts">
  import { onMount } from 'svelte'
  import { slide, fade } from 'svelte/transition'
  import { Github, Linkedin, MoonIcon, SunIcon, Menu, X } from 'lucide-svelte'
  import { Button } from '$lib/components/ui/button'

  let isDarkMode = $state(false)
  let isMobileMenuOpen = $state(false)

  function toggleDarkMode() {
    isDarkMode = !isDarkMode
    if (isDarkMode) {
      document.body.classList.add('terminal')
      localStorage.setItem('theme', 'terminal')
      updateHighlightTheme('sunburst')
    } else {
      document.body.classList.remove('terminal')
      localStorage.setItem('theme', 'light')
      updateHighlightTheme('github')
    }
  }

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
    const savedTheme = localStorage.getItem('theme')
    if (savedTheme === 'terminal') {
      isDarkMode = true
      document.body.classList.add('terminal')
      updateHighlightTheme('sunburst')
    } else {
      updateHighlightTheme('github')
    }
  })
</script>

<nav class="bg-card/90 sticky top-0 z-50 backdrop-blur-sm">
  <div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
    <div class="flex h-16 items-center justify-between">
      <div class="flex items-center space-x-2">
        <a href="/" class="gradient-text text-2xl font-bold">vnavarro.dev</a>
        <div class="hidden md:block">
          <div class="ml-10 flex items-baseline space-x-8">
            <a href="/#about" class="nav-link">About</a>
            <a href="/blog" class="nav-link">Blog</a>
            <a href="/resume" class="nav-link">Resume</a>
          </div>
        </div>
      </div>
      <div class="flex items-center space-x-2">
        <div class="hidden items-center space-x-2 md:flex">
          <Button variant="outline" size="icon">
            <a href="https://github.com/Vokturz" target="_blank" rel="noopener noreferrer">
              <Github class="h-5 w-5" />
            </a>
          </Button>
          <Button variant="outline" size="icon">
            <a
              href="https://linkedin.com/in/vnavarroaranguiz"
              target="_blank"
              rel="noopener noreferrer"
            >
              <Linkedin class="h-5 w-5" />
            </a>
          </Button>
        </div>
        <div class="bg-border hidden h-6 w-px md:block"></div>
        <Button
          onclick={toggleDarkMode}
          variant="outline"
          size="icon"
          class="h-10 w-10 flex-shrink-0"
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
          class="h-10 w-10 flex-shrink-0 md:hidden"
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
          href="/#about"
          class="nav-link block px-3 py-2 text-base font-medium"
          onclick={closeMobileMenu}
          in:fade={{ delay: 100, duration: 200 }}
        >
          About
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
          <Button variant="outline" size="icon">
            <a href="https://github.com/Vokturz" target="_blank" rel="noopener noreferrer">
              <Github class="h-5 w-5" />
            </a>
          </Button>
          <Button variant="outline" size="icon">
            <a
              href="https://linkedin.com/in/vnavarroaranguiz"
              target="_blank"
              rel="noopener noreferrer"
            >
              <Linkedin class="h-5 w-5" />
            </a>
          </Button>
        </div>
      </div>
    </div>
  {/if}
</nav>
