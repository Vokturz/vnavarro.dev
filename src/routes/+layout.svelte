<script lang="ts">
	import '../app.css'
	import Header from '$lib/components/Header.svelte'
</script>

<div class="bg-background text-foreground min-h-screen font-sans antialiased">
	<Header />
	<main class="container mx-auto max-w-4xl px-4 py-8">
		<slot />
	</main>
</div>

<style>
</style>
