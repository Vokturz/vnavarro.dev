import fs from 'fs'
import path from 'path'
import matter from 'gray-matter'
import { error } from '@sveltejs/kit'
import type { PostWithContent, JupyterNotebook } from '$lib/types'
import type { PageServerLoad } from './$types'
import { marked } from '$lib/markdown'
import { NotebookRenderer } from '$lib/notebook'

export const load: PageServerLoad = async ({ params }) => {
  const { slug } = params
  
  // Check for both .md and .ipynb files
  const markdownPath = path.resolve(process.cwd(), `posts/${slug}.md`)
  const notebookPath = path.resolve(process.cwd(), `posts/${slug}.ipynb`)
  
  let post: PostWithContent
  
  if (fs.existsSync(notebookPath)) {
    // Handle Jupyter notebook
    const notebookContent = fs.readFileSync(notebookPath, 'utf8')
    const notebook: JupyterNotebook = JSON.parse(notebookContent)
    
    // Extract metadata from first markdown cell or use defaults
    const firstMarkdownCell = notebook.cells.find(cell => cell.cell_type === 'markdown')
    let metadata = {
      title: slug.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
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
        } catch (e) {
          // Ignore frontmatter parsing errors
        }
      }
    }
    
    const content = await NotebookRenderer.renderNotebook(notebook)
    
    post = {
      title: metadata.title,
      date: metadata.date,
      summary: metadata.summary,
      slug: slug,
      image: metadata.image,
      type: 'notebook',
      content
    }
  } else if (fs.existsSync(markdownPath)) {
    // Handle Markdown file (existing logic)
    const fileContent = fs.readFileSync(markdownPath, 'utf8')
    const { data, content } = matter(fileContent)

    post = {
      title: data.title,
      date: data.date,
      summary: data.summary,
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
