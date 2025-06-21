<script lang="ts">
  import { Code } from 'lucide-svelte'
  import * as icons from 'simple-icons'
  // @ts-ignore
  import { AwsIcon, AzureIcon } from '$lib/icons'

  let { name, size = 'h-4 w-4' }: { name: string; size?: string } = $props()

  const customIcons = {
    aws: AwsIcon,
    azure: AzureIcon
  }

  const iconName = `si${name.charAt(0).toUpperCase() + name.slice(1)}`
  let iconData = icons[iconName as keyof typeof icons] as icons.SimpleIcon | undefined
  let CustomIcon = customIcons[name as keyof typeof customIcons]
</script>

{#if CustomIcon}
  <CustomIcon class={size} />
{:else}
  <svg class={size} viewBox="0 0 24 24" fill="currentColor">
    {#if iconData}
      <path d={iconData.path} />
    {:else}
      <Code class={size} />
    {/if}
  </svg>
{/if}
