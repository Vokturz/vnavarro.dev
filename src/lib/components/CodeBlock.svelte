<script lang="ts">
  import { onMount } from 'svelte'
  import { browser } from '$app/environment'
  import { Copy, Check } from 'lucide-svelte'
  import { Button } from '$lib/components/ui/button'

  const { code, language = 'plaintext' }: { code: string, language?: string } = $props()

  let copied = $state(false)
  let editorRef: HTMLElement
  let jar: any
  let CodeJar: any
  let hljs: any

  onMount(async () => {
    if (browser && editorRef) {
      // Dynamically import CodeJar and hljs only on the client
      const [{ CodeJar: CJ }, hljsModule] = await Promise.all([
        import('codejar'),
        import('highlight.js')
      ])

      CodeJar = CJ
      hljs = hljsModule.default

      // Highlight function for CodeJar
      const highlight = (editor: HTMLElement) => {
        const code = editor.textContent || ''
        editor.innerHTML = hljs.highlight(code, { language }).value
      }

      jar = CodeJar(editorRef, highlight, {
        tab: '  ',
        indentOn: /[(\[{]$/,
        spellcheck: false,
        catchTab: false, // Disable tab catching for non-editable
        preserveIdent: false,
        addClosing: false,
        history: false, // Disable history for non-editable
      })

      // Set initial code
      jar.updateCode(code)

      // Make it non-editable by disabling input events
      editorRef.setAttribute('contenteditable', 'false')
      editorRef.style.cursor = 'default'
    }

    return () => {
      if (jar) {
        jar.destroy()
      }
    }
  })

  async function copyCode() {
    await navigator.clipboard.writeText(code)
    copied = true
    setTimeout(() => copied = false, 2000)
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

    <div class="absolute bottom-0 right-0 rounded-tl rounded-br bg-muted px-2 py-1 text-xs text-muted-foreground pointer-events-none">
      {language}
    </div>
  </div>
</div>
