import { error } from '@sveltejs/kit'
import type { RequestHandler } from './$types'
import type {
  Publications,
  Skills,
  TeachingExperience,
  Education,
  Experience,
  Summaries,
  Awards
} from '$lib/types/resume'
import type { Project } from '$lib/types'

// Helper function to escape LaTeX special characters
function escapeLatex(text: string): string {
  return text
    .replace(/\\/g, '\\textbackslash{}')
    .replace(/[{}]/g, '\\$&')
    .replace(/[$&%#^_]/g, '\\$&')
    .replace(/~/g, '\\textasciitilde{}')
}

// Helper function to convert markdown-style formatting to LaTeX
function convertMarkdownToLatex(text: string): string {
  // Escape LaTeX first
  const escaped = escapeLatex(text)

  // Then restore special formatting
  const converted = escaped
    .replace(/\*\*(.*?)\*\*/g, '$1')
    .replace(/\*(.*?)\*/g, '\\textit{$1}')
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '\\href{$2}{$1}')

  return converted
}

// Helper function to format author names with highlighting
function formatAuthors(authors: string): string {
  return escapeLatex(authors)
    .replace(/(V\. Navarro-Aranguiz)/g, '\\textit{$1}')
    .replace(/(V\. Navarro)/g, '\\textit{$1}')
}

function generateLatexResume(data: {
  publications: Publications[]
  skills: Skills
  teaching: TeachingExperience[]
  education: Education[]
  experience: Experience[]
  projects: Project[]
  summaries: Summaries
  awards: Awards[]
}, isEs: boolean): string {
  const t = isEs ? {
    education: 'Educación',
    experience: 'Experiencia Profesional',
    publications: 'Publicaciones',
    awards: 'Honores y Premios',
    teaching: 'Experiencia Docente',
    projects: 'Proyectos Personales',
    skills: 'Habilidades Técnicas'
  } : {
    education: 'Education',
    experience: 'Professional Experience',
    publications: 'Publications',
    awards: 'Honors and Awards',
    teaching: 'Teaching Experience',
    projects: 'Personal Projects',
    skills: 'Technical Skills'
  }
  const latex = `\\documentclass[11pt,letterpaper]{article}

% Essential packages
\\usepackage[utf8]{inputenc}
\\usepackage[T1]{fontenc}
\\usepackage{lmodern}
\\usepackage[margin=0.8in,top=0.6in]{geometry}
\\usepackage{enumitem}
\\usepackage{titlesec}
\\usepackage{hyperref}

% Remove page numbers
\\pagestyle{empty}

% Custom section formatting
\\titleformat{\\section}{\\large\\bfseries}{}{0em}{}[\\titlerule]
\\titlespacing*{\\section}{0pt}{4pt}{5pt}

% Custom subsection formatting
\\titleformat{\\subsection}{\\normalsize\\bfseries}{}{0em}{}
\\titlespacing*{\\subsection}{0pt}{8pt}{3pt}

% Hyperref setup
\\hypersetup{
    colorlinks=true,
    linkcolor=black,
    filecolor=black,
    urlcolor=blue,
}

% Custom commands
\\newcommand{\\cventry}[6]{%
  \\noindent\\textbf{#2}\\hfill #1\\\\
  \\textit{#3}\\\\
  \\ifx\\relax#6\\relax
  \\else
    #6\\\\
  \\fi
  \\vspace{-0.9em}
}

\\newcommand{\\cvitem}[2]{%
  \\noindent\\textbf{#1:} #2\\\\[0.2em]
}

\\begin{document}

% Header
\\begin{center}
{\\LARGE \\textbf{Víctor Navarro Aránguiz}}\\\\[0.3em]
vnavarroaranguiz@gmail.com | \\url{https://vnavarro.dev}
\\end{center}
\\vspace{-1.5em}

% 1. Education
\\section{${t.education}}
${data.education
  .map(
    (edu) =>
      `\\cventry{${edu.year}}{${escapeLatex(edu.degree)}}{${escapeLatex(edu.institution)}}{}{}{${edu.description ? convertMarkdownToLatex(edu.description) : '\\relax'}}`
  )
  .join('\n\n')}

% 2. Professional Experience
\\section{${t.experience}}
${data.experience
  .map((exp) => {
    return `\\cventry{${exp.period}}{${escapeLatex(exp.title)}}{${escapeLatex(exp.company)}}{}{}{${convertMarkdownToLatex(exp.summary || '')}}`
  })
  .join('\n\n')}


% 3. Publications
\\section{${t.publications}}
\\begin{enumerate}[leftmargin=*, itemsep=0ex]
${data.publications
  .map((pub) => {
    const authors = formatAuthors(pub.authors)
    const title = escapeLatex(pub.title)
    const journal = escapeLatex(pub.journal)
    const other = escapeLatex(pub.other)

    return `\\item ${authors} (${pub.year}). \\href{${pub.href}}{${title}}. \\textit{${journal}}, ${other}.`
  })
  .join('\n')}
\\end{enumerate}

% 4. Honors and Awards
\\section{${t.awards}}
${data.awards
  .map((award) => {
    return `\\cventry{${award.period}}{${escapeLatex(award.title)}}{${escapeLatex(award.organization)}}{}{}{${escapeLatex(award.description)}}`
  })
  .join('\n\n')}
\\vspace{0.2em}


% 5. Teaching Experience
\\section{${t.teaching}}
${data.teaching
  .map((teach) => {
    return `\\cventry{${teach.period}}{${escapeLatex(teach.title)}}{${escapeLatex(teach.institution)}}{}{}{%
${teach.description}
}`
  })
  .join('\n\n')}

% 6. Personal Projects
\\section{${t.projects}}
${data.projects
  .filter((project) => project.featured && project.latexDescription)
  .map((project) => {
    // const technologies = project.technologies.join(', ')
    const description = convertMarkdownToLatex(project.latexDescription ?? '')

    let linkText = ''
    if (project.githubUrl) {
      linkText = `\\href{${project.githubUrl}}{GitHub}`
    } else if (project.hfUrl) {
      linkText = `\\href{${project.hfUrl}}{Hugging Face}`
    } else if (project.liveUrl) {
      linkText = `\\href{${project.liveUrl}}{Live}`
    }

    return `\\noindent\\textbf{${escapeLatex(project.title)}} | ${linkText}\\\\[0.1em]
{${description}}\\vspace{0.4em}
`
  })
  .join('\n\n')}

% 7. Technical Skills
% \\section{${t.skills}}
${Object.entries(data.skills)
  .map(
    ([category, skills]) =>
      `% \\cvitem{${escapeLatex(category)}}{${skills.map((skill) => escapeLatex(skill.name)).join(', ')}}`
  )
  .join('\n')}

\\end{document}`

  return latex
}

// Import English resume data files
const publicationsEnFile = import.meta.glob('/data/resume/publications.json', { query: '?raw', import: 'default' })
const skillsEnFile = import.meta.glob('/data/resume/skills.json', { query: '?raw', import: 'default' })
const teachingEnFile = import.meta.glob('/data/resume/teaching.json', { query: '?raw', import: 'default' })
const educationEnFile = import.meta.glob('/data/resume/education.json', { query: '?raw', import: 'default' })
const experienceEnFile = import.meta.glob('/data/resume/experience.json', { query: '?raw', import: 'default' })
const projectsEnFile = import.meta.glob('/data/projects.json', { query: '?raw', import: 'default' })
const summariesEnFile = import.meta.glob('/data/resume/summaries.json', { query: '?raw', import: 'default' })
const awardsEnFile = import.meta.glob('/data/resume/awards.json', { query: '?raw', import: 'default' })

// Import Spanish resume data files
const publicationsEsFile = import.meta.glob('/data/resume/publications_es.json', { query: '?raw', import: 'default' })
const skillsEsFile = import.meta.glob('/data/resume/skills_es.json', { query: '?raw', import: 'default' })
const teachingEsFile = import.meta.glob('/data/resume/teaching_es.json', { query: '?raw', import: 'default' })
const educationEsFile = import.meta.glob('/data/resume/education_es.json', { query: '?raw', import: 'default' })
const experienceEsFile = import.meta.glob('/data/resume/experience_es.json', { query: '?raw', import: 'default' })
const projectsEsFile = import.meta.glob('/data/projects_es.json', { query: '?raw', import: 'default' })
const summariesEsFile = import.meta.glob('/data/resume/summaries_es.json', { query: '?raw', import: 'default' })
const awardsEsFile = import.meta.glob('/data/resume/awards_es.json', { query: '?raw', import: 'default' })

export const POST: RequestHandler = async ({ request }) => {
  try {
    const requestData = await request.json()

    if (!requestData.data) {
      throw error(400, 'Missing resume data')
    }

    const language = requestData.language || 'EN'
    const isEs = language === 'ES'

    const pubFiles = isEs ? Object.values(publicationsEsFile) : Object.values(publicationsEnFile)
    const skillFiles = isEs ? Object.values(skillsEsFile) : Object.values(skillsEnFile)
    const teachFiles = isEs ? Object.values(teachingEsFile) : Object.values(teachingEnFile)
    const eduFiles = isEs ? Object.values(educationEsFile) : Object.values(educationEnFile)
    const expFiles = isEs ? Object.values(experienceEsFile) : Object.values(experienceEnFile)
    const projFiles = isEs ? Object.values(projectsEsFile) : Object.values(projectsEnFile)
    const sumFiles = isEs ? Object.values(summariesEsFile) : Object.values(summariesEnFile)
    const awdFiles = isEs ? Object.values(awardsEsFile) : Object.values(awardsEnFile)

    if (pubFiles.length === 0) throw error(400, `Missing ${isEs ? 'Spanish' : 'English'} publication files`)
    if (skillFiles.length === 0) throw error(400, `Missing ${isEs ? 'Spanish' : 'English'} skill files`)
    if (teachFiles.length === 0) throw error(400, `Missing ${isEs ? 'Spanish' : 'English'} teaching files`)
    if (eduFiles.length === 0) throw error(400, `Missing ${isEs ? 'Spanish' : 'English'} education files`)
    if (expFiles.length === 0) throw error(400, `Missing ${isEs ? 'Spanish' : 'English'} experience files`)
    if (projFiles.length === 0) throw error(400, `Missing ${isEs ? 'Spanish' : 'English'} projects files`)
    if (sumFiles.length === 0) throw error(400, `Missing ${isEs ? 'Spanish' : 'English'} summaries files`)
    if (awdFiles.length === 0) throw error(400, `Missing ${isEs ? 'Spanish' : 'English'} awards files`)

    const publicationsRaw = await pubFiles[0]()
    const skillsRaw = await skillFiles[0]()
    const teachingRaw = await teachFiles[0]()
    const educationRaw = await eduFiles[0]()
    const experienceRaw = await expFiles[0]()
    const projectsRaw = await projFiles[0]()
    const summariesRaw = await sumFiles[0]()
    const awardsRaw = await awdFiles[0]()

    const publications: Publications[] = JSON.parse(publicationsRaw as string)
    const skills: Skills = JSON.parse(skillsRaw as string)
    const teaching: TeachingExperience[] = JSON.parse(teachingRaw as string)
    const education: Education[] = JSON.parse(educationRaw as string)
    const experience: Experience[] = JSON.parse(experienceRaw as string)
    const projects: Project[] = JSON.parse(projectsRaw as string)
    const summaries: Summaries = JSON.parse(summariesRaw as string)
    const awards: Awards[] = JSON.parse(awardsRaw as string)

    publications.sort((a, b) => b.year - a.year)
    education.sort((a, b) => b.year - a.year)

    const data = { publications, skills, teaching, education, experience, projects, summaries, awards }
    const latex = generateLatexResume(data, isEs)

    return new Response(latex, {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Content-Disposition': 'inline; filename="VNavarro_Academic_CV.tex"'
      }
    })
  } catch (e) {
    console.error('Error generating LaTeX:', e)
    throw error(500, 'Failed to generate LaTeX resume')
  }
}
