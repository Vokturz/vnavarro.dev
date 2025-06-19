<script lang="ts">
	import { Button } from '$lib/components/ui/button';
</script>

<header class="relative overflow-hidden">
	<div class="max-w-7xl mx-auto py-24 px-4 sm:py-32 sm:px-6 lg:px-8 text-center">
		<h1 class="text-4xl md:text-6xl font-extrabold mb-6">
			<span class="gradient-text">Lorem Ipsum</span>
			<br />
			<span class="typewriter">text animation</span>
		</h1>
		<p class="mt-6 text-xl text-muted-foreground max-w-3xl mx-auto">
			I'm a developer passionate about creating useful and beautiful applications.
		</p>
		<div class="mt-10 flex justify-center space-x-4">
			<Button size="lg">
				<a href="/#about">Learn About Me</a>
			</Button>
			<Button size="lg" variant="secondary">
				<a href="/#blog">Read My Blog</a>
			</Button>
		</div>
	</div>
</header>