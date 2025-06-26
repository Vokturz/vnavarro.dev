<script lang="ts">
  import Hero from '$lib/components/sections/Hero.svelte'
  import PostCard from '$lib/components/PostCard.svelte'
  import { Button } from '$lib/components/ui/button'
  import { scrollIntoView } from '$lib/actions'
  import { ExternalLink } from 'lucide-svelte'
  import ConstellationBackground from '$lib/components/ConstellationBackground.svelte'

  export let data
</script>

<div class="star-bg">
  <div class="absolute inset-x-0 top-0 h-screen w-full overflow-hidden max-h-150">
    <ConstellationBackground useWindowMouse={true} />
  </div>
  
  <div class="relative z-10 mt-[-120px] pb-32">
    <Hero />
  </div>
  
  <main class="relative z-10 mt-[-128px]">
    <section id="about" class="mx-auto max-w-4xl px-4 pt-20 py-2 sm:px-6 lg:px-8" use:scrollIntoView>
      <h2 class="gradient-text text-center text-3xl font-extrabold sm:text-4xl">About Me</h2>
      <div class="bg-primary mx-auto mt-4 h-1 w-20 rounded-full"></div>

      <div class="mt-12 grid grid-cols-1 gap-8 lg:grid-cols-3">
        <!-- Photo Section -->
        <div class="flex justify-center lg:justify-start">
          <div class="relative">
            <img
              src="/profile-photo.jpeg"
              alt="Víctor Navarro Aránguiz"
              class="ring-primary/20 h-64 w-64 rounded-full object-cover shadow-lg ring-4"
            />
            <div
              class="from-primary/20 absolute inset-0 rounded-full bg-gradient-to-tr to-transparent"
            ></div>
          </div>
        </div>

        <!-- Content Section -->
        <div class="lg:col-span-2">
          <p class="text-muted-foreground text-lg leading-relaxed">
            With a background in software development and data science, I enjoy building projects
            with Svelte, TypeScript, and Go. My focus is on creating clean, efficient, and
            user-friendly solutions. I'm always learning and exploring new technologies to improve
            my craft.
          </p>

          <p class="text-muted-foreground mt-4 text-lg leading-relaxed">
            Currently working as an AI Engineer at CodeGPT, where I design knowledge-graph
            algorithms and deploy production AI models. I hold a Master's in Astronomy and have
            published research in prestigious journals including Scientific Reports and Nature
            Scientific Data.
          </p>

          <div class="mt-8">
            <Button variant="outline" class="group">
              <a href="/resume" class="flex items-center">
                View Full Resume
                <ExternalLink class="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
              </a>
            </Button>
          </div>
        </div>
      </div>
    </section>

    <section id="blog" class="bg-card/50 py-20 mt-16 rounded-lg border">
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
