<script lang="ts">
  import '../app.css'
  import '../terminal.css'
  import Header from '$lib/components/layout/Header.svelte'
  import Footer from '$lib/components/layout/Footer.svelte'
</script>

<svelte:head>
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/katex@0.16.9/dist/katex.min.css">
</svelte:head>


<div class="text-foreground flex min-h-screen flex-col font-sans antialiased">
  <Header />
  <main class="container mx-auto max-w-5xl flex-grow px-4 py-8">
    <slot />
  </main>
  <Footer />
</div>

<style>
</style>
