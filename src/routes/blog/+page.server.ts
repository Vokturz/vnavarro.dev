import matter from 'gray-matter'
import type { Post, JupyterNotebook } from '$lib/types'

export async function load() {
  // Use static/data/posts for both dev and prod for consistency
  const postFiles = import.meta.glob('/data/posts/*.{md,ipynb}', {
    query: '?raw',
    import: 'default'
  })

  const posts: Post[] = []

  for (const [filepath, getContent] of Object.entries(postFiles)) {
    const filename = filepath.split('/').pop()!
    const slug = filename.replace(/\.(md|ipynb)$/, '')
    const fileContent = await getContent()

    if (filename.endsWith('.ipynb')) {
      // Handle Jupyter notebook
      const notebook: JupyterNotebook = JSON.parse(fileContent as string)

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

      posts.push({
        slug,
        title: metadata.title,
        date: metadata.date,
        summary: metadata.summary,
        image: metadata.image
      })
    } else {
      // Handle Markdown file
      const { data } = matter(fileContent as string)

      posts.push({
        slug,
        title: data.title,
        date: data.date,
        summary: data.summary,
        image: data.image
      })
    }
  }

  const sortedPosts = posts.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

  return {
    posts: sortedPosts
  }
}
