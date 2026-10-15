import { useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Search, X, List, Globe } from 'lucide-react';
import { articles } from '../data/articles';
import { ArticleModal } from '../components/ArticleModal';
import { SEO, SITE_URL, organizationSchema } from '../components/SEO';
import { SphereGallery } from '../components/SphereGallery';

type NewsArticle = (typeof articles)[number];

export function NewsPage() {
  const [selectedArticle, setSelectedArticle] = useState<NewsArticle | null>(null);
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchTerm, setSearchTerm] = useState(searchParams.get('search') || '');
  const [viewMode, setViewMode] = useState<'sphere' | 'list'>('sphere');

  const filteredArticles = useMemo(() => {
    const normalizedSearch = searchTerm.toLowerCase().trim();
    if (!normalizedSearch) return articles;

    return articles.filter(
      (article) =>
        article.title.toLowerCase().includes(normalizedSearch) ||
        (article.excerpt && article.excerpt.toLowerCase().includes(normalizedSearch)),
    );
  }, [searchTerm]);

  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
    setSearchParams(value ? { search: value } : {}, { replace: true });
  };

  const structuredData = [
    {
      '@context': 'https://schema.org',
      '@type': 'CollectionPage',
      '@id': `${SITE_URL}/news#collection`,
      name: 'News & Insights',
      description:
        'Articles by Jeremy Taylor about artificial general intelligence, AI research, innovation, ethics, safety, and the future of work.',
      url: `${SITE_URL}/news`,
      isPartOf: { '@id': `${SITE_URL}/#website` },
    },
    {
      '@context': 'https://schema.org',
      '@type': 'ItemList',
      name: 'NeurusAGi News & Insights',
      numberOfItems: articles.length,
      itemListElement: articles.map((article, index) => ({
        '@type': 'ListItem',
        position: index + 1,
        name: article.title,
        url: `${SITE_URL}/news/${article.id}`,
      })),
    },
    organizationSchema(),
  ];

  return (
    <>
      <SEO
        title="News & Insights | Artificial General Intelligence | NeurusAGi"
        description="Read NeurusAGi news and insights on artificial general intelligence, AI research, innovation, ethics, safety, education, work, and the future of technology."
        path="/news"
        keywords="artificial general intelligence, AGi, AI research, AI ethics, AI safety, NeurusAGi"
        structuredData={structuredData}
      />
      <div className="min-h-screen">
        <section className="section-container pb-0" aria-labelledby="news-title">
          <div className="text-center mb-8">
            <h1 id="news-title" className="heading-xl mb-3">
              News &amp; Insights
            </h1>
            <p className="text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto">
              Articles by Jeremy Taylor exploring artificial general intelligence, innovation, and the future
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-4 max-w-2xl mx-auto mb-6">
            <div className="relative flex-1 w-full">
              <Search
                className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground"
                aria-hidden="true"
              />
              <input
                type="search"
                placeholder="Search articles..."
                value={searchTerm}
                onChange={(event) => handleSearchChange(event.target.value)}
                className="input-field w-full pl-12 pr-12"
                aria-label="Search News & Insights articles"
                enterKeyHint="search"
              />
              {searchTerm && (
                <button
                  type="button"
                  onClick={() => handleSearchChange('')}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  aria-label="Clear article search"
                  title="Clear search"
                >
                  <X className="w-5 h-5" aria-hidden="true" />
                </button>
              )}
            </div>

            <div
              style={{ background: 'rgba(0,0,0,0.05)', border: '1px solid rgba(0,206,209,0.18)' }}
              className="flex rounded-lg overflow-hidden flex-shrink-0"
              aria-label="Article view mode"
              role="group"
            >
              <button
                type="button"
                onClick={() => setViewMode('sphere')}
                className={`flex items-center gap-2 px-4 py-2 text-sm font-medium transition-all duration-200 ${
                  viewMode === 'sphere'
                    ? 'bg-primary text-black'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
                aria-pressed={viewMode === 'sphere'}
                aria-label="Show articles in sphere view"
              >
                <Globe className="w-4 h-4" aria-hidden="true" />
                <span className="hidden sm:inline">Sphere</span>
              </button>
              <button
                type="button"
                onClick={() => setViewMode('list')}
                className={`flex items-center gap-2 px-4 py-2 text-sm font-medium transition-all duration-200 ${
                  viewMode === 'list'
                    ? 'bg-primary text-black'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
                aria-pressed={viewMode === 'list'}
                aria-label="Show articles in grid view"
              >
                <List className="w-4 h-4" aria-hidden="true" />
                <span className="hidden sm:inline">Grid</span>
              </button>
            </div>
          </div>

          <p className="text-sm text-muted-foreground text-center mb-2" role="status" aria-live="polite">
            {filteredArticles.length} {filteredArticles.length === 1 ? 'article' : 'articles'}
            {searchTerm ? ' found' : ' total'}
          </p>
        </section>

        {viewMode === 'sphere' && (
          <section className="py-4 px-4 overflow-hidden" aria-label="Article sphere view">
            {searchTerm ? (
              <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredArticles.map((article) => (
                  <ArticleCard key={article.id} article={article} onClick={() => setSelectedArticle(article)} />
                ))}
                {filteredArticles.length === 0 && (
                  <div className="col-span-full text-center py-16" role="status">
                    <p className="text-muted-foreground">No articles match your search.</p>
                  </div>
                )}
              </div>
            ) : (
              <SphereGallery
                articles={articles}
                onArticleClick={(article) =>
                  setSelectedArticle(articles.find((item) => item.id === article.id) || null)
                }
              />
            )}
          </section>
        )}

        {viewMode === 'list' && (
          <section className="section-container pt-4" aria-label="Article grid">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
              {filteredArticles.map((article) => (
                <ArticleCard key={article.id} article={article} onClick={() => setSelectedArticle(article)} />
              ))}
            </div>
            {filteredArticles.length === 0 && (
              <div className="text-center py-16" role="status">
                <p className="text-muted-foreground">No articles match your search.</p>
              </div>
            )}
          </section>
        )}

        {selectedArticle && (
          <ArticleModal article={selectedArticle} onClose={() => setSelectedArticle(null)} />
        )}
      </div>
    </>
  );
}

function ArticleCard({ article, onClick }: { article: NewsArticle; onClick: () => void }) {
  const handleKeyDown = (event: React.KeyboardEvent<HTMLElement>) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      onClick();
    }
  };

  return (
    <article
      className="feature-block group cursor-pointer"
      style={{ padding: '0', overflow: 'hidden' }}
      onClick={onClick}
      onKeyDown={handleKeyDown}
      tabIndex={0}
      role="button"
      aria-label={`Preview article: ${article.title}`}
    >
      {article.thumbnail && (
        <div className="aspect-video overflow-hidden">
          <img
            src={article.thumbnail}
            alt={article.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            loading="lazy"
          />
        </div>
      )}
      <div className="p-5">
        <h2 className="text-sm sm:text-base font-semibold text-foreground group-hover:text-primary transition-colors line-clamp-2 mb-2" style={{ lineHeight: 1.4 }}>
          {article.title}
        </h2>
        {article.excerpt && (
          <p className="text-xs text-muted-foreground line-clamp-2 mb-3">{article.excerpt}</p>
        )}
        <div className="flex items-center justify-between text-xs text-muted-foreground border-t border-primary/10 pt-3">
          <span>By {article.author}</span>
          <Link
            to={`/news/${article.id}`}
            className="text-primary text-xs font-medium hover:underline"
            onClick={(event) => event.stopPropagation()}
            aria-label={`Read full article: ${article.title}`}
          >
            Read more
          </Link>
        </div>
      </div>
    </article>
  );
}
