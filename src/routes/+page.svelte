<script lang="ts">
	import type { Post } from '$lib/types'

	export let data: { posts: Post[] }
</script>

<div class="container mx-auto px-4 py-8">
	<section class="mb-12">
		<h2 class="mb-4 text-3xl font-bold">About Me</h2>
		<p class="text-lg">
			Welcome to my personal space on the web! I'm a developer, writer, and lifelong learner using
			TypeScript and Svelte.
		</p>
	</section>

	<section>
		<h2 class="mb-6 text-3xl font-bold">Latest Posts</h2>
		<div class="grid gap-6">
			{#each data.posts as post}
				<a
					href={`/blog/${post.slug}`}
					class="block rounded-lg border p-6 transition hover:shadow-lg"
				>
					<h3 class="mb-2 text-2xl font-semibold">{post.title}</h3>
					<p class="mb-2 text-gray-500">{new Date(post.date).toLocaleDateString()}</p>
					<p>{post.summary}</p>
				</a>
			{/each}
		</div>
	</section>
</div>
