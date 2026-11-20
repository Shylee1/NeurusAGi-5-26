
import { agiSeriesArticles } from './agi';
import { legacyEssays } from './legacyEssays';

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

/**
 * The authored AGi series always wins its slug. A legacy essay that shares a
 * series slug is dropped here, so replacing an article never leaves the old
 * copy reachable at the same URL.
 */
const seriesSlugs = new Set(agiSeriesArticles.map((article) => article.slug));

export const articles: Article[] = [
  ...agiSeriesArticles,
  ...legacyEssays.filter((article) => !seriesSlugs.has(article.slug)),
];

export const articlePath = (article: Pick<Article, 'slug'>) => `/news/${article.slug}`;

export function getArticleBySlug(slug: string | undefined): Article | undefined {
  if (!slug) return undefined;
  return articles.find((article) => article.slug === slug);
}

/** Articles newest first, for feeds and the sitemap. */
export const articlesByDate = [...articles].sort(
  (a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime(),
);
