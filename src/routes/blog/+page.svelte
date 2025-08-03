<script lang="ts">
  import TechIcon from '$lib/components/TechIcon.svelte'
  import Badge from '$lib/components/ui/badge/badge.svelte'
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
          <div class="h-full min-w-32" style="background: {getPostGradient(post.image)}"></div>
        {/if}
        <div class="p-6">
          <div class="flex flex-row items-center">
            {#if post.icon}
              <TechIcon name={post.icon} class="mt-2 mr-1 h-4 w-4 " />
            {/if}
            <h2 class="mb-2 text-2xl font-semibold">{post.title}</h2>
          </div>
          <p class="mb-2 text-gray-500">{new Date(post.date).toDateString()}</p>
          <p>{post.summary}</p>
          {#if post.tags}
            <div class="mt-1 flex flex-row items-center space-x-4">
              {#each post.tags as tag (tag)}
                <Badge
                  variant="secondary"
                  class="mr-1 flex items-center gap-2 transition-transform hover:scale-105"
                >
                  <!-- <TechIcon name={tag} class="h-3 w-3" /> -->
                  {tag}
                </Badge>
              {/each}
            </div>
          {/if}
        </div>
      </a>
    {/each}
  </div>
</div>
