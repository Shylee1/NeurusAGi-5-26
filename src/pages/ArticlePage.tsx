import { Link, useParams } from 'react-router-dom';
import { ArticleContent } from '../components/ArticleContent';
import { SEO, SITE_URL, organizationSchema } from '../components/SEO';
import { articles } from '../data/articles';
import NotFound from './NotFound';

export function ArticlePage() {
  const { articleId } = useParams<{ articleId: string }>();
  const article = articles.find((item) => item.id === articleId);

  if (!article) {
    return <NotFound />;
  }

  const articleUrl = `${SITE_URL}/news/${article.id}`;
  const description = article.excerpt || article.title;
  const structuredData = [
    {
      '@context': 'https://schema.org',
      '@type': 'Article',
      '@id': `${articleUrl}#article`,
      headline: article.title,
      description,
      image: article.thumbnail ? [article.thumbnail] : undefined,
      author: {
        '@type': 'Person',
        name: article.author || 'NeurusAGi',
      },
      publisher: { '@id': `${SITE_URL}/#organization` },
      mainEntityOfPage: { '@type': 'WebPage', '@id': articleUrl },
      articleSection: 'Artificial General Intelligence',
      keywords: ['artificial general intelligence', 'AGi', 'AI research', 'NeurusAGi'],
    },
    {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: SITE_URL },
        { '@type': 'ListItem', position: 2, name: 'News & Insights', item: `${SITE_URL}/news` },
        { '@type': 'ListItem', position: 3, name: article.title, item: articleUrl },
      ],
    },
    organizationSchema(),
  ];

  return (
    <>
      <SEO
        title={`${article.title} | NeurusAGi`}
        description={description}
        path={`/news/${article.id}`}
        type="article"
        image={article.thumbnail}
        author={article.author}
        structuredData={structuredData}
      />
      <article className="min-h-screen section-container" aria-labelledby="article-title">
        <div className="max-w-4xl mx-auto">
          <nav aria-label="Breadcrumb" className="mb-6">
            <Link to="/news" className="text-sm text-primary hover:underline">
              News &amp; Insights
            </Link>
          </nav>
          <header className="mb-8">
            <p className="text-sm text-muted-foreground mb-3">
              {article.author ? `By ${article.author}` : 'NeurusAGi'}
              {article.company ? ` · ${article.company}` : ''}
            </p>
            <h1 id="article-title" className="heading-xl mb-4">
              {article.title}
            </h1>
            {article.excerpt && (
              <p className="text-lg text-muted-foreground leading-relaxed">{article.excerpt}</p>
            )}
          </header>
          {article.thumbnail && (
            <img
              src={article.thumbnail}
              alt={article.title}
              className="w-full rounded-lg mb-8 object-cover"
              loading="eager"
            />
          )}
          <ArticleContent content={article.content} />
          <footer className="mt-10 pt-6 border-t border-primary/20">
            <Link to="/news" className="text-primary hover:underline">
              Browse all News &amp; Insights
            </Link>
          </footer>
        </div>
      </article>
    </>
  );
}
