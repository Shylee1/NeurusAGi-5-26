import { Helmet } from 'react-helmet-async';
import { SITE, absoluteUrl } from '../lib/site';

export interface SeoProps {
  title: string;
  description: string;
  path: string;
  /** og:type, defaults to website */
  type?: 'website' | 'article' | 'profile';
  image?: string;
  noindex?: boolean;
  publishedAt?: string;
  updatedAt?: string;
  keywords?: readonly string[];
  /** One or more JSON-LD graphs for this page. */
  jsonLd?: Record<string, unknown> | Record<string, unknown>[];
}

/**
 * Renders every per-page head tag and its structured data.
 * In the prerender build these tags are serialized into the static HTML,
 * so crawlers and AI agents receive them without executing JavaScript.
 */
export function Seo({
  title,
  description,
  path,
  type = 'website',
  image = SITE.ogImage,
  noindex = false,
  publishedAt,
  updatedAt,
  keywords,
  jsonLd,
}: SeoProps) {
  const url = absoluteUrl(path);
  const imageUrl = image.startsWith('http') ? image : absoluteUrl(image);
  const fullTitle = title.includes(SITE.name) ? title : `${title} | ${SITE.name}`;
  const graphs = jsonLd ? (Array.isArray(jsonLd) ? jsonLd : [jsonLd]) : [];

  return (
    <Helmet>
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      <link rel="canonical" href={url} />
      <meta
        name="robots"
        content={noindex ? 'noindex, nofollow' : 'index, follow, max-image-preview:large, max-snippet:-1'}
      />
      {(keywords ?? SITE.keywords).length > 0 && (
        <meta name="keywords" content={(keywords ?? SITE.keywords).join(', ')} />
      )}
      <meta name="author" content={SITE.founder.name} />

      <meta property="og:type" content={type} />
      <meta property="og:site_name" content={SITE.name} />
      <meta property="og:url" content={url} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={imageUrl} />
      <meta property="og:locale" content={SITE.locale} />
      {publishedAt && <meta property="article:published_time" content={publishedAt} />}
      {updatedAt && <meta property="article:modified_time" content={updatedAt} />}
      {type === 'article' && <meta property="article:author" content={SITE.founder.name} />}

      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:url" content={url} />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={imageUrl} />
    </Helmet>
  );
}

/**
 * JSON-LD is rendered into the document instead of the head so that it
 * survives both prerendering and client-side navigation.
 */
export function JsonLd({ data }: { data: Record<string, unknown> | Record<string, unknown>[] }) {
  const graphs = Array.isArray(data) ? data : [data];
  return (
    <>
      {graphs.map((graph, index) => (
        <script
          key={index}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(graph) }}
        />
      ))}
    </>
  );
}
