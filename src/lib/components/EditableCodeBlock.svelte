<script lang="ts">
  import { onMount, getContext } from 'svelte'
  import { browser } from '$app/environment'
  import { Play } from 'lucide-svelte'
  import { Button } from '$lib/components/ui/button'
  import type { Writable } from 'svelte/store'

  const { 
    code: initialCode, 
    language = 'plaintext',
    initialOutput = '',
    onSave,
    onRun,
    executionNumber = null
  } : { 
    code: string, 
    language?: string,
    initialOutput?: string,
    onSave?: (newCode: string) => void,
    onRun?: (code: string) => Promise<string> | string,
    executionNumber?: number | null
  } = $props()

  let code = $state(initialCode)
  let editorRef: HTMLElement
  let outputRef: HTMLElement
  let jar: any
  let output = $state(initialOutput)
  let isRunning = $state(false)
  let showOutput = $state(initialOutput.length > 0)
  let hasUserExecuted = $state(false)
  let currentExecutionNumber = $state(executionNumber)
  let CodeJar: any
  let hljs: any

  // Get the global execution counter from context
  const executionCounter = getContext<Writable<number>>('executionCounter')

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
        tab: '  ', // 2 spaces for tab
        indentOn: /[(\[{]$/,
        spellcheck: false,
        catchTab: true,
        preserveIdent: true,
        addClosing: true,
        history: true
      })

      // Set initial code
      jar.updateCode(code)

      // Listen for changes
      jar.onUpdate((newCode: string) => {
        code = newCode
        onSave?.(newCode)
      })

      // Add keyboard event listener for Ctrl+Enter
      editorRef.addEventListener('keydown', handleKeyDown)
    }

    return () => {
      if (jar) {
        jar.destroy()
      }
      if (editorRef) {
        editorRef.removeEventListener('keydown', handleKeyDown)
      }
    }
  })

  function handleKeyDown(event: KeyboardEvent) {
    if (event.ctrlKey && event.key === 'Enter') {
      event.preventDefault()
      runCode()
    }
  }

  async function runCode() {
    if (isRunning) return
    
    isRunning = true
    showOutput = true
    hasUserExecuted = true
    
    // Get and increment the global execution counter
    if (executionCounter) {
      executionCounter.update(n => {
        currentExecutionNumber = n
        return n + 1
      })
    }
    
    try {
      if (onRun) {
        const result = await onRun(code)
        output = result
      } else {
        // Fake output for demonstration
        await new Promise(resolve => setTimeout(resolve, 1000)) // Simulate execution time
        output = generateFakeOutput()
      }
    } catch (error) {
      output = `<pre class="notebook-error-output">Error: ${error instanceof Error ? error.message : 'Unknown error occurred'}</pre>`
    } finally {
      isRunning = false
    }
  }

  function generateFakeOutput() {
    const outputs = [
      '<pre class="notebook-stream-output">Hello, World!\nExecution completed successfully.</pre>',
      '<pre class="notebook-text-output">42</pre>',
      '<div class="notebook-image-output"><img src="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjEwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KICA8cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZjBmMGYwIi8+CiAgPHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxNCIgZmlsbD0iIzMzMyIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPk1hdHBsb3RsaWIgUGxvdDwvdGV4dD4KICA8bGluZSB4MT0iMjAiIHkxPSI4MCIgeDI9IjE4MCIgeTI9IjIwIiBzdHJva2U9IiMwMDciIHN0cm9rZS13aWR0aD0iMiIvPgo8L3N2Zz4=" alt="Plot output" /></div>',
      '<div class="notebook-html-output"><table border="1"><tr><th>Name</th><th>Value</th></tr><tr><td>Item 1</td><td>42</td></tr><tr><td>Item 2</td><td>84</td></tr></table></div>',
      '<pre class="notebook-json-output">{\n  "result": [1, 2, 3, 4, 5],\n  "status": "success"\n}</pre>'
    ]
    return outputs[Math.floor(Math.random() * outputs.length)]
  }

  // Function to render HTML output safely
  function renderOutput(htmlContent: string) {
    if (browser && outputRef) {
      outputRef.innerHTML = htmlContent
    }
  }

  // Update CodeJar when initialCode changes
  $effect(() => {
    if (jar && initialCode !== code) {
      code = initialCode
      jar.updateCode(initialCode)
    }
  })

  // Update output when initialOutput changes (only if user hasn't executed)
  $effect(() => {
    if (!hasUserExecuted) {
      output = initialOutput
      showOutput = initialOutput.length > 0
    }
  })

  // Render output when it changes
  $effect(() => {
    if (showOutput && output) {
      renderOutput(output)
    }
  })
</script>

<div class="group relative mt-4">
  <div class="relative rounded-md border">
    <div class="absolute left-[-2.5rem] top-0 bottom-0 w-10 flex items-start justify-center pt-3">
      <span class="text-xs font-mono text-muted-foreground">
        {#if isRunning}
          [*]
        {:else if currentExecutionNumber !== null}
          [{currentExecutionNumber}]
        {:else}
          [ ]
        {/if}
      </span>
    </div>

    <div
      bind:this={editorRef}
      class="codejar-editor min-h-4 p-3 font-mono text-sm bg-background focus:outline-none focus:ring-2 focus:ring-ring overflow-auto"
      style="white-space: pre; tab-size: 2;"
    >
      {#if !browser}
        <!-- Fallback content for SSR -->
        <pre class="m-0 whitespace-pre-wrap">{code}</pre>
      {/if}
    </div>
    
    <div class="absolute top-2 right-2 flex gap-1 opacity-0 transition-opacity group-hover:opacity-100">
      <Button
        variant="ghost"
        size="sm"
        onclick={runCode}
        disabled={isRunning}
        title="Run code (Ctrl+Enter)"
      >
        <Play class="h-4 w-4" />
      </Button>
    </div>
  </div>

  {#if showOutput}
    <div class="mt-2 rounded-md border bg-muted/50">
      <div class="flex items-center justify-between px-3 py-2 border-b bg-muted/30">
        <div class="flex items-center gap-2">
          <span class="text-sm font-medium text-muted-foreground">
            Output {currentExecutionNumber !== null ? `[${currentExecutionNumber}]` : ''}
          </span>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onclick={() => showOutput = false}
          class="h-6 w-6 p-0"
        >
          ×
        </Button>
      </div>
      <div class="p-3">
        {#if isRunning}
          <div class="flex items-center gap-2 text-sm text-muted-foreground">
            <div class="animate-spin h-4 w-4 border-2 border-current border-t-transparent rounded-full"></div>
            Running...
          </div>
        {:else if output.trim() === ''}
          <div class="text-sm text-muted-foreground italic">No output</div>
        {:else}
          <div bind:this={outputRef} class="notebook-output-container"></div>
        {/if}
      </div>
    </div>
  {/if}
</div>
