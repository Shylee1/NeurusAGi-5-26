
import { agiSeriesArticles } from './agi';

export interface Article {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  author: string;
  company: string;
  thumbnail: string;
  publishedAt: string;
  updatedAt: string;
  citations?: string[];
}

/** Every live news article: the authored AGi series, nothing else. */
export const articles: Article[] = [...agiSeriesArticles];

export const articlePath = (article: Pick<Article, 'slug'>) => `/news/${article.slug}`;

export function getArticleBySlug(slug: string | undefined): Article | undefined {
  if (!slug) return undefined;
  return articles.find((article) => article.slug === slug);
}

/** Articles newest first, for feeds and the sitemap. */
export const articlesByDate = [...articles].sort(
  (a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime(),
);
