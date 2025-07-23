import tailwindcss from '@tailwindcss/vite'
import { sveltekit } from '@sveltejs/kit/vite'
import { defineConfig } from 'vite'
import vercel from 'vite-plugin-vercel'
// import mkcert from 'vite-plugin-mkcert'

export default defineConfig({
  plugins: [
    tailwindcss(),
    sveltekit(),
    vercel()
    //mkcert()
  ],
  server: {
    port: process.env.PORT as unknown as number,
    headers: {
      'Cross-Origin-Embedder-Policy': 'require-corp',
      'Cross-Origin-Opener-Policy': 'same-origin'
    }
  },
  preview: {
    headers: {
      'Cross-Origin-Embedder-Policy': 'require-corp',
      'Cross-Origin-Opener-Policy': 'same-origin'
    }
  },
  worker: {
    format: 'es'
  }
})
