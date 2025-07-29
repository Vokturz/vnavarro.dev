<script lang="ts">
  import { Code } from 'lucide-svelte'
  import * as icons from 'simple-icons'
  import { AwsIcon, AzureIcon, HFIcon } from '$lib/icons'

  let { name, class: className = 'h-4 w-4' }: { name: string; class?: string } = $props()

  const customIcons = {
    aws: AwsIcon,
    azure: AzureIcon,
    huggingface: HFIcon
  }

  const iconName = `si${name.charAt(0).toUpperCase() + name.slice(1)}`
  let iconData = $derived(icons[iconName as keyof typeof icons] as icons.SimpleIcon | undefined)
  if (name === 'transformers') {
    iconData = icons['siHuggingface' as keyof typeof icons] as icons.SimpleIcon | undefined
  }
  if (name === 'sveltekit') {
    iconData = icons['siSvelte' as keyof typeof icons] as icons.SimpleIcon | undefined
  }
  let CustomIcon = customIcons[name as keyof typeof customIcons]
</script>

{#if CustomIcon}
  <CustomIcon class={className} />
{:else}
  <svg class={className} viewBox="0 0 24 24" fill="currentColor">
    {#if iconData}
      <path d={iconData.path} />
    {:else}
      <Code class={className} />
    {/if}
  </svg>
{/if}
