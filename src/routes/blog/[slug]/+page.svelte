<script lang="ts">
  import type { PostWithContent } from '$lib/types'
  import { Button } from '$lib/components/ui/button'
  import { ArrowLeft, Edit } from 'lucide-svelte'
  import { onMount } from 'svelte'
  import { transformCodeBlocks } from '$lib/code-block'

  const { data } : { data : {post: PostWithContent }} = $props()
  const { post } = data

  onMount(() => {
    transformCodeBlocks()
  })

  const editUrl = $derived(`https://github.com/Vokturz/vnavarro.dev/edit/main/posts/${post.slug}.md`)
</script>

<svelte:head>
  <title>{post.title}</title>
  <meta name="description" content={post.summary} />
</svelte:head>

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
        <Edit class="mr-2 h-3 w-3" />
        Edit
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
