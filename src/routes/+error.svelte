<script lang="ts">
  import { page } from '$app/state'
  import { Badge } from '$lib/components/ui/badge'
  const { status, error } = page
</script>

<div class="star-bg">
  <main>
    <section class="mx-auto max-w-4xl px-4 py-20 text-center sm:px-6 lg:px-8">
      <h1 class="gradient-text text-6xl font-extrabold sm:text-8xl">{status}</h1>
      <div class="bg-primary mx-auto my-4 h-1 w-20 rounded-full"></div>
      <Badge variant="secondary" class="text-lg px-4 py-2">
        {status === 404 ? 'Page Not Found' : 'Error'}
      </Badge>
      <p class="text-muted-foreground mt-8 text-xl max-w-2xl mx-auto">
        {#if status === 404}
          The page you're looking for doesn't exist. It might have been moved, deleted, or you entered the wrong URL.
        {:else if error?.message}
          {error.message}
        {:else}
          Something went wrong. Please try again later.
        {/if}
      </p>
      
      <div class="mt-12">
        <a 
          href="/" 
          class="inline-flex items-center px-6 py-3  text-base font-medium rounded-md text-white bg-primary hover:bg-primary/90 transition-colors"
        >
          ← Back to Home
        </a>
      </div>
    </section>
  </main>
</div>
