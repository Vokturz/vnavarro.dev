import matter from 'gray-matter'
import { error } from '@sveltejs/kit'
import type { PostWithContent, JupyterNotebook } from '$lib/types'
import type { PageServerLoad } from './$types'
import { marked } from '$lib/markdown'
import { NotebookRenderer } from '$lib/notebook'

const markdownFiles = import.meta.glob('/posts/*.md', { query: '?raw', import: 'default' })
const notebookFiles = import.meta.glob('/posts/*.ipynb', {
  query: '?raw',
  import: 'default'
})

export const load: PageServerLoad = async ({ params }) => {
  const { slug } = params

  const markdownPath = `/posts/${slug}.md`
  const notebookPath = `/posts/${slug}.ipynb`

  let post: PostWithContent

  if (notebookFiles[notebookPath]) {
    // Handle Jupyter notebook
    const notebookContent = await notebookFiles[notebookPath]()
    const notebook: JupyterNotebook = JSON.parse(notebookContent as string)

    // Extract metadata from first markdown cell or use defaults
    const firstMarkdownCell = notebook.cells.find((cell) => cell.cell_type === 'markdown')
    let metadata = {
      title: slug.replace(/-/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase()),
      date: new Date().toISOString().split('T')[0],
      summary: 'Jupyter notebook post',
      image: undefined
    }

    // Try to parse frontmatter from first markdown cell
    if (firstMarkdownCell) {
      const cellSource = Array.isArray(firstMarkdownCell.source)
        ? firstMarkdownCell.source.join('')
        : firstMarkdownCell.source

      if (cellSource.startsWith('---')) {
        try {
          const { data } = matter(cellSource)
          metadata = { ...metadata, ...data }
        } catch {
          // Ignore frontmatter parsing errors
        }
      }
    }

    const content = await NotebookRenderer.renderNotebook(notebook)

    post = {
      title: metadata.title,
      date: metadata.date,
      summary: metadata.summary,
      runnable: true,
      slug: slug,
      image: metadata.image,
      type: 'notebook',
      content
    }
  } else if (markdownFiles[markdownPath]) {
    // Handle Markdown file
    const fileContent = await markdownFiles[markdownPath]()
    const { data, content } = matter(fileContent as string)

    post = {
      title: data.title,
      date: data.date,
      summary: data.summary,
      runnable: data.runnable,
      slug: slug,
      image: data.image,
      type: 'markdown',
      content: await marked.parse(content)
    }
  } else {
    throw error(404, `The post '${slug}' was not found`)
  }

  return {
    post
  }
}
