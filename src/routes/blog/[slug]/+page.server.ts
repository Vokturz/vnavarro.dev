import fs from 'fs'
import path from 'path'
import matter from 'gray-matter'
import { error } from '@sveltejs/kit'
import { Marked } from 'marked'
import hljs from 'highlight.js'
import { markedHighlight } from 'marked-highlight'
import type { PostWithContent } from '$lib/types'
import type { PageServerLoad } from './$types'

const marked = new Marked(
	markedHighlight({
		async: false,
		emptyLangClass: 'hljs',
		langPrefix: 'hljs language-',
		highlight(code, lang, info) {
			const language = hljs.getLanguage(lang) ? lang : 'plaintext'
			const highlighted = hljs.highlight(code, { language }).value
			return `
			<div class="border border-gray-300 rounded-md p-2">${highlighted}</div>`
		}
	})
)


export const load: PageServerLoad = async ({ params }) => {
	const { slug } = params
	const filepath = path.resolve(process.cwd(), `posts/${slug}.md`)

	if (!fs.existsSync(filepath)) {
		throw error(404, `The post '${slug}' was not found`)
	}

	const fileContent = fs.readFileSync(filepath, 'utf8')
	const { data, content } = matter(fileContent)

	const post: PostWithContent = {
		title: data.title,
		date: data.date,
		summary: data.summary,
		slug: slug,
		content: await marked.parse(content)
	}

	return {
		post
	}
}
