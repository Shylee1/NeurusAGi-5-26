#!/usr/bin/env python3
"""Add slugs and dates to every article and type the collection."""
import re
import pathlib

p = pathlib.Path("src/data/articles.ts")
text = p.read_text(encoding="utf-8")

slugs = {
    "1": "what-is-agi-neurusagi-scaling-trap",
    "3": "who-is-leading-the-race-to-agi",
    "4": "agi-risks-consciousness-threat",
    "5": "will-agi-replace-human-jobs",
    "6": "how-will-agi-impact-education",
    "7": "agi-ethical-frameworks-too-soon",
    "8": "agi-vs-superintelligence",
    "9": "how-to-test-for-true-agi",
    "10": "data-isnt-intelligence-why-scaling-fails",
    "11": "can-agi-be-aligned-with-human-values",
    "12": "will-agi-be-open-source-or-proprietary",
    "13": "how-does-agi-learn-differently",
    "14": "what-industries-will-agi-disrupt-optimization",
    "15": "agi-disruption-vs-transformation",
    "16": "could-agi-lead-to-post-scarcity-economy",
    "18": "how-do-we-prevent-agi-misuse",
    "19": "will-agi-require-new-laws-or-governance",
    "20": "can-agi-be-creative",
    "22": "how-will-agi-affect-military-strategy",
    "23": "is-agi-a-threat-to-humanity",
    "24": "what-philosophical-questions-does-agi-raise",
    "25": "how-do-we-ensure-agi-is-safe",
}

for aid, slug in slugs.items():
    old = f"    id: '{aid}',\n"
    if old not in text:
        raise SystemExit(f"missing article id {aid}")
    new = (
        f"    id: '{aid}',\n"
        f"    slug: '{slug}',\n"
        f"    publishedAt: '2025-12-22',\n"
        f"    updatedAt: '2026-10-21',\n"
    )
    text = text.replace(old, new, 1)

header = """export interface Article {
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
}

export const articles: Article[] = [
"""
text = text.replace("export const articles = [\n", header, 1)

footer = """
export const articlePath = (article: Pick<Article, 'slug'>) => `/news/${article.slug}`;

export function getArticleBySlug(slug: string | undefined): Article | undefined {
  if (!slug) return undefined;
  return articles.find((article) => article.slug === slug);
}

/** Articles newest first, for feeds and the sitemap. */
export const articlesByDate = [...articles].sort(
  (a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime(),
);
"""
text = text.rstrip() + "\n" + footer

p.write_text(text, encoding="utf-8")
print("metadata added:", len(slugs), "articles")
