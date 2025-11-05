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
}): string {
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
\\section{Education}
${data.education
  .map(
    (edu) =>
      `\\cventry{${edu.year}}{${escapeLatex(edu.degree)}}{${escapeLatex(edu.institution)}}{}{}{${edu.description ? convertMarkdownToLatex(edu.description) : '\\relax'}}`
  )
  .join('\n\n')}

% 2. Professional Experience
\\section{Professional Experience}
${data.experience
  .map((exp) => {
    return `\\cventry{${exp.period}}{${escapeLatex(exp.title)}}{${escapeLatex(exp.company)}}{}{}{${convertMarkdownToLatex(exp.summary || '')}}`
  })
  .join('\n\n')}

% 3. Teaching Experience
\\section{Teaching Experience}
${data.teaching
  .map((teach) => {
    return `\\cventry{${teach.period}}{${escapeLatex(teach.title)}}{${escapeLatex(teach.institution)}}{}{}{%
${teach.description}
}`
  })
  .join('\n\n')}

\\newpage

% 4. Personal Projects
\\section{Personal Projects}
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

% 5. Honors and Awards
\\section{Honors and Awards}
${data.awards
  .map((award) => {
    return `\\cventry{${award.period}}{${escapeLatex(award.title)}}{${escapeLatex(award.organization)}}{}{}{${escapeLatex(award.description)}}`
  })
  .join('\n\n')}
\\vspace{0.2em}

% 6. Publications
\\section{Publications}
\\begin{enumerate}[leftmargin=*]
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

% 7. Technical Skills
\\section{Technical Skills}
${Object.entries(data.skills)
  .map(
    ([category, skills]) =>
      `\\cvitem{${escapeLatex(category)}}{${skills.map((skill) => escapeLatex(skill.name)).join(', ')}}`
  )
  .join('\n')}

\\end{document}`

  return latex
}

export const POST: RequestHandler = async ({ request }) => {
  try {
    const requestData = await request.json()

    if (!requestData.data) {
      throw error(400, 'Missing resume data')
    }

    const latex = generateLatexResume(requestData.data)

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
