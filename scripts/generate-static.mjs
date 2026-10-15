// Post-build: one real static HTML file per route (dist/about/index.html, …)
// with that page's own title/meta/canonical/OG/JSON-LD + crawlable content.
// No redirects are created anywhere: files are served directly at their URL.
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';

const SITE = 'https://neurusagi.com';
const dist = join(process.cwd(), 'dist');
const today = new Date().toISOString().slice(0, 10);
// Mirror of src/lib/site.ts (keep in sync)
const PAGES = [
  ['/', 'NeurusAGi — A Quantum Leap in Intelligence', 'Experience the next evolution of artificial general intelligence. NeurusAGi delivers enterprise-grade AGi capabilities with advanced reasoning, compliance, and innovation.', true, 'NeurusAGi — A Quantum Leap in Intelligence', 'NeurusAGi is an enterprise-grade artificial general intelligence platform delivering advanced reasoning, compliance, and innovation.'],
  ['/about', 'About NeurusAGi — Our Mission & Vision', 'Learn about NeurusAGi: founded by Jeremy Taylor to build the first true AGi — its mission, vision, technology, and the team behind a quantum leap in intelligence.', true, 'About NeurusAGi', 'About NeurusAGi, founded by Jeremy Taylor: mission, vision, and the technology behind the first true AGi.'],
  ['/news', 'News & Insights — NeurusAGi', 'NeurusAGi news and insights: articles by Jeremy Taylor exploring artificial general intelligence, innovation, and the future of intelligent systems.', true, 'News & Insights', 'Articles by Jeremy Taylor exploring artificial general intelligence, innovation, and the future.'],
  ['/pricing', 'Pricing — NeurusAGi Plans', 'NeurusAGi pricing plans for individuals, teams, and enterprise AGi deployments. Compare tiers, features, and get started today.', true, 'NeurusAGi Pricing', 'Pricing plans for individuals, teams, and enterprise NeurusAGi AGi deployments.'],
  ['/investors', 'Investors — NeurusAGi', 'Investor information for NeurusAGi: the AGi market opportunity, company vision, and how to submit an investor inquiry.', true, 'Invest in NeurusAGi', 'Investor information, market opportunity, and investor inquiry contact for NeurusAGi.'],
  ['/contact', 'Contact NeurusAGi', 'Contact NeurusAGi for general, media, and support inquiries, or to talk with our team about enterprise AGi.', true, 'Contact NeurusAGi', 'Contact NeurusAGi for general, media, support, and enterprise inquiries. Email: jt@neurusagi.com.'],
  ['/presale', 'Pre-Sale — NeurusAGi', 'Join the NeurusAGi pre-sale for early access to the next evolution of artificial general intelligence.', true, 'NeurusAGi Pre-Sale', 'Early-access pre-sale for NeurusAGi.'],
  ['/login', 'Login — NeurusAGi', 'Sign in to your NeurusAGi account.', false, 'Welcome Back', 'Sign in to your NeurusAGi account.'],
  ['/signup', 'Create Account — NeurusAGi', 'Create your NeurusAGi account and get started with enterprise-grade AGi.', false, 'Create Your NeurusAGi Account', 'Create a NeurusAGi account.'],
  ['/onboarding', 'Onboarding — NeurusAGi', 'Complete your NeurusAGi onboarding.', false, 'NeurusAGi Onboarding', 'Complete your NeurusAGi onboarding.'],
  ['/dashboard', 'Dashboard — NeurusAGi', 'Your NeurusAGi dashboard.', false, 'NeurusAGi Dashboard', 'Your NeurusAGi dashboard. Login required.'],
  ['/admin', 'Executive Admin Dashboard — NeurusAGi', 'NeurusAGi executive administration dashboard.', false, 'Admin Dashboard', 'Executive administration dashboard. Authorized administrators only.'],
  ['/change-password', 'Change Password — NeurusAGi', 'Change your NeurusAGi password.', false, 'Change Password', 'Change your password. Login required.'],
];
const canonical = p => (p === '/' ? `${SITE}/` : `${SITE}${p}`);
const esc = s => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/"/g, '&quot;');
const nav = PAGES.filter(p => p[3]).map(p => `<a href="${p[0]}">${esc(p[4])}</a>`).join(' | ');
const template = readFileSync(join(dist, 'index.html'), 'utf8');

function buildPage([path, title, desc, indexable, h1, summary]) {
  const url = canonical(path);
  const jsonld = JSON.stringify({ '@context': 'https://schema.org', '@graph': [
    { '@type': 'Organization', '@id': `${SITE}/#organization`, name: 'NeurusAGi', url: `${SITE}/`, founder: { '@type': 'Person', name: 'Jeremy Taylor' }, email: 'jt@neurusagi.com' },
    { '@type': 'WebSite', '@id': `${SITE}/#website`, url: `${SITE}/`, name: 'NeurusAGi', publisher: { '@id': `${SITE}/#organization` }, inLanguage: 'en-US' },
    { '@type': 'WebPage', '@id': `${url}#webpage`, url, name: title, description: desc, isPartOf: { '@id': `${SITE}/#website` }, inLanguage: 'en-US' },
    { '@type': 'FAQPage', mainEntity: [{ '@type': 'Question', name: 'What is NeurusAGi?', acceptedAnswer: { '@type': 'Answer', text: 'NeurusAGi is an enterprise-grade artificial general intelligence (AGi) platform delivering advanced reasoning, compliance, and innovation for organizations.' } }, { '@type': 'Question', name: 'Who founded NeurusAGi?', acceptedAnswer: { '@type': 'Answer', text: 'NeurusAGi was founded by Jeremy Taylor.' } }] },
  ]});
  let html = template
    .replace(/<title>[\s\S]*?<\/title>/, `<title>${esc(title)}</title>`)
    .replace(/(<meta name="description" content=")[^"]*(")/, `$1${esc(desc)}$2`)
    .replace(/(<meta name="title" content=")[^"]*(")/, `$1${esc(title)}$2`)
    .replace(/(<meta property="og:title" content=")[^"]*(")/, `$1${esc(title)}$2`)
    .replace(/(<meta property="og:description" content=")[^"]*(")/, `$1${esc(desc)}$2`)
    .replace(/(<meta property="og:url" content=")[^"]*(")/, `$1${url}$2`)
    .replace(/(<meta name="twitter:title" content=")[^"]*(")/, `$1${esc(title)}$2`)
    .replace(/(<meta name="twitter:description" content=")[^"]*(")/, `$1${esc(desc)}$2`)
    .replace(/(<meta name="twitter:url" content=")[^"]*(")/, `$1${url}$2`);
  html = html.replace(/<link rel="canonical"[^>]*>/g, '').replace(/<meta name="robots"[^>]*>/g, '');
  const head = `<link rel="canonical" href="${url}" /><meta name="robots" content="${indexable ? 'index, follow, max-image-preview:large, max-snippet:-1' : 'noindex, nofollow'}" /><script type="application/ld+json">${jsonld}</script>`;
  html = html.replace('</head>', `${head}</head>`);
  // Crawlable, agent-readable content inside #root — React replaces it on load.
  const fallback = `<div id="root"><header><nav aria-label="Primary">${nav}</nav></header><main><h1>${esc(h1)}</h1><p>${esc(summary)}</p><p>${esc(desc)}</p><nav aria-label="All pages">${nav}</nav></main><footer><p>© NeurusAGi. Founded by Jeremy Taylor. Contact: jt@neurusagi.com</p></footer></div>`;
  html = html.replace(/<div id="root"><\/div>/, fallback);
  return html;
}

for (const p of PAGES) {
  if (p[0] === '/') { writeFileSync(join(dist, 'index.html'), buildPage(p)); continue; }
  const dir = join(dist, p[0].slice(1)); mkdirSync(dir, { recursive: true });
  writeFileSync(join(dir, 'index.html'), buildPage(p));
}
// Real 404 file (served with 404 status by the host, not a redirect)
writeFileSync(join(dist, '404.html'), buildPage(['/404', 'Page Not Found — NeurusAGi', 'The page you requested does not exist on neurusagi.com.', false, '404 — Page Not Found', 'The page you requested does not exist. Return to https://neurusagi.com/']));

const urls = PAGES.filter(p => p[3]);
writeFileSync(join(dist, 'sitemap.xml'), `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.map(p => `  <url><loc>${canonical(p[0])}</loc><lastmod>${today}</lastmod><changefreq>${p[0] === '/' ? 'daily' : 'weekly'}</changefreq><priority>${p[0] === '/' ? '1.0' : '0.8'}</priority></url>`).join('\n')}\n</urlset>\n`);
const manifest = { name: 'NeurusAGi', url: `${SITE}/`, description: 'Enterprise-grade AGi platform.', contact: 'jt@neurusagi.com', founder: 'Jeremy Taylor', pages: PAGES.map(p => ({ name: p[4], url: canonical(p[0]), path: p[0], description: p[1], indexable: p[3], purpose: p[5] })), actions: [ { name: 'Contact', method: 'GET', url: `${SITE}/contact` }, { name: 'Investor inquiry', method: 'GET', url: `${SITE}/investors` }, { name: 'Login', method: 'GET', url: `${SITE}/login` }, { name: 'Sign up', method: 'GET', url: `${SITE}/signup` } ], resources: { sitemap: `${SITE}/sitemap.xml`, llms: `${SITE}/llms.txt`, llmsFull: `${SITE}/llms-full.txt`, robots: `${SITE}/robots.txt` } };
writeFileSync(join(dist, 'agent-manifest.json'), JSON.stringify(manifest, null, 2));
mkdirSync(join(dist, '.well-known'), { recursive: true });
writeFileSync(join(dist, '.well-known', 'agent.json'), JSON.stringify(manifest, null, 2));
console.log(`Static pages generated: ${PAGES.length + 1} (incl. 404), sitemap: ${urls.length} URLs, date ${today}`);
