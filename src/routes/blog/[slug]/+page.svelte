<!-- src/routes/blog/[slug]/+page.svelte -->
<script lang="ts">
  import type { PostWithContent } from '$lib/types'
  import { Button } from '$lib/components/ui/button'
  import { ArrowLeft } from 'lucide-svelte'
  import { onMount } from 'svelte'
  import { transformCodeBlocks } from '$lib/code-block'

  export let data: { post: PostWithContent }

  onMount(() => {
    transformCodeBlocks()
  })
</script>

<svelte:head>
  <title>{data.post.title}</title>
  <meta name="description" content={data.post.summary} />
</svelte:head>

<article>
  <div class="mb-8">
    <a href="/blog" class="inline-flex items-center">
      <Button variant="ghost" size="sm">
        <ArrowLeft class="mr-2 h-4 w-4" />
        Back to all posts
      </Button>
    </a>
  </div>

  <div class="mb-8 text-center">
    <p class="text-muted-foreground mb-2 text-sm">
      {new Date(data.post.date).toLocaleDateString('en-IE', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      })}
    </p>
    <h1 class="text-4xl font-extrabold tracking-tight lg:text-5xl">{data.post.title}</h1>
  </div>

  <div class="prose prose-slate dark:prose-invert mx-auto max-w-3xl">
    {@html data.post.content}
  </div>
</article>
