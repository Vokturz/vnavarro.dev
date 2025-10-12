let pyodide: any = null // eslint-disable-line @typescript-eslint/no-explicit-any
let currentExecutionId: number | null = null
let globalInterruptBuffer: Uint8Array | null = null
const executionQueue: Array<{ id: number; code: string; interruptBuffer: Uint8Array }> = []
let isExecuting = false

interface ParsedError {
  errorLine: number | null
  cleanMessage: string
  originalError: string
}

function parseTraceback(errorMessage: string): ParsedError {
  const lines = errorMessage.split('\n')
  let errorLine: number | null = null
  let errorType = ''
  let errorMsg = ''

  for (let i = lines.length - 1; i >= 0; i--) {
    const line = lines[i].trim()
    const userCodeMatch = line.match(/^File\s+".*",\s+line\s+(\d+)/)
    if (userCodeMatch) {
      errorLine = parseInt(userCodeMatch[1], 10)
      break
    }
  }

  // Extract the final error type and message
  for (let i = lines.length - 1; i >= 0; i--) {
    const line = lines[i].trim()
    if (line && !line.startsWith(' ') && line.includes(':')) {
      const colonIndex = line.indexOf(':')
      errorType = line.substring(0, colonIndex)
      errorMsg = line.substring(colonIndex + 1).trim()
      break
    }
  }

  // Create a clean error message
  const cleanMessage = errorLine
    ? `${errorType}: ${errorMsg} (line ${errorLine})`
    : `${errorType}: ${errorMsg}`

  return {
    errorLine,
    cleanMessage,
    originalError: errorMessage
  }
}

/**
 * A single setup script to define all our Python-side helper functions.
 * This is more efficient than running multiple small scripts.
 */
const PYTHON_SETUP_SCRIPT = `
import sys
import io
import base64
import html
import warnings
import matplotlib
import matplotlib.pyplot as plt
from tqdm.auto import tqdm
import signal
import time

# Configure Matplotlib to use a non-interactive backend
matplotlib.use('Agg')

# Suppress common warnings for a cleaner output
warnings.filterwarnings('ignore')

# --- Custom tqdm for Web Worker Environment ---
class WebTqdm(tqdm):
    """
    A custom tqdm class that writes progress updates with a carriage return
    and a newline. This allows our JavaScript stdout handler to easily
    distinguish progress bars from regular print statements.
    """
    def __init__(self, *args, **kwargs):
        kwargs['file'] = sys.stdout
        kwargs['dynamic_ncols'] = False
        kwargs['ncols'] = 80 # Set a fixed width for the progress bar
        super().__init__(*args, **kwargs)

    def display(self, msg=None, pos=None):
        if not msg:
            msg = self.__str__()
        sys.stdout.write(f"TQDM_BAR::{msg}\\n")
        sys.stdout.flush()

# Monkey-patch the original tqdm with our custom version
import builtins
builtins.tqdm = WebTqdm
sys.modules['tqdm'].tqdm = WebTqdm


# --- Output Formatting ---
def format_output(obj):
    """
    Formats a Python object into an HTML string for display, with special
    handling for pandas DataFrames.
    """
    if obj is None:
        return ""

    # Custom formatting for pandas DataFrames
    if hasattr(obj, 'to_html') and 'pandas' in str(type(obj)):
        try:
            html_table = obj.to_html(
                classes='notebook-dataframe-output',
                table_id=None,
                escape=False,
                max_rows=20,
                max_cols=20
            )
            return f'<div class="notebook-table-container">{html_table}</div>'
        except Exception:
            # Fallback to standard repr if to_html fails
            pass

    # Use _repr_html_ if available (for libraries like Matplotlib)
    if hasattr(obj, '_repr_html_'):
        return obj._repr_html_()

    # Fallback to a safe, escaped representation
    raw_repr = repr(obj)
    if len(raw_repr) > 10000:
        raw_repr = raw_repr[:10000] + "... (output truncated)"

    escaped_repr = html.escape(raw_repr)
    return f'<pre class="notebook-output">{escaped_repr}</pre>'

# --- Plot Handling ---
def get_plots_as_html():
    """
    Checks for any active matplotlib plots, saves them as base64 PNGs,
    and returns them as a single HTML string containing <img> tags.
    """
    output_parts = []
    fig_nums = plt.get_fignums()
    if fig_nums:
        for fig_num in fig_nums:
            fig = plt.figure(fig_num)
            with io.BytesIO() as img_buffer:
                fig.savefig(img_buffer, format='png', bbox_inches='tight', dpi=100)
                img_buffer.seek(0)
                img_base64 = base64.b64encode(img_buffer.getvalue()).decode('utf-8')
                img_html = f'<div class="notebook-image-output"><img src="data:image/png;base64,{img_base64}" alt="Plot output" /></div>'
                output_parts.append(img_html)
        plt.close('all') # Close all figures to free memory
    return "".join(output_parts)
`

async function processQueue() {
  if (isExecuting || executionQueue.length === 0) {
    return // Don't start a new execution if one is already running or queue is empty
  }

  isExecuting = true
  const { id, code, interruptBuffer } = executionQueue.shift()! // Get the oldest request
  currentExecutionId = id

  // Clear interrupt buffer before execution
  if (interruptBuffer) {
    interruptBuffer[0] = 0
  }

  try {
    // Get proxies for our Python helper functions
    const formatOutput = pyodide.globals.get('format_output')
    const getPlotsAsHtml = pyodide.globals.get('get_plots_as_html')

    // The core execution
    const pyodideResult = await pyodide.runPythonAsync(code)

    // Format the result of the last expression
    let finalResult = formatOutput(pyodideResult)
    finalResult += getPlotsAsHtml()

    self.postMessage({ type: 'result', result: finalResult, id })
  } catch (error: unknown) {
    if (
      error instanceof Error &&
      error.name === 'PythonError' &&
      error.message.includes('KeyboardInterrupt')
    ) {
      self.postMessage({
        type: 'result',
        result: '<pre class="notebook-error-output">Execution interrupted by user.</pre>',
        errorLine: 0,
        id
      })

      executionQueue.forEach((queuedJob) => {
        self.postMessage({
          type: 'result',
          result:
            '<pre class="notebook-error-output">Execution cancelled due to a previous interruption.</pre>',
          id: queuedJob.id
        })
      })

      // 2. Clear the entire queue.
      executionQueue.length = 0
    } else {
      const errorMessage = error instanceof Error ? error.message : String(error)
      const parsedError = parseTraceback(errorMessage)
      self.postMessage({
        type: 'error',
        error: parsedError.cleanMessage,
        errorLine: parsedError.errorLine,
        originalError: parsedError.originalError,
        id
      })
    }
  } finally {
    // Clean up after this execution
    currentExecutionId = null
    isExecuting = false

    // IMPORTANT: Check if there's another item in the queue and start it
    setTimeout(processQueue, 0)
  }
}

self.onmessage = async (e) => {
  const { type, id, code, interruptBuffer } = e.data

  try {
    switch (type) {
      case 'init': {
        // Dynamically import the Pyodide loader
        const { loadPyodide } = await import('pyodide')
        pyodide = await loadPyodide({
          indexURL: 'https://cdn.jsdelivr.net/pyodide/v0.27.7/full/',
          stdout: (text) => {
            if (!currentExecutionId) return // Don't post messages if no execution is active

            // Use the carriage return "\\r" to identify tqdm progress updates
            if (text.startsWith('TQDM_BAR::')) {
              const progressText = text.substring(10).trim()
              self.postMessage({
                type: 'streaming-output',
                output: `<pre class="notebook-tqdm-output">${progressText}</pre>`,
                id: currentExecutionId,
                priority: 'high'
              })
            } else {
              self.postMessage({
                type: 'streaming-output',
                output: `<pre class="notebook-stream-output">${text}</pre>`,
                id: currentExecutionId
              })
            }
          },
          stderr: (text) => {
            if (!currentExecutionId) return // Don't post messages if no execution is active
            self.postMessage({
              type: 'streaming-output',
              output: `<pre class="notebook-error-output">${text}\\n</pre>`,
              id: currentExecutionId
            })
          }
        })

        if (globalInterruptBuffer) {
          pyodide.setInterruptBuffer(globalInterruptBuffer)
        }

        // Load essential Python packages
        await pyodide.loadPackage(['numpy', 'matplotlib', 'pandas', 'tqdm', 'micropip'])

        // Run the setup script to define our Python helper functions
        await pyodide.runPythonAsync(PYTHON_SETUP_SCRIPT)

        self.postMessage({ type: 'init-complete', id })
        break
      }

      case 'set-interrupt-buffer': {
        globalInterruptBuffer = interruptBuffer
        if (pyodide && interruptBuffer) {
          pyodide.setInterruptBuffer(globalInterruptBuffer)
        }
        break
      }

      case 'execute': {
        executionQueue.push({ id, code, interruptBuffer })
        processQueue()
        break
      }

      case 'abort': {
        if (currentExecutionId === id) {
          // Set interrupt buffer to signal interruption
          if (globalInterruptBuffer) {
            globalInterruptBuffer[0] = 2 // Signal SIGINT
          }
          // Send interrupted result immediately
          self.postMessage({
            type: 'result',
            result: '<pre class="notebook-error-output">Execution interrupted by user.</pre>',
            id
          })
          currentExecutionId = null
        }
        break
      }
    }
  } catch (error: unknown) {
    self.postMessage({
      type: 'error',
      error: error instanceof Error ? error.message : String(error),
      id
    })
  }
}
