<script lang="ts">
  import type { PostWithContent } from '$lib/types'
  import { Button } from '$lib/components/ui/button'
  import * as Alert from "$lib/components/ui/alert/index.js"
  import { ArrowLeft, Check, Edit, LoaderCircle, X } from 'lucide-svelte'
  import { onDestroy, onMount, setContext } from 'svelte'
  import { transformCodeBlocks } from '$lib/code-block'
  import { writable } from 'svelte/store'
  import TechIcon from '$lib/components/TechIcon.svelte'
  import { pyodideStore, initializePyodide, resetPyodide } from '$lib/pyodide-service'

  const { data } : { data : {post: PostWithContent }} = $props()
  const { post } = data

  const executionCounter = writable(1)
  setContext('executionCounter', executionCounter)

  let showPyodideNotification = $state(false)

  onMount(() => {
    transformCodeBlocks(data.post.runnable)
    
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
      <Alert.Title>Failed to load Python: {$pyodideStore.error}...</Alert.Title>
    </Alert.Root>
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
    <h1 class="text-4xl font-extrabold tracking-tight lg:text-5xl">{post.title}</h1>
  </div>

  <div class="prose prose-slate dark:prose-invert mx-auto max-w-3xl">
    {@html post.content}
  </div>
</article>
