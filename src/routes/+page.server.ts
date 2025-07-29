import matter from 'gray-matter'
import type { Post, JupyterNotebook, Project } from '$lib/types'

const postFiles = import.meta.glob('/data/posts/*.{md,ipynb}', {
  query: '?raw',
  import: 'default'
})

const projectFile = import.meta.glob('/data/projects.json', {
  query: '?raw',
  import: 'default'
})

export async function load() {
  const posts: Post[] = []

  for (const [filepath, getContent] of Object.entries(postFiles)) {
    const filename = filepath.split('/').pop()!
    const slug = filename.replace(/\.(md|ipynb)$/, '')
    const fileContent = await getContent()

    if (filename.endsWith('.ipynb')) {
      const notebook: JupyterNotebook = JSON.parse(fileContent as string)
      const firstMarkdownCell = notebook.cells.find((cell) => cell.cell_type === 'markdown')
      let metadata = {
        title: slug.replace(/-/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase()),
        date: new Date().toISOString().split('T')[0],
        summary: 'Jupyter notebook post',
        image: undefined
      }
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

  const projectFiles = Object.values(projectFile)

  if (projectFiles.length === 0) throw new Error('No project files found')
  const projectsRaw = await projectFiles[0]()
  const projects: Project[] = JSON.parse(projectsRaw as string)
  const featuredProjects = projects.filter((project) => project.featured)

  return {
    posts: sortedPosts.slice(0, 6),
    projects: featuredProjects
  }
}
