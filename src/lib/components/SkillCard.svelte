<script lang="ts">
  import * as Tooltip from '$lib/components/ui/tooltip/index.js'
  import TechIcon from '$lib/components/TechIcon.svelte'
  import Badge from './ui/badge/badge.svelte'

  interface Props {
    skill: {
      name: string
      iconName: string
      color?: string
      description?: string
      // level?: number
    }
  }

  let { skill }: Props = $props()
</script>

<Tooltip.Provider>
  <Tooltip.Root>
    <Tooltip.Trigger>
      <Badge
        variant="secondary"
        class="flex items-center gap-2 transition-transform hover:scale-105"
      >
        <TechIcon name={skill.iconName} class={`${skill.color} h-4 w-4`} />
        {skill.name}
      </Badge>
    </Tooltip.Trigger>

    {#if skill.description}
      <Tooltip.Content class="max-w-xs">
        <p class="mt-1">{skill.description}</p>
      </Tooltip.Content>
    {/if}
  </Tooltip.Root>
</Tooltip.Provider>
