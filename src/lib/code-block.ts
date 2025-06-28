import { mount } from 'svelte'
// @ts-ignore - Svelte component import
import CodeBlock from '$lib/components/CodeBlock.svelte'
import EditableCodeBlock from './components/EditableCodeBlock.svelte'

export function transformCodeBlocks() {
  document.querySelectorAll('code-block').forEach((el) => {
    const htmlEl = el as HTMLElement
    const code = decodeURIComponent(htmlEl.dataset.code || '')
    const lang = htmlEl.dataset.lang || 'plaintext'

    if (el.parentNode instanceof Element) {
      mount(CodeBlock, {
        target: el.parentNode,
        props: { code, language: lang }
      })
      el.remove()
    }
  })

  document.querySelectorAll('editable-code-block').forEach((el) => {
    const htmlEl = el as HTMLElement
    const code = decodeURIComponent(htmlEl.dataset.code || '')
    const output = decodeURIComponent(htmlEl.dataset.output || '')
    const lang = htmlEl.dataset.lang || 'plaintext'

    if (el.parentNode instanceof Element) {
      mount(EditableCodeBlock, {
        target: el.parentNode,
        props: { code, language: lang, initialOutput: output }
      })
      el.remove()
    }
  })
}
