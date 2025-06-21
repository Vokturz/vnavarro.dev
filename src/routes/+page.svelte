<script lang="ts">
  import Hero from '$lib/components/sections/Hero.svelte'
  import PostCard from '$lib/components/PostCard.svelte'
  import { Badge } from '$lib/components/ui/badge'

  export let data
</script>

<div class="star-bg">
  <main>
    <Hero />

    <section id="about" class="mx-auto max-w-4xl px-4 py-20 text-center sm:px-6 lg:px-8">
      <h2 class="gradient-text text-3xl font-extrabold sm:text-4xl">About Me</h2>
      <div class="bg-primary mx-auto mt-4 h-1 w-20 rounded-full"></div>
      <p class="text-muted-foreground mt-8 text-lg">
        With a background in software development, I enjoy building projects with Svelte,
        TypeScript, and Go. My focus is on creating clean, efficient, and user-friendly solutions.
        I'm always learning and exploring new technologies to improve my craft.
      </p>
      <div class="mt-6 flex flex-wrap justify-center gap-3">
        <Badge variant="secondary">Svelte</Badge>
        <Badge variant="secondary">TypeScript</Badge>
        <Badge variant="secondary">Go</Badge>
        <Badge variant="secondary">Tailwind CSS</Badge>
        <Badge variant="secondary">PostgreSQL</Badge>
      </div>
    </section>

    <section id="blog" class="bg-card/50 py-20">
      <div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div class="mb-16 text-center">
          <h2 class="gradient-text text-3xl font-extrabold sm:text-4xl">Latest Blog Posts</h2>
          <div class="bg-primary mx-auto mt-4 h-1 w-20 rounded-full"></div>
          <p class="text-muted-foreground mx-auto mt-4 max-w-2xl text-xl">
            Sharing my thoughts on development, technology, and more.
          </p>
        </div>

        {#if data.posts.length > 0}
          <div class="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
            {#each data.posts as post}
              <PostCard {post} />
            {/each}
          </div>
        {:else}
          <p class="text-muted-foreground text-center">No posts yet. Check back soon!</p>
        {/if}
      </div>
    </section>
  </main>
</div>
