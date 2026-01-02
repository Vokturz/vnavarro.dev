<script lang="ts">
  import type { Post } from '$lib/types'
  import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle
  } from '$lib/components/ui/card'
  import { Button } from '$lib/components/ui/button'
  import { ArrowRight } from 'lucide-svelte'
  // import TechIcon from './TechIcon.svelte'

  interface Props {
    post: Post
    class?: string
  }

  let { post, class: className }: Props = $props()
</script>

<a href={`/blog/${post.slug}`}>
  <Card class="card-hover flex h-full flex-col rounded-sm {className}">
    <CardHeader>
      <CardTitle>
        <div class="flex items-center">
          <!-- {#if post.icon}
            <TechIcon name={post.icon} class="mr-1 h-4 w-4" />
          {/if} -->
          {post.title}
        </div>
      </CardTitle>
      <CardDescription>{new Date(post.date).toDateString()}</CardDescription>
    </CardHeader>
    <CardContent class="flex-grow">
      <p>{post.summary}</p>
    </CardContent>
    <CardFooter>
      <Button variant="link" class="h-auto p-0">
        Read more <ArrowRight class="ml-2 h-4 w-4" />
      </Button>
    </CardFooter>
  </Card>
</a>
