<script lang="ts">
  import ProjectCard from '$lib/components/ProjectCard.svelte'
  import type { Project } from '$lib/types'
  export let data: { projects: Project[] }
</script>

<div class="container mx-auto px-4 py-8">
  <h1 class="mb-8 text-4xl font-bold">Projects</h1>
  {#if !data.projects || data.projects.length === 0}
    <div class="flex flex-row items-center gap-4">
      <span class="text-primary h-12 w-12">🚧</span>
      <h2>Under development</h2>
    </div>
  {:else}
    <div class="grid gap-8 md:grid-cols-2">
      {#each data.projects as project (project.title)}
        <div class="flex flex-col gap-4">
          <ProjectCard {project} includeImage={false} />
        </div>
      {/each}
    </div>
  {/if}
</div>
