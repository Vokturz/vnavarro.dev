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
  import Badge from './ui/badge/badge.svelte'

  function slugify(str: string): string {
    return str
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .trim()
  }

  interface Props {
    project: Project
  }

  let { project }: Props = $props()

  let projectUrl = $state(project.liveUrl ?? project.hfUrl ?? project.githubUrl)
  let slugifiedTitle = slugify(project.title)
  if (slugifiedTitle === 'personal-website') {
    projectUrl = '/blog/python-in-browser'
  }
</script>

<Card class="card-hover flex h-full flex-col rounded-sm">
  <CardHeader>
    <CardTitle>{project.title}</CardTitle>
    {#if project.showImage}
      <a
        href={projectUrl}
        target="_blank"
        rel="noopener noreferrer"
        class="flex items-center gap-2"
      >
        <img
          src="/projects/{slugifiedTitle}.png"
          alt={project.title + ' screenshot'}
          class="xs:h-32 h-48 w-full rounded-lg border object-cover"
          loading="lazy"
        />
      </a>
    {/if}
    <CardDescription class="mt-2 flex flex-wrap gap-2">
      {#each project.technologies as tech (tech)}
        <Badge variant="outline">
          <TechIcon name={tech.toLowerCase()} class="h-3 w-3" />
          <span>{tech}</span>
        </Badge>
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
