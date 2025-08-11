<script lang="ts">
  import { onMount } from 'svelte'
  import { browser } from '$app/environment'
  import { Check, Copy } from 'lucide-svelte'
  import { Button } from '$lib/components/ui/button'

  const {
    code: initialCode,
    language = 'plaintext'
  }: {
    code: string
    language?: string
  } = $props()

  let copied = $state(false)
  let processedContent = $state('')

  // Color mapping for highlights
  const colorMap: Record<string, string> = {
    yellow: 'bg-yellow-200/80 text-yellow-900 dark:bg-yellow-500/30 dark:text-yellow-100',
    red: 'bg-red-200/80 text-red-900 dark:bg-red-500/30 dark:text-red-100',
    green: 'bg-green-200/80 text-green-900 dark:bg-green-500/30 dark:text-green-100',
    blue: 'bg-blue-200/80 text-blue-900 dark:bg-blue-500/30 dark:text-blue-100',
    purple: 'bg-purple-200/80 text-purple-900 dark:bg-purple-500/30 dark:text-purple-100',
    pink: 'bg-pink-200/80 text-pink-900 dark:bg-pink-500/30 dark:text-pink-100',
    gray: 'bg-gray-200/80 text-gray-900 dark:bg-gray-500/30 dark:text-gray-100',
    orange: 'bg-orange-200/80 text-orange-900 dark:bg-orange-500/30 dark:text-orange-100'
  }

  function processColorizedCode(code: string): string {
    // Replace %%color:text%% patterns with colored spans
    return code.replace(/%%([a-z]+):(.*?)%%/g, (match, color, text) => {
      const colorClass = colorMap[color] || colorMap.yellow
      return `<span class="${colorClass} px-1 py-0.5 rounded">${text.trim()}</span>`
    })
  }

  function escapeHtml(text: string): string {
    return text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#x27;')
  }

  function processCodeContent(code: string): string {
    // Process the entire code block to handle multi-line colorization
    let processedContent = ''
    let currentPos = 0

    // Find all color patterns in the entire code block (including newlines)
    const colorPattern = /%%([a-z]+):([\s\S]*?)%%/g
    let match

    while ((match = colorPattern.exec(code)) !== null) {
      // Add the text before the match (escaped)
      const beforeMatch = code.slice(currentPos, match.index)
      processedContent += escapeHtml(beforeMatch)

      // Add the colorized span
      const color = match[1]
      const text = match[2]
      const colorClass = colorMap[color] || colorMap.yellow
      processedContent += `<span class="${colorClass} px-1 py-0.5 rounded">${escapeHtml(text)}</span>`

      currentPos = match.index + match[0].length
    }

    // Add any remaining text after the last match
    const afterLastMatch = code.slice(currentPos)
    processedContent += escapeHtml(afterLastMatch)

    return processedContent
  }

  onMount(() => {
    if (browser) {
      processedContent = processCodeContent(initialCode)
    }
  })

  async function copyCode() {
    // Copy the original code without color markup
    const cleanCode = initialCode.replace(/%%([a-z]+):(.*?)%%/gs, '$2')
    await navigator.clipboard.writeText(cleanCode)
    copied = true
    setTimeout(() => (copied = false), 2000)
  }

  $effect(() => {
    if (browser) {
      processedContent = processCodeContent(initialCode)
    }
  })
</script>

<div class="group relative my-2">
  <div class="relative rounded-md border">
    <div class="relative">
      <pre class="bg-muted/20 min-h-4 overflow-auto p-3 font-mono text-sm whitespace-pre-wrap"><code
          >{@html processedContent}</code
        ></pre>
    </div>

    <Button
      variant="ghost"
      size="sm"
      class="absolute top-2 right-2 opacity-100 transition-opacity sm:opacity-0 sm:group-hover:opacity-100"
      onclick={copyCode}
    >
      {#if copied}
        <Check class="h-4 w-4" />
      {:else}
        <Copy class="h-4 w-4" />
      {/if}
    </Button>
  </div>
</div>
