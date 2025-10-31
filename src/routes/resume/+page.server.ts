import type { Project } from '$lib/types'
import type {
  Publications,
  Skills,
  TeachingExperience,
  Education,
  Experience,
  Summaries
} from '$lib/types/resume'

const publicationsFile = import.meta.glob('/data/resume/publications.json', {
  query: '?raw',
  import: 'default'
})

const skillsFile = import.meta.glob('/data/resume/skills.json', {
  query: '?raw',
  import: 'default'
})

const teachingFile = import.meta.glob('/data/resume/teaching.json', {
  query: '?raw',
  import: 'default'
})

const educationFile = import.meta.glob('/data/resume/education.json', {
  query: '?raw',
  import: 'default'
})

const experienceFile = import.meta.glob('/data/resume/experience.json', {
  query: '?raw',
  import: 'default'
})

const projectsFile = import.meta.glob('/data/projects.json', {
  query: '?raw',
  import: 'default'
})

const summariesFile = import.meta.glob('/data/resume/summaries.json', {
  query: '?raw',
  import: 'default'
})

export async function load() {
  const publicationFiles = Object.values(publicationsFile)
  const skillFiles = Object.values(skillsFile)
  const teachingFiles = Object.values(teachingFile)
  const educationFiles = Object.values(educationFile)
  const experienceFiles = Object.values(experienceFile)
  const projectsFiles = Object.values(projectsFile)
  const summariesFiles = Object.values(summariesFile)

  if (publicationFiles.length === 0) throw new Error('No publication files found')
  if (skillFiles.length === 0) throw new Error('No skill files found')
  if (teachingFiles.length === 0) throw new Error('No teaching files found')
  if (educationFiles.length === 0) throw new Error('No education files found')
  if (experienceFiles.length === 0) throw new Error('No experience files found')
  if (projectsFiles.length === 0) throw new Error('No projects files found')
  if (summariesFiles.length === 0) throw new Error('No summaries files found')

  const publicationsRaw = await publicationFiles[0]()
  const skillsRaw = await skillFiles[0]()
  const teachingRaw = await teachingFiles[0]()
  const educationRaw = await educationFiles[0]()
  const experienceRaw = await experienceFiles[0]()
  const projectsRaw = await projectsFiles[0]()
  const summariesRaw = await summariesFiles[0]()

  const publications: Publications[] = JSON.parse(publicationsRaw as string)
  const skills: Skills = JSON.parse(skillsRaw as string)
  const teaching: TeachingExperience[] = JSON.parse(teachingRaw as string)
  const education: Education[] = JSON.parse(educationRaw as string)
  const experience: Experience[] = JSON.parse(experienceRaw as string)
  const projects: Project[] = JSON.parse(projectsRaw as string)
  const summaries: Summaries = JSON.parse(summariesRaw as string)

  publications.sort((a, b) => b.year - a.year)
  education.sort((a, b) => b.year - a.year)

  return {
    publications,
    skills,
    teaching,
    education,
    experience,
    projects,
    summaries
  }
}
