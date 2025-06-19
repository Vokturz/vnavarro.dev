<script lang="ts">
	import Hero from '$lib/components/sections/Hero.svelte';
	import PostCard from '$lib/components/PostCard.svelte';
    import { Badge } from '$lib/components/ui/badge';

	export let data;
</script>

<div class="star-bg">
	<main>
		<Hero />

		<section id="about" class="py-20 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
			<h2 class="text-3xl font-extrabold sm:text-4xl gradient-text">About Me</h2>
			<div class="mt-4 h-1 w-20 bg-primary mx-auto rounded-full"></div>
			<p class="mt-8 text-lg text-muted-foreground">
				With a background in software development, I enjoy building projects with Svelte, TypeScript, and Go. My focus is on creating clean, efficient, and user-friendly solutions. I'm always learning and exploring new technologies to improve my craft.
			</p>
             <div class="flex flex-wrap gap-3 justify-center mt-6">
                <Badge variant="secondary">Svelte</Badge>
                <Badge variant="secondary">TypeScript</Badge>
                <Badge variant="secondary">Go</Badge>
                <Badge variant="secondary">Tailwind CSS</Badge>
                <Badge variant="secondary">PostgreSQL</Badge>
            </div>
		</section>

		<section id="blog" class="py-20 bg-card/50">
			<div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
				<div class="text-center mb-16">
					<h2 class="text-3xl font-extrabold sm:text-4xl gradient-text">Latest Blog Posts</h2>
					<div class="mt-4 h-1 w-20 bg-primary mx-auto rounded-full"></div>
					<p class="mt-4 max-w-2xl text-xl text-muted-foreground mx-auto">
						Sharing my thoughts on development, technology, and more.
					</p>
				</div>

				{#if data.posts.length > 0}
					<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
						{#each data.posts as post}
							<PostCard {post} />
						{/each}
					</div>
				{:else}
					<p class="text-center text-muted-foreground">No posts yet. Check back soon!</p>
				{/if}
			</div>
		</section>
	</main>
</div>