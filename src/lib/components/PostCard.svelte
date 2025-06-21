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

	export let post: Post
</script>

<a href={`/blog/${post.slug}`}>
	<Card class="card-hover flex h-full flex-col">
		<CardHeader>
			<CardTitle>{post.title}</CardTitle>
			<CardDescription>{new Date(post.date).toLocaleDateString()}</CardDescription>
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
