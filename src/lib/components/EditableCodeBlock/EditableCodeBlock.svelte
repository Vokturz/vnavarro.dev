<script lang="ts">
  import { onMount, getContext } from 'svelte'
  import { browser } from '$app/environment'
  import { Check, Copy, Loader, LoaderCircle, Play, Square, StopCircle } from 'lucide-svelte'
  import { Button } from '$lib/components/ui/button'
  import { pyodideStore, executePython } from '$lib/pyodide-service'
  import type { Writable } from 'svelte/store'
  import { formatPythonOutput, generateFakeOutput } from './utils'

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
  let outputRef: HTMLElement | null = $state(null)
  let abortController: AbortController | null = $state(null)
  let jar: any
  let output = $state(initialOutput)
  let isRunning = $state(false)
  let showOutput = $state(initialOutput.length > 0)
  let hasUserExecuted = $state(false)
  let currentExecutionNumber = $state(executionNumber)
  let CodeJar: any
  let hljs: any

  const executionCounter = getContext<Writable<number>>('executionCounter')
  const isPython = $derived(language === 'python' || language === 'py')

  function handleKeyDown(event: KeyboardEvent) {
    if ((event.ctrlKey || event.metaKey) && event.key === 'Enter') {
      event.preventDefault()
      event.stopPropagation()
      runCode()
    }
  }

  onMount(async () => {
    if (browser && editorRef) {
      const [{ CodeJar: CJ }, hljsModule] = await Promise.all([
        import('codejar'),
        import('highlight.js')
      ])

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
        catchTab: !readonly,
        preserveIdent: true,
        addClosing: true,
        history: !readonly
      })

      jar.updateCode(code)

      if (!readonly) {
        jar.onUpdate((newCode: string) => {
          code = newCode
          onSave?.(newCode)
        })
        editorRef.addEventListener('keydown', handleKeyDown, { capture: true })
      } else {
        editorRef.setAttribute('contenteditable', 'false')
        editorRef.style.cursor = 'default'
      }
    }

    return () => {
      if (jar) {
        jar.destroy()
      }
      if (editorRef && !readonly) {
        editorRef.removeEventListener('keydown', handleKeyDown, { capture: true })
      }
    }
  })

  async function runCode() {
    if (isRunning || readonly) return

    if (abortController) {
      abortController.abort()
    }

    abortController = new AbortController()
    isRunning = true
    showOutput = true
    hasUserExecuted = true
    output = ''

    if (executionCounter) {
      executionCounter.update((n) => {
        currentExecutionNumber = n
        return n + 1
      })
    }

    try {
      if (onRun) {
        const result = await onRun(code)
        output = result
      } else if (isPython && $pyodideStore.ready) {
        const result = await executePython(
          code, 
          abortController,
          (streamingOutput) => {
            output = formatPythonOutput({ output: streamingOutput, error: null })
          }
        )
        output = formatPythonOutput({ output: result, error: null })
      } else if (isPython && !$pyodideStore.ready) {
        output =
          '<pre class="notebook-error-output">Python environment is not ready yet. Please wait for initialization to complete.</pre>'
      } else {
        await new Promise((resolve) => setTimeout(resolve, 1000))
        output = generateFakeOutput()
      }
    } catch (error) {
      if (error instanceof Error && error.message.includes('cancelled')) {
        output = '<pre class="notebook-error-output">Execution cancelled by user</pre>'
      } else {
        output = `<pre class="notebook-error-output">Error: ${error instanceof Error ? error.message : 'Unknown error occurred'}</pre>`
      }
    } finally {
      isRunning = false
      abortController = null
    }
  }

  $effect(() => {
    if (jar && initialCode !== code) {
      code = initialCode
      jar.updateCode(initialCode)
    }
  })

  $effect(() => {
    if (!hasUserExecuted) {
      output = initialOutput
      showOutput = initialOutput.length > 0
    }
  })

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

  function cancelExecution() {
    if (abortController) {
      abortController.abort()
    }
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
          onclick={!isRunning ? runCode : cancelExecution}
          disabled={isPython && !$pyodideStore.ready}
          title={isPython ? 'Run Python code (Ctrl+Enter)' : 'Run code (Ctrl+Enter)'}
          class={isPython && !$pyodideStore.ready ? 'opacity-50' : ''}
        >
          {#if isPython && $pyodideStore.loading}
            <span class="ml-1 text-xs">Loading...</span>
          {/if}
          {#if isRunning}
            <Square class="h-4 w-4" />
          {:else}
            <Play class="h-4 w-4" />
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
        {#if !isRunning}
          <Button
            variant="ghost"
            size="sm"
            onclick={() => (showOutput = false)}
            class="absolute top-2 right-2 h-6 w-6 p-0 select-none"
          >
            ×
          </Button>
        {/if}
      {/if}
      <div class="p-3">
        {#if isRunning}
          <div class="text-muted-foreground flex items-center gap-2 text-sm">
            <LoaderCircle class="h-4 w-4 animate-spin" />
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
