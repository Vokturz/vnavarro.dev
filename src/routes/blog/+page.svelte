<script lang="ts">
  import type { Post } from '$lib/types'
  import { getPostGradient } from '$lib/utils/images'

  const { data }: { data: { posts: Post[] } } = $props()
</script>

<div class="container mx-auto px-4 py-8">
  <h1 class="mb-8 text-4xl font-bold">All Blog Posts</h1>
  <div class="grid gap-6">
    {#each data.posts as post (post.slug)}
      <a
        href={`/blog/${post.slug}`}
        class="flex flex-row overflow-hidden rounded-lg border transition hover:scale-102"
      >
        {#if post.image}
          <img src={post.image} alt={post.title} class="w-32 object-cover" loading="lazy" />
        {:else}
          <div class="h-full w-32" style="background: {getPostGradient(post.image)}"></div>
        {/if}
        <div class="p-6">
          <h2 class="mb-2 text-2xl font-semibold">{post.title}</h2>
          <p class="mb-2 text-gray-500">{new Date(post.date).toLocaleDateString()}</p>
          <p>{post.summary}</p>
        </div>
      </a>
    {/each}
  </div>
</div>
