#!/usr/bin/env node
/**
 * Build-time prerender.
 *
 * 1. Renders every public route (including each article) to HTML with the same
 *    React tree the browser hydrates, so crawlers and AI agents get real content.
 * 2. Writes sitemap.xml, robots.txt, llms.txt, llms-full.txt and rss.xml.
 */
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const dist = path.join(root, 'dist');
const ssrEntry = path.join(root, 'dist-ssr', 'entry-server.js');

const SITE = {
  name: 'NeurusAGi',
  url: 'https://neurusagi.com',
  description:
    'NeurusAGi is a quantum-powered artificial general intelligence agent built on an artificial superintelligence framework, with reasoning, compliance and enterprise safeguards built in.',
};

const { render, articles } = await import(ssrEntry);

const template = await fs.readFile(path.join(dist, 'index.html'), 'utf8');

const staticRoutes = ['/', '/about', '/news', '/early-access', '/pricing', '/investors', '/contact'];

const articleRoutes = articles.map((article) => ({
  path: `/news/${article.slug}`,
  lastmod: article.updatedAt,
}));

const routes = [
  ...staticRoutes.map((route) => ({ path: route })),
  ...articleRoutes,
];

function replaceBetween(source, open, close, value) {
  const start = source.indexOf(open);
  const end = source.indexOf(close);
  if (start === -1 || end === -1) {
    throw new Error(`Markers ${open} and ${close} are missing from index.html`);
  }
  return source.slice(0, start + open.length) + '\n' + value + '\n    ' + source.slice(end);
}

let rendered = 0;

for (const route of routes) {
  const { html, head } = render(route.path);
  let page = replaceBetween(template, '<!--app-head-->', '<!--/app-head-->', head);
  page = page.replace('<!--app-html-->', html);
  page = page.replace('<!--app-head-->', '').replace('<!--/app-head-->', '');

  const outDir = route.path === '/' ? dist : path.join(dist, route.path);
  await fs.mkdir(outDir, { recursive: true });
  await fs.writeFile(path.join(outDir, 'index.html'), page, 'utf8');
  rendered += 1;
}

// ---------------------------------------------------------------- crawler files

const today = new Date().toISOString().slice(0, 10);

const sitemapEntries = [
  ...staticRoutes.map(
    (route) => `  <url>
    <loc>${SITE.url}${route === '/' ? '/' : route}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>${route === '/news' ? 'daily' : 'monthly'}</changefreq>
    <priority>${route === '/' ? '1.0' : route === '/news' || route === '/early-access' ? '0.9' : '0.7'}</priority>
  </url>`,
  ),
  ...articles.map(
    (article) => `  <url>
    <loc>${SITE.url}/news/${article.slug}</loc>
    <lastmod>${article.updatedAt}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
  </url>`,
  ),
].join('\n');

const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${sitemapEntries}
</urlset>
`;

const robots = `# NeurusAGi
# Every public page is server-rendered HTML. No JavaScript is required to read it.

User-agent: *
Allow: /
Disallow: /admin
Disallow: /dashboard
Disallow: /change-password
Disallow: /onboarding

# Search engines
User-agent: Googlebot
Allow: /

User-agent: Bingbot
Allow: /

User-agent: DuckDuckBot
Allow: /

# AI answer engines and agents: full access to public content
User-agent: GPTBot
Allow: /

User-agent: OAI-SearchBot
Allow: /

User-agent: ChatGPT-User
Allow: /

User-agent: ClaudeBot
Allow: /

User-agent: Claude-Web
Allow: /

User-agent: PerplexityBot
Allow: /

User-agent: Perplexity-User
Allow: /

User-agent: Google-Extended
Allow: /

User-agent: Applebot-Extended
Allow: /

User-agent: Amazonbot
Allow: /

User-agent: CCBot
Allow: /

User-agent: meta-externalagent
Allow: /

User-agent: cohere-ai
Allow: /

User-agent: YouBot
Allow: /

Sitemap: ${SITE.url}/sitemap.xml
`;

const llms = `# ${SITE.name}

> ${SITE.description}

NeurusAGi is a quantum-powered artificial general intelligence agent built on an artificial superintelligence framework by founder Jeremy Taylor. Public access is granted by request through a phased early access program.

## Key pages
${staticRoutes
  .map((route) => {
    const labels = {
      '/': 'Home',
      '/about': 'About Jeremy Taylor and NeurusAGi',
      '/news': 'News and Insights index',
      '/early-access': 'Request Early Access (form)',
      '/pricing': 'Pricing',
      '/investors': 'Investors',
      '/contact': 'Contact',
    };
    return `- [${labels[route]}](${SITE.url}${route})`;
  })
  .join('\n')}

## Articles by Jeremy Taylor
${articles
  .map((article) => `- [${article.title}](${SITE.url}/news/${article.slug}): ${article.excerpt}`)
  .join('\n')}

## How to use this site
- Every page is available as server-rendered HTML at the URLs above. JavaScript is optional.
- Structured data (Organization, Person, NewsArticle, FAQPage, BreadcrumbList, ItemList) is embedded as JSON-LD on the relevant pages.
- \`/llms-full.txt\` contains the complete text of every article for retrieval and citation.
- \`/sitemap.xml\` lists all public URLs. \`/rss.xml\` syndicates new articles.
- Early access requests are made with a standard HTML form at ${SITE.url}/early-access. Only a name and email are required.

## Contact
- Founder: Jeremy Taylor (jt@neurusagi.com)
- Website: ${SITE.url}
`;

const stripHtml = (html) =>
  html
    .replace(/<\/(p|li|h[1-6])>/g, '\n')
    .replace(/<[^>]+>/g, '')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, ' ')
    .replace(/\n{3,}/g, '\n\n')
    .trim();

const llmsFull = `# ${SITE.name}: full text for retrieval

${articles
  .map(
    (article) => `## ${article.title}

URL: ${SITE.url}/news/${article.slug}
Author: ${article.author}
Published: ${article.publishedAt}
Updated: ${article.updatedAt}
Summary: ${article.excerpt}

${stripHtml(article.content)}
`,
  )
  .join('\n---\n\n')}
`;

const rss = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${SITE.name} News and Insights</title>
    <link>${SITE.url}/news</link>
    <description>${SITE.description}</description>
    <language>en-us</language>
    <atom:link href="${SITE.url}/rss.xml" rel="self" type="application/rss+xml" />
${articles
  .map(
    (article) => `    <item>
      <title><![CDATA[${article.title}]]></title>
      <link>${SITE.url}/news/${article.slug}</link>
      <guid>${SITE.url}/news/${article.slug}</guid>
      <pubDate>${new Date(article.publishedAt).toUTCString()}</pubDate>
      <description><![CDATA[${article.excerpt}]]></description>
    </item>`,
  )
  .join('\n')}
  </channel>
</rss>
`;

await Promise.all([
  fs.writeFile(path.join(dist, 'sitemap.xml'), sitemap, 'utf8'),
  fs.writeFile(path.join(dist, 'robots.txt'), robots, 'utf8'),
  fs.writeFile(path.join(dist, 'llms.txt'), llms, 'utf8'),
  fs.writeFile(path.join(dist, 'llms-full.txt'), llmsFull, 'utf8'),
  fs.writeFile(path.join(dist, 'rss.xml'), rss, 'utf8'),
]);

console.log(`Prerendered ${rendered} routes and wrote sitemap, robots, llms.txt, llms-full.txt, rss.xml`);
