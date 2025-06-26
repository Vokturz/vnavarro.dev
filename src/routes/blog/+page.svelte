<script lang="ts">
  import type { Post } from '$lib/types'
  import { getPostGradient } from '$lib/utils/images'

  const { data } : { data : {posts: Post[] }} = $props()
  console.log(data.posts)
</script>

<div class="container mx-auto px-4 py-8">
  <h1 class="mb-8 text-4xl font-bold">All Blog Posts</h1>
  <div class="grid gap-6">
    {#each data.posts as post}
      <a href={`/blog/${post.slug}`} class="block rounded-lg border overflow-hidden transition hover:scale-102 flex flex-row">
        {#if post.image}
          <img 
            src={post.image} 
            alt={post.title}
            class="w-32 object-cover"
            loading="lazy"
          />
        {:else}
          <div 
            class="w-32 h-full"
            style="background: {getPostGradient(post.image)}"
          ></div>
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
