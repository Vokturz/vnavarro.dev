<script lang="ts">
	import { onMount } from 'svelte'
	import {
		Github,
		Linkedin,
		MoonIcon,
		SunDimIcon,
		SunIcon,
		Terminal,
		TerminalSquare
	} from 'lucide-svelte'
	import { Button } from '$lib/components/ui/button'

	let isDarkMode = $state(false)

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
					<div class="ml-10 flex items-baseline space-x-4">
						<a
							href="/#about"
							class="text-foreground/80 hover:text-foreground rounded-md px-3 py-2 text-sm font-medium"
							>About</a
						>
						<a
							href="/blog"
							class="text-foreground/80 hover:text-foreground rounded-md px-3 py-2 text-sm font-medium"
							>Blog</a
						>
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
			</div>
		</div>
	</div>
</nav>
