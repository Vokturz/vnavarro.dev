import { Marked } from 'marked'
import hljs from 'highlight.js'
import { markedHighlight } from 'marked-highlight'

export const marked = new Marked(
  markedHighlight({
    async: false,
    emptyLangClass: 'hljs',
    langPrefix: 'hljs language-',
    highlight(code, lang, info) {
      const language = hljs.getLanguage(lang) ? lang : 'plaintext'
      return `<code-block data-code="${encodeURIComponent(code)}" data-lang="${language}"></code-block>`
    }
  })
)
