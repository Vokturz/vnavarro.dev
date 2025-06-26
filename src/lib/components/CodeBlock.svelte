<script lang="ts">
  import { Copy, Check } from 'lucide-svelte'
  import { Button } from '$lib/components/ui/button'
  import hljs from 'highlight.js'

  const { code, language = 'plaintext' } : { code: string, language?: string } = $props()

  let copied = $state(false)
  
  let highlightedCode = $derived(
    hljs.highlight(code, { language }).value
  )

  async function copyCode() {
    await navigator.clipboard.writeText(code)
    copied = true
    setTimeout(() => copied = false, 2000)
  }
</script>

<div class="group relative overflow-hidden">
  <pre class="overflow-x-auto rounded-md border"><code class="hljs language-{language}"
      >{@html highlightedCode}</code
    ></pre>
  <Button
    variant="ghost"
    size="sm"
    class="absolute top-2 right-2 opacity-0 transition-opacity group-hover:opacity-100"
    onclick={copyCode}
  >
    {#if copied}
      <Check class="h-4 w-4" />
    {:else}
      <Copy class="h-4 w-4" />
    {/if}
  </Button>
  
  <div class="absolute bottom-6 right-0 rounded-tl rounded-br bg-muted px-1 py-1 text-xs text-muted-foreground pointer-events-none">
    {language}
  </div>
</div>
