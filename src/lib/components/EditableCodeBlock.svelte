<script lang="ts">
  import { onMount, getContext } from 'svelte'
  import { browser } from '$app/environment'
  import { Check, Copy, Play } from 'lucide-svelte'
  import { Button } from '$lib/components/ui/button'
  import { pyodideStore, executePython } from '$lib/pyodide-service'
  import type { Writable } from 'svelte/store'

  const {
    code: initialCode,
    language = 'plaintext',
    initialOutput = '',
    onSave,
    onRun,
    executionNumber = null,
    readonly = true
  }: {
    code: string
    language?: string
    initialOutput?: string
    onSave?: (newCode: string) => void
    onRun?: (code: string) => Promise<string> | string
    executionNumber?: number | null
    readonly?: boolean
  } = $props()

  let code = $state(initialCode)
  let copied = $state(false)
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

  // Check if this is a Python code block
  const isPython = $derived(language === 'python' || language === 'py')

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
        catchTab: readonly ? false : true,
        preserveIdent: true,
        addClosing: true,
        history: readonly ? false : true
      })

      // Set initial code
      jar.updateCode(code)

      // Listen for changes only if not readonly
      if (!readonly) {
        jar.onUpdate((newCode: string) => {
          code = newCode
          onSave?.(newCode)
        })
      }

      // Add keyboard event listener for Ctrl+Enter only if not readonly
      if (!readonly) {
        editorRef.addEventListener('keydown', handleKeyDown)
      } else {
        editorRef.setAttribute('contenteditable', 'false')
        editorRef.style.cursor = 'default'
        // editorRef.style.userSelect = 'none'
      }
    }

    return () => {
      if (jar) {
        jar.destroy()
      }
      if (editorRef && !readonly) {
        editorRef.removeEventListener('keydown', handleKeyDown)
      }
    }
  })

  function handleKeyDown(event: KeyboardEvent) {
    if ((event.ctrlKey || event.metaKey) && event.key === 'Enter') {
      event.preventDefault()
      event.stopPropagation()
      runCode()
      return false
    }
  }

  async function runCode() {
    if (isRunning || readonly) return

    isRunning = true
    showOutput = true
    hasUserExecuted = true

    // Clear previous output immediately
    output = ''

    // Get and increment the global execution counter
    if (executionCounter) {
      executionCounter.update((n) => {
        currentExecutionNumber = n
        return n + 1
      })
    }

    try {
      if (onRun) {
        // Use custom onRun function if provided
        const result = await onRun(code)
        output = result
      } else if (isPython && $pyodideStore.ready) {
        // Run Python code using pyodide
        const result = await executePython(code)
        output = formatPythonOutput({ output: result, error: null })
      } else if (isPython && !$pyodideStore.ready) {
        // Python code but pyodide not ready
        output =
          '<pre class="notebook-error-output">Python environment is not ready yet. Please wait for initialization to complete.</pre>'
      } else {
        // Fake output for non-Python code
        await new Promise((resolve) => setTimeout(resolve, 1000)) // Simulate execution time
        output = generateFakeOutput()
      }
    } catch (error) {
      output = `<pre class="notebook-error-output">Error: ${error instanceof Error ? error.message : 'Unknown error occurred'}</pre>`
    } finally {
      isRunning = false
    }
  }

  function formatPythonOutput(result: { output: string; error: string | null }) {
    if (result.error) {
      return `<pre class="notebook-error-output">${result.error}</pre>`
    }

    // Handle completely empty or whitespace-only output
    if (!result.output || result.output.trim() === '') {
      return '<div class="text-sm text-muted-foreground italic">No output</div>'
    }

    // Check if output is already formatted HTML from pyodide service
    if (
      result.output.includes('<pre class="notebook-') ||
      result.output.includes('<div class="notebook-') ||
      result.output.includes('<div class="text-sm text-muted-foreground italic">')
    ) {
      return result.output
    }

    // Check if output looks like HTML (but not our formatted output)
    if (result.output.includes('<') && result.output.includes('>')) {
      return `<div class="notebook-html-output">${result.output}</div>`
    }

    // Default to plain text output
    return `<pre class="notebook-stream-output">${result.output}</pre>`
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

  // Render output when it changes - improved version with proper checks
  $effect(() => {
    if (browser && showOutput && output && outputRef) {
      // Use requestAnimationFrame to ensure DOM is ready
      requestAnimationFrame(() => {
        // Double-check that outputRef still exists and is connected to DOM
        if (outputRef && outputRef.isConnected) {
          outputRef.innerHTML = output
        }
      })
    }
  })

  async function copyCode() {
    await navigator.clipboard.writeText(code)
    copied = true
    setTimeout(() => (copied = false), 2000)
  }
</script>

<div class="group relative mt-4">
  <div class="relative rounded-md border">
    {#if !readonly}
      <div
        class="absolute top-0 bottom-0 left-[-3.5rem] flex w-14 items-start justify-center pt-3 select-none"
      >
        <span class="text-muted-foreground font-mono text-xs">
          {#if isRunning}
            In [*]:
          {:else if currentExecutionNumber !== null}
            In [{currentExecutionNumber}]:
          {:else}
            In [ ]:
          {/if}
        </span>
      </div>
    {/if}

    <div
      bind:this={editorRef}
      class="codejar-editor bg-background focus:ring-ring min-h-4 overflow-auto p-3 font-mono text-sm focus:ring-2 focus:outline-none {readonly
        ? 'cursor-default'
        : ''}"
      style="white-space: pre; tab-size: 2;"
      contenteditable={!readonly}
    >
      {#if !browser}
        <!-- Fallback content for SSR -->
        <pre class="m-0 whitespace-pre-wrap">{code}</pre>
      {/if}
    </div>

    {#if !readonly}
      <div
        class="absolute top-2 right-2 flex gap-1 opacity-0 transition-opacity group-hover:opacity-100"
      >
        <Button
          variant="ghost"
          size="sm"
          onclick={runCode}
          disabled={isRunning || (isPython && !$pyodideStore.ready)}
          title={isPython ? 'Run Python code (Ctrl+Enter)' : 'Run code (Ctrl+Enter)'}
          class={isPython && !$pyodideStore.ready ? 'opacity-50' : ''}
        >
          <Play class="h-4 w-4" />
          {#if isPython && $pyodideStore.loading}
            <span class="ml-1 text-xs">Loading...</span>
          {/if}
        </Button>
      </div>
    {:else}
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
    {/if}
  </div>

  {#if showOutput}
    <div class="bg-muted/50 relative mt-2 rounded-md border">
      {#if !readonly}
        <div
          class="absolute top-0 bottom-0 left-[-4rem] flex w-17 items-start justify-center pt-3 select-none"
        >
          <span class="text-muted-foreground font-mono text-xs">
            {#if isRunning}
              Out [*]:
            {:else if currentExecutionNumber !== null}
              Out [{currentExecutionNumber}]:
            {:else}
              Out [ ]:
            {/if}
          </span>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onclick={() => (showOutput = false)}
          class="absolute top-2 right-2 h-6 w-6 p-0 select-none"
        >
          ×
        </Button>
      {/if}
      <div class="p-3">
        {#if isRunning}
          <div class="text-muted-foreground flex items-center gap-2 text-sm">
            <div
              class="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"
            ></div>
            {isPython ? 'Running Python code...' : 'Running...'}
          </div>
        {:else if output.trim() === ''}
          <div class="text-muted-foreground text-sm italic">No output</div>
        {:else}
          <div bind:this={outputRef} class="notebook-output-container"></div>
        {/if}
      </div>
    </div>
  {/if}
</div>
