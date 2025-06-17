import fs from 'fs'
import path from 'path'
import matter from 'gray-matter'
import type { Post } from '$lib/types'

export async function load() {
	const postsDir = path.resolve(process.cwd(), 'posts')
	const files = fs.readdirSync(postsDir)

	const posts: Post[] = files.map((filename) => {
		const slug = filename.replace('.md', '')
		const filepath = path.join(postsDir, filename)
		const fileContent = fs.readFileSync(filepath, 'utf8')
		const { data } = matter(fileContent)

		return {
			slug,
			title: data.title,
			date: data.date,
			summary: data.summary
		}
	})

	const sortedPosts = posts.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

	return {
		posts: sortedPosts.slice(0, 5)
	}
}
