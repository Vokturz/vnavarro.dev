import { Marked, Renderer } from 'marked'
import hljs from 'highlight.js'
import markedKatex from 'marked-katex-extension'

const ensureMathBlockNewlines = {
  async: false,
  hooks: {
    preprocess(markdown: string) {
      return markdown
        .replace(/\$-/g, '$ -')
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

  // Check if the code contains colorization syntax
  const hasColorSyntax = /\[([a-z]+):([^\]]+)\]/.test(token.text)

  if (hasColorSyntax || token.lang === 'colorized') {
    // Use colorized code block for content with color syntax
    return `<colorized-code-block data-code="${encodeURIComponent(token.text)}" data-lang="colorized">${token.text}</colorized-code-block>`
  }

  // Convert URLs in code to clickable links
  const codeWithLinks = token.text.replace(
    /(https?:\/\/[^\s<]+)/g,
    '<a href="$1" target="_blank" rel="noopener noreferrer" class="underline hover:text-purple-500">$1</a>'
  )

  return `<code-block data-code="${encodeURIComponent(token.text)}" data-lang="${language}">${codeWithLinks}</code-block>`
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

renderer.paragraph = function (token) {
  const body = this.parser.parseInline(token.tokens)
  return `<p class="my-4">${body}</p>\n`
}

renderer.codespan = function (token) {
  return `<code class="bg-secondary/20 text-primary px-1 tracking-[-0.07em] rounded font-mono">${token.text}</code>`
}

const highlightExtension = {
  extensions: [
    {
      name: 'highlight',
      level: 'inline',
      start(src: string) {
        return src.match(/\[([a-z]+):/)?.index
      },
      tokenizer(src: string) {
        const match = src.match(/^\[([a-z]+):([^\]]+)\]/)
        if (match) {
          return {
            type: 'highlight',
            raw: match[0],
            color: match[1],
            text: match[2].trim()
          }
        }
      },
      /* eslint-disable @typescript-eslint/no-explicit-any */
      renderer(token: any) {
        const colorMap: Record<string, string> = {
          yellow: 'bg-yellow-200/80 text-yellow-900',
          red: 'bg-red-200/80 text-red-900',
          green: 'bg-green-200/80 text-green-900',
          blue: 'bg-blue-200/80 text-blue-900',
          purple: 'bg-purple-200/80 text-purple-900',
          pink: 'bg-pink-200/80 text-pink-900',
          gray: 'bg-gray-200/80 text-gray-900'
        }

        const colorClass = colorMap[token.color] || colorMap.yellow
        return `<span class="${colorClass} px-1 py-0.5 rounded">${token.text}</span>`
      }
    }
  ]
}

const marked = new Marked()

marked.use(
  ensureMathBlockNewlines,
  markedKatex({
    throwOnError: false,
    displayMode: true,
    output: 'html'
  }),
  highlightExtension,
  {
    renderer,
    gfm: true
  }
)

marked.use({ renderer })

export { marked }
