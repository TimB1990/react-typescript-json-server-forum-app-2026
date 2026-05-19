export interface ArticleMeta {
  date: string,
  views?: number,
  replies?: number
}

export interface ArticleTag {
  name: string,
  color: string
}

export interface Article {
  id: number,
  image: string,
  tags: ArticleTag[],
  author: string,
  meta: ArticleMeta,
  title: string,
  content: string,
}