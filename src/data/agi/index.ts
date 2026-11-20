import type { Article } from '../articles';
import { article01 } from './article-01';
import { article02 } from './article-02';

/**
 * The authored AGi series, in publishing order.
 *
 * Each article lives in its own module so that one piece can be revised,
 * verified and shipped without touching the others. Keep this list ordered by
 * `publishedAt`.
 */
export const agiSeriesArticles: Article[] = [article01, article02];
