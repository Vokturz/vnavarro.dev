import { error } from '@sveltejs/kit'
import type { RequestHandler } from './$types'

const PYODIDE_CDN_URL = 'https://cdn.jsdelivr.net/pyodide/v0.27.7/full/'

export const GET: RequestHandler = async ({ params, fetch }) => {
  const cdnUrl = `${PYODIDE_CDN_URL}${params.path}`

  try {
    const response = await fetch(cdnUrl)

    if (!response.ok) {
      return new Response(response.body, {
        status: response.status,
        statusText: response.statusText
      })
    }

    let contentType = 'application/octet-stream' // Default
    if (params.path.endsWith('.js') || params.path.endsWith('.mjs')) {
      contentType = 'application/javascript'
    } else if (params.path.endsWith('.wasm')) {
      contentType = 'application/wasm'
    } else if (params.path.endsWith('.json')) {
      contentType = 'application/json'
    }

    const newResponse = new Response(response.body, {
      status: 200,
      headers: {
        'Content-Type': contentType
      }
    })

    return newResponse
  } catch (err) {
    console.error(`Error proxying Pyodide request:`, err)
    throw error(500, `Failed to proxy Pyodide request: ${cdnUrl}`)
  }
}
