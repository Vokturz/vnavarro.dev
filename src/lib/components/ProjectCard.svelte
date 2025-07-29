<script lang="ts">
  import type { Project } from '$lib/types'
  import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle
  } from '$lib/components/ui/card'
  import { Button } from '$lib/components/ui/button'
  import { ExternalLink, Github } from 'lucide-svelte'
  import TechIcon from './TechIcon.svelte'
  import HfIcon from '$lib/icons/HFIcon.svelte'

  interface Props {
    project: Project
    includeImage?: boolean
  }

  let { project, includeImage = false }: Props = $props()
</script>

<Card class="card-hover flex h-full flex-col">
  <CardHeader>
    <CardTitle>{project.title}</CardTitle>
    {#if project.liveUrl && includeImage}
      <img
        src="https://mini.s-shot.ru/1024x768/PNG/?{project.liveUrl}"
        alt={project.title + ' screenshot'}
        class="h-48 w-full rounded-lg border object-cover"
        loading="lazy"
      />
    {/if}
    <CardDescription class="mt-2 flex flex-wrap gap-2">
      {#each project.technologies as tech (tech)}
        <div class="bg-muted flex items-center gap-1 rounded-full px-2 py-1 text-xs">
          <TechIcon name={tech.toLowerCase()} class="h-3 w-3" />
          <span>{tech}</span>
        </div>
      {/each}
    </CardDescription>
  </CardHeader>

  <CardContent class="flex-grow">
    <p class="text-muted-foreground">{project.description}</p>
  </CardContent>

  <CardFooter class="flex gap-2">
    {#if project.githubUrl}
      <Button variant="outline" size="sm" class="flex items-center">
        <a
          href={project.githubUrl}
          target="_blank"
          rel="noopener noreferrer"
          class="flex items-center"
        >
          <Github class="mr-2 h-4 w-4" />
          Code
        </a>
      </Button>
    {/if}

    {#if project.liveUrl || project.hfUrl}
      <Button variant="default" size="sm" class="flex items-center">
        <a
          href={project.liveUrl ?? project.hfUrl}
          target="_blank"
          rel="noopener noreferrer"
          class="flex items-center gap-2"
        >
          <ExternalLink class="h-4 w-4" />
          Live Demo
          {#if project.hfUrl}
            <HfIcon class="h-4 w-4" />
          {/if}
        </a>
      </Button>
    {/if}
  </CardFooter>
</Card>
