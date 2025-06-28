import { Marked, Renderer } from 'marked'
import hljs from 'highlight.js'

const renderer = new Renderer()
renderer.code = function(token) {
  const language = token.lang ? hljs.getLanguage(token.lang) ? token.lang : 'plaintext' : 'plaintext'
  return `<code-block data-code="${encodeURIComponent(token.text)}" data-lang="${language}"></code-block>`
}

export const marked = new Marked({ renderer })
