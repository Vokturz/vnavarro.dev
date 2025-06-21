<script lang="ts">
  import type { Post } from '$lib/types'

  export let data: { posts: Post[] }
</script>

<div class="container mx-auto px-4 py-8">
  <h1 class="mb-8 text-4xl font-bold">All Blog Posts</h1>
  <div class="grid gap-6">
    {#each data.posts as post}
      <a href={`/blog/${post.slug}`} class="block rounded-lg border p-6 transition hover:shadow-lg">
        <h2 class="mb-2 text-2xl font-semibold">{post.title}</h2>
        <p class="mb-2 text-gray-500">{new Date(post.date).toLocaleDateString()}</p>
        <p>{post.summary}</p>
      </a>
    {/each}
  </div>
</div>
