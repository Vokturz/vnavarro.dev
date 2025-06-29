import { mount } from 'svelte'
// @ts-ignore - Svelte component import
import EditableCodeBlock from './components/EditableCodeBlock.svelte'

export function transformCodeBlocks(runnable: boolean = false) {
  document.querySelectorAll('code-block').forEach((el) => {
    const htmlEl = el as HTMLElement
    const code = decodeURIComponent(htmlEl.dataset.code || '')
    const output = decodeURIComponent(htmlEl.dataset.output || '')
    const lang = htmlEl.dataset.lang || 'plaintext'
    const isPython = lang === 'python' || lang === 'py'

    if (el.parentNode instanceof Element) {
      mount(EditableCodeBlock, {
        target: el.parentNode,
        anchor: el,
        props: { code, language: lang, initialOutput: output, readonly: isPython ? !runnable : true }
      }) 
      el.remove()
    }
  })
}