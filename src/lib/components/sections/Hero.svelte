<script lang="ts">
  import { Button } from '$lib/components/ui/button'
</script>

<header class="relative overflow-hidden">
  <div class="mx-auto max-w-7xl px-4 py-24 text-center sm:px-6 sm:py-32 lg:px-8">
    <h1 class="mb-6 flex flex-col items-center font-extrabold">
      <div class="text-nowrap">
        <span class="text-secondary mr-2 text-4xl md:text-6xl">Víctor Navarro</span>
      </div>
      <span class="text-2xl md:text-4xl">vnavarro.dev</span>
    </h1>

    <div class="mt-2 flex flex-col">
      <div class="flex justify-center">
        <Button size="lg">
          <a href="/#about">Learn About Me</a>
        </Button>
      </div>
      <div class="mt-2 flex justify-center space-x-4">
        <Button size="lg" variant="outline" class="w-32">
          <a href="/blog">Read My Blog</a>
        </Button>
        <Button size="lg" variant="outline" class="w-32">
          <a href="/projects">See my Projects</a>
        </Button>
      </div>
    </div>
  </div>
</header>
