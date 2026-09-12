<script lang="ts">
  import AmbientBackground from '$lib/components/AmbientBackground.svelte'
  import TechIcon from '$lib/components/TechIcon.svelte'
  import Badge from '$lib/components/ui/badge/badge.svelte'
  import type { Post } from '$lib/types'
  import PostAnimation from '$lib/components/PostAnimation.svelte'

  const { data }: { data: { posts: Post[] } } = $props()
</script>

<svelte:head>
  <title>Blog - vnavarro.dev</title>
</svelte:head>

<div class="relative isolate container mx-auto px-4 py-8">
  <AmbientBackground />
  <h1 class="mb-8 text-4xl font-bold">All Blog Posts</h1>
  <div class="grid gap-6">
    {#each data.posts as post (post.slug)}
      <a
        href={`/blog/${post.slug}`}
        class="bg-card/80 flex flex-col overflow-hidden rounded-lg border transition hover:scale-102 md:flex-row"
      >
        {#if post.image}
          <img
            src={post.image}
            alt={post.title}
            class="h-32 w-full shrink-0 object-cover md:h-auto md:w-40"
            loading="lazy"
          />
        {:else}
          <div class="relative h-32 shrink-0 overflow-hidden md:h-auto md:w-40">
            <PostAnimation seed={post.slug} />
          </div>
        {/if}
        <div class="min-w-0 p-6">
          <div class="flex flex-row items-center">
            {#if post.icon}
              <TechIcon name={post.icon} class="mt-2 mr-1 h-8 w-8 lg:h-4 lg:w-4" />
            {/if}
            <h2 class="mb-2 text-xl font-semibold lg:text-2xl">{post.title}</h2>
          </div>
          <p class="mb-2 text-sm text-gray-500 lg:text-base">
            {new Date(post.date).toDateString()}
          </p>
          <p class="text-sm lg:text-base">{post.summary}</p>
          {#if post.tags}
            <div class="mt-1 flex flex-row items-center space-x-4">
              {#each post.tags as tag (tag)}
                <Badge
                  variant="outline"
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
