<script lang="ts">
  /* eslint-disable @typescript-eslint/no-explicit-any */
  /* eslint svelte/no-at-html-tags: "off" */
  import { onMount, getContext } from 'svelte'
  import { browser } from '$app/environment'
  import { Check, Copy, LoaderCircle, Play, Square } from 'lucide-svelte'
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
    blockId,
    onNavigateNext
  }: {
    code: string
    language?: string
    initialOutput?: string
    onSave?: (newCode: string) => void
    onRun?: (code: string) => Promise<string> | string
    executionNumber?: number | null
    blockId?: string
    onNavigateNext?: () => void
  } = $props()

  let code = $state(initialCode)
  let copied = $state(false)
  let editorRef: HTMLElement
  let abortController: AbortController | null = $state(null)
  let jar: any
  let output = $state(initialOutput)
  let isRunning = $state(false)
  let showOutput = $state(initialOutput.length > 0)
  let hasUserExecuted = $state(false)
  let currentExecutionNumber = $state(executionNumber)
  const isPython = $derived(language === 'python' || language === 'py')
  let isReadOnly = $derived(!$pyodideStore.ready || !isPython)
  let CodeJar: any
  let hljs: any

  const executionCounter = getContext<Writable<number>>('executionCounter')

  function handleKeyDown(event: KeyboardEvent) {
    if ((event.ctrlKey || event.metaKey) && event.key === 'Enter') {
      event.preventDefault()
      event.stopPropagation()
      runCode()
    } else if (event.shiftKey && event.key === 'Enter') {
      event.preventDefault()
      event.stopPropagation()
      runCode()
      // Navigate to next code block and scroll
      setTimeout(() => {
        onNavigateNext?.()
        editorRef?.scrollIntoView({
          behavior: 'smooth',
          block: 'start'
        })
        setTimeout(() => {
          window.scrollBy({
            top: editorRef?.offsetHeight || 200,
            behavior: 'smooth'
          })
        }, 100)
      }, 100)
    }
  }

  onMount(() => {
    if (browser && editorRef) {
      Promise.all([import('codejar'), import('highlight.js')]).then(
        ([{ CodeJar: CJ }, hljsModule]) => {
          CodeJar = CJ
          hljs = hljsModule.default

          const highlight = (editor: HTMLElement) => {
            const code = editor.textContent || ''
            editor.innerHTML = hljs.highlight(code, { language }).value
          }

          jar = CodeJar(editorRef, highlight, {
            tab: '  ',
            indentOn: /[(\\[{:]$/,
            spellcheck: false,
            catchTab: false,
            preserveIdent: true,
            addClosing: true,
            history: true
          })

          jar.updateCode(code)
          jar.onUpdate((newCode: string) => {
            code = newCode
            onSave?.(newCode)
          })
          editorRef.removeEventListener('keydown', handleKeyDown, { capture: true })
          editorRef.setAttribute('contenteditable', 'false')
          editorRef.style.cursor = ''
        }
      )
    }

    // Cleanup function
    return () => {
      if (jar) {
        jar.destroy()
      }
      if (editorRef && !isReadOnly) {
        editorRef.removeEventListener('keydown', handleKeyDown, { capture: true })
      }
    }
  })

  // Reactive effect to handle editor behavior based on isReadOnly
  $effect(() => {
    if (editorRef) {
      if (!isReadOnly) {
        editorRef.addEventListener('keydown', handleKeyDown, { capture: true })
        editorRef.setAttribute('contenteditable', 'true')
      }
    }
  })

  async function runCode() {
    if (isRunning || isReadOnly) return

    if (abortController) {
      abortController.abort()
    }

    abortController = new AbortController()
    isRunning = true
    showOutput = true
    hasUserExecuted = true
    output = ''

    if ($executionCounter) {
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
        const result = await executePython(code, abortController, (streamingOutput) => {
          output = streamingOutput
        })
        output = result
      } else if (isPython && !$pyodideStore.ready) {
        output =
          '<pre class="notebook-error-output">Python environment is not ready yet. Please wait for initialization to complete.</pre>'
      } else {
        await new Promise((resolve) => setTimeout(resolve, 1000))
        output = `<pre class="notebook-output">Simulated output for ${language} code</pre>`
      }
    } catch (error) {
      if (error instanceof Error && error.message.includes('cancelled')) {
        output += '\n<pre class="notebook-error-output">Execution cancelled by user</pre>'
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

  // Expose focus method for navigation
  export function focus() {
    if (editorRef && !isReadOnly) {
      editorRef.focus()
      // Place cursor at the end of the content
      const range = document.createRange()
      const selection = window.getSelection()
      range.selectNodeContents(editorRef)
      range.collapse(false)
      selection?.removeAllRanges()
      selection?.addRange(range)
    }
  }
</script>

<div
  class="group relative my-2 {!isReadOnly ? 'pl-4' : 'pl-0'} transition-all duration-200 lg:pl-0"
  data-block-id={blockId}
>
  <div class="relative rounded-md border">
    {#if !isReadOnly}
      <div
        class="absolute top-0 bottom-0 left-[-3.8rem] flex w-17 items-start justify-center pt-3 select-none"
      >
        <span class="text-muted-foreground font-mono text-xs">
          {#if isRunning}
            In [*]
          {:else if currentExecutionNumber !== null}
            In [{currentExecutionNumber}]
          {:else}
            In []
          {/if}
        </span>
      </div>
    {/if}

    <div
      bind:this={editorRef}
      class="codejar-editor bg-muted/20 focus:ring-ring min-h-4 overflow-auto p-3 font-mono text-sm whitespace-pre transition-all duration-200 focus:ring-2 focus:outline-none {isReadOnly
        ? 'cursor-default'
        : ''}"
      contenteditable={!isReadOnly}
    >
      {#if !browser}
        <!-- Fallback content for SSR -->
        <pre class="bg-mutedwhitespace-pre-wrap m-0">{code}</pre>
      {/if}
    </div>

    {#if ($pyodideStore.loading || $pyodideStore.ready) && isPython}
      <div
        class="absolute top-2 right-2 flex gap-1 opacity-100 transition-opacity sm:opacity-0 sm:group-hover:opacity-100"
      >
        <Button
          variant="ghost"
          size="sm"
          onclick={!isRunning ? runCode : cancelExecution}
          disabled={isPython && $pyodideStore.loading}
          title={isPython ? 'Run Python code (Ctrl+Enter)' : 'Run code (Ctrl+Enter)'}
          class={isPython && $pyodideStore.loading ? 'opacity-10' : ''}
        >
          {#if isRunning}
            <Square class="h-4 w-4" />
          {:else}
            <Play class="h-4 w-4" />
          {/if}
        </Button>
      </div>
    {:else}
      <div
        class="bg-muted text-muted-foreground pointer-events-none absolute right-0 bottom-0 rounded-tl rounded-br px-2 py-1 text-xs select-none"
      >
        {language}
      </div>
    {/if}

    <Button
      variant="ghost"
      size="sm"
      class="absolute top-2 {($pyodideStore.loading || $pyodideStore.ready) && isPython
        ? 'right-12'
        : 'right-2'} opacity-100 transition-opacity sm:opacity-0 sm:group-hover:opacity-100"
      onclick={copyCode}
    >
      {#if copied}
        <Check class="h-4 w-4" />
      {:else}
        <Copy class="h-4 w-4" />
      {/if}
    </Button>
  </div>

  {#if showOutput}
    <div class="bg-muted/50 relative mt-2 max-h-150 min-h-8 rounded-md border">
      {#if !isReadOnly}
        <div
          class="absolute top-0 bottom-0 left-[-4.3rem] flex w-19 items-start justify-center pt-3 select-none"
        >
          <span class="text-muted-foreground font-mono text-xs">
            {#if isRunning}
              Out [*]
            {:else if currentExecutionNumber !== null}
              Out [{currentExecutionNumber}]
            {:else}
              Out []
            {/if}
          </span>
        </div>
        {#if !isRunning && $pyodideStore.ready}
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
      <div class="max-h-150 overflow-y-auto p-3">
        <div class="notebook-output-container">
          {@html output}
        </div>
        {#if isRunning}
          <div
            class="text-muted-foreground absolute right-4 bottom-1 flex items-center gap-2 text-sm"
          >
            <LoaderCircle class="h-4 w-4 animate-spin" />
            Running...
          </div>
        {/if}
      </div>
    </div>
  {/if}
</div>
