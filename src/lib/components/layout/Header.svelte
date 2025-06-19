<script lang="ts">
	import { Github, Linkedin, Twitter } from 'lucide-svelte';
	import { Button } from '$lib/components/ui/button';
</script>

<nav class="bg-card/90 backdrop-blur-sm sticky top-0 z-50">
	<div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
		<div class="flex items-center justify-between h-16">
			<div class="flex items-center">
				<a href="/" class="text-2xl font-bold gradient-text">vnavarro.dev</a>
				<div class="hidden md:block">
					<div class="ml-10 flex items-baseline space-x-4">
						<a href="/#about" class="px-3 py-2 rounded-md text-sm font-medium text-foreground/80 hover:text-foreground">About</a>
						<a href="/blog" class="px-3 py-2 rounded-md text-sm font-medium text-foreground/80 hover:text-foreground">Blog</a>
					</div>
				</div>
			</div>
			<div class="hidden md:block">
				<div class="ml-4 flex items-center md:ml-6 space-x-2">
					<Button variant="outline" size="icon">
						<a href="https://github.com/Vokturx" target="_blank">
							<Github class="h-5 w-5" />
						</a>
					</Button>
                    <Button variant="outline" size="icon">
						<a href="https://linkedin.com/in/vnavarroaranguix" target="_blank">
							<Linkedin class="h-5 w-5" />
						</a>
					</Button>
				</div>
			</div>
		</div>
	</div>
</nav>