<script lang="ts">
  import type { PostWithContent } from '$lib/types'
  import { Button } from '$lib/components/ui/button'
  import * as Alert from "$lib/components/ui/alert/index.js"
  import { ArrowLeft, Check, Edit, LoaderCircle, X, Menu, List } from 'lucide-svelte'
  import { onDestroy, onMount, setContext } from 'svelte'
  import { transformCodeBlocks } from '$lib/code-block'
  import { writable } from 'svelte/store'
  import { fly } from 'svelte/transition'
  import TechIcon from '$lib/components/TechIcon.svelte'
  import { pyodideStore, initializePyodide, resetPyodide } from '$lib/pyodide-service'
  import TableOfContents from '$lib/components/TableOfContents.svelte'
  import { extractHeadings, addIdsToHeadings, type TocItem } from '$lib/toc'

  const { data } : { data : {post: PostWithContent }} = $props()
  const { post } = data

  const executionCounter = writable(1)
  setContext('executionCounter', executionCounter)

  let showPyodideNotification = $state(false)
  let tocItems: TocItem[] = $state([])
  let showMobileToc = $state(false)

  onMount(() => {
    // Process content to add IDs to headings and extract TOC
    tocItems = extractHeadings(post.content)
    transformCodeBlocks(data.post.runnable)
    addIdsToHeadings()
    
    if (post.runnable) {
      // Initialize pyodide and show notification when ready
      initializePyodide().then(() => {
        showPyodideNotification = true
        // Auto-hide notification after 3 seconds
        setTimeout(() => {
          showPyodideNotification = false
        }, 3000)
      }).catch(error => {
        console.error('Failed to initialize Pyodide:', error)
        setTimeout(() => {
          showPyodideNotification = false
        }, 3000)
      })
    }

    onDestroy(() => {
      if (post.runnable) {
        resetPyodide()
      }
    })
  })

  const editUrl = $derived(post.type === 'markdown'
    ? `https://github.com/Vokturz/vnavarro.dev/edit/main/posts/${post.slug}.md`
    : `https://github.com/Vokturz/vnavarro.dev/blob/main/posts/${post.slug}.ipynb`)

  function toggleMobileToc() {
    showMobileToc = !showMobileToc
  }
</script>

<svelte:head>
  <title>{post.title}</title>
  <meta name="description" content={post.summary} />
</svelte:head>

<!-- Pyodide Ready Notification -->
{#if showPyodideNotification}
<div class="fixed bottom-4 right-4 z-50">
    <Alert.Root class="bg-green-500 text-white font-bold">
      <Check class="h-5 w-5" />
      <Alert.Title>Python environment ready!</Alert.Title>
    </Alert.Root>
  </div>
{/if}

<!-- Loading indicator for pyodide -->
{#if $pyodideStore.loading}
  <div class="fixed bottom-4 right-4 z-50">
    <Alert.Root class="bg-blue-500 text-white">
      <LoaderCircle class="animate-spin h-5 w-5" />
      <Alert.Title>Loading Python environment...</Alert.Title>
    </Alert.Root>
  </div>
{/if}

<!-- Error notification for pyodide -->
{#if $pyodideStore.error}
  <div class="fixed bottom-4 right-4 z-50">
    <Alert.Root class="bg-red-500">
      <X class="h-5 w-5 text-white" />
      <Alert.Title>Failed to load Python: See console for details</Alert.Title>
    </Alert.Root>
  </div>
{/if}

<!-- Mobile TOC Toggle Button -->
<div class="2xl:hidden fixed top-18 left-4 z-40">
  <Button variant="outline" size="sm" onclick={toggleMobileToc}>
    <List class="h-4 w-4" />
    <span class="ml-2 hidden md:inline">Table of Contents</span>
  </Button>
</div>

<!-- Mobile TOC Overlay -->
{#if showMobileToc}
  <button 
    type="button"
    class="fixed inset-0 z-30 bg-black/50" 
    onclick={toggleMobileToc}
    onkeydown={e => e.key === 'Escape' && toggleMobileToc()}
    aria-label="Close table of contents overlay">
  </button>
  <div 
    class="2xl:hidden fixed top-0 left-0 h-full w-80 bg-background border-r z-40 p-4 overflow-y-auto transform transition-transform duration-300 ease-in-out"
    style="transform: translateX(0);"
    in:fly="{{ x: -320, duration: 300 }}"
    out:fly="{{ x: -320, duration: 150 }}">
    <div class="flex justify-between items-center mb-4">
      <h3 class="font-semibold">Table of Contents</h3>
      <Button variant="ghost" size="sm" onclick={toggleMobileToc}>
        <X class="h-4 w-4" />
      </Button>
    </div>
    <TableOfContents items={tocItems} onClick={toggleMobileToc} />
  </div>
{/if}
<article>
  <div class="mb-8 flex justify-between items-center">
    <a href="/blog" class="inline-flex items-center">
      <Button variant="ghost" size="sm">
        <ArrowLeft class="mr-2 h-4 w-4" />
        Back to all posts
      </Button>
    </a>
    
    <a href={editUrl} target="_blank" rel="noopener noreferrer" class="inline-flex items-center opacity-50 hover:opacity-100 transition-opacity">
      <Button variant="ghost" size="sm" class="text-muted-foreground">
        {#if post.type === 'markdown'}
          <Edit class="mr-2 h-3 w-3" />
          Edit on Github
        {:else} <!-- Is a jupyter notebook-->
         <TechIcon name="jupyter" class="h-3 w-3" />
          View on GitHub
        {/if}
      </Button>
    </a>
  </div>

  <div class="mb-8 text-center">
    <p class="text-muted-foreground mb-2 text-sm">
      {new Date(post.date).toLocaleDateString('en-IE', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      })}
    </p>
    <h1 class="text-3xl font-extrabold tracking-tight lg:text-5xl">{post.title.replace(/_/g, ' ')}</h1>
  </div>

  <div class="relative">
    <aside class="hidden 2xl:block fixed left-2 2xl:left-12 4xl:left-16 top-1/2 -translate-y-1/2 w-64 max-h-[70vh] overflow-y-auto">
      <div class="p-4 bg-muted/30 rounded-lg">
        <TableOfContents items={tocItems} />
      </div>
    </aside>
    
      <div class="prose prose-slate dark:prose-invert">
        {@html post.content}
      </div>
    </div>
</article>
