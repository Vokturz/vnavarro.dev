import { Marked, Renderer } from 'marked'
import hljs from 'highlight.js'
import markedKatex from 'marked-katex-extension'

const ensureMathBlockNewlines = {
  async: false,
  hooks: {
    preprocess(markdown: string) {
      return markdown
        .replace(/\$\-/g, '$ -')
        .replace(/\$\)/g, '$ )')
        .replace(/\(\$/g, '( $')
        .replace(/([^\n])\n\s*(\$\$)/g, '$1\n\n$2')
        .replace(/(\$\$)\n([^\n])/g, '$1\n\n$2')
        .replace(/\$\$([\s\S]*?)\$\$/g, (match, mathContent) => {
          const cleanedContent = mathContent.replace(/\n\s*/g, ' ').trim()
          return `$$${cleanedContent}$$`
        })
    }
  }
}

const renderer = new Renderer()

renderer.code = function (token) {
  const language = token.lang
    ? hljs.getLanguage(token.lang)
      ? token.lang
      : 'plaintext'
    : 'plaintext'
  return `<code-block data-code="${encodeURIComponent(token.text)}" data-lang="${language}"></code-block>`
}

renderer.link = function (token) {
  const href = token.href
  const title = token.title ? ` title="${token.title}"` : ''
  const text = token.text

  const isExternal =
    href.startsWith('http://') || href.startsWith('https://') || href.startsWith('//')
  const security = isExternal ? ' target="_blank" rel="noopener noreferrer"' : ''

  return `<a class="underline hover:text-purple-500" href="${href}"${title}${security}>${text}</a>`
}

renderer.list = function (token) {
  const type = token.ordered ? 'ol' : 'ul'
  const className = token.ordered
    ? 'list-decimal list-inside space-y-1'
    : 'list-disc list-inside space-y-1'
  const body = token.items.map((item) => this.listitem(item)).join('\n')
  return `<${type} class="${className}">\n${body}</${type}>\n`
}

renderer.listitem = function (token) {
  let itemBody = ''
  if (token.task) {
    const checkbox = token.checked ? 'checked="" ' : ''
    itemBody += `<input ${checkbox}disabled="" type="checkbox"> `
  }
  itemBody += this.parser.parseInline(token.tokens)
  return `<li class="ml-4">${itemBody}</li>`
}

renderer.blockquote = function (token) {
  const body = this.parser.parse(token.tokens)
  return `<blockquote class="border-l-4 border-primary/20 pl-4 py-2 my-4 italic text-primary/80">${body}</blockquote>\n`
}

const marked = new Marked()

marked.use(
  ensureMathBlockNewlines,
  markedKatex({
    throwOnError: false,
    displayMode: true,
    output: 'html'
  }),
  {
    renderer,
    gfm: true
  }
)

marked.use({ renderer })

export { marked }
