import type { Project } from '$lib/types'

const projectFile = import.meta.glob('/data/projects.json', {
  query: '?raw',
  import: 'default'
})

export async function load() {
  const projectFiles = Object.values(projectFile)

  if (projectFiles.length === 0) throw new Error('No project files found')
  const projectsRaw = await projectFiles[0]()
  const projects: Project[] = JSON.parse(projectsRaw as string)
  const featuredProjects = projects.filter((project) => project.featured)

  return {
    projects: featuredProjects
  }
}
