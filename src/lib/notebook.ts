import type { JupyterNotebook, NotebookCell } from '$lib/types'
import { marked } from '$lib/markdown'

export class NotebookRenderer {
  static async renderNotebook(notebook: JupyterNotebook): Promise<string> {
    const cellsHtml = await Promise.all(
      notebook.cells.map(cell => this.renderCell(cell))
    )
    return cellsHtml.join('')
  }
  
  private static async renderCell(cell: NotebookCell): Promise<string> {
    const source = Array.isArray(cell.source) ? cell.source.join('') : cell.source
    
    if (cell.cell_type === 'markdown') {
      return await marked.parse(source)
    }
    
    if (cell.cell_type === 'code' && source) {
      const outputs = cell.outputs || []
      const renderedOutputs = this.renderOutputs(outputs)
      
      return `<editable-code-block 
        data-code="${encodeURIComponent(source)}" 
        data-lang="python"
        data-output="${encodeURIComponent(renderedOutputs)}"
      ></editable-code-block>`
    }
    
    return ''
  }

  private static renderOutputs(outputs: any[]): string {
    if (!outputs || outputs.length === 0) return ''
    
    return outputs.map(output => {
      // Handle different output types
      switch (output.output_type) {
        case 'stream':
          // Text output (print statements, etc.)
          return this.renderStreamOutput(output)
        
        case 'display_data':
        case 'execute_result':
          // Rich outputs (plots, HTML, etc.)
          return this.renderDisplayOutput(output)
        
        case 'error':
          // Error outputs
          return this.renderErrorOutput(output)
        
        default:
          // Fallback for unknown output types
          return this.renderTextOutput(output)
      }
    }).join('')
  }

  private static renderStreamOutput(output: any): string {
    const text = Array.isArray(output.text) ? output.text.join('') : output.text || ''
    return `<pre class="notebook-stream-output">${this.escapeHtml(text)}</pre>`
  }

  private static renderDisplayOutput(output: any): string {
    const data = output.data || {}
    
    // Priority order for display formats
    if (data['text/html']) {
      // HTML output (widgets, formatted tables, etc.)
      const htmlContent = Array.isArray(data['text/html']) 
        ? data['text/html'].join('') 
        : data['text/html']
      return `<div class="notebook-html-output">${htmlContent}</div>`
    }
    
    if (data['image/png']) {
      // PNG images (matplotlib plots)
      const imageData = Array.isArray(data['image/png']) 
        ? data['image/png'].join('') 
        : data['image/png']
      return `<div class="notebook-image-output">
        <img src="data:image/png;base64,${imageData}" alt="Plot output" />
      </div>`
    }
    
    if (data['image/jpeg']) {
      // JPEG images
      const imageData = Array.isArray(data['image/jpeg']) 
        ? data['image/jpeg'].join('') 
        : data['image/jpeg']
      return `<div class="notebook-image-output">
        <img src="data:image/jpeg;base64,${imageData}" alt="Plot output" />
      </div>`
    }
    
    if (data['image/svg+xml']) {
      // SVG images (vector plots)
      const svgData = Array.isArray(data['image/svg+xml']) 
        ? data['image/svg+xml'].join('') 
        : data['image/svg+xml']
      return `<div class="notebook-svg-output">${svgData}</div>`
    }
    
    if (data['application/json']) {
      // JSON output
      const jsonData = typeof data['application/json'] === 'string' 
        ? data['application/json'] 
        : JSON.stringify(data['application/json'], null, 2)
      return `<pre class="notebook-json-output">${this.escapeHtml(jsonData)}</pre>`
    }
    
    if (data['text/plain']) {
      // Plain text fallback
      const text = Array.isArray(data['text/plain']) 
        ? data['text/plain'].join('') 
        : data['text/plain']
      return `<pre class="notebook-text-output">${this.escapeHtml(text)}</pre>`
    }
    
    return ''
  }

  private static renderErrorOutput(output: any): string {
    const traceback = output.traceback || []
    const errorText = traceback.join('\n')
    return `<pre class="notebook-error-output">${this.escapeHtml(errorText)}</pre>`
  }

  private static renderTextOutput(output: any): string {
    // Fallback for legacy or unknown output formats
    const text = output.text 
      ? (Array.isArray(output.text) ? output.text.join('') : output.text)
      : JSON.stringify(output, null, 2)
    return `<pre class="notebook-fallback-output">${this.escapeHtml(text)}</pre>`
  }

  private static escapeHtml(text: string): string {
    return text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;')
  }
}
