/* eslint-disable @typescript-eslint/no-explicit-any */

export type Post = {
  title: string
  date: string
  summary: string
  slug: string
  image?: string
  runnable?: boolean
  type?: 'markdown' | 'notebook'
}

export type PostWithContent = Post & {
  content: string
}

export type NotebookCell = {
  cell_type: 'markdown' | 'code'
  source: string[]
  outputs?: any[]
  execution_count?: number | null
}

export type JupyterNotebook = {
  cells: NotebookCell[]
  metadata: {
    kernelspec?: {
      display_name: string
      language: string
      name: string
    }
    language_info?: {
      name: string
      version?: string
    }
  }
  nbformat: number
  nbformat_minor: number
}
