export type Post = {
  title: string
  date: string
  summary: string
  slug: string
  image?: string
}

export type PostWithContent = Post & {
  content: string
}
