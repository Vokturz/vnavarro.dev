<script lang="ts">
  import Hero from '$lib/components/sections/Hero.svelte'
  import PostCard from '$lib/components/PostCard.svelte'
  import ProjectCard from '$lib/components/ProjectCard.svelte'
  import { Button } from '$lib/components/ui/button'
  import { scrollIntoView } from '$lib/actions'
  import { ExternalLink } from 'lucide-svelte'
  import ConstellationBackground from '$lib/components/ConstellationBackground.svelte'

  export let data
</script>

<svelte:head>
  <title>vnavarro.dev</title>
</svelte:head>

<div class="star-bg">
  <div class="absolute inset-x-0 top-0 h-screen max-h-150 w-full overflow-hidden">
    <ConstellationBackground useWindowMouse={true} />
  </div>

  <div class="relative z-20 mt-[-50px] pb-32">
    <Hero />
  </div>

  <main class="relative z-10 mt-[-256px]">
    <section
      id="about"
      class="mx-auto max-w-4xl px-4 py-2 pt-20 sm:px-6 lg:px-8"
      use:scrollIntoView
    >
      <h2 class="text-secondary text-center text-3xl font-extrabold sm:text-4xl">About Me</h2>
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
              class="from-ring/20 absolute inset-0 rounded-full bg-gradient-to-tr to-transparent"
            ></div>
          </div>
        </div>

        <!-- Content Section -->
        <div class="lg:col-span-2">
          <p class="text-muted-foreground text-lg leading-relaxed">
            Hey there! I'm Víctor—a software engineer and data scientist from Chile who loves
            building cool things and exploring new ideas. Here you can find my thoughts, projects,
            and experiments. Feel free to check out my latest blog posts or dive into my full resume
            to see what I've been up to!
          </p>

          <p class="text-muted-foreground mt-4 text-lg leading-relaxed">
            If you find something interesting here or just want to connect, don't hesitate to reach
            out!
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

    <section id="blog" class="bg-card/50 mt-16 rounded-lg border py-10">
      <div class="mx-auto max-w-7xl px-4 sm:px-2 lg:px-4">
        <div class="mb-12 text-center">
          <h2 class="text-secondary text-3xl font-extrabold sm:text-4xl">Latest Blog Posts</h2>
          <div class="bg-primary mx-auto mt-4 h-1 w-20 rounded-full"></div>
        </div>

        {#if data.posts.length > 0}
          <div class="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
            {#each data.posts as post (post.slug)}
              <PostCard {post} />
            {/each}
          </div>
          <div class="mt-6 text-center">
            <Button variant="outline" class="group">
              <a href="/blog" class="flex items-center">
                View All Blog Posts
                <ExternalLink class="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
              </a>
            </Button>
          </div>
        {:else}
          <p class="text-muted-foreground text-center">No posts yet. Check back soon!</p>
        {/if}
      </div>
    </section>

    <section id="projects" class="bg-card/50 mt-16 rounded-lg border py-10">
      <div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div class="mb-16 text-center">
          <h2 class="text-secondary text-3xl font-extrabold sm:text-4xl">Featured Projects</h2>
          <div class="bg-primary mx-auto mt-4 h-1 w-20 rounded-full"></div>
        </div>

        {#if data.projects && data.projects.length > 0}
          <div class="grid grid-cols-1 gap-8 md:grid-cols-2">
            {#each data.projects as project (project.title)}
              <ProjectCard {project} />
            {/each}
          </div>

          <div class="mt-6 text-center">
            <Button variant="outline" class="group">
              <a href="/projects" class="flex items-center">
                View All Projects
                <ExternalLink class="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
              </a>
            </Button>
          </div>
        {:else}
          <p class="text-muted-foreground text-center">No projects yet. Check back soon!</p>
        {/if}
      </div>
    </section>
  </main>
</div>
