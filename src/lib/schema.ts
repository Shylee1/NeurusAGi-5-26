import type { Article } from '../data/articles';
import { SITE, absoluteUrl } from './site';

type Json = Record<string, unknown>;

export const organizationSchema = (): Json => ({
  '@context': 'https://schema.org',
  '@type': 'Organization',
  '@id': `${SITE.url}/#organization`,
  name: SITE.name,
  url: SITE.url,
  logo: absoluteUrl(SITE.logo),
  image: absoluteUrl(SITE.ogImage),
  description: SITE.description,
  email: SITE.contactEmail,
  foundingDate: SITE.founded,
  sameAs: SITE.sameAs,
  founder: {
    '@type': 'Person',
    '@id': `${SITE.url}/#jeremy-taylor`,
    name: SITE.founder.name,
    jobTitle: SITE.founder.role,
    email: SITE.founder.email,
    url: absoluteUrl('/about'),
  },
  contactPoint: {
    '@type': 'ContactPoint',
    email: SITE.contactEmail,
    contactType: 'sales',
    availableLanguage: 'English',
  },
});

export const personSchema = (): Json => ({
  '@context': 'https://schema.org',
  '@type': 'Person',
  '@id': `${SITE.url}/#jeremy-taylor`,
  name: SITE.founder.name,
  jobTitle: SITE.founder.role,
  description: SITE.founder.bio,
  url: absoluteUrl('/about'),
  email: SITE.founder.email,
  worksFor: { '@type': 'Organization', '@id': `${SITE.url}/#organization` },
  knowsAbout: [
    'Artificial general intelligence',
    'Artificial superintelligence',
    'AI safety',
    'Cognitive architecture',
    'Data storage architecture',
  ],
  sameAs: SITE.sameAs,
});

export const websiteSchema = (): Json => ({
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  '@id': `${SITE.url}/#website`,
  name: SITE.name,
  url: SITE.url,
  description: SITE.description,
  inLanguage: 'en-US',
  publisher: { '@type': 'Organization', '@id': `${SITE.url}/#organization` },
});

export const webPageSchema = (path: string, title: string, description: string): Json => ({
  '@context': 'https://schema.org',
  '@type': 'WebPage',
  '@id': `${absoluteUrl(path)}#webpage`,
  url: absoluteUrl(path),
  name: title,
  description,
  isPartOf: { '@type': 'WebSite', '@id': `${SITE.url}/#website` },
  inLanguage: 'en-US',
  publisher: { '@type': 'Organization', '@id': `${SITE.url}/#organization` },
});

export const breadcrumbSchema = (items: { name: string; path: string }[]): Json => ({
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: items.map((item, index) => ({
    '@type': 'ListItem',
    position: index + 1,
    name: item.name,
    item: absoluteUrl(item.path),
  })),
});

export const articleSchema = (article: Article): Json => ({
  '@context': 'https://schema.org',
  '@type': 'NewsArticle',
  '@id': `${absoluteUrl(`/news/${article.slug}`)}#article`,
  headline: article.title,
  description: article.excerpt,
  abstract: article.excerpt,
  image: [article.thumbnail],
  datePublished: article.publishedAt,
  dateModified: article.updatedAt,
  inLanguage: 'en-US',
  isAccessibleForFree: true,
  author: {
    '@type': 'Person',
    '@id': `${SITE.url}/#jeremy-taylor`,
    name: article.author,
    url: absoluteUrl('/about'),
  },
  publisher: {
    '@type': 'Organization',
    '@id': `${SITE.url}/#organization`,
    name: article.company || SITE.name,
    logo: { '@type': 'ImageObject', url: absoluteUrl(SITE.logo) },
  },
  mainEntityOfPage: {
    '@type': 'WebPage',
    '@id': `${absoluteUrl(`/news/${article.slug}`)}#webpage`,
  },
  about: [
    { '@type': 'Thing', name: 'Artificial general intelligence' },
    { '@type': 'Thing', name: 'NeurusAGi' },
  ],
  keywords: SITE.keywords.join(', '),
});

export const articleListSchema = (articles: Article[]): Json => ({
  '@context': 'https://schema.org',
  '@type': 'ItemList',
  '@id': `${absoluteUrl('/news')}#articles`,
  name: 'NeurusAGi News and Insights',
  numberOfItems: articles.length,
  itemListElement: articles.map((article, index) => ({
    '@type': 'ListItem',
    position: index + 1,
    url: absoluteUrl(`/news/${article.slug}`),
    name: article.title,
  })),
});

export const faqSchema = (items: { question: string; answer: string }[]): Json => ({
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: items.map((item) => ({
    '@type': 'Question',
    name: item.question,
    acceptedAnswer: { '@type': 'Answer', text: item.answer },
  })),
});

export const videoSchema = (): Json => ({
  '@context': 'https://schema.org',
  '@type': 'VideoObject',
  '@id': `${SITE.url}/#what-real-agi-looks-like`,
  name: 'What Real AGI Actually Looks Like',
  description:
    'A short explanation of what a real artificial general intelligence looks like, and how it differs from the narrow systems marketed as AI.',
  thumbnailUrl: [
    'https://i.ytimg.com/vi/NJoZmaGKFcs/maxresdefault.jpg',
    'https://i.ytimg.com/vi/NJoZmaGKFcs/hqdefault.jpg',
  ],
  uploadDate: '2025-05-22',
  duration: 'PT2M48S',
  embedUrl: 'https://www.youtube-nocookie.com/embed/NJoZmaGKFcs',
  url: 'https://www.youtube.com/watch?v=NJoZmaGKFcs',
  publisher: { '@type': 'Organization', '@id': `${SITE.url}/#organization` },
});

export const productSchema = (): Json => ({
  '@context': 'https://schema.org',
  '@type': 'Product',
  '@id': `${SITE.url}/#product`,
  name: 'NeurusAGi Early Access',
  description:
    'Early access to NeurusAGi, a quantum-powered artificial general intelligence agent built on an artificial superintelligence framework. Access is granted by request while the platform is onboarded in phases.',
  brand: { '@type': 'Brand', name: SITE.name },
  manufacturer: { '@type': 'Organization', '@id': `${SITE.url}/#organization` },
  offers: {
    '@type': 'Offer',
    availability: 'https://schema.org/PreOrder',
    url: absoluteUrl('/early-access'),
    priceCurrency: 'USD',
    price: '0',
    description: 'Request early access. Approval is reviewed by the NeurusAGi team.',
  },
});
