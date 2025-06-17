export type Post = {
  title: string;
  date: string;
  summary: string;
  slug: string;
};

export type PostWithContent = Post & {
  content: string;
};