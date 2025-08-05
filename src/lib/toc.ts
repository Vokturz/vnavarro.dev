export interface TocItem {
  id: string
  text: string
  level: number
}

export function extractHeadings(title: string, htmlContent: string): TocItem[] {
  // Create a temporary DOM element to parse the HTML
  const parser = new DOMParser()
  const doc = parser.parseFromString(htmlContent, 'text/html')

  const titleId = title
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim()

  const headings = doc.querySelectorAll('h1, h2, h3, h4')
  const tocItems: TocItem[] = [{ id: titleId, text: title, level: 0 }]

  headings.forEach((heading) => {
    const text = heading.textContent?.trim() || ''
    const level = parseInt(heading.tagName.charAt(1)) + 1

    // Generate a slug-like ID from the heading text
    const id = text
      .toLowerCase()
      .replace(/[^\w\s-]/g, '') // Remove special characters
      .replace(/\s+/g, '-') // Replace spaces with hyphens
      .replace(/-+/g, '-') // Replace multiple hyphens with single
      .trim()

    tocItems.push({ id, text, level })
  })

  return tocItems
}

export function addIdsToHeadings(containerElement?: Element): void {
  // Work directly with the DOM like transformCodeBlocks does
  const container = containerElement || document

  container.querySelectorAll('h1, h2, h3, h4').forEach((heading) => {
    // Skip if heading already has an id
    if (heading.id) return

    const text = heading.textContent?.trim() || ''
    const id = text
      .toLowerCase()
      .replace(/[^\w\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim()

    heading.id = id
  })
}
