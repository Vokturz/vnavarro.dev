import { json } from '@sveltejs/kit'
import type { RequestHandler } from './$types'
import type {
  Publications,
  Skills,
  TeachingExperience,
  Education,
  Experience,
  Summaries,
  Category
} from '$lib/types/resume'
import type { Project } from '$lib/types'

interface ResumeData {
  publications: Publications[]
  skills: Skills
  teaching: TeachingExperience[]
  education: Education[]
  experience: Experience[]
  projects: Project[]
  summaries: Summaries
}

interface Request {
  data: ResumeData
  category?: Category
}

export const POST: RequestHandler = async ({ request }) => {
  try {
    const { data, category: cat }: Request = await request.json()

    // Dynamic import of jsPDF (only on server)
    const { jsPDF } = await import('jspdf')

    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    })

    const category = cat || 'software-engineer'

    const pageWidth = doc.internal.pageSize.getWidth()
    const pageHeight = doc.internal.pageSize.getHeight()
    const margin = 12
    const contentWidth = pageWidth - margin * 2
    const titleBottomMargin = 5
    const font = 'Helvetica'
    let yPosition = margin

    // Colors
    const colors: Record<string, [number, number, number]> = {
      primary: [59, 130, 246],
      secondary: [30, 64, 175],
      text: [31, 41, 55],
      lightText: [107, 114, 128],
      border: [229, 231, 235]
    }

    const fonts = {
      normal: 10,
      heading1: 18,
      heading2: 13,
      heading3: 11,
      small: 9
    }

    // Helper function for page breaks
    const checkPageBreak = (spaceNeeded: number) => {
      if (yPosition + spaceNeeded > pageHeight - margin) {
        doc.addPage()
        yPosition = margin
      }
    }

    // Helper function to convert markdown to plain text
    const markdownToPlainText = (markdown: string): string => {
      return markdown
        .replace(/\*\*(.*?)\*\*/g, '$1') // Remove bold **text**
        .replace(/\*(.*?)\*/g, '$1') // Remove italic *text*
        .replace(/\[(.*?)\]\(.*?\)/g, '$1') // Convert [text](url) to text
        .replace(/`(.*?)`/g, '$1') // Remove code backticks
        .trim()
    }

    // Header
    doc.setTextColor(...colors.secondary)
    doc.setFontSize(fonts.heading1)
    doc.setFont(font, 'bold')
    doc.text('Victor Navarro-Aranguiz', margin, yPosition)
    yPosition += 5

    doc.setTextColor(...colors.lightText)
    doc.setFontSize(fonts.small)
    doc.setFont(font, 'normal')
    doc.text('vnavarroaranguiz@gmail.com | (+353) 83 863 1200', margin, yPosition)
    yPosition += 2

    doc.setDrawColor(...colors.primary)
    doc.setLineWidth(0.2)
    doc.line(margin, yPosition, pageWidth - margin, yPosition)
    yPosition += 5

    // Summary Section
    doc.setTextColor(...colors.text)
    doc.setFontSize(fonts.normal)
    doc.setFont(font, 'normal')
    const lines = doc.splitTextToSize(data.summaries[category], contentWidth)
    doc.text(lines, margin, yPosition)
    yPosition += lines.length * 3 + 1

    doc.setDrawColor(...colors.primary)
    doc.setLineWidth(0.2)
    doc.line(margin, yPosition, pageWidth - margin, yPosition)
    yPosition += 6

    // Experience Section
    checkPageBreak(15)
    doc.setTextColor(...colors.secondary)
    doc.setFontSize(fonts.heading2)
    doc.setFont(font, 'bold')
    doc.text('Experience', margin, yPosition)
    yPosition += titleBottomMargin

    for (const exp of data.experience) {
      checkPageBreak(15)

      doc.setTextColor(...colors.text)
      doc.setFontSize(fonts.heading3)
      doc.setFont(font, 'bold')
      doc.text(exp.title, margin, yPosition)
      yPosition += 4

      doc.setTextColor(...colors.lightText)
      doc.setFontSize(fonts.small)
      doc.setFont(font, 'normal')
      doc.text(`${exp.company} | ${exp.period}`, margin, yPosition)
      yPosition += 4

      doc.setTextColor(...colors.text)
      doc.setFontSize(fonts.normal)
      for (const item of exp.items) {
        if (!item.categories.includes(category)) {
          continue
        }
        const cleanDesc = markdownToPlainText(item.description)
        const lines = doc.splitTextToSize(`• ${cleanDesc}`, contentWidth - 3)
        doc.text(lines, margin + 3, yPosition)
        yPosition += lines.length * 4
      }

      yPosition += 1
    }

    yPosition += 1

    // Projects Section
    checkPageBreak(15)
    doc.setTextColor(...colors.secondary)
    doc.setFontSize(fonts.heading2)
    doc.setFont(font, 'bold')
    doc.text('Personal Projects', margin, yPosition)
    yPosition += titleBottomMargin

    for (const project of data.projects) {
      checkPageBreak(15)

      doc.setTextColor(...colors.text)
      doc.setFontSize(fonts.heading3)
      doc.setFont(font, 'bold')
      doc.text(project.title, margin, yPosition)
      const projectLink = project.liveUrl ?? project.githubUrl ?? project.hfUrl ?? ''

      if (projectLink) {
        doc.setTextColor(...colors.lightText)
        doc.setFontSize(fonts.normal)
        doc.setFont(font, 'italic')

        doc.textWithLink(projectLink, project.title.length * 2.2 + margin, yPosition, {
          url: projectLink
        })
      }
      yPosition += 4

      doc.setTextColor(...colors.text)
      doc.setFontSize(fonts.normal)
      doc.setFont(font, 'normal')

      const cleanDesc = markdownToPlainText(project.description)
      const lines = doc.splitTextToSize(cleanDesc, contentWidth)
      doc.text(lines, margin + 3, yPosition)
      yPosition += lines.length * 4 + 1
    }

    yPosition += 1

    // Education Section
    checkPageBreak(12)
    doc.setTextColor(...colors.secondary)
    doc.setFontSize(fonts.heading2)
    doc.setFont(font, 'bold')
    doc.text('Education', margin, yPosition)
    yPosition += titleBottomMargin

    for (const edu of data.education) {
      checkPageBreak(10)

      doc.setTextColor(...colors.text)
      doc.setFontSize(fonts.heading3)
      doc.setFont(font, 'bold')
      doc.text(edu.degree, margin, yPosition)
      yPosition += 4

      doc.setTextColor(...colors.lightText)
      doc.setFontSize(fonts.small)
      doc.setFont(font, 'normal')
      doc.text(`${edu.institution} | ${edu.year}`, margin, yPosition)
      yPosition += 5
    }

    yPosition += 2

    // Skills Section
    checkPageBreak(12)
    doc.setTextColor(...colors.secondary)
    doc.setFontSize(fonts.heading2)
    doc.setFont(font, 'bold')
    doc.text('Skills', margin, yPosition)
    yPosition += titleBottomMargin

    const entries = Object.entries(data.skills)
    for (let i = 0; i < entries.length; i++) {
      const [category, skills] = entries[i]
      checkPageBreak(1)

      doc.setTextColor(...colors.text)
      doc.setFontSize(fonts.normal)
      doc.setFont(font, 'bold')
      doc.text(`${category}:`, margin, yPosition)
      // yPosition += 5

      doc.setFontSize(fonts.normal)
      doc.setFont(font, 'normal')
      const skillNames = skills.map((s) => s.name).join(', ')
      const lines = doc.splitTextToSize(skillNames, contentWidth - 4)
      doc.text(lines, category.length * 2.15 + margin + 2, yPosition)
      yPosition += lines.length * 4 + 1
    }

    yPosition += 2

    // Generate PDF as buffer
    const pdfBuffer = Buffer.from(doc.output('arraybuffer'))

    return new Response(pdfBuffer, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': 'attachment; filename="VNavarro_Resume.pdf"'
      }
    })
  } catch (error) {
    console.error('PDF generation error:', error)
    return json({ error: 'Failed to generate PDF' }, { status: 500 })
  }
}
