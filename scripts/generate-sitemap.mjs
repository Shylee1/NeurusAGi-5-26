import { readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';

const siteUrl = 'https://neurusagi.com';
const source = readFileSync(resolve('src/data/articles.ts'), 'utf8');
const articleIds = [...source.matchAll(/\bid:\s*'([^']+)'/g)].map((match) => match[1]);
const publicPaths = ['/', '/about', '/news', '/pricing', '/investors', '/contact', '/presale'];
const paths = [...publicPaths, ...articleIds.map((id) => `/news/${id}`)];
const urls = paths.map((path) => `  <url><loc>${siteUrl}${path}</loc></url>`).join('\n');

writeFileSync(
  resolve('public/sitemap.xml'),
  `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`,
);
