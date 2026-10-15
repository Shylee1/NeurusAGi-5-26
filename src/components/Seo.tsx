import { useEffect } from 'react';
import { PageDef, SITE_NAME, SITE_URL, canonicalFor } from '../lib/site';

function setMeta(selector: string, attr: string, key: string, value: string) {
  let el = document.head.querySelector<HTMLMetaElement>(selector);
  if (!el) { el = document.createElement('meta'); el.setAttribute(attr, key); document.head.appendChild(el); }
  el.setAttribute('content', value);
}
export function Seo({ page }: { page: PageDef }) {
  useEffect(() => {
    const canonical = canonicalFor(page.path);
    document.title = page.title;
    setMeta('meta[name="title"]', 'name', 'title', page.title);
    setMeta('meta[name="description"]', 'name', 'description', page.description);
    setMeta('meta[name="robots"]', 'name', 'robots', page.indexable ? 'index, follow, max-image-preview:large, max-snippet:-1' : 'noindex, nofollow');
    setMeta('meta[property="og:title"]', 'property', 'og:title', page.title);
    setMeta('meta[property="og:description"]', 'property', 'og:description', page.description);
    setMeta('meta[property="og:url"]', 'property', 'og:url', canonical);
    setMeta('meta[property="og:type"]', 'property', 'og:type', 'website');
    setMeta('meta[name="twitter:title"]', 'name', 'twitter:title', page.title);
    setMeta('meta[name="twitter:description"]', 'name', 'twitter:description', page.description);
    setMeta('meta[name="twitter:url"]', 'name', 'twitter:url', canonical);
    let link = document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]');
    if (!link) { link = document.createElement('link'); link.rel = 'canonical'; document.head.appendChild(link); }
    link.href = canonical;
    document.getElementById('page-jsonld')?.remove();
    if (page.indexable) {
      const s = document.createElement('script'); s.id = 'page-jsonld'; s.type = 'application/ld+json';
      s.text = JSON.stringify({ '@context': 'https://schema.org', '@type': 'WebPage', '@id': `${canonical}#webpage`, url: canonical, name: page.title, description: page.description, isPartOf: { '@id': `${SITE_URL}/#website` }, publisher: { '@id': `${SITE_URL}/#organization` }, inLanguage: 'en-US', breadcrumb: { '@type': 'BreadcrumbList', itemListElement: [ { '@type': 'ListItem', position: 1, name: SITE_NAME, item: `${SITE_URL}/` }, ...(page.path !== '/' ? [{ '@type': 'ListItem', position: 2, name: page.name, item: canonical }] : []) ] }, ...(page.faqs?.length ? { mainEntity: page.faqs.map(f => ({ '@type': 'Question', name: f.q, acceptedAnswer: { '@type': 'Answer', text: f.a } })) } : {}) });
      document.head.appendChild(s);
    }
  }, [page]);
  return null;
}
