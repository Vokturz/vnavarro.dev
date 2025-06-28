let pyodide: any = null;
let currentExecutionId: number | null = null;
let interruptBuffer: Uint8Array | null = null;

self.onmessage = async function(e) {
  const { type, code, id, interruptBuffer: buffer } = e.data;
  
  if (type === 'init') {
    try {
      const { loadPyodide } = await import('pyodide');
      pyodide = await loadPyodide({
        indexURL: 'https://cdn.jsdelivr.net/pyodide/v0.27.7/full/'
      });
      
      await pyodide.loadPackage(['numpy', 'matplotlib']);
      
      pyodide.runPython(`
        import matplotlib
        matplotlib.use('Agg')
        import matplotlib.pyplot as plt
        import io
        import base64
        import sys
        from contextlib import redirect_stdout, redirect_stderr
        import time
        import warnings
        
        # Suppress warnings
        warnings.filterwarnings('ignore')
        
        class StreamingStdout:
            def __init__(self, callback):
                self.callback = callback
                self.buffer = ""
                
            def write(self, text):
                self.buffer += text
                self.callback(text)
                return len(text)
                
            def flush(self):
                pass
                
            def getvalue(self):
                return self.buffer
      `);
      
      self.postMessage({ type: 'init-complete', id });
    } catch (error: any) {
      self.postMessage({ type: 'error', error: error.message, id });
    }
  } else if (type === 'set-interrupt-buffer') {
    interruptBuffer = buffer;
    if (pyodide) {
      pyodide.setInterruptBuffer(interruptBuffer);
    }
  } else if (type === 'execute') {
    currentExecutionId = id;
    
    // Clear interrupt buffer before execution
    if (interruptBuffer) {
      interruptBuffer[0] = 0;
    }
    
    try {
      // Set up streaming stdout callback
      pyodide.globals.set('streaming_callback', (text: string) => {
        if (currentExecutionId === id) {
          self.postMessage({ 
            type: 'streaming-output', 
            output: `<pre class="notebook-stream-output">${text}</pre>`, 
            id 
          });
        }
      });
      
      const result = pyodide.runPython(`
import sys
import io
from contextlib import redirect_stdout, redirect_stderr
import matplotlib.pyplot as plt
import base64
import warnings

# Suppress warnings
warnings.filterwarnings('ignore')

# Create streaming stdout
streaming_stdout = StreamingStdout(streaming_callback)
stderr_buffer = io.StringIO()
result = None

def filter_warnings(stderr_content):
    """Filter out warning messages from stderr content"""
    lines = stderr_content.split('\\n')
    filtered_lines = []
    
    for line in lines:
        line_lower = line.lower()
        # Skip lines that contain common warning indicators
        if any(warning_indicator in line_lower for warning_indicator in [
            'warning:', 'userwarning:', 'deprecationwarning:', 
            'futurewarning:', 'runtimewarning:', 'pendingdeprecationwarning:',
            '/lib/python', 'warnings.warn'
        ]):
            continue
        filtered_lines.append(line)
    
    return '\\n'.join(filtered_lines).strip()

try:
    with redirect_stdout(streaming_stdout), redirect_stderr(stderr_buffer):
        exec("""${code.replace(/"/g, '\\"').replace(/\n/g, '\\n')}""")
        
        stderr_content = stderr_buffer.getvalue()
        # Filter out warnings from stderr
        filtered_stderr = filter_warnings(stderr_content)
        output_parts = []
        
        if filtered_stderr:
            output_parts.append(f'<pre class="notebook-error-output">{filtered_stderr}</pre>')
        
        # Handle matplotlib plots
        fig_nums = plt.get_fignums()
        
        if fig_nums:
            for fig_num in fig_nums:
                fig = plt.figure(fig_num)
                img_buffer = io.BytesIO()
                fig.savefig(img_buffer, format='png', bbox_inches='tight', dpi=100)
                img_buffer.seek(0)
                img_base64 = base64.b64encode(img_buffer.getvalue()).decode()
                output_parts.append(f'<div class="notebook-image-output"><img src="data:image/png;base64,{img_base64}" alt="Plot output" style="max-width: 100%; height: auto;" /></div>')
            
            plt.close('all')
        
        if output_parts:
            result = ''.join(output_parts)
        else:
            result = ''
                
except KeyboardInterrupt:
    result = '<pre class="notebook-error-output">Execution interrupted by user</pre>'
except Exception as e:
    stderr_content = stderr_buffer.getvalue()
    filtered_stderr = filter_warnings(stderr_content)
    if filtered_stderr:
        result = f'<pre class="notebook-error-output">{filtered_stderr}</pre>'
    else:
        result = f'<pre class="notebook-error-output">{str(e)}</pre>'

result
      `);
      
      self.postMessage({ type: 'result', result, id });
    } catch (error: any) {
      if (error.name === 'PythonError' && error.message.includes('KeyboardInterrupt')) {
        self.postMessage({ 
          type: 'result', 
          result: '<pre class="notebook-error-output">Execution interrupted by user</pre>', 
          id 
        });
      } else {
        self.postMessage({ type: 'error', error: error.message, id });
      }
    } finally {
      currentExecutionId = null;
    }
  } else if (type === 'abort') {
    if (interruptBuffer && currentExecutionId !== null) {
      // Signal interrupt (2 = SIGINT)
      interruptBuffer[0] = 2;
    }
    currentExecutionId = null;
  }
};
