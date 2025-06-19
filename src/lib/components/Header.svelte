<script lang="ts">
	import { page } from '$app/stores'
</script>

<header
	class="border-border/40 bg-background/95 supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50 w-full border-b backdrop-blur"
>
	<div class="container flex h-14 max-w-4xl items-center justify-between">
		<a href="/" class="text-xl font-bold tracking-tight">Your Name / Blog</a>
		<nav class="flex items-center gap-4 text-sm font-medium">
			<a
				href="/"
				class="text-muted-foreground hover:text-foreground transition-colors"
				class:active={$page.url.pathname === '/'}
			>
				Home
			</a>
			<a
				href="/blog"
				class="text-muted-foreground hover:text-foreground transition-colors"
				class:active={$page.url.pathname.startsWith('/blog')}
			>
				Blog
			</a>
		</nav>
	</div>
</header>

<style>
	.active {
		color: hsl(var(--foreground));
	}
</style>
