<script lang="ts">
  import { Button } from '$lib/components/ui/button'
</script>

<header class="relative overflow-hidden">
  <div class="mx-auto max-w-7xl px-4 py-24 text-center sm:px-6 sm:py-32 lg:px-8">
    <h1 class="mb-6 flex flex-col items-center font-extrabold">
      <span class="gradient-text text-4xl md:text-6xl">vnavarro.dev</span>
      <span class="typewriter text-3xl md:text-5xl">Developer & Astronomer</span>
    </h1>

    <div class="mt-10 flex justify-center space-x-4">
      <Button size="lg">
        <a href="/#about">Learn About Me</a>
      </Button>
      <Button size="lg" variant="secondary">
        <a href="/blog">Read My Blog</a>
      </Button>
    </div>
  </div>
</header>
