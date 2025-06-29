<script lang="ts">
  import type { TocItem } from '$lib/toc'
  
  interface Props {
    items: TocItem[]
    class?: string
    onClick?: () => void
  }
  
  const { items, class: className = '', onClick }: Props = $props()
  
  function scrollToHeading(id: string) {
    const element = document.getElementById(id)
    if (element) {
      const headerOffset = 80 // slightly more than h-16 (64px) to add some padding
      const elementPosition = element.getBoundingClientRect().top
      const offsetPosition = elementPosition + window.pageYOffset - headerOffset
      
      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      })
    }
  }
</script>

{#if items.length > 0}
  <nav class="toc {className}" aria-label="Table of contents">
    <h3 class="text-lg font-semibold mb-4 text-foreground">Table of Contents</h3>
    <ul class="space-y-1">
      {#each items as item}
        <li class="toc-item toc-level-{item.level} ">
          <button
            class="text-left w-full text-sm text-primary hover:text-purple-500 transition-colors duration-200 py-1 px-2 rounded cursor-pointer"
            style="padding-left: {(item.level - 1) * 1}rem"
            onclick={() => {
              scrollToHeading(item.id)
              onClick?.()
              }}
          >
            {item.text}
          </button>
        </li>
      {/each}
    </ul>
  </nav>
{/if}

<style>
  .toc {
    border-left: 2px solid hsl(var(--border));
    padding-left: 1rem;
  }
  
  .toc-item button:hover {
    border-left: 2px solid hsl(var(--primary));
    margin-left: -1rem;
    padding-left: calc(1rem - 2px);
  }
</style>
