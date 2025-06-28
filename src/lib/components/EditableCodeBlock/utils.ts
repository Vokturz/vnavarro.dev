export function formatPythonOutput(result: { output: string; error: string | null }) {
  if (result.error) {
    return `<pre class="notebook-error-output">${result.error}</pre>`
  }

  if (!result.output || result.output.trim() === '') {
    return '<div class="text-sm text-muted-foreground italic">No output</div>'
  }

  if (
    result.output.includes('<pre class="notebook-') ||
    result.output.includes('<div class="notebook-') ||
    result.output.includes('<div class="text-sm text-muted-foreground italic">')
  ) {
    return result.output
  }

  if (result.output.includes('<') && result.output.includes('>')) {
    return `<div class="notebook-html-output">${result.output}</div>`
  }

  return `<pre class="notebook-stream-output">${result.output}</pre>`
}

export function generateFakeOutput() {
  const outputs = [
    '<pre class="notebook-stream-output">Hello, World!\nExecution completed successfully.</pre>',
    '<pre class="notebook-text-output">42</pre>',
    '<div class="notebook-image-output"><img src="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjEwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KICA8cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZjBmMGYwIi8+CiAgPHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxNCIgZmlsbD0iIzMzMyIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPk1hdHBsb3RsaWIgUGxvdDwvdGV4dD4KICA8bGluZSB4MT0iMjAiIHkxPSI4MCIgeDI9IjE4MCIgeTI9IjIwIiBzdHJva2U9IiMwMDciIHN0cm9rZS13aWR0aD0iMiIvPgo8L3N2Zz4=" alt="Plot output" /></div>',
    '<div class="notebook-html-output"><table border="1"><tr><th>Name</th><th>Value</th></tr><tr><td>Item 1</td><td>42</td></tr><tr><td>Item 2</td><td>84</td></tr></table></div>',
    '<pre class="notebook-json-output">{\n  "result": [1, 2, 3, 4, 5],\n  "status": "success"\n}</pre>'
  ]
  return outputs[Math.floor(Math.random() * outputs.length)]
}
