import { mount } from 'svelte'
import EditableCodeBlock from './components/EditableCodeBlock.svelte'
import ColorizedCodeBlock from './components/ColorizedCodeBlock.svelte'

// Store references to all code block components for navigation
const codeBlockRefs = new Map<string, EditableCodeBlock>()

export function transformCodeBlocks() {
  let blockIndex = 0

  document.querySelectorAll('code-block').forEach((el) => {
    const htmlEl = el as HTMLElement
    const code = decodeURIComponent(htmlEl.dataset.code || '')
    const output = decodeURIComponent(htmlEl.dataset.output || '')
    const lang = htmlEl.dataset.lang || 'plaintext'
    const blockId = `code-block-${blockIndex++}`

    if (el.parentNode instanceof Element) {
      const component = mount(EditableCodeBlock, {
        target: el.parentNode,
        anchor: el,
        props: {
          code,
          language: lang,
          initialOutput: output,
          blockId,
          onNavigateNext: () => navigateToNextBlock(blockId)
        }
      })

      // Store reference to the component
      codeBlockRefs.set(blockId, component)
      el.remove()
    }
  })

  // Handle colorized code blocks
  document.querySelectorAll('colorized-code-block').forEach((el) => {
    const htmlEl = el as HTMLElement
    const code = decodeURIComponent(htmlEl.dataset.code || '')
    const lang = htmlEl.dataset.lang || 'plaintext'

    if (el.parentNode instanceof Element) {
      mount(ColorizedCodeBlock, {
        target: el.parentNode,
        anchor: el,
        props: {
          code,
          language: lang
        }
      })

      el.remove()
    }
  })
}

export function navigateToNextBlock(currentBlockId: string) {
  const currentIndex = parseInt(currentBlockId.split('-')[2])
  const nextBlockId = `code-block-${currentIndex + 1}`
  const nextComponent = codeBlockRefs.get(nextBlockId)

  if (nextComponent) {
    // Focus the next code block
    nextComponent.focus?.()
  }
}

export function clearCodeBlockRefs() {
  codeBlockRefs.clear()
}
