import { writable } from 'svelte/store'
import { browser } from '$app/environment'

interface PyodideService {
  pyodide: boolean | null
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

let worker: Worker | null = null
let initPromise: Promise<void> | null = null
let executionId = 0
let interruptBuffer: Uint8Array | null = null

export function resetPyodide() {
  if (worker) {
    worker.terminate()
    worker = null
  }
  initPromise = null
  interruptBuffer = null
  pyodideStore.set(initialState)
}

export async function initializePyodide(): Promise<void> {
  if (worker && initPromise) return initPromise
  if (!browser) return

  pyodideStore.update((state) => ({ ...state, loading: true, error: null }))

  initPromise = new Promise((resolve, reject) => {
    try {
      worker = new Worker(new URL('./pyodide-worker.ts', import.meta.url), {
        type: 'module'
      })
    } catch (error) {
      console.error('Failed to create worker:', error)
      pyodideStore.update((state) => ({
        ...state,
        loading: false,
        error:
          'Failed to create Python worker. Your browser may not support the required security features.'
      }))
      reject(error)
      return
    }

    const id = ++executionId

    worker.onmessage = (e) => {
      const { type, error } = e.data

      if (type === 'init-complete') {
        pyodideStore.update((state) => ({
          ...state,
          loading: false,
          ready: true,
          pyodide: true
        }))
        resolve()
      } else if (type === 'error') {
        // pyodideStore.update((state) => ({
        //   ...state,
        //   loading: false,
        //   error
        // }))
        reject(new Error(error))
      }
    }

    worker.onerror = (error) => {
      console.error('Worker error:', error)
      pyodideStore.update((state) => ({
        ...state,
        loading: false,
        error: 'Failed to initialize Python worker. Check console for details.'
      }))
      reject(error)
    }

    worker.postMessage({ type: 'init', id })

    // Create SharedArrayBuffer for interrupts
    try {
      if (typeof SharedArrayBuffer !== 'undefined') {
        interruptBuffer = new Uint8Array(new SharedArrayBuffer(1))
        // Send interrupt buffer to worker
        worker.postMessage({ type: 'set-interrupt-buffer', interruptBuffer })
      } else {
        console.warn('SharedArrayBuffer not available, interrupts will not work properly')
      }
    } catch (error) {
      console.warn('SharedArrayBuffer not available, interrupts will not work properly:', error)
    }
  })

  return initPromise
}

export async function executePython(
  code: string,
  abortController?: AbortController,
  onStreamingOutput?: (output: string) => void
): Promise<string> {
  await initializePyodide()
  if (!worker) throw new Error('Python worker not available')

  return new Promise((resolve, reject) => {
    const id = ++executionId
    let isAborted = false
    let streamingOutput = ''
    let tqdmOutput = '' // Separate buffer for tqdm output

    // Clear interrupt buffer before execution
    if (interruptBuffer) {
      interruptBuffer[0] = 0
    }

    const handleMessage = (e: MessageEvent) => {
      const { type, result, error, output, id: responseId, priority } = e.data

      if (responseId !== id) return // Ignore messages for other executions

      if (isAborted) return // Don't process if already aborted

      if (type === 'streaming-output') {
        if (priority === 'high') {
          // This is tqdm output - show at beginning
          tqdmOutput = output
        } else {
          // Regular streaming output
          streamingOutput += output
        }

        if (onStreamingOutput) {
          // Combine tqdm output at the beginning with regular output
          const combinedOutput = tqdmOutput + streamingOutput
          onStreamingOutput(combinedOutput)
        }
        return // Don't remove listener yet
      } else if (type === 'result') {
        worker!.removeEventListener('message', handleMessage)
        // Combine all outputs with final result
        const finalOutput = tqdmOutput + streamingOutput + (result || '')
        resolve(finalOutput || '<div class="text-sm text-muted-foreground italic">No output</div>')
      } else if (type === 'error') {
        worker!.removeEventListener('message', handleMessage)
        if (error.includes('cancelled') || error.includes('interrupted')) {
          reject(new Error('Python execution cancelled'))
        } else {
          const structuredError = new Error(error)
          ;(structuredError as any).errorLine = e.data.errorLine
          ;(structuredError as any).originalError = e.data.originalError
          reject(structuredError)
        }
      }
    }

    const handleAbort = () => {
      if (isAborted) return
      isAborted = true

      worker!.removeEventListener('message', handleMessage)

      // Use SharedArrayBuffer interrupt if available
      if (interruptBuffer) {
        interruptBuffer[0] = 2 // Signal SIGINT
      }

      // Also send abort message as fallback
      worker!.postMessage({ type: 'abort', id })

      // Set a timeout to ensure we respond promptly even if the worker doesn't
      setTimeout(() => {
        if (isAborted) {
          reject(new Error('Python execution cancelled'))
        }
      }, 100) // 100ms timeout for abort response
    }

    // Set up abort handling
    if (abortController) {
      if (abortController.signal.aborted) {
        reject(new Error('Python execution cancelled'))
        return
      }
      abortController.signal.addEventListener('abort', handleAbort, { once: true })
    }

    worker!.addEventListener('message', handleMessage)
    worker!.postMessage({ type: 'execute', code, id, interruptBuffer })
  })
}
