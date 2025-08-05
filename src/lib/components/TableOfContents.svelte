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
    <h3 class="text-foreground mb-4 text-lg font-semibold">Table of Contents</h3>
    <ul class="space-y-1">
      {#each items as item (item.id)}
        <li class="toc-item toc-level-{item.level} ">
          <button
            class="text-primary w-full cursor-pointer rounded px-2 py-1 text-left text-sm transition-colors duration-200 hover:text-purple-500"
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
