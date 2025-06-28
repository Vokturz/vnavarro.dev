import { writable } from 'svelte/store'
import { browser } from '$app/environment'

interface PyodideService {
  pyodide: any | null
  loading: boolean
  ready: boolean
  error: string | null
}

const initialState: PyodideService = {
  pyodide: null,
  loading: false,
  ready: false,
  error: null
}

export const pyodideStore = writable<PyodideService>(initialState)

let pyodideInstance: any = null
let initPromise: Promise<any> | null = null

export async function initializePyodide(): Promise<any> {
  if (pyodideInstance) return pyodideInstance
  if (initPromise) return initPromise
  if (!browser) return null

  pyodideStore.update(state => ({ ...state, loading: true, error: null }))

  initPromise = (async () => {
    try {
      const { loadPyodide } = await import('pyodide')
      pyodideInstance = await loadPyodide({
        indexURL: 'https://cdn.jsdelivr.net/pyodide/v0.27.7/full/'
      })
      
      // Install common packages
      await pyodideInstance.loadPackage(['numpy', 'matplotlib'])
      
      // Set up matplotlib
      pyodideInstance.runPython(`
        import matplotlib
        matplotlib.use('Agg')
        import matplotlib.pyplot as plt
        import io
        import base64
        import sys
        from contextlib import redirect_stdout, redirect_stderr
      `)
      
      pyodideStore.update(state => ({ 
        ...state, 
        pyodide: pyodideInstance, 
        loading: false, 
        ready: true 
      }))
      
      return pyodideInstance
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to load Pyodide'
      pyodideStore.update(state => ({ 
        ...state, 
        loading: false, 
        error: errorMessage 
      }))
      throw error
    }
  })()

  return initPromise
}

export async function executePython(code: string): Promise<string> {
  const pyodide = await initializePyodide()
  if (!pyodide) throw new Error('Pyodide not available')

  try {
    const result = pyodide.runPython(`
import sys
import io
from contextlib import redirect_stdout, redirect_stderr
import matplotlib.pyplot as plt
import base64

stdout_buffer = io.StringIO()
stderr_buffer = io.StringIO()
result = None

try:
    with redirect_stdout(stdout_buffer), redirect_stderr(stderr_buffer):
        exec("""${code.replace(/"/g, '\\"').replace(/\n/g, '\\n')}""")
        
        stdout_content = stdout_buffer.getvalue()
        stderr_content = stderr_buffer.getvalue()
        
        output_parts = []
        
        # Add stdout output if any
        if stdout_content.strip():
            output_parts.append(f'<pre class="notebook-stream-output">{stdout_content}</pre>')
        
        # Add stderr output if any
        if stderr_content.strip():
            output_parts.append(f'<pre class="notebook-error-output">{stderr_content}</pre>')
        
        # Handle multiple figures
        fig_nums = plt.get_fignums()
        print(f"Debug: Found {len(fig_nums)} figures")  # Debug line
        
        if fig_nums:
            for fig_num in fig_nums:
                print(f"Debug: Processing figure {fig_num}")  # Debug line
                fig = plt.figure(fig_num)
                img_buffer = io.BytesIO()
                fig.savefig(img_buffer, format='png', bbox_inches='tight', dpi=100)
                img_buffer.seek(0)
                img_base64 = base64.b64encode(img_buffer.getvalue()).decode()
                output_parts.append(f'<div class="notebook-image-output"><img src="data:image/png;base64,{img_base64}" alt="Plot output" style="max-width: 100%; height: auto;" /></div>')
            
            plt.close('all')
        
        print(f"Debug: Final output_parts length: {len(output_parts)}")  # Debug line
        
        # If no output at all
        if not output_parts:
            result = '<div class="text-sm text-muted-foreground italic">Code executed successfully (no output)</div>'
        else:
            result = ''.join(output_parts)
                
except Exception as e:
    stderr_content = stderr_buffer.getvalue()
    if stderr_content.strip():
        result = f'<pre class="notebook-error-output">{stderr_content}</pre>'
    else:
        result = f'<pre class="notebook-error-output">{str(e)}</pre>'

result
    `)

    console.log({ result })

    if (!result || result.trim() === '') {
      return '<div class="text-sm text-muted-foreground italic">No output</div>'
    }
    
    return result
  } catch (error) {
    return `<pre class="notebook-error-output">Python execution error: ${error instanceof Error ? error.message : 'Unknown error'}</pre>`
  }
}

