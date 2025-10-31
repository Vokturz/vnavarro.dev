<script lang="ts">
  /* eslint-disable @typescript-eslint/no-explicit-any */
  import { onMount } from 'svelte'
  import { browser } from '$app/environment'
  import { Copy, Check } from 'lucide-svelte'
  import { Button } from '$lib/components/ui/button'

  const { code, language = 'plaintext' }: { code: string; language?: string } = $props()

  let copied = $state(false)
  let editorRef: HTMLElement
  let jar: any
  let CodeJar: any
  let hljs: any

  onMount(() => {
    if (!browser || !editorRef) return

    let destroyed = false

    Promise.all([import('codejar'), import('highlight.js')]).then(
      ([{ CodeJar: CJ }, hljsModule]) => {
        if (destroyed) return

        CodeJar = CJ
        hljs = hljsModule.default

        const highlight = (editor: HTMLElement) => {
          const code = editor.textContent || ''
          editor.innerHTML = hljs.highlight(code, { language }).value
        }

        jar = CodeJar(editorRef, highlight, {
          tab: '  ',
          indentOn: /[(\[{]$/,
          spellcheck: false,
          catchTab: false,
          preserveIdent: false,
          addClosing: false,
          history: false
        })

        jar.updateCode(code)
        editorRef.setAttribute('contenteditable', 'false')
        editorRef.style.cursor = 'default'
      }
    )

    return () => {
      destroyed = true
      if (jar) jar.destroy()
    }
  })

  async function copyCode() {
    await navigator.clipboard.writeText(code)
    copied = true
    setTimeout(() => (copied = false), 2000)
  }

  // Update CodeJar when code changes
  $effect(() => {
    if (jar && browser) {
      jar.updateCode(code)
    }
  })
</script>

<div class="group relative mt-4">
  <div class="relative rounded-md border">
    <div
      bind:this={editorRef}
      class="codejar-editor bg-background focus:ring-ring min-h-4 overflow-auto p-3 font-mono text-sm focus:ring-2 focus:outline-none"
      style="white-space: pre; tab-size: 2;"
    >
      {#if !browser}
        <!-- Fallback content for SSR -->
        <pre class="m-0 whitespace-pre-wrap">{code}</pre>
      {/if}
    </div>

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

    <div
      class="bg-muted text-muted-foreground pointer-events-none absolute right-0 bottom-0 rounded-tl rounded-br px-2 py-1 text-xs"
    >
      {language}
    </div>
  </div>
</div>
