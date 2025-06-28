import { Marked, Renderer } from 'marked'
import hljs from 'highlight.js'

const renderer = new Renderer()

renderer.code = function(token) {
  const language = token.lang ? hljs.getLanguage(token.lang) ? token.lang : 'plaintext' : 'plaintext'
  return `<code-block data-code="${encodeURIComponent(token.text)}" data-lang="${language}"></code-block>`
}

renderer.link = function(token) {
  const href = token.href
  const title = token.title ? ` title="${token.title}"` : ''
  const text = token.text
  
  const isExternal = href.startsWith('http://') || href.startsWith('https://') || href.startsWith('//')
  const security = isExternal ? ' target="_blank" rel="noopener noreferrer"' : ''
  
  return `<a class="underline hover:text-purple-500" href="${href}"${title}${security}>${text}</a>`
}

export const marked = new Marked({ renderer })
