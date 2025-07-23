import fs from 'fs'
import path from 'path'
import matter from 'gray-matter'
import type { Post, JupyterNotebook } from '$lib/types'

export async function load() {
  const isDev = process.env.NODE_ENV === 'development' || import.meta.env.MODE === 'development'
  const postsDir = isDev ? path.resolve('posts') : path.resolve('static', 'posts')
  const files = fs.readdirSync(postsDir)

  const posts: Post[] = files.map((filename) => {
    const slug = filename.replace(/\.(md|ipynb)$/, '')
    const filepath = path.join(postsDir, filename)

    if (filename.endsWith('.ipynb')) {
      // Handle Jupyter notebook
      const notebookContent = fs.readFileSync(filepath, 'utf8')
      const notebook: JupyterNotebook = JSON.parse(notebookContent)

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

      return {
        slug,
        title: metadata.title,
        date: metadata.date,
        summary: metadata.summary,
        image: metadata.image
      }
    } else {
      // Handle Markdown file
      const fileContent = fs.readFileSync(filepath, 'utf8')
      const { data } = matter(fileContent)

      return {
        slug,
        title: data.title,
        date: data.date,
        summary: data.summary,
        image: data.image
      }
    }
  })

  const sortedPosts = posts.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

  return {
    posts: sortedPosts
  }
}
