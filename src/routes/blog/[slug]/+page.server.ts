import fs from 'fs'
import path from 'path'
import matter from 'gray-matter'
import { error } from '@sveltejs/kit'
import type { PostWithContent } from '$lib/types'
import type { PageServerLoad } from './$types'
import { marked } from '$lib/markdown'

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
    image: data.image,
    content: await marked.parse(content)
  }

  return {
    post
  }
}
