<script lang="ts">
  import type { Post } from '$lib/types';

  export let data: { posts: Post[] };
</script>

<div class="container mx-auto px-4 py-8">
  <h1 class="text-4xl font-bold mb-8">All Blog Posts</h1>
  <div class="grid gap-6">
    {#each data.posts as post}
      <a href={`/blog/${post.slug}`} class="block p-6 border rounded-lg hover:shadow-lg transition">
        <h2 class="text-2xl font-semibold mb-2">{post.title}</h2>
        <p class="text-gray-500 mb-2">{new Date(post.date).toLocaleDateString()}</p>
        <p>{post.summary}</p>
      </a>
    {/each}
  </div>
</div>