<script lang="ts">
  import { Copy, Check } from 'lucide-svelte'
  import { Button } from '$lib/components/ui/button'
  import hljs from 'highlight.js'
  
  export let code: string
  export let language: string = 'plaintext'
  
  let copied = false
  
  // Highlight the code
  $: highlightedCode = hljs.highlight(code, { language }).value
  
  async function copyCode() {
    await navigator.clipboard.writeText(code)
    copied = true
    setTimeout(() => copied = false, 2000)
  }
</script>

<div class="relative group">
  <pre class="border rounded-md overflow-x-auto"><code class="hljs language-{language}">{@html highlightedCode}</code></pre>
  <Button
    variant="ghost"
    size="sm"
    class="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
    onclick={copyCode}
  >
    {#if copied}
      <Check class="h-4 w-4" />
    {:else}
      <Copy class="h-4 w-4" />
    {/if}
  </Button>
</div>
