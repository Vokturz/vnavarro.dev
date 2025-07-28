import type { Handle } from '@sveltejs/kit'

export const handle: Handle = async ({ event, resolve }) => {
  const response = await resolve(event)

  // Always set these headers for all responses
  response.headers.set('Cross-Origin-Opener-Policy', 'same-origin')
  response.headers.set('Cross-Origin-Embedder-Policy', 'require-corp')

  // Additional headers for specific types of resources
  if (event.url.pathname.includes('/_app/immutable/workers/')) {
    response.headers.set('Cross-Origin-Resource-Policy', 'same-origin')
  }

  return response
}
