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
      <Badge variant="secondary" class="px-4 py-2 text-lg">
        {status === 404 ? 'Page Not Found' : 'Error'}
      </Badge>
      <p class="text-muted-foreground mx-auto mt-8 max-w-2xl text-xl">
        {#if status === 404}
          The page you're looking for doesn't exist. It might have been moved, deleted, or you
          entered the wrong URL.
        {:else if error?.message}
          {error.message}
        {:else}
          Something went wrong. Please try again later.
        {/if}
      </p>

      <div class="mt-12">
        <a
          href="/"
          class="bg-primary hover:bg-primary/90 inline-flex items-center rounded-md px-6 py-3 text-base font-medium text-white transition-colors"
        >
          ← Back to Home
        </a>
      </div>
    </section>
  </main>
</div>
