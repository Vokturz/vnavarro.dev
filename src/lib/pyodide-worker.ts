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
      
      await pyodide.loadPackage(['numpy', 'matplotlib', 'pandas'])
      
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
        import ast
        import html
        
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

        def should_display_result(code_str):
            """Check if the last line is an expression that should be displayed"""
            try:
                tree = ast.parse(code_str.strip())
                if not tree.body:
                    return False
                
                last_node = tree.body[-1]
                # Check if last statement is an expression (not assignment, import, etc.)
                return isinstance(last_node, ast.Expr)
            except:
                return False

        def get_last_expression(code_str):
            """Extract the last expression from code"""
            try:
                tree = ast.parse(code_str.strip())
                if not tree.body:
                    return None
                
                last_node = tree.body[-1]
                if isinstance(last_node, ast.Expr):
                    return ast.unparse(last_node.value)
                return None
            except:
                return None

        def format_output(obj):
            """Format object for display similar to Jupyter notebook"""
            if obj is None:
                return ""
            
            # Handle different types of objects
            if hasattr(obj, '_repr_html_'):
                return obj._repr_html_()
            elif hasattr(obj, '__repr__'):
                repr_str = repr(obj)
                # For large outputs, truncate if needed
                if len(repr_str) > 10000:
                    repr_str = repr_str[:10000] + "... (output truncated)"
                # HTML escape the content to prevent < > from being interpreted as HTML tags
                escaped_repr = html.escape(repr_str)
                return f'<pre class="notebook-output">{escaped_repr}</pre>'
            else:
                str_repr = str(obj)
                if len(str_repr) > 10000:
                    str_repr = str_repr[:10000] + "... (output truncated)"
                # HTML escape the content to prevent < > from being interpreted as HTML tags
                escaped_str = html.escape(str_repr)
                return f'<pre class="notebook-output">{escaped_str}</pre>'
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
import html

# Suppress warnings
warnings.filterwarnings('ignore')

# Create streaming stdout
streaming_stdout = StreamingStdout(streaming_callback)
stderr_buffer = io.StringIO()
result = None
last_expr_result = None

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
    code_to_execute = """${code.replace(/"/g, '\\"').replace(/\n/g, '\\n')}"""
    
    with redirect_stdout(streaming_stdout), redirect_stderr(stderr_buffer):
        # Check if we should capture the last expression result
        if should_display_result(code_to_execute):
            last_expr = get_last_expression(code_to_execute)
            if last_expr:
                # Execute all but the last expression
                lines = code_to_execute.strip().split('\\n')
                if len(lines) > 1:
                    code_without_last = '\\n'.join(lines[:-1])
                    exec(code_without_last)
                
                # Evaluate the last expression
                last_expr_result = eval(last_expr)
            else:
                exec(code_to_execute)
        else:
            exec(code_to_execute)
        
        stderr_content = stderr_buffer.getvalue()
        # Filter out warnings from stderr
        filtered_stderr = filter_warnings(stderr_content)
        output_parts = []
        
        if filtered_stderr:
            # HTML escape stderr content as well
            escaped_stderr = html.escape(filtered_stderr)
            output_parts.append(f'<pre class="notebook-error-output">{escaped_stderr}</pre>')
        
        # Add the result of the last expression if it exists
        if last_expr_result is not None:
            formatted_result = format_output(last_expr_result)
            if formatted_result:
                output_parts.append(formatted_result)
        
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
        escaped_stderr = html.escape(filtered_stderr)
        result = f'<pre class="notebook-error-output">{escaped_stderr}</pre>'
    else:
        escaped_error = html.escape(str(e))
        result = f'<pre class="notebook-error-output">{escaped_error}</pre>'

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
