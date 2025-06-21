import { mount } from 'svelte'
// @ts-ignore - Svelte component import
import CodeBlock from '$lib/components/CodeBlock.svelte'

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
}
